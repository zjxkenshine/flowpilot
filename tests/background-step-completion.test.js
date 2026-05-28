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

function createApi(events, lastNodeId = 'platform-verify', options = {}) {
  return new Function('events', 'lastNodeId', 'options', `
let stopRequested = false;
const LOG_PREFIX = '[test]';
const STOP_ERROR_MESSAGE = '流程已被用户停止。';
const state = {
  nodeStatuses: {},
  accountContributionEnabled: true,
  ipProxyAppliedExitIp: '203.0.113.8',
  ipProxyAppliedExitRegion: 'JP',
  ...(options.state || {}),
};
function getErrorMessage(error) {
  return error?.message || String(error || '');
}
async function getState() {
  events.push({ type: 'getState' });
  return { ...state };
}
function getLastNodeIdForState() {
  return lastNodeId;
}
function getNodeIdsForState() {
  return Array.isArray(options.nodeIds) ? options.nodeIds.slice() : [];
}
async function setState(updates) {
  Object.assign(state, updates || {});
  events.push({ type: 'set-state', updates });
}
function broadcastDataUpdate(payload) {
  events.push({ type: 'broadcast', payload });
}
async function setNodeStatus(nodeId, status) {
  events.push({ type: 'status', nodeId, status });
}
async function addLog(message, level, options = {}) {
  events.push({ type: 'log', message, level, options });
}
async function appendManualAccountRunRecordIfNeeded() {
  events.push({ type: 'manual-record' });
}
function notifyNodeError(nodeId, error) {
  events.push({ type: 'error', nodeId, error });
}
function notifyNodeComplete(nodeId, payload) {
  events.push({ type: 'notify', nodeId, payload });
}
async function handleNodeData(nodeId, payload) {
  events.push({ type: 'handle-start', nodeId, payload });
  if (nodeId === 'wait-registration-success' && payload && Object.prototype.hasOwnProperty.call(payload, 'freeStatus')) {
    state.freeStatus = payload.freeStatus;
    state.freeStatusDetection = payload.freeStatusDetection || null;
  }
  await new Promise((resolve) => setTimeout(resolve, 25));
  events.push({ type: 'handle-done', nodeId });
}
async function appendAndBroadcastAccountRunRecord(status, state) {
  events.push({ type: 'record', status, state });
}
async function upsertAndBroadcastAccountBookEntry(stage, state) {
  events.push({ type: 'account-book', stage, state });
}
async function handlePhonePlusNonFreeTrialFallback(state, context) {
  events.push({ type: 'fallback', state, context });
  return { handled: true, nextNodeId: 'oauth-login', skippedNodeIds: ['plus-checkout-create'] };
}
${extractFunction('runCompletedNodeSideEffects')}
${extractFunction('reportCompletedNodeSideEffectError')}
${extractFunction('completeNodeFromBackground')}
return { completeNodeFromBackground };
`)(events, lastNodeId, options);
}

test('completeNodeFromBackground releases final node before slow post-completion side effects', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify');

  await api.completeNodeFromBackground('platform-verify', { localhostUrl: 'http://localhost:1455/auth/callback?code=ok' });

  const types = events.map((event) => event.type);
  assert.equal(types.indexOf('notify') < types.indexOf('handle-start'), true);
  assert.equal(types.includes('handle-done'), false);
  assert.equal(types.includes('record'), false);

  await new Promise((resolve) => setTimeout(resolve, 40));

  const settledTypes = events.map((event) => event.type);
  assert.equal(settledTypes.includes('handle-done'), true);
  assert.equal(settledTypes.includes('record'), true);
});

test('completeNodeFromBackground keeps non-final node data handling before completion signal', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify');

  await api.completeNodeFromBackground('confirm-oauth', { localhostUrl: 'http://localhost:1455/auth/callback?code=ok' });

  const types = events.map((event) => event.type);
  assert.equal(types.indexOf('handle-done') < types.indexOf('notify'), true);
  assert.equal(types.includes('record'), false);
});

test('completeNodeFromBackground writes registration-success account book entry for step 6 success hook', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify');

  await api.completeNodeFromBackground('wait-registration-success', {
    nodeId: 'wait-registration-success',
    freeStatus: 'free',
    freeStatusDetection: { freeStatus: 'free', reason: 'free_trial_action_visible' },
  });

  const accountBookEvent = events.find((event) => event.type === 'account-book');
  assert.deepStrictEqual(accountBookEvent, {
    type: 'account-book',
    stage: 'registration_success',
    state: {
      nodeStatuses: {},
      accountContributionEnabled: true,
      ipProxyAppliedExitIp: '203.0.113.8',
      ipProxyAppliedExitRegion: 'JP',
      freeStatus: 'free',
      freeStatusDetection: { freeStatus: 'free', reason: 'free_trial_action_visible' },
    },
  });
});

test('completeNodeFromBackground keeps Phone Plus payment after non-free registration status', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify', {
    state: {
      phonePlusModeEnabled: true,
      currentNodeId: 'wait-registration-success',
    },
    nodeIds: [
      'open-chatgpt',
      'wait-registration-success',
      'plus-checkout-create',
      'paypal-hosted-email',
      'oauth-login',
      'platform-verify',
    ],
  });

  await api.completeNodeFromBackground('wait-registration-success', {
    nodeId: 'wait-registration-success',
    freeStatus: 'unknown',
    freeStatusDetection: { freeStatus: 'unknown', reason: 'subscription_action_missing' },
  });

  const accountBookIndex = events.findIndex((event) => event.type === 'account-book');
  assert.ok(accountBookIndex >= 0);
  assert.equal(events[accountBookIndex].state.freeStatus, 'unknown');
  assert.equal(events.some((event) => event.type === 'fallback'), false);
});

test('completeNodeFromBackground keeps Phone Plus payment after free registration status', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify', {
    state: {
      phonePlusModeEnabled: true,
      currentNodeId: 'wait-registration-success',
    },
    nodeIds: [
      'open-chatgpt',
      'wait-registration-success',
      'plus-checkout-create',
      'oauth-login',
      'platform-verify',
    ],
  });

  await api.completeNodeFromBackground('wait-registration-success', {
    nodeId: 'wait-registration-success',
    freeStatus: 'free',
    freeStatusDetection: { freeStatus: 'free', reason: 'free_trial_action_visible' },
  });

  assert.ok(events.some((event) => event.type === 'account-book' && event.state.freeStatus === 'free'));
  assert.equal(events.some((event) => event.type === 'fallback'), false);
});

test('completeNodeFromBackground writes flow-completed account book entry for final node', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify');

  await api.completeNodeFromBackground('platform-verify', { nodeId: 'platform-verify' });
  await new Promise((resolve) => setTimeout(resolve, 40));

  assert.ok(events.some((event) => event.type === 'account-book' && event.stage === 'flow_completed'));
});

test('completeNodeFromBackground marks Phone Plus payment completion as plus before OAuth tail', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify', {
    state: {
      phonePlusModeEnabled: true,
      freeStatus: 'free',
    },
    nodeIds: [
      'open-chatgpt',
      'wait-registration-success',
      'paypal-hosted-review',
      'oauth-login',
      'platform-verify',
    ],
  });

  await api.completeNodeFromBackground('paypal-hosted-review', { nodeId: 'paypal-hosted-review' });

  const statusUpdate = events.find((event) => event.type === 'set-state' && event.updates?.freeStatus === 'plus');
  assert.deepStrictEqual(statusUpdate?.updates, {
    freeStatus: 'plus',
    freeStatusDetection: {
      freeStatus: 'plus',
      reason: 'phone_plus_payment_completed',
      nodeId: 'paypal-hosted-review',
    },
  });
  assert.ok(events.some((event) => event.type === 'broadcast' && event.payload?.freeStatus === 'plus'));
  assert.ok(events.some((event) => (
    event.type === 'account-book'
    && event.stage === 'registration_success'
    && event.state.freeStatus === 'plus'
  )));
});

test('completeNodeFromBackground skips Plus marking when hosted checkout verification failed', async () => {
  const events = [];
  const api = createApi(events, 'platform-verify', {
    state: {
      phonePlusModeEnabled: true,
      freeStatus: 'free',
    },
    nodeIds: [
      'open-chatgpt',
      'wait-registration-success',
      'paypal-hosted-review',
      'oauth-login',
      'platform-verify',
    ],
  });

  await api.completeNodeFromBackground('paypal-hosted-review', {
    nodeId: 'paypal-hosted-review',
    plusHostedCheckoutVerified: false,
    plusHostedCheckoutVerificationFailed: true,
  });

  assert.equal(events.some((event) => event.type === 'set-state' && event.updates?.freeStatus === 'plus'), false);
  assert.equal(events.some((event) => event.type === 'broadcast' && event.payload?.freeStatus === 'plus'), false);
  assert.equal(events.some((event) => event.type === 'account-book' && event.stage === 'registration_success' && event.state.freeStatus === 'plus'), false);
});

test('completeNodeFromBackground does not mark plus for non-terminal or non-phone-plus nodes', async () => {
  const intermediateEvents = [];
  const intermediateApi = createApi(intermediateEvents, 'platform-verify', {
    state: {
      phonePlusModeEnabled: true,
      freeStatus: 'free',
    },
    nodeIds: [
      'open-chatgpt',
      'wait-registration-success',
      'plus-checkout-create',
      'paypal-hosted-review',
      'oauth-login',
      'platform-verify',
    ],
  });

  await intermediateApi.completeNodeFromBackground('plus-checkout-create', { nodeId: 'plus-checkout-create' });
  assert.equal(intermediateEvents.some((event) => event.type === 'set-state' && event.updates?.freeStatus === 'plus'), false);

  const plusModeEvents = [];
  const plusModeApi = createApi(plusModeEvents, 'platform-verify', {
    state: {
      plusModeEnabled: true,
      phonePlusModeEnabled: false,
      freeStatus: 'free',
    },
    nodeIds: [
      'open-chatgpt',
      'paypal-hosted-review',
      'oauth-login',
      'platform-verify',
    ],
  });

  await plusModeApi.completeNodeFromBackground('paypal-hosted-review', { nodeId: 'paypal-hosted-review' });
  assert.equal(plusModeEvents.some((event) => event.type === 'set-state' && event.updates?.freeStatus === 'plus'), false);
});
