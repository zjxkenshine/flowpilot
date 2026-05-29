// content/plus-checkout.js — ChatGPT Plus checkout helper.

(function attachPlusCheckoutContentScript() {
console.log('[MultiPage:plus-checkout] Content script loaded on', location.href);
window.__MULTIPAGE_PLUS_CHECKOUT_READY__ = true;

const PLUS_CHECKOUT_LISTENER_SENTINEL = 'data-multipage-plus-checkout-listener';
const PLUS_CHECKOUT_PAYLOAD_BASE = {
  entry_point: 'all_plans_pricing_modal',
  plan_name: 'chatgptplusplan',
  checkout_ui_mode: 'custom',
  promo_campaign: {
    promo_campaign_id: 'plus-1-month-free',
    is_coupon_from_query_param: false,
  },
};
const PLUS_CHECKOUT_CONFIGS = {
  paypal: {
    billing_details: {
      country: 'US',
      currency: 'USD',
    },
    checkoutUrlPrefix: 'https://chatgpt.com/checkout/openai_ie/',
    paymentLabel: 'PayPal',
  },
  gopay: {
    billing_details: {
      country: 'ID',
      currency: 'IDR',
    },
    checkoutUrlPrefix: 'https://chatgpt.com/checkout/openai_llc/',
    paymentLabel: 'GoPay',
  }
};
const PAYPAL_DIAGNOSTIC_LOG_INTERVAL_MS = 5000;
const HOSTED_CHECKOUT_CARD_FALLBACK_ERROR_PREFIX = 'HOSTED_CHECKOUT_CARD_FALLBACK::';
const HOSTED_CHECKOUT_CARD_DECLINED_ERROR_PREFIX = 'HOSTED_CHECKOUT_CARD_DECLINED::';
const HOSTED_CHECKOUT_SUCCESS_URL_PATTERN = /^https:\/\/(?:chatgpt\.com|www\.chatgpt\.com|chat\.openai\.com)\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i;
const HOSTED_SUBMIT_RETRY_MAX_RETRIES = 3;
const HOSTED_SUBMIT_RETRY_CONFIRM_WAIT_MS = 10000;
const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
const PAYMENT_METHOD_CONFIGS = {
  [PLUS_PAYMENT_METHOD_PAYPAL]: {
    id: PLUS_PAYMENT_METHOD_PAYPAL,
    label: 'PayPal',
    diagnosticLabel: 'PayPal',
    checkoutMerchantPath: 'openai_ie',
    billingDetails: {
      country: 'US',
      currency: 'USD',
    },
    patterns: [/paypal/i],
  },
  [PLUS_PAYMENT_METHOD_PAYPAL_HOSTED]: {
    id: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
    label: 'PayPal 无卡直绑',
    diagnosticLabel: 'PayPal hosted',
    checkoutMerchantPath: 'openai_llc',
    billingDetails: {
      country: 'US',
      currency: 'USD',
    },
    patterns: [/paypal/i],
  },
  [PLUS_PAYMENT_METHOD_GOPAY]: {
    id: PLUS_PAYMENT_METHOD_GOPAY,
    label: 'GoPay',
    diagnosticLabel: 'GoPay',
    checkoutMerchantPath: 'openai_llc',
    billingDetails: {
      country: 'ID',
      currency: 'IDR',
    },
    patterns: [/gopay|go\s*pay/i],
  },
};
const PLUS_CHECKOUT_REGIONAL_BILLING_DETAILS = {
  US: { country: 'US', currency: 'USD' },
  JP: { country: 'JP', currency: 'JPY' },
  BR: { country: 'BR', currency: 'BRL' },
};

async function performOperationWithDelay(metadata, operation) {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  const gate = rootScope?.CodexOperationDelay?.performOperationWithDelay;
  return typeof gate === 'function' ? gate(metadata, operation) : operation();
}

if (document.documentElement.getAttribute(PLUS_CHECKOUT_LISTENER_SENTINEL) !== '1') {
  document.documentElement.setAttribute(PLUS_CHECKOUT_LISTENER_SENTINEL, '1');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message.type === 'CREATE_PLUS_CHECKOUT'
      || message.type === 'FILL_PLUS_BILLING_AND_SUBMIT'
      || message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL'
      || message.type === 'PLUS_CHECKOUT_SELECT_GOPAY'
      || message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS'
      || message.type === 'PLUS_CHECKOUT_FILL_ADDRESS_QUERY'
      || message.type === 'PLUS_CHECKOUT_SELECT_ADDRESS_SUGGESTION'
      || message.type === 'PLUS_CHECKOUT_ENSURE_BILLING_ADDRESS'
      || message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE'
      || message.type === 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE'
      || message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP'
      || message.type === 'PLUS_CHECKOUT_GET_STATE'
    ) {
      resetStopState();
      handlePlusCheckoutCommand(message).then((result) => {
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
  console.log('[MultiPage:plus-checkout] 消息监听已存在，跳过重复注册');
}

async function handlePlusCheckoutCommand(message) {
  switch (message.type) {
    case 'CREATE_PLUS_CHECKOUT':
      return createPlusCheckoutSession(message.payload || {});
    case 'FILL_PLUS_BILLING_AND_SUBMIT':
      return fillPlusBillingAndSubmit(message.payload || {});
    case 'PLUS_CHECKOUT_SELECT_PAYPAL':
      return selectPlusPayPalPaymentMethod(message.payload || {});
    case 'PLUS_CHECKOUT_SELECT_GOPAY':
      return selectPlusGoPayPaymentMethod(message.payload || {});
    case 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS':
      return fillPlusBillingAddress(message.payload || {});
    case 'PLUS_CHECKOUT_FILL_ADDRESS_QUERY':
      return fillPlusAddressQuery(message.payload || {});
    case 'PLUS_CHECKOUT_SELECT_ADDRESS_SUGGESTION':
      return selectPlusAddressSuggestion(message.payload || {});
    case 'PLUS_CHECKOUT_ENSURE_BILLING_ADDRESS':
      return ensurePlusStructuredBillingAddress(message.payload || {});
    case 'PLUS_CHECKOUT_CLICK_SUBSCRIBE':
      return clickPlusSubscribe(message.payload || {});
    case 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE':
      return retryAddressTaxAutocomplete(message.payload || {});
    case 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP':
      return runPayPalHostedOpenAiCheckoutStep(message.payload || {});
    case 'PLUS_CHECKOUT_GET_STATE':
      return inspectPlusCheckoutState(message.payload || {});
    default:
      throw new Error(`plus-checkout.js 不处理消息：${message.type}`);
  }
}

async function waitUntil(predicate, options = {}) {
  const intervalMs = Math.max(50, Math.floor(Number(options.intervalMs) || 250));
  const label = String(options.label || '条件').trim() || '条件';
  const timeoutMs = Math.max(0, Math.floor(Number(options.timeoutMs) || 0));
  const startedAt = Date.now();
  while (true) {
    throwIfStopped();
    const value = await predicate();
    if (value) {
      return value;
    }
    if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
      throw new Error(`${label}等待超时`);
    }
    await sleep(intervalMs);
  }
}

async function waitForDocumentComplete() {
  await waitUntil(() => document.readyState === 'complete', {
    label: '页面加载完成',
    intervalMs: 200,
  });
  await sleep(1000);
}

function isPayPalHostedOpenAiCheckoutPage() {
  const host = String(location?.host || '').toLowerCase();
  return host.includes('pay.openai.com') || host.includes('checkout.stripe.com');
}

function isPayPalUrl(url = '') {
  return /paypal\./i.test(String(url || ''));
}

function isHostedCheckoutSuccessUrl(url = '') {
  return HOSTED_CHECKOUT_SUCCESS_URL_PATTERN.test(String(url || ''));
}

function isChatGptHomeUrl(url = '') {
  let parsed = null;
  try {
    parsed = new URL(String(url || location?.href || ''), location?.href || 'https://chatgpt.com/');
  } catch {
    return false;
  }
  const hostname = String(parsed.hostname || '').toLowerCase();
  if (!['chatgpt.com', 'www.chatgpt.com', 'chat.openai.com'].includes(hostname)) {
    return false;
  }
  const pathname = String(parsed.pathname || '/').replace(/\/+$/g, '') || '/';
  return pathname === '/';
}

function hideHostedAddressAutocomplete() {
  [
    '.AddressAutocomplete-results',
    '[class*="AddressAutocomplete"]',
    '#billing-address-autocomplete-results',
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      try {
        node.style.setProperty('display', 'none', 'important');
        node.style.setProperty('visibility', 'hidden', 'important');
        node.style.setProperty('pointer-events', 'none', 'important');
      } catch {
        // Best effort only; checkout still works without this cleanup.
      }
    });
  });
}

function hasHostedOpenAiVerificationDialog() {
  return Boolean(document.getElementById('ci-ciBasic-0'));
}

function fillHostedInput(selector, value) {
  const input = document.querySelector(selector);
  if (!input) {
    return false;
  }
  fillInput(input, String(value || ''));
  return true;
}

function getHostedAddressFieldValues() {
  const regionSelect = document.querySelector('#billingAdministrativeArea');
  return {
    address1: document.querySelector('#billingAddressLine1')?.value || '',
    city: document.querySelector('#billingLocality')?.value || '',
    region: getHostedSelectValueText(regionSelect) || regionSelect?.value || '',
    postalCode: document.querySelector('#billingPostalCode')?.value || '',
  };
}

function hasHostedAttribute(el = null, name = '') {
  if (!el || !name) {
    return false;
  }
  if (typeof el.hasAttribute === 'function') {
    return el.hasAttribute(name);
  }
  const value = el.getAttribute?.(name);
  return value !== null && value !== undefined && value !== '';
}

function isHostedReadOnlyControl(el = null) {
  if (!el || el.nodeType !== 1) {
    return false;
  }
  const ariaReadOnly = String(el.getAttribute?.('aria-readonly') || '').trim().toLowerCase();
  return el.readOnly === true
    || hasHostedAttribute(el, 'readonly')
    || ariaReadOnly === 'true';
}

function getHostedElementDiagnosticText(node = null) {
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

function hasHostedReadOnlyFieldStructureSignal(node = null) {
  if (!node || node.nodeType !== 1) {
    return false;
  }
  if (isHostedReadOnlyControl(node)) {
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

function getHostedReadOnlyEmailLabel(node = null) {
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
    node.value,
    node.getAttribute?.('aria-label'),
    node.getAttribute?.('title'),
    node.getAttribute?.('placeholder'),
    node.getAttribute?.('name'),
    node.id,
  ].filter(Boolean).join(' '));
  const label = text.match(/email\s*address|e-?mail|\u7535\u5b50\u90ae\u4ef6|\u90ae\u4ef6\u5730\u5740|\u90ae\u7bb1|\u90ae\u4ef6|\u96fb\u5b50\u90f5\u4ef6|\u90f5\u4ef6\u5730\u5740|\u90f5\u7bb1|\u90f5\u4ef6/i);
  if (label) {
    return label[0];
  }
  const emailAddress = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailAddress ? emailAddress[0] : '';
}

function findHostedReadOnlyEmailField() {
  let candidates = [];
  try {
    candidates = Array.from(document.querySelectorAll('*') || []);
  } catch {
    candidates = [];
  }
  return candidates.find((node) => (
    node
    && hasHostedReadOnlyFieldStructureSignal(node)
    && getHostedReadOnlyEmailLabel(node)
    && isVisibleElement(node)
  )) || null;
}

function findHostedEditableEmailInput() {
  const directCandidates = [
    document.getElementById('email'),
    document.querySelector('input[type="email"]'),
    document.querySelector('input[name="email"]'),
  ];
  return directCandidates.find((candidate) => (
    candidate
    && isVisibleElement(candidate)
    && isEnabledControl(candidate)
    && !isHostedReadOnlyControl(candidate)
  )) || null;
}

function findHostedEmailTarget() {
  const emailInput = findHostedEditableEmailInput();
  if (emailInput) {
    return {
      emailInput,
      readOnlyEmailField: null,
    };
  }
  const readOnlyEmailField = findHostedReadOnlyEmailField();
  if (readOnlyEmailField) {
    return {
      emailInput: null,
      readOnlyEmailField,
    };
  }
  return null;
}

async function fillHostedEmailInput(email) {
  const normalizedEmail = normalizeText(email);
  if (!normalizedEmail) {
    throw new Error('OpenAI hosted checkout 未收到可用支付邮箱。');
  }
  const waitTimeoutMs = Math.max(
    100,
    Math.floor(Number(window.__PAYPAL_HOSTED_EMAIL_INPUT_TIMEOUT_MS__) || 15000)
  );
  const emailTarget = await waitUntil(() => findHostedEmailTarget(), {
    label: 'hosted checkout 邮箱输入框',
    intervalMs: 300,
    timeoutMs: waitTimeoutMs,
  });
  if (emailTarget.readOnlyEmailField) {
    const readOnlyEmailLabel = getHostedReadOnlyEmailLabel(emailTarget.readOnlyEmailField);
    log(`Plus Checkout：OpenAI hosted checkout 已显示只读邮箱字段（${readOnlyEmailLabel || 'email'}），跳过邮箱填写。`);
    return {
      emailFilled: false,
      emailSkipped: true,
      readOnlyEmailDetected: true,
      readOnlyEmailLabel,
      readOnlyEmailSummary: getHostedElementDiagnosticText(emailTarget.readOnlyEmailField),
      email: normalizedEmail,
    };
  }
  const emailInput = emailTarget.emailInput;
  fillInput(emailInput, normalizedEmail);
  await sleep(250);
  const renderedEmail = normalizeText(emailInput.value || '');
  if (renderedEmail.toLowerCase() !== normalizedEmail.toLowerCase()) {
    throw new Error(`OpenAI hosted checkout 邮箱填写失败：期望 ${normalizedEmail}，实际 ${renderedEmail || '空值'}。`);
  }
  log(`Plus Checkout：已填写 OpenAI hosted checkout 支付邮箱 ${normalizedEmail}`);
  return {
    emailFilled: true,
    emailSkipped: false,
    readOnlyEmailDetected: false,
    email: normalizedEmail,
  };
}

function selectHostedOptionByText(selector, value) {
  const select = document.querySelector(selector);
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

function getHostedSelectValueText(select) {
  if (!select) return '';
  const selected = Array.from(select.options || []).find((option) => option.selected)
    || select.selectedOptions?.[0]
    || null;
  return normalizeText(selected?.textContent || selected?.label || select.value || '');
}

function findHostedCountrySelect() {
  const directSelectors = [
    '#billingCountry',
    '#billingCountryCode',
    '#billingCountrySelect',
    '#billingAddressCountry',
    'select[name="billingCountry"]',
    'select[name="billingCountryCode"]',
    'select[name="billingAddressCountry"]',
    'select[autocomplete="country"]',
    'select[autocomplete="country-name"]',
  ];
  for (const selector of directSelectors) {
    const select = document.querySelector(selector);
    if (select && isVisibleElement(select) && isEnabledControl(select)) {
      return select;
    }
  }
  return Array.from(document.querySelectorAll('select')).find((select) => {
    if (!isVisibleElement(select) || !isEnabledControl(select)) return false;
    const text = [
      select.id,
      select.name,
      select.getAttribute?.('aria-label'),
      select.getAttribute?.('placeholder'),
      getFieldText(select),
    ].filter(Boolean).join(' ');
    return /country|region/i.test(text) || /\u56fd\u5bb6|\u56fd\u5bb6\u6216\u5730\u533a/.test(text);
  }) || null;
}

async function ensureHostedCountrySelected(countryCode = 'US') {
  const select = findHostedCountrySelect();
  if (!select) {
    return { countrySelected: false, countrySelectFound: false };
  }
  const desired = normalizeText(countryCode || 'US') || 'US';
  if (matchesCountryOption(getHostedSelectValueText(select) || select.value, desired)) {
    return {
      countrySelected: false,
      countrySelectFound: true,
      countryValue: getHostedSelectValueText(select) || select.value || '',
    };
  }
  const option = Array.from(select.options || []).find((item) => (
    matchesCountryOption(item.textContent || item.label || '', desired)
    || matchesCountryOption(item.value || '', desired)
  ));
  if (!option) {
    throw new Error(`OpenAI hosted checkout country option "${desired}" was not found.`);
  }
  select.value = option.value;
  option.selected = true;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(500);
  return {
    countrySelected: true,
    countrySelectFound: true,
    countryValue: getHostedSelectValueText(select) || select.value || '',
  };
}

function findHostedPayPalButton() {
  return document.querySelector('[data-testid="paypal-accordion-item-button"]')
    || document.querySelector('.paypal-accordion-item button')
    || findClickableByText([/paypal/i]);
}

function hasHostedOpenAiPaypalDisabledSignals() {
  return Array.from(document.querySelectorAll('iframe')).some((frame) => {
    const src = String(frame?.getAttribute?.('src') || frame?.src || '');
    return src.includes('paymentMethods][paypal]=never')
      || src.includes('wallets][paypal]=never');
  });
}

function isHostedOpenAiCardAccordionSelected() {
  const selectors = [
    '[data-testid="card-accordion-item"]',
    '.card-accordion-item',
    '[data-testid="card-accordion-item-button"]',
  ];
  return selectors.some((selector) => Array.from(document.querySelectorAll(selector)).some((el) => {
    if (!isVisibleElement(el) && !el.closest?.('[data-testid="card-accordion-item"]')) {
      return false;
    }
    const text = getCombinedSearchText(el);
    const className = String(el.className || el.getAttribute?.('class') || '');
    const current = el.getAttribute?.('aria-current');
    return /card|cardholder|cvc|cvv|expiry|expiration|security|\u94f6\u884c\u5361|\u5361\u53f7|\u6709\u6548\u671f|\u5b89\u5168\u7801/i.test(text)
      || /\b(selected|checked|active)\b/i.test(className)
      || current === 'true'
      || current === 'page'
      || hasPaymentMethodSelectionMarker(el);
  }));
}

function getHostedOpenAiCardFallbackState() {
  if (!isPayPalHostedOpenAiCheckoutPage()) {
    return {
      fallback: false,
      reason: '',
      reasons: [],
    };
  }

  const hasPayPalButton = Boolean(findHostedPayPalButton());
  const hasPayPalTarget = Boolean(findPayPalPaymentMethodTarget());
  const hasGoPayTarget = Boolean(findGoPayPaymentMethodTarget());
  const cardFieldsVisible = hasCreditCardFields();
  const cardAccordionSelected = isHostedOpenAiCardAccordionSelected();
  const paypalDisabledSignals = hasHostedOpenAiPaypalDisabledSignals();
  const paymentTextPreview = getPaymentTextPreview(12);
  const cardPreview = paymentTextPreview.find((text) => (
    /card|cardholder|cvc|cvv|expiry|expiration|security|\u94f6\u884c\u5361|\u5361\u53f7|\u6709\u6548\u671f|\u5b89\u5168\u7801/i.test(text)
  )) || '';
  const reasons = [];

  if (!hasPayPalButton) reasons.push('PayPal button not found');
  if (!hasPayPalTarget) reasons.push('PayPal payment method not detected');
  if (!hasGoPayTarget) reasons.push('GoPay payment method not detected');
  if (cardFieldsVisible) reasons.push('card fields are visible');
  if (cardAccordionSelected) reasons.push('card accordion is selected');
  if (paypalDisabledSignals) reasons.push('page signals paypal=never');
  if (cardPreview) reasons.push(`payment text includes "${cardPreview.slice(0, 40)}"`);

  const fallback = !hasPayPalButton
    && !hasPayPalTarget
    && !hasGoPayTarget
    && cardFieldsVisible
    && (cardAccordionSelected || paypalDisabledSignals || Boolean(cardPreview));

  return {
    fallback,
    reason: reasons.join('; '),
    reasons,
    hasPayPalButton,
    hasPayPalTarget,
    hasGoPayTarget,
    cardFieldsVisible,
    cardAccordionSelected,
    paypalDisabledSignals,
    cardPreview,
  };
}

function getVisibleErrorText(pattern) {
  if (typeof document?.querySelectorAll !== 'function') {
    return '';
  }

  const selectors = [
    '[role="alert"]',
    '[aria-live]',
    '.Alert',
    '.Error',
    '.error',
    '.FieldError',
    '[class*="error"]',
    '[class*="Error"]',
    'div',
    'span',
    'p',
  ];
  const seen = new Set();
  for (const element of Array.from(document.querySelectorAll(selectors.join(', ')))) {
    if (!element || seen.has(element) || !isVisibleElement(element)) {
      continue;
    }
    seen.add(element);
    const text = normalizeText(element.innerText || element.textContent || '');
    if (!text || !pattern.test(text)) {
      continue;
    }
    return text.slice(0, 240);
  }
  return '';
}

function getHostedOpenAiVisibleErrorText(pattern) {
  if (!isPayPalHostedOpenAiCheckoutPage()) {
    return '';
  }
  return getVisibleErrorText(pattern);
}

function getHostedOpenAiAddressErrorState() {
  const message = getVisibleErrorText(getAddressTaxErrorPattern());
  return {
    hasError: Boolean(message),
    message,
  };
}

function getAddressTaxErrorPattern() {
  return /customer'?s\s+location\s+isn'?t\s+recognized|set\s+a\s+valid\s+customer\s+address|automatically\s+calculate\s+tax|could\s+not\s+calculate\s+tax|couldn'?t\s+calculate\s+tax|cannot\s+calculate\s+tax|can'?t\s+calculate\s+tax|tax\s+for\s+this\s+address|valid\s+customer\s+address|address\s+(?:is\s+)?(?:invalid|not\s+recognized)|invalid\s+address|\u65e0\u6cd5(?:\u4e3a)?(?:\u6b64|\u8fd9\u4e2a|\u8be5)?\u5730\u5740\u8ba1\u7b97(?:\u7a0e|\u7a0e\u8d39)|\u65e0\u6cd5\u8ba1\u7b97(?:\u6b64|\u8fd9\u4e2a|\u8be5)?\u5730\u5740(?:\u7684)?(?:\u7a0e|\u7a0e\u8d39)|\u5730\u5740.*(?:\u7a0e|\u7a0e\u8d39).*\u65e0\u6cd5\u8ba1\u7b97|(?:\u7a0e|\u7a0e\u8d39).*\u65e0\u6cd5\u8ba1\u7b97.*\u5730\u5740|\u65e0\u6cd5\u8bc6\u522b.*\u5730\u5740|\u5730\u5740.*\u65e0\u6cd5\u8bc6\u522b|\u6709\u6548.*\u5730\u5740|\u5730\u5740.*\u65e0\u6548|\u5730\u5740\u65e0\u6548/i;
}

function getHostedOpenAiCardDeclinedState() {
  const message = getHostedOpenAiVisibleErrorText(
    /(?:bank\s*)?card\s+(?:was\s+)?declined|try\s+another\s+card|payment\s+method\s+was\s+declined|payment\s+declined|card\s+decline|\u94f6\u884c\u5361.*\u62d2\u7edd|\u5361.*\u88ab\u62d2\u7edd|\u8bf7\u5c1d\u8bd5.*(?:\u53e6\u4e00\u5f20|\u5176\u4ed6).*(?:\u5361|\u94f6\u884c\u5361)/i
  );
  return {
    hasError: Boolean(message),
    message,
  };
}

function findHostedSubmitButton() {
  return document.querySelector('button[data-testid="submit-button"]')
    || document.querySelector('button[data-testid="hosted-payment-submit-button"]')
    || document.querySelector('button[data-atomic-wait-intent="Submit_Email"]')
    || document.querySelector('button.SubmitButton--complete')
    || findClickableByText([
      /next|continue|pay|subscribe|agree/i,
      /下一页|继续|支付|订阅|同意/i,
    ]);
}

function normalizeHostedSubmitButtonCandidate(button) {
  if (!button) {
    return null;
  }
  const payPalButton = findHostedPayPalButton();
  if (payPalButton && button === payPalButton) {
    return null;
  }
  const structuralText = normalizeText([
    button.getAttribute?.('data-testid'),
    button.getAttribute?.('class'),
    button.className,
  ].filter(Boolean).join(' '));
  if (/paypal[-_\s]*accordion|card[-_\s]*accordion|accordion[-_\s]*item/i.test(structuralText)) {
    return null;
  }
  return button;
}

function getHostedSubmitProgressState() {
  const currentUrl = String(location?.href || '');
  const hostedOpenAiPage = isPayPalHostedOpenAiCheckoutPage();
  const paypalUrl = isPayPalUrl(currentUrl);
  const hostedCheckoutSuccessUrl = isHostedCheckoutSuccessUrl(currentUrl);
  const hostedVerificationVisible = hasHostedOpenAiVerificationDialog();
  const hostedAddressError = getHostedOpenAiAddressErrorState();
  const hostedCardDeclinedError = getHostedOpenAiCardDeclinedState();
  const hostedCardFallback = getHostedOpenAiCardFallbackState();
  const submitButton = normalizeHostedSubmitButtonCandidate(findHostedSubmitButton());
  const submitButtonReady = Boolean(submitButton && isEnabledControl(submitButton) && isVisibleElement(submitButton));
  const progressed = Boolean(
    !hostedOpenAiPage
    || paypalUrl
    || hostedCheckoutSuccessUrl
    || hostedVerificationVisible
    || hostedAddressError.hasError
    || hostedCardDeclinedError.hasError
    || hostedCardFallback.fallback
    || !submitButton
  );
  return {
    progressed,
    shouldRetry: Boolean(!progressed && hostedOpenAiPage && submitButton),
    hostedOpenAiPage,
    paypalUrl,
    hostedCheckoutSuccessUrl,
    hostedVerificationVisible,
    hostedAddressError: hostedAddressError.hasError,
    hostedAddressErrorMessage: hostedAddressError.message,
    hostedCardDeclinedError: hostedCardDeclinedError.hasError,
    hostedCardDeclinedErrorMessage: hostedCardDeclinedError.message,
    hostedCardFallback: hostedCardFallback.fallback,
    hostedCardFallbackReason: hostedCardFallback.reason,
    submitButtonFound: Boolean(submitButton),
    submitButtonReady,
    submitButtonText: getActionText(submitButton),
  };
}

async function waitForHostedSubmitProgress() {
  await sleep(HOSTED_SUBMIT_RETRY_CONFIRM_WAIT_MS);
  return getHostedSubmitProgressState();
}

async function clickHostedSubmitButton() {
  const button = await waitUntil(() => {
    hideHostedAddressAutocomplete();
    const candidate = normalizeHostedSubmitButtonCandidate(findHostedSubmitButton());
    return candidate && isEnabledControl(candidate) && isVisibleElement(candidate) ? candidate : null;
  }, {
    label: 'hosted checkout 提交按钮',
    intervalMs: 500,
    timeoutMs: 15000,
  });
  document.activeElement?.blur?.();
  await sleep(300);
  const buttonTextBeforeClick = getActionText(button) || '订阅';
  log(`Plus Checkout：准备点击“${buttonTextBeforeClick}”提交 OpenAI Checkout。`);
  simulateClick(button);
  await sleep(300);
  const buttonTextAfterClick = getActionText(button);
  if (buttonTextAfterClick && SUBSCRIBE_PROCESSING_TEXT_PATTERN.test(buttonTextAfterClick)) {
    log(`Plus Checkout：已点击“${buttonTextBeforeClick}”，按钮进入“${buttonTextAfterClick}”，正在等待 PayPal 跳转。`);
  } else {
    log(`Plus Checkout：已点击“${buttonTextBeforeClick}”，正在等待 PayPal 跳转。`);
  }
  let hostedSubmitRetryCount = 0;
  let hostedSubmitProgressState = await waitForHostedSubmitProgress();
  while (
    hostedSubmitRetryCount < HOSTED_SUBMIT_RETRY_MAX_RETRIES
    && hostedSubmitProgressState.shouldRetry
  ) {
    hostedSubmitRetryCount += 1;
    hideHostedAddressAutocomplete();
    const retryButton = normalizeHostedSubmitButtonCandidate(findHostedSubmitButton());
    if (!retryButton || !isVisibleElement(retryButton)) {
      hostedSubmitProgressState = getHostedSubmitProgressState();
      break;
    }
    const retryButtonText = getActionText(retryButton) || buttonTextBeforeClick || 'Subscribe';
    log(`Plus Checkout：等待 PayPal 跳转 ${Math.floor(HOSTED_SUBMIT_RETRY_CONFIRM_WAIT_MS / 1000)} 秒后仍未推进，尝试第 ${hostedSubmitRetryCount}/${HOSTED_SUBMIT_RETRY_MAX_RETRIES} 次重试点击“${retryButtonText}”。`, 'warn');
    simulateClick(retryButton);
    await sleep(300);
    hostedSubmitProgressState = await waitForHostedSubmitProgress();
  }

  const hostedSubmitRetryExhausted = Boolean(
    hostedSubmitRetryCount >= HOSTED_SUBMIT_RETRY_MAX_RETRIES
    && hostedSubmitProgressState.shouldRetry
  );
  if (hostedSubmitRetryExhausted) {
    log(`Plus Checkout：提交按钮已重试 ${HOSTED_SUBMIT_RETRY_MAX_RETRIES} 次，仍未检测到 PayPal 跳转，交给外层等待循环继续判断。`, 'warn');
  }
  return {
    clicked: true,
    buttonText: getActionText(button),
    buttonTextBeforeClick,
    buttonTextAfterClick,
    hostedVerificationVisible: hasHostedOpenAiVerificationDialog(),
    hostedSubmitRetryCount,
    hostedSubmitRetryExhausted,
    hostedSubmitProgressState,
  };
}

function fillHostedOpenAiVerificationCode(verificationCode = '') {
  const code = String(verificationCode || '').replace(/\D+/g, '').slice(0, 6);
  if (code.length !== 6) {
    throw new Error('hosted checkout OpenAI 验证码无效。');
  }
  for (let index = 0; index < 6; index += 1) {
    const input = document.getElementById(`ci-ciBasic-${index}`);
    if (!input) {
      throw new Error('hosted checkout OpenAI 页面未找到完整的验证码输入框。');
    }
    fillInput(input, code[index]);
  }
  return {
    verificationCodeFilled: true,
    hostedVerificationVisible: true,
  };
}

async function runPayPalHostedOpenAiCheckoutStep(payload = {}) {
  await waitForDocumentComplete();
  if (!isPayPalHostedOpenAiCheckoutPage()) {
    throw new Error('当前页面不是 PayPal 无卡直绑的 OpenAI hosted checkout 页面。');
  }
  if (payload.verificationCode) {
    return fillHostedOpenAiVerificationCode(payload.verificationCode);
  }

  const cardFallbackState = getHostedOpenAiCardFallbackState();
  if (cardFallbackState.fallback) {
    throw new Error(
      `${HOSTED_CHECKOUT_CARD_FALLBACK_ERROR_PREFIX}Step 6: hosted checkout entered the card branch instead of PayPal. ${cardFallbackState.reason || 'Only card payment is visible.'}`
    );
  }

  const normalizedEmail = normalizeText(payload.email || '');
  const hostedEmailResult = await fillHostedEmailInput(normalizedEmail);

  hideHostedAddressAutocomplete();
  const payPalButton = findHostedPayPalButton();
  if (payPalButton) {
    simulateClick(payPalButton);
    await sleep(500);
  }

  const address = payload.address && typeof payload.address === 'object' ? payload.address : {};
  await ensureHostedCountrySelected(address.countryCode || 'US');
  fillHostedInput('#billingAddressLine1', address.street || address.address1 || '');
  fillHostedInput('#billingLocality', address.city || '');
  fillHostedInput('#billingPostalCode', address.zip || address.postalCode || '');
  selectHostedOptionByText('#billingAdministrativeArea', address.state || address.region || '');

  const consent = document.getElementById('termsOfServiceConsentCheckbox');
  if (consent && !consent.checked) {
    simulateClick(consent);
  }

  for (let count = 0; count < 5; count += 1) {
    hideHostedAddressAutocomplete();
    await sleep(250);
  }

  const clickResult = await clickHostedSubmitButton();
  const hostedAddressError = getHostedOpenAiAddressErrorState();
  const hostedCardDeclinedError = getHostedOpenAiCardDeclinedState();
  return {
    ...clickResult,
    ...hostedEmailResult,
    hostedAddressError: hostedAddressError.hasError,
    hostedAddressErrorMessage: hostedAddressError.message,
    hostedCardDeclinedError: hostedCardDeclinedError.hasError,
    hostedCardDeclinedErrorMessage: hostedCardDeclinedError.message,
  };
}

function isVisibleElement(el) {
  if (!el) return false;
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

function getChatGptHomeVisibleErrorText() {
  if (typeof document?.querySelectorAll !== 'function') {
    return '';
  }
  const errorPattern = /something\s+went\s+wrong|unable\s+to\s+load|failed\s+to\s+load|network\s+error|error\s+loading|try\s+again|请重试|出错|错误|无法加载/i;
  const selectors = [
    '[role="alert"]',
    '[aria-live]',
    '[data-testid*="error" i]',
    '[class*="error" i]',
    '[class*="Error"]',
  ];
  const seen = new Set();
  for (const selector of selectors) {
    let nodes = [];
    try {
      nodes = Array.from(document.querySelectorAll(selector));
    } catch {
      nodes = [];
    }
    for (const node of nodes) {
      if (!node || seen.has(node) || !isVisibleElement(node)) continue;
      seen.add(node);
      const text = normalizeText(node.innerText || node.textContent || '');
      if (text && errorPattern.test(text)) {
        return text.slice(0, 240);
      }
    }
  }
  return '';
}

function getChatGptHomeAccountAreaCandidates() {
  if (typeof document?.querySelectorAll !== 'function') {
    return [];
  }
  const selectors = [
    '[data-testid*="profile" i]',
    '[data-testid*="account" i]',
    '[data-testid*="user" i]',
    '[data-testid*="avatar" i]',
    '[data-testid*="plan" i]',
    '[data-testid*="upgrade" i]',
    '[aria-label*="profile" i]',
    '[aria-label*="account" i]',
    '[aria-label*="user" i]',
    '[aria-label*="avatar" i]',
    '[aria-label*="plan" i]',
    '[aria-label*="upgrade" i]',
    '[title*="profile" i]',
    '[title*="account" i]',
    '[title*="user" i]',
    '[title*="avatar" i]',
    '[title*="plan" i]',
    '[title*="upgrade" i]',
    'a[href*="/pricing"]',
  ];
  const hintPattern = /profile|account|user|avatar|workspace|plan|plus|upgrade|free|个人资料|账户|账号|用户|套餐|计划|升级|免费/i;
  const seen = new Set();
  const candidates = [];
  const addCandidate = (node) => {
    if (!node || seen.has(node) || !isVisibleElement(node)) return;
    seen.add(node);
    candidates.push(node);
  };

  for (const selector of selectors) {
    let nodes = [];
    try {
      nodes = Array.from(document.querySelectorAll(selector));
    } catch {
      nodes = [];
    }
    nodes.forEach(addCandidate);
  }

  for (const node of getVisibleControls('button, a, [role="button"], [data-testid], [aria-label], [title]')) {
    const text = getSearchText(node);
    if (hintPattern.test(text)) {
      addCandidate(node);
    }
  }

  return candidates;
}

function getChatGptHomeAccountContainer(node) {
  let current = node;
  for (let depth = 0; current && depth < 4; depth += 1, current = current.parentElement) {
    if (!isVisibleElement(current) || isDocumentLevelContainer(current)) {
      continue;
    }
    const text = normalizeText(current.innerText || current.textContent || getSearchText(current));
    if (text.length > 0 && text.length <= 320) {
      return current;
    }
    try {
      if (current.matches?.('button, a, [role="button"], [data-testid], [aria-label], [title], header, nav, aside')) {
        return current;
      }
    } catch {
      // Keep the original candidate if selector matching is unavailable.
    }
  }
  return node;
}

function getChatGptHomeAccountAreaText() {
  const candidates = getChatGptHomeAccountAreaCandidates();
  const seen = new Set();
  const textParts = [];
  for (const candidate of candidates) {
    const container = getChatGptHomeAccountContainer(candidate);
    if (!container || seen.has(container)) continue;
    seen.add(container);
    const text = normalizeText([
      container.innerText,
      container.textContent,
      getSearchText(container),
    ].filter(Boolean).join(' '));
    if (text) {
      textParts.push(text);
    }
  }
  return {
    candidateCount: candidates.length,
    text: normalizeText(textParts.join(' | ')).slice(0, 1000),
  };
}

function inspectChatGptHomePlanFallback() {
  const result = {
    checked: false,
    successLikely: false,
    blockingText: '',
    accountAreaTextPreview: '',
    reason: '',
  };
  if (!isChatGptHomeUrl(location?.href || '')) {
    return {
      ...result,
      reason: 'not-chatgpt-home',
    };
  }
  if (document.readyState !== 'complete') {
    return {
      ...result,
      reason: `document-${document.readyState || 'unknown'}`,
    };
  }
  const errorText = getChatGptHomeVisibleErrorText();
  if (errorText) {
    return {
      ...result,
      reason: 'visible-error',
      blockingText: errorText,
    };
  }

  const accountArea = getChatGptHomeAccountAreaText();
  const accountText = normalizeText(accountArea.text || '');
  if (!accountArea.candidateCount || !accountText) {
    return {
      ...result,
      checked: true,
      reason: 'account-area-not-found',
    };
  }

  const blockingMatch = accountText.match(/\bFree\b|\bUpgrade\b|免费|升级/i);
  return {
    checked: true,
    successLikely: !blockingMatch,
    blockingText: blockingMatch ? String(blockingMatch[0] || '').trim() : '',
    accountAreaTextPreview: accountText.slice(0, 300),
    reason: blockingMatch ? 'free-or-upgrade-visible' : 'account-area-without-free-or-upgrade',
  };
}

function parseLocalizedAmount(rawValue = '') {
  const raw = normalizeText(rawValue);
  const match = raw.match(/(?:[$€£¥]\s*)?([+-]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})|[+-]?\d+(?:[.,]\d{1,2})?)(?:\s*[$€£¥])?/);
  if (!match) return null;
  let numericText = String(match[1] || '').trim();
  const lastComma = numericText.lastIndexOf(',');
  const lastDot = numericText.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    numericText = numericText
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
  } else if (lastComma > -1) {
    numericText = numericText.replace(',', '.');
  }
  const amount = Number(numericText.replace(/[^\d.+-]/g, ''));
  return Number.isFinite(amount)
    ? {
        amount,
        raw: match[0],
      }
    : null;
}

function getTextAfterTodayDueLabel(text = '') {
  const normalized = normalizeText(text);
  const match = normalized.match(/(?:今日应付金额|今日应付|今天应付|amount\s*due\s*today|due\s*today|today'?s\s*total|total\s*due\s*today)/i);
  if (!match) return '';
  return normalized.slice((match.index || 0) + match[0].length).trim();
}

function buildCheckoutAmountSummaryFromParsedAmount(parsed = null, options = {}) {
  if (!parsed || !Number.isFinite(Number(parsed.amount))) {
    return null;
  }
  return {
    hasTodayDue: true,
    amount: parsed.amount,
    isZero: Math.abs(parsed.amount) < 0.005,
    rawAmount: parsed.raw,
    labelText: normalizeText(options.labelText || '').slice(0, 160),
  };
}

function getCheckoutAmountSummaryFromProductSummary() {
  const selectors = [
    '#ProductSummary-totalAmount .CurrencyAmount',
    '#ProductSummary-totalAmount',
    '[data-testid="product-summary-total-amount"] .CurrencyAmount',
    '[data-testid="product-summary-total-amount"]',
  ];
  const seen = new Set();
  const candidates = [];

  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    for (const node of nodes) {
      if (!node || seen.has(node)) continue;
      seen.add(node);
      candidates.push(node);
    }
  }

  for (const node of candidates) {
    const directText = normalizeText(node.innerText || node.textContent || '');
    const parsed = parseLocalizedAmount(directText);
    if (parsed) {
      return buildCheckoutAmountSummaryFromParsedAmount(parsed, {
        labelText: directText || 'ProductSummary total amount',
      });
    }

    const container = node.closest?.('#ProductSummary-totalAmount, [data-testid="product-summary-total-amount"]') || node.parentElement || null;
    const containerText = normalizeText(container?.innerText || container?.textContent || '');
    const parsedFromContainer = parseLocalizedAmount(containerText);
    if (parsedFromContainer) {
      return buildCheckoutAmountSummaryFromParsedAmount(parsedFromContainer, {
        labelText: containerText || directText || 'ProductSummary total amount',
      });
    }
  }

  return null;
}

function getCheckoutAmountSummary() {
  const productSummaryAmount = getCheckoutAmountSummaryFromProductSummary();
  if (productSummaryAmount) {
    return productSummaryAmount;
  }

  const elements = getVisibleControls('div, span, p, strong, b');
  const labelPattern = /今日应付金额|今日应付|今天应付|amount\s*due\s*today|due\s*today|today'?s\s*total|total\s*due\s*today/i;
  const amountPattern = /[$€£¥]\s*[+-]?\d|[+-]?\d+(?:[.,]\d{1,2})?\s*[$€£¥]/;

  for (const element of elements) {
    const text = normalizeText(element.innerText || element.textContent || '');
    if (!labelPattern.test(text)) continue;

    const candidates = [];
    const afterLabelText = getTextAfterTodayDueLabel(text);
    if (afterLabelText) candidates.push(afterLabelText);

    const parent = element.parentElement;
    if (parent) {
      for (const child of Array.from(parent.children || [])) {
        if (child === element) continue;
        const childText = normalizeText(child.innerText || child.textContent || '');
        if (amountPattern.test(childText)) {
          candidates.push(childText);
        }
      }
      const parentAfterLabelText = getTextAfterTodayDueLabel(parent.innerText || parent.textContent || '');
      if (parentAfterLabelText) candidates.push(parentAfterLabelText);
    }

    const grandparent = parent?.parentElement;
    if (grandparent) {
      const grandparentAfterLabelText = getTextAfterTodayDueLabel(grandparent.innerText || grandparent.textContent || '');
      if (grandparentAfterLabelText) candidates.push(grandparentAfterLabelText);
    }

    for (const candidate of candidates) {
      const parsed = parseLocalizedAmount(candidate);
      if (!parsed) continue;
      return buildCheckoutAmountSummaryFromParsedAmount(parsed, {
        labelText: text,
      });
    }

    return {
      hasTodayDue: true,
      amount: null,
      isZero: false,
      rawAmount: '',
      labelText: text.slice(0, 160),
    };
  }

  return {
    hasTodayDue: false,
    amount: null,
    isZero: false,
    rawAmount: '',
    labelText: '',
  };
}

function getActionText(el) {
  return normalizeText([
    el?.textContent,
    el?.value,
    el?.getAttribute?.('aria-label'),
    el?.getAttribute?.('aria-labelledby'),
    el?.getAttribute?.('title'),
    el?.getAttribute?.('placeholder'),
    el?.getAttribute?.('name'),
    el?.getAttribute?.('autocomplete'),
    el?.getAttribute?.('data-elements-stable-field-name'),
    el?.getAttribute?.('data-field'),
    el?.getAttribute?.('data-field-name'),
    el?.id,
  ].filter(Boolean).join(' '));
}

function getSearchText(el) {
  const datasetValues = el?.dataset ? Object.values(el.dataset) : [];
  return normalizeText([
    getActionText(el),
    el?.getAttribute?.('alt'),
    el?.getAttribute?.('role'),
    el?.getAttribute?.('data-testid'),
    el?.getAttribute?.('src'),
    el?.getAttribute?.('href'),
    el?.getAttribute?.('xlink:href'),
    typeof el?.className === 'string' ? el.className : el?.getAttribute?.('class'),
    ...datasetValues,
  ].filter(Boolean).join(' '));
}

function getFieldText(el) {
  const id = el?.id || '';
  const labels = [];
  if (id) {
    labels.push(...Array.from(document.querySelectorAll(`label[for="${CSS.escape(id)}"]`)).map((label) => label.textContent));
  }
  const wrappingLabel = el?.closest?.('label');
  if (wrappingLabel) {
    labels.push(wrappingLabel.textContent);
  }
  const container = el?.closest?.('[data-testid], [class], div, section, fieldset');
  if (container) {
    labels.push(container.textContent);
  }
  return normalizeText([
    getActionText(el),
    ...labels,
  ].filter(Boolean).join(' '));
}

function getCombinedSearchText(el) {
  return normalizeText([
    getSearchText(el),
    getFieldText(el),
  ].filter(Boolean).join(' '));
}

function getVisibleControls(selector) {
  return Array.from(document.querySelectorAll(selector)).filter(isVisibleElement);
}

function findClickableByText(patterns) {
  const normalizedPatterns = (Array.isArray(patterns) ? patterns : [patterns])
    .filter(Boolean);
  const candidates = getVisibleControls('button, a, [role="button"], [role="tab"], input[type="button"], input[type="submit"], [tabindex]');
  return candidates.find((el) => {
    const text = getCombinedSearchText(el);
    return normalizedPatterns.some((pattern) => pattern.test(text));
  }) || null;
}

function isEnabledControl(el) {
  return Boolean(el)
    && !el.disabled
    && el.getAttribute?.('aria-disabled') !== 'true';
}

function getVisibleTextInputs() {
  return getVisibleControls('input, textarea')
    .filter((el) => {
      const type = String(el.getAttribute('type') || el.type || '').trim().toLowerCase();
      return !['hidden', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(type);
    });
}

function findInputByFieldText(patterns, options = {}) {
  const inputs = getVisibleTextInputs();
  const excluded = options.exclude || (() => false);
  return inputs.find((input) => {
    if (excluded(input)) return false;
    const text = getFieldText(input);
    return patterns.some((pattern) => pattern.test(text));
  }) || null;
}

function getDirectFieldHintText(el) {
  const id = el?.id || '';
  const labels = [];
  if (id) {
    labels.push(...Array.from(document.querySelectorAll(`label[for="${CSS.escape(id)}"]`)).map((label) => label.textContent));
  }
  const wrappingLabel = el?.closest?.('label');
  if (wrappingLabel) {
    labels.push(wrappingLabel.textContent);
  }
  return normalizeText([
    getActionText(el),
    ...labels,
  ].filter(Boolean).join(' '));
}

function isNonAddressSearchInput(input) {
  const directText = getDirectFieldHintText(input);
  const type = String(input?.getAttribute?.('type') || input?.type || '').trim().toLowerCase();
  return /name|email|e-mail|phone|tel|password|coupon|promo|country|region|postal|zip|city|state|province|card|card\s*number|expiry|expiration|security|cvc|cvv|cc-/i.test(directText)
    || ['email', 'tel', 'password'].includes(type);
}

function isDocumentLevelContainer(el) {
  return !el
    || el === document.documentElement
    || el === document.body
    || ['HTML', 'BODY', 'MAIN'].includes(el.tagName);
}

function isPaymentCardSized(el) {
  if (!isVisibleElement(el) || isDocumentLevelContainer(el)) return false;
  const rect = el.getBoundingClientRect();
  const maxWidth = Math.max(320, Math.min(window.innerWidth * 0.95, 900));
  const maxHeight = Math.max(140, Math.min(window.innerHeight * 0.45, 320));
  return rect.width >= 64
    && rect.height >= 28
    && rect.width <= maxWidth
    && rect.height <= maxHeight;
}

function findInteractiveAncestor(el) {
  let current = el;
  for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
    if (!isVisibleElement(current) || isDocumentLevelContainer(current)) continue;
    if (current.matches?.('button, a, label, [role="button"], [role="radio"], [role="tab"], input[type="radio"], [tabindex]')) {
      return current;
    }
  }
  return null;
}

function findPaymentCardAncestor(el, pattern) {
  let current = el;
  for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
    if (!isVisibleElement(current)) continue;
    if (isDocumentLevelContainer(current)) break;
    const text = getSearchText(current);
    if (pattern.test(text) && isPaymentCardSized(current)) {
      return current;
    }
  }
  return null;
}

function normalizePlusPaymentMethod(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  const paypalHostedValue = typeof PLUS_PAYMENT_METHOD_PAYPAL_HOSTED !== 'undefined'
    ? PLUS_PAYMENT_METHOD_PAYPAL_HOSTED
    : 'paypal-hosted';
  if (normalized === paypalHostedValue || normalized === 'paypal_direct' || normalized === 'paypal-direct') {
    return paypalHostedValue;
  }
  return normalized === PLUS_PAYMENT_METHOD_GOPAY
    ? PLUS_PAYMENT_METHOD_GOPAY
    : PLUS_PAYMENT_METHOD_PAYPAL;
}

function shouldUseHostedCheckoutFinalStep(options = {}) {
  const paymentMethod = normalizePlusPaymentMethod(options?.paymentMethod || options?.plusPaymentMethod);
  if (paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED) {
    return true;
  }
  if (paymentMethod !== PLUS_PAYMENT_METHOD_PAYPAL) {
    return false;
  }
  if (options?.hostedCheckoutFinalStep === false || options?.plusHostedCheckoutIsFinalStep === false) {
    return false;
  }
  return true;
}

function getPaymentMethodConfig(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  const normalizedMethod = normalizePlusPaymentMethod(method);
  if (normalizedMethod === PLUS_PAYMENT_METHOD_PAYPAL) {
    return PAYMENT_METHOD_CONFIGS[PLUS_PAYMENT_METHOD_PAYPAL];
  }
  return PAYMENT_METHOD_CONFIGS[normalizedMethod] || PAYMENT_METHOD_CONFIGS[PLUS_PAYMENT_METHOD_PAYPAL];
}

function getAncestorChainSummary(el, limit = 6) {
  const chain = [];
  let current = el;
  for (let depth = 0; current && depth < limit; depth += 1, current = current.parentElement) {
    if (isDocumentLevelContainer(current)) break;
    const rect = current.getBoundingClientRect();
    chain.push({
      tag: String(current.tagName || '').toLowerCase(),
      role: current.getAttribute?.('role') || '',
      id: current.id || '',
      className: typeof current.className === 'string' ? current.className.slice(0, 120) : '',
      testId: current.getAttribute?.('data-testid') || '',
      ariaLabel: current.getAttribute?.('aria-label') || '',
      ariaChecked: current.getAttribute?.('aria-checked') || '',
      ariaSelected: current.getAttribute?.('aria-selected') || '',
      rect: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      text: getCombinedSearchText(current).slice(0, 180),
    });
  }
  return chain;
}

function getPaymentMethodSearchCandidates(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  const config = getPaymentMethodConfig(method);
  const selector = [
    'button',
    'a',
    'label',
    '[role="button"]',
    '[role="radio"]',
    '[role="tab"]',
    'input[type="radio"]',
    '[tabindex]',
    '[data-testid]',
    '[aria-label]',
    '[title]',
    'img',
    'svg',
    'span',
    'div',
  ].join(', ');

  return getVisibleControls(selector)
    .filter((el) => {
      const text = getCombinedSearchText(el);
      return config.patterns.some((pattern) => pattern.test(text));
    })
    .sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      return (leftRect.width * leftRect.height) - (rightRect.width * rightRect.height);
    });
}

function getPayPalSearchCandidates() {
  return getPaymentMethodSearchCandidates(PLUS_PAYMENT_METHOD_PAYPAL);
}

function getGoPaySearchCandidates() {
  return getPaymentMethodSearchCandidates(PLUS_PAYMENT_METHOD_GOPAY);
}

function findPaymentMethodTarget(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  const config = getPaymentMethodConfig(method);
  const directClickable = findClickableByText(config.patterns);
  if (directClickable) {
    return directClickable;
  }

  const radios = getVisibleControls('input[type="radio"], [role="radio"]');
  const matchedRadio = radios.find((el) => config.patterns.some((pattern) => pattern.test(getCombinedSearchText(el))));
  if (matchedRadio) {
    return matchedRadio;
  }

  const candidates = getPaymentMethodSearchCandidates(method);
  for (const candidate of candidates) {
    const interactive = findInteractiveAncestor(candidate);
    if (interactive && config.patterns.some((pattern) => pattern.test(getCombinedSearchText(interactive)))) {
      return interactive;
    }
    const card = config.patterns
      .map((pattern) => findPaymentCardAncestor(candidate, pattern))
      .find(Boolean);
    if (card) {
      return card;
    }
  }

  return null;
}

function findPayPalPaymentMethodTarget() {
  return findPaymentMethodTarget(PLUS_PAYMENT_METHOD_PAYPAL);
}

function findGoPayPaymentMethodTarget() {
  return findPaymentMethodTarget(PLUS_PAYMENT_METHOD_GOPAY);
}

function summarizeElementForDebug(el) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    tag: String(el.tagName || '').toLowerCase(),
    role: el.getAttribute?.('role') || '',
    text: getSearchText(el).slice(0, 160),
    rect: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
    chain: getAncestorChainSummary(el, 3),
  };
}

function getPaymentMethodCandidateSummaries(method = PLUS_PAYMENT_METHOD_PAYPAL, limit = 6) {
  return getPaymentMethodSearchCandidates(method)
    .map(summarizeElementForDebug)
    .filter(Boolean)
    .slice(0, limit);
}

function getPayPalCandidateSummaries(limit = 6) {
  return getPaymentMethodCandidateSummaries(PLUS_PAYMENT_METHOD_PAYPAL, limit);
}

function getGoPayCandidateSummaries(limit = 6) {
  return getPaymentMethodCandidateSummaries(PLUS_PAYMENT_METHOD_GOPAY, limit);
}

function getPaymentTextPreview(limit = 10) {
  const seen = new Set();
  const pattern = /gopay|go\s*pay|paypal|card|payment|billing|subscribe|pay|银行卡|付款|支付|账单|订阅/i;
  return getVisibleControls('button, a, label, [role="button"], [role="radio"], input[type="radio"], input[type="button"], input[type="submit"], [data-testid]')
    .map((el) => getCombinedSearchText(el))
    .filter((text) => text && pattern.test(text))
    .map((text) => text.slice(0, 180))
    .filter((text) => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    })
    .slice(0, limit);
}

function getPayPalDiagnostics(reason = '') {
  return getPaymentMethodDiagnostics(PLUS_PAYMENT_METHOD_PAYPAL, reason);
}

function getGoPayDiagnostics(reason = '') {
  return getPaymentMethodDiagnostics(PLUS_PAYMENT_METHOD_GOPAY, reason);
}

function getPaymentMethodDiagnostics(method = PLUS_PAYMENT_METHOD_PAYPAL, reason = '') {
  const config = getPaymentMethodConfig(method);
  return {
    reason,
    url: location.href,
    readyState: document.readyState,
    paymentMethod: config.id,
    paymentMethodLabel: config.label,
    paymentCandidates: getPaymentMethodCandidateSummaries(config.id),
    paypalCandidates: getPayPalCandidateSummaries(),
    gopayCandidates: getGoPayCandidateSummaries(),
    paymentTextPreview: getPaymentTextPreview(),
    cardFieldsVisible: hasCreditCardFields(),
    billingFieldsVisible: hasBillingAddressFields(),
  };
}

function writePaymentMethodDiagnostics(method = PLUS_PAYMENT_METHOD_PAYPAL, reason = '', level = 'info') {
  const config = getPaymentMethodConfig(method);
  const diagnostics = getPaymentMethodDiagnostics(config.id, reason);
  const writer = typeof console[level] === 'function' ? console[level] : console.info;
  writer.call(console, `[MultiPage:plus-checkout] ${config.diagnosticLabel} diagnostics`, diagnostics);
  log(`Plus Checkout：${reason}。${config.label} 候选 ${diagnostics.paymentCandidates.length} 个，银行卡字段${diagnostics.cardFieldsVisible ? '仍可见' : '不可见'}。`, level === 'error' ? 'error' : 'warn');
  return diagnostics;
}

function writePayPalDiagnostics(reason, level = 'info') {
  return writePaymentMethodDiagnostics(PLUS_PAYMENT_METHOD_PAYPAL, reason, level);
}

function writeGoPayDiagnostics(reason, level = 'info') {
  return writePaymentMethodDiagnostics(PLUS_PAYMENT_METHOD_GOPAY, reason, level);
}

function normalizeRegionalCheckoutCountryCode(value = '') {
  const raw = String(value || '').trim();
  const normalized = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (Object.prototype.hasOwnProperty.call(PLUS_CHECKOUT_REGIONAL_BILLING_DETAILS, normalized)) {
    return normalized;
  }
  const lower = raw.toLowerCase();
  if (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower)) return 'US';
  if (/\b(?:jp|jpn|japan)\b|日本/.test(lower)) return 'JP';
  if (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower)) return 'BR';
  return '';
}

function resolveCheckoutBillingDetails(config = {}, options = {}) {
  const defaultDetails = { ...(config.billingDetails || {}) };
  const overrideSource = options.billingDetails && typeof options.billingDetails === 'object'
    ? options.billingDetails
    : {};
  const countryCode = normalizeRegionalCheckoutCountryCode(
    overrideSource.country || overrideSource.countryCode || options.country || options.countryCode || ''
  );
  if (
    options.regionalCheckoutEnabled === true
    && countryCode
    && config.id !== PLUS_PAYMENT_METHOD_GOPAY
  ) {
    return { ...PLUS_CHECKOUT_REGIONAL_BILLING_DETAILS[countryCode] };
  }
  return defaultDetails;
}

function buildPlusCheckoutPayload(paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, options = {}) {
  const config = getPaymentMethodConfig(paymentMethod);
  return {
    ...JSON.parse(JSON.stringify(PLUS_CHECKOUT_PAYLOAD_BASE)),
    checkout_ui_mode: shouldUseHostedCheckoutFinalStep({
      ...options,
      paymentMethod,
    }) ? 'hosted' : 'custom',
    billing_details: resolveCheckoutBillingDetails(config, options),
  };
}

function buildPlusCheckoutUrl(checkoutSessionId, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
  const sessionId = String(checkoutSessionId || '').trim();
  if (!sessionId) {
    throw new Error('创建 Plus Checkout 失败：未返回 checkout_session_id。');
  }
  const config = getPaymentMethodConfig(paymentMethod);
  return `https://chatgpt.com/checkout/${config.checkoutMerchantPath}/${sessionId}`;
}

function findHostedCheckoutUrl(payload = {}) {
  const queue = [payload];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    for (const value of Object.values(current)) {
      if (typeof value === 'string' && /^https:\/\/(?:pay\.openai\.com|checkout\.stripe\.com)\/c\/pay\//i.test(value.trim())) {
        return value.trim();
      }
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }
  return '';
}

async function createPlusCheckoutSession(options = {}) {
  await waitForDocumentComplete();
  log('Plus：正在读取 ChatGPT 登录会话...');

  const sessionResponse = await fetch('/api/auth/session', {
    credentials: 'include',
  });
  const session = await sessionResponse.json().catch(() => ({}));
  const accessToken = session?.accessToken;
  if (!accessToken) {
    throw new Error('请先登录 ChatGPT，当前页面未返回可用 accessToken。');
  }

  log('Plus：正在创建 checkout 会话...');
  const paymentMethod = normalizePlusPaymentMethod(options.paymentMethod);
  const useHostedCheckoutFinalStep = shouldUseHostedCheckoutFinalStep({
    ...options,
    paymentMethod,
  });
  const checkoutPayload = buildPlusCheckoutPayload(paymentMethod, {
    ...options,
    paymentMethod,
    hostedCheckoutFinalStep: useHostedCheckoutFinalStep,
  });
  const response = await fetch('https://chatgpt.com/backend-api/payments/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkoutPayload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.checkout_session_id) {
    const detail = data?.detail || data?.message || `HTTP ${response.status}`;
    throw new Error(`创建 Plus Checkout 失败：${detail}`);
  }

  const checkoutUrl = buildPlusCheckoutUrl(data.checkout_session_id, paymentMethod);
  const hostedCheckoutUrl = findHostedCheckoutUrl(data);
  const preferredCheckoutUrl = useHostedCheckoutFinalStep
    ? (hostedCheckoutUrl || checkoutUrl)
    : checkoutUrl;

  return {
    checkoutUrl,
    hostedCheckoutUrl,
    preferredCheckoutUrl,
    country: checkoutPayload.billing_details.country,
    currency: checkoutPayload.billing_details.currency,
  };
}

async function selectPaymentMethod(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  const config = getPaymentMethodConfig(method);
  let lastDiagnosticsAt = 0;
  const target = await waitUntil(() => {
    const currentTarget = findPaymentMethodTarget(config.id);
    if (currentTarget) {
      return currentTarget;
    }

    const now = Date.now();
    if (!lastDiagnosticsAt || now - lastDiagnosticsAt >= PAYPAL_DIAGNOSTIC_LOG_INTERVAL_MS) {
      lastDiagnosticsAt = now;
      writePaymentMethodDiagnostics(config.id, `正在等待可点击的 ${config.label} 付款方式`, 'warn');
    }
    return null;
  }, {
    label: `${config.label} 付款方式`,
    intervalMs: 250,
  });
  console.info(`[MultiPage:plus-checkout] ${config.label} target selected`, summarizeElementForDebug(target));
  await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'select', label: 'select-payment-method' }, async () => {
    simulateClick(target);
  });
  log(`Plus Checkout：已点击 ${config.label} 付款方式，正在确认选中状态。`);

  if (!await waitForPaymentMethodActive(config.id)) {
    const diagnostics = writePaymentMethodDiagnostics(config.id, `点击 ${config.label} 后页面仍未进入 ${config.label} 账单表单`, 'error');
    throw new Error(`Plus Checkout：已尝试点击 ${config.label}，但页面未切换到 ${config.label} 表单。请提供控制台 ${config.label} diagnostics 结构。候选数量：${diagnostics.paymentCandidates.length}，银行卡字段仍可见：${diagnostics.cardFieldsVisible ? '是' : '否'}。`);
  }

  log(`Plus Checkout：已确认 ${config.label} 付款方式生效。`);
  return true;
}

async function selectPayPalPaymentMethod() {
  return selectPaymentMethod(PLUS_PAYMENT_METHOD_PAYPAL);
}

async function selectGoPayPaymentMethod() {
  return selectPaymentMethod(PLUS_PAYMENT_METHOD_GOPAY);
}

async function selectPlusPayPalPaymentMethod() {
  await waitForDocumentComplete();
  await selectPaymentMethod(PLUS_PAYMENT_METHOD_PAYPAL);
  return {
    paymentSelected: true,
    paymentMethod: PLUS_PAYMENT_METHOD_PAYPAL,
  };
}

async function selectPlusGoPayPaymentMethod() {
  await waitForDocumentComplete();
  await selectPaymentMethod(PLUS_PAYMENT_METHOD_GOPAY);
  return {
    paymentSelected: true,
    paymentMethod: PLUS_PAYMENT_METHOD_GOPAY,
  };
}

async function fillFullName(fullName) {
  const value = normalizeText(fullName);
  if (!value) return false;
  const input = findInputByFieldText([
    /full\s*name|name\s*on|cardholder|billing\s*name/i,
    /姓名|全名|持卡人/i,
  ]);
  if (!input) {
    return false;
  }
  fillInput(input, value);
  await sleep(300);
  return true;
}

function readCountryText() {
  const countryInput = findInputByFieldText([
    /country|region/i,
    /国家|地区/i,
  ]);
  if (countryInput?.value) {
    return countryInput.value;
  }
  const countrySelect = getVisibleControls('select').find((select) => /country|region|国家|地区/i.test(getFieldText(select)));
  if (countrySelect) {
    const option = countrySelect.selectedOptions?.[0];
    return option?.textContent || countrySelect.value || '';
  }
  const countryDropdown = findCountryDropdown();
  if (countryDropdown) {
    return getCountryDropdownValue(countryDropdown);
  }
  return '';
}

function isLikelyAddressSearchInput(input) {
  const text = getFieldText(input);
  if (isNonAddressSearchInput(input)) {
    return false;
  }
  if (/name|email|e-mail|phone|tel|password|coupon|promo|country|region|postal|zip|city|state|province|card|card\s*number|expiry|expiration|security|cvc|cvv|cc-|全名|姓名|邮箱|电话|密码|国家|地区|邮编|城市|省|州|银行卡|卡号|有效期|安全码/i.test(text)) {
    return false;
  }
  if (/address|street|billing|search|line\s*1|地址|街道|账单/i.test(text)) {
    return true;
  }
  return false;
}

function hasCreditCardFields() {
  return getVisibleTextInputs().some((input) => {
    const text = getFieldText(input);
    return /card\s*number|card|expiry|expiration|security\s*code|cvc|cvv|银行卡|卡号|有效期|安全码/i.test(text);
  });
}

function hasBillingAddressFields() {
  return getVisibleTextInputs().some((input) => {
    const text = getFieldText(input);
    return /address|street|billing|line\s*1|地址|街道|账单/i.test(text)
      && !/card\s*number|card|expiry|expiration|security|cvc|cvv|银行卡|卡号|有效期|安全码/i.test(text);
  });
}

function hasPaymentMethodSelectionMarker(el) {
  if (!el) return false;
  const className = typeof el.className === 'string' ? el.className : el.getAttribute?.('class') || '';
  return el.checked === true
    || el.getAttribute?.('aria-checked') === 'true'
    || el.getAttribute?.('aria-selected') === 'true'
    || el.getAttribute?.('data-state') === 'checked'
    || el.getAttribute?.('data-selected') === 'true'
    || /\b(selected|checked|active)\b/i.test(className);
}

function hasSelectedPaymentMethodControl(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  const config = getPaymentMethodConfig(method);
  const candidates = getPaymentMethodSearchCandidates(config.id);
  return candidates.some((candidate) => {
    let current = candidate;
    for (let depth = 0; current && depth < 6; depth += 1, current = current.parentElement) {
      if (isDocumentLevelContainer(current)) break;
      const currentMatchesPayment = config.patterns.some((pattern) => pattern.test(getCombinedSearchText(current)));
      if (currentMatchesPayment && hasPaymentMethodSelectionMarker(current)) {
        return true;
      }

      const radio = current.querySelector?.('input[type="radio"], [role="radio"]');
      if (
        radio
        && config.patterns.some((pattern) => pattern.test(getCombinedSearchText(current) || getCombinedSearchText(radio)))
        && hasPaymentMethodSelectionMarker(radio)
      ) {
        return true;
      }
    }
    return false;
  });
}

function hasSelectedPayPalControl() {
  return hasSelectedPaymentMethodControl(PLUS_PAYMENT_METHOD_PAYPAL);
}

function hasSelectedGoPayControl() {
  return hasSelectedPaymentMethodControl(PLUS_PAYMENT_METHOD_GOPAY);
}

function isPaymentMethodActive(method = PLUS_PAYMENT_METHOD_PAYPAL) {
  return hasSelectedPaymentMethodControl(method);
}

function isPayPalPaymentMethodActive() {
  return isPaymentMethodActive(PLUS_PAYMENT_METHOD_PAYPAL);
}

function isGoPayPaymentMethodActive() {
  return isPaymentMethodActive(PLUS_PAYMENT_METHOD_GOPAY);
}

async function waitForPaymentMethodActive(method = PLUS_PAYMENT_METHOD_PAYPAL, timeoutMs = 5000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    throwIfStopped();
    if (isPaymentMethodActive(method)) {
      return true;
    }
    await sleep(250);
  }
  return false;
}

async function waitForPayPalPaymentMethodActive(timeoutMs = 5000) {
  return waitForPaymentMethodActive(PLUS_PAYMENT_METHOD_PAYPAL, timeoutMs);
}

async function findAddressSearchInput() {
  return waitUntil(() => {
    const direct = findInputByFieldText([
      /address|street|billing|search|line\s*1/i,
      /地址|街道|账单/i,
    ], {
      exclude: (input) => /city|state|province|postal|zip|country|城市|省|州|邮编|国家|地区/i.test(getFieldText(input)),
    });
    if (direct && !isNonAddressSearchInput(direct)) return direct;
    const candidates = getVisibleTextInputs().filter(isLikelyAddressSearchInput);
    return candidates[0] || null;
  }, {
    label: '地址搜索输入框',
    intervalMs: 250,
  });
}

function getAddressSuggestions() {
  const selectors = [
    '[role="listbox"] [role="option"]',
    '[role="option"]',
    '.pac-container .pac-item',
    '[data-testid*="address" i] [role="option"]',
    'li',
  ];
  const seen = new Set();
  const results = [];
  for (const selector of selectors) {
    for (const el of Array.from(document.querySelectorAll(selector))) {
      if (!isVisibleElement(el)) continue;
      const text = normalizeText(el.textContent || el.getAttribute?.('aria-label') || '');
      if (!text || text.length < 3) continue;
      const key = `${selector}:${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(el);
    }
  }
  return results;
}

function findBillingAddressLine1Input() {
  const direct = document.getElementById('billingAddressLine1')
    || document.querySelector('input[name="billingAddressLine1"]')
    || document.querySelector('input[autocomplete="billing address-line1"]')
    || document.querySelector('input[autocomplete="address-line1"]');
  if (direct && isVisibleElement(direct) && isEnabledControl(direct)) {
    return direct;
  }
  return null;
}

function dispatchInputValue(input, value) {
  if (typeof fillInput === 'function') {
    fillInput(input, value);
    return;
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function clampViewportCoordinate(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, numeric));
}

function clickAddressSuggestionCoordinateFallback(input) {
  const rect = input.getBoundingClientRect();
  const viewportWidth = Math.max(1, Number(window.innerWidth) || Number(document.documentElement?.clientWidth) || 1);
  const viewportHeight = Math.max(1, Number(window.innerHeight) || Number(document.documentElement?.clientHeight) || 1);
  const clientX = clampViewportCoordinate(rect.left + rect.width / 2, 1, viewportWidth - 1);
  const clientY = clampViewportCoordinate(rect.top + rect.height * 2.5, 1, viewportHeight - 1);
  const eventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX,
    clientY,
    button: 0,
    buttons: 1,
  };
  const target = document.elementFromPoint?.(clientX, clientY) || document.body || input;
  const pointerCtor = typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
  target.dispatchEvent(new pointerCtor('pointerdown', eventInit));
  target.dispatchEvent(new MouseEvent('mousedown', eventInit));
  target.dispatchEvent(new pointerCtor('pointerup', { ...eventInit, buttons: 0 }));
  target.dispatchEvent(new MouseEvent('mouseup', { ...eventInit, buttons: 0 }));
  target.dispatchEvent(new MouseEvent('click', { ...eventInit, buttons: 0 }));
  if (typeof target.click === 'function' && target !== document.body && target !== document.documentElement) {
    target.click();
  }
  return {
    clientX,
    clientY,
    targetTag: target.tagName || '',
  };
}

async function selectAddressSuggestion(seed) {
  await fillAddressQuery(seed);
  return clickAddressSuggestion(seed);
}

async function clickAddressSuggestion(seed = {}) {
  const suggestions = await waitUntil(() => {
    const options = getAddressSuggestions();
    return options.length ? options : null;
  }, {
    label: '地址推荐列表',
    intervalMs: 250,
    timeoutMs: 6000,
  });

  const suggestionIndex = Math.max(0, Math.min(
    suggestions.length - 1,
    Math.floor(Number(seed.suggestionIndex) || 0)
  ));
  const target = suggestions[suggestionIndex] || suggestions[0];
  simulateClick(target);
  await sleep(1200);
  return {
    selectedText: normalizeText(target.textContent || ''),
    suggestionIndex,
  };
}

async function retryAddressTaxAutocomplete(payload = {}) {
  await waitForDocumentComplete();
  const addressError = getHostedOpenAiAddressErrorState();
  if (!addressError.hasError) {
    return {
      retried: false,
      reason: 'address-tax-error-not-found',
      hostedAddressError: false,
      hostedAddressErrorMessage: '',
    };
  }

  const addressInput = findBillingAddressLine1Input() || await findAddressSearchInput();
  if (!addressInput) {
    throw new Error('Plus Checkout: address tax retry could not find billing address input.');
  }

  addressInput.scrollIntoView?.({ block: 'center', inline: 'center', behavior: 'instant' });
  addressInput.focus?.({ preventScroll: true });
  await sleep(100);

  const beforeValue = String(addressInput.value || '');
  if (!beforeValue) {
    throw new Error('Plus Checkout: address tax retry found an empty billing address input.');
  }
  const afterValue = beforeValue.slice(0, -1);
  dispatchInputValue(addressInput, afterValue);
  await sleep(Math.max(0, Math.floor(Number(payload.afterDeleteWaitMs) || 2000)));

  const suggestions = getAddressSuggestions();
  const suggestion = suggestions[0] || null;
  let selectionMethod = 'coordinate';
  let selectedText = '';
  let coordinateClick = null;
  if (suggestion) {
    simulateClick(suggestion);
    selectionMethod = 'dom';
    selectedText = normalizeText(suggestion.textContent || suggestion.getAttribute?.('aria-label') || '');
  } else {
    coordinateClick = clickAddressSuggestionCoordinateFallback(addressInput);
  }

  await sleep(Math.max(0, Math.floor(Number(payload.afterSelectWaitMs) || 2000)));
  return {
    retried: true,
    hostedAddressError: true,
    hostedAddressErrorMessage: addressError.message,
    inputId: addressInput.id || '',
    inputName: addressInput.getAttribute?.('name') || addressInput.name || '',
    beforeValue,
    afterValue,
    selectionMethod,
    selectedText,
    coordinateClick,
  };
}

async function fillAddressQuery(seed = {}) {
  if (seed.forceCountrySelectionBeforeAutocomplete && seed.countryCode) {
    const countryDropdown = findCountryDropdown();
    if (countryDropdown) {
      await selectCountryDropdown(countryDropdown, seed.countryCode);
    }
  }
  const addressInput = await findAddressSearchInput();
  fillInput(addressInput, seed.query || 'Berlin Mitte');
  await sleep(800);
  return {
    filled: true,
  };
}

function getRegionCandidates(value) {
  const raw = normalizeText(value);
  if (!raw) return [];
  const aliases = {
    act: 'Australian Capital Territory',
    nsw: 'New South Wales',
    nt: 'Northern Territory',
    qld: 'Queensland',
    sa: 'South Australia',
    tas: 'Tasmania',
    vic: 'Victoria',
    wa: 'Western Australia',
    tokyo: '東京都',
    osaka: '大阪府',
  };
  const compact = raw.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  const candidates = [raw];
  if (aliases[compact]) {
    candidates.push(aliases[compact]);
  }
  for (const [abbr, name] of Object.entries(aliases)) {
    const compactName = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    if (compact === compactName) {
      candidates.push(abbr.toUpperCase());
    }
  }
  return Array.from(new Set(candidates.filter(Boolean)));
}

function getCountryCandidates(value = '') {
  const raw = normalizeText(value);
  const compact = raw.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  const aliases = {
    AR: ['Argentina', '阿根廷'],
    AU: ['Australia', '澳大利亚'],
    CA: ['Canada', '加拿大'],
    CN: ['China', '中国'],
    DE: ['Germany', 'Deutschland', '德国'],
    ES: ['Spain', '西班牙'],
    FR: ['France', '法国'],
    GB: ['United Kingdom', 'UK', 'Britain', 'England', '英国'],
    HK: ['Hong Kong', '香港'],
    ID: ['Indonesia', '印度尼西亚', '印尼'],
    IT: ['Italy', '意大利'],
    JP: ['Japan', '日本', '日本国'],
    KR: ['Korea', 'South Korea', '韩国'],
    MY: ['Malaysia', '马来西亚'],
    NL: ['Netherlands', 'Holland', '荷兰'],
    PH: ['Philippines', '菲律宾'],
    RU: ['Russia', '俄罗斯'],
    SG: ['Singapore', '新加坡'],
    TH: ['Thailand', '泰国'],
    TR: ['Turkey', 'Turkiye', '土耳其'],
    TW: ['Taiwan', '台湾'],
    US: ['United States', 'United States of America', 'USA', '美国'],
    VN: ['Vietnam', '越南'],
  };
  const indonesiaCandidates = aliases.ID || [];
  if (compact === 'id' || compact === 'indonesia' || compact === '印度尼西亚' || compact === '印尼') {
    return Array.from(new Set([raw, 'ID', ...indonesiaCandidates].filter(Boolean)));
  }
  const direct = aliases[String(raw || '').trim().toUpperCase()] || [];
  const matched = Object.entries(aliases).find(([code, names]) => {
    if (String(code).toLowerCase() === compact) return true;
    return names.some((name) => {
      const normalizedName = normalizeText(name).toLowerCase();
      const compactName = normalizedName.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
      return compact === compactName || normalizedName === raw.toLowerCase();
    });
  });
  return Array.from(new Set([raw, ...direct, ...(matched ? matched[1] : [])].filter(Boolean)));
}

function matchesCountryOption(text, desiredValue) {
  const normalizedText = normalizeText(text).toLowerCase();
  const compactText = normalizedText.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  if (!compactText) return false;
  return getCountryCandidates(desiredValue).some((candidate) => {
    const normalizedCandidate = normalizeText(candidate).toLowerCase();
    const compactCandidate = normalizedCandidate.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    if (!compactCandidate) return false;
    return normalizedText === normalizedCandidate
      || compactText === compactCandidate
      || (compactCandidate.length > 3 && compactText.includes(compactCandidate));
  });
}

function findCountryDropdown() {
  const controls = getVisibleControls('select, button, [role="button"], [role="combobox"], [aria-haspopup="listbox"]');
  return controls.find((control) => {
    if (!isEnabledControl(control) || isDocumentLevelContainer(control)) return false;
    const text = getFieldText(control);
    return /country/i.test(text) || /\u56fd\u5bb6|\u56fd\u5bb6\u6216\u5730\u533a/.test(text);
  }) || null;
}

function getCountryDropdownValue(control) {
  if (!control) return '';
  if (String(control.tagName || '').toUpperCase() === 'SELECT') {
    const selected = control.selectedOptions?.[0];
    return normalizeText(selected?.textContent || control.value || '');
  }
  return normalizeText(
    control.getAttribute?.('aria-valuetext')
    || control.getAttribute?.('aria-label')
    || control.getAttribute?.('data-value')
    || control.textContent
    || ''
  );
}

function matchesRegionOption(text, desiredValue) {
  const normalizedText = normalizeText(text).toLowerCase();
  const compactText = normalizedText.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  if (!compactText) return false;
  return getRegionCandidates(desiredValue).some((candidate) => {
    const normalizedCandidate = normalizeText(candidate).toLowerCase();
    const compactCandidate = normalizedCandidate.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    if (!compactCandidate) return false;
    return normalizedText === normalizedCandidate
      || compactText === compactCandidate
      || (compactCandidate.length > 3 && compactText.includes(compactCandidate));
  });
}

function findRegionDropdown() {
  const controls = getVisibleControls('select, button, [role="button"], [role="combobox"], [aria-haspopup="listbox"]');
  return controls.find((control) => {
    if (!isEnabledControl(control) || isDocumentLevelContainer(control)) return false;
    const text = getFieldText(control);
    if (/country/i.test(text) || /\u56fd\u5bb6|\u5730\u533a/.test(text)) return false;
    return /state|province|county|prefecture|administrative|administrative[_-]?area/i.test(text)
      || /(?:^|\s)region(?:\s|$)/i.test(text)
      || /\u5dde|\u7701|\u8f96\u533a|\u90fd\u9053\u5e9c\u53bf/.test(text);
  }) || null;
}

function getRegionDropdownValue(control) {
  if (!control) return '';
  if (String(control.tagName || '').toUpperCase() === 'SELECT') {
    const selected = control.selectedOptions?.[0];
    return normalizeText(selected?.textContent || control.value || '');
  }
  return normalizeText(
    control.getAttribute?.('aria-valuetext')
    || control.getAttribute?.('aria-label')
    || control.getAttribute?.('data-value')
    || control.textContent
    || ''
  );
}

function getVisibleRegionOptions() {
  const selectors = [
    '[role="listbox"] [role="option"]',
    '[role="option"]',
    'li',
  ];
  const seen = new Set();
  const options = [];
  for (const selector of selectors) {
    for (const option of Array.from(document.querySelectorAll(selector))) {
      if (!isVisibleElement(option)) continue;
      const text = normalizeText(getActionText(option) || option.textContent || '');
      if (!text || seen.has(text)) continue;
      seen.add(text);
      options.push(option);
    }
  }
  return options;
}

async function selectRegionDropdown(regionDropdown, value) {
  if (!regionDropdown || !value) return false;
  if (matchesRegionOption(getRegionDropdownValue(regionDropdown), value)) {
    return false;
  }

  if (String(regionDropdown.tagName || '').toUpperCase() === 'SELECT') {
    const option = Array.from(regionDropdown.options || []).find((item) => (
      matchesRegionOption(item.textContent || '', value)
      || matchesRegionOption(item.value || '', value)
    ));
    if (!option) {
      throw new Error(`Plus Checkout: state dropdown option "${value}" was not found.`);
    }
    regionDropdown.value = option.value;
    option.selected = true;
    regionDropdown.dispatchEvent(new Event('input', { bubbles: true }));
    regionDropdown.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  simulateClick(regionDropdown);
  await sleep(250);
  const startedAt = Date.now();
  let option = null;
  while (Date.now() - startedAt < 2500) {
    throwIfStopped();
    option = getVisibleRegionOptions().find((item) => (
      matchesRegionOption(getActionText(item) || item.textContent || '', value)
    ));
    if (option) break;
    await sleep(100);
  }
  if (!option) {
    const visibleOptions = getVisibleRegionOptions()
      .map((item) => normalizeText(getActionText(item) || item.textContent || ''))
      .filter(Boolean)
      .slice(0, 12)
      .join(' | ');
    throw new Error(`Plus Checkout: state dropdown option "${value}" was not found. Visible options: ${visibleOptions || 'none'}.`);
  }
  simulateClick(option);
  await sleep(500);
  return true;
}

async function selectCountryDropdown(countryDropdown, value) {
  if (!countryDropdown || !value) return false;
  if (matchesCountryOption(getCountryDropdownValue(countryDropdown), value)) {
    return false;
  }

  if (String(countryDropdown.tagName || '').toUpperCase() === 'SELECT') {
    const option = Array.from(countryDropdown.options || []).find((item) => (
      matchesCountryOption(item.textContent || '', value)
      || matchesCountryOption(item.value || '', value)
    ));
    if (!option) {
      throw new Error(`Plus Checkout: country dropdown option "${value}" was not found.`);
    }
    countryDropdown.value = option.value;
    option.selected = true;
    countryDropdown.dispatchEvent(new Event('input', { bubbles: true }));
    countryDropdown.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(500);
    return true;
  }

  simulateClick(countryDropdown);
  await sleep(250);
  const startedAt = Date.now();
  let option = null;
  while (Date.now() - startedAt < 2500) {
    throwIfStopped();
    option = getVisibleRegionOptions().find((item) => (
      matchesCountryOption(getActionText(item) || item.textContent || '', value)
    ));
    if (option) break;
    await sleep(100);
  }
  if (!option) {
    const visibleOptions = getVisibleRegionOptions()
      .map((item) => normalizeText(getActionText(item) || item.textContent || ''))
      .filter(Boolean)
      .slice(0, 12)
      .join(' | ');
    throw new Error(`Plus Checkout: country dropdown option "${value}" was not found. Visible options: ${visibleOptions || 'none'}.`);
  }
  simulateClick(option);
  await sleep(700);
  return true;
}

function getStructuredAddressFields() {
  const address1 = findInputByFieldText([
    /address\s*(?:line)?\s*1|address[_-]?line[_-]?1|address\[(?:address_)?line1\]|line\s*1|street|street[_-]?address/i,
    /地址\s*1|街道|详细地址|住所/i,
  ]);
  const address2 = findInputByFieldText([
    /address\s*(?:line)?\s*2|address[_-]?line[_-]?2|address\[(?:address_)?line2\]|line\s*2|apt|suite|unit/i,
    /地址\s*2|公寓|单元|门牌/i,
  ]);
  const city = findInputByFieldText([
    /city|town|suburb|locality|address[_-]?level[_-]?2|address\[city\]/i,
    /城市|市区|区市町村|市区町村|市町村/i,
  ]);
  const region = findInputByFieldText([
    /state|province|region|county|prefecture|administrative|administrative[_-]?area|address[_-]?level[_-]?1|address\[state\]/i,
    /省|州|地区|辖区|都道府县|都道府県/i,
  ]);
  const postalCode = findInputByFieldText([
    /postal|zip|postcode|postal[_-]?code|zip[_-]?code|address\[postal_code\]/i,
    /邮编|邮政|郵便番号/i,
  ]);
  return { address1, address2, city, region, postalCode };
}

function fillIfEmpty(input, value, options = {}) {
  if (!input || !value) return false;
  if (!options.overwrite && String(input.value || '').trim()) return false;
  if (options.overwrite && String(input.value || '').trim() === String(value || '').trim()) return false;
  fillInput(input, value);
  return true;
}

function isDropdownStructuredAddressForm(fields = getStructuredAddressFields()) {
  return Boolean(
    findCountryDropdown()
    && findRegionDropdown()
    && fields.address1
    && fields.city
    && fields.postalCode
  );
}

async function ensureStructuredAddress(seed, options = {}) {
  const fallback = seed?.fallback || {};
  const overwrite = Boolean(options.overwrite);
  const countryDropdown = findCountryDropdown();
  if (countryDropdown && seed?.countryCode) {
    await selectCountryDropdown(countryDropdown, seed.countryCode);
  }
  const fields = await waitUntil(() => {
    const currentFields = getStructuredAddressFields();
    if (currentFields.address1 || currentFields.city || currentFields.postalCode) {
      return currentFields;
    }
    return null;
  }, {
    label: '结构化账单地址字段',
    intervalMs: 250,
    timeoutMs: 6000,
  });

  fillIfEmpty(fields.address1, fallback.address1, { overwrite });
  fillIfEmpty(fields.city, fallback.city, { overwrite });
  await selectRegionDropdown(findRegionDropdown(), fallback.region);
  fillIfEmpty(fields.postalCode, fallback.postalCode, { overwrite });
  await sleep(500);

  const latest = getStructuredAddressFields();
  const missing = [];
  if (!String(latest.address1?.value || '').trim()) missing.push('地址1');
  if (!String(latest.city?.value || '').trim()) missing.push('城市');
  if (!String(latest.postalCode?.value || '').trim()) missing.push('邮编');
  if (missing.length) {
    throw new Error(`Plus Checkout：账单地址字段未填写完整：${missing.join('、')}。`);
  }

  return {
    address1: latest.address1?.value || '',
    city: latest.city?.value || '',
    region: getRegionDropdownValue(findRegionDropdown()) || latest.region?.value || '',
    postalCode: latest.postalCode?.value || '',
  };
}

function findSubscribeButton() {
  const submitButtons = getVisibleControls('button[type="submit"], input[type="submit"]');
  const exactSubmit = submitButtons.find((button) => (
    isEnabledControl(button)
    && /订阅|subscribe|购买\s*ChatGPT\s*Plus|start\s*subscription|place\s*order/i.test(getCombinedSearchText(button))
  ));
  if (exactSubmit) {
    return exactSubmit;
  }

  return findClickableByText([
    /订阅|继续|确认|支付/i,
    /subscribe|continue|confirm|pay|start\s*subscription|place\s*order/i,
  ]);
}

function isBusySubscribeButton(button) {
  if (!button) return true;
  const text = getActionText(button);
  return button.disabled
    || button.getAttribute?.('aria-disabled') === 'true'
    || button.getAttribute?.('aria-busy') === 'true'
    || button.closest?.('[aria-busy="true"], [data-loading="true"], [data-state="loading"]')
    || /loading|processing|submitting|请稍候|处理中|加载中/i.test(text);
}

const SUBSCRIBE_READY_TEXT_PATTERN = /\u8ba2\u9605|\u7ee7\u7eed|\u786e\u8ba4|\u652f\u4ed8|subscribe|continue|confirm|pay|\u8d2d\u4e70\s*ChatGPT\s*Plus|start\s*subscription|place\s*order/i;
const SUBSCRIBE_PROCESSING_TEXT_PATTERN = /\u6b63\u5728\u5904\u7406|\u5904\u7406\u4e2d|\u8bf7\u7a0d\u5019|\u52a0\u8f7d\u4e2d|loading|processing|submitting/i;

function getSubscribeButtonState(button) {
  if (!button) {
    return {
      found: false,
      enabled: false,
      busy: false,
      ready: false,
      status: 'missing',
      text: '',
    };
  }
  const text = normalizeText([
    button.innerText,
    button.textContent,
    button.value,
    button.getAttribute?.('aria-label'),
  ].filter(Boolean).join(' ')) || getActionText(button);
  const searchText = getCombinedSearchText(button);
  const combinedText = normalizeText(`${text} ${searchText}`);
  const enabled = isEnabledControl(button);
  const busy = Boolean(isBusySubscribeButton(button) || SUBSCRIBE_PROCESSING_TEXT_PATTERN.test(combinedText));
  const readyText = SUBSCRIBE_READY_TEXT_PATTERN.test(combinedText);
  const ready = Boolean(enabled && readyText && !busy);
  return {
    found: true,
    enabled,
    busy,
    ready,
    status: busy ? 'processing' : (!enabled ? 'disabled' : (readyText ? 'ready' : 'unknown')),
    text: text || searchText,
  };
}

function getAssociatedForm(button) {
  if (!button) return null;
  if (button.form) return button.form;
  const formId = String(button.getAttribute?.('form') || '').trim();
  if (formId) {
    return document.getElementById(formId) || null;
  }
  return button.closest?.('form') || null;
}

async function humanLikeClick(el) {
  throwIfStopped();
  if (!el) {
    throw new Error('无法点击空元素。');
  }

  el.scrollIntoView?.({ block: 'center', inline: 'center', behavior: 'instant' });
  await sleep(300);
  if (typeof el.focus === 'function') {
    el.focus({ preventScroll: true });
    await sleep(150);
  }

  const rect = el.getBoundingClientRect();
  const clientX = Math.floor(rect.left + rect.width / 2);
  const clientY = Math.floor(rect.top + rect.height / 2);
  const eventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX,
    clientY,
    button: 0,
    buttons: 1,
  };
  const pointerCtor = typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
  const events = [
    ['pointerover', pointerCtor],
    ['pointerenter', pointerCtor],
    ['mouseover', MouseEvent],
    ['mouseenter', MouseEvent],
    ['pointermove', pointerCtor],
    ['mousemove', MouseEvent],
    ['pointerdown', pointerCtor],
    ['mousedown', MouseEvent],
    ['pointerup', pointerCtor],
    ['mouseup', MouseEvent],
    ['click', MouseEvent],
  ];

  for (const [type, EventCtor] of events) {
    throwIfStopped();
    el.dispatchEvent(new EventCtor(type, eventInit));
    await sleep(type === 'mousedown' || type === 'pointerdown' ? 120 : 30);
  }

  if (typeof el.click === 'function') {
    await sleep(120);
    el.click();
  }

  const type = String(el.getAttribute?.('type') || el.type || '').trim().toLowerCase();
  const form = getAssociatedForm(el);
  if (
    form
    && typeof form.requestSubmit === 'function'
    && (
      (String(el.tagName || '').toUpperCase() === 'BUTTON' && (!type || type === 'submit'))
      || (String(el.tagName || '').toUpperCase() === 'INPUT' && type === 'submit')
    )
  ) {
    await sleep(250);
    form.requestSubmit(el);
  }

  console.log('[MultiPage:plus-checkout] 已执行拟人工点击', summarizeElementForDebug(el));
  log(`已拟人工点击 [${el.tagName}] "${el.textContent?.trim().slice(0, 30) || ''}"`);
}

async function fillPlusBillingAndSubmit(payload = {}) {
  await waitForDocumentComplete();
  const paymentMethod = normalizePlusPaymentMethod(payload.paymentMethod);
  await selectPaymentMethod(paymentMethod);
  const billingResult = await fillPlusBillingAddress(payload);

  if (payload.skipSubmit) {
    return {
      ...billingResult,
      submitted: false,
    };
  }

  await clickPlusSubscribe();
  return {
    ...billingResult,
    submitted: true,
  };
}

async function fillPlusBillingAddress(payload = {}) {
  await waitForDocumentComplete();
  const countryText = readCountryText();
  const seed = payload.addressSeed || {
    query: 'Berlin Mitte',
    suggestionIndex: 1,
    fallback: {
      address1: 'Unter den Linden',
      city: 'Berlin',
      region: 'Berlin',
      postalCode: '10117',
    },
  };
  let selected = { selectedText: '' };
  const fields = getStructuredAddressFields();
  const useDirectStructuredBranch = Boolean(seed.skipAutocomplete || isDropdownStructuredAddressForm(fields));
  if (!useDirectStructuredBranch) {
    await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'fill', label: 'fill-address-query' }, async () => {
      await fillFullName(payload.fullName || '');
      await fillAddressQuery(seed);
    });
    selected = await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'select', label: 'select-address-suggestion' }, async () => (
      clickAddressSuggestion(seed)
    ));
  }
  const structuredAddress = await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'fill', label: 'fill-billing-address' }, async () => {
    if (useDirectStructuredBranch) {
      await fillFullName(payload.fullName || '');
    }
    return ensureStructuredAddress(seed, {
      overwrite: useDirectStructuredBranch,
    });
  });

  return {
    countryText,
    selectedAddressText: selected.selectedText,
    structuredAddress,
  };
}

async function fillPlusAddressQuery(payload = {}) {
  await waitForDocumentComplete();
  const seed = payload.addressSeed || {};
  await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'fill', label: 'fill-address-query' }, async () => {
    await fillFullName(payload.fullName || '');
    await fillAddressQuery(seed);
  });
  return {
    countryText: readCountryText(),
    queryFilled: true,
  };
}

async function selectPlusAddressSuggestion(payload = {}) {
  await waitForDocumentComplete();
  const selected = await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'select', label: 'select-address-suggestion' }, async () => (
    clickAddressSuggestion(payload.addressSeed || {})
  ));
  return {
    selectedAddressText: selected.selectedText,
    suggestionIndex: selected.suggestionIndex,
  };
}

async function ensurePlusStructuredBillingAddress(payload = {}) {
  await waitForDocumentComplete();
  const structuredAddress = await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'fill', label: 'fill-billing-address' }, async () => (
    ensureStructuredAddress(payload.addressSeed || {}, {
      overwrite: Boolean(payload.overwriteStructuredAddress),
    })
  ));
  return {
    countryText: readCountryText(),
    structuredAddress,
  };
}

async function clickPlusSubscribe(payload = {}) {
  const paymentMethod = normalizePlusPaymentMethod(payload.paymentMethod);
  if ((payload.ensurePayPalActive || payload.ensurePaymentActive) && !isPaymentMethodActive(paymentMethod)) {
    await selectPaymentMethod(paymentMethod);
  }

  const subscribeButton = await waitUntil(() => {
    const button = findSubscribeButton();
    return button || null;
  }, {
    label: '订阅按钮',
    intervalMs: 250,
    timeoutMs: 10000,
  });
  const buttonState = getSubscribeButtonState(subscribeButton);
  if (!buttonState.ready) {
    log(`订阅按钮当前状态 [${buttonState.status}] "${buttonState.text.slice(0, 40)}"，本轮不点击`);
    return {
      clicked: false,
      subscribeButtonBusy: buttonState.busy,
      subscribeButtonEnabled: buttonState.enabled,
      subscribeButtonStatus: buttonState.status,
      subscribeButtonText: buttonState.text,
    };
  }

  await sleep(Math.max(0, Math.floor(Number(payload.beforeClickDelayMs) || 0)));
  await performOperationWithDelay({ stepKey: 'plus-checkout-billing', kind: 'submit', label: 'click-subscribe' }, async () => {
    await humanLikeClick(subscribeButton);
  });
  return {
    clicked: true,
    subscribeButtonStatus: 'clicked',
    subscribeButtonText: buttonState.text,
  };
}

async function readChatGptSessionAccessToken() {
  const sessionResponse = await fetch('/api/auth/session', {
    credentials: 'include',
  });
  const session = await sessionResponse.json().catch(() => ({}));
  return {
    session,
    accessToken: String(session?.accessToken || '').trim(),
  };
}

async function inspectPlusCheckoutState(options = {}) {
  const structuredAddress = getStructuredAddressFields();
  const subscribeButtonState = getSubscribeButtonState(findSubscribeButton());
  const hostedAddressError = getHostedOpenAiAddressErrorState();
  const hostedCardDeclinedError = getHostedOpenAiCardDeclinedState();
  const hostedCardFallback = getHostedOpenAiCardFallbackState();
  const hostedEmailInput = findHostedEditableEmailInput();
  const hostedReadOnlyEmailField = findHostedReadOnlyEmailField();
  const state = {
    url: location.href,
    readyState: document.readyState,
    countryText: readCountryText(),
    hasPayPal: Boolean(findPayPalPaymentMethodTarget()),
    hasGoPay: Boolean(findGoPayPaymentMethodTarget()),
    paypalCandidates: getPayPalCandidateSummaries(),
    gopayCandidates: getGoPayCandidateSummaries(),
    paymentTextPreview: getPaymentTextPreview(),
    cardFieldsVisible: hasCreditCardFields(),
    billingFieldsVisible: hasBillingAddressFields(),
    hasSubscribeButton: subscribeButtonState.found,
    subscribeButtonBusy: subscribeButtonState.busy,
    subscribeButtonEnabled: subscribeButtonState.enabled,
    subscribeButtonStatus: subscribeButtonState.status,
    subscribeButtonText: subscribeButtonState.text,
    hostedOpenAiPage: isPayPalHostedOpenAiCheckoutPage(),
    hostedVerificationVisible: hasHostedOpenAiVerificationDialog(),
    hostedPayPalButtonFound: Boolean(findHostedPayPalButton()),
    hostedEmailInputDetected: Boolean(hostedEmailInput),
    hostedReadOnlyEmailDetected: Boolean(hostedReadOnlyEmailField),
    hostedReadOnlyEmailLabel: getHostedReadOnlyEmailLabel(hostedReadOnlyEmailField),
    hostedReadOnlyEmailSummary: getHostedElementDiagnosticText(hostedReadOnlyEmailField),
    hostedAddressError: hostedAddressError.hasError,
    hostedAddressErrorMessage: hostedAddressError.message,
    hostedCardDeclinedError: hostedCardDeclinedError.hasError,
    hostedCardDeclinedErrorMessage: hostedCardDeclinedError.message,
    hostedCardFallback: hostedCardFallback.fallback,
    hostedCardFallbackReason: hostedCardFallback.reason,
    hostedCardFallbackReasons: hostedCardFallback.reasons,
    hostedPaypalDisabledSignals: hostedCardFallback.paypalDisabledSignals,
    hostedCardAccordionSelected: hostedCardFallback.cardAccordionSelected,
    checkoutAmountSummary: getCheckoutAmountSummary(),
    homePlanFallback: inspectChatGptHomePlanFallback(),
    hostedAddressFieldValues: getHostedAddressFieldValues(),
    addressFieldValues: {
      address1: structuredAddress.address1?.value || '',
      city: structuredAddress.city?.value || '',
      region: getRegionDropdownValue(findRegionDropdown()) || structuredAddress.region?.value || '',
      postalCode: structuredAddress.postalCode?.value || '',
    },
  };
  if (options.includeSession || options.includeAccessToken) {
    const sessionState = await readChatGptSessionAccessToken();
    state.session = sessionState.session;
    state.accessToken = sessionState.accessToken;
  }
  return state;
}
})();
