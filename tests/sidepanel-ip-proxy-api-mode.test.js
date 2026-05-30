const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('sidepanel IP proxy API mode is exposed with structured 711 fields', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const protoSelectMatch = html.match(/<select id="select-ip-proxy-api-proto" class="data-select">[\s\S]*?<\/select>/);

  assert.match(html, /data-ip-proxy-mode="api"/);
  assert.doesNotMatch(html, /data-ip-proxy-mode="api"[^>]*disabled/);
  [
    'select-ip-proxy-api-route-mode',
    'input-ip-proxy-api-url',
    'input-ip-proxy-api-count',
    'input-ip-proxy-api-region',
    'input-ip-proxy-api-zone',
    'input-ip-proxy-api-ptype',
    'input-ip-proxy-switch-ip-round-count',
    'input-ip-proxy-auto-refresh-pool-on-exhausted',
    'select-ip-proxy-api-host',
    'select-ip-proxy-api-proto',
    'select-ip-proxy-api-stype',
    'select-ip-proxy-api-split',
    'select-ip-proxy-api-sess-type',
    'input-ip-proxy-api-sess-time',
    'select-ip-proxy-api-sess-auto',
    'input-ip-proxy-api-refresh-key',
    'input-ip-proxy-api-refresh-url',
  ].forEach((id) => {
    assert.match(html, new RegExp(`id="${id}"`));
  });
  assert.ok(protoSelectMatch);
  assert.match(
    protoSelectMatch[0],
    /<option value="http">HTTP\/HTTPS<\/option>[\s\S]*<option value="socks5">Socks5<\/option>/
  );
  assert.doesNotMatch(protoSelectMatch[0], /<option value="https">HTTPS<\/option>/);
  assert.doesNotMatch(protoSelectMatch[0], /<option value="socks4">SOCKS4<\/option>/);
  assert.match(html, /<select id="select-ip-proxy-protocol" class="data-select">[\s\S]*<option value="https">HTTPS<\/option>[\s\S]*<option value="socks4">SOCKS4<\/option>/);
});

test('sidepanel exposes read-only IP proxy exit info form below runtime status', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  [
    'row-ip-proxy-exit-info',
    'display-ip-proxy-exit-ip',
    'display-ip-proxy-exit-region',
    'btn-ip-proxy-exit-refresh',
  ].forEach((id) => {
    assert.match(html, new RegExp(`id="${id}"`));
  });
  assert.ok(
    html.indexOf('id="row-ip-proxy-runtime-status"') < html.indexOf('id="row-ip-proxy-exit-info"'),
    'exit info row should stay directly below runtime status'
  );

  assert.match(source, /const rowIpProxyExitInfo = document\.getElementById\('row-ip-proxy-exit-info'\);/);
  assert.match(source, /const displayIpProxyExitIp = document\.getElementById\('display-ip-proxy-exit-ip'\);/);
  assert.match(source, /const displayIpProxyExitRegion = document\.getElementById\('display-ip-proxy-exit-region'\);/);
  assert.match(source, /const btnIpProxyExitRefresh = document\.getElementById\('btn-ip-proxy-exit-refresh'\);/);
  assert.match(source, /btnIpProxyExitRefresh\?\.addEventListener\('click'[\s\S]*runIpProxyActionWithLock\('probe'[\s\S]*await probeIpProxyExit\(\);/);

  assert.match(panelSource, /function setIpProxyExitInfoDisplay\(state = latestState\)/);
  assert.match(panelSource, /runtimeState\?\.ipProxyAppliedExitIp/);
  assert.match(panelSource, /runtimeState\?\.ipProxyAppliedExitRegion/);
  assert.match(panelSource, /const ipText = exitDetecting \? '检测中\.\.\.' : \(exitIp \|\| '未检测'\);/);
  assert.match(panelSource, /rowIpProxyExitInfo\.style\.display = showSettings \? '' : 'none';/);
  assert.match(panelSource, /btnIpProxyExitRefresh\.disabled = actionBusy \|\| !enabled \|\| !canOperate;/);
  assert.match(panelSource, /type: 'PROBE_IP_PROXY_EXIT'/);
});

test('sidepanel enables IP proxy API mode and wires 711 API inputs', () => {
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(source, /const IP_PROXY_API_MODE_ENABLED = true;/);
  [
    'inputIpProxyApiCount',
    'inputIpProxyApiRegion',
    'inputIpProxyApiZone',
    'inputIpProxyApiPtype',
    'selectIpProxyApiRouteMode',
    'inputIpProxySwitchIpRoundCount',
    'inputIpProxyAutoRefreshPoolOnExhausted',
    'selectIpProxyApiHost',
    'selectIpProxyApiProto',
    'selectIpProxyApiStype',
    'selectIpProxyApiSplit',
    'selectIpProxyApiSessType',
    'inputIpProxyApiSessTime',
    'selectIpProxyApiSessAuto',
    'inputIpProxyApiRefreshKey',
    'inputIpProxyApiRefreshUrl',
  ].forEach((name) => {
    assert.match(source, new RegExp(`const ${name} = document\\.getElementById\\(`));
  });

  assert.match(panelSource, /sync711ApiFieldsFromUrlForPanel/);
  assert.match(panelSource, /rebuild711ApiUrlFromFieldsForPanel/);
  assert.match(panelSource, /apiRegion/);
  assert.match(panelSource, /apiRouteMode/);
  assert.match(panelSource, /normalizeIpProxyApiRegionForPanel/);
  assert.match(panelSource, /apiSessType/);
});

test('sidepanel exposes IP proxy activation step selector backed by workflow nodes', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(html, /id="row-ip-proxy-activation-step"/);
  assert.match(html, /id="select-ip-proxy-activation-step"/);
  assert.match(html, /开启节点/);
  assert.match(source, /const selectIpProxyActivationStep = document\.getElementById\('select-ip-proxy-activation-step'\);/);
  assert.match(source, /function syncIpProxyActivationStepOptions\(state = latestState\)/);
  assert.match(source, /workflowNodes/);
  assert.match(source, /ipProxyActivationStep: normalizeIpProxyActivationStepValue/);
  assert.match(source, /selectIpProxyActivationStep\?\.addEventListener\('change'/);
  assert.match(source, /saveSettings\(\{ silent: true \}\)/);
  assert.match(source, /syncStepDefinitionsForMode[\s\S]*syncIpProxyActivationStepOptions\(latestState\);/);
  assert.match(panelSource, /rowIpProxyActivationStep\.style\.display = showSettings \? '' : 'none';/);
});

test('sidepanel shows success-rotation controls only for 711 API mode', () => {
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');

  assert.match(panelSource, /const is711ApiMode = isApiMode && service === '711proxy';/);
  assert.match(panelSource, /rowIpProxyApiRouteMode\.style\.display = showSettings && apiModeAvailable && isApiMode \? '' : 'none';/);
  assert.match(panelSource, /rowIpProxyPoolTargetCount\.style\.display = showSettings && is711ApiMode \? '' : 'none';/);
  assert.match(panelSource, /rowIpProxySwitchIpRoundCount\.style\.display = showSettings && is711ApiMode \? '' : 'none';/);
  assert.match(panelSource, /rowIpProxyAutoRefreshPoolOnExhausted\.style\.display = showSettings && is711ApiMode \? '' : 'none';/);
  assert.match(panelSource, /rowIpProxyProtocol\.style\.display = showSettings && isAccountMode \? '' : 'none';/);
  assert.match(html, /换代理池轮次/);
  assert.match(html, /换IP轮次/);
  assert.match(html, /池尾允许拉新池/);
  assert.match(html, /换IP轮次命中且当前 API 池已用完时，允许自动请求 711 API 拉取新代理池/);
  assert.doesNotMatch(html, /任务切换阈值/);
  assert.doesNotMatch(html, /池尾自动拉新池/);
});

test('sidepanel IP proxy actions send current normalized proxy override payload', () => {
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(panelSource, /function buildCurrentIpProxyActionStateOverride\(state = latestState, options = \{\}\)/);
  assert.match(panelSource, /ipProxyServiceProfiles: profiles/);
  assert.match(panelSource, /buildIpProxyStatePatchFromServiceProfile\(selectedService, currentProfile\)/);
  assert.match(panelSource, /ipProxyStateOverride,/);
  assert.match(panelSource, /type: 'REFRESH_IP_PROXY_POOL'[\s\S]*ensureDifferentExit: mode === 'api'/);
  assert.match(panelSource, /type: 'SWITCH_IP_PROXY'[\s\S]*ensureDifferentExit: mode === 'api'/);
  assert.match(panelSource, /type: 'REFRESH_IP_PROXY_POOL'[\s\S]*ipProxyStateOverride/);
  assert.match(panelSource, /type: 'SWITCH_IP_PROXY'[\s\S]*ipProxyStateOverride/);
  assert.match(panelSource, /type: 'CHANGE_IP_PROXY_EXIT'[\s\S]*ipProxyStateOverride/);
  assert.match(panelSource, /type: 'PROBE_IP_PROXY_EXIT'[\s\S]*ipProxyStateOverride/);
  assert.match(panelSource, /if \(!response\?\.exitCheckCompleted\) \{\s*scheduleIpProxyExitProbe\(\{ silent: true \}\);/);
});

test('sidepanel 711 API region input keeps draft typing and only persists complete country codes', () => {
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(source, /inputIpProxyApiRegion\?\.addEventListener\('input'[\s\S]*normalizeIpProxyApiRegionDraftForPanel/);
  assert.match(source, /inputIpProxyApiRegion\?\.addEventListener\('blur'[\s\S]*normalizeIpProxyApiRegionForPanel/);
  assert.match(panelSource, /function normalizeIpProxyApiRegionDraftForPanel\(value = ''\)/);
  assert.match(panelSource, /slice\(0, 2\)/);
  assert.match(panelSource, /if \(draft.length !== 2\) \{\s*return '';/);
});

test('sidepanel 711 API region sync clears stale region when URL has no region parameter', () => {
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(panelSource, /function build711ApiConfigInputForProfile\(rawValue = \{\}\)/);
  assert.match(panelSource, /if \(parsedApiConfig\?\.isValidUrl\) \{\s*return \{ apiUrl \};\s*\}/);
  assert.match(panelSource, /assignIfDifferent\(inputIpProxyApiRegion, parsed\.region\);/);
  assert.match(panelSource, /region: normalizedRegion,/);
});
