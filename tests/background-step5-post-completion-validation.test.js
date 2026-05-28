const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background.js', 'utf8');

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
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(start, end);
}

test('step 5 post-completion validation recovers about-you retry page before allowing success', async () => {
  const api = new Function(`
const logs = [];
const messages = [];
let stateReadCount = 0;

const chrome = {
  tabs: {
    async get() {
      return { url: 'https://auth.openai.com/about-you' };
    },
  },
};

async function sendToContentScriptResilient(source, message) {
  messages.push({ source, type: message.type });
  if (message.type === 'GET_STEP5_SUBMIT_STATE') {
    stateReadCount += 1;
    if (stateReadCount === 1) {
      return {
        retryPage: true,
        retryEnabled: true,
        maxCheckAttemptsBlocked: false,
        userAlreadyExistsBlocked: false,
        successState: '',
        profileVisible: false,
        errorText: '',
        unknownAuthPage: false,
        url: 'https://auth.openai.com/about-you',
      };
    }
    return {
      retryPage: false,
      retryEnabled: false,
      maxCheckAttemptsBlocked: false,
      userAlreadyExistsBlocked: false,
      successState: 'logged_in_home',
      profileVisible: false,
      errorText: '',
      unknownAuthPage: false,
      url: 'https://chatgpt.com/',
    };
  }
  if (message.type === 'RECOVER_STEP5_SUBMIT_RETRY_PAGE') {
    return { recovered: true, clickCount: 1 };
  }
  throw new Error('unexpected message type: ' + message.type);
}

async function addLog(message, level, meta) {
  logs.push({ message, level, meta });
}

async function waitForTabStableComplete() {}

${extractFunction('parseUrlSafely')}
${extractFunction('isSignupEntryHost')}
${extractFunction('isLikelyLoggedInChatgptHomeUrl')}
${extractFunction('getStep5SubmitStateFromContent')}
${extractFunction('isStep5PhoneSignupCompletionPayload')}
${extractFunction('recoverStep5SubmitRetryPageOnTab')}
${extractFunction('validateStep5PostCompletion')}

return {
  async run() {
    return validateStep5PostCompletion(99, {});
  },
  snapshot() {
    return { logs, messages, stateReadCount };
  },
};
`)();

  const result = await api.run();
  const snapshot = api.snapshot();

  assert.equal(result.successState, 'logged_in_home');
  assert.deepStrictEqual(
    snapshot.messages.map(({ type }) => type),
    ['GET_STEP5_SUBMIT_STATE', 'RECOVER_STEP5_SUBMIT_RETRY_PAGE', 'GET_STEP5_SUBMIT_STATE']
  );
  assert.equal(snapshot.stateReadCount, 2);
  assert.equal(
    snapshot.logs.some(({ message }) => /检测到认证重试页/.test(message)),
    true
  );
});

test('step 5 completion clears failed phone reuse and marks post-validation errors as non-reusable', async () => {
  const api = new Function(`
const events = {
  logs: [],
  setStateCalls: [],
  broadcasts: [],
};
let currentState = {
  failedSignupPhoneReuseActivation: {
    activationId: 'previous-reuse',
    phoneNumber: '+56988845555',
    provider: 'hero-sms',
  },
  nodeStatuses: { 'fill-profile': 'pending' },
};

async function addLog(message, level, meta) {
  events.logs.push({ message, level, meta });
}
async function getState() {
  return currentState;
}
async function setState(updates) {
  currentState = {
    ...currentState,
    ...updates,
    nodeStatuses: updates.nodeStatuses ? { ...updates.nodeStatuses } : currentState.nodeStatuses,
  };
  events.setStateCalls.push(updates);
}
function broadcastDataUpdate(payload) {
  events.broadcasts.push(payload);
}
function getErrorMessage(error) {
  return error?.message || String(error || '');
}
function normalizeAutoStepDelaySeconds() { return 0; }
function getAutoRunPreExecutionDelayMsForNode() { return 0; }
function getAutoRunPreExecutionDelayReasonForNode() { return ''; }
function getStepIdByNodeIdForState(nodeId) { return nodeId === 'fill-profile' ? 5 : null; }
function doesNodeUseBackgroundCompletion() { return false; }
function doesNodeUseCompletionSignal(nodeId) { return nodeId === 'fill-profile'; }
function getNodeCompletionSignalTimeoutMs() { return 150000; }
async function executeNodeViaCompletionSignal() { return { submitted: true }; }
async function executeNode() {}
async function getTabId() { return 77; }
async function waitForTabStableComplete() {}
async function validateStep5PostCompletion() {
  throw new Error('profile post-submit validation failed');
}
async function setNodeStatus(nodeId, status) {
  await setState({
    nodeStatuses: { ...(currentState.nodeStatuses || {}), [nodeId]: status },
    currentNodeId: nodeId,
  });
}
async function sleepWithStop() {}
function throwIfStopped() {}

${extractFunction('clearFailedSignupPhoneReuseActivation')}
${extractFunction('executeNodeAndWait')}

return {
  async run() {
    let thrown = null;
    try {
      await executeNodeAndWait('fill-profile', 0);
    } catch (error) {
      thrown = error;
    }
    return { thrown, events, currentState };
  },
};
`)();

  const { thrown, events, currentState } = await api.run();

  assert.match(thrown?.message || '', /profile post-submit validation failed/);
  assert.equal(thrown.skipFailedSignupPhoneReusePreserve, true);
  assert.equal(thrown.signupProfileSubmitted, true);
  assert.equal(currentState.failedSignupPhoneReuseActivation, null);
  assert.equal(events.setStateCalls.some((updates) => updates.failedSignupPhoneReuseActivation === null), true);
  assert.equal(events.broadcasts.some((payload) => payload.failedSignupPhoneReuseActivation === null), true);
});

test('step 5 post-completion validation accepts phone signup callback error landing', async () => {
  const api = new Function(`
const messages = [];

const chrome = {
  tabs: {
    async get() {
      return { url: 'https://auth.openai.com/oauth/callback?error=server_error' };
    },
  },
};

async function sendToContentScriptResilient(source, message) {
  messages.push({ source, type: message.type, payload: message.payload });
  if (message.type === 'GET_STEP5_SUBMIT_STATE') {
    return {
      retryPage: false,
      retryEnabled: false,
      maxCheckAttemptsBlocked: false,
      userAlreadyExistsBlocked: false,
      successState: 'callback_error_landing',
      profileVisible: false,
      errorText: '',
      unknownAuthPage: false,
      url: 'https://auth.openai.com/oauth/callback?error=server_error',
    };
  }
  throw new Error('unexpected message type: ' + message.type);
}

async function addLog() {}
async function waitForTabStableComplete() {}

${extractFunction('parseUrlSafely')}
${extractFunction('isSignupEntryHost')}
${extractFunction('isLikelyLoggedInChatgptHomeUrl')}
${extractFunction('getStep5SubmitStateFromContent')}
${extractFunction('isStep5PhoneSignupCompletionPayload')}
${extractFunction('recoverStep5SubmitRetryPageOnTab')}
${extractFunction('validateStep5PostCompletion')}

return {
  async run() {
    return validateStep5PostCompletion(99, {
      signupMethod: 'phone',
      accountIdentifierType: 'phone',
      phoneNumber: '+15551234567',
    });
  },
  snapshot() {
    return { messages };
  },
};
`)();

  const result = await api.run();
  assert.equal(result.successState, 'callback_error_landing');
  assert.equal(api.snapshot().messages[0].payload.signupMethod, 'phone');
});

test('step 5 post-completion validation rejects callback error landing without phone signup context', async () => {
  const api = new Function(`
const chrome = {
  tabs: {
    async get() {
      return { url: 'https://auth.openai.com/oauth/callback?error=server_error' };
    },
  },
};

async function sendToContentScriptResilient(_source, message) {
  if (message.type === 'GET_STEP5_SUBMIT_STATE') {
    return {
      retryPage: false,
      retryEnabled: false,
      maxCheckAttemptsBlocked: false,
      userAlreadyExistsBlocked: false,
      successState: 'callback_error_landing',
      profileVisible: false,
      errorText: '',
      unknownAuthPage: false,
      url: 'https://auth.openai.com/oauth/callback?error=server_error',
    };
  }
  throw new Error('unexpected message type: ' + message.type);
}

async function addLog() {}
async function waitForTabStableComplete() {}

${extractFunction('parseUrlSafely')}
${extractFunction('isSignupEntryHost')}
${extractFunction('isLikelyLoggedInChatgptHomeUrl')}
${extractFunction('getStep5SubmitStateFromContent')}
${extractFunction('isStep5PhoneSignupCompletionPayload')}
${extractFunction('recoverStep5SubmitRetryPageOnTab')}
${extractFunction('validateStep5PostCompletion')}

return {
  run() {
    return validateStep5PostCompletion(99, {
      signupMethod: 'email',
      accountIdentifierType: 'email',
    });
  },
};
`)();

  await assert.rejects(
    () => api.run(),
    /不是手机号注册上下文/
  );
});
