const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('background/steps/create-plus-checkout.js', 'utf8');
const checkoutConversionProxySource = fs.readFileSync('background/checkout-conversion-proxy.js', 'utf8');
const plusCheckoutSource = fs.readFileSync('content/plus-checkout.js', 'utf8');
const gopayUtilsSource = fs.readFileSync('gopay-utils.js', 'utf8');
const globalScope = {};
new Function('self', `${gopayUtilsSource};`)(globalScope);
const api = new Function('self', `${source}; return self.MultiPageBackgroundPlusCheckoutCreate;`)(globalScope);
const checkoutProxyApi = new Function('self', `${checkoutConversionProxySource}; return self.MultiPageBackgroundCheckoutConversionProxy;`)({});

function createCheckoutContentHarness(options = {}) {
  const checkoutEvents = [];
  const attrs = new Map();
  let listener = null;
  const elements = [];
  const includeHostedEmailInput = options.includeHostedEmailInput !== false;
  const locationHref = options.locationHref || 'https://chatgpt.com/checkout/openai_ie/cs_test';
  const locationUrl = new URL(locationHref);
  const omitHostedPayPalButton = Boolean(options.omitHostedPayPalButton);

  function createElement({ tagName = 'DIV', text = '', attrs: initialAttrs = {}, id = '', type = '', value = '', className = '' } = {}) {
    const attrMap = new Map(Object.entries(initialAttrs));
    if (id) attrMap.set('id', id);
    if (type) attrMap.set('type', type);
    if (className) attrMap.set('class', className);
    const element = {
      nodeType: 1,
      tagName,
      id,
      type,
      value,
      textContent: text,
      innerText: text,
      className: className || initialAttrs.class || '',
      checked: initialAttrs.checked === 'true',
      disabled: false,
      hidden: false,
      dataset: {},
      children: [],
      parentElement: null,
      style: { display: 'block', visibility: 'visible' },
      getAttribute(name) {
        if (name === 'class') return this.className;
        if (name === 'id') return this.id || attrMap.get(name) || '';
        if (name === 'type') return this.type || attrMap.get(name) || '';
        return attrMap.has(name) ? attrMap.get(name) : '';
      },
      setAttribute(name, nextValue) {
        attrMap.set(name, String(nextValue));
      },
      closest() {
        return null;
      },
      matches(selector) {
        const text = String(selector || '');
        const role = this.getAttribute?.('role') || '';
        if (text.includes('button') && this.tagName === 'BUTTON') return true;
        if (text.includes('a') && this.tagName === 'A') return true;
        if (text.includes('label') && this.tagName === 'LABEL') return true;
        if (text.includes('[role="button"]') && role === 'button') return true;
        if (text.includes('[role="radio"]') && role === 'radio') return true;
        if (text.includes('[role="tab"]') && role === 'tab') return true;
        if (text.includes('[tabindex]') && this.getAttribute?.('tabindex')) return true;
        if (text.includes('input[type="radio"]') && this.tagName === 'INPUT' && this.type === 'radio') return true;
        return false;
      },
      querySelector() {
        return null;
      },
      scrollIntoView() {},
      focus() {},
      dispatchEvent() {
        return true;
      },
      click() {},
      getBoundingClientRect() {
        return {
          left: 10,
          top: 20,
          width: Number(initialAttrs.width) || 180,
          height: Number(initialAttrs.height) || 44,
        };
      },
    };
    return element;
  }

  const paymentButton = createElement({ tagName: 'BUTTON', text: 'PayPal', attrs: { role: 'tab', 'aria-selected': '', 'data-testid': 'paypal-accordion-item-button' } });
  const hostedEmailInput = createElement({ tagName: 'INPUT', id: 'email', type: 'text', attrs: { name: 'email', placeholder: 'email@example.com' } });
  const hostedAddressInput = createElement({ tagName: 'INPUT', id: 'billingAddressLine1', type: 'text', attrs: { name: 'billingAddressLine1', placeholder: 'Address line 1' } });
  const hostedCityInput = createElement({ tagName: 'INPUT', id: 'billingLocality', type: 'text', attrs: { name: 'billingLocality', placeholder: 'City' } });
  const hostedPostalInput = createElement({ tagName: 'INPUT', id: 'billingPostalCode', type: 'text', attrs: { name: 'billingPostalCode', placeholder: 'Postal code' } });
  const termsCheckbox = createElement({ tagName: 'INPUT', id: 'termsOfServiceConsentCheckbox', type: 'checkbox', attrs: { type: 'checkbox' } });
  const hostedCardNumberInput = createElement({ tagName: 'INPUT', id: 'cardNumber', type: 'text', attrs: { name: 'cardNumber', placeholder: 'Card number' } });
  const hostedCardAccordion = createElement({
    tagName: 'BUTTON',
    text: 'Card Card number CVC Expiry',
    attrs: { 'data-testid': 'card-accordion-item-button', 'aria-selected': 'true' },
    className: 'card-accordion-item selected',
  });
  const hostedPaypalDisabledFrame = createElement({
    tagName: 'IFRAME',
    attrs: { src: 'https://checkout.stripe.com/frame?paymentMethods][paypal]=never' },
  });
  hostedPaypalDisabledFrame.src = hostedPaypalDisabledFrame.getAttribute('src');
  const hostedErrorAlert = createElement({
    tagName: 'DIV',
    text: options.hostedErrorText || '',
    attrs: { role: 'alert', class: 'Error' },
  });
  const fullNameInput = createElement({ tagName: 'INPUT', id: 'name', type: 'text', attrs: { name: 'billingName', placeholder: 'Full name' } });
  const addressInput = createElement({ tagName: 'INPUT', id: 'address', type: 'text', attrs: { name: 'addressLine1', placeholder: 'Address line 1' } });
  const cityInput = createElement({ tagName: 'INPUT', id: 'city', type: 'text', attrs: { name: 'locality', placeholder: 'City' } });
  const postalInput = createElement({ tagName: 'INPUT', id: 'postal', type: 'text', attrs: { name: 'postalCode', placeholder: 'Postal code' } });
  const hostedStateSelect = {
    ...createElement({ tagName: 'SELECT', id: 'billingAdministrativeArea' }),
    options: [
      { value: 'NY', textContent: 'New York', label: 'New York' },
      { value: 'TX', textContent: 'Texas', label: 'Texas' },
    ],
    value: '',
  };
  const suggestionOption = createElement({ tagName: 'LI', text: 'Unter den Linden 1, Berlin', attrs: { role: 'option', class: 'pac-item' } });
  const subscribeButton = createElement({ tagName: 'BUTTON', text: 'Subscribe', attrs: { type: 'submit', 'aria-label': 'Subscribe', 'data-testid': 'submit-button' } });
  subscribeButton.type = 'submit';
  elements.push(
    paymentButton,
    hostedAddressInput,
    hostedCityInput,
    hostedPostalInput,
    termsCheckbox,
    hostedStateSelect,
    fullNameInput,
    addressInput,
    cityInput,
    postalInput,
    suggestionOption,
    subscribeButton
  );
  if (includeHostedEmailInput) {
    elements.push(hostedEmailInput);
  }
  if (options.includeHostedCardBranch) {
    elements.push(hostedCardNumberInput, hostedCardAccordion);
  }
  if (options.includeHostedPaypalDisabledFrame) {
    elements.push(hostedPaypalDisabledFrame);
  }
  if (options.hostedErrorText) {
    elements.push(hostedErrorAlert);
  }

  const context = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    location: {
      href: locationHref,
      host: locationUrl.host,
      hostname: locationUrl.hostname,
      pathname: locationUrl.pathname,
    },
    window: {},
    CSS: { escape: (value) => String(value) },
    Event: class TestEvent { constructor(type) { this.type = type; } },
    MouseEvent: class TestMouseEvent { constructor(type) { this.type = type; } },
    PointerEvent: class TestPointerEvent { constructor(type) { this.type = type; } },
    document: {
      readyState: 'complete',
      body: {},
      documentElement: {
        getAttribute(name) {
          return attrs.get(name) || null;
        },
        setAttribute(name, nextValue) {
          attrs.set(name, String(nextValue));
        },
      },
      getElementById(id) {
        return elements.find((element) => element.id === id) || null;
      },
      querySelector(selector) {
        const text = String(selector || '');
        if (text === '[data-testid="paypal-accordion-item-button"]') return omitHostedPayPalButton ? null : paymentButton;
        if (text === '#email' || text === 'input[type="email"]' || text === 'input[name="email"]') {
          return includeHostedEmailInput ? hostedEmailInput : null;
        }
        if (text === '#billingAddressLine1') return hostedAddressInput;
        if (text === '#billingLocality') return hostedCityInput;
        if (text === '#billingPostalCode') return hostedPostalInput;
        if (text === '#billingAdministrativeArea') return hostedStateSelect;
        if (text === '#termsOfServiceConsentCheckbox') return termsCheckbox;
        if (text === 'button[data-testid="submit-button"]') return subscribeButton;
        return null;
      },
      querySelectorAll(selector) {
        const text = String(selector || '');
        if (text.includes('label[for=')) return [];
        if (text.includes('[role="option"]') || text.includes('.pac-item') || text === 'li') return [suggestionOption];
      if (text === 'iframe') return options.includeHostedPaypalDisabledFrame ? [hostedPaypalDisabledFrame] : [];
        if (
          options.hostedErrorText
          && (
            text.includes('[role="alert"]')
            || text.includes('[aria-live]')
            || text.includes('[class*="error"]')
            || text.includes('[class*="Error"]')
            || text.includes('.Error')
            || text.includes('.error')
          )
        ) {
          return [hostedErrorAlert];
        }
        if (text.includes('[data-testid="card-accordion-item"]') || text.includes('.card-accordion-item')) {
          return options.includeHostedCardBranch ? [hostedCardAccordion] : [];
        }
        if (text === 'input, textarea') return elements.filter((element) => element.tagName === 'INPUT');
        if (text.includes('button[type="submit"]')) return [subscribeButton];
        if (
          text.includes('button')
          || text.includes('span')
          || text.includes('div')
          || text.includes('img')
          || text.includes('svg')
          || text.includes('[role=')
          || text.includes('[tabindex]')
          || text.includes('[data-testid]')
          || text.includes('[aria-label]')
          || text.includes('[title]')
        ) {
          return elements.filter((element) => {
            if (omitHostedPayPalButton && element === paymentButton) return false;
            const role = element.getAttribute?.('role') || '';
            return element.tagName === 'BUTTON'
              || element.tagName === 'A'
              || element.tagName === 'LABEL'
              || role === 'button'
              || role === 'radio'
              || role === 'tab'
              || Boolean(element.getAttribute?.('tabindex'))
              || Boolean(element.getAttribute?.('data-testid'))
              || Boolean(element.getAttribute?.('aria-label'))
              || Boolean(element.getAttribute?.('title'))
              || ['DIV', 'SPAN', 'IMG', 'SVG'].includes(element.tagName);
          });
        }
        if (text.includes('select') || text.includes('[aria-haspopup="listbox"]')) return [];
        return [];
      },
    },
    chrome: {
      runtime: {
        onMessage: {
          addListener(fn) {
            listener = fn;
          },
        },
      },
    },
    CodexOperationDelay: {
      async performOperationWithDelay(metadata, operation) {
        checkoutEvents.push({ type: 'operation', label: metadata.label, kind: metadata.kind });
        const result = await operation();
        checkoutEvents.push({ type: 'delay', label: metadata.label, ms: 2000 });
        return result;
      },
    },
    resetStopState() {},
    isStopError() { return false; },
    throwIfStopped() {},
    sleep() { return Promise.resolve(); },
    log() {},
    fillInput(element, nextValue) {
      element.value = nextValue;
      checkoutEvents.push({ type: 'fill', id: element.id || '', value: nextValue });
    },
    simulateClick(element) {
      if (element === paymentButton) {
        paymentButton.setAttribute('aria-selected', 'true');
        checkoutEvents.push({ type: 'click', target: 'paypal' });
        return;
      }
      if (element === subscribeButton) {
        checkoutEvents.push({ type: 'click', target: 'subscribe' });
        return;
      }
      if (element === termsCheckbox) {
        termsCheckbox.checked = true;
        checkoutEvents.push({ type: 'click', target: 'terms' });
      }
    },
  };
  context.window = context;
  context.window.getComputedStyle = (element) => element?.style || { display: 'block', visibility: 'visible' };
  context.window.__PAYPAL_HOSTED_EMAIL_INPUT_TIMEOUT_MS__ = options.hostedEmailInputTimeoutMs || 15000;

  vm.createContext(context);
  vm.runInContext(plusCheckoutSource, context);
  assert.equal(typeof listener, 'function');

  async function send(message) {
    return await new Promise((resolve) => {
      listener(message, {}, resolve);
    });
  }

  return { checkoutEvents, send };
}

function createGpcBalanceResponse(overrides = {}) {
  return {
    code: 200,
    message: 'ok',
    data: {
      api_key: 'gpc_test',
      status: 'active',
      auto_mode_enabled: false,
      total_uses: 1000,
      remaining_uses: 998,
      used_uses: 2,
      ...overrides,
    },
  };
}

function createGpcTaskResponse(overrides = {}) {
  return {
    code: 200,
    message: 'ok',
    data: {
      task_id: 'task_123',
      status: 'active',
      status_text: '处理中',
      phone_mode: 'manual',
      remote_stage: 'checkout_start',
      ...overrides,
    },
  };
}

function createHostedRuntimeState(overrides = {}) {
  return {
    hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    hostedCheckoutPhoneNumber: '4155551234',
    ...overrides,
  };
}

function createHostedAddressResponse(address = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      address: {
        Address: '7 Fresh St',
        City: 'Austin',
        State_Full: 'Texas',
        Zip_Code: '73301',
        ...address,
      },
    }),
  };
}

test('Plus checkout create waits 20 seconds after opening checkout page by default', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 42 };
        },
        update: async (tabId, payload) => {
          events.push({ type: 'tab-update', tabId, payload });
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    registerTab: async (source, tabId) => {
      events.push({ type: 'register', source, tabId });
    },
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://checkout.stripe.com/c/pay/session',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePlusCheckoutCreate();

  assert.deepEqual(
    events.find((event) => event.type === 'tab-create'),
    { type: 'tab-create', payload: { url: 'https://chatgpt.com/', active: true } }
  );
  assert.deepEqual(
    events.find((event) => event.type === 'register'),
    { type: 'register', source: 'plus-checkout', tabId: 42 }
  );

  const sleepEvents = events.filter((event) => event.type === 'sleep');
  assert.deepStrictEqual(sleepEvents.map((event) => event.ms), [1000, 20000]);
  assert.deepStrictEqual(
    events.find((event) => event.type === 'tab-message')?.message?.payload,
    { paymentMethod: 'paypal', hostedCheckoutFinalStep: false }
  );
  assert.equal(
    events.some((event) => event.type === 'log' && /订阅页面已打开，固定等待 20 秒让页面稳定/.test(event.message)),
    true
  );

  const completeIndex = events.findIndex((event) => event.type === 'complete');
  const readyLogIndex = events.findIndex((event) => event.type === 'log' && /已就绪/.test(event.message));
  assert.ok(readyLogIndex > -1);
  assert.ok(completeIndex > readyLogIndex);
  assert.equal(events.some((event) => event.type === 'sleep' && event.ms === 20000), true);
});

test('Plus checkout create uses configured checkout open stable wait seconds', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 88 }),
        update: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://checkout.stripe.com/c/pay/session',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async () => {},
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    plusCheckoutOpenStableWaitSeconds: 12.8,
  });

  assert.deepStrictEqual(
    events.filter((event) => event.type === 'sleep').map((event) => event.ms),
    [1000, 12000]
  );
  assert.equal(
    events.some((event) => event.type === 'log' && /订阅页面已打开，固定等待 12 秒让页面稳定/.test(event.message)),
    true
  );
});

test('GoPay plus checkout create forwards gopay payment method to the checkout content script', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    checkoutConversionProxyManager: {
      applySessionFromState: async (state, options = {}) => {
        events.push({ type: 'proxy-apply', proxyUrl: state.plusCheckoutConversionProxyUrl, options });
        return {
          active: true,
          flowType: options.flowType,
          releaseNodeKey: options.releaseNodeKey,
          appliedStepKey: options.appliedStepKey,
          displayName: 'http://proxy.example:8080',
          snapshot: { applied: true },
        };
      },
      checkCheckoutConversionProxySessionExit: async (session, options = {}) => {
        events.push({ type: 'proxy-exit-check', session, options });
        return {
          status: 'success',
          exitIp: '203.0.113.42',
          exitRegion: 'US',
          displayName: session.displayName,
        };
      },
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 99 }),
        update: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push(message);
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_llc/test-session',
          country: 'ID',
          currency: 'IDR',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({ plusPaymentMethod: 'gopay' });

  assert.deepStrictEqual(events[0]?.payload, { paymentMethod: 'gopay', hostedCheckoutFinalStep: false });
  assert.equal(events.some((event) => event.type === 'proxy-apply'), false);
});

test('Classic PayPal checkout create applies conversion proxy before opening checkout link', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    checkoutConversionProxyManager: {
      applySessionFromState: async (state, options = {}) => {
        events.push({ type: 'proxy-apply', proxyUrl: state.plusCheckoutConversionProxyUrl, options });
        return {
          active: true,
          flowType: options.flowType,
          releaseNodeKey: options.releaseNodeKey,
          appliedStepKey: options.appliedStepKey,
          displayName: 'http://proxy.example:8080',
          snapshot: { applied: true },
        };
      },
      checkCheckoutConversionProxySessionExit: async (session, options = {}) => {
        events.push({ type: 'proxy-exit-check', session, options });
        return {
          status: 'success',
          exitIp: '203.0.113.42',
          exitRegion: 'US',
          displayName: session.displayName,
        };
      },
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 123 };
        },
        update: async (tabId, payload) => {
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: payload.url, status: 'complete' };
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_ie/test-session',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePlusCheckoutCreate({
    plusPaymentMethod: 'paypal',
    plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
    plusCheckoutOpenStableWaitSeconds: 0,
  });

  const updateIndex = events.findIndex((event) => event.type === 'tab-update');
  const createCheckoutIndex = events.findIndex((event) => (
    event.type === 'tab-message' && event.message?.type === 'CREATE_PLUS_CHECKOUT'
  ));
  const readyIndexes = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.type === 'ready')
    .map(({ index }) => index);
  const amountCheckIndex = events.findIndex((event) => (
    event.type === 'tab-message' && event.message?.type === 'PLUS_CHECKOUT_GET_STATE'
  ));
  const applyIndex = events.findIndex((event) => event.type === 'proxy-apply');
  const exitCheckIndex = events.findIndex((event) => event.type === 'proxy-exit-check');
  const setStateIndex = events.findIndex((event) => event.type === 'set-state');
  const completeIndex = events.findIndex((event) => event.type === 'complete');

  assert.ok(updateIndex > -1);
  assert.ok(createCheckoutIndex > -1);
  assert.ok(readyIndexes.length >= 2);
  assert.ok(applyIndex > createCheckoutIndex);
  assert.ok(applyIndex < updateIndex);
  assert.ok(exitCheckIndex > applyIndex);
  assert.ok(exitCheckIndex < updateIndex);
  assert.ok(amountCheckIndex > readyIndexes[readyIndexes.length - 1]);
  assert.ok(amountCheckIndex > updateIndex);
  assert.ok(setStateIndex > amountCheckIndex);
  assert.ok(completeIndex > setStateIndex);
  assert.equal(events[applyIndex].proxyUrl, 'http://proxy.example:8080');
  assert.equal(events[applyIndex].options.flowType, 'classic-paypal');
  assert.equal(events[applyIndex].options.releaseNodeKey, 'paypal-approve');
  assert.equal(events[applyIndex].options.appliedStepKey, 'plus-checkout-create');
  assert.equal(events[exitCheckIndex].options.context, 'classic-paypal');
  assert.equal(events[exitCheckIndex].options.requireExit, true);
  assert.equal(
    events.some((event) => event.type === 'log' && /跳转 Plus Checkout 链接前已启用支付转换代理/.test(event.message)),
    true
  );
});

test('Phone Plus classic checkout falls back before opening checkout link when conversion proxy exit check fails', async () => {
  const events = [];
  const appliedSession = {
    active: true,
    flowType: 'classic-paypal',
    releaseNodeKey: 'paypal-approve',
    appliedStepKey: 'plus-checkout-create',
    displayName: 'http://proxy.example:8080',
    snapshot: { applied: true },
  };
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    checkoutConversionProxyManager: {
      applySessionFromState: async () => appliedSession,
      checkCheckoutConversionProxySessionExit: async () => {
        throw new Error('未检测到支付转换代理出口 IP。');
      },
      getStoredSession: async () => appliedSession,
      restoreSession: async (session) => {
        events.push({ type: 'proxy-restore', session });
        return true;
      },
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 123 }),
        update: async (tabId, payload) => {
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: payload.url, status: 'complete' };
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      events.push({ type: 'fallback', state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'plus-checkout-billing', 'paypal-approve', 'plus-checkout-return'],
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_ie/test-session',
          country: 'US',
          currency: 'USD',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusHostedCheckoutIsFinalStep: false,
    plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
    plusCheckoutOpenStableWaitSeconds: 0,
  });

  assert.equal(events.some((event) => event.type === 'tab-update' && /checkout/.test(event.payload?.url || '')), false);
  assert.equal(events.some((event) => event.type === 'complete'), false);
  assert.equal(events.some((event) => event.type === 'proxy-restore'), true);
  const fallback = events.find((event) => event.type === 'fallback');
  assert.equal(fallback?.context?.reason, 'plus-checkout-conversion-proxy-failed');
  assert.match(fallback?.context?.detail || '', /未检测到支付转换代理出口 IP/);
});

test('Non Phone Plus classic checkout still stops when conversion proxy exit check fails', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    checkoutConversionProxyManager: {
      applySessionFromState: async () => ({
        active: true,
        flowType: 'classic-paypal',
        releaseNodeKey: 'paypal-approve',
        appliedStepKey: 'plus-checkout-create',
        displayName: 'http://proxy.example:8080',
        snapshot: { applied: true },
      }),
      checkCheckoutConversionProxySessionExit: async () => {
        throw new Error('未检测到支付转换代理出口 IP。');
      },
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 123 }),
        update: async (tabId, payload) => {
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: payload.url, status: 'complete' };
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_ie/test-session',
          country: 'US',
          currency: 'USD',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'paypal',
      plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
      plusCheckoutOpenStableWaitSeconds: 0,
    }),
    /未检测到支付转换代理出口 IP/
  );

  assert.equal(events.some((event) => event.type === 'tab-update' && /checkout/.test(event.payload?.url || '')), false);
  assert.equal(events.some((event) => event.type === 'complete'), false);
});

test('Phone Plus classic checkout falls back when conversion proxy apply fails', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    checkoutConversionProxyManager: {
      applySessionFromState: async () => {
        throw new Error('代理模式不是 fixed_servers（当前为 direct）。');
      },
      checkCheckoutConversionProxySessionExit: async () => {
        events.push({ type: 'proxy-exit-check' });
      },
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 123 }),
        update: async (tabId, payload) => {
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: payload.url, status: 'complete' };
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      events.push({ type: 'fallback', state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'plus-checkout-billing', 'paypal-approve', 'plus-checkout-return'],
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_ie/test-session',
          country: 'US',
          currency: 'USD',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusHostedCheckoutIsFinalStep: false,
    plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
    plusCheckoutOpenStableWaitSeconds: 0,
  });

  assert.equal(events.some((event) => event.type === 'tab-update'), false);
  assert.equal(events.some((event) => event.type === 'complete'), false);
  assert.equal(events.some((event) => event.type === 'proxy-exit-check'), false);
  const fallback = events.find((event) => event.type === 'fallback');
  assert.equal(fallback?.context?.reason, 'plus-checkout-conversion-proxy-failed');
  assert.match(fallback?.context?.detail || '', /代理模式不是 fixed_servers/);
});

test('PayPal hosted checkout create applies conversion proxy before hosted payment conversion', async () => {
  const events = [];
  let currentUrl = 'https://chatgpt.com/';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    checkoutConversionProxyManager: {
      applySessionFromState: async (state, options = {}) => {
        events.push({ type: 'proxy-apply', proxyUrl: state.plusCheckoutConversionProxyUrl, options });
        return {
          active: true,
          flowType: options.flowType,
          releaseNodeKey: options.releaseNodeKey,
          appliedStepKey: options.appliedStepKey,
          displayName: 'socks5://proxy.example:1080',
          snapshot: { applied: true },
        };
      },
      checkCheckoutConversionProxySessionExit: async (session, options = {}) => {
        events.push({ type: 'proxy-exit-check', session, options });
        return {
          status: 'success',
          exitIp: '198.51.100.8',
          exitRegion: 'US',
          displayName: session.displayName,
        };
      },
      getStoredSession: async () => ({
        active: true,
        flowType: 'paypal-hosted',
        releaseNodeKey: 'paypal-hosted-review',
        appliedStepKey: 'paypal-hosted-openai-checkout',
        displayName: 'socks5://proxy.example:1080',
        snapshot: { applied: true },
      }),
      restoreSession: async (session) => {
        events.push({ type: 'proxy-restore', snapshot: session?.snapshot || null });
        return true;
      },
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 42, url: payload.url, status: 'complete' };
        },
        update: async (tabId, payload) => {
          currentUrl = payload.url;
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: currentUrl, status: 'complete' };
        },
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    getState: async () => ({
      hostedCheckoutPhoneNumber: '4155551234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          preferredCheckoutUrl: 'https://pay.openai.com/c/pay/session',
          hostedCheckoutUrl: 'https://pay.openai.com/c/pay/session',
          checkoutUrl: 'https://pay.openai.com/c/pay/session',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/pay?token=BA-hosted';
        return { clicked: true };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
    waitForTabUrlMatchUntilStopped: async () => ({ url: currentUrl }),
  });

  await executor.executePlusCheckoutCreate({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutConversionProxyUrl: 'socks5h://user:pass@proxy.example:1080',
  });

  const applyIndex = events.findIndex((event) => event.type === 'proxy-apply');
  const messageIndex = events.findIndex((event) => event.type === 'tab-message' && event.message?.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP');
  assert.ok(applyIndex > -1);
  assert.ok(messageIndex > applyIndex);
  assert.equal(events[applyIndex].proxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(events[applyIndex].options.flowType, 'paypal-hosted');
  assert.equal(events.some((event) => event.type === 'proxy-restore'), false);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP'), true);
});

test('Phone Plus hosted checkout falls back when conversion proxy exit check fails before hosted submit', async () => {
  const events = [];
  let currentUrl = 'https://chatgpt.com/';
  const appliedSession = {
    active: true,
    flowType: 'paypal-hosted',
    releaseNodeKey: 'paypal-hosted-review',
    appliedStepKey: 'paypal-hosted-openai-checkout',
    displayName: 'socks5://proxy.example:1080',
    snapshot: { applied: true },
  };
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    checkoutConversionProxyManager: {
      applySessionFromState: async (state, options = {}) => {
        events.push({ type: 'proxy-apply', proxyUrl: state.plusCheckoutConversionProxyUrl, options });
        return appliedSession;
      },
      checkCheckoutConversionProxySessionExit: async (session, options = {}) => {
        events.push({ type: 'proxy-exit-check', session, options });
        throw new Error('未检测到支付转换代理出口 IP。');
      },
      getStoredSession: async () => appliedSession,
      restoreSession: async (session) => {
        events.push({ type: 'proxy-restore', session });
        return true;
      },
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 42, url: payload.url, status: 'complete' };
        },
        update: async (tabId, payload) => {
          currentUrl = payload.url;
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: currentUrl, status: 'complete' };
        },
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    getState: async () => ({
      phonePlusModeEnabled: true,
      hostedCheckoutPhoneNumber: '4155551234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
      plusPaymentEmailState: {
        current: 'saved-payment@example.com',
        source: 'runtime:test',
        updatedAt: 100,
      },
    }),
    getPlusPaymentEmailState: () => ({
      current: 'saved-payment@example.com',
      source: 'runtime:test',
      updatedAt: 100,
    }),
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      events.push({ type: 'fallback', state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'paypal-hosted-email', 'paypal-hosted-card', 'paypal-hosted-create-account', 'paypal-hosted-review'],
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          preferredCheckoutUrl: 'https://pay.openai.com/c/pay/session',
          hostedCheckoutUrl: 'https://pay.openai.com/c/pay/session',
          checkoutUrl: 'https://pay.openai.com/c/pay/session',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '$0.00',
          },
        };
      }
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        throw new Error('hosted submit should not run after phone plus proxy fallback');
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
    waitForTabUrlMatchUntilStopped: async () => ({ url: currentUrl }),
  });

  await executor.executePlusCheckoutCreate({
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutConversionProxyUrl: 'socks5h://user:pass@proxy.example:1080',
    plusPaymentEmailState: {
      current: 'saved-payment@example.com',
      source: 'runtime:test',
      updatedAt: 100,
    },
  });

  assert.equal(events.some((event) => event.type === 'proxy-apply'), true);
  assert.equal(events.some((event) => event.type === 'proxy-exit-check'), true);
  assert.equal(events.some((event) => event.type === 'proxy-restore'), true);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP'), false);
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'plus-checkout-create'), false);
  const fallback = events.find((event) => event.type === 'fallback');
  assert.equal(fallback?.context?.reason, 'plus-checkout-conversion-proxy-failed');
  assert.match(fallback?.context?.detail || '', /未检测到支付转换代理出口 IP/);
});

test('GPC checkout create does not apply checkout conversion proxy', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    checkoutConversionProxyManager: {
      applySessionFromState: async (state, options = {}) => {
        events.push({ type: 'proxy-apply', proxyUrl: state.plusCheckoutConversionProxyUrl, options });
        return {
          active: true,
          flowType: options.flowType,
          releaseNodeKey: options.releaseNodeKey,
          appliedStepKey: options.appliedStepKey,
          displayName: 'http://proxy.example:8080',
          snapshot: { applied: true },
        };
      },
      getStoredSession: async () => ({
        active: true,
        flowType: 'classic-paypal',
        releaseNodeKey: 'paypal-approve',
        appliedStepKey: 'plus-checkout-billing',
        displayName: 'http://proxy.example:8080',
        snapshot: { applied: true },
      }),
      restoreSession: async () => {
        events.push({ type: 'proxy-restore' });
        return true;
      },
    },
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => {
      throw new Error('should not call helper API without API Key');
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'gpc-helper',
      plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
      chatgptAccessToken: 'state-access-token',
      gopayHelperPhoneNumber: '+8613800138000',
      gopayHelperCountryCode: '+86',
      gopayHelperPin: '123456',
      gopayHelperApiKey: '',
    }),
    /缺少 API Key/
  );

  assert.deepStrictEqual(
    events.filter((event) => event.type === 'proxy-apply' || event.type === 'proxy-restore').map((event) => event.type),
    []
  );
});

test('checkout conversion proxy test applies fixed server proxy and restores previous auth state', async () => {
  const proxySettingsCalls = [];
  let authEntry = {
    host: 'old.proxy.example',
    port: 7890,
    username: 'old-user',
    password: 'old-pass',
  };
  let currentProxyValue = {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  };
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (details, callback) => {
            proxySettingsCalls.push({ type: 'get', details });
            callback({
              levelOfControl: 'controlled_by_this_extension',
              value: currentProxyValue,
            });
          },
          set: (details, callback) => {
            proxySettingsCalls.push({ type: 'set', details });
            currentProxyValue = details.value;
            callback();
          },
          clear: (details, callback) => {
            proxySettingsCalls.push({ type: 'clear', details });
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '203.0.113.9',
      region: 'US',
      source: 'page_context',
      endpoint: 'https://ipinfo.io/json',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'target_page_context',
    }),
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
  });

  const result = await manager.testCheckoutConversionProxy({
    proxyUrl: 'socks5h://user:p%40ss@proxy.example:1080',
  });

  assert.equal(result.ok, true);
  assert.equal(result.exitIp, '203.0.113.9');
  assert.equal(result.exitRegion, 'US');
  assert.deepStrictEqual(proxySettingsCalls.find((call) => call.type === 'set')?.details, {
    value: {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: 'socks5',
          host: 'proxy.example',
          port: 1080,
        },
        bypassList: ['<local>', 'localhost', '127.0.0.1'],
      },
    },
    scope: 'regular',
  });
  assert.deepStrictEqual(proxySettingsCalls.at(-1), {
    type: 'set',
    details: {
      value: {
        mode: 'pac_script',
        pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
      },
      scope: 'regular',
    },
  });
  assert.deepStrictEqual(authEntry, {
    host: 'old.proxy.example',
    port: 7890,
    username: 'old-user',
    password: 'old-pass',
  });
});

test('checkout conversion proxy getStoredSession tolerates null runtime session', async () => {
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: { runtime: {} },
    getState: async () => ({ plusCheckoutConversionProxySession: null }),
    setState: async () => {},
  });

  const session = await manager.getStoredSession({
    plusCheckoutConversionProxySession: null,
  });

  assert.equal(session, null);
});

test('checkout conversion proxy manual switch persists base snapshot and cancel restores original settings', async () => {
  let state = {
    plusCheckoutConversionProxyManualSession: null,
    plusCheckoutConversionProxyExitCheck: null,
    plusCheckoutConversionProxyUrl: '',
  };
  const broadcasts = [];
  let authEntry = {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  };
  let currentProxyValue = {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  };
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '203.0.113.77',
      region: 'US',
      source: 'page_context',
      endpoint: 'https://ipinfo.io/json',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'target_page_context',
    }),
  });

  const first = await manager.switchManualSession({ proxyUrl: 'socks5h://user:pass@proxy-a.example:1080' });
  assert.equal(first.switched, true);
  assert.equal(first.session.proxyUrl, 'socks5h://user:pass@proxy-a.example:1080');
  assert.equal(first.session.baseSnapshot.previousProxySettings.value.mode, 'pac_script');
  assert.equal(first.exitCheck.status, 'success');
  assert.equal(first.exitCheck.exitIp, '203.0.113.77');
  assert.equal(state.plusCheckoutConversionProxyExitCheck.exitIp, '203.0.113.77');
  assert.equal(
    broadcasts.some((payload) => payload.plusCheckoutConversionProxyExitCheck?.exitIp === '203.0.113.77'),
    true
  );

  currentProxyValue = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'socks5',
        host: 'proxy-a.example',
        port: 1080,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  };

  const second = await manager.switchManualSession({
    state,
    proxyUrl: 'http://proxy-b.example:8080',
  });
  assert.equal(second.switched, true);
  assert.equal(second.session.proxyUrl, 'http://proxy-b.example:8080');
  assert.equal(second.session.baseSnapshot.previousProxySettings.value.mode, 'pac_script');

  const cancelResult = await manager.cancelManualSession(state);
  assert.equal(cancelResult.cancelled, true);
  assert.equal(state.plusCheckoutConversionProxyManualSession, null);
  assert.equal(state.plusCheckoutConversionProxyExitCheck, null);
  assert.deepStrictEqual(currentProxyValue, {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  });
  assert.deepStrictEqual(authEntry, {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  });
});

test('checkout conversion proxy manual switch is noop for same proxy and blocks auto flow session apply', async () => {
  let state = {
    plusCheckoutConversionProxyUrl: 'http://saved.proxy:8080',
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      proxyUrl: 'http://saved.proxy:8080',
      displayName: 'http://saved.proxy:8080',
      entry: {
        protocol: 'http',
        host: 'saved.proxy',
        port: 8080,
        username: '',
        password: '',
      },
      baseSnapshot: {
        applied: true,
        entry: {
          protocol: 'http',
          host: 'saved.proxy',
          port: 8080,
          username: '',
          password: '',
        },
        previousProxySettings: {
          value: {
            mode: 'pac_script',
            pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
          },
        },
        previousAuthEntry: null,
      },
      appliedAt: 100,
      lastSwitchedAt: 100,
    },
  };
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: { runtime: {} },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const sameProxy = await manager.switchManualSession({
    state,
    proxyUrl: 'http://saved.proxy:8080',
  });
  assert.equal(sameProxy.switched, false);
  assert.equal(sameProxy.alreadyActive, true);

  await assert.rejects(
    () => manager.applySessionFromState(state, {
      flowType: 'classic-paypal',
      releaseNodeKey: 'paypal-approve',
      appliedStepKey: 'plus-checkout-billing',
    }),
    /请先点击“取消代理”/
  );
});

test('checkout conversion proxy 711 temporary pool manual switch pulls fresh pool and preserves restore snapshot', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    plusCheckoutConversionProxyManualSession: null,
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=JP&proto=http&stype=text',
      },
    },
  };
  let authEntry = {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  };
  let currentProxyValue = {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  };
  const poolCalls = [];
  const proxyModeWrites = [];
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            currentProxyValue = details.value;
            proxyModeWrites.push(details.value?.mode || '');
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async (poolState) => {
      assert.equal(currentProxyValue.mode, 'direct');
      poolCalls.push(poolState);
      return [{
        protocol: 'http',
        host: 'proxy-711.example',
        port: 8001,
        username: 'user-711',
        password: 'pass-711',
      }, {
        protocol: 'http',
        host: 'proxy-711-b.example',
        port: 8002,
        username: 'user-711-b',
        password: 'pass-711-b',
      }];
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '203.0.113.88',
      region: 'US',
      source: 'page_context',
      endpoint: 'https://chatgpt.com/cdn-cgi/trace',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'page_context',
    }),
  });

  const switched = await manager.switchManualSession({ state, source: '711proxy_pool', proxy711Region: 'US' });
  assert.equal(switched.switched, true);
  assert.equal(switched.session.source, '711proxy_pool');
  assert.equal(switched.session.provider, '711proxy');
  assert.equal(switched.session.requestedRegion, 'US');
  assert.equal(switched.session.resolvedRegion, 'US');
  assert.equal(switched.session.proxyUrl, 'http://user-711:pass-711@proxy-711.example:8001');
  assert.equal(switched.session.poolSize, 2);
  assert.equal(switched.session.candidateIndex, 0);
  assert.equal(switched.session.exitIp, '203.0.113.88');
  assert.equal(switched.session.exitRegion, 'US');
  assert.equal(switched.session.pool[1].host, 'proxy-711-b.example');
  assert.equal(poolCalls.length, 1);
  assert.equal(poolCalls[0].ipProxyService, '711proxy');
  assert.match(poolCalls[0].ipProxyApiUrl, /region=US/);
  assert.deepStrictEqual(proxyModeWrites.slice(0, 3), ['direct', 'pac_script', 'fixed_servers']);

  const cancelResult = await manager.cancelManualSession(state);
  assert.equal(cancelResult.cancelled, true);
  assert.equal(state.plusCheckoutConversionProxyManualSession, null);
  assert.deepStrictEqual(currentProxyValue, {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  });
  assert.deepStrictEqual(authEntry, {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  });
});

test('checkout conversion proxy 711 temporary pool refresh uses direct and restores fixed servers before applying candidate', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    ipProxyAutoRefreshPoolOnExhausted: true,
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=US&proto=http&stype=text',
      },
    },
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      source: '711proxy_pool',
      provider: '711proxy',
      proxyUrl: 'http://old-user:old-pass@proxy-old.example:8001',
      displayName: 'http://proxy-old.example:8001',
      requestedRegion: 'US',
      resolvedRegion: 'US',
      selectedEntryDisplayName: 'http://proxy-old.example:8001',
      entry: {
        protocol: 'http',
        host: 'proxy-old.example',
        port: 8001,
        username: 'old-user',
        password: 'old-pass',
      },
      pool: [{
        protocol: 'http',
        host: 'proxy-old.example',
        port: 8001,
        username: 'old-user',
        password: 'old-pass',
      }],
      candidateIndex: 0,
      poolSize: 1,
      exitIp: '203.0.113.10',
      exitRegion: 'US',
      baseSnapshot: {
        applied: true,
        entry: {
          protocol: 'http',
          host: 'proxy-old.example',
          port: 8001,
          username: 'old-user',
          password: 'old-pass',
        },
        previousProxySettings: {
          value: {
            mode: 'direct',
          },
        },
        previousAuthEntry: null,
      },
      appliedAt: 100,
      lastSwitchedAt: 100,
    },
  };
  let authEntry = {
    host: 'proxy-old.example',
    port: 8001,
    username: 'old-user',
    password: 'old-pass',
  };
  let currentProxyValue = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: 'proxy-old.example',
        port: 8001,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  };
  const proxyWrites = [];
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            proxyWrites.push(details.value);
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            proxyWrites.push(null);
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async () => {
      assert.equal(currentProxyValue.mode, 'direct');
      return [{
        protocol: 'http',
        host: 'proxy-fresh.example',
        port: 8002,
        username: 'fresh-user',
        password: 'fresh-pass',
      }];
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '203.0.113.20',
      region: 'US',
      source: 'page_context',
      endpoint: 'https://chatgpt.com/cdn-cgi/trace',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'page_context',
    }),
  });

  const result = await manager.switchManualSessionToNext711Proxy({
    state,
    source: '711proxy_pool',
    proxy711Region: 'US',
  });

  assert.equal(result.switched, true);
  assert.equal(result.session.entry.host, 'proxy-fresh.example');
  assert.equal(proxyWrites[0].mode, 'direct');
  assert.equal(proxyWrites[1].mode, 'fixed_servers');
  assert.equal(proxyWrites[1].rules.singleProxy.host, 'proxy-old.example');
  assert.equal(proxyWrites[2].mode, 'fixed_servers');
  assert.equal(proxyWrites[2].rules.singleProxy.host, 'proxy-fresh.example');
});

test('checkout conversion proxy 711 temporary pool pull failure restores proxy and reports direct route diagnostics', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    plusCheckoutConversionProxyManualSession: null,
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=US&proto=http&stype=text',
      },
    },
  };
  let currentProxyValue = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: 'proxy-active.example',
        port: 8001,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  };
  const proxyWrites = [];
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            proxyWrites.push(details.value);
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            proxyWrites.push(null);
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async () => {
      assert.equal(currentProxyValue.mode, 'direct');
      throw new Error('711 upstream denied');
    },
  });

  await assert.rejects(
    () => manager.switchManualSession({ state, source: '711proxy_pool', proxy711Region: 'US' }),
    (error) => {
      assert.match(error.message, /711 upstream denied/);
      assert.match(error.message, /Chrome direct/);
      assert.match(error.message, /Proxy restore succeeded/);
      return true;
    }
  );

  assert.equal(proxyWrites[0].mode, 'direct');
  assert.equal(proxyWrites[1].mode, 'fixed_servers');
  assert.equal(proxyWrites[1].rules.singleProxy.host, 'proxy-active.example');
  assert.equal(currentProxyValue.mode, 'fixed_servers');
  assert.equal(currentProxyValue.rules.singleProxy.host, 'proxy-active.example');
});

test('checkout conversion proxy 711 next switches stored pool index and preserves base snapshot', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    ipProxyAutoRefreshPoolOnExhausted: false,
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=US&proto=http&stype=text',
      },
    },
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      source: '711proxy_pool',
      provider: '711proxy',
      proxyUrl: 'http://user-a:pass-a@proxy-a.example:8001',
      displayName: 'http://proxy-a.example:8001',
      requestedRegion: 'US',
      resolvedRegion: 'US',
      selectedEntryDisplayName: 'http://proxy-a.example:8001',
      entry: {
        protocol: 'http',
        host: 'proxy-a.example',
        port: 8001,
        username: 'user-a',
        password: 'pass-a',
      },
      pool: [{
        protocol: 'http',
        host: 'proxy-a.example',
        port: 8001,
        username: 'user-a',
        password: 'pass-a',
      }, {
        protocol: 'http',
        host: 'proxy-b.example',
        port: 8002,
        username: 'user-b',
        password: 'pass-b',
      }],
      candidateIndex: 0,
      poolSize: 2,
      exitIp: '203.0.113.10',
      exitRegion: 'US',
      baseSnapshot: {
        applied: true,
        entry: {
          protocol: 'http',
          host: 'proxy-a.example',
          port: 8001,
          username: 'user-a',
          password: 'pass-a',
        },
        previousProxySettings: {
          value: {
            mode: 'pac_script',
            pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
          },
        },
        previousAuthEntry: {
          host: 'baseline.proxy',
          port: 7890,
          username: 'baseline-user',
          password: 'baseline-pass',
        },
      },
      appliedAt: 100,
      lastSwitchedAt: 100,
    },
  };
  let authEntry = {
    host: 'user-session.proxy',
    port: 8001,
    username: 'user-a',
    password: 'pass-a',
  };
  let currentProxyValue = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: 'proxy-a.example',
        port: 8001,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  };
  const appliedHosts = [];
  const exitQueue = [
    { ip: '203.0.113.20', region: 'US' },
  ];
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            currentProxyValue = details.value;
            appliedHosts.push(details.value?.rules?.singleProxy?.host || 'pac');
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async () => {
      throw new Error('should not refresh pool');
    },
    detectProxyExitInfoByPageContext: async () => {
      const next = exitQueue.shift() || { ip: '', region: '' };
      return {
        ...next,
        source: 'page_context',
        endpoint: 'https://chatgpt.com/cdn-cgi/trace',
      };
    },
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'page_context',
    }),
  });

  const switched = await manager.switchManualSessionToNext711Proxy({
    state,
    source: '711proxy_pool',
    proxy711Region: 'US',
  });

  assert.equal(switched.switched, true);
  assert.equal(switched.exitChanged, true);
  assert.equal(switched.session.candidateIndex, 1);
  assert.equal(switched.session.poolSize, 2);
  assert.equal(switched.session.proxyUrl, 'http://user-b:pass-b@proxy-b.example:8002');
  assert.equal(switched.session.exitIp, '203.0.113.20');
  assert.deepStrictEqual(switched.session.baseSnapshot.previousProxySettings.value, {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  });
  assert.deepStrictEqual(appliedHosts, ['proxy-b.example']);

  const cancelResult = await manager.cancelManualSession(state);
  assert.equal(cancelResult.cancelled, true);
  assert.deepStrictEqual(currentProxyValue, {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(){return "DIRECT";}' },
  });
  assert.deepStrictEqual(authEntry, {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  });
});

test('checkout conversion proxy 711 next starts a manual session when inactive', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    plusCheckoutConversionProxyManualSession: null,
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=US&proto=http&stype=text',
      },
    },
  };
  let authEntry = null;
  let currentProxyValue = {
    mode: 'direct',
  };
  const poolCalls = [];
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async (poolState) => {
      poolCalls.push(poolState);
      return [{
        protocol: 'http',
        host: 'proxy-first.example',
        port: 8001,
        username: 'first-user',
        password: 'first-pass',
      }];
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '203.0.113.44',
      region: 'US',
      source: 'page_context',
      endpoint: 'https://chatgpt.com/cdn-cgi/trace',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'page_context',
    }),
  });

  const switched = await manager.switchManualSessionToNext711Proxy({
    state,
    source: '711proxy_pool',
    proxy711Region: 'US',
  });

  assert.equal(switched.switched, true);
  assert.equal(switched.exitChanged, false);
  assert.equal(switched.session.candidateIndex, 0);
  assert.equal(switched.session.proxyUrl, 'http://first-user:first-pass@proxy-first.example:8001');
  assert.equal(switched.session.exitIp, '203.0.113.44');
  assert.equal(poolCalls.length, 1);
});

test('checkout conversion proxy 711 next skips at pool end when auto refresh is disabled', async () => {
  let state = {
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    ipProxyAutoRefreshPoolOnExhausted: false,
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      source: '711proxy_pool',
      provider: '711proxy',
      proxyUrl: 'http://user-a:pass-a@proxy-a.example:8001',
      displayName: 'http://proxy-a.example:8001',
      requestedRegion: 'US',
      resolvedRegion: 'US',
      selectedEntryDisplayName: 'http://proxy-a.example:8001',
      entry: {
        protocol: 'http',
        host: 'proxy-a.example',
        port: 8001,
        username: 'user-a',
        password: 'pass-a',
      },
      pool: [{
        protocol: 'http',
        host: 'proxy-a.example',
        port: 8001,
        username: 'user-a',
        password: 'pass-a',
      }],
      candidateIndex: 0,
      poolSize: 1,
      exitIp: '203.0.113.10',
      exitRegion: 'US',
      baseSnapshot: {
        applied: true,
        entry: {
          protocol: 'http',
          host: 'proxy-a.example',
          port: 8001,
          username: 'user-a',
          password: 'pass-a',
        },
        previousProxySettings: {
          value: {
            mode: 'direct',
          },
        },
        previousAuthEntry: null,
      },
      appliedAt: 100,
      lastSwitchedAt: 100,
    },
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&region=US&proto=http&stype=text',
      },
    },
  };
  let pullCalled = false;
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: { runtime: {} },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    normalizeIpProxyServiceProfiles: (profiles) => profiles,
    normalizeIpProxyServiceProfile: (profile) => profile,
    buildIpProxyServiceProfileFromState: (input) => input.ipProxyServiceProfiles?.['711proxy'] || {},
    normalizeIpProxyCountryCode: (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
    validate711ProxyApiConfig: ({ apiUrl }) => ({ valid: true, config: { apiUrl, region: 'US' } }),
    build711ProxyApiUrl: (_apiUrl, config = {}) => `http://global.rotgbapi.711proxy.com:8089/gen?region=${config.region || ''}`,
    pullIpProxyPoolFromApi: async () => {
      pullCalled = true;
      return [];
    },
  });

  const result = await manager.switchManualSessionToNext711Proxy({
    state,
    source: '711proxy_pool',
    proxy711Region: 'US',
  });

  assert.equal(result.switched, false);
  assert.equal(result.skipped, true);
  assert.match(result.skippedReason, /已到末尾/);
  assert.equal(pullCalled, false);
  assert.equal(state.plusCheckoutConversionProxyManualSession.candidateIndex, 0);
});

test('checkout conversion proxy direct mode test applies pac override and restores previous auth state', async () => {
  const proxySettingsCalls = [];
  let authEntry = {
    host: 'old.proxy.example',
    port: 7890,
    username: 'old-user',
    password: 'old-pass',
  };
  let currentProxyValue = {
    mode: 'pac_script',
    pacScript: { data: 'function FindProxyForURL(url, host){ return "PROXY baseline.proxy:7890"; }' },
  };
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            proxySettingsCalls.push(details);
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    detectProxyExitInfoByPageContext: async () => ({
      ip: '198.51.100.20',
      region: 'CN',
      source: 'page_context',
      endpoint: 'https://ipinfo.io/json',
    }),
    detectIpProxyTargetReachabilityByPageContext: async () => ({
      reachable: true,
      endpoint: 'https://chatgpt.com/',
      source: 'target_page_context',
    }),
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
  });

  const result = await manager.testCheckoutConversionProxy({
    source: 'direct',
    proxyUrl: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.proxyDisplayName, '无代理模式');
  assert.equal(proxySettingsCalls[0].value.mode, 'pac_script');
  assert.match(proxySettingsCalls[0].value.pacScript.data, /MULTIPAGE_CHECKOUT_CONVERSION_DIRECT_V1/);
  assert.equal(currentProxyValue.mode, 'pac_script');
  assert.match(currentProxyValue.pacScript.data, /PROXY baseline\.proxy:7890/);
  assert.deepStrictEqual(authEntry, {
    host: 'old.proxy.example',
    port: 7890,
    username: 'old-user',
    password: 'old-pass',
  });
});

test('checkout conversion proxy direct manual switch restores original settings on cancel', async () => {
  let state = {
    plusCheckoutConversionProxySource: 'direct',
    plusCheckoutConversionProxyManualSession: null,
  };
  let authEntry = {
    host: 'baseline.proxy',
    port: 7890,
    username: 'baseline-user',
    password: 'baseline-pass',
  };
  let currentProxyValue = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: 'baseline.proxy',
        port: 7890,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  };
  const manager = checkoutProxyApi.createCheckoutConversionProxyManager({
    chrome: {
      runtime: {},
      proxy: {
        settings: {
          get: (_details, callback) => callback({
            levelOfControl: 'controlled_by_this_extension',
            value: currentProxyValue,
          }),
          set: (details, callback) => {
            currentProxyValue = details.value;
            callback();
          },
          clear: (_details, callback) => {
            currentProxyValue = null;
            callback();
          },
        },
      },
    },
    getState: async () => ({ ...state }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    installIpProxyAuthListener: () => {},
    installIpProxyErrorListener: () => {},
    getCurrentIpProxyAuthEntry: () => authEntry,
    setCurrentIpProxyAuthEntry: (entry) => {
      authEntry = entry;
    },
  });

  const switched = await manager.switchManualSession({ state, source: 'direct', proxyUrl: '' });
  assert.equal(switched.switched, true);
  assert.equal(switched.session.source, 'direct');
  assert.equal(switched.session.displayName, '无代理模式');
  assert.equal(currentProxyValue.mode, 'pac_script');

  const cancelResult = await manager.cancelManualSession(state);
  assert.equal(cancelResult.cancelled, true);
  assert.equal(state.plusCheckoutConversionProxyManualSession, null);
  assert.deepStrictEqual(currentProxyValue, {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: 'baseline.proxy',
        port: 7890,
      },
      bypassList: ['<local>', 'localhost', '127.0.0.1'],
    },
  });
});

test('PayPal no-card binding create opens and submits hosted OpenAI checkout before completing', async () => {
  const events = [];
  let currentUrl = 'https://chatgpt.com/';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 55, url: payload.url, status: 'complete' };
        },
        update: async (tabId, payload) => {
          currentUrl = payload.url;
          events.push({ type: 'tab-update', tabId, payload });
          return { id: tabId, url: currentUrl, status: 'complete' };
        },
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => {
      events.push({ type: 'ready', source, tabId, options });
    },
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      assert.equal(url, 'https://www.meiguodizhi.com/api/v1/dz');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          address: {
            Address: '1 Main St',
            City: 'New York',
            State: 'New York',
            Zip_Code: '10001',
          },
        }),
      };
    },
    getState: async () => {
      events.push({ type: 'get-state' });
      return {
        hostedCheckoutPhoneNumber: '4155551234',
        hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
      };
    },
    registerTab: async (source, tabId) => {
      events.push({ type: 'register', source, tabId });
    },
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_llc/cs_hosted',
          preferredCheckoutUrl: 'https://pay.openai.com/c/pay/cs_hosted',
          hostedCheckoutUrl: 'https://pay.openai.com/c/pay/cs_hosted',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/pay?token=BA-hosted';
        return { clicked: true };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePlusCheckoutCreate({
    plusPaymentMethod: 'paypal-hosted',
    plusHostedCheckoutOauthDelaySeconds: 0,
  });

  assert.deepStrictEqual(
    events.find((event) => event.type === 'tab-message' && event.message.type === 'CREATE_PLUS_CHECKOUT')?.message?.payload,
    { paymentMethod: 'paypal-hosted', hostedCheckoutFinalStep: true }
  );
  assert.equal(
    events.find((event) => event.type === 'tab-update')?.payload?.url,
    'https://pay.openai.com/c/pay/cs_hosted'
  );
  const statePayload = events.filter((event) => event.type === 'set-state').at(-1)?.payload || {};
  assert.equal(statePayload.plusCheckoutSource, 'paypal-hosted');
  assert.equal(statePayload.plusCheckoutCountry, 'US');
  assert.equal(statePayload.plusCheckoutCurrency, 'USD');
  assert.equal(statePayload.plusReturnUrl, '');
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.type === 'FILL_PLUS_BILLING_AND_SUBMIT'), false);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP'), true);
  assert.equal(
    events.find((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP')?.message?.payload?.address?.street,
    '1 Main St'
  );
  assert.deepStrictEqual(events.find((event) => event.type === 'complete'), {
    type: 'complete',
    step: 'plus-checkout-create',
    payload: {
      plusCheckoutCountry: 'US',
      plusCheckoutCurrency: 'USD',
      plusCheckoutSource: 'paypal-hosted',
      plusCheckoutUrl: 'https://www.paypal.com/pay?token=BA-hosted',
      plusReturnUrl: '',
      plusHostedCheckoutCompleted: false,
    },
  });
});

test('Phone Plus classic checkout falls back at step 6 when checkout amount is non-zero', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 42 }),
        update: async (tabId, payload) => ({ id: tabId, url: payload.url, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      events.push({ type: 'fallback', state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'plus-checkout-billing', 'paypal-approve', 'plus-checkout-return'],
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_ie/cs_test',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 19.33,
            isZero: false,
            rawAmount: '€19.33',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePlusCheckoutCreate({
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusHostedCheckoutIsFinalStep: false,
  });

  assert.equal(events.some((event) => event.type === 'fallback'), true);
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'plus-checkout-create'), false);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'PLUS_CHECKOUT_GET_STATE'), true);
});

test('Phone Plus hosted checkout falls back at step 6 before submitting OpenAI hosted checkout when amount is non-zero', async () => {
  const events = [];
  let currentUrl = 'https://chatgpt.com/';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        create: async () => ({ id: 55, url: currentUrl, status: 'complete' }),
        update: async (tabId, payload) => {
          currentUrl = payload.url;
          return { id: tabId, url: currentUrl, status: 'complete' };
        },
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async () => {
      events.push({ type: 'ready' });
    },
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      events.push({ type: 'fallback', state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'paypal-hosted-email', 'paypal-hosted-card', 'paypal-hosted-create-account', 'paypal-hosted-review'],
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'CREATE_PLUS_CHECKOUT') {
        return {
          checkoutUrl: 'https://chatgpt.com/checkout/openai_llc/cs_hosted',
          preferredCheckoutUrl: 'https://pay.openai.com/c/pay/cs_hosted',
          hostedCheckoutUrl: 'https://pay.openai.com/c/pay/cs_hosted',
          country: 'US',
          currency: 'USD',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 19.33,
            isZero: false,
            rawAmount: '€19.33',
          },
        };
      }
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        throw new Error('hosted submit should not run after phone plus fallback');
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePlusCheckoutCreate({
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal-hosted',
    plusHostedCheckoutOauthDelaySeconds: 0,
  });

  assert.equal(events.some((event) => event.type === 'fallback'), true);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP'), false);
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'plus-checkout-create'), false);
});

test('PayPal no-card binding OpenAI checkout node submits hosted page and completes after success transition', async () => {
  const events = [];
  let currentUrl = 'https://pay.openai.com/c/pay/cs_hosted';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => {
      events.push({ type: 'ready', source, tabId, options });
    },
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      assert.equal(url, 'https://www.meiguodizhi.com/api/v1/dz');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          address: {
            Address: '1 Main St',
            City: 'New York',
            State: 'New York',
            Zip_Code: '10001',
          },
        }),
      };
    },
    getState: async () => ({
      hostedCheckoutPhoneNumber: '(415) 555-1234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async (source, tabId) => {
      events.push({ type: 'register', source, tabId });
    },
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        currentUrl = 'https://chatgpt.com/backend-api/payments/success?session_id=cs_hosted';
        return { clicked: true };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          hostedVerificationVisible: false,
          checkoutAmountSummary: {
            hasTodayDue: true,
            amount: 0,
            isZero: true,
            rawAmount: '€0.00',
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabCompleteUntilStopped: async () => {
      events.push({ type: 'tab-complete' });
    },
  });

  await executor.executePayPalHostedOpenAiCheckout({
    plusCheckoutTabId: 55,
    plusPaymentMethod: 'paypal-hosted',
    hostedCheckoutPhoneNumber: '2125550000',
    plusHostedCheckoutOauthDelaySeconds: 0,
  });

  const profileState = events.find((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile)?.payload || {};
  assert.equal(profileState.plusHostedCheckoutGuestProfile.phone, '2125550000');
  assert.equal(profileState.plusHostedCheckoutPhoneDigits, '2125550000');
  assert.equal(
    events.find((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP')?.message?.payload?.address?.street,
    '1 Main St'
  );
  assert.deepStrictEqual(events.find((event) => event.type === 'complete'), {
    type: 'complete',
    step: 'paypal-hosted-openai-checkout',
    payload: {
      plusCheckoutUrl: 'https://chatgpt.com/backend-api/payments/success?session_id=cs_hosted',
      plusCheckoutSource: 'paypal-hosted',
      plusReturnUrl: 'https://chatgpt.com/backend-api/payments/success?session_id=cs_hosted',
      plusHostedCheckoutCompleted: true,
    },
  });
});

test('PayPal hosted OpenAI checkout retries with a fresh address after address validation failure', async () => {
  const events = [];
  let currentUrl = 'https://pay.openai.com/c/pay/cs_hosted';
  let stateReads = 0;
  let addressIndex = 0;
  const addresses = [
    {
      Address: '8 Retry Ave',
      City: 'Austin',
      State: 'Texas',
      Zip_Code: '73301',
    },
  ];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    chrome: {
      tabs: {
        get: async (tabId) => {
          events.push({ type: 'tab-get', tabId, url: currentUrl });
          return { id: tabId, url: currentUrl, status: 'complete' };
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      assert.equal(url, 'https://www.meiguodizhi.com/api/v1/dz');
      const address = addresses[addressIndex] || addresses.at(-1);
      addressIndex += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({ address }),
      };
    },
    getState: async () => ({
      plusHostedCheckoutGuestProfile: {
        email: 'payment@example.com',
        phone: '2125550000',
        address: {
          street: '1 Main St',
          city: 'New York',
          state: 'New York',
          zip: '10001',
        },
      },
      hostedCheckoutPhoneNumber: '(415) 555-1234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        if (message.payload?.address?.street === '8 Retry Ave') {
          currentUrl = 'https://www.paypal.com/pay?token=BA-hosted';
        }
        return { clicked: true };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        stateReads += 1;
        if (stateReads === 1) {
          return {
            checkoutAmountSummary: {
              hasTodayDue: true,
              amount: 0,
              isZero: true,
              rawAmount: '$0.00',
            },
          };
        }
        if (stateReads === 2) {
          return {
            hostedAddressError: true,
            hostedAddressErrorMessage: 'Customer location isn\'t recognized.',
          };
        }
        currentUrl = 'https://www.paypal.com/pay?token=BA-hosted';
        return { hostedVerificationVisible: false };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async (ms) => events.push({ type: 'sleep', ms }),
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedOpenAiCheckout({
    plusCheckoutTabId: 55,
    plusPaymentMethod: 'paypal-hosted',
    plusHostedCheckoutGuestProfile: {
      email: 'payment@example.com',
      phone: '2125550000',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
    hostedCheckoutPhoneNumber: '2125550000',
    plusHostedCheckoutOauthDelaySeconds: 0,
  });

  const submitEvents = events.filter((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP');
  assert.equal(submitEvents.length, 2);
  assert.equal(submitEvents[0].message.payload.address.street, '1 Main St');
  assert.equal(submitEvents[1].message.payload.address.street, '8 Retry Ave');
  assert.equal(events.some((event) => event.type === 'fetch'), true);
  assert.equal(events.find((event) => event.type === 'complete')?.step, 'paypal-hosted-openai-checkout');
});

test('PayPal hosted OpenAI checkout throws card declined prefix after retry limit', async () => {
  const events = [];
  let currentUrl = 'https://pay.openai.com/c/pay/cs_hosted';
  let fetchCount = 0;
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => {
      fetchCount += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          address: {
            Address: `${fetchCount} Retry St`,
            City: 'Austin',
            State: 'Texas',
            Zip_Code: '73301',
          },
        }),
      };
    },
    getState: async () => ({
      plusHostedCheckoutGuestProfile: {
        email: 'payment@example.com',
        phone: '2125550000',
        address: {
          street: '1 Main St',
          city: 'New York',
          state: 'New York',
          zip: '10001',
        },
      },
      hostedCheckoutPhoneNumber: '(415) 555-1234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        return { clicked: true };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          hostedCardDeclinedError: true,
          hostedCardDeclinedErrorMessage: 'Your card was declined. Try another card.',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedOpenAiCheckout({
      plusCheckoutTabId: 55,
      plusPaymentMethod: 'paypal-hosted',
      hostedCheckoutPhoneNumber: '2125550000',
      plusHostedCheckoutOauthDelaySeconds: 0,
    }),
    /HOSTED_CHECKOUT_CARD_DECLINED::/
  );

  assert.equal(fetchCount, 3);
  assert.equal(events.filter((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP').length, 4);
});

test('PayPal hosted OpenAI checkout throws card fallback prefix without address retry', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://pay.openai.com/c/pay/cs_hosted', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          address: {
            Address: '1 Main St',
            City: 'New York',
            State: 'New York',
            Zip_Code: '10001',
          },
        }),
      };
    },
    getState: async () => ({
      plusHostedCheckoutGuestProfile: {
        email: 'payment@example.com',
        phone: '2125550000',
        address: {
          street: '1 Main St',
          city: 'New York',
          state: 'New York',
          zip: '10001',
        },
      },
      hostedCheckoutPhoneNumber: '(415) 555-1234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        return { clicked: true };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          hostedCardFallback: true,
          hostedCardFallbackReason: 'card fields are visible',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedOpenAiCheckout({
      plusCheckoutTabId: 55,
      plusPaymentMethod: 'paypal-hosted',
      hostedCheckoutPhoneNumber: '2125550000',
      plusHostedCheckoutOauthDelaySeconds: 0,
    }),
    /HOSTED_CHECKOUT_CARD_FALLBACK::/
  );

  assert.equal(events.filter((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP').length, 1);
});

test('PayPal hosted email node completes when Next navigation drops the content response', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/pay?token=EC-test';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    getState: async () => ({
      hostedCheckoutPhoneNumber: '(415) 555-1234',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
    }),
    registerTab: async (source, tabId) => events.push({ type: 'register', source, tabId }),
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test&token=EC-test';
        return new Promise(() => {});
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: currentUrl.includes('/signup')
            ? 'guest_checkout'
            : 'pay_login',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async (ms) => events.push({ type: 'sleep', ms }),
    waitForTabCompleteUntilStopped: async () => events.push({ type: 'tab-complete' }),
  });

  await executor.executePayPalHostedEmail({
    plusCheckoutTabId: 85661333,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551234',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(currentUrl.includes('/signup'), true);
  assert.equal(
    events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-email'),
    true
  );
  assert.equal(
    events.some((event) => event.type === 'log' && /已检测到 PayPal 进入后续页面（guest_checkout）/.test(event.message)),
    true
  );
  assert.equal(
    events.some((event) => event.type === 'tab-message' && event.message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'),
    true
  );
});

test('PayPal hosted generic_error creates manual confirmation when auto retry is disabled', async () => {
  const events = [];
  const broadcasts = [];
  let state = {
    autoRunRetryPaypalCallback: false,
  };
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async () => createHostedAddressResponse(),
    getState: async () => ({
      ...createHostedRuntimeState(),
      ...state,
    }),
    registerTab: async (source, tabId) => events.push({ type: 'register', source, tabId }),
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: 'generic_error',
          hostedGenericError: true,
          hostedGenericErrorMessage: 'Things don\'t appear to be working at the moment.',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
      state = { ...state, ...payload };
    },
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedCard({
      plusCheckoutTabId: 123,
      plusHostedCheckoutGuestProfile: {
        email: 'guest@example.com',
        phone: '4155551234',
        address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
      },
    }),
    /HOSTED_CHECKOUT_GENERIC_ERROR::Things don'?t appear/
  );

  assert.equal(state.plusManualConfirmationPending, true);
  assert.equal(state.plusManualConfirmationStep, 6);
  assert.equal(state.plusManualConfirmationMethod, 'paypal-hosted-generic-error');
  assert.equal(state.plusManualConfirmationTitle, 'PayPal Checkout 异常');
  assert.match(state.plusManualConfirmationMessage, /Things don'?t appear/);
  assert.equal(broadcasts.length, 1);
  assert.equal(broadcasts[0].plusManualConfirmationPending, true);
  assert.equal(broadcasts[0].plusManualConfirmationMethod, 'paypal-hosted-generic-error');
  assert.equal(events.some((event) => event.type === 'complete'), false);
});

test('PayPal hosted generic_error throws structured error without manual confirmation when auto retry is enabled', async () => {
  const events = [];
  const broadcasts = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async () => createHostedAddressResponse(),
    getState: async () => createHostedRuntimeState({
      autoRunRetryPaypalCallback: true,
    }),
    registerTab: async (source, tabId) => events.push({ type: 'register', source, tabId }),
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: 'generic_error',
          hostedGenericError: true,
          hostedGenericErrorMessage: 'PayPal isn\'t available at this time. Please choose another way to pay.',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedCard({
      plusCheckoutTabId: 123,
      plusHostedCheckoutGuestProfile: {
        email: 'guest@example.com',
        phone: '4155551234',
        address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
      },
    }),
    /HOSTED_CHECKOUT_GENERIC_ERROR::PayPal isn'?t available/
  );

  assert.equal(events.some((event) => event.type === 'set-state' && event.payload?.plusManualConfirmationPending), false);
  assert.equal(broadcasts.length, 0);
  assert.equal(events.some((event) => event.type === 'complete'), false);
});

test('PayPal hosted generic_error completes checkout create when refreshed session is Plus active', async () => {
  const events = [];
  const broadcasts = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 777, url: payload.url, status: 'complete' };
        },
        get: async (tabId) => ({
          id: tabId,
          url: tabId === 777 ? 'https://chatgpt.com/' : currentUrl,
          status: 'complete',
        }),
        reload: async (tabId) => events.push({ type: 'tab-reload', tabId }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async () => createHostedAddressResponse(),
    getState: async () => createHostedRuntimeState({
      autoRunRetryPaypalCallback: false,
    }),
    registerTab: async (source, tabId) => events.push({ type: 'register', source, tabId }),
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: 'generic_error',
          hostedGenericError: true,
          hostedGenericErrorMessage: 'Things don\'t appear to be working at the moment.',
        };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return {
          accessToken: 'access-token',
          session: {
            user: {
              plan_type: 'plus',
            },
          },
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551234',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  const completeEvent = events.find((event) => event.type === 'complete' && event.step === 'plus-checkout-create');
  assert.ok(completeEvent);
  assert.equal(completeEvent.payload.plusDetectedPlanType, 'plus');
  assert.equal(completeEvent.payload.plusCheckoutTabId, 777);
  assert.equal(completeEvent.payload.plusHostedCheckoutLastStage, 'generic_error');
  assert.equal(events.some((event) => event.type === 'set-state' && event.payload?.plusManualConfirmationPending), false);
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), false);
  assert.equal(broadcasts.length, 0);
});

test('PayPal hosted card node regenerates and persists a fresh guest profile before submitting guest checkout', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  const cachedProfile = {
    email: 'cached@example.com',
    password: 'cached-password',
    cardNumber: '4000000000000002',
    cardExpiry: '01 / 30',
    cardCvv: '999',
    firstName: 'Cached',
    lastName: 'Profile',
    phone: '9999999999',
    address: { street: 'Old St', city: 'Old City', state: 'Old State', zip: '00000' },
  };
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      return createHostedAddressResponse({
        Address: '7 Fresh St',
        City: 'Austin',
        State_Full: 'Texas',
        Zip_Code: '73301',
      });
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
        return {
          submitted: true,
          phoneMatched: true,
          payloadPhoneDigits: '4155551234',
          renderedPhoneDigits: '14155551234',
        };
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return currentUrl.includes('/create-account')
          ? { hostedStage: 'create_account' }
          : { hostedStage: 'guest_checkout' };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: cachedProfile,
  });

  const profileEvent = events.find((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile);
  const submitEvent = events.find((event) => event.type === 'tab-message' && event.message?.payload?.expectedStage === 'guest_checkout');
  const profileState = profileEvent?.payload?.plusHostedCheckoutGuestProfile || {};

  assert.ok(profileEvent);
  assert.ok(submitEvent);
  assert.equal(profileState.address.street, '7 Fresh St');
  assert.equal(profileState.address.city, 'Austin');
  assert.equal(profileState.address.state, 'Texas');
  assert.equal(profileState.address.zip, '73301');
  assert.equal(profileState.phone, '4155551234');
  assert.equal(profileState.firstName, 'James');
  assert.equal(profileState.lastName, 'Smith');
  assert.equal(profileState.email, cachedProfile.email);
  assert.notEqual(profileState.password, cachedProfile.password);
  assert.notEqual(profileState.cardNumber, cachedProfile.cardNumber);
  assert.equal(submitEvent.message.payload.address.street, '7 Fresh St');
  assert.equal(submitEvent.message.payload.firstName, 'James');
  assert.equal(submitEvent.message.payload.lastName, 'Smith');
  assert.equal(submitEvent.message.payload.phone, '4155551234');
  assert.equal(submitEvent.message.payload.email, profileState.email);
  assert.equal(submitEvent.message.payload.cardNumber, profileState.cardNumber);
  assert.ok(events.indexOf(profileEvent) < events.indexOf(submitEvent));
});

test('PayPal hosted card node regenerates and persists a fresh guest profile before short-circuiting on later stages', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/create-account', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      return createHostedAddressResponse({
        Address: '9 Later Stage Ave',
        City: 'Dallas',
        State_Full: 'Texas',
        Zip_Code: '75001',
      });
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return { hostedStage: 'create_account' };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 456,
    plusHostedCheckoutGuestProfile: {
      email: 'stale@example.com',
      phone: '9999999999',
      address: { street: 'Old St', city: 'Old City', state: 'Old State', zip: '00000' },
    },
  });

  const profileEvent = events.find((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile);
  const completeEvent = events.find((event) => event.type === 'complete' && event.step === 'paypal-hosted-card');
  const profileState = profileEvent?.payload?.plusHostedCheckoutGuestProfile || {};

  assert.ok(profileEvent);
  assert.ok(completeEvent);
  assert.equal(profileState.address.street, '9 Later Stage Ave');
  assert.equal(profileState.address.city, 'Dallas');
  assert.equal(profileState.phone, '4155551234');
  assert.equal(profileState.email, 'stale@example.com');
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'), false);
  assert.ok(events.indexOf(profileEvent) < events.indexOf(completeEvent));
});

test('PayPal hosted card node fails fresh profile regeneration instead of falling back to cached data', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      return {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedCard({
      plusCheckoutTabId: 789,
      plusHostedCheckoutGuestProfile: {
        email: 'cached@example.com',
        phone: '4155551234',
        address: { street: 'Old St', city: 'Old City', state: 'Old State', zip: '00000' },
      },
    }),
    /获取无卡直绑地址失败/
  );

  assert.equal(events.some((event) => event.type === 'complete'), false);
  assert.equal(events.some((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile), false);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'), false);
});

test('PayPal hosted card node continues when security challenge is reported', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  let submitCount = 0;
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => createHostedAddressResponse(),
    getState: async () => createHostedRuntimeState({
      hostedCheckoutSecurityChallengeEnabled: true,
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        if (submitCount > 0) {
          currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
          return { hostedStage: 'create_account' };
        }
        return {
          hostedStage: 'blocked',
          hostedBlocked: true,
          hostedBlockedMessage: 'This PayPal checkout is blocked by a security challenge.',
          hostedSecurityChallengeVisible: true,
          hostedSecurityChallengeSelector: '#captcha-standalone',
          hostedSecurityChallengeRemovable: true,
          hostedSecurityChallengeRemoved: true,
          hostedSecurityChallengeRestored: false,
          hostedSecurityChallengeError: '',
        };
      }
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        submitCount += 1;
        return {
          stage: 'guest_checkout',
          submitted: true,
          phoneMatched: true,
          payloadPhoneDigits: message.payload?.phone || '',
          renderedPhoneDigits: `1${message.payload?.phone || ''}`,
          hostedSecurityChallengeVisible: true,
          hostedSecurityChallengeSelector: '#captcha-standalone',
          hostedSecurityChallengeRemoved: true,
          hostedSecurityChallengeRestored: false,
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551234',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), true);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message?.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'), true);
  assert.equal(
    events.some((event) => (
      event.type === 'tab-message'
      && event.message?.type === 'PAYPAL_HOSTED_GET_STATE'
      && event.message?.payload?.securityChallengeEnabled === true
    )),
    true
  );
  assert.equal(events.some((event) => /HOSTED_CHECKOUT_PAYPAL_BLOCKED/.test(event.message || '')), false);
  assert.equal(
    events.some((event) => event.type === 'log' && /PayPal 安全挑战/.test(event.message) && /流程继续/.test(event.message)),
    true
  );
});

test('PayPal hosted card node sends security challenge disabled by default', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  let submitCount = 0;
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => createHostedAddressResponse(),
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        if (submitCount > 0) {
          currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
          return { hostedStage: 'create_account' };
        }
        return { hostedStage: 'guest_checkout' };
      }
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        submitCount += 1;
        return {
          stage: 'guest_checkout',
          submitted: true,
          phoneMatched: true,
          payloadPhoneDigits: message.payload?.phone || '',
          renderedPhoneDigits: `1${message.payload?.phone || ''}`,
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551234',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(
    events.some((event) => (
      event.type === 'tab-message'
      && event.message?.type === 'PAYPAL_HOSTED_GET_STATE'
      && event.message?.payload?.securityChallengeEnabled === false
    )),
    true
  );
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), true);
});

test('PayPal hosted card node retries fresh profile when guest card error appears', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  let submitCount = 0;
  let pollCountAfterFirstSubmit = 0;
  let fetchCount = 0;
  const addresses = [
    {
      Address: '7 Fresh St',
      City: 'Austin',
      State_Full: 'Texas',
      Zip_Code: '73301',
    },
    {
      Address: '8 Retry Ave',
      City: 'Boston',
      State_Full: 'Massachusetts',
      Zip_Code: '02108',
    },
  ];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      const address = addresses[Math.min(fetchCount, addresses.length - 1)];
      fetchCount += 1;
      return createHostedAddressResponse(address);
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        submitCount += 1;
        if (submitCount >= 2) {
          currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
        }
        return {
          submitted: true,
          phoneMatched: true,
          payloadPhoneDigits: message.payload?.phone,
          renderedPhoneDigits: `1${message.payload?.phone || ''}`,
        };
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        if (currentUrl.includes('/create-account')) {
          return { hostedStage: 'create_account' };
        }
        if (submitCount === 1) {
          pollCountAfterFirstSubmit += 1;
          return pollCountAfterFirstSubmit === 1
            ? {
                hostedStage: 'guest_checkout',
                hostedGuestCardError: true,
                hostedGuestCardErrorMessage: 'We couldn\'t add this card. Try a different card.',
              }
            : { hostedStage: 'guest_checkout' };
        }
        return { hostedStage: 'guest_checkout' };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'cached@example.com',
      phone: '9999999999',
      address: { street: 'Old St', city: 'Old City', state: 'Old State', zip: '00000' },
    },
  });

  const submitEvents = events.filter((event) => (
    event.type === 'tab-message'
    && event.message?.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'
    && event.message?.payload?.expectedStage === 'guest_checkout'
  ));
  const profileEvents = events.filter((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile);

  assert.equal(submitEvents.length, 2);
  assert.ok(profileEvents.length >= 2);
  assert.equal(submitEvents[0].message.payload.address.street, '7 Fresh St');
  assert.equal(submitEvents[1].message.payload.address.street, '8 Retry Ave');
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), true);
});

test('Phone Plus hosted checkout reuses current provider runtime email as isolated payment email', async () => {
  const events = [];
  let currentUrl = 'https://pay.openai.com/c/pay/test';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => createHostedAddressResponse(),
    getPlusPaymentEmailState: () => ({ current: '', source: '', updatedAt: 0 }),
    getState: async () => ({
      phonePlusModeEnabled: true,
      plusPaymentMethod: 'paypal-hosted',
      hostedCheckoutPhoneNumber: '2125550000',
      hostedCheckoutVerificationUrl: 'http://example.test/api/sms',
      mailProvider: 'yyds-mail',
      currentYydsMailInbox: {
        address: 'runtime@yyds.example.com',
        token: 'temp-token',
      },
    }),
    isYydsMailProvider: (state) => state.mailProvider === 'yyds-mail',
    isLuckmailProvider: () => false,
    isHotmailProvider: () => false,
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/checkoutweb/pay?token=EC-test';
        return { clicked: true };
      }
      if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
        return { hostedVerificationVisible: false };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setPlusPaymentEmailState: async (email, options = {}) => {
      events.push({ type: 'set-payment-email', email, options });
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedOpenAiCheckout({
    plusCheckoutTabId: 321,
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal-hosted',
  });

  const submitEvent = events.find((event) => event.type === 'tab-message' && event.message.type === 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP');
  assert.ok(submitEvent);
  assert.equal(submitEvent.message.payload.email, 'runtime@yyds.example.com');
  assert.equal(
    events.some((event) => event.type === 'set-payment-email' && event.email === 'runtime@yyds.example.com'),
    true
  );
  assert.equal(
    events.some((event) => event.type === 'log' && /支付邮箱已复用 runtime@yyds\.example\.com/.test(event.message)),
    true
  );
});

test('Phone Plus hosted card refresh keeps saved payment email while refreshing profile details', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => createHostedAddressResponse({
      Address: '11 Payment Keep Ave',
      City: 'Austin',
      State_Full: 'Texas',
      Zip_Code: '73301',
    }),
    getPlusPaymentEmailState: () => ({
      current: 'saved-payment@example.com',
      source: 'runtime:test',
      updatedAt: 100,
    }),
    getState: async () => createHostedRuntimeState({
      phonePlusModeEnabled: true,
      plusPaymentMethod: 'paypal-hosted',
      plusPaymentEmailState: {
        current: 'saved-payment@example.com',
        source: 'runtime:test',
        updatedAt: 100,
      },
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
        return {
          submitted: true,
          phoneMatched: true,
        };
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return currentUrl.includes('/create-account')
          ? { hostedStage: 'create_account' }
          : { hostedStage: 'guest_checkout' };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setPlusPaymentEmailState: async (email, options = {}) => events.push({ type: 'set-payment-email', email, options }),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 456,
    phonePlusModeEnabled: true,
    plusPaymentMethod: 'paypal-hosted',
    plusHostedCheckoutGuestProfile: {
      email: 'stale-profile@example.com',
      phone: '9999999999',
      cardNumber: '4000000000000002',
      address: { street: 'Old St', city: 'Old City', state: 'Old State', zip: '00000' },
    },
  });

  const profileState = events.find((event) => event.type === 'set-state' && event.payload.plusHostedCheckoutGuestProfile)
    ?.payload
    ?.plusHostedCheckoutGuestProfile;
  const submitEvent = events.find((event) => event.type === 'tab-message' && event.message?.payload?.expectedStage === 'guest_checkout');

  assert.ok(profileState);
  assert.ok(submitEvent);
  assert.equal(profileState.email, 'saved-payment@example.com');
  assert.equal(profileState.address.street, '11 Payment Keep Ave');
  assert.notEqual(profileState.cardNumber, '4000000000000002');
  assert.equal(submitEvent.message.payload.email, 'saved-payment@example.com');
  assert.equal(
    events.some((event) => event.type === 'set-payment-email' && event.email === 'saved-payment@example.com'),
    true
  );
});

test('Plus checkout content routes billing operations through the operation delay gate', async () => {
  const { checkoutEvents, send } = createCheckoutContentHarness();

  const result = await send({
    type: 'FILL_PLUS_BILLING_AND_SUBMIT',
    source: 'test',
    payload: {
      fullName: 'Ada Lovelace',
      addressSeed: {
        skipAutocomplete: true,
        fallback: {
          address1: 'Unter den Linden',
          city: 'Berlin',
          region: 'Berlin',
          postalCode: '10117',
        },
      },
    },
  });

  assert.equal(result.ok, true);
  assert.deepStrictEqual(checkoutEvents.filter((event) => event.type === 'operation').map((event) => event.label), [
    'select-payment-method',
    'fill-billing-address',
    'click-subscribe',
  ]);
  assert.deepStrictEqual(checkoutEvents.filter((event) => event.type === 'delay').map((event) => event.ms), [2000, 2000, 2000]);
});

test('Plus checkout content routes same-frame autocomplete query and suggestion through separate operation delays', async () => {
  const { checkoutEvents, send } = createCheckoutContentHarness();

  const result = await send({
    type: 'FILL_PLUS_BILLING_AND_SUBMIT',
    source: 'test',
    payload: {
      fullName: 'Ada Lovelace',
      addressSeed: {
        query: 'Unter den Linden',
        suggestionIndex: 0,
        fallback: {
          address1: 'Unter den Linden',
          city: 'Berlin',
          region: 'Berlin',
          postalCode: '10117',
        },
      },
    },
  });

  assert.equal(result.ok, true);
  assert.deepStrictEqual(checkoutEvents.filter((event) => event.type === 'operation').map((event) => event.label), [
    'select-payment-method',
    'fill-address-query',
    'select-address-suggestion',
    'fill-billing-address',
    'click-subscribe',
  ]);
  assert.deepStrictEqual(checkoutEvents.filter((event) => event.type === 'delay').map((event) => event.label), [
    'select-payment-method',
    'fill-address-query',
    'select-address-suggestion',
    'fill-billing-address',
    'click-subscribe',
  ]);
  assert.equal(checkoutEvents.some((event) => event.type === 'delay' && event.ms !== 2000), false);
});

test('OpenAI hosted checkout fills email before selecting PayPal and address', async () => {
  const { checkoutEvents, send } = createCheckoutContentHarness({
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
  });

  const result = await send({
    type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
    source: 'test',
    payload: {
      email: 'payment@example.com',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, true);
  const paymentButtonIndex = checkoutEvents.findIndex((event) => event.type === 'click' && event.target === 'paypal');
  const submitIndex = checkoutEvents.findIndex((event) => event.type === 'click' && event.target === 'subscribe');
  const emailFillIndex = checkoutEvents.findIndex((event) => event.type === 'fill' && event.id === 'email' && event.value === 'payment@example.com');
  const addressFillIndex = checkoutEvents.findIndex((event) => event.type === 'fill' && event.id === 'billingAddressLine1' && event.value === '1 Main St');

  assert.ok(emailFillIndex > -1);
  assert.ok(paymentButtonIndex > -1);
  assert.ok(addressFillIndex > -1);
  assert.ok(submitIndex > -1);
  assert.ok(emailFillIndex < paymentButtonIndex);
  assert.ok(paymentButtonIndex < addressFillIndex);
  assert.ok(addressFillIndex < submitIndex);
});

test('OpenAI hosted checkout stops before PayPal selection when email input is missing', async () => {
  const { checkoutEvents, send } = createCheckoutContentHarness({
    includeHostedEmailInput: false,
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
    hostedEmailInputTimeoutMs: 100,
  });

  const result = await send({
    type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
    source: 'test',
    payload: {
      email: 'payment@example.com',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, undefined);
  assert.match(result.error, /email|邮箱|郵箱/i);
  assert.equal(checkoutEvents.some((event) => event.type === 'click' && event.target === 'paypal'), false);
  assert.equal(checkoutEvents.some((event) => event.type === 'fill' && event.id === 'billingAddressLine1'), false);
});

test('OpenAI hosted checkout reports card fallback state when PayPal is unavailable and card fields are visible', async () => {
  const { send } = createCheckoutContentHarness({
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
    omitHostedPayPalButton: true,
    includeHostedCardBranch: true,
    includeHostedPaypalDisabledFrame: true,
  });

  const state = await send({
    type: 'PLUS_CHECKOUT_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedCardFallback, true);
  assert.equal(state.hostedPaypalDisabledSignals, true);
  assert.equal(state.hostedCardAccordionSelected, true);
  assert.match(state.hostedCardFallbackReason, /card|PayPal/i);
});

test('OpenAI hosted checkout blocks submit when hosted page falls into card-only branch', async () => {
  const { checkoutEvents, send } = createCheckoutContentHarness({
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
    omitHostedPayPalButton: true,
    includeHostedCardBranch: true,
    includeHostedPaypalDisabledFrame: true,
  });

  const result = await send({
    type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
    source: 'test',
    payload: {
      email: 'payment@example.com',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, undefined);
  assert.match(result.error, /HOSTED_CHECKOUT_CARD_FALLBACK::/);
  assert.equal(checkoutEvents.some((event) => event.type === 'click' && event.target === 'subscribe'), false);
});

test('OpenAI hosted checkout exposes address and card declined errors from visible alerts', async () => {
  const addressHarness = createCheckoutContentHarness({
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
    hostedErrorText: 'Customer location isn\'t recognized. Set a valid customer address.',
  });
  const addressState = await addressHarness.send({
    type: 'PLUS_CHECKOUT_GET_STATE',
    source: 'test',
    payload: {},
  });
  assert.equal(addressState.hostedAddressError, true);
  assert.match(addressState.hostedAddressErrorMessage, /customer location/i);

  const declinedHarness = createCheckoutContentHarness({
    locationHref: 'https://pay.openai.com/c/pay/cs_test',
    hostedErrorText: 'Your card was declined. Try another card.',
  });
  const declinedState = await declinedHarness.send({
    type: 'PLUS_CHECKOUT_GET_STATE',
    source: 'test',
    payload: {},
  });
  assert.equal(declinedState.hostedCardDeclinedError, true);
  assert.match(declinedState.hostedCardDeclinedErrorMessage, /declined/i);
});

test('GPC manual checkout injects Plus script before reading ChatGPT session token and sends X-API-Key', async () => {
  const events = [];
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tab-create', payload });
          return { id: 77 };
        },
        remove: async (tabId) => events.push({ type: 'tab-remove', tabId }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => url.endsWith('/api/gp/balance')
          ? createGpcBalanceResponse({ auto_mode_enabled: false, remaining_uses: 998 })
          : createGpcTaskResponse({ otp_channel: 'whatsapp' }),
      };
    },
    registerTab: async (source, tabId) => events.push({ type: 'register', source, tabId }),
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      return { accessToken: 'session-access-token' };
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async (ms) => events.push({ type: 'sleep', ms }),
    waitForTabCompleteUntilStopped: async () => events.push({ type: 'tab-complete' }),
  });

  await executor.executePlusCheckoutCreate({
    email: 'Current.Round+GPC@Example.COM',
    plusPaymentMethod: 'gpc-helper',
    gopayHelperPhoneMode: 'manual',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPhoneNumber: '+8613800138000',
    gopayPhone: '',
    gopayHelperCountryCode: '+86',
    gopayHelperPin: '123456',
    gopayHelperApiKey: 'gpc_test_123',
  });

  const readyIndex = events.findIndex((event) => event.type === 'ready');
  const messageIndex = events.findIndex((event) => event.type === 'tab-message');
  assert.ok(readyIndex >= 0);
  assert.ok(messageIndex > readyIndex);
  assert.equal(events[messageIndex].message.type, 'PLUS_CHECKOUT_GET_STATE');
  assert.deepEqual(events[messageIndex].message.payload, {
    includeSession: true,
    includeAccessToken: true,
  });
  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
  assert.equal(fetchCalls[0].options.headers['X-API-Key'], 'gpc_test_123');
  assert.equal(fetchCalls[1].url, 'https://gpc.qlhazycoder.top/api/gp/tasks');
  const helperPayload = JSON.parse(fetchCalls[1].options.body);
  assert.deepEqual(helperPayload, {
    access_token: 'session-access-token',
    phone_mode: 'manual',
    country_code: '86',
    phone_number: '13800138000',
    otp_channel: 'whatsapp',
  });
  assert.equal(fetchCalls[1].options.headers['X-API-Key'], 'gpc_test_123');
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'card_key'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'customer_email'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'checkout_ui_mode'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'gopay_link'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'plan_name'), false);
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.plusCheckoutSource, 'gpc-helper');
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperTaskId, 'task_123');
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperTaskStatus, 'active');
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperStatusText, '处理中');
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperRemoteStage, 'checkout_start');
  assert.equal(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperReferenceId, '');
  assert.ok(events.find((event) => event.type === 'set-state')?.payload?.gopayHelperOrderCreatedAt > 0);
  assert.equal(events.find((event) => event.type === 'complete')?.step, 'plus-checkout-create');
  assert.equal(events.find((event) => event.type === 'complete')?.payload?.plusCheckoutSource, 'gpc-helper');
});


test('GPC auto checkout only sends access token and API Key', async () => {
  const events = [];
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => url.endsWith('/api/gp/balance')
          ? createGpcBalanceResponse({ auto_mode_enabled: true, remaining_uses: 998 })
          : createGpcTaskResponse({
              task_id: 'task_auto',
              status: 'queued',
              status_text: '排队中',
              phone_mode: 'auto',
              api_waiting_for: '',
            }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    plusPaymentMethod: 'gpc-helper',
    gopayHelperPhoneMode: 'auto',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    chatgptAccessToken: 'state-access-token',
    gopayHelperApiKey: 'gpc_auto_123',
  });

  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
  assert.equal(fetchCalls[0].options.headers['X-API-Key'], 'gpc_auto_123');
  assert.equal(fetchCalls[1].url, 'https://gpc.qlhazycoder.top/api/gp/tasks');
  const helperPayload = JSON.parse(fetchCalls[1].options.body);
  assert.deepEqual(helperPayload, {
    access_token: 'state-access-token',
    phone_mode: 'auto',
  });
  assert.equal(fetchCalls[1].options.headers['X-API-Key'], 'gpc_auto_123');
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'country_code'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'phone_number'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'otp_channel'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'pin'), false);
  const statePayload = events.find((event) => event.type === 'set-state')?.payload || {};
  assert.equal(statePayload.gopayHelperTaskId, 'task_auto');
  assert.equal(Object.prototype.hasOwnProperty.call(statePayload, 'gopayHelperPhoneMode'), false);
  assert.equal(statePayload.gopayHelperTaskStatus, 'queued');
  assert.equal(events.find((event) => event.type === 'complete')?.step, 'plus-checkout-create');
});

test('GPC auto checkout keeps running when balance payload omits auto mode permission', async () => {
  const events = [];
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => url.endsWith('/api/gp/balance')
          ? createGpcBalanceResponse({ auto_mode_enabled: undefined, remaining_uses: 998 })
          : createGpcTaskResponse({
              task_id: 'task_auto_unknown_permission',
              status: 'queued',
              status_text: '排队中',
              phone_mode: 'auto',
              api_waiting_for: '',
            }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    plusPaymentMethod: 'gpc-helper',
    gopayHelperPhoneMode: 'auto',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    chatgptAccessToken: 'state-access-token',
    gopayHelperApiKey: 'gpc_auto_123',
  });

  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
  assert.equal(fetchCalls[1].url, 'https://gpc.qlhazycoder.top/api/gp/tasks');
  const helperPayload = JSON.parse(fetchCalls[1].options.body);
  assert.equal(helperPayload.phone_mode, 'auto');
  const statePayload = events.find((event) => event.type === 'set-state')?.payload || {};
  assert.equal(statePayload.gopayHelperTaskId, 'task_auto_unknown_permission');
  assert.equal(Object.prototype.hasOwnProperty.call(statePayload, 'gopayHelperPhoneMode'), false);
  assert.equal(events.find((event) => event.type === 'complete')?.step, 'plus-checkout-create');
});

test('GPC auto checkout blocks API Keys without auto mode permission', async () => {
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => createGpcBalanceResponse({ auto_mode_enabled: false, remaining_uses: 998 }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'gpc-helper',
      gopayHelperPhoneMode: 'auto',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      chatgptAccessToken: 'state-access-token',
      gopayHelperApiKey: 'gpc_auto_disabled',
    }),
    /未开通自动模式/
  );

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
});

test('GPC checkout blocks exhausted API Keys before creating task', async () => {
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => createGpcBalanceResponse({ auto_mode_enabled: false, remaining_uses: 0 }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'gpc-helper',
      gopayHelperPhoneMode: 'manual',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      chatgptAccessToken: 'state-access-token',
      gopayHelperPhoneNumber: '+8613800138000',
      gopayHelperCountryCode: '+86',
      gopayHelperPin: '123456',
      gopayHelperApiKey: 'gpc_exhausted',
    }),
    /剩余次数不足/
  );

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
});

test('GPC checkout forwards selected SMS OTP channel', async () => {
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => ({ id: 88 }),
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => url.endsWith('/api/gp/balance')
          ? createGpcBalanceResponse({ auto_mode_enabled: false, remaining_uses: 998 })
          : createGpcTaskResponse({ task_id: 'task_sms', status: 'active', phone_mode: 'manual', remote_stage: 'checkout_start' }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({ accessToken: 'session-access-token' }),
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({
    email: 'sms@example.com',
    plusPaymentMethod: 'gpc-helper',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPhoneNumber: '+8613800138000',
    gopayHelperCountryCode: '+86',
    gopayHelperPin: '123456',
    gopayHelperApiKey: 'gpc_sms',
    gopayHelperOtpChannel: 'sms',
  });

  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
  assert.equal(fetchCalls[0].options.headers['X-API-Key'], 'gpc_sms');
  const helperPayload = JSON.parse(fetchCalls[1].options.body);
  assert.equal(helperPayload.phone_mode, 'manual');
  assert.equal(helperPayload.otp_channel, 'sms');
  assert.equal(fetchCalls[1].options.headers['X-API-Key'], 'gpc_sms');
  assert.equal(Object.prototype.hasOwnProperty.call(helperPayload, 'card_key'), false);
});

test('GPC checkout surfaces unified queue API errors', async () => {
  const fetchCalls = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url.endsWith('/api/gp/balance')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcBalanceResponse({ auto_mode_enabled: false, remaining_uses: 998 }),
        };
      }
      return {
        ok: false,
        status: 400,
        json: async () => ({
          code: 400,
          message: 'invalid_param',
          data: { detail: 'access_token 无效' },
        }),
      };
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => {},
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      email: 'paid@example.com',
      plusPaymentMethod: 'gpc-helper',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      chatgptAccessToken: 'state-access-token',
      gopayHelperPhoneNumber: '+8613800138000',
      gopayHelperCountryCode: '+86',
      gopayHelperPin: '123456',
      gopayHelperApiKey: 'gpc_paid_456',
    }),
    /创建 GPC 订单失败：access_token 无效/
  );

  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/balance');
  assert.equal(fetchCalls[1].url, 'https://gpc.qlhazycoder.top/api/gp/tasks');
  assert.equal(Object.prototype.hasOwnProperty.call(JSON.parse(fetchCalls[1].options.body), 'card_key'), false);
  assert.equal(fetchCalls[1].options.headers['X-API-Key'], 'gpc_paid_456');
});

test('GPC checkout does not fall back to browser GoPay phone fields', async () => {
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => {
      throw new Error('should not call helper API without helper phone');
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => {},
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'gpc-helper',
      gopayHelperPhoneMode: 'manual',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      chatgptAccessToken: 'state-access-token',
      email: 'helper-phone-test@example.com',
      gopayPhone: '+8613800138000',
      gopayCountryCode: '+86',
      gopayPin: '123456',
      gopayHelperPhoneNumber: '',
      gopayHelperPin: '123456',
      gopayHelperApiKey: 'gpc_phone_test',
    }),
    /缺少手机号/
  );
});

test('GPC checkout rejects missing API Key before calling helper API', async () => {
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        create: async () => {
          throw new Error('should not open token tab when direct access token exists');
        },
        remove: async () => {},
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => {
      throw new Error('should not call helper API without API Key');
    },
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => {},
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePlusCheckoutCreate({
      plusPaymentMethod: 'gpc-helper',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      chatgptAccessToken: 'state-access-token',
      email: 'missing-card@example.com',
      gopayHelperPhoneNumber: '+8613800138000',
      gopayHelperCountryCode: '+86',
      gopayHelperPin: '123456',
      gopayHelperApiKey: '',
    }),
    /缺少 API Key/
  );
});

test('PayPal hosted card node resends and refills after invalid verification code', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  let codeFetchCount = 0;
  let verificationPollCount = 0;
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId, options) => events.push({ type: 'ready', source, tabId, options }),
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      if (/meiguodizhi\.com/i.test(url)) {
        return createHostedAddressResponse({
          Address: '11 Verify Ln',
          City: 'Phoenix',
          State_Full: 'Arizona',
          Zip_Code: '85001',
        });
      }
      codeFetchCount += 1;
      return {
        ok: true,
        json: async () => ({}),
        text: async () => JSON.stringify({
          data: {
            message: `PayPal: ${codeFetchCount === 1 ? '111111' : '222222'} is your security code. Don't share it.`,
          },
        }),
      };
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (tabId, source, message) => {
      events.push({ type: 'tab-message', tabId, source, message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        if (message.payload?.expectedStage === 'guest_checkout') {
          currentUrl = 'https://www.paypal.com/checkoutweb/verification';
          return { submitted: true, phoneMatched: true };
        }
        if (message.payload?.verificationCode === '111111') {
          return { codeSubmitted: true };
        }
        if (message.payload?.resendVerificationCode) {
          return { resendClicked: true };
        }
        if (message.payload?.verificationCode === '222222') {
          currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
          return { codeSubmitted: true };
        }
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        verificationPollCount += 1;
        if (currentUrl.includes('/create-account')) {
          return { hostedStage: 'create_account' };
        }
        return {
          hostedStage: verificationPollCount <= 1 ? 'verification' : (verificationPollCount <= 3 ? 'verification' : 'create_account'),
          verificationInputsVisible: verificationPollCount <= 3,
          hostedVerificationInvalidCode: verificationPollCount === 2,
          hostedVerificationResendReady: verificationPollCount === 2,
          hostedVerificationErrorText: verificationPollCount === 2 ? 'Check the code and try again. Get a new code.' : '',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async (ms) => events.push({ type: 'sleep', ms }),
    waitForTabCompleteUntilStopped: async () => events.push({ type: 'tab-complete' }),
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551234',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.payload?.verificationCode === '111111'), true);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.payload?.resendVerificationCode), true);
  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.payload?.verificationCode === '222222'), true);
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), true);
});

test('PayPal hosted card node throws resend-limit error after repeated invalid verification code', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/verification', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => {
      if (/meiguodizhi\.com/i.test(url)) {
        return createHostedAddressResponse({
          Address: '12 Retry Rd',
          City: 'Seattle',
          State_Full: 'Washington',
          Zip_Code: '98101',
        });
      }
      return {
        ok: true,
        json: async () => ({}),
        text: async () => JSON.stringify({
          data: {
            message: "PayPal: 333333 is your security code. Don't share it.",
          },
        }),
      };
    },
    getState: async () => createHostedRuntimeState(),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        if (message.payload?.verificationCode) return { codeSubmitted: true };
        if (message.payload?.resendVerificationCode) return { resendClicked: true };
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: 'verification',
          verificationInputsVisible: true,
          hostedVerificationInvalidCode: true,
          hostedVerificationResendReady: true,
          hostedVerificationErrorText: 'Check the code and try again. Get a new code.',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedCard({
      plusCheckoutTabId: 123,
      plusHostedCheckoutGuestProfile: {
        email: 'guest@example.com',
        phone: '4155551234',
        address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
      },
    }),
    /HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT::/
  );

  assert.equal(events.some((event) => event.type === 'tab-message' && event.message.payload?.resendVerificationCode), true);
  assert.equal(events.some((event) => event.type === 'complete'), false);
});

test('PayPal hosted card node disables bad sms pool phone and refills next enabled phone', async () => {
  const events = [];
  let currentUrl = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
  let latestState = createHostedRuntimeState({
    hostedCheckoutSmsPoolAutoDisableEnabled: true,
    hostedCheckoutSmsPoolText: [
      '4155551111----http://pool-a.test/api/sms',
      '4155552222----http://pool-b.test/api/sms',
    ].join('\n'),
    hostedCheckoutSmsPoolUsage: {},
    hostedCheckoutCurrentSmsEntry: {
      key: '4155551111----http://pool-a.test/api/sms',
      phone: '4155551111',
      verificationUrl: 'http://pool-a.test/api/sms',
    },
  });
  let statePollCount = 0;
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => {
      if (/meiguodizhi\.com/i.test(url)) {
        return createHostedAddressResponse();
      }
      return {
        ok: true,
        json: async () => ({}),
        text: async () => JSON.stringify({
          data: { message: "PayPal: 123123 is your security code. Don't share it." },
        }),
      };
    },
    getState: async () => latestState,
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP') {
        if (message.payload?.expectedStage === 'guest_checkout') {
          currentUrl = 'https://www.paypal.com/checkoutweb/create-account';
          return { submitted: true, phoneMatched: true };
        }
        return {};
      }
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        statePollCount += 1;
        if (statePollCount === 1) {
          return {
            hostedStage: 'guest_checkout',
            hostedGuestPhoneError: true,
            hostedGuestPhoneErrorMessage: 'Try a different phone number.',
          };
        }
        return { hostedStage: 'create_account' };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
      latestState = { ...latestState, ...payload };
    },
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedCard({
    plusCheckoutTabId: 123,
    plusHostedCheckoutGuestProfile: {
      email: 'guest@example.com',
      phone: '4155551111',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  const usage = latestState.hostedCheckoutSmsPoolUsage;
  assert.equal(usage['4155551111----http://pool-a.test/api/sms'].enabled, false);
  assert.equal(usage['4155551111----http://pool-a.test/api/sms'].failureCount, 2);
  assert.match(usage['4155551111----http://pool-a.test/api/sms'].disabledReason, /different phone number|号码不可用/i);
  assert.equal(latestState.hostedCheckoutCurrentSmsEntry.phone, '4155552222');
  assert.equal(latestState.plusHostedCheckoutGuestProfile.phone, '4155552222');
  assert.equal(
    events.some((event) => (
      event.type === 'tab-message'
      && event.message.type === 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP'
      && event.message.payload?.phone === '4155552222'
    )),
    true
  );
  assert.equal(events.some((event) => event.type === 'complete' && event.step === 'paypal-hosted-card'), true);
});

test('PayPal hosted card node errors when bad sms pool phone has no next enabled phone', async () => {
  const events = [];
  let latestState = createHostedRuntimeState({
    hostedCheckoutSmsPoolAutoDisableEnabled: true,
    hostedCheckoutSmsPoolText: '4155551111----http://pool-a.test/api/sms',
    hostedCheckoutSmsPoolUsage: {},
    hostedCheckoutCurrentSmsEntry: {
      key: '4155551111----http://pool-a.test/api/sms',
      phone: '4155551111',
      verificationUrl: 'http://pool-a.test/api/sms',
    },
  });
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test', status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async (url) => (/meiguodizhi\.com/i.test(url) ? createHostedAddressResponse() : {
      ok: true,
      json: async () => ({}),
      text: async () => '{}',
    }),
    getState: async () => latestState,
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      events.push({ type: 'tab-message', message });
      if (message.type === 'PAYPAL_HOSTED_GET_STATE') {
        return {
          hostedStage: 'guest_checkout',
          hostedGuestPhoneError: true,
          hostedGuestPhoneErrorMessage: 'Try a different phone number.',
        };
      }
      throw new Error(`unexpected message type ${message.type}`);
    },
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
      latestState = { ...latestState, ...payload };
    },
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.executePayPalHostedCard({
      plusCheckoutTabId: 123,
      plusHostedCheckoutGuestProfile: {
        email: 'guest@example.com',
        phone: '4155551111',
        address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
      },
    }),
    /无其他启用号码|Try a different phone number/i
  );

  assert.equal(latestState.hostedCheckoutSmsPoolUsage['4155551111----http://pool-a.test/api/sms'].enabled, false);
  assert.equal(events.some((event) => event.type === 'complete'), false);
});

test('hosted checkout runtime prefers sms pool entry and records final success usage only on payments success', async () => {
  const events = [];
  let currentUrl = 'https://chatgpt.com/payments/success';
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, url: currentUrl, status: 'complete' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => events.push({ type: 'complete', step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    fetch: async () => ({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          message: "PayPal: 666666 is your security code. Don't share it.",
        },
      }),
    }),
    getState: async () => ({
      hostedCheckoutVerificationUrl: 'http://fallback.test/api/sms',
      hostedCheckoutPhoneNumber: '4155559999',
      hostedCheckoutSmsPoolText: [
        '4155551234----http://pool-a.test/api/sms',
        '4155555678----http://pool-b.test/api/sms',
      ].join('\n'),
      hostedCheckoutSmsPoolUsage: {
        '4155551234----http://pool-a.test/api/sms': {
          useCount: 3,
          lastAttemptAt: 50,
        },
        '4155555678----http://pool-b.test/api/sms': {
          useCount: 1,
          lastAttemptAt: 100,
        },
      },
    }),
    registerTab: async () => {},
    sendTabMessageUntilStopped: async () => ({}),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePayPalHostedReview({
    plusCheckoutTabId: 456,
  });

  const selectedEntryUpdate = events.find((event) => event.type === 'set-state' && event.payload.hostedCheckoutCurrentSmsEntry);
  assert.equal(selectedEntryUpdate?.payload?.hostedCheckoutCurrentSmsEntry?.phone, '4155555678');

  const usageUpdate = events.find((event) => event.type === 'set-state' && event.payload.hostedCheckoutSmsPoolUsage);
  assert.equal(
    usageUpdate?.payload?.hostedCheckoutSmsPoolUsage?.['4155555678----http://pool-b.test/api/sms']?.useCount,
    2
  );
});

test('hosted checkout pool failure records lastError without incrementing useCount', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    fetch: async () => ({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          message: 'No code available yet',
        },
      }),
    }),
    getState: async () => ({
      hostedCheckoutSmsPoolText: '4155555678----http://pool-b.test/api/sms',
      hostedCheckoutSmsPoolUsage: {
        '4155555678----http://pool-b.test/api/sms': {
          useCount: 1,
          lastAttemptAt: 100,
        },
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '4155555678----http://pool-b.test/api/sms',
        phone: '4155555678',
        verificationUrl: 'http://pool-b.test/api/sms',
      },
    }),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
  });

  await assert.rejects(
    () => executor.fetchHostedCheckoutVerificationCodeManually({ state: {} }),
    /有效验证码|响应预览|No code available yet/i
  );

  const usageUpdate = events.find((event) => event.type === 'set-state' && event.payload.hostedCheckoutSmsPoolUsage);
  assert.equal(
    usageUpdate?.payload?.hostedCheckoutSmsPoolUsage?.['4155555678----http://pool-b.test/api/sms']?.useCount,
    1
  );
  assert.match(
    usageUpdate?.payload?.hostedCheckoutSmsPoolUsage?.['4155555678----http://pool-b.test/api/sms']?.lastError || '',
    /6|code|验证码/i
  );
});

test('hosted checkout runtime prefers per-run state over stale persisted state when resolving pool config', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    fetch: async (url) => {
      events.push({ type: 'fetch', url });
      return {
        ok: true,
        text: async () => JSON.stringify({
          data: {
            message: "PayPal: 123123 is your security code. Don't share it.",
          },
        }),
      };
    },
    getState: async () => ({
      hostedCheckoutVerificationUrl: 'http://stale.test/api/sms',
      hostedCheckoutPhoneNumber: '4155550000',
      hostedCheckoutSmsPoolText: '',
    }),
    setState: async (payload) => events.push({ type: 'set-state', payload }),
  });

  const result = await executor.fetchHostedCheckoutVerificationCodeManually({
    hostedCheckoutSmsPoolText: '4155557777----http://fresh.test/api/sms',
    state: {
      hostedCheckoutSmsPoolText: '4155557777----http://fresh.test/api/sms',
    },
  });

  assert.equal(result.verificationUrl, 'http://fresh.test/api/sms');
  assert.equal(events.find((event) => event.type === 'fetch')?.url?.startsWith('http://fresh.test/api/sms'), true);
});

test('hosted checkout strict pool mode rejects unparsable non-empty sms pool text', async () => {
  const executor = api.createPlusCheckoutCreateExecutor({
    getState: async () => ({
      hostedCheckoutSmsPoolText: 'not-a-valid-pool-entry',
      hostedCheckoutPhoneNumber: '4155551234',
      hostedCheckoutVerificationUrl: 'http://fallback.test/api/sms',
    }),
  });

  await assert.rejects(
    () => executor.fetchHostedCheckoutVerificationCodeManually({ state: {} }),
    /接码池已配置.*未解析出有效号码|接码池已配置.*未解析到可用号码/i
  );
});

test('hosted checkout manual mode rejects incomplete manual config when pool is empty', async () => {
  const executor = api.createPlusCheckoutCreateExecutor({
    getState: async () => ({
      hostedCheckoutSmsPoolText: '',
      hostedCheckoutPhoneNumber: '',
      hostedCheckoutVerificationUrl: 'http://manual.test/api/sms',
    }),
  });

  await assert.rejects(
    () => executor.fetchHostedCheckoutVerificationCodeManually({ state: {} }),
    /接码配置不完整|手机号和验证码接口/i
  );
});

test('hosted checkout manual fetch falls back to hidden tab text when fetch payload has no valid code', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        create: async ({ url }) => {
          events.push({ type: 'tab-create', url });
          return { id: 91 };
        },
        remove: async (tabId) => {
          events.push({ type: 'tab-remove', tabId });
        },
      },
      scripting: {
        executeScript: async () => ([{
          result: "PayPal: 456789 is your security code. Don't share it.",
        }]),
      },
    },
    createAutomationTab: async ({ url, active }) => {
      events.push({ type: 'automation-tab', url, active });
      return { id: 91 };
    },
    fetch: async () => ({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          message: 'No code available yet',
        },
      }),
    }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  const result = await executor.fetchHostedCheckoutVerificationCodeManually({
    verificationUrl: 'http://example.test/api/sms',
  });

  assert.equal(result.code, '456789');
  assert.equal(events.some((event) => event.type === 'automation-tab' && event.url === 'http://example.test/api/sms'), true);
  assert.equal(events.some((event) => event.type === 'tab-remove' && event.tabId === 91), true);
});

test('hosted checkout manual fetch treats PayPal confirmation text as non-code content', async () => {
  const events = [];
  const executor = api.createPlusCheckoutCreateExecutor({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    chrome: {
      tabs: {
        create: async () => ({ id: 92 }),
        remove: async () => {},
      },
      scripting: {
        executeScript: async () => ([{
          result: 'PayPal: Thanks for confirming your phone number. Log in or get the app to get transaction alerts.',
        }]),
      },
    },
    createAutomationTab: async () => ({ id: 92 }),
    fetch: async () => ({
      ok: true,
      text: async () => JSON.stringify({
        data: {
          message: 'PayPal: Thanks for confirming your phone number. Log in or get the app to get transaction alerts.',
        },
      }),
    }),
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await assert.rejects(
    () => executor.fetchHostedCheckoutVerificationCodeManually({
      verificationUrl: 'http://example.test/api/sms',
    }),
    /非验证码内容|暂未返回有效验证码/i
  );
});
