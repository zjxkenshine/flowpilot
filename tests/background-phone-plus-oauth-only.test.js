const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const backgroundSource = fs.readFileSync('background.js', 'utf8');

function extractFunction(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers
    .map((marker) => backgroundSource.indexOf(marker))
    .find((index) => index >= 0);
  if (start < 0) {
    throw new Error(`missing function ${name}`);
  }

  let parenDepth = 0;
  let signatureEnded = false;
  let braceStart = -1;
  for (let i = start; i < backgroundSource.length; i += 1) {
    const ch = backgroundSource[i];
    if (ch === '(') parenDepth += 1;
    if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) signatureEnded = true;
    }
    if (ch === '{' && signatureEnded) {
      braceStart = i;
      break;
    }
  }
  if (braceStart < 0) {
    throw new Error(`missing body for function ${name}`);
  }

  let depth = 0;
  let end = braceStart;
  for (; end < backgroundSource.length; end += 1) {
    const ch = backgroundSource[end];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }
  return backgroundSource.slice(start, end);
}

function loadHarness(extra = '', extraReturn = '') {
  return new Function(`
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
function getErrorMessage(error) {
  return String(error?.message || error || '').trim();
}
function isPlainObjectValue(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
${extractFunction('isPhonePlusOauthOnlyModeState')}
${extractFunction('normalizePhonePlusOauthOnlyAccountBookEntries')}
${extractFunction('normalizePhonePlusOauthOnlyAccountUsage')}
${extractFunction('normalizePhonePlusOauthOnlyCurrentAccount')}
${extractFunction('isPhonePlusOauthOnlyState')}
${extractFunction('pickPhonePlusOauthOnlyAccount')}
${extractFunction('buildPhonePlusOauthOnlyRuntimePatch')}
${extra}
return {
  isPhonePlusOauthOnlyState,
  normalizePhonePlusOauthOnlyAccountBookEntries,
  normalizePhonePlusOauthOnlyAccountUsage,
  normalizePhonePlusOauthOnlyCurrentAccount,
  pickPhonePlusOauthOnlyAccount,
  buildPhonePlusOauthOnlyRuntimePatch,
  ${extraReturn}
  ...(typeof updatePhonePlusOauthOnlyAccountUsageForNodeResult === 'function'
    ? { updatePhonePlusOauthOnlyAccountUsageForNodeResult }
    : {}),
  ...(typeof preparePhonePlusOauthOnlyRunIfNeeded === 'function'
    ? { preparePhonePlusOauthOnlyRunIfNeeded }
    : {}),
};
`)();
}

test('Phone Plus OAuth-only account picker selects first unused registration_success phone password account', () => {
  const api = loadHarness();
  const state = {
    activeFlowId: 'openai',
    phonePlusModeEnabled: true,
    phonePlusOauthOnlyModeEnabled: true,
    accountBookEntries: [
      {
        recordId: 'flow@example.com',
        email: 'flow@example.com',
        phoneNumber: '+660000',
        password: 'done',
        captureStage: 'flow_completed',
      },
      {
        recordId: 'phone:+661111',
        email: '',
        phoneNumber: '+661111',
        password: 'used',
        captureStage: 'registration_success',
      },
      {
        recordId: 'phone:+662222',
        email: 'next@example.com',
        phoneNumber: '+662222',
        password: 'secret',
        captureStage: 'registration_success',
      },
      {
        recordId: 'phone:+663333',
        phoneNumber: '+663333',
        password: '',
        captureStage: 'registration_success',
      },
    ],
    phonePlusOauthOnlyAccountUsage: {
      'phone:+661111': { usedAt: 123 },
    },
  };

  assert.equal(api.isPhonePlusOauthOnlyState(state), true);
  assert.deepEqual(api.normalizePhonePlusOauthOnlyAccountBookEntries(state.accountBookEntries).map((entry) => entry.key), [
    'phone:+661111',
    'phone:+662222',
  ]);
  assert.deepEqual(api.pickPhonePlusOauthOnlyAccount(state), {
    key: 'phone:+662222',
    recordId: 'phone:+662222',
    phoneNumber: '+662222',
    password: 'secret',
    email: 'next@example.com',
  });
});

test('Phone Plus OAuth-only runtime patch writes phone login identity and disables registration-only modes', () => {
  const api = loadHarness();
  const patch = api.buildPhonePlusOauthOnlyRuntimePatch({
    key: 'phone:+662222',
    recordId: 'phone:+662222',
    phoneNumber: '+662222',
    password: 'secret',
    email: 'next@example.com',
  });

  assert.equal(patch.activeFlowId, 'openai');
  assert.equal(patch.plusModeEnabled, false);
  assert.equal(patch.phonePlusModeEnabled, true);
  assert.equal(patch.phonePlusOauthOnlyModeEnabled, true);
  assert.equal(patch.plusAccountAccessStrategy, 'oauth');
  assert.equal(patch.signupMethod, 'phone');
  assert.equal(patch.resolvedSignupMethod, 'phone');
  assert.equal(patch.phoneVerificationEnabled, true);
  assert.equal(patch.registrationOnlyModeEnabled, false);
  assert.equal(patch.registrationActivationOnlyModeEnabled, false);
  assert.equal(patch.accountIdentifierType, 'phone');
  assert.equal(patch.accountIdentifier, '+662222');
  assert.equal(patch.signupPhoneNumber, '+662222');
  assert.equal(patch.password, 'secret');
  assert.equal(patch.customPassword, 'secret');
  assert.equal(patch.email, 'next@example.com');
  assert.equal(patch.registrationEmailState.source, 'phone_plus_oauth_only');
  assert.deepEqual(patch.phonePlusOauthOnlyCurrentAccount, {
    key: 'phone:+662222',
    recordId: 'phone:+662222',
    phoneNumber: '+662222',
    password: 'secret',
    email: 'next@example.com',
  });
});

test('Phone Plus OAuth-only usage marks used only at platform verify and records failures without usedAt', async () => {
  const initialState = {
    activeFlowId: 'openai',
    phonePlusModeEnabled: true,
    phonePlusOauthOnlyModeEnabled: true,
    accountBookEntries: [
      {
        recordId: 'phone:+662222',
        phoneNumber: '+662222',
        password: 'secret',
        email: 'next@example.com',
        captureStage: 'registration_success',
      },
    ],
    phonePlusOauthOnlyCurrentAccount: {
      key: 'phone:+662222',
      recordId: 'phone:+662222',
      phoneNumber: '+662222',
      password: 'secret',
      email: 'next@example.com',
    },
    phonePlusOauthOnlyAccountUsage: {
      'phone:+662222': {
        enabled: true,
        usedAt: 0,
        lastAttemptAt: 100,
        lastError: '',
        failureCount: 0,
      },
    },
  };
  const realDateNow = Date.now;
  Date.now = () => 5000;
  const api = loadHarness(`
let state = ${JSON.stringify(initialState)};
const persistentWrites = [];
const stateWrites = [];
const broadcasts = [];
async function getState() { return state; }
async function setPersistentSettings(payload) {
  persistentWrites.push(payload);
}
async function setState(payload) {
  state = { ...state, ...payload };
  stateWrites.push(payload);
}
function broadcastDataUpdate(payload) {
  broadcasts.push(payload);
}
${extractFunction('updatePhonePlusOauthOnlyAccountUsageForNodeResult')}
`, `
  getHarnessState: () => state,
  persistentWrites,
  stateWrites,
  broadcasts,
`);

  try {
    await api.updatePhonePlusOauthOnlyAccountUsageForNodeResult('oauth-login', false, new Error('bad login'));
    let state = api.getHarnessState();
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].usedAt, 0);
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].failureCount, 1);
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].lastError, 'bad login');

    await api.updatePhonePlusOauthOnlyAccountUsageForNodeResult('platform-verify', true);
    state = api.getHarnessState();
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].usedAt, 5000);
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].failureCount, 1);
    assert.equal(state.phonePlusOauthOnlyAccountUsage['phone:+662222'].lastError, '');
    assert.equal(api.persistentWrites.length, 2);
    assert.equal(api.stateWrites.length, 2);
    assert.equal(api.broadcasts.length, 2);
  } finally {
    Date.now = realDateNow;
  }
});

test('Phone Plus OAuth-only prepare throws clear error when account book is exhausted', async () => {
  const api = loadHarness(`
${extractFunction('preparePhonePlusOauthOnlyRunIfNeeded')}
`);
  await assert.rejects(
    () => api.preparePhonePlusOauthOnlyRunIfNeeded('oauth-login', {
      activeFlowId: 'openai',
      phonePlusModeEnabled: true,
      phonePlusOauthOnlyModeEnabled: true,
      accountBookEntries: [
        {
          recordId: 'phone:+661111',
          phoneNumber: '+661111',
          password: 'secret',
          captureStage: 'registration_success',
        },
      ],
      phonePlusOauthOnlyAccountUsage: {
        'phone:+661111': { usedAt: 123 },
      },
    }),
    /账号簿已无可用 Phone Plus 仅 OAuth 账号。/
  );
});

test('Phone Plus OAuth-only source mentions exhausted account-book error', () => {
  assert.match(backgroundSource, /账号簿已无可用 Phone Plus 仅 OAuth 账号。/);
  assert.match(backgroundSource, /preparePhonePlusOauthOnlyRunIfNeeded\(normalizedNodeId, state\)/);
  assert.match(backgroundSource, /updatePhonePlusOauthOnlyAccountUsageForNodeResult\(normalizedNodeId, true\)/);
  assert.match(backgroundSource, /updatePhonePlusOauthOnlyAccountUsageForNodeResult\(normalizedNodeId, false, err\)/);
});
