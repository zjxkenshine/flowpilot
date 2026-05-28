const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

function createJsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

function loadSub2ApiApiModule() {
  const source = fs.readFileSync('background/sub2api-api.js', 'utf8');
  return new Function('self', `${source}; return self.MultiPageBackgroundSub2ApiApi;`)({});
}

function createSub2ApiOAuthApi(fetchCalls = []) {
  const apiModule = loadSub2ApiApiModule();
  return apiModule.createSub2ApiApi({
    addLog: async () => {},
    normalizeSub2ApiUrl: (value) => value,
    DEFAULT_SUB2API_GROUP_NAME: 'codex',
    fetchImpl: async (url, options = {}) => {
      const parsed = new URL(url);
      const body = options.body ? JSON.parse(options.body) : null;
      fetchCalls.push({ path: parsed.pathname, search: parsed.search, method: options.method || 'GET', body });

      if (parsed.pathname === '/api/v1/auth/login') {
        return createJsonResponse({ code: 0, data: { access_token: 'admin-token' } });
      }
      if (parsed.pathname === '/api/v1/admin/openai/exchange-code') {
        return createJsonResponse({
          code: 0,
          data: {
            access_token: 'openai-access',
            refresh_token: 'openai-refresh',
            expires_at: 1770000000,
            email: 'exchange@example.com',
          },
        });
      }
      if (parsed.pathname === '/api/v1/admin/accounts') {
        return createJsonResponse({ code: 0, data: { id: 11 } });
      }

      return createJsonResponse({ code: 1, message: `unexpected path ${parsed.pathname}` }, 404);
    },
  });
}

test('sub2api oauth account name prefers signup phone over exchanged email', async () => {
  const fetchCalls = [];
  const api = createSub2ApiOAuthApi(fetchCalls);

  await api.submitOpenAiCallback({
    localhostUrl: 'http://localhost:1455/auth/callback?code=callback-code&state=oauth-state',
    sub2apiUrl: 'https://sub.example/admin/accounts',
    sub2apiEmail: 'admin@example.com',
    sub2apiPassword: 'secret',
    sub2apiSessionId: 'session-1',
    sub2apiOAuthState: 'oauth-state',
    sub2apiGroupId: 5,
    email: 'flow@example.com',
    signupPhoneNumber: '+15551234567',
  });

  const createCall = fetchCalls.find((call) => call.path === '/api/v1/admin/accounts');
  assert.ok(createCall, 'expected SUB2API account create call');
  assert.equal(createCall.body.name, '+15551234567');
  assert.equal(createCall.body.credentials.email, 'exchange@example.com');
});

test('sub2api oauth account name falls back to exchanged email when phone is unavailable', async () => {
  const fetchCalls = [];
  const api = createSub2ApiOAuthApi(fetchCalls);

  await api.submitOpenAiCallback({
    localhostUrl: 'http://localhost:1455/auth/callback?code=callback-code&state=oauth-state',
    sub2apiUrl: 'https://sub.example/admin/accounts',
    sub2apiEmail: 'admin@example.com',
    sub2apiPassword: 'secret',
    sub2apiSessionId: 'session-1',
    sub2apiOAuthState: 'oauth-state',
    sub2apiGroupId: 5,
    email: 'flow@example.com',
  });

  const createCall = fetchCalls.find((call) => call.path === '/api/v1/admin/accounts');
  assert.ok(createCall, 'expected SUB2API account create call');
  assert.equal(createCall.body.name, 'exchange@example.com');
});
