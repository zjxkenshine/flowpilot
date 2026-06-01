// content/paypal-flow.js — PayPal login and approval helper.

console.log('[MultiPage:paypal-flow] Content script loaded on', location.href);

const PAYPAL_FLOW_LISTENER_SENTINEL = 'data-multipage-paypal-flow-listener';
const PAYPAL_FLOW_SCRIPT_VERSION = '2026-06-01-hosted-phone-error-pt-v1';
const PAYPAL_HOSTED_GET_STATE_MESSAGE_V2 = 'PAYPAL_HOSTED_GET_STATE_V2';
const PAYPAL_RUN_HOSTED_CHECKOUT_STEP_MESSAGE_V2 = 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP_V2';
const PAYPAL_HOSTED_DISMISS_PHONE_ERROR_MESSAGE_V2 = 'PAYPAL_HOSTED_DISMISS_PHONE_ERROR_V2';
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
const PAYPAL_HOSTED_EMAIL_TARGET_RECHECK_DELAY_MS = 1500;
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

if (document.documentElement.getAttribute(PAYPAL_FLOW_LISTENER_SENTINEL) !== PAYPAL_FLOW_SCRIPT_VERSION) {
  document.documentElement.setAttribute(PAYPAL_FLOW_LISTENER_SENTINEL, PAYPAL_FLOW_SCRIPT_VERSION);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message.type === 'PAYPAL_GET_STATE'
      || message.type === 'PAYPAL_SUBMIT_LOGIN'
      || message.type === 'PAYPAL_DISMISS_PROMPTS'
      || message.type === 'PAYPAL_CLICK_APPROVE'
      || message.type === 'PAYPAL_HOSTED_GET_STATE'
      || message.type === PAYPAL_HOSTED_GET_STATE_MESSAGE_V2
      || message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'
      || message.type === PAYPAL_RUN_HOSTED_CHECKOUT_STEP_MESSAGE_V2
      || message.type === 'PAYPAL_HOSTED_DISMISS_PHONE_ERROR'
      || message.type === PAYPAL_HOSTED_DISMISS_PHONE_ERROR_MESSAGE_V2
    ) {
      resetStopState();
      handlePayPalCommand(message).then((result) => {
        sendResponse({ ok: true, scriptVersion: PAYPAL_FLOW_SCRIPT_VERSION, ...(result || {}) });
      }).catch((err) => {
        if (isStopError(err)) {
          sendResponse({ scriptVersion: PAYPAL_FLOW_SCRIPT_VERSION, stopped: true, error: err.message });
          return;
        }
        sendResponse({ scriptVersion: PAYPAL_FLOW_SCRIPT_VERSION, error: err.message });
      });
      return true;
    }
  });
} else {
  console.log(`[MultiPage:paypal-flow] 消息监听已存在（${PAYPAL_FLOW_SCRIPT_VERSION}），跳过重复注册`);
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
    case PAYPAL_HOSTED_GET_STATE_MESSAGE_V2:
      return inspectPayPalHostedState(message.payload || {});
    case 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP':
    case PAYPAL_RUN_HOSTED_CHECKOUT_STEP_MESSAGE_V2:
      return runPayPalHostedCheckoutStep(message.payload || {});
    case 'PAYPAL_HOSTED_DISMISS_PHONE_ERROR':
    case PAYPAL_HOSTED_DISMISS_PHONE_ERROR_MESSAGE_V2:
      return dismissHostedGuestPhoneError(message.payload || {});
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

function getElementLabelText(el = null) {
  if (!el || el.nodeType !== 1) {
    return '';
  }
  const parts = [
    getActionText(el),
    el.getAttribute?.('data-testid'),
    el.getAttribute?.('autocomplete'),
    el.getAttribute?.('inputmode'),
  ];
  const id = String(el.id || '').trim();
  if (id) {
    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(id)
      : id.replace(/["\\]/g, '\\$&');
    const directLabel = document.querySelector?.(`label[for="${escapedId}"]`);
    if (directLabel) {
      parts.push(directLabel.textContent, directLabel.getAttribute?.('aria-label'));
    }
  }
  let node = el.parentElement;
  let depth = 0;
  while (node && node.nodeType === 1 && node !== document.body && depth < 4) {
    if (/label/i.test(String(node.tagName || ''))) {
      parts.push(node.textContent, node.getAttribute?.('aria-label'));
    } else {
      parts.push(node.getAttribute?.('aria-label'), node.getAttribute?.('title'));
      const label = node.querySelector?.('label');
      if (label) {
        parts.push(label.textContent, label.getAttribute?.('aria-label'));
      }
    }
    node = node.parentElement;
    depth += 1;
  }
  return normalizeText(parts.filter(Boolean).join(' '));
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

function isReadOnlyControl(el = null) {
  if (!el || el.nodeType !== 1) {
    return false;
  }
  const ariaReadOnly = String(el.getAttribute?.('aria-readonly') || '').trim().toLowerCase();
  return el.readOnly === true
    || el.getAttribute?.('readonly') !== null
    || ariaReadOnly === 'true';
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
    if (!input || isReadOnlyControl(input) || isPasswordCandidate(input)) {
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
        && !isReadOnlyControl(input)
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

function hasReadOnlyFieldStructureSignal(node = null) {
  if (!node || node.nodeType !== 1) {
    return false;
  }
  if (isReadOnlyControl(node)) {
    return true;
  }
  const signalText = normalizeText([
    node.id,
    node.className,
    node.getAttribute?.('class'),
    node.getAttribute?.('data-testid'),
    node.getAttribute?.('data-test-id'),
    node.getAttribute?.('data-automation-id'),
    node.getAttribute?.('role'),
    node.getAttribute?.('aria-readonly'),
  ].filter(Boolean).join(' '));
  return /ReadOnlyFormField|read\s*only|read[-_]?only|readonly/i.test(signalText);
}

function getReadOnlyEmailLabel(node = null) {
  if (!node || node.nodeType !== 1) {
    return '';
  }
  const type = String(node.getAttribute?.('type') || node.type || '').trim().toLowerCase();
  if (type === 'email') {
    return 'email';
  }
  const text = normalizeText([
    node.textContent,
    node.innerText,
    node.getAttribute?.('aria-label'),
    node.getAttribute?.('title'),
    node.getAttribute?.('placeholder'),
    node.getAttribute?.('name'),
    node.id,
  ].filter(Boolean).join(' '));
  const match = text.match(/email\s*address|e-?mail|电子邮箱|电子邮件|邮件地址|邮箱/i);
  return match ? match[0] : '';
}

function getElementDiagnosticText(node = null) {
  if (!node || node.nodeType !== 1) {
    return '';
  }
  return normalizeText([
    node.tagName ? String(node.tagName).toLowerCase() : '',
    node.id ? `#${node.id}` : '',
    node.className ? `.${String(node.className).replace(/\s+/g, '.')}` : '',
    node.getAttribute?.('class') && !node.className ? `class=${node.getAttribute('class')}` : '',
    node.getAttribute?.('name') ? `name=${node.getAttribute('name')}` : '',
    node.getAttribute?.('type') ? `type=${node.getAttribute('type')}` : '',
    node.getAttribute?.('autocomplete') ? `autocomplete=${node.getAttribute('autocomplete')}` : '',
    node.getAttribute?.('data-testid') ? `testid=${node.getAttribute('data-testid')}` : '',
    node.getAttribute?.('aria-label') ? `aria=${node.getAttribute('aria-label')}` : '',
    node.getAttribute?.('placeholder') ? `placeholder=${node.getAttribute('placeholder')}` : '',
    node.textContent ? `text=${normalizeText(node.textContent).slice(0, 80)}` : '',
  ].filter(Boolean).join(' '));
}

function findReadOnlyEmailField() {
  let candidates = [];
  try {
    candidates = Array.from(document.querySelectorAll('*') || []);
  } catch {
    candidates = [];
  }
  return candidates.find((node) => (
    node
    && hasReadOnlyFieldStructureSignal(node)
    && getReadOnlyEmailLabel(node)
    && isVisibleElement(node)
  )) || null;
}

function getPayPalHostedEmailDiagnostics() {
  const readOnlyEmailField = findReadOnlyEmailField();
  const emailInput = findEmailInput();
  const nextButton = findHostedEmailNextButton();
  const visibleInputs = getVisibleControls('input')
    .slice(0, 8)
    .map(getElementDiagnosticText)
    .filter(Boolean);
  const visibleButtons = getVisibleControls('button, a, [role="button"], input[type="button"], input[type="submit"]')
    .slice(0, 8)
    .map(getElementDiagnosticText)
    .filter(Boolean);
  return {
    scriptVersion: PAYPAL_FLOW_SCRIPT_VERSION,
    url: location.href,
    hostedStage: detectPayPalHostedStage({ securityChallengeEnabled: false }),
    hasHostedEmailInput: Boolean(document.getElementById('email') || emailInput || readOnlyEmailField),
    emailInputDetected: Boolean(emailInput),
    emailInputSummary: getElementDiagnosticText(emailInput),
    readOnlyEmailDetected: Boolean(readOnlyEmailField),
    readOnlyEmailLabel: getReadOnlyEmailLabel(readOnlyEmailField),
    readOnlyEmailSummary: getElementDiagnosticText(readOnlyEmailField),
    hostedEmailNextButtonDetected: Boolean(nextButton && isVisibleElement(nextButton) && isEnabledControl(nextButton)),
    hostedEmailNextButtonSummary: getElementDiagnosticText(nextButton),
    visibleInputSummaries: visibleInputs,
    visibleButtonSummaries: visibleButtons,
    bodyTextPreview: normalizeText(document.body?.innerText || document.body?.textContent || '').slice(0, 500),
  };
}

function buildHostedEmailTargetMissingError(diagnostics = {}) {
  const parts = [
    'PayPal hosted checkout 未找到邮箱输入框或只读邮箱字段。',
    `URL: ${diagnostics.url || location.href || ''}`,
    `stage: ${diagnostics.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}`,
    `scriptVersion: ${diagnostics.scriptVersion || PAYPAL_FLOW_SCRIPT_VERSION}`,
    `readOnlyEmailDetected: ${diagnostics.readOnlyEmailDetected ? 'true' : 'false'}`,
    diagnostics.readOnlyEmailLabel ? `readOnlyEmailLabel: ${diagnostics.readOnlyEmailLabel}` : '',
    diagnostics.readOnlyEmailSummary ? `readOnlyEmailSummary: ${diagnostics.readOnlyEmailSummary}` : '',
    diagnostics.emailInputSummary ? `emailInputSummary: ${diagnostics.emailInputSummary}` : '',
    diagnostics.hostedEmailNextButtonSummary ? `nextButtonSummary: ${diagnostics.hostedEmailNextButtonSummary}` : '',
    diagnostics.visibleInputSummaries?.length ? `visibleInputs: ${diagnostics.visibleInputSummaries.join(' | ')}` : '',
    diagnostics.visibleButtonSummaries?.length ? `visibleButtons: ${diagnostics.visibleButtonSummaries.join(' | ')}` : '',
    diagnostics.bodyTextPreview ? `body: ${diagnostics.bodyTextPreview}` : '',
  ].filter(Boolean);
  return new Error(parts.join(' '));
}

function findHostedEmailTarget() {
  const candidate = findEmailInput();
  if (candidate && isVisibleElement(candidate) && isEnabledControl(candidate)) {
    return {
      emailInput: candidate,
      readOnlyEmailField: null,
    };
  }
  const readOnlyEmailField = findReadOnlyEmailField();
  const nextButton = findHostedEmailNextButton();
  if (readOnlyEmailField && nextButton && isVisibleElement(nextButton) && isEnabledControl(nextButton)) {
    return {
      emailInput: null,
      readOnlyEmailField,
    };
  }
  return null;
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

function findHostedEmailNextButton() {
  return findEmailNextButton() || findClickableByText([
    /continue/i,
    /继续/i,
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
  return getPayPalPathname() === '/pay'
    || Boolean(document.getElementById('email'))
    || Boolean(findReadOnlyEmailField() && findHostedEmailNextButton());
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
    /We['\u2019]?re\s+unable\s+to\s+complete\s+your\s+request\.?\s*Try\s+a\s+different\s+phone\s+number\.?|Try\s+a\s+different\s+phone\s+number\.?|N[aã]o\s+foi\s+poss[ií]vel\s+concluir\s+sua\s+solicita[cç][aã]o\.?\s*Tente\s+outro\s+n[uú]mero\s+de\s+telefone\.?|Tente\s+outro\s+n[uú]mero\s+de\s+telefone\.?|请尝试其他手机号|请更换手机号/i
  );
  return match ? match[0] : '';
}

function hasPayPalHostedGuestPhoneError() {
  return Boolean(getPayPalHostedGuestPhoneErrorMessage());
}

function findHostedGuestPhoneErrorOkButton() {
  const direct = document.querySelector('button[data-testid="primary-button-exceed"]');
  if (direct && isVisibleElement(direct) && isEnabledControl(direct)) {
    return direct;
  }
  const fallback = findClickableByText([
    /^ok$/i,
  ]);
  return fallback && isEnabledControl(fallback) ? fallback : null;
}

async function dismissHostedGuestPhoneError(payload = {}) {
  await waitForDocumentComplete();
  const message = getPayPalHostedGuestPhoneErrorMessage();
  if (!message) {
    return {
      hostedGuestPhoneError: false,
      hostedGuestPhoneErrorMessage: '',
      phoneErrorDismissed: false,
      okButtonFound: false,
    };
  }
  const delayMs = Math.max(0, Math.floor(Number(
    payload.dismissPhoneErrorDelayMs ?? payload.delayMs ?? 0
  ) || 0));
  if (delayMs > 0) {
    await sleep(delayMs);
  }
  const button = findHostedGuestPhoneErrorOkButton();
  if (!button) {
    return {
      hostedGuestPhoneError: true,
      hostedGuestPhoneErrorMessage: message,
      phoneErrorDismissed: false,
      okButtonFound: false,
    };
  }
  const buttonText = getActionText(button);
  await performPayPalOperationWithDelay({
    stepKey: getHostedStepKey(PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT),
    kind: 'click',
    label: 'hosted-paypal-phone-error-ok',
  }, async () => {
    simulateClick(button);
  });
  return {
    hostedGuestPhoneError: true,
    hostedGuestPhoneErrorMessage: message,
    phoneErrorDismissed: true,
    okButtonFound: true,
    okButtonText: buttonText,
  };
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

function getVisibleHostedInputs() {
  return getVisibleControls('input, textarea')
    .filter((input) => {
      const type = String(input.getAttribute?.('type') || input.type || '').trim().toLowerCase();
      return isEnabledControl(input)
        && !['hidden', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(type);
    });
}

function findHostedInputByText(patterns = [], options = {}) {
  const normalizedPatterns = (Array.isArray(patterns) ? patterns : [patterns]).filter(Boolean);
  if (!normalizedPatterns.length) {
    return null;
  }
  const exclude = typeof options.exclude === 'function' ? options.exclude : () => false;
  return getVisibleHostedInputs().find((input) => {
    if (exclude(input)) return false;
    const text = getElementLabelText(input);
    return normalizedPatterns.some((pattern) => pattern.test(text));
  }) || null;
}

function fillHostedInputByText(patterns = [], value = '', options = {}) {
  const input = findHostedInputByText(patterns, options);
  if (!input) {
    return {
      found: false,
      filled: false,
      descriptor: '',
    };
  }
  fillInput(input, String(value || ''));
  return {
    found: true,
    filled: true,
    descriptor: getHostedInputDescriptor(input),
  };
}

function getVisibleHostedSelects() {
  return getVisibleControls('select').filter(isEnabledControl);
}

function selectHostedOption(select = null, optionPatterns = []) {
  const normalizedPatterns = (Array.isArray(optionPatterns) ? optionPatterns : [optionPatterns]).filter(Boolean);
  if (!select || !normalizedPatterns.length) {
    return false;
  }
  const option = Array.from(select.options || []).find((item) => {
    const text = normalizeText([
      item.textContent,
      item.label,
      item.value,
    ].filter(Boolean).join(' '));
    return normalizedPatterns.some((pattern) => pattern.test(text));
  });
  if (!option) {
    return false;
  }
  select.value = option.value;
  option.selected = true;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function selectHostedOptionByText(selectPatterns = [], optionPatterns = []) {
  const normalizedSelectPatterns = (Array.isArray(selectPatterns) ? selectPatterns : [selectPatterns]).filter(Boolean);
  const select = getVisibleHostedSelects().find((candidate) => {
    const text = getElementLabelText(candidate);
    return normalizedSelectPatterns.some((pattern) => pattern.test(text));
  }) || null;
  return {
    found: Boolean(select),
    selected: selectHostedOption(select, optionPatterns),
  };
}

function getHostedRadioOrCheckboxText(el = null) {
  return getElementLabelText(el);
}

function clickHostedChoiceByText(patterns = [], options = {}) {
  const normalizedPatterns = (Array.isArray(patterns) ? patterns : [patterns]).filter(Boolean);
  const controls = getVisibleControls('input[type="radio"], input[type="checkbox"], [role="radio"], [role="checkbox"], label, button, [role="button"]')
    .filter((el) => isEnabledControl(el));
  const target = controls.find((el) => {
    const text = getHostedRadioOrCheckboxText(el);
    return normalizedPatterns.some((pattern) => pattern.test(text));
  }) || null;
  if (!target) {
    return {
      found: false,
      clicked: false,
      checked: false,
      descriptor: '',
    };
  }
  const alreadyChecked = target.checked === true || target.getAttribute?.('aria-checked') === 'true';
  if (!alreadyChecked || options.force === true) {
    simulateClick(target);
    if ('checked' in target && /checkbox|radio/i.test(String(target.type || ''))) {
      target.checked = true;
    }
  }
  return {
    found: true,
    clicked: !alreadyChecked || options.force === true,
    checked: target.checked === true || target.getAttribute?.('aria-checked') === 'true' || alreadyChecked,
    descriptor: getHostedInputDescriptor(target),
  };
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

function normalizeHostedCountryCode(value = '') {
  const raw = normalizeText(value || '');
  const normalized = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (['US', 'JP', 'BR'].includes(normalized)) {
    return normalized;
  }
  const lower = raw.toLowerCase();
  if (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower)) return 'US';
  if (/\b(?:jp|jpn|japan)\b|日本/.test(lower)) return 'JP';
  if (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower)) return 'BR';
  return '';
}

function matchesHostedCountryOption(optionText = '', optionValue = '', countryCode = 'US') {
  const normalizedCountryCode = normalizeHostedCountryCode(countryCode) || 'US';
  const text = normalizeText(optionText || '').toLowerCase();
  const value = normalizeText(optionValue || '').toLowerCase();
  const aliases = {
    US: ['us', 'usa', 'united states', 'united states of america', 'america'],
    JP: ['jp', 'jpn', 'japan', '日本'],
    BR: ['br', 'bra', 'brazil', 'brasil', '巴西'],
  }[normalizedCountryCode] || [];
  return value === normalizedCountryCode.toLowerCase()
    || aliases.some((alias) => value === alias || text === alias || text.includes(alias));
}

function fillHostedAddressFields(address = {}) {
  const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
  const street = source.street || source.address1 || source.line1 || source.billingLine1 || '';
  const city = source.city || source.locality || source.billingCity || '';
  const zip = source.zip || source.postalCode || source.postcode || source.billingPostalCode || '';
  const state = source.state || source.region || source.administrativeArea || source.billingState || '';
  const countryCode = normalizeHostedCountryCode(source.countryCode || source.country || '') || '';
  if (countryCode === 'BR') {
    const brazilResult = fillHostedBrazilAddressFields(source);
    if (brazilResult.filledAny) {
      return brazilResult;
    }
  }
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

function getHostedBrazilAddressValues(address = {}) {
  const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
  const street = normalizeText(source.streetName || source.streetLine || source.addressLine || source.address1 || source.street || '');
  const streetName = normalizeText(source.streetName || source.streetLine || '');
  const number = normalizeText(source.number || source.streetNumber || '');
  let parsedStreetName = streetName;
  let parsedNumber = number;
  if (!parsedStreetName || !parsedNumber) {
    const match = street.match(/^(.+?)\s+([A-Za-z0-9-]+)\s*$/);
    if (match && /\d/.test(match[2])) {
      parsedStreetName = parsedStreetName || match[1].trim();
      parsedNumber = parsedNumber || match[2].trim();
    }
  }
  return {
    street: parsedStreetName || street,
    number: parsedNumber,
    neighborhood: normalizeText(source.neighborhood || source.bairro || source.district || ''),
    city: normalizeText(source.city || source.locality || source.billingCity || ''),
    state: normalizeText(source.stateCode || source.uf || source.state || source.region || source.administrativeArea || source.billingState || ''),
    zip: normalizeText(source.zip || source.postalCode || source.postcode || source.billingPostalCode || source.cep || ''),
  };
}

function fillHostedBrazilAddressFields(address = {}) {
  const values = getHostedBrazilAddressValues(address);
  const filled = {
    zip: fillHostedInputByText([/\bcep\b|postal|zip/i], values.zip).filled,
    street: fillHostedInputByText([/endere[cç]o|address|logradouro/i], values.street, {
      exclude: (input) => /cep|postal|zip|bairro|distrito|city|cidade|estado|state|(?:^|\s)n[ºo°](?:\s|$)|n[úu]mero|number/i.test(getElementLabelText(input)),
    }).filled,
    number: fillHostedInputByText([/(?:^|\s)n[ºo°](?:\s|$)|n[úu]mero|number|street\s*number/i], values.number, {
      exclude: (input) => /card|cart[aã]o|cvv|cvc|csc|security|phone|telefone|celular|cpf|cnpj|document/i.test(getElementLabelText(input)),
    }).filled,
    neighborhood: fillHostedInputByText([/distrito|bairro|neighbou?rhood|district/i], values.neighborhood).filled,
    city: fillHostedInputByText([/cidade|city|locality/i], values.city).filled,
    state: values.state
      ? selectHostedOptionByText([/estado|state|uf|region/i], [
        new RegExp(`^${values.state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        new RegExp(values.state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      ]).selected
      : false,
  };
  if (!filled.state) {
    filled.state = fillHostedInputByText([/estado|state|uf|region/i], values.state).filled;
  }
  return {
    attempted: Object.values(values).some(Boolean),
    filledAny: Object.values(filled).some(Boolean),
    ...filled,
  };
}

function getHostedDocumentValue(payload = {}, address = {}) {
  const source = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  const addressSource = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
  return normalizeText(
    source.documentNumber
    || addressSource.documentNumber
    || source.cpf
    || addressSource.cpf
    || source.documentDigits
    || addressSource.documentDigits
    || source.cpfDigits
    || addressSource.cpfDigits
    || ''
  );
}

function isHostedDocumentInputCandidate(input = null) {
  if (!input || !isVisibleElement(input) || !isEnabledControl(input)) {
    return false;
  }
  const type = String(input.getAttribute?.('type') || input.type || '').trim().toLowerCase();
  if (['hidden', 'checkbox', 'radio', 'submit', 'button', 'file', 'password', 'email'].includes(type)) {
    return false;
  }
  const text = normalizeText([
    getActionText(input),
    input.getAttribute?.('data-testid'),
    input.getAttribute?.('autocomplete'),
    input.getAttribute?.('inputmode'),
    input.getAttribute?.('aria-labelledby'),
  ].filter(Boolean).join(' '));
  const positive = /\b(?:cpf|cnpj)\b|tax\s*(?:id|number|payer|document)|taxpayer|document(?:\s*(?:number|id))?|identity\s*(?:number|document)|national\s*id/i.test(text);
  if (!positive) {
    return false;
  }
  const negative = /card|cvv|cvc|security\s*code|expiry|expiration|postal|zip|postcode|address|street|city|state|province|region|phone|mobile|tel|email|password|name/i.test(text);
  return !negative || /\b(?:cpf|cnpj)\b/i.test(text);
}

function findHostedDocumentInput() {
  const candidates = [
    ...Array.from(document.querySelectorAll('input[id*="cpf" i], input[name*="cpf" i], input[placeholder*="cpf" i]') || []),
    ...Array.from(document.querySelectorAll('input[id*="cnpj" i], input[name*="cnpj" i], input[placeholder*="cnpj" i]') || []),
    ...Array.from(document.querySelectorAll('input[id*="tax" i], input[name*="tax" i], input[placeholder*="tax" i]') || []),
    ...Array.from(document.querySelectorAll('input[id*="document" i], input[name*="document" i], input[placeholder*="document" i]') || []),
    ...Array.from(document.querySelectorAll('input') || []),
  ].filter(Boolean);
  const seen = new Set();
  return candidates.find((input) => {
    if (seen.has(input)) return false;
    seen.add(input);
    return isHostedDocumentInputCandidate(input);
  }) || null;
}

function fillHostedDocumentIfPresent(payload = {}, address = {}) {
  const value = getHostedDocumentValue(payload, address);
  if (!value) {
    return {
      attempted: false,
      found: false,
      filled: false,
      descriptor: '',
    };
  }
  const input = findHostedDocumentInput();
  if (!input) {
    return {
      attempted: true,
      found: false,
      filled: false,
      descriptor: '',
    };
  }
  if (!String(input.value || '').trim()) {
    fillInput(input, value);
    return {
      attempted: true,
      found: true,
      filled: true,
      descriptor: getHostedInputDescriptor(input),
    };
  }
  return {
    attempted: true,
    found: true,
    filled: false,
    descriptor: getHostedInputDescriptor(input),
  };
}

function findHostedBrazilDocumentInput() {
  return findHostedDocumentInput();
}

function normalizeHostedBrazilBirthday(value = '') {
  const raw = normalizeText(value);
  const digits = raw.replace(/\D/g, '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${day}/${month}/${year}`;
  }
  if (/^\d{8}$/.test(digits)) {
    if (/^(19|20)\d{2}/.test(digits)) {
      return `${digits.slice(6, 8)}/${digits.slice(4, 6)}/${digits.slice(0, 4)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
  return raw;
}

function fillHostedBrazilBirthday(payload = {}) {
  const birthday = normalizeHostedBrazilBirthday(payload.birthday || '');
  if (!birthday) {
    return {
      attempted: false,
      found: false,
      filled: false,
    };
  }
  const result = fillHostedInputByText([
    /data\s+de\s+nascimento|nascimento|birth\s*date|birthday|date\s+of\s+birth/i,
  ], birthday);
  return {
    attempted: true,
    found: result.found,
    filled: result.filled,
    descriptor: result.descriptor,
  };
}

function fillHostedBrazilPhoneType() {
  return selectHostedOptionByText([/tipo\s+de\s+telefone|phone\s*type|telefone/i], [/celular|mobile|cell/i]);
}

function selectHostedBrazilCardType(payload = {}) {
  const requested = normalizeText(payload.cardType || 'credit').toLowerCase();
  const patterns = requested === 'debit' || requested === 'debito' || requested === 'débito'
    ? [/d[eé]bito|debit/i]
    : [/cr[eé]dito|credit/i];
  return clickHostedChoiceByText(patterns);
}

function getVisibleHostedCheckboxes() {
  return getVisibleControls('input[type="checkbox"], [role="checkbox"]').filter(isEnabledControl);
}

function checkHostedBrazilRequiredTerms() {
  const checkboxes = getVisibleHostedCheckboxes();
  let found = false;
  let checked = false;
  let skippedMarketing = false;
  for (const checkbox of checkboxes) {
    const text = getElementLabelText(checkbox);
    if (/promo[cç][oõ]es|ofertas|marketing|receber|alterar\s+essa\s+configura[cç][aã]o|promotions|offers/i.test(text)) {
      skippedMarketing = true;
      continue;
    }
    const isRequiredTerms = /contrato\s+do\s+usu[aá]rio|declara[cç][aã]o\s+de\s+privacidade|maior\s+de\s+idade|user\s+agreement|privacy\s+statement|terms/i.test(text);
    if (!isRequiredTerms) {
      continue;
    }
    found = true;
    if (checkbox.checked !== true && checkbox.getAttribute?.('aria-checked') !== 'true') {
      simulateClick(checkbox);
      if ('checked' in checkbox) {
        checkbox.checked = true;
      }
    }
    checked = checkbox.checked === true || checkbox.getAttribute?.('aria-checked') === 'true';
  }
  return {
    found,
    checked,
    skippedMarketing,
  };
}

function isHostedBrazilProfile(payload = {}, address = {}) {
  const countryCode = normalizeHostedCountryCode(
    address?.countryCode
    || address?.country
    || payload?.countryCode
    || payload?.generatedFromCountry
    || ''
  );
  if (countryCode === 'BR') {
    return true;
  }
  const pageText = normalizeText(document.body?.innerText || document.body?.textContent || '');
  return /\bCPF\b|\bCEP\b|Data\s+de\s+nascimento|Distrito\/Bairro|Pa[ií]s\s+Brasil/i.test(pageText);
}

function fillHostedBrazilGuestFields(payload = {}, address = {}, values = {}) {
  const phoneTypeResult = fillHostedBrazilPhoneType();
  const cardTypeResult = selectHostedBrazilCardType(payload);
  const firstNameResult = fillHostedInputByText([/(?:^|\s)nome(?:\s|$)|first\s*name|given\s*name/i], values.firstName || payload.firstName || '', {
    exclude: (input) => /sobrenome|last\s*name|family\s*name/i.test(getElementLabelText(input)),
  });
  const lastNameResult = fillHostedInputByText([/sobrenome|last\s*name|family\s*name/i], values.lastName || payload.lastName || '');
  const passwordResult = fillHostedInputByText([/criar\s+senha|senha|password/i], values.password || payload.password || '');
  const birthdayResult = fillHostedBrazilBirthday(payload);
  const addressResult = fillHostedBrazilAddressFields(address);
  const documentResult = fillHostedDocumentIfPresent(payload, address);
  const termsResult = checkHostedBrazilRequiredTerms();
  return {
    phoneTypeSelected: Boolean(phoneTypeResult.selected),
    phoneTypeFound: Boolean(phoneTypeResult.found),
    cardTypeFound: Boolean(cardTypeResult.found),
    cardTypeSelected: Boolean(cardTypeResult.found),
    firstNameFilled: Boolean(firstNameResult.filled),
    lastNameFilled: Boolean(lastNameResult.filled),
    passwordFilled: Boolean(passwordResult.filled),
    birthdayInputFound: Boolean(birthdayResult.found),
    birthdayFilled: Boolean(birthdayResult.filled),
    addressFillResult: addressResult,
    documentFillResult: documentResult,
    termsFound: Boolean(termsResult.found),
    termsChecked: Boolean(termsResult.checked),
    marketingTermsSkipped: Boolean(termsResult.skippedMarketing),
  };
}

function assertHostedBrazilRequiredFieldsBeforeSubmit(payload = {}, address = {}) {
  const missing = [];
  const documentInput = findHostedBrazilDocumentInput();
  if (documentInput && !normalizeText(documentInput.value || '')) {
    missing.push('CPF');
  }
  const addressChecks = [
    [[/endere[cç]o|address|logradouro/i], 'Endereço'],
    [[/(?:^|\s)n[ºo°](?:\s|$)|n[úu]mero|number|street\s*number/i], 'Nº'],
    [[/cidade|city|locality/i], 'Cidade'],
    [[/cep|postal|zip/i], 'CEP'],
  ];
  addressChecks.forEach(([patterns, label]) => {
    const input = findHostedInputByText(patterns, label === 'Nº'
      ? { exclude: (candidate) => /card|cart[aã]o|cvv|cvc|csc|security|phone|telefone|celular|cpf|cnpj|document/i.test(getElementLabelText(candidate)) }
      : {});
    if (input && !normalizeText(input.value || '')) {
      missing.push(label);
    }
  });
  const stateInput = findHostedInputByText([/estado|state|uf|region/i]);
  const stateSelect = getVisibleHostedSelects().find((select) => /estado|state|uf|region/i.test(getElementLabelText(select))) || null;
  if (stateInput && !normalizeText(stateInput.value || '')) {
    missing.push('Estado');
  }
  if (stateSelect && !normalizeText(stateSelect.value || '')) {
    missing.push('Estado');
  }
  const terms = getVisibleHostedCheckboxes().find((checkbox) => {
    const text = getElementLabelText(checkbox);
    return /contrato\s+do\s+usu[aá]rio|declara[cç][aã]o\s+de\s+privacidade|maior\s+de\s+idade|user\s+agreement|privacy\s+statement|terms/i.test(text)
      && !/promo[cç][oõ]es|ofertas|marketing|receber|promotions|offers/i.test(text);
  }) || null;
  if (terms && terms.checked !== true && terms.getAttribute?.('aria-checked') !== 'true') {
    missing.push('termos obrigatórios');
  }
  if (missing.length) {
    throw new Error(`PayPal hosted checkout Brazil required fields are empty before submit: ${Array.from(new Set(missing)).join(', ')}.`);
  }
  return {
    brazilRequiredFieldsReady: true,
  };
}

function selectHostedCountryById(id = 'country', countryCode = 'US') {
  const select = document.getElementById(String(id || '').trim());
  if (!select || !isVisibleElement(select)) {
    return { found: Boolean(select), selected: false };
  }
  const expectedCountryCode = normalizeHostedCountryCode(countryCode) || 'US';
  const currentOption = Array.from(select.options || []).find((item) => item.selected) || null;
  const currentText = normalizeText(currentOption?.textContent || currentOption?.label || select.value || '').toLowerCase();
  if (matchesHostedCountryOption(currentText, select.value, expectedCountryCode)) {
    return { found: true, selected: false, value: select.value };
  }
  if (!isEnabledControl(select)) {
    return { found: true, selected: false, missing: true, disabled: true };
  }
  const option = Array.from(select.options || []).find((item) => {
    const optionText = normalizeText(item.textContent || item.label || '');
    const optionValue = normalizeText(item.value || '');
    return matchesHostedCountryOption(optionText, optionValue, expectedCountryCode);
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
    const candidate = findHostedEmailNextButton();
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
  const waitTimeoutMs = Math.max(0, Math.floor(Number(payload.emailInputTimeoutMs) || 0));
  const startedAt = Date.now();
  let emailTarget = null;
  while (!emailTarget) {
    throwIfStopped();
    emailTarget = findHostedEmailTarget();
    if (emailTarget) {
      break;
    }
    if (waitTimeoutMs > 0 && Date.now() - startedAt >= waitTimeoutMs) {
      await sleep(PAYPAL_HOSTED_EMAIL_TARGET_RECHECK_DELAY_MS);
      emailTarget = findHostedEmailTarget();
      if (emailTarget) {
        break;
      }
      throw buildHostedEmailTargetMissingError(getPayPalHostedEmailDiagnostics());
    }
    await sleep(500);
  }
  if (emailTarget.emailInput && inputStableWaitMs > 0) {
    await sleep(inputStableWaitMs);
  }
  const readOnlyEmailLabel = getReadOnlyEmailLabel(emailTarget.readOnlyEmailField);
  if (emailTarget.emailInput) {
    refillPayPalEmailInput(emailTarget.emailInput, email);
  }
  const clickResult = await clickHostedEmailNextButton();
  return {
    stage: PAYPAL_HOSTED_STAGE_LOGIN,
    submitted: true,
    generatedEmail: email,
    clicked: Boolean(clickResult.clicked),
    emailInputStableWaitMs: inputStableWaitMs,
    emailSkipped: Boolean(emailTarget.readOnlyEmailField),
    readOnlyEmailDetected: Boolean(emailTarget.readOnlyEmailField),
    readOnlyEmailLabel,
  };
}

async function fillHostedGuestCheckout(payload = {}) {
  await waitForDocumentComplete();
  const address = payload.address && typeof payload.address === 'object' ? payload.address : {};
  const countryCode = normalizeHostedCountryCode(address.countryCode || payload.countryCode || payload.generatedFromCountry || 'US') || 'US';
  const isBrazil = isHostedBrazilProfile(payload, address);
  const countryResult = selectHostedCountryById('country', countryCode);
  if (countryResult.missing) {
    throw new Error(`PayPal hosted checkout country dropdown does not contain ${countryCode}.`);
  }
  if (countryResult.selected) {
    await sleep(1000);
  }
  if (payload.addressOnly === true) {
    const addressFillResult = fillHostedAddressFields(address);
    const documentFillResult = fillHostedDocumentIfPresent(payload, address);
    const brazilTermsResult = isBrazil ? checkHostedBrazilRequiredTerms() : null;
    const addressSuggestionResult = payload.useAddressSuggestionFallback === true
      ? await selectHostedAddressSuggestionFallback()
      : {
        addressSuggestionFallbackAttempted: false,
        addressSuggestionSelected: false,
        addressSuggestionSelectedText: '',
        addressSuggestionError: '',
      };
    const brazilRequiredResult = isBrazil ? assertHostedBrazilRequiredFieldsBeforeSubmit(payload, address) : null;
    const clickResult = await clickHostedSubmitButton({
      stage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
      label: 'hosted-paypal-address-submit',
      maxAttempts: 4,
    });
    return {
      stage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
      submitted: true,
      addressOnly: true,
      addressRefilled: Boolean(addressFillResult?.filledAny),
      addressFillResult,
      hostedDocumentInputFound: Boolean(documentFillResult?.found),
      hostedDocumentFilled: Boolean(documentFillResult?.filled),
      brazilTermsFound: Boolean(brazilTermsResult?.found),
      brazilTermsChecked: Boolean(brazilTermsResult?.checked),
      ...(brazilRequiredResult || {}),
      clicked: Boolean(clickResult?.clicked),
      ...addressSuggestionResult,
    };
  }
  const generatedCard = buildHostedVisaCard();
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
  let documentFillResult = null;
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
    const nextDocumentFillResult = fillHostedDocumentIfPresent(payload, address);
    if (
      !documentFillResult
      || nextDocumentFillResult.filled
      || (!documentFillResult.found && nextDocumentFillResult.found)
    ) {
      documentFillResult = nextDocumentFillResult;
    }
    return phoneFill;
  };
  let brazilFillResult = null;
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
    if (isBrazil) {
      brazilFillResult = fillHostedBrazilGuestFields(payload, address, values);
    }
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
  const brazilRequiredResult = isBrazil ? assertHostedBrazilRequiredFieldsBeforeSubmit(payload, address) : null;
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
    hostedDocumentInputFound: Boolean(documentFillResult?.found),
    hostedDocumentFilled: Boolean(documentFillResult?.filled),
    ...(isBrazil ? {
      brazilPhoneTypeSelected: Boolean(brazilFillResult?.phoneTypeSelected),
      brazilCardTypeSelected: Boolean(brazilFillResult?.cardTypeSelected),
      brazilBirthdayInputFound: Boolean(brazilFillResult?.birthdayInputFound),
      brazilBirthdayFilled: Boolean(brazilFillResult?.birthdayFilled),
      brazilTermsFound: Boolean(brazilFillResult?.termsFound),
      brazilTermsChecked: Boolean(brazilFillResult?.termsChecked),
      brazilMarketingTermsSkipped: Boolean(brazilFillResult?.marketingTermsSkipped),
      brazilAddressFillResult: brazilFillResult?.addressFillResult || null,
      ...(brazilRequiredResult || {}),
    } : {}),
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
  const emailDiagnostics = getPayPalHostedEmailDiagnostics();
  const securityChallengeProbe = payload?.securityChallengeEnabled === true
    ? probePayPalHostedSecurityChallengeOverlay()
    : buildPayPalHostedSecurityChallengeProbeDefaults();
  return {
    scriptVersion: PAYPAL_FLOW_SCRIPT_VERSION,
    url: location.href,
    readyState: document.readyState,
    hostedStage: stage,
    hasGuestCardFields: Boolean(document.getElementById('cardNumber')),
    hasHostedEmailInput: emailDiagnostics.hasHostedEmailInput,
    emailInputDetected: emailDiagnostics.emailInputDetected,
    emailInputSummary: emailDiagnostics.emailInputSummary,
    readOnlyEmailDetected: emailDiagnostics.readOnlyEmailDetected,
    readOnlyEmailLabel: emailDiagnostics.readOnlyEmailLabel,
    readOnlyEmailSummary: emailDiagnostics.readOnlyEmailSummary,
    hostedEmailNextButtonDetected: emailDiagnostics.hostedEmailNextButtonDetected,
    hostedEmailNextButtonSummary: emailDiagnostics.hostedEmailNextButtonSummary,
    visibleInputSummaries: emailDiagnostics.visibleInputSummaries,
    visibleButtonSummaries: emailDiagnostics.visibleButtonSummaries,
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
    bodyTextPreview: emailDiagnostics.bodyTextPreview,
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
