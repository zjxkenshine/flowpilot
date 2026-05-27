const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background.js', 'utf8');
const flowRegistrySource = fs.readFileSync('shared/flow-registry.js', 'utf8');
const settingsSchemaSource = fs.readFileSync('shared/settings-schema.js', 'utf8');

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

test('importSettingsBundle normalizes unsupported capability flags before persisting imported settings', async () => {
  const api = new Function(`
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const DEFAULT_REGISTRATION_EMAIL_STATE = { emailHistory: [] };
let persistedUpdates = null;
let stateUpdates = null;
let broadcastPayload = null;
let currentState = {
  activeFlowId: 'site-a',
  panelMode: 'sub2api',
  signupMethod: 'phone',
  plusModeEnabled: false,
  phoneVerificationEnabled: false,
  stepStatuses: {},
};
async function ensureManualInteractionAllowed() {
  return currentState;
}
function buildPersistentSettingsPayload(settings = {}) {
  return { ...settings };
}
function validateModeSwitchState() {
  return {
    ok: false,
    errors: [{ code: 'panel_mode_unsupported', message: '当前 flow 不支持 SUB2API 面板模式。' }],
    normalizedUpdates: {
      panelMode: 'cpa',
      plusModeEnabled: false,
      phoneVerificationEnabled: false,
      signupMethod: 'email',
    },
  };
}
function resolveSignupMethod(state = {}) {
  return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
async function setPersistentSettings(updates) {
  persistedUpdates = { ...updates };
}
async function setState(updates) {
  stateUpdates = { ...updates };
  currentState = { ...currentState, ...updates };
}
function broadcastDataUpdate(payload) {
  broadcastPayload = { ...payload };
}
async function getState() {
  return { ...currentState };
}
${extractFunction('importSettingsBundle')}
return {
  importSettingsBundle,
  getPersistedUpdates: () => persistedUpdates,
  getStateUpdates: () => stateUpdates,
  getBroadcastPayload: () => broadcastPayload,
};
`)();

  const result = await api.importSettingsBundle({
    schemaVersion: 1,
    settings: {
      panelMode: 'sub2api',
      plusModeEnabled: true,
      phoneVerificationEnabled: true,
      signupMethod: 'phone',
    },
  });

  assert.deepEqual(api.getPersistedUpdates(), {
    panelMode: 'cpa',
    plusModeEnabled: false,
    phoneVerificationEnabled: false,
    signupMethod: 'email',
  });
  assert.equal(api.getStateUpdates().panelMode, 'cpa');
  assert.equal(api.getStateUpdates().plusModeEnabled, false);
  assert.equal(api.getStateUpdates().phoneVerificationEnabled, false);
  assert.equal(api.getStateUpdates().signupMethod, 'email');
  assert.equal(api.getBroadcastPayload().panelMode, 'cpa');
  assert.equal(api.getBroadcastPayload().signupMethod, 'email');
  assert.equal(result.signupMethod, 'email');
});

test('importSettingsBundle restores hosted sms pool state and drops stale hosted pool records', async () => {
  const api = new Function(`
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const DEFAULT_REGISTRATION_EMAIL_STATE = { emailHistory: [] };
const PERSISTED_SETTING_DEFAULTS = {
  hostedCheckoutSmsPoolText: '',
  hostedCheckoutSmsPoolMaxUses: 3,
  hostedCheckoutSmsPoolUsage: {},
  hostedCheckoutCurrentSmsEntry: null,
  hostedCheckoutFirstResendWaitSeconds: 20,
  hostedCheckoutVerificationPopupDelaySeconds: 20,
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const DEFAULT_SUB2API_GROUP_NAMES = ['codex'];
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
let persistedUpdates = null;
let stateUpdates = null;
let broadcastPayload = null;
let currentState = {
  activeFlowId: 'openai',
  signupMethod: 'email',
  nodeStatuses: {},
};
async function ensureManualInteractionAllowed() {
  return currentState;
}
function normalizePersistentSettingValue(key, value) {
  switch (key) {
    case 'hostedCheckoutSmsPoolText':
      return String(value || '').replace(/\\r/g, '').trim();
    case 'hostedCheckoutSmsPoolMaxUses': {
      const numeric = Number(value);
      return Math.min(99, Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : 3)));
    }
    case 'hostedCheckoutSmsPoolUsage':
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).map(([entryKey, item]) => {
        const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
        const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
        const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
        return [String(entryKey || '').trim(), {
          useCount,
          usedAt: Math.max(0, Number(usage.usedAt) || 0),
          lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
          lastError: String(usage.lastError || '').trim(),
          enabled: usage.enabled !== false,
          disabledReason: String(usage.disabledReason || '').trim(),
          disabledAt: Math.max(0, Number(usage.disabledAt) || 0),
          failureCount: Math.max(0, Math.floor(Number(usage.failureCount) || 0)),
        }];
      }).filter(([entryKey]) => Boolean(entryKey)));
    case 'hostedCheckoutFirstResendWaitSeconds': {
      const numeric = Number(value);
      return Math.min(300, Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 20)));
    }
    case 'hostedCheckoutVerificationPopupDelaySeconds': {
      const numeric = Number(value);
      return Math.min(60, Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 20)));
    }
    case 'hostedCheckoutCurrentSmsEntry': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
      const normalizedPhone = String(value.phone || '').trim().replace(/\\D+/g, '');
      const phone = normalizedPhone.length === 11 && normalizedPhone.startsWith('1')
        ? normalizedPhone.slice(1)
        : normalizedPhone;
      const rawUrl = String(value.verificationUrl || '').trim();
      let verificationUrl = rawUrl;
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          parsed.searchParams.delete('t');
          verificationUrl = parsed.toString();
        } catch {
          verificationUrl = rawUrl.replace(/([?&])t=\\d+(?=(&|$))/i, '$1').replace(/[?&]$/g, '');
        }
      }
      const key = String(value.key || (phone && verificationUrl ? \`\${phone}----\${verificationUrl}\` : '')).trim();
      if (!phone || !verificationUrl || !key) return null;
      return { key, phone, verificationUrl };
    }
    default:
      return value;
  }
}
function resolveLegacyAutoStepDelaySeconds() {}
function normalizeCloudflareDomains(value) { return value; }
function normalizeCloudflareTempEmailDomains(value) { return value; }
function normalizeCloudMailDomains(value) { return value; }
function normalizeSub2ApiGroupNames(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function validateModeSwitchState() {
  return { ok: true, errors: [], normalizedUpdates: {} };
}
function resolveSignupMethod(state = {}) {
  return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
async function setPersistentSettings(updates) {
  persistedUpdates = { ...updates };
  return { ...updates };
}
async function setState(updates) {
  stateUpdates = { ...updates };
  currentState = { ...currentState, ...updates };
}
function broadcastDataUpdate(payload) {
  broadcastPayload = { ...payload };
}
async function getState() {
  return { ...currentState };
}
${extractFunction('buildPersistentSettingsPayload')}
${extractFunction('importSettingsBundle')}
return {
  importSettingsBundle,
  getPersistedUpdates: () => persistedUpdates,
  getStateUpdates: () => stateUpdates,
  getBroadcastPayload: () => broadcastPayload,
};
`)();

  const result = await api.importSettingsBundle({
    schemaVersion: 1,
    settings: {
      hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify?t=1',
      hostedCheckoutSmsPoolMaxUses: '4',
      hostedCheckoutSmsPoolUsage: {
        '1234567890----https://example.com/verify': {
          useCount: 2,
          lastError: 'timeout',
        },
        stale: {
          useCount: 9,
          lastError: 'stale',
        },
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '1234567890----https://example.com/verify',
        phone: '1234567890',
        verificationUrl: 'https://example.com/verify?t=9',
      },
    },
  });

  assert.equal(
    api.getPersistedUpdates().hostedCheckoutSmsPoolText,
    '1234567890----https://example.com/verify'
  );
  assert.deepEqual(api.getPersistedUpdates().hostedCheckoutSmsPoolUsage, {
    '1234567890----https://example.com/verify': {
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
  assert.deepEqual(api.getPersistedUpdates().hostedCheckoutCurrentSmsEntry, {
    key: '1234567890----https://example.com/verify',
    phone: '1234567890',
    verificationUrl: 'https://example.com/verify',
  });
  assert.equal(api.getPersistedUpdates().hostedCheckoutSmsPoolMaxUses, 4);
  assert.equal(
    api.getStateUpdates().hostedCheckoutSmsPoolText,
    '1234567890----https://example.com/verify'
  );
  assert.deepEqual(api.getBroadcastPayload().hostedCheckoutCurrentSmsEntry, {
    key: '1234567890----https://example.com/verify',
    phone: '1234567890',
    verificationUrl: 'https://example.com/verify',
  });
  assert.equal(result.hostedCheckoutSmsPoolText, '1234567890----https://example.com/verify');
  assert.equal(result.hostedCheckoutSmsPoolMaxUses, 4);
});

test('importSettingsBundle restores hosted sms pool state from schema-only settings', async () => {
  const api = new Function(`
const self = {};
${flowRegistrySource}
${settingsSchemaSource}
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const DEFAULT_REGISTRATION_EMAIL_STATE = { emailHistory: [] };
const PERSISTED_SETTING_DEFAULTS = {
  activeFlowId: DEFAULT_ACTIVE_FLOW_ID,
  panelMode: 'cpa',
  signupMethod: 'email',
  plusModeEnabled: false,
  phonePlusModeEnabled: false,
  plusPaymentMethod: 'paypal',
  plusAccountAccessStrategy: 'oauth',
  hostedCheckoutSmsPoolText: '',
  hostedCheckoutSmsPoolMaxUses: 3,
  hostedCheckoutSmsPoolUsage: {},
  hostedCheckoutCurrentSmsEntry: null,
  phoneVerificationEnabled: false,
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const SETTINGS_SCHEMA_VIEW_KEYS = Object.freeze([
  'activeFlowId',
  'panelMode',
  'signupMethod',
  'plusModeEnabled',
  'phonePlusModeEnabled',
  'plusPaymentMethod',
  'plusAccountAccessStrategy',
  'hostedCheckoutSmsPoolText',
  'hostedCheckoutSmsPoolMaxUses',
  'hostedCheckoutSmsPoolUsage',
  'hostedCheckoutCurrentSmsEntry',
  'phoneVerificationEnabled',
]);
const SETTINGS_SCHEMA_VIEW_KEY_SET = new Set(SETTINGS_SCHEMA_VIEW_KEYS);
const DEFAULT_SUB2API_GROUP_NAMES = ['codex'];
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
let persistedUpdates = null;
let stateUpdates = null;
let broadcastPayload = null;
let currentState = {
  activeFlowId: 'openai',
  signupMethod: 'email',
  nodeStatuses: {},
};
async function ensureManualInteractionAllowed() {
  return currentState;
}
function normalizePersistentSettingValue(key, value) {
  switch (key) {
    case 'activeFlowId':
    case 'panelMode':
    case 'signupMethod':
    case 'plusPaymentMethod':
    case 'plusAccountAccessStrategy':
      return String(value || '').trim();
    case 'plusModeEnabled':
    case 'phonePlusModeEnabled':
    case 'phoneVerificationEnabled':
      return Boolean(value);
    case 'hostedCheckoutSmsPoolText':
      return String(value || '').replace(/\\r/g, '').trim();
    case 'hostedCheckoutSmsPoolMaxUses': {
      const numeric = Number(value);
      return Math.min(99, Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : 3)));
    }
    case 'hostedCheckoutSmsPoolUsage':
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).map(([entryKey, item]) => {
        const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
        const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
        const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
        return [String(entryKey || '').trim(), {
          useCount,
          usedAt: Math.max(0, Number(usage.usedAt) || 0),
          lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
          lastError: String(usage.lastError || '').trim(),
          enabled: usage.enabled !== false,
          disabledReason: String(usage.disabledReason || '').trim(),
          disabledAt: Math.max(0, Number(usage.disabledAt) || 0),
          failureCount: Math.max(0, Math.floor(Number(usage.failureCount) || 0)),
        }];
      }).filter(([entryKey]) => Boolean(entryKey)));
    case 'hostedCheckoutCurrentSmsEntry': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
      const normalizedPhone = String(value.phone || '').trim().replace(/\\D+/g, '');
      const phone = normalizedPhone.length === 11 && normalizedPhone.startsWith('1')
        ? normalizedPhone.slice(1)
        : normalizedPhone;
      const rawUrl = String(value.verificationUrl || '').trim();
      let verificationUrl = rawUrl;
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          parsed.searchParams.delete('t');
          verificationUrl = parsed.toString();
        } catch {
          verificationUrl = rawUrl.replace(/([?&])t=\\d+(?=(&|$))/i, '$1').replace(/[?&]$/g, '');
        }
      }
      const key = String(value.key || (phone && verificationUrl ? \`\${phone}----\${verificationUrl}\` : '')).trim();
      if (!phone || !verificationUrl || !key) return null;
      return { key, phone, verificationUrl };
    }
    default:
      return value;
  }
}
function resolveLegacyAutoStepDelaySeconds() {}
function normalizeCloudflareDomains(value) { return value; }
function normalizeCloudflareTempEmailDomains(value) { return value; }
function normalizeCloudMailDomains(value) { return value; }
function normalizeSub2ApiGroupNames(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function validateModeSwitchState() { return { ok: true, errors: [], normalizedUpdates: {} }; }
function resolveSignupMethod(state = {}) { return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email'; }
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
${extractFunction('getSettingsSchemaApi')}
${extractFunction('projectSettingsSchemaView')}
${extractFunction('setSettingsStatePatchValue')}
${extractFunction('mergeSettingsStatePatch')}
${extractFunction('buildSettingsStatePatchFromFlatUpdates')}
${extractFunction('buildPersistentSettingsPayload')}
async function setPersistentSettings(updates) {
  persistedUpdates = { ...updates };
  return { ...updates };
}
async function setState(updates) {
  stateUpdates = { ...updates };
  currentState = { ...currentState, ...updates };
}
function broadcastDataUpdate(payload) {
  broadcastPayload = { ...payload };
}
async function getState() {
  return { ...currentState };
}
${extractFunction('importSettingsBundle')}
return {
  importSettingsBundle,
  getPersistedUpdates: () => persistedUpdates,
  getStateUpdates: () => stateUpdates,
  getBroadcastPayload: () => broadcastPayload,
};
`)();

  const result = await api.importSettingsBundle({
    schemaVersion: 1,
    settings: {
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
            signup: {
              signupMethod: 'email',
              phoneVerificationEnabled: false,
              phoneSignupReloginAfterBindEmailEnabled: false,
            },
            plus: {
              plusModeEnabled: true,
              plusPaymentMethod: 'paypal',
              hostedCheckoutSecurityChallengeEnabled: true,
              hostedCheckoutFirstDirectResendEnabled: true,
              hostedCheckoutFirstResendWaitSeconds: 34,
              hostedCheckoutSubsequentResendWaitSeconds: 41,
              hostedCheckoutVerificationPollAttempts: 11,
              hostedCheckoutVerificationPollIntervalSeconds: 6,
              hostedCheckoutVerificationResendMaxAttempts: 4,
              hostedCheckoutSmsPoolText: '14155555678----https://example.com/verify?t=1',
              hostedCheckoutSmsPoolMaxUses: '6.8',
              hostedCheckoutSmsPoolUsage: {
                '4155555678----https://example.com/verify': { useCount: 2, lastError: 'timeout' },
                stale: { useCount: 9, lastError: 'stale' },
              },
              hostedCheckoutCurrentSmsEntry: {
                key: '14155555678----https://example.com/verify?t=2',
                phone: '4155555678',
                verificationUrl: 'https://example.com/verify?t=9',
              },
            },
          },
        },
      },
    },
  });

  assert.equal(api.getPersistedUpdates().hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.deepEqual(api.getPersistedUpdates().hostedCheckoutSmsPoolUsage, {
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
  assert.deepEqual(api.getPersistedUpdates().hostedCheckoutCurrentSmsEntry, {
    key: '4155555678----https://example.com/verify',
    phone: '4155555678',
    verificationUrl: 'https://example.com/verify',
  });
  assert.equal(api.getPersistedUpdates().hostedCheckoutFirstDirectResendEnabled, true);
  assert.equal(api.getPersistedUpdates().hostedCheckoutSecurityChallengeEnabled, true);
  assert.equal(api.getPersistedUpdates().hostedCheckoutFirstResendWaitSeconds, 34);
  assert.equal(api.getPersistedUpdates().hostedCheckoutSubsequentResendWaitSeconds, 41);
  assert.equal(api.getPersistedUpdates().hostedCheckoutVerificationPollAttempts, 11);
  assert.equal(api.getPersistedUpdates().hostedCheckoutVerificationPollIntervalSeconds, 6);
  assert.equal(api.getPersistedUpdates().hostedCheckoutVerificationResendMaxAttempts, 4);
  assert.equal(api.getPersistedUpdates().hostedCheckoutSmsPoolMaxUses, 6);
  assert.equal(api.getStateUpdates().hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.equal(api.getStateUpdates().hostedCheckoutSmsPoolMaxUses, 6);
  assert.equal(api.getStateUpdates().hostedCheckoutSecurityChallengeEnabled, true);
  assert.equal(api.getStateUpdates().hostedCheckoutFirstResendWaitSeconds, 34);
  assert.equal(api.getBroadcastPayload().hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.equal(api.getBroadcastPayload().hostedCheckoutSecurityChallengeEnabled, true);
  assert.equal(api.getBroadcastPayload().hostedCheckoutVerificationResendMaxAttempts, 4);
  assert.equal(api.getBroadcastPayload().hostedCheckoutSmsPoolMaxUses, 6);
  assert.equal(result.hostedCheckoutSmsPoolText, '4155555678----https://example.com/verify');
  assert.equal(result.hostedCheckoutSmsPoolMaxUses, 6);
  assert.equal(result.hostedCheckoutSecurityChallengeEnabled, true);
  assert.equal(result.hostedCheckoutVerificationPollIntervalSeconds, 6);
});

test('importSettingsBundle restores hosted checkout first resend wait and mirrors legacy popup delay field', async () => {
  const api = new Function(`
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const DEFAULT_REGISTRATION_EMAIL_STATE = { emailHistory: [] };
const PERSISTED_SETTING_DEFAULTS = {
  hostedCheckoutFirstResendWaitSeconds: 20,
  hostedCheckoutVerificationPopupDelaySeconds: 20,
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const DEFAULT_SUB2API_GROUP_NAMES = ['codex'];
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
let persistedUpdates = null;
let stateUpdates = null;
let broadcastPayload = null;
let currentState = { activeFlowId: 'openai', signupMethod: 'email', nodeStatuses: {} };
async function ensureManualInteractionAllowed() { return currentState; }
function normalizePersistentSettingValue(key, value) {
  switch (key) {
    case 'hostedCheckoutFirstResendWaitSeconds': {
      const numeric = Number(value);
      return Math.min(300, Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 20)));
    }
    case 'hostedCheckoutVerificationPopupDelaySeconds': {
      const numeric = Number(value);
      return Math.min(60, Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 20)));
    }
    default:
      return value;
  }
}
function resolveLegacyAutoStepDelaySeconds() {}
function normalizeCloudflareDomains(value) { return value; }
function normalizeCloudflareTempEmailDomains(value) { return value; }
function normalizeCloudMailDomains(value) { return value; }
function normalizeSub2ApiGroupNames(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function validateModeSwitchState() { return { ok: true, errors: [], normalizedUpdates: {} }; }
function resolveSignupMethod(state = {}) { return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email'; }
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
async function setPersistentSettings(updates) { persistedUpdates = { ...updates }; return { ...updates }; }
async function setState(updates) { stateUpdates = { ...updates }; currentState = { ...currentState, ...updates }; }
function broadcastDataUpdate(payload) { broadcastPayload = { ...payload }; }
async function getState() { return { ...currentState }; }
${extractFunction('buildPersistentSettingsPayload')}
${extractFunction('importSettingsBundle')}
return {
  importSettingsBundle,
  getPersistedUpdates: () => persistedUpdates,
  getStateUpdates: () => stateUpdates,
  getBroadcastPayload: () => broadcastPayload,
};
`)();

  const result = await api.importSettingsBundle({
    schemaVersion: 1,
    settings: {
      hostedCheckoutVerificationPopupDelaySeconds: 22,
    },
  });

  assert.equal(api.getPersistedUpdates().hostedCheckoutFirstResendWaitSeconds, 22);
  assert.equal(api.getPersistedUpdates().hostedCheckoutVerificationPopupDelaySeconds, 22);
  assert.equal(api.getStateUpdates().hostedCheckoutFirstResendWaitSeconds, 22);
  assert.equal(api.getBroadcastPayload().hostedCheckoutVerificationPopupDelaySeconds, 22);
  assert.equal(result.hostedCheckoutFirstResendWaitSeconds, 22);
});

test('importSettingsBundle accepts legacy settings files and backfills newer phone provider defaults', async () => {
  const api = new Function(`
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const DEFAULT_REGISTRATION_EMAIL_STATE = { emailHistory: [] };
const DEFAULT_SMSBOWER_BASE_URL = 'https://smsbower.page/stubs/handler_api.php';
const DEFAULT_SMS_VERIFICATION_NUMBER_BASE_URL = 'https://sms-verification-number.com/stubs/handler_api';
const DEFAULT_GRIZZLY_SMS_BASE_URL = 'https://api.grizzlysms.com/stubs/handler_api.php';
const DEFAULT_SMSPOOL_BASE_URL = 'https://api.smspool.net/stubs/handler_api.php?setting=smspool';
const DEFAULT_SMSBOWER_SERVICE_CODE = 'dr';
const DEFAULT_SMS_VERIFICATION_NUMBER_SERVICE_CODE = 'wa';
const DEFAULT_GRIZZLY_SMS_SERVICE_CODE = 'dr';
const DEFAULT_SMSPOOL_SERVICE_CODE = '671';
const DEFAULT_SMSPOOL_COUNTRY_ID = 1;
const DEFAULT_SMSPOOL_COUNTRY_LABEL = 'United States';
const DEFAULT_FIVE_SIM_PRODUCT = 'openai';
const FIVE_SIM_COUNTRY_ID = 'vietnam';
const FIVE_SIM_COUNTRY_LABEL = 'Vietnam';
const FIVE_SIM_OPERATOR = 'any';
const DEFAULT_NEX_SMS_COUNTRY_ORDER = [1];
const DEFAULT_NEX_SMS_SERVICE_CODE = 'ot';
const DEFAULT_FIVE_SIM_COUNTRY_ORDER = ['vietnam'];
const HERO_SMS_COUNTRY_ID = 52;
const HERO_SMS_COUNTRY_LABEL = 'Thailand';
const DEFAULT_PHONE_SMS_PROVIDER = 'hero-sms';
const DEFAULT_HERO_SMS_REUSE_ENABLED = true;
const DEFAULT_HERO_SMS_ACQUIRE_PRIORITY = 'price';
const PHONE_SMS_PRICE_INPUT_MAX = 0.1;
const PERSISTED_SETTING_DEFAULTS = {
  panelMode: 'cpa',
  signupMethod: 'email',
  phoneSmsProvider: DEFAULT_PHONE_SMS_PROVIDER,
  fiveSimProduct: DEFAULT_FIVE_SIM_PRODUCT,
  fiveSimCountryId: FIVE_SIM_COUNTRY_ID,
  fiveSimCountryLabel: FIVE_SIM_COUNTRY_LABEL,
  fiveSimCountryFallback: [],
  fiveSimCountryOrder: [...DEFAULT_FIVE_SIM_COUNTRY_ORDER],
  fiveSimMinPrice: '',
  fiveSimMaxPrice: '',
  fiveSimOperator: FIVE_SIM_OPERATOR,
  nexSmsApiKey: '',
  nexSmsCountryOrder: [...DEFAULT_NEX_SMS_COUNTRY_ORDER],
  nexSmsServiceCode: DEFAULT_NEX_SMS_SERVICE_CODE,
  smsBowerApiKey: '',
  smsBowerBaseUrl: DEFAULT_SMSBOWER_BASE_URL,
  smsBowerServiceCode: DEFAULT_SMSBOWER_SERVICE_CODE,
  smsBowerCountryId: HERO_SMS_COUNTRY_ID,
  smsBowerCountryLabel: HERO_SMS_COUNTRY_LABEL,
  smsBowerCountryFallback: [],
  smsBowerMinPrice: '',
  smsBowerMaxPrice: '',
  smsBowerPreferredPrice: '',
  smsVerificationNumberApiKey: '',
  smsVerificationNumberBaseUrl: DEFAULT_SMS_VERIFICATION_NUMBER_BASE_URL,
  smsVerificationNumberServiceCode: DEFAULT_SMS_VERIFICATION_NUMBER_SERVICE_CODE,
  smsVerificationNumberCountryId: 33,
  smsVerificationNumberCountryLabel: 'Colombia',
  smsVerificationNumberCountryFallback: [],
  smsVerificationNumberMinPrice: '',
  smsVerificationNumberMaxPrice: '',
  smsVerificationNumberPreferredPrice: '',
  grizzlySmsApiKey: '',
  grizzlySmsBaseUrl: DEFAULT_GRIZZLY_SMS_BASE_URL,
  grizzlySmsServiceCode: DEFAULT_GRIZZLY_SMS_SERVICE_CODE,
  grizzlySmsCountryId: 52,
  grizzlySmsCountryLabel: 'Thailand',
  grizzlySmsCountryFallback: [],
  grizzlySmsMinPrice: '',
  grizzlySmsMaxPrice: '',
  grizzlySmsPreferredPrice: '',
  smsPoolApiKey: '',
  smsPoolBaseUrl: DEFAULT_SMSPOOL_BASE_URL,
  smsPoolServiceCode: DEFAULT_SMSPOOL_SERVICE_CODE,
  smsPoolCountryId: DEFAULT_SMSPOOL_COUNTRY_ID,
  smsPoolCountryLabel: DEFAULT_SMSPOOL_COUNTRY_LABEL,
  smsPoolCountryFallback: [],
  smsPoolMinPrice: '',
  smsPoolMaxPrice: '',
  smsPoolPreferredPrice: '',
  phonePreferredActivation: null,
  heroSmsApiKey: '',
  heroSmsReuseEnabled: DEFAULT_HERO_SMS_REUSE_ENABLED,
  heroSmsAcquirePriority: DEFAULT_HERO_SMS_ACQUIRE_PRIORITY,
  heroSmsMinPrice: '',
  heroSmsMaxPrice: '',
  heroSmsPreferredPrice: '',
  heroSmsCountryId: HERO_SMS_COUNTRY_ID,
  heroSmsCountryLabel: HERO_SMS_COUNTRY_LABEL,
  heroSmsCountryFallback: [],
  heroSmsOperatorByCountry: {},
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const DEFAULT_SUB2API_GROUP_NAMES = ['codex'];
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
let persistedUpdates = null;
let stateUpdates = null;
let broadcastPayload = null;
let currentState = {
  activeFlowId: 'openai',
  signupMethod: 'email',
  nodeStatuses: {},
};
async function ensureManualInteractionAllowed() {
  return currentState;
}
function normalizePanelMode(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'sub2api' || normalized === 'codex2api' ? normalized : 'cpa';
}
function normalizeSignupMethod(value = '') {
  return String(value || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
function normalizePhoneSmsProvider(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '5sim' || normalized === 'nexsms' ? normalized : DEFAULT_PHONE_SMS_PROVIDER;
}
function normalizePhoneSmsProviderOrder(value) {
  return Array.isArray(value) ? value : [];
}
function normalizeAutoRunFallbackThreadIntervalMinutes(value) { return Number(value) || 0; }
function normalizeAutoRunDelayMinutes(value) { return Number(value) || 30; }
function normalizeAutoStepDelaySeconds(value) { return value == null || value === '' ? null : Number(value); }
function normalizeVerificationResendCount(value, fallback = 4) {
  const numeric = Number(value);
  return Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneVerificationReplacementLimit(value, fallback = 3) {
  const numeric = Number(value);
  return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneActivationRetryRounds(value, fallback = 2) {
  const numeric = Number(value);
  return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneActivationTierUpgradeLimit(value, fallback = 1) {
  const numeric = Number(value);
  return Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneCodeWaitSeconds(value, fallback = 60) {
  const numeric = Number(value);
  return Math.max(15, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneCodeTimeoutWindows(value, fallback = 2) {
  const numeric = Number(value);
  return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneCodePollIntervalSeconds(value, fallback = 5) {
  const numeric = Number(value);
  return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizePhoneCodePollMaxRounds(value, fallback = 4) {
  const numeric = Number(value);
  return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}
function normalizeMailProvider(value = '') { return String(value || '').trim().toLowerCase() || '163'; }
function normalizeMail2925Mode(value = '') { return String(value || '').trim().toLowerCase() || 'provide'; }
function normalizeEmailGenerator(value = '') { return String(value || '').trim().toLowerCase() || 'duck'; }
function normalizeCustomEmailPool(value) { return Array.isArray(value) ? value : []; }
function normalizeCustomEmailPoolEntryObjects(value) { return Array.isArray(value) ? value : []; }
function normalizeIcloudHost(value = '') { return String(value || '').trim().toLowerCase() || 'auto'; }
function normalizeIcloudTargetMailboxType(value = '') { return String(value || '').trim() || 'icloud-inbox'; }
function normalizeIcloudForwardMailProvider(value = '') { return String(value || '').trim() || 'qq'; }
function normalizeIcloudFetchMode(value = '') { return String(value || '').trim() || 'reuse_existing'; }
function normalizeAccountRunHistoryHelperBaseUrl(value = '') { return String(value || '').trim() || 'http://127.0.0.1:17373'; }
function normalizeHotmailServiceMode(value = '') { return String(value || '').trim().toLowerCase() === 'remote' ? 'remote' : 'local'; }
function normalizeHotmailRemoteBaseUrl(value = '') { return String(value || '').trim(); }
function normalizeHotmailLocalBaseUrl(value = '') { return String(value || '').trim() || 'http://127.0.0.1:17373'; }
function normalizeLuckmailBaseUrl(value = '') { return String(value || '').trim(); }
function normalizeLuckmailEmailType(value = '') { return String(value || '').trim(); }
function normalizeLuckmailUsedPurchases(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function normalizeCloudflareDomain(value = '') { return String(value || '').trim(); }
function normalizeCloudflareDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudflareTempEmailBaseUrl(value = '') { return String(value || '').trim(); }
function normalizeCloudflareTempEmailLookupMode(value = '') { return String(value || '').trim() || 'latest'; }
function normalizeCloudflareTempEmailReceiveMailbox(value = '') { return String(value || '').trim(); }
function normalizeCloudflareTempEmailDomain(value = '') { return String(value || '').trim(); }
function normalizeCloudflareTempEmailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeCloudMailBaseUrl(value = '') { return String(value || '').trim(); }
function normalizeCloudMailReceiveMailbox(value = '') { return String(value || '').trim(); }
function normalizeCloudMailDomain(value = '') { return String(value || '').trim(); }
function normalizeCloudMailDomains(value) { return Array.isArray(value) ? value : []; }
function normalizeYydsMailApiKey(value = '') { return String(value || '').trim(); }
function normalizeYydsMailBaseUrl(value = '') { return String(value || '').trim(); }
function normalizeHotmailAccounts(value) { return Array.isArray(value) ? value : []; }
function normalizeMail2925Accounts(value) { return Array.isArray(value) ? value : []; }
function normalizePayPalAccounts(value) { return Array.isArray(value) ? value : []; }
function normalizeHeroSmsAcquirePriority(value = '') { return String(value || '').trim().toLowerCase() || DEFAULT_HERO_SMS_ACQUIRE_PRIORITY; }
function normalizeHeroSmsMaxPrice(value = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return String(Math.round(numeric * 10000) / 10000);
}
${extractFunction('normalizePhoneSmsPriceLimit')}
function normalizeHeroSmsCountryFallback(value) { return Array.isArray(value) ? value : []; }
function normalizeHeroSmsOperatorByCountry(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function normalizeFiveSimCountryCode(value = '', fallback = DEFAULT_FIVE_SIM_PRODUCT) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || fallback;
}
function normalizeFiveSimCountryId(value = '') {
  return normalizeFiveSimCountryCode(value, FIVE_SIM_COUNTRY_ID);
}
function normalizeFiveSimCountryLabel(value = '', fallback = FIVE_SIM_COUNTRY_LABEL) {
  return String(value || '').trim() || fallback;
}
function normalizeFiveSimCountryFallback(value) { return Array.isArray(value) ? value : []; }
function normalizeFiveSimCountryOrder(value = []) {
  return Array.isArray(value) ? value.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean) : [];
}
function normalizeFiveSimMaxPrice(value = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return String(Math.round(numeric * 10000) / 10000);
}
function normalizeFiveSimOperator(value = '', fallback = FIVE_SIM_OPERATOR) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || fallback;
}
function normalizeNexSmsCountryId(value, fallback = 0) {
  const parsed = Math.floor(Number(value));
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return Math.max(0, Math.floor(Number(fallback) || 0));
}
function normalizeNexSmsCountryOrder(value = []) {
  return Array.isArray(value) ? value.map((entry) => normalizeNexSmsCountryId(entry, -1)).filter((entry) => entry >= 0) : [];
}
function normalizeNexSmsServiceCode(value = '', fallback = DEFAULT_NEX_SMS_SERVICE_CODE) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || fallback;
}
function normalizePhonePreferredActivation(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
function resolveLegacyAutoStepDelaySeconds() {}
function normalizeSub2ApiGroupNames(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function validateModeSwitchState() {
  return { ok: true, errors: [], normalizedUpdates: {} };
}
function resolveSignupMethod(state = {}) {
  return String(state?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email';
}
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
async function setPersistentSettings(updates) {
  persistedUpdates = { ...updates };
  return { ...updates };
}
async function setState(updates) {
  stateUpdates = { ...updates };
  currentState = { ...currentState, ...updates };
}
function broadcastDataUpdate(payload) {
  broadcastPayload = { ...payload };
}
async function getState() {
  return { ...currentState };
}
${extractFunction('buildPersistentSettingsPayload')}
${extractFunction('normalizePersistentSettingValue')}
${extractFunction('importSettingsBundle')}
return {
  importSettingsBundle,
  getPersistedUpdates: () => persistedUpdates,
  getStateUpdates: () => stateUpdates,
  getBroadcastPayload: () => broadcastPayload,
};
`)();

  const legacyConfig = {
    schemaVersion: 1,
    settings: {
      panelMode: 'cpa',
      signupMethod: 'email',
      heroSmsApiKey: 'hero-key',
    },
  };

  const result = await api.importSettingsBundle(legacyConfig);

  assert.equal(api.getPersistedUpdates().heroSmsApiKey, 'hero-key');
  assert.equal(api.getPersistedUpdates().smsBowerBaseUrl, 'https://smsbower.page/stubs/handler_api.php');
  assert.equal(
    api.getPersistedUpdates().smsVerificationNumberBaseUrl,
    'https://sms-verification-number.com/stubs/handler_api'
  );
  assert.equal(api.getPersistedUpdates().fiveSimProduct, 'openai');
  assert.deepEqual(api.getPersistedUpdates().nexSmsCountryOrder, [1]);
  assert.equal(api.getPersistedUpdates().phonePreferredActivation, null);
  assert.equal(api.getStateUpdates().smsPoolCountryLabel, 'United States');
  assert.equal(api.getBroadcastPayload().grizzlySmsCountryLabel, 'Thailand');
  assert.equal(result.smsPoolServiceCode, '671');
});
