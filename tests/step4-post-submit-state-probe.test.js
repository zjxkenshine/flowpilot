const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('content/signup-page.js', 'utf8');

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

test('inspectStep4PostSubmitState returns profile page state', () => {
  const api = new Function(`
const location = { href: 'https://auth.openai.com/u/signup/profile' };
function getStep4PostVerificationState() {
  return { state: 'step5', url: location.href };
}
function getCurrentAuthRetryPageState() { return null; }
function isPhoneVerificationPageReady() { return false; }
function getVerificationErrorText() { return ''; }
function isEmailVerificationPage() { return false; }
function isVerificationPageStillVisible() { return false; }
function getSignupPasswordDisplayedEmail() { return 'ada@example.com'; }
function getPhoneVerificationDisplayedPhone() { return ''; }

${extractFunction('inspectStep4PostSubmitState')}
${extractFunction('serializeStep4PostSubmitState')}

return serializeStep4PostSubmitState(inspectStep4PostSubmitState());
`)();

  assert.deepStrictEqual(api, {
    state: 'profile_page',
    url: 'https://auth.openai.com/u/signup/profile',
    skipProfileStep: false,
    emailVerificationRequired: false,
    emailVerificationPage: false,
    invalidCode: false,
    errorText: '',
    userAlreadyExistsBlocked: false,
    retryEnabled: false,
    detailText: '',
    displayedEmail: 'ada@example.com',
    displayedPhone: '',
  });
});

test('inspectStep4PostSubmitState returns logged in home state', () => {
  const api = new Function(`
const location = { href: 'https://chatgpt.com/' };
function getStep4PostVerificationState() {
  return { state: 'logged_in_home', url: location.href, skipProfileStep: true };
}
function getCurrentAuthRetryPageState() { return null; }
function isPhoneVerificationPageReady() { return false; }
function getVerificationErrorText() { return ''; }
function isEmailVerificationPage() { return false; }
function isVerificationPageStillVisible() { return false; }
function getSignupPasswordDisplayedEmail() { return ''; }
function getPhoneVerificationDisplayedPhone() { return ''; }

${extractFunction('inspectStep4PostSubmitState')}
${extractFunction('serializeStep4PostSubmitState')}

return serializeStep4PostSubmitState(inspectStep4PostSubmitState());
`)();

  assert.deepStrictEqual(api, {
    state: 'logged_in_home',
    url: 'https://chatgpt.com/',
    skipProfileStep: true,
    emailVerificationRequired: false,
    emailVerificationPage: false,
    invalidCode: false,
    errorText: '',
    userAlreadyExistsBlocked: false,
    retryEnabled: false,
    detailText: '',
    displayedEmail: '',
    displayedPhone: '',
  });
});

test('inspectStep4PostSubmitState returns signup email verification handoff state', () => {
  const api = new Function(`
const location = { href: 'https://auth.openai.com/email-verification' };
function getStep4PostVerificationState() { return null; }
function getCurrentAuthRetryPageState() { return null; }
function isPhoneVerificationPageReady() { return false; }
function getVerificationErrorText() { return ''; }
function isEmailVerificationPage() { return true; }
function isVerificationPageStillVisible() { return true; }
function getSignupPasswordDisplayedEmail() { return 'ada@example.com'; }
function getPhoneVerificationDisplayedPhone() { return ''; }

${extractFunction('inspectStep4PostSubmitState')}
${extractFunction('serializeStep4PostSubmitState')}

return serializeStep4PostSubmitState(inspectStep4PostSubmitState());
`)();

  assert.equal(api.state, 'verification_page');
  assert.equal(api.emailVerificationRequired, true);
  assert.equal(api.emailVerificationPage, true);
  assert.equal(api.invalidCode, false);
});

test('inspectStep4PostSubmitState returns signup retry state', () => {
  const api = new Function(`
const location = { href: 'https://auth.openai.com/email-verification' };
function getStep4PostVerificationState() { return null; }
function getCurrentAuthRetryPageState() {
  return {
    url: location.href,
    retryEnabled: true,
    userAlreadyExistsBlocked: true,
  };
}
function isPhoneVerificationPageReady() { return false; }
function getVerificationErrorText() { return ''; }
function isEmailVerificationPage() { return false; }
function isVerificationPageStillVisible() { return false; }
function getSignupPasswordDisplayedEmail() { return ''; }
function getPhoneVerificationDisplayedPhone() { return ''; }
function getPageTextSnapshot() { return 'user_already_exists'; }

${extractFunction('inspectStep4PostSubmitState')}
${extractFunction('serializeStep4PostSubmitState')}

return serializeStep4PostSubmitState(inspectStep4PostSubmitState());
`)();

  assert.equal(api.state, 'signup_retry_page');
  assert.equal(api.retryEnabled, true);
  assert.equal(api.userAlreadyExistsBlocked, true);
  assert.equal(api.detailText, 'user_already_exists');
});

test('inspectStep4PostSubmitState returns invalid code state on verification page', () => {
  const api = new Function(`
const location = { href: 'https://auth.openai.com/email-verification' };
function getStep4PostVerificationState() { return null; }
function getCurrentAuthRetryPageState() { return null; }
function isPhoneVerificationPageReady() { return false; }
function getVerificationErrorText() { return '验证码无效'; }
function isEmailVerificationPage() { return false; }
function isVerificationPageStillVisible() { return true; }
function getSignupPasswordDisplayedEmail() { return 'ada@example.com'; }
function getPhoneVerificationDisplayedPhone() { return ''; }

${extractFunction('inspectStep4PostSubmitState')}
${extractFunction('serializeStep4PostSubmitState')}

return serializeStep4PostSubmitState(inspectStep4PostSubmitState({ assumeSignupEmailVerification: false }));
`)();

  assert.equal(api.state, 'verification_page');
  assert.equal(api.invalidCode, true);
  assert.equal(api.errorText, '验证码无效');
  assert.equal(api.emailVerificationRequired, false);
});
