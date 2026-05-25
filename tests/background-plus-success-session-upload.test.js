const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background/plus-success-session-upload.js', 'utf8');
const globalScope = {};
const api = new Function('self', `${source}; return self.MultiPageBackgroundPlusSuccessSessionUpload;`)(globalScope);

const SUCCESS_URL = 'https://chatgpt.com/backend-api/payments/success?session_id=cs_hosted';

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createBarrier() {
  let resolve = () => {};
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function createHarness(initialState = {}, options = {}) {
  const events = [];
  let state = cloneValue(initialState);
  const manager = api.createPlusSuccessSessionUploadManager({
    addLog: async (message, level = 'info', extra = {}) => {
      events.push({ type: 'log', message, level, extra });
    },
    broadcastDataUpdate: (payload) => {
      events.push({ type: 'broadcast', payload });
    },
    completeNodeFromBackground: async (nodeId, payload) => {
      events.push({ type: 'complete', nodeId, payload });
      if (options.completeBarrier) {
        await options.completeBarrier.promise;
      }
      if (options.completeError) {
        throw options.completeError;
      }
      if (typeof options.onComplete === 'function') {
        await options.onComplete(nodeId, payload, {
          getState: () => cloneValue(state),
          setState(nextState) {
            state = cloneValue(nextState);
          },
        });
      }
      return undefined;
    },
    getState: async () => cloneValue(state),
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
      state = { ...state, ...cloneValue(payload) };
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
      if (typeof options.onSleep === 'function') {
        await options.onSleep({
          events,
          getState: () => cloneValue(state),
          setState(nextState) {
            state = cloneValue(nextState);
          },
        });
      }
    },
  });

  return {
    events,
    manager,
    getState: () => cloneValue(state),
  };
}

test('success manager ignores non-hosted payment methods', async () => {
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal',
    plusCheckoutTabId: 55,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  });

  const result = await manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  assert.equal(result, null);
  assert.deepStrictEqual(events, []);
});

test('success manager ignores incomplete updates and non-success urls', async () => {
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  });

  const loadingResult = await manager.handleTabUpdated(55, {
    status: 'loading',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });
  const nonSuccessResult = await manager.handleTabUpdated(55, {
    status: 'complete',
    url: 'https://chatgpt.com/backend-api/payments/cancel',
  }, {
    url: 'https://chatgpt.com/backend-api/payments/cancel',
  });

  assert.equal(loadingResult, null);
  assert.equal(nonSuccessResult, null);
  assert.deepStrictEqual(events, []);
});

test('success manager ignores mismatched checkout tabs and runs without active hosted waiters', async () => {
  const mismatched = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 77,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  });
  const missingWaiter = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'oauth-login',
    nodeStatuses: {
      'oauth-login': 'running',
      'plus-checkout-create': 'completed',
      'paypal-hosted-review': 'completed',
    },
  });

  const mismatchedResult = await mismatched.manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });
  const missingWaiterResult = await missingWaiter.manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  assert.equal(mismatchedResult, null);
  assert.equal(missingWaiterResult, null);
  assert.deepStrictEqual(mismatched.events, []);
  assert.deepStrictEqual(missingWaiter.events, []);
});

test('success manager completes the current plus-checkout-create waiter immediately', async () => {
  const { events, manager, getState } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  });

  const result = await manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  assert.deepStrictEqual(result, {
    completed: true,
    nodeId: 'plus-checkout-create',
    plusReturnUrl: SUCCESS_URL,
    oauthDelaySeconds: 0,
  });
  assert.deepStrictEqual(events.find((event) => event.type === 'set-state'), {
    type: 'set-state',
    payload: {
      plusCheckoutTabId: 55,
      plusCheckoutUrl: SUCCESS_URL,
      plusReturnUrl: SUCCESS_URL,
    },
  });
  assert.deepStrictEqual(events.find((event) => event.type === 'broadcast'), {
    type: 'broadcast',
    payload: {
      plusCheckoutTabId: 55,
      plusCheckoutUrl: SUCCESS_URL,
      plusReturnUrl: SUCCESS_URL,
    },
  });
  assert.deepStrictEqual(events.find((event) => event.type === 'complete'), {
    type: 'complete',
    nodeId: 'plus-checkout-create',
    payload: {
      plusCheckoutUrl: SUCCESS_URL,
      plusReturnUrl: SUCCESS_URL,
      plusHostedCheckoutCompleted: true,
    },
  });
  assert.equal(events.some((event) => event.type === 'sleep'), false);
  assert.equal(getState().plusCheckoutUrl, SUCCESS_URL);
  assert.equal(getState().plusReturnUrl, SUCCESS_URL);
});

test('success manager delays hosted review completion by the configured oauth wait', async () => {
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'paypal-hosted-review',
    plusHostedCheckoutOauthDelaySeconds: 3,
    nodeStatuses: {
      'paypal-hosted-review': 'running',
    },
  });

  await manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  const setStateIndex = events.findIndex((event) => event.type === 'set-state');
  const sleepIndex = events.findIndex((event) => event.type === 'sleep');
  const completeIndex = events.findIndex((event) => event.type === 'complete');
  assert.equal(setStateIndex > -1, true);
  assert.equal(sleepIndex > setStateIndex, true);
  assert.equal(completeIndex > sleepIndex, true);
  assert.deepStrictEqual(events.find((event) => event.type === 'sleep'), {
    type: 'sleep',
    ms: 3000,
  });
  assert.deepStrictEqual(events.find((event) => event.type === 'complete'), {
    type: 'complete',
    nodeId: 'paypal-hosted-review',
    payload: {
      plusCheckoutUrl: SUCCESS_URL,
      plusReturnUrl: SUCCESS_URL,
      plusHostedCheckoutCompleted: true,
      plusHostedCheckoutOauthDelaySeconds: 3,
    },
  });
});

test('success manager falls back to the latest active hosted waiter when currentNodeId is not usable', async () => {
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'oauth-login',
    nodeStatuses: {
      'oauth-login': 'running',
      'plus-checkout-create': 'running',
      'paypal-hosted-card': 'pending',
      'paypal-hosted-email': 'completed',
    },
  });

  const result = await manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  assert.equal(result?.nodeId, 'paypal-hosted-card');
  assert.equal(events.find((event) => event.type === 'complete')?.nodeId, 'paypal-hosted-card');
});

test('success manager processes the same tab only once while a completion is in flight', async () => {
  const barrier = createBarrier();
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  }, {
    completeBarrier: barrier,
  });

  const firstTask = manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });
  const secondTask = manager.handleTabUpdated(55, {
    status: 'complete',
    url: SUCCESS_URL,
  }, {
    url: SUCCESS_URL,
  });

  while (!events.some((event) => event.type === 'complete')) {
    await Promise.resolve();
  }

  assert.equal(events.filter((event) => event.type === 'complete').length, 1);
  assert.equal(events.filter((event) => event.type === 'set-state').length, 1);

  barrier.resolve();
  const [firstResult, secondResult] = await Promise.all([firstTask, secondTask]);
  assert.equal(firstResult?.completed, true);
  assert.equal(secondResult, null);
});

test('success manager logs and rethrows completion errors without forcing failed state', async () => {
  const completionError = new Error('completion boom');
  const { events, manager } = createHarness({
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutTabId: 55,
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
  }, {
    completeError: completionError,
  });

  await assert.rejects(
    () => manager.handleTabUpdated(55, {
      status: 'complete',
      url: SUCCESS_URL,
    }, {
      url: SUCCESS_URL,
    }),
    /completion boom/
  );

  assert.equal(
    events.some((event) => event.type === 'log' && event.level === 'error' && /自动续跑失败/.test(event.message)),
    true
  );
  assert.equal(events.some((event) => event.type === 'failed'), false);
});
