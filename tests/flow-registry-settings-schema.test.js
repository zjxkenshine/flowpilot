const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const flowRegistrySource = fs.readFileSync('shared/flow-registry.js', 'utf8');
const settingsSchemaSource = fs.readFileSync('shared/settings-schema.js', 'utf8');

function loadApis() {
  const scope = {};
  return new Function('self', `${flowRegistrySource}; ${settingsSchemaSource}; return {
    flowRegistry: self.MultiPageFlowRegistry,
    settingsSchema: self.MultiPageSettingsSchema,
  };`)(scope);
}

test('flow registry exposes canonical flow and target metadata', () => {
  const { flowRegistry } = loadApis();

  assert.deepEqual(flowRegistry.getRegisteredFlowIds(), ['openai', 'kiro']);
  assert.equal(flowRegistry.normalizeFlowId('kiro'), 'kiro');
  assert.equal(flowRegistry.normalizeFlowId('unknown'), 'openai');
  assert.equal(flowRegistry.getFlowLabel('openai'), 'Codex / OpenAI');
  assert.equal(flowRegistry.normalizeTargetId('openai', 'sub2api'), 'sub2api');
  assert.equal(flowRegistry.normalizeTargetId('kiro', 'anything-else'), 'kiro-rs');
  assert.deepEqual(
    flowRegistry.getVisibleGroupIds('openai', 'cpa'),
    ['openai-plus', 'openai-phone', 'openai-oauth', 'openai-step6', 'openai-target-cpa', 'service-account', 'service-email', 'service-proxy']
  );
  assert.deepEqual(
    flowRegistry.getVisibleGroupIds('kiro', 'kiro-rs'),
    ['kiro-runtime-status', 'kiro-target-kiro-rs', 'service-account', 'service-email', 'service-proxy']
  );
  assert.deepEqual(
    flowRegistry.getTargetOptions('openai').map((entry) => entry.id),
    ['cpa', 'sub2api', 'codex2api']
  );
  assert.deepEqual(
    flowRegistry.getSettingsGroupDefinition('openai-plus')?.rowIds,
    [
      'row-plus-mode',
      'row-plus-account-access-strategy',
      'row-plus-payment-method',
      'row-plus-checkout-create-pre-wait',
      'row-plus-checkout-open-stable-wait',
      'row-plus-checkout-conversion-proxy',
      'row-plus-checkout-conversion-proxy-test',
    ]
  );
  assert.equal(flowRegistry.getPublicationTargetDefinition('kiro', 'kiro-rs')?.label, 'kiro.rs');
  assert.equal(flowRegistry.getFlowCapabilities('openai').supportsAccountContribution, true);
  assert.equal(flowRegistry.getFlowCapabilities('kiro').supportsAccountContribution, true);
  assert.deepEqual(
    flowRegistry.getFlowCapabilities('openai').contributionAdapterIds,
    ['openai-oauth', 'openai-codex-file', 'openai-sub2api-file']
  );
  assert.deepEqual(
    flowRegistry.getFlowCapabilities('kiro').contributionAdapterIds,
    ['kiro-builder-id']
  );
});

test('settings schema normalizes view input into canonical nested namespaces', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();

  const normalized = schema.normalizeSettingsState({
    activeFlowId: 'kiro',
    panelMode: 'sub2api',
    mailProvider: 'hotmail',
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    customPassword: 'SharedSecret123!',
    plusAccountAccessStrategy: 'sub2api_codex_session',
    kiroRsUrl: 'https://kiro.example.com/admin',
    kiroRsKey: 'secret-key',
    stepExecutionRangeByFlow: {
      openai: { enabled: true, fromStep: 2, toStep: 9 },
      kiro: { enabled: true, fromStep: 1, toStep: 9 },
    },
  });

  assert.equal(normalized.activeFlowId, 'kiro');
  assert.equal(normalized.services.email.provider, 'hotmail');
  assert.equal(normalized.services.proxy.enabled, true);
  assert.equal(normalized.services.account.customPassword, 'SharedSecret123!');
  assert.equal(normalized.flows.openai.integrationTargetId, 'sub2api');
  assert.equal(normalized.flows.openai.plus.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(normalized.flows.kiro.targetId, 'kiro-rs');
  assert.equal(normalized.flows.kiro.targets['kiro-rs'].baseUrl, 'https://kiro.example.com/admin');
  assert.equal(normalized.flows.kiro.targets['kiro-rs'].apiKey, 'secret-key');
  assert.deepEqual(normalized.flows.kiro.autoRun.stepExecutionRange, {
    enabled: true,
    fromStep: 1,
    toStep: 9,
  });
});

test('settings schema lets explicit flat step range override stale canonical range', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const oldState = schema.normalizeSettingsState({
    activeFlowId: 'openai',
    stepExecutionRangeByFlow: {
      openai: { enabled: true, fromStep: 3, toStep: 6 },
    },
  });

  const normalized = schema.normalizeSettingsState({
    settingsState: oldState,
    stepExecutionRangeByFlow: {
      openai: { enabled: false, fromStep: 3, toStep: 6 },
    },
  });

  assert.deepEqual(normalized.flows.openai.autoRun.stepExecutionRange, {
    enabled: false,
    fromStep: 3,
    toStep: 6,
  });
});

test('settings schema can project canonical state into a read view without legacy rebuild helpers', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    activeFlowId: 'kiro',
    kiroTargetId: 'kiro-rs',
    kiroRsUrl: 'https://kiro.example.com/admin',
    kiroRsKey: 'key-123',
    plusAccountAccessStrategy: 'sub2api_codex_session',
  });
  const view = schema.buildSettingsView(normalized);

  assert.equal(view.activeFlowId, 'kiro');
  assert.equal(view.openaiIntegrationTargetId, 'cpa');
  assert.equal(view.kiroTargetId, 'kiro-rs');
  assert.equal(view.panelMode, 'cpa');
  assert.equal(view.kiroRsUrl, 'https://kiro.example.com/admin');
  assert.equal(view.kiroRsKey, 'key-123');
  assert.equal(view.plusAccountAccessStrategy, 'sub2api_codex_session');
  assert.equal(view.settingsSchemaVersion, 4);
  assert.equal(view.settingsState.activeFlowId, 'kiro');
});

test('settings schema preserves CPA session strategy in canonical state and read view', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    plusAccountAccessStrategy: 'cpa_codex_session',
  });
  const view = schema.buildSettingsView(normalized);

  assert.equal(normalized.flows.openai.plus.plusAccountAccessStrategy, 'cpa_codex_session');
  assert.equal(view.plusAccountAccessStrategy, 'cpa_codex_session');
});

test('settings schema preserves Plus checkout conversion proxy in canonical state and read view', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxyUrl: ' socks5h://user:pass@proxy.example:1080 ',
    plusCheckoutConversionProxy711Region: ' us ',
  });
  const view = schema.buildSettingsView(normalized);

  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxySource, '711proxy_pool');
  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxy711Region, 'US');
  assert.equal(view.plusCheckoutConversionProxySource, '711proxy_pool');
  assert.equal(view.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(view.plusCheckoutConversionProxy711Region, 'US');
});

test('settings schema preserves direct Plus checkout conversion proxy source in canonical state and read view', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    plusCheckoutConversionProxySource: 'direct',
    plusCheckoutConversionProxyUrl: ' socks5h://user:pass@proxy.example:1080 ',
    plusCheckoutConversionProxy711Region: ' us ',
  });
  const view = schema.buildSettingsView(normalized);

  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxySource, 'direct');
  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxyUrl, 'socks5h://user:pass@proxy.example:1080');
  assert.equal(normalized.flows.openai.plus.plusCheckoutConversionProxy711Region, 'US');
  assert.equal(view.plusCheckoutConversionProxySource, 'direct');
});

test('settings schema preserves Plus checkout wait settings in canonical state and read view', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    plusCheckoutCreatePreWaitSeconds: ' 15.9 ',
    plusCheckoutOpenStableWaitSeconds: ' 28.4 ',
  });
  const view = schema.buildSettingsView(normalized);

  assert.equal(normalized.flows.openai.plus.plusCheckoutCreatePreWaitSeconds, 15);
  assert.equal(normalized.flows.openai.plus.plusCheckoutOpenStableWaitSeconds, 28);
  assert.equal(view.plusCheckoutCreatePreWaitSeconds, 15);
  assert.equal(view.plusCheckoutOpenStableWaitSeconds, 28);
});

test('settings schema preserves normalized PayPal generated profile in canonical state and read view', () => {
  const { settingsSchema } = loadApis();
  const schema = settingsSchema.createSettingsSchema();
  const normalized = schema.normalizeSettingsState({
    paypalGeneratedProfile: {
      email: ' user@example.com ',
      phone: ' +1 555 0100 ',
      password: ' Secret123! ',
      firstName: ' Ada ',
      lastName: ' Lovelace ',
      birthday: ' 2001-02-03 ',
      countryCode: ' jp ',
      address1: ' 1 Marunouchi ',
      city: ' Chiyoda ',
      region: ' Tokyo ',
      postalCode: ' 100-0005 ',
      generatedFromCountry: ' de ',
      generatedAt: '12345',
      extra: 'ignored',
    },
  });
  const view = schema.buildSettingsView(normalized);

  const expected = {
    email: 'user@example.com',
    phone: '+1 555 0100',
    password: 'Secret123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
    birthday: '2001-02-03',
    countryCode: 'JP',
    address1: '1 Marunouchi',
    city: 'Chiyoda',
    region: 'Tokyo',
    postalCode: '100-0005',
    generatedFromCountry: 'DE',
    generatedAt: 12345,
  };

  assert.deepEqual(normalized.flows.openai.plus.paypalGeneratedProfile, expected);
  assert.deepEqual(view.paypalGeneratedProfile, expected);
  assert.deepEqual(view.settingsState.flows.openai.plus.paypalGeneratedProfile, expected);
});
