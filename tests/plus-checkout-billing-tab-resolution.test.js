const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadPlusCheckoutBillingModule() {
  const source = fs.readFileSync('background/steps/fill-plus-checkout.js', 'utf8');
  const globalScope = {};
  return new Function('self', `${source}; return self.MultiPageBackgroundPlusCheckoutBilling;`)(globalScope);
}

function createAddressSeed() {
  return {
    countryCode: 'US',
    query: 'New York NY',
    suggestionIndex: 1,
    fallback: {
      address1: '3450 Broadway',
      city: 'New York',
      region: 'New York',
      postalCode: '10031',
    },
  };
}

function createAuAddressSeed() {
  return {
    countryCode: 'AU',
    query: 'Sydney NSW',
    suggestionIndex: 1,
    fallback: {
      address1: 'George Street',
      city: 'Sydney',
      region: 'New South Wales',
      postalCode: '2000',
    },
  };
}

function createIdAddressSeed() {
  return {
    countryCode: 'ID',
    query: 'Jakarta Indonesia',
    suggestionIndex: 1,
    fallback: {
      address1: 'Jalan M.H. Thamrin No. 1',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      postalCode: '10310',
    },
  };
}

function createKrAddressSeed() {
  return {
    countryCode: 'KR',
    query: 'Seoul Jung-gu',
    suggestionIndex: 1,
    fallback: {
      address1: 'Sejong-daero 110',
      city: 'Jung-gu',
      region: 'Seoul',
      postalCode: '04524',
    },
  };
}

function createSuccessfulBillingResult() {
  return {
    countryText: 'United States',
    structuredAddress: {
      address1: '3450 Broadway',
      city: 'New York',
      postalCode: '10031',
    },
  };
}

function createRandomUserUsPayload() {
  return {
    results: [{
      location: {
        street: { number: 1600, name: 'Pennsylvania Ave NW' },
        city: 'Washington',
        state: 'District of Columbia',
        postcode: 20500,
      },
    }],
  };
}

function createCheckoutConversionProxyManagerHarness(events, options = {}) {
  let storedSession = options.initialSession || null;
  return {
    applySessionFromState: async (state, sessionOptions = {}) => {
      const payload = {
        active: true,
        flowType: sessionOptions.flowType,
        releaseNodeKey: sessionOptions.releaseNodeKey,
        appliedStepKey: sessionOptions.appliedStepKey,
        displayName: String(options.displayName || state?.plusCheckoutConversionProxyUrl || 'http://proxy.example:8080'),
        snapshot: { applied: true },
      };
      storedSession = payload;
      events.proxy.push({
        type: 'apply',
        proxyUrl: state?.plusCheckoutConversionProxyUrl || '',
        options: sessionOptions,
      });
      return payload;
    },
    getStoredSession: async () => storedSession,
    restoreSession: async (session) => {
      events.proxy.push({
        type: 'restore',
        flowType: session?.flowType || '',
        displayName: session?.displayName || '',
      });
      storedSession = null;
      return true;
    },
  };
}

function createExecutorHarness({
  frames,
  stateByFrame,
  readyByFrame = {},
  fetchImpl = null,
  getAddressSeedForCountry = () => createAddressSeed(),
  getState = null,
  handlePhonePlusNonFreeTrialFallback = null,
  queryTabsInAutomationWindow = null,
  markCurrentRegistrationAccountUsed = async () => {},
  onClickSubscribe = null,
  probeIpProxyExit = null,
  onSetState = null,
  sleepWithStop = null,
  initialState = {},
  checkoutConversionProxyManager = null,
  submitRedirectUrl = 'https://www.paypal.com/checkoutnow',
  onGetState = null,
  onRetryAddressTaxAutocomplete = null,
}) {
  const api = loadPlusCheckoutBillingModule();
  const events = {
    completed: [],
    ensuredTabs: [],
    injectedAllFrames: false,
    logs: [],
    messages: [],
    proxy: [],
    sleeps: [],
    states: [],
    waitedUrls: [],
  };
  const checkoutTab = {
    id: 42,
    url: 'https://chatgpt.com/checkout/openai_ie/cs_test',
    status: 'complete',
  };
  let runtimeState = initialState && typeof initialState === 'object'
    ? { ...initialState }
    : {};

  const proxyManager = checkoutConversionProxyManager || null;

  const executor = api.createPlusCheckoutBillingExecutor({
    addLog: async (message, level = 'info') => events.logs.push({ message, level }),
    chrome: {
      tabs: {
        get: async (tabId) => (tabId === checkoutTab.id ? checkoutTab : null),
        query: async (queryInfo) => {
          if (queryInfo.active && queryInfo.currentWindow) {
            return [checkoutTab];
          }
          if (queryInfo.url === 'https://chatgpt.com/checkout/*') {
            return [checkoutTab];
          }
          return [];
        },
        sendMessage: async (tabId, message, options = {}) => {
          const frameId = Number.isInteger(options.frameId) ? options.frameId : 0;
          events.messages.push({ tabId, message, frameId });
          const hasConfiguredState = Object.prototype.hasOwnProperty.call(stateByFrame, frameId);
          if (message.type === 'PING') {
            if (readyByFrame[frameId] === false) {
              throw new Error('No receiving end');
            }
            return { ok: true, source: 'plus-checkout' };
          }
          if (readyByFrame[frameId] === false && !hasConfiguredState) {
            throw new Error('No receiving end');
          }
          if (message.type === 'PLUS_CHECKOUT_GET_STATE') {
            if (typeof onGetState === 'function') {
              const stateResult = await onGetState({ checkoutTab, events, frameId, message, tabId });
              if (stateResult !== undefined) {
                return stateResult;
              }
            }
            return stateByFrame[frameId] || { hasPayPal: false, paypalCandidates: [] };
          }
          if (message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE') {
            if (typeof onClickSubscribe === 'function') {
              const clickResult = await onClickSubscribe({ checkoutTab, events, frameId, message, tabId });
              if (clickResult !== undefined) {
                return clickResult;
              }
            } else {
              checkoutTab.url = submitRedirectUrl;
            }
          }
          if (message.type === 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE') {
            if (typeof onRetryAddressTaxAutocomplete === 'function') {
              const retryResult = await onRetryAddressTaxAutocomplete({ checkoutTab, events, frameId, message, tabId });
              if (retryResult !== undefined) {
                return retryResult;
              }
            }
            return { retried: true };
          }
          return createSuccessfulBillingResult();
        },
      },
      scripting: {
        executeScript: async (details) => {
          if (details.target?.allFrames) {
            events.injectedAllFrames = true;
          }
        },
      },
      webNavigation: {
        getAllFrames: async () => frames,
      },
    },
    completeNodeFromBackground: async (step, payload) => events.completed.push({ step, payload }),
    ensureContentScriptReadyOnTabUntilStopped: async (source, tabId) => events.ensuredTabs.push({ source, tabId }),
    ...(proxyManager ? { checkoutConversionProxyManager: proxyManager } : {}),
    fetch: fetchImpl,
    generateRandomName: () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
    getAddressSeedForCountry,
    getState: typeof getState === 'function' ? getState : async () => runtimeState,
    getTabId: async () => null,
    ...(typeof handlePhonePlusNonFreeTrialFallback === 'function' ? { handlePhonePlusNonFreeTrialFallback } : {}),
    isTabAlive: async () => false,
    markCurrentRegistrationAccountUsed,
    ...(typeof queryTabsInAutomationWindow === 'function' ? { queryTabsInAutomationWindow } : {}),
    setState: async (updates) => {
      runtimeState = { ...runtimeState, ...(updates || {}) };
      events.states.push(updates);
      if (typeof onSetState === 'function') {
        await onSetState(updates, events);
      }
    },
    sleepWithStop: sleepWithStop || (async (ms) => events.sleeps.push(ms)),
    waitForTabCompleteUntilStopped: async () => checkoutTab,
    waitForTabUrlMatchUntilStopped: async (tabId, matcher) => {
      events.waitedUrls.push({ tabId });
      assert.equal(matcher(submitRedirectUrl), true);
      return { id: tabId, url: submitRedirectUrl };
    },
    ...(typeof probeIpProxyExit === 'function' ? { probeIpProxyExit } : {}),
  });

  return {
    checkoutTab,
    events,
    executor,
    getRuntimeState: () => runtimeState,
    setRuntimeState: (nextState) => {
      runtimeState = nextState && typeof nextState === 'object' ? { ...nextState } : {};
    },
  };
}

test('Plus checkout billing stops before PayPal when today due amount is non-zero', async () => {
  const markCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
        checkoutAmountSummary: {
          hasTodayDue: true,
          amount: 19.33,
          isZero: false,
          rawAmount: '€19.33',
        },
      },
    },
    markCurrentRegistrationAccountUsed: async (state, options) => {
      markCalls.push({ state, options });
      return { updated: true };
    },
  });

  await assert.rejects(
    () => executor.executePlusCheckoutBilling({ email: 'paid@example.com' }),
    /PLUS_CHECKOUT_NON_FREE_TRIAL::/
  );

  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE'), false);
  assert.equal(events.completed.length, 0);
  assert.equal(markCalls.length, 1);
  assert.equal(markCalls[0].state.email, 'paid@example.com');
  assert.equal(events.logs.some((entry) => /今日应付金额不是 0/.test(entry.message)), true);
});

test('Phone Plus non-free checkout falls back to free auth without marking account used', async () => {
  const fallbackCalls = [];
  const markCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
        checkoutAmountSummary: {
          hasTodayDue: true,
          amount: 19.33,
          isZero: false,
          rawAmount: '€19.33',
        },
      },
    },
    handlePhonePlusNonFreeTrialFallback: async (state, context) => {
      fallbackCalls.push({ state, context });
      return {
        handled: true,
        nextNodeId: 'oauth-login',
        skippedNodeIds: ['plus-checkout-create', 'plus-checkout-billing', 'paypal-approve', 'plus-checkout-return'],
      };
    },
    markCurrentRegistrationAccountUsed: async (state, options) => {
      markCalls.push({ state, options });
      return { updated: true };
    },
  });

  await executor.executePlusCheckoutBilling({
    email: 'phone-free@example.com',
    panelMode: 'cpa',
    phonePlusModeEnabled: true,
  });

  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE'), false);
  assert.equal(events.completed.length, 0);
  assert.equal(markCalls.length, 0);
  assert.equal(fallbackCalls.length, 1);
  assert.equal(fallbackCalls[0].state.panelMode, 'cpa');
  assert.equal(fallbackCalls[0].context.amountLabel, '€19.33');
  assert.equal(fallbackCalls[0].context.nodeId, 'plus-checkout-billing');
});

test('Phone Plus zero amount keeps the original checkout flow', async () => {
  const { events, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
        checkoutAmountSummary: {
          hasTodayDue: true,
          amount: 0,
          isZero: true,
          rawAmount: '€0.00',
        },
      },
    },
    handlePhonePlusNonFreeTrialFallback: async () => {
      throw new Error('fallback should not run for zero amount');
    },
  });

  await executor.executePlusCheckoutBilling({
    email: 'phone-zero@example.com',
    panelMode: 'cpa',
    phonePlusModeEnabled: true,
  });

  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE'), true);
  assert.deepStrictEqual(events.completed, [
    { step: 'plus-checkout-billing', payload: { plusBillingCountryText: 'United States' } },
  ]);
});

test('Plus checkout billing uses the current checkout tab when step 6 did not register one', async () => {
  const { checkoutTab, events, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
      },
    },
  });

  await executor.executePlusCheckoutBilling({});

  assert.deepEqual(events.ensuredTabs[0], { source: 'plus-checkout', tabId: checkoutTab.id });
  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL' && entry.frameId === 0), true);
  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS' && entry.frameId === 0), true);
  assert.equal(events.messages.some((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE' && entry.frameId === 0), true);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
  assert.equal(events.states.some((updates) => updates.plusCheckoutTabId === checkoutTab.id), true);
  assert.equal(events.logs.some((entry) => /当前已在 Plus Checkout 页面/.test(entry.message)), true);
});

test('Plus checkout billing waits on processing subscribe text before clicking a ready subscribe button again', async () => {
  const originalNow = Date.now;
  let now = 0;
  let clickCalls = 0;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          billingFieldsVisible: true,
          hasSubscribeButton: true,
        },
      },
      onClickSubscribe: async ({ checkoutTab }) => {
        clickCalls += 1;
        if (clickCalls === 1) {
          return {
            clicked: false,
            subscribeButtonStatus: 'processing',
            subscribeButtonText: '订阅正在处理',
          };
        }
        checkoutTab.url = 'https://www.paypal.com/checkoutnow';
        return {
          clicked: true,
          subscribeButtonStatus: 'clicked',
          subscribeButtonText: '订阅',
        };
      },
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await executor.executePlusCheckoutBilling({});

    const subscribeMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
    assert.equal(subscribeMessages.length, 2);
    assert.equal(subscribeMessages.some((entry) => entry.message.payload.allowBusySubscribeButton !== undefined), false);
    assert.equal(events.sleeps.filter((ms) => ms === 500).length >= 16, true);
    assert.equal(events.logs.some((entry) => /本轮未点击/.test(entry.message)), true);
    assert.equal(events.completed[0].step, 'plus-checkout-billing');
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing retries submit without rerunning the checkout half-flow', async () => {
  const originalNow = Date.now;
  let now = 0;
  let clickCalls = 0;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          billingFieldsVisible: true,
          hasSubscribeButton: true,
        },
      },
      onClickSubscribe: async ({ checkoutTab }) => {
        clickCalls += 1;
        if (clickCalls === 2) {
          checkoutTab.url = 'https://www.paypal.com/checkoutnow';
        }
        return {
          clicked: true,
          subscribeButtonStatus: 'clicked',
          subscribeButtonText: '订阅',
        };
      },
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await executor.executePlusCheckoutBilling({});

    const selectMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL');
    const fillMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
    const subscribeMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
    assert.equal(selectMessages.length, 1);
    assert.equal(fillMessages.length, 1);
    assert.equal(subscribeMessages.length, 2);
    assert.equal(subscribeMessages.some((entry) => entry.message.payload.ensurePaymentActive !== undefined), false);
    assert.equal(events.sleeps.filter((ms) => ms === 500).length >= 20, true);
    assert.equal(events.logs.some((entry) => /重新检测订阅按钮/.test(entry.message)), true);
    assert.equal(events.completed[0].step, 'plus-checkout-billing');
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing retries address autocomplete after address tax error and then succeeds', async () => {
  const originalNow = Date.now;
  let now = 0;
  let clickCalls = 0;
  let addressRetried = false;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [
        { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
        { frameId: 3, url: 'https://checkout.stripe.com/elements-inner-address' },
      ],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          hasSubscribeButton: true,
        },
        3: {
          billingFieldsVisible: true,
        },
      },
      onGetState: async ({ frameId }) => {
        if (frameId === 0) {
          return {
            hasPayPal: true,
            paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
            hasSubscribeButton: true,
          };
        }
        return {
          billingFieldsVisible: true,
          hostedAddressError: clickCalls >= 1 && !addressRetried,
          hostedAddressErrorMessage: clickCalls >= 1 && !addressRetried
            ? 'We could not calculate tax for this address.'
            : '',
        };
      },
      onClickSubscribe: async ({ checkoutTab }) => {
        clickCalls += 1;
        if (addressRetried && clickCalls >= 2) {
          checkoutTab.url = 'https://www.paypal.com/checkoutnow';
        }
        return {
          clicked: true,
          subscribeButtonStatus: 'clicked',
          subscribeButtonText: 'Subscribe',
        };
      },
      onRetryAddressTaxAutocomplete: async () => {
        addressRetried = true;
        return { retried: true, selectionMethod: 'dom' };
      },
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await executor.executePlusCheckoutBilling({ plusPaymentMethod: 'paypal' });

    const subscribeMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
    const retryMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE');
    assert.equal(subscribeMessages.length, 2);
    assert.equal(retryMessages.length, 1);
    assert.equal(retryMessages[0].frameId, 3);
    assert.equal(subscribeMessages.every((entry) => entry.frameId === 0), true);
    assert.equal(events.sleeps.filter((ms) => ms === 500).length >= 10, true);
    assert.equal(events.completed[0].step, 'plus-checkout-billing');
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing refills a fresh address when subscribe clears address line 1', async () => {
  const originalNow = Date.now;
  let now = 0;
  let clickCalls = 0;
  let addressRefilled = false;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [
        { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
        { frameId: 3, url: 'https://checkout.stripe.com/elements-inner-address' },
      ],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          hasSubscribeButton: true,
        },
        3: {
          billingFieldsVisible: true,
          countryText: 'United States',
          addressFieldValues: {
            address1: '3450 Broadway',
            city: 'New York',
            region: 'New York',
            postalCode: '10031',
          },
        },
      },
      onGetState: async ({ frameId }) => {
        if (frameId === 0) {
          return {
            hasPayPal: true,
            paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
            hasSubscribeButton: true,
          };
        }
        return {
          billingFieldsVisible: true,
          countryText: 'United States',
          addressFieldValues: {
            address1: clickCalls >= 1 && !addressRefilled ? '' : '1600 Pennsylvania Ave NW',
            city: 'Washington',
            region: 'District of Columbia',
            postalCode: '20500',
          },
        };
      },
      onClickSubscribe: async ({ checkoutTab }) => {
        clickCalls += 1;
        if (addressRefilled && clickCalls >= 2) {
          checkoutTab.url = 'https://www.paypal.com/checkoutnow';
        }
        return {
          clicked: true,
          subscribeButtonStatus: 'clicked',
          subscribeButtonText: 'Subscribe',
        };
      },
      onSetState: async (updates) => {
        if (clickCalls >= 1 && updates?.plusBillingAddress) {
          addressRefilled = true;
        }
      },
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => createRandomUserUsPayload(),
      }),
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await executor.executePlusCheckoutBilling({ plusPaymentMethod: 'paypal' });

    const subscribeMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
    const fillMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
    assert.equal(subscribeMessages.length, 2);
    assert.equal(fillMessages.length, 2);
    assert.equal(fillMessages[1].frameId, 3);
    assert.equal(fillMessages[1].message.payload.addressSeed.fallback.address1, '1600 Pennsylvania Ave NW');
    assert.equal(events.logs.some((entry) => /billing address is empty|cleared the billing address/i.test(entry.message)), true);
    assert.equal(events.completed[0].step, 'plus-checkout-billing');
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing stops after two address tax autocomplete retries', async () => {
  const originalNow = Date.now;
  let now = 0;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [
        { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
        { frameId: 3, url: 'https://checkout.stripe.com/elements-inner-address' },
      ],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          hasSubscribeButton: true,
        },
        3: {
          billingFieldsVisible: true,
          hostedAddressError: true,
          hostedAddressErrorMessage: 'We could not calculate tax for this address.',
        },
      },
      onClickSubscribe: async () => ({
        clicked: true,
        subscribeButtonStatus: 'clicked',
        subscribeButtonText: 'Subscribe',
      }),
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await assert.rejects(
      () => executor.executePlusCheckoutBilling({ plusPaymentMethod: 'paypal' }),
      /PLUS_CHECKOUT_ADDRESS_TAX_RETRY_EXHAUSTED::/
    );

    assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE').length, 2);
    assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE').length, 3);
    assert.equal(events.completed.length, 0);
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing keeps generic no-redirect retry behavior when there is no address tax error', async () => {
  const originalNow = Date.now;
  let now = 0;
  Date.now = () => now;
  try {
    const { events, executor } = createExecutorHarness({
      frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          billingFieldsVisible: true,
          hasSubscribeButton: true,
        },
      },
      onClickSubscribe: async () => ({
        clicked: true,
        subscribeButtonStatus: 'clicked',
        subscribeButtonText: 'Subscribe',
      }),
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await assert.rejects(
      () => executor.executePlusCheckoutBilling({ plusPaymentMethod: 'paypal' }),
      /PayPal/
    );

    assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE').length, 3);
    assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_RETRY_ADDRESS_TAX_AUTOCOMPLETE').length, 0);
    assert.equal(events.sleeps.filter((ms) => ms === 500).length >= 60, true);
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing reuses an active checkout conversion proxy session during retries', async () => {
  const originalNow = Date.now;
  let now = 0;
  let clickCalls = 0;
  Date.now = () => now;
  try {
    const proxyEvents = { proxy: [] };
    const { events, executor } = createExecutorHarness({
      frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          billingFieldsVisible: true,
          hasSubscribeButton: true,
        },
      },
      initialState: {
        plusPaymentMethod: 'paypal',
        plusCheckoutConversionProxyUrl: 'socks5h://proxy.example:1080',
        plusCheckoutConversionProxySession: {
          active: true,
          flowType: 'classic-paypal',
          displayName: 'socks5h://proxy.example:1080',
          snapshot: { applied: true },
        },
      },
      checkoutConversionProxyManager: createCheckoutConversionProxyManagerHarness(proxyEvents, {
        initialSession: {
          active: true,
          flowType: 'classic-paypal',
          displayName: 'socks5h://proxy.example:1080',
          snapshot: { applied: true },
        },
      }),
      onClickSubscribe: async ({ checkoutTab }) => {
        clickCalls += 1;
        if (clickCalls === 2) {
          checkoutTab.url = 'https://www.paypal.com/checkoutnow';
        }
        return {
          clicked: true,
          subscribeButtonStatus: 'clicked',
          subscribeButtonText: '订阅',
        };
      },
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await executor.executePlusCheckoutBilling({
      plusPaymentMethod: 'paypal',
      plusCheckoutConversionProxyUrl: 'socks5h://proxy.example:1080',
    });

    assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL').length, 1);
    assert.deepStrictEqual(proxyEvents.proxy, []);
    assert.equal(events.logs.some((entry) => /复用已启用的支付转换代理/.test(entry.message)), true);
    assert.equal(events.completed[0].step, 'plus-checkout-billing');
  } finally {
    Date.now = originalNow;
  }
});

test('Classic PayPal billing falls back to applying checkout conversion proxy when step 6 did not', async () => {
  const proxyEvents = { proxy: [] };
  const { events, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
      },
    },
    initialState: {
      plusPaymentMethod: 'paypal',
      plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
    },
    checkoutConversionProxyManager: createCheckoutConversionProxyManagerHarness(proxyEvents),
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'paypal',
    plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
  });

  assert.deepStrictEqual(proxyEvents.proxy.map((entry) => entry.type), ['apply']);
  assert.equal(proxyEvents.proxy[0].options.flowType, 'classic-paypal');
  assert.equal(proxyEvents.proxy[0].options.appliedStepKey, 'plus-checkout-billing');
  assert.equal(events.logs.some((entry) => /兜底启用支付转换代理/.test(entry.message)), true);
  assert.equal(events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL').length, 1);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Classic PayPal billing releases proxy once after 3 submit attempts still fail to redirect', async () => {
  const originalNow = Date.now;
  let now = 0;
  Date.now = () => now;
  try {
    const proxyEvents = { proxy: [] };
    const { events, executor } = createExecutorHarness({
      frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
      stateByFrame: {
        0: {
          hasPayPal: true,
          paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
          billingFieldsVisible: true,
          hasSubscribeButton: true,
        },
      },
      initialState: {
        plusPaymentMethod: 'paypal',
        plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
      },
      checkoutConversionProxyManager: createCheckoutConversionProxyManagerHarness(proxyEvents),
      onClickSubscribe: async () => ({
        clicked: true,
        subscribeButtonStatus: 'clicked',
        subscribeButtonText: '订阅',
      }),
      sleepWithStop: async (ms) => {
        events.sleeps.push(ms);
        now += ms;
      },
    });

    await assert.rejects(
      () => executor.executePlusCheckoutBilling({
        plusPaymentMethod: 'paypal',
        plusCheckoutConversionProxyUrl: 'http://proxy.example:8080',
      }),
      /多次检测订阅按钮后仍未跳转到 PayPal/
    );

    const selectMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL');
    const fillMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
    const subscribeMessages = events.messages.filter((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
    assert.equal(selectMessages.length, 1);
    assert.equal(fillMessages.length, 1);
    assert.equal(subscribeMessages.length, 3);
    assert.deepStrictEqual(proxyEvents.proxy.map((entry) => entry.type), ['apply', 'restore']);
    assert.equal(proxyEvents.proxy[1].flowType, 'classic-paypal');
  } finally {
    Date.now = originalNow;
  }
});

test('Plus checkout billing searches checkout tabs inside the locked automation window', async () => {
  const queries = [];
  const { checkoutTab, executor } = createExecutorHarness({
    frames: [{ frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' }],
    queryTabsInAutomationWindow: async (queryInfo) => {
      queries.push(queryInfo);
      if (queryInfo?.active) {
        return [];
      }
      if (queryInfo?.url === 'https://chatgpt.com/checkout/*') {
        return [checkoutTab];
      }
      return [];
    },
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        billingFieldsVisible: true,
        hasSubscribeButton: true,
      },
    },
  });

  await executor.executePlusCheckoutBilling({});

  assert.deepEqual(queries, [
    { active: true, currentWindow: true },
    { url: 'https://chatgpt.com/checkout/*' },
  ]);
});

test('Plus checkout billing sends the billing command to the iframe that contains PayPal', async () => {
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: { hasPayPal: false, paypalCandidates: [], billingFieldsVisible: true },
    },
  });

  await executor.executePlusCheckoutBilling({});

  const selectMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL');
  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  const subscribeMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
  assert.equal(selectMessage.frameId, 7);
  assert.equal(fillMessage.frameId, 8);
  assert.equal(subscribeMessage.frameId, 0);
  assert.equal(events.logs.some((entry) => /checkout iframe/.test(entry.message)), true);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Classic PayPal billing uses randomuser.me before local US address fallback', async () => {
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
      { frameId: 9, url: 'https://js.stripe.com/v3/elements-inner-autocompl.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: 'United States',
      },
      9: { hasPayPal: false, paypalCandidates: [] },
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => createRandomUserUsPayload(),
      };
    },
  });

  await executor.executePlusCheckoutBilling({});

  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(fetchRequests.length, 1);
  assert.equal(fetchRequests[0].url, 'https://randomuser.me/api/?nat=us&inc=location&noinfo');
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'US');
  assert.equal(fillMessage.message.payload.addressSeed.source, 'randomuser');
  assert.equal(fillMessage.message.payload.addressSeed.skipAutocomplete, true);
  assert.equal(fillMessage.message.payload.addressSeed.fallback.address1, '1600 Pennsylvania Ave NW');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.city, 'Washington');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.postalCode, '20500');
});

test('Classic PayPal billing falls back to local US seed when randomuser.me fails', async () => {
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: 'United States',
      },
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      return {
        ok: false,
        status: 503,
        json: async () => ({}),
      };
    },
  });

  await executor.executePlusCheckoutBilling({});

  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(fetchRequests.length, 2);
  assert.equal(fetchRequests[0].url, 'https://randomuser.me/api/?nat=us&inc=location&noinfo');
  assert.equal(fetchRequests[1].url, 'https://www.meiguodizhi.com/api/v1/dz');
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'US');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.address1, '3450 Broadway');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.city, 'New York');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.postalCode, '10031');
});

test('Classic PayPal billing can use the US 4-digit autocomplete seed mode', async () => {
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: 'United States',
      },
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      throw new Error('network should not be used for autocomplete mode');
    },
  });

  await executor.executePlusCheckoutBilling({ paypalCheckoutUsAutocompleteModeEnabled: true });

  const fillQueryMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_ADDRESS_QUERY');
  const combinedFillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(fetchRequests.length, 0);
  const addressSeed = (fillQueryMessage || combinedFillMessage).message.payload.addressSeed;
  assert.equal(addressSeed.countryCode, 'US');
  assert.match(addressSeed.query, /^\d{4}$/);
  assert.equal(addressSeed.numericQueryDigits, 4);
  assert.equal(addressSeed.randomSuggestion, true);
  assert.equal(addressSeed.forceCountrySelectionBeforeAutocomplete, true);
  assert.equal(addressSeed.source, 'paypal_us_google_autocomplete');
});

test('Plus checkout billing uses proxy exit country for GoPay address when available', async () => {
  const requestedCountries = [];
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_llc/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, hasGoPay: false, paypalCandidates: [], gopayCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: false, hasGoPay: true, gopayCandidates: [{ tag: 'button', text: 'GoPay' }] },
      8: {
        hasPayPal: false,
        hasGoPay: false,
        paypalCandidates: [],
        gopayCandidates: [],
        billingFieldsVisible: true,
        countryText: 'United States',
      },
    },
    getAddressSeedForCountry: (countryValue) => {
      requestedCountries.push(countryValue);
      return countryValue === 'JP' ? {
        countryCode: 'JP',
        query: 'Tokyo Marunouchi',
        suggestionIndex: 1,
        fallback: {
          address1: 'Marunouchi 1-1',
          city: 'Chiyoda-ku',
          region: 'Tokyo',
          postalCode: '100-0005',
        },
      } : createIdAddressSeed();
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ok',
          address: {
            Address: 'トウキョウト, チヨダク, マルノウチ, 1-1',
            Trans_Address: 'Marunouchi 1-1, Chiyoda-ku, Tokyo',
            City: 'Tokyo',
            State: 'Tokyo',
            Zip_Code: '100-0005',
          },
        }),
      };
    },
    submitRedirectUrl: 'https://app.midtrans.com/snap/v4/redirection/session#/gopay-tokenization/linking',
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gopay',
    plusCheckoutCountry: 'ID',
    ipProxyAppliedExitRegion: 'JP',
  });

  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(requestedCountries[0], 'JP');
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'JP');
  assert.equal(fillMessage.message.payload.addressSeed.source, 'meiguodizhi');
  assert.deepEqual(JSON.parse(fetchRequests[0].init.body), {
    city: 'Chiyoda-ku',
    path: '/jp-address',
    method: 'refresh',
  });
  assert.equal(events.logs.some((entry) => /GoPay 账单地址将按当前代理出口地区 JP/.test(entry.message)), true);
});

test('Plus checkout billing refreshes stale GoPay proxy country before filling address', async () => {
  const requestedCountries = [];
  const probeCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_llc/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, hasGoPay: false, paypalCandidates: [], gopayCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: false, hasGoPay: true, gopayCandidates: [{ tag: 'button', text: 'GoPay' }] },
      8: {
        hasPayPal: false,
        hasGoPay: false,
        paypalCandidates: [],
        gopayCandidates: [],
        billingFieldsVisible: true,
        countryText: 'Indonesia',
      },
    },
    getAddressSeedForCountry: (countryValue) => {
      requestedCountries.push(countryValue);
      return countryValue === 'JP' ? {
        countryCode: 'JP',
        query: 'Tokyo Chiyoda-ku',
        suggestionIndex: 1,
        fallback: {
          address1: 'Marunouchi 1-1',
          city: 'Chiyoda-ku',
          region: 'Tokyo',
          postalCode: '100-0005',
        },
      } : createKrAddressSeed();
    },
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      json: async () => ({ status: 'error' }),
    }),
    probeIpProxyExit: async (options) => {
      probeCalls.push(options);
      return {
        proxyRouting: {
          exitRegion: 'JP',
          exitIp: '203.0.113.8',
          exitSource: 'page_context',
          exitEndpoint: 'https://ipinfo.io/json',
        },
      };
    },
    submitRedirectUrl: 'https://app.midtrans.com/snap/v4/redirection/session#/gopay-tokenization/linking',
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gopay',
    plusCheckoutCountry: 'ID',
    ipProxyAppliedExitRegion: 'KR',
  });

  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(probeCalls.length, 1);
  assert.equal(probeCalls[0].detectWhenDisabled, true);
  assert.equal(requestedCountries[0], 'JP');
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'JP');
  assert.equal(events.logs.some((entry) => entry.message.includes('当前代理出口复测结果：JP / 203.0.113.8')), true);
  assert.equal(events.logs.some((entry) => /GoPay 账单地址将按当前代理出口地区 JP/.test(entry.message)), true);
  assert.equal(events.logs.some((entry) => /GoPay 账单地址将按当前代理出口地区 KR/.test(entry.message)), false);
});

test('Plus checkout billing refuses to reuse stale GoPay proxy country when refresh has no region', async () => {
  const requestedCountries = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_llc/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, hasGoPay: false, paypalCandidates: [], gopayCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: false, hasGoPay: true, gopayCandidates: [{ tag: 'button', text: 'GoPay' }] },
      8: {
        hasPayPal: false,
        hasGoPay: false,
        paypalCandidates: [],
        gopayCandidates: [],
        billingFieldsVisible: true,
        countryText: 'Indonesia',
      },
    },
    getAddressSeedForCountry: (countryValue) => {
      requestedCountries.push(countryValue);
      return createKrAddressSeed();
    },
    probeIpProxyExit: async () => ({
      proxyRouting: {
        reason: 'disabled_probe_only',
        exitIp: '203.0.113.9',
        exitRegion: '',
        exitError: 'missing_region',
      },
    }),
  });

  await assert.rejects(
    () => executor.executePlusCheckoutBilling({
      plusPaymentMethod: 'gopay',
      plusCheckoutCountry: 'ID',
      ipProxyAppliedExitRegion: 'KR',
    }),
    /本次复测没有拿到国家码/
  );

  assert.equal(requestedCountries.length, 0);
  assert.equal(events.logs.some((entry) => /已清空旧出口地区 KR/.test(entry.message)), true);
  assert.equal(events.logs.some((entry) => /GoPay 账单地址将按当前代理出口地区 KR/.test(entry.message)), false);
});

test('Plus checkout billing normalizes legacy Korean postal code for GoPay address', async () => {
  const requestedCountries = [];
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_llc/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, hasGoPay: false, paypalCandidates: [], gopayCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: false, hasGoPay: true, gopayCandidates: [{ tag: 'button', text: 'GoPay' }] },
      8: {
        hasPayPal: false,
        hasGoPay: false,
        paypalCandidates: [],
        gopayCandidates: [],
        billingFieldsVisible: true,
        countryText: 'United States',
      },
    },
    getAddressSeedForCountry: (countryValue) => {
      requestedCountries.push(countryValue);
      return countryValue === 'KR' ? createKrAddressSeed() : createIdAddressSeed();
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      if (/randomuser\.me/i.test(url)) {
        return {
          ok: true,
          status: 200,
          json: async () => createRandomUserUsPayload(),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ok',
          address: {
            Address: '서울특별시 중구 세종대로 110',
            Trans_Address: 'Sejong-daero 110, Jung-gu, Seoul',
            City: 'Jung-gu',
            State: 'Seoul',
            Zip_Code: '150-300',
          },
        }),
      };
    },
    submitRedirectUrl: 'https://app.midtrans.com/snap/v4/redirection/session#/gopay-tokenization/linking',
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gopay',
    plusCheckoutCountry: 'ID',
    ipProxyAppliedExitRegion: 'KR',
  });

  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(requestedCountries[0], 'KR');
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'KR');
  assert.equal(fillMessage.message.payload.addressSeed.source, 'meiguodizhi');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.address1, 'Sejong-daero 110, Jung-gu, Seoul');
  assert.equal(fillMessage.message.payload.addressSeed.fallback.postalCode, '04524');
  assert.match(fillMessage.message.payload.addressSeed.fallback.postalCode, /^\d{5}$/);
  assert.deepEqual(JSON.parse(fetchRequests[0].init.body), {
    city: 'Jung-gu',
    path: '/kr-address',
    method: 'refresh',
  });
  assert.equal(events.logs.some((entry) => /GoPay 账单地址将按当前代理出口地区 KR/.test(entry.message)), true);
});

test('Plus checkout billing selects GoPay and waits for a GoPay redirect', async () => {
  const { checkoutTab, events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, hasGoPay: false, paypalCandidates: [], gopayCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: false, hasGoPay: true, gopayCandidates: [{ tag: 'button', text: 'GoPay' }] },
      8: {
        hasPayPal: false,
        hasGoPay: false,
        paypalCandidates: [],
        gopayCandidates: [],
        billingFieldsVisible: true,
        countryText: 'Indonesia',
      },
    },
    getAddressSeedForCountry: () => createIdAddressSeed(),
    fetchImpl: async () => ({
      ok: false,
      status: 404,
      json: async () => ({ status: 'error' }),
    }),
    submitRedirectUrl: 'https://gopay.co.id/payment/session',
  });

  await executor.executePlusCheckoutBilling({ plusPaymentMethod: 'gopay' });

  const selectMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_GOPAY');
  const paypalSelectMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL');
  const fillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  const subscribeMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_CLICK_SUBSCRIBE');
  assert.equal(selectMessage.frameId, 7);
  assert.equal(selectMessage.message.payload.paymentMethod, 'gopay');
  assert.equal(paypalSelectMessage, undefined);
  assert.equal(fillMessage.message.payload.addressSeed.countryCode, 'ID');
  assert.equal(subscribeMessage.message.payload.paymentMethod, 'gopay');
  assert.equal(checkoutTab.url, 'https://gopay.co.id/payment/session');
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Plus checkout billing still inspects a frame when ping readiness is stale', async () => {
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: {
        hasPayPal: true,
        paypalCandidates: [{ tag: 'button', text: 'PayPal' }],
        hasSubscribeButton: true,
      },
      7: { hasPayPal: false, paypalCandidates: [] },
      8: { hasPayPal: false, paypalCandidates: [], billingFieldsVisible: true },
    },
    readyByFrame: {
      0: false,
    },
  });

  await executor.executePlusCheckoutBilling({});

  const selectMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_PAYPAL');
  assert.equal(selectMessage.frameId, 0);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Plus checkout billing uses the autocomplete iframe for address suggestions when Stripe splits it out', async () => {
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
      { frameId: 9, url: 'https://js.stripe.com/v3/elements-inner-autocompl.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: { hasPayPal: false, paypalCandidates: [], billingFieldsVisible: true },
      9: { hasPayPal: false, paypalCandidates: [] },
    },
  });

  await executor.executePlusCheckoutBilling({});

  const fillQueryMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_ADDRESS_QUERY');
  const suggestionMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_ADDRESS_SUGGESTION');
  const ensureAddressMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_ENSURE_BILLING_ADDRESS');
  const combinedFillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(fillQueryMessage.frameId, 8);
  assert.equal(suggestionMessage.frameId, 9);
  assert.equal(ensureAddressMessage.frameId, 8);
  assert.equal(combinedFillMessage, undefined);
  assert.equal(events.logs.some((entry) => /Google 地址推荐/.test(entry.message)), true);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Classic PayPal billing ignores detected Germany and uses US address source', async () => {
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
      { frameId: 9, url: 'https://js.stripe.com/v3/elements-inner-autocompl.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: 'Germany',
      },
      9: { hasPayPal: false, paypalCandidates: [] },
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => createRandomUserUsPayload(),
      };
    },
  });

  await executor.executePlusCheckoutBilling({});

  const fillQueryMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_ADDRESS_QUERY');
  const suggestionMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_SELECT_ADDRESS_SUGGESTION');
  const ensureAddressMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_ENSURE_BILLING_ADDRESS');
  const combinedFillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(fillQueryMessage, undefined);
  assert.equal(suggestionMessage, undefined);
  assert.equal(ensureAddressMessage, undefined);
  assert.equal(combinedFillMessage.frameId, 8);
  assert.equal(combinedFillMessage.message.payload.addressSeed.skipAutocomplete, true);
  assert.equal(combinedFillMessage.message.payload.addressSeed.countryCode, 'US');
  assert.equal(combinedFillMessage.message.payload.addressSeed.source, 'randomuser');
  assert.equal(combinedFillMessage.message.payload.addressSeed.fallback.address1, '1600 Pennsylvania Ave NW');
  assert.equal(combinedFillMessage.message.payload.addressSeed.fallback.city, 'Washington');
  assert.equal(combinedFillMessage.message.payload.addressSeed.fallback.postalCode, '20500');
  assert.equal(fetchRequests.length, 1);
  assert.equal(fetchRequests[0].url, 'https://randomuser.me/api/?nat=us&inc=location&noinfo');
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('Classic PayPal billing keeps US address seed even when checkout country is detected elsewhere', async () => {
  const requestedCountries = [];
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: 'Australia',
      },
    },
    getAddressSeedForCountry: (countryValue) => {
      requestedCountries.push(countryValue);
      return /australia|au/i.test(String(countryValue || '')) ? createAuAddressSeed() : createAddressSeed();
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [{
            location: {
              street: { number: 1600, name: 'Pennsylvania Ave NW' },
              city: 'Washington',
              state: 'District of Columbia',
              postcode: 20500,
            },
          }],
        }),
      };
    },
  });

  await executor.executePlusCheckoutBilling({ plusCheckoutCountry: 'DE' });

  const combinedFillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(requestedCountries[0], 'US');
  assert.equal(combinedFillMessage.message.payload.addressSeed.countryCode, 'US');
  assert.equal(combinedFillMessage.message.payload.addressSeed.source, 'randomuser');
  assert.equal(combinedFillMessage.message.payload.addressSeed.fallback.region, 'District of Columbia');
  assert.equal(fetchRequests[0].url, 'https://randomuser.me/api/?nat=us&inc=location&noinfo');
});

test('Classic PayPal billing ignores localized checkout country and keeps US address path', async () => {
  const fetchRequests = [];
  const { events, executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
      { frameId: 8, url: 'https://js.stripe.com/v3/elements-inner-address.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
      7: { hasPayPal: true, paypalCandidates: [{ tag: 'button', text: 'PayPal' }] },
      8: {
        hasPayPal: false,
        paypalCandidates: [],
        billingFieldsVisible: true,
        countryText: '日本',
      },
    },
    fetchImpl: async (url, init) => {
      fetchRequests.push({ url, init });
      if (/randomuser\.me/i.test(url)) {
        return {
          ok: true,
          status: 200,
          json: async () => createRandomUserUsPayload(),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ok',
          address: {
            Address: 'トウキョウト, ミナトク, シバダイモン, 10-4',
            Trans_Address: '10-4, Shiba Daimon 2-chome, Minato-ku, Tokyo',
            City: 'Tokyo',
            State: 'Tokyo',
            Zip_Code: '105-0012',
          },
        }),
      };
    },
  });

  await executor.executePlusCheckoutBilling({ plusCheckoutCountry: 'DE' });

  const combinedFillMessage = events.messages.find((entry) => entry.message.type === 'PLUS_CHECKOUT_FILL_BILLING_ADDRESS');
  assert.equal(combinedFillMessage.message.payload.addressSeed.countryCode, 'US');
  assert.equal(combinedFillMessage.message.payload.addressSeed.source, 'randomuser');
  assert.equal(combinedFillMessage.message.payload.addressSeed.fallback.address1, '1600 Pennsylvania Ave NW');
  assert.equal(fetchRequests[0].url, 'https://randomuser.me/api/?nat=us&inc=location&noinfo');
});

test('Plus checkout billing reports when the payment iframe exists but cannot receive the content script', async () => {
  const { executor } = createExecutorHarness({
    frames: [
      { frameId: 0, url: 'https://chatgpt.com/checkout/openai_ie/cs_test' },
      { frameId: 7, url: 'https://js.stripe.com/v3/elements-inner-payment.html' },
    ],
    stateByFrame: {
      0: { hasPayPal: false, paypalCandidates: [], hasSubscribeButton: true },
    },
    readyByFrame: {
      7: false,
    },
  });

  await assert.rejects(
    executor.executePlusCheckoutBilling({}),
    /已定位到 PayPal 所在 iframe（frameId=7），但账单脚本无法注入该 iframe/
  );
});


function createGpcTaskResponse(data) {
  return {
    code: 200,
    message: 'ok',
    data: {
      task_id: 'task_123',
      phone_mode: 'manual',
      status_text: data.status === 'completed' ? '充值完成' : (data.status === 'otp_ready' ? '等待 PIN' : '处理中'),
      api_input_deadline_at: data.api_input_deadline_at ?? new Date(Date.now() + 60000).toISOString(),
      ...data,
    },
  };
}

test('GPC billing polls queue task, submits WhatsApp OTP then PIN, and waits until completed', async () => {
  const fetchCalls = [];
  let currentState = {
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: '',
  };
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    getState: async () => currentState,
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_123') {
        pollCount += 1;
        if (pollCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ status: 'active', remote_stage: 'whatsapp_otp_wait', api_waiting_for: 'otp' }),
          };
        }
        if (pollCount === 2) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ status: 'otp_ready', status_text: '等待 PIN', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ status: 'completed', status_text: '充值完成', remote_stage: 'completed' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_123/otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ status: 'otp_ready', status_text: '等待 PIN', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_123/pin')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ status: 'active', status_text: '处理中', remote_stage: 'payment_processing' }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  const run = executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_123',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/api/gp/tasks/task_old/otp',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_billing_123',
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  const pending = events.states.find((state) => state.plusManualConfirmationMethod === 'gopay-otp');
  assert.ok(pending);
  currentState = {
    plusManualConfirmationPending: false,
    plusManualConfirmationRequestId: pending.plusManualConfirmationRequestId,
    gopayHelperResolvedOtp: '123456',
  };

  await run;

  assert.equal(fetchCalls[0].url, 'https://gpc.qlhazycoder.top/api/gp/tasks/task_123');
  assert.equal(fetchCalls[0].options.headers['X-API-Key'], 'gpc_billing_123');
  const otpCall = fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_123/otp'));
  const pinCall = fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_123/pin'));
  assert.deepEqual(JSON.parse(otpCall.options.body), { otp: '123456' });
  assert.equal(otpCall.options.headers['X-API-Key'], 'gpc_billing_123');
  assert.deepEqual(JSON.parse(pinCall.options.body), { pin: '654321' });
  assert.equal(pinCall.options.headers['X-API-Key'], 'gpc_billing_123');
  assert.ok(fetchCalls.findIndex((call) => call.url.endsWith('/api/gp/tasks/task_123/pin')) < fetchCalls.length - 1);
  assert.equal(events.states.some((state) => state.gopayHelperTaskId === 'task_123' && state.gopayHelperTaskStatus === 'completed'), true);
  assert.equal(events.logs.some((entry) => entry.message === '步骤 7：GPC 任务状态：等待 WhatsApp OTP'), true);
  assert.equal(events.logs.some((entry) => /whatsapp_otp_wait/.test(entry.message)), false);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
  assert.equal(events.completed[0].payload.plusCheckoutSource, 'gpc-helper');
  assert.ok(events.sleeps.includes(3000));
});


test('GPC billing auto mode only polls until completed without OTP or PIN submission', async () => {
  const fetchCalls = [];
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_auto') {
        pollCount += 1;
        if (pollCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_auto', phone_mode: 'auto', status: 'queued', status_text: '排队中', api_waiting_for: '' }),
          };
        }
        if (pollCount === 2) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_auto', phone_mode: 'auto', status: 'active', status_text: '处理中', remote_stage: 'auto_otp_wait', api_waiting_for: 'auto_otp' }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_auto', phone_mode: 'auto', status: 'completed', status_text: '充值完成', remote_stage: 'completed', api_waiting_for: '' }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_auto',
    gopayHelperPhoneMode: 'auto',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperApiKey: 'gpc_auto',
  });

  assert.equal(fetchCalls.length, 3);
  assert.equal(fetchCalls.some((call) => /\/api\/gp\/tasks\/task_auto\/(otp|pin)$/.test(call.url)), false);
  assert.equal(events.logs.some((entry) => entry.message === '步骤 7：GPC 任务状态：等待自动 OTP'), true);
  assert.equal(events.logs.some((entry) => /auto_otp_wait/.test(entry.message)), false);
  assert.equal(events.states.some((state) => state.plusManualConfirmationMethod === 'gopay-otp'), false);
  assert.equal(events.states.some((state) => state.gopayHelperTaskId === 'task_auto' && state.gopayHelperTaskStatus === 'completed'), true);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
  assert.equal(events.completed[0].payload.plusCheckoutSource, 'gpc-helper');
});

test('GPC billing logs checkout order stage in Chinese', async () => {
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url) => {
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_stage') {
        pollCount += 1;
        if (pollCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({
              task_id: 'task_stage',
              phone_mode: 'auto',
              status: 'active',
              status_text: '处理中',
              remote_stage: 'checkout_order_start',
              api_waiting_for: '',
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({
            task_id: 'task_stage',
            phone_mode: 'auto',
            status: 'completed',
            status_text: '充值完成',
            remote_stage: 'completed',
            api_waiting_for: '',
          }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_stage',
    gopayHelperPhoneMode: 'auto',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperApiKey: 'gpc_auto',
  });

  assert.equal(events.logs.some((entry) => entry.message === '步骤 7：GPC 任务状态：创建订单'), true);
  assert.equal(events.logs.some((entry) => /checkout_order_start/.test(entry.message)), false);
});

test('GPC billing fails repeated checkout stage as stale so auto-run can recreate task', async () => {
  const originalNow = Date.now;
  let now = 1710000000000;
  const fetchCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    sleepWithStop: async (ms) => {
      events.sleeps.push(ms);
      now += ms;
    },
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_stale') {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({
            task_id: 'task_stale',
            phone_mode: 'auto',
            status: 'active',
            status_text: '处理中',
            remote_stage: 'checkout_order_start',
            api_waiting_for: '',
          }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_stale/stop')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({
            task_id: 'task_stale',
            status: 'discarded',
            status_text: '已停止',
          }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  Date.now = () => now;
  try {
    await assert.rejects(
      () => executor.executePlusCheckoutBilling({
        plusPaymentMethod: 'gpc-helper',
        plusCheckoutSource: 'gpc-helper',
        gopayHelperTaskId: 'task_stale',
        gopayHelperPhoneMode: 'auto',
        gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
        gopayHelperApiKey: 'gpc_auto',
        gopayHelperTaskStaleSeconds: 15,
      }),
      /GPC_TASK_ENDED::GPC 任务状态超过 15 秒无进展（创建订单），请重新创建任务。/
    );
  } finally {
    Date.now = originalNow;
  }

  assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_stale/stop')), true);
  assert.equal(events.logs.some((entry) => entry.message === '步骤 7：GPC 任务状态：创建订单'), true);
});

test('GPC billing fails unchanged visible created status even when hidden ids change', async () => {
  const originalNow = Date.now;
  let now = 1710000000000;
  let queryCount = 0;
  const fetchCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    sleepWithStop: async (ms) => {
      events.sleeps.push(ms);
      now += ms;
    },
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_created') {
        queryCount += 1;
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({
            task_id: 'task_created',
            phone_mode: 'auto',
            status: 'created',
            status_text: '已创建',
            remote_stage: '',
            api_waiting_for: '',
            reference_id: `ref_${queryCount}`,
            flow_id: `flow_${queryCount}`,
          }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_created/stop')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({
            task_id: 'task_created',
            status: 'discarded',
            status_text: '已停止',
          }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  Date.now = () => now;
  try {
    await assert.rejects(
      () => executor.executePlusCheckoutBilling({
        plusPaymentMethod: 'gpc-helper',
        plusCheckoutSource: 'gpc-helper',
        gopayHelperTaskId: 'task_created',
        gopayHelperPhoneMode: 'auto',
        gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
        gopayHelperApiKey: 'gpc_auto',
        gopayHelperTaskStaleSeconds: 15,
      }),
      /GPC_TASK_ENDED::GPC 任务状态超过 15 秒无进展（已创建），请重新创建任务。/
    );
  } finally {
    Date.now = originalNow;
  }

  assert.equal(queryCount > 1, true);
  assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_created/stop')), true);
  assert.equal(events.logs.some((entry) => entry.message === '步骤 7：GPC 任务状态：已创建'), true);
});

test('GPC billing reads SMS OTP from local helper for sms_otp_wait', async () => {
  const fetchCalls = [];
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url.startsWith('http://127.0.0.1:18767/latest-otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, otp: '654321', message_id: 'sms-1' }),
        };
      }
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_sms') {
        pollCount += 1;
        if (pollCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_sms', status: 'active', remote_stage: 'sms_otp_wait', api_waiting_for: 'otp' }),
          };
        }
        if (pollCount === 2) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_sms', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_sms', status: 'completed', remote_stage: 'completed' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_sms/otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_sms', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_sms/pin')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_sms', status: 'active', remote_stage: 'payment_processing' }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_sms',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_sms',
    gopayHelperOtpChannel: 'sms',
    gopayHelperLocalSmsHelperEnabled: true,
    gopayHelperLocalSmsHelperUrl: 'http://127.0.0.1:18767',
    gopayHelperCountryCode: '+86',
    gopayHelperPhoneNumber: '13800138000',
    gopayHelperOrderCreatedAt: 1710000000000,
  });

  assert.equal(events.states.some((state) => state.plusManualConfirmationMethod === 'gopay-otp'), false);
  assert.equal(events.states.some((state) => state.gopayHelperResolvedOtp === '654321'), true);
  const helperUrl = new URL(fetchCalls[1].url);
  assert.equal(helperUrl.origin + helperUrl.pathname, 'http://127.0.0.1:18767/latest-otp');
  assert.equal(helperUrl.searchParams.get('task_id'), 'task_sms');
  assert.equal(helperUrl.searchParams.get('reference_id'), 'task_sms');
  assert.equal(helperUrl.searchParams.get('phone'), '+8613800138000');
  assert.equal(helperUrl.searchParams.get('consume'), '1');
  assert.equal(helperUrl.searchParams.get('after_ms'), '1710000000000');
  assert.deepEqual(JSON.parse(fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_sms/otp')).options.body), {
    otp: '654321',
  });
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('GPC billing can read WhatsApp OTP from local helper when enabled', async () => {
  const fetchCalls = [];
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url.startsWith('http://127.0.0.1:18767/latest-otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, otp: '765432', message_id: 'wa-1' }),
        };
      }
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_wa') {
        pollCount += 1;
        if (pollCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_wa', status: 'active', remote_stage: 'whatsapp_otp_wait', api_waiting_for: 'otp' }),
          };
        }
        if (pollCount === 2) {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({ task_id: 'task_wa', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_wa', status: 'completed', remote_stage: 'completed' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_wa/otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_wa', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_wa/pin')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_wa', status: 'active', remote_stage: 'payment_processing' }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_wa',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_wa',
    gopayHelperOtpChannel: 'whatsapp',
    gopayHelperLocalSmsHelperEnabled: true,
    gopayHelperLocalSmsHelperUrl: 'http://127.0.0.1:18767',
    gopayHelperCountryCode: '+86',
    gopayHelperPhoneNumber: '18984829950',
  });

  assert.equal(events.states.some((state) => state.plusManualConfirmationMethod === 'gopay-otp'), false);
  assert.equal(events.states.some((state) => state.gopayHelperResolvedOtp === '765432'), true);
  const helperUrl = new URL(fetchCalls.find((call) => call.url.startsWith('http://127.0.0.1:18767/latest-otp')).url);
  assert.equal(helperUrl.searchParams.get('phone'), '+8618984829950');
  assert.equal(helperUrl.searchParams.get('consume'), '1');
  assert.deepEqual(JSON.parse(fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_wa/otp')).options.body), {
    otp: '765432',
  });
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});


test('GPC billing helper mode does not open OTP dialog when helper has no code and task times out', async () => {
  const fetchCalls = [];
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url.startsWith('http://127.0.0.1:18767/latest-otp')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, status: 'waiting', otp: '', message: '未查询到验证码' }),
        };
      }
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_timeout') {
        const queryCount = fetchCalls.filter((call) => call.url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_timeout').length;
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse(queryCount === 1
            ? {
              task_id: 'task_timeout',
              status: 'active',
              remote_stage: 'whatsapp_otp_wait',
              api_waiting_for: 'otp',
            }
            : {
              task_id: 'task_timeout',
              status: 'failed',
              status_text: '充值失败',
              remote_stage: 'api_otp_timeout',
              error_message: '等待 OTP 超过 60 秒，任务已超时',
            }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await assert.rejects(
    () => executor.executePlusCheckoutBilling({
      plusPaymentMethod: 'gpc-helper',
      plusCheckoutSource: 'gpc-helper',
      gopayHelperTaskId: 'task_timeout',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      gopayHelperPin: '654321',
      gopayHelperApiKey: 'gpc_timeout',
      gopayHelperOtpChannel: 'whatsapp',
      gopayHelperLocalSmsHelperEnabled: true,
      gopayHelperLocalSmsHelperUrl: 'http://127.0.0.1:18767',
      gopayHelperPhoneNumber: '+8613800138000',
    }),
    /GPC_TASK_ENDED::等待 OTP 超过 60 秒，任务已超时/
  );

  assert.equal(events.states.some((state) => state.plusManualConfirmationMethod === 'gopay-otp'), false);
  assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_timeout/otp')), false);
  assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_timeout/stop')), false);
  assert.ok(events.sleeps.includes(3000));
});

test('GPC billing helper mode requests newer OTP after invalid OTP error', async () => {
  const fetchCalls = [];
  let taskPollCount = 0;
  let helperCallCount = 0;
  let otpPostCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url.startsWith('http://127.0.0.1:18767/latest-otp')) {
        helperCallCount += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, otp: helperCallCount === 1 ? '111111' : '222222', message_id: `sms-${helperCallCount}` }),
        };
      }
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_retry') {
        taskPollCount += 1;
        if (taskPollCount === 1) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'active', remote_stage: 'sms_otp_wait', api_waiting_for: 'otp' }) };
        }
        if (taskPollCount === 2) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'active', remote_stage: 'sms_otp_wait', api_waiting_for: 'otp', last_input_error: 'OTP 校验失败，请重新输入正确的 OTP', otp_invalid_count: 1 }) };
        }
        if (taskPollCount === 3) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }) };
        }
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'completed', remote_stage: 'completed' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_retry/otp')) {
        otpPostCount += 1;
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'active', remote_stage: 'otp_submitted_local' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_retry/pin')) {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_retry', status: 'active', remote_stage: 'payment_processing' }) };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_retry',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_retry',
    gopayHelperOtpChannel: 'sms',
    gopayHelperLocalSmsHelperEnabled: true,
    gopayHelperLocalSmsHelperUrl: 'http://127.0.0.1:18767',
    gopayHelperPhoneNumber: '+8613800138000',
    gopayHelperOrderCreatedAt: 1710000000000,
  });

  const otpBodies = fetchCalls
    .filter((call) => call.url.endsWith('/api/gp/tasks/task_retry/otp'))
    .map((call) => JSON.parse(call.options.body));
  assert.deepEqual(otpBodies, [{ otp: '111111' }, { otp: '222222' }]);
  assert.equal(otpPostCount, 2);
  const helperUrls = fetchCalls.filter((call) => call.url.startsWith('http://127.0.0.1:18767/latest-otp')).map((call) => new URL(call.url));
  assert.equal(helperUrls.length, 2);
  assert.equal(helperUrls[0].searchParams.get('phone'), '+8613800138000');
  assert.equal(helperUrls[0].searchParams.get('consume'), '1');
  assert.equal(helperUrls[0].searchParams.get('after_ms'), '1710000000000');
  assert.equal(helperUrls[1].searchParams.get('phone'), '+8613800138000');
  assert.equal(helperUrls[1].searchParams.get('consume'), '1');
  assert.ok(Number(helperUrls[1].searchParams.get('after_ms')) > 1710000000000);
  assert.equal(events.logs.some((entry) => /OTP 校验失败/.test(entry.message)), true);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('GPC billing manual OTP wrong input opens next dialog only after previous one closes', async () => {
  const fetchCalls = [];
  let currentState = {
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: '',
  };
  let pendingDialogCount = 0;
  let pollCount = 0;
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    getState: async () => currentState,
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_manual_retry') {
        pollCount += 1;
        if (pollCount === 1) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'active', remote_stage: 'whatsapp_otp_wait', api_waiting_for: 'otp' }) };
        }
        if (pollCount === 2) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'active', remote_stage: 'whatsapp_otp_wait', api_waiting_for: 'otp', last_input_error: 'OTP 校验失败，请重新输入正确的 OTP', otp_invalid_count: 1 }) };
        }
        if (pollCount === 3) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'otp_ready', remote_stage: 'otp_ready', api_waiting_for: 'pin' }) };
        }
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'completed', remote_stage: 'completed' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_manual_retry/otp')) {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'active', remote_stage: 'otp_submitted_local' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_manual_retry/pin')) {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_manual_retry', status: 'active', remote_stage: 'payment_processing' }) };
      }
      throw new Error(`unexpected url: ${url}`);
    },
    onSetState: async (updates) => {
      if (updates?.plusManualConfirmationMethod !== 'gopay-otp') {
        return;
      }
      pendingDialogCount += 1;
      const resolvedOtp = pendingDialogCount === 1 ? '111111' : '222222';
      setTimeout(() => {
        currentState = {
          plusManualConfirmationPending: false,
          plusManualConfirmationRequestId: updates.plusManualConfirmationRequestId,
          gopayHelperResolvedOtp: resolvedOtp,
        };
      }, 0);
    },
  });

  const run = executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_manual_retry',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_manual_retry',
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  const firstPending = events.states.find((state) => state.plusManualConfirmationMethod === 'gopay-otp');
  assert.ok(firstPending);
  assert.equal(events.states.filter((state) => state.plusManualConfirmationMethod === 'gopay-otp').length, 1);
  await new Promise((resolve) => setTimeout(resolve, 650));
  const pendingDialogs = events.states.filter((state) => state.plusManualConfirmationMethod === 'gopay-otp');
  assert.equal(pendingDialogs.length, 2);
  assert.notEqual(pendingDialogs[1].plusManualConfirmationRequestId, firstPending.plusManualConfirmationRequestId);
  assert.match(pendingDialogs[1].plusManualConfirmationMessage, /OTP 校验失败/);
  await run;
  const otpBodies = fetchCalls
    .filter((call) => call.url.endsWith('/api/gp/tasks/task_manual_retry/otp'))
    .map((call) => JSON.parse(call.options.body));
  assert.deepEqual(otpBodies, [{ otp: '111111' }, { otp: '222222' }]);
  assert.equal(events.completed[0].step, 'plus-checkout-billing');
});

test('GPC billing manual OTP cancel stops task and ends current round', async () => {
  const fetchCalls = [];
  let currentState = {
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: '',
  };
  const { events, executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    getState: async () => currentState,
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_cancel') {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_cancel', status: 'active', remote_stage: 'whatsapp_otp_wait', api_waiting_for: 'otp' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_cancel/stop')) {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_cancel', status: 'discarded', status_text: '已停止' }) };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  const run = executor.executePlusCheckoutBilling({
    plusPaymentMethod: 'gpc-helper',
    plusCheckoutSource: 'gpc-helper',
    gopayHelperTaskId: 'task_cancel',
    gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
    gopayHelperPin: '654321',
    gopayHelperApiKey: 'gpc_cancel',
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  const pending = events.states.find((state) => state.plusManualConfirmationMethod === 'gopay-otp');
  assert.ok(pending);
  currentState = {
    plusManualConfirmationPending: false,
    plusManualConfirmationRequestId: pending.plusManualConfirmationRequestId,
    gopayHelperResolvedOtp: '',
  };

  await assert.rejects(run, /GPC_TASK_ENDED::OTP 输入已取消，已结束当前 GPC 任务。/);
  const stopCall = fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_cancel/stop'));
  assert.ok(stopCall);
  assert.equal(stopCall.options.headers['X-API-Key'], 'gpc_cancel');
  assert.equal(events.completed.length, 0);
});

test('GPC billing PIN failure ends task without retrying PIN', async () => {
  const fetchCalls = [];
  let pollCount = 0;
  const { executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_pin_failed') {
        pollCount += 1;
        if (pollCount === 1) {
          return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_pin_failed', status: 'otp_ready', status_text: '等待 PIN', remote_stage: 'otp_ready', api_waiting_for: 'pin' }) };
        }
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_pin_failed', status: 'failed', status_text: '充值失败', remote_stage: 'gopay_validate_pin', failure_stage: 'gopay_validate_pin', failure_detail: 'PIN 校验失败', error_message: 'GoPay PIN validation failed' }) };
      }
      if (url.endsWith('/api/gp/tasks/task_pin_failed/pin')) {
        return { ok: true, status: 200, json: async () => createGpcTaskResponse({ task_id: 'task_pin_failed', status: 'active', remote_stage: 'pin_submitted_local' }) };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await assert.rejects(
    () => executor.executePlusCheckoutBilling({
      plusPaymentMethod: 'gpc-helper',
      plusCheckoutSource: 'gpc-helper',
      gopayHelperTaskId: 'task_pin_failed',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      gopayHelperPin: '654321',
      gopayHelperApiKey: 'gpc_pin_failed',
    }),
    /GPC_TASK_ENDED::GoPay PIN validation failed（gopay_validate_pin）/
  );

  assert.equal(fetchCalls.filter((call) => call.url.endsWith('/api/gp/tasks/task_pin_failed/pin')).length, 1);
  assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_pin_failed/stop')), false);
});

for (const terminalStatus of ['failed', 'expired', 'discarded']) {
  test(`GPC billing throws readable error for terminal ${terminalStatus} task`, async () => {
    const fetchCalls = [];
    const { executor } = createExecutorHarness({
      frames: [],
      stateByFrame: {},
      fetchImpl: async (url, options = {}) => {
        fetchCalls.push({ url, options });
        if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_bad') {
          return {
            ok: true,
            status: 200,
            json: async () => createGpcTaskResponse({
              task_id: 'task_bad',
              status: terminalStatus,
              status_text: terminalStatus,
              error_message: '用户可读失败原因',
            }),
          };
        }
        throw new Error(`unexpected url: ${url}`);
      },
    });

    await assert.rejects(
      () => executor.executePlusCheckoutBilling({
        plusPaymentMethod: 'gpc-helper',
        plusCheckoutSource: 'gpc-helper',
        gopayHelperTaskId: 'task_bad',
        gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
        gopayHelperPin: '654321',
        gopayHelperApiKey: 'gpc_bad',
      }),
      /GPC_TASK_ENDED::用户可读失败原因/
    );

    assert.equal(fetchCalls.some((call) => call.url.endsWith('/api/gp/tasks/task_bad/stop')), false);
  });
}

test('GPC billing stops task best-effort when flow is interrupted before terminal state', async () => {
  const fetchCalls = [];
  const { executor } = createExecutorHarness({
    frames: [],
    stateByFrame: {},
    fetchImpl: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === 'https://gpc.qlhazycoder.top/api/gp/tasks/task_stop') {
        return {
          ok: false,
          status: 500,
          json: async () => ({ code: 500, message: 'server_error', data: { detail: '临时失败' } }),
        };
      }
      if (url.endsWith('/api/gp/tasks/task_stop/stop')) {
        return {
          ok: true,
          status: 200,
          json: async () => createGpcTaskResponse({ task_id: 'task_stop', status: 'discarded', status_text: '已停止' }),
        };
      }
      throw new Error(`unexpected url: ${url}`);
    },
  });

  await assert.rejects(
    () => executor.executePlusCheckoutBilling({
      plusPaymentMethod: 'gpc-helper',
      plusCheckoutSource: 'gpc-helper',
      gopayHelperTaskId: 'task_stop',
      gopayHelperApiUrl: 'https://gpc.qlhazycoder.top/',
      gopayHelperPin: '654321',
      gopayHelperApiKey: 'gpc_stop',
    }),
    /临时失败/
  );

  const stopCall = fetchCalls.find((call) => call.url.endsWith('/api/gp/tasks/task_stop/stop'));
  assert.ok(stopCall);
  assert.deepEqual(JSON.parse(stopCall.options.body), {});
  assert.equal(stopCall.options.headers['X-API-Key'], 'gpc_stop');
});
