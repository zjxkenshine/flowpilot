const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('background imports message router module', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  assert.match(source, /background\/message-router\.js/);
});

test('background defaults enable free phone reuse switches', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  const defaultsStart = source.indexOf('const PERSISTED_SETTING_DEFAULTS = {');
  const defaultsEnd = source.indexOf('const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);');
  const defaultsBlock = source.slice(defaultsStart, defaultsEnd);

  assert.match(defaultsBlock, /freePhoneReuseEnabled:\s*true/);
  assert.match(defaultsBlock, /freePhoneReuseAutoEnabled:\s*true/);
  assert.match(defaultsBlock, /phoneSmsReuseEnabled:\s*DEFAULT_HERO_SMS_REUSE_ENABLED/);
  assert.match(defaultsBlock, /ipProxyAutoRefreshPoolOnExhausted:\s*false/);
});

test('background free reusable phone setter does not depend on module-scoped phone flow constants', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  const setterStart = source.indexOf('async function setFreeReusablePhoneActivation');
  const setterEnd = source.indexOf('// ============================================================\n// Tab Registry', setterStart);
  const setterBlock = source.slice(setterStart, setterEnd);

  assert.ok(setterStart >= 0, 'expected setFreeReusablePhoneActivation to exist');
  assert.doesNotMatch(setterBlock, /DEFAULT_PHONE_NUMBER_MAX_USES/);
  assert.match(setterBlock, /maxUses:\s*Math\.max\(1,\s*Math\.floor\(Number\(record\.maxUses\)\s*\|\|\s*3\)\)/);
});

test('background free reusable phone setter can recover local HeroSMS activation id by phone number', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  const setterStart = source.indexOf('async function setFreeReusablePhoneActivation');
  const setterEnd = source.indexOf('// ============================================================\n// Tab Registry', setterStart);
  const setterBlock = source.slice(setterStart, setterEnd);

  assert.match(source, /function findLocalHeroSmsActivationForPhone\(/);
  assert.match(source, /state\.currentPhoneActivation/);
  assert.match(source, /state\.reusablePhoneActivation/);
  assert.match(source, /state\.signupPhoneActivation/);
  assert.match(source, /state\.signupPhoneCompletedActivation/);
  assert.match(source, /state\.phonePreferredActivation/);
  assert.match(source, /state\.phoneReusableActivationPool/);
  assert.match(setterBlock, /findLocalHeroSmsActivationForPhone\(state,\s*phoneNumber\)/);
  assert.match(setterBlock, /activationId = String\(\s*record\.activationId[\s\S]*localActivation\?\.activationId/);
  assert.match(setterBlock, /manualOnly:\s*!activationId/);
});

test('background blocks free reusable phone mutations while phone signup owns the identity', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  const clearStart = source.indexOf('async function clearFreeReusablePhoneActivation');
  const setterStart = source.indexOf('async function setFreeReusablePhoneActivation');
  const setterEnd = source.indexOf('// ============================================================\n// Tab Registry', setterStart);
  const clearBlock = source.slice(clearStart, setterStart);
  const setterBlock = source.slice(setterStart, setterEnd);

  assert.match(source, /function isPhoneSignupIdentityStateForReuse\(/);
  assert.match(source, /function hasSignupPhoneActivationState\(/);
  assert.match(clearBlock, /isPhoneSignupIdentityStateForReuse\(state\)/);
  assert.match(setterBlock, /isPhoneSignupIdentityStateForReuse\(state\)/);
});

test('background HeroSMS phone prefix inference covers built-in major countries', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  const supportedStart = source.indexOf('const HERO_SMS_SUPPORTED_COUNTRY_IDS = [');
  const prefixStart = source.indexOf('const HERO_SMS_COUNTRY_BY_PHONE_PREFIX = Object.freeze([');
  const prefixEnd = source.indexOf(']);', prefixStart);
  const supportedBlock = source.slice(supportedStart, source.indexOf('];', supportedStart));
  const prefixBlock = source.slice(prefixStart, prefixEnd);

  assert.match(supportedBlock, /\[6,\s*52,\s*187,\s*16,\s*151,\s*43,\s*73,\s*10/);
  [
    ['84', 10, 'Vietnam'],
    ['66', 52, 'Thailand'],
    ['62', 6, 'Indonesia'],
    ['44', 16, 'United Kingdom'],
    ['81', 151, 'Japan'],
    ['49', 43, 'Germany'],
    ['33', 73, 'France'],
    ['1', 187, 'USA'],
  ].forEach(([prefix, id, label]) => {
    assert.match(prefixBlock, new RegExp(`prefix:\\s*'${prefix}'[\\s\\S]*id:\\s*${id}[\\s\\S]*label:\\s*'${label}'`));
  });
});

test('message router module exposes a factory', () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = {};

  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);

  assert.equal(typeof api?.createMessageRouter, 'function');
});

test('SAVE_SETTING broadcasts free phone reuse setting updates for realtime sidepanel sync', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  let state = {
    freePhoneReuseEnabled: false,
    freePhoneReuseAutoEnabled: false,
    plusModeEnabled: false,
    plusPaymentMethod: 'paypal',
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => {
      const updates = {};
      if (Object.prototype.hasOwnProperty.call(input, 'freePhoneReuseEnabled')) {
        updates.freePhoneReuseEnabled = Boolean(input.freePhoneReuseEnabled);
      }
      if (Object.prototype.hasOwnProperty.call(input, 'freePhoneReuseAutoEnabled')) {
        updates.freePhoneReuseAutoEnabled = Boolean(input.freePhoneReuseAutoEnabled);
      }
      return updates;
    },
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    getState: async () => ({ ...state }),
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      freePhoneReuseEnabled: true,
      freePhoneReuseAutoEnabled: true,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.freePhoneReuseEnabled, true);
  assert.equal(state.freePhoneReuseAutoEnabled, true);
  assert.ok(
    broadcasts.some((payload) => (
      payload.freePhoneReuseEnabled === true
      && payload.freePhoneReuseAutoEnabled === true
    )),
    'expected SAVE_SETTING to broadcast free reuse switch updates'
  );
});

test('handleStepData stores step 6 free status for account book capture', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let state = {};

  const router = api.createMessageRouter({
    addLog: async () => {},
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    getStepDefinitionForState: (step) => (Number(step) === 6 ? { key: 'wait-registration-success' } : null),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  await router.handleStepData(6, {
    freeStatus: 'paid',
    freeStatusDetection: { freeStatus: 'paid', reason: 'paid_upgrade_action_visible' },
  });

  assert.deepStrictEqual(state, {
    freeStatus: 'paid',
    freeStatusDetection: { freeStatus: 'paid', reason: 'paid_upgrade_action_visible' },
  });

  await router.handleStepData(6, {
    freeStatus: 'unexpected',
  });

  assert.equal(state.freeStatus, 'unknown');
  assert.equal(state.freeStatusDetection, null);
});

test('SAVE_SETTING preserves phone reuse preferences while phone signup is selected', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const persistedPayloads = [];
  let state = {
    signupMethod: 'phone',
    phoneVerificationEnabled: true,
    plusModeEnabled: false,
    phoneSmsReuseEnabled: true,
    heroSmsReuseEnabled: true,
    freePhoneReuseEnabled: true,
    freePhoneReuseAutoEnabled: true,
    phonePreferredActivation: {
      provider: 'hero-sms',
      activationId: 'stored',
      phoneNumber: '66950001111',
    },
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => ({
      signupMethod: String(input.signupMethod || state.signupMethod),
      phoneSmsReuseEnabled: Boolean(input.phoneSmsReuseEnabled),
      heroSmsReuseEnabled: Boolean(input.heroSmsReuseEnabled),
      freePhoneReuseEnabled: Boolean(input.freePhoneReuseEnabled),
      freePhoneReuseAutoEnabled: Boolean(input.freePhoneReuseAutoEnabled),
      phonePreferredActivation: input.phonePreferredActivation ?? null,
    }),
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    setPersistentSettings: async (updates) => {
      persistedPayloads.push({ ...updates });
      return { ...updates };
    },
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      signupMethod: 'phone',
      phoneSmsReuseEnabled: false,
      heroSmsReuseEnabled: false,
      freePhoneReuseEnabled: false,
      freePhoneReuseAutoEnabled: false,
      phonePreferredActivation: null,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.phoneSmsReuseEnabled, true);
  assert.equal(state.heroSmsReuseEnabled, true);
  assert.equal(state.freePhoneReuseEnabled, true);
  assert.equal(state.freePhoneReuseAutoEnabled, true);
  assert.deepStrictEqual(state.phonePreferredActivation, {
    provider: 'hero-sms',
    activationId: 'stored',
    phoneNumber: '66950001111',
  });
  assert.equal(persistedPayloads[0].phoneSmsReuseEnabled, true);
  assert.equal(persistedPayloads[0].freePhoneReuseEnabled, true);
});

test('SAVE_SETTING allows phone reuse preferences after switching back to email signup', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let state = {
    signupMethod: 'phone',
    phoneVerificationEnabled: true,
    plusModeEnabled: false,
    phoneSmsReuseEnabled: true,
    heroSmsReuseEnabled: true,
    freePhoneReuseEnabled: true,
    freePhoneReuseAutoEnabled: true,
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => ({
      signupMethod: String(input.signupMethod || state.signupMethod),
      phoneSmsReuseEnabled: Boolean(input.phoneSmsReuseEnabled),
      heroSmsReuseEnabled: Boolean(input.heroSmsReuseEnabled),
      freePhoneReuseEnabled: Boolean(input.freePhoneReuseEnabled),
      freePhoneReuseAutoEnabled: Boolean(input.freePhoneReuseAutoEnabled),
    }),
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      signupMethod: 'email',
      phoneSmsReuseEnabled: false,
      heroSmsReuseEnabled: false,
      freePhoneReuseEnabled: false,
      freePhoneReuseAutoEnabled: false,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.signupMethod, 'email');
  assert.equal(state.phoneSmsReuseEnabled, false);
  assert.equal(state.heroSmsReuseEnabled, false);
  assert.equal(state.freePhoneReuseEnabled, false);
  assert.equal(state.freePhoneReuseAutoEnabled, false);
});

test('SAVE_SETTING broadcasts operation delay setting without background success log', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  const logs = [];
  let state = { operationDelayEnabled: true, plusModeEnabled: false, plusPaymentMethod: 'paypal' };

  const router = api.createMessageRouter({
    addLog: async (message, level = 'info') => logs.push({ message, level }),
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => Object.prototype.hasOwnProperty.call(input, 'operationDelayEnabled')
      ? { operationDelayEnabled: true }
      : {},
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    getState: async () => ({ ...state }),
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => { state = { ...state, ...updates }; },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { operationDelayEnabled: false },
  });

  assert.equal(response.ok, true);
  assert.equal(state.operationDelayEnabled, true);
  assert.deepStrictEqual(broadcasts.at(-1), { operationDelayEnabled: true });
  assert.equal(logs.length, 0);
});

test('SAVE_SETTING rebuilds Plus node statuses when the account access strategy changes', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  let state = {
    plusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusAccountAccessStrategy: 'oauth',
    oauthUrl: 'https://oauth.example/current',
    localhostUrl: 'http://localhost:38080/callback',
    oauthFlowDeadlineAt: Date.now() + 60000,
    oauthFlowDeadlineSourceUrl: 'https://oauth.example/current',
    cpaOAuthState: 'cpa-state',
    cpaManagementOrigin: 'https://cpa.example.com',
    sub2apiSessionId: 'sub-session',
    sub2apiOAuthState: 'sub-oauth-state',
    sub2apiGroupId: 'group-id',
    sub2apiGroupIds: ['group-id'],
    sub2apiDraftName: 'draft-name',
    sub2apiProxyId: 'proxy-id',
    codex2apiSessionId: 'codex-session',
    codex2apiOAuthState: 'codex-oauth-state',
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: 'gopay-req',
    plusManualConfirmationStep: 9,
    plusManualConfirmationMethod: 'gopay',
    plusManualConfirmationTitle: 'GoPay 订阅确认',
    plusManualConfirmationMessage: '完成后继续 OAuth 登录。',
    currentNodeId: 'confirm-oauth',
    nodeStatuses: {
      'open-chatgpt': 'completed',
      'plus-checkout-create': 'completed',
      'plus-checkout-billing': 'completed',
      'paypal-approve': 'completed',
      'plus-checkout-return': 'completed',
      'oauth-login': 'completed',
      'fetch-login-code': 'completed',
      'post-login-phone-verification': 'completed',
      'confirm-oauth': 'running',
      'platform-verify': 'pending',
    },
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => Object.prototype.hasOwnProperty.call(input, 'plusAccountAccessStrategy')
      ? { plusAccountAccessStrategy: input.plusAccountAccessStrategy }
      : {},
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    getNodeIdsForState: (nextState = {}) => (
      String(nextState.plusAccountAccessStrategy || '').trim() === 'sub2api_codex_session'
        ? [
          'open-chatgpt',
          'plus-checkout-create',
          'plus-checkout-billing',
          'paypal-approve',
          'plus-checkout-return',
          'sub2api-session-import',
        ]
        : [
          'open-chatgpt',
          'plus-checkout-create',
          'plus-checkout-billing',
          'paypal-approve',
          'plus-checkout-return',
          'oauth-login',
          'fetch-login-code',
          'post-login-phone-verification',
          'confirm-oauth',
          'platform-verify',
        ]
    ),
    getState: async () => ({ ...state }),
    getStepIdsForState: () => [],
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      plusAccountAccessStrategy: 'sub2api_codex_session',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(state.currentNodeId, '');
  assert.equal(state.oauthUrl, null);
  assert.equal(state.localhostUrl, null);
  assert.equal(state.oauthFlowDeadlineAt, null);
  assert.equal(state.oauthFlowDeadlineSourceUrl, null);
  assert.equal(state.cpaOAuthState, null);
  assert.equal(state.cpaManagementOrigin, null);
  assert.equal(state.sub2apiSessionId, null);
  assert.equal(state.sub2apiOAuthState, null);
  assert.equal(state.sub2apiGroupId, null);
  assert.deepStrictEqual(state.sub2apiGroupIds, []);
  assert.equal(state.sub2apiDraftName, null);
  assert.equal(state.sub2apiProxyId, null);
  assert.equal(state.codex2apiSessionId, null);
  assert.equal(state.codex2apiOAuthState, null);
  assert.equal(state.plusManualConfirmationPending, false);
  assert.equal(state.plusManualConfirmationRequestId, '');
  assert.equal(state.plusManualConfirmationStep, 0);
  assert.equal(state.plusManualConfirmationMethod, '');
  assert.equal(state.plusManualConfirmationTitle, '');
  assert.equal(state.plusManualConfirmationMessage, '');
  assert.deepStrictEqual(state.nodeStatuses, {
    'open-chatgpt': 'pending',
    'plus-checkout-create': 'pending',
    'plus-checkout-billing': 'pending',
    'paypal-approve': 'pending',
    'plus-checkout-return': 'pending',
    'sub2api-session-import': 'pending',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(state.nodeStatuses, 'oauth-login'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(state.nodeStatuses, 'platform-verify'), false);
  assert.deepStrictEqual(broadcasts.at(-1), {
    plusAccountAccessStrategy: 'sub2api_codex_session',
    oauthUrl: null,
    localhostUrl: null,
    oauthFlowDeadlineAt: null,
    oauthFlowDeadlineSourceUrl: null,
    cpaOAuthState: null,
    cpaManagementOrigin: null,
    sub2apiSessionId: null,
    sub2apiOAuthState: null,
    sub2apiGroupId: null,
    sub2apiGroupIds: [],
    sub2apiDraftName: null,
    sub2apiProxyId: null,
    codex2apiSessionId: null,
    codex2apiOAuthState: null,
    plusManualConfirmationPending: false,
    plusManualConfirmationRequestId: '',
    plusManualConfirmationStep: 0,
    plusManualConfirmationMethod: '',
    plusManualConfirmationTitle: '',
    plusManualConfirmationMessage: '',
    nodeStatuses: {
      'open-chatgpt': 'pending',
      'plus-checkout-create': 'pending',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'sub2api-session-import': 'pending',
    },
    currentNodeId: '',
  });
});

test('SAVE_SETTING rebuilds Plus node statuses when panel mode forces the effective strategy back to OAuth', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  let state = {
    panelMode: 'sub2api',
    plusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusAccountAccessStrategy: 'sub2api_codex_session',
    oauthUrl: 'https://oauth.example/current',
    localhostUrl: 'http://localhost:38080/callback',
    sub2apiSessionId: 'sub-session',
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: 'gopay-req',
    plusManualConfirmationStep: 9,
    plusManualConfirmationMethod: 'gopay',
    plusManualConfirmationTitle: 'GoPay 订阅确认',
    plusManualConfirmationMessage: '完成后继续导入当前 ChatGPT 会话到 SUB2API。',
    currentNodeId: 'sub2api-session-import',
    nodeStatuses: {
      'open-chatgpt': 'completed',
      'plus-checkout-create': 'completed',
      'plus-checkout-billing': 'completed',
      'paypal-approve': 'completed',
      'plus-checkout-return': 'completed',
      'sub2api-session-import': 'running',
    },
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => Object.prototype.hasOwnProperty.call(input, 'panelMode')
      ? { panelMode: input.panelMode }
      : {},
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    getNodeIdsForState: (nextState = {}) => (
      String(nextState.panelMode || '').trim() === 'sub2api'
      && String(nextState.plusAccountAccessStrategy || '').trim() === 'sub2api_codex_session'
        ? [
          'open-chatgpt',
          'plus-checkout-create',
          'plus-checkout-billing',
          'paypal-approve',
          'plus-checkout-return',
          'sub2api-session-import',
        ]
        : [
          'open-chatgpt',
          'plus-checkout-create',
          'plus-checkout-billing',
          'paypal-approve',
          'plus-checkout-return',
          'oauth-login',
          'fetch-login-code',
          'post-login-phone-verification',
          'confirm-oauth',
          'platform-verify',
        ]
    ),
    getState: async () => ({ ...state }),
    getStepIdsForState: () => [],
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      panelMode: 'cpa',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.panelMode, 'cpa');
  assert.equal(state.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(state.currentNodeId, '');
  assert.equal(state.oauthUrl, null);
  assert.equal(state.localhostUrl, null);
  assert.equal(state.sub2apiSessionId, null);
  assert.equal(state.plusManualConfirmationPending, false);
  assert.equal(state.plusManualConfirmationMessage, '');
  assert.deepStrictEqual(state.nodeStatuses, {
    'open-chatgpt': 'pending',
    'plus-checkout-create': 'pending',
    'plus-checkout-billing': 'pending',
    'paypal-approve': 'pending',
    'plus-checkout-return': 'pending',
    'oauth-login': 'pending',
    'fetch-login-code': 'pending',
    'post-login-phone-verification': 'pending',
    'confirm-oauth': 'pending',
    'platform-verify': 'pending',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(state.nodeStatuses, 'sub2api-session-import'), false);
  assert.deepStrictEqual(broadcasts.at(-1), {
    panelMode: 'cpa',
    signupMethod: 'email',
    oauthUrl: null,
    localhostUrl: null,
    oauthFlowDeadlineAt: null,
    oauthFlowDeadlineSourceUrl: null,
    cpaOAuthState: null,
    cpaManagementOrigin: null,
    sub2apiSessionId: null,
    sub2apiOAuthState: null,
    sub2apiGroupId: null,
    sub2apiGroupIds: [],
    sub2apiDraftName: null,
    sub2apiProxyId: null,
    codex2apiSessionId: null,
    codex2apiOAuthState: null,
    plusManualConfirmationPending: false,
    plusManualConfirmationRequestId: '',
    plusManualConfirmationStep: 0,
    plusManualConfirmationMethod: '',
    plusManualConfirmationTitle: '',
    plusManualConfirmationMessage: '',
    nodeStatuses: {
      'open-chatgpt': 'pending',
      'plus-checkout-create': 'pending',
      'plus-checkout-billing': 'pending',
      'paypal-approve': 'pending',
      'plus-checkout-return': 'pending',
      'oauth-login': 'pending',
      'fetch-login-code': 'pending',
      'post-login-phone-verification': 'pending',
      'confirm-oauth': 'pending',
      'platform-verify': 'pending',
    },
    currentNodeId: '',
  });
});

test('SAVE_SETTING mirrors activeFlowId into flowId when switching to kiro flow', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  let state = { activeFlowId: 'openai', flowId: 'openai', panelMode: 'cpa', plusModeEnabled: false, plusPaymentMethod: 'paypal' };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => Object.prototype.hasOwnProperty.call(input, 'activeFlowId')
      ? { activeFlowId: input.activeFlowId }
      : {},
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    getState: async () => ({ ...state }),
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => { state = { ...state, ...updates }; },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { activeFlowId: 'kiro' },
  });

  assert.equal(response.ok, true);
  assert.equal(state.activeFlowId, 'kiro');
  assert.equal(state.flowId, 'kiro');
  assert.deepStrictEqual(broadcasts.at(-1), {
    activeFlowId: 'kiro',
    flowId: 'kiro',
    signupMethod: 'email',
  });
});

test('SAVE_SETTING syncs canonical kiro settingsState back into session state', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const canonicalSettingsState = {
    schemaVersion: 4,
    activeFlowId: 'kiro',
    services: {
      account: { customPassword: '' },
      email: { provider: 'duck' },
      proxy: { enabled: false, provider: '711proxy', mode: 'account' },
    },
    flows: {
      openai: {
        integrationTargetId: 'cpa',
        integrationTargets: {
          cpa: { vpsUrl: '', vpsPassword: '', localCpaStep9Mode: 'submit' },
          sub2api: {
            sub2apiUrl: '',
            sub2apiEmail: '',
            sub2apiPassword: '',
            sub2apiGroupName: 'codex',
            sub2apiGroupNames: ['codex', 'openai-plus'],
            sub2apiAccountPriority: 1,
            sub2apiDefaultProxyName: '',
          },
          codex2api: { codex2apiUrl: '', codex2apiAdminKey: '' },
        },
        signup: {
          signupMethod: 'email',
          phoneVerificationEnabled: false,
          phoneSignupReloginAfterBindEmailEnabled: false,
        },
        plus: {
          plusModeEnabled: false,
          plusPaymentMethod: 'paypal',
        },
        autoRun: {
          stepExecutionRange: { enabled: false, fromStep: 1, toStep: 11 },
        },
      },
      kiro: {
        targetId: 'kiro-rs',
        targets: {
          'kiro-rs': {
            baseUrl: 'https://kiro.example.com/admin',
            apiKey: 'live-key',
          },
        },
        autoRun: {
          stepExecutionRange: { enabled: false, fromStep: 1, toStep: 9 },
        },
      },
    },
  };
  let state = {
    activeFlowId: 'kiro',
    flowId: 'kiro',
    kiroTargetId: 'kiro-rs',
    kiroRsUrl: 'https://kiro.example.com/admin',
    kiroRsKey: '',
    settingsSchemaVersion: 4,
    settingsState: {
      ...canonicalSettingsState,
      flows: {
        ...canonicalSettingsState.flows,
        kiro: {
          ...canonicalSettingsState.flows.kiro,
          targets: {
            'kiro-rs': {
              baseUrl: 'https://kiro.example.com/admin',
              apiKey: '',
            },
          },
        },
      },
    },
    plusModeEnabled: false,
    plusPaymentMethod: 'paypal',
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => ({
      activeFlowId: String(input.activeFlowId || 'kiro'),
      kiroRsKey: String(input.kiroRsKey || ''),
    }),
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    setPersistentSettings: async () => ({
      activeFlowId: 'kiro',
      flowId: 'kiro',
      kiroTargetId: 'kiro-rs',
      kiroRsUrl: 'https://kiro.example.com/admin',
      kiroRsKey: 'live-key',
      settingsSchemaVersion: 4,
      settingsState: canonicalSettingsState,
    }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      activeFlowId: 'kiro',
      kiroRsKey: 'live-key',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.kiroRsKey, 'live-key');
  assert.equal(state.settingsState.flows.kiro.targets['kiro-rs'].apiKey, 'live-key');
});

test('CHECK_KIRO_RS_CONNECTION prefers current sidepanel payload over stale saved kiro.rs config', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const calls = [];
  const router = api.createMessageRouter({
    getState: async () => ({
      activeFlowId: 'kiro',
      flowId: 'kiro',
      kiroTargetId: 'kiro-rs',
      kiroRsUrl: 'https://old.example.com/admin',
      kiroRsKey: 'old-key',
      settingsState: {
        flows: {
          kiro: {
            targetId: 'kiro-rs',
            targets: {
              'kiro-rs': {
                baseUrl: 'https://old.example.com/admin',
                apiKey: 'old-key',
              },
            },
          },
        },
      },
    }),
    testKiroRsConnection: async (baseUrl, apiKey) => {
      calls.push({ baseUrl, apiKey });
      return {
        ok: false,
        status: 401,
        message: 'kiro.rs API Key 被拒绝（HTTP 401：Invalid or missing admin API key）',
      };
    },
  });

  const response = await router.handleMessage({
    type: 'CHECK_KIRO_RS_CONNECTION',
    payload: {
      activeFlowId: 'kiro',
      targetId: 'kiro-rs',
      baseUrl: ' https://new.example.com/admin/ ',
      apiKey: ' new-key ',
    },
  });

  assert.equal(response.ok, false);
  assert.equal(response.status, 401);
  assert.equal(response.message, 'kiro.rs API Key 被拒绝（HTTP 401：Invalid or missing admin API key）');
  assert.deepStrictEqual(calls, [
    {
      baseUrl: 'https://new.example.com/admin/',
      apiKey: ' new-key ',
    },
  ]);
});

test('AUTO_RUN applies current flow selection from payload before starting loop', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const calls = [];
  const validations = [];
  let state = {
    activeFlowId: 'openai',
    flowId: 'openai',
    panelMode: 'cpa',
    plusModeEnabled: false,
    plusPaymentMethod: 'paypal',
  };

  const router = api.createMessageRouter({
    clearStopRequest: () => {},
    getPendingAutoRunTimerPlan: () => null,
    getState: async () => ({ ...state }),
    normalizeRunCount: (value) => Number(value) || 1,
    setState: async (updates) => {
      calls.push({ type: 'setState', updates: { ...updates } });
      state = { ...state, ...updates };
    },
    startAutoRunLoop: (totalRuns, options) => {
      calls.push({ type: 'startAutoRunLoop', totalRuns, options });
    },
    validateAutoRunStart: (validationState, options = {}) => {
      validations.push({
        activeFlowId: validationState?.activeFlowId,
        flowId: validationState?.flowId,
        kiroTargetId: validationState?.kiroTargetId,
        optionActiveFlowId: options?.activeFlowId,
      });
      return { ok: true, errors: [] };
    },
  });

  const response = await router.handleMessage({
    type: 'AUTO_RUN',
    payload: {
      totalRuns: 1,
      activeFlowId: 'kiro',
      targetId: 'kiro-rs',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.activeFlowId, 'kiro');
  assert.equal(state.flowId, 'kiro');
  assert.equal(state.kiroTargetId, 'kiro-rs');
  assert.deepStrictEqual(calls, [
    {
      type: 'setState',
      updates: {
        activeFlowId: 'kiro',
        flowId: 'kiro',
        kiroTargetId: 'kiro-rs',
      },
    },
    {
      type: 'setState',
      updates: {
        autoRunSkipFailures: false,
        autoRunRetryPaypalCallback: false,
      },
    },
    {
      type: 'startAutoRunLoop',
      totalRuns: 1,
      options: {
        autoRunSkipFailures: false,
        autoRunRetryPaypalCallback: false,
        mode: 'restart',
      },
    },
  ]);
  assert.deepStrictEqual(validations, [
    {
      activeFlowId: 'kiro',
      flowId: 'kiro',
      kiroTargetId: 'kiro-rs',
      optionActiveFlowId: 'kiro',
    },
  ]);
});

function createPayPalHostedGenericErrorRouterHarness(overrides = {}) {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const events = [];
  let state = {
    plusManualConfirmationPending: true,
    plusManualConfirmationRequestId: 'paypal-hosted-generic-error-req',
    plusManualConfirmationStep: 6,
    plusManualConfirmationMethod: 'paypal-hosted-generic-error',
    plusManualConfirmationTitle: 'PayPal Checkout 异常',
    plusManualConfirmationMessage: 'Things do not appear to be working.',
    currentNodeId: 'plus-checkout-create',
    plusPaymentMethod: 'paypal-hosted',
    plusCheckoutConversionProxySession: {
      active: true,
      flowType: 'paypal-hosted',
      releaseNodeKey: 'paypal-hosted-review',
      appliedStepKey: 'paypal-hosted-openai-checkout',
      displayName: 'socks5://proxy.example:1080',
      snapshot: { applied: true },
      appliedAt: 1,
    },
    nodeStatuses: {
      'plus-checkout-create': 'failed',
      'paypal-hosted-email': 'pending',
    },
    ...(overrides.state || {}),
  };

  const router = api.createMessageRouter({
    addLog: async (message, level = 'info', options = {}) => events.push({ type: 'log', message, level, options }),
    broadcastDataUpdate: (payload) => events.push({ type: 'broadcast', payload }),
    checkoutConversionProxyManager: {
      getStoredSession: async () => state.plusCheckoutConversionProxySession || null,
      restoreSession: async (session) => {
        events.push({ type: 'restoreHostedCheckoutProxySession', session });
        state = { ...state, plusCheckoutConversionProxySession: null };
        return true;
      },
    },
    chrome: {
      tabs: {
        create: async (payload) => {
          events.push({ type: 'tabs.create', payload });
          return { id: 901 };
        },
      },
    },
    clearStopRequest: () => events.push({ type: 'clearStopRequest' }),
    executeNode: async (nodeId) => events.push({ type: 'executeNode', nodeId }),
    getState: async () => ({ ...state, nodeStatuses: { ...(state.nodeStatuses || {}) } }),
    getStepIdByNodeIdForState: (nodeId) => (nodeId === 'plus-checkout-create' ? 6 : 0),
    invalidateDownstreamAfterStepRestart: async (step, options = {}) => events.push({ type: 'invalidateDownstreamAfterStepRestart', step, options }),
    setState: async (updates) => {
      events.push({ type: 'setState', updates: { ...updates } });
      state = { ...state, ...updates };
    },
  });

  return {
    events,
    getState: () => state,
    router,
  };
}

test('RESOLVE_PLUS_MANUAL_CONFIRMATION check handles PayPal hosted genericError', async () => {
  const harness = createPayPalHostedGenericErrorRouterHarness();

  const response = await harness.router.handleMessage({
    type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
    payload: {
      requestId: 'paypal-hosted-generic-error-req',
      action: 'check',
      confirmed: true,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(harness.getState().plusManualConfirmationPending, false);
  assert.deepStrictEqual(
    harness.events.find((event) => event.type === 'tabs.create')?.payload,
    { url: 'https://chatgpt.com/', active: true }
  );
  assert.equal(harness.events.some((event) => event.type === 'executeNode'), false);
  assert.equal(harness.events.some((event) => event.type === 'broadcast' && event.payload.plusManualConfirmationPending === false), true);
});

test('RESOLVE_PLUS_MANUAL_CONFIRMATION retry restarts Plus checkout after PayPal hosted genericError', async () => {
  const harness = createPayPalHostedGenericErrorRouterHarness();

  const response = await harness.router.handleMessage({
    type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
    payload: {
      requestId: 'paypal-hosted-generic-error-req',
      action: 'retry',
      confirmed: true,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(harness.getState().plusManualConfirmationPending, false);
  assert.equal(harness.events.some((event) => event.type === 'clearStopRequest'), true);
  assert.deepStrictEqual(
    harness.events.find((event) => event.type === 'restoreHostedCheckoutProxySession')?.session?.flowType,
    'paypal-hosted'
  );
  assert.deepStrictEqual(
    harness.events.find((event) => event.type === 'invalidateDownstreamAfterStepRestart'),
    {
      type: 'invalidateDownstreamAfterStepRestart',
      step: 6,
      options: { logLabel: 'PayPal genericError 后重试 Plus Checkout' },
    }
  );
  assert.deepStrictEqual(
    harness.events.find((event) => event.type === 'executeNode'),
    { type: 'executeNode', nodeId: 'plus-checkout-create' }
  );
});

test('RESOLVE_PLUS_MANUAL_CONFIRMATION retry skips hosted proxy cleanup when session is absent', async () => {
  const harness = createPayPalHostedGenericErrorRouterHarness({
    state: {
      plusCheckoutConversionProxySession: null,
    },
  });

  const response = await harness.router.handleMessage({
    type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
    payload: {
      requestId: 'paypal-hosted-generic-error-req',
      action: 'retry',
      confirmed: true,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(harness.events.some((event) => event.type === 'restoreHostedCheckoutProxySession'), false);
  assert.deepStrictEqual(
    harness.events.find((event) => event.type === 'executeNode'),
    { type: 'executeNode', nodeId: 'plus-checkout-create' }
  );
});

test('RESOLVE_PLUS_MANUAL_CONFIRMATION ignores mismatched PayPal hosted genericError requestId', async () => {
  const harness = createPayPalHostedGenericErrorRouterHarness();

  const response = await harness.router.handleMessage({
    type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
    payload: {
      requestId: 'stale-request',
      action: 'retry',
      confirmed: true,
    },
  });

  assert.deepStrictEqual(response, { ok: true, ignored: true });
  assert.equal(harness.getState().plusManualConfirmationPending, true);
  assert.equal(harness.events.length, 0);
});

test('SAVE_SETTING re-resolves signup method when panel mode changes', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let state = {
    signupMethod: 'phone',
    phoneVerificationEnabled: true,
    plusModeEnabled: false,
    panelMode: 'sub2api',
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => Object.prototype.hasOwnProperty.call(input, 'panelMode')
      ? { panelMode: input.panelMode }
      : {},
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    resolveSignupMethod: (nextState = {}) => nextState.panelMode === 'cpa' ? 'email' : 'phone',
    setPersistentSettings: async (updates) => ({ ...updates }),
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: { panelMode: 'cpa' },
  });

  assert.equal(response.ok, true);
  assert.equal(state.panelMode, 'cpa');
  assert.equal(state.signupMethod, 'email');
});

test('SAVE_SETTING applies shared mode-switch normalization before persisting incompatible capability flags', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const persistedPayloads = [];
  let state = {
    activeFlowId: 'site-a',
    signupMethod: 'email',
    phoneVerificationEnabled: false,
    plusModeEnabled: false,
    panelMode: 'cpa',
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => ({
      plusModeEnabled: Boolean(input.plusModeEnabled),
      phoneVerificationEnabled: Boolean(input.phoneVerificationEnabled),
      signupMethod: String(input.signupMethod || 'email'),
    }),
    broadcastDataUpdate: () => {},
    getState: async () => ({ ...state }),
    resolveSignupMethod: (nextState = {}) => (
      Boolean(nextState.phoneVerificationEnabled) && Boolean(nextState.plusModeEnabled) ? 'phone' : 'email'
    ),
    setPersistentSettings: async (updates) => {
      persistedPayloads.push({ ...updates });
      return { ...updates };
    },
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    validateModeSwitch: () => ({
      ok: false,
      errors: [{ code: 'plus_mode_unsupported', message: '当前 flow 不支持 Plus 模式。' }],
      normalizedUpdates: {
        plusModeEnabled: false,
        phoneVerificationEnabled: false,
        signupMethod: 'email',
      },
    }),
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      plusModeEnabled: true,
      phoneVerificationEnabled: true,
      signupMethod: 'phone',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.plusModeEnabled, false);
  assert.equal(state.phoneVerificationEnabled, false);
  assert.equal(state.signupMethod, 'email');
  assert.deepEqual(persistedPayloads[0], {
    plusModeEnabled: false,
    phoneVerificationEnabled: false,
    signupMethod: 'email',
  });
  assert.equal(response.modeValidation?.errors?.[0]?.code, 'plus_mode_unsupported');
});

test('SAVE_SETTING treats Phone Plus changes as signup and step topology updates', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const persistedPayloads = [];
  const broadcasts = [];
  let state = {
    activeFlowId: 'openai',
    signupMethod: 'email',
    phoneVerificationEnabled: false,
    plusModeEnabled: true,
    phonePlusModeEnabled: false,
    plusPaymentMethod: 'paypal',
    plusAccountAccessStrategy: 'sub2api_codex_session',
    currentNodeId: 'sub2api-session-import',
    nodeStatuses: {
      'open-chatgpt': 'completed',
      'plus-checkout-create': 'completed',
      'sub2api-session-import': 'running',
    },
  };

  const router = api.createMessageRouter({
    addLog: async () => {},
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: (input = {}) => ({
      phonePlusModeEnabled: Boolean(input.phonePlusModeEnabled),
      plusModeEnabled: Boolean(input.plusModeEnabled),
      phoneVerificationEnabled: Boolean(input.phoneVerificationEnabled),
      signupMethod: String(input.signupMethod || 'email'),
      plusAccountAccessStrategy: String(input.plusAccountAccessStrategy || 'oauth'),
    }),
    broadcastDataUpdate: (payload) => broadcasts.push({ ...payload }),
    getNodeIdsForState: (nextState = {}) => (
      nextState.phonePlusModeEnabled
        ? [
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
        ]
        : ['open-chatgpt', 'plus-checkout-create', 'sub2api-session-import']
    ),
    getState: async () => ({ ...state }),
    resolveSignupMethod: (nextState = {}) => (nextState.phonePlusModeEnabled ? 'phone' : 'email'),
    setPersistentSettings: async (updates) => {
      persistedPayloads.push({ ...updates });
      return { ...updates };
    },
    setState: async (updates) => {
      state = { ...state, ...updates };
    },
    validateModeSwitch: () => ({
      ok: true,
      errors: [],
      normalizedUpdates: {
        phonePlusModeEnabled: true,
        plusModeEnabled: false,
        phoneVerificationEnabled: true,
        signupMethod: 'phone',
        plusAccountAccessStrategy: 'oauth',
      },
    }),
  });

  const response = await router.handleMessage({
    type: 'SAVE_SETTING',
    payload: {
      phonePlusModeEnabled: true,
      plusModeEnabled: true,
      phoneVerificationEnabled: false,
      signupMethod: 'email',
      plusAccountAccessStrategy: 'sub2api_codex_session',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(state.phonePlusModeEnabled, true);
  assert.equal(state.plusModeEnabled, false);
  assert.equal(state.phoneVerificationEnabled, true);
  assert.equal(state.signupMethod, 'phone');
  assert.equal(state.plusAccountAccessStrategy, 'oauth');
  assert.equal(state.currentNodeId, '');
  assert.equal(state.nodeStatuses['wait-registration-success'], 'pending');
  assert.equal(state.nodeStatuses['plus-checkout-create'], 'pending');
  assert.equal(state.nodeStatuses['bind-email'], 'pending');
  assert.equal(Object.prototype.hasOwnProperty.call(state.nodeStatuses, 'sub2api-session-import'), false);
  assert.deepEqual(persistedPayloads[0], {
    phonePlusModeEnabled: true,
    plusModeEnabled: false,
    phoneVerificationEnabled: true,
    signupMethod: 'phone',
    plusAccountAccessStrategy: 'oauth',
  });
  assert.equal(broadcasts.at(-1).phonePlusModeEnabled, true);
  assert.equal(broadcasts.at(-1).plusModeEnabled, false);
  assert.equal(broadcasts.at(-1).phoneVerificationEnabled, true);
  assert.equal(broadcasts.at(-1).signupMethod, 'phone');
  assert.equal(broadcasts.at(-1).plusAccountAccessStrategy, 'oauth');
  assert.equal(broadcasts.at(-1).currentNodeId, '');
});

test('REFRESH_IP_PROXY_POOL prefers sidepanel ipProxyStateOverride over stale saved proxy API URL', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const calls = [];
  const originalRefreshIpProxyPool = globalThis.refreshIpProxyPool;
  globalThis.refreshIpProxyPool = async (options = {}) => {
    calls.push(options);
    return {
      mode: options.mode || options.state?.ipProxyMode,
      provider: options.state?.ipProxyService,
      pool: [],
    };
  };
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);

  try {
    const router = api.createMessageRouter({
      buildPersistentSettingsPayload: (input = {}) => ({ ...input }),
      getState: async () => ({
        ipProxyEnabled: true,
        ipProxyService: '711proxy',
        ipProxyMode: 'api',
        ipProxyApiUrl: 'http://old.example.com/gen?count=1',
        ipProxyServiceProfiles: {
          '711proxy': {
            mode: 'api',
            apiUrl: 'http://old.example.com/gen?count=1',
          },
        },
      }),
    });

    const response = await router.handleMessage({
      type: 'REFRESH_IP_PROXY_POOL',
      source: 'sidepanel',
      payload: {
        mode: 'api',
        ipProxyStateOverride: {
          ipProxyService: '711proxy',
          ipProxyMode: 'api',
          ipProxyApiUrl: 'http://new.example.com/gen?count=1',
          ipProxyApiHost: 'http://new.example.com:8089',
          ipProxyApiCount: '1',
          ipProxyServiceProfiles: {
            '711proxy': {
              mode: 'api',
              apiUrl: 'http://new.example.com/gen?count=1',
              apiHost: 'http://new.example.com:8089',
              apiCount: '1',
            },
          },
        },
      },
    });

    assert.equal(response.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].state.ipProxyApiUrl, 'http://new.example.com/gen?count=1');
    assert.equal(calls[0].state.ipProxyServiceProfiles['711proxy'].apiUrl, 'http://new.example.com/gen?count=1');
  } finally {
    if (originalRefreshIpProxyPool === undefined) {
      delete globalThis.refreshIpProxyPool;
    } else {
      globalThis.refreshIpProxyPool = originalRefreshIpProxyPool;
    }
  }
});

test('SWITCH_IP_PROXY with ensureDifferentExit routes 711 API mode through the real-exit rotation helper', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const rotationCalls = [];
  const refreshCalls = [];
  const switchCalls = [];
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);

  const router = api.createMessageRouter({
    buildPersistentSettingsPayload: (input = {}) => ({ ...input }),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyApiUrl: 'http://proxy.example.com/gen?count=10',
      ipProxyAppliedExitIp: '198.51.100.10',
      ipProxyAutoRefreshPoolOnExhausted: true,
    }),
    refreshIpProxyPool: async (options = {}) => {
      refreshCalls.push(options);
      return { mode: options.mode || 'api', provider: '711proxy', pool: [] };
    },
    switchIpProxy: async (direction, options = {}) => {
      switchCalls.push({ direction, options });
      return { mode: 'api', provider: '711proxy', pool: [] };
    },
    switch711ApiProxyUntilExitChanged: async (options = {}) => {
      rotationCalls.push(options);
      return {
        ok: true,
        mode: 'api',
        provider: '711proxy',
        exitChanged: true,
        exitCheckCompleted: true,
        previousExitIp: options.previousExitIp,
        attemptedCount: 2,
        refreshedPool: true,
        proxyRouting: {
          applied: true,
          provider: '711proxy',
          exitIp: '203.0.113.77',
          exitRegion: 'US',
          exitDetecting: false,
        },
      };
    },
  });

  const response = await router.handleMessage({
    type: 'SWITCH_IP_PROXY',
    source: 'sidepanel',
    payload: {
      mode: 'api',
      ensureDifferentExit: true,
      direction: 'next',
    },
  });

  assert.equal(response.ok, true);
  assert.equal(rotationCalls.length, 1);
  assert.equal(rotationCalls[0].refreshPoolFirst, false);
  assert.equal(rotationCalls[0].allowRefreshOnExhausted, true);
  assert.equal(rotationCalls[0].previousExitIp, '198.51.100.10');
  assert.equal(refreshCalls.length, 0);
  assert.equal(switchCalls.length, 0);
  assert.equal(response.exitChanged, true);
  assert.equal(response.proxyRouting.exitIp, '203.0.113.77');
});

test('REFRESH_IP_PROXY_POOL with ensureDifferentExit routes 711 API mode through the real-exit rotation helper', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const rotationCalls = [];
  const refreshCalls = [];
  const switchCalls = [];
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);

  const router = api.createMessageRouter({
    buildPersistentSettingsPayload: (input = {}) => ({ ...input }),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyApiUrl: 'http://proxy.example.com/gen?count=10',
      ipProxyAppliedExitIp: '198.51.100.20',
      ipProxyAutoRefreshPoolOnExhausted: true,
    }),
    refreshIpProxyPool: async (options = {}) => {
      refreshCalls.push(options);
      return { mode: options.mode || 'api', provider: '711proxy', pool: [] };
    },
    switchIpProxy: async (direction, options = {}) => {
      switchCalls.push({ direction, options });
      return { mode: 'api', provider: '711proxy', pool: [] };
    },
    switch711ApiProxyUntilExitChanged: async (options = {}) => {
      rotationCalls.push(options);
      return {
        ok: true,
        mode: 'api',
        provider: '711proxy',
        exitChanged: true,
        exitCheckCompleted: true,
        previousExitIp: options.previousExitIp,
        attemptedCount: 3,
        refreshedPool: true,
        proxyRouting: {
          applied: true,
          provider: '711proxy',
          exitIp: '203.0.113.88',
          exitRegion: 'JP',
          exitDetecting: false,
        },
      };
    },
  });

  const response = await router.handleMessage({
    type: 'REFRESH_IP_PROXY_POOL',
    source: 'sidepanel',
    payload: {
      mode: 'api',
      ensureDifferentExit: true,
    },
  });

  assert.equal(response.ok, true);
  assert.equal(rotationCalls.length, 1);
  assert.equal(rotationCalls[0].refreshPoolFirst, true);
  assert.equal(rotationCalls[0].allowRefreshOnExhausted, true);
  assert.equal(rotationCalls[0].previousExitIp, '198.51.100.20');
  assert.equal(refreshCalls.length, 0);
  assert.equal(switchCalls.length, 0);
  assert.equal(response.exitChanged, true);
  assert.equal(response.proxyRouting.exitIp, '203.0.113.88');
});

test('PROBE_IP_PROXY_EXIT rebinding and probing use sidepanel ipProxyStateOverride', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const rebindCalls = [];
  const probeCalls = [];

  const router = api.createMessageRouter({
    buildPersistentSettingsPayload: (input = {}) => ({ ...input }),
    getState: async () => ({
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyApiUrl: 'http://old.example.com/gen?count=1',
      ipProxyAppliedReason: 'applied',
      ipProxyAppliedExitError: '',
    }),
    lockAutomationWindowFromMessage: async () => {},
    applyIpProxySettingsFromState: async (state) => {
      rebindCalls.push(state);
      return null;
    },
    probeIpProxyExit: async (options = {}) => {
      probeCalls.push(options);
      return { proxyRouting: { applied: true, provider: '711proxy' } };
    },
  });

  const response = await router.handleMessage({
    type: 'PROBE_IP_PROXY_EXIT',
    source: 'sidepanel',
    payload: {
      ipProxyStateOverride: {
        ipProxyEnabled: true,
        ipProxyService: '711proxy',
        ipProxyMode: 'api',
        ipProxyApiUrl: 'http://new.example.com/gen?count=1',
      },
    },
  });

  assert.equal(response.ok, true);
  assert.equal(rebindCalls[0].ipProxyApiUrl, 'http://new.example.com/gen?count=1');
  assert.equal(probeCalls[0].state.ipProxyApiUrl, 'http://new.example.com/gen?count=1');
});

test('NODE_COMPLETE records registration-success account book entry when wait-registration-success completes', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const accountBookCalls = [];

  const router = api.createMessageRouter({
    addLog: async () => {},
    appendAccountRunRecord: async () => {},
    batchUpdateLuckmailPurchases: async () => {},
    buildLocalhostCleanupPrefix: () => '',
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: () => ({}),
    broadcastDataUpdate: () => {},
    clearAutoRunTimerAlarm: async () => {},
    clearStopRequest: () => {},
    getState: async () => ({
      nodeStatuses: { 'wait-registration-success': 'pending', 'platform-verify': 'pending' },
      email: 'user@example.com',
      ipProxyAppliedExitIp: '203.0.113.8',
      ipProxyAppliedExitRegion: 'JP',
    }),
    getNodeIdsForState: () => ['open-chatgpt', 'submit-signup-email', 'fill-password', 'fetch-signup-code', 'fill-profile', 'wait-registration-success', 'platform-verify'],
    getStepIdByNodeIdForState: (nodeId) => ({
      'wait-registration-success': 6,
      'platform-verify': 10,
    })[nodeId] || 0,
    getStepDefinitionForState: (step) => ({ id: step, key: step === 6 ? 'wait-registration-success' : 'platform-verify' }),
    getStepIdsForState: () => [1, 2, 3, 4, 5, 6, 10],
    getLastStepIdForState: () => 10,
    getStopRequested: () => false,
    getSourceLabel: () => '',
    isCloudflareSecurityBlockedError: () => false,
    isStopError: () => false,
    notifyNodeComplete: () => {},
    notifyNodeError: () => {},
    setNodeStatus: async () => {},
    upsertAccountBookEntry: async (...args) => {
      accountBookCalls.push(args);
    },
  });

  const response = await router.handleMessage({
    type: 'NODE_COMPLETE',
    nodeId: 'wait-registration-success',
    payload: { nodeId: 'wait-registration-success' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(accountBookCalls.length, 1);
  assert.equal(accountBookCalls[0][0], 'registration_success');
  assert.equal(accountBookCalls[0][1].ipProxyAppliedExitIp, '203.0.113.8');
  assert.equal(accountBookCalls[0][1].ipProxyAppliedExitRegion, 'JP');
});

test('NODE_COMPLETE records registration-success account book entry when kiro register finalization completes', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const accountBookCalls = [];

  const router = api.createMessageRouter({
    addLog: async () => {},
    appendAccountRunRecord: async () => {},
    batchUpdateLuckmailPurchases: async () => {},
    buildLocalhostCleanupPrefix: () => '',
    buildLuckmailSessionSettingsPayload: () => ({}),
    buildPersistentSettingsPayload: () => ({}),
    broadcastDataUpdate: () => {},
    clearAutoRunTimerAlarm: async () => {},
    clearStopRequest: () => {},
    getState: async () => ({
      nodeStatuses: { 'kiro-complete-register-consent': 'pending', 'kiro-upload-credential': 'pending' },
      email: 'kiro@example.com',
      activeFlowId: 'kiro',
      flowId: 'kiro',
      ipProxyAppliedExitIp: '198.51.100.9',
      ipProxyAppliedExitRegion: 'US',
    }),
    getNodeIdsForState: () => [
      'kiro-open-register-page',
      'kiro-submit-email',
      'kiro-submit-name',
      'kiro-submit-verification-code',
      'kiro-submit-password',
      'kiro-complete-register-consent',
      'kiro-upload-credential',
    ],
    getStepIdByNodeIdForState: (nodeId) => ({
      'kiro-complete-register-consent': 6,
      'kiro-upload-credential': 9,
    })[nodeId] || 0,
    getStepDefinitionForState: (step) => ({ id: step, key: step === 6 ? 'kiro-complete-register-consent' : 'kiro-upload-credential' }),
    getStepIdsForState: () => [1, 2, 3, 4, 5, 6, 9],
    getLastStepIdForState: () => 9,
    getStopRequested: () => false,
    getSourceLabel: () => '',
    isCloudflareSecurityBlockedError: () => false,
    isStopError: () => false,
    notifyNodeComplete: () => {},
    notifyNodeError: () => {},
    setNodeStatus: async () => {},
    upsertAccountBookEntry: async (...args) => {
      accountBookCalls.push(args);
    },
  });

  const response = await router.handleMessage({
    type: 'NODE_COMPLETE',
    nodeId: 'kiro-complete-register-consent',
    payload: { nodeId: 'kiro-complete-register-consent' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(accountBookCalls.length, 1);
  assert.equal(accountBookCalls[0][0], 'registration_success');
  assert.equal(accountBookCalls[0][1].ipProxyAppliedExitIp, '198.51.100.9');
  assert.equal(accountBookCalls[0][1].ipProxyAppliedExitRegion, 'US');
});

test('CLEAR_ACCOUNT_BOOK delegates to background clear helper and returns cleared count', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const calls = [];

  const router = api.createMessageRouter({
    getState: async () => ({ autoRunning: false, autoRunPhase: 'idle' }),
    isAutoRunLockedState: () => false,
    clearAccountBook: async (...args) => {
      calls.push(args);
      return { clearedCount: 3 };
    },
  });

  const response = await router.handleMessage({
    type: 'CLEAR_ACCOUNT_BOOK',
    source: 'sidepanel',
  }, {});

  assert.equal(response.ok, true);
  assert.equal(response.clearedCount, 3);
  assert.equal(calls.length, 1);
});

test('TEST_PLUS_CHECKOUT_CONVERSION_PROXY delegates proxy test when auto-run is idle', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const calls = [];

  const router = api.createMessageRouter({
    buildPersistentSettingsPayload: (value) => value,
    getState: async () => ({
      autoRunning: false,
      plusCheckoutConversionProxyUrl: 'http://saved.proxy:8080',
      plusCheckoutConversionProxySource: 'manual',
    }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
    testPlusCheckoutConversionProxy: async (options) => {
      calls.push(options);
      return {
        ok: true,
        exitIp: '203.0.113.55',
        exitRegion: 'US',
      };
    },
  });

  const response = await router.handleMessage({
    type: 'TEST_PLUS_CHECKOUT_CONVERSION_PROXY',
    source: 'sidepanel',
    payload: { proxyUrl: 'socks5h://proxy.example:1080' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(response.exitIp, '203.0.113.55');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].proxyUrl, 'socks5h://proxy.example:1080');
  assert.equal(calls[0].source, 'manual');
  assert.equal(calls[0].state.plusCheckoutConversionProxyUrl, 'http://saved.proxy:8080');
});

test('TEST_PLUS_CHECKOUT_CONVERSION_PROXY delegates direct mode without requiring proxyUrl', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const calls = [];

  const router = api.createMessageRouter({
    buildPersistentSettingsPayload: (value) => value,
    getState: async () => ({
      autoRunning: false,
      plusCheckoutConversionProxyUrl: 'http://saved.proxy:8080',
      plusCheckoutConversionProxySource: 'direct',
      plusCheckoutConversionProxy711Region: 'US',
    }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
    testPlusCheckoutConversionProxy: async (options) => {
      calls.push(options);
      return { ok: true, exitIp: '198.51.100.10', exitRegion: 'CN' };
    },
  });

  const response = await router.handleMessage({
    type: 'TEST_PLUS_CHECKOUT_CONVERSION_PROXY',
    source: 'sidepanel',
    payload: { source: 'direct', proxyUrl: '' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].source, 'direct');
  assert.equal(calls[0].proxyUrl, '');
});

test('TEST_PLUS_CHECKOUT_CONVERSION_PROXY is rejected while auto-run is locked', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let called = false;

  const router = api.createMessageRouter({
    getState: async () => ({ autoRunning: true }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
    testPlusCheckoutConversionProxy: async () => {
      called = true;
      return { ok: true };
    },
  });

  await assert.rejects(
    () => router.handleMessage({
      type: 'TEST_PLUS_CHECKOUT_CONVERSION_PROXY',
      source: 'sidepanel',
      payload: { proxyUrl: 'http://proxy.example:8080' },
    }, {}),
    /自动流程运行中/
  );
  assert.equal(called, false);
});

test('SWITCH_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL broadcasts manual session when auto-run is idle', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  const calls = [];

  const router = api.createMessageRouter({
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    buildPersistentSettingsPayload: (value) => value,
    checkoutConversionProxyManager: {
      switchManualSession: async (options) => {
        calls.push(options);
        return {
          switched: true,
          alreadyActive: false,
          displayName: 'socks5://proxy.example:1080',
          session: {
            active: true,
            mode: 'manual',
            source: 'manual',
            proxyUrl: 'socks5h://proxy.example:1080',
            displayName: 'socks5://proxy.example:1080',
          },
        };
      },
    },
    getState: async () => ({
      autoRunning: false,
      plusCheckoutConversionProxyUrl: 'socks5h://proxy.example:1080',
      plusCheckoutConversionProxySource: 'manual',
      plusCheckoutConversionProxy711Region: '',
    }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
  });

  const response = await router.handleMessage({
    type: 'SWITCH_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL',
    source: 'sidepanel',
    payload: { proxyUrl: 'socks5h://proxy.example:1080' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(response.switched, true);
  assert.equal(response.displayName, 'socks5://proxy.example:1080');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].proxyUrl, 'socks5h://proxy.example:1080');
  assert.equal(calls[0].source, 'manual');
  assert.deepStrictEqual(broadcasts[0], {
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      source: 'manual',
      proxyUrl: 'socks5h://proxy.example:1080',
      displayName: 'socks5://proxy.example:1080',
    },
    plusCheckoutConversionProxySource: 'manual',
    plusCheckoutConversionProxyUrl: 'socks5h://proxy.example:1080',
    plusCheckoutConversionProxy711Region: '',
  });
});

test('SWITCH_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL broadcasts direct mode and preserves saved proxy draft', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  const calls = [];

  const router = api.createMessageRouter({
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    buildPersistentSettingsPayload: (value) => value,
    checkoutConversionProxyManager: {
      switchManualSession: async (options) => {
        calls.push(options);
        return {
          switched: true,
          alreadyActive: false,
          displayName: '无代理模式',
          session: {
            active: true,
            mode: 'manual',
            source: 'direct',
            proxyUrl: '',
            displayName: '无代理模式',
            entry: null,
            baseSnapshot: { applied: true },
          },
        };
      },
    },
    getState: async () => ({
      autoRunning: false,
      plusCheckoutConversionProxyUrl: 'socks5h://proxy.example:1080',
      plusCheckoutConversionProxySource: 'manual',
      plusCheckoutConversionProxy711Region: 'US',
    }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
  });

  const response = await router.handleMessage({
    type: 'SWITCH_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL',
    source: 'sidepanel',
    payload: { source: 'direct', proxyUrl: '' },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].source, 'direct');
  assert.deepStrictEqual(broadcasts[0], {
    plusCheckoutConversionProxyManualSession: {
      active: true,
      mode: 'manual',
      source: 'direct',
      proxyUrl: '',
      displayName: '无代理模式',
      entry: null,
      baseSnapshot: { applied: true },
    },
    plusCheckoutConversionProxySource: 'direct',
    plusCheckoutConversionProxyUrl: '',
    plusCheckoutConversionProxy711Region: 'US',
  });
});

test('NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711 broadcasts next manual session when auto-run is idle', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  const broadcasts = [];
  const calls = [];
  const nextSession = {
    active: true,
    mode: 'manual',
    source: '711proxy_pool',
    provider: '711proxy',
    proxyUrl: 'http://user-b:pass-b@proxy-b.example:8002',
    displayName: 'http://proxy-b.example:8002',
    requestedRegion: 'US',
    resolvedRegion: 'US',
    selectedEntryDisplayName: 'http://proxy-b.example:8002',
    candidateIndex: 1,
    poolSize: 2,
    exitIp: '203.0.113.20',
    exitRegion: 'US',
  };

  const router = api.createMessageRouter({
    broadcastDataUpdate: (payload) => broadcasts.push(payload),
    buildPersistentSettingsPayload: (value) => value,
    checkoutConversionProxyManager: {
      switchManualSessionToNext711Proxy: async (options) => {
        calls.push(options);
        return {
          switched: true,
          skipped: false,
          exitChanged: true,
          displayName: nextSession.displayName,
          session: nextSession,
        };
      },
    },
    getState: async () => ({
      autoRunning: false,
      plusCheckoutConversionProxySource: '711proxy_pool',
      plusCheckoutConversionProxy711Region: 'US',
    }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
  });

  const response = await router.handleMessage({
    type: 'NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711',
    source: 'sidepanel',
    payload: {
      source: '711proxy_pool',
      proxy711Region: 'US',
      ipProxyStateOverride: { ipProxyAutoRefreshPoolOnExhausted: true },
    },
  }, {});

  assert.equal(response.ok, true);
  assert.equal(response.switched, true);
  assert.equal(response.exitChanged, true);
  assert.equal(response.displayName, 'http://proxy-b.example:8002');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].source, '711proxy_pool');
  assert.equal(calls[0].proxy711Region, 'US');
  assert.equal(calls[0].state.ipProxyAutoRefreshPoolOnExhausted, true);
  assert.deepStrictEqual(broadcasts[0], {
    plusCheckoutConversionProxyManualSession: nextSession,
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
  });
});

test('NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711 is rejected while auto-run is locked', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let called = false;

  const router = api.createMessageRouter({
    checkoutConversionProxyManager: {
      switchManualSessionToNext711Proxy: async () => {
        called = true;
        return { switched: true };
      },
    },
    getState: async () => ({ autoRunning: true }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
  });

  await assert.rejects(
    () => router.handleMessage({
      type: 'NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711',
      source: 'sidepanel',
      payload: { source: '711proxy_pool' },
    }, {}),
    /自动流程运行中/
  );
  assert.equal(called, false);
});

test('CANCEL_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL is rejected while auto-run is locked', async () => {
  const source = fs.readFileSync('background/message-router.js', 'utf8');
  const globalScope = { console };
  const api = new Function('self', `${source}; return self.MultiPageBackgroundMessageRouter;`)(globalScope);
  let called = false;

  const router = api.createMessageRouter({
    checkoutConversionProxyManager: {
      cancelManualSession: async () => {
        called = true;
        return { cancelled: true };
      },
    },
    getState: async () => ({ autoRunning: true }),
    isAutoRunLockedState: (state) => Boolean(state.autoRunning),
  });

  await assert.rejects(
    () => router.handleMessage({
      type: 'CANCEL_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL',
      source: 'sidepanel',
      payload: {},
    }, {}),
    /自动流程运行中/
  );
  assert.equal(called, false);
});
