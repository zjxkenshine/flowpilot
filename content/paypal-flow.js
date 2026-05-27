// content/paypal-flow.js — PayPal login and approval helper.

console.log('[MultiPage:paypal-flow] Content script loaded on', location.href);

const PAYPAL_FLOW_LISTENER_SENTINEL = 'data-multipage-paypal-flow-listener';
const PAYPAL_HOSTED_STAGE_OUTSIDE = 'outside_paypal';
const PAYPAL_HOSTED_STAGE_LOGIN = 'pay_login';
const PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT = 'guest_checkout';
const PAYPAL_HOSTED_STAGE_VERIFICATION = 'verification';
const PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT = 'create_account';
const PAYPAL_HOSTED_STAGE_REVIEW = 'review_consent';
const PAYPAL_HOSTED_STAGE_APPROVAL = 'approval';
const PAYPAL_HOSTED_STAGE_GENERIC_ERROR = 'generic_error';
const PAYPAL_HOSTED_STAGE_UNKNOWN = 'unknown';
const PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX = 'PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL::';
const PAYPAL_HOSTED_PHONE_POST_FILL_CHECK_DELAY_MS = 8000;
const PAYPAL_HOSTED_PHONE_EMPTY_REFILL_MAX_RETRIES = 3;
const PAYPAL_HOSTED_STEP_KEYS = {
  [PAYPAL_HOSTED_STAGE_LOGIN]: 'paypal-hosted-email',
  [PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT]: 'paypal-hosted-card',
  [PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT]: 'paypal-hosted-create-account',
  [PAYPAL_HOSTED_STAGE_REVIEW]: 'paypal-hosted-review',
};
const PAYPAL_HOSTED_SECURITY_CHALLENGE_SELECTORS = [
  '#captcha-standalone',
  '.captcha-overlay',
  '.captcha-container',
  '[data-app*="authchallenge"]',
  '[data-captcha-type]',
  'iframe[src*="recaptcha"]',
];
const paypalHostedSecurityChallengeProbeResults = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
let paypalHostedSecurityChallengeLastProbeResult = null;

if (document.documentElement.getAttribute(PAYPAL_FLOW_LISTENER_SENTINEL) !== '1') {
  document.documentElement.setAttribute(PAYPAL_FLOW_LISTENER_SENTINEL, '1');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message.type === 'PAYPAL_GET_STATE'
      || message.type === 'PAYPAL_SUBMIT_LOGIN'
      || message.type === 'PAYPAL_DISMISS_PROMPTS'
      || message.type === 'PAYPAL_CLICK_APPROVE'
      || message.type === 'PAYPAL_HOSTED_GET_STATE'
      || message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'
    ) {
      resetStopState();
      handlePayPalCommand(message).then((result) => {
        sendResponse({ ok: true, ...(result || {}) });
      }).catch((err) => {
        if (isStopError(err)) {
          sendResponse({ stopped: true, error: err.message });
          return;
        }
        sendResponse({ error: err.message });
      });
      return true;
    }
  });
} else {
  console.log('[MultiPage:paypal-flow] 消息监听已存在，跳过重复注册');
}

async function performPayPalOperationWithDelay(metadata, operation) {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  const gate = rootScope?.CodexOperationDelay?.performOperationWithDelay;
  return typeof gate === 'function' ? gate(metadata, operation) : operation();
}

async function handlePayPalCommand(message) {
  switch (message.type) {
    case 'PAYPAL_GET_STATE':
      return inspectPayPalState();
    case 'PAYPAL_SUBMIT_LOGIN':
      return submitPayPalLogin(message.payload || {});
    case 'PAYPAL_DISMISS_PROMPTS':
      return dismissPayPalPrompts();
    case 'PAYPAL_CLICK_APPROVE':
      return clickPayPalApprove();
    case 'PAYPAL_HOSTED_GET_STATE':
      return inspectPayPalHostedState(message.payload || {});
    case 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP':
      return runPayPalHostedCheckoutStep(message.payload || {});
    default:
      throw new Error(`paypal-flow.js 不处理消息：${message.type}`);
  }
}

async function waitUntil(predicate, options = {}) {
  const intervalMs = Math.max(50, Math.floor(Number(options.intervalMs) || 250));
  const timeoutMs = Math.max(0, Math.floor(Number(options.timeoutMs) || 0));
  const startedAt = Date.now();
  while (true) {
    throwIfStopped();
    const value = await predicate();
    if (value) {
      return value;
    }
    if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
      throw new Error(options.timeoutMessage || 'PayPal page timed out waiting for target state.');
    }
    await sleep(intervalMs);
  }
}

async function waitForDocumentComplete() {
  await waitUntil(() => document.readyState === 'complete', { intervalMs: 200 });
  await sleep(1000);
}

function isVisibleElement(el) {
  if (!el) return false;
  let node = el;
  while (node && node.nodeType === 1) {
    if (node.hidden || node.getAttribute?.('aria-hidden') === 'true' || node.getAttribute?.('inert') !== null) {
      return false;
    }
    const nodeStyle = window.getComputedStyle(node);
    if (
      nodeStyle.display === 'none'
      || nodeStyle.visibility === 'hidden'
      || nodeStyle.visibility === 'collapse'
      || Number(nodeStyle.opacity) === 0
    ) {
      return false;
    }
    node = node.parentElement;
  }
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(rect.width) > 0
    && Number(rect.height) > 0;
}

function normalizeText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getActionText(el) {
  return normalizeText([
    el?.textContent,
    el?.value,
    el?.getAttribute?.('aria-label'),
    el?.getAttribute?.('title'),
    el?.getAttribute?.('placeholder'),
    el?.getAttribute?.('name'),
    el?.id,
  ].filter(Boolean).join(' '));
}

function getVisibleControls(selector) {
  return Array.from(document.querySelectorAll(selector)).filter(isVisibleElement);
}

function isEnabledControl(el) {
  return Boolean(el)
    && !el.disabled
    && el.getAttribute?.('aria-disabled') !== 'true';
}

function findClickableByText(patterns) {
  const normalizedPatterns = (Array.isArray(patterns) ? patterns : [patterns]).filter(Boolean);
  const candidates = getVisibleControls('button, a, [role="button"], input[type="button"], input[type="submit"]');
  return candidates.find((el) => {
    const text = getActionText(el);
    return normalizedPatterns.some((pattern) => pattern.test(text));
  }) || null;
}

function findInputByPatterns(patterns) {
  const inputs = getVisibleControls('input')
    .filter((input) => {
      const type = String(input.getAttribute('type') || input.type || '').trim().toLowerCase();
      return isEnabledControl(input) && !['hidden', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(type);
    });
  return inputs.find((input) => {
    const text = getActionText(input);
    return patterns.some((pattern) => pattern.test(text));
  }) || null;
}

function findEmailInput() {
  const isPasswordCandidate = (input) => {
    const type = String(input?.getAttribute?.('type') || input?.type || '').trim().toLowerCase();
    const metadataText = normalizeText([
      input?.textContent,
      input?.getAttribute?.('aria-label'),
      input?.getAttribute?.('title'),
      input?.getAttribute?.('placeholder'),
      input?.getAttribute?.('name'),
      input?.id,
    ].filter(Boolean).join(' '));
    return type === 'password' || /password|pass|密码/i.test(metadataText);
  };
  const isEmailCandidate = (input) => {
    if (!input || isPasswordCandidate(input)) {
      return false;
    }
    const type = String(input.getAttribute?.('type') || input.type || '').trim().toLowerCase();
    const autocomplete = String(input.getAttribute?.('autocomplete') || '').trim().toLowerCase();
    const inputMode = String(input.getAttribute?.('inputmode') || '').trim().toLowerCase();
    const metadataText = getActionText(input);
    return type === 'email'
      || autocomplete === 'username'
      || inputMode === 'email'
      || /(?:^|[\s_-])login[_-]?email(?:$|[\s_-])|email|e-mail|电子邮箱|邮箱|邮件地址|login|user|账号/i.test(metadataText);
  };
  const inputs = getVisibleControls('input')
    .filter((input) => {
      const type = String(input.getAttribute('type') || input.type || '').trim().toLowerCase();
      return isEnabledControl(input)
        && !['hidden', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(type)
        && !isPasswordCandidate(input);
    });
  const direct = [
    document.getElementById?.('email'),
    document.getElementById?.('login_email'),
    document.querySelector?.('input[name="login_email"]'),
    document.querySelector?.('input[autocomplete="username"]'),
    document.querySelector?.('input[type="email"]'),
  ].find((input) => input && isVisibleElement(input) && isEnabledControl(input) && isEmailCandidate(input));
  return direct
    || inputs.find(isEmailCandidate)
    || null;
}

function findPasswordInput() {
  const inputs = getVisibleControls('input')
    .filter((input) => {
      const type = String(input.getAttribute('type') || input.type || '').trim().toLowerCase();
      return isEnabledControl(input) && !['hidden', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(type);
    });
  return inputs.find((input) => {
    const type = String(input.getAttribute('type') || input.type || '').trim().toLowerCase();
    const metadataText = normalizeText([
      input?.textContent,
      input?.getAttribute?.('aria-label'),
      input?.getAttribute?.('title'),
      input?.getAttribute?.('placeholder'),
      input?.getAttribute?.('name'),
      input?.id,
    ].filter(Boolean).join(' '));
    return type === 'password' || /password|pass|密码/i.test(metadataText);
  }) || getVisibleControls('input[type="password"]').find(isVisibleElement) || null;
}

function findLoginNextButton() {
  return findClickableByText([
    /next|continue|login|log\s*in|sign\s*in/i,
    /下一步|继续|登录|登入/i,
  ]);
}

function findEmailNextButton() {
  return findClickableByText([
    /next|btn\s*next|btnnext/i,
    /下一页|下一步/i,
  ]);
}

function findPasswordLoginButton() {
  const button = findClickableByText([
    /login|log\s*in|sign\s*in/i,
    /登录|登入/i,
  ]);
  return button && button !== findEmailNextButton() ? button : null;
}

function findApproveButton() {
  return findClickableByText([
    /同意并继续|同意|继续|授权|确认并继续/i,
    /agree\s*(?:and)?\s*continue|continue|accept|authorize|agree|pay\s*now/i,
  ]);
}

function getPayPalPathname() {
  return String(location?.pathname || '').trim();
}

function isHostedLoginPage() {
  return getPayPalPathname() === '/pay' || Boolean(document.getElementById('email'));
}

function isHostedGuestCheckoutPage() {
  if (document.getElementById('cardNumber')) {
    return true;
  }
  const pageText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  if (/create\s*(?:paypal\s*)?account|agree\s*(?:&|and)?\s*create|创建.*(?:账户|账号)/i.test(pageText)
    && findHostedCreateAccountButton()) {
    return false;
  }
  if (document.getElementById('billingLine1')) {
    return true;
  }
  return /\/checkoutweb\//i.test(getPayPalPathname())
    && Boolean(document.getElementById('phone') || document.getElementById('email'));
}

function isHostedReviewPage() {
  return /\/webapps\/hermes/i.test(getPayPalPathname());
}

function getPayPalHostedGenericErrorMessage() {
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  const match = bodyText.match(
    /Things\s+don[’']?t\s+appear\s+to\s+be\s+working\s+at\s+the\s+moment\.?|Sorry,\s*something\s+went\s+wrong\.?\s*Please\s+try\s+again\.?|Something\s+went\s+wrong(?:\.?\s*Please\s+go\s+back\s+to\s+[^.]+?\s+and\s+choose\s+another\s+way\s+to\s+pay\.?\s*PayPal\s+isn[’']?t\s+available\s+at\s+this\s+time\.?)?/i
  );
  return match ? match[0] : '';
}

function isPayPalHostedGenericErrorPage() {
  const pathname = getPayPalPathname();
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  return /\/checkoutweb\/genericError/i.test(pathname)
    || Boolean(getPayPalHostedGenericErrorMessage())
    || (
      /(?:sorry,\s*)?something\s+went\s+wrong/i.test(bodyText)
      && /return\s+to\s+merchant/i.test(bodyText)
    )
    || (
      /paypal\s+isn[’']?t\s+available\s+at\s+this\s+time/i.test(bodyText)
      && /choose\s+another\s+way\s+to\s+pay/i.test(bodyText)
    );
}

function getPayPalHostedGuestCardErrorMessage() {
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  const match = bodyText.match(
    /We\s+weren['\u2019]?t\s+able\s+to\s+add\s+this\s+card\.?\s*Check\s+all\s+the\s+details\s+are\s+correct\s+and\s+try\s+again\s+or\s+try\s+a\s+different\s+card\.?|unable\s+to\s+add\s+this\s+card|try\s+a\s+different\s+card|无法添加此卡|无法新增此卡|请检查所有详细信息.*(?:其他|不同).*卡/i
  );
  return match ? match[0] : '';
}

function hasPayPalHostedGuestCardError() {
  return Boolean(getPayPalHostedGuestCardErrorMessage());
}

function getPayPalHostedGuestPhoneErrorMessage() {
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  const match = bodyText.match(
    /We['\u2019]?re\s+unable\s+to\s+complete\s+your\s+request\.?\s*Try\s+a\s+different\s+phone\s+number\.?|Try\s+a\s+different\s+phone\s+number\.?|请尝试其他手机号|请更换手机号/i
  );
  return match ? match[0] : '';
}

function hasPayPalHostedGuestPhoneError() {
  return Boolean(getPayPalHostedGuestPhoneErrorMessage());
}

function isHostedCreateAccountAddressErrorText(text = '') {
  return /pageLevelError\.invalidAddress|invalidAddress|check\s+the\s+address\s+you\s+entered\s+and\s+try\s+again\.?|invalid\s+address|address\s+(?:is\s+)?(?:invalid|not\s+recognized|unrecognized)|(?:检查|核对).*地址|地址.*(?:无效|错误|无法识别|不被识别)/i
    .test(String(text || ''));
}

function getPayPalHostedCreateAccountAddressErrorMessage() {
  const selectors = [
    '#page-level-error-message',
    '[data-testid="page-level-error-message"]',
    '[data-testid="page-level-error-container"]',
    '[data-error-key]',
    '[aria-live]',
    '[role="alert"]',
  ];
  const candidates = [];
  const seen = new Set();
  for (const selector of selectors) {
    let matches = [];
    try {
      matches = Array.from(document.querySelectorAll(selector) || []);
    } catch {
      matches = [];
    }
    for (const node of matches) {
      if (!node || seen.has(node)) {
        continue;
      }
      seen.add(node);
      candidates.push(node);
    }
  }
  for (const node of candidates) {
    if (!isVisibleElement(node)) {
      continue;
    }
    const text = normalizeText(node.textContent || node.innerText || '');
    const signal = normalizeText([
      node.id,
      node.getAttribute?.('data-testid'),
      node.getAttribute?.('data-error-key'),
      node.getAttribute?.('aria-live'),
      node.getAttribute?.('role'),
      text,
    ].filter(Boolean).join(' '));
    if (isHostedCreateAccountAddressErrorText(signal)) {
      return text || signal;
    }
  }
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  const bodyMatch = bodyText.match(/check\s+the\s+address\s+you\s+entered\s+and\s+try\s+again\.?|invalid\s+address|地址.*(?:无效|错误|无法识别|不被识别)/i);
  return bodyMatch ? bodyMatch[0] : '';
}

function hasPayPalHostedCreateAccountAddressError() {
  return Boolean(getPayPalHostedCreateAccountAddressErrorMessage());
}

function getPayPalHostedSecurityChallengeText() {
  const bodyText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  const directMatch = bodyText.match(
    /安全问题|security\s+challenge|You\s+have\s+been\s+blocked\.?|We\s+couldn['\u2019]?t\s+load\s+the\s+security\s+challenge\.?/i
  );
  if (directMatch) {
    return directMatch[0];
  }
  const captchaMatch = bodyText.match(/captcha|recaptcha/i);
  const challengeContextMatch = bodyText.match(/challenge|security|authchallenge|安全|验证/i);
  return captchaMatch && challengeContextMatch ? captchaMatch[0] : '';
}

function isPayPalHostedSecurityChallengeElement(el) {
  if (!el || el.nodeType !== 1) {
    return false;
  }
  const id = String(el.id || el.getAttribute?.('id') || '').trim();
  const className = String(el.className || el.getAttribute?.('class') || '').trim();
  const dataApp = String(el.getAttribute?.('data-app') || '').trim();
  const captchaType = String(el.getAttribute?.('data-captcha-type') || '').trim();
  const tagName = String(el.tagName || '').trim().toLowerCase();
  const src = String(el.src || el.getAttribute?.('src') || '').trim();
  return id === 'captcha-standalone'
    || /\bcaptcha-overlay\b/i.test(className)
    || /\bcaptcha-container\b/i.test(className)
    || /authchallenge/i.test(dataApp)
    || Boolean(captchaType)
    || (tagName === 'iframe' && /recaptcha/i.test(src));
}

function describePayPalHostedSecurityChallengeSelector(el, fallbackSelector = '') {
  if (!el || el.nodeType !== 1) {
    return String(fallbackSelector || '').trim();
  }
  const id = String(el.id || el.getAttribute?.('id') || '').trim();
  const className = String(el.className || el.getAttribute?.('class') || '').trim();
  const tagName = String(el.tagName || '').trim().toLowerCase();
  const src = String(el.src || el.getAttribute?.('src') || '').trim();
  if (id) {
    return `#${id}`;
  }
  if (/\bcaptcha-overlay\b/i.test(className)) {
    return '.captcha-overlay';
  }
  if (/\bcaptcha-container\b/i.test(className)) {
    return '.captcha-container';
  }
  if (/authchallenge/i.test(String(el.getAttribute?.('data-app') || ''))) {
    return '[data-app*="authchallenge"]';
  }
  if (el.getAttribute?.('data-captcha-type')) {
    return '[data-captcha-type]';
  }
  if (tagName === 'iframe' && /recaptcha/i.test(src)) {
    return 'iframe[src*="recaptcha"]';
  }
  return String(fallbackSelector || '').trim() || tagName || 'unknown';
}

function resolvePayPalHostedSecurityChallengeRoot(el) {
  let node = el;
  while (node && node.nodeType === 1 && node !== document.body) {
    if (
      isPayPalHostedSecurityChallengeElement(node)
      && String(node.tagName || '').trim().toLowerCase() !== 'iframe'
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return el;
}

function findPayPalHostedSecurityChallengeOverlay() {
  for (const selector of PAYPAL_HOSTED_SECURITY_CHALLENGE_SELECTORS) {
    let matches = [];
    try {
      matches = Array.from(document.querySelectorAll(selector) || []);
    } catch {
      matches = [];
    }
    const visibleMatch = matches.find((node) => isPayPalHostedSecurityChallengeElement(node) && isVisibleElement(node));
    if (visibleMatch) {
      const root = resolvePayPalHostedSecurityChallengeRoot(visibleMatch);
      return {
        element: root,
        selector: describePayPalHostedSecurityChallengeSelector(root, selector),
      };
    }
  }
  return null;
}

function isPayPalHostedSecurityChallengeNodeConnected(node) {
  if (!node) {
    return false;
  }
  if (typeof node.isConnected === 'boolean') {
    return node.isConnected;
  }
  if (document.documentElement && typeof document.documentElement.contains === 'function') {
    return document.documentElement.contains(node);
  }
  let current = node;
  while (current) {
    if (current === document.body || current === document.documentElement) {
      return true;
    }
    current = current.parentNode || current.parentElement;
  }
  return false;
}

function buildPayPalHostedSecurityChallengeProbeDefaults(overrides = {}) {
  return {
    hostedSecurityChallengeVisible: false,
    hostedSecurityChallengeSelector: '',
    hostedSecurityChallengeRestored: false,
    hostedSecurityChallengeRemovable: false,
    hostedSecurityChallengeRemoved: false,
    hostedSecurityChallengeError: '',
    ...overrides,
  };
}

function probePayPalHostedSecurityChallengeOverlay() {
  const target = findPayPalHostedSecurityChallengeOverlay();
  if (!target?.element) {
    const textSignal = getPayPalHostedSecurityChallengeText();
    if (textSignal) {
      const previousResult = paypalHostedSecurityChallengeLastProbeResult || {};
      return buildPayPalHostedSecurityChallengeProbeDefaults({
        hostedSecurityChallengeVisible: true,
        hostedSecurityChallengeSelector: previousResult.hostedSecurityChallengeSelector || 'body-text',
        hostedSecurityChallengeRemovable: Boolean(previousResult.hostedSecurityChallengeRemovable),
        hostedSecurityChallengeRemoved: Boolean(previousResult.hostedSecurityChallengeRemoved),
        hostedSecurityChallengeError: previousResult.hostedSecurityChallengeError || '检测到安全挑战文本，但未找到可探测的安全层容器。',
      });
    }
    return buildPayPalHostedSecurityChallengeProbeDefaults();
  }

  const node = target.element;
  if (paypalHostedSecurityChallengeProbeResults?.has(node)) {
    return paypalHostedSecurityChallengeProbeResults.get(node);
  }

  const selector = target.selector || describePayPalHostedSecurityChallengeSelector(node);
  const parent = node.parentNode || node.parentElement;
  let removable = false;
  let removed = false;
  let error = '';

  try {
    if (typeof node.remove === 'function') {
      node.remove();
    } else if (parent && typeof parent.removeChild === 'function') {
      parent.removeChild(node);
    } else {
      throw new Error('当前页面不支持删除安全层容器。');
    }
    removed = !isPayPalHostedSecurityChallengeNodeConnected(node);
    removable = removed;
  } catch (err) {
    error = err?.message || String(err || '安全层删除失败。');
  }

  const result = buildPayPalHostedSecurityChallengeProbeDefaults({
    hostedSecurityChallengeVisible: true,
    hostedSecurityChallengeSelector: selector,
    hostedSecurityChallengeRestored: false,
    hostedSecurityChallengeRemovable: removable,
    hostedSecurityChallengeRemoved: removed,
    hostedSecurityChallengeError: error,
  });
  paypalHostedSecurityChallengeProbeResults?.set(node, result);
  paypalHostedSecurityChallengeLastProbeResult = result;
  return result;
}

function findHostedVerificationInputs() {
  return Array.from({ length: 6 }, (_, index) => document.getElementById(`ci-ciBasic-${index}`))
    .filter((input) => isVisibleElement(input));
}

function hasHostedVerificationInputs() {
  return findHostedVerificationInputs().length >= 6;
}

function getHostedVerificationErrorText() {
  const errorPattern = /check\s+the\s+code\s+and\s+try\s+again|(?:sorry,\s*)?something\s+went\s+wrong\.?\s*get\s+a\s+new\s+code|get\s+a\s+new\s+code|验证码.*(?:错误|无效|重新)|重新.*验证码/i;
  const alert = document.getElementById('message_ciBasic')
    || getVisibleControls('[role="alert"]').find((node) => errorPattern.test(normalizeText(node.textContent || node.innerText || '')));
  return alert && isVisibleElement(alert) ? normalizeText(alert.textContent || alert.innerText || '') : '';
}

function hasHostedInvalidVerificationCodeError() {
  return /check\s+the\s+code\s+and\s+try\s+again|(?:sorry,\s*)?something\s+went\s+wrong\.?\s*get\s+a\s+new\s+code|get\s+a\s+new\s+code|验证码.*(?:错误|无效|重新)|重新.*验证码/i.test(getHostedVerificationErrorText());
}

function findHostedVerificationResendButton() {
  const direct = document.querySelector('button[data-testid="resend-link"]');
  if (direct && isVisibleElement(direct) && isEnabledControl(direct)) {
    return direct;
  }
  return findClickableByText([
    /resend/i,
    /重新发送|重发/i,
  ]);
}

function findHostedCreateAccountButton() {
  return document.getElementById('createAccount')
    || document.getElementById('createAccountButton')
    || document.querySelector('button[data-testid="createAccountButton"]')
    || document.querySelector('button[data-testid="create-account-button"]')
    || findClickableByText([
      /agree\s*(?:&|and)?\s*create\s*(?:paypal\s*)?account/i,
      /create\s*(?:paypal\s*)?account/i,
      /同意.*创建|创建.*账户|创建.*账号/i,
    ]);
}

function isHostedCreateAccountPage() {
  if (isHostedLoginPage()) {
    return false;
  }
  if (document.getElementById('cardNumber')) {
    return false;
  }
  const button = findHostedCreateAccountButton();
  if (!button || !isVisibleElement(button) || !isEnabledControl(button)) {
    return false;
  }
  const pageText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  return /create\s*(?:paypal\s*)?account|agree\s*(?:&|and)?\s*create|创建.*(?:账户|账号)/i.test(pageText)
    || /create/i.test(getActionText(button));
}

function findHostedReviewConsentButton() {
  const direct = document.getElementById('consentButton')
    || document.querySelector('button[data-testid="consentButton"]');
  if (direct && isVisibleElement(direct) && isEnabledControl(direct)) {
    return direct;
  }
  return findClickableByText([
    /agree\s*(?:and)?\s*continue|accept|continue/i,
    /同意并继续|同意|继续/i,
  ]);
}

function detectPayPalHostedStage(options = {}) {
  if (!/paypal\./i.test(String(location?.host || ''))) {
    return PAYPAL_HOSTED_STAGE_OUTSIDE;
  }
  if (options?.securityChallengeEnabled === true) {
    probePayPalHostedSecurityChallengeOverlay();
  }
  if (hasHostedVerificationInputs()) {
    return PAYPAL_HOSTED_STAGE_VERIFICATION;
  }
  if (isPayPalHostedGenericErrorPage()) {
    return PAYPAL_HOSTED_STAGE_GENERIC_ERROR;
  }
  if (isHostedGuestCheckoutPage()) {
    return PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT;
  }
  if (isHostedReviewPage() && findHostedReviewConsentButton()) {
    return PAYPAL_HOSTED_STAGE_REVIEW;
  }
  if (isHostedCreateAccountPage()) {
    return PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
  }
  if (isHostedLoginPage()) {
    return PAYPAL_HOSTED_STAGE_LOGIN;
  }
  return findApproveButton() ? PAYPAL_HOSTED_STAGE_APPROVAL : PAYPAL_HOSTED_STAGE_UNKNOWN;
}

function fillHostedInputById(id, value) {
  const input = document.getElementById(String(id || '').trim());
  if (!input || !isVisibleElement(input) || !isEnabledControl(input)) {
    return false;
  }
  fillInput(input, String(value || ''));
  return true;
}

function selectHostedOptionByIdText(id, value) {
  const select = document.getElementById(String(id || '').trim());
  const expected = normalizeText(value).toLowerCase();
  if (!select || !expected) {
    return false;
  }
  const option = Array.from(select.options || []).find((item) => {
    const optionText = normalizeText(item.textContent || item.label || '').toLowerCase();
    const optionValue = normalizeText(item.value || '').toLowerCase();
    return optionText.includes(expected) || optionValue.includes(expected);
  });
  if (!option) {
    return false;
  }
  select.value = option.value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function fillFirstHostedInputByIds(ids = [], value = '') {
  for (const id of ids) {
    if (fillHostedInputById(id, value)) {
      return true;
    }
  }
  return false;
}

const PAYPAL_HOSTED_ADDRESS_LINE1_IDS = [
  'billingLine1',
  'billingAddressLine1',
  'addressLine1',
  'address',
  'line1',
];

function findHostedAddressLine1Input() {
  for (const id of PAYPAL_HOSTED_ADDRESS_LINE1_IDS) {
    const input = document.getElementById(id);
    if (input && isVisibleElement(input) && isEnabledControl(input)) {
      return input;
    }
  }
  const selectors = [
    'input[name="billingLine1"]',
    'input[name="billingAddressLine1"]',
    'input[name="addressLine1"]',
    'input[name="address"]',
    'input[name="line1"]',
    'input[autocomplete*="address-line1" i]',
  ];
  for (const selector of selectors) {
    const input = document.querySelector(selector);
    if (input && isVisibleElement(input) && isEnabledControl(input)) {
      return input;
    }
  }
  return null;
}

function getHostedAddressSuggestionCandidates() {
  const selectors = [
    '#addressSuggestionContainer button[id^="addressIndex"]',
    '#suggestedAddressList button[id^="addressIndex"]',
    '[data-dd-action-name*="Auto-suggested address" i] button',
    'button[id^="addressIndex"]',
    '#addressSuggestionContainer [role="option"]',
    '#suggestedAddressList [role="option"]',
    '[role="listbox"] [role="option"]',
    '[role="option"]',
    '#addressSuggestionContainer li button',
    '#suggestedAddressList li button',
    'li button',
  ];
  const seen = new Set();
  const candidates = [];
  for (const selector of selectors) {
    let matches = [];
    try {
      matches = Array.from(document.querySelectorAll(selector) || []);
    } catch {
      matches = [];
    }
    for (const node of matches) {
      if (!node || seen.has(node) || !isVisibleElement(node) || !isEnabledControl(node)) {
        continue;
      }
      const text = normalizeText(node.textContent || node.getAttribute?.('aria-label') || '');
      if (!text) {
        continue;
      }
      seen.add(node);
      candidates.push(node);
    }
  }
  return candidates;
}

async function selectHostedAddressSuggestionFallback() {
  const input = findHostedAddressLine1Input();
  if (!input) {
    return {
      addressSuggestionFallbackAttempted: true,
      addressSuggestionSelected: false,
      addressSuggestionSelectedText: '',
      addressSuggestionError: 'address line 1 input not found',
    };
  }
  const originalValue = String(input.value || '');
  const shortenedValue = originalValue.length > 0 ? originalValue.slice(0, -1) : originalValue;
  try {
    if (typeof input.focus === 'function') {
      input.focus();
    }
    fillInput(input, shortenedValue);
    await sleep(500);
    const suggestions = await waitUntil(() => {
      const candidates = getHostedAddressSuggestionCandidates();
      return candidates.length ? candidates : null;
    }, {
      intervalMs: 250,
      timeoutMs: 6000,
      timeoutMessage: 'PayPal hosted checkout address suggestions did not appear.',
    });
    const target = suggestions[0];
    const selectedText = normalizeText(target.textContent || target.getAttribute?.('aria-label') || '');
    await performPayPalOperationWithDelay({
      stepKey: getHostedStepKey(PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT),
      kind: 'select',
      label: 'hosted-paypal-address-suggestion',
    }, async () => {
      simulateClick(target);
    });
    await sleep(1200);
    return {
      addressSuggestionFallbackAttempted: true,
      addressSuggestionSelected: true,
      addressSuggestionSelectedText: selectedText,
      addressSuggestionError: '',
    };
  } catch (error) {
    fillInput(input, originalValue);
    return {
      addressSuggestionFallbackAttempted: true,
      addressSuggestionSelected: false,
      addressSuggestionSelectedText: '',
      addressSuggestionError: error?.message || String(error || 'address suggestion fallback failed'),
    };
  }
}

function selectFirstHostedOptionByIdText(ids = [], value = '') {
  for (const id of ids) {
    if (selectHostedOptionByIdText(id, value)) {
      return true;
    }
  }
  return false;
}

function fillHostedAddressFields(address = {}) {
  const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
  const street = source.street || source.address1 || source.line1 || source.billingLine1 || '';
  const city = source.city || source.locality || source.billingCity || '';
  const zip = source.zip || source.postalCode || source.postcode || source.billingPostalCode || '';
  const state = source.state || source.region || source.administrativeArea || source.billingState || '';
  const filled = {
    street: fillFirstHostedInputByIds([
      'billingLine1',
      'billingAddressLine1',
      'addressLine1',
      'address',
      'line1',
    ], street),
    city: fillFirstHostedInputByIds([
      'billingCity',
      'billingLocality',
      'city',
      'locality',
    ], city),
    zip: fillFirstHostedInputByIds([
      'billingPostalCode',
      'billingZip',
      'postalCode',
      'postal',
      'zip',
    ], zip),
    state: selectFirstHostedOptionByIdText([
      'billingState',
      'billingAdministrativeArea',
      'state',
      'administrativeArea',
      'region',
    ], state),
  };
  return {
    attempted: Boolean(street || city || zip || state),
    filledAny: Object.values(filled).some(Boolean),
    ...filled,
  };
}

function selectHostedCountryById(id = 'country', countryCode = 'US') {
  const select = document.getElementById(String(id || '').trim());
  if (!select || !isVisibleElement(select)) {
    return { found: Boolean(select), selected: false };
  }
  const expected = normalizeText(countryCode || 'US').toLowerCase();
  const currentOption = Array.from(select.options || []).find((item) => item.selected) || null;
  const currentText = normalizeText(currentOption?.textContent || currentOption?.label || select.value || '').toLowerCase();
  if (currentText === expected || select.value.toLowerCase() === expected || /united\s+states|usa/i.test(currentText)) {
    return { found: true, selected: false, value: select.value };
  }
  if (!isEnabledControl(select)) {
    return { found: true, selected: false, missing: true, disabled: true };
  }
  const option = Array.from(select.options || []).find((item) => {
    const optionText = normalizeText(item.textContent || item.label || '').toLowerCase();
    const optionValue = normalizeText(item.value || '').toLowerCase();
    return optionValue === expected
      || optionValue === 'usa'
      || optionText === expected
      || /united\s+states|usa/i.test(optionText);
  });
  if (!option) {
    return { found: true, selected: false, missing: true };
  }
  select.value = option.value;
  option.selected = true;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return { found: true, selected: true, value: select.value };
}

function findHostedSubmitButton() {
  return document.querySelector('button[data-testid="submit-button"]')
    || document.querySelector('button[data-testid="hosted-payment-submit-button"]')
    || document.querySelector('button[data-atomic-wait-intent="Submit_Email"]')
    || document.querySelector('button.SubmitButton--complete')
    || findEmailNextButton()
    || findLoginNextButton()
    || findClickableByText([
      /pay|continue|next|agree|subscribe/i,
      /支付|继续|下一步|同意|订阅/i,
    ]);
}

function getHostedStepKey(stage = '', fallback = 'plus-checkout-create') {
  return PAYPAL_HOSTED_STEP_KEYS[stage] || fallback;
}

async function clickHostedSubmitButton(options = {}) {
  const stepKey = String(options.stepKey || getHostedStepKey(options.stage)).trim();
  const label = String(options.label || 'hosted-paypal-submit').trim();
  const maxAttempts = Math.max(1, Math.floor(Number(options.maxAttempts) || 3));
  let lastButtonText = '';
  let lastDisabled = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const button = await waitUntil(() => {
      const candidate = findHostedSubmitButton();
      return candidate && isVisibleElement(candidate) ? candidate : null;
    }, {
      intervalMs: 500,
      timeoutMs: 15000,
      timeoutMessage: 'PayPal hosted checkout 未找到可点击的继续/提交按钮。',
    });
    lastButtonText = getActionText(button);
    lastDisabled = !isEnabledControl(button);
    if (lastDisabled) {
      if (attempt >= maxAttempts) {
        throw new Error('PayPal hosted checkout 继续/提交按钮长时间不可用。');
      }
      await sleep(1000);
      continue;
    }

    await performPayPalOperationWithDelay({ stepKey, kind: 'click', label }, async () => {
      simulateClick(button);
    });
    await sleep(1000);
    return {
      clicked: true,
      buttonText: lastButtonText,
      attempt,
    };
  }
  return {
    clicked: false,
    buttonText: lastButtonText,
    disabled: lastDisabled,
  };
}

async function clickHostedEmailNextButton() {
  const button = await waitUntil(() => {
    const candidate = findEmailNextButton();
    return candidate && isVisibleElement(candidate) && isEnabledControl(candidate) ? candidate : null;
  }, {
    intervalMs: 500,
    timeoutMs: 15000,
    timeoutMessage: 'PayPal hosted checkout 未找到邮箱页“下一页”按钮。',
  });
  const buttonText = getActionText(button);
  await performPayPalOperationWithDelay({
    stepKey: getHostedStepKey(PAYPAL_HOSTED_STAGE_LOGIN),
    kind: 'click',
    label: 'hosted-paypal-email-next',
  }, async () => {
    simulateClick(button);
  });
  return {
    clicked: true,
    buttonText,
  };
}

function normalizeHostedPhoneDigits(value = '') {
  return String(value || '').replace(/\D/g, '');
}

function getHostedInputDescriptor(input = null) {
  if (!input) return '';
  return normalizeText([
    input.id ? `#${input.id}` : '',
    input.name ? `name=${input.name}` : '',
    input.type ? `type=${input.type}` : '',
    input.getAttribute?.('data-testid') ? `testid=${input.getAttribute('data-testid')}` : '',
    input.getAttribute?.('autocomplete') ? `autocomplete=${input.getAttribute('autocomplete')}` : '',
    input.getAttribute?.('inputmode') ? `inputmode=${input.getAttribute('inputmode')}` : '',
    input.getAttribute?.('placeholder') ? `placeholder=${input.getAttribute('placeholder')}` : '',
    input.getAttribute?.('aria-label') ? `aria=${input.getAttribute('aria-label')}` : '',
  ].filter(Boolean).join(' '));
}

function isHostedPhoneInputCandidate(input = null) {
  if (!input || !isVisibleElement(input) || !isEnabledControl(input)) {
    return false;
  }
  const type = String(input.getAttribute?.('type') || input.type || '').trim().toLowerCase();
  if (['hidden', 'checkbox', 'radio', 'submit', 'button', 'file', 'password', 'email'].includes(type)) {
    return false;
  }
  const identityText = normalizeText([
    input.id,
    input.name,
    input.type,
    input.getAttribute?.('data-testid'),
    input.getAttribute?.('autocomplete'),
    input.getAttribute?.('inputmode'),
  ].filter(Boolean).join(' '));
  const labelText = normalizeText([
    input.getAttribute?.('placeholder'),
    input.getAttribute?.('aria-label'),
    input.getAttribute?.('title'),
  ].filter(Boolean).join(' '));
  const strongPhoneSignal = input.id === 'phone'
    || /phone|mobile|tel|手机号|手机|电话/i.test(identityText)
    || type === 'tel'
    || String(input.getAttribute?.('autocomplete') || '').trim().toLowerCase().startsWith('tel')
    || String(input.getAttribute?.('inputmode') || '').trim().toLowerCase() === 'tel';
  const emailIdentitySignal = /(?:^|[\s_-])(?:email|e-mail|login[_-]?email|username|user)(?:$|[\s_-])/i.test(identityText)
    || ['email', 'username'].includes(String(input.getAttribute?.('autocomplete') || '').trim().toLowerCase());
  if (emailIdentitySignal && !strongPhoneSignal) {
    return false;
  }
  return strongPhoneSignal
    || (/phone|mobile|tel|手机号|手机|电话/i.test(labelText) && !/email|e-mail|username|login|邮箱|邮件/i.test(labelText));
}

function findHostedPhoneInput() {
  const candidates = [
    document.getElementById('phone'),
    ...Array.from(document.querySelectorAll('input[data-testid*="phone" i]') || []),
    ...Array.from(document.querySelectorAll('input[name*="phone" i]') || []),
    ...Array.from(document.querySelectorAll('input[type="tel"]') || []),
    ...Array.from(document.querySelectorAll('input[autocomplete^="tel" i]') || []),
    ...Array.from(document.querySelectorAll('input[inputmode="tel" i]') || []),
    ...Array.from(document.querySelectorAll('input') || []),
  ].filter(Boolean);
  const seen = new Set();
  return candidates.find((input) => {
    if (seen.has(input)) return false;
    seen.add(input);
    return isHostedPhoneInputCandidate(input);
  }) || null;
}

function fillHostedPhoneInput(value = '') {
  const input = findHostedPhoneInput();
  if (!input) {
    return {
      filled: false,
      descriptor: '',
    };
  }
  fillInput(input, String(value || ''));
  return {
    filled: true,
    descriptor: getHostedInputDescriptor(input),
  };
}

function verifyHostedPhoneBeforeSubmit(expectedPhone = '') {
  const phoneInput = findHostedPhoneInput();
  if (!phoneInput) {
    throw new Error('PayPal hosted checkout 未找到电话输入框。');
  }
  const expectedDigits = normalizeHostedPhoneDigits(expectedPhone);
  const renderedDigits = normalizeHostedPhoneDigits(phoneInput.value || '');
  if (!expectedDigits) {
    throw new Error('PayPal hosted checkout 未收到后台下发的池中手机号/验证码配置，无法校验资料页手机号。');
  }
  const comparableRenderedDigits = renderedDigits.length > expectedDigits.length
    ? renderedDigits.slice(-expectedDigits.length)
    : renderedDigits;
  if (comparableRenderedDigits !== expectedDigits) {
    throw new Error(`PayPal hosted checkout 电话不一致：配置 ${expectedDigits}，页面 ${renderedDigits || '(空)'}。`);
  }
  return {
    payloadPhoneDigits: expectedDigits,
    renderedPhoneDigits: renderedDigits,
    phoneMatched: true,
    phoneInputDescriptor: getHostedInputDescriptor(phoneInput),
  };
}

function getHostedPhoneInputForGuard() {
  return findHostedPhoneInput();
}

function hasHostedPhoneInputValue() {
  const phoneInput = getHostedPhoneInputForGuard();
  return Boolean(phoneInput && String(phoneInput.value || '').trim());
}

function getHostedPhoneInputState() {
  const phoneInput = getHostedPhoneInputForGuard();
  const value = phoneInput ? String(phoneInput.value || '') : '';
  return {
    phoneInputFound: Boolean(phoneInput),
    phoneInputDescriptor: getHostedInputDescriptor(phoneInput),
    hostedGuestPhoneValuePresent: Boolean(value.trim()),
    hostedGuestPhoneDigits: normalizeHostedPhoneDigits(value),
  };
}

function normalizeHostedVerificationCode(value = '') {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

async function fillHostedVerificationCode(payload = {}) {
  await waitForDocumentComplete();
  const code = normalizeHostedVerificationCode(payload.verificationCode || payload.code || '');
  if (code.length !== 6) {
    throw new Error('PayPal hosted checkout 验证码无效。');
  }
  const inputs = findHostedVerificationInputs();
  if (inputs.length < 6) {
    throw new Error('PayPal hosted checkout 当前页面未显示验证码输入框。');
  }
  await performPayPalOperationWithDelay({
    stepKey: 'plus-checkout-create',
    kind: 'fill',
    label: 'hosted-paypal-verification-code',
  }, async () => {
    inputs.forEach((input, index) => {
      fillInput(input, code[index] || '');
    });
  });
  return {
    stage: PAYPAL_HOSTED_STAGE_VERIFICATION,
    codeSubmitted: true,
  };
}

async function clickHostedVerificationResend() {
  await waitForDocumentComplete();
  const button = await waitUntil(() => findHostedVerificationResendButton(), {
    intervalMs: 250,
    timeoutMs: 10000,
    timeoutMessage: 'PayPal hosted checkout 当前验证码页未找到可用的 Resend 按钮。',
  });
  await performPayPalOperationWithDelay({
    stepKey: 'plus-checkout-create',
    kind: 'click',
    label: 'hosted-paypal-verification-resend',
  }, async () => {
    simulateClick(button);
  });
  return {
    stage: PAYPAL_HOSTED_STAGE_VERIFICATION,
    resendClicked: true,
    invalidCodeVisibleAfterClick: hasHostedInvalidVerificationCodeError(),
  };
}

async function clickHostedCreateAccount(payload = {}) {
  await waitForDocumentComplete();
  const addressFillResult = payload.address && typeof payload.address === 'object'
    ? fillHostedAddressFields(payload.address)
    : null;
  const addressSuggestionResult = payload.useAddressSuggestionFallback === true
    ? await selectHostedAddressSuggestionFallback()
    : {
      addressSuggestionFallbackAttempted: false,
      addressSuggestionSelected: false,
      addressSuggestionSelectedText: '',
      addressSuggestionError: '',
    };
  const button = await waitUntil(() => {
    const candidate = findHostedCreateAccountButton();
    return candidate && isVisibleElement(candidate) && isEnabledControl(candidate) ? candidate : null;
  }, {
    intervalMs: 500,
    timeoutMs: 30000,
    timeoutMessage: 'PayPal hosted checkout 未找到创建账号确认按钮。',
  });
  await performPayPalOperationWithDelay({
    stepKey: getHostedStepKey(PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT),
    kind: 'click',
    label: 'hosted-paypal-create-account',
  }, async () => {
    simulateClick(button);
  });
  return {
    stage: PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT,
    clicked: true,
    submitted: true,
    buttonText: getActionText(button),
    addressRefilled: Boolean(addressFillResult?.filledAny),
    addressFillResult,
    ...addressSuggestionResult,
  };
}

function buildHostedRandomEmail() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  for (let index = 0; index < 16; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${value}@gmail.com`;
}

function buildHostedRandomPassword() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^';
  let value = 'Aa1!';
  while (value.length < 14) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function buildHostedVisaCard() {
  const digits = [4, 1, 4, 7];
  while (digits.length < 15) {
    digits.push(Math.floor(Math.random() * 10));
  }
  const reversed = digits.slice().reverse();
  let sum = 0;
  for (let index = 0; index < reversed.length; index += 1) {
    let digit = reversed[index];
    if (index % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  digits.push((10 - (sum % 10)) % 10);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = (new Date().getFullYear() % 100) + 3;
  return {
    number: digits.join(''),
    expiry: `${month} / ${year}`,
    cvv: String(Math.floor(100 + Math.random() * 900)),
  };
}

async function submitHostedLogin(payload = {}) {
  await waitForDocumentComplete();
  const email = normalizeText(payload.email || buildHostedRandomEmail());
  const inputStableWaitMs = Math.max(0, Math.floor(Number(payload.emailInputStableWaitMs) || 0));
  const emailInput = await waitUntil(() => {
    const candidate = findEmailInput();
    return candidate && isVisibleElement(candidate) && isEnabledControl(candidate) ? candidate : null;
  }, {
    intervalMs: 500,
    timeoutMs: Math.max(0, Math.floor(Number(payload.emailInputTimeoutMs) || 0)),
    timeoutMessage: 'PayPal hosted checkout 未找到邮箱输入框。',
  });
  if (inputStableWaitMs > 0) {
    await sleep(inputStableWaitMs);
  }
  refillPayPalEmailInput(emailInput, email);
  const clickResult = await clickHostedEmailNextButton();
  return {
    stage: PAYPAL_HOSTED_STAGE_LOGIN,
    submitted: true,
    generatedEmail: email,
    clicked: Boolean(clickResult.clicked),
    emailInputStableWaitMs: inputStableWaitMs,
  };
}

async function fillHostedGuestCheckout(payload = {}) {
  await waitForDocumentComplete();
  const countryResult = selectHostedCountryById('country', 'US');
  if (countryResult.missing) {
    throw new Error('PayPal hosted checkout country dropdown does not contain United States.');
  }
  if (countryResult.selected) {
    await sleep(1000);
  }
  const generatedCard = buildHostedVisaCard();
  const address = payload.address && typeof payload.address === 'object' ? payload.address : {};
  const configuredPhone = normalizeText(payload.phone || '');
  if (!normalizeHostedPhoneDigits(configuredPhone)) {
    throw new Error('PayPal hosted checkout 未收到后台下发的池中手机号/验证码配置，无法继续填写资料页。');
  }
  const values = {
    email: normalizeText(payload.email || buildHostedRandomEmail()),
    phone: configuredPhone,
    cardNumber: String(payload.cardNumber || generatedCard.number).replace(/\s+/g, ''),
    cardExpiry: normalizeText(payload.cardExpiry || generatedCard.expiry),
    cardCvv: normalizeText(payload.cardCvv || generatedCard.cvv),
    password: String(payload.password || buildHostedRandomPassword()),
    firstName: normalizeText(payload.firstName || 'James'),
    lastName: normalizeText(payload.lastName || 'Smith'),
  };
  const fillProfileFields = () => {
    fillHostedInputById('email', values.email);
    const phoneFill = fillHostedPhoneInput(values.phone);
    fillHostedInputById('cardNumber', values.cardNumber);
    fillHostedInputById('cardExpiry', values.cardExpiry);
    fillHostedInputById('cardCvv', values.cardCvv);
    fillHostedInputById('password', values.password);
    fillHostedInputById('firstName', values.firstName);
    fillHostedInputById('lastName', values.lastName);
    fillHostedInputById('billingLine1', address.street || address.address1 || '');
    fillHostedInputById('billingCity', address.city || '');
    fillHostedInputById('billingPostalCode', address.zip || address.postalCode || '');
    selectHostedOptionByIdText('billingState', address.state || address.region || '');
    return phoneFill;
  };
  const phonePostFillCheckDelayMs = Math.max(
    0,
    Math.floor(Number(payload.phonePostFillCheckDelayMs ?? PAYPAL_HOSTED_PHONE_POST_FILL_CHECK_DELAY_MS) || 0)
  );
  const phoneEmptyRefillMaxRetries = Math.max(
    0,
    Math.floor(Number(payload.phoneEmptyRefillMaxRetries ?? PAYPAL_HOSTED_PHONE_EMPTY_REFILL_MAX_RETRIES) || 0)
  );
  let phoneValueReady = false;
  let phoneRefillAttempts = 0;
  let phoneInputDescriptor = '';
  for (let attempt = 0; attempt <= phoneEmptyRefillMaxRetries; attempt += 1) {
    const phoneFill = fillProfileFields();
    phoneRefillAttempts += 1;
    phoneInputDescriptor = phoneFill?.descriptor || phoneInputDescriptor;
    if (phonePostFillCheckDelayMs > 0) {
      await sleep(phonePostFillCheckDelayMs);
    }
    if (hasHostedPhoneInputValue()) {
      phoneValueReady = true;
      break;
    }
  }
  if (!phoneValueReady) {
    throw new Error(
      `${PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX}PayPal 无卡直绑资料页 phone 输入框在 ${phoneEmptyRefillMaxRetries} 次重填后仍为空。`
    );
  }
  const addressSuggestionResult = payload.useAddressSuggestionFallback === true
    ? await selectHostedAddressSuggestionFallback()
    : {
      addressSuggestionFallbackAttempted: false,
      addressSuggestionSelected: false,
      addressSuggestionSelectedText: '',
      addressSuggestionError: '',
    };
  const phoneCheck = verifyHostedPhoneBeforeSubmit(values.phone);
  const clickResult = await clickHostedSubmitButton({
    stage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
    label: 'hosted-paypal-card-submit',
    maxAttempts: 4,
  });
  return {
    stage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
    submitted: true,
    payloadPhone: values.phone,
    phoneRefillAttempts,
    phonePostFillCheckDelayMs,
    phoneInputDescriptor: phoneCheck.phoneInputDescriptor || phoneInputDescriptor,
    phoneValueReady,
    ...addressSuggestionResult,
    ...phoneCheck,
  };
}

async function clickHostedReviewConsent() {
  await waitForDocumentComplete();
  const button = await waitUntil(() => {
    const candidate = findHostedReviewConsentButton();
    return candidate && isVisibleElement(candidate) && isEnabledControl(candidate) ? candidate : null;
  }, {
    intervalMs: 500,
    timeoutMs: 30000,
    timeoutMessage: 'PayPal hosted checkout 未找到账单确认按钮。',
  });
  await performPayPalOperationWithDelay({
    stepKey: getHostedStepKey(PAYPAL_HOSTED_STAGE_REVIEW),
    kind: 'click',
    label: 'hosted-paypal-review-consent',
  }, async () => {
    simulateClick(button);
  });
  return {
    stage: PAYPAL_HOSTED_STAGE_REVIEW,
    submitted: true,
  };
}

async function runPayPalHostedCheckoutStep(payload = {}) {
  const stage = detectPayPalHostedStage(payload);
  if (stage === PAYPAL_HOSTED_STAGE_GENERIC_ERROR) {
    return {
      stage,
      submitted: false,
      hostedGenericError: true,
      hostedGenericErrorMessage: getPayPalHostedGenericErrorMessage(),
    };
  }
  if (payload.resendVerificationCode && stage !== PAYPAL_HOSTED_STAGE_VERIFICATION) {
    return {
      stage,
      submitted: false,
      resendSkipped: true,
      approveReady: Boolean(findApproveButton()),
    };
  }
  const expectedStage = String(payload.expectedStage || '').trim();
  if (expectedStage && stage !== expectedStage) {
    return {
      stage,
      expectedStage,
      submitted: false,
      requiresVerificationCode: stage === PAYPAL_HOSTED_STAGE_VERIFICATION,
      skipped: true,
      approveReady: Boolean(findApproveButton()),
    };
  }
  if (stage === PAYPAL_HOSTED_STAGE_VERIFICATION) {
    if (payload.resendVerificationCode) {
      return clickHostedVerificationResend();
    }
    if (!payload.verificationCode && !payload.code) {
      return {
        stage,
        requiresVerificationCode: true,
      };
    }
    return fillHostedVerificationCode(payload);
  }
  if (stage === PAYPAL_HOSTED_STAGE_LOGIN) {
    return submitHostedLogin(payload);
  }
  if (stage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT) {
    return fillHostedGuestCheckout(payload);
  }
  if (stage === PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT) {
    return clickHostedCreateAccount(payload);
  }
  if (stage === PAYPAL_HOSTED_STAGE_REVIEW) {
    return clickHostedReviewConsent();
  }
  return {
    stage,
    submitted: false,
    approveReady: Boolean(findApproveButton()),
  };
}

function inspectPayPalHostedState(payload = {}) {
  const stage = detectPayPalHostedStage(payload);
  const createAccountButton = findHostedCreateAccountButton();
  const phoneInputState = getHostedPhoneInputState();
  const securityChallengeProbe = payload?.securityChallengeEnabled === true
    ? probePayPalHostedSecurityChallengeOverlay()
    : buildPayPalHostedSecurityChallengeProbeDefaults();
  return {
    url: location.href,
    readyState: document.readyState,
    hostedStage: stage,
    hasGuestCardFields: Boolean(document.getElementById('cardNumber')),
    hasHostedEmailInput: Boolean(document.getElementById('email') || findEmailInput()),
    createAccountReady: Boolean(createAccountButton && isVisibleElement(createAccountButton) && isEnabledControl(createAccountButton)),
    verificationInputsVisible: hasHostedVerificationInputs(),
    hostedVerificationInvalidCode: hasHostedInvalidVerificationCodeError(),
    hostedVerificationErrorText: getHostedVerificationErrorText(),
    hostedVerificationResendReady: Boolean(findHostedVerificationResendButton()),
    hostedBlocked: false,
    hostedBlockedMessage: '',
    ...securityChallengeProbe,
    hostedGenericError: stage === PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
    hostedGenericErrorMessage: getPayPalHostedGenericErrorMessage(),
    hostedGuestCardError: hasPayPalHostedGuestCardError(),
    hostedGuestCardErrorMessage: getPayPalHostedGuestCardErrorMessage(),
    hostedGuestPhoneError: hasPayPalHostedGuestPhoneError(),
    hostedGuestPhoneErrorMessage: getPayPalHostedGuestPhoneErrorMessage(),
    ...phoneInputState,
    hostedCreateAccountAddressError: hasPayPalHostedCreateAccountAddressError(),
    hostedCreateAccountAddressErrorMessage: getPayPalHostedCreateAccountAddressErrorMessage(),
    reviewConsentReady: Boolean(findHostedReviewConsentButton()),
    approveReady: Boolean(findApproveButton()),
    bodyTextPreview: normalizeText(document.body?.innerText || '').slice(0, 240),
  };
}

function findPasskeyPromptButtons() {
  const promptPatterns = [
    /passkey|通行密钥|安全密钥|下次登录|faster|save/i,
  ];
  const bodyText = normalizeText(document.body?.innerText || '');
  const likelyPrompt = promptPatterns.some((pattern) => pattern.test(bodyText));
  if (!likelyPrompt) {
    return [];
  }

  const cancelOrClose = getVisibleControls('button, a, [role="button"]')
    .filter((el) => {
      const text = getActionText(el);
      return /取消|稍后|不保存|不用|关闭|cancel|not now|maybe later|skip|close|x/i.test(text)
        || el.getAttribute?.('aria-label')?.match(/close|关闭/i);
    });

  const iconCloseButtons = getVisibleControls('button, [role="button"]')
    .filter((el) => {
      const text = getActionText(el);
      const rect = el.getBoundingClientRect();
      return (/^×$|^x$/i.test(text) || /close|关闭/i.test(text))
        && rect.width <= 64
        && rect.height <= 64;
    });

  return [...cancelOrClose, ...iconCloseButtons];
}

function hasPasskeyPrompt() {
  return findPasskeyPromptButtons().length > 0;
}

function getPayPalLoginPhase(emailInput, passwordInput) {
  const emailNextButton = findEmailNextButton();
  const passwordLoginButton = findPasswordLoginButton();
  if (emailInput && emailNextButton && isEnabledControl(emailNextButton) && (!passwordInput || !passwordLoginButton)) {
    return 'email';
  }
  if (emailInput && passwordInput) return 'login_combined';
  if (passwordInput) return 'password';
  if (emailInput) return 'email';
  return '';
}

function refillPayPalEmailInput(emailInput, email) {
  if (!emailInput) return;
  if (typeof emailInput.focus === 'function') {
    emailInput.focus();
  }
  fillInput(emailInput, '');
  fillInput(emailInput, email);
  if (typeof emailInput.blur === 'function') {
    emailInput.blur();
  }
}

async function submitPayPalLogin(payload = {}) {
  const delayOperation = typeof performPayPalOperationWithDelay === 'function'
    ? performPayPalOperationWithDelay
    : async (metadata, operation) => {
        const rootScope = typeof window !== 'undefined' ? window : globalThis;
        const gate = rootScope?.CodexOperationDelay?.performOperationWithDelay;
        return typeof gate === 'function' ? gate(metadata, operation) : operation();
      };
  await waitForDocumentComplete();

  const email = normalizeText(payload.email || '');
  const password = String(payload.password || '');
  if (!password) {
    throw new Error('PayPal 密码为空，请先在侧边栏配置。');
  }

  let passwordInput = findPasswordInput();
  const emailInput = findEmailInput();
  const emailNextButton = findEmailNextButton();

  if (emailInput && emailNextButton && isEnabledControl(emailNextButton) && (!passwordInput || !findPasswordLoginButton())) {
    await delayOperation({ stepKey: 'paypal-approve', kind: 'submit', label: 'paypal-email' }, async () => {
      refillPayPalEmailInput(emailInput, email);
      simulateClick(emailNextButton);
    });
    return {
      submitted: false,
      phase: 'email_submitted',
      awaiting: 'password_page',
    };
  }

  if (!passwordInput && emailInput && email) {
    await delayOperation({ stepKey: 'paypal-approve', kind: 'submit', label: 'paypal-email' }, async () => {
      refillPayPalEmailInput(emailInput, email);
      const nextButton = await waitUntil(() => {
        const button = findEmailNextButton() || findLoginNextButton();
        return button && isEnabledControl(button) ? button : null;
      }, {
        intervalMs: 250,
        timeoutMs: 8000,
        timeoutMessage: 'PayPal email page did not expose a clickable next/continue button.',
      });
      simulateClick(nextButton);
    });
    return {
      submitted: false,
      phase: 'email_submitted',
      awaiting: 'password_page',
    };
  } else if (!passwordInput && emailInput && !email) {
    throw new Error('PayPal 账号为空，请先在侧边栏配置。');
  } else if (emailInput && email) {
    await delayOperation({ stepKey: 'paypal-approve', kind: 'fill', label: 'paypal-email' }, async () => {
      refillPayPalEmailInput(emailInput, email);
    });
  }

  passwordInput = passwordInput || await waitUntil(() => findPasswordInput(), {
    intervalMs: 250,
    timeoutMs: 8000,
    timeoutMessage: 'PayPal password page did not expose a password input.',
  });
  await delayOperation({ stepKey: 'paypal-approve', kind: 'submit', label: 'paypal-password' }, async () => {
    fillInput(passwordInput, password);
    await sleep(1000);

    const loginButton = await waitUntil(() => {
      const button = findClickableByText([
        /login|log\s*in|sign\s*in|continue/i,
        /登录|登入|继续/i,
      ]);
      return button && isEnabledControl(button) ? button : null;
    }, {
      intervalMs: 250,
      timeoutMs: 8000,
      timeoutMessage: 'PayPal password page did not expose a clickable login/continue button.',
    });

    simulateClick(loginButton);
  });
  return {
    submitted: true,
    phase: 'password_submitted',
    awaiting: 'redirect_or_approval',
  };
}

async function dismissPayPalPrompts() {
  const delayOperation = typeof performPayPalOperationWithDelay === 'function'
    ? performPayPalOperationWithDelay
    : async (metadata, operation) => {
        const rootScope = typeof window !== 'undefined' ? window : globalThis;
        const gate = rootScope?.CodexOperationDelay?.performOperationWithDelay;
        return typeof gate === 'function' ? gate(metadata, operation) : operation();
      };
  await waitForDocumentComplete();
  const buttons = findPasskeyPromptButtons();
  let clicked = 0;
  for (const button of buttons) {
    if (!isVisibleElement(button) || !isEnabledControl(button)) {
      continue;
    }
    await delayOperation({ stepKey: 'paypal-approve', kind: 'click', label: 'paypal-dismiss-prompt' }, async () => {
      simulateClick(button);
    });
    clicked += 1;
    await sleep(500);
  }
  return {
    clicked,
    hasPromptAfterClick: hasPasskeyPrompt(),
  };
}

async function clickPayPalApprove() {
  const delayOperation = typeof performPayPalOperationWithDelay === 'function'
    ? performPayPalOperationWithDelay
    : async (metadata, operation) => {
        const rootScope = typeof window !== 'undefined' ? window : globalThis;
        const gate = rootScope?.CodexOperationDelay?.performOperationWithDelay;
        return typeof gate === 'function' ? gate(metadata, operation) : operation();
      };
  await waitForDocumentComplete();
  await dismissPayPalPrompts().catch(() => ({ clicked: 0 }));

  const button = findApproveButton();
  if (!button || !isEnabledControl(button)) {
    return {
      clicked: false,
      state: inspectPayPalState(),
    };
  }

  await delayOperation({ stepKey: 'paypal-approve', kind: 'click', label: 'paypal-approve' }, async () => {
    simulateClick(button);
  });
  return {
    clicked: true,
    buttonText: getActionText(button),
  };
}

function inspectPayPalState() {
  const emailInput = findEmailInput();
  const passwordInput = findPasswordInput();
  const approveButton = findApproveButton();
  const loginPhase = getPayPalLoginPhase(emailInput, passwordInput);
  return {
    url: location.href,
    readyState: document.readyState,
    needsLogin: Boolean(loginPhase),
    loginPhase,
    hasEmailInput: Boolean(emailInput),
    hasPasswordInput: Boolean(passwordInput),
    approveReady: Boolean(approveButton && isEnabledControl(approveButton)),
    approveButtonText: approveButton ? getActionText(approveButton) : '',
    hasPasskeyPrompt: hasPasskeyPrompt(),
    bodyTextPreview: normalizeText(document.body?.innerText || '').slice(0, 240),
  };
}
