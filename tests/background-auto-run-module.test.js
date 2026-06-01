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

test('fresh auto-run keep state preserves only warn and error logs when enabled', () => {
  const globalScope = {
    MultiPageFlowRegistry: {
      normalizeFlowId: (value, fallback) => String(value || fallback || 'openai').trim().toLowerCase(),
    },
  };
const api = new Function('self', `
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const kiroStateHelpers = null;
const AUTO_STEP_DELAY_MIN_ALLOWED_SECONDS = 0;
const AUTO_STEP_DELAY_MAX_ALLOWED_SECONDS = 600;
const DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS = 30;
const SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MIN_SECONDS = 5;
const SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MAX_SECONDS = 300;
const DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS = 45;
const AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MIN_SECONDS = 5;
const AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MAX_SECONDS = 180;
const DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS = 30;
const SIGNUP_VERIFICATION_READY_TIMEOUT_MIN_SECONDS = 5;
const SIGNUP_VERIFICATION_READY_TIMEOUT_MAX_SECONDS = 300;
const DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS = 60;
const SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MIN = 1;
const SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MAX = 20;
const DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS = 5;
const PERSISTED_SETTING_DEFAULTS = {
  registrationStageWaitSeconds: DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS,
  signupIdentityRedirectTimeoutSeconds: DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS,
  authContentScriptRecoveryTimeoutSeconds: DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS,
  signupVerificationReadyTimeoutSeconds: DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS,
  signupVerificationReadyMaxRounds: DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS,
  phoneVerificationCodePrefetchEnabled: false,
};
function isPlainObjectValue(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function cloneAutoRunKeepStateValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneAutoRunKeepStateValue(entry));
  }
  if (isPlainObjectValue(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, cloneAutoRunKeepStateValue(entryValue)])
    );
  }
  return value;
}
function mergeAutoRunKeepStateValue(baseValue, patchValue) {
  if (Array.isArray(patchValue)) {
    return patchValue.map((entry) => cloneAutoRunKeepStateValue(entry));
  }
  if (!isPlainObjectValue(patchValue)) {
    return patchValue === undefined ? cloneAutoRunKeepStateValue(baseValue) : patchValue;
  }
  const baseObject = isPlainObjectValue(baseValue) ? baseValue : {};
  const nextObject = { ...cloneAutoRunKeepStateValue(baseObject) };
  for (const [key, entryValue] of Object.entries(patchValue)) {
    nextObject[key] = mergeAutoRunKeepStateValue(baseObject[key], entryValue);
  }
  return nextObject;
}
function normalizeStepExecutionRangeByFlow(value = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function buildPersistentSettingsPayload(input = {}) {
  return {
    autoRunPreserveIssueLogsOnRestart: Boolean(input.autoRunPreserveIssueLogsOnRestart),
    settingsState: input.settingsState || {},
  };
}
function collectAutoRunFreshResetRuntimeSettingKeys() {
  return new Set();
}
${extractFunction('normalizeRegistrationStageWaitSeconds')}
${extractFunction('normalizeSignupIdentityRedirectTimeoutSeconds')}
${extractFunction('normalizeAuthContentScriptRecoveryTimeoutSeconds')}
${extractFunction('normalizeSignupVerificationReadyTimeoutSeconds')}
${extractFunction('normalizeSignupVerificationReadyMaxRounds')}
${extractFunction('buildAutoRunFreshResetSettingsState')}
${extractFunction('filterAutoRunIssueLogsForRestart')}
${extractFunction('buildFreshAutoRunKeepState')}
return { buildFreshAutoRunKeepState };
`)(globalScope);

  const logs = [
    { message: 'starting', level: 'info', nested: { kept: false } },
    { message: 'heads up', level: 'warn', nested: { kept: true } },
    { message: 'done', level: 'ok' },
    { message: 'failed', level: 'error' },
  ];
  const disabled = api.buildFreshAutoRunKeepState({
    activeFlowId: 'openai',
    autoRunPreserveIssueLogsOnRestart: false,
    logs,
  });
  assert.equal(Object.prototype.hasOwnProperty.call(disabled, 'logs'), false);

  const enabled = api.buildFreshAutoRunKeepState({
    activeFlowId: 'openai',
    autoRunPreserveIssueLogsOnRestart: true,
    logs,
    autoRunRoundSummaries: [{ status: 'failed' }],
    autoRunSessionId: 123,
  });
  assert.deepEqual(
    enabled.logs.map((entry) => [entry.level, entry.message]),
    [
      ['warn', 'heads up'],
      ['error', 'failed'],
    ]
  );
  assert.equal(enabled.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(enabled.settingsState.flows.openai.autoRun.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(Object.prototype.hasOwnProperty.call(enabled, 'autoRunRoundSummaries'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(enabled, 'autoRunSessionId'), false);
  logs[1].nested.kept = false;
  assert.equal(enabled.logs[0].nested.kept, true, 'preserved logs should be cloned');

  const manyLogs = Array.from({ length: 510 }, (_, index) => ({
    level: 'warn',
    message: `warning-${index + 1}`,
  }));
  const capped = api.buildFreshAutoRunKeepState({
    activeFlowId: 'openai',
    autoRunPreserveIssueLogsOnRestart: true,
    logs: manyLogs,
  });
  assert.equal(capped.logs.length, 500);
  assert.equal(capped.logs[0].message, 'warning-11');
  assert.equal(capped.logs[499].message, 'warning-510');
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
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 5,
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

test('auto-run controller forwards phone code prefetch option into workflow context', async () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  let currentState = {
    nodeStatuses: {},
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
  };
  const contexts = [];
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

  const controller = api.createAutoRunController({
    addLog: async () => {},
    appendAccountRunRecord: async () => null,
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 2,
    AUTO_RUN_RETRY_DELAY_MS: 1,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async () => {},
    broadcastStopToContentScripts: async () => {},
    cancelPendingCommands: () => {},
    clearStopRequest: () => {},
    createAutoRunSessionId: () => 99,
    getAutoRunStatusPayload: () => ({}),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'open-chatgpt',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({ ...currentState }),
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isCloudCheckoutAlreadyPaidFailure: () => false,
    isHostedCheckoutCardFallbackFailure: () => false,
    isHostedCheckoutGenericErrorFailure: () => false,
    isHostedCheckoutVerificationResendLimitFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    getStopRequested: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: () => 0,
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      currentState = { ...currentState, nodeStatuses: {}, tabRegistry: {}, sourceLastUrls: {} };
    },
    runAutoSequenceFromNode: async (_nodeId, context = {}) => {
      contexts.push({ ...context });
    },
    runtime,
    setState: async (updates = {}) => {
      currentState = { ...currentState, ...updates };
    },
    sleepWithStop: async () => {},
    throwIfAutoRunSessionStopped: () => {},
    waitForRunningNodesToFinish: async () => currentState,
    chrome: { runtime: { sendMessage: () => Promise.resolve() } },
  });

  await controller.autoRunLoop(1, {
    phoneVerificationCodePrefetchEnabled: true,
    mode: 'restart',
  });

  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].phoneVerificationCodePrefetchEnabled, true);
  assert.equal(currentState.phoneVerificationCodePrefetchEnabled, true);
});

test('auto-run controller forwards registration-only mode into workflow context', async () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  let currentState = {
    nodeStatuses: {},
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
  };
  const contexts = [];
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

  const controller = api.createAutoRunController({
    addLog: async () => {},
    appendAccountRunRecord: async () => null,
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 1,
    AUTO_RUN_RETRY_DELAY_MS: 1,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async () => {},
    broadcastStopToContentScripts: async () => {},
    cancelPendingCommands: () => {},
    clearStopRequest: () => {},
    createAutoRunSessionId: () => 103,
    getAutoRunStatusPayload: () => ({}),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'open-chatgpt',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({ ...currentState }),
    getStopRequested: () => false,
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isCloudCheckoutAlreadyPaidFailure: () => false,
    isHostedCheckoutCardFallbackFailure: () => false,
    isHostedCheckoutGenericErrorFailure: () => false,
    isHostedCheckoutVerificationResendLimitFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    getStopRequested: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: () => 0,
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      currentState = { ...currentState, nodeStatuses: {}, tabRegistry: {}, sourceLastUrls: {} };
    },
    runAutoSequenceFromNode: async (_nodeId, context = {}) => {
      contexts.push({ ...context });
    },
    runtime,
    setState: async (updates = {}) => {
      currentState = { ...currentState, ...updates };
    },
    sleepWithStop: async () => {},
    throwIfAutoRunSessionStopped: () => {},
    waitForRunningNodesToFinish: async () => currentState,
    chrome: { runtime: { sendMessage: () => Promise.resolve() } },
  });

  await controller.autoRunLoop(2, {
    registrationOnlyModeEnabled: true,
    mode: 'restart',
  });

  assert.equal(contexts.length, 2);
  assert.deepEqual(contexts.map((context) => context.registrationOnlyModeEnabled), [true, true]);
  assert.equal(currentState.registrationOnlyModeEnabled, true);
});

test('auto-run controller forwards registration activation-only mode and disables registration-only', async () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  let currentState = {
    nodeStatuses: {},
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
  };
  const contexts = [];
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

  const controller = api.createAutoRunController({
    addLog: async () => {},
    appendAccountRunRecord: async () => null,
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 1,
    AUTO_RUN_RETRY_DELAY_MS: 1,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async () => {},
    broadcastStopToContentScripts: async () => {},
    cancelPendingCommands: () => {},
    clearStopRequest: () => {},
    createAutoRunSessionId: () => 104,
    getAutoRunStatusPayload: () => ({}),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'open-chatgpt',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({ ...currentState }),
    getStopRequested: () => false,
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isCloudCheckoutAlreadyPaidFailure: () => false,
    isHostedCheckoutCardFallbackFailure: () => false,
    isHostedCheckoutGenericErrorFailure: () => false,
    isHostedCheckoutVerificationResendLimitFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: () => 0,
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      currentState = { ...currentState, nodeStatuses: {}, tabRegistry: {}, sourceLastUrls: {} };
    },
    runAutoSequenceFromNode: async (_nodeId, context = {}) => {
      contexts.push({ ...context });
    },
    runtime,
    setState: async (updates = {}) => {
      currentState = { ...currentState, ...updates };
    },
    sleepWithStop: async () => {},
    throwIfAutoRunSessionStopped: () => {},
    waitForRunningNodesToFinish: async () => currentState,
    chrome: { runtime: { sendMessage: () => Promise.resolve() } },
  });

  await controller.autoRunLoop(2, {
    registrationOnlyModeEnabled: true,
    registrationActivationOnlyModeEnabled: true,
    mode: 'restart',
  });

  assert.equal(contexts.length, 2);
  assert.deepEqual(contexts.map((context) => context.registrationActivationOnlyModeEnabled), [true, true]);
  assert.deepEqual(contexts.map((context) => context.registrationOnlyModeEnabled), [false, false]);
  assert.equal(currentState.registrationActivationOnlyModeEnabled, true);
  assert.equal(currentState.registrationOnlyModeEnabled, false);
});

test('auto-run controller restores phone prefetch runtime after completion', async () => {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);

  let currentState = {
    nodeStatuses: {},
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
  };
  const restoreCalls = [];
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

  const controller = api.createAutoRunController({
    addLog: async () => {},
    appendAccountRunRecord: async () => null,
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 1,
    AUTO_RUN_RETRY_DELAY_MS: 1,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async () => {},
    broadcastStopToContentScripts: async () => {},
    cancelPendingCommands: () => {},
    clearStopRequest: () => {},
    createAutoRunSessionId: () => 101,
    getAutoRunStatusPayload: () => ({}),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'open-chatgpt',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({ ...currentState }),
    getStopRequested: () => false,
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isCloudCheckoutAlreadyPaidFailure: () => false,
    isHostedCheckoutCardFallbackFailure: () => false,
    isHostedCheckoutGenericErrorFailure: () => false,
    isHostedCheckoutVerificationResendLimitFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: () => 0,
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      currentState = { ...currentState, nodeStatuses: {}, tabRegistry: {}, sourceLastUrls: {} };
    },
    restorePhoneCodePrefetchRuntime: async (payload = {}) => {
      restoreCalls.push({ ...payload });
    },
    runAutoSequenceFromNode: async () => {},
    runtime,
    setState: async (updates = {}) => {
      currentState = { ...currentState, ...updates };
    },
    sleepWithStop: async () => {},
    throwIfAutoRunSessionStopped: () => {},
    waitForRunningNodesToFinish: async () => currentState,
    chrome: { runtime: { sendMessage: () => Promise.resolve() } },
  });

  await controller.autoRunLoop(1, {
    phoneVerificationCodePrefetchEnabled: true,
    mode: 'restart',
  });

  assert.deepEqual(restoreCalls, [{ reason: 'complete' }]);
});

function createHostedGenericErrorAutoRunHarness(options = {}) {
  const source = fs.readFileSync('background/auto-run-controller.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAutoRunController;`)(globalScope);
  const events = [];
  let runCalls = 0;
  let currentState = {
    currentNodeId: 'plus-checkout-create',
    nodeStatuses: {
      'plus-checkout-create': 'running',
    },
    autoRunFallbackThreadIntervalMinutes: 0,
    autoRunRoundSummaries: [],
    tabRegistry: {},
    sourceLastUrls: {},
    autoRunRetryPaypalCallback: Boolean(options.autoRunRetryPaypalCallback),
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

  const controller = api.createAutoRunController({
    addLog: async (message, level = 'info') => events.push({ type: 'log', message, level }),
    appendAccountRunRecord: async (status, _state, reason) => {
      events.push({ type: 'accountRecord', status, reason });
      return { status, reason };
    },
    AUTO_RUN_MAX_RETRIES_PER_ROUND: 2,
    AUTO_RUN_RETRY_DELAY_MS: 25,
    AUTO_RUN_TIMER_KIND_BEFORE_RETRY: 'before_retry',
    AUTO_RUN_TIMER_KIND_BETWEEN_ROUNDS: 'between_rounds',
    broadcastAutoRunStatus: async (phase, payload = {}) => events.push({ type: 'status', phase, payload }),
    broadcastStopToContentScripts: async () => events.push({ type: 'stopContent' }),
    cancelPendingCommands: (reason) => events.push({ type: 'cancelPendingCommands', reason }),
    clearStopRequest: () => events.push({ type: 'clearStopRequest' }),
    createAutoRunSessionId: () => {
      sessionSeed += 1;
      return sessionSeed;
    },
    getAutoRunStatusPayload: (phase, payload = {}) => ({
      autoRunning: ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(phase),
      autoRunPhase: phase,
      autoRunCurrentRun: payload.currentRun ?? 0,
      autoRunTotalRuns: payload.totalRuns ?? 1,
      autoRunAttemptRun: payload.attemptRun ?? 0,
      autoRunSessionId: payload.sessionId ?? 0,
    }),
    getErrorMessage: (error) => error?.message || String(error || ''),
    getFirstUnfinishedNodeId: () => 'plus-checkout-create',
    getPendingAutoRunTimerPlan: () => null,
    getRunningNodeIds: () => [],
    getState: async () => ({
      ...currentState,
      nodeStatuses: { ...(currentState.nodeStatuses || {}) },
      tabRegistry: { ...(currentState.tabRegistry || {}) },
      sourceLastUrls: { ...(currentState.sourceLastUrls || {}) },
    }),
    getStopRequested: () => false,
    hasSavedNodeProgress: () => false,
    isAddPhoneAuthFailure: () => false,
    isGpcTaskEndedFailure: () => false,
    isHostedCheckoutCardFallbackFailure: (error) => /HOSTED_CHECKOUT_CARD_FALLBACK::/i.test(error?.message || String(error || '')),
    isHostedCheckoutGenericErrorFailure: (error) => /HOSTED_CHECKOUT_GENERIC_ERROR::/i.test(error?.message || String(error || '')),
    isHostedCheckoutVerificationResendLimitFailure: () => false,
    isKiroProxyFailure: () => false,
    isPhoneSmsPlatformRateLimitFailure: () => false,
    isPlusCheckoutNonFreeTrialFailure: () => false,
    isRestartCurrentAttemptError: () => false,
    isStep4Route405RecoveryLimitFailure: () => false,
    isSignupUserAlreadyExistsFailure: () => false,
    isStopError: () => false,
    launchAutoRunTimerPlan: async () => false,
    normalizeAutoRunFallbackThreadIntervalMinutes: (value) => Math.max(0, Math.floor(Number(value) || 0)),
    persistAutoRunTimerPlan: async () => ({}),
    resetState: async () => {
      events.push({ type: 'resetState' });
      currentState = {
        ...currentState,
        currentNodeId: '',
        nodeStatuses: {},
        tabRegistry: {},
        sourceLastUrls: {},
      };
    },
    runAutoSequenceFromNode: async (nodeId, context = {}) => {
      runCalls += 1;
      events.push({ type: 'run', nodeId, context });
      if (runCalls <= (options.failuresBeforeSuccess ?? 1)) {
        throw new Error(options.errorMessage || 'HOSTED_CHECKOUT_GENERIC_ERROR::Things don\'t appear to be working at the moment.');
      }
    },
    runtime,
    setState: async (updates = {}) => {
      events.push({ type: 'setState', updates: { ...updates } });
      currentState = {
        ...currentState,
        ...updates,
        nodeStatuses: updates.nodeStatuses ? { ...updates.nodeStatuses } : currentState.nodeStatuses,
        tabRegistry: updates.tabRegistry ? { ...updates.tabRegistry } : currentState.tabRegistry,
        sourceLastUrls: updates.sourceLastUrls ? { ...updates.sourceLastUrls } : currentState.sourceLastUrls,
      };
    },
    sleepWithStop: async (ms) => events.push({ type: 'sleep', ms }),
    throwIfAutoRunSessionStopped: (sessionId) => {
      if (sessionId && sessionId !== runtime.state.autoRunSessionId) {
        throw new Error('Flow stopped.');
      }
    },
    waitForRunningNodesToFinish: async () => currentState,
    chrome: {
      runtime: {
        sendMessage(message) {
          events.push({ type: 'sendMessage', message });
          return Promise.resolve();
        },
      },
    },
  });

  return {
    controller,
    events,
    get runCalls() {
      return runCalls;
    },
    get state() {
      return currentState;
    },
  };
}

test('auto-run retries PayPal hosted genericError with a fresh attempt when enabled', async () => {
  const harness = createHostedGenericErrorAutoRunHarness({
    autoRunRetryPaypalCallback: true,
    failuresBeforeSuccess: 1,
  });

  await harness.controller.autoRunLoop(1, {
    autoRunSkipFailures: false,
    autoRunRetryPaypalCallback: true,
    mode: 'restart',
  });

  assert.equal(harness.runCalls, 2);
  assert.equal(harness.events.some((event) => event.type === 'status' && event.phase === 'retrying'), true);
  assert.equal(harness.events.some((event) => event.type === 'sleep' && event.ms === 25), true);
  assert.equal(
    harness.events.filter((event) => event.type === 'run').map((event) => event.context.attemptRuns).join(','),
    '1,2'
  );
  assert.equal(harness.state.autoRunPhase, 'complete');
  assert.equal(harness.state.autoRunRetryPaypalCallback, true);
});

test('auto-run stops on PayPal hosted genericError when automatic retry is disabled', async () => {
  const harness = createHostedGenericErrorAutoRunHarness({
    autoRunRetryPaypalCallback: false,
    failuresBeforeSuccess: 99,
  });

  await harness.controller.autoRunLoop(1, {
    autoRunSkipFailures: false,
    autoRunRetryPaypalCallback: false,
    mode: 'restart',
  });

  assert.equal(harness.runCalls, 1);
  assert.equal(harness.events.some((event) => event.type === 'status' && event.phase === 'retrying'), false);
  assert.equal(harness.events.some((event) => event.type === 'status' && event.phase === 'stopped'), true);
  assert.equal(
    harness.events.some((event) => event.type === 'cancelPendingCommands' && /genericError 已终止/.test(event.reason)),
    true
  );
  assert.equal(
    harness.events.some((event) => event.type === 'log' && /请在弹窗中选择“检查”或“重试”/.test(event.message)),
    true
  );
  assert.equal(harness.state.autoRunPhase, 'stopped');
});

test('auto-run retries hosted checkout card fallback with a fresh attempt by default', async () => {
  const harness = createHostedGenericErrorAutoRunHarness({
    autoRunRetryPaypalCallback: false,
    failuresBeforeSuccess: 1,
    errorMessage: 'HOSTED_CHECKOUT_CARD_FALLBACK::Step 6: hosted checkout entered the card branch instead of PayPal.',
  });

  await harness.controller.autoRunLoop(1, {
    autoRunSkipFailures: false,
    autoRunRetryPaypalCallback: false,
    mode: 'restart',
  });

  assert.equal(harness.runCalls, 2);
  assert.equal(harness.events.some((event) => event.type === 'status' && event.phase === 'retrying'), true);
  assert.equal(harness.events.some((event) => event.type === 'sleep' && event.ms === 25), true);
  assert.equal(
    harness.events.filter((event) => event.type === 'run').map((event) => event.context.attemptRuns).join(','),
    '1,2'
  );
  assert.equal(harness.state.autoRunPhase, 'complete');
});

test('auto-run stops hosted checkout card fallback after the retry limit', async () => {
  const harness = createHostedGenericErrorAutoRunHarness({
    autoRunRetryPaypalCallback: false,
    failuresBeforeSuccess: 99,
    errorMessage: 'HOSTED_CHECKOUT_CARD_FALLBACK::Step 6: hosted checkout entered the card branch instead of PayPal.',
  });

  await harness.controller.autoRunLoop(1, {
    autoRunSkipFailures: false,
    autoRunRetryPaypalCallback: false,
    mode: 'restart',
  });

  assert.equal(harness.runCalls, 3);
  assert.equal(harness.events.filter((event) => event.type === 'status' && event.phase === 'retrying').length, 2);
  assert.equal(harness.events.some((event) => event.type === 'status' && event.phase === 'stopped'), true);
  assert.equal(
    harness.events.some((event) => event.type === 'cancelPendingCommands' && /银行卡分支|card/i.test(event.reason)),
    true
  );
  assert.equal(harness.state.autoRunPhase, 'stopped');
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
    differentExitCalls: [],
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
  switch711ApiProxyUntilExitChanged,
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
    switch711ApiProxyUntilExitChanged: async (options = {}) => {
      events.differentExitCalls.push({ options });
      if (typeof overrides.switch711ApiProxyUntilExitChanged === 'function') {
        return overrides.switch711ApiProxyUntilExitChanged(options, events);
      }
      return {
        display: '5.6.7.8:9000 (2/3)',
        proxyRouting: {
          applied: true,
          reason: 'applied',
          exitIp: '5.6.7.8',
          exitRegion: 'US',
        },
        exitCheckCompleted: true,
        exitChanged: true,
        previousExitIp: options.previousExitIp || '',
        attemptedCount: 1,
        refreshedPool: Boolean(options.refreshPoolFirst),
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
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.differentExitCalls.length, 1);
  assert.equal(harness.events.differentExitCalls[0].options.refreshPoolFirst, false);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /换IP轮次命中/);
  assert.equal(result.display, '5.6.7.8:9000 (2/3)');
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
    switch711ApiProxyUntilExitChanged: async () => ({
      display: '9.9.9.9:9000 (1/3)',
      pool: refreshedPool,
      proxyRouting: {
        applied: true,
        reason: 'applied',
        exitIp: '9.9.9.9',
      },
      exitChanged: true,
      attemptedCount: 1,
      refreshedPool: true,
    }),
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.differentExitCalls.length, 1);
  assert.equal(harness.events.differentExitCalls[0].options.allowRefreshOnExhausted, true);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /换IP轮次命中/);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /已完成真实出口切换/);
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
    switch711ApiProxyUntilExitChanged: async () => ({
      skipped: true,
      reason: 'pool_tail_without_refresh',
      skippedReason: 'pool_tail_without_refresh',
      exitChanged: false,
      attemptedCount: 0,
      proxyRouting: {
        applied: true,
        reason: 'applied',
        exitIp: '203.0.113.8',
      },
    }),
  });

  const result = await harness.run({ successfulRuns: 2 });
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'pool_tail_without_refresh');
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.differentExitCalls.length, 1);
  assert.match(harness.events.logs.map((entry) => entry.message).join('\n'), /未找到不同出口/);
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
    switch711ApiProxyUntilExitChanged: async () => ({
      display: '7.7.7.7:9000 (1/2)',
      pool: refreshedPool,
      proxyRouting: {
        applied: true,
        reason: 'applied',
        exitIp: '7.7.7.7',
      },
      exitChanged: true,
      attemptedCount: 1,
      refreshedPool: true,
    }),
  });

  await harness.run({ successfulRuns: 2 });
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.differentExitCalls.length, 1);
  assert.equal(harness.events.differentExitCalls[0].options.refreshPoolFirst, true);
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
    switch711ApiProxyUntilExitChanged: async () => ({
      display: '7.7.7.7:9000 (1/2)',
      pool: refreshedPool,
      proxyRouting: {
        applied: true,
        reason: 'applied',
        exitIp: '7.7.7.7',
      },
      exitChanged: true,
      attemptedCount: 1,
      refreshedPool: true,
    }),
  });

  await harness.run({ successfulRuns: 2 });
  const logText = harness.events.logs.map((entry) => entry.message).join('\n');
  assert.equal(harness.events.refreshCalls.length, 0);
  assert.equal(harness.events.switchCalls.length, 0);
  assert.equal(harness.events.differentExitCalls.length, 1);
  assert.equal(harness.events.differentExitCalls[0].options.refreshPoolFirst, true);
  assert.match(logText, /换代理池轮次命中/);
  assert.doesNotMatch(logText, /换IP轮次命中/);
});
