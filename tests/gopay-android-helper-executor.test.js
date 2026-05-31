const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadModule() {
  const source = fs.readFileSync('background/steps/gopay-approve.js', 'utf8');
  const globalScope = {};
  return new Function('self', `${source}; return self.MultiPageBackgroundGoPayApprove;`)(globalScope);
}

test('GoPay executor calls Android helper when web page stalls and setting is enabled', async () => {
  const api = loadModule();
  const originalNow = Date.now;
  let now = 1000;
  Date.now = () => {
    now += 70000;
    return now;
  };
  const logs = [];
  const fetchCalls = [];
  const stateSequence = [
    { hasContinueButton: true, textPreview: 'Hubungkan', url: 'https://gopayapi.com/linking' },
    { hasContinueButton: true, textPreview: 'Hubungkan', url: 'https://gopayapi.com/linking' },
    { hasContinueButton: true, textPreview: 'Hubungkan', url: 'https://gopayapi.com/linking' },
    { hasContinueButton: true, textPreview: 'Hubungkan', url: 'https://gopayapi.com/linking' },
    { completed: true, textPreview: 'Berhasil', url: 'https://gopayapi.com/linking' },
  ];

  const executor = api.createGoPayApproveExecutor({
    addLog: async (message, level = 'info') => logs.push({ message, level }),
    chrome: {
      tabs: {
        get: async () => ({ id: 7, url: 'https://gopayapi.com/linking' }),
      },
      webNavigation: {
        getAllFrames: async () => [{ frameId: 0, url: 'https://gopayapi.com/linking' }],
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    getTabId: async () => 7,
    isTabAlive: async () => true,
    queryTabsInAutomationWindow: async () => [{ id: 7, url: 'https://gopayapi.com/linking', active: true }],
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'GOPAY_GET_STATE') {
        return stateSequence.shift() || { completed: true, textPreview: 'Berhasil' };
      }
      if (message.type === 'GOPAY_CLICK_CONTINUE') {
        return { clicked: true, clickTarget: 'Hubungkan' };
      }
      return {};
    },
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
    fetch: async (url, options) => {
      fetchCalls.push({ url, body: JSON.parse(options.body) });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          status: 'approved',
          deviceId: 'device-1',
          packageName: 'com.gojek.gopay',
          activity: '.MainActivity',
        }),
      };
    },
    throwIfStopped: () => {},
  });

  try {
    await executor.executeGoPayApprove({
      androidAppAutomationEnabled: true,
      androidAppHelperBaseUrl: 'http://127.0.0.1:18768/gopay/approve',
      gopayPhone: '81234567890',
      gopayPin: '123456',
    });
  } finally {
    Date.now = originalNow;
  }

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, 'http://127.0.0.1:18768/gopay/approve');
  assert.equal(fetchCalls[0].body.pin, '123456');
  assert.ok(logs.some((entry) => /Android GoPay App/.test(entry.message)));
});

test('GoPay executor does not call Android helper when setting is disabled', async () => {
  const api = loadModule();
  const originalNow = Date.now;
  let now = 1000;
  Date.now = () => {
    now += 70000;
    return now;
  };
  let fetchCalled = false;
  const executor = api.createGoPayApproveExecutor({
    addLog: async () => {},
    chrome: {
      tabs: {
        get: async () => ({ id: 7, url: 'https://gopayapi.com/linking' }),
      },
      webNavigation: {
        getAllFrames: async () => [{ frameId: 0, url: 'https://gopayapi.com/linking' }],
      },
    },
    completeNodeFromBackground: async () => {},
    ensureContentScriptReadyOnTabUntilStopped: async () => {},
    getTabId: async () => 7,
    isTabAlive: async () => true,
    queryTabsInAutomationWindow: async () => [{ id: 7, url: 'https://gopayapi.com/linking', active: true }],
    registerTab: async () => {},
    sendTabMessageUntilStopped: async (_tabId, _source, message) => {
      if (message.type === 'GOPAY_GET_STATE') {
        return { hasContinueButton: true, textPreview: 'Hubungkan', url: 'https://gopayapi.com/linking' };
      }
      if (message.type === 'GOPAY_CLICK_CONTINUE') {
        return { clicked: true, clickTarget: 'Hubungkan' };
      }
      return {};
    },
    setState: async () => {},
    sleepWithStop: async () => {},
    waitForTabCompleteUntilStopped: async () => {},
    fetch: async () => {
      fetchCalled = true;
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    },
    throwIfStopped: () => {},
  });

  try {
    await assert.rejects(
      () => executor.executeGoPayApprove({
        androidAppAutomationEnabled: false,
        gopayPhone: '81234567890',
        gopayPin: '123456',
      }),
      /GoPay linking/
    );
  } finally {
    Date.now = originalNow;
  }
  assert.equal(fetchCalled, false);
});
