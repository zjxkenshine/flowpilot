const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

function extractFunction(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers
    .map((marker) => source.indexOf(marker))
    .find((index) => index >= 0);
  assert.notEqual(start, -1, `missing ${name}`);

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

  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  throw new Error(`unterminated ${name}`);
}

test('exportSettingsFile downloads settings bundle as utf8 json with bom', async () => {
  const api = new Function(`
let configActionInFlight = false;
let closeMenuCount = 0;
let updateControlsCount = 0;
let flushCount = 0;
const messages = [];
const downloads = [];
const toasts = [];
function closeConfigMenu() {
  closeMenuCount += 1;
}
function updateConfigMenuControls() {
  updateControlsCount += 1;
}
async function flushPendingSettingsBeforeExport() {
  flushCount += 1;
}
function downloadTextFile(content, fileName, mimeType, options) {
  downloads.push({ content, fileName, mimeType, options });
}
function showToast(message, tone, duration) {
  toasts.push({ message, tone, duration });
}
const chrome = {
  runtime: {
    async sendMessage(message) {
      messages.push(message);
      return {
        fileContent: '{"schemaVersion":1,"settings":{}}',
        fileName: 'multipage-settings-20260526-120000.json',
      };
    },
  },
};
${extractFunction('exportSettingsFile')}
return {
  exportSettingsFile,
  getSnapshot() {
    return {
      configActionInFlight,
      closeMenuCount,
      updateControlsCount,
      flushCount,
      messages,
      downloads,
      toasts,
    };
  },
};
`)();

  await api.exportSettingsFile();
  const snapshot = api.getSnapshot();

  assert.equal(snapshot.closeMenuCount, 1);
  assert.equal(snapshot.flushCount, 1);
  assert.equal(snapshot.configActionInFlight, false);
  assert.deepEqual(snapshot.messages, [
    {
      type: 'EXPORT_SETTINGS',
      source: 'sidepanel',
      payload: {},
    },
  ]);
  assert.deepEqual(snapshot.downloads, [
    {
      content: '{"schemaVersion":1,"settings":{}}',
      fileName: 'multipage-settings-20260526-120000.json',
      mimeType: 'application/json;charset=utf-8',
      options: {
        prependUtf8Bom: true,
      },
    },
  ]);
  assert.equal(snapshot.toasts.at(-1)?.tone, 'success');
});

test('importSettingsFromFile accepts utf8 bom json and applies hosted sms pool state', async () => {
  const api = new Function(`
let configActionInFlight = false;
let closeMenuCount = 0;
let updateControlsCount = 0;
let settleCount = 0;
let latestState = { beforeImport: true };
const inputImportSettingsFile = { value: 'dirty' };
const confirms = [];
const messages = [];
const appliedStates = [];
const statusStates = [];
const toasts = [];
function closeConfigMenu() {
  closeMenuCount += 1;
}
function updateConfigMenuControls() {
  updateControlsCount += 1;
}
async function settlePendingSettingsBeforeImport() {
  settleCount += 1;
}
async function openConfirmModal(options) {
  confirms.push(options);
  return true;
}
function applySettingsState(state) {
  appliedStates.push(state);
  latestState = { ...(state || {}) };
}
function updateStatusDisplay(state) {
  statusStates.push(state);
}
function showToast(message, tone, duration) {
  toasts.push({ message, tone, duration });
}
const chrome = {
  runtime: {
    async sendMessage(message) {
      messages.push(message);
      return {
        state: {
          hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify',
          hostedCheckoutSmsPoolUsage: {
            '1234567890----https://example.com/verify': {
              useCount: 2,
              usedAt: 0,
              lastAttemptAt: 0,
              lastError: 'timeout',
            },
          },
          hostedCheckoutCurrentSmsEntry: {
            key: '1234567890----https://example.com/verify',
            phone: '1234567890',
            verificationUrl: 'https://example.com/verify',
          },
        },
      };
    },
  },
};
${extractFunction('importSettingsFromFile')}
return {
  importSettingsFromFile,
  getSnapshot() {
    return {
      configActionInFlight,
      closeMenuCount,
      updateControlsCount,
      settleCount,
      confirms,
      messages,
      appliedStates,
      statusStates,
      toasts,
      inputImportSettingsFile,
    };
  },
};
`)();

  const importedConfig = {
    schemaVersion: 1,
    settings: {
      hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify',
      hostedCheckoutSmsPoolUsage: {
        '1234567890----https://example.com/verify': {
          useCount: 1,
          lastError: '',
        },
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '1234567890----https://example.com/verify',
        phone: '1234567890',
        verificationUrl: 'https://example.com/verify',
      },
    },
  };
  const file = {
    name: 'settings.json',
    async text() {
      return `\uFEFF${JSON.stringify(importedConfig)}`;
    },
  };

  await api.importSettingsFromFile(file);
  const snapshot = api.getSnapshot();

  assert.equal(snapshot.closeMenuCount, 1);
  assert.equal(snapshot.settleCount, 1);
  assert.equal(snapshot.configActionInFlight, false);
  assert.equal(snapshot.confirms.length, 1);
  assert.deepEqual(snapshot.messages, [
    {
      type: 'IMPORT_SETTINGS',
      source: 'sidepanel',
      payload: {
        config: importedConfig,
      },
    },
  ]);
  assert.deepEqual(snapshot.appliedStates, [
    {
      hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify',
      hostedCheckoutSmsPoolUsage: {
        '1234567890----https://example.com/verify': {
          useCount: 2,
          usedAt: 0,
          lastAttemptAt: 0,
          lastError: 'timeout',
        },
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '1234567890----https://example.com/verify',
        phone: '1234567890',
        verificationUrl: 'https://example.com/verify',
      },
    },
  ]);
  assert.deepEqual(snapshot.statusStates, [
    {
      hostedCheckoutSmsPoolText: '1234567890----https://example.com/verify',
      hostedCheckoutSmsPoolUsage: {
        '1234567890----https://example.com/verify': {
          useCount: 2,
          usedAt: 0,
          lastAttemptAt: 0,
          lastError: 'timeout',
        },
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '1234567890----https://example.com/verify',
        phone: '1234567890',
        verificationUrl: 'https://example.com/verify',
      },
    },
  ]);
  assert.equal(snapshot.inputImportSettingsFile.value, '');
  assert.equal(snapshot.toasts.at(-1)?.tone, 'success');
});
