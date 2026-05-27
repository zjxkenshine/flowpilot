const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background/steps/plus-return-confirm.js', 'utf8');
const globalScope = {};
const api = new Function('self', `${source}; return self.MultiPageBackgroundPlusReturnConfirm;`)(globalScope);

test('Plus return confirm waits a fixed 20 seconds after return URL is detected', async () => {
  const events = [];
  const executor = api.createPlusReturnConfirmExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    getTabId: async (source) => (source === 'paypal-flow' ? 77 : null),
    isTabAlive: async (source) => source === 'paypal-flow',
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabUrlMatchUntilStopped: async (tabId, matcher) => {
      const url = 'https://chatgpt.com/backend-api/payments/success';
      assert.equal(tabId, 77);
      assert.equal(matcher(url), true);
      events.push({ type: 'url-match', tabId, url });
      return { id: tabId, url };
    },
  });

  await executor.executePlusReturnConfirm({});

  assert.deepEqual(
    events.find((event) => event.type === 'sleep'),
    { type: 'sleep', ms: 20000 }
  );
  assert.equal(
    events.some((event) => event.type === 'log' && /固定等待 20 秒/.test(event.message)),
    true
  );
  assert.deepEqual(
    events.find((event) => event.type === 'complete'),
    {
      type: 'complete',
      step: 'plus-checkout-return',
      payload: { plusReturnUrl: 'https://chatgpt.com/backend-api/payments/success' },
    }
  );
});

test('Plus return confirm releases residual classic checkout conversion proxy', async () => {
  const events = [];
  const releaseEvents = [];
  const executor = api.createPlusReturnConfirmExecutor({
    addLog: async (message, level = 'info') => {
      events.push({ type: 'log', message, level });
    },
    checkoutConversionProxyManager: {
      releaseSessionForNode: async (nodeKey, state) => {
        releaseEvents.push({ nodeKey, state });
        return { released: true };
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      events.push({ type: 'complete', step, payload });
    },
    getState: async () => ({ plusCheckoutConversionProxySession: { active: true } }),
    getTabId: async (source) => (source === 'paypal-flow' ? 77 : null),
    isTabAlive: async (source) => source === 'paypal-flow',
    setState: async (payload) => {
      events.push({ type: 'set-state', payload });
    },
    sleepWithStop: async (ms) => {
      events.push({ type: 'sleep', ms });
    },
    waitForTabUrlMatchUntilStopped: async (tabId, matcher) => {
      const url = 'https://chatgpt.com/backend-api/payments/success';
      assert.equal(tabId, 77);
      assert.equal(matcher(url), true);
      return { id: tabId, url };
    },
  });

  await executor.executePlusReturnConfirm({});

  assert.deepEqual(releaseEvents.map((item) => item.nodeKey), ['paypal-approve']);
  assert.equal(events.some((event) => event.type === 'log' && /residual checkout conversion proxy/i.test(event.message)), true);
  assert.equal(events.findIndex((event) => event.type === 'sleep') < events.findIndex((event) => event.type === 'complete'), true);
});
