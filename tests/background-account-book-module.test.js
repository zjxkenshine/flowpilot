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
  assert.equal(storedEntries.length, 1);

  const createdAt = firstEntry.createdAt;
  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'flow@example.com',
    signupPhoneNumber: '+1 (555) 123-4567',
    password: 'secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(completedEntry.recordId, 'flow@example.com');
  assert.equal(completedEntry.email, 'flow@example.com');
  assert.equal(completedEntry.phoneNumber, '+1 (555) 123-4567');
  assert.equal(completedEntry.password, 'secret');
  assert.equal(completedEntry.captureStage, 'flow_completed');
  assert.ok(completedEntry.finalFlowCompletedAt);
  assert.equal(completedEntry.createdAt, createdAt);
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].recordId, 'flow@example.com');
  assert.equal(storedEntries[0].phoneNumber, '+1 (555) 123-4567');
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
