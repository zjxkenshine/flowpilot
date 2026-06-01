const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('paypal-utils.js', 'utf8');

function loadApi() {
  const globalScope = {};
  return new Function('self', `${source}; return self.PayPalUtils;`)(globalScope);
}

test('PayPal random Gmail helper generates fp gmail addresses', () => {
  const api = loadApi();

  const email = api.buildRandomPayPalGmailEmail({
    email: 'configured@example.com',
    gmailBaseEmail: 'base@gmail.com',
  });

  assert.match(email, /^fp\.[a-z0-9]+\.[a-z0-9]+@gmail\.com$/);
  assert.notEqual(email, 'configured@example.com');
  assert.notEqual(email, 'base@gmail.com');
});

test('PayPal random Gmail helper returns unique lowercase emails', () => {
  const api = loadApi();

  const emails = Array.from({ length: 20 }, () => api.buildRandomPayPalGmailEmail());

  assert.equal(new Set(emails).size, emails.length);
  for (const email of emails) {
    assert.equal(email, email.toLowerCase());
    assert.match(email, /^fp\.[a-z0-9]+\.[a-z0-9]+@gmail\.com$/);
  }
});
