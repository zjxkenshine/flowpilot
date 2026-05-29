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
      freeStatus: 'free',
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
  assert.equal(firstEntry.freeStatus, 'free');
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
    freeStatus: 'paid',
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
  assert.equal(completedEntry.freeStatus, 'paid');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].recordId, 'flow@example.com');
  assert.equal(storedEntries[0].phoneNumber, '+1 (555) 123-4567');
  assert.equal(storedEntries[0].signupIp, '203.0.113.8');
  assert.equal(storedEntries[0].signupRegion, 'JP');
  assert.equal(storedEntries[0].freeStatus, 'paid');
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

test('account book helper supports phone_verification_passed stage and upgrades through later stages', async () => {
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
      signupPhoneNumber: '+66 98765',
      customPassword: ' phone-pass ',
      accountIdentifierType: 'phone',
      accountIdentifier: '+66 98765',
      activeFlowId: 'openai',
      panelMode: 'cpa',
      ipProxyAppliedExitIp: '203.0.113.66',
      ipProxyAppliedExitRegion: 'th',
    }),
  });

  const phoneVerifiedEntry = await helpers.upsertAccountBookEntry('phone_verification_passed');
  assert.equal(phoneVerifiedEntry.recordId, 'phone:6698765');
  assert.equal(phoneVerifiedEntry.phoneNumber, '+66 98765');
  assert.equal(phoneVerifiedEntry.captureStage, 'phone_verification_passed');
  assert.equal(phoneVerifiedEntry.signupIp, '203.0.113.66');
  assert.equal(phoneVerifiedEntry.signupRegion, 'TH');

  const registrationSuccessEntry = await helpers.upsertAccountBookEntry('registration_success', {
    email: '',
    signupPhoneNumber: '+66 98765',
    customPassword: 'phone-pass',
    activeFlowId: 'openai',
    panelMode: 'cpa',
  });
  assert.equal(registrationSuccessEntry.captureStage, 'registration_success');

  const flowCompletedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'later@example.com',
    signupPhoneNumber: '+66 98765',
    password: 'phone-pass',
    activeFlowId: 'openai',
    panelMode: 'cpa',
  });
  assert.equal(flowCompletedEntry.recordId, 'later@example.com');
  assert.equal(flowCompletedEntry.captureStage, 'flow_completed');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].captureStage, 'flow_completed');
});

test('account book helper supports profile_submitted stage and upgrades without downgrade', async () => {
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
      email: 'profile@example.com',
      signupPhoneNumber: '',
      signupPhoneCompletedActivation: {
        activationId: 'done-profile',
        phoneNumber: '+44 7700 900321',
      },
      password: 'profile-secret',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
    }),
  });

  const profileEntry = await helpers.upsertAccountBookEntry('profile_submitted');
  assert.equal(profileEntry.recordId, 'profile@example.com');
  assert.equal(profileEntry.email, 'profile@example.com');
  assert.equal(profileEntry.phoneNumber, '');
  assert.equal(profileEntry.password, 'profile-secret');
  assert.equal(profileEntry.captureStage, 'profile_submitted');
  assert.equal(storedEntries.length, 1);

  const registrationEntry = await helpers.upsertAccountBookEntry('registration_success', {
    email: 'profile@example.com',
    signupPhoneNumber: '',
    password: 'profile-secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(registrationEntry.captureStage, 'registration_success');
  assert.equal(storedEntries.length, 1);

  const downgradeAttempt = await helpers.upsertAccountBookEntry('profile_submitted', {
    email: 'profile@example.com',
    signupPhoneNumber: '',
    password: 'profile-secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(downgradeAttempt.captureStage, 'registration_success');

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'profile@example.com',
    signupPhoneNumber: '',
    password: 'profile-secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(completedEntry.captureStage, 'flow_completed');

  const secondDowngradeAttempt = await helpers.upsertAccountBookEntry('profile_submitted', {
    email: 'profile@example.com',
    signupPhoneNumber: '',
    password: 'profile-secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(secondDowngradeAttempt.captureStage, 'flow_completed');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].captureStage, 'flow_completed');
});

test('account book helper merges phone registration into email flow completion when phone runtime was cleared', async () => {
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
      signupPhoneNumber: '+66 11223',
      customPassword: ' phone-pass ',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
      flowStartTime: Date.parse('2026-05-26T10:00:00.000Z'),
      ipProxyAppliedExitIp: '203.0.113.88',
      ipProxyAppliedExitRegion: 'th',
    }),
  });

  const registrationEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(registrationEntry.recordId, 'phone:6611223');
  assert.equal(registrationEntry.phoneNumber, '+66 11223');
  assert.equal(registrationEntry.signupIp, '203.0.113.88');
  assert.equal(registrationEntry.signupRegion, 'TH');

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'final@example.com',
    signupPhoneNumber: '',
    password: 'phone-pass',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    flowStartTime: Date.parse('2026-05-26T10:00:00.000Z'),
    ipProxyAppliedExitIp: '',
    ipProxyAppliedExitRegion: '',
  });

  assert.equal(completedEntry.recordId, 'final@example.com');
  assert.equal(completedEntry.email, 'final@example.com');
  assert.equal(completedEntry.phoneNumber, '+66 11223');
  assert.equal(completedEntry.captureStage, 'flow_completed');
  assert.equal(completedEntry.signupIp, '203.0.113.88');
  assert.equal(completedEntry.signupRegion, 'TH');
  assert.equal(storedEntries.length, 1);
  assert.equal(storedEntries[0].recordId, 'final@example.com');
  assert.equal(storedEntries[0].phoneNumber, '+66 11223');
  assert.equal(storedEntries[0].signupIp, '203.0.113.88');
  assert.equal(storedEntries[0].signupRegion, 'TH');
});

test('account book helper uses flowStartTime to avoid merging old phone-only records', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [
    {
      recordId: 'phone:6611111',
      email: '',
      phoneNumber: '+66 11111',
      password: 'old-secret',
      flowId: 'openai',
      panelMode: 'sub2api',
      captureStage: 'registration_success',
      createdAt: '2026-05-26T09:00:00.000Z',
      updatedAt: '2026-05-26T09:00:00.000Z',
      finalFlowCompletedAt: '',
      signupIp: '203.0.113.1',
      signupRegion: 'TH',
    },
    {
      recordId: 'phone:6622222',
      email: '',
      phoneNumber: '+66 22222',
      password: 'new-secret',
      flowId: 'openai',
      panelMode: 'sub2api',
      captureStage: 'registration_success',
      createdAt: '2026-05-26T10:05:00.000Z',
      updatedAt: '2026-05-26T10:05:00.000Z',
      finalFlowCompletedAt: '',
      signupIp: '203.0.113.2',
      signupRegion: 'TH',
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
      email: 'final@example.com',
      signupPhoneNumber: '',
      password: 'new-secret',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
      flowStartTime: Date.parse('2026-05-26T10:00:00.000Z'),
    }),
  });

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed');

  assert.equal(completedEntry.recordId, 'final@example.com');
  assert.equal(completedEntry.phoneNumber, '+66 22222');
  assert.equal(completedEntry.signupIp, '203.0.113.2');
  assert.equal(storedEntries.length, 2);
  assert.equal(storedEntries[0].recordId, 'final@example.com');
  assert.equal(storedEntries[0].phoneNumber, '+66 22222');
  assert.equal(storedEntries.some((entry) => entry.recordId === 'phone:6611111'), true);
});

test('account book helper does not fuzzily merge multiple phone-only candidates without flowStartTime', async () => {
  const source = fs.readFileSync('background/account-book.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageBackgroundAccountBook;`)(globalScope);

  let storedEntries = [
    {
      recordId: 'phone:6611111',
      email: '',
      phoneNumber: '+66 11111',
      password: 'first-secret',
      flowId: 'openai',
      panelMode: 'cpa',
      captureStage: 'registration_success',
      createdAt: '2026-05-26T09:00:00.000Z',
      updatedAt: '2026-05-26T09:00:00.000Z',
      finalFlowCompletedAt: '',
      signupIp: '203.0.113.11',
      signupRegion: 'TH',
    },
    {
      recordId: 'phone:6622222',
      email: '',
      phoneNumber: '+66 22222',
      password: 'second-secret',
      flowId: 'openai',
      panelMode: 'cpa',
      captureStage: 'registration_success',
      createdAt: '2026-05-26T09:05:00.000Z',
      updatedAt: '2026-05-26T09:05:00.000Z',
      finalFlowCompletedAt: '',
      signupIp: '203.0.113.22',
      signupRegion: 'TH',
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
      email: 'ambiguous@example.com',
      signupPhoneNumber: '',
      password: 'final-secret',
      activeFlowId: 'openai',
      panelMode: 'cpa',
      ipProxyAppliedExitIp: '',
      ipProxyAppliedExitRegion: '',
    }),
  });

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed');

  assert.equal(completedEntry.recordId, 'ambiguous@example.com');
  assert.equal(completedEntry.email, 'ambiguous@example.com');
  assert.equal(completedEntry.phoneNumber, '');
  assert.equal(completedEntry.signupIp, '');
  assert.equal(storedEntries.length, 3);
  assert.equal(storedEntries[0].recordId, 'ambiguous@example.com');
  assert.equal(storedEntries.filter((entry) => /^phone:/.test(entry.recordId)).length, 2);
});

test('account book helper does not downgrade higher capture stages when phone_verification_passed is written later', async () => {
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
      email: 'upgrade@example.com',
      signupPhoneNumber: '+44 7000 111222',
      password: 'secret',
      activeFlowId: 'openai',
      panelMode: 'sub2api',
    }),
  });

  await helpers.upsertAccountBookEntry('registration_success');
  const downgradedAttempt = await helpers.upsertAccountBookEntry('phone_verification_passed', {
    email: 'upgrade@example.com',
    signupPhoneNumber: '+44 7000 111222',
    password: 'secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(downgradedAttempt.captureStage, 'registration_success');

  await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'upgrade@example.com',
    signupPhoneNumber: '+44 7000 111222',
    password: 'secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  const secondDowngradedAttempt = await helpers.upsertAccountBookEntry('phone_verification_passed', {
    email: 'upgrade@example.com',
    signupPhoneNumber: '+44 7000 111222',
    password: 'secret',
    activeFlowId: 'openai',
    panelMode: 'sub2api',
  });
  assert.equal(secondDowngradedAttempt.captureStage, 'flow_completed');
  assert.equal(storedEntries[0].captureStage, 'flow_completed');
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
  assert.equal(entries[0].freeStatus, 'unknown');
});

test('account book helper preserves existing free status when later state omits it', async () => {
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
      email: 'keep-free@example.com',
      password: 'secret',
      activeFlowId: 'openai',
      freeStatus: 'free',
    }),
  });

  const firstEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(firstEntry.freeStatus, 'free');

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'keep-free@example.com',
    password: 'secret',
    activeFlowId: 'openai',
  });

  assert.equal(completedEntry.freeStatus, 'free');
  assert.equal(storedEntries[0].freeStatus, 'free');
});

test('account book helper supports plus free status and preserves it when omitted later', async () => {
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
      email: 'phone-plus@example.com',
      password: 'secret',
      activeFlowId: 'openai',
      freeStatus: 'free',
    }),
  });

  const freeEntry = await helpers.upsertAccountBookEntry('registration_success');
  assert.equal(freeEntry.freeStatus, 'free');

  const plusEntry = await helpers.upsertAccountBookEntry('registration_success', {
    email: 'phone-plus@example.com',
    password: 'secret',
    activeFlowId: 'openai',
    freeStatus: 'plus',
  });
  assert.equal(plusEntry.freeStatus, 'plus');
  assert.equal(storedEntries[0].freeStatus, 'plus');

  const completedEntry = await helpers.upsertAccountBookEntry('flow_completed', {
    email: 'phone-plus@example.com',
    password: 'secret',
    activeFlowId: 'openai',
  });
  assert.equal(completedEntry.freeStatus, 'plus');
  assert.equal(storedEntries[0].freeStatus, 'plus');
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
