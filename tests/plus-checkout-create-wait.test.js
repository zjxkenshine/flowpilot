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

function createCheckoutContentHarness() {
  const checkoutEvents = [];
  const attrs = new Map();
  let listener = null;
  const elements = [];

  function createElement({ tagName = 'DIV', text = '', attrs: initialAttrs = {}, id = '', type = '', value = '' } = {}) {
    const attrMap = new Map(Object.entries(initialAttrs));
    if (id) attrMap.set('id', id);
    if (type) attrMap.set('type', type);
    const element = {
      nodeType: 1,
      tagName,
      id,
      type,
      value,
      textContent: text,
      innerText: text,
      className: initialAttrs.class || '',
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
        return { left: 10, top: 20, width: 180, height: 44 };
      },
    };
    return element;
  }

  const paymentButton = createElement({ tagName: 'BUTTON', text: 'PayPal', attrs: { role: 'tab', 'aria-selected': '' } });
  const fullNameInput = createElement({ tagName: 'INPUT', id: 'name', type: 'text', attrs: { name: 'billingName', placeholder: 'Full name' } });
  const addressInput = createElement({ tagName: 'INPUT', id: 'address', type: 'text', attrs: { name: 'addressLine1', placeholder: 'Address line 1' } });
  const cityInput = createElement({ tagName: 'INPUT', id: 'city', type: 'text', attrs: { name: 'locality', placeholder: 'City' } });
  const postalInput = createElement({ tagName: 'INPUT', id: 'postal', type: 'text', attrs: { name: 'postalCode', placeholder: 'Postal code' } });
  const suggestionOption = createElement({ tagName: 'LI', text: 'Unter den Linden 1, Berlin', attrs: { role: 'option', class: 'pac-item' } });
  const subscribeButton = createElement({ tagName: 'BUTTON', text: 'Subscribe', attrs: { type: 'submit', 'aria-label': 'Subscribe' } });
  subscribeButton.type = 'submit';
  elements.push(paymentButton, fullNameInput, addressInput, cityInput, postalInput, suggestionOption, subscribeButton);

  const context = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    location: { href: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
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
      getElementById() {
        return null;
      },
      querySelectorAll(selector) {
        const text = String(selector || '');
        if (text.includes('label[for=')) return [];
        if (text.includes('[role="option"]') || text.includes('.pac-item') || text === 'li') return [suggestionOption];
        if (text === 'input, textarea') return elements.filter((element) => element.tagName === 'INPUT');
        if (text.includes('button[type="submit"]')) return [subscribeButton];
        if (text.includes('button') || text.includes('[role=') || text.includes('[tabindex]') || text.includes('[data-testid]')) {
          return elements.filter((element) => element.tagName === 'BUTTON');
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
    },
    simulateClick(element) {
      if (element === paymentButton) {
        paymentButton.setAttribute('aria-selected', 'true');
      }
    },
  };
  context.window = context;
  context.window.getComputedStyle = (element) => element?.style || { display: 'block', visibility: 'visible' };

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
      return {
        checkoutUrl: 'https://checkout.stripe.com/c/pay/session',
        country: 'US',
        currency: 'USD',
      };
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
    sendTabMessageUntilStopped: async () => ({
      checkoutUrl: 'https://checkout.stripe.com/c/pay/session',
      country: 'US',
      currency: 'USD',
    }),
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
      return {
        checkoutUrl: 'https://chatgpt.com/checkout/openai_llc/test-session',
        country: 'ID',
        currency: 'IDR',
      };
    },
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
  });

  await executor.executePlusCheckoutCreate({ plusPaymentMethod: 'gopay' });

  assert.deepStrictEqual(events[0]?.payload, { paymentMethod: 'gopay', hostedCheckoutFinalStep: false });
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
    plusCheckoutConversionProxyUrl: '',
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

  const first = await manager.switchManualSession({ proxyUrl: 'socks5h://user:pass@proxy-a.example:1080' });
  assert.equal(first.switched, true);
  assert.equal(first.session.proxyUrl, 'socks5h://user:pass@proxy-a.example:1080');
  assert.equal(first.session.baseSnapshot.previousProxySettings.value.mode, 'pac_script');

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
        host: 'proxy-711.example',
        port: 8001,
        username: 'user-711',
        password: 'pass-711',
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
  assert.equal(poolCalls.length, 1);
  assert.equal(poolCalls[0].ipProxyService, '711proxy');
  assert.match(poolCalls[0].ipProxyApiUrl, /region=US/);

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
        return { hostedVerificationVisible: false };
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
  assert.notEqual(profileState.email, cachedProfile.email);
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
  assert.notEqual(profileState.email, 'stale@example.com');
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
