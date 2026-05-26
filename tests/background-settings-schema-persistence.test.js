const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const flowRegistrySource = fs.readFileSync('shared/flow-registry.js', 'utf8');
const settingsSchemaSource = fs.readFileSync('shared/settings-schema.js', 'utf8');
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

function buildHarness(extra = '') {
  return new Function(`
const self = {};
${flowRegistrySource}
${settingsSchemaSource}
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const DEFAULT_SUB2API_GROUP_NAMES = ['codex', 'openai-plus'];
const SETTINGS_SCHEMA_VIEW_KEYS = Object.freeze([
  'activeFlowId',
  'openaiIntegrationTargetId',
  'panelMode',
  'kiroTargetId',
  'vpsUrl',
  'vpsPassword',
  'localCpaStep9Mode',
  'sub2apiUrl',
  'sub2apiEmail',
  'sub2apiPassword',
  'sub2apiGroupName',
  'sub2apiGroupNames',
  'sub2apiAccountPriority',
  'sub2apiDefaultProxyName',
  'codex2apiUrl',
  'codex2apiAdminKey',
  'customPassword',
  'signupMethod',
  'phoneVerificationEnabled',
  'phoneSignupReloginAfterBindEmailEnabled',
  'plusModeEnabled',
  'phonePlusModeEnabled',
  'plusPaymentMethod',
  'plusAccountAccessStrategy',
  'plusCheckoutCreatePreWaitSeconds',
  'plusCheckoutOpenStableWaitSeconds',
  'plusCheckoutConversionProxySource',
  'plusCheckoutConversionProxyUrl',
  'plusCheckoutConversionProxy711Region',
  'paypalGeneratedProfile',
  'mailProvider',
  'ipProxyEnabled',
  'ipProxyService',
  'ipProxyMode',
  'kiroRsUrl',
  'kiroRsKey',
  'stepExecutionRangeByFlow',
]);
const SETTINGS_SCHEMA_VIEW_KEY_SET = new Set(SETTINGS_SCHEMA_VIEW_KEYS);
const PERSISTED_SETTING_DEFAULTS = {
  activeFlowId: DEFAULT_ACTIVE_FLOW_ID,
  panelMode: 'cpa',
  signupMethod: 'email',
  plusModeEnabled: false,
  phonePlusModeEnabled: false,
  plusPaymentMethod: 'paypal',
  plusAccountAccessStrategy: 'oauth',
  plusCheckoutCreatePreWaitSeconds: 10,
  plusCheckoutOpenStableWaitSeconds: 20,
  plusCheckoutConversionProxySource: 'manual',
  plusCheckoutConversionProxyUrl: '',
  plusCheckoutConversionProxy711Region: '',
  paypalGeneratedProfile: {
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    password: '',
    firstName: '',
    lastName: '',
    birthday: '',
    countryCode: '',
    address1: '',
    city: '',
    region: '',
    postalCode: '',
    generatedFromCountry: '',
    generatedAt: 0,
  },
  phoneVerificationEnabled: false,
  mailProvider: '163',
  ipProxyEnabled: false,
  ipProxyService: '711proxy',
  ipProxyMode: 'account',
  ipProxyServiceProfiles: {},
  ipProxyPoolTargetCount: '20',
  ipProxySwitchIpRoundCount: '1',
  ipProxyAutoRefreshPoolOnExhausted: false,
  ipProxyApiRouteMode: 'direct',
  ipProxySpecialDomainRouteMode: 'local_proxy',
  kiroTargetId: 'kiro-rs',
  kiroRsUrl: '',
  kiroRsKey: '',
  stepExecutionRangeByFlow: {},
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const PERSISTED_SETTINGS_SCHEMA_KEYS = ['settingsSchemaVersion', 'settingsState'];
const LEGACY_AUTO_STEP_DELAY_KEYS = [];
const LEGACY_VERIFICATION_RESEND_COUNT_KEYS = [];
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const SIGNUP_METHOD_EMAIL = 'email';
const SIGNUP_METHOD_PHONE = 'phone';
function isPlainObjectValue(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function normalizePayPalGeneratedProfileCountryCode(value = '') {
  const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return /^[A-Z]{2}$/.test(normalized) ? normalized : '';
}
function normalizePayPalGeneratedProfile(value = {}) {
  const source = isPlainObjectValue(value) ? value : {};
  const defaults = PERSISTED_SETTING_DEFAULTS.paypalGeneratedProfile;
  const next = { ...defaults };
  Object.keys(defaults).forEach((field) => {
    if (field === 'generatedAt') {
      next.generatedAt = Math.max(0, Number(source.generatedAt) || 0);
      return;
    }
    if (field === 'countryCode' || field === 'generatedFromCountry') {
      next[field] = normalizePayPalGeneratedProfileCountryCode(source[field]);
      return;
    }
    next[field] = String(source[field] || '').trim();
  });
  return next;
}
function normalizePanelMode(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'sub2api' || normalized === 'codex2api' ? normalized : 'cpa';
}
function normalizeSignupMethod(value = '') {
  return String(value || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
function normalizePlusPaymentMethod(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'gopay' || normalized === 'gpc-helper' ? normalized : 'paypal';
}
${extractFunction('normalizePlusAccountAccessStrategy')}
${extractFunction('normalizePlusCheckoutConversionProxySource')}
${extractFunction('normalizePlusCheckoutConversionProxy711Region')}
function normalizeSub2ApiGroupNames(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry || '').trim()).filter(Boolean) : [];
}
function normalizeCloudflareDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudflareTempEmailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudMailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeMailProvider(value = '') { return String(value || '163').trim().toLowerCase() || '163'; }
function normalizeStepExecutionRangeByFlow(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function normalizeIpProxyProviderValue(value) { return String(value || '711proxy').trim() || '711proxy'; }
function normalizeIpProxyMode(value) { return String(value || 'account').trim() || 'account'; }
function normalizeIpProxySpecialDomainRouteMode(value) {
  const normalized = String(value || 'local_proxy').trim().toLowerCase();
  return ['local_proxy', 'direct', 'provider_proxy'].includes(normalized) ? normalized : 'local_proxy';
}
function normalizeIpProxyApiRouteMode(value) {
  const normalized = String(value || 'direct').trim().toLowerCase();
  return ['direct', 'local_proxy', 'provider_proxy'].includes(normalized) ? normalized : 'direct';
}
function normalizeIpProxyServiceProfile(value = {}) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    mode: normalizeIpProxyMode(raw.mode),
    apiUrl: String(raw.apiUrl || '').trim(),
    accountList: normalizeIpProxyAccountList(raw.accountList || ''),
    accountSessionPrefix: normalizeIpProxyAccountSessionPrefix(raw.accountSessionPrefix || ''),
    accountLifeMinutes: normalizeIpProxyAccountLifeMinutes(raw.accountLifeMinutes || ''),
    poolTargetCount: normalizeIpProxyPoolTargetCount(raw.poolTargetCount || '', 20),
    switchIpRoundCount: normalizeIpProxyPoolTargetCount(raw.switchIpRoundCount || '', 1),
    autoRefreshPoolOnExhausted: Boolean(raw.autoRefreshPoolOnExhausted),
    host: String(raw.host || '').trim(),
    port: String(raw.port || '').trim(),
    protocol: normalizeIpProxyProtocol(raw.protocol),
    username: String(raw.username || '').trim(),
    password: String(raw.password || ''),
    region: String(raw.region || '').trim(),
    specialDomainRouteMode: normalizeIpProxySpecialDomainRouteMode(raw.specialDomainRouteMode),
    apiRouteMode: normalizeIpProxyApiRouteMode(raw.apiRouteMode),
  };
}
function normalizeIpProxyAccountList(value) { return String(value || ''); }
function normalizeIpProxyAccountSessionPrefix(value) { return String(value || ''); }
function normalizeIpProxyAccountLifeMinutes(value) { return String(value || ''); }
function normalizeIpProxyPoolTargetCount(value, fallback = 20) { return String(value || fallback); }
function normalizeIpProxyServiceProfiles(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const profiles = {};
  Object.entries(source).forEach(([service, profile]) => {
    profiles[normalizeIpProxyProviderValue(service)] = normalizeIpProxyServiceProfile(profile);
  });
  return profiles;
}
function buildIpProxyServiceProfileFromState(state = {}) {
  return normalizeIpProxyServiceProfile({
    mode: state.ipProxyMode,
    apiUrl: state.ipProxyApiUrl,
    accountList: state.ipProxyAccountList,
    accountSessionPrefix: state.ipProxyAccountSessionPrefix,
    accountLifeMinutes: state.ipProxyAccountLifeMinutes,
    poolTargetCount: state.ipProxyPoolTargetCount,
    switchIpRoundCount: state.ipProxySwitchIpRoundCount,
    autoRefreshPoolOnExhausted: state.ipProxyAutoRefreshPoolOnExhausted,
    host: state.ipProxyHost,
    port: state.ipProxyPort,
    protocol: state.ipProxyProtocol,
    username: state.ipProxyUsername,
    password: state.ipProxyPassword,
    region: state.ipProxyRegion,
    specialDomainRouteMode: state.ipProxySpecialDomainRouteMode,
    apiRouteMode: state.ipProxyApiRouteMode,
  });
}
function normalizeIpProxyAutoRefreshPoolOnExhausted(value) { return Boolean(value); }
function normalizeIpProxyPort(value) { return String(value || '').trim(); }
function normalizeIpProxyProtocol(value) { return String(value || 'http').trim() || 'http'; }
function resolveSignupMethod(state = {}) {
  const activeFlowId = String(state?.activeFlowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID;
  if (activeFlowId === 'kiro') {
    return 'email';
  }
  return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
function resolveLegacyAutoStepDelaySeconds() { return undefined; }
${extractFunction('normalizePersistentSettingValue')}
${extractFunction('getSettingsSchemaApi')}
${extractFunction('projectSettingsSchemaView')}
${extractFunction('setSettingsStatePatchValue')}
${extractFunction('mergeSettingsStatePatch')}
${extractFunction('buildSettingsStatePatchFromFlatUpdates')}
${extractFunction('buildPersistedSettingsStoragePayload')}
${extractFunction('buildPersistentSettingsPayload')}
${extractFunction('getPersistedSettings')}
${extractFunction('setPersistentSettings')}
${extra}
return {
  buildPersistentSettingsPayload,
  getPersistedSettings,
  setPersistentSettings,
  getRequestedKeys: typeof getRequestedKeys === 'function' ? getRequestedKeys : () => [],
  getPersistedWrites: typeof getPersistedWrites === 'function' ? getPersistedWrites : () => [],
  getRemovedKeys: typeof getRemovedKeys === 'function' ? getRemovedKeys : () => [],
};
`)();
}

test('buildPersistentSettingsPayload writes canonical settings schema into persisted payloads when defaults are materialized', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    activeFlowId: 'kiro',
    kiroRsUrl: 'https://kiro.example.com/admin',
    kiroRsKey: 'secret-key',
  }, { fillDefaults: true });

  assert.equal(payload.activeFlowId, 'kiro');
  assert.equal(payload.kiroTargetId, 'kiro-rs');
  assert.equal(payload.kiroRsUrl, 'https://kiro.example.com/admin');
  assert.equal(payload.kiroRsKey, 'secret-key');
  assert.equal(Object.prototype.hasOwnProperty.call(payload, 'kiroRegion'), false);
  assert.equal(payload.settingsSchemaVersion, 4);
  assert.equal(payload.settingsState.activeFlowId, 'kiro');
  assert.equal(payload.settingsState.flows.kiro.targetId, 'kiro-rs');
  assert.equal(
    payload.settingsState.flows.kiro.targets['kiro-rs'].baseUrl,
    'https://kiro.example.com/admin'
  );
});

test('buildPersistentSettingsPayload preserves flat proxy round and tail-refresh settings', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    ipProxyMode: 'api',
    ipProxyPoolTargetCount: '25',
    ipProxySwitchIpRoundCount: '3',
    ipProxyAutoRefreshPoolOnExhausted: true,
  }, { fillDefaults: true });

  assert.equal(payload.ipProxyPoolTargetCount, '25');
  assert.equal(payload.ipProxySwitchIpRoundCount, '3');
  assert.equal(payload.ipProxyAutoRefreshPoolOnExhausted, true);
});

test('buildPersistentSettingsPayload persists Plus checkout conversion proxy into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxyUrl: ' socks5h://user:pass@proxy.example:1080 ',
    plusCheckoutConversionProxy711Region: ' us ',
  }, { fillDefaults: true });

  assert.equal(payload.plusCheckoutConversionProxySource, '711proxy_pool');
  assert.equal(payload.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(payload.plusCheckoutConversionProxy711Region, 'US');
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutConversionProxySource, '711proxy_pool');
  assert.equal(
    payload.settingsState.flows.openai.plus.plusCheckoutConversionProxyUrl,
    'socks5h://user:pass@proxy.example:1080'
  );
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutConversionProxy711Region, 'US');
});

test('buildPersistentSettingsPayload persists direct Plus checkout conversion proxy source into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    plusCheckoutConversionProxySource: 'direct',
    plusCheckoutConversionProxyUrl: ' socks5h://user:pass@proxy.example:1080 ',
    plusCheckoutConversionProxy711Region: ' us ',
  }, { fillDefaults: true });

  assert.equal(payload.plusCheckoutConversionProxySource, 'direct');
  assert.equal(payload.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(payload.plusCheckoutConversionProxy711Region, 'US');
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutConversionProxySource, 'direct');
});

test('buildPersistentSettingsPayload persists Plus checkout wait settings into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    plusCheckoutCreatePreWaitSeconds: ' 16.8 ',
    plusCheckoutOpenStableWaitSeconds: ' 29.2 ',
  }, { fillDefaults: true });

  assert.equal(payload.plusCheckoutCreatePreWaitSeconds, 16);
  assert.equal(payload.plusCheckoutOpenStableWaitSeconds, 29);
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutCreatePreWaitSeconds, 16);
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutOpenStableWaitSeconds, 29);
});

test('buildPersistentSettingsPayload persists PayPal generated profile into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    paypalGeneratedProfile: {
      email: ' user@example.com ',
      phone: ' +1 555 0100 ',
      cardNumber: ' 4147200000000000 ',
      cardExpiry: ' 12 / 29 ',
      cardCvv: ' 123 ',
      password: ' Secret123! ',
      firstName: ' Ada ',
      lastName: ' Lovelace ',
      birthday: ' 2001-02-03 ',
      countryCode: ' jp ',
      address1: ' 1 Marunouchi ',
      city: ' Chiyoda ',
      region: ' Tokyo ',
      postalCode: ' 100-0005 ',
      generatedFromCountry: ' de ',
      generatedAt: '12345',
    },
  }, { fillDefaults: true });

  const expected = {
    email: 'user@example.com',
    phone: '+1 555 0100',
    cardNumber: '4147200000000000',
    cardExpiry: '12 / 29',
    cardCvv: '123',
    password: 'Secret123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
    birthday: '2001-02-03',
    countryCode: 'JP',
    address1: '1 Marunouchi',
    city: 'Chiyoda',
    region: 'Tokyo',
    postalCode: '100-0005',
    generatedFromCountry: 'DE',
    generatedAt: 12345,
  };

  assert.deepEqual(payload.paypalGeneratedProfile, expected);
  assert.deepEqual(payload.settingsState.flows.openai.plus.paypalGeneratedProfile, expected);
});

test('buildPersistentSettingsPayload derives switch-IP round count from active service profile', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    ipProxyService: '711proxy',
    ipProxyMode: 'api',
    ipProxyServiceProfiles: {
      '711proxy': {
        mode: 'api',
        poolTargetCount: '12',
        switchIpRoundCount: '4',
        autoRefreshPoolOnExhausted: true,
      },
    },
  }, { fillDefaults: true });

  assert.equal(payload.ipProxyPoolTargetCount, '12');
  assert.equal(payload.ipProxySwitchIpRoundCount, '4');
  assert.equal(payload.ipProxyServiceProfiles['711proxy'].switchIpRoundCount, '4');
  assert.equal(payload.ipProxyAutoRefreshPoolOnExhausted, true);
});

test('buildPersistentSettingsPayload accepts schema-only input when requireKnownKeys is enabled', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      activeFlowId: 'kiro',
      services: {
        account: { customPassword: '' },
        email: { provider: '163' },
        proxy: { enabled: false, provider: '711proxy', mode: 'account' },
      },
      flows: {
        openai: {
          integrationTargetId: 'cpa',
          integrationTargets: {
            cpa: {
              vpsUrl: '',
              vpsPassword: '',
              localCpaStep9Mode: 'submit',
            },
            sub2api: {
              sub2apiUrl: '',
              sub2apiEmail: '',
              sub2apiPassword: '',
              sub2apiGroupName: 'codex',
              sub2apiGroupNames: ['codex', 'openai-plus'],
              sub2apiAccountPriority: 1,
              sub2apiDefaultProxyName: '',
            },
            codex2api: {
              codex2apiUrl: '',
              codex2apiAdminKey: '',
            },
          },
          signup: {
            signupMethod: 'email',
            phoneVerificationEnabled: false,
            phoneSignupReloginAfterBindEmailEnabled: false,
          },
          plus: {
            plusModeEnabled: false,
            plusPaymentMethod: 'paypal',
            plusAccountAccessStrategy: 'oauth',
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
              apiKey: 'schema-only-key',
            },
          },
          autoRun: {
            stepExecutionRange: { enabled: true, fromStep: 1, toStep: 9 },
          },
        },
      },
    },
  }, { requireKnownKeys: true });

  assert.equal(payload.activeFlowId, 'kiro');
  assert.equal(payload.kiroTargetId, 'kiro-rs');
  assert.equal(payload.kiroRsUrl, 'https://kiro.example.com/admin');
  assert.equal(payload.kiroRsKey, 'schema-only-key');
  assert.equal(Object.prototype.hasOwnProperty.call(payload, 'kiroRegion'), false);
  assert.equal(payload.settingsSchemaVersion, 4);
  assert.equal(payload.settingsState.flows.openai.plus.plusAccountAccessStrategy, 'oauth');
});

test('buildPersistentSettingsPayload roundtrips flat Phone Plus settings with forced constraints', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    activeFlowId: 'openai',
    panelMode: 'cpa',
    plusModeEnabled: true,
    phonePlusModeEnabled: true,
    phoneVerificationEnabled: false,
    signupMethod: 'email',
    plusAccountAccessStrategy: 'sub2api_codex_session',
  }, { fillDefaults: true });

  assert.equal(payload.phonePlusModeEnabled, true);
  assert.equal(payload.plusModeEnabled, false);
  assert.equal(payload.phoneVerificationEnabled, true);
  assert.equal(payload.signupMethod, 'phone');
  assert.equal(payload.plusAccountAccessStrategy, 'oauth');
  assert.equal(payload.settingsState.flows.openai.plus.phonePlusModeEnabled, true);
  assert.equal(payload.settingsState.flows.openai.plus.plusModeEnabled, false);
  assert.equal(payload.settingsState.flows.openai.signup.phoneVerificationEnabled, true);
  assert.equal(payload.settingsState.flows.openai.signup.signupMethod, 'phone');
  assert.equal(payload.settingsState.flows.openai.plus.plusAccountAccessStrategy, 'oauth');
});

test('buildPersistentSettingsPayload projects nested Phone Plus settings into flat view and canonical schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      activeFlowId: 'openai',
      services: {
        account: { customPassword: '' },
        email: { provider: '163' },
        proxy: { enabled: false, provider: '711proxy', mode: 'account' },
      },
      flows: {
        openai: {
          integrationTargetId: 'cpa',
          integrationTargets: {
            cpa: {
              vpsUrl: '',
              vpsPassword: '',
              localCpaStep9Mode: 'submit',
            },
            sub2api: {
              sub2apiUrl: '',
              sub2apiEmail: '',
              sub2apiPassword: '',
              sub2apiGroupName: 'codex',
              sub2apiGroupNames: ['codex', 'openai-plus'],
              sub2apiAccountPriority: 1,
              sub2apiDefaultProxyName: '',
            },
            codex2api: {
              codex2apiUrl: '',
              codex2apiAdminKey: '',
            },
          },
          signup: {
            signupMethod: 'email',
            phoneVerificationEnabled: false,
            phoneSignupReloginAfterBindEmailEnabled: false,
          },
          plus: {
            plusModeEnabled: true,
            phonePlusModeEnabled: true,
            plusPaymentMethod: 'paypal',
            plusAccountAccessStrategy: 'cpa_codex_session',
          },
          autoRun: {
            stepExecutionRange: { enabled: false, fromStep: 1, toStep: 11 },
          },
        },
      },
    },
  }, { requireKnownKeys: true });

  assert.equal(payload.phonePlusModeEnabled, true);
  assert.equal(payload.plusModeEnabled, false);
  assert.equal(payload.phoneVerificationEnabled, true);
  assert.equal(payload.signupMethod, 'phone');
  assert.equal(payload.plusAccountAccessStrategy, 'oauth');
  assert.equal(payload.settingsState.flows.openai.plus.phonePlusModeEnabled, true);
  assert.equal(payload.settingsState.flows.openai.plus.plusModeEnabled, false);
  assert.equal(payload.settingsState.flows.openai.signup.phoneVerificationEnabled, true);
  assert.equal(payload.settingsState.flows.openai.signup.signupMethod, 'phone');
});

test('getPersistedSettings reads schema keys alongside legacy flat settings keys', async () => {
  const api = buildHarness(`
let requestedKeys = [];
const chrome = {
  storage: {
    local: {
      async get(keys) {
        requestedKeys = Array.isArray(keys) ? [...keys] : [];
        return {};
      },
    },
  },
};
function getRequestedKeys() {
  return requestedKeys;
}
`);

  const state = await api.getPersistedSettings();

  assert.ok(api.getRequestedKeys().includes('settingsSchemaVersion'));
  assert.ok(api.getRequestedKeys().includes('settingsState'));
  assert.ok(api.getRequestedKeys().includes('plusAccountAccessStrategy'));
  assert.equal(state.settingsSchemaVersion, 4);
  assert.equal(state.settingsState.activeFlowId, 'openai');
});

test('getPersistedSettings can project schema-only storage back into legacy flat settings', async () => {
  const api = buildHarness(`
const chrome = {
  storage: {
    local: {
      async get() {
        return {
          settingsSchemaVersion: 4,
          settingsState: {
            activeFlowId: 'kiro',
            services: {
              account: { customPassword: '' },
              email: { provider: 'hotmail' },
              proxy: { enabled: true, provider: '711proxy', mode: 'account' },
            },
            flows: {
              openai: {
                integrationTargetId: 'sub2api',
                integrationTargets: {
                  cpa: {
                    vpsUrl: '',
                    vpsPassword: '',
                    localCpaStep9Mode: 'submit',
                  },
                  sub2api: {
                    sub2apiUrl: '',
                    sub2apiEmail: '',
                    sub2apiPassword: '',
                    sub2apiGroupName: 'codex',
                    sub2apiGroupNames: ['codex', 'openai-plus'],
                    sub2apiAccountPriority: 1,
                    sub2apiDefaultProxyName: '',
                  },
                  codex2api: {
                    codex2apiUrl: '',
                    codex2apiAdminKey: '',
                  },
                },
                signup: {
                  signupMethod: 'email',
                  phoneVerificationEnabled: false,
                  phoneSignupReloginAfterBindEmailEnabled: false,
                },
                plus: {
                  plusModeEnabled: false,
                  plusPaymentMethod: 'paypal',
                  plusAccountAccessStrategy: 'sub2api_codex_session',
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
                    apiKey: 'stored-key',
                  },
                },
                autoRun: {
                  stepExecutionRange: { enabled: true, fromStep: 1, toStep: 9 },
                },
              },
            },
          },
        };
      },
    },
  },
};
`);

  const state = await api.getPersistedSettings();

  assert.equal(state.activeFlowId, 'kiro');
  assert.equal(state.panelMode, 'sub2api');
  assert.equal(state.mailProvider, 'hotmail');
  assert.equal(state.ipProxyEnabled, true);
  assert.equal(state.kiroRsUrl, 'https://kiro.example.com/admin');
  assert.equal(state.kiroRsKey, 'stored-key');
  assert.equal(state.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(Object.prototype.hasOwnProperty.call(state, 'kiroRegion'), false);
  assert.deepEqual(state.stepExecutionRangeByFlow.kiro, {
    enabled: true,
    fromStep: 1,
    toStep: 9,
  });
});

test('setPersistentSettings materializes canonical schema keys for schema-only updates', async () => {
  const api = buildHarness(`
const persistedWrites = [];
const removedKeys = [];
const chrome = {
  storage: {
    local: {
      async get() {
        return {};
      },
      async remove(keys) {
        removedKeys.push(...(Array.isArray(keys) ? keys : [keys]));
      },
      async set(payload) {
        persistedWrites.push(JSON.parse(JSON.stringify(payload)));
      },
    },
  },
};
function getPersistedWrites() {
  return persistedWrites;
}
function getRemovedKeys() {
  return removedKeys;
}
`);

  const persisted = await api.setPersistentSettings({
    settingsSchemaVersion: 4,
    settingsState: {
      activeFlowId: 'kiro',
      services: {
        account: { customPassword: '' },
        email: { provider: '163' },
        proxy: { enabled: false, provider: '711proxy', mode: 'account' },
      },
      flows: {
        openai: {
          integrationTargetId: 'cpa',
          integrationTargets: {
            cpa: {
              vpsUrl: '',
              vpsPassword: '',
              localCpaStep9Mode: 'submit',
            },
            sub2api: {
              sub2apiUrl: '',
              sub2apiEmail: '',
              sub2apiPassword: '',
              sub2apiGroupName: 'codex',
              sub2apiGroupNames: ['codex', 'openai-plus'],
              sub2apiAccountPriority: 1,
              sub2apiDefaultProxyName: '',
            },
            codex2api: {
              codex2apiUrl: '',
              codex2apiAdminKey: '',
            },
          },
          signup: {
            signupMethod: 'email',
            phoneVerificationEnabled: false,
            phoneSignupReloginAfterBindEmailEnabled: false,
          },
          plus: {
            plusModeEnabled: false,
            plusPaymentMethod: 'paypal',
            plusAccountAccessStrategy: 'sub2api_codex_session',
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
              apiKey: 'nested-only-key',
            },
          },
          autoRun: {
            stepExecutionRange: { enabled: true, fromStep: 1, toStep: 9 },
          },
        },
      },
    },
  });

  const write = api.getPersistedWrites().at(-1);

  assert.equal(persisted.activeFlowId, 'kiro');
  assert.equal(persisted.kiroTargetId, 'kiro-rs');
  assert.equal(persisted.kiroRsUrl, 'https://kiro.example.com/admin');
  assert.equal(persisted.kiroRsKey, 'nested-only-key');
  assert.equal(persisted.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(Object.prototype.hasOwnProperty.call(persisted, 'kiroRegion'), false);
  assert.equal(persisted.settingsSchemaVersion, 4);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'activeFlowId'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'kiroRsUrl'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'kiroRsKey'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'kiroRegion'), false);
  assert.equal(write.settingsSchemaVersion, 4);
  assert.equal(write.settingsState.activeFlowId, 'kiro');
  assert.equal(write.settingsState.flows.openai.plus.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(write.settingsState.flows.kiro.targetId, 'kiro-rs');
  assert.ok(api.getRemovedKeys().includes('panelMode'));
  assert.ok(api.getRemovedKeys().includes('kiroRsUrl'));
});

test('setPersistentSettings mirrors flat mail provider updates into canonical settingsState', async () => {
  const api = buildHarness(`
const persistedWrites = [];
const removedKeys = [];
const chrome = {
  storage: {
    local: {
      async get() {
        return {
          settingsSchemaVersion: 4,
          settingsState: {
            activeFlowId: 'openai',
            services: {
              account: { customPassword: '' },
              email: { provider: '163' },
              proxy: { enabled: false, provider: '711proxy', mode: 'account' },
            },
            flows: {},
          },
        };
      },
      async remove(keys) {
        removedKeys.push(...(Array.isArray(keys) ? keys : [keys]));
      },
      async set(payload) {
        persistedWrites.push(JSON.parse(JSON.stringify(payload)));
      },
    },
  },
};
function getPersistedWrites() {
  return persistedWrites;
}
function getRemovedKeys() {
  return removedKeys;
}
`);

  const persisted = await api.setPersistentSettings({
    mailProvider: 'cloudflare-temp-email',
  });
  const write = api.getPersistedWrites().at(-1);

  assert.equal(persisted.mailProvider, 'cloudflare-temp-email');
  assert.equal(persisted.settingsState.services.email.provider, 'cloudflare-temp-email');
  assert.equal(write.settingsState.services.email.provider, 'cloudflare-temp-email');
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'mailProvider'), false);
});

test('setPersistentSettings mirrors flat schema updates without resetting other canonical settings', async () => {
  const api = buildHarness(`
const persistedWrites = [];
const removedKeys = [];
const chrome = {
  storage: {
    local: {
      async get() {
        return {
          settingsSchemaVersion: 4,
          settingsState: {
            activeFlowId: 'openai',
            services: {
              account: { customPassword: 'old-password' },
              email: { provider: '163' },
              proxy: { enabled: false, provider: '711proxy', mode: 'account' },
            },
            flows: {
              openai: {
                integrationTargetId: 'cpa',
                integrationTargets: {
                  cpa: {
                    vpsUrl: 'https://old-cpa.example.com',
                    vpsPassword: 'old-vps-password',
                    localCpaStep9Mode: 'submit',
                  },
                  sub2api: {
                    sub2apiUrl: 'https://sub2api.example.com',
                    sub2apiEmail: 'owner@example.com',
                    sub2apiPassword: 'sub2api-secret',
                    sub2apiGroupName: 'kept-group',
                    sub2apiGroupNames: ['kept-group'],
                    sub2apiAccountPriority: 7,
                    sub2apiDefaultProxyName: 'proxy-a',
                  },
                  codex2api: {
                    codex2apiUrl: 'https://codex2api.example.com',
                    codex2apiAdminKey: 'codex-key',
                  },
                },
                signup: {
                  signupMethod: 'email',
                  phoneVerificationEnabled: false,
                  phoneSignupReloginAfterBindEmailEnabled: false,
                },
                plus: {
                  plusModeEnabled: false,
                  plusPaymentMethod: 'paypal',
                  plusAccountAccessStrategy: 'oauth',
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
                    apiKey: 'kiro-key',
                  },
                },
                autoRun: {
                  stepExecutionRange: { enabled: false, fromStep: 1, toStep: 9 },
                },
              },
            },
          },
        };
      },
      async remove(keys) {
        removedKeys.push(...(Array.isArray(keys) ? keys : [keys]));
      },
      async set(payload) {
        persistedWrites.push(JSON.parse(JSON.stringify(payload)));
      },
    },
  },
};
function getPersistedWrites() {
  return persistedWrites;
}
function getRemovedKeys() {
  return removedKeys;
}
`);

  const persisted = await api.setPersistentSettings({
    panelMode: 'sub2api',
    mailProvider: 'cloudflare-temp-email',
    ipProxyEnabled: true,
    ipProxyMode: 'api',
    ipProxySpecialDomainRouteMode: 'provider_proxy',
    stepExecutionRangeByFlow: {
      openai: { enabled: true, fromStep: 2, toStep: 4 },
    },
  });
  const write = api.getPersistedWrites().at(-1);

  assert.equal(persisted.panelMode, 'sub2api');
  assert.equal(persisted.mailProvider, 'cloudflare-temp-email');
  assert.equal(persisted.ipProxyEnabled, true);
  assert.equal(persisted.ipProxyMode, 'api');
  assert.equal(persisted.ipProxySpecialDomainRouteMode, 'provider_proxy');
  assert.deepEqual(persisted.stepExecutionRangeByFlow.openai, {
    enabled: true,
    fromStep: 2,
    toStep: 4,
  });
  assert.equal(write.settingsState.flows.openai.integrationTargetId, 'sub2api');
  assert.equal(write.settingsState.services.email.provider, 'cloudflare-temp-email');
  assert.equal(write.settingsState.services.proxy.enabled, true);
  assert.equal(write.settingsState.services.proxy.mode, 'api');
  assert.deepEqual(write.settingsState.flows.openai.autoRun.stepExecutionRange, {
    enabled: true,
    fromStep: 2,
    toStep: 4,
  });
  assert.equal(write.settingsState.flows.openai.integrationTargets.sub2api.sub2apiUrl, 'https://sub2api.example.com');
  assert.equal(write.settingsState.flows.openai.integrationTargets.sub2api.sub2apiEmail, 'owner@example.com');
  assert.equal(write.settingsState.flows.kiro.targets['kiro-rs'].apiKey, 'kiro-key');
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'mailProvider'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'panelMode'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'ipProxyMode'), false);
});
