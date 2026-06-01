const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('step definitions module exposes ordered normal and Plus step metadata', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};

  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const steps = api.getSteps();
  const phoneSteps = api.getSteps({ signupMethod: 'phone' });
  const phoneReloginSteps = api.getSteps({
    signupMethod: 'phone',
    phoneSignupReloginAfterBindEmailEnabled: true,
  });
  const plusSteps = api.getSteps({ plusModeEnabled: true });
  const hostedSteps = api.getSteps({ plusModeEnabled: true, plusPaymentMethod: 'paypal-hosted' });
  const legacyPaypalSteps = api.getSteps({
    plusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    plusHostedCheckoutIsFinalStep: false,
  });
  const plusPhoneSteps = api.getSteps({ plusModeEnabled: true, signupMethod: 'phone' });
  const plusPhoneReloginSteps = api.getSteps({
    plusModeEnabled: true,
    signupMethod: 'phone',
    phoneSignupReloginAfterBindEmailEnabled: true,
  });
  const goPaySteps = api.getSteps({ plusModeEnabled: true, plusPaymentMethod: 'gopay' });
  const gpcSteps = api.getSteps({ plusModeEnabled: true, plusPaymentMethod: 'gpc-helper' });
  const kiroSteps = api.getSteps({ activeFlowId: 'kiro' });

  assert.equal(Array.isArray(steps), true);
  assert.equal(steps.length, 11);
  assert.equal(steps.every((step) => step.flowId === 'openai'), true);
  assert.deepStrictEqual(
    steps.map((step) => step.order),
    steps.map((step) => step.order).slice().sort((left, right) => left - right)
  );
  assert.deepStrictEqual(
    steps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'oauth-login',
      'fetch-login-code',
      'post-login-phone-verification',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(steps[0].title, '打开 ChatGPT 官网');
  assert.equal(steps[5].title, '等待注册成功');
  assert.equal(phoneSteps[1].title, '注册并输入手机号');
  assert.equal(phoneSteps[3].title, '获取手机验证码');
  assert.deepStrictEqual(
    phoneSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'oauth-login',
      'fetch-login-code',
      'bind-email',
      'fetch-bind-email-code',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.deepStrictEqual(
    phoneReloginSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'oauth-login',
      'fetch-login-code',
      'bind-email',
      'fetch-bind-email-code',
      'relogin-bound-email',
      'fetch-bound-email-login-code',
      'post-bound-email-phone-verification',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(phoneReloginSteps.find((step) => step.key === 'relogin-bound-email')?.title, '绑定邮箱后刷新 OAuth 并登录（邮箱）');
  assert.equal(phoneReloginSteps.find((step) => step.key === 'fetch-bind-email-code')?.title, '获取绑定邮箱验证码');

  assert.deepStrictEqual(
    plusSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'paypal-hosted-email',
      'paypal-hosted-card',
      'paypal-hosted-create-account',
      'paypal-hosted-review',
      'oauth-login',
      'fetch-login-code',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(plusSteps.some((step) => step.key === 'wait-registration-success'), true);
  assert.equal(plusSteps[plusSteps.findIndex((step) => step.key === 'plus-checkout-create') - 1]?.key, 'wait-registration-success');
  assert.equal(plusSteps.some((step) => step.key === 'fetch-login-code'), true);
  assert.equal(plusSteps.some((step) => step.key === 'paypal-approve'), false);
  assert.equal(plusSteps.find((step) => step.key === 'paypal-hosted-review')?.title, '无卡直绑完成 PayPal 授权');
  assert.deepStrictEqual(
    legacyPaypalSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'plus-checkout-billing',
      'paypal-approve',
      'plus-checkout-return',
      'oauth-login',
      'fetch-login-code',
      'post-login-phone-verification',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(plusPhoneSteps[1].title, '注册并输入手机号');
  assert.equal(plusPhoneSteps[3].title, '获取手机验证码');
  assert.deepStrictEqual(
    plusPhoneSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'paypal-hosted-email',
      'paypal-hosted-card',
      'paypal-hosted-create-account',
      'paypal-hosted-review',
      'oauth-login',
      'fetch-login-code',
      'bind-email',
      'fetch-bind-email-code',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.deepStrictEqual(
    plusPhoneReloginSteps.map((step) => step.key).slice(-9),
    [
      'paypal-hosted-review',
      'oauth-login',
      'fetch-login-code',
      'bind-email',
      'fetch-bind-email-code',
      'relogin-bound-email',
      'fetch-bound-email-login-code',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(goPaySteps.some((step) => step.key === 'paypal-approve'), false);
  assert.equal(api.getStepById(14, { plusModeEnabled: true, plusPaymentMethod: 'gopay' }), null);
  assert.equal(api.getPlusPaymentStepTitle({ plusModeEnabled: true, plusPaymentMethod: 'gopay' }), '');
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true }), 15);
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true, signupMethod: 'phone' }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true, signupMethod: 'phone' }), 17);
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true, signupMethod: 'phone', phoneSignupReloginAfterBindEmailEnabled: true }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true, signupMethod: 'phone', phoneSignupReloginAfterBindEmailEnabled: true }), 19);
  assert.equal(api.hasFlow('openai'), true);
  assert.equal(api.hasFlow('kiro'), true);
  assert.equal(api.hasFlow('site-a'), false);
  assert.deepStrictEqual(api.getRegisteredFlowIds(), ['openai', 'kiro']);
  assert.deepStrictEqual(api.getSteps({ activeFlowId: 'site-a' }), []);
  assert.equal(api.getStepById(2, { activeFlowId: 'site-a' }), null);
  assert.deepStrictEqual(
    kiroSteps.map((step) => step.key),
    [
      'kiro-open-register-page',
      'kiro-submit-email',
      'kiro-submit-name',
      'kiro-submit-verification-code',
      'kiro-submit-password',
      'kiro-complete-register-consent',
      'kiro-start-desktop-authorize',
      'kiro-complete-desktop-authorize',
      'kiro-upload-credential',
    ]
  );
  assert.equal(kiroSteps.every((step) => step.flowId === 'kiro'), true);
  assert.equal(kiroSteps[0].driverId, 'background/kiro-register');
  assert.equal(kiroSteps[8].sourceId, 'kiro-rs-admin');
  assert.equal(kiroSteps[0].title, '打开注册页');
  assert.equal(kiroSteps[1].title, '获取邮箱并继续');
  assert.equal(kiroSteps[2].title, '填写姓名并继续');
  assert.equal(kiroSteps[3].title, '获取验证码并继续');
  assert.equal(kiroSteps[4].title, '设置密码并继续');
  assert.equal(kiroSteps[5].title, '完成注册授权');
  assert.equal(kiroSteps[6].title, '启动桌面授权');
  assert.equal(kiroSteps[7].title, '完成桌面授权');
  assert.equal(kiroSteps[8].title, '上传凭据到 kiro.rs');
  const kiroContributionSteps = api.getSteps({ activeFlowId: 'kiro', accountContributionEnabled: true });
  assert.equal(kiroContributionSteps[8].title, '贡献上传');
  assert.deepStrictEqual(api.getStepIds({ activeFlowId: 'kiro' }), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(api.getLastStepId({ activeFlowId: 'kiro' }), 9);
  assert.deepStrictEqual(
    api.getNodes({ activeFlowId: 'kiro' }).map((node) => node.next),
    [
      ['kiro-submit-email'],
      ['kiro-submit-name'],
      ['kiro-submit-verification-code'],
      ['kiro-submit-password'],
      ['kiro-complete-register-consent'],
      ['kiro-start-desktop-authorize'],
      ['kiro-complete-desktop-authorize'],
      ['kiro-upload-credential'],
      [],
    ]
  );
  assert.equal(plusSteps[6].title, '创建 Plus Checkout');
  assert.equal(plusSteps[8].title, '无卡直绑填写 PayPal 资料');

  assert.deepStrictEqual(
    hostedSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'paypal-hosted-email',
      'paypal-hosted-card',
      'paypal-hosted-create-account',
      'paypal-hosted-review',
      'oauth-login',
      'fetch-login-code',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.equal(hostedSteps.some((step) => step.key === 'plus-checkout-billing'), false);
  assert.equal(hostedSteps.some((step) => step.key === 'paypal-approve'), false);
  assert.equal(hostedSteps.some((step) => step.key === 'plus-checkout-return'), false);
  assert.equal(hostedSteps.some((step) => step.key === 'paypal-hosted-openai-checkout'), false);
  assert.equal(hostedSteps.some((step) => step.key === 'paypal-hosted-verification'), false);
  assert.equal(hostedSteps.find((step) => step.key === 'paypal-hosted-card')?.title, '无卡直绑填写 PayPal 资料');
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true, plusPaymentMethod: 'paypal-hosted' }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true, plusPaymentMethod: 'paypal-hosted' }), 15);

  assert.deepStrictEqual(
    goPaySteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'gopay-subscription-confirm',
      'oauth-login',
      'fetch-login-code',
      'post-login-phone-verification',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true, plusPaymentMethod: 'gopay' }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true, plusPaymentMethod: 'gopay' }), 13);
  assert.equal(goPaySteps[6].title, '打开 GoPay 订阅页');
  assert.equal(goPaySteps[7].title, '等待 GoPay 订阅确认');

  assert.deepStrictEqual(
    gpcSteps.map((step) => step.key),
    [
      'open-chatgpt',
      'submit-signup-email',
      'fill-password',
      'fetch-signup-code',
      'fill-profile',
      'wait-registration-success',
      'plus-checkout-create',
      'plus-checkout-billing',
      'oauth-login',
      'fetch-login-code',
      'post-login-phone-verification',
      'confirm-oauth',
      'platform-verify',
    ]
  );
  assert.deepStrictEqual(api.getStepIds({ plusModeEnabled: true, plusPaymentMethod: 'gpc-helper' }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(api.getLastStepId({ plusModeEnabled: true, plusPaymentMethod: 'gpc-helper' }), 13);
  assert.equal(gpcSteps[6].title, '创建 GPC 订单');
  assert.equal(gpcSteps[7].title, '等待 GPC 任务完成');
});

test('Plus session strategy swaps the OAuth tail for a single SUB2API import node', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const forbiddenTailKeys = [
    'oauth-login',
    'fetch-login-code',
    'post-login-phone-verification',
    'confirm-oauth',
    'platform-verify',
  ];

  [
    {
      label: 'paypal',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal',
        plusAccountAccessStrategy: 'sub2api_codex_session',
      },
      previousNodeId: 'paypal-hosted-review',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
      label: 'paypal-hosted',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal-hosted',
        plusAccountAccessStrategy: 'sub2api_codex_session',
      },
      previousNodeId: 'paypal-hosted-review',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
      label: 'gopay',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gopay',
        plusAccountAccessStrategy: 'sub2api_codex_session',
      },
      previousNodeId: 'gopay-subscription-confirm',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      label: 'gpc-helper',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gpc-helper',
        plusAccountAccessStrategy: 'sub2api_codex_session',
      },
      previousNodeId: 'plus-checkout-billing',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  ].forEach(({ label, options, previousNodeId, expectedStepIds }) => {
    const steps = api.getSteps(options);
    const nodes = api.getNodes(options);
    const stepKeys = steps.map((step) => step.key);
    const nodeIds = nodes.map((node) => node.nodeId);
    const previousNode = nodes.find((node) => node.nodeId === previousNodeId);
    const sessionImportNode = nodes.find((node) => node.nodeId === 'sub2api-session-import');

    assert.equal(stepKeys.at(-1), 'sub2api-session-import', `${label} should end with session import`);
    assert.equal(nodeIds.at(-1), 'sub2api-session-import', `${label} node order should end with session import`);
    forbiddenTailKeys.forEach((key) => {
      assert.equal(stepKeys.includes(key), false, `${label} should not keep ${key} in session mode`);
      assert.equal(nodeIds.includes(key), false, `${label} nodes should not keep ${key} in session mode`);
    });
    assert.deepStrictEqual(api.getStepIds(options), expectedStepIds, `${label} step ids should follow the new tail`);
    assert.equal(api.getLastStepId(options), expectedStepIds.at(-1), `${label} last step id should match session import`);
    assert.deepStrictEqual(previousNode?.next, ['sub2api-session-import'], `${label} previous node should link to session import`);
    assert.deepStrictEqual(sessionImportNode?.next, [], `${label} session import should be terminal`);
  });
});

test('SUB2API relogin mode keeps only the rebased OAuth tail', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const options = {
    activeFlowId: 'openai',
    panelMode: 'sub2api',
    openaiIntegrationTargetId: 'sub2api',
    sub2apiReloginEnabled: true,
    signupMethod: 'phone',
  };
  const steps = api.getSteps(options);
  const nodes = api.getNodes(options);

  assert.deepStrictEqual(steps.map((step) => step.key), [
    'oauth-login',
    'fetch-login-code',
    'confirm-oauth',
    'platform-verify',
  ]);
  assert.deepStrictEqual(steps.map((step) => step.id), [1, 2, 3, 4]);
  assert.deepStrictEqual(nodes.map((node) => node.nodeId), [
    'oauth-login',
    'fetch-login-code',
    'confirm-oauth',
    'platform-verify',
  ]);
  assert.deepStrictEqual(nodes.map((node) => node.displayOrder), [1, 2, 3, 4]);
  assert.deepStrictEqual(api.getStepIds(options), [1, 2, 3, 4]);
  assert.equal(api.getLastStepId(options), 4);
});

test('Plus phone signup never switches to SUB2API session tail even if the requested strategy is session import', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const steps = api.getSteps({
    plusModeEnabled: true,
    plusPaymentMethod: 'paypal',
    signupMethod: 'phone',
    plusAccountAccessStrategy: 'sub2api_codex_session',
  });
  const stepKeys = steps.map((step) => step.key);

  assert.equal(stepKeys.includes('sub2api-session-import'), false);
  assert.equal(stepKeys.includes('oauth-login'), true);
  assert.equal(stepKeys.includes('platform-verify'), true);
});

test('Phone Plus inserts payment steps after full phone registration for each payment method', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const cases = [
    {
      label: 'paypal',
      options: { phonePlusModeEnabled: true, plusPaymentMethod: 'paypal' },
      expectedKeys: [
        'open-chatgpt',
        'submit-signup-email',
        'fill-password',
        'fetch-signup-code',
        'fill-profile',
        'wait-registration-success',
        'plus-checkout-create',
        'paypal-hosted-email',
        'paypal-hosted-card',
        'paypal-hosted-create-account',
        'paypal-hosted-review',
        'plus-check',
        'oauth-login',
        'fetch-login-code',
        'bind-email',
        'fetch-bind-email-code',
        'confirm-oauth',
        'platform-verify',
      ],
    },
    {
      label: 'paypal-hosted',
      options: { phonePlusModeEnabled: true, plusPaymentMethod: 'paypal-hosted' },
      expectedKeys: [
        'open-chatgpt',
        'submit-signup-email',
        'fill-password',
        'fetch-signup-code',
        'fill-profile',
        'wait-registration-success',
        'plus-checkout-create',
        'paypal-hosted-email',
        'paypal-hosted-card',
        'paypal-hosted-create-account',
        'paypal-hosted-review',
        'plus-check',
        'oauth-login',
        'fetch-login-code',
        'bind-email',
        'fetch-bind-email-code',
        'confirm-oauth',
        'platform-verify',
      ],
    },
    {
      label: 'gopay',
      options: { phonePlusModeEnabled: true, plusPaymentMethod: 'gopay' },
      expectedKeys: [
        'open-chatgpt',
        'submit-signup-email',
        'fill-password',
        'fetch-signup-code',
        'fill-profile',
        'wait-registration-success',
        'plus-checkout-create',
        'gopay-subscription-confirm',
        'plus-check',
        'oauth-login',
        'fetch-login-code',
        'bind-email',
        'fetch-bind-email-code',
        'confirm-oauth',
        'platform-verify',
      ],
    },
    {
      label: 'gpc-helper',
      options: { phonePlusModeEnabled: true, plusPaymentMethod: 'gpc-helper' },
      expectedKeys: [
        'open-chatgpt',
        'submit-signup-email',
        'fill-password',
        'fetch-signup-code',
        'fill-profile',
        'wait-registration-success',
        'plus-checkout-create',
        'plus-checkout-billing',
        'plus-check',
        'oauth-login',
        'fetch-login-code',
        'bind-email',
        'fetch-bind-email-code',
        'confirm-oauth',
        'platform-verify',
      ],
    },
  ];

  cases.forEach(({ label, options, expectedKeys }) => {
    const steps = api.getSteps(options);
    const nodes = api.getNodes(options);
    const stepKeys = steps.map((step) => step.key);
    const nodeIds = nodes.map((node) => node.nodeId);
    const expectedIds = Array.from({ length: expectedKeys.length }, (_, index) => index + 1);
    const waitIndex = stepKeys.indexOf('wait-registration-success');

    assert.deepStrictEqual(stepKeys, expectedKeys, `${label} keys should follow phone registration, payment, OAuth tail`);
    assert.deepStrictEqual(nodeIds, expectedKeys, `${label} node ids should follow phone registration, payment, OAuth tail`);
    assert.deepStrictEqual(api.getStepIds(options), expectedIds, `${label} ids should be contiguous`);
    assert.equal(api.getLastStepId(options), expectedIds.at(-1), `${label} last step id should match the tail`);
    assert.deepStrictEqual(nodes.map((node) => node.displayOrder), expectedIds, `${label} display order should be contiguous`);
    assert.equal(waitIndex >= 0, true, `${label} should keep wait-registration-success`);
    assert.equal(stepKeys[waitIndex + 1], 'plus-checkout-create', `${label} should start payment after registration success`);
    assert.equal(stepKeys[stepKeys.indexOf('oauth-login') - 1], 'plus-check', `${label} should check Plus before OAuth`);
    nodes.forEach((node, index) => {
      assert.deepStrictEqual(
        node.next,
        index < expectedKeys.length - 1 ? [expectedKeys[index + 1]] : [],
        `${label} node ${node.nodeId} should link to the next node`
      );
    });
  });
});

test('Phone Plus always uses OAuth tail even when a session import strategy is requested', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);

  ['sub2api_codex_session', 'cpa_codex_session'].forEach((plusAccountAccessStrategy) => {
    ['paypal', 'paypal-hosted', 'gopay', 'gpc-helper'].forEach((plusPaymentMethod) => {
      const steps = api.getSteps({
        plusModeEnabled: true,
        phonePlusModeEnabled: true,
        plusPaymentMethod,
        plusAccountAccessStrategy,
      });
      const stepKeys = steps.map((step) => step.key);

      assert.equal(stepKeys.includes('sub2api-session-import'), false, `${plusPaymentMethod} should not import SUB2API sessions`);
      assert.equal(stepKeys.includes('cpa-session-import'), false, `${plusPaymentMethod} should not import CPA sessions`);
      assert.equal(stepKeys.includes('plus-check'), true, `${plusPaymentMethod} should check Plus before OAuth`);
      assert.equal(stepKeys.includes('oauth-login'), true, `${plusPaymentMethod} should keep OAuth login`);
      assert.equal(stepKeys[stepKeys.indexOf('oauth-login') - 1], 'plus-check', `${plusPaymentMethod} should run plus-check before OAuth`);
      assert.equal(stepKeys.includes('bind-email'), true, `${plusPaymentMethod} should keep phone signup bind-email tail`);
      assert.equal(stepKeys.includes('platform-verify'), true, `${plusPaymentMethod} should keep platform verification`);
    });
  });
});

test('registration activation only mode ends Plus flows at the activation checkpoint', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const forbiddenTailKeys = [
    'oauth-login',
    'fetch-login-code',
    'post-login-phone-verification',
    'bind-email',
    'fetch-bind-email-code',
    'confirm-oauth',
    'platform-verify',
    'sub2api-session-import',
    'cpa-session-import',
  ];
  const cases = [
    {
      label: 'paypal',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal',
        plusHostedCheckoutIsFinalStep: false,
        registrationActivationOnlyModeEnabled: true,
      },
      expectedLastKey: 'plus-checkout-return',
    },
    {
      label: 'paypal-hosted',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal-hosted',
        registrationActivationOnlyModeEnabled: true,
      },
      expectedLastKey: 'paypal-hosted-review',
    },
    {
      label: 'gopay',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gopay',
        plusAccountAccessStrategy: 'sub2api_codex_session',
        registrationActivationOnlyModeEnabled: true,
      },
      expectedLastKey: 'gopay-subscription-confirm',
    },
    {
      label: 'gpc-helper',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gpc-helper',
        plusAccountAccessStrategy: 'cpa_codex_session',
        registrationActivationOnlyModeEnabled: true,
      },
      expectedLastKey: 'plus-checkout-billing',
    },
    {
      label: 'phone-plus',
      options: {
        plusModeEnabled: true,
        phonePlusModeEnabled: true,
        plusPaymentMethod: 'gopay',
        registrationActivationOnlyModeEnabled: true,
      },
      expectedLastKey: 'plus-check',
    },
  ];

  cases.forEach(({ label, options, expectedLastKey }) => {
    const steps = api.getSteps(options);
    const nodes = api.getNodes(options);
    const stepKeys = steps.map((step) => step.key);
    const nodeIds = nodes.map((node) => node.nodeId);

    assert.equal(stepKeys.at(-1), expectedLastKey, `${label} should end at activation checkpoint`);
    assert.equal(nodeIds.at(-1), expectedLastKey, `${label} node graph should end at activation checkpoint`);
    forbiddenTailKeys.forEach((key) => {
      assert.equal(stepKeys.includes(key), false, `${label} should not include ${key}`);
      assert.equal(nodeIds.includes(key), false, `${label} nodes should not include ${key}`);
    });
    assert.deepStrictEqual(nodes.at(-1)?.next, [], `${label} activation checkpoint should be terminal`);
  });

  const normalSteps = api.getSteps({
    registrationActivationOnlyModeEnabled: true,
  }).map((step) => step.key);
  assert.equal(normalSteps.includes('oauth-login'), true);
  assert.equal(normalSteps.includes('platform-verify'), true);
});

test('Plus session strategy swaps the OAuth tail for a single CPA import node', () => {
  const source = fs.readFileSync('data/step-definitions.js', 'utf8');
  const globalScope = {};
  const api = new Function('self', `${source}; return self.MultiPageStepDefinitions;`)(globalScope);
  const forbiddenTailKeys = [
    'oauth-login',
    'fetch-login-code',
    'post-login-phone-verification',
    'confirm-oauth',
    'platform-verify',
  ];

  [
    {
      label: 'paypal',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal',
        plusAccountAccessStrategy: 'cpa_codex_session',
      },
      previousNodeId: 'paypal-hosted-review',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
      label: 'paypal-hosted',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'paypal-hosted',
        plusAccountAccessStrategy: 'cpa_codex_session',
      },
      previousNodeId: 'paypal-hosted-review',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    {
      label: 'gopay',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gopay',
        plusAccountAccessStrategy: 'cpa_codex_session',
      },
      previousNodeId: 'gopay-subscription-confirm',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      label: 'gpc-helper',
      options: {
        plusModeEnabled: true,
        plusPaymentMethod: 'gpc-helper',
        plusAccountAccessStrategy: 'cpa_codex_session',
      },
      previousNodeId: 'plus-checkout-billing',
      expectedStepIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  ].forEach(({ label, options, previousNodeId, expectedStepIds }) => {
    const steps = api.getSteps(options);
    const nodes = api.getNodes(options);
    const stepKeys = steps.map((step) => step.key);
    const nodeIds = nodes.map((node) => node.nodeId);
    const previousNode = nodes.find((node) => node.nodeId === previousNodeId);
    const sessionImportNode = nodes.find((node) => node.nodeId === 'cpa-session-import');

    assert.equal(stepKeys.at(-1), 'cpa-session-import', `${label} should end with CPA session import`);
    assert.equal(nodeIds.at(-1), 'cpa-session-import', `${label} node order should end with CPA session import`);
    forbiddenTailKeys.forEach((key) => {
      assert.equal(stepKeys.includes(key), false, `${label} should not keep ${key} in CPA session mode`);
      assert.equal(nodeIds.includes(key), false, `${label} nodes should not keep ${key} in CPA session mode`);
    });
    assert.deepStrictEqual(api.getStepIds(options), expectedStepIds, `${label} step ids should follow the CPA tail`);
    assert.equal(api.getLastStepId(options), expectedStepIds.at(-1), `${label} last step id should match CPA session import`);
    assert.deepStrictEqual(previousNode?.next, ['cpa-session-import'], `${label} previous node should link to CPA session import`);
    assert.deepStrictEqual(sessionImportNode?.next, [], `${label} CPA session import should be terminal`);
  });
});

test('sidepanel html loads shared step definitions before sidepanel bootstrap', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const definitionsIndex = html.indexOf('<script src="../data/step-definitions.js"></script>');
  const sidepanelIndex = html.indexOf('<script src="sidepanel.js"></script>');

  assert.notEqual(definitionsIndex, -1);
  assert.notEqual(sidepanelIndex, -1);
  assert.ok(definitionsIndex < sidepanelIndex);
});

test('sidepanel html exposes Plus mode, PayPal, and GoPay settings', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  assert.match(html, /id="input-plus-mode-enabled"/);
  assert.match(html, /id="select-plus-payment-method"/);
  const plusPaymentSelect = html.match(/<select id="select-plus-payment-method"[\s\S]*?<\/select>/)?.[0] || '';
  assert.match(plusPaymentSelect, /<option value="gopay">GoPay<\/option>/);
  assert.doesNotMatch(plusPaymentSelect, /<!--[\s\S]*<option value="gopay">/);
  assert.match(html, /id="select-plus-checkout-verification-failure-strategy"/);
  assert.match(html, /id="input-browser-fingerprint-enabled"/);
  assert.match(html, /id="select-browser-fingerprint-level"/);
  assert.match(html, /id="select-paypal-account"/);
  assert.match(html, /id="btn-add-paypal-account"/);
  assert.match(html, /id="select-paypal-profile-country-code"/);
  assert.match(html, /id="input-gopay-phone"/);
  assert.match(html, /id="input-gopay-otp"/);
  assert.match(html, /id="input-gopay-pin"/);
  assert.match(html, /<option value="gpc-helper">GPC<\/option>/);
  assert.match(html, /id="btn-gpc-card-key-purchase"/);
  assert.match(html, /GPC API/);
  assert.match(html, /id="input-gpc-helper-api"/);
  assert.match(html, /id="btn-gpc-helper-convert-api-key"/);
  assert.match(html, /GPC API Key/);
  assert.match(html, /id="input-gpc-helper-card-key"/);
  assert.match(html, /id="select-gpc-helper-phone-mode"/);
  assert.match(html, /<option value="auto">/);
  assert.match(html, /id="btn-gpc-helper-balance"/);
  assert.match(html, /id="input-gpc-helper-phone"/);
  assert.match(html, /id="select-gpc-helper-otp-channel"/);
  assert.match(html, /id="input-gpc-helper-local-sms-enabled"/);
  assert.match(html, /id="input-gpc-helper-local-sms-url"/);
  assert.match(html, /id="input-gpc-helper-pin"/);
  assert.match(html, /id="shared-form-modal"/);
});
