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
  'plus-check',
  'oauth-login',
  'fetch-login-code',
  'bind-email',
  'fetch-bind-email-code',
  'confirm-oauth',
  'platform-verify',
];

const PHONE_PLUS_PAYPAL_HOSTED_NODES = [
  'open-chatgpt',
  'submit-signup-email',
  'fill-password',
  'fetch-signup-code',
  'fill-profile',
  'wait-registration-success',
  'plus-checkout-create',
  'paypal-hosted-email',
  'paypal-hosted-card',
  'paypal-hosted-create-account',
  'paypal-hosted-review',
  'plus-check',
  'oauth-login',
  'fetch-login-code',
  'bind-email',
  'fetch-bind-email-code',
  'confirm-oauth',
  'platform-verify',
];

const PLUS_PAYPAL_NODES = [
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
  'post-login-phone-verification',
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
      'plus-check': 'pending',
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
    'plus-check',
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
  assert.equal(nextState.phonePlusFallbackReason, 'plus-checkout-non-free-trial');
  assert.equal(nextState.phonePlusFallbackAmountLabel, '€19.33');
  assert.equal(nextState.phonePlusFallbackDetail, '');
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-billing'], 'skipped');
  assert.equal(nextState.nodeStatuses['paypal-approve'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-check'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.messages.filter((message) => message.type === 'NODE_STATUS_CHANGED').length, 5);
  assert.equal(api.events.logs.some((entry) => /free auth/.test(entry.message)), true);
});

test('Plus state reuses fallback to skip the payment segment', async () => {
  const api = createApi({
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    phonePlusModeEnabled: false,
    plusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusHostedCheckoutIsFinalStep: false,
    nodeStatuses: {
      'wait-registration-success': 'completed',
      'plus-checkout-create': 'pending',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'oauth-login': 'pending',
    },
  }, PLUS_PAYPAL_NODES);

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    amountLabel: '€19.33',
    nodeId: 'plus-checkout-billing',
  });

  assert.equal(result.handled, true);
  const nextState = api.getState();
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-billing'], 'skipped');
  assert.equal(nextState.nodeStatuses['paypal-approve'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.messages.filter((message) => message.type === 'NODE_STATUS_CHANGED').length, 4);
});

test('Phone Plus hosted fallback skips the full hosted payment segment', async () => {
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
      'plus-checkout-create': 'running',
      'paypal-hosted-email': 'pending',
      'paypal-hosted-card': 'pending',
      'paypal-hosted-create-account': 'pending',
      'paypal-hosted-review': 'pending',
      'plus-check': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'plus-checkout-create',
    plusCheckoutTabId: 99,
    plusCheckoutUrl: 'https://pay.openai.com/c/pay/cs_hosted',
  }, PHONE_PLUS_PAYPAL_HOSTED_NODES);

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    amountLabel: '€19.33',
    nodeId: 'plus-checkout-create',
  });

  assert.equal(result.handled, true);
  assert.deepStrictEqual(result.skippedNodeIds, [
    'plus-checkout-create',
    'paypal-hosted-email',
    'paypal-hosted-card',
    'paypal-hosted-create-account',
    'paypal-hosted-review',
    'plus-check',
  ]);
  assert.equal(result.nextNodeId, 'oauth-login');
  assert.equal(api.getState().nodeStatuses['paypal-hosted-review'], 'skipped');
  assert.equal(api.getState().nodeStatuses['plus-check'], 'skipped');
  assert.equal(api.events.messages.filter((message) => message.type === 'NODE_STATUS_CHANGED').length, 6);
});

test('Phone Plus registration non-free fallback skips payment segment with dedicated log', async () => {
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
      'plus-checkout-create': 'pending',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'plus-check': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'wait-registration-success',
    freeStatus: 'unknown',
    accountIdentifierType: 'phone',
    accountIdentifier: '+15550101',
    signupPhoneNumber: '+15550101',
    password: 'secret',
  });

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    reason: 'phone-plus-registration-non-free',
    detail: 'freeStatus=unknown',
    nodeId: 'wait-registration-success',
  });

  assert.equal(result.handled, true);
  assert.equal(result.nextNodeId, 'oauth-login');
  assert.deepStrictEqual(result.skippedNodeIds, [
    'plus-checkout-create',
    'plus-checkout-billing',
    'paypal-approve',
    'plus-checkout-return',
    'plus-check',
  ]);
  const nextState = api.getState();
  assert.equal(nextState.phonePlusFallbackReason, 'phone-plus-registration-non-free');
  assert.equal(nextState.phonePlusFallbackDetail, 'freeStatus=unknown');
  assert.equal(nextState.phonePlusFallbackAmountLabel, '');
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-check'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.logs.some((entry) => /第 6 步账号类型不是 free/.test(entry.message)), true);
  assert.equal(api.events.logs.some((entry) => /今日|today due|Checkout/.test(entry.message)), false);
});

test('Phone Plus registration region mismatch fallback skips payment segment with dedicated log', async () => {
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
      'plus-checkout-create': 'pending',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'plus-check': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'wait-registration-success',
    freeStatus: 'free',
    accountIdentifierType: 'phone',
    accountIdentifier: '+15550101',
    signupPhoneNumber: '+15550101',
    password: 'secret',
  });

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    reason: 'phone-plus-registration-region-mismatch',
    detail: 'freeStatus=free; exitRegion=JP; allowedRegions=US',
    nodeId: 'wait-registration-success',
  });

  assert.equal(result.handled, true);
  assert.equal(result.nextNodeId, 'oauth-login');
  assert.deepStrictEqual(result.skippedNodeIds, [
    'plus-checkout-create',
    'plus-checkout-billing',
    'paypal-approve',
    'plus-checkout-return',
    'plus-check',
  ]);
  const nextState = api.getState();
  assert.equal(nextState.phonePlusFallbackReason, 'phone-plus-registration-region-mismatch');
  assert.equal(nextState.phonePlusFallbackDetail, 'freeStatus=free; exitRegion=JP; allowedRegions=US');
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-check'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.logs.some((entry) => /账号类型是 free/.test(entry.message)), true);
  assert.equal(api.events.logs.some((entry) => /注册出口地区不在 Plus Check 允许地区内/.test(entry.message)), true);
  assert.equal(api.events.logs.some((entry) => /已跳过 Plus 支付段/.test(entry.message)), true);
});

test('Phone Plus proxy failure fallback stores reason detail and logs proxy message', async () => {
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
      'plus-checkout-create': 'running',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'plus-check': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'plus-checkout-create',
    plusCheckoutTabId: 42,
    plusCheckoutUrl: 'https://chatgpt.com/checkout/openai_ie/cs_test',
    oauthUrl: 'https://old.example/oauth',
  });

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    reason: 'plus-checkout-conversion-proxy-failed',
    detail: '未检测到支付转换代理出口 IP。',
    nodeId: 'plus-checkout-create',
  });

  assert.equal(result.handled, true);
  assert.equal(result.reason, 'plus-checkout-conversion-proxy-failed');
  assert.equal(result.nextNodeId, 'oauth-login');
  const nextState = api.getState();
  assert.equal(nextState.phonePlusFallbackReason, 'plus-checkout-conversion-proxy-failed');
  assert.equal(nextState.phonePlusFallbackDetail, '未检测到支付转换代理出口 IP。');
  assert.equal(nextState.phonePlusFallbackAmountLabel, '');
  assert.equal(nextState.plusCheckoutTabId, null);
  assert.equal(nextState.oauthUrl, null);
  assert.equal(nextState.nodeStatuses['plus-checkout-create'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-checkout-return'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-check'], 'skipped');
  assert.equal(api.events.logs.some((entry) => /支付转换代理失败/.test(entry.message)), true);
  assert.equal(api.events.logs.some((entry) => /未检测到支付转换代理出口 IP/.test(entry.message)), true);
});

test('Phone Plus hosted generic error fallback skips payment segment and keeps OAuth tail', async () => {
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
      'paypal-hosted-email': 'completed',
      'paypal-hosted-card': 'running',
      'paypal-hosted-create-account': 'pending',
      'paypal-hosted-review': 'pending',
      'plus-check': 'pending',
      'oauth-login': 'pending',
    },
    currentNodeId: 'paypal-hosted-card',
    plusCheckoutTabId: 99,
    plusCheckoutUrl: 'https://www.paypal.com/checkoutweb/genericError?token=EC-test',
    oauthUrl: 'https://old.example/oauth',
  }, PHONE_PLUS_PAYPAL_HOSTED_NODES);

  const result = await api.handlePhonePlusNonFreeTrialFallback(api.getState(), {
    reason: 'hosted-checkout-generic-error',
    detail: 'Sorry, something went wrong. Please try again.',
    nodeId: 'paypal-hosted-card',
  });

  assert.equal(result.handled, true);
  assert.equal(result.nextNodeId, 'oauth-login');
  assert.deepStrictEqual(result.skippedNodeIds, [
    'plus-checkout-create',
    'paypal-hosted-email',
    'paypal-hosted-card',
    'paypal-hosted-create-account',
    'paypal-hosted-review',
    'plus-check',
  ]);
  const nextState = api.getState();
  assert.equal(nextState.phonePlusFallbackReason, 'hosted-checkout-generic-error');
  assert.equal(nextState.phonePlusFallbackDetail, 'Sorry, something went wrong. Please try again.');
  assert.equal(nextState.plusCheckoutTabId, null);
  assert.equal(nextState.oauthUrl, null);
  assert.equal(nextState.nodeStatuses['paypal-hosted-card'], 'skipped');
  assert.equal(nextState.nodeStatuses['plus-check'], 'skipped');
  assert.equal(nextState.nodeStatuses['oauth-login'], 'pending');
  assert.equal(api.events.logs.some((entry) => /genericError/.test(entry.message)), true);
  assert.equal(api.events.logs.some((entry) => /OAuth/.test(entry.message)), true);
});
