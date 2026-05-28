const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const step2Source = fs.readFileSync('background/steps/submit-signup-email.js', 'utf8');
const step2GlobalScope = {};
const step2Api = new Function('self', `${step2Source}; return self.MultiPageBackgroundStep2;`)(step2GlobalScope);

const signupFlowSource = fs.readFileSync('background/signup-flow-helpers.js', 'utf8');
const signupFlowGlobalScope = {};
const signupFlowApi = new Function('self', `${signupFlowSource}; return self.MultiPageSignupFlowHelpers;`)(signupFlowGlobalScope);

const navigationSource = fs.readFileSync('background/navigation-utils.js', 'utf8');
const navigationGlobalScope = {};
const navigationApi = new Function('self', `${navigationSource}; return self.MultiPageBackgroundNavigationUtils;`)(navigationGlobalScope);

test('step 2 completes with password step skipped when landing on email verification page', async () => {
  const completedPayloads = [];

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 11 }),
    ensureSignupPostEmailPageReadyInTab: async () => ({
      state: 'verification_page',
      url: 'https://auth.openai.com/email-verification',
    }),
    getTabId: async () => 11,
    isTabAlive: async () => true,
    resolveSignupEmailForFlow: async () => 'user@example.com',
    sendToContentScriptResilient: async () => ({ submitted: true }),
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({ email: 'user@example.com' });

  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        email: 'user@example.com',
        accountIdentifierType: 'email',
        accountIdentifier: 'user@example.com',
        nextSignupState: 'verification_page',
        nextSignupUrl: 'https://auth.openai.com/email-verification',
        skippedPasswordStep: true,
      },
    },
  ]);
});

test('step 2 keeps password flow when landing on password page', async () => {
  const completedPayloads = [];

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 12 }),
    ensureSignupPostEmailPageReadyInTab: async () => ({
      state: 'password_page',
      url: 'https://auth.openai.com/create-account/password',
    }),
    getTabId: async () => 12,
    isTabAlive: async () => true,
    resolveSignupEmailForFlow: async () => 'user@example.com',
    sendToContentScriptResilient: async () => ({ submitted: true }),
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({ email: 'user@example.com' });

  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        email: 'user@example.com',
        accountIdentifierType: 'email',
        accountIdentifier: 'user@example.com',
        nextSignupState: 'password_page',
        nextSignupUrl: 'https://auth.openai.com/create-account/password',
        skippedPasswordStep: false,
      },
    },
  ]);
});

test('step 2 uses phone activation when resolved signup method is phone', async () => {
  const completedPayloads = [];
  const sequence = [];
  const sentPayloads = [];
  const activation = {
    activationId: 'signup-activation',
    phoneNumber: '66959916439',
    provider: 'hero-sms',
    serviceCode: 'dr',
    countryId: 52,
    countryLabel: 'Thailand',
    successfulUses: 0,
    maxUses: 3,
  };

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 14 }),
    ensureSignupPostEmailPageReadyInTab: async () => {
      throw new Error('email landing helper should not be used for phone signup');
    },
    ensureSignupPostIdentityPageReadyInTab: async () => ({
      state: 'phone_verification_page',
      url: 'https://auth.openai.com/phone-verification',
    }),
    getTabId: async () => 14,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      prepareSignupPhoneActivation: async () => {
        sequence.push('prepareSignupPhoneActivation');
        return activation;
      },
      cancelSignupPhoneActivation: async () => {
        throw new Error('activation should not be cancelled on success');
      },
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        sequence.push('ensureSignupPhoneEntryReady');
        return {
          ready: true,
          state: 'phone_entry',
          url: 'https://chatgpt.com/',
        };
      }
      sequence.push('submitSignupPhone');
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({ signupMethod: 'phone' });

  assert.deepStrictEqual(sequence, [
    'ensureSignupPhoneEntryReady',
    'prepareSignupPhoneActivation',
    'submitSignupPhone',
  ]);
  assert.deepStrictEqual(sentPayloads, [
    {
      signupMethod: 'phone',
      phoneNumber: '66959916439',
      countryId: 52,
      countryLabel: 'Thailand',
    },
  ]);
  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        accountIdentifierType: 'phone',
        accountIdentifier: '66959916439',
        signupPhoneNumber: '66959916439',
        signupPhoneActivation: activation,
        nextSignupState: 'phone_verification_page',
        nextSignupUrl: 'https://auth.openai.com/phone-verification',
        skippedPasswordStep: true,
      },
    },
  ]);
});

test('step 2 recovers phone signup Oops page once and reuses the same activation', async () => {
  const completedPayloads = [];
  const sequence = [];
  const sentPayloads = [];
  const logs = [];
  let prepareCalls = 0;
  let landingCalls = 0;
  let recoveryCalls = 0;
  const activation = {
    activationId: 'signup-oops-activation',
    phoneNumber: '+15551234567',
    provider: 'hero-sms',
    serviceCode: 'dr',
    countryId: 187,
    countryLabel: 'United States',
  };

  const executor = step2Api.createStep2Executor({
    addLog: async (message, level) => {
      logs.push({ message, level });
    },
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 144 }),
    ensureSignupPostIdentityPageReadyInTab: async () => {
      landingCalls += 1;
      if (landingCalls === 1) {
        throw new Error('等待注册身份提交后的页面跳转超时，请检查页面是否仍停留在输入页。');
      }
      return {
        state: 'phone_verification_page',
        url: 'https://auth.openai.com/phone-verification',
      };
    },
    getTabId: async () => 144,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      prepareSignupPhoneActivation: async () => {
        prepareCalls += 1;
        sequence.push('prepareSignupPhoneActivation');
        return activation;
      },
      cancelSignupPhoneActivation: async () => {
        throw new Error('activation should not be cancelled on recovered success');
      },
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        sequence.push('ensureSignupPhoneEntryReady');
        return { ready: true, state: 'phone_entry' };
      }
      if (message.type === 'RECOVER_SIGNUP_PHONE_SIGNIN_ISSUE') {
        recoveryCalls += 1;
        sequence.push('recoverSignupPhoneSigninIssue');
        sentPayloads.push(message.payload);
        return {
          recovered: true,
          submitted: true,
          deferredSubmit: true,
          phoneNumber: message.payload.phoneNumber,
        };
      }
      sequence.push('submitSignupPhone');
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({ signupMethod: 'phone' });

  assert.deepStrictEqual(sequence, [
    'ensureSignupPhoneEntryReady',
    'prepareSignupPhoneActivation',
    'submitSignupPhone',
    'recoverSignupPhoneSigninIssue',
  ]);
  assert.equal(prepareCalls, 1);
  assert.equal(recoveryCalls, 1);
  assert.equal(landingCalls, 2);
  assert.deepStrictEqual(sentPayloads, [
    {
      signupMethod: 'phone',
      phoneNumber: '+15551234567',
      countryId: 187,
      countryLabel: 'United States',
    },
    {
      signupMethod: 'phone',
      phoneNumber: '+15551234567',
      countryId: 187,
      countryLabel: 'United States',
      returnTimeoutMs: 25000,
    },
  ]);
  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        accountIdentifierType: 'phone',
        accountIdentifier: '+15551234567',
        signupPhoneNumber: '+15551234567',
        signupPhoneActivation: activation,
        nextSignupState: 'phone_verification_page',
        nextSignupUrl: 'https://auth.openai.com/phone-verification',
        skippedPasswordStep: true,
      },
    },
  ]);
  assert.equal(logs.some(({ message }) => /Oops 异常页返回并复用当前手机号重新提交/.test(message)), true);
});

test('step 2 attempts phone Oops recovery only once when landing remains stuck', async () => {
  let recoveryCalls = 0;
  let prepareCalls = 0;
  const activation = {
    activationId: 'signup-oops-stuck',
    phoneNumber: '+15559876543',
    countryId: 187,
    countryLabel: 'United States',
  };

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async () => {
      throw new Error('step should not complete when recovered landing also fails');
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 145 }),
    ensureSignupPostIdentityPageReadyInTab: async () => {
      throw new Error('等待注册身份提交后的页面跳转超时，请检查页面是否仍停留在输入页。');
    },
    getTabId: async () => 145,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      prepareSignupPhoneActivation: async () => {
        prepareCalls += 1;
        return activation;
      },
      cancelSignupPhoneActivation: async () => {},
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        return { ready: true, state: 'phone_entry' };
      }
      if (message.type === 'RECOVER_SIGNUP_PHONE_SIGNIN_ISSUE') {
        recoveryCalls += 1;
        return { recovered: true, submitted: true };
      }
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await assert.rejects(
    () => executor.executeStep2({ signupMethod: 'phone' }),
    /等待注册身份提交后的页面跳转超时/
  );
  assert.equal(prepareCalls, 1);
  assert.equal(recoveryCalls, 1);
});

test('step 2 reuses existing signup phone activation without acquiring a new number', async () => {
  const completedPayloads = [];
  const sequence = [];
  const sentPayloads = [];
  const activation = {
    activationId: 'existing-signup-activation',
    phoneNumber: '+446700000001',
    provider: 'hero-sms',
    serviceCode: 'dr',
    countryId: 16,
    countryLabel: 'United Kingdom',
  };

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 15 }),
    ensureSignupPostIdentityPageReadyInTab: async () => ({
      state: 'phone_verification_page',
      url: 'https://auth.openai.com/phone-verification',
    }),
    getTabId: async () => 15,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      normalizeActivation: (record) => record,
      prepareSignupPhoneActivation: async () => {
        throw new Error('prepareSignupPhoneActivation should not run when signup activation already exists');
      },
      cancelSignupPhoneActivation: async () => {
        throw new Error('activation should not be cancelled on success');
      },
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        sequence.push('ensureSignupPhoneEntryReady');
        return { ready: true, state: 'phone_entry' };
      }
      sequence.push('submitSignupPhone');
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({
    signupMethod: 'phone',
    signupPhoneActivation: activation,
  });

  assert.deepStrictEqual(sequence, [
    'ensureSignupPhoneEntryReady',
    'submitSignupPhone',
  ]);
  assert.deepStrictEqual(sentPayloads, [
    {
      signupMethod: 'phone',
      phoneNumber: '+446700000001',
      countryId: 16,
      countryLabel: 'United Kingdom',
    },
  ]);
  assert.equal(completedPayloads[0].payload.signupPhoneActivation, activation);
});

test('step 2 reuses failed signup phone activation before manual phone or acquiring a new number', async () => {
  const completedPayloads = [];
  const logs = [];
  const sequence = [];
  const stateUpdates = [];
  const sentPayloads = [];
  const activation = {
    activationId: 'failed-reuse-signup-activation',
    phoneNumber: '+446700000003',
    provider: 'hero-sms',
    serviceCode: 'dr',
    countryId: 16,
    countryLabel: 'United Kingdom',
    source: 'signup-page-ready-timeout-reuse',
    reason: '步骤 4：等待注册验证码页面就绪超时，请刷新认证页后重试。',
  };

  const executor = step2Api.createStep2Executor({
    addLog: async (message, level) => {
      logs.push({ message, level });
    },
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 151 }),
    ensureSignupPostIdentityPageReadyInTab: async () => ({
      state: 'phone_verification_page',
      url: 'https://auth.openai.com/phone-verification',
    }),
    getTabId: async () => 151,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      normalizeActivation: (record) => record ? {
        activationId: record.activationId,
        phoneNumber: record.phoneNumber,
        provider: record.provider,
        serviceCode: record.serviceCode,
        countryId: record.countryId,
        countryLabel: record.countryLabel,
        source: record.source,
      } : null,
      prepareSignupPhoneActivation: async () => {
        throw new Error('prepareSignupPhoneActivation should not run when failed signup phone reuse exists');
      },
      cancelSignupPhoneActivation: async () => {
        throw new Error('activation should not be cancelled on success');
      },
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        sequence.push('ensureSignupPhoneEntryReady');
        return { ready: true, state: 'phone_entry' };
      }
      sequence.push('submitSignupPhone');
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    setState: async (updates) => {
      stateUpdates.push(updates);
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({
    signupMethod: 'phone',
    failedSignupPhoneReuseActivation: activation,
    signupPhoneNumber: '+446700000099',
    accountIdentifierType: 'phone',
    accountIdentifier: '+446700000099',
  });

  assert.deepStrictEqual(sequence, [
    'ensureSignupPhoneEntryReady',
    'submitSignupPhone',
  ]);
  assert.deepStrictEqual(sentPayloads, [
    {
      signupMethod: 'phone',
      phoneNumber: '+446700000003',
      countryId: 16,
      countryLabel: 'United Kingdom',
    },
  ]);
  assert.equal(completedPayloads[0].payload.accountIdentifierType, 'phone');
  assert.equal(completedPayloads[0].payload.accountIdentifier, '+446700000003');
  assert.equal(completedPayloads[0].payload.signupPhoneNumber, '+446700000003');
  assert.deepStrictEqual(completedPayloads[0].payload.signupPhoneActivation, {
    activationId: 'failed-reuse-signup-activation',
    phoneNumber: '+446700000003',
    provider: 'hero-sms',
    serviceCode: 'dr',
    countryId: 16,
    countryLabel: 'United Kingdom',
    source: 'signup-page-ready-timeout-reuse',
    reason: '步骤 4：等待注册验证码页面就绪超时，请刷新认证页后重试。',
  });
  assert.deepStrictEqual(stateUpdates, [
    {
      signupPhoneNumber: '+446700000003',
      signupPhoneActivation: completedPayloads[0].payload.signupPhoneActivation,
      accountIdentifierType: 'phone',
      accountIdentifier: '+446700000003',
    },
  ]);
  assert.equal(logs.some(({ message }) => /复用上次验证码页就绪超时保留的手机号/.test(message)), true);
});

test('step 2 submits manual signup phone without acquiring a number', async () => {
  const completedPayloads = [];
  const sentPayloads = [];

  const executor = step2Api.createStep2Executor({
    addLog: async () => {},
    chrome: { tabs: { update: async () => {} } },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupEntryPageReady: async () => ({ tabId: 16 }),
    ensureSignupPostIdentityPageReadyInTab: async () => ({
      state: 'phone_verification_page',
      url: 'https://auth.openai.com/phone-verification',
    }),
    getTabId: async () => 16,
    isTabAlive: async () => true,
    phoneVerificationHelpers: {
      prepareSignupPhoneActivation: async () => {
        throw new Error('prepareSignupPhoneActivation should not run for manual signup phone');
      },
    },
    resolveSignupMethod: () => 'phone',
    resolveSignupEmailForFlow: async () => {
      throw new Error('email resolver should not run for phone signup');
    },
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_PHONE_ENTRY_READY') {
        return { ready: true, state: 'phone_entry' };
      }
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({
    signupMethod: 'phone',
    signupPhoneNumber: '+446700000002',
    accountIdentifierType: 'phone',
    accountIdentifier: '+446700000002',
  });

  assert.deepStrictEqual(sentPayloads, [
    {
      signupMethod: 'phone',
      phoneNumber: '+446700000002',
      countryId: null,
      countryLabel: '',
    },
  ]);
  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        accountIdentifierType: 'phone',
        accountIdentifier: '+446700000002',
        signupPhoneNumber: '+446700000002',
        signupPhoneActivation: null,
        nextSignupState: 'phone_verification_page',
        nextSignupUrl: 'https://auth.openai.com/phone-verification',
        skippedPasswordStep: true,
      },
    },
  ]);
});

test('step 2 stops with an explicit error instead of silently skipping 3/4/5 on chatgpt home', async () => {
  const completedPayloads = [];
  const logs = [];

  const executor = step2Api.createStep2Executor({
    addLog: async (message, level = 'info') => {
      logs.push({ message, level });
    },
    chrome: {
      tabs: {
        update: async () => {},
        get: async () => ({ url: 'https://chatgpt.com/' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupAuthEntryPageReady: async () => {
      throw new Error('当前页面没有可用的注册入口，也不在邮箱/密码页。URL: https://chatgpt.com/');
    },
    ensureSignupEntryPageReady: async () => ({ tabId: 13 }),
    ensureSignupPostEmailPageReadyInTab: async () => ({
      state: 'password_page',
      url: 'https://auth.openai.com/create-account/password',
    }),
    getTabId: async () => 13,
    isTabAlive: async () => true,
    resolveSignupEmailForFlow: async () => 'user@example.com',
    sendToContentScriptResilient: async () => ({ submitted: true }),
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await assert.rejects(
    () => executor.executeStep2({ email: 'user@example.com' }),
    /3\/4\/5/
  );

  assert.deepStrictEqual(completedPayloads, []);
  assert.ok(logs.some((item) => /3\/4\/5/.test(item.message)));
});

test('step 2 does not force auth-entry retry on logged-out chatgpt home when content reports entry_home', async () => {
  const completedPayloads = [];
  const logs = [];
  const sentPayloads = [];
  let authEntryCalls = 0;

  const executor = step2Api.createStep2Executor({
    addLog: async (message, level = 'info') => {
      logs.push({ message, level });
    },
    chrome: {
      tabs: {
        update: async () => {},
        get: async () => ({ url: 'https://chatgpt.com/' }),
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {},
    ensureSignupAuthEntryPageReady: async () => {
      authEntryCalls += 1;
      return { tabId: 15 };
    },
    ensureSignupEntryPageReady: async () => ({ tabId: 15 }),
    ensureSignupPostEmailPageReadyInTab: async () => ({
      state: 'password_page',
      url: 'https://auth.openai.com/create-account/password',
    }),
    getTabId: async () => 15,
    isTabAlive: async () => true,
    resolveSignupEmailForFlow: async () => 'user@example.com',
    sendToContentScriptResilient: async (_source, message) => {
      if (message.type === 'ENSURE_SIGNUP_ENTRY_READY') {
        return { ready: true, state: 'entry_home', url: 'https://chatgpt.com/' };
      }
      sentPayloads.push(message.payload);
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
  });

  await executor.executeStep2({ email: 'user@example.com' });

  assert.equal(authEntryCalls, 0);
  assert.deepStrictEqual(sentPayloads, [{ email: 'user@example.com' }]);
  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        email: 'user@example.com',
        accountIdentifierType: 'email',
        accountIdentifier: 'user@example.com',
        nextSignupState: 'password_page',
        nextSignupUrl: 'https://auth.openai.com/create-account/password',
        skippedPasswordStep: false,
      },
    },
  ]);
  assert.equal(logs.some((item) => /已登录 ChatGPT 首页/.test(item.message)), false);
});

test('step 2 waits for the existing signup tab to settle before probing the entry state', async () => {
  const completedPayloads = [];
  const logs = [];
  const events = [];

  const executor = step2Api.createStep2Executor({
    addLog: async (message, level = 'info', meta = {}) => {
      logs.push({ message, level, meta });
    },
    chrome: {
      tabs: {
        update: async () => {
          events.push('tab-update');
        },
        get: async () => ({ id: 17, windowId: 91, url: 'https://chatgpt.com/' }),
      },
      windows: {
        update: async () => {
          throw new Error('step 2 must not focus or raise the automation window');
        },
      },
    },
    completeNodeFromBackground: async (step, payload) => {
      completedPayloads.push({ step, payload });
    },
    ensureContentScriptReadyOnTab: async () => {
      events.push('content-ready');
    },
    ensureSignupAuthEntryPageReady: async () => ({ tabId: 17 }),
    ensureSignupEntryPageReady: async () => ({ tabId: 17 }),
    ensureSignupPostEmailPageReadyInTab: async () => ({
      state: 'password_page',
      url: 'https://auth.openai.com/create-account/password',
    }),
    getTabId: async () => 17,
    isTabAlive: async () => true,
    resolveSignupEmailForFlow: async () => 'user@example.com',
    sendToContentScriptResilient: async (_source, message) => {
      events.push(message.type);
      if (message.type === 'ENSURE_SIGNUP_ENTRY_READY') {
        return { ready: true, state: 'entry_home', url: 'https://chatgpt.com/' };
      }
      return { submitted: true };
    },
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabStableComplete: async (_tabId, options) => {
      events.push({ type: 'wait-stable', options });
      return { id: 17, url: 'https://chatgpt.com/', status: 'complete' };
    },
  });

  await executor.executeStep2({ email: 'user@example.com' });

  assert.deepStrictEqual(events.slice(0, 4), [
    'tab-update',
    {
      type: 'wait-stable',
      options: {
        timeoutMs: 45000,
        retryDelayMs: 300,
        stableMs: 3000,
        initialDelayMs: 300,
      },
    },
    'content-ready',
    'ENSURE_SIGNUP_ENTRY_READY',
  ]);
  assert.equal(logs.some((item) => /额外稳定 3 秒/.test(item.message)), true);
  assert.equal(logs.some((item) => item.meta.step === 2 && item.meta.stepKey === 'signup-entry'), true);
  assert.deepStrictEqual(completedPayloads, [
    {
      step: 'submit-signup-email',
      payload: {
        email: 'user@example.com',
        accountIdentifierType: 'email',
        accountIdentifier: 'user@example.com',
        nextSignupState: 'password_page',
        nextSignupUrl: 'https://auth.openai.com/create-account/password',
        skippedPasswordStep: false,
      },
    },
  ]);
});

test('signup flow helper recognizes email verification page as post-email landing page', async () => {
  let ensureCalls = 0;
  let passwordReadyChecks = 0;

  const helpers = signupFlowApi.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => '',
    chrome: {
      tabs: {
        get: async () => ({
          id: 21,
          url: 'https://auth.openai.com/email-verification',
        }),
      },
    },
    ensureContentScriptReadyOnTab: async () => {
      ensureCalls += 1;
    },
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: (url) => /\/email-verification(?:[/?#]|$)/i.test(url || ''),
    isSignupPasswordPageUrl: (url) => /\/create-account\/password(?:[/?#]|$)/i.test(url || ''),
    reuseOrCreateTab: async () => 21,
    sendToContentScriptResilient: async () => {
      passwordReadyChecks += 1;
      return {};
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabUrlMatch: async () => ({
      id: 21,
      url: 'https://auth.openai.com/email-verification',
    }),
  });

  const result = await helpers.ensureSignupPostEmailPageReadyInTab(21, 2);

  assert.deepStrictEqual(result, {
    ready: true,
    state: 'verification_page',
    url: 'https://auth.openai.com/email-verification',
  });
  assert.equal(ensureCalls, 1);
  assert.equal(passwordReadyChecks, 0);
});

test('signup flow helper waits for the signup entry tab to settle for step 2 before probing the entry page', async () => {
  const logs = [];
  const events = [];

  const helpers = signupFlowApi.createSignupFlowHelpers({
    addLog: async (message, level = 'info', meta = {}) => {
      logs.push({ message, level, meta });
    },
    buildGeneratedAliasEmail: () => '',
    chrome: {
      tabs: {
        get: async () => ({ id: 23, windowId: 92, url: 'https://chatgpt.com/' }),
      },
      windows: {
        update: async () => {
          throw new Error('signup entry helper must not focus or raise the automation window');
        },
      },
    },
    ensureContentScriptReadyOnTab: async () => {
      events.push('content-ready');
    },
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => false,
    reuseOrCreateTab: async () => {
      events.push('reuse-or-create');
      return 23;
    },
    sendToContentScriptResilient: async () => {
      events.push('probe-entry');
      return { ready: true, state: 'entry_home', url: 'https://chatgpt.com/' };
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabStableComplete: async (_tabId, options) => {
      events.push({ type: 'wait-stable', options });
      return { id: 23, url: 'https://chatgpt.com/', status: 'complete' };
    },
    waitForTabUrlMatch: async () => null,
  });

  const result = await helpers.ensureSignupEntryPageReady(2);

  assert.deepStrictEqual(events, [
    'reuse-or-create',
    {
      type: 'wait-stable',
      options: {
        timeoutMs: 45000,
        retryDelayMs: 300,
        stableMs: 3000,
        initialDelayMs: 300,
      },
    },
    'content-ready',
    'probe-entry',
  ]);
  assert.equal(logs.some((item) => /额外稳定 3 秒/.test(item.message)), true);
  assert.equal(logs.some((item) => item.meta.step === 2 && item.meta.stepKey === 'signup-entry'), true);
  assert.deepStrictEqual(result, {
    tabId: 23,
    result: {
      ready: true,
      state: 'entry_home',
      url: 'https://chatgpt.com/',
    },
  });
});

test('signup flow helper accepts phone signup landing on login password page', async () => {
  let ensureCalls = 0;
  let passwordReadyChecks = 0;
  let predicateAcceptedLoginPassword = false;
  const navigationUtils = navigationApi.createNavigationUtils({
    DEFAULT_CODEX2API_URL: 'http://localhost:8080/admin/accounts',
    DEFAULT_SUB2API_URL: 'https://sub.example.com/admin/accounts',
    normalizeLocalCpaStep9Mode: (value) => value,
  });

  const helpers = signupFlowApi.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => '',
    chrome: {
      tabs: {
        get: async () => ({
          id: 22,
          url: 'https://auth.openai.com/log-in/password',
        }),
      },
    },
    ensureContentScriptReadyOnTab: async () => {
      ensureCalls += 1;
    },
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: navigationUtils.isSignupEmailVerificationPageUrl,
    isSignupPasswordPageUrl: (url) => {
      const accepted = navigationUtils.isSignupPasswordPageUrl(url);
      if (accepted && /\/log-in\/password(?:[/?#]|$)/i.test(url || '')) {
        predicateAcceptedLoginPassword = true;
      }
      return accepted;
    },
    reuseOrCreateTab: async () => 22,
    sendToContentScriptResilient: async (_source, message) => {
      assert.equal(message.type, 'ENSURE_SIGNUP_PASSWORD_PAGE_READY');
      passwordReadyChecks += 1;
      return {};
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabUrlMatch: async (_tabId, predicate) => {
      const url = 'https://auth.openai.com/log-in/password';
      return predicate(url) ? { id: 22, url } : null;
    },
  });

  const result = await helpers.ensureSignupPostIdentityPageReadyInTab(22, 2);

  assert.deepStrictEqual(result, {
    ready: true,
    state: 'password_page',
    url: 'https://auth.openai.com/log-in/password',
  });
  assert.equal(predicateAcceptedLoginPassword, true);
  assert.equal(ensureCalls, 1);
  assert.equal(passwordReadyChecks, 1);
});

test('signup flow helper reuses existing managed alias email when it is still compatible', async () => {
  let buildCalls = 0;
  let setEmailCalls = 0;

  const helpers = signupFlowApi.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => {
      buildCalls += 1;
      return 'demo+fresh@gmail.com';
    },
    chrome: { tabs: { get: async () => ({ id: 21, url: 'https://auth.openai.com/create-account/password' }) } },
    ensureContentScriptReadyOnTab: async () => {},
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => true,
    isReusableGeneratedAliasEmail: (_state, email) => email === 'demo+saved@gmail.com',
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => true,
    reuseOrCreateTab: async () => 21,
    sendToContentScriptResilient: async () => ({}),
    setEmailState: async () => {
      setEmailCalls += 1;
    },
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabUrlMatch: async () => null,
  });

  const email = await helpers.resolveSignupEmailForFlow({
    mailProvider: 'gmail',
    email: 'demo+saved@gmail.com',
  });

  assert.equal(email, 'demo+saved@gmail.com');
  assert.equal(buildCalls, 0);
  assert.equal(setEmailCalls, 0);
});

test('signup flow helper can generate an email on demand when add-email starts from phone signup', async () => {
  const fetchedStates = [];
  const setStateCalls = [];

  const helpers = signupFlowApi.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => '',
    chrome: { tabs: { get: async () => ({ id: 21, url: 'https://auth.openai.com/create-account/password' }) } },
    ensureContentScriptReadyOnTab: async () => {},
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    fetchGeneratedEmail: async (state, options) => {
      fetchedStates.push({ state, options });
      return 'duck.generated@example.com';
    },
    isGeneratedAliasProvider: () => false,
    isReusableGeneratedAliasEmail: () => false,
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => true,
    reuseOrCreateTab: async () => 21,
    sendToContentScriptResilient: async () => ({}),
    setEmailState: async () => {
      throw new Error('fetchGeneratedEmail already persists the generated email');
    },
    setState: async (updates) => {
      setStateCalls.push(updates);
    },
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabUrlMatch: async () => null,
  });

  const email = await helpers.resolveSignupEmailForFlow({
    email: '',
    emailGenerator: 'duck',
    accountIdentifierType: 'phone',
    accountIdentifier: '+447780579093',
    signupPhoneNumber: '+447780579093',
    signupPhoneCompletedActivation: {
      activationId: 'signup-completed',
      phoneNumber: '+447780579093',
    },
  }, {
    preserveAccountIdentity: true,
  });

  assert.equal(email, 'duck.generated@example.com');
  assert.equal(fetchedStates.length, 1);
  assert.equal(fetchedStates[0].options.preserveAccountIdentity, true);
  assert.deepStrictEqual(setStateCalls, [
    {
      accountIdentifierType: 'phone',
      accountIdentifier: '+447780579093',
      signupPhoneNumber: '+447780579093',
      signupPhoneActivation: null,
      signupPhoneCompletedActivation: {
        activationId: 'signup-completed',
        phoneNumber: '+447780579093',
      },
      signupPhoneVerificationRequestedAt: null,
      signupPhoneVerificationPurpose: '',
    },
  ]);
});

test('signup flow helper delegates preserved phone identity email sync to the shared persistence helper when reusing an existing email', async () => {
  const persistCalls = [];
  let setEmailCalls = 0;
  let setStateCalls = 0;

  const helpers = signupFlowApi.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => 'demo+saved@gmail.com',
    chrome: { tabs: { get: async () => ({ id: 21, url: 'https://auth.openai.com/create-account/password' }) } },
    ensureContentScriptReadyOnTab: async () => {},
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    fetchGeneratedEmail: async () => {
      throw new Error('should not generate a new email');
    },
    isGeneratedAliasProvider: () => true,
    isReusableGeneratedAliasEmail: (_state, email) => email === 'demo+saved@gmail.com',
    isHotmailProvider: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => true,
    persistRegistrationEmailState: async (state, email, options) => {
      persistCalls.push({ state, email, options });
    },
    reuseOrCreateTab: async () => 21,
    sendToContentScriptResilient: async () => ({}),
    setEmailState: async () => {
      setEmailCalls += 1;
    },
    setState: async () => {
      setStateCalls += 1;
    },
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: [],
    waitForTabUrlMatch: async () => null,
  });

  const state = {
    mailProvider: 'gmail',
    email: 'demo+saved@gmail.com',
    accountIdentifierType: 'phone',
    accountIdentifier: '+447780579093',
    signupPhoneNumber: '+447780579093',
    signupPhoneCompletedActivation: {
      activationId: 'signup-completed',
      phoneNumber: '+447780579093',
    },
  };
  const email = await helpers.resolveSignupEmailForFlow(state, {
    preserveAccountIdentity: true,
  });

  assert.equal(email, 'demo+saved@gmail.com');
  assert.equal(setEmailCalls, 0);
  assert.equal(setStateCalls, 0);
  assert.deepStrictEqual(persistCalls, [
    {
      state,
      email: 'demo+saved@gmail.com',
      options: {
        source: 'flow',
        preserveAccountIdentity: true,
      },
    },
  ]);
});

test('signup flow helper finalizes step 3 submit by reusing signup verification preparation', async () => {
  let ensureCalls = 0;
  const messages = [];
  const logs = [];

  const helpers = signupFlowApi.createSignupFlowHelpers({
    addLog: async (message, level = 'info') => {
      logs.push({ message, level });
    },
    buildGeneratedAliasEmail: () => '',
    chrome: { tabs: { get: async () => ({ id: 31, url: 'https://auth.openai.com/create-account/password' }) } },
    ensureContentScriptReadyOnTab: async (...args) => {
      ensureCalls += 1;
      messages.push({ type: 'ensure', args });
    },
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isReusableGeneratedAliasEmail: () => false,
    isHotmailProvider: () => false,
    isRetryableContentScriptTransportError: () => false,
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => true,
    reuseOrCreateTab: async () => 31,
    sendToContentScriptResilient: async (_source, message) => {
      messages.push({ type: 'send', message });
      return { ready: true, retried: 1 };
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: ['content/utils.js', 'content/signup-page.js'],
    waitForTabUrlMatch: async () => null,
  });

  const result = await helpers.finalizeSignupPasswordSubmitInTab(31, 'Secret123!', 3);

  assert.deepStrictEqual(result, { ready: true, retried: 1 });
  assert.equal(ensureCalls, 1);
  assert.deepStrictEqual(logs, []);
  assert.deepStrictEqual(messages.find((item) => item.type === 'send')?.message, {
    type: 'PREPARE_SIGNUP_VERIFICATION',
    step: 3,
    source: 'background',
    payload: {
      password: 'Secret123!',
      prepareSource: 'step3_finalize',
      prepareLogLabel: '步骤 3 收尾',
      signupMethod: '',
      accountIdentifierType: '',
      phoneNumber: '',
    },
  });
});

test('signup flow helper rewrites retryable step 3 finalize transport timeout into a Chinese error', async () => {
  const logs = [];

  const helpers = signupFlowApi.createSignupFlowHelpers({
    addLog: async (message, level = 'info') => {
      logs.push({ message, level });
    },
    buildGeneratedAliasEmail: () => '',
    chrome: { tabs: { get: async () => ({ id: 31, url: 'https://auth.openai.com/create-account/password' }) } },
    ensureContentScriptReadyOnTab: async () => {},
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isReusableGeneratedAliasEmail: () => false,
    isHotmailProvider: () => false,
    isRetryableContentScriptTransportError: (error) => /did not respond in 45s/i.test(error?.message || String(error || '')),
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: () => false,
    isSignupPasswordPageUrl: () => true,
    reuseOrCreateTab: async () => 31,
    sendToContentScriptResilient: async () => {
      throw new Error('Content script on signup-page did not respond in 45s. Try refreshing the tab and retry.');
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: ['content/utils.js', 'content/signup-page.js'],
    waitForTabUrlMatch: async () => null,
  });

  await assert.rejects(
    () => helpers.finalizeSignupPasswordSubmitInTab(31, 'Secret123!', 3),
    /步骤 3：认证页在提交后切换过程中页面通信超时/
  );

  assert.deepStrictEqual(logs, [
    {
      message: '步骤 3：认证页在提交后切换过程中页面通信超时，未能重新就绪，暂时无法确认是否进入下一页面。请重试当前轮。',
      level: 'warn',
    },
  ]);
});

test('signup flow helper treats step 3 finalize reconnect error as ready when tab already reached verification', async () => {
  const logs = [];

  const helpers = signupFlowApi.createSignupFlowHelpers({
    addLog: async (message, level = 'info') => {
      logs.push({ message, level });
    },
    buildGeneratedAliasEmail: () => '',
    chrome: { tabs: { get: async () => ({ id: 31, url: 'https://auth.openai.com/email-verification' }) } },
    ensureContentScriptReadyOnTab: async () => {},
    ensureHotmailAccountForFlow: async () => ({}),
    ensureLuckmailPurchaseForFlow: async () => ({}),
    isGeneratedAliasProvider: () => false,
    isReusableGeneratedAliasEmail: () => false,
    isHotmailProvider: () => false,
    isRetryableContentScriptTransportError: (error) => /页面刚完成跳转或刷新，内容脚本还没有重新接回/i.test(error?.message || String(error || '')),
    isLuckmailProvider: () => false,
    isSignupEmailVerificationPageUrl: (url) => /\/email-verification(?:[/?#]|$)/i.test(url || ''),
    isSignupPasswordPageUrl: () => false,
    reuseOrCreateTab: async () => 31,
    sendToContentScriptResilient: async () => {
      throw new Error('认证页 页面刚完成跳转或刷新，内容脚本还没有重新接回；扩展已自动重试，但仍未恢复。请重试当前步骤。');
    },
    setEmailState: async () => {},
    SIGNUP_ENTRY_URL: 'https://chatgpt.com/',
    SIGNUP_PAGE_INJECT_FILES: ['content/utils.js', 'content/signup-page.js'],
    waitForTabUrlMatch: async () => null,
  });

  const result = await helpers.finalizeSignupPasswordSubmitInTab(31, 'Secret123!', 3);

  assert.deepStrictEqual(result, {
    ready: true,
    state: 'verification_page',
    url: 'https://auth.openai.com/email-verification',
    assumed: true,
    transportRecovered: true,
  });
  assert.equal(
    logs.some(({ message, level }) => level === 'warn' && /通信短暂中断/.test(message)),
    true
  );
});
