const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadStep1Module() {
  const source = fs.readFileSync('background/steps/open-chatgpt.js', 'utf8');
  const globalScope = {};
  return new Function('self', `${source}; return self.MultiPageBackgroundStep1;`)(globalScope);
}

function createNoopChromeApi() {
  return {
    cookies: {
      getAllCookieStores: async () => [],
      getAll: async () => [],
      remove: async () => null,
    },
  };
}

test('step 1 cookie cleanup queries target domains and runs browsingData sweep', async () => {
  const api = loadStep1Module();
  const events = {
    getAllCalls: [],
    removedCookies: [],
    browsingDataCalls: [],
    openedSteps: [],
    completedNodes: [],
    cacheClears: 0,
  };

  const chromeApi = {
    cookies: {
      getAllCookieStores: async () => [{ id: 'store-a' }],
      getAll: async (query) => {
        events.getAllCalls.push(query);
        if (query?.domain === 'chatgpt.com') {
          return [
            { domain: '.chatgpt.com', path: '/', name: 'session', storeId: 'store-a' },
          ];
        }
        if (query?.domain === 'openai.com') {
          return [
            {
              domain: '.openai.com',
              path: '/',
              name: 'shared',
              storeId: 'store-a',
              partitionKey: { topLevelSite: 'https://chatgpt.com' },
            },
          ];
        }
        if (query?.domain === 'paypal.com') {
          return [
            { domain: '.paypal.com', path: '/', name: 'paypal-session', storeId: 'store-a' },
          ];
        }
        if (query?.domain === 'checkout.stripe.com') {
          return [
            { domain: 'checkout.stripe.com', path: '/', name: 'stripe-session', storeId: 'store-a' },
          ];
        }
        return [];
      },
      remove: async (details) => {
        events.removedCookies.push(details);
        return details;
      },
    },
    browsingData: {
      removeCookies: async (details) => {
        events.browsingDataCalls.push(details);
      },
    },
  };

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: chromeApi,
    clearSignupVerifiedPhoneCache: async () => {
      events.cacheClears += 1;
    },
    openSignupEntryTab: async (step) => {
      events.openedSteps.push(step);
    },
    completeNodeFromBackground: async (nodeId) => {
      events.completedNodes.push(nodeId);
    },
  });

  await executor.executeStep1();

  assert.equal(events.cacheClears, 1);
  assert.ok(events.getAllCalls.length > 0, 'should query cookies at least once');
  assert.ok(events.getAllCalls.every((entry) => typeof entry?.domain === 'string' && entry.domain.length > 0));
  assert.deepStrictEqual(events.removedCookies, [
    {
      url: 'https://chatgpt.com/',
      name: 'session',
      storeId: 'store-a',
    },
    {
      url: 'https://openai.com/',
      name: 'shared',
      storeId: 'store-a',
      partitionKey: { topLevelSite: 'https://chatgpt.com' },
    },
    {
      url: 'https://paypal.com/',
      name: 'paypal-session',
      storeId: 'store-a',
    },
    {
      url: 'https://checkout.stripe.com/',
      name: 'stripe-session',
      storeId: 'store-a',
    },
  ]);
  assert.equal(events.browsingDataCalls.length, 1);
  assert.ok(events.browsingDataCalls[0].origins.includes('https://www.paypal.com'));
  assert.ok(events.browsingDataCalls[0].origins.includes('https://paypal.com'));
  assert.ok(events.browsingDataCalls[0].origins.includes('https://pay.openai.com'));
  assert.ok(events.browsingDataCalls[0].origins.includes('https://checkout.stripe.com'));
  assert.deepStrictEqual(events.openedSteps, [1]);
  assert.deepStrictEqual(events.completedNodes, ['open-chatgpt']);
});

test('step 1 cookie cleanup still runs browsingData sweep when no direct cookie is removed', async () => {
  const api = loadStep1Module();
  const events = {
    removedCookies: 0,
    browsingDataCalls: [],
  };

  const chromeApi = {
    cookies: {
      getAllCookieStores: async () => [{ id: 'store-a' }],
      getAll: async () => [],
      remove: async () => {
        events.removedCookies += 1;
        return null;
      },
    },
    browsingData: {
      removeCookies: async (details) => {
        events.browsingDataCalls.push(details);
      },
    },
  };

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: chromeApi,
    openSignupEntryTab: async () => {},
    completeNodeFromBackground: async () => {},
  });

  await executor.executeStep1();

  assert.equal(events.removedCookies, 0);
  assert.equal(events.browsingDataCalls.length, 1);
  assert.ok(events.browsingDataCalls[0].origins.includes('https://paypal.com'));
});

test('step 1 skips proxy probe when IP proxy is disabled', async () => {
  const api = loadStep1Module();
  const events = {
    openedSteps: [],
    fingerprintCalls: 0,
    probeCalls: 0,
  };

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({ ipProxyEnabled: false }),
    probeIpProxyExit: async () => {
      events.probeCalls += 1;
      return { proxyRouting: { exitIp: '203.0.113.8', reason: 'applied' } };
    },
    switchIpProxy: async () => {},
    ensureBrowserFingerprintForProxyExit: async () => {
      events.fingerprintCalls += 1;
    },
    openSignupEntryTab: async (step) => {
      events.openedSteps.push(step);
    },
    completeNodeFromBackground: async () => {},
  });

  await executor.executeStep1();

  assert.equal(events.probeCalls, 0);
  assert.equal(events.fingerprintCalls, 0);
  assert.deepStrictEqual(events.openedSteps, [1]);
});

test('step 1 reuses existing proxy exit info without probing when exit IP already exists', async () => {
  const api = loadStep1Module();
  const events = [];

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyAppliedExitIp: '203.0.113.8',
      ipProxyAppliedExitRegion: 'JP',
      ipProxyAppliedExitDetecting: false,
      ipProxyAppliedExitSource: 'page_context',
    }),
    probeIpProxyExit: async () => {
      events.push(['probe']);
      return {};
    },
    switchIpProxy: async () => {
      events.push(['switch']);
    },
    ensureBrowserFingerprintForProxyExit: async (routing) => {
      events.push(['fingerprint', routing.exitIp, routing.exitRegion]);
      return { profile: { exitRegion: routing.exitRegion } };
    },
    openSignupEntryTab: async (step) => {
      events.push(['open', step]);
    },
    completeNodeFromBackground: async (nodeId) => {
      events.push(['complete', nodeId]);
    },
  });

  await executor.executeStep1();

  assert.deepStrictEqual(events, [
    ['fingerprint', '203.0.113.8', 'JP'],
    ['open', 1],
    ['complete', 'open-chatgpt'],
  ]);
});

test('step 1 waits for proxy exit settle and continues without probing when exit IP appears', async () => {
  const api = loadStep1Module();
  const events = [];
  let stateCallCount = 0;

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => {
      stateCallCount += 1;
      if (stateCallCount === 1) {
        return {
          ipProxyEnabled: true,
          ipProxyAppliedExitIp: '',
          ipProxyAppliedExitRegion: '',
          ipProxyAppliedExitDetecting: true,
        };
      }
      return {
        ipProxyEnabled: true,
        ipProxyAppliedExitIp: '203.0.113.8',
        ipProxyAppliedExitRegion: 'JP',
        ipProxyAppliedExitDetecting: false,
        ipProxyAppliedExitSource: 'page_context',
      };
    },
    probeIpProxyExit: async () => {
      events.push(['probe']);
      return {};
    },
    switchIpProxy: async () => {
      events.push(['switch']);
    },
    ensureBrowserFingerprintForProxyExit: async (routing) => {
      events.push(['fingerprint', routing.exitIp, routing.exitRegion]);
      return { profile: { exitRegion: routing.exitRegion } };
    },
    openSignupEntryTab: async (step) => {
      events.push(['open', step]);
    },
    completeNodeFromBackground: async (nodeId) => {
      events.push(['complete', nodeId]);
    },
  });

  await executor.executeStep1();

  assert.deepStrictEqual(events, [
    ['fingerprint', '203.0.113.8', 'JP'],
    ['open', 1],
    ['complete', 'open-chatgpt'],
  ]);
});

test('step 1 probes proxy exit when IP proxy is enabled and exit info is empty', async () => {
  const api = loadStep1Module();
  const events = [];

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyAppliedExitIp: '',
      ipProxyAppliedExitDetecting: false,
    }),
    probeIpProxyExit: async (options) => {
      events.push(['probe', options.timeoutMs, options.authRebindRetry]);
      return {
        proxyRouting: {
          applied: true,
          reason: 'applied',
          exitIp: '198.51.100.8',
          exitRegion: 'US',
          exitSource: 'page_context',
        },
      };
    },
    switchIpProxy: async () => {
      events.push(['switch']);
    },
    ensureBrowserFingerprintForProxyExit: async (routing) => {
      events.push(['fingerprint', routing.exitIp, routing.exitRegion]);
      return { profile: { exitRegion: routing.exitRegion } };
    },
    openSignupEntryTab: async (step) => {
      events.push(['open', step]);
    },
    completeNodeFromBackground: async (nodeId) => {
      events.push(['complete', nodeId]);
    },
  });

  await executor.executeStep1();

  assert.deepStrictEqual(events, [
    ['probe', 12000, true],
    ['fingerprint', '198.51.100.8', 'US'],
    ['open', 1],
    ['complete', 'open-chatgpt'],
  ]);
});

test('step 1 stops before opening ChatGPT when browser fingerprint apply fails', async () => {
  const api = loadStep1Module();
  const events = [];

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyAppliedExitIp: '',
      ipProxyAppliedExitDetecting: false,
    }),
    probeIpProxyExit: async () => {
      events.push(['probe']);
      return {
        proxyRouting: {
          applied: true,
          reason: 'applied',
          exitIp: '198.51.100.8',
          exitRegion: 'US',
        },
      };
    },
    switchIpProxy: async () => {},
    ensureBrowserFingerprintForProxyExit: async () => {
      events.push(['fingerprint']);
      throw new Error('fingerprint failed');
    },
    openSignupEntryTab: async () => {
      events.push(['open']);
    },
    completeNodeFromBackground: async () => {},
  });

  await assert.rejects(
    () => executor.executeStep1(),
    /fingerprint failed/
  );

  assert.deepStrictEqual(events, [
    ['probe'],
    ['fingerprint'],
  ]);
});

test('step 1 switches to next proxy and reprobes before opening ChatGPT', async () => {
  const api = loadStep1Module();
  const events = [];
  let stateCallCount = 0;
  let probeCallCount = 0;

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => {
      stateCallCount += 1;
      return { ipProxyEnabled: true, marker: `state-${stateCallCount}` };
    },
    probeIpProxyExit: async (options) => {
      probeCallCount += 1;
      events.push(['probe', options.state.marker]);
      if (probeCallCount === 1) {
        return {
          proxyRouting: {
            applied: false,
            reason: 'connectivity_failed',
            exitIp: '',
            exitError: 'probe failed',
          },
        };
      }
      return {
        proxyRouting: {
          applied: true,
          reason: 'applied',
          exitIp: '198.51.100.9',
          exitRegion: 'US',
        },
      };
    },
    switchIpProxy: async (direction, options) => {
      events.push(['switch', direction, options.state.marker, options.skipExitProbe, options.forceRefresh]);
    },
    ensureBrowserFingerprintForProxyExit: async (routing) => {
      events.push(['fingerprint', routing.exitIp, routing.exitRegion]);
      return { profile: { exitRegion: routing.exitRegion } };
    },
    openSignupEntryTab: async (step) => {
      events.push(['open', step]);
    },
    completeNodeFromBackground: async () => {},
  });

  await executor.executeStep1();

  assert.deepStrictEqual(events, [
    ['probe', 'state-1'],
    ['switch', 'next', 'state-1', true, true],
    ['probe', 'state-2'],
    ['fingerprint', '198.51.100.9', 'US'],
    ['open', 1],
  ]);
});

test('step 1 switches to next proxy when proxy probe throws', async () => {
  const api = loadStep1Module();
  const events = [];
  let probeCallCount = 0;

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({ ipProxyEnabled: true }),
    probeIpProxyExit: async () => {
      probeCallCount += 1;
      events.push(['probe', probeCallCount]);
      if (probeCallCount === 1) {
        throw new Error('probe transport failed');
      }
      return {
        proxyRouting: {
          applied: true,
          reason: 'applied',
          exitIp: '198.51.100.10',
          exitRegion: 'SG',
        },
      };
    },
    switchIpProxy: async (direction, options) => {
      events.push(['switch', direction, options.skipExitProbe, options.forceRefresh]);
    },
    ensureBrowserFingerprintForProxyExit: async (routing) => {
      events.push(['fingerprint', routing.exitIp, routing.exitRegion]);
      return { profile: { exitRegion: routing.exitRegion } };
    },
    openSignupEntryTab: async (step) => {
      events.push(['open', step]);
    },
    completeNodeFromBackground: async () => {},
  });

  await executor.executeStep1();

  assert.deepStrictEqual(events, [
    ['probe', 1],
    ['switch', 'next', true, true],
    ['probe', 2],
    ['fingerprint', '198.51.100.10', 'SG'],
    ['open', 1],
  ]);
});

test('step 1 stops before opening ChatGPT after three failed proxy exit probes', async () => {
  const api = loadStep1Module();
  const events = {
    openCalls: 0,
    probeCalls: 0,
    switchCalls: 0,
  };

  const executor = api.createStep1Executor({
    addLog: async () => {},
    chrome: createNoopChromeApi(),
    getState: async () => ({ ipProxyEnabled: true }),
    probeIpProxyExit: async () => {
      events.probeCalls += 1;
      return {
        proxyRouting: {
          applied: false,
          reason: 'connectivity_failed',
          exitIp: '',
          exitError: 'still no exit ip',
        },
      };
    },
    switchIpProxy: async () => {
      events.switchCalls += 1;
    },
    openSignupEntryTab: async () => {
      events.openCalls += 1;
    },
    completeNodeFromBackground: async () => {},
  });

  await assert.rejects(
    () => executor.executeStep1(),
    /IP 出口检测连续失败，已重试 3 次/
  );

  assert.equal(events.probeCalls, 3);
  assert.equal(events.switchCalls, 2);
  assert.equal(events.openCalls, 0);
});
