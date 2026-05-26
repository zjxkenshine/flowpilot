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
