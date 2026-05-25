const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('background imports account book module', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  assert.match(source, /background\/account-book\.js/);
});

test('account book module exposes a factory', () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};

  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  assert.equal(typeof api?.createAccountBookHelpers, 'function');
});

test('account book helper creates a registration record and upgrades it on flow completion', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [];
  const helpers = api.createAccountBookHelpers({
    ACCOUNT_BOOK_STORAGE_KEY: 'accountBookEntries',
    chrome: {
      storage: {
        local: {
          get: async () => ({ accountBookEntries: storedEntries }),
          set: async (payload) => {
            storedEntries = payload.accountBookEntries;
          },
        },
      },
    },
    getState: async () => ({
      email: ' Flow@Example.com ',
      signupPhoneNumber: '',
      password: ' secret ',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
      ipProxyAppliedExitIp: ' 203.0.113.8 ',
      ipProxyAppliedExitRegion: ' jp ',
    }),
  });

  const firstEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(firstEntry.recordId, 'flow@example.com');
  assert.equal(firstEntry.email, 'flow@example.com');
  assert.equal(firstEntry.phoneNumber, '');
  assert.equal(firstEntry.password, 'secret');
  assert.equal(firstEntry.flowId, 'openai');
  assert.equal(firstEntry.panelMode, 'sub2api');
  assert.equal(firstEntry.captureStage, 'registration_success');
  assert.equal(firstEntry.finalFlowCompletedAt, '');
  assert.equal(firstEntry.signupIp, '203.0.113.8');
  assert.equal(firstEntry.signupRegion, 'JP');
  assert.equal(storedEntries.length, 1);

  const createdAt = firstEntry.createdAt;
  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'flow@example.com',
    signupPhoneNumber: '',
    signupPhoneCompletedActivation: {
      activationId: 'done-1',
      phoneNumber: '+1 (555) 123-4567',
    },
    password: 'secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    ipProxyAppliedExitIp: '198.51.100.9',
    ipProxyAppliedExitRegion: 'US',
  });
  assert.equal(completedEntry.recordId, 'flow@example.com');
  assert.equal(completedEntry.email, 'flow@example.com');
  assert.equal(completedEntry.phoneNumber, '+1 (555) 123-4567');
  assert.equal(completedEntry.password, 'secret');
  assert.equal(completedEntry.captureStage, 'flow_completed');
  assert.ok(completedEntry.finalFlowCompletedAt);
  assert.equal(completedEntry.createdAt, createdAt);
  assert.equal(completedEntry.signupIp, '203.0.113.8');
  assert.equal(completedEntry.signupRegion, 'JP');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].recordId, 'flow@example.com');
  assert.equal(storedEntries[0].phoneNumber, '+1 (555) 123-4567');
  assert.equal(storedEntries[0].signupIp, '203.0.113.8');
  assert.equal(storedEntries[0].signupRegion, 'JP');
});

test('account book helper does not prefill auth-completed phone on registration success for email signup', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [];
  const helpers = api.createAccountBookHelpers({
    ACCOUNT_BOOK_STORAGE_KEY: 'accountBookEntries',
    chrome: {
      storage: {
        local: {
          get: async () => ({ accountBookEntries: storedEntries }),
          set: async (payload) => {
            storedEntries = payload.accountBookEntries;
          },
        },
      },
    },
    getState: async () => ({
      email: 'prefill@example.com',
      signupPhoneNumber: '',
      signupPhoneCompletedActivation: {
        activationId: 'done-prefill',
        phoneNumber: '+44 7700 900123',
      },
      password: 'secret',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
      ipProxyAppliedExitIp: '203.0.113.9',
      ipProxyAppliedExitRegion: 'gb',
    }),
  });

  const entry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(entry.recordId, 'prefill@example.com');
  assert.equal(entry.email, 'prefill@example.com');
  assert.equal(entry.phoneNumber, '');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].phoneNumber, '');
});

test('account book helper supports phone-only records and upgrades them when email appears later', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [];
  const helpers = api.createAccountBookHelpers({
    ACCOUNT_BOOK_STORAGE_KEY: 'accountBookEntries',
    chrome: {
      storage: {
        local: {
          get: async () => ({ accountBookEntries: storedEntries }),
          set: async (payload) => {
            storedEntries = payload.accountBookEntries;
          },
        },
      },
    },
    getState: async () => ({
      email: '',
      signupPhoneNumber: '+66 12345',
      customPassword: ' phone-secret ',
      activeFlowId: 'openai',
      panelMode: 'cpa',
    }),
  });

  const phoneOnlyEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(phoneOnlyEntry.recordId, 'phone:6612345');
  assert.equal(phoneOnlyEntry.email, '');
  assert.equal(phoneOnlyEntry.phoneNumber, '+66 12345');
  assert.equal(phoneOnlyEntry.password, 'phone-secret');
  assert.equal(storedEntries.length, 1);

  const upgradedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'bound@example.com',
    signupPhoneNumber: '+66 12345',
    password: 'phone-secret',
    activeFlowId: 'openai',
    panelMode: 'cpa',
  });
  assert.equal(upgradedEntry.recordId, 'bound@example.com');
  assert.equal(upgradedEntry.email, 'bound@example.com');
  assert.equal(upgradedEntry.phoneNumber, '+66 12345');
  assert.equal(upgradedEntry.captureStage, 'flow_completed');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].recordId, 'bound@example.com');
});

test('account book helper backfills missing signup IP on flow completion and normalizes invalid regions', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [];
  const helpers = api.createAccountBookHelpers({
    ACCOUNT_BOOK_STORAGE_KEY: 'accountBookEntries',
    chrome: {
      storage: {
        local: {
          get: async () => ({ accountBookEntries: storedEntries }),
          set: async (payload) => {
            storedEntries = payload.accountBookEntries;
          },
        },
      },
    },
    getState: async () => ({
      email: 'empty-ip@example.com',
      password: 'secret',
      activeFlowId: 'openai',
      ipProxyAppliedExitIp: '',
      ipProxyAppliedExitRegion: 'Japan',
    }),
  });

  const firstEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(firstEntry.signupIp, '');
  assert.equal(firstEntry.signupRegion, '');

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'empty-ip@example.com',
    password: 'secret',
    activeFlowId: 'openai',
    ipProxyAppliedExitIp: '198.51.100.77',
    ipProxyAppliedExitRegion: 'u-s',
  });
  assert.equal(completedEntry.captureStage, 'flow_completed');
  assert.equal(completedEntry.signupIp, '198.51.100.77');
  assert.equal(completedEntry.signupRegion, 'US');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].signupIp, '198.51.100.77');
  assert.equal(storedEntries[0].signupRegion, 'US');
});

test('account book helper standardizes legacy entries with empty signup IP fields', () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);
  const helpers = api.createAccountBookHelpers({});

  const entries = helpers.normalizeAccountBookEntries([
    {
      recordId: 'legacy@example.com',
      email: 'legacy@example.com',
      phoneNumber: '',
      password: 'secret',
      flowId: 'openai',
      panelMode: 'cpa',
      captureStage: 'registration_success',
      createdAt: '2026-05-24T00:00:00.000Z',
      updatedAt: '2026-05-24T00:00:00.000Z',
      finalFlowCompletedAt: '',
    },
  ]);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].signupIp, '');
  assert.equal(entries[0].signupRegion, '');
});

test('account book helper clears persisted entries without touching unrelated session state', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [
    {
      recordId: 'user@example.com',
      email: 'user@example.com',
      phoneNumber: '',
      password: 'secret',
      flowId: 'openai',
      panelMode: 'cpa',
      captureStage: 'registration_success',
      createdAt: '2026-05-24T00:00:00.000Z',
      updatedAt: '2026-05-24T00:00:00.000Z',
      finalFlowCompletedAt: '',
    },
  ];
  const helpers = api.createAccountBookHelpers({
    ACCOUNT_BOOK_STORAGE_KEY: 'accountBookEntries',
    chrome: {
      storage: {
        local: {
          get: async () => ({ accountBookEntries: storedEntries }),
          set: async (payload) => {
            storedEntries = payload.accountBookEntries;
          },
        },
      },
    },
    getState: async () => ({
      email: 'user@example.com',
      activeFlowId: 'openai',
    }),
  });

  const result = await helpers.clearAccountBookEntries();
  assert.deepStrictEqual(result, { clearedCount: 1 });
  assert.deepStrictEqual(storedEntries, []);
});
