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
const DEFAULT_IP_PROXY_ACTIVATION_STEP = 1;
const DEFAULT_SUB2API_GROUP_NAMES = ['codex', 'openai-plus'];
const DEFAULT_SUB2API_ACCOUNT_PRIORITY = 1;
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
  'sub2apiReloginEnabled',
  'sub2apiReloginAccountPoolText',
  'sub2apiReloginAccountPoolUsage',
  'sub2apiReloginCurrentAccount',
  'codex2apiUrl',
  'codex2apiAdminKey',
  'customPassword',
  'signupMethod',
  'phoneVerificationEnabled',
  'phoneSignupReloginAfterBindEmailEnabled',
  'phoneSignupPhonePrefixedEmailEnabled',
  'browserFingerprintEnabled',
  'browserFingerprintLevel',
  'browserFingerprintLanguage',
  'oauthOpenAfterRefreshWaitSeconds',
  'plusModeEnabled',
  'phonePlusModeEnabled',
  'plusPaymentMethod',
  'plusAccountAccessStrategy',
  'plusCheckoutVerificationFailureStrategy',
  'plusCheckAllowedRegions',
  'plusCheckoutCreatePreWaitSeconds',
  'plusCheckoutOpenStableWaitSeconds',
  'plusHostedCheckoutCardPreWaitSeconds',
  'plusCheckoutConversionProxySource',
  'plusCheckoutConversionProxyUrl',
  'plusCheckoutConversionProxy711Region',
  'hostedCheckoutSecurityChallengeEnabled',
  'hostedCheckoutVerificationPopupDelaySeconds',
  'hostedCheckoutFirstDirectResendEnabled',
  'hostedCheckoutFirstResendWaitSeconds',
  'hostedCheckoutSubsequentResendWaitSeconds',
  'hostedCheckoutVerificationPollAttempts',
  'hostedCheckoutVerificationPollIntervalSeconds',
  'hostedCheckoutVerificationResendMaxAttempts',
  'hostedCheckoutVerificationUrl',
  'hostedCheckoutPhoneNumber',
  'hostedCheckoutSmsPoolText',
  'hostedCheckoutSmsPoolMaxUses',
  'hostedCheckoutSmsPoolAutoDisableEnabled',
  'hostedCheckoutSmsPoolUsage',
  'hostedCheckoutCurrentSmsEntry',
  'paypalGeneratedProfile',
  'autoRunRetryPaypalCallback',
  'autoRunPreserveIssueLogsOnRestart',
  'phoneVerificationCodePrefetchEnabled',
  'signupIdentityRedirectTimeoutSeconds',
  'authContentScriptRecoveryTimeoutSeconds',
  'signupVerificationReadyTimeoutSeconds',
  'signupVerificationReadyMaxRounds',
  'signupVerificationReadyRoundWaitSeconds',
  'signupPhoneVerificationSubmitResultMaxRounds',
  'signupPhoneVerificationSubmitResultRoundWaitSeconds',
  'step5ProfileSubmitResultMaxRounds',
  'step5ProfileSubmitResultRoundWaitSeconds',
  'mailProvider',
  'ipProxyEnabled',
  'ipProxyService',
  'ipProxyMode',
  'ipProxyActivationStep',
  'kiroRsUrl',
  'kiroRsKey',
  'stepExecutionRangeByFlow',
]);
const SETTINGS_SCHEMA_VIEW_KEY_SET = new Set(SETTINGS_SCHEMA_VIEW_KEYS);
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
const SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MIN = 1;
const SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MAX = 300;
const DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS = 12;
const DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS = 6;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MIN = 1;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MAX = 60;
const DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS = 5;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN = 1;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX = 120;
const DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS = 12;
const STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MIN = 1;
const STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MAX = 60;
const DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS = 10;
const STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN = 1;
const STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX = 120;
const PERSISTED_SETTING_DEFAULTS = {
  activeFlowId: DEFAULT_ACTIVE_FLOW_ID,
  panelMode: 'cpa',
  signupMethod: 'email',
  browserFingerprintEnabled: true,
  browserFingerprintLevel: 'standard',
  browserFingerprintLanguage: 'zh-CN',
  oauthOpenAfterRefreshWaitSeconds: 5,
  plusModeEnabled: false,
  phonePlusModeEnabled: false,
  plusPaymentMethod: 'paypal',
  plusAccountAccessStrategy: 'oauth',
  plusCheckoutVerificationFailureStrategy: 'continue',
  plusCheckAllowedRegions: [],
  plusCheckoutCreatePreWaitSeconds: 10,
  plusCheckoutOpenStableWaitSeconds: 20,
  plusHostedCheckoutCardPreWaitSeconds: 10,
  plusCheckoutConversionProxySource: 'manual',
  plusCheckoutConversionProxyUrl: '',
  plusCheckoutConversionProxy711Region: '',
  hostedCheckoutSecurityChallengeEnabled: false,
  hostedCheckoutVerificationPopupDelaySeconds: 20,
  hostedCheckoutFirstDirectResendEnabled: false,
  hostedCheckoutFirstResendWaitSeconds: 20,
  hostedCheckoutSubsequentResendWaitSeconds: 25,
  hostedCheckoutVerificationPollAttempts: 6,
  hostedCheckoutVerificationPollIntervalSeconds: 5,
  hostedCheckoutVerificationResendMaxAttempts: 1,
  hostedCheckoutVerificationUrl: '',
  hostedCheckoutPhoneNumber: '',
  hostedCheckoutSmsPoolText: '',
  hostedCheckoutSmsPoolMaxUses: 3,
  hostedCheckoutSmsPoolAutoDisableEnabled: false,
  hostedCheckoutSmsPoolUsage: {},
  hostedCheckoutCurrentSmsEntry: null,
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
    fullAddress: '',
    generatedFromCountry: '',
    generatedAt: 0,
  },
  autoRunRetryPaypalCallback: false,
  autoRunPreserveIssueLogsOnRestart: false,
  phoneVerificationCodePrefetchEnabled: false,
  signupIdentityRedirectTimeoutSeconds: 45,
  authContentScriptRecoveryTimeoutSeconds: 30,
  signupVerificationReadyTimeoutSeconds: 60,
  signupVerificationReadyMaxRounds: 5,
  signupVerificationReadyRoundWaitSeconds: 12,
  signupPhoneVerificationSubmitResultMaxRounds: 6,
  signupPhoneVerificationSubmitResultRoundWaitSeconds: 5,
  step5ProfileSubmitResultMaxRounds: 12,
  step5ProfileSubmitResultRoundWaitSeconds: 10,
  sub2apiUrl: '',
  sub2apiEmail: '',
  sub2apiPassword: '',
  sub2apiGroupName: 'codex',
  sub2apiGroupNames: DEFAULT_SUB2API_GROUP_NAMES,
  sub2apiAccountPriority: 1,
  sub2apiDefaultProxyName: '',
  sub2apiReloginEnabled: false,
  sub2apiReloginAccountPoolText: '',
  sub2apiReloginAccountPoolUsage: {},
  sub2apiReloginCurrentAccount: null,
  phoneVerificationEnabled: false,
  phoneSignupPhonePrefixedEmailEnabled: true,
  mailProvider: '163',
  ipProxyEnabled: false,
  ipProxyService: '711proxy',
  ipProxyMode: 'account',
  ipProxyActivationStep: 1,
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
const PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_CONTINUE = 'continue';
const PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY = 'retry';
const PLUS_CHECK_ALLOWED_REGION_OPTIONS = Object.freeze(['KZ', 'BR', 'JP', 'NP', 'IQ', 'US']);
const PLUS_CHECK_ALLOWED_REGION_SET = new Set(PLUS_CHECK_ALLOWED_REGION_OPTIONS);
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
function normalizeBrowserFingerprintLevel(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'basic' || normalized === 'enhanced' ? normalized : 'standard';
}
${extractFunction('normalizePlusAccountAccessStrategy')}
${extractFunction('normalizePlusCheckoutVerificationFailureStrategy')}
${extractFunction('normalizePlusCheckAllowedRegionCode')}
${extractFunction('normalizePlusCheckAllowedRegions')}
${extractFunction('normalizePlusCheckoutConversionProxySource')}
${extractFunction('normalizePlusCheckoutConversionProxy711Region')}
function normalizeSub2ApiGroupNames(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry || '').trim()).filter(Boolean) : [];
}
${extractFunction('normalizeSub2ApiAccountPriority')}
${extractFunction('parseSub2ApiReloginAccountPoolEntries')}
${extractFunction('normalizeSub2ApiReloginAccountPoolText')}
${extractFunction('normalizeSub2ApiReloginAccountPoolUsage')}
${extractFunction('normalizeSub2ApiReloginCurrentAccount')}
function normalizeCloudflareDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudflareTempEmailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudMailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeMailProvider(value = '') { return String(value || '163').trim().toLowerCase() || '163'; }
function normalizeStepExecutionRangeByFlow(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function normalizeIpProxyProviderValue(value) { return String(value || '711proxy').trim() || '711proxy'; }
function normalizeIpProxyMode(value) { return String(value || 'account').trim() || 'account'; }
${extractFunction('normalizeIpProxyActivationStep')}
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
${extractFunction('normalizeSignupIdentityRedirectTimeoutSeconds')}
${extractFunction('normalizeAuthContentScriptRecoveryTimeoutSeconds')}
${extractFunction('normalizeSignupVerificationReadyTimeoutSeconds')}
${extractFunction('normalizeSignupVerificationReadyMaxRounds')}
${extractFunction('normalizeSignupVerificationReadyRoundWaitSeconds')}
${extractFunction('normalizeSignupPhoneVerificationSubmitResultMaxRounds')}
${extractFunction('normalizeSignupPhoneVerificationSubmitResultRoundWaitSeconds')}
${extractFunction('normalizeStep5ProfileSubmitResultMaxRounds')}
${extractFunction('normalizeStep5ProfileSubmitResultRoundWaitSeconds')}
${extractFunction('getAuthContentScriptRecoveryTimeoutMsForState')}
${extractFunction('getSignupVerificationReadyConfigForState')}
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
  buildPersistedSettingsStoragePayload,
  getPersistedSettings,
  setPersistentSettings,
  getAuthContentScriptRecoveryTimeoutMsForState,
  getSignupVerificationReadyConfigForState,
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
    ipProxyActivationStep: '3',
    ipProxyPoolTargetCount: '25',
    ipProxySwitchIpRoundCount: '3',
    ipProxyAutoRefreshPoolOnExhausted: true,
  }, { fillDefaults: true });

  assert.equal(payload.ipProxyActivationStep, 3);
  assert.equal(payload.settingsState.services.proxy.activationStep, 3);
  assert.equal(payload.ipProxyPoolTargetCount, '25');
  assert.equal(payload.ipProxySwitchIpRoundCount, '3');
  assert.equal(payload.ipProxyAutoRefreshPoolOnExhausted, true);
});

test('buildPersistentSettingsPayload normalizes IP proxy activation step from flat and schema input', () => {
  const api = buildHarness();

  const partial = api.buildPersistentSettingsPayload({
    ipProxyEnabled: true,
  });
  assert.equal(Object.prototype.hasOwnProperty.call(partial, 'ipProxyActivationStep'), false);

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.ipProxyActivationStep, 1);
  assert.equal(defaults.settingsState.services.proxy.activationStep, 1);

  const flat = api.buildPersistentSettingsPayload({
    ipProxyActivationStep: '4.9',
  }, { fillDefaults: true });
  assert.equal(flat.ipProxyActivationStep, 4);
  assert.equal(flat.settingsState.services.proxy.activationStep, 4);

  const invalid = api.buildPersistentSettingsPayload({
    ipProxyActivationStep: 'abc',
  }, { fillDefaults: true });
  assert.equal(invalid.ipProxyActivationStep, 1);
  assert.equal(invalid.settingsState.services.proxy.activationStep, 1);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      services: {
        proxy: { activationStep: '5' },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.ipProxyActivationStep, 5);
  assert.equal(nested.settingsState.services.proxy.activationStep, 5);

  const specialStep = 'signup_phone_before_input_clear_cookie';
  const special = api.buildPersistentSettingsPayload({
    ipProxyActivationStep: specialStep,
  }, { fillDefaults: true });
  assert.equal(special.ipProxyActivationStep, specialStep);
  assert.equal(special.settingsState.services.proxy.activationStep, specialStep);
});

test('buildPersistentSettingsPayload persists auto-run issue log preservation into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.autoRunPreserveIssueLogsOnRestart, false);
  assert.equal(defaults.settingsState.flows.openai.autoRun.autoRunPreserveIssueLogsOnRestart, false);
  assert.equal(defaults.settingsState.flows.kiro.autoRun.autoRunPreserveIssueLogsOnRestart, false);

  const flat = api.buildPersistentSettingsPayload({
    autoRunPreserveIssueLogsOnRestart: true,
  }, { fillDefaults: true });
  assert.equal(flat.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(flat.settingsState.flows.openai.autoRun.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(flat.settingsState.flows.kiro.autoRun.autoRunPreserveIssueLogsOnRestart, true);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          autoRun: {
            autoRunPreserveIssueLogsOnRestart: true,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(nested.settingsState.flows.openai.autoRun.autoRunPreserveIssueLogsOnRestart, true);
  assert.equal(nested.settingsState.flows.kiro.autoRun.autoRunPreserveIssueLogsOnRestart, false);
});

test('buildPersistentSettingsPayload persists phone verification code prefetch into OpenAI auto-run settings', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.phoneVerificationCodePrefetchEnabled, false);
  assert.equal(defaults.settingsState.flows.openai.autoRun.phoneVerificationCodePrefetchEnabled, false);

  const flat = api.buildPersistentSettingsPayload({
    phoneVerificationCodePrefetchEnabled: true,
  }, { fillDefaults: true });
  assert.equal(flat.phoneVerificationCodePrefetchEnabled, true);
  assert.equal(flat.settingsState.flows.openai.autoRun.phoneVerificationCodePrefetchEnabled, true);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          autoRun: {
            phoneVerificationCodePrefetchEnabled: true,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.phoneVerificationCodePrefetchEnabled, true);
  assert.equal(nested.settingsState.flows.openai.autoRun.phoneVerificationCodePrefetchEnabled, true);
});

test('buildPersistentSettingsPayload persists signup identity redirect timeout into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.signupIdentityRedirectTimeoutSeconds, 45);
  assert.equal(defaults.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 45);

  const flat = api.buildPersistentSettingsPayload({
    signupIdentityRedirectTimeoutSeconds: 90,
  }, { fillDefaults: true });
  assert.equal(flat.signupIdentityRedirectTimeoutSeconds, 90);
  assert.equal(flat.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 90);

  const clampedLow = api.buildPersistentSettingsPayload({
    signupIdentityRedirectTimeoutSeconds: 1,
  }, { fillDefaults: true });
  assert.equal(clampedLow.signupIdentityRedirectTimeoutSeconds, 5);
  assert.equal(clampedLow.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 5);

  const clampedHigh = api.buildPersistentSettingsPayload({
    signupIdentityRedirectTimeoutSeconds: 999,
  }, { fillDefaults: true });
  assert.equal(clampedHigh.signupIdentityRedirectTimeoutSeconds, 300);
  assert.equal(clampedHigh.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 300);

  const invalid = api.buildPersistentSettingsPayload({
    signupIdentityRedirectTimeoutSeconds: 'slow',
  }, { fillDefaults: true });
  assert.equal(invalid.signupIdentityRedirectTimeoutSeconds, 45);
  assert.equal(invalid.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 45);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          autoRun: {
            signupIdentityRedirectTimeoutSeconds: 120,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.signupIdentityRedirectTimeoutSeconds, 120);
  assert.equal(nested.settingsState.flows.openai.autoRun.signupIdentityRedirectTimeoutSeconds, 120);
});

test('buildPersistentSettingsPayload persists auth content script recovery timeout into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.authContentScriptRecoveryTimeoutSeconds, 30);
  assert.equal(defaults.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 30);

  const flat = api.buildPersistentSettingsPayload({
    authContentScriptRecoveryTimeoutSeconds: 60,
  }, { fillDefaults: true });
  assert.equal(flat.authContentScriptRecoveryTimeoutSeconds, 60);
  assert.equal(flat.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 60);

  const clampedLow = api.buildPersistentSettingsPayload({
    authContentScriptRecoveryTimeoutSeconds: 1,
  }, { fillDefaults: true });
  assert.equal(clampedLow.authContentScriptRecoveryTimeoutSeconds, 5);
  assert.equal(clampedLow.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 5);

  const clampedHigh = api.buildPersistentSettingsPayload({
    authContentScriptRecoveryTimeoutSeconds: 999,
  }, { fillDefaults: true });
  assert.equal(clampedHigh.authContentScriptRecoveryTimeoutSeconds, 180);
  assert.equal(clampedHigh.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 180);

  const invalid = api.buildPersistentSettingsPayload({
    authContentScriptRecoveryTimeoutSeconds: 'slow',
  }, { fillDefaults: true });
  assert.equal(invalid.authContentScriptRecoveryTimeoutSeconds, 30);
  assert.equal(invalid.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 30);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          autoRun: {
            authContentScriptRecoveryTimeoutSeconds: 75,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.authContentScriptRecoveryTimeoutSeconds, 75);
  assert.equal(nested.settingsState.flows.openai.autoRun.authContentScriptRecoveryTimeoutSeconds, 75);
});

test('auth content script recovery timeout helper returns normalized milliseconds', () => {
  const api = buildHarness();

  assert.equal(api.getAuthContentScriptRecoveryTimeoutMsForState({
    authContentScriptRecoveryTimeoutSeconds: 60,
  }), 60000);
  assert.equal(api.getAuthContentScriptRecoveryTimeoutMsForState({}), 30000);
  assert.equal(api.getAuthContentScriptRecoveryTimeoutMsForState({
    authContentScriptRecoveryTimeoutSeconds: 'slow',
  }), 30000);
});

test('buildPersistentSettingsPayload persists signup verification ready wait config into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.signupVerificationReadyTimeoutSeconds, 60);
  assert.equal(defaults.signupVerificationReadyMaxRounds, 5);
  assert.equal(defaults.signupVerificationReadyRoundWaitSeconds, 12);
  assert.equal(defaults.signupPhoneVerificationSubmitResultMaxRounds, 6);
  assert.equal(defaults.signupPhoneVerificationSubmitResultRoundWaitSeconds, 5);
  assert.equal(defaults.step5ProfileSubmitResultMaxRounds, 12);
  assert.equal(defaults.step5ProfileSubmitResultRoundWaitSeconds, 10);
  assert.equal(defaults.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 60);
  assert.equal(defaults.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 5);
  assert.equal(defaults.settingsState.flows.openai.autoRun.signupVerificationReadyRoundWaitSeconds, 12);

  const flat = api.buildPersistentSettingsPayload({
    signupVerificationReadyTimeoutSeconds: 90,
    signupVerificationReadyMaxRounds: 8,
  }, { fillDefaults: true });
  assert.equal(flat.signupVerificationReadyTimeoutSeconds, 90);
  assert.equal(flat.signupVerificationReadyMaxRounds, 8);
  assert.equal(flat.signupVerificationReadyRoundWaitSeconds, 12);
  assert.equal(flat.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 90);
  assert.equal(flat.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 8);
  assert.equal(flat.settingsState.flows.openai.autoRun.signupVerificationReadyRoundWaitSeconds, 12);

  const flatRoundWait = api.buildPersistentSettingsPayload({
    signupVerificationReadyMaxRounds: 8,
    signupVerificationReadyRoundWaitSeconds: 9,
    signupPhoneVerificationSubmitResultMaxRounds: 7,
    signupPhoneVerificationSubmitResultRoundWaitSeconds: 4,
    step5ProfileSubmitResultMaxRounds: 13,
    step5ProfileSubmitResultRoundWaitSeconds: 8,
  }, { fillDefaults: true });
  assert.equal(flatRoundWait.signupVerificationReadyTimeoutSeconds, 72);
  assert.equal(flatRoundWait.signupVerificationReadyMaxRounds, 8);
  assert.equal(flatRoundWait.signupVerificationReadyRoundWaitSeconds, 9);
  assert.equal(flatRoundWait.signupPhoneVerificationSubmitResultMaxRounds, 7);
  assert.equal(flatRoundWait.signupPhoneVerificationSubmitResultRoundWaitSeconds, 4);
  assert.equal(flatRoundWait.step5ProfileSubmitResultMaxRounds, 13);
  assert.equal(flatRoundWait.step5ProfileSubmitResultRoundWaitSeconds, 8);
  assert.equal(flatRoundWait.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 72);
  assert.equal(flatRoundWait.settingsState.flows.openai.autoRun.signupVerificationReadyRoundWaitSeconds, 9);

  const clampedLow = api.buildPersistentSettingsPayload({
    signupVerificationReadyTimeoutSeconds: 1,
    signupVerificationReadyMaxRounds: 0,
    signupVerificationReadyRoundWaitSeconds: 0,
    signupPhoneVerificationSubmitResultMaxRounds: 0,
    signupPhoneVerificationSubmitResultRoundWaitSeconds: 0,
    step5ProfileSubmitResultMaxRounds: 0,
    step5ProfileSubmitResultRoundWaitSeconds: 0,
  }, { fillDefaults: true });
  assert.equal(clampedLow.signupVerificationReadyTimeoutSeconds, 5);
  assert.equal(clampedLow.signupVerificationReadyMaxRounds, 1);
  assert.equal(clampedLow.signupVerificationReadyRoundWaitSeconds, 1);
  assert.equal(clampedLow.signupPhoneVerificationSubmitResultMaxRounds, 1);
  assert.equal(clampedLow.signupPhoneVerificationSubmitResultRoundWaitSeconds, 1);
  assert.equal(clampedLow.step5ProfileSubmitResultMaxRounds, 1);
  assert.equal(clampedLow.step5ProfileSubmitResultRoundWaitSeconds, 1);
  assert.equal(clampedLow.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 5);
  assert.equal(clampedLow.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 1);

  const clampedHigh = api.buildPersistentSettingsPayload({
    signupVerificationReadyTimeoutSeconds: 999,
    signupVerificationReadyMaxRounds: 99,
    signupVerificationReadyRoundWaitSeconds: 999,
    signupPhoneVerificationSubmitResultMaxRounds: 999,
    signupPhoneVerificationSubmitResultRoundWaitSeconds: 999,
    step5ProfileSubmitResultMaxRounds: 999,
    step5ProfileSubmitResultRoundWaitSeconds: 999,
  }, { fillDefaults: true });
  assert.equal(clampedHigh.signupVerificationReadyTimeoutSeconds, 300);
  assert.equal(clampedHigh.signupVerificationReadyMaxRounds, 20);
  assert.equal(clampedHigh.signupVerificationReadyRoundWaitSeconds, 300);
  assert.equal(clampedHigh.signupPhoneVerificationSubmitResultMaxRounds, 60);
  assert.equal(clampedHigh.signupPhoneVerificationSubmitResultRoundWaitSeconds, 120);
  assert.equal(clampedHigh.step5ProfileSubmitResultMaxRounds, 60);
  assert.equal(clampedHigh.step5ProfileSubmitResultRoundWaitSeconds, 120);
  assert.equal(clampedHigh.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 300);
  assert.equal(clampedHigh.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 20);

  const invalid = api.buildPersistentSettingsPayload({
    signupVerificationReadyTimeoutSeconds: 'slow',
    signupVerificationReadyMaxRounds: 'many',
  }, { fillDefaults: true });
  assert.equal(invalid.signupVerificationReadyTimeoutSeconds, 60);
  assert.equal(invalid.signupVerificationReadyMaxRounds, 5);
  assert.equal(invalid.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 60);
  assert.equal(invalid.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 5);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          autoRun: {
            signupVerificationReadyTimeoutSeconds: 120,
            signupVerificationReadyMaxRounds: 6,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.signupVerificationReadyTimeoutSeconds, 120);
  assert.equal(nested.signupVerificationReadyMaxRounds, 6);
  assert.equal(nested.settingsState.flows.openai.autoRun.signupVerificationReadyTimeoutSeconds, 120);
  assert.equal(nested.settingsState.flows.openai.autoRun.signupVerificationReadyMaxRounds, 6);
});

test('signup verification ready helper returns normalized total budget and rounds', () => {
  const api = buildHarness();

  assert.deepEqual(api.getSignupVerificationReadyConfigForState({
    signupVerificationReadyTimeoutSeconds: 75,
    signupVerificationReadyMaxRounds: 7,
  }), {
    timeoutSeconds: 75,
    timeoutMs: 75000,
    totalTimeoutMs: 75000,
    maxRounds: 7,
    roundWaitSeconds: 11,
    roundWaitMs: 11000,
  });
  assert.deepEqual(api.getSignupVerificationReadyConfigForState({
    signupVerificationReadyTimeoutSeconds: 75,
    signupVerificationReadyMaxRounds: 7,
    signupVerificationReadyRoundWaitSeconds: 9,
  }), {
    timeoutSeconds: 63,
    timeoutMs: 63000,
    totalTimeoutMs: 63000,
    maxRounds: 7,
    roundWaitSeconds: 9,
    roundWaitMs: 9000,
  });
  assert.deepEqual(api.getSignupVerificationReadyConfigForState({}), {
    timeoutSeconds: 60,
    timeoutMs: 60000,
    totalTimeoutMs: 60000,
    maxRounds: 5,
    roundWaitSeconds: 12,
    roundWaitMs: 12000,
  });
  assert.deepEqual(api.getSignupVerificationReadyConfigForState({
    signupVerificationReadyTimeoutSeconds: 'slow',
    signupVerificationReadyMaxRounds: 'many',
  }), {
    timeoutSeconds: 60,
    timeoutMs: 60000,
    totalTimeoutMs: 60000,
    maxRounds: 5,
    roundWaitSeconds: 12,
    roundWaitMs: 12000,
  });
});

test('buildPersistentSettingsPayload persists browser fingerprint switch level and language into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.browserFingerprintEnabled, true);
  assert.equal(defaults.browserFingerprintLevel, 'standard');
  assert.equal(defaults.browserFingerprintLanguage, 'zh-CN');
  assert.equal(defaults.settingsState.flows.openai.browserFingerprint.enabled, true);
  assert.equal(defaults.settingsState.flows.openai.browserFingerprint.level, 'standard');
  assert.equal(defaults.settingsState.flows.openai.browserFingerprint.language, 'zh-CN');

  const flat = api.buildPersistentSettingsPayload({
    browserFingerprintEnabled: false,
    browserFingerprintLevel: 'enhanced',
    browserFingerprintLanguage: 'en-US',
  }, { fillDefaults: true });
  assert.equal(flat.browserFingerprintEnabled, false);
  assert.equal(flat.browserFingerprintLevel, 'enhanced');
  assert.equal(flat.browserFingerprintLanguage, 'en-US');
  assert.equal(flat.settingsState.flows.openai.browserFingerprint.enabled, false);
  assert.equal(flat.settingsState.flows.openai.browserFingerprint.level, 'enhanced');
  assert.equal(flat.settingsState.flows.openai.browserFingerprint.language, 'en-US');

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          browserFingerprint: {
            enabled: true,
            level: 'basic',
            language: 'en-US',
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.browserFingerprintEnabled, true);
  assert.equal(nested.browserFingerprintLevel, 'basic');
  assert.equal(nested.browserFingerprintLanguage, 'en-US');
  assert.equal(nested.settingsState.flows.openai.browserFingerprint.level, 'basic');
  assert.equal(nested.settingsState.flows.openai.browserFingerprint.language, 'en-US');

  const random = api.buildPersistentSettingsPayload({
    browserFingerprintLanguage: 'random',
  }, { fillDefaults: true });
  assert.equal(random.browserFingerprintLanguage, 'random');
  assert.equal(random.settingsState.flows.openai.browserFingerprint.language, 'random');
});

test('buildPersistentSettingsPayload persists phone signup phone-prefixed email switch into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.phoneSignupPhonePrefixedEmailEnabled, true);
  assert.equal(defaults.settingsState.flows.openai.signup.phoneSignupPhonePrefixedEmailEnabled, true);

  const flat = api.buildPersistentSettingsPayload({
    phoneSignupPhonePrefixedEmailEnabled: false,
  }, { fillDefaults: true });
  assert.equal(flat.phoneSignupPhonePrefixedEmailEnabled, false);
  assert.equal(flat.settingsState.flows.openai.signup.phoneSignupPhonePrefixedEmailEnabled, false);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          signup: {
            phoneSignupPhonePrefixedEmailEnabled: false,
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.equal(nested.phoneSignupPhonePrefixedEmailEnabled, false);
  assert.equal(nested.settingsState.flows.openai.signup.phoneSignupPhonePrefixedEmailEnabled, false);
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

test('buildPersistentSettingsPayload persists IP proxy Plus checkout conversion proxy source into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    plusCheckoutConversionProxySource: 'ip_proxy',
    plusCheckoutConversionProxyUrl: ' socks5h://user:pass@proxy.example:1080 ',
    plusCheckoutConversionProxy711Region: ' us ',
  }, { fillDefaults: true });

  assert.equal(payload.plusCheckoutConversionProxySource, 'ip_proxy');
  assert.equal(payload.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(payload.plusCheckoutConversionProxy711Region, 'US');
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutConversionProxySource, 'ip_proxy');
});

test('buildPersistentSettingsPayload persists Plus checkout wait settings into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    plusCheckoutVerificationFailureStrategy: 'retry',
    plusCheckoutCreatePreWaitSeconds: ' 16.8 ',
    plusCheckoutOpenStableWaitSeconds: ' 29.2 ',
    plusHostedCheckoutCardPreWaitSeconds: ' 11.9 ',
  }, { fillDefaults: true });

  assert.equal(payload.plusCheckoutVerificationFailureStrategy, 'retry');
  assert.equal(payload.plusCheckoutCreatePreWaitSeconds, 16);
  assert.equal(payload.plusCheckoutOpenStableWaitSeconds, 29);
  assert.equal(payload.plusHostedCheckoutCardPreWaitSeconds, 11);
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutVerificationFailureStrategy, 'retry');
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutCreatePreWaitSeconds, 16);
  assert.equal(payload.settingsState.flows.openai.plus.plusCheckoutOpenStableWaitSeconds, 29);
  assert.equal(payload.settingsState.flows.openai.plus.plusHostedCheckoutCardPreWaitSeconds, 11);

  const invalid = api.buildPersistentSettingsPayload({
    plusCheckoutVerificationFailureStrategy: 'fail',
  }, { fillDefaults: true });
  assert.equal(invalid.plusCheckoutVerificationFailureStrategy, 'continue');
  assert.equal(invalid.settingsState.flows.openai.plus.plusCheckoutVerificationFailureStrategy, 'continue');
});

test('buildPersistentSettingsPayload normalizes Plus Check allowed regions into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.deepEqual(defaults.plusCheckAllowedRegions, []);
  assert.deepEqual(defaults.settingsState.flows.openai.plus.plusCheckAllowedRegions, []);

  const flat = api.buildPersistentSettingsPayload({
    plusCheckAllowedRegions: ['jp', 'XX', 'u-s', 'Brazil [BR]', 'JP'],
  }, { fillDefaults: true });
  assert.deepEqual(flat.plusCheckAllowedRegions, ['BR', 'JP', 'US']);
  assert.deepEqual(flat.settingsState.flows.openai.plus.plusCheckAllowedRegions, ['BR', 'JP', 'US']);

  const nested = api.buildPersistentSettingsPayload({
    settingsSchemaVersion: 4,
    settingsState: {
      flows: {
        openai: {
          plus: {
            plusCheckAllowedRegions: 'us, np; bad | iq',
          },
        },
      },
    },
  }, { requireKnownKeys: true });
  assert.deepEqual(nested.plusCheckAllowedRegions, ['NP', 'IQ', 'US']);
  assert.deepEqual(nested.settingsState.flows.openai.plus.plusCheckAllowedRegions, ['NP', 'IQ', 'US']);
});

test('buildPersistentSettingsPayload persists OAuth open-after-refresh wait into settings schema', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.oauthOpenAfterRefreshWaitSeconds, 5);
  assert.equal(defaults.settingsState.flows.openai.oauth.oauthOpenAfterRefreshWaitSeconds, 5);

  const flat = api.buildPersistentSettingsPayload({
    oauthOpenAfterRefreshWaitSeconds: ' 7.9 ',
  }, { fillDefaults: true });
  assert.equal(flat.oauthOpenAfterRefreshWaitSeconds, 7);
  assert.equal(flat.settingsState.flows.openai.oauth.oauthOpenAfterRefreshWaitSeconds, 7);

  const low = api.buildPersistentSettingsPayload({
    oauthOpenAfterRefreshWaitSeconds: -3,
  }, { fillDefaults: true });
  assert.equal(low.oauthOpenAfterRefreshWaitSeconds, 0);
  assert.equal(low.settingsState.flows.openai.oauth.oauthOpenAfterRefreshWaitSeconds, 0);

  const high = api.buildPersistentSettingsPayload({
    oauthOpenAfterRefreshWaitSeconds: 121,
  }, { fillDefaults: true });
  assert.equal(high.oauthOpenAfterRefreshWaitSeconds, 120);
  assert.equal(high.settingsState.flows.openai.oauth.oauthOpenAfterRefreshWaitSeconds, 120);

  const nested = api.buildPersistentSettingsPayload({
    settingsState: {
      flows: {
        openai: {
          oauth: {
            oauthOpenAfterRefreshWaitSeconds: '12.4',
          },
        },
      },
    },
  }, { fillDefaults: true });
  assert.equal(nested.oauthOpenAfterRefreshWaitSeconds, 12);
  assert.equal(nested.settingsState.flows.openai.oauth.oauthOpenAfterRefreshWaitSeconds, 12);
});

test('buildPersistentSettingsPayload persists PayPal hosted checkout resend strategy into settings schema', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    hostedCheckoutFirstDirectResendEnabled: true,
    hostedCheckoutFirstResendWaitSeconds: ' 31.8 ',
    hostedCheckoutSubsequentResendWaitSeconds: ' 44.2 ',
    hostedCheckoutVerificationPollAttempts: ' 9.9 ',
    hostedCheckoutVerificationPollIntervalSeconds: ' 7.5 ',
    hostedCheckoutVerificationResendMaxAttempts: ' 3.2 ',
  }, { fillDefaults: true });

  assert.equal(payload.hostedCheckoutFirstDirectResendEnabled, true);
  assert.equal(payload.hostedCheckoutFirstResendWaitSeconds, 31);
  assert.equal(payload.hostedCheckoutSubsequentResendWaitSeconds, 44);
  assert.equal(payload.hostedCheckoutVerificationPollAttempts, 9);
  assert.equal(payload.hostedCheckoutVerificationPollIntervalSeconds, 7);
  assert.equal(payload.hostedCheckoutVerificationResendMaxAttempts, 3);
  assert.equal(payload.hostedCheckoutVerificationPopupDelaySeconds, 20);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutFirstDirectResendEnabled, true);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutFirstResendWaitSeconds, 31);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutSubsequentResendWaitSeconds, 44);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutVerificationPollAttempts, 9);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutVerificationPollIntervalSeconds, 7);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutVerificationResendMaxAttempts, 3);
});

test('buildPersistentSettingsPayload persists PayPal hosted security challenge switch into settings schema', () => {
  const api = buildHarness();

  const defaultPayload = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaultPayload.hostedCheckoutSecurityChallengeEnabled, false);
  assert.equal(defaultPayload.settingsState.flows.openai.plus.hostedCheckoutSecurityChallengeEnabled, false);

  const enabledPayload = api.buildPersistentSettingsPayload({
    hostedCheckoutSecurityChallengeEnabled: true,
  }, { fillDefaults: true });

  assert.equal(enabledPayload.hostedCheckoutSecurityChallengeEnabled, true);
  assert.equal(enabledPayload.settingsState.flows.openai.plus.hostedCheckoutSecurityChallengeEnabled, true);
});

test('buildPersistedSettingsStoragePayload omits PayPal hosted resend flat view keys', () => {
  const api = buildHarness();

  const persisted = api.buildPersistentSettingsPayload({
    hostedCheckoutFirstDirectResendEnabled: true,
    hostedCheckoutFirstResendWaitSeconds: 28,
    hostedCheckoutSubsequentResendWaitSeconds: 33,
    hostedCheckoutVerificationPollAttempts: 8,
    hostedCheckoutVerificationPollIntervalSeconds: 4,
    hostedCheckoutVerificationResendMaxAttempts: 2,
  }, { fillDefaults: true });
  const storagePayload = api.buildPersistedSettingsStoragePayload(persisted);

  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutFirstDirectResendEnabled'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutFirstResendWaitSeconds'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutSubsequentResendWaitSeconds'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutVerificationPollAttempts'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutVerificationPollIntervalSeconds'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(storagePayload, 'hostedCheckoutVerificationResendMaxAttempts'), false);
  assert.equal(storagePayload.settingsState.flows.openai.plus.hostedCheckoutFirstResendWaitSeconds, 28);
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
      fullAddress: ' 1 Marunouchi Chiyoda Tokyo 100-0005 JP ',
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
    fullAddress: '1 Marunouchi Chiyoda Tokyo 100-0005 JP',
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
        proxy: { enabled: false, provider: '711proxy', mode: 'account', activationStep: 6 },
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
  assert.equal(payload.ipProxyActivationStep, 6);
  assert.equal(Object.prototype.hasOwnProperty.call(payload, 'kiroRegion'), false);
  assert.equal(payload.settingsSchemaVersion, 4);
  assert.equal(payload.settingsState.services.proxy.activationStep, 6);
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
    hostedCheckoutSmsPoolText: '14155555678----https://example.com/verify?t=1',
    hostedCheckoutSmsPoolMaxUses: '4.9',
    hostedCheckoutSmsPoolAutoDisableEnabled: true,
    hostedCheckoutSmsPoolUsage: {
      '4155555678----https://example.com/verify': { useCount: 1 },
    },
    hostedCheckoutCurrentSmsEntry: {
      key: '4155555678----https://example.com/verify',
      phone: '4155555678',
      verificationUrl: 'https://example.com/verify?t=5',
    },
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
  assert.equal(payload.hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.equal(payload.hostedCheckoutSmsPoolMaxUses, 4);
  assert.equal(payload.hostedCheckoutSmsPoolAutoDisableEnabled, true);
  assert.deepEqual(payload.hostedCheckoutCurrentSmsEntry, {
    key: '4155555678----https://example.com/verify',
    phone: '4155555678',
    verificationUrl: 'https://example.com/verify',
  });
  assert.equal(
    payload.settingsState.flows.openai.plus.hostedCheckoutSmsPoolText,
    '4155555678----https://example.com/verify'
  );
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutSmsPoolAutoDisableEnabled, true);
  assert.equal(payload.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 4);
});

test('buildPersistentSettingsPayload forces SUB2API relogin runtime settings and disables proxies', () => {
  const api = buildHarness();

  const payload = api.buildPersistentSettingsPayload({
    activeFlowId: 'kiro',
    panelMode: 'cpa',
    sub2apiReloginEnabled: true,
    sub2apiReloginAccountPoolText: '+447780579093----secret----mail@example.com',
    sub2apiReloginAccountPoolUsage: {
      '+447780579093----secret----mail@example.com': {
        enabled: true,
        usedAt: 0,
      },
    },
    plusModeEnabled: true,
    phonePlusModeEnabled: true,
    phoneVerificationEnabled: true,
    signupMethod: 'email',
    sub2apiDefaultProxyName: 'proxy-a',
    ipProxyEnabled: true,
  }, { fillDefaults: true });

  assert.equal(payload.activeFlowId, 'openai');
  assert.equal(payload.panelMode, 'sub2api');
  assert.equal(payload.openaiIntegrationTargetId, 'sub2api');
  assert.equal(payload.sub2apiReloginEnabled, true);
  assert.equal(payload.signupMethod, 'phone');
  assert.equal(payload.phoneVerificationEnabled, false);
  assert.equal(payload.plusModeEnabled, false);
  assert.equal(payload.phonePlusModeEnabled, false);
  assert.equal(payload.plusAccountAccessStrategy, 'oauth');
  assert.equal(payload.sub2apiDefaultProxyName, '');
  assert.equal(payload.ipProxyEnabled, false);
  assert.equal(payload.ipProxyActivationStep, 1);
  assert.equal(payload.settingsState.activeFlowId, 'openai');
  assert.equal(payload.settingsState.flows.openai.integrationTargetId, 'sub2api');
  assert.equal(payload.settingsState.flows.openai.signup.signupMethod, 'phone');
  assert.equal(payload.settingsState.flows.openai.signup.phoneVerificationEnabled, false);
  assert.equal(payload.settingsState.flows.openai.plus.plusModeEnabled, false);
  assert.equal(payload.settingsState.flows.openai.plus.phonePlusModeEnabled, false);
  assert.equal(payload.settingsState.services.proxy.enabled, false);
  assert.equal(payload.settingsState.services.proxy.activationStep, 1);
  assert.equal(payload.settingsState.flows.openai.integrationTargets.sub2api.sub2apiDefaultProxyName, '');
  assert.equal(payload.settingsState.flows.openai.integrationTargets.sub2api.sub2apiReloginEnabled, true);
  assert.equal(
    payload.settingsState.flows.openai.integrationTargets.sub2api.sub2apiReloginAccountPoolText,
    '+447780579093----secret----mail@example.com'
  );
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
        proxy: { enabled: false, provider: '711proxy', mode: 'account', activationStep: 6 },
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
              proxy: { enabled: true, provider: '711proxy', mode: 'account', activationStep: 4 },
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
  assert.equal(state.ipProxyActivationStep, 4);
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

test('getPersistedSettings restores PayPal hosted sms pool from schema-only storage', async () => {
  const api = buildHarness(`
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
                  plusPaymentMethod: 'paypal',
                  hostedCheckoutSmsPoolText: '14155555678----https://example.com/verify?t=1',
                  hostedCheckoutSmsPoolMaxUses: 0,
                  hostedCheckoutSmsPoolUsage: {
                    '4155555678----https://example.com/verify': {
                      useCount: 2,
                      lastError: 'timeout',
                    },
                    stale: {
                      useCount: 9,
                      lastError: 'stale',
                    },
                  },
                  hostedCheckoutCurrentSmsEntry: {
                    key: '14155555678----https://example.com/verify?t=2',
                    phone: '4155555678',
                    verificationUrl: 'https://example.com/verify?t=9',
                  },
                },
                autoRun: {
                  stepExecutionRange: { enabled: false, fromStep: 1, toStep: 11 },
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

  assert.equal(state.hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.equal(state.hostedCheckoutSmsPoolMaxUses, 1);
  assert.deepEqual(state.hostedCheckoutSmsPoolUsage, {
    '4155555678----https://example.com/verify': {
      useCount: 2,
      usedAt: 0,
      lastAttemptAt: 0,
      lastError: 'timeout',
      enabled: true,
      disabledReason: '',
      disabledAt: 0,
      failureCount: 0,
    },
  });
  assert.deepEqual(state.hostedCheckoutCurrentSmsEntry, {
    key: '4155555678----https://example.com/verify',
    phone: '4155555678',
    verificationUrl: 'https://example.com/verify',
  });
});

test('buildPersistentSettingsPayload normalizes PayPal hosted sms pool max uses from defaults flat and nested settings', () => {
  const api = buildHarness();

  const defaults = api.buildPersistentSettingsPayload({}, { fillDefaults: true });
  assert.equal(defaults.hostedCheckoutSmsPoolMaxUses, 3);
  assert.equal(defaults.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 3);

  const flat = api.buildPersistentSettingsPayload({
    hostedCheckoutSmsPoolMaxUses: '8.7',
  }, { fillDefaults: true });
  assert.equal(flat.hostedCheckoutSmsPoolMaxUses, 8);
  assert.equal(flat.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 8);

  const clamped = api.buildPersistentSettingsPayload({
    hostedCheckoutSmsPoolMaxUses: 0,
  }, { fillDefaults: true });
  assert.equal(clamped.hostedCheckoutSmsPoolMaxUses, 1);
  assert.equal(clamped.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 1);

  const nested = api.buildPersistentSettingsPayload({
    settingsState: {
      flows: {
        openai: {
          plus: {
            hostedCheckoutSmsPoolMaxUses: '6.3',
          },
        },
      },
    },
  }, { fillDefaults: true });
  assert.equal(nested.hostedCheckoutSmsPoolMaxUses, 6);
  assert.equal(nested.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 6);
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

test('setPersistentSettings stores PayPal hosted sms pool in canonical settingsState only', async () => {
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
                  plusPaymentMethod: 'paypal',
                },
                autoRun: {
                  stepExecutionRange: { enabled: false, fromStep: 1, toStep: 11 },
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
    hostedCheckoutSmsPoolText: [
      '14155555678----https://example.com/verify-a?t=1',
      '4155555678----https://example.com/verify-a?t=9',
      '4155559999----https://example.com/verify-b',
    ].join('\n'),
    hostedCheckoutSmsPoolMaxUses: 5,
    hostedCheckoutSmsPoolAutoDisableEnabled: true,
    hostedCheckoutSmsPoolUsage: {
      '4155555678----https://example.com/verify-a': {
        useCount: 2,
        lastError: 'timeout',
      },
      stale: {
        useCount: 9,
        lastError: 'stale',
      },
    },
    hostedCheckoutCurrentSmsEntry: {
      key: '4155555678----https://example.com/verify-a',
      phone: '4155555678',
      verificationUrl: 'https://example.com/verify-a?t=5',
    },
  });
  const write = api.getPersistedWrites().at(-1);

  assert.equal(
    persisted.hostedCheckoutSmsPoolText,
    '4155555678----https://example.com/verify-a\n4155559999----https://example.com/verify-b'
  );
  assert.equal(persisted.hostedCheckoutSmsPoolAutoDisableEnabled, true);
  assert.equal(persisted.hostedCheckoutSmsPoolMaxUses, 5);
  assert.deepEqual(persisted.hostedCheckoutCurrentSmsEntry, {
    key: '4155555678----https://example.com/verify-a',
    phone: '4155555678',
    verificationUrl: 'https://example.com/verify-a',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'hostedCheckoutSmsPoolText'), false);
  assert.equal(
    write.settingsState.flows.openai.plus.hostedCheckoutSmsPoolText,
    '4155555678----https://example.com/verify-a\n4155559999----https://example.com/verify-b'
  );
  assert.equal(write.settingsState.flows.openai.plus.hostedCheckoutSmsPoolAutoDisableEnabled, true);
  assert.equal(write.settingsState.flows.openai.plus.hostedCheckoutSmsPoolMaxUses, 5);
  assert.deepEqual(write.settingsState.flows.openai.plus.hostedCheckoutSmsPoolUsage, {
    '4155555678----https://example.com/verify-a': {
      useCount: 2,
      usedAt: 0,
      lastAttemptAt: 0,
      lastError: 'timeout',
      enabled: true,
      disabledReason: '',
      disabledAt: 0,
      failureCount: 0,
    },
  });
  assert.deepEqual(write.settingsState.flows.openai.plus.hostedCheckoutCurrentSmsEntry, {
    key: '4155555678----https://example.com/verify-a',
    phone: '4155555678',
    verificationUrl: 'https://example.com/verify-a',
  });
  assert.ok(api.getRemovedKeys().includes('hostedCheckoutSmsPoolText'));
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
    ipProxyActivationStep: 3,
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
  assert.equal(persisted.ipProxyActivationStep, 3);
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
  assert.equal(write.settingsState.services.proxy.activationStep, 3);
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
  assert.equal(Object.prototype.hasOwnProperty.call(write, 'ipProxyActivationStep'), false);
});
