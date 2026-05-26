const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('phone-sms/providers/registry.js', 'utf8');

function loadRegistry(root = {}) {
  return new Function('self', `${source}; return self.PhoneSmsProviderRegistry;`)(root);
}

test('phone sms provider registry normalizes ids, order and labels consistently', () => {
  const registry = loadRegistry({
    PhoneSmsHeroSmsProvider: {
      createProvider: (deps = {}) => ({ provider: 'hero-sms', deps }),
    },
    PhoneSmsFiveSimProvider: {
      createProvider: (deps = {}) => ({ provider: '5sim', deps }),
    },
    PhoneSmsBowerProvider: {
      createProvider: (deps = {}) => ({ provider: 'smsbower', deps }),
    },
    PhoneSmsChatGptApiProvider: {
      createProvider: (deps = {}) => ({ provider: 'chatgpt-api', deps }),
    },
  });

  assert.deepStrictEqual(registry.getProviderIds(), [
    'hero-sms',
    '5sim',
    'nexsms',
    'smsbower',
    'sms-verification-number',
    'grizzlysms',
    'smspool',
    'chatgpt-api',
  ]);
  assert.equal(registry.normalizeProviderId(' NEXSMS '), 'nexsms');
  assert.equal(registry.normalizeProviderId(' SMSBOWER '), 'smsbower');
  assert.equal(registry.normalizeProviderId(' CHATGPT-API '), 'chatgpt-api');
  assert.equal(registry.normalizeProviderId('unknown-provider'), 'hero-sms');
  assert.equal(registry.getProviderLabel('nexsms'), 'NexSMS');
  assert.equal(registry.getProviderLabel('smsbower'), 'SMSBower');
  assert.equal(registry.getProviderLabel('chatgpt-api'), 'ChatGPT API 接码');
  assert.equal(registry.getProviderDefinition('nexsms').moduleKey, 'PhoneSmsNexSmsProvider');
  assert.equal(registry.getProviderDefinition('smsbower').moduleKey, 'PhoneSmsBowerProvider');
  assert.deepStrictEqual(
    registry.normalizeProviderOrder([
      { provider: 'nexsms' },
      { id: '5sim' },
      { id: 'smsbower' },
      { value: 'hero-sms' },
      'NEXSMS',
    ]),
    ['nexsms', '5sim', 'smsbower', 'hero-sms']
  );
  assert.deepStrictEqual(
    registry.normalizeProviderOrder([], ['nexsms', '5sim', 'nexsms']),
    ['nexsms', '5sim']
  );
  assert.deepStrictEqual(
    registry.createProvider('5sim', { foo: 1 }),
    { provider: '5sim', deps: { foo: 1 } }
  );
  assert.deepStrictEqual(
    registry.createProvider('chatgpt-api', { bar: 2 }),
    { provider: 'chatgpt-api', deps: { bar: 2 } }
  );
  assert.throws(() => registry.createProvider('nexsms'), /接码平台模块未加载：nexsms/);
});
