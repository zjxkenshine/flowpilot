const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('background.js', 'utf8');

test('background imports auto-run controller module', () => {
  assert.match(source, /background\/auto-run-controller\.js/);
  assert.match(source, /buildFreshAutoRunKeepState/);
});

test('auto-run controller module exposes a factory', () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};

  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  assert.equal(typeof api?.createAutoRunController, 'function');
});

test('auto-run account record status preserves the real failed node instead of parsing guidance text', () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);
  const controller = api.createAutoRunController({});

  const state = {
    currentNodeId: 'fetch-login-code',
    nodeStatuses: {
      'submit-signup-email': 'completed',
      'oauth-login': 'completed',
      'fetch-login-code': 'failed',
    },
  };
  const error = new Error('缺少登录账号：请先完成步骤 2，或在侧栏填写账号后再执行当前步骤。');

  assert.equal(
    controller.resolveAutoRunAccountRecordStatus('failed', state, error),
    'node:fetch-login-code:failed'
  );

  error.failedNodeId = 'platform-verify';
  assert.equal(
    controller.resolveAutoRunAccountRecordStatus('failed', state, error),
    'node:platform-verify:failed'
  );
});

test('auto-run controller invokes success hook after a successful round', async () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  let currentState = {
    stepStatuses: {},
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
  };
  const runtime = {
    state: {
      autoRunActive: false,
      autoRunCurrentRun: 0,
      autoRunTotalRuns: 0,
      autoRunAttemptRun: 0,
      autoRunSessionId: 0,
    },
    get() {
      return { ...this.state };
    },
    set(updates = {}) {
      this.state = { ...this.state, ...updates };
    },
  };
  let sessionSeed = 0;
  const successCalls = [];

  const controller = api.createAutoRunController({
    addLog: async () => {},
    appendAccountRunRecord: async () => null,
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 3,
    AUTO_RUN_RETRY_DELAY_MS: 3000,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async () => {},
    broadcastStopToContentScripts: async () => {},
    cancelPendingCommands: () => {},
    clearStopRequest: () => {},
    createAutoRunSessionId: () => {
      sessionSeed += 1;
      return sessionSeed;
    },
    getAutoRunStatusPayload: () => ({}),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'open-chatgpt',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({ ...currentState }),
    getStopRequested: () => false,
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: (value) => Math.max(0, Math.floor(Number(value) || 0)),
    onAutoRunRoundSuccess: async (payload = {}) => {
      successCalls.push({ ...payload });
    },
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      currentState = {
        ...currentState,
        stepStatuses: {},
        tabRegistry: {},
        sourceLastUrls: {},
      };
    },
    runAutoSequenceFromNode: async () => {},
    runtime,
    setState: async (updates = {}) => {
      currentState = {
        ...currentState,
        ...updates,
      };
    },
    sleepWithStop: async () => {},
    throwIfAutoRunSessionStopped: (sessionId) => {
      if (sessionId && sessionId !== runtime.state.autoRunSessionId) {
        throw new Error('Flow stopped.');
      }
    },
    waitForRunningNodesToFinish: async () => currentState,
    chrome: {
      runtime: {
        sendMessage() {
          return Promise.resolve();
        },
      },
    },
  });

  await controller.autoRunLoop(1, {
    autoRunSkipFailures: false,
    mode: 'restart',
  });

  assert.equal(successCalls.length, 1);
  assert.deepEqual(successCalls[0], {
    successfulRuns: 1,
    targetRun: 1,
    totalRuns: 1,
    attemptRun: 1,
    sessionId: 1,
  });
});

function extractFunction(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers
    .map((marker) => source.indexOf(marker))
    .find((index) => index >= 0);
  if (start < 0) {
    throw new Error(`missing function ${name}`);
  }

  let parenDepth = 0;
  let signatureEnded = false;
  let braceStart = -1;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(') {
      parenDepth += 1;
    } else if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) {
        signatureEnded = true;
      }
    } else if (ch === '{' && signatureEnded) {
      braceStart = i;
      break;
    }
  }

  if (braceStart < 0) {
    throw new Error(`missing body for function ${name}`);
  }

  let depth = 0;
  let end = braceStart;
  for (; end < source.length; end += 1) {
    const ch = source[end];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(start, end);
}

function createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness(overrides = {}) {
  const events = {
    logs: [],
    refreshCalls: [],
    switchCalls: [],
  };
  let currentState = overrides.state || {};
  const runtimePatchCalls = [];
  const api = new Function(
    'deps',
    `
const {
  getState,
  addLog,
  switchIpProxy,
  refreshIpProxyPool,
  getIpProxyRuntimeSnapshot,
  buildIpProxyRuntimeStatePatch,
  normalizeIpProxyMode,
  normalizeIpProxyProviderValue,
  resolveIpProxyAutoSwitchThreshold,
  resolveIpProxySwitchIpRoundCount,
  resolveIpProxyPoolTargetCountForMode,
  DEFAULT_IP_PROXY_SERVICE,
} = deps;
${extractFunction('maybeSwitchIpProxyAfterAutoRunRoundSuccess')}
return maybeSwitchIpProxyAfterAutoRunRoundSuccess;
`
  )({
    getState: async () => currentState,
    addLog: async (message, level) => {
      events.logs.push({ message, level });
    },
    switchIpProxy: async (direction, options = {}) => {
      events.switchCalls.push({ direction, options });
      if (typeof overrides.switchIpProxy === 'function') {
        return overrides.switchIpProxy(direction, options, events);
      }
      return {
        display: '1.2.3.4:9000 (1/3)',
        proxyRouting: { applied: true },
      };
    },
    refreshIpProxyPool: async (options = {}) => {
      events.refreshCalls.push({ options });
      if (typeof overrides.refreshIpProxyPool === 'function') {
        return overrides.refreshIpProxyPool(options, events);
      }
      return {
        display: '1.2.3.4:9000 (1/3)',
        pool: [{ host: '1.2.3.4', port: 9000 }],
        proxyRouting: { applied: true },
      };
    },
    getIpProxyRuntimeSnapshot: overrides.getIpProxyRuntimeSnapshot || (() => (
      overrides.runtimeSnapshot || { pool: [], index: 0 }
    )),
    buildIpProxyRuntimeStatePatch: overrides.buildIpProxyRuntimeStatePatch || ((mode, runtime, provider) => {
      runtimePatchCalls.push({ mode, runtime, provider });
      return {
        ipProxyApiPool: runtime.pool,
        ipProxyApiCurrentIndex: runtime.index,
        ipProxyApiCurrent: runtime.current,
      };
    }),
    normalizeIpProxyMode: overrides.normalizeIpProxyMode || ((value) => String(value || '').trim().toLowerCase()),
    normalizeIpProxyProviderValue: overrides.normalizeIpProxyProviderValue || ((value) => String(value || '').trim().toLowerCase()),
    resolveIpProxyAutoSwitchThreshold: overrides.resolveIpProxyAutoSwitchThreshold || ((state) => Number(state.ipProxyPoolTargetCount) || 20),
    resolveIpProxySwitchIpRoundCount: overrides.resolveIpProxySwitchIpRoundCount || ((state) => Number(state.ipProxySwitchIpRoundCount) || 1),
    resolveIpProxyPoolTargetCountForMode: overrides.resolveIpProxyPoolTargetCountForMode || (() => 100),
    DEFAULT_IP_PROXY_SERVICE: '711proxy',
  });

  return {
    events,
    runtimePatchCalls,
    setState(nextState) {
      currentState = nextState;
    },
    run: (payload = {}) => api(payload),
  };
}

test('success rotation hook does not rotate before hitting threshold', async () => {
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '20',
      ipProxySwitchIpRoundCount: '3',
    },
    runtimeSnapshot: {
      pool: [{ host: '1.2.3.4', port: 9000 }, { host: '5.6.7.8', port: 10000 }],
      index: 0,
    },
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(result, null);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.refreshCalls.length, 0);
});

test('success rotation hook switches to next entry when switch-IP round hits before pool tail', async () => {
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '20',
      ipProxySwitchIpRoundCount: '2',
    },
    runtimeSnapshot: {
      pool: [{ host: '1.2.3.4', port: 9000 }, { host: '5.6.7.8', port: 10000 }],
      index: 0,
    },
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 1);
  assert.equal(harness.events.switchCalls[0].direction, 'next');
  assert.equal(harness.events.switchCalls[0].options.forceRefresh, false);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /换IP轮次命中/);
  assert.equal(result.display, '1.2.3.4:9000 (1/3)');
});

test('success rotation hook refreshes tail pool when switch-IP round hits and tail refresh is enabled', async () => {
  const refreshedPool = [
    { host: '9.9.9.9', port: 9000 },
    { host: '9.9.9.9', port: 9000 },
    { host: '8.8.8.8', port: 10000 },
  ];
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '20',
      ipProxySwitchIpRoundCount: '2',
      ipProxyAutoRefreshPoolOnExhausted: true,
    },
    runtimeSnapshot: {
      pool: [{ host: '1.1.1.1', port: 9000 }, { host: '2.2.2.2', port: 10000 }],
      index: 1,
    },
    refreshIpProxyPool: async () => ({
      display: '9.9.9.9:9000 (2/3)',
      pool: refreshedPool,
      proxyRouting: { applied: true },
    }),
    switchIpProxy: async (direction, options = {}) => ({
      display: `${options?.state?.ipProxyApiPool?.[0]?.host}:${options?.state?.ipProxyApiPool?.[0]?.port} (1/3)`,
      proxyRouting: { applied: true },
    }),
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(harness.events.refreshCalls.length, 1);
  assert.equal(harness.events.switchCalls.length, 1);
  assert.equal(harness.events.switchCalls[0].direction, 'next');
  assert.equal(harness.runtimePatchCalls.length, 1);
  assert.equal(harness.runtimePatchCalls[0].runtime.index, refreshedPool.length - 1);
  assert.deepEqual(harness.runtimePatchCalls[0].runtime.current, refreshedPool[refreshedPool.length - 1]);
  assert.deepEqual(harness.events.switchCalls[0].options.state.ipProxyApiPool, refreshedPool);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /换IP轮次命中/);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /已从 711 同步新池/);
  assert.equal(result.display, '9.9.9.9:9000 (1/3)');
});

test('success rotation hook skips tail switch-IP rotation when tail refresh is disabled', async () => {
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '20',
      ipProxySwitchIpRoundCount: '2',
      ipProxyAutoRefreshPoolOnExhausted: false,
    },
    runtimeSnapshot: {
      pool: [{ host: '1.1.1.1', port: 9000 }, { host: '2.2.2.2', port: 10000 }],
      index: 1,
    },
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'pool_tail_without_refresh');
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /已到 API 池尾部/);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /未允许池尾拉新池/);
});

test('success rotation hook refreshes a new proxy pool when pool round hits', async () => {
  const refreshedPool = [
    { host: '7.7.7.7', port: 9000 },
    { host: '6.6.6.6', port: 10000 },
  ];
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '2',
      ipProxySwitchIpRoundCount: '5',
      ipProxyAutoRefreshPoolOnExhausted: false,
    },
    runtimeSnapshot: {
      pool: [{ host: '1.1.1.1', port: 9000 }, { host: '2.2.2.2', port: 10000 }],
      index: 0,
    },
    refreshIpProxyPool: async () => ({
      display: '7.7.7.7:9000 (1/2)',
      pool: refreshedPool,
      proxyRouting: { applied: true },
    }),
  });

  await harness.run({ successfulRuns: 2 });
  assert.equal(harness.events.refreshCalls.length, 1);
  assert.equal(harness.events.switchCalls.length, 1);
  assert.equal(harness.events.switchCalls[0].direction, 'next');
  assert.deepEqual(harness.events.switchCalls[0].options.state.ipProxyApiPool, refreshedPool);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /换代理池轮次命中/);
});

test('success rotation hook prioritizes pool refresh when pool and switch-IP rounds both hit', async () => {
  const refreshedPool = [
    { host: '7.7.7.7', port: 9000 },
    { host: '6.6.6.6', port: 10000 },
  ];
  const harness = createMaybeSwitchIpProxyAfterAutoRunRoundSuccessHarness({
    state: {
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyPoolTargetCount: '2',
      ipProxySwitchIpRoundCount: '2',
      ipProxyAutoRefreshPoolOnExhausted: true,
    },
    runtimeSnapshot: {
      pool: [{ host: '1.1.1.1', port: 9000 }, { host: '2.2.2.2', port: 10000 }],
      index: 0,
    },
    refreshIpProxyPool: async () => ({
      display: '7.7.7.7:9000 (1/2)',
      pool: refreshedPool,
      proxyRouting: { applied: true },
    }),
  });

  await harness.run({ successfulRuns: 2 });
  const logText = harness.events.logs.map((entry) => entry.message).join('\n');
  assert.equal(harness.events.refreshCalls.length, 1);
  assert.equal(harness.events.switchCalls.length, 1);
  assert.deepEqual(harness.events.switchCalls[0].options.state.ipProxyApiPool, refreshedPool);
  assert.match(logText, /换代理池轮次命中/);
  assert.doesNotMatch(logText, /换IP轮次命中/);
});
