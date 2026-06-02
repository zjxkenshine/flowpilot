const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const sidepanelSource = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');
const sidepanelHtml = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');

function extractFunction(name) {
  const asyncStart = sidepanelSource.indexOf(`async function ${name}`);
  const normalStart = sidepanelSource.indexOf(`function ${name}`);
  const start = asyncStart !== -1
    ? asyncStart
    : normalStart;
  if (start === -1) {
    throw new Error(`Function ${name} not found`);
  }
  const signatureEnd = sidepanelSource.indexOf(')', start);
  const bodyStart = sidepanelSource.indexOf('{', signatureEnd);
  let depth = 0;
  let end = bodyStart;
  for (; end < sidepanelSource.length; end += 1) {
    const char = sidepanelSource[end];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }
  return sidepanelSource.slice(start, end);
}

function extractLastFunction(name) {
  const asyncStart = sidepanelSource.lastIndexOf(`async function ${name}`);
  const normalStart = sidepanelSource.lastIndexOf(`function ${name}`);
  const asyncInnerFunctionStart = asyncStart >= 0 ? asyncStart + 'async '.length : -1;
  const start = asyncStart >= 0 && normalStart === asyncInnerFunctionStart
    ? asyncStart
    : (asyncStart > normalStart ? asyncStart : normalStart);
  if (start === -1) {
    throw new Error(`Function ${name} not found`);
  }
  const signatureEnd = sidepanelSource.indexOf(')', start);
  const bodyStart = sidepanelSource.indexOf('{', signatureEnd);
  let depth = 0;
  let end = bodyStart;
  for (; end < sidepanelSource.length; end += 1) {
    const char = sidepanelSource[end];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }
  return sidepanelSource.slice(start, end);
}

test('sidepanel step definitions keep the selected Plus payment method', () => {
  const bundle = [
    extractFunction('normalizeSignupMethod'),
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('buildStepDefinitionSignature'),
    extractFunction('getStepDefinitionsForMode'),
    extractFunction('rebuildStepDefinitionState'),
    extractFunction('syncStepDefinitionsForMode'),
  ].join('\n');

  const api = new Function(`
const calls = [];
const window = {
  MultiPageStepDefinitions: {
    getSteps(options) {
      calls.push({ type: 'getSteps', options });
      return [{ id: options.plusPaymentMethod === 'gopay' ? 7 : 6, order: 1 }];
    },
  },
};
let currentPlusModeEnabled = false;
let currentPhonePlusModeEnabled = false;
let currentPlusPaymentMethod = 'paypal';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
let currentPlusAccountAccessStrategy = DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY;
let currentSignupMethod = 'email';
let currentPhoneSignupReloginAfterBindEmailEnabled = false;
let currentStepDefinitionSignature = '';
const DEFAULT_SIGNUP_METHOD = 'email';
let stepDefinitions = [];
let STEP_IDS = [];
let STEP_DEFAULT_STATUSES = {};
let SKIPPABLE_STEPS = new Set();
function renderStepsList() {
  calls.push({ type: 'render', stepIds: [...STEP_IDS] });
}
${bundle}
return {
  calls,
  syncStepDefinitionsForMode,
  getCurrentPlusPaymentMethod: () => currentPlusPaymentMethod,
  getStepIds: () => [...STEP_IDS],
};
`)();

  api.syncStepDefinitionsForMode(true, 'gopay', { render: true });

  assert.equal(api.getCurrentPlusPaymentMethod(), 'gopay');
  assert.deepEqual(api.getStepIds(), [7]);
  assert.deepEqual(api.calls[0], {
    type: 'getSteps',
    options: { activeFlowId: 'openai', plusModeEnabled: true, phonePlusModeEnabled: false, plusPaymentMethod: 'gopay', plusHostedCheckoutIsFinalStep: true, plusAccountAccessStrategy: 'oauth', signupMethod: 'email', phoneSignupReloginAfterBindEmailEnabled: false, accountContributionEnabled: false },
  });
  assert.deepEqual(api.calls[1], { type: 'render', stepIds: [7] });
});

test('sidepanel normalizeSignupMethod stays independent from signup constants during bootstrap', () => {
  const source = extractFunction('normalizeSignupMethod');
  assert.doesNotMatch(source, /SIGNUP_METHOD_(PHONE|EMAIL)/);
});

test('sidepanel initializes latestState before bootstrapping shared step definitions', () => {
  const latestStateIndex = sidepanelSource.indexOf('let latestState = null;');
  const bootstrapIndex = sidepanelSource.indexOf('let stepDefinitions = getStepDefinitionsForMode(false, {');

  assert.notEqual(latestStateIndex, -1);
  assert.notEqual(bootstrapIndex, -1);
  assert.ok(latestStateIndex < bootstrapIndex);
});

test('sidepanel signup method UI syncs shared step definitions with the selected signup method', () => {
  const source = extractFunction('updateSignupMethodUI');
  assert.match(source, /syncStepDefinitionsForMode\(/);
  assert.match(source, /signupMethod:\s*selectedMethod/);
});

test('sidepanel applies restored signup method when rebuilding shared step definitions on load', () => {
  const source = extractFunction('applySettingsState');
  assert.match(source, /resolveStepDefinitionCapabilityState\(state/);
  assert.match(source, /signupMethod:\s*stepDefinitionState\.signupMethod/);
});

test('sidepanel Plus UI hides PayPal account selector while GoPay is selected', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'gopay' };
let currentPlusPaymentMethod = 'paypal';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'gopay', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const rowPayPalAccount = { style: { display: '' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return { updatePlusModeUI, selectPlusPaymentMethod, rowPayPalAccount };
`)();

  api.updatePlusModeUI();

  assert.equal(api.selectPlusPaymentMethod.style.display, '');
  assert.equal(api.rowPayPalAccount.style.display, 'none');

  api.selectPlusPaymentMethod.value = 'paypal';
  api.updatePlusModeUI();
  assert.equal(api.rowPayPalAccount.style.display, 'none');
});

test('sidepanel Plus UI separates PayPal account mode from PayPal no-card binding mode', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'paypal-hosted' };
let currentPlusPaymentMethod = 'paypal-hosted';
let currentPlusAccountAccessStrategy = 'oauth';
let hostedSmsPoolExpanded = false;
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'paypal-hosted', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const rowPayPalAccount = { style: { display: '' } };
const rowHostedCheckoutVerificationUrl = { style: { display: 'none' } };
const rowHostedCheckoutManualFetch = { style: { display: 'none' } };
const rowHostedCheckoutSecurityChallenge = { style: { display: 'none' } };
const rowHostedCheckoutVerificationPopupDelay = { style: { display: 'none' } };
const rowHostedCheckoutPhone = { style: { display: 'none' } };
const rowHostedCheckoutSmsPool = { style: { display: 'none' } };
const rowPlusHostedCheckoutOauthDelay = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return {
  updatePlusModeUI,
  selectPlusPaymentMethod,
  rowPayPalAccount,
  plusPaymentMethodCaption,
  rows: { rowHostedCheckoutVerificationUrl, rowHostedCheckoutManualFetch, rowHostedCheckoutSecurityChallenge, rowHostedCheckoutVerificationPopupDelay, rowHostedCheckoutPhone, rowHostedCheckoutSmsPool, rowPlusHostedCheckoutOauthDelay },
};
`)();

  api.updatePlusModeUI();

  assert.equal(api.rowPayPalAccount.style.display, 'none');
  assert.equal(api.rows.rowHostedCheckoutVerificationUrl.style.display, '');
  assert.equal(api.rows.rowHostedCheckoutSecurityChallenge.style.display, '');
  assert.equal(api.rows.rowHostedCheckoutPhone.style.display, '');
  assert.equal(api.rows.rowPlusHostedCheckoutOauthDelay.style.display, '');
  assert.match(api.plusPaymentMethodCaption.textContent, /无卡直绑/);

  api.selectPlusPaymentMethod.value = 'paypal';
  api.updatePlusModeUI();

  assert.equal(api.rowPayPalAccount.style.display, 'none');
  assert.equal(api.rows.rowHostedCheckoutVerificationUrl.style.display, '');
  assert.equal(api.rows.rowHostedCheckoutSecurityChallenge.style.display, '');
  assert.equal(api.rows.rowHostedCheckoutPhone.style.display, '');
  assert.equal(api.rows.rowPlusHostedCheckoutOauthDelay.style.display, '');
  assert.match(api.plusPaymentMethodCaption.textContent, /自动闭环|Hosted/);
});

test('sidepanel PayPal hosted security challenge toggle defaults off and syncs through settings', () => {
  const toggleMatch = sidepanelHtml.match(
    /<input[^>]+id="input-hosted-checkout-security-challenge-enabled"[^>]*>/i
  );
  assert.ok(toggleMatch);
  assert.doesNotMatch(toggleMatch[0], /\bchecked\b/i);
  assert.match(sidepanelHtml, /row-hosted-checkout-security-challenge/);

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /hostedCheckoutSecurityChallengeEnabled:/);
  assert.match(collectSource, /Boolean\(inputHostedCheckoutSecurityChallengeEnabled\.checked\)/);
  assert.match(collectSource, /Boolean\(latestState\?\.hostedCheckoutSecurityChallengeEnabled\)/);

  const applySource = extractFunction('applySettingsState');
  assert.match(
    applySource,
    /inputHostedCheckoutSecurityChallengeEnabled\.checked\s*=\s*Boolean\(state\?\.hostedCheckoutSecurityChallengeEnabled\)/
  );

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 3000);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutSecurityChallengeEnabled !== undefined/);
  assert.match(
    dataUpdatedSnippet,
    /inputHostedCheckoutSecurityChallengeEnabled\.checked\s*=\s*Boolean\(message\.payload\.hostedCheckoutSecurityChallengeEnabled\)/
  );
});

test('sidepanel Plus verification failure strategy renders and syncs through settings', () => {
  assert.match(sidepanelHtml, /id="row-plus-verification-failure-strategy"/);
  assert.match(sidepanelHtml, /id="select-plus-checkout-verification-failure-strategy"/);
  assert.match(sidepanelHtml, /<option value="continue">继续<\/option>/);
  assert.match(sidepanelHtml, /<option value="retry">重试<\/option>/);

  const normalizeSource = extractFunction('normalizePlusCheckoutVerificationFailureStrategy');
  const normalize = new Function(`
const DEFAULT_PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY = 'continue';
${normalizeSource}
return normalizePlusCheckoutVerificationFailureStrategy;
`)();
  assert.equal(normalize('retry'), 'retry');
  assert.equal(normalize('bad'), 'continue');

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /plusCheckoutVerificationFailureStrategy:/);
  assert.match(collectSource, /selectPlusCheckoutVerificationFailureStrategy\.value/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /selectPlusCheckoutVerificationFailureStrategy\.value\s*=\s*normalizePlusCheckoutVerificationFailureStrategy/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 12000);
  assert.match(dataUpdatedSnippet, /message\.payload\.plusCheckoutVerificationFailureStrategy !== undefined/);
  assert.match(dataUpdatedSnippet, /selectPlusCheckoutVerificationFailureStrategy\.value\s*=\s*normalizePlusCheckoutVerificationFailureStrategy/);
});

test('sidepanel Plus account type payment control renders and syncs through settings', () => {
  assert.match(sidepanelHtml, /id="row-plus-account-type-payment-control"/);
  assert.match(sidepanelHtml, /id="input-plus-account-type-payment-control-enabled"/);
  assert.match(sidepanelHtml, /账号类型控制/);
  assert.match(sidepanelHtml, /开启时仅免费账号进入 Plus；关闭时忽略账号类型/);

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /plusAccountTypePaymentControlEnabled:/);
  assert.match(collectSource, /inputPlusAccountTypePaymentControlEnabled\.checked/);
  assert.match(collectSource, /latestState\?\.plusAccountTypePaymentControlEnabled !== false/);

  const applySource = extractFunction('applySettingsState');
  assert.match(
    applySource,
    /inputPlusAccountTypePaymentControlEnabled\.checked\s*=\s*state\?\.plusAccountTypePaymentControlEnabled !== false/
  );

  const updateModeSource = extractFunction('updatePlusModeUI');
  assert.match(updateModeSource, /rowPlusAccountTypePaymentControl/);
  assert.match(updateModeSource, /rowPlusAccountTypePaymentControl\.style\.display\s*=\s*enabled\s*\?/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 18000);
  assert.match(dataUpdatedSnippet, /message\.payload\.plusAccountTypePaymentControlEnabled !== undefined/);
  assert.match(
    dataUpdatedSnippet,
    /inputPlusAccountTypePaymentControlEnabled\.checked\s*=\s*message\.payload\.plusAccountTypePaymentControlEnabled !== false/
  );
});

test('sidepanel Plus Check allowed regions render and sync through settings', () => {
  assert.match(sidepanelHtml, /id="row-plus-check-allowed-regions"/);
  assert.match(sidepanelHtml, /PlusCheck 地区/);
  assert.match(sidepanelHtml, /不选=全部地区/);
  ['KZ', 'BR', 'JP', 'NP', 'IQ', 'US'].forEach((region) => {
    assert.match(sidepanelHtml, new RegExp(`data-plus-check-region="${region}"`));
  });

  const normalizeSource = [
    extractFunction('normalizePlusCheckAllowedRegionCodeValue'),
    extractFunction('normalizePlusCheckAllowedRegionsValue'),
  ].join('\n');
  const normalize = new Function(`
const PLUS_CHECK_ALLOWED_REGION_OPTIONS = Object.freeze(['KZ', 'BR', 'JP', 'NP', 'IQ', 'US']);
${normalizeSource}
return normalizePlusCheckAllowedRegionsValue;
`)();
  assert.deepEqual(normalize(['jp', 'XX', 'u-s', 'Brazil [BR]', 'JP']), ['BR', 'JP', 'US']);
  assert.deepEqual(normalize('us, np; bad | iq'), ['NP', 'IQ', 'US']);

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /plusCheckAllowedRegions:/);
  assert.match(collectSource, /getSelectedPlusCheckAllowedRegions\(\)/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /syncPlusCheckAllowedRegionsControl\(state\?\.plusCheckAllowedRegions/);

  const updateModeSource = extractFunction('updatePlusModeUI');
  assert.match(updateModeSource, /rowPlusCheckAllowedRegions/);
  assert.match(updateModeSource, /rowPlusCheckAllowedRegions\.style\.display\s*=\s*enabled\s*\?/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 16000);
  assert.match(dataUpdatedSnippet, /message\.payload\.plusCheckAllowedRegions !== undefined/);
  assert.match(dataUpdatedSnippet, /syncPlusCheckAllowedRegionsControl\(message\.payload\.plusCheckAllowedRegions\)/);
});

test('sidepanel PayPal hosted sms pool max uses renders and syncs through settings', () => {
  const inputMatch = sidepanelHtml.match(
    /<input[^>]+id="input-hosted-checkout-sms-pool-max-uses"[^>]*>/i
  );
  assert.ok(inputMatch);
  assert.match(inputMatch[0], /\bvalue="3"/);
  assert.match(inputMatch[0], /\bmin="1"/);
  assert.match(inputMatch[0], /\bmax="99"/);

  assert.match(sidepanelSource, /const DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES = 3/);
  assert.match(sidepanelSource, /const inputHostedCheckoutSmsPoolMaxUses = document\.getElementById\('input-hosted-checkout-sms-pool-max-uses'\)/);

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /hostedCheckoutSmsPoolMaxUses:/);
  assert.match(collectSource, /normalizeHostedCheckoutSmsPoolMaxUsesValue\(inputHostedCheckoutSmsPoolMaxUses\.value/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /inputHostedCheckoutSmsPoolMaxUses\.value\s*=\s*String/);
  assert.match(applySource, /normalizeHostedCheckoutSmsPoolMaxUsesValue\(state\?\.hostedCheckoutSmsPoolMaxUses/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 5000);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutSmsPoolMaxUses !== undefined/);
  assert.match(dataUpdatedSnippet, /normalizeHostedCheckoutSmsPoolMaxUsesValue\(message\.payload\.hostedCheckoutSmsPoolMaxUses/);
});

test('sidepanel PayPal hosted sms source selector renders and syncs through settings', () => {
  assert.match(sidepanelHtml, /id="row-hosted-checkout-sms-source"/);
  assert.match(sidepanelHtml, /id="select-hosted-checkout-sms-source"/);
  assert.match(sidepanelHtml, /id="row-hosted-checkout-hero-sms-paypal-settings"/);
  assert.match(sidepanelHtml, /id="input-hosted-checkout-hero-sms-paypal-min-price"/);
  assert.match(sidepanelHtml, /id="input-hosted-checkout-hero-sms-paypal-max-price"/);
  assert.match(sidepanelHtml, /id="input-hosted-checkout-hero-sms-paypal-operator-order"/);
  assert.match(sidepanelHtml, /<option value="hero_sms_paypal_br">HeroSMS（PayPal\/BR）<\/option>/);
  assert.match(sidepanelHtml, /<option value="fixed_pool">固定接码池（默认）<\/option>/);
  assert.match(sidepanelHtml, /<option value="phone_sms">跟随手机接码配置<\/option>/);

  assert.match(sidepanelHtml, /PayPal[^<]*接码设置/);

  const normalizeSource = extractFunction('normalizeHostedCheckoutSmsSourceValue');
  const normalize = new Function(`
const HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL = 'fixed_pool';
const HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS = 'phone_sms';
const HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR = 'hero_sms_paypal_br';
${normalizeSource}
return normalizeHostedCheckoutSmsSourceValue;
`)();
  assert.equal(normalize(undefined), 'fixed_pool');
  assert.equal(normalize('fixed-pool'), 'fixed_pool');
  assert.equal(normalize('phone-sms'), 'phone_sms');
  assert.equal(normalize('hero-sms-paypal-br'), 'hero_sms_paypal_br');
  assert.equal(normalize('hero_sms_paypal_br'), 'hero_sms_paypal_br');
  assert.equal(normalize('bad'), 'fixed_pool');

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /hostedCheckoutSmsSource:/);
  assert.match(collectSource, /selectHostedCheckoutSmsSource\.value/);
  assert.match(collectSource, /hostedCheckoutHeroSmsPayPalMinPrice:/);
  assert.match(collectSource, /hostedCheckoutHeroSmsPayPalMaxPrice:/);
  assert.match(collectSource, /hostedCheckoutHeroSmsPayPalOperatorOrder:/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /selectHostedCheckoutSmsSource\.value\s*=\s*normalizeHostedCheckoutSmsSourceValue/);
  assert.match(applySource, /inputHostedCheckoutHeroSmsPayPalMinPrice\.value\s*=\s*normalizeHostedCheckoutHeroSmsPayPalPriceValue/);
  assert.match(applySource, /inputHostedCheckoutHeroSmsPayPalMaxPrice\.value\s*=\s*normalizeHostedCheckoutHeroSmsPayPalPriceValue/);
  assert.match(applySource, /inputHostedCheckoutHeroSmsPayPalOperatorOrder\.value\s*=\s*normalizeHostedCheckoutHeroSmsPayPalOperatorOrderValue/);

  const updateModeSource = extractFunction('updatePlusModeUI');
  assert.match(updateModeSource, /hostedCheckoutSmsSource/);
  assert.match(updateModeSource, /hostedCheckoutFixedSmsRowsVisible/);
  assert.match(updateModeSource, /hostedCheckoutHeroSmsPayPalRowsVisible/);
  assert.match(updateModeSource, /rowHostedCheckoutHeroSmsPayPalSettings/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 12000);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutSmsSource !== undefined/);
  assert.match(dataUpdatedSnippet, /selectHostedCheckoutSmsSource\.value\s*=\s*normalizeHostedCheckoutSmsSourceValue/);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutHeroSmsPayPalMinPrice !== undefined/);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutHeroSmsPayPalMaxPrice !== undefined/);
  assert.match(dataUpdatedSnippet, /message\.payload\.hostedCheckoutHeroSmsPayPalOperatorOrder !== undefined/);
});

test('sidepanel checkout region dropdown renders and syncs through settings', () => {
  assert.match(sidepanelHtml, /id="row-plus-checkout-regional-checkout"/);
  assert.match(sidepanelHtml, /id="select-plus-checkout-region-code"/);
  assert.match(sidepanelHtml, /<option value="auto">跟随支付出口<\/option>/);
  assert.match(sidepanelHtml, /<option value="KZ">KZ \/ KZT<\/option>/);
  assert.match(sidepanelHtml, /<option value="NP">NP \/ NPR<\/option>/);
  assert.match(sidepanelHtml, /<option value="IQ">IQ \/ IQD<\/option>/);

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /plusCheckoutRegionCode:/);
  assert.match(collectSource, /plusCheckoutRegionalCheckoutEnabled:/);
  assert.match(collectSource, /selectPlusCheckoutRegionCode\.value/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /selectPlusCheckoutRegionCode\.value\s*=\s*normalizePlusCheckoutRegionCodeValue/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 16000);
  assert.match(dataUpdatedSnippet, /message\.payload\.plusCheckoutRegionCode !== undefined/);
  assert.match(dataUpdatedSnippet, /message\.payload\.plusCheckoutRegionalCheckoutEnabled !== undefined/);
});

test('sidepanel PayPal profile country selector renders and syncs through settings', () => {
  assert.match(sidepanelHtml, /id="row-paypal-profile-country"/);
  assert.match(sidepanelHtml, /id="select-paypal-profile-country-code"/);
  assert.match(sidepanelHtml, /<option value="">跟随 IP 出口<\/option>/);
  assert.match(sidepanelHtml, /<option value="US" selected>US<\/option>/);
  assert.match(sidepanelHtml, /<option value="JP">JP<\/option>/);
  assert.match(sidepanelHtml, /<option value="BR">BR<\/option>/);

  const normalizeSource = extractFunction('normalizePayPalProfileCountryCodeValue');
  const normalize = new Function(`${normalizeSource}; return normalizePayPalProfileCountryCodeValue;`)();
  assert.equal(normalize(undefined), 'US');
  assert.equal(normalize(''), '');
  assert.equal(normalize('jp'), 'JP');
  assert.equal(normalize('br'), 'BR');
  assert.equal(normalize('de'), 'US');

  const collectSource = extractFunction('collectSettingsPayload');
  assert.match(collectSource, /paypalProfileCountryCode:/);
  assert.match(collectSource, /selectPayPalProfileCountryCode\.value/);

  const applySource = extractFunction('applySettingsState');
  assert.match(applySource, /selectPayPalProfileCountryCode\.value\s*=\s*normalizePayPalProfileCountryCodeValue\(state\?\.paypalProfileCountryCode\)/);

  const dataUpdatedStart = sidepanelSource.indexOf("case 'DATA_UPDATED':");
  assert.notEqual(dataUpdatedStart, -1);
  const dataUpdatedSnippet = sidepanelSource.slice(dataUpdatedStart, dataUpdatedStart + 12000);
  assert.match(dataUpdatedSnippet, /message\.payload\.paypalProfileCountryCode !== undefined/);
  assert.match(dataUpdatedSnippet, /selectPayPalProfileCountryCode\.value\s*=\s*normalizePayPalProfileCountryCodeValue\(message\.payload\.paypalProfileCountryCode\)/);
});

test('sidepanel Plus UI restores traditional PayPal account mode when hosted final step is disabled', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'paypal', plusHostedCheckoutIsFinalStep: false };
let currentPlusPaymentMethod = 'paypal';
let currentPlusAccountAccessStrategy = 'oauth';
let hostedSmsPoolExpanded = false;
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'paypal', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const rowPayPalAccount = { style: { display: 'none' } };
const rowHostedCheckoutVerificationUrl = { style: { display: 'none' } };
const rowHostedCheckoutManualFetch = { style: { display: 'none' } };
const rowHostedCheckoutSecurityChallenge = { style: { display: 'none' } };
const rowHostedCheckoutVerificationPopupDelay = { style: { display: 'none' } };
const rowHostedCheckoutPhone = { style: { display: 'none' } };
const rowHostedCheckoutSmsPool = { style: { display: 'none' } };
const rowPlusHostedCheckoutOauthDelay = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return {
  updatePlusModeUI,
  rowPayPalAccount,
  plusPaymentMethodCaption,
  rows: { rowHostedCheckoutVerificationUrl, rowHostedCheckoutManualFetch, rowHostedCheckoutSecurityChallenge, rowHostedCheckoutVerificationPopupDelay, rowHostedCheckoutPhone, rowHostedCheckoutSmsPool, rowPlusHostedCheckoutOauthDelay },
};
`)();

  api.updatePlusModeUI();

  assert.equal(api.rowPayPalAccount.style.display, '');
  assert.equal(api.rows.rowHostedCheckoutVerificationUrl.style.display, 'none');
  assert.equal(api.rows.rowHostedCheckoutSecurityChallenge.style.display, 'none');
  assert.equal(api.rows.rowHostedCheckoutPhone.style.display, 'none');
  assert.equal(api.rows.rowPlusHostedCheckoutOauthDelay.style.display, 'none');
  assert.match(api.plusPaymentMethodCaption.textContent, /传统/);
});

test('sidepanel Plus UI shows PayPal profile generator only for PayPal payment modes', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'paypal' };
let currentPlusPaymentMethod = 'paypal';
let currentPlusAccountAccessStrategy = 'oauth';
let hostedSmsPoolExpanded = false;
let renderPayPalProfileCalls = 0;
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'paypal', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const rowPayPalAccount = { style: { display: 'none' } };
const rowPayPalProfileGenerator = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
function renderPayPalProfile() { renderPayPalProfileCalls += 1; }
${bundle}
return {
  updatePlusModeUI,
  inputPlusModeEnabled,
  selectPlusPaymentMethod,
  rowPayPalProfileGenerator,
  getRenderCalls: () => renderPayPalProfileCalls,
};
`)();

  api.updatePlusModeUI();
  assert.equal(api.rowPayPalProfileGenerator.style.display, '');
  assert.equal(api.getRenderCalls(), 1);

  api.selectPlusPaymentMethod.value = 'paypal-hosted';
  api.updatePlusModeUI();
  assert.equal(api.rowPayPalProfileGenerator.style.display, '');
  assert.equal(api.getRenderCalls(), 2);

  api.selectPlusPaymentMethod.value = 'gopay';
  api.updatePlusModeUI();
  assert.equal(api.rowPayPalProfileGenerator.style.display, 'none');
  assert.equal(api.getRenderCalls(), 2);

  api.selectPlusPaymentMethod.value = 'paypal';
  api.inputPlusModeEnabled.checked = false;
  api.updatePlusModeUI();
  assert.equal(api.rowPayPalProfileGenerator.style.display, 'none');
  assert.equal(api.getRenderCalls(), 2);
});

test('sidepanel Plus UI shows checkout conversion proxy in Plus and Phone Plus modes', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'paypal' };
let currentPlusPaymentMethod = 'paypal';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const inputPhonePlusModeEnabled = { checked: false };
const selectPlusPaymentMethod = { value: 'paypal', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const rowPlusPaymentMethod = { style: { display: 'none' } };
const rowPlusCheckoutCreatePreWait = { style: { display: 'none' } };
const rowPlusCheckoutOpenStableWait = { style: { display: 'none' } };
const rowPlusCheckoutConversionProxy = { style: { display: 'none' } };
const rowPlusCheckoutConversionProxyTest = { style: { display: 'none' } };
const rowPlusCheckoutConversionProxyRuntime = { style: { display: 'none' } };
const rowPayPalAccount = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return {
  updatePlusModeUI,
  inputPlusModeEnabled,
  inputPhonePlusModeEnabled,
  rows: { rowPlusCheckoutCreatePreWait, rowPlusCheckoutOpenStableWait, rowPlusCheckoutConversionProxy, rowPlusCheckoutConversionProxyTest, rowPlusCheckoutConversionProxyRuntime },
};
`)();

  api.updatePlusModeUI();
  assert.equal(api.rows.rowPlusCheckoutCreatePreWait.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutOpenStableWait.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxy.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyTest.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyRuntime.style.display, '');

  api.inputPlusModeEnabled.checked = false;
  api.inputPhonePlusModeEnabled.checked = true;
  api.updatePlusModeUI();
  assert.equal(api.rows.rowPlusCheckoutCreatePreWait.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutOpenStableWait.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxy.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyTest.style.display, '');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyRuntime.style.display, '');

  api.inputPhonePlusModeEnabled.checked = false;
  api.updatePlusModeUI();
  assert.equal(api.rows.rowPlusCheckoutCreatePreWait.style.display, 'none');
  assert.equal(api.rows.rowPlusCheckoutOpenStableWait.style.display, 'none');
  assert.equal(api.rows.rowPlusCheckoutConversionProxy.style.display, 'none');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyTest.style.display, 'none');
  assert.equal(api.rows.rowPlusCheckoutConversionProxyRuntime.style.display, 'none');
});

test('sidepanel renders manual checkout conversion proxy runtime status for active and draft states', () => {
  const bundle = [
    extractFunction('normalizePlusCheckoutConversionProxyUrlValue'),
    extractFunction('getPlusCheckoutConversionProxyManualSession'),
    extractFunction('renderPlusCheckoutConversionProxyRuntimeStatus'),
  ].join('\n');

  const api = new Function(`
let latestState = {
  plusCheckoutConversionProxyManualSession: null,
  plusCheckoutConversionProxyUrl: '',
};
const inputPlusCheckoutConversionProxy = { value: '' };
const displayPlusCheckoutConversionProxyRuntimeStatus = {
  textContent: '',
  title: '',
  classList: {
    active: new Set(),
    remove(...names) { names.forEach((name) => this.active.delete(name)); },
    add(name) { this.active.add(name); },
    has(name) { return this.active.has(name); },
  },
};
${bundle}
return {
  renderPlusCheckoutConversionProxyRuntimeStatus,
  inputPlusCheckoutConversionProxy,
  displayPlusCheckoutConversionProxyRuntimeStatus,
  setState(nextState) { latestState = { ...latestState, ...nextState }; },
  getText() { return displayPlusCheckoutConversionProxyRuntimeStatus.textContent; },
  hasClass(name) { return displayPlusCheckoutConversionProxyRuntimeStatus.classList.has(name); },
};
`)();

  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), '手动代理未开启');

  api.setState({
    plusCheckoutConversionProxyManualSession: {
      active: true,
      proxyUrl: 'http://proxy-a.example:8080',
      displayName: 'http://proxy-a.example:8080',
    },
  });
  api.inputPlusCheckoutConversionProxy.value = 'http://proxy-a.example:8080';
  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), '当前生效：http://proxy-a.example:8080');
  assert.equal(api.hasClass('state-active'), true);

  api.inputPlusCheckoutConversionProxy.value = 'socks5h://proxy-b.example:1080';
  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), '当前生效：http://proxy-a.example:8080；待切换：socks5h://proxy-b.example:1080');
  assert.equal(api.hasClass('state-pending'), true);
});

test('sidepanel renders direct checkout conversion proxy runtime status', () => {
  const bundle = [
    extractFunction('normalizePlusCheckoutConversionProxyUrlValue'),
    extractFunction('normalizePlusCheckoutConversionProxySourceValue'),
    extractFunction('getPlusCheckoutConversionProxyManualSession'),
    extractFunction('renderPlusCheckoutConversionProxyRuntimeStatus'),
  ].join('\n');

  const api = new Function(`
let latestState = {
  plusCheckoutConversionProxyManualSession: null,
  plusCheckoutConversionProxyUrl: '',
  plusCheckoutConversionProxySource: 'direct',
};
const inputPlusCheckoutConversionProxy = { value: '' };
const selectPlusCheckoutConversionProxySource = { value: 'direct' };
const plusCheckoutConversionProxySourceButtons = [];
function getSelectedPlusCheckoutConversionProxySource(state = latestState) {
  return normalizePlusCheckoutConversionProxySourceValue(selectPlusCheckoutConversionProxySource.value || state?.plusCheckoutConversionProxySource || 'manual');
}
function getCurrentPlusCheckoutConversionProxy711Region() { return ''; }
const displayPlusCheckoutConversionProxyRuntimeStatus = {
  textContent: '',
  title: '',
  classList: {
    active: new Set(),
    remove(...names) { names.forEach((name) => this.active.delete(name)); },
    add(name) { this.active.add(name); },
    has(name) { return this.active.has(name); },
  },
};
${bundle}
return {
  renderPlusCheckoutConversionProxyRuntimeStatus,
  setState(nextState) { latestState = { ...latestState, ...nextState }; },
  getText() { return displayPlusCheckoutConversionProxyRuntimeStatus.textContent; },
  hasClass(name) { return displayPlusCheckoutConversionProxyRuntimeStatus.classList.has(name); },
};
`)();

  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), '无代理模式未开启（支付转换相关域名直连）');

  api.setState({
    plusCheckoutConversionProxyManualSession: {
      active: true,
      source: 'direct',
      proxyUrl: '',
      displayName: '无代理模式',
    },
  });
  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), '当前生效：无代理模式');
  assert.equal(api.hasClass('state-active'), true);
});

test('sidepanel renders IP proxy checkout conversion proxy runtime status', () => {
  const bundle = [
    extractFunction('normalizePlusCheckoutConversionProxyUrlValue'),
    extractFunction('normalizePlusCheckoutConversionProxySourceValue'),
    extractFunction('getPlusCheckoutConversionProxyManualSession'),
    extractFunction('renderPlusCheckoutConversionProxyRuntimeStatus'),
  ].join('\n');

  const api = new Function(`
let latestState = {
  plusCheckoutConversionProxyManualSession: null,
  plusCheckoutConversionProxyUrl: '',
  plusCheckoutConversionProxySource: 'ip_proxy',
};
const inputPlusCheckoutConversionProxy = { value: '' };
const selectPlusCheckoutConversionProxySource = { value: 'ip_proxy' };
const plusCheckoutConversionProxySourceButtons = [];
function getSelectedPlusCheckoutConversionProxySource(state = latestState) {
  return normalizePlusCheckoutConversionProxySourceValue(selectPlusCheckoutConversionProxySource.value || state?.plusCheckoutConversionProxySource || 'manual');
}
function getCurrentPlusCheckoutConversionProxy711Region() { return ''; }
const displayPlusCheckoutConversionProxyRuntimeStatus = {
  textContent: '',
  title: '',
  classList: {
    active: new Set(),
    remove(...names) { names.forEach((name) => this.active.delete(name)); },
    add(name) { this.active.add(name); },
    has(name) { return this.active.has(name); },
  },
};
${bundle}
return {
  normalizePlusCheckoutConversionProxySourceValue,
  renderPlusCheckoutConversionProxyRuntimeStatus,
  getText() { return displayPlusCheckoutConversionProxyRuntimeStatus.textContent; },
};
`)();

  assert.equal(api.normalizePlusCheckoutConversionProxySourceValue('ip_proxy'), 'ip_proxy');
  api.renderPlusCheckoutConversionProxyRuntimeStatus();
  assert.equal(api.getText(), 'IP代理模式（沿用当前 IP 代理/当前网络环境）');
});

test('sidepanel shows checkout conversion proxy next button only for 711 pool mode', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusCheckoutConversionProxySourceValue'),
    extractFunction('syncPlusCheckoutConversionProxySourceControl'),
    extractFunction('getSelectedPlusCheckoutConversionProxySource'),
    extractFunction('setPlusCheckoutConversionProxyTestResult'),
    extractFunction('isPlusCheckoutCloudConversionEnabled'),
    extractFunction('updatePlusCheckoutConversionModeUi'),
  ].join('\n');

  const api = new Function(`
let latestState = {
  plusModeEnabled: true,
  plusPaymentMethod: 'paypal',
  plusCheckoutConversionProxySource: 'manual',
  plusCheckoutCloudConversionEnabled: false,
};
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'paypal' };
const inputPlusCheckoutCloudConversionEnabled = { checked: false };
const selectPlusCheckoutConversionProxySource = { value: 'manual', disabled: false, setAttribute(name, value) { this[name] = value; } };
const inputPlusCheckoutConversionProxy = { style: {}, disabled: false, readOnly: false, setAttribute(name, value) { this[name] = value; } };
const plusCheckoutConversionProxy711Shell = { style: {} };
const inputPlusCheckoutConversionProxy711Region = { disabled: false, readOnly: false, setAttribute(name, value) { this[name] = value; } };
const btnPlusCheckoutConversionProxyTest = { disabled: false, setAttribute(name, value) { this[name] = value; } };
const btnPlusCheckoutConversionProxySwitch = { disabled: false, title: '', setAttribute(name, value) { this[name] = value; } };
const btnPlusCheckoutConversionProxyNext = { style: {}, disabled: false, setAttribute(name, value) { this[name] = value; } };
const rowPlusCheckoutCloudConversionApiUrl = { style: {} };
const rowPlusCheckoutCloudConversionApiKey = { style: {} };
const inputPlusCheckoutCloudConversionApiUrl = { disabled: false };
const inputPlusCheckoutCloudConversionApiKey = { disabled: false };
const displayPlusCheckoutConversionProxyTestResult = {
  textContent: '',
  title: '',
  classList: { remove() {}, add() {} },
};
const plusCheckoutConversionProxySourceButtons = [];
${bundle}
return {
  updatePlusCheckoutConversionModeUi,
  selectPlusCheckoutConversionProxySource,
  inputPlusCheckoutConversionProxy,
  plusCheckoutConversionProxy711Shell,
  btnPlusCheckoutConversionProxySwitch,
  btnPlusCheckoutConversionProxyNext,
  getTestResult() { return displayPlusCheckoutConversionProxyTestResult.textContent; },
  getTestResultTitle() { return displayPlusCheckoutConversionProxyTestResult.title; },
  setSource(source) {
    selectPlusCheckoutConversionProxySource.value = source;
    latestState = { ...latestState, plusCheckoutConversionProxySource: source };
  },
  setCloud(enabled) { inputPlusCheckoutCloudConversionEnabled.checked = Boolean(enabled); },
};
`)();

  api.updatePlusCheckoutConversionModeUi();
  assert.equal(api.selectPlusCheckoutConversionProxySource.value, 'manual');
  assert.equal(api.inputPlusCheckoutConversionProxy.style.display, '');
  assert.equal(api.plusCheckoutConversionProxy711Shell.style.display, 'none');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.style.display, 'none');

  api.setSource('711proxy_pool');
  api.updatePlusCheckoutConversionModeUi();
  assert.equal(api.selectPlusCheckoutConversionProxySource.value, '711proxy_pool');
  assert.equal(api.inputPlusCheckoutConversionProxy.style.display, 'none');
  assert.equal(api.plusCheckoutConversionProxy711Shell.style.display, '');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.style.display, '');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.disabled, false);

  api.setSource('direct');
  api.updatePlusCheckoutConversionModeUi();
  assert.equal(api.selectPlusCheckoutConversionProxySource.value, 'direct');
  assert.equal(api.inputPlusCheckoutConversionProxy.style.display, 'none');
  assert.equal(api.plusCheckoutConversionProxy711Shell.style.display, 'none');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.style.display, 'none');

  api.setSource('ip_proxy');
  api.updatePlusCheckoutConversionModeUi();
  assert.equal(api.selectPlusCheckoutConversionProxySource.value, 'ip_proxy');
  assert.equal(api.inputPlusCheckoutConversionProxy.style.display, 'none');
  assert.equal(api.plusCheckoutConversionProxy711Shell.style.display, 'none');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.style.display, 'none');
  assert.equal(api.btnPlusCheckoutConversionProxySwitch.disabled, true);
  assert.equal(api.btnPlusCheckoutConversionProxySwitch['aria-disabled'], 'true');
  assert.equal(api.getTestResult(), 'IP代理模式');
  assert.match(api.getTestResultTitle(), /沿用当前 IP 代理/);

  api.setSource('711proxy_pool');
  api.setCloud(true);
  api.updatePlusCheckoutConversionModeUi();
  assert.equal(api.selectPlusCheckoutConversionProxySource.disabled, true);
  assert.equal(api.btnPlusCheckoutConversionProxyNext.style.display, 'none');
  assert.equal(api.btnPlusCheckoutConversionProxyNext.disabled, true);
});

test('sidepanel checkout conversion proxy next button sends 711 message and syncs state', async () => {
  const bundle = [
    extractFunction('normalizePlusCheckoutConversionProxySourceValue'),
    extractFunction('normalizePlusCheckoutConversionProxy711RegionDraftValue'),
    extractFunction('normalizePlusCheckoutConversionProxy711RegionValue'),
    extractFunction('getPlusCheckoutConversionProxyManualSession'),
    extractFunction('getSelectedPlusCheckoutConversionProxySource'),
    extractFunction('getCurrentPlusCheckoutConversionProxy711Region'),
    extractFunction('setPlusCheckoutConversionProxyTestResult'),
    extractFunction('formatPlusCheckoutConversionProxyExitCheckTime'),
    extractFunction('renderPlusCheckoutConversionProxyExitCheck'),
    extractFunction('setPlusCheckoutConversionProxyButtonsBusy'),
    extractFunction('renderPlusCheckoutConversionProxyRuntimeStatus'),
    extractFunction('handlePlusCheckoutConversionProxyNext711'),
  ].join('\n');

  const api = new Function(`
const messages = [];
const toasts = [];
let latestState = {
  plusCheckoutConversionProxySource: '711proxy_pool',
  plusCheckoutConversionProxy711Region: 'US',
  plusCheckoutConversionProxyManualSession: null,
};
const selectPlusCheckoutConversionProxySource = { value: '711proxy_pool' };
const plusCheckoutConversionProxySourceButtons = [];
const inputPlusCheckoutConversionProxy711Region = { value: 'US' };
const inputPlusCheckoutConversionProxy = { value: '' };
const btnPlusCheckoutConversionProxyTest = { disabled: false, textContent: '测试代理' };
const btnPlusCheckoutConversionProxySwitch = { disabled: false, textContent: '切换代理' };
const btnPlusCheckoutConversionProxyNext = { disabled: false, textContent: '下一个' };
const btnPlusCheckoutConversionProxyCancel = { disabled: false, textContent: '取消代理' };
const displayPlusCheckoutConversionProxyTestResult = {
  textContent: '',
  title: '',
  classList: { remove() {}, add() {} },
};
const displayPlusCheckoutConversionProxyRuntimeStatus = {
  textContent: '',
  title: '',
  classList: { remove() {}, add() {} },
};
const displayPlusCheckoutConversionProxyExitCheck = {
  textContent: '',
  title: '',
  classes: new Set(),
  classList: {
    remove(...items) { items.forEach((item) => displayPlusCheckoutConversionProxyExitCheck.classes.delete(item)); },
    add(item) { displayPlusCheckoutConversionProxyExitCheck.classes.add(item); },
  },
};
function normalizePlusCheckoutConversionProxyUrlValue(value = '') { return String(value || '').trim(); }
function buildCurrentIpProxyActionStateOverride() { return { ipProxyAutoRefreshPoolOnExhausted: true }; }
function syncLatestState(patch) { latestState = { ...latestState, ...patch }; }
function showToast(message, type) { toasts.push({ message, type }); }
async function sendRuntimeMessageWithTimeout(message) {
  messages.push(message);
  return {
    ok: true,
    switched: true,
    exitChanged: true,
    displayName: 'http://proxy-b.example:8002',
    plusCheckoutConversionProxySource: '711proxy_pool',
    plusCheckoutConversionProxy711Region: 'US',
    plusCheckoutConversionProxyManualSession: {
      active: true,
      source: '711proxy_pool',
      displayName: 'http://proxy-b.example:8002',
      requestedRegion: 'US',
    },
    plusCheckoutConversionProxyExitCheck: {
      status: 'success',
      exitIp: '203.0.113.20',
      exitRegion: 'US',
      exitSource: 'page_context',
      checkedAt: 1700000000000,
    },
  };
}
${bundle}
return {
  messages,
  toasts,
  handlePlusCheckoutConversionProxyNext711,
  getState: () => latestState,
  getResultText: () => displayPlusCheckoutConversionProxyTestResult.textContent,
  getRuntimeText: () => displayPlusCheckoutConversionProxyRuntimeStatus.textContent,
  getExitText: () => displayPlusCheckoutConversionProxyExitCheck.textContent,
};
`)();

  await api.handlePlusCheckoutConversionProxyNext711();

  assert.equal(api.messages.length, 1);
  assert.equal(api.messages[0].type, 'NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711');
  assert.equal(api.messages[0].payload.proxy711Region, 'US');
  assert.equal(api.messages[0].payload.ipProxyStateOverride.ipProxyAutoRefreshPoolOnExhausted, true);
  assert.equal(api.getState().plusCheckoutConversionProxyManualSession.displayName, 'http://proxy-b.example:8002');
  assert.equal(api.getRuntimeText(), '当前生效：http://proxy-b.example:8002');
  assert.match(api.getExitText(), /203\.0\.113\.20 \[US\]/);
  assert.equal(api.getResultText(), '当前代理：http://proxy-b.example:8002');
  assert.match(api.toasts.at(-1).message, /真实出口已变化/);
});

test('sidepanel renders checkout conversion proxy exit check states', () => {
  const bundle = [
    extractFunction('formatPlusCheckoutConversionProxyExitCheckTime'),
    extractFunction('renderPlusCheckoutConversionProxyExitCheck'),
  ].join('\n');

  const api = new Function(`
let latestState = {};
const displayPlusCheckoutConversionProxyExitCheck = {
  textContent: '',
  title: '',
  classes: new Set(),
  classList: {
    remove(...items) { items.forEach((item) => displayPlusCheckoutConversionProxyExitCheck.classes.delete(item)); },
    add(item) { displayPlusCheckoutConversionProxyExitCheck.classes.add(item); },
  },
};
${bundle}
return {
  renderPlusCheckoutConversionProxyExitCheck,
  display: displayPlusCheckoutConversionProxyExitCheck,
};
`)();

  api.renderPlusCheckoutConversionProxyExitCheck({
    plusCheckoutConversionProxyExitCheck: {
      status: 'running',
      displayName: 'http://proxy.example:8080',
    },
  });
  assert.equal(api.display.textContent, '检测中...');
  assert.equal(api.display.classes.has('status-running'), true);

  api.renderPlusCheckoutConversionProxyExitCheck({
    plusCheckoutConversionProxyExitCheck: {
      status: 'success',
      exitIp: '203.0.113.9',
      exitRegion: 'US',
      exitSource: 'page_context',
      checkedAt: 1700000000000,
    },
  });
  assert.match(api.display.textContent, /203\.0\.113\.9 \[US\] · page_context/);
  assert.equal(api.display.classes.has('status-success'), true);

  api.renderPlusCheckoutConversionProxyExitCheck({
    plusCheckoutConversionProxyExitCheck: {
      status: 'error',
      diagnostics: '未检测到支付转换代理出口 IP。',
    },
  });
  assert.match(api.display.textContent, /检测失败：未检测到支付转换代理出口 IP/);
  assert.equal(api.display.classes.has('status-error'), true);
});

test('sidepanel normalizes Plus checkout wait settings to bounded integer seconds', () => {
  const bundle = [
    extractFunction('normalizePlusCheckoutCreatePreWaitSeconds'),
    extractFunction('normalizePlusCheckoutOpenStableWaitSeconds'),
    extractFunction('normalizePlusHostedCheckoutCardPreWaitSeconds'),
  ].join('\n');

  const api = new Function(`
const DEFAULT_PLUS_CHECKOUT_CREATE_PRE_WAIT_SECONDS = 10;
const DEFAULT_PLUS_CHECKOUT_OPEN_STABLE_WAIT_SECONDS = 20;
const DEFAULT_PLUS_HOSTED_CHECKOUT_CARD_PRE_WAIT_SECONDS = 10;
${bundle}
return {
  normalizePlusCheckoutCreatePreWaitSeconds,
  normalizePlusCheckoutOpenStableWaitSeconds,
  normalizePlusHostedCheckoutCardPreWaitSeconds,
};
`)();

  assert.equal(api.normalizePlusCheckoutCreatePreWaitSeconds(' 15.9 '), 15);
  assert.equal(api.normalizePlusCheckoutCreatePreWaitSeconds('abc'), 10);
  assert.equal(api.normalizePlusCheckoutCreatePreWaitSeconds(''), 0);
  assert.equal(api.normalizePlusCheckoutOpenStableWaitSeconds(' 28.7 '), 28);
  assert.equal(api.normalizePlusCheckoutOpenStableWaitSeconds('-5'), 0);
  assert.equal(api.normalizePlusHostedCheckoutCardPreWaitSeconds(' 11.9 '), 11);
  assert.equal(api.normalizePlusHostedCheckoutCardPreWaitSeconds('abc'), 10);
  assert.equal(api.normalizePlusHostedCheckoutCardPreWaitSeconds('999'), 120);
});

test('sidepanel Plus UI can hide Plus controls when the shared flow capability registry disables them', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
const window = {
  MultiPageFlowCapabilities: {
    createFlowCapabilityRegistry() {
      return {
        resolveSidepanelCapabilities() {
          return {
            canShowPlusSettings: false,
            runtimeLocks: { plusModeEnabled: false },
          };
        },
      };
    },
  },
};
let latestState = { plusPaymentMethod: 'paypal' };
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const rowPlusMode = { style: { display: '' } };
const selectPlusPaymentMethod = { value: 'paypal', style: { display: '' } };
const rowPlusPaymentMethod = { style: { display: '' } };
const rowPayPalAccount = { style: { display: '' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
${bundle}
return {
  rowPlusMode,
  rowPlusPaymentMethod,
  rowPayPalAccount,
  selectPlusPaymentMethod,
  updatePlusModeUI,
};
`)();

  api.updatePlusModeUI();

  assert.equal(api.rowPlusMode.style.display, 'none');
  assert.equal(api.rowPlusPaymentMethod.style.display, 'none');
  assert.equal(api.rowPayPalAccount.style.display, 'none');
  assert.equal(api.selectPlusPaymentMethod.style.display, 'none');
});

test('sidepanel step definitions keep GPC helper mode distinct', () => {
  const bundle = [
    extractFunction('normalizeSignupMethod'),
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('buildStepDefinitionSignature'),
    extractFunction('getStepDefinitionsForMode'),
    extractFunction('rebuildStepDefinitionState'),
    extractFunction('syncStepDefinitionsForMode'),
  ].join('\n');

  const api = new Function(`
const calls = [];
const window = {
  MultiPageStepDefinitions: {
    getSteps(options) {
      calls.push({ type: 'getSteps', options });
      return [{ id: options.plusPaymentMethod === 'gpc-helper' ? 13 : 6, order: 1 }];
    },
  },
};
let currentPlusModeEnabled = false;
let currentPhonePlusModeEnabled = false;
let currentPlusPaymentMethod = 'paypal';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
let currentPlusAccountAccessStrategy = DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY;
let currentSignupMethod = 'email';
let currentPhoneSignupReloginAfterBindEmailEnabled = false;
let currentStepDefinitionSignature = '';
const DEFAULT_SIGNUP_METHOD = 'email';
let stepDefinitions = [];
let STEP_IDS = [];
let STEP_DEFAULT_STATUSES = {};
let SKIPPABLE_STEPS = new Set();
function renderStepsList() {
  calls.push({ type: 'render', stepIds: [...STEP_IDS] });
}
${bundle}
return {
  calls,
  syncStepDefinitionsForMode,
  getCurrentPlusPaymentMethod: () => currentPlusPaymentMethod,
  getStepIds: () => [...STEP_IDS],
};
`)();

  api.syncStepDefinitionsForMode(true, 'gpc-helper', { render: true });

  assert.equal(api.getCurrentPlusPaymentMethod(), 'gpc-helper');
  assert.deepEqual(api.getStepIds(), [13]);
  assert.deepEqual(api.calls[0], {
    type: 'getSteps',
    options: { activeFlowId: 'openai', plusModeEnabled: true, phonePlusModeEnabled: false, plusPaymentMethod: 'gpc-helper', plusHostedCheckoutIsFinalStep: true, plusAccountAccessStrategy: 'oauth', signupMethod: 'email', phoneSignupReloginAfterBindEmailEnabled: false, accountContributionEnabled: false },
  });
});

test('sidepanel Plus UI shows GPC fields and purchase button only for GPC', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'gpc-helper', gopayHelperAutoModeEnabled: true };
let currentPlusPaymentMethod = 'paypal';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'gpc-helper', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const btnGpcCardKeyPurchase = { style: { display: 'none' } };
const rowPayPalAccount = { style: { display: '' } };
const rowPlusPaymentMethod = { style: { display: 'none' } };
const rowGpcHelperApi = { style: { display: 'none' } };
const rowGpcHelperCardKey = { style: { display: 'none' } };
const rowGpcHelperPhoneMode = { style: { display: 'none' } };
const selectGpcHelperPhoneMode = { value: 'manual' };
const rowGpcHelperCountryCode = { style: { display: 'none' } };
const rowGpcHelperPhone = { style: { display: 'none' } };
const rowGpcHelperOtpChannel = { style: { display: 'none' } };
const selectGpcHelperOtpChannel = { value: 'whatsapp' };
const rowGpcHelperLocalSmsEnabled = { style: { display: 'none' } };
const inputGpcHelperLocalSmsEnabled = { checked: false };
const rowGpcHelperLocalSmsUrl = { style: { display: 'none' } };
const rowGpcHelperPin = { style: { display: 'none' } };
const rowGoPayCountryCode = { style: { display: 'none' } };
const rowGoPayPhone = { style: { display: 'none' } };
const rowGoPayOtp = { style: { display: 'none' } };
const rowGoPayPin = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return {
  updatePlusModeUI,
  selectPlusPaymentMethod,
  selectGpcHelperPhoneMode,
  selectGpcHelperOtpChannel,
  inputGpcHelperLocalSmsEnabled,
  btnGpcCardKeyPurchase,
  rowPayPalAccount,
  plusPaymentMethodCaption,
  rows: { rowGpcHelperApi, rowGpcHelperCardKey, rowGpcHelperPhoneMode, rowGpcHelperCountryCode, rowGpcHelperPhone, rowGpcHelperOtpChannel, rowGpcHelperLocalSmsEnabled, rowGpcHelperLocalSmsUrl, rowGpcHelperPin },
};
`)();

  api.updatePlusModeUI();

  assert.equal(api.rowPayPalAccount.style.display, 'none');
  assert.equal(api.btnGpcCardKeyPurchase.style.display, '');
  assert.equal(api.rows.rowGpcHelperApi.style.display, '');
  assert.equal(api.rows.rowGpcHelperCardKey.style.display, '');
  assert.equal(api.rows.rowGpcHelperPhoneMode.style.display, '');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, '');
  assert.equal(api.rows.rowGpcHelperOtpChannel.style.display, '');
  assert.equal(api.rows.rowGpcHelperLocalSmsEnabled.style.display, '');
  assert.equal(api.rows.rowGpcHelperLocalSmsUrl.style.display, 'none');
  assert.match(api.plusPaymentMethodCaption.textContent, /GPC/);

  api.inputGpcHelperLocalSmsEnabled.checked = true;
  api.updatePlusModeUI();
  assert.equal(api.selectGpcHelperOtpChannel.value, 'whatsapp');
  assert.equal(api.rows.rowGpcHelperLocalSmsUrl.style.display, '');

  api.selectGpcHelperOtpChannel.value = 'sms';
  api.updatePlusModeUI();
  assert.equal(api.inputGpcHelperLocalSmsEnabled.checked, true);
  assert.equal(api.rows.rowGpcHelperLocalSmsEnabled.style.display, '');
  assert.equal(api.rows.rowGpcHelperLocalSmsUrl.style.display, '');

  api.selectGpcHelperPhoneMode.value = 'auto';
  api.updatePlusModeUI();
  assert.equal(api.rows.rowGpcHelperPhoneMode.style.display, '');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperOtpChannel.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperLocalSmsEnabled.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperLocalSmsUrl.style.display, 'none');
  assert.match(api.plusPaymentMethodCaption.textContent, /自动/);

  api.selectPlusPaymentMethod.value = 'gopay';
  api.updatePlusModeUI();
  assert.equal(api.btnGpcCardKeyPurchase.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperApi.style.display, 'none');
  assert.equal(api.rowPayPalAccount.style.display, 'none');
});

test('sidepanel keeps selected GPC auto mode when API Key has no auto permission', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'gpc-helper', gopayHelperPhoneMode: 'auto', gopayHelperAutoModeEnabled: false, gopayHelperBalancePayload: { auto_mode_enabled: false } };
let currentPlusPaymentMethod = 'gpc-helper';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'gpc-helper', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const btnGpcCardKeyPurchase = { style: { display: 'none' } };
const rowPayPalAccount = { style: { display: '' } };
const rowPlusPaymentMethod = { style: { display: 'none' } };
const rowGpcHelperApi = { style: { display: 'none' } };
const rowGpcHelperCardKey = { style: { display: 'none' } };
const rowGpcHelperPhoneMode = { style: { display: 'none' } };
const selectGpcHelperPhoneMode = { value: 'auto' };
const rowGpcHelperCountryCode = { style: { display: 'none' } };
const rowGpcHelperPhone = { style: { display: 'none' } };
const rowGpcHelperOtpChannel = { style: { display: 'none' } };
const selectGpcHelperOtpChannel = { value: 'whatsapp' };
const rowGpcHelperLocalSmsEnabled = { style: { display: 'none' } };
const inputGpcHelperLocalSmsEnabled = { checked: false };
const rowGpcHelperLocalSmsUrl = { style: { display: 'none' } };
const rowGpcHelperPin = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return { updatePlusModeUI, selectGpcHelperPhoneMode, plusPaymentMethodCaption, rows: { rowGpcHelperPhoneMode, rowGpcHelperPhone, rowGpcHelperOtpChannel, rowGpcHelperPin } };
`)();

  api.updatePlusModeUI();

  assert.equal(api.rows.rowGpcHelperPhoneMode.style.display, '');
  assert.equal(api.selectGpcHelperPhoneMode.value, 'auto');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperOtpChannel.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperPin.style.display, 'none');
  assert.match(api.plusPaymentMethodCaption.textContent, /手动/);
});

test('sidepanel keeps selected GPC auto mode when persisted permission survives stop refresh', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = {
  plusPaymentMethod: 'gpc-helper',
  gopayHelperPhoneMode: 'auto',
  gopayHelperAutoModeEnabled: true,
  gopayHelperBalancePayload: { auto_mode_enabled: true },
};
let currentPlusPaymentMethod = 'gpc-helper';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'gpc-helper', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const rowPayPalAccount = { style: { display: '' } };
const rowPlusPaymentMethod = { style: { display: 'none' } };
const rowGpcHelperApi = { style: { display: 'none' } };
const rowGpcHelperCardKey = { style: { display: 'none' } };
const rowGpcHelperPhoneMode = { style: { display: 'none' } };
const selectGpcHelperPhoneMode = { value: 'auto' };
const rowGpcHelperCountryCode = { style: { display: 'none' } };
const rowGpcHelperPhone = { style: { display: 'none' } };
const rowGpcHelperOtpChannel = { style: { display: 'none' } };
const selectGpcHelperOtpChannel = { value: 'whatsapp' };
const rowGpcHelperLocalSmsEnabled = { style: { display: 'none' } };
const inputGpcHelperLocalSmsEnabled = { checked: false };
const rowGpcHelperLocalSmsUrl = { style: { display: 'none' } };
const rowGpcHelperPin = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
function syncLatestState(nextState) { latestState = { ...latestState, ...nextState }; }
return {
  updatePlusModeUI,
  selectGpcHelperPhoneMode,
  getSelectedPhoneMode() { return selectGpcHelperPhoneMode.value; },
  getPayloadPhoneMode() {
    return (() => {
      return normalizeGpcHelperPhoneModeValue(selectGpcHelperPhoneMode.value);
    })();
  },
  applyDataUpdated(payload) {
    syncLatestState(payload);
    if (payload.gopayHelperPhoneMode !== undefined) {
      selectGpcHelperPhoneMode.value = normalizeGpcHelperPhoneModeValue(payload.gopayHelperPhoneMode);
    }
    updatePlusModeUI();
  },
  rows: { rowGpcHelperPhoneMode, rowGpcHelperPhone, rowGpcHelperOtpChannel, rowGpcHelperPin },
};
`)();

  api.updatePlusModeUI();
  assert.equal(api.getSelectedPhoneMode(), 'auto');
  assert.equal(api.getPayloadPhoneMode(), 'auto');
  assert.equal(api.rows.rowGpcHelperPhoneMode.style.display, '');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, 'none');

  api.applyDataUpdated({
    autoRunning: false,
    autoRunPhase: 'stopped',
    gopayHelperAutoModeEnabled: false,
  });

  assert.equal(api.getSelectedPhoneMode(), 'auto');
  assert.equal(api.getPayloadPhoneMode(), 'auto');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, 'none');
});

test('sidepanel keeps selected GPC auto mode before permission has been queried', () => {
  const bundle = [
    extractFunction('normalizePlusPaymentMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('getSelectedPlusPaymentMethod'),
    extractFunction('getRequestedPlusAccountAccessStrategy'),
    extractFunction('normalizeGpcHelperPhoneModeValue'),
    extractFunction('getGpcHelperAutoModeEnabled'),
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('shouldPreserveSelectedGpcAutoMode'),
    extractFunction('hasGpcAutoModePermissionField'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcOtpChannelValue'),
    extractFunction('updatePlusModeUI'),
  ].join('\n');

  const api = new Function(`
let latestState = { plusPaymentMethod: 'gpc-helper', gopayHelperPhoneMode: 'auto', gopayHelperAutoModeEnabled: false, gopayHelperBalancePayload: null };
let currentPlusPaymentMethod = 'gpc-helper';
let currentPlusAccountAccessStrategy = 'oauth';
const inputPlusModeEnabled = { checked: true };
const selectPlusPaymentMethod = { value: 'gpc-helper', style: { display: 'none' } };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const plusPaymentMethodCaption = { textContent: '' };
const rowPayPalAccount = { style: { display: '' } };
const rowPlusPaymentMethod = { style: { display: 'none' } };
const rowGpcHelperApi = { style: { display: 'none' } };
const rowGpcHelperCardKey = { style: { display: 'none' } };
const rowGpcHelperPhoneMode = { style: { display: 'none' } };
const selectGpcHelperPhoneMode = { value: 'auto' };
const rowGpcHelperCountryCode = { style: { display: 'none' } };
const rowGpcHelperPhone = { style: { display: 'none' } };
const rowGpcHelperOtpChannel = { style: { display: 'none' } };
const selectGpcHelperOtpChannel = { value: 'whatsapp' };
const rowGpcHelperLocalSmsEnabled = { style: { display: 'none' } };
const inputGpcHelperLocalSmsEnabled = { checked: false };
const rowGpcHelperLocalSmsUrl = { style: { display: 'none' } };
const rowGpcHelperPin = { style: { display: 'none' } };
function renderPlusCheckoutConversionProxyRuntimeStatus() {}
${bundle}
return { updatePlusModeUI, selectGpcHelperPhoneMode, plusPaymentMethodCaption, rows: { rowGpcHelperPhoneMode, rowGpcHelperPhone, rowGpcHelperOtpChannel, rowGpcHelperPin } };
`)();

  api.updatePlusModeUI();

  assert.equal(api.rows.rowGpcHelperPhoneMode.style.display, '');
  assert.equal(api.selectGpcHelperPhoneMode.value, 'auto');
  assert.equal(api.rows.rowGpcHelperPhone.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperOtpChannel.style.display, 'none');
  assert.equal(api.rows.rowGpcHelperPin.style.display, 'none');
  assert.match(api.plusPaymentMethodCaption.textContent, /自动/);
});

test('sidepanel start check keeps GPC auto mode when balance payload omits permission field', async () => {
  const bundle = [
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcRemainingUsesValue'),
    extractFunction('ensureGpcApiKeyReadyForStart'),
  ].join('\n');

  const api = new Function(`
let latestState = { gopayHelperPhoneMode: 'auto' };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const selectGpcHelperPhoneMode = { value: 'auto' };
const dialogs = [];
let saveCalls = 0;
let updateCalls = 0;
${bundle}
function isGpcHelperCheckoutSelected() { return true; }
function getSelectedGpcHelperPhoneMode() { return selectGpcHelperPhoneMode.value; }
async function refreshGpcBalanceForStart() {
  return {
    gopayHelperRemainingUses: 998,
    gopayHelperApiKeyStatus: 'active',
    gopayHelperAutoModeEnabled: false,
    gopayHelperBalancePayload: {
      status: 'active',
      remaining_uses: 998,
    },
  };
}
async function showGpcStartBlockedDialog(message) {
  dialogs.push(message);
}
function syncLatestState(nextState) {
  latestState = { ...latestState, ...nextState };
}
function updatePlusModeUI() {
  updateCalls += 1;
}
async function saveSettings() {
  saveCalls += 1;
}
function showToast() {}
return {
  ensureGpcApiKeyReadyForStart,
  selectGpcHelperPhoneMode,
  getDialogs: () => dialogs.slice(),
  getSaveCalls: () => saveCalls,
  getUpdateCalls: () => updateCalls,
  getPersistedPhoneMode: () => latestState.gopayHelperPhoneMode,
};
`)();

  const allowed = await api.ensureGpcApiKeyReadyForStart();

  assert.equal(allowed, true);
  assert.equal(api.selectGpcHelperPhoneMode.value, 'auto');
  assert.equal(api.getPersistedPhoneMode(), 'auto');
  assert.equal(api.getSaveCalls(), 0);
  assert.equal(api.getUpdateCalls(), 0);
  assert.deepEqual(api.getDialogs(), []);
});

test('sidepanel start check blocks unsupported GPC auto mode without rewriting selection', async () => {
  const bundle = [
    extractFunction('normalizeGpcAutoModePermissionValue'),
    extractFunction('getGpcAutoModePermissionFromPayload'),
    extractFunction('isGpcAutoModePermissionDenied'),
    extractFunction('normalizeGpcRemainingUsesValue'),
    extractFunction('ensureGpcApiKeyReadyForStart'),
  ].join('\n');

  const api = new Function(`
let latestState = { gopayHelperPhoneMode: 'auto' };
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const selectGpcHelperPhoneMode = { value: 'auto' };
const dialogs = [];
let saveCalls = 0;
let updateCalls = 0;
${bundle}
function isGpcHelperCheckoutSelected() { return true; }
function getSelectedGpcHelperPhoneMode() { return selectGpcHelperPhoneMode.value; }
async function refreshGpcBalanceForStart() {
  return {
    gopayHelperRemainingUses: 998,
    gopayHelperApiKeyStatus: 'active',
    gopayHelperAutoModeEnabled: false,
    gopayHelperBalancePayload: {
      status: 'active',
      remaining_uses: 998,
      auto_mode_enabled: false,
    },
  };
}
async function showGpcStartBlockedDialog(message) {
  dialogs.push(message);
}
function syncLatestState(nextState) {
  latestState = { ...latestState, ...nextState };
}
function updatePlusModeUI() {
  updateCalls += 1;
}
async function saveSettings() {
  saveCalls += 1;
}
function showToast() {}
return {
  ensureGpcApiKeyReadyForStart,
  selectGpcHelperPhoneMode,
  getDialogs: () => dialogs.slice(),
  getSaveCalls: () => saveCalls,
  getUpdateCalls: () => updateCalls,
  getPersistedPhoneMode: () => latestState.gopayHelperPhoneMode,
};
`)();

  const allowed = await api.ensureGpcApiKeyReadyForStart();

  assert.equal(allowed, false);
  assert.equal(api.selectGpcHelperPhoneMode.value, 'auto');
  assert.equal(api.getPersistedPhoneMode(), 'auto');
  assert.equal(api.getSaveCalls(), 0);
  assert.equal(api.getUpdateCalls(), 0);
  assert.equal(api.getDialogs().length, 1);
});

test('sidepanel resolves pending GoPay manual confirmation from DATA_UPDATED state', async () => {
  const bundle = [
    extractFunction('openPlusManualConfirmationDialog'),
    extractFunction('syncPlusManualConfirmationDialog'),
  ].join('\n');

  const api = new Function(`
const events = [];
let latestState = {
  activeFlowId: 'openai',
  plusManualConfirmationPending: true,
  plusManualConfirmationRequestId: 'gopay-request-1',
  plusManualConfirmationStep: 7,
  plusManualConfirmationMethod: 'gopay',
  plusManualConfirmationTitle: 'GoPay 订阅确认',
  plusManualConfirmationMessage: '请确认订阅。',
};
let activePlusManualConfirmationRequestId = '';
let plusManualConfirmationDialogInFlight = false;
function openActionModal(options) {
  events.push({ type: 'modal', options });
  return Promise.resolve('confirm');
}
function showToast(message, tone) {
  events.push({ type: 'toast', message, tone });
}
const chrome = {
  runtime: {
    async sendMessage(message) {
      events.push({ type: 'send', message });
      latestState = {
        ...latestState,
        plusManualConfirmationPending: false,
      };
      return { ok: true };
    },
  },
};
${bundle}
return { events, syncPlusManualConfirmationDialog };
`)();

  await api.syncPlusManualConfirmationDialog();

  assert.equal(api.events[0].type, 'modal');
  assert.equal(api.events[0].options.title, 'GoPay 订阅确认');
  assert.deepEqual(api.events[1], {
    type: 'send',
    message: {
      type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
      source: 'sidepanel',
      payload: {
        step: 7,
        requestId: 'gopay-request-1',
        confirmed: true,
      },
    },
  });
  assert.match(api.events[2].message, /GoPay/);
  assert.equal(api.events[2].tone, 'info');
});

test('sidepanel resolves pending GPC OTP with typed code', async () => {
  const bundle = [
    extractFunction('normalizeSignupMethod'),
    extractFunction('normalizePlusAccountAccessStrategy'),
    extractFunction('normalizePlusStrategyTargetId'),
    extractFunction('getPlusAccountAccessStrategyContinuationLabel'),
    extractFunction('resolvePlusManualContinuationActionLabelFromState'),
    extractLastFunction('openPlusManualConfirmationDialog'),
    extractLastFunction('syncPlusManualConfirmationDialog'),
  ].join('\n');

  const api = new Function(`
const events = [];
let latestState = {
  plusManualConfirmationPending: true,
  plusManualConfirmationRequestId: 'otp-request-1',
  plusManualConfirmationStep: 7,
  plusManualConfirmationMethod: 'gopay-otp',
  plusManualConfirmationTitle: 'GPC OTP 验证',
  plusManualConfirmationMessage: '',
};
let activePlusManualConfirmationRequestId = '';
let plusManualConfirmationDialogInFlight = false;
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const SIGNUP_METHOD_EMAIL = 'email';
const SIGNUP_METHOD_PHONE = 'phone';
const DEFAULT_SIGNUP_METHOD = 'email';
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = 'oauth';
const sharedFormDialog = {
  async open(options) {
    events.push({ type: 'form', options });
    return { otp: ' 12-34 56 ' };
  },
};
function openActionModal(options) {
  events.push({ type: 'modal', options });
  return Promise.resolve('confirm');
}
function showToast(message, tone) {
  events.push({ type: 'toast', message, tone });
}
const chrome = {
  runtime: {
    async sendMessage(message) {
      events.push({ type: 'send', message });
      latestState = { ...latestState, plusManualConfirmationPending: false };
      return { ok: true };
    },
  },
};
${bundle}
return { events, syncPlusManualConfirmationDialog };
`)();

  await api.syncPlusManualConfirmationDialog();

  assert.equal(api.events[0].type, 'form');
  assert.equal(api.events[0].options.message, '请在WhatsApp里面获取验证码（耐心等待三十秒左右）');
  assert.equal(api.events[0].options.confirmLabel, '提交 OTP');
  const sendEvent = api.events.find((event) => event.type === 'send');
  assert.deepEqual(sendEvent.message.payload, {
    step: 7,
    requestId: 'otp-request-1',
    confirmed: true,
    otp: '123456',
  });
  assert.equal(api.events.some((event) => event.type === 'modal'), false);
});
