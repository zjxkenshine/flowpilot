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

function createApi(options = {}) {
  const events = {
    updates: [],
    reloads: [],
    readyCalls: [],
    timeoutCalls: [],
  };
  const api = new Function('events', 'options', `
const chrome = {
  tabs: {
    async update(tabId, payload) {
      events.updates.push({ tabId, payload });
      return { id: tabId, url: payload.url };
    },
    async reload(tabId, payload) {
      events.reloads.push({ tabId, payload });
    },
  },
};
async function getOAuthFlowStepTimeoutMs(defaultMs, payload) {
  events.timeoutCalls.push({ defaultMs, payload });
  return options.timeoutMs || 30000;
}
async function ensureStep8SignupPageReady(tabId, payload) {
  events.readyCalls.push({ tabId, payload });
}
${extractFunction('refreshAuthContactVerificationTab')}
return {
  run(tabId, payload) {
    return refreshAuthContactVerificationTab(tabId, payload);
  },
  snapshot() {
    return events;
  },
};
`)(events, options);
  return api;
}

test('refreshAuthContactVerificationTab always navigates to contact-verification instead of reloading', async () => {
  const api = createApi({ timeoutMs: 45000 });

  const result = await api.run(12, {
    visibleStep: 4,
    logStepKey: 'fetch-signup-code',
    logMessage: '步骤 4：重发后已刷新 contact-verification 页面，等待认证页脚本恢复。',
  });
  const events = api.snapshot();

  assert.deepStrictEqual(result, {
    url: 'https://auth.openai.com/contact-verification',
  });
  assert.deepStrictEqual(events.reloads, []);
  assert.deepStrictEqual(events.updates, [
    {
      tabId: 12,
      payload: {
        url: 'https://auth.openai.com/contact-verification',
        active: true,
      },
    },
  ]);
  assert.deepStrictEqual(events.timeoutCalls, [
    {
      defaultMs: 30000,
      payload: {
        step: 4,
        actionLabel: 'refresh contact-verification',
      },
    },
  ]);
  assert.deepStrictEqual(events.readyCalls, [
    {
      tabId: 12,
      payload: {
        timeoutMs: 45000,
        visibleStep: 4,
        logStepKey: 'fetch-signup-code',
        logMessage: '步骤 4：重发后已刷新 contact-verification 页面，等待认证页脚本恢复。',
      },
    },
  ]);
});

test('refreshAuthContactVerificationTab preserves explicit timeout and default log metadata', async () => {
  const api = createApi();

  await api.run(7, {
    step: 6,
    timeoutMs: 15000,
  });
  const events = api.snapshot();

  assert.deepStrictEqual(events.reloads, []);
  assert.deepStrictEqual(events.timeoutCalls, []);
  assert.deepStrictEqual(events.updates, [
    {
      tabId: 7,
      payload: {
        url: 'https://auth.openai.com/contact-verification',
        active: true,
      },
    },
  ]);
  assert.deepStrictEqual(events.readyCalls, [
    {
      tabId: 7,
      payload: {
        timeoutMs: 15000,
        visibleStep: 6,
        logStepKey: 'fetch-signup-code',
        logMessage: '步骤 4：已刷新 contact-verification 页面，等待认证页脚本恢复。',
      },
    },
  ]);
});
