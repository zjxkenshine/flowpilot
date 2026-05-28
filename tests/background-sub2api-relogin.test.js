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

function loadHarness() {
  return new Function(`
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const SIGNUP_METHOD_PHONE = 'phone';
function isPlainObjectValue(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
${extractFunction('parseSub2ApiReloginAccountPoolEntries')}
${extractFunction('normalizeSub2ApiReloginAccountPoolUsage')}
${extractFunction('normalizeSub2ApiReloginCurrentAccount')}
${extractFunction('isSub2ApiReloginState')}
${extractFunction('pickSub2ApiReloginAccount')}
${extractFunction('buildSub2ApiReloginRuntimePatch')}
return {
  parseSub2ApiReloginAccountPoolEntries,
  normalizeSub2ApiReloginAccountPoolUsage,
  normalizeSub2ApiReloginCurrentAccount,
  isSub2ApiReloginState,
  pickSub2ApiReloginAccount,
  buildSub2ApiReloginRuntimePatch,
};
`)();
}

test('SUB2API relogin pool parser keeps first enabled unused account', () => {
  const api = loadHarness();
  const state = {
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    sub2apiReloginEnabled: true,
    sub2apiReloginAccountPoolText: [
      '+111----first-pass----first@example.com',
      '+222----pa----ss----second@example.com',
      'bad-row',
      '+333----third-pass----third@example.com',
    ].join('\n'),
    sub2apiReloginAccountPoolUsage: {
      '+111----first-pass----first@example.com': { usedAt: 123 },
      '+222----pa----ss----second@example.com': { enabled: false },
    },
  };

  const entries = api.parseSub2ApiReloginAccountPoolEntries(state.sub2apiReloginAccountPoolText);
  assert.deepEqual(entries.map((entry) => [entry.phone, entry.password, entry.email]), [
    ['+111', 'first-pass', 'first@example.com'],
    ['+222', 'pa----ss', 'second@example.com'],
    ['+333', 'third-pass', 'third@example.com'],
  ]);
  assert.equal(api.isSub2ApiReloginState(state), true);
  assert.deepEqual(api.pickSub2ApiReloginAccount(state), entries[2]);
});

test('SUB2API relogin runtime patch writes phone/password/email and disables proxy state', () => {
  const api = loadHarness();
  const patch = api.buildSub2ApiReloginRuntimePatch({
    key: '+447780579093----secret----mail@example.com',
    phone: '+447780579093',
    password: 'secret',
    email: 'mail@example.com',
  });

  assert.equal(patch.activeFlowId, 'openai');
  assert.equal(patch.panelMode, 'sub2api');
  assert.equal(patch.openaiIntegrationTargetId, 'sub2api');
  assert.equal(patch.plusModeEnabled, false);
  assert.equal(patch.phonePlusModeEnabled, false);
  assert.equal(patch.signupMethod, 'phone');
  assert.equal(patch.resolvedSignupMethod, 'phone');
  assert.equal(patch.phoneVerificationEnabled, false);
  assert.equal(patch.accountIdentifierType, 'phone');
  assert.equal(patch.accountIdentifier, '+447780579093');
  assert.equal(patch.signupPhoneNumber, '+447780579093');
  assert.equal(patch.password, 'secret');
  assert.equal(patch.customPassword, 'secret');
  assert.equal(patch.email, 'mail@example.com');
  assert.equal(patch.step8VerificationTargetEmail, 'mail@example.com');
  assert.equal(patch.registrationEmailState.current, 'mail@example.com');
  assert.equal(patch.registrationEmailState.source, 'sub2api_relogin');
  assert.equal(patch.sub2apiDefaultProxyName, '');
  assert.equal(patch.sub2apiProxyId, null);
  assert.deepEqual(patch.sub2apiReloginCurrentAccount, {
    key: '+447780579093----secret----mail@example.com',
    phone: '+447780579093',
    password: 'secret',
    email: 'mail@example.com',
  });
});

test('background source marks SUB2API relogin success used only at platform verify and records failures', () => {
  assert.match(backgroundSource, /prepareSub2ApiReloginRunIfNeeded\(normalizedNodeId, state\)/);
  assert.match(backgroundSource, /ipProxyEnabled:\s*false/);
  assert.match(backgroundSource, /sub2apiDefaultProxyName:\s*''/);
  assert.match(backgroundSource, /applyIpProxySettingsFromState\(\{[\s\S]*ipProxyEnabled:\s*false/);
  assert.match(backgroundSource, /if \(ok && normalizedNodeId !== 'platform-verify'\) \{\s*return;\s*\}/);
  assert.match(backgroundSource, /lastError:\s*getErrorMessage\(error\)/);
  assert.match(backgroundSource, /usedAt:\s*now/);
});
