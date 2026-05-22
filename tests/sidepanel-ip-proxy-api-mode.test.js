const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('sidepanel IP proxy API mode is exposed with structured 711 fields', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');

  assert.match(html, /data-ip-proxy-mode="api"/);
  assert.doesNotMatch(html, /data-ip-proxy-mode="api"[^>]*disabled/);
  [
    'input-ip-proxy-api-url',
    'input-ip-proxy-api-count',
    'input-ip-proxy-api-region',
    'select-ip-proxy-api-proto',
    'select-ip-proxy-api-stype',
    'input-ip-proxy-api-split',
    'input-ip-proxy-api-zone',
    'input-ip-proxy-api-ptype',
    'select-ip-proxy-api-sess-type',
    'input-ip-proxy-api-sess-time',
    'select-ip-proxy-api-sess-auto',
  ].forEach((id) => {
    assert.match(html, new RegExp(`id="${id}"`));
  });
});

test('sidepanel enables IP proxy API mode and wires 711 API inputs', () => {
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
  const panelSource = fs.readFileSync('sidepanel/ip-proxy-panel.js', 'utf8');

  assert.match(source, /const IP_PROXY_API_MODE_ENABLED = true;/);
  [
    'inputIpProxyApiCount',
    'inputIpProxyApiRegion',
    'selectIpProxyApiProto',
    'selectIpProxyApiStype',
    'inputIpProxyApiSplit',
    'inputIpProxyApiZone',
    'inputIpProxyApiPtype',
    'selectIpProxyApiSessType',
    'inputIpProxyApiSessTime',
    'selectIpProxyApiSessAuto',
  ].forEach((name) => {
    assert.match(source, new RegExp(`const ${name} = document\\.getElementById\\(`));
  });

  assert.match(panelSource, /sync711ApiFieldsFromUrlForPanel/);
  assert.match(panelSource, /rebuild711ApiUrlFromFieldsForPanel/);
  assert.match(panelSource, /apiSessType/);
});
