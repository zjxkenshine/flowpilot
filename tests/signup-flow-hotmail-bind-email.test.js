const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background/signup-flow-helpers.js', 'utf8');
const api = new Function('self', `${source}; return self.MultiPageSignupFlowHelpers;`)({});

test('resolveSignupEmailForFlow uses Hotmail registrationAliasEmail when available', async () => {
  const helper = api.createSignupFlowHelpers({
    buildGeneratedAliasEmail: () => '',
    ensureHotmailAccountForFlow: async (options = {}) => {
      assert.equal(options.allowAllocate, true);
      assert.equal(options.markUsed, true);
      assert.equal(options.preferredAccountId, 'hotmail-1');
      return {
        id: 'hotmail-1',
        email: 'base@outlook.com',
        registrationAliasEmail: 'base+paypal1@outlook.com',
      };
    },
    ensureLuckmailPurchaseForFlow: async () => null,
    fetchGeneratedEmail: async () => '',
    getPreservedPhoneIdentity: () => null,
    isGeneratedAliasProvider: () => false,
    isHotmailProvider: (candidate = {}) => candidate.mailProvider === 'hotmail-api',
    isLuckmailProvider: () => false,
    isReusableGeneratedAliasEmail: () => false,
    persistRegistrationEmailState: async () => {},
    setEmailState: async () => {},
    setState: async () => {},
  });

  const email = await helper.resolveSignupEmailForFlow({
    mailProvider: 'hotmail-api',
    currentHotmailAccountId: 'hotmail-1',
  });

  assert.equal(email, 'base+paypal1@outlook.com');
});

