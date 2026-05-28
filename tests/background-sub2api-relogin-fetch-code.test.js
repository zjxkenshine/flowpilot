const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('background/steps/fetch-login-code.js', 'utf8');

test('fetch-login-code allows SUB2API relogin phone login to poll email verification code', () => {
  assert.match(source, /function isSub2ApiReloginMode\(state = \{\}\)/);
  assert.match(source, /function buildSub2ApiReloginEmailCodeState\(state = \{\}, visibleStep = 0\)/);
  assert.match(
    source,
    /if \(pageState\?\.state === 'verification_page'\) \{[\s\S]*if \(isSub2ApiReloginMode\(state\)\) \{[\s\S]*buildSub2ApiReloginEmailCodeState\(state, visibleStep\)[\s\S]*pollEmailVerificationCode\(preparedState, pageState, visibleStep, runtime\);[\s\S]*throw new Error/
  );
});

test('oauth-login keeps ordinary phone signup guard while allowing SUB2API relogin email OTP page', () => {
  const oauthSource = fs.readFileSync('background/steps/oauth-login.js', 'utf8');

  assert.match(oauthSource, /function isSub2ApiReloginModeForStep7\(state = \{\}\)/);
  assert.match(
    oauthSource,
    /Boolean\(state\?\.phoneVerificationEnabled\) \|\| isSub2ApiReloginModeForStep7\(state\)/
  );
  assert.match(
    oauthSource,
    /if \(isStep7PlainVerificationResult\(result\) && isSub2ApiReloginModeForStep7\(currentState\)\) \{[\s\S]*return payload;[\s\S]*\}[\s\S]*if \(isStep7PlainVerificationResult\(result\)\) \{[\s\S]*throw new Error/
  );
});
