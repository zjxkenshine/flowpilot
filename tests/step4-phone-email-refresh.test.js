const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadStep4Api() {
  const source = fs.readFileSync('background/steps/fetch-signup-code.js', 'utf8');
  const globalScope = {};
  return new Function('self', `${source}; return self.MultiPageBackgroundStep4;`)(globalScope);
}

test('step 4 refreshes state after phone verification before continuing email verification', async () => {
  const api = loadStep4Api();
  const mailConfigStates = [];
  const verificationStates = [];
  let currentState = {
    signupMethod: 'phone',
    emailGenerator: 'cloudflare-temp-email',
    accountIdentifierType: 'phone',
    accountIdentifier: '+86 138-1234-5678',
    signupPhoneNumber: '+86 138-1234-5678',
    email: 'random-prefix@mail.example.com',
    signupPhoneActivation: {
      activationId: 'active-1',
      phoneNumber: '+86 138-1234-5678',
    },
  };

  const executor = api.createStep4Executor({
    addLog: async () => {},
    chrome: {
      tabs: {
        update: async () => {},
      },
    },
    completeNodeFromBackground: async () => {
      throw new Error('phone handoff should not complete before email verification');
    },
    confirmCustomVerificationStepBypass: async () => {},
    generateRandomBirthday: () => ({ year: 1999, month: 1, day: 2 }),
    generateRandomName: () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
    getMailConfig: (state) => {
      mailConfigStates.push(state);
      return {
        provider: 'cloudflare-temp-email',
        label: 'Cloudflare Temp Email',
        source: 'cloudflare-temp-email',
      };
    },
    getState: async () => currentState,
    getTabId: async () => 77,
    HOTMAIL_PROVIDER: 'hotmail-api',
    isTabAlive: async () => true,
    LUCKMAIL_PROVIDER: 'luckmail-api',
    CLOUDFLARE_TEMP_EMAIL_PROVIDER: 'cloudflare-temp-email',
    resolveVerificationStep: async (_step, state) => {
      verificationStates.push(state);
    },
    reuseOrCreateTab: async () => {},
    sendToContentScript: async (_source, message) => {
      assert.equal(message.type, 'PREPARE_SIGNUP_VERIFICATION');
      return {};
    },
    sendToContentScriptResilient: async (_source, message) => {
      assert.equal(message.type, 'PREPARE_SIGNUP_VERIFICATION');
      return {};
    },
    shouldUseCustomRegistrationEmail: () => false,
    STANDARD_MAIL_VERIFICATION_RESEND_INTERVAL_MS: 25000,
    throwIfStopped: () => {},
    phoneVerificationHelpers: {
      completeSignupPhoneVerificationFlow: async () => {
        currentState = {
          ...currentState,
          email: '8613812345678@mail.example.com',
          registrationEmailState: {
            current: '8613812345678@mail.example.com',
            previous: '8613812345678@mail.example.com',
            source: 'generated:cloudflare-temp-email:phone-prefix',
            updatedAt: 123,
          },
          signupPhoneCompletedActivation: {
            activationId: 'active-1',
            phoneNumber: '+86 138-1234-5678',
          },
          signupPhoneActivation: null,
        };
        return { emailVerificationRequired: true, emailVerificationPage: true };
      },
    },
    resolveSignupMethod: (state) => state.signupMethod,
  });

  await executor.executeStep4(currentState);

  assert.equal(mailConfigStates.length, 1);
  assert.equal(mailConfigStates[0].email, '8613812345678@mail.example.com');
  assert.equal(verificationStates.length, 1);
  assert.equal(verificationStates[0].email, '8613812345678@mail.example.com');
  assert.equal(verificationStates[0].registrationEmailState.current, '8613812345678@mail.example.com');
});
