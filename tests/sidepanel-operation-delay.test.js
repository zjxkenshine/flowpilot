const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

function extractFunction(name) {
  let start = source.indexOf(`async function ${name}(`);
  if (start === -1) {
    start = source.indexOf(`function ${name}(`);
  }
  assert.notEqual(start, -1, `missing ${name}`);
  let depth = 0;
  let signatureEnded = false;
  let bodyStart = -1;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) signatureEnded = true;
    }
    if (ch === '{' && signatureEnded) {
      bodyStart = i;
      break;
    }
  }
  let braceDepth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') braceDepth += 1;
    if (ch === '}') {
      braceDepth -= 1;
      if (braceDepth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

test('sidepanel no longer exposes operation delay switch and places step execution range below oauth timeout', () => {
  assert.doesNotMatch(html, /id="row-operation-delay-settings"/);
  assert.doesNotMatch(html, /id="input-operation-delay-enabled"/);

  const step6CookieIndex = html.indexOf('id="row-step6-cookie-settings"');
  const autoDelayIndex = html.indexOf('id="row-auto-delay-settings"');
  const autoRetryIndex = html.indexOf('id="row-auto-retry-settings"');
  const oauthTimeoutIndex = html.indexOf('id="row-oauth-flow-timeout"');
  const oauthOpenWaitIndex = html.indexOf('id="row-oauth-open-after-refresh-wait"');
  const stepRangeIndex = html.indexOf('id="row-step-execution-range"');
  const oauthDisplayIndex = html.indexOf('id="row-oauth-display"');

  assert.notEqual(step6CookieIndex, -1);
  assert.notEqual(autoDelayIndex, -1);
  assert.notEqual(autoRetryIndex, -1);
  assert.notEqual(oauthTimeoutIndex, -1);
  assert.notEqual(oauthOpenWaitIndex, -1);
  assert.notEqual(stepRangeIndex, -1);
  assert.notEqual(oauthDisplayIndex, -1);
  assert.ok(autoDelayIndex > step6CookieIndex, 'startup delay row should render below the openai step6 cookie row');
  assert.ok(autoRetryIndex > autoDelayIndex, 'auto retry settings should render below startup delay settings');
  assert.ok(oauthTimeoutIndex > autoRetryIndex, 'oauth timeout should render below auto retry settings');
  assert.ok(stepRangeIndex > autoDelayIndex, 'step execution range should still remain below the startup delay row');
  assert.ok(oauthOpenWaitIndex > oauthTimeoutIndex, 'oauth open wait should render below oauth timeout');
  assert.ok(oauthOpenWaitIndex < stepRangeIndex, 'oauth open wait should render above step execution range');
  assert.ok(stepRangeIndex > oauthTimeoutIndex, 'step execution range should render below oauth timeout');
  assert.ok(stepRangeIndex < oauthDisplayIndex, 'step execution range should stay above oauth runtime display');
});

test('sidepanel exposes and wires OAuth open-after-refresh wait setting', () => {
  assert.match(html, /id="input-oauth-open-after-refresh-wait-seconds"/);
  assert.match(html, /value="5" min="0" max="120" step="1"/);
  assert.match(source, /const inputOAuthOpenAfterRefreshWaitSeconds = document\.getElementById\('input-oauth-open-after-refresh-wait-seconds'\);/);
  assert.match(source, /function normalizeOAuthOpenAfterRefreshWaitSeconds\(value\)/);
  assert.match(source, /oauthOpenAfterRefreshWaitSeconds:\s*typeof inputOAuthOpenAfterRefreshWaitSeconds/);
  assert.match(source, /inputOAuthOpenAfterRefreshWaitSeconds\.value = String\(\s*normalizeOAuthOpenAfterRefreshWaitSeconds\(state\?\.oauthOpenAfterRefreshWaitSeconds\)/);
  assert.match(source, /message\.payload\.oauthOpenAfterRefreshWaitSeconds !== undefined/);
  assert.match(source, /\[inputOAuthOpenAfterRefreshWaitSeconds, inputPlusCheckoutCreatePreWaitSeconds/);
});

test('sidepanel exposes and wires auto-run issue log preservation switch', () => {
  assert.match(html, /id="input-auto-run-preserve-issue-logs-on-restart"/);
  assert.match(html, /id="row-auto-retry-settings"/);
  assert.match(html, /重开留错/);
  assert.match(source, /const inputAutoRunPreserveIssueLogsOnRestart = document\.getElementById\('input-auto-run-preserve-issue-logs-on-restart'\);/);
  assert.match(source, /autoRunPreserveIssueLogsOnRestart:\s*typeof inputAutoRunPreserveIssueLogsOnRestart/);
  assert.match(source, /inputAutoRunPreserveIssueLogsOnRestart\.checked = Boolean\(state\?\.autoRunPreserveIssueLogsOnRestart\);/);
  assert.match(source, /inputAutoRunPreserveIssueLogsOnRestart\?\.addEventListener\('change'/);
});

test('sidepanel exposes and wires registration-only mode switch', () => {
  assert.match(html, /id="input-registration-only-mode-enabled"/);
  assert.match(html, /id="input-registration-activation-only-mode-enabled"/);
  assert.match(html, /id="row-auto-retry-settings"/);
  assert.match(html, /仅注册/);
  assert.match(html, /仅注册激活/);
  assert.match(html, /确认账号注册成功后停止后续阶段/);
  assert.match(source, /const inputRegistrationOnlyModeEnabled = document\.getElementById\('input-registration-only-mode-enabled'\);/);
  assert.match(source, /const inputRegistrationActivationOnlyModeEnabled = document\.getElementById\('input-registration-activation-only-mode-enabled'\);/);
  assert.match(source, /registrationActivationOnlyModeEnabled:\s*typeof inputRegistrationActivationOnlyModeEnabled/);
  assert.match(source, /inputRegistrationOnlyModeEnabled\.checked = !registrationActivationOnlyModeEnabled && Boolean\(state\?\.registrationOnlyModeEnabled\);/);
  assert.match(source, /inputRegistrationActivationOnlyModeEnabled\.checked = registrationActivationOnlyModeEnabled;/);
  assert.match(source, /message\.payload\.registrationOnlyModeEnabled !== undefined/);
  assert.match(source, /message\.payload\.registrationActivationOnlyModeEnabled !== undefined/);
  assert.match(source, /inputRegistrationOnlyModeEnabled\?\.addEventListener\('change'/);
  assert.match(source, /inputRegistrationActivationOnlyModeEnabled\?\.addEventListener\('change'/);
  assert.match(source, /inputRegistrationOnlyModeEnabled\.checked = false;/);
});

test('sidepanel places thread interval inside auto retry settings grid', () => {
  const autoRetryIndex = html.indexOf('id="row-auto-retry-settings"');
  const oauthTimeoutIndex = html.indexOf('id="row-oauth-flow-timeout"');
  const threadIntervalIndex = html.indexOf('id="input-auto-skip-failures-thread-interval-minutes"');

  assert.notEqual(autoRetryIndex, -1);
  assert.notEqual(oauthTimeoutIndex, -1);
  assert.notEqual(threadIntervalIndex, -1);
  assert.ok(threadIntervalIndex > autoRetryIndex, 'thread interval should be after auto retry row start');
  assert.ok(threadIntervalIndex < oauthTimeoutIndex, 'thread interval should be inside auto retry settings, not oauth timeout');
  assert.match(html, /class="data-inline setting-pair auto-retry-setting-grid"/);
});

test('sidepanel operation delay state is always normalized back to enabled', () => {
  const harness = new Function(`
    let latestState = { operationDelayEnabled: false };
    function syncLatestState(nextState) {
      latestState = { ...(latestState || {}), ...(nextState || {}) };
    }
    ${extractFunction('normalizeOperationDelayEnabled')}
    ${extractFunction('applyOperationDelayState')}
    return {
      normalizeOperationDelayEnabled,
      applyOperationDelayState,
      getLatestState: () => latestState,
    };
  `)();

  assert.equal(harness.normalizeOperationDelayEnabled(undefined), true);
  assert.equal(harness.normalizeOperationDelayEnabled(false), true);
  assert.equal(harness.normalizeOperationDelayEnabled(true), true);

  harness.applyOperationDelayState({ operationDelayEnabled: false });
  assert.equal(harness.getLatestState().operationDelayEnabled, true);
});
