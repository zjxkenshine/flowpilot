const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('sidepanel exposes browser fingerprint settings and wires persistence', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

  assert.match(html, /id="row-browser-fingerprint"/);
  assert.match(html, /id="input-browser-fingerprint-enabled"/);
  assert.match(html, /id="select-browser-fingerprint-level"/);
  assert.match(html, /<option value="basic">基础<\/option>/);
  assert.match(html, /<option value="standard">标准<\/option>/);
  assert.match(html, /<option value="enhanced">增强<\/option>/);

  assert.match(source, /function normalizeBrowserFingerprintLevel/);
  assert.match(source, /browserFingerprintEnabled:\s*typeof inputBrowserFingerprintEnabled/);
  assert.match(source, /browserFingerprintLevel:\s*typeof selectBrowserFingerprintLevel/);
  assert.match(source, /inputBrowserFingerprintEnabled\?\.addEventListener\('change'/);
  assert.match(source, /selectBrowserFingerprintLevel\?\.addEventListener\('change'/);
  assert.match(source, /updateBrowserFingerprintUI\(state\)/);
});
