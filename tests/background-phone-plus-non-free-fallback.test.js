const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background.js', 'utf8');

const PHONE_PLUS_PAYPAL_NODES = [
  'open-chatgpt',
  'submit-signup-email',
  'fill-password',
  'fetch-signup-code',
  'fill-profile',
  'wait-registration-success',
  'plus-checkout-create',
  'plus-checkout-billing',
  'paypal-approve',
  'plus-checkout-return',
  'oauth-login',
  'fetch-login-code',
  'bind-email',
  'fetch-bind-email-code',
  'confirm-oauth',
  'platform-verify',
];

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

function createApi(initialState, nodeIds = PHONE_PLUS_PAYPAL_NODES) {
  return new Function('initialState', 'nodeIds', `
let state = JSON.parse(JSON.stringify(initialState));
const events = {
  broadcasts: [],
  logs: [],
  messages: [],
  stateUpdates: [],
};
const chrome = {
  runtime: {
    sendMessage(message) {
      events.messages.push(message);
      return Promise.resolve();
    },
  },
};
async function getState() {
  return state;
}
async function setState(updates) {
  events.stateUpdates.push(updates);
  state = { ...state, ...updates };
}
function broadcastDataUpdate(payload) {
  events.broadcasts.push(payload);
}
async function addLog(message, level, options = {}) {
  events.logs.push({ message, level, options });
}
function getNodeIdsForState() {
  return nodeIds;
}
function getFirstUnfinishedNodeId(statuses = {}) {
  for (const nodeId of nodeIds) {
    if (!['completed', 'manual_completed', 'skipped'].includes(statuses[nodeId] || 'pending')) {
      return nodeId;
    }
  }
  return '';
}
${extractFunction('isPhonePlusModeState')}
${extractFunction('getPhonePlusPaymentSegmentNodeIds')}
${extractFunction('buildPhonePlusNonFreeTrialFallbackResetPatch')}
${extractFunction('handlePhonePlusNonFreeTrialFallback')}
return {
  events,
  getState: () => state,
  getPhonePlusPaymentSegmentNodeIds,
  handlePhonePlusNonFreeTrialFallback,
};
`)(initialState, nodeIds);
}

test('Phone Plus non-free fallback skips the Plus segment and keeps current panel target', async () => {
  const api = createApi({
    activeFlowId: 'openai',
    panelMode: 'cpa',
    phonePlusModeEnabled: true,
    nodeStatuses: {
      'open-chatgpt': 'completed',
      'submit-signup-email': 'completed',
      'fill-password': 'completed',
      'fetch-signup-code': 'completed',
      'fill-profile': 'completed',
      'wait-registration-success': 'completed',
      'plus-checkout-create': 'completed',
      'plus-checkout-billing': 'running',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'plus-checkout-billing',
    plusCheckoutTabId: 42,
    plusCheckoutUrl: 'https://chatgpt.com/checkout/openai_ie/cs_test',
    oauthUrl: 'https://old.example/oauth',
    sub2apiSessionId: 'old-sub-session',
    cpaOAuthState: 'old-cpa-state',
    accountIdentifierType: 'phone',
    accountIdentifier: '+15550101',
    signupPhoneNumber: '+15550101',
    password: 'secret',
  });

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    amountLabel: '€19.33',
    nodeId: 'plus-checkout-billing',
  });

  assert.equal(result.handled, true);
  assert.deepStrictEqual(result.skippedNodeIds, [
    'plus-checkout-create',
    'plus-checkout-billing',
    'paypal-approve',
    'plus-checkout-return',
  ]);
  assert.equal(result.nextNodeId, 'oauth-login');

  const nextState = api.getState();
  assert.equal(nextState.panelMode, 'cpa');
  assert.equal(nextState.phonePlusModeEnabled, true);
  assert.equal(nextState.accountIdentifierType, 'phone');
  assert.equal(nextState.signupPhoneNumber, '+15550101');
  assert.equal(nextState.password, 'secret');
  assert.equal(nextState.plusCheckoutTabId, null);
  assert.equal(nextState.oauthUrl, null);
  assert.equal(nextState.sub2apiSessionId, null);
  assert.equal(nextState.cpaOAuthState, null);
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-billing'], 'skipped');
  assert.equal(nextState.nodeStatuses['paypal-approve'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.messages.filter((message) => message.type === 'NODE_STATUS_CHANGED').length, 4);
  assert.equal(api.events.logs.some((entry) => /free auth/.test(entry.message)), true);
});

test('non Phone Plus state is not handled by the fallback', async () => {
  const api = createApi({
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    phonePlusModeEnabled: false,
    plusModeEnabled: true,
    nodeStatuses: {},
  });

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    amountLabel: '€19.33',
    nodeId: 'plus-checkout-billing',
  });

  assert.deepStrictEqual(result, { handled: false, reason: 'not-phone-plus' });
  assert.equal(api.events.stateUpdates.length, 0);
  assert.equal(api.events.messages.length, 0);
});
