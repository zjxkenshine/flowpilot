const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
const flowRegistrySource = fs.readFileSync('shared/flow-registry.js', 'utf8');

test('sidepanel exposes SUB2API account priority below group setting', () => {
  assert.match(html, /id="row-sub2api-account-priority"/);
  assert.match(html, /id="input-sub2api-account-priority"/);
  assert.match(html, /<span class="data-label">优先级<\/span>/);
  const inputTag = html.match(/<input[^>]*id="input-sub2api-account-priority"[^>]*>/)?.[0] || '';
  assert.match(inputTag, /type="number"/);
  assert.match(inputTag, /min="1"/);
  assert.match(inputTag, /step="1"/);
  assert.ok(
    html.indexOf('id="row-sub2api-account-priority"') > html.indexOf('id="row-sub2api-group"'),
    'priority row should be placed below the SUB2API group row'
  );
  assert.ok(
    html.indexOf('id="row-sub2api-account-priority"') < html.indexOf('id="row-sub2api-default-proxy"'),
    'priority row should remain above the SUB2API default proxy row'
  );
});

test('sidepanel persists and locks SUB2API account priority setting', () => {
  assert.match(
    source,
    /const rowSub2ApiAccountPriority = document\.getElementById\('row-sub2api-account-priority'\);/
  );
  assert.match(
    source,
    /const inputSub2ApiAccountPriority = document\.getElementById\('input-sub2api-account-priority'\);/
  );
  assert.match(source, /function normalizeSub2ApiAccountPriorityValue\(/);
  assert.match(source, /const sub2apiAccountPriorityNormalizer = typeof normalizeSub2ApiAccountPriorityValue === 'function'/);
  assert.match(source, /sub2apiAccountPriority: sub2apiAccountPriorityNormalizer\(/);
  assert.match(
    source,
    /inputSub2ApiAccountPriority\.value = String\(normalizeSub2ApiAccountPriorityValue\(state\?\.sub2apiAccountPriority\)\);/
  );
  assert.match(source, /applyFlowSettingsGroupVisibility\(visibleGroupIds\);/);
  assert.match(flowRegistrySource, /'openai-target-sub2api': \{[\s\S]*'row-sub2api-account-priority'/);
  assert.match(source, /inputSub2ApiAccountPriority\.disabled = locked;/);
  assert.match(
    source,
    /inputSub2ApiAccountPriority\.addEventListener\('input', \(\) => \{[\s\S]*scheduleSettingsAutoSave\(\);[\s\S]*\}\);/
  );
  assert.match(
    source,
    /inputSub2ApiAccountPriority\.addEventListener\('blur', \(\) => \{[\s\S]*saveSettings\(\{ silent: true \}\)/
  );
});

test('sidepanel exposes and wires SUB2API relogin account pool controls', () => {
  [
    'input-sub2api-relogin-enabled',
    'input-sub2api-relogin-account-pool',
    'input-sub2api-relogin-pool-import',
    'btn-sub2api-relogin-pool-import',
    'btn-sub2api-relogin-pool-refresh',
    'btn-sub2api-relogin-pool-copy',
    'btn-sub2api-relogin-pool-clear-used',
    'btn-sub2api-relogin-pool-delete-all',
    'sub2api-relogin-pool-list',
  ].forEach((id) => {
    assert.match(html, new RegExp(`id="${id}"`));
  });

  assert.match(flowRegistrySource, /'openai-target-sub2api': \{[\s\S]*'row-sub2api-relogin-enabled'/);
  assert.match(flowRegistrySource, /'openai-target-sub2api': \{[\s\S]*'row-sub2api-relogin-pool'/);
  assert.match(source, /function parseSub2ApiReloginAccountPoolEntries\(/);
  assert.match(source, /function renderSub2ApiReloginPool\(/);
  assert.match(source, /function applySub2ApiReloginVisibilityOverrides\(/);
  assert.match(source, /sub2apiDefaultProxyName: sub2apiReloginEnabled \? '' : inputSub2ApiDefaultProxy\.value\.trim\(\)/);
  assert.match(source, /ipProxyEnabled: sub2apiReloginEnabled \? false : getSelectedIpProxyEnabledSafe\(\)/);
  assert.match(source, /signupMethod: payloadSignupMethod/);
  assert.match(source, /inputSub2ApiReloginEnabled\?\.addEventListener\('change'/);
  assert.match(source, /sub2ApiReloginPoolList\?\.addEventListener\('click'/);
  assert.match(source, /syncStepDefinitionsForMode[\s\S]*sub2apiReloginEnabled: nextSub2ApiReloginEnabled/);
});
