const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadSourceRegistry() {
  const flowRegistrySource = fs.readFileSync('shared/flow-registry.js', 'utf8');
  const sourceRegistrySource = fs.readFileSync('shared/source-registry.js', 'utf8');
  const globalScope = {};
  new Function('self', `${flowRegistrySource}; ${sourceRegistrySource}; return self;`)(globalScope);
  return globalScope.MultiPageSourceRegistry.createSourceRegistry();
}

function assertOrdered(list, before, after) {
  assert.ok(list.includes(before), `missing ${before}`);
  assert.ok(list.includes(after), `missing ${after}`);
  assert.ok(list.indexOf(before) < list.indexOf(after), `${before} must load before ${after}`);
}

test('background imports shared source registry module', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  assert.match(source, /shared\/flow-registry\.js/);
  assert.match(source, /shared\/settings-schema\.js/);
  assert.match(source, /shared\/source-registry\.js/);
  assert.match(source, /shared\/kiro-timeouts\.js/);
});

test('manifest loads shared source registry before content utils in static bundles', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const entry of manifest.content_scripts || []) {
    const scripts = Array.isArray(entry.js) ? entry.js : [];
    if (!scripts.includes('content/utils.js')) continue;
    assert.ok(scripts.includes('shared/source-registry.js'));
    assert.ok(
      scripts.indexOf('shared/source-registry.js') < scripts.indexOf('content/utils.js'),
      'shared/source-registry.js must load before content/utils.js'
    );
  }
});

test('manifest statically injects payment page content bundles', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const scripts = manifest.content_scripts || [];
  const plusCheckoutBundle = scripts.find((entry) => {
    const matches = Array.isArray(entry.matches) ? entry.matches : [];
    return matches.includes('https://pay.openai.com/*')
      && matches.includes('https://checkout.stripe.com/*');
  });
  const paypalBundle = scripts.find((entry) => {
    const matches = Array.isArray(entry.matches) ? entry.matches : [];
    return matches.includes('https://www.paypal.com/*')
      && matches.includes('https://paypal.com/*');
  });

  assert.ok(plusCheckoutBundle, 'missing static Plus checkout bundle');
  assert.ok(paypalBundle, 'missing static PayPal bundle');
  assert.equal(plusCheckoutBundle.run_at, 'document_idle');
  assert.equal(paypalBundle.run_at, 'document_idle');
  assert.equal(plusCheckoutBundle.all_frames, undefined);
  assert.equal(paypalBundle.all_frames, undefined);

  assert.deepEqual(plusCheckoutBundle.js, [
    'content/activation-utils.js',
    'shared/source-registry.js',
    'shared/plus-checkout-regions.js',
    'content/utils.js',
    'content/operation-delay.js',
    'content/plus-checkout.js',
  ]);
  assert.deepEqual(paypalBundle.js, [
    'content/activation-utils.js',
    'shared/source-registry.js',
    'content/utils.js',
    'content/operation-delay.js',
    'content/paypal-flow.js',
  ]);
  assertOrdered(plusCheckoutBundle.js, 'shared/source-registry.js', 'content/utils.js');
  assertOrdered(plusCheckoutBundle.js, 'shared/plus-checkout-regions.js', 'content/plus-checkout.js');
  assertOrdered(plusCheckoutBundle.js, 'content/operation-delay.js', 'content/plus-checkout.js');
  assertOrdered(paypalBundle.js, 'shared/source-registry.js', 'content/utils.js');
  assertOrdered(paypalBundle.js, 'content/operation-delay.js', 'content/paypal-flow.js');
});

test('manifest no longer ships a static Kiro content bundle', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const hasStaticKiroBundle = (manifest.content_scripts || []).some((entry) => {
    const scripts = Array.isArray(entry.js) ? entry.js : [];
    return scripts.includes('content/kiro/register-page.js')
      || scripts.includes('content/kiro/desktop-authorize-page.js');
  });

  assert.equal(hasStaticKiroBundle, false);
});

test('background injects shared Kiro timeout module before Kiro content scripts', () => {
  const source = fs.readFileSync('background.js', 'utf8');
  assert.match(
    source,
    /const KIRO_REGISTER_INJECT_FILES = \['shared\/source-registry\.js', 'shared\/kiro-timeouts\.js', 'content\/utils\.js', 'content\/kiro\/register-page\.js'\];/
  );
  assert.match(
    source,
    /const KIRO_DESKTOP_AUTHORIZE_INJECT_FILES = \['shared\/source-registry\.js', 'shared\/kiro-timeouts\.js', 'content\/utils\.js', 'content\/kiro\/desktop-authorize-page\.js'\];/
  );
});

test('shared source registry exposes canonical Kiro sources and drivers', () => {
  const registry = loadSourceRegistry();

  assert.equal(registry.resolveCanonicalSource('signup-page'), 'openai-auth');
  assert.deepEqual(registry.getSourceKeys('signup-page'), ['openai-auth', 'signup-page']);
  assert.equal(registry.getSourceLabel('openai-auth'), '认证页');

  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://auth.openai.com/create-account',
      hostname: 'auth.openai.com',
    }),
    'openai-auth'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://pay.openai.com/c/pay/cs_test',
      hostname: 'pay.openai.com',
    }),
    'plus-checkout'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://checkout.stripe.com/c/pay/cs_test',
      hostname: 'checkout.stripe.com',
    }),
    'plus-checkout'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://www.paypal.com/checkoutnow',
      hostname: 'www.paypal.com',
    }),
    'paypal-flow'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://paypal.com/checkoutnow',
      hostname: 'paypal.com',
    }),
    'paypal-flow'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://app.kiro.dev/signin',
      hostname: 'app.kiro.dev',
    }),
    'kiro-register-page'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      injectedSource: 'kiro-desktop-authorize',
      url: 'https://signin.aws/register',
      hostname: 'signin.aws',
    }),
    'kiro-desktop-authorize'
  );
  assert.equal(
    registry.detectSourceFromLocation({
      url: 'https://example.com/',
      hostname: 'example.com',
    }),
    'unknown-source'
  );

  assert.equal(
    registry.matchesSourceUrlFamily(
      'kiro-register-page',
      'https://app.kiro.dev/signin',
      'https://app.kiro.dev/signin'
    ),
    true
  );
  assert.equal(
    registry.matchesSourceUrlFamily(
      'kiro-register-page',
      'https://signin.aws/register',
      'https://app.kiro.dev/signin'
    ),
    true
  );
  assert.equal(
    registry.matchesSourceUrlFamily(
      'kiro-desktop-authorize',
      'https://profile.aws/complete',
      'https://signin.aws/register'
    ),
    true
  );
  assert.equal(
    registry.matchesSourceUrlFamily(
      'kiro-desktop-authorize',
      'https://oidc.us-east-1.amazonaws.com/authorize',
      'https://view.awsapps.com/start'
    ),
    true
  );
  assert.equal(
    registry.matchesSourceUrlFamily(
      'plus-checkout',
      'https://pay.openai.com/c/pay/cs_test',
      'https://chatgpt.com/checkout/openai_ie/cs_test'
    ),
    true
  );
  assert.equal(
    registry.matchesSourceUrlFamily(
      'plus-checkout',
      'https://checkout.stripe.com/c/pay/cs_test',
      'https://chatgpt.com/checkout/openai_ie/cs_test'
    ),
    true
  );

  assert.equal(registry.shouldReportReadyForFrame('mail-163', true), false);
  assert.equal(registry.shouldReportReadyForFrame('kiro-register-page', true), false);
  assert.equal(registry.shouldReportReadyForFrame('kiro-desktop-authorize', true), false);
  assert.equal(registry.getCleanupOwnerSource('oauth-localhost-callback'), 'openai-auth');

  assert.equal(registry.driverAcceptsCommand('openai-auth', 'submit-signup-email'), true);
  assert.equal(registry.driverAcceptsCommand('content/platform-panel', 'platform-verify'), true);
  assert.equal(registry.driverAcceptsCommand('openai-auth', 'platform-verify'), false);
  assert.equal(registry.driverAcceptsCommand('content/kiro/register-page', 'kiro-submit-password'), true);
  assert.equal(registry.driverAcceptsCommand('content/kiro/desktop-authorize-page', 'kiro-complete-desktop-authorize'), true);
  assert.equal(registry.driverAcceptsCommand('background/kiro-register', 'kiro-open-register-page'), true);
  assert.equal(registry.driverAcceptsCommand('background/kiro-desktop-authorize', 'kiro-start-desktop-authorize'), true);
  assert.equal(registry.driverAcceptsCommand('background/kiro-publisher-kiro-rs', 'kiro-upload-credential'), true);
});
