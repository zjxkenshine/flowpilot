const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('sidepanel exposes browser fingerprint settings and wires persistence', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

  assert.match(html, /id="row-browser-fingerprint"/);
  assert.match(html, /id="row-browser-fingerprint-language"/);
  assert.match(html, /id="input-browser-fingerprint-enabled"/);
  assert.match(html, /id="select-browser-fingerprint-level"/);
  assert.match(html, /id="select-browser-fingerprint-language"/);
  assert.match(html, /<option value="basic">/);
  assert.match(html, /<option value="standard">/);
  assert.match(html, /<option value="enhanced">/);
  assert.match(html, /<option value="zh-CN">/);
  assert.match(html, /<option value="en-US">English<\/option>/);
  assert.match(html, /<option value="random">随机<\/option>/);

  assert.match(source, /function normalizeBrowserFingerprintLevel/);
  assert.match(source, /function normalizeBrowserFingerprintLanguage/);
  assert.match(source, /normalized === 'random'/);
  assert.match(source, /browserFingerprintEnabled:\s*typeof inputBrowserFingerprintEnabled/);
  assert.match(source, /browserFingerprintLevel:\s*typeof selectBrowserFingerprintLevel/);
  assert.match(source, /browserFingerprintLanguage:\s*typeof selectBrowserFingerprintLanguage/);
  assert.match(source, /inputBrowserFingerprintEnabled\?\.addEventListener\('change'/);
  assert.match(source, /selectBrowserFingerprintLevel\?\.addEventListener\('change'/);
  assert.match(source, /selectBrowserFingerprintLanguage\?\.addEventListener\('change'/);
  assert.match(source, /updateBrowserFingerprintUI\(state\)/);
});
