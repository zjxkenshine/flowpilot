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

test('buildPersistentSettingsPayload keeps hosted current sms entry only when it belongs to the pool', () => {
const api = new Function(`
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
function validateModeSwitchState() { return { ok: true, normalizedUpdates: {} }; }
function resolveSignupMethod(state = {}) { return state.signupMethod || 'email'; }
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
${extractFunction('buildPersistentSettingsPayload')}
return { buildPersistentSettingsPayload };
`)();

  const kept = api.buildPersistentSettingsPayload({
    hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify?t=1',
    hostedCheckoutSmsPoolUsage: {
      '1234567890----https://example.com/verify': { useCount: 2, lastError: 'timeout' },
      stale: { useCount: 9, lastError: 'stale' },
    },
    hostedCheckoutCurrentSmsEntry: {
      key: '1234567890----https://example.com/verify',
      phone: '1234567890',
      verificationUrl: 'https://example.com/verify?t=9',
    },
  });

  assert.equal(kept.hostedCheckoutSmsPoolText, '1234567890----https://example.com/verify');
  assert.deepEqual(kept.hostedCheckoutCurrentSmsEntry, {
    key: '1234567890----https://example.com/verify',
    phone: '1234567890',
    verificationUrl: 'https://example.com/verify',
  });
  assert.deepEqual(kept.hostedCheckoutSmsPoolUsage, {
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

  const cleared = api.buildPersistentSettingsPayload({
    hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify',
    hostedCheckoutCurrentSmsEntry: {
      key: '0000000000----https://example.com/missing',
      phone: '0000000000',
      verificationUrl: 'https://example.com/missing',
    },
  });

  assert.equal(cleared.hostedCheckoutCurrentSmsEntry, null);
});

test('buildPersistentSettingsPayload maps legacy popup delay into hosted checkout first resend wait seconds', () => {
  const api = new Function(`
const PERSISTED_SETTING_DEFAULTS = {
  hostedCheckoutFirstResendWaitSeconds: 20,
  hostedCheckoutVerificationPopupDelaySeconds: 20,
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
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
function validateModeSwitchState() { return { ok: true, normalizedUpdates: {} }; }
function resolveSignupMethod(state = {}) { return state.signupMethod || 'email'; }
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
${extractFunction('buildPersistentSettingsPayload')}
return { buildPersistentSettingsPayload };
`)();

  const payload = api.buildPersistentSettingsPayload({
    hostedCheckoutVerificationPopupDelaySeconds: 18,
  });

  assert.equal(payload.hostedCheckoutFirstResendWaitSeconds, 18);
  assert.equal(payload.hostedCheckoutVerificationPopupDelaySeconds, 18);
});

test('exportSettingsBundle serializes normalized hosted sms pool state into settings bundle', async () => {
  const api = new Function(`
const SETTINGS_EXPORT_SCHEMA_VERSION = 1;
const SETTINGS_EXPORT_FILENAME_PREFIX = 'multipage-settings';
const PERSISTED_SETTING_DEFAULTS = {
  hostedCheckoutSmsPoolText: '',
  hostedCheckoutSmsPoolUsage: {},
  hostedCheckoutCurrentSmsEntry: null,
};
const PERSISTED_SETTING_KEYS = Object.keys(PERSISTED_SETTING_DEFAULTS);
const PERSISTED_SETTINGS_SCHEMA_KEYS = [];
const LEGACY_AUTO_STEP_DELAY_KEYS = [];
const LEGACY_VERIFICATION_RESEND_COUNT_KEYS = [];
const DEFAULT_SUB2API_GROUP_NAMES = ['codex'];
const SIGNUP_METHOD_PHONE = 'phone';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
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
function validateModeSwitchState() { return { ok: true, normalizedUpdates: {} }; }
function resolveSignupMethod(state = {}) { return state.signupMethod || 'email'; }
function isPlainObjectValue(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function mergeSettingsStatePatch(base, patch) { return { ...(base || {}), ...(patch || {}) }; }
const chrome = {
  runtime: {
    getManifest() {
      return { version: '1.2.3' };
    },
  },
  storage: {
    local: {
      async get() {
        return {
          hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify?t=1',
          hostedCheckoutSmsPoolUsage: {
            '1234567890----https://example.com/verify': { useCount: 2, lastError: 'timeout' },
            stale: { useCount: 9, lastError: 'stale' },
          },
          hostedCheckoutCurrentSmsEntry: {
            key: '1234567890----https://example.com/verify',
            phone: '1234567890',
            verificationUrl: 'https://example.com/verify?t=9',
          },
        };
      },
    },
  },
};
${extractFunction('buildPersistentSettingsPayload')}
${extractFunction('getPersistedSettings')}
${extractFunction('buildSettingsExportFilename')}
${extractFunction('exportSettingsBundle')}
return { exportSettingsBundle };
`)();

  const exported = await api.exportSettingsBundle();
  const bundle = JSON.parse(exported.fileContent);

  assert.match(exported.fileName, /^multipage-settings-\d{8}-\d{6}\.json$/);
  assert.equal(bundle.schemaVersion, 1);
  assert.equal(bundle.extensionVersion, '1.2.3');
  assert.equal(bundle.settings.hostedCheckoutSmsPoolText, '1234567890----https://example.com/verify');
  assert.deepEqual(bundle.settings.hostedCheckoutSmsPoolUsage, {
    '1234567890----https://example.com/verify': {
      useCount: 2,
      usedAt: 0,
      lastAttemptAt: 0,
      lastError: 'timeout',
    },
  });
  assert.deepEqual(bundle.settings.hostedCheckoutCurrentSmsEntry, {
    key: '1234567890----https://example.com/verify',
    phone: '1234567890',
    verificationUrl: 'https://example.com/verify',
  });
});
