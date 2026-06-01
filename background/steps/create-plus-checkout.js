(function attachBackgroundPlusCheckoutCreate(root, factory) {
  root.MultiPageBackgroundPlusCheckoutCreate = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundPlusCheckoutCreateModule() {
  const PLUS_CHECKOUT_SOURCE = 'plus-checkout';
  const PAYPAL_SOURCE = 'paypal-flow';
  const PLUS_CHECKOUT_ENTRY_URL = 'https://chatgpt.com/';
  const PLUS_CHECKOUT_INJECT_FILES = ['shared/plus-checkout-regions.js', 'content/utils.js', 'content/operation-delay.js', 'content/plus-checkout.js'];
  const PAYPAL_INJECT_FILES = ['content/utils.js', 'content/operation-delay.js', 'content/paypal-flow.js'];
  const PAYPAL_FLOW_SCRIPT_VERSION = '2026-06-01-hosted-phone-error-pt-v1';
  const PAYPAL_HOSTED_GET_STATE_MESSAGE = 'PAYPAL_HOSTED_GET_STATE_V2';
  const PAYPAL_RUN_HOSTED_CHECKOUT_STEP_MESSAGE = 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP_V2';
  const PAYPAL_HOSTED_DISMISS_PHONE_ERROR_MESSAGE = 'PAYPAL_HOSTED_DISMISS_PHONE_ERROR_V2';
  const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
  const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
  const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
  const PLUS_PAYMENT_METHOD_GPC_HELPER = 'gpc-helper';
  const DEFAULT_GPC_HELPER_API_URL = 'https://gpc.qlhazycoder.top';
  const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
  const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
  const HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL = 'fixed_pool';
  const HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS = 'phone_sms';
  const HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR = 'hero_sms_paypal_br';
  const HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY = 'hostedCheckoutPhoneSmsActivation';
  const HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY = 'hostedCheckoutPhoneSmsRequestedRegion';
  const HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY = 'hostedCheckoutPhoneSmsResolvedRegion';
  const HOSTED_CHECKOUT_HERO_SMS_PAYPAL_ACTIVATION_KEY = 'hostedCheckoutHeroSmsPayPalActivation';
  const HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY = 'hostedCheckoutHeroSmsPayPalCachedAt';
  const HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY = 'hostedCheckoutHeroSmsPayPalExpiresAt';
  const HERO_SMS_PAYPAL_BR_COUNTRY_ID = 73;
  const HERO_SMS_PAYPAL_BR_COUNTRY_LABEL = 'Brazil';
  const HERO_SMS_PAYPAL_BR_REGION = 'BR';
  const HERO_SMS_PAYPAL_SERVICE_CODE = 'paypal';
  const HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHE_TTL_MS = 20 * 60 * 1000;
  const HOSTED_CHECKOUT_US_ADDRESS_ENDPOINT = 'https://randomuser.me/api/?nat=us&inc=location&noinfo';
  const SUPPORTED_PLUS_CHECKOUT_PROFILE_COUNTRIES = Object.freeze(
    (typeof self !== 'undefined' && self.MultiPagePlusCheckoutRegions?.getSupportedRegionCodes)
      ? self.MultiPagePlusCheckoutRegions.getSupportedRegionCodes()
      : ['US', 'JP', 'BR', 'KZ', 'NP', 'IQ']
  );
  const HOSTED_CHECKOUT_SUCCESS_URL_PATTERN = /^https:\/\/(?:chatgpt\.com|www\.chatgpt\.com|chat\.openai\.com)\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i;
  const HOSTED_CHECKOUT_HOME_FALLBACK_URL = 'https://chatgpt.com/';
  const HOSTED_CHECKOUT_HOME_FALLBACK_ATTEMPTS = 2;
  const HOSTED_CHECKOUT_HOME_FALLBACK_RETRY_DELAY_MS = 3000;
  const PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_CONTINUE = 'continue';
  const PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY = 'retry';
  const PLUS_CHECKOUT_RETRY_COOKIE_CLEAR_DOMAINS = [
    'chatgpt.com',
    'chat.openai.com',
    'pay.openai.com',
    'openai.com',
    'auth.openai.com',
    'auth0.openai.com',
    'accounts.openai.com',
    'paypal.com',
    'stripe.com',
    'checkout.stripe.com',
    'meiguodizhi.com',
    'mail-api.yuecheng.shop',
    'yuecheng.shop',
  ];
  const PLUS_CHECKOUT_RETRY_COOKIE_CLEAR_ORIGINS = [
    'https://chatgpt.com',
    'https://chat.openai.com',
    'https://pay.openai.com',
    'https://auth.openai.com',
    'https://auth0.openai.com',
    'https://accounts.openai.com',
    'https://openai.com',
    'https://www.paypal.com',
    'https://paypal.com',
    'https://checkout.stripe.com',
    'https://www.meiguodizhi.com',
    'https://meiguodizhi.com',
    'https://mail-api.yuecheng.shop',
  ];
  const HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS = 120000;
  const HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS = 10 * 60 * 1000;
  const HOSTED_CHECKOUT_EMAIL_INPUT_STABLE_WAIT_MS = 5000;
  const HOSTED_CHECKOUT_EMAIL_INPUT_TIMEOUT_MS = 0;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS = 12;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS = 5000;
  const HOSTED_CHECKOUT_VERIFICATION_INVALID_RESEND_DELAY_MS = 3000;
  const HOSTED_CHECKOUT_FIRST_DIRECT_RESEND_DELAY_MS = 1000;
  const HOSTED_CHECKOUT_SMS_POOL_DISABLE_THRESHOLD = 2;
  const HOSTED_CHECKOUT_RESEND_WAIT_MIN_SECONDS = 0;
  const HOSTED_CHECKOUT_RESEND_WAIT_MAX_SECONDS = 300;
  const HOSTED_CHECKOUT_FIRST_RESEND_WAIT_DEFAULT_SECONDS = 20;
  const HOSTED_CHECKOUT_SUBSEQUENT_RESEND_WAIT_DEFAULT_SECONDS = 25;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_DEFAULT = 6;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_LIMIT = 60;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_DEFAULT_SECONDS = 5;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_LIMIT_SECONDS = 60;
  const HOSTED_CHECKOUT_SMS_POOL_MAX_USES_DEFAULT = 3;
  const HOSTED_CHECKOUT_SMS_POOL_MAX_USES_LIMIT = 99;
  const HOSTED_CHECKOUT_PAYPAL_BLOCKED_ERROR_PREFIX = 'HOSTED_CHECKOUT_PAYPAL_BLOCKED::';
  const HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX = 'HOSTED_CHECKOUT_GENERIC_ERROR::';
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX = 'HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT::';
  const HOSTED_CHECKOUT_CARD_FALLBACK_ERROR_PREFIX = 'HOSTED_CHECKOUT_CARD_FALLBACK::';
  const HOSTED_CHECKOUT_CARD_DECLINED_ERROR_PREFIX = 'HOSTED_CHECKOUT_CARD_DECLINED::';
  const PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX = 'PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL::';
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS = 1;
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS_DEFAULT = 1;
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS_LIMIT = 10;
  const HOSTED_CHECKOUT_OPENAI_ADDRESS_RETRY_MAX_ATTEMPTS = 3;
  const HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS = 10;
  const HOSTED_CHECKOUT_PAYPAL_ADDRESS_RETRY_MAX_ATTEMPTS = 10;
  const HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS = 3;
  const PHONE_PLUS_CHECK_MAX_ATTEMPTS = 3;
  const DEFAULT_BROWSER_FINGERPRINT_ACCEPT_LANGUAGE = 'zh-CN,zh;q=0.9,en;q=0.8';
  const HOSTED_CHECKOUT_GUEST_CARD_ERROR_SETTLE_MS = 8000;
  const PAYPAL_HOSTED_PHONE_ERROR_DISMISS_DELAY_MS = 3000;
  const PAYPAL_GENERIC_ERROR_SESSION_SETTLE_WAIT_MS = 5000;
  const PAYPAL_HOSTED_STAGE_OUTSIDE = 'outside_paypal';
  const PAYPAL_HOSTED_STAGE_LOGIN = 'pay_login';
  const PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT = 'guest_checkout';
  const PAYPAL_HOSTED_STAGE_VERIFICATION = 'verification';
  const PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT = 'create_account';
  const PAYPAL_HOSTED_STAGE_REVIEW = 'review_consent';
  const PAYPAL_HOSTED_STAGE_APPROVAL = 'approval';
  const PAYPAL_HOSTED_STAGE_BLOCKED = 'blocked';
  const PAYPAL_HOSTED_STAGE_GENERIC_ERROR = 'generic_error';
  const PAYPAL_HOSTED_STAGE_UNKNOWN = 'unknown';
  const PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT = 'paypal-hosted-openai-checkout';
  const PAYPAL_HOSTED_STEP_EMAIL = 'paypal-hosted-email';
  const PAYPAL_HOSTED_STEP_CARD = 'paypal-hosted-card';
  const PAYPAL_HOSTED_STEP_CREATE_ACCOUNT = 'paypal-hosted-create-account';
  const PAYPAL_HOSTED_STEP_REVIEW = 'paypal-hosted-review';
  const PAYPAL_HOSTED_STEP_META = Object.freeze({
    [PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT]: { step: 6, label: '创建 PayPal 无卡直绑 Checkout' },
    [PAYPAL_HOSTED_STEP_EMAIL]: { step: 7, label: '无卡直绑 PayPal 邮箱页' },
    [PAYPAL_HOSTED_STEP_CARD]: { step: 8, label: '无卡直绑 PayPal 资料页' },
    [PAYPAL_HOSTED_STEP_CREATE_ACCOUNT]: { step: 9, label: '无卡直绑 PayPal 创建确认页' },
    [PAYPAL_HOSTED_STEP_REVIEW]: { step: 10, label: '无卡直绑 PayPal 授权复核页' },
  });
  const HOSTED_CHECKOUT_US_FALLBACK_ADDRESSES = Object.freeze([
    Object.freeze({
      street: '1600 Pennsylvania Ave NW',
      city: 'Washington',
      state: 'District of Columbia',
      zip: '20500',
    }),
    Object.freeze({
      street: '350 Fifth Avenue',
      city: 'New York',
      state: 'New York',
      zip: '10118',
    }),
    Object.freeze({
      street: '1 Main St',
      city: 'Austin',
      state: 'Texas',
      zip: '73301',
    }),
  ]);
  const HOSTED_CHECKOUT_REGIONAL_FALLBACK_ADDRESSES = Object.freeze({
    US: HOSTED_CHECKOUT_US_FALLBACK_ADDRESSES,
    JP: Object.freeze([
      Object.freeze({
        street: 'Marunouchi 1-1',
        city: 'Chiyoda-ku',
        state: 'Tokyo',
        zip: '100-0005',
        countryCode: 'JP',
        country: 'Japan',
      }),
      Object.freeze({
        street: 'Umeda 3-1',
        city: 'Kita-ku',
        state: 'Osaka',
        zip: '530-0001',
        countryCode: 'JP',
        country: 'Japan',
      }),
    ]),
    BR: Object.freeze([
      Object.freeze({
        street: 'Avenida Paulista 1578',
        city: 'Sao Paulo',
        state: 'Sao Paulo',
        zip: '01310-200',
        countryCode: 'BR',
        country: 'Brazil',
      }),
      Object.freeze({
        street: 'Avenida Atlantica 1702',
        city: 'Rio de Janeiro',
        state: 'Rio de Janeiro',
        zip: '22021-001',
        countryCode: 'BR',
        country: 'Brazil',
      }),
      Object.freeze({
        street: 'Praca Maua 1',
        city: 'Rio de Janeiro',
        state: 'Rio de Janeiro',
        zip: '20081-240',
        countryCode: 'BR',
        country: 'Brazil',
      }),
    ]),
    KZ: Object.freeze([
      Object.freeze({
        street: 'Dostyk Avenue 52',
        city: 'Almaty',
        state: 'Almaty',
        zip: '050010',
        countryCode: 'KZ',
        country: 'Kazakhstan',
      }),
      Object.freeze({
        street: 'Dostyq Street 16',
        city: 'Astana',
        state: 'Astana',
        zip: '010000',
        countryCode: 'KZ',
        country: 'Kazakhstan',
      }),
    ]),
    NP: Object.freeze([
      Object.freeze({
        street: 'Durbar Marg',
        city: 'Kathmandu',
        state: 'Bagmati',
        zip: '44600',
        countryCode: 'NP',
        country: 'Nepal',
      }),
      Object.freeze({
        street: 'Pulchowk Road',
        city: 'Lalitpur',
        state: 'Bagmati',
        zip: '44700',
        countryCode: 'NP',
        country: 'Nepal',
      }),
    ]),
    IQ: Object.freeze([
      Object.freeze({
        street: 'Al Kindi Street',
        city: 'Baghdad',
        state: 'Baghdad',
        zip: '10001',
        countryCode: 'IQ',
        country: 'Iraq',
      }),
      Object.freeze({
        street: 'Gulan Street',
        city: 'Erbil',
        state: 'Erbil',
        zip: '44001',
        countryCode: 'IQ',
        country: 'Iraq',
      }),
    ]),
  });
  const HOSTED_CHECKOUT_REGIONAL_NAMES = Object.freeze({
    US: Object.freeze({
      firstNames: Object.freeze(['James', 'John', 'Robert', 'Michael', 'William', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth']),
      lastNames: Object.freeze(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Anderson']),
    }),
    JP: Object.freeze({
      firstNames: Object.freeze(['Haruto', 'Yuto', 'Sota', 'Ren', 'Yuma', 'Yui', 'Aoi', 'Hina', 'Sakura', 'Mei']),
      lastNames: Object.freeze(['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato']),
    }),
    BR: Object.freeze({
      firstNames: Object.freeze(['Lucas', 'Gabriel', 'Rafael', 'Pedro', 'Matheus', 'Mariana', 'Juliana', 'Camila', 'Ana', 'Beatriz']),
      lastNames: Object.freeze(['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima']),
    }),
    KZ: Object.freeze({
      firstNames: Object.freeze(['Ayan', 'Dias', 'Nursultan', 'Arman', 'Timur', 'Aigerim', 'Dana', 'Amina', 'Madina', 'Aliya']),
      lastNames: Object.freeze(['Nurbekov', 'Suleimenov', 'Akhmetov', 'Omarov', 'Karimov', 'Iskakov', 'Tulegenov', 'Sadykov', 'Yessenov', 'Abilov']),
    }),
    NP: Object.freeze({
      firstNames: Object.freeze(['Aarav', 'Suman', 'Bikash', 'Ramesh', 'Prakash', 'Anita', 'Sita', 'Maya', 'Puja', 'Sabina']),
      lastNames: Object.freeze(['Shrestha', 'Karki', 'Rai', 'Gurung', 'Tamang', 'Thapa', 'Adhikari', 'Basnet', 'Lama', 'KC']),
    }),
    IQ: Object.freeze({
      firstNames: Object.freeze(['Ali', 'Omar', 'Hassan', 'Mustafa', 'Ahmed', 'Fatima', 'Zahra', 'Noor', 'Mariam', 'Sara']),
      lastNames: Object.freeze(['Hussein', 'Abbas', 'Alwan', 'Karim', 'Saleh', 'Mahdi', 'Jassim', 'Kadhim', 'Rahman', 'Yasin']),
    }),
  });

  function createPlusCheckoutCreateExecutor(deps = {}) {
    const {
      addLog: rawAddLog = async () => {},
      broadcastDataUpdate = null,
      chrome,
      completeNodeFromBackground,
      createAutomationTab = null,
      ensureHotmailAccountForFlow = null,
      ensureLuckmailPurchaseForFlow = null,
      ensurePhonePrefixedCloudflareTempEmail = null,
      fetchCloudMailAddress = null,
      fetchGeneratedEmail = null,
      fetchYydsMailAddress = null,
      ensureContentScriptReadyOnTabUntilStopped,
      fetch: fetchImpl = null,
      getCurrentMail2925Account = null,
      getTabId = null,
      getState = null,
      getPlusPaymentEmailState = null,
      isTabAlive = null,
      isHotmailProvider = null,
      isLuckmailProvider = null,
      isYydsMailProvider = null,
      normalizeCloudflareTempEmailReceiveMailbox = null,
      normalizeCloudMailReceiveMailbox = null,
      queryTabsInAutomationWindow = null,
      registerTab,
      sendTabMessageUntilStopped,
      setPlusPaymentEmailState = null,
      setState,
      sleepWithStop,
      waitForTabCompleteUntilStopped,
      waitForTabUrlMatchUntilStopped = null,
      throwIfStopped = () => {},
      checkoutConversionProxyManager = null,
      phoneVerificationHelpers = null,
      resolvePlusCheckoutProfileRegion = null,
      resolvePlusCheckoutRegionalBillingDetails = null,
    } = deps;

    function addLog(message, level = 'info', options = {}) {
      return rawAddLog(message, level, {
        step: 6,
        stepKey: 'plus-checkout-create',
        ...(options && typeof options === 'object' ? options : {}),
      });
    }

    function addHostedStepLog(stepKey, message, level = 'info', options = {}) {
      const meta = PAYPAL_HOSTED_STEP_META[stepKey] || {};
      return rawAddLog(message, level, {
        step: meta.step || 6,
        stepKey,
        ...(options && typeof options === 'object' ? options : {}),
      });
    }

    function getBrowserFingerprintAcceptLanguageForState(state = {}) {
      const acceptLanguage = String(state?.browserFingerprintProfile?.acceptLanguage || '').trim();
      return acceptLanguage || DEFAULT_BROWSER_FINGERPRINT_ACCEPT_LANGUAGE;
    }

    function normalizeRetryCookieDomain(domain) {
      return String(domain || '').trim().replace(/^\.+/, '').toLowerCase();
    }

    function shouldClearPlusCheckoutRetryCookie(cookie) {
      const domain = normalizeRetryCookieDomain(cookie?.domain);
      if (!domain) return false;
      return PLUS_CHECKOUT_RETRY_COOKIE_CLEAR_DOMAINS.some((target) => (
        domain === target || domain.endsWith(`.${target}`)
      ));
    }

    function buildPlusCheckoutRetryCookieRemovalUrl(cookie) {
      const host = normalizeRetryCookieDomain(cookie?.domain);
      const rawPath = String(cookie?.path || '/');
      const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      return `https://${host}${path}`;
    }

    function buildPlusCheckoutRetryCookieKey(cookie, fallbackStoreId = '') {
      return [
        cookie?.storeId || fallbackStoreId || '',
        cookie?.domain || '',
        cookie?.path || '',
        cookie?.name || '',
        cookie?.partitionKey ? JSON.stringify(cookie.partitionKey) : '',
      ].join('|');
    }

    async function collectPlusCheckoutRetryCookies() {
      if (!chrome?.cookies?.getAll) {
        return [];
      }
      const stores = chrome.cookies.getAllCookieStores
        ? await chrome.cookies.getAllCookieStores()
        : [{ id: undefined }];
      const queryDomains = Array.from(new Set(
        PLUS_CHECKOUT_RETRY_COOKIE_CLEAR_DOMAINS
          .map((domain) => normalizeRetryCookieDomain(domain))
          .filter(Boolean)
      ));
      const cookies = [];
      const seen = new Set();

      for (const store of stores || []) {
        const storeId = store?.id;
        for (const domain of queryDomains) {
          let batch = [];
          try {
            batch = await chrome.cookies.getAll(storeId ? { storeId, domain } : { domain });
          } catch (error) {
            console.warn('[MultiPage:plus-checkout-retry] query cookies failed', {
              storeId: storeId || '',
              domain,
              message: error?.message || String(error || 'unknown error'),
            });
            continue;
          }
          for (const cookie of batch || []) {
            if (!shouldClearPlusCheckoutRetryCookie(cookie)) continue;
            const key = buildPlusCheckoutRetryCookieKey(cookie, storeId);
            if (seen.has(key)) continue;
            seen.add(key);
            cookies.push(cookie);
          }
        }
      }

      return cookies;
    }

    async function removePlusCheckoutRetryCookie(cookie) {
      if (!chrome?.cookies?.remove) {
        return false;
      }
      const details = {
        url: buildPlusCheckoutRetryCookieRemovalUrl(cookie),
        name: cookie.name,
      };
      if (cookie.storeId) {
        details.storeId = cookie.storeId;
      }
      if (cookie.partitionKey) {
        details.partitionKey = cookie.partitionKey;
      }
      try {
        const result = await chrome.cookies.remove(details);
        return Boolean(result);
      } catch (error) {
        console.warn('[MultiPage:plus-checkout-retry] remove cookie failed', {
          domain: cookie?.domain,
          name: cookie?.name,
          message: error?.message || String(error || 'unknown error'),
        });
        return false;
      }
    }

    function isPlusCheckoutRetryPaymentTabUrl(url = '') {
      const rawUrl = String(url || '').trim();
      if (!rawUrl) {
        return false;
      }
      try {
        const parsed = new URL(rawUrl);
        const hostname = String(parsed.hostname || '').toLowerCase();
        const pathname = String(parsed.pathname || '/');
        if (hostname === 'chatgpt.com' || hostname === 'www.chatgpt.com' || hostname === 'chat.openai.com') {
          return /^\/checkout(?:\/|$)/i.test(pathname)
            || /^\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i.test(pathname);
        }
        if (hostname === 'pay.openai.com' || hostname === 'checkout.stripe.com') {
          return true;
        }
        if (hostname === 'paypal.com' || hostname.endsWith('.paypal.com')) {
          return true;
        }
        return false;
      } catch {
        return /chatgpt\.com\/checkout|pay\.openai\.com|checkout\.stripe\.com|paypal\./i.test(rawUrl);
      }
    }

    async function getTabForRetryCleanup(tabId) {
      const normalizedTabId = Number(tabId) || 0;
      if (!normalizedTabId || !chrome?.tabs?.get) {
        return null;
      }
      return chrome.tabs.get(normalizedTabId).catch(() => null);
    }

    function addRetryCleanupTabCandidate(candidates, tab, options = {}) {
      const tabId = Number(tab?.id);
      if (!Number.isInteger(tabId) || tabId <= 0 || candidates.has(tabId)) {
        return;
      }
      const url = String(tab?.url || '').trim();
      if (!options.force && !isPlusCheckoutRetryPaymentTabUrl(url)) {
        return;
      }
      candidates.set(tabId, {
        id: tabId,
        url,
      });
    }

    async function collectPlusCheckoutRetryTabs(state = {}) {
      const candidates = new Map();
      const storedTab = await getTabForRetryCleanup(state?.plusCheckoutTabId);
      addRetryCleanupTabCandidate(candidates, storedTab, { force: true });

      if (typeof getTabId === 'function') {
        for (const source of [PLUS_CHECKOUT_SOURCE, PAYPAL_SOURCE]) {
          const tabId = await Promise.resolve(getTabId(source)).catch(() => 0);
          const tab = await getTabForRetryCleanup(tabId);
          addRetryCleanupTabCandidate(candidates, tab, { force: true });
        }
      }

      const queryTabs = typeof queryTabsInAutomationWindow === 'function'
        ? queryTabsInAutomationWindow
        : (chrome?.tabs?.query ? (queryInfo) => chrome.tabs.query(queryInfo) : null);
      if (typeof queryTabs === 'function') {
        const tabs = await queryTabs({}).catch(() => []);
        for (const tab of Array.isArray(tabs) ? tabs : []) {
          addRetryCleanupTabCandidate(candidates, tab, { force: false });
        }
      }

      return Array.from(candidates.values());
    }

    async function closePlusCheckoutRetryTabs(state = {}) {
      if (!chrome?.tabs?.remove) {
        await addLog('步骤 6：Plus Checkout 重试前无法访问 tabs API，跳过旧支付标签关闭。', 'warn');
        return 0;
      }
      const tabs = await collectPlusCheckoutRetryTabs(state);
      let closedCount = 0;
      for (const tab of tabs) {
        try {
          await chrome.tabs.remove(tab.id);
          closedCount += 1;
        } catch {
          // Tab may already be gone.
        }
      }
      return closedCount;
    }

    async function clearPlusCheckoutRetryCookies() {
      if (!chrome?.cookies?.getAll || !chrome?.cookies?.remove) {
        await addLog('步骤 6：Plus Checkout 重试前无法访问 cookies API，跳过支付 cookies 清理。', 'warn');
        return 0;
      }
      const cookies = await collectPlusCheckoutRetryCookies();
      let removedCount = 0;
      for (const cookie of cookies) {
        if (await removePlusCheckoutRetryCookie(cookie)) {
          removedCount += 1;
        }
      }
      if (chrome.browsingData?.removeCookies) {
        try {
          await chrome.browsingData.removeCookies({
            since: 0,
            origins: PLUS_CHECKOUT_RETRY_COOKIE_CLEAR_ORIGINS,
          });
        } catch (error) {
          await addLog(`步骤 6：Plus Checkout 重试前 browsingData 补扫 cookies 失败：${error?.message || String(error || '未知错误')}`, 'warn');
        }
      }
      return removedCount;
    }

    async function clearPlusCheckoutRetryState() {
      if (typeof getState !== 'function' || typeof setState !== 'function') {
        return;
      }
      const latestState = await getState().catch(() => ({}));
      const registry = latestState?.tabRegistry && typeof latestState.tabRegistry === 'object'
        ? { ...latestState.tabRegistry }
        : {};
      registry[PLUS_CHECKOUT_SOURCE] = null;
      registry[PAYPAL_SOURCE] = null;
      await setState({
        plusCheckoutTabId: null,
        plusCheckoutUrl: '',
        plusCheckoutRetryCleanupRequested: false,
        plusCheckoutRetryCleanupReason: '',
        tabRegistry: registry,
      });
    }

    function shouldCleanupBeforePlusCheckoutCreate(state = {}, options = {}) {
      return Boolean(
        options?.retryCleanupBeforeCreate
        || state?.plusCheckoutRetryCleanupRequested
        || state?.plusCheckoutVerificationRetryRequested
      );
    }

    async function cleanupBeforePlusCheckoutRetryCreate(state = {}, options = {}) {
      if (!shouldCleanupBeforePlusCheckoutCreate(state, options)) {
        return {
          skipped: true,
        };
      }
      const reason = String(
        options?.retryCleanupReason
        || state?.plusCheckoutRetryCleanupReason
        || state?.plusCheckoutVerificationRetryReason
        || state?.plusHostedCheckoutVerificationFailureReason
        || 'Plus Checkout retry'
      ).trim() || 'Plus Checkout retry';
      await addLog(`步骤 6：Plus Checkout 重试前正在关闭旧支付标签并清理支付 cookies。原因：${reason}`, 'info');
      let closedTabs = 0;
      let removedCookies = 0;
      try {
        closedTabs = await closePlusCheckoutRetryTabs(state);
      } catch (error) {
        await addLog(`步骤 6：Plus Checkout 重试前关闭旧支付标签失败，继续重建 checkout：${error?.message || String(error || '未知错误')}`, 'warn');
      }
      try {
        removedCookies = await clearPlusCheckoutRetryCookies();
      } catch (error) {
        await addLog(`步骤 6：Plus Checkout 重试前清理支付 cookies 失败，继续重建 checkout：${error?.message || String(error || '未知错误')}`, 'warn');
      }
      try {
        await clearPlusCheckoutRetryState();
      } catch (error) {
        await addLog(`步骤 6：Plus Checkout 重试前清理运行状态失败，继续重建 checkout：${error?.message || String(error || '未知错误')}`, 'warn');
      }
      await addLog(`步骤 6：Plus Checkout 重试前清理完成：已关闭 ${closedTabs} 个旧支付标签，已删除 ${removedCookies} 个支付 cookies。`, 'ok');
      return {
        skipped: false,
        closedTabs,
        removedCookies,
      };
    }

    function normalizePlusPaymentMethod(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizePlusPaymentMethod) {
        return rootScope.GoPayUtils.normalizePlusPaymentMethod(value);
      }
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED || normalized === 'paypal_direct' || normalized === 'paypal-direct') {
        return PLUS_PAYMENT_METHOD_PAYPAL_HOSTED;
      }
      if (normalized === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return PLUS_PAYMENT_METHOD_GPC_HELPER;
      }
      return normalized === PLUS_PAYMENT_METHOD_GOPAY ? PLUS_PAYMENT_METHOD_GOPAY : PLUS_PAYMENT_METHOD_PAYPAL;
    }

    function normalizeHostedCheckoutSmsSource(value = '') {
      const normalized = String(value || '').trim().toLowerCase().replace(/-/g, '_');
      if (normalized === HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS) {
        return HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS;
      }
      if (normalized === HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR) {
        return HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR;
      }
      return HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL;
    }

    function normalizeHostedCheckoutPhoneSmsActivation(record = null) {
      if (phoneVerificationHelpers?.normalizeActivation) {
        return phoneVerificationHelpers.normalizeActivation(record);
      }
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        return null;
      }
      const activationId = String(record.activationId || record.id || record.activation || '').trim();
      const phoneNumber = String(record.phoneNumber || record.number || record.phone || '').trim();
      if (!activationId || !phoneNumber) {
        return null;
      }
      return {
        ...record,
        activationId,
        phoneNumber,
        provider: String(record.provider || '').trim(),
        successfulUses: Math.max(0, Math.floor(Number(record.successfulUses) || 0)),
        maxUses: Math.max(1, Math.floor(Number(record.maxUses) || 3)),
      };
    }

    function normalizeHostedPhoneSmsRegionCode(value = '') {
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (normalized === 'UK') {
        return 'GB';
      }
      return /^[A-Z]{2}$/.test(normalized) ? normalized : '';
    }

    function isHostedCheckoutPhoneSmsReusable(state = {}, activation = null) {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(activation);
      if (!normalizedActivation) {
        return false;
      }
      if (state?.phoneSmsReuseEnabled === false) {
        return false;
      }
      const provider = String(normalizedActivation.provider || '').trim().toLowerCase();
      if (provider !== 'hero-sms' && provider !== '5sim') {
        return false;
      }
      return Math.max(0, Number(normalizedActivation.successfulUses) || 0)
        < Math.max(1, Number(normalizedActivation.maxUses) || 1);
    }

    function isHostedCheckoutHeroSmsPayPalActivation(activation = null) {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(activation);
      if (!normalizedActivation) {
        return false;
      }
      return String(normalizedActivation.hostedCheckoutSmsSource || '').trim() === HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR
        || String(normalizedActivation.source || '').trim() === 'hosted-hero-sms-paypal-br'
        || (
          String(normalizedActivation.provider || '').trim().toLowerCase() === 'hero-sms'
          && String(normalizedActivation.serviceCode || '').trim().toLowerCase() === HERO_SMS_PAYPAL_SERVICE_CODE
          && Number(normalizedActivation.countryId) === HERO_SMS_PAYPAL_BR_COUNTRY_ID
        );
    }

    function normalizePlusCheckoutVerificationFailureStrategy(value = '') {
      return String(value || '').trim().toLowerCase() === PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY
        ? PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY
        : PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_CONTINUE;
    }

    function isHostedCheckoutFinalStepEnabled(state = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      if (paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED) {
        return true;
      }
      if (paymentMethod !== PLUS_PAYMENT_METHOD_PAYPAL) {
        return false;
      }
      const plusModeEnabled = Boolean(state?.plusModeEnabled || state?.phonePlusModeEnabled);
      if (!plusModeEnabled) {
        return false;
      }
      return state?.plusHostedCheckoutIsFinalStep !== false;
    }

    function getCheckoutModeLabel(state = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return 'GPC 订阅页';
      }
      if (isHostedCheckoutFinalStepEnabled(state)) {
        return 'PayPal 无卡直绑';
      }
      return paymentMethod === PLUS_PAYMENT_METHOD_GOPAY ? 'GoPay 订阅页' : 'Plus Checkout';
    }

    function getPlusPaymentMethodLabel(method = PLUS_PAYMENT_METHOD_PAYPAL) {
      const paymentMethod = normalizePlusPaymentMethod(method);
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return 'GPC';
      }
      if (paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED) {
        return 'PayPal 无卡直绑';
      }
      return paymentMethod === PLUS_PAYMENT_METHOD_GOPAY ? 'GoPay' : 'PayPal';
    }

    function isPhonePlusModeState(state = {}) {
      return Boolean(state?.phonePlusModeEnabled || state?.phonePlusMode);
    }

    function isPlusModeState(state = {}) {
      return Boolean(state?.plusModeEnabled || state?.phonePlusModeEnabled || state?.phonePlusMode);
    }

    const PLUS_CHECK_ALLOWED_REGION_OPTIONS = Object.freeze(['KZ', 'BR', 'JP', 'NP', 'IQ', 'US']);
    const PLUS_CHECK_ALLOWED_REGION_SET = new Set(PLUS_CHECK_ALLOWED_REGION_OPTIONS);

    function normalizePlusCheckAllowedRegionCode(value = '') {
      const compact = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (PLUS_CHECK_ALLOWED_REGION_SET.has(compact)) return compact;
      const lower = String(value || '').trim().toLowerCase();
      if (/\b(?:kz|kazakhstan)\b/.test(lower)) return 'KZ';
      if (/\b(?:br|bra|brazil|brasil)\b/.test(lower)) return 'BR';
      if (/\b(?:jp|jpn|japan)\b/.test(lower)) return 'JP';
      if (/\b(?:np|nepal)\b/.test(lower)) return 'NP';
      if (/\b(?:iq|iraq)\b/.test(lower)) return 'IQ';
      if (/\b(?:us|usa|united\s+states|america)\b/.test(lower)) return 'US';
      return '';
    }

    function normalizePlusCheckAllowedRegions(value = []) {
      const tokens = Array.isArray(value)
        ? value
        : String(value || '').split(/[\s,;|/]+/);
      const selected = new Set();
      tokens.forEach((entry) => {
        const code = normalizePlusCheckAllowedRegionCode(entry);
        if (code) selected.add(code);
      });
      return PLUS_CHECK_ALLOWED_REGION_OPTIONS.filter((code) => selected.has(code));
    }

    function getPlusRegistrationRegionGateResult(state = {}) {
      const allowedRegions = normalizePlusCheckAllowedRegions(state?.plusCheckAllowedRegions);
      const rawExitRegion = String(state?.ipProxyAppliedExitRegion || '').trim();
      const exitRegion = normalizePlusCheckAllowedRegionCode(rawExitRegion);
      if (!allowedRegions.length) {
        return { enabled: false, allowedRegions, rawExitRegion, exitRegion, matched: true };
      }
      return {
        enabled: true,
        allowedRegions,
        rawExitRegion,
        exitRegion,
        matched: Boolean(exitRegion && allowedRegions.includes(exitRegion)),
      };
    }

    function normalizePlusRegistrationFreeStatus(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      return ['free', 'paid', 'plus'].includes(normalized) ? normalized : 'unknown';
    }

    function isPhoneSignupPhonePrefixedEmailEnabled(state = {}) {
      return state?.phoneSignupPhonePrefixedEmailEnabled !== false;
    }

    function getPhonePrefixedCloudflarePaymentSource(state = {}) {
      const generator = String(state?.emailGenerator || '').trim().toLowerCase();
      return generator === 'cloudflare'
        ? 'registration:phone-prefix-cloudflare-email'
        : 'registration:phone-prefix-cloudflare-temp-email';
    }

    function normalizeString(value = '') {
      return String(value || '').trim();
    }

    function firstNonEmpty(...values) {
      for (const value of values) {
        const normalized = normalizeString(value);
        if (normalized) {
          return normalized;
        }
      }
      return '';
    }

    function normalizeHostedProfileCountryCode(value = '', fallback = 'US') {
      const raw = String(value || '').trim();
      const compact = raw.toUpperCase().replace(/[^A-Z]/g, '');
      let normalized = /^[A-Z]{2}$/.test(compact) ? compact : '';
      if (!normalized) {
        const lower = raw.toLowerCase();
        if (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower)) normalized = 'US';
        else if (/\b(?:jp|jpn|japan)\b|日本/.test(lower)) normalized = 'JP';
        else if (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower)) normalized = 'BR';
        else if (/\b(?:kz|kazakhstan)\b|哈萨克/.test(lower)) normalized = 'KZ';
        else if (/\b(?:np|nepal)\b|尼泊尔/.test(lower)) normalized = 'NP';
        else if (/\b(?:iq|iraq)\b|伊拉克/.test(lower)) normalized = 'IQ';
      }
      if (!normalized) {
        const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
        normalized = bracketMatch ? bracketMatch[1].toUpperCase() : '';
      }
      if (SUPPORTED_PLUS_CHECKOUT_PROFILE_COUNTRIES.includes(normalized)) {
        return normalized;
      }
      return SUPPORTED_PLUS_CHECKOUT_PROFILE_COUNTRIES.includes(fallback) ? fallback : 'US';
    }

    function normalizeHostedProfileCountryPreference(value = '') {
      const raw = normalizeString(value);
      if (!raw) {
        return '';
      }
      const compact = raw.toUpperCase().replace(/[^A-Z]/g, '');
      if (SUPPORTED_PLUS_CHECKOUT_PROFILE_COUNTRIES.includes(compact)) {
        return compact;
      }
      const lower = raw.toLowerCase();
      if (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower)) return 'US';
      if (/\b(?:jp|jpn|japan)\b|日本/.test(lower)) return 'JP';
      if (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower)) return 'BR';
      if (/\b(?:kz|kazakhstan)\b|哈萨克/.test(lower)) return 'KZ';
      if (/\b(?:np|nepal)\b|尼泊尔/.test(lower)) return 'NP';
      if (/\b(?:iq|iraq)\b|伊拉克/.test(lower)) return 'IQ';
      const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
      const bracketCountry = bracketMatch ? bracketMatch[1].toUpperCase() : '';
      return SUPPORTED_PLUS_CHECKOUT_PROFILE_COUNTRIES.includes(bracketCountry) ? bracketCountry : '';
    }

    function getHostedCountryName(countryCode = '') {
      const normalized = normalizeHostedProfileCountryCode(countryCode, 'US');
      return {
        US: 'United States',
        JP: 'Japan',
        BR: 'Brazil',
        KZ: 'Kazakhstan',
        NP: 'Nepal',
        IQ: 'Iraq',
      }[normalized] || normalized;
    }

    function pickHostedRegionalName(countryCode = '') {
      const normalized = normalizeHostedProfileCountryCode(countryCode, 'US');
      const pool = HOSTED_CHECKOUT_REGIONAL_NAMES[normalized] || HOSTED_CHECKOUT_REGIONAL_NAMES.US;
      const pick = (list = []) => {
        const values = Array.isArray(list) ? list : [];
        return values.length ? String(values[Math.floor(Math.random() * values.length)] || '').trim() : '';
      };
      return {
        firstName: pick(pool.firstNames),
        lastName: pick(pool.lastNames),
      };
    }

    async function resolveHostedProfileRegionForState(state = {}, options = {}) {
      const preferredCountryCode = normalizeHostedProfileCountryPreference(state?.paypalProfileCountryCode);
      if (preferredCountryCode) {
        return {
          countryCode: preferredCountryCode,
          preferenceApplied: true,
        };
      }
      if (typeof resolvePlusCheckoutProfileRegion === 'function') {
        const resolved = await resolvePlusCheckoutProfileRegion(state, {
          context: options?.context || 'paypal-hosted-profile',
        }).catch((error) => ({
          countryCode: 'US',
          exitRegion: '',
          fallbackApplied: true,
          error: error?.message || String(error || ''),
        }));
        return {
          ...(resolved && typeof resolved === 'object' ? resolved : {}),
          countryCode: normalizeHostedProfileCountryCode(resolved?.countryCode || resolved?.exitRegion || 'US', 'US'),
        };
      }
      const exitRegion = firstNonEmpty(
        state?.plusCheckoutConversionProxyExitCheck?.exitRegion,
        state?.plusCheckoutConversionProxySession?.exitRegion,
        state?.plusCheckoutConversionProxyManualSession?.exitRegion,
        state?.ipProxyAppliedExitRegion
      );
      return {
        countryCode: normalizeHostedProfileCountryCode(exitRegion, 'US'),
        exitRegion,
        fallbackApplied: !normalizeHostedProfileCountryCode(exitRegion, ''),
      };
    }

    async function resolveHostedPhoneSmsRegionForState(state = {}) {
      const source = String(state?.plusCheckoutConversionProxySource || '').trim().toLowerCase();
      const configuredRegion = normalizeHostedPhoneSmsRegionCode(
        source === '711proxy_pool'
          ? state?.plusCheckoutConversionProxy711Region
          : (source === 'ip_proxy'
            ? firstNonEmpty(
              state?.ipProxyAppliedRegion,
              state?.ipProxyRegion,
              state?.ipProxyAppliedExitRegion,
              state?.ipProxyExitRegion
            )
            : '')
      );
      if (configuredRegion) {
        return {
          countryCode: configuredRegion,
          source: 'configured',
        };
      }
      const detectedRegion = normalizeHostedPhoneSmsRegionCode(firstNonEmpty(
        state?.plusCheckoutConversionProxyExitCheck?.exitRegion,
        state?.plusCheckoutConversionProxySession?.exitRegion,
        state?.plusCheckoutConversionProxyManualSession?.exitRegion,
        state?.ipProxyAppliedExitRegion,
        state?.ipProxyExitRegion
      ));
      if (detectedRegion) {
        return {
          countryCode: detectedRegion,
          source: 'detected',
        };
      }
      if (typeof resolvePlusCheckoutProfileRegion === 'function') {
        const resolved = await resolvePlusCheckoutProfileRegion(state, {
          context: 'paypal-hosted-phone-sms-region',
        }).catch(() => null);
        const fallbackRegion = normalizeHostedPhoneSmsRegionCode(resolved?.exitRegion || resolved?.countryCode || '');
        if (fallbackRegion) {
          return {
            countryCode: fallbackRegion,
            source: 'profile-region',
          };
        }
      }
      return {
        countryCode: '',
        source: '',
      };
    }

    function collectSessionFieldValues(root, targetKeys = []) {
      const normalizedTargets = new Set((Array.isArray(targetKeys) ? targetKeys : []).map((key) => normalizeString(key).toLowerCase()));
      if (!normalizedTargets.size || !root || typeof root !== 'object') {
        return [];
      }

      const results = [];
      const queue = [{ value: root, path: '$' }];
      const visited = new Set();
      while (queue.length && results.length < 32) {
        const current = queue.shift();
        const value = current?.value;
        if (!value || typeof value !== 'object') {
          continue;
        }
        if (visited.has(value)) {
          continue;
        }
        visited.add(value);

        const entries = Array.isArray(value)
          ? value.map((entry, index) => [String(index), entry])
          : Object.entries(value);
        for (const [key, entryValue] of entries) {
          const normalizedKey = normalizeString(key).toLowerCase();
          const path = `${current.path}.${key}`;
          if (normalizedTargets.has(normalizedKey)) {
            results.push({ key: normalizedKey, path, value: entryValue });
          }
          if (entryValue && typeof entryValue === 'object') {
            queue.push({ value: entryValue, path });
          }
        }
      }
      return results;
    }

    function normalizePlanType(value = '') {
      return normalizeString(value)
        .toLowerCase()
        .replace(/\s+/g, '_');
    }

    function isPaidPlanType(value = '') {
      const normalized = normalizePlanType(value);
      if (!normalized) {
        return false;
      }
      return !normalized.includes('free');
    }

    function inspectPlusActivationFromSession(session = null) {
      const planSignals = collectSessionFieldValues(session, [
        'planType',
        'plan_type',
        'chatgpt_plan_type',
      ]);
      const booleanSignals = collectSessionFieldValues(session, [
        'isPaid',
        'is_paid',
        'hasActiveSubscription',
        'has_active_subscription',
        'subscriptionActive',
        'subscription_active',
        'isSubscribed',
        'is_subscribed',
      ]);
      const planType = firstNonEmpty(
        ...planSignals.map((entry) => typeof entry?.value === 'string' ? entry.value : ''),
        session?.account?.planType,
        session?.account?.plan_type,
        session?.planType,
        session?.plan_type
      );
      const paidSignal = booleanSignals.some((entry) => entry?.value === true);
      return {
        active: paidSignal || isPaidPlanType(planType),
        paidSignal,
        planType,
        planSignalPath: normalizeString(planSignals[0]?.path || ''),
      };
    }

    function normalizePlusPaymentEmailStateLocal(value = {}) {
      const candidate = value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
      return {
        current: String(candidate.current || '').trim(),
        source: String(candidate.source || '').trim(),
        updatedAt: Math.max(0, Number(candidate.updatedAt) || 0),
      };
    }

    function getPlusPaymentEmailStateLocal(state = {}) {
      if (typeof getPlusPaymentEmailState === 'function') {
        return normalizePlusPaymentEmailStateLocal(getPlusPaymentEmailState(state));
      }
      return normalizePlusPaymentEmailStateLocal(state?.plusPaymentEmailState);
    }

    async function persistPhonePlusPaymentEmail(email, options = {}) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedSource = String(options?.source || '').trim();
      if (typeof setPlusPaymentEmailState === 'function') {
        await setPlusPaymentEmailState(normalizedEmail, {
          source: normalizedSource,
        });
        return;
      }
      await setState({
        plusPaymentEmailState: normalizedEmail
          ? {
              current: normalizedEmail,
              source: normalizedSource,
              updatedAt: Date.now(),
            }
          : {
              current: '',
              source: '',
              updatedAt: 0,
            },
      });
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate({
          plusPaymentEmailState: normalizedEmail
            ? {
                current: normalizedEmail,
                source: normalizedSource,
                updatedAt: Date.now(),
              }
            : {
                current: '',
                source: '',
                updatedAt: 0,
              },
        });
      }
    }

    function getPhonePlusExistingPaymentEmailCandidate(state = {}) {
      if (isPhoneSignupPhonePrefixedEmailEnabled(state)) {
        const preferredPhonePrefixEmail = String(
          state?.registrationEmailState?.current
          || state?.email
          || ''
        ).trim().toLowerCase();
        const phonePrefixLocalPart = String(
          state?.signupVerifiedPhoneNumber
          || state?.signupPhoneCompletedActivation?.phoneNumber
          || ''
        ).replace(/\D+/g, '');
        if (
          phonePrefixLocalPart
          && preferredPhonePrefixEmail
          && preferredPhonePrefixEmail.includes('@')
          && preferredPhonePrefixEmail.split('@')[0] === phonePrefixLocalPart
        ) {
          return {
            email: preferredPhonePrefixEmail,
            source: getPhonePrefixedCloudflarePaymentSource(state),
            reused: true,
          };
        }
      }

      const paymentEmailState = getPlusPaymentEmailStateLocal(state);
      if (paymentEmailState.current) {
        return {
          email: paymentEmailState.current,
          source: paymentEmailState.source || 'payment:cached',
          reused: true,
        };
      }

      if (typeof isYydsMailProvider === 'function' && isYydsMailProvider(state)) {
        const currentInboxAddress = String(state?.currentYydsMailInbox?.address || '').trim().toLowerCase();
        if (currentInboxAddress) {
          return {
            email: currentInboxAddress,
            source: 'runtime:yyds-mail',
            reused: true,
          };
        }
      }

      if (typeof isLuckmailProvider === 'function' && isLuckmailProvider(state)) {
        const currentPurchaseEmail = String(state?.currentLuckmailPurchase?.email_address || '').trim().toLowerCase();
        if (currentPurchaseEmail) {
          return {
            email: currentPurchaseEmail,
            source: 'runtime:luckmail',
            reused: true,
          };
        }
      }

      if (typeof isHotmailProvider === 'function' && isHotmailProvider(state)) {
        const currentHotmailId = String(state?.currentHotmailAccountId || '').trim();
        const hotmailAccounts = Array.isArray(state?.hotmailAccounts) ? state.hotmailAccounts : [];
        const currentHotmailEmail = String(
          hotmailAccounts.find((account) => String(account?.id || '').trim() === currentHotmailId)?.email || ''
        ).trim().toLowerCase();
        if (currentHotmailEmail) {
          return {
            email: currentHotmailEmail,
            source: 'runtime:hotmail',
            reused: true,
          };
        }
      }

      const provider = String(state?.mailProvider || '').trim().toLowerCase();
      if (provider === '2925' && state?.mail2925UseAccountPool && typeof getCurrentMail2925Account === 'function') {
        const currentMail2925Email = String(getCurrentMail2925Account(state)?.email || '').trim().toLowerCase();
        if (currentMail2925Email) {
          return {
            email: currentMail2925Email,
            source: 'runtime:mail2925-account',
            reused: true,
          };
        }
      }

      if (provider === 'cloudmail' && typeof normalizeCloudMailReceiveMailbox === 'function') {
        const cloudMailReceiveMailbox = String(normalizeCloudMailReceiveMailbox(state?.cloudMailReceiveMailbox)).trim().toLowerCase();
        if (cloudMailReceiveMailbox) {
          return {
            email: cloudMailReceiveMailbox,
            source: 'runtime:cloudmail-receive-mailbox',
            reused: true,
          };
        }
      }

      if (provider === 'cloudflare-temp-email' && typeof normalizeCloudflareTempEmailReceiveMailbox === 'function') {
        const cloudflareReceiveMailbox = String(normalizeCloudflareTempEmailReceiveMailbox(state?.cloudflareTempEmailReceiveMailbox)).trim().toLowerCase();
        if (cloudflareReceiveMailbox) {
          return {
            email: cloudflareReceiveMailbox,
            source: 'runtime:cloudflare-temp-email-receive-mailbox',
            reused: true,
          };
        }
      }

      return null;
    }

    function getExistingHostedCheckoutEmailCandidate(state = {}) {
      const paymentEmailState = getPlusPaymentEmailStateLocal(state);
      if (paymentEmailState.current) {
        return {
          email: paymentEmailState.current,
          source: paymentEmailState.source || 'payment:cached',
          reused: true,
        };
      }

      const registrationEmailState = state?.registrationEmailState && typeof state.registrationEmailState === 'object'
        ? state.registrationEmailState
        : {};
      const registrationEmail = String(
        registrationEmailState.current
        || state?.email
        || state?.accountIdentifier
        || ''
      ).trim().toLowerCase();
      if (registrationEmail && /@/.test(registrationEmail)) {
        return {
          email: registrationEmail,
          source: registrationEmailState.current ? 'registration:current' : 'registration:state',
          reused: true,
        };
      }

      const providerEmail = getPhonePlusExistingPaymentEmailCandidate(state);
      if (providerEmail?.email) {
        return providerEmail;
      }

      const profileEmail = String(getHostedProfileFromState(state)?.email || '').trim().toLowerCase();
      if (profileEmail) {
        return {
          email: profileEmail,
          source: 'profile:existing',
          reused: true,
        };
      }

      const previousRegistrationEmail = String(registrationEmailState.previous || '').trim().toLowerCase();
      if (previousRegistrationEmail && /@/.test(previousRegistrationEmail)) {
        return {
          email: previousRegistrationEmail,
          source: 'registration:previous',
          reused: true,
        };
      }

      return null;
    }

    async function resolveExistingHostedCheckoutPaymentEmail(state = {}) {
      const latestState = await getLatestHostedState(state);
      const existing = getExistingHostedCheckoutEmailCandidate(latestState);
      if (!existing?.email) {
        return null;
      }
      if (existing.source !== 'profile:existing') {
        await persistPhonePlusPaymentEmail(existing.email, { source: existing.source });
      }
      await addHostedStepLog(
        PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT,
        `步骤 ${getHostedStepNumber(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT)}：支付邮箱已复用 ${existing.email}（来源：${existing.source}）。`,
        'info'
      );
      return {
        email: existing.email,
        source: existing.source,
        reused: true,
      };
    }

    async function resolveHostedCheckoutPaymentEmail(state = {}) {
      const latestState = await getLatestHostedState(state);
      const existing = await resolveExistingHostedCheckoutPaymentEmail(latestState);
      if (existing?.email) {
        return existing;
      }

      const created = await createPhonePlusPaymentEmail(latestState);
      if (!created?.email) {
        throw new Error('PayPal 无卡直绑支付邮箱解析失败：未获得可用邮箱地址。');
      }
      await persistPhonePlusPaymentEmail(created.email, { source: created.source });
      await addHostedStepLog(
        PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT,
        `步骤 ${getHostedStepNumber(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT)}：支付邮箱已新建 ${created.email}（来源：${created.source}）。`,
        'info'
      );
      return {
        email: created.email,
        source: created.source,
        reused: false,
      };
    }

    async function createPhonePlusPaymentEmail(state = {}) {
      if (typeof isLuckmailProvider === 'function' && isLuckmailProvider(state)) {
        if (typeof ensureLuckmailPurchaseForFlow !== 'function') {
          throw new Error('LuckMail 支付邮箱解析能力未接入。');
        }
        const purchase = await ensureLuckmailPurchaseForFlow({
          allowReuse: true,
          stateTarget: 'payment',
        });
        return {
          email: String(purchase?.email_address || '').trim().toLowerCase(),
          source: 'generated:luckmail',
          reused: false,
        };
      }

      if (typeof isHotmailProvider === 'function' && isHotmailProvider(state)) {
        if (typeof ensureHotmailAccountForFlow !== 'function') {
          throw new Error('Hotmail 支付邮箱解析能力未接入。');
        }
        const account = await ensureHotmailAccountForFlow({
          allowAllocate: true,
          preferredAccountId: state?.currentHotmailAccountId || null,
          stateTarget: 'payment',
        });
        return {
          email: String(account?.registrationAliasEmail || account?.email || '').trim().toLowerCase(),
          source: 'generated:hotmail',
          reused: false,
        };
      }

      if (typeof isYydsMailProvider === 'function' && isYydsMailProvider(state)) {
        if (typeof fetchYydsMailAddress !== 'function') {
          throw new Error('YYDS Mail 支付邮箱解析能力未接入。');
        }
        const email = await fetchYydsMailAddress(state, {
          generateNew: true,
          stateTarget: 'payment',
        });
        return {
          email: String(email || '').trim().toLowerCase(),
          source: 'generated:yyds-mail',
          reused: false,
        };
      }

      const generator = String(state?.emailGenerator || '').trim().toLowerCase();
      if (generator === 'cloudmail' && typeof fetchCloudMailAddress === 'function') {
        const email = await fetchCloudMailAddress(state, {
          stateTarget: 'payment',
        });
        return {
          email: String(email || '').trim().toLowerCase(),
          source: 'generated:cloudmail',
          reused: false,
        };
      }

      if (typeof fetchGeneratedEmail !== 'function') {
        throw new Error('支付邮箱生成能力未接入。');
      }
      const email = await fetchGeneratedEmail(state, {
        stateTarget: 'payment',
      });
      return {
        email: String(email || '').trim().toLowerCase(),
        source: `generated:${generator || String(state?.mailProvider || '').trim().toLowerCase() || 'email'}`,
        reused: false,
      };
    }

    async function resolvePhonePlusPaymentEmail(state = {}) {
      if (!isPhonePlusModeState(state)) {
        return resolveHostedCheckoutPaymentEmail(state);
      }
      const latestState = await getLatestHostedState(state);
      if (isPhoneSignupPhonePrefixedEmailEnabled(latestState) && typeof ensurePhonePrefixedCloudflareTempEmail === 'function') {
        const fixedEmail = String(await ensurePhonePrefixedCloudflareTempEmail(latestState, {
          fallbackToGenerated: false,
        }) || '').trim().toLowerCase();
        if (fixedEmail) {
          const paymentSource = getPhonePrefixedCloudflarePaymentSource(latestState);
          await persistPhonePlusPaymentEmail(fixedEmail, {
            source: paymentSource,
          });
          await addHostedStepLog(
            PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT,
            `步骤 ${getHostedStepNumber(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT)}：支付邮箱已复用 ${fixedEmail}（来源：${paymentSource}）。`,
            'info'
          );
          return {
            email: fixedEmail,
            source: paymentSource,
            reused: true,
          };
        }
      }
      const existing = getPhonePlusExistingPaymentEmailCandidate(latestState);
      if (existing?.email) {
        await persistPhonePlusPaymentEmail(existing.email, { source: existing.source });
        await addHostedStepLog(
          PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT,
          `步骤 ${getHostedStepNumber(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT)}：支付邮箱已复用 ${existing.email}（来源：${existing.source}）。`,
          'info'
        );
        return {
          email: existing.email,
          source: existing.source,
          reused: true,
        };
      }

      const created = await createPhonePlusPaymentEmail(latestState);
      if (!created?.email) {
        throw new Error('Phone Plus 支付邮箱解析失败：未获得可用邮箱地址。');
      }
      await persistPhonePlusPaymentEmail(created.email, { source: created.source });
      await addHostedStepLog(
        PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT,
        `步骤 ${getHostedStepNumber(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT)}：支付邮箱已新建 ${created.email}（来源：${created.source}）。`,
        'info'
      );
      return {
        email: created.email,
        source: created.source,
        reused: false,
      };
    }

    const rootScope = typeof self !== 'undefined' ? self : globalThis;
    const proxyManager = checkoutConversionProxyManager
      || rootScope.MultiPageBackgroundCheckoutConversionProxy?.createCheckoutConversionProxyManager?.({
        chrome,
        getState,
        setState,
      })
      || null;

    async function testCheckoutConversionProxy(options = {}) {
      if (!proxyManager?.testCheckoutConversionProxy) {
        throw new Error('支付转换代理测试能力尚未接入。');
      }
      return proxyManager.testCheckoutConversionProxy(options);
    }

    function getErrorMessage(error) {
      return String(error?.message || error || '未知错误').trim();
    }

    async function cleanupCheckoutConversionProxySessionAfterFailure(state = {}, flowType = '', nodeKey = '', error = null) {
      if (!proxyManager) {
        return;
      }
      const cleanupErrors = [];
      try {
        const latestState = typeof getState === 'function' ? await getState().catch(() => state) : state;
        const session = typeof proxyManager.getStoredSession === 'function'
          ? await proxyManager.getStoredSession(latestState)
          : null;
        if (session?.active && (!flowType || session.flowType === flowType)) {
          if (typeof proxyManager.restoreSession === 'function') {
            await proxyManager.restoreSession(session);
          } else if (typeof proxyManager.releaseSessionForNode === 'function') {
            await proxyManager.releaseSessionForNode(nodeKey || session.releaseNodeKey || '', latestState);
          }
        } else if (typeof proxyManager.releaseSessionForNode === 'function' && nodeKey) {
          await proxyManager.releaseSessionForNode(nodeKey, latestState);
        }
      } catch (cleanupError) {
        cleanupErrors.push(getErrorMessage(cleanupError));
      }

      if (cleanupErrors.length) {
        await addLog(
          `Phone Plus：支付转换代理失败后清理代理会话未完成，将继续切回 free auth。清理原因：${cleanupErrors.join('；')}。原始原因：${getErrorMessage(error)}`,
          'warn'
        );
      }
    }

    async function handlePhonePlusConversionProxyFailure(state = {}, error = null, options = {}) {
      if (!isPhonePlusModeState(state) || typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        return null;
      }
      const detail = getErrorMessage(error);
      await cleanupCheckoutConversionProxySessionAfterFailure(
        state,
        String(options.flowType || '').trim(),
        String(options.releaseNodeKey || options.nodeId || '').trim(),
        error
      );
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'plus-checkout-conversion-proxy-failed',
        detail,
        nodeId: String(options.nodeId || 'plus-checkout-create').trim() || 'plus-checkout-create',
        phaseLabel: String(options.phaseLabel || '支付转换代理').trim(),
      });
      if (!fallbackResult?.handled) {
        return null;
      }
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
        reason: 'plus-checkout-conversion-proxy-failed',
        detail,
      };
    }

    async function applyClassicPaypalCheckoutConversionProxySessionBeforeOpen(state = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      if (!proxyManager?.applySessionFromState) {
        return null;
      }
      if (normalizePlusPaymentMethod(paymentMethod || state?.plusPaymentMethod) !== PLUS_PAYMENT_METHOD_PAYPAL) {
        return null;
      }
      try {
        const session = await proxyManager.applySessionFromState(state, {
          flowType: 'classic-paypal',
          releaseNodeKey: 'paypal-approve',
          appliedStepKey: 'plus-checkout-create',
        });
        if (!session?.active) {
          return null;
        }
        await addLog(`步骤 6：跳转 Plus Checkout 链接前已启用支付转换代理 ${session.displayName}。`, 'info');
        if (typeof proxyManager.checkCheckoutConversionProxySessionExit === 'function') {
          await proxyManager.checkCheckoutConversionProxySessionExit(session, {
            context: 'classic-paypal',
            requireExit: true,
          });
        }
        return session;
      } catch (error) {
        const fallback = await handlePhonePlusConversionProxyFailure(state, error, {
          flowType: 'classic-paypal',
          releaseNodeKey: 'paypal-approve',
          nodeId: 'plus-checkout-create',
          phaseLabel: '跳转 Plus Checkout 链接前',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return fallback;
        }
        throw error;
      }
    }

    async function applyHostedCheckoutConversionProxySession(state = {}, stepKey = PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT) {
      if (!proxyManager?.applySessionFromState) {
        return null;
      }
      const appliedStepKey = String(stepKey || PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT).trim() || PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT;
      try {
        const session = await proxyManager.applySessionFromState(state, {
          flowType: 'paypal-hosted',
          releaseNodeKey: PAYPAL_HOSTED_STEP_REVIEW,
          appliedStepKey,
        });
        if (!session?.active) {
          return null;
        }
        const stepNumber = getHostedStepNumber(appliedStepKey);
        await addHostedStepLog(
          appliedStepKey,
          `步骤 ${stepNumber}：已在提交 OpenAI hosted checkout 前启用支付转换代理 ${session.displayName}。`,
          'info'
        );
        if (typeof proxyManager.checkCheckoutConversionProxySessionExit === 'function') {
          await proxyManager.checkCheckoutConversionProxySessionExit(session, {
            context: 'paypal-hosted',
            requireExit: true,
          });
        }
        return session;
      } catch (error) {
        const fallback = await handlePhonePlusConversionProxyFailure(state, error, {
          flowType: 'paypal-hosted',
          releaseNodeKey: PAYPAL_HOSTED_STEP_REVIEW,
          nodeId: appliedStepKey,
          phaseLabel: '提交 OpenAI hosted checkout 前',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return fallback;
        }
        throw error;
      }
    }

    async function releaseHostedCheckoutConversionProxySessionOnFailure(stepKey = PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT, error = null) {
      if (!proxyManager?.releaseSessionForNode) {
        return;
      }
      const state = typeof getState === 'function' ? await getState() : {};
      const session = await proxyManager.getStoredSession?.(state);
      if (!session?.active || session.flowType !== 'paypal-hosted') {
        return;
      }
      try {
        await proxyManager.restoreSession(session);
        const stepNumber = getHostedStepNumber(stepKey);
        await addHostedStepLog(
          stepKey,
          `步骤 ${stepNumber}：OpenAI hosted checkout 未完成跳转，支付转换代理已释放。${error?.message ? `原因：${error.message}` : ''}`,
          'warn'
        );
      } catch (restoreError) {
        throw new Error(`支付转换代理释放失败：${restoreError?.message || String(restoreError || '未知错误')}`);
      }
    }

    async function releaseHostedCheckoutConversionProxySessionAfterReviewAuthorization(stepKey, completedUrl = '', state = null, options = {}) {
      if (!proxyManager?.getStoredSession) {
        return false;
      }
      if (String(stepKey || '').trim() !== PAYPAL_HOSTED_STEP_REVIEW) {
        return false;
      }
      const currentState = state && typeof state === 'object'
        ? state
        : (typeof getState === 'function' ? await getState() : {});
      const session = await proxyManager.getStoredSession(currentState);
      if (!session?.active || session.flowType !== 'paypal-hosted') {
        return false;
      }
      if (String(session.releaseNodeKey || '').trim() !== PAYPAL_HOSTED_STEP_REVIEW) {
        return false;
      }
      if (!isHostedCheckoutSuccessUrl(completedUrl) && !options?.successFallback) {
        return false;
      }
      await proxyManager.restoreSession(session);
      const stepNumber = getHostedStepNumber(stepKey);
      await addHostedStepLog(
        stepKey,
        `步骤 ${stepNumber}：已检测到 PayPal hosted 授权完成，支付转换代理已释放。`,
        'info'
      );
      return true;
    }

    async function runHostedOpenAiCheckoutWithProxySession(tabId, profile, config, state = {}, stepKey = PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT) {
      const proxySession = await applyHostedCheckoutConversionProxySession(state, stepKey);
      if (proxySession?.phonePlusFallbackToFreeAuth) {
        return proxySession;
      }
      try {
        return await runHostedOpenAiCheckout(tabId, profile, config);
      } catch (error) {
        await releaseHostedCheckoutConversionProxySessionOnFailure(stepKey, error);
        throw error;
      }
    }

    function isExpectedHostedPayPalScriptVersion(pageState = {}) {
      return String(pageState?.scriptVersion || '').trim() === PAYPAL_FLOW_SCRIPT_VERSION;
    }

    function shouldReinjectHostedPayPalContentScript(pageState = {}, options = {}) {
      if (options?.skipScriptVersionCheck === true || options?.forceReinjectChecked === true) {
        return false;
      }
      if (isExpectedHostedPayPalScriptVersion(pageState)) {
        return false;
      }
      return Boolean(chrome?.scripting?.executeScript);
    }

    async function forceReinjectHostedPayPalContentScript(tabId, options = {}) {
      if (!chrome?.scripting?.executeScript) {
        return false;
      }
      const stepKey = String(options?.stepKey || PAYPAL_HOSTED_STEP_EMAIL).trim() || PAYPAL_HOSTED_STEP_EMAIL;
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (injectedSource) => {
            window.__MULTIPAGE_SOURCE = injectedSource;
          },
          args: [PAYPAL_SOURCE],
        });
        await chrome.scripting.executeScript({
          target: { tabId },
          files: PAYPAL_INJECT_FILES,
        });
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：检测到 PayPal 页面脚本版本不是最新，已重新注入 PayPal 脚本后重试。`,
          'warn'
        );
        return true;
      } catch (error) {
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：PayPal 脚本版本不是最新，尝试重新注入失败：${error?.message || String(error || '未知错误')}`,
          'warn'
        );
        return false;
      }
    }

    function isHostedPayPalVersionedMessageUnsupportedError(error) {
      return /unexpected message type .*PAYPAL_.*_V2|paypal-flow\.js 不处理消息：PAYPAL_.*_V2|Receiving end does not exist/i
        .test(String(error?.message || error || ''));
    }

    async function sendHostedPayPalContentMessage(tabId, type, legacyType, payload = {}, options = {}) {
      try {
        const result = await sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
          type,
          source: 'background',
          payload,
        });
        if (result === undefined && legacyType && !chrome?.scripting?.executeScript) {
          return sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
            type: legacyType,
            source: 'background',
            payload,
          });
        }
        return result;
      } catch (error) {
        if (legacyType && !chrome?.scripting?.executeScript && isHostedPayPalVersionedMessageUnsupportedError(error)) {
          return sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
            type: legacyType,
            source: 'background',
            payload,
          });
        }
        throw error;
      }
    }

    async function openFreshChatGptTabForCheckoutCreate() {
      const tab = typeof createAutomationTab === 'function'
        ? await createAutomationTab({ url: PLUS_CHECKOUT_ENTRY_URL, active: true })
        : await chrome.tabs.create({ url: PLUS_CHECKOUT_ENTRY_URL, active: true });
      const tabId = Number(tab?.id);
      if (!Number.isInteger(tabId)) {
        throw new Error('步骤 6：打开 ChatGPT 页面失败，无法创建订阅页。');
      }
      if (typeof registerTab === 'function') {
        await registerTab(PLUS_CHECKOUT_SOURCE, tabId);
      }
      return tabId;
    }

    function isPayPalUrl(url = '') {
      return /paypal\./i.test(String(url || ''));
    }

    function isHostedCheckoutSuccessUrl(url = '') {
      return HOSTED_CHECKOUT_SUCCESS_URL_PATTERN.test(String(url || ''));
    }

    function isHostedCheckoutHomeFallbackUrl(url = '') {
      try {
        const parsed = new URL(String(url || ''));
        const hostname = String(parsed.hostname || '').toLowerCase();
        const pathname = String(parsed.pathname || '/').replace(/\/+$/g, '') || '/';
        return ['chatgpt.com', 'www.chatgpt.com', 'chat.openai.com'].includes(hostname)
          && pathname === '/';
      } catch {
        return false;
      }
    }

    function isHostedOpenAiCheckoutUrl(url = '') {
      return /^https:\/\/(?:pay\.openai\.com|checkout\.stripe\.com)\/c\/pay(?:\/|$)/i.test(String(url || ''));
    }

    function isHostedCheckoutRuntimeUrl(url = '') {
      return isHostedOpenAiCheckoutUrl(url) || isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url);
    }

    function getHostedStepNumber(stepKey = '') {
      return PAYPAL_HOSTED_STEP_META[stepKey]?.step || 6;
    }

    function normalizeHostedCheckoutResendWaitSeconds(
      value,
      fallback = HOSTED_CHECKOUT_FIRST_RESEND_WAIT_DEFAULT_SECONDS
    ) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_RESEND_WAIT_MAX_SECONDS,
        Math.max(
          HOSTED_CHECKOUT_RESEND_WAIT_MIN_SECONDS,
          Math.floor(Number(fallback) || 0)
        )
      );
      if (!rawValue) {
        return fallbackValue;
      }
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }
      return Math.min(
        HOSTED_CHECKOUT_RESEND_WAIT_MAX_SECONDS,
        Math.max(HOSTED_CHECKOUT_RESEND_WAIT_MIN_SECONDS, Math.floor(numeric))
      );
    }

    function normalizeHostedCheckoutVerificationResendMaxAttempts(
      value,
      fallback = HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS_DEFAULT
    ) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS_LIMIT,
        Math.max(0, Math.floor(Number(fallback) || 0))
      );
      if (!rawValue) {
        return fallbackValue;
      }
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }
      return Math.min(
        HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS_LIMIT,
        Math.max(0, Math.floor(numeric))
      );
    }

    function normalizeHostedCheckoutVerificationPollAttempts(
      value,
      fallback = HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_DEFAULT
    ) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_LIMIT,
        Math.max(1, Math.floor(Number(fallback) || HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_DEFAULT))
      );
      if (!rawValue) {
        return fallbackValue;
      }
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }
      return Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS_LIMIT,
        Math.max(1, Math.floor(numeric))
      );
    }

    function normalizeHostedCheckoutVerificationPollIntervalSeconds(
      value,
      fallback = HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_DEFAULT_SECONDS
    ) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_LIMIT_SECONDS,
        Math.max(1, Math.floor(Number(fallback) || HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_DEFAULT_SECONDS))
      );
      if (!rawValue) {
        return fallbackValue;
      }
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }
      return Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_LIMIT_SECONDS,
        Math.max(1, Math.floor(numeric))
      );
    }

    function normalizeHostedCheckoutSmsPoolMaxUses(value, fallback = HOSTED_CHECKOUT_SMS_POOL_MAX_USES_DEFAULT) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_SMS_POOL_MAX_USES_LIMIT,
        Math.max(1, Math.floor(Number(fallback) || HOSTED_CHECKOUT_SMS_POOL_MAX_USES_DEFAULT))
      );
      if (!rawValue) {
        return fallbackValue;
      }
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }
      return Math.min(
        HOSTED_CHECKOUT_SMS_POOL_MAX_USES_LIMIT,
        Math.max(1, Math.floor(numeric))
      );
    }

    function normalizePlusCheckoutCloudConversionApiUrl(value = '') {
      const rawValue = String(value || '').trim();
      if (!rawValue) {
        return '';
      }
      try {
        const parsed = new URL(rawValue);
        parsed.hash = '';
        return parsed.toString();
      } catch {
        return rawValue;
      }
    }

    function isPlusCheckoutCloudConversionEnabled(state = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      return normalizePlusPaymentMethod(paymentMethod) === PLUS_PAYMENT_METHOD_PAYPAL
        && Boolean(state?.plusCheckoutCloudConversionEnabled);
    }

    function getCheckoutBillingDetailsForPaymentMethod(paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, options = {}) {
      return normalizePlusPaymentMethod(paymentMethod) === PLUS_PAYMENT_METHOD_GOPAY
        ? { country: 'ID', currency: 'IDR' }
        : {
          country: String(options?.country || 'US').trim().toUpperCase() || 'US',
          currency: String(options?.currency || 'USD').trim().toUpperCase() || 'USD',
        };
    }

    async function getCheckoutBillingDetailsForState(paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, state = {}, options = {}) {
      const normalizedPaymentMethod = normalizePlusPaymentMethod(paymentMethod || state?.plusPaymentMethod);
      if (normalizedPaymentMethod === PLUS_PAYMENT_METHOD_GOPAY) {
        return getCheckoutBillingDetailsForPaymentMethod(normalizedPaymentMethod);
      }
      const regionApi = self.MultiPagePlusCheckoutRegions || {};
      const selectedRegionCode = regionApi.normalizeCheckoutRegionCode
        ? regionApi.normalizeCheckoutRegionCode(
          state?.plusCheckoutRegionCode ?? (state?.plusCheckoutRegionalCheckoutEnabled ? 'auto' : 'US'),
          'US'
        )
        : (state?.plusCheckoutRegionalCheckoutEnabled ? 'auto' : 'US');
      if (selectedRegionCode === 'US' && !Boolean(state?.plusCheckoutRegionalCheckoutEnabled)) {
        return getCheckoutBillingDetailsForPaymentMethod(normalizedPaymentMethod);
      }
      if (selectedRegionCode && selectedRegionCode !== 'auto') {
        const regional = regionApi.getCheckoutBillingDetailsForRegion
          ? regionApi.getCheckoutBillingDetailsForRegion(selectedRegionCode)
          : null;
        if (regional?.country && regional?.currency) {
          return getCheckoutBillingDetailsForPaymentMethod(normalizedPaymentMethod, regional);
        }
      }
      if (typeof resolvePlusCheckoutRegionalBillingDetails === 'function') {
        const regional = await resolvePlusCheckoutRegionalBillingDetails(state, {
          paymentMethod: normalizedPaymentMethod,
          context: options?.context || 'plus-checkout-create',
          log: options?.log,
        }).catch(() => null);
        if (regional?.country && regional?.currency) {
          return getCheckoutBillingDetailsForPaymentMethod(normalizedPaymentMethod, regional);
        }
      }
      return getCheckoutBillingDetailsForPaymentMethod(normalizedPaymentMethod);
    }

    function formatCloudCheckoutErrorDetail(value, fallback = '') {
      if (typeof value === 'string') {
        return value.trim() || fallback;
      }
      if (value && typeof value === 'object') {
        return String(value.message || value.detail || value.error || JSON.stringify(value)).trim() || fallback;
      }
      return String(value ?? fallback).trim() || fallback;
    }

    function isDoneNodeStatus(status = '') {
      return ['completed', 'manual_completed', 'skipped'].includes(String(status || '').trim().toLowerCase());
    }

    function isCloudCheckoutAlreadyPaidMessage(value = '') {
      const message = formatCloudCheckoutErrorDetail(value);
      return /\buser\s+is\s+already\s+paid\b|already\s+(?:paid|subscribed)|already\s+has\s+(?:an?\s+)?(?:active\s+)?subscription|(?:账号|账户)[\s\S]*(?:已|已经)[\s\S]*(?:付费|订阅|开通)|该账号已经开通过\s*ChatGPT\s*订阅套餐/i.test(message);
    }

    async function markPaymentNodesSkippedAfterAlreadyPaid(state = {}) {
      const latestState = typeof getState === 'function'
        ? await getState().catch(() => state || {})
        : (state || {});
      const nodeStatuses = latestState?.nodeStatuses && typeof latestState.nodeStatuses === 'object'
        ? latestState.nodeStatuses
        : {};
      const skippedNodes = [];
      const batchSkippedNodes = [];
      const nodeIds = ['plus-checkout-billing', 'paypal-approve', 'plus-checkout-return', 'gopay-subscription-confirm'];

      for (const nodeId of nodeIds) {
        if (!Object.prototype.hasOwnProperty.call(nodeStatuses, nodeId) || isDoneNodeStatus(nodeStatuses[nodeId])) {
          continue;
        }
        skippedNodes.push(nodeId);
        if (typeof deps?.setNodeStatus === 'function') {
          await deps.setNodeStatus(nodeId, 'skipped');
        } else {
          batchSkippedNodes.push(nodeId);
        }
      }

      if (batchSkippedNodes.length && typeof setState === 'function') {
        const nextNodeStatuses = { ...nodeStatuses };
        for (const nodeId of batchSkippedNodes) {
          nextNodeStatuses[nodeId] = 'skipped';
        }
        await setState({ nodeStatuses: nextNodeStatuses });
      }

      return skippedNodes;
    }

    async function completeCloudCheckoutAlreadyPaid(tabId, result = {}, state = {}) {
      const detail = formatCloudCheckoutErrorDetail(result?.alreadyPaidDetail, 'User is already paid');
      const skippedNodes = await markPaymentNodesSkippedAfterAlreadyPaid(state);
      await setState({
        plusCheckoutTabId: Number(tabId) || null,
        plusCheckoutUrl: '',
        plusCheckoutCountry: result.country || 'US',
        plusCheckoutCurrency: result.currency || 'USD',
        plusReturnUrl: '',
        plusCheckoutSource: 'cloud-checkout-already-paid',
        plusCheckoutAlreadyPaid: true,
        plusCheckoutAlreadyPaidAt: Date.now(),
        plusCheckoutAlreadyPaidDetail: detail,
      });
      await addLog(
        skippedNodes.length
          ? `步骤 6：云端服务确认当前用户已开通订阅（${detail}），已跳过后续支付节点：${skippedNodes.join('、')}，继续下一流程节点。`
          : `步骤 6：云端服务确认当前用户已开通订阅（${detail}），继续下一流程节点。`,
        'ok'
      );
      await completeNodeFromBackground('plus-checkout-create', {
        plusCheckoutCountry: result.country || 'US',
        plusCheckoutCurrency: result.currency || 'USD',
        plusCheckoutSource: 'cloud-checkout-already-paid',
        plusCheckoutAlreadyPaid: true,
      });
    }

    function normalizeHostedPhoneForPayload(phone = '') {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) {
        return '';
      }
      if (digits.length === 11 && digits.startsWith('1')) {
        return digits.slice(-10);
      }
      return digits;
    }

    function normalizeBrazilHostedPhoneForPayload(phone = '') {
      const digits = String(phone || '').replace(/\D/g, '');
      if (/^55\d{10,11}$/.test(digits)) {
        return `+${digits}`;
      }
      return '';
    }

    function buildHostedBirthdayString(date = new Date(), format = 'iso') {
      const now = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
      const age = 19 + Math.floor(Math.random() * 7);
      const year = now.getFullYear() - age;
      const month = 1 + Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * new Date(year, month, 0).getDate());
      const yearText = String(year).padStart(4, '0');
      const monthText = String(month).padStart(2, '0');
      const dayText = String(day).padStart(2, '0');
      if (format === 'br') {
        return `${dayText}/${monthText}/${yearText}`;
      }
      return `${yearText}-${monthText}-${dayText}`;
    }

    function splitHostedBrazilStreetAddress(value = '') {
      const normalized = normalizeString(value);
      if (!normalized) {
        return { streetName: '', number: '' };
      }
      const commaMatch = normalized.match(/^(.+?),\s*([A-Za-z0-9-]+)\s*$/);
      if (commaMatch) {
        return {
          streetName: commaMatch[1].trim(),
          number: commaMatch[2].trim(),
        };
      }
      const trailingNumberMatch = normalized.match(/^(.+?)\s+([A-Za-z0-9-]+)\s*$/);
      if (trailingNumberMatch && /\d/.test(trailingNumberMatch[2])) {
        return {
          streetName: trailingNumberMatch[1].trim(),
          number: trailingNumberMatch[2].trim(),
        };
      }
      return {
        streetName: normalized,
        number: '',
      };
    }

    function normalizeHostedCheckoutPoolPhone(value = '') {
      return normalizeHostedPhoneForPayload(value);
    }

    function normalizeHostedCheckoutPoolUrl(value = '') {
      const rawValue = String(value || '').trim();
      if (!rawValue) {
        return '';
      }
      try {
        const parsed = new URL(rawValue);
        parsed.searchParams.delete('t');
        return parsed.toString();
      } catch {
        return rawValue
          .replace(/([?&])t=\d+(?=(&|$))/i, '$1')
          .replace(/[?&]$/g, '');
      }
    }

    function buildHostedCheckoutPoolKey(phone = '', verificationUrl = '') {
      const normalizedPhone = normalizeHostedCheckoutPoolPhone(phone);
      const normalizedUrl = normalizeHostedCheckoutPoolUrl(verificationUrl);
      if (!normalizedPhone) {
        return '';
      }
      return normalizedUrl ? `${normalizedPhone}----${normalizedUrl}` : normalizedPhone;
    }

    function parseHostedCheckoutSmsPoolEntries(value = '') {
      const lines = String(value || '')
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const seen = new Set();
      const entries = [];
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const separatorIndex = line.indexOf('----');
        const hasSeparator = separatorIndex > 0;
        const phone = hasSeparator
          ? normalizeHostedCheckoutPoolPhone(line.slice(0, separatorIndex))
          : normalizeHostedCheckoutPoolPhone(line);
        let verificationUrl = hasSeparator
          ? normalizeHostedCheckoutPoolUrl(line.slice(separatorIndex + 4))
          : '';
        if (!hasSeparator) {
          const nextLine = lines[index + 1] || '';
          const normalizedNextUrl = normalizeHostedCheckoutPoolUrl(nextLine);
          const nextLinePhone = normalizeHostedCheckoutPoolPhone(nextLine);
          if (normalizedNextUrl && !nextLinePhone) {
            verificationUrl = normalizedNextUrl;
          }
        }
        if (!hasSeparator && verificationUrl) {
          index += 1;
        }
        const key = buildHostedCheckoutPoolKey(phone, verificationUrl);
        if (!phone || !key || seen.has(key)) {
          continue;
        }
        seen.add(key);
        entries.push({
          index: entries.length,
          key,
          phone,
          verificationUrl,
        });
      }
      return entries;
    }

    function normalizeHostedCheckoutSmsPoolUsage(value = {}) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
      }
      return Object.fromEntries(Object.entries(value).map(([key, item]) => {
        const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
        const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
        const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
        return [String(key || '').trim(), {
          useCount,
          usedAt: Math.max(0, Number(usage.usedAt) || 0),
          lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
          lastError: String(usage.lastError || '').trim(),
          enabled: usage.enabled !== false,
          disabledReason: String(usage.disabledReason || '').trim(),
          disabledAt: Math.max(0, Number(usage.disabledAt) || 0),
          failureCount: Math.max(0, Math.floor(Number(usage.failureCount) || 0)),
        }];
      }).filter(([key]) => Boolean(key)));
    }

    function isHostedCheckoutSmsPoolEntryEnabled(item = {}) {
      return item?.enabled !== false;
    }

    function normalizeHostedCheckoutCurrentSmsEntry(entry = null, entries = []) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }
      const key = String(
        entry.key
        || buildHostedCheckoutPoolKey(entry.phone, entry.verificationUrl)
      ).trim();
      if (!key) {
        return null;
      }
      const matchedEntry = Array.isArray(entries)
        ? entries.find((candidate) => candidate.key === key)
        : null;
      if (matchedEntry) {
        return { ...matchedEntry };
      }
      const phone = normalizeHostedCheckoutPoolPhone(entry.phone);
      const verificationUrl = normalizeHostedCheckoutPoolUrl(entry.verificationUrl);
      if (!phone) {
        return null;
      }
      return {
        key: buildHostedCheckoutPoolKey(phone, verificationUrl),
        phone,
        verificationUrl,
      };
    }

    function maskHostedPhoneForLog(phone = '') {
      const digits = normalizeHostedPhoneForPayload(phone);
      if (!digits) {
        return '(empty)';
      }
      if (digits.length <= 4) {
        return digits;
      }
      return `***${digits.slice(-4)}`;
    }

    function buildHostedCheckoutConfigError(message = '', meta = {}) {
      const error = new Error(String(message || 'PayPal hosted checkout 配置无效。').trim());
      error.hostedCheckoutConfigMeta = meta && typeof meta === 'object' ? meta : {};
      return error;
    }

    function isHostedCheckoutSmsPoolExhaustedError(error) {
      return Boolean(error?.hostedCheckoutConfigMeta?.smsPoolExhausted)
        && error?.hostedCheckoutConfigMeta?.configSource !== 'phone-sms';
    }

    function isPayPalHostedPhoneEmptyAfterFillError(error) {
      return getErrorMessage(error).startsWith(PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX);
    }

    function buildPayPalHostedPhoneEmptyAfterFillError(refillMaxRetries = 3) {
      return new Error(`${PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX}PayPal 无卡直绑资料页 phone 输入框在 ${refillMaxRetries} 次重填后仍为空。`);
    }

    function assertHostedPayPalGuestCheckoutSubmitted(result = {}, stepNumber = getHostedStepNumber(PAYPAL_HOSTED_STEP_CARD)) {
      if (!result || typeof result !== 'object') {
        throw new Error(`步骤 ${stepNumber}：PayPal 资料页提交没有返回有效结果。`);
      }
      const stage = String(result.stage || result.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN).trim();
      const expectedStage = String(result.expectedStage || PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT).trim();
      if (
        expectedStage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
        && getHostedStageOrder(stage) > getHostedStageOrder(PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT)
      ) {
        return result;
      }
      if (result.skipped || result.submitted === false) {
        throw new Error(`步骤 ${stepNumber}：PayPal 资料页未执行提交（当前状态：${stage || PAYPAL_HOSTED_STAGE_UNKNOWN}，期望状态：${expectedStage || PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT}）。`);
      }
      if (result.phoneMatched !== true) {
        throw new Error(`步骤 ${stepNumber}：PayPal 资料页提交前未完成电话复查，已停止等待跳转。`);
      }
      return result;
    }

    async function handlePayPalHostedPhoneEmptyAfterFillFallback(state = {}, error = null, options = {}) {
      if (!isPayPalHostedPhoneEmptyAfterFillError(error)) {
        return null;
      }
      if (!isPhonePlusModeState(state) || typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        return null;
      }
      const detail = getErrorMessage(error)
        .replace(PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL_PREFIX, '')
        .trim()
        || 'PayPal 无卡直绑资料页 phone 输入框在 3 次重填后仍为空。';
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'hosted-checkout-phone-empty-after-fill',
        detail,
        nodeId: String(options.nodeId || PAYPAL_HOSTED_STEP_CARD).trim() || PAYPAL_HOSTED_STEP_CARD,
        phaseLabel: String(options.phaseLabel || 'PayPal hosted 资料页 phone 检查').trim(),
      });
      if (!fallbackResult?.handled) {
        return null;
      }
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
        reason: 'hosted-checkout-phone-empty-after-fill',
        detail,
      };
    }

    async function handleHostedCheckoutSmsPoolExhaustedFallback(state = {}, error = null, options = {}) {
      if (!isHostedCheckoutSmsPoolExhaustedError(error)) {
        return null;
      }
      if (!isPhonePlusModeState(state) || typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        return null;
      }
      const detail = getErrorMessage(error);
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'hosted-checkout-sms-pool-exhausted',
        detail,
        nodeId: String(options.nodeId || 'plus-checkout-create').trim() || 'plus-checkout-create',
        phaseLabel: String(options.phaseLabel || 'PayPal 接码池').trim(),
      });
      if (!fallbackResult?.handled) {
        return null;
      }
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
        reason: 'hosted-checkout-sms-pool-exhausted',
        detail,
      };
    }

    async function handleHostedCheckoutGenericErrorFallback(state = {}, pageState = {}, options = {}) {
      if (!isPhonePlusModeState(state) || typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        return null;
      }
      const detail = String(
        pageState?.hostedGenericErrorMessage
        || pageState?.error
        || options?.detail
        || 'PayPal Checkout genericError'
      ).trim();
      const stepKey = String(
        options?.nodeId
        || options?.stepKey
        || pageState?.stepKey
        || getHostedStepKeyForStage(pageState?.hostedStage)
        || PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT
      ).trim() || PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT;
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'hosted-checkout-generic-error',
        detail,
        nodeId: stepKey,
        phaseLabel: String(options?.phaseLabel || 'PayPal hosted checkout genericError').trim(),
      });
      if (!fallbackResult?.handled) {
        return null;
      }
      await addHostedStepLog(
        stepKey,
        `步骤 ${getHostedStepNumber(stepKey)}：PayPal hosted checkout 返回 genericError，已跳过 Plus 支付段并继续 OAuth 流程。${detail ? `原因：${detail}` : ''}`,
        'warn'
      );
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
        reason: 'hosted-checkout-generic-error',
        detail,
      };
    }

    async function logHostedCheckoutRuntimeConfig(stepKey, config = {}, options = {}) {
      if (!stepKey) {
        return;
      }
      const source = String(config?.configSource || 'unknown').trim() || 'unknown';
      const poolSize = Math.max(0, Number(config?.poolSize) || 0);
      const selectedEntry = config?.hostedCheckoutCurrentSmsEntry || null;
      const detail = selectedEntry?.key
        ? `当前条目 ${maskHostedPhoneForLog(selectedEntry.phone)}`
        : '当前条目 无';
      const extra = String(options.extra || '').trim();
      await addHostedStepLog(
        stepKey,
        `步骤 ${getHostedStepNumber(stepKey)}：PayPal 接码配置来源 ${source}，池条目 ${poolSize} 个，${detail}${extra ? `，${extra}` : ''}。`,
        options.level || 'info'
      );
    }

    async function resolveHostedCheckoutRuntimeConfig(state = {}, options = {}) {
      const {
        ensureCurrentSmsEntry = false,
        allowExhaustedCurrentSmsEntry = false,
      } = options || {};
      const latestState = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      const mergedState = {
        ...(latestState && typeof latestState === 'object' ? latestState : {}),
        ...(state && typeof state === 'object' ? state : {}),
      };
      const hostedSmsSource = normalizeHostedCheckoutSmsSource(mergedState?.hostedCheckoutSmsSource);
      const commonRuntimeConfig = () => ({
        oauthDelaySeconds: normalizeHostedCheckoutDelaySeconds(
          mergedState?.plusHostedCheckoutOauthDelaySeconds
        ),
        firstDirectResendEnabled: Boolean(mergedState?.hostedCheckoutFirstDirectResendEnabled),
        firstResendWaitSeconds: normalizeHostedCheckoutResendWaitSeconds(
          mergedState?.hostedCheckoutFirstResendWaitSeconds ?? mergedState?.hostedCheckoutVerificationPopupDelaySeconds,
          HOSTED_CHECKOUT_FIRST_RESEND_WAIT_DEFAULT_SECONDS
        ),
        subsequentResendWaitSeconds: normalizeHostedCheckoutResendWaitSeconds(
          mergedState?.hostedCheckoutSubsequentResendWaitSeconds,
          HOSTED_CHECKOUT_SUBSEQUENT_RESEND_WAIT_DEFAULT_SECONDS
        ),
        verificationResendMaxAttempts: normalizeHostedCheckoutVerificationResendMaxAttempts(
          mergedState?.hostedCheckoutVerificationResendMaxAttempts
        ),
        verificationPollAttempts: normalizeHostedCheckoutVerificationPollAttempts(
          mergedState?.hostedCheckoutVerificationPollAttempts
        ),
        verificationPollIntervalSeconds: normalizeHostedCheckoutVerificationPollIntervalSeconds(
          mergedState?.hostedCheckoutVerificationPollIntervalSeconds
        ),
      });
      if (hostedSmsSource === HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS) {
        const phoneSmsResult = await ensureHostedCheckoutPhoneSmsActivation(mergedState, {
          stepKey: options?.stepKey || PAYPAL_HOSTED_STEP_CARD,
        });
        const activation = normalizeHostedCheckoutPhoneSmsActivation(phoneSmsResult?.activation);
        if (!activation?.phoneNumber) {
          throw buildHostedCheckoutConfigError(
            'PayPal 跟随手机接码配置未获取到有效手机号。',
            {
              configSource: 'phone-sms',
              poolSize: 0,
              selectedEntry: null,
            }
          );
        }
        return {
          ...commonRuntimeConfig(),
          verificationUrl: '',
          phone: normalizeHostedPhoneForPayload(activation.phoneNumber),
          hostedCheckoutSmsPoolAutoDisableEnabled: false,
          hostedCheckoutCurrentSmsEntry: null,
          hostedCheckoutUsesSmsPool: false,
          hostedCheckoutUsesPhoneSms: true,
          hostedCheckoutPhoneSmsActivation: activation,
          hostedCheckoutPhoneSmsRequestedRegion: phoneSmsResult?.requestedRegion || '',
          hostedCheckoutPhoneSmsResolvedRegion: phoneSmsResult?.resolvedRegion || '',
          hostedCheckoutSmsPoolMaxUses: normalizeHostedCheckoutSmsPoolMaxUses(mergedState?.hostedCheckoutSmsPoolMaxUses),
          configSource: 'phone-sms',
          poolSize: 0,
        };
      }
      if (hostedSmsSource === HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR) {
        const phoneSmsResult = await ensureHostedCheckoutHeroSmsPayPalActivation(mergedState, {
          stepKey: options?.stepKey || PAYPAL_HOSTED_STEP_CARD,
        });
        const activation = normalizeHostedCheckoutPhoneSmsActivation(phoneSmsResult?.activation);
        const phone = normalizeBrazilHostedPhoneForPayload(activation?.phoneNumber || '');
        if (!phone) {
          throw buildHostedCheckoutConfigError(
            'PayPal HeroSMS（PayPal/BR）未获取到有效的巴西 +55 手机号。',
            {
              configSource: 'hero-sms-paypal-br',
              poolSize: 0,
              selectedEntry: null,
            }
          );
        }
        return {
          ...commonRuntimeConfig(),
          verificationUrl: '',
          phone,
          hostedCheckoutSmsPoolAutoDisableEnabled: false,
          hostedCheckoutCurrentSmsEntry: null,
          hostedCheckoutUsesSmsPool: false,
          hostedCheckoutUsesPhoneSms: true,
          hostedCheckoutUsesHeroSmsPayPalBr: true,
          hostedCheckoutPhoneSmsActivation: activation,
          hostedCheckoutHeroSmsPayPalActivation: activation,
          hostedCheckoutPhoneSmsRequestedRegion: HERO_SMS_PAYPAL_BR_REGION,
          hostedCheckoutPhoneSmsResolvedRegion: HERO_SMS_PAYPAL_BR_REGION,
          hostedCheckoutSmsPoolMaxUses: normalizeHostedCheckoutSmsPoolMaxUses(mergedState?.hostedCheckoutSmsPoolMaxUses),
          configSource: 'hero-sms-paypal-br',
          poolSize: 0,
        };
      }
      const rawPoolText = String(mergedState?.hostedCheckoutSmsPoolText || '').trim();
      const poolEntries = parseHostedCheckoutSmsPoolEntries(rawPoolText);
      const poolUsage = normalizeHostedCheckoutSmsPoolUsage(mergedState?.hostedCheckoutSmsPoolUsage || {});
      const smsPoolMaxUses = normalizeHostedCheckoutSmsPoolMaxUses(mergedState?.hostedCheckoutSmsPoolMaxUses);
      const manualVerificationUrl = String(mergedState?.hostedCheckoutVerificationUrl || '').trim();
      const manualPhone = normalizeHostedPhoneForPayload(mergedState?.hostedCheckoutPhoneNumber);
      let selectedSmsEntry = normalizeHostedCheckoutCurrentSmsEntry(mergedState?.hostedCheckoutCurrentSmsEntry, poolEntries);

      if (selectedSmsEntry) {
        const currentUsage = poolUsage[selectedSmsEntry.key] || {};
        const currentUseCount = Math.max(0, Math.floor(Number(currentUsage.useCount) || 0));
        const currentReachedLimit = currentUseCount >= smsPoolMaxUses;
        if (!isHostedCheckoutSmsPoolEntryEnabled(currentUsage) || (currentReachedLimit && !allowExhaustedCurrentSmsEntry)) {
          selectedSmsEntry = null;
          await clearHostedCheckoutCurrentSmsEntry();
        }
      }

      if (!selectedSmsEntry && ensureCurrentSmsEntry && poolEntries.length > 0) {
        selectedSmsEntry = chooseHostedCheckoutSmsPoolEntry(poolEntries, poolUsage, smsPoolMaxUses);
        if (selectedSmsEntry) {
          await applyHostedCheckoutRuntimePatch({
            hostedCheckoutCurrentSmsEntry: selectedSmsEntry,
          });
        }
      }

      if (rawPoolText && poolEntries.length === 0) {
        throw buildHostedCheckoutConfigError(
          'PayPal 接码池已配置，但当前内容未解析出有效号码/验证码链接，请检查接码池保存状态或导入格式。',
          {
            configSource: 'sms-pool',
            poolSize: 0,
            selectedEntry: null,
          }
        );
      }

      if (poolEntries.length > 0) {
        if (!selectedSmsEntry?.phone) {
          const enabledEntries = poolEntries.filter((entry) => isHostedCheckoutSmsPoolEntryEnabled(poolUsage[entry.key] || {}));
          const exhausted = enabledEntries.length > 0 && enabledEntries.every((entry) => {
            const itemUsage = poolUsage[entry.key] || {};
            return Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)) >= smsPoolMaxUses;
          });
          if (exhausted) {
            throw buildHostedCheckoutConfigError(
              `PayPal 接码池所有启用号码都已达到 ${smsPoolMaxUses} 次使用上限，请导入新号码或调高单号码最多使用次数。`,
              {
                configSource: 'sms-pool',
                poolSize: poolEntries.length,
                selectedEntry: null,
                smsPoolExhausted: true,
                maxUses: smsPoolMaxUses,
              }
            );
          }
          throw buildHostedCheckoutConfigError(
            'PayPal 接码池已配置，但未解析到可用号码/验证码链接，请检查接码池保存状态或导入格式。',
            {
              configSource: 'sms-pool',
              poolSize: poolEntries.length,
              selectedEntry: null,
              maxUses: smsPoolMaxUses,
            }
          );
        }
        return {
          verificationUrl: String(selectedSmsEntry.verificationUrl || '').trim(),
          phone: String(selectedSmsEntry.phone || '').trim(),
          ...commonRuntimeConfig(),
          hostedCheckoutSmsPoolAutoDisableEnabled: Boolean(mergedState?.hostedCheckoutSmsPoolAutoDisableEnabled),
          hostedCheckoutCurrentSmsEntry: selectedSmsEntry,
          hostedCheckoutUsesSmsPool: true,
          hostedCheckoutUsesPhoneSms: false,
          hostedCheckoutSmsPoolMaxUses: smsPoolMaxUses,
          configSource: 'sms-pool',
          poolSize: poolEntries.length,
        };
      }

      if (!manualPhone || !manualVerificationUrl) {
        throw buildHostedCheckoutConfigError(
          'PayPal 接码配置不完整：当前接码池为空，请先填写手机号和验证码接口，或导入 PayPal 接码池。',
          {
            configSource: 'manual-config',
            poolSize: 0,
            selectedEntry: null,
            missingPhone: !manualPhone,
            missingVerificationUrl: !manualVerificationUrl,
          }
        );
      }

      return {
        verificationUrl: manualVerificationUrl,
        phone: manualPhone,
        ...commonRuntimeConfig(),
        hostedCheckoutSmsPoolAutoDisableEnabled: Boolean(mergedState?.hostedCheckoutSmsPoolAutoDisableEnabled),
        hostedCheckoutCurrentSmsEntry: null,
        hostedCheckoutUsesSmsPool: false,
        hostedCheckoutUsesPhoneSms: false,
        hostedCheckoutSmsPoolMaxUses: smsPoolMaxUses,
        configSource: 'manual-config',
        poolSize: 0,
      };
    }

    function chooseHostedCheckoutSmsPoolEntry(entries = [], usage = {}, maxUses = HOSTED_CHECKOUT_SMS_POOL_MAX_USES_DEFAULT) {
      if (!Array.isArray(entries) || entries.length === 0) {
        return null;
      }
      const normalizedUsage = normalizeHostedCheckoutSmsPoolUsage(usage);
      const normalizedMaxUses = normalizeHostedCheckoutSmsPoolMaxUses(maxUses);
      return entries
        .map((entry, index) => {
          const itemUsage = normalizedUsage[entry.key] || {};
          return {
            ...entry,
            index: Number.isFinite(entry.index) ? entry.index : index,
            useCount: Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)),
            lastAttemptAt: Math.max(0, Number(itemUsage.lastAttemptAt) || 0),
            enabled: isHostedCheckoutSmsPoolEntryEnabled(itemUsage),
          };
        })
        .filter((entry) => entry.enabled && entry.useCount < normalizedMaxUses)
        .sort((left, right) => {
          if (left.useCount !== right.useCount) {
            return left.useCount - right.useCount;
          }
          if (left.lastAttemptAt !== right.lastAttemptAt) {
            return left.lastAttemptAt - right.lastAttemptAt;
          }
          return left.index - right.index;
        })[0] || null;
    }

    async function applyHostedCheckoutRuntimePatch(patch = {}) {
      if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).length === 0) {
        return;
      }
      if (typeof setState !== 'function') {
        return;
      }
      await setState(patch);
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(patch);
      }
    }

    async function clearHostedCheckoutCurrentSmsEntry() {
      await applyHostedCheckoutRuntimePatch({
        hostedCheckoutCurrentSmsEntry: null,
      });
    }

    async function clearHostedCheckoutPhoneSmsActivation() {
      await applyHostedCheckoutRuntimePatch({
        [HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]: null,
        [HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY]: '',
        [HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY]: '',
      });
    }

    async function clearHostedCheckoutHeroSmsPayPalActivation() {
      await applyHostedCheckoutRuntimePatch({
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_ACTIVATION_KEY]: null,
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY]: 0,
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY]: 0,
        [HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]: null,
        [HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY]: '',
        [HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY]: '',
      });
    }

    async function persistHostedCheckoutPhoneSmsActivation(activation = null, options = {}) {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(activation);
      if (!normalizedActivation) {
        await clearHostedCheckoutPhoneSmsActivation();
        return null;
      }
      const patch = {
        [HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]: normalizedActivation,
        [HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY]: normalizeHostedPhoneSmsRegionCode(options?.requestedRegion || ''),
        [HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY]: normalizeHostedPhoneSmsRegionCode(options?.resolvedRegion || ''),
      };
      await applyHostedCheckoutRuntimePatch(patch);
      return normalizedActivation;
    }

    async function persistHostedCheckoutHeroSmsPayPalActivation(activation = null, options = {}) {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(activation);
      if (!normalizedActivation) {
        await clearHostedCheckoutHeroSmsPayPalActivation();
        return null;
      }
      const now = Math.max(0, Number(options?.cachedAt) || Date.now());
      const expiresAt = Math.max(now + 1, Number(options?.expiresAt) || (now + HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHE_TTL_MS));
      const nextActivation = {
        ...normalizedActivation,
        provider: 'hero-sms',
        serviceCode: HERO_SMS_PAYPAL_SERVICE_CODE,
        countryId: HERO_SMS_PAYPAL_BR_COUNTRY_ID,
        countryLabel: HERO_SMS_PAYPAL_BR_COUNTRY_LABEL,
        maxUses: Math.max(1, Number(normalizedActivation.maxUses) || 999),
        source: 'hosted-hero-sms-paypal-br',
        hostedCheckoutSmsSource: HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR,
        cachedAt: now,
        expiresAt,
      };
      const patch = {
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_ACTIVATION_KEY]: nextActivation,
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY]: now,
        [HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY]: expiresAt,
        [HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]: nextActivation,
        [HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY]: HERO_SMS_PAYPAL_BR_REGION,
        [HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY]: HERO_SMS_PAYPAL_BR_REGION,
      };
      await applyHostedCheckoutRuntimePatch(patch);
      return nextActivation;
    }

    async function finalizeHostedCheckoutPhoneSmsActivationAfterSuccess(state = {}, activation = null) {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(activation);
      if (!normalizedActivation) {
        await clearHostedCheckoutPhoneSmsActivation();
        return null;
      }
      if (isHostedCheckoutHeroSmsPayPalActivation(normalizedActivation)) {
        if (!normalizedActivation.phoneCodeReceived) {
          return persistHostedCheckoutHeroSmsPayPalActivation(normalizedActivation, {
            cachedAt: state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY] || normalizedActivation.cachedAt,
            expiresAt: state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY] || normalizedActivation.expiresAt,
          });
        }
        const nextActivation = {
          ...normalizedActivation,
          successfulUses: Math.max(0, Number(normalizedActivation.successfulUses) || 0) + 1,
        };
        delete nextActivation.phoneCodeReceived;
        delete nextActivation.phoneCodeReceivedAt;
        delete nextActivation.ignoredPhoneCodeKeys;
        return persistHostedCheckoutHeroSmsPayPalActivation(nextActivation, {
          cachedAt: state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY] || normalizedActivation.cachedAt,
          expiresAt: state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY] || normalizedActivation.expiresAt,
        });
      }
      if (typeof phoneVerificationHelpers?.completePhoneActivation === 'function') {
        await phoneVerificationHelpers.completePhoneActivation(state, normalizedActivation).catch(() => {});
      }
      if (!normalizedActivation.phoneCodeReceived) {
        await clearHostedCheckoutPhoneSmsActivation();
        return null;
      }
      const nextActivation = {
        ...normalizedActivation,
        successfulUses: Math.max(0, Number(normalizedActivation.successfulUses) || 0) + 1,
      };
      delete nextActivation.phoneCodeReceived;
      delete nextActivation.phoneCodeReceivedAt;
      delete nextActivation.ignoredPhoneCodeKeys;
      if (!isHostedCheckoutPhoneSmsReusable(state, nextActivation)) {
        await clearHostedCheckoutPhoneSmsActivation();
        return null;
      }
      return persistHostedCheckoutPhoneSmsActivation(nextActivation, {
        requestedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY],
        resolvedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY],
      });
    }

    async function cancelHostedCheckoutPhoneSmsActivation(state = {}, activation = null, reason = '') {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(
        activation || state?.[HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]
      );
      if (!normalizedActivation) {
        await clearHostedCheckoutPhoneSmsActivation();
        return;
      }
      if (isHostedCheckoutHeroSmsPayPalActivation(normalizedActivation)) {
        await clearHostedCheckoutHeroSmsPayPalActivation();
        if (reason) {
          await addLog(`PayPal HeroSMS（PayPal/BR）缓存号码已清理：${reason}`, 'warn');
        }
        return;
      }
      if (typeof phoneVerificationHelpers?.cancelPhoneActivation === 'function') {
        await phoneVerificationHelpers.cancelPhoneActivation(state, normalizedActivation).catch(() => {});
      }
      await clearHostedCheckoutPhoneSmsActivation();
      if (reason) {
        await addLog(`PayPal 手机接码号码已清理：${reason}`, 'warn');
      }
    }

    async function banHostedCheckoutPhoneSmsActivation(state = {}, activation = null, reason = '') {
      const normalizedActivation = normalizeHostedCheckoutPhoneSmsActivation(
        activation || state?.[HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]
      );
      if (!normalizedActivation) {
        await clearHostedCheckoutPhoneSmsActivation();
        return;
      }
      if (isHostedCheckoutHeroSmsPayPalActivation(normalizedActivation)) {
        await clearHostedCheckoutHeroSmsPayPalActivation();
        if (reason) {
          await addLog(`PayPal HeroSMS（PayPal/BR）缓存号码已丢弃：${reason}`, 'warn');
        }
        return;
      }
      if (typeof phoneVerificationHelpers?.banPhoneActivation === 'function') {
        await phoneVerificationHelpers.banPhoneActivation(state, normalizedActivation).catch(() => {});
      } else if (typeof phoneVerificationHelpers?.cancelPhoneActivation === 'function') {
        await phoneVerificationHelpers.cancelPhoneActivation(state, normalizedActivation).catch(() => {});
      }
      await clearHostedCheckoutPhoneSmsActivation();
      if (reason) {
        await addLog(`PayPal 手机接码号码已禁用：${reason}`, 'warn');
      }
    }

    async function requestHostedCheckoutPhoneSmsActivation(state = {}, options = {}) {
      if (typeof phoneVerificationHelpers?.requestPhoneActivationForRegion !== 'function'
        && typeof phoneVerificationHelpers?.requestPhoneActivation !== 'function') {
        throw buildHostedCheckoutConfigError(
          'PayPal 接码来源已设置为跟随手机接码配置，但当前环境未加载手机接码模块。',
          {
            configSource: 'phone-sms',
            poolSize: 0,
            selectedEntry: null,
          }
        );
      }
      const region = await resolveHostedPhoneSmsRegionForState(state);
      const requestOptions = {
        ...options,
        step: options?.step || 8,
        stepKey: options?.stepKey || PAYPAL_HOSTED_STEP_CARD,
        regionCode: region.countryCode || '',
      };
      const result = typeof phoneVerificationHelpers?.requestPhoneActivationForRegion === 'function'
        ? await phoneVerificationHelpers.requestPhoneActivationForRegion(state, requestOptions)
        : {
          activation: await phoneVerificationHelpers.requestPhoneActivation(state, requestOptions),
          requestedRegion: region.countryCode || '',
          resolvedRegion: '',
          regionMatched: false,
        };
      const activation = normalizeHostedCheckoutPhoneSmsActivation(result?.activation);
      if (!activation?.phoneNumber) {
        throw new Error('PayPal 跟随手机接码配置取号失败：接码平台未返回有效手机号。');
      }
      const persisted = await persistHostedCheckoutPhoneSmsActivation(activation, {
        requestedRegion: result?.requestedRegion || region.countryCode || '',
        resolvedRegion: result?.resolvedRegion || '',
      });
      await addHostedStepLog(
        requestOptions.stepKey,
        `步骤 ${getHostedStepNumber(requestOptions.stepKey)}：PayPal 已跟随手机接码配置获取号码 ${maskHostedPhoneForLog(persisted.phoneNumber)}${region.countryCode ? `，请求地区 ${region.countryCode}` : ''}。`,
        'info'
      );
      return {
        activation: persisted,
        requestedRegion: result?.requestedRegion || region.countryCode || '',
        resolvedRegion: result?.resolvedRegion || '',
        regionMatched: Boolean(result?.regionMatched),
      };
    }

    function buildHostedCheckoutHeroSmsPayPalState(state = {}) {
      return {
        ...state,
        phoneSmsProvider: 'hero-sms',
        heroSmsCountryId: HERO_SMS_PAYPAL_BR_COUNTRY_ID,
        heroSmsCountryLabel: HERO_SMS_PAYPAL_BR_COUNTRY_LABEL,
        heroSmsCountryFallback: [],
        heroSmsOperatorByCountry: {},
        heroSmsServiceCode: HERO_SMS_PAYPAL_SERVICE_CODE,
        heroSmsMinPrice: '',
        heroSmsMaxPrice: '0.1',
        heroSmsPreferredPrice: '',
        heroSmsAcquirePriority: 'country',
      };
    }

    async function requestHostedCheckoutHeroSmsPayPalActivation(state = {}, options = {}) {
      if (typeof phoneVerificationHelpers?.requestPhoneActivationForRegion !== 'function'
        && typeof phoneVerificationHelpers?.requestPhoneActivation !== 'function') {
        throw buildHostedCheckoutConfigError(
          'PayPal HeroSMS（PayPal/BR）接码需要手机接码模块，但当前环境未加载。',
          {
            configSource: 'hero-sms-paypal-br',
            poolSize: 0,
            selectedEntry: null,
          }
        );
      }
      const requestState = buildHostedCheckoutHeroSmsPayPalState(state);
      const requestOptions = {
        ...options,
        step: options?.step || 8,
        stepKey: options?.stepKey || PAYPAL_HOSTED_STEP_CARD,
        providerId: 'hero-sms',
        regionCode: HERO_SMS_PAYPAL_BR_REGION,
      };
      const result = typeof phoneVerificationHelpers?.requestPhoneActivationForRegion === 'function'
        ? await phoneVerificationHelpers.requestPhoneActivationForRegion(requestState, requestOptions)
        : {
          activation: await phoneVerificationHelpers.requestPhoneActivation(requestState, requestOptions),
          requestedRegion: HERO_SMS_PAYPAL_BR_REGION,
          resolvedRegion: HERO_SMS_PAYPAL_BR_REGION,
          regionMatched: true,
        };
      const activation = normalizeHostedCheckoutPhoneSmsActivation(result?.activation);
      if (!activation?.phoneNumber) {
        throw new Error('PayPal HeroSMS（PayPal/BR）取号失败：HeroSMS 未返回有效手机号。');
      }
      const persisted = await persistHostedCheckoutHeroSmsPayPalActivation({
        ...activation,
        provider: 'hero-sms',
        serviceCode: HERO_SMS_PAYPAL_SERVICE_CODE,
        countryId: HERO_SMS_PAYPAL_BR_COUNTRY_ID,
        countryLabel: HERO_SMS_PAYPAL_BR_COUNTRY_LABEL,
        source: 'hosted-hero-sms-paypal-br',
        hostedCheckoutSmsSource: HOSTED_CHECKOUT_SMS_SOURCE_HERO_SMS_PAYPAL_BR,
      });
      await addHostedStepLog(
        requestOptions.stepKey,
        `步骤 ${getHostedStepNumber(requestOptions.stepKey)}：PayPal HeroSMS（PayPal/BR）已获取号码 ${maskHostedPhoneForLog(persisted.phoneNumber)}，缓存 20 分钟，期间不会回收/取消。`,
        'info'
      );
      return {
        activation: persisted,
        requestedRegion: HERO_SMS_PAYPAL_BR_REGION,
        resolvedRegion: HERO_SMS_PAYPAL_BR_REGION,
        regionMatched: true,
      };
    }

    async function ensureHostedCheckoutHeroSmsPayPalActivation(state = {}, options = {}) {
      const now = Date.now();
      const current = normalizeHostedCheckoutPhoneSmsActivation(
        state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_ACTIVATION_KEY]
          || state?.[HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]
      );
      const expiresAt = Math.max(
        0,
        Number(state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_EXPIRES_AT_KEY] || current?.expiresAt) || 0
      );
      if (
        current
        && isHostedCheckoutHeroSmsPayPalActivation(current)
        && current.phoneNumber
        && expiresAt > now
      ) {
        const persisted = await persistHostedCheckoutHeroSmsPayPalActivation(current, {
          cachedAt: state?.[HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHED_AT_KEY] || current.cachedAt || (expiresAt - HOSTED_CHECKOUT_HERO_SMS_PAYPAL_CACHE_TTL_MS),
          expiresAt,
        });
        return {
          activation: persisted,
          reused: true,
          requestedRegion: HERO_SMS_PAYPAL_BR_REGION,
          resolvedRegion: HERO_SMS_PAYPAL_BR_REGION,
          regionMatched: true,
        };
      }
      if (current) {
        await clearHostedCheckoutHeroSmsPayPalActivation();
      }
      return requestHostedCheckoutHeroSmsPayPalActivation(state, options);
    }

    async function ensureHostedCheckoutPhoneSmsActivation(state = {}, options = {}) {
      const current = normalizeHostedCheckoutPhoneSmsActivation(state?.[HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY]);
      if (current && isHostedCheckoutPhoneSmsReusable(state, current)) {
        let reusable = current;
        if (typeof phoneVerificationHelpers?.reactivatePhoneActivation === 'function') {
          reusable = normalizeHostedCheckoutPhoneSmsActivation(
            await phoneVerificationHelpers.reactivatePhoneActivation(state, current).catch(() => current)
          ) || current;
        }
        const persisted = await persistHostedCheckoutPhoneSmsActivation(reusable, {
          requestedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY],
          resolvedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY],
        });
        return {
          activation: persisted,
          reused: true,
          requestedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_REQUESTED_REGION_KEY] || '',
          resolvedRegion: state?.[HOSTED_CHECKOUT_PHONE_SMS_RESOLVED_REGION_KEY] || '',
        };
      }
      if (current) {
        await clearHostedCheckoutPhoneSmsActivation();
      }
      return requestHostedCheckoutPhoneSmsActivation(state, options);
    }

    async function updateHostedCheckoutPoolUsage(entry = null, options = {}) {
      const normalizedEntry = normalizeHostedCheckoutCurrentSmsEntry(entry);
      if (!normalizedEntry?.key || typeof getState !== 'function') {
        return null;
      }
      const state = await getState().catch(() => ({}));
      const usage = normalizeHostedCheckoutSmsPoolUsage(state?.hostedCheckoutSmsPoolUsage || {});
      const previous = usage[normalizedEntry.key] || {};
      const now = Date.now();
      const incrementUseCount = Boolean(options.incrementUseCount);
      const success = options.success === true;
      const enabled = options.enabled === undefined
        ? isHostedCheckoutSmsPoolEntryEnabled(previous)
        : Boolean(options.enabled);
      const failureCount = options.failureCount === undefined
        ? (
          success
            ? 0
            : Math.max(0, Math.floor(Number(previous.failureCount) || 0)) + (options.incrementFailureCount === true ? 1 : 0)
        )
        : Math.max(0, Math.floor(Number(options.failureCount) || 0));
      const nextUsage = {
        ...usage,
        [normalizedEntry.key]: {
          useCount: incrementUseCount
            ? Math.max(0, Math.floor(Number(previous.useCount) || 0)) + 1
            : Math.max(0, Math.floor(Number(previous.useCount) || 0)),
          usedAt: incrementUseCount
            ? now
            : Math.max(0, Number(previous.usedAt) || 0),
          lastAttemptAt: now,
          lastError: success ? '' : String(options.error || '').trim(),
          enabled,
          disabledReason: enabled ? '' : String(options.disabledReason || options.error || '').trim(),
          disabledAt: enabled ? 0 : Math.max(0, Number(options.disabledAt) || now),
          failureCount,
        },
      };
      await applyHostedCheckoutRuntimePatch({
        hostedCheckoutCurrentSmsEntry: normalizedEntry,
        hostedCheckoutSmsPoolUsage: nextUsage,
      });
      return nextUsage;
    }

    async function disableHostedCheckoutSmsPoolEntry(entry = null, reason = '', options = {}) {
      const normalizedEntry = normalizeHostedCheckoutCurrentSmsEntry(entry);
      if (!normalizedEntry?.key || typeof getState !== 'function') {
        return null;
      }
      const state = await getState().catch(() => ({}));
      const poolEntries = parseHostedCheckoutSmsPoolEntries(state?.hostedCheckoutSmsPoolText || '');
      const usage = normalizeHostedCheckoutSmsPoolUsage(state?.hostedCheckoutSmsPoolUsage || {});
      const maxUses = normalizeHostedCheckoutSmsPoolMaxUses(state?.hostedCheckoutSmsPoolMaxUses);
      const previous = usage[normalizedEntry.key] || {};
      if (!isHostedCheckoutSmsPoolEntryEnabled(previous)) {
        return {
          disabledEntry: normalizedEntry,
          nextEntry: chooseHostedCheckoutSmsPoolEntry(poolEntries, usage, maxUses),
        };
      }
      const nextUsage = await updateHostedCheckoutPoolUsage(normalizedEntry, {
        success: false,
        incrementFailureCount: false,
        failureCount: Math.max(0, Math.floor(Number(options.failureCount ?? previous.failureCount) || 0)),
        error: String(reason || '').trim(),
        enabled: false,
        disabledReason: String(reason || '').trim(),
      });
      const normalizedNextUsage = normalizeHostedCheckoutSmsPoolUsage(nextUsage || usage);
      const nextEntry = chooseHostedCheckoutSmsPoolEntry(poolEntries, normalizedNextUsage, maxUses);
      const currentKey = String(
        state?.hostedCheckoutCurrentSmsEntry?.key
        || buildHostedCheckoutPoolKey(
          state?.hostedCheckoutCurrentSmsEntry?.phone,
          state?.hostedCheckoutCurrentSmsEntry?.verificationUrl
        )
      ).trim();
      await applyHostedCheckoutRuntimePatch({
        hostedCheckoutCurrentSmsEntry: currentKey && currentKey === normalizedEntry.key
          ? (nextEntry || null)
          : state?.hostedCheckoutCurrentSmsEntry || null,
        hostedCheckoutSmsPoolUsage: normalizedNextUsage,
      });
      return {
        disabledEntry: normalizedEntry,
        nextEntry,
      };
    }

    function getHostedProfileFromState(state = {}) {
      const profile = state?.plusHostedCheckoutGuestProfile || state?.hostedCheckoutGuestProfile || null;
      return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : null;
    }

    function normalizeHostedProfileDisplayCountryCode(value = '') {
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      return normalized.length === 2 ? normalized : '';
    }

    function firstNonEmptyHostedProfileValue(...values) {
      for (const value of values) {
        const normalized = String(value || '').trim();
        if (normalized) {
          return normalized;
        }
      }
      return '';
    }

    function buildHostedProfileFullAddress(parts = {}) {
      return [
        parts.address1,
        parts.city,
        parts.region,
        parts.postalCode,
        parts.countryCode,
      ]
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join(' ');
    }

    function buildPayPalGeneratedProfileFromHostedProfile(profile = {}) {
      const source = profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
      const address = source.address && typeof source.address === 'object' && !Array.isArray(source.address)
        ? source.address
        : {};
      const countryCode = normalizeHostedProfileDisplayCountryCode(firstNonEmptyHostedProfileValue(
        source.countryCode,
        address.countryCode,
        source.generatedFromCountry,
        address.country
      ));
      const address1 = firstNonEmptyHostedProfileValue(source.address1, address.address1, address.street);
      const city = firstNonEmptyHostedProfileValue(source.city, address.city);
      const region = firstNonEmptyHostedProfileValue(source.region, source.state, address.region, address.state);
      const postalCode = firstNonEmptyHostedProfileValue(source.postalCode, source.zip, address.postalCode, address.zip);
      return {
        email: String(source.email || '').trim(),
        phone: String(source.phone || '').trim(),
        cardNumber: String(source.cardNumber || '').trim(),
        cardExpiry: String(source.cardExpiry || '').trim(),
        cardCvv: String(source.cardCvv || '').trim(),
        cardType: String(source.cardType || '').trim(),
        password: String(source.password || '').trim(),
        firstName: String(source.firstName || '').trim(),
        lastName: String(source.lastName || '').trim(),
        birthday: String(source.birthday || '').trim(),
        cpf: firstNonEmptyHostedProfileValue(source.cpf, address.cpf),
        cpfDigits: firstNonEmptyHostedProfileValue(source.cpfDigits, address.cpfDigits),
        cnpj: firstNonEmptyHostedProfileValue(source.cnpj, address.cnpj),
        cnpjDigits: firstNonEmptyHostedProfileValue(source.cnpjDigits, address.cnpjDigits),
        documentType: firstNonEmptyHostedProfileValue(source.documentType, address.documentType),
        documentNumber: firstNonEmptyHostedProfileValue(source.documentNumber, address.documentNumber),
        documentDigits: firstNonEmptyHostedProfileValue(source.documentDigits, address.documentDigits),
        countryCode,
        address1,
        streetName: firstNonEmptyHostedProfileValue(source.streetName, address.streetName),
        number: firstNonEmptyHostedProfileValue(source.number, source.streetNumber, address.number, address.streetNumber),
        neighborhood: firstNonEmptyHostedProfileValue(source.neighborhood, source.bairro, address.neighborhood, address.bairro),
        city,
        region,
        stateCode: firstNonEmptyHostedProfileValue(source.stateCode, address.stateCode),
        postalCode,
        fullAddress: firstNonEmptyHostedProfileValue(
          source.fullAddress,
          buildHostedProfileFullAddress({ address1, city, region, postalCode, countryCode })
        ),
        generatedFromCountry: normalizeHostedProfileDisplayCountryCode(source.generatedFromCountry) || countryCode,
        generatedAt: Math.max(0, Number(source.generatedAt) || Date.now()),
      };
    }

    function buildHostedProfileStatePatch(profile = {}) {
      const normalizedProfile = profile && typeof profile === 'object' && !Array.isArray(profile)
        ? {
          ...profile,
          email: String(profile.email || '').trim().toLowerCase(),
          phone: String(profile.phone || '').trim(),
          generatedAt: Math.max(0, Number(profile.generatedAt) || Date.now()),
        }
        : {};
      return {
        plusHostedCheckoutGuestProfile: normalizedProfile,
        hostedCheckoutGuestProfile: normalizedProfile,
        plusHostedCheckoutPhoneDigits: normalizedProfile.phone || '',
        paypalGeneratedProfile: buildPayPalGeneratedProfileFromHostedProfile(normalizedProfile),
      };
    }

    async function persistHostedGuestProfile(profile = {}) {
      const patch = buildHostedProfileStatePatch(profile);
      await setState(patch);
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(patch);
      }
      return patch.plusHostedCheckoutGuestProfile;
    }

    async function getLatestHostedState(state = {}) {
      const latestState = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      return {
        ...(latestState && typeof latestState === 'object' ? latestState : {}),
        ...(state && typeof state === 'object' ? state : {}),
      };
    }

    async function ensureHostedGuestProfile(state = {}, options = {}) {
      const forceRefresh = Boolean(options?.forceRefresh);
      const mergedState = await getLatestHostedState(state);
      const existingStoredProfile = getHostedProfileFromState(mergedState) || {};
      const existingProfile = forceRefresh ? {} : existingStoredProfile;
      const phonePlusMode = isPhonePlusModeState(mergedState);
      const paymentEmailInfo = phonePlusMode
        ? await resolvePhonePlusPaymentEmail(mergedState)
        : await resolveExistingHostedCheckoutPaymentEmail(mergedState);
      const config = await getHostedCheckoutRuntimeConfig(mergedState, {
        ensureCurrentSmsEntry: true,
      });
      const profileRegion = await resolveHostedProfileRegionForState(mergedState, {
        context: 'paypal-hosted-profile',
      });
      const countryCode = normalizeHostedProfileCountryCode(profileRegion?.countryCode || 'US', 'US');
      const rawNextPhone = forceRefresh ? config.phone : (config.phone || existingProfile.phone);
      const nextPhone = countryCode === 'BR'
        ? normalizeBrazilHostedPhoneForPayload(rawNextPhone)
        : normalizeHostedPhoneForPayload(rawNextPhone);
      if (countryCode === 'BR' && !nextPhone) {
        throw buildHostedCheckoutConfigError(
          '需要巴西 +55 接码号码：请导入 PayPal 接码池，或填写手动 PayPal 电话。',
          {
            configSource: config?.configSource || 'unknown',
            poolSize: config?.poolSize || 0,
            selectedEntry: config?.hostedCheckoutCurrentSmsEntry || null,
          }
        );
      }
      const existingAddressCountryCode = normalizeHostedProfileCountryCode(
        existingProfile?.address?.countryCode || existingProfile?.countryCode || '',
        ''
      );
      const canReuseExistingAddress = existingProfile.address
        && typeof existingProfile.address === 'object'
        && existingAddressCountryCode === countryCode;
      const address = forceRefresh
        ? await fetchHostedCheckoutAddress(countryCode)
        : (existingProfile.address && typeof existingProfile.address === 'object'
          && canReuseExistingAddress
          ? existingProfile.address
          : await fetchHostedCheckoutAddress(countryCode));
      const generatedProfile = buildHostedGuestProfile(address, {
        email: paymentEmailInfo?.email || existingStoredProfile.email || existingProfile.email,
        phone: nextPhone,
        countryCode,
      });
      const nextProfile = forceRefresh
        ? {
          ...generatedProfile,
          email: paymentEmailInfo?.email || existingStoredProfile.email || generatedProfile.email,
          address,
          phone: nextPhone,
          countryCode,
          generatedFromCountry: countryCode,
        }
        : {
          ...generatedProfile,
          ...existingProfile,
          email: paymentEmailInfo?.email || existingProfile.email || generatedProfile.email,
          address,
          phone: nextPhone,
          countryCode,
          generatedFromCountry: countryCode,
          firstName: generatedProfile.firstName,
          lastName: generatedProfile.lastName,
        };
      nextProfile.email = String(nextProfile.email || paymentEmailInfo?.email || '').trim().toLowerCase();
      if (!nextProfile.email) {
        throw new Error('Phone Plus 支付邮箱解析失败：未拿到有效支付邮箱。');
      }
      if (!nextProfile.phone) {
        throw buildHostedCheckoutConfigError(
          'PayPal hosted checkout 未拿到有效手机号配置，无法继续填写 PayPal 资料页。',
          {
            configSource: config?.configSource || 'unknown',
            poolSize: config?.poolSize || 0,
            selectedEntry: config?.hostedCheckoutCurrentSmsEntry || null,
          }
        );
      }
      await persistHostedGuestProfile(nextProfile);
      return {
        profile: nextProfile,
        config,
      };
    }

    async function getTabById(tabId) {
      const normalizedTabId = Number(tabId) || 0;
      if (!normalizedTabId || !chrome?.tabs?.get) {
        return null;
      }
      return chrome.tabs.get(normalizedTabId).catch(() => null);
    }

    async function registerHostedCheckoutTab(tabId, url = '') {
      if (typeof registerTab !== 'function' || !Number.isInteger(Number(tabId))) {
        return;
      }
      await registerTab(isPayPalUrl(url) ? PAYPAL_SOURCE : PLUS_CHECKOUT_SOURCE, Number(tabId));
    }

    async function findOpenHostedCheckoutTabId() {
      const queryTabs = typeof queryTabsInAutomationWindow === 'function'
        ? queryTabsInAutomationWindow
        : (chrome?.tabs?.query ? (queryInfo) => chrome.tabs.query(queryInfo) : null);
      if (typeof queryTabs !== 'function') {
        return 0;
      }
      const tabs = await queryTabs({}).catch(() => []);
      const candidates = (Array.isArray(tabs) ? tabs : [])
        .filter((tab) => Number.isInteger(tab?.id) && isHostedCheckoutRuntimeUrl(tab.url || ''));
      if (!candidates.length) {
        return 0;
      }
      const match = candidates.find((tab) => tab.active && tab.currentWindow)
        || candidates.find((tab) => tab.active)
        || candidates[0];
      if (match?.id && chrome?.tabs?.update) {
        await chrome.tabs.update(match.id, { active: true }).catch(() => {});
      }
      await registerHostedCheckoutTab(match.id, match.url || '');
      return match?.id || 0;
    }

    async function resolveHostedCheckoutTabId(state = {}, stepKey = '') {
      const storedTabId = Number(state?.plusCheckoutTabId) || 0;
      const storedTab = await getTabById(storedTabId);
      if (storedTab?.id && isHostedCheckoutRuntimeUrl(storedTab.url || '')) {
        await registerHostedCheckoutTab(storedTab.id, storedTab.url || '');
        return storedTab.id;
      }

      if (typeof getTabId === 'function') {
        const paypalTabId = await Promise.resolve(getTabId(PAYPAL_SOURCE)).catch(() => 0);
        const paypalAlive = typeof isTabAlive !== 'function'
          ? Boolean(paypalTabId)
          : await Promise.resolve(isTabAlive(PAYPAL_SOURCE)).catch(() => false);
        if (paypalTabId && paypalAlive) {
          return paypalTabId;
        }
        const checkoutTabId = await Promise.resolve(getTabId(PLUS_CHECKOUT_SOURCE)).catch(() => 0);
        const checkoutAlive = typeof isTabAlive !== 'function'
          ? Boolean(checkoutTabId)
          : await Promise.resolve(isTabAlive(PLUS_CHECKOUT_SOURCE)).catch(() => false);
        if (checkoutTabId && checkoutAlive) {
          return checkoutTabId;
        }
      }

      const discoveredTabId = await findOpenHostedCheckoutTabId();
      if (discoveredTabId) {
        await addHostedStepLog(stepKey, `步骤 ${getHostedStepNumber(stepKey)}：已从当前浏览器标签中发现 PayPal 无卡直绑页面，正在接管继续执行。`, 'info');
        return discoveredTabId;
      }

      throw new Error(`步骤 ${getHostedStepNumber(stepKey)}：未找到 PayPal 无卡直绑标签页，请先完成创建 checkout 节点。`);
    }

    async function getHostedCurrentUrl(tabId) {
      const tab = await getTabById(tabId);
      return String(tab?.url || '').trim();
    }

    async function updateHostedCheckoutTabState(tabId, payload = {}) {
      const currentUrl = await getHostedCurrentUrl(tabId);
      await setState({
        plusCheckoutTabId: tabId,
        plusCheckoutUrl: currentUrl,
        ...(payload && typeof payload === 'object' ? payload : {}),
      });
      return currentUrl;
    }

    async function completeHostedStep(stepKey, tabId, payload = {}) {
      const currentUrl = await updateHostedCheckoutTabState(tabId, payload);
      await completeNodeFromBackground(stepKey, {
        plusCheckoutUrl: currentUrl,
        ...(payload && typeof payload === 'object' ? payload : {}),
      });
    }

    async function completeHostedSuccessfulPayment(stepKey, tabId, state = {}, currentUrl = '', options = {}) {
      let config = null;
      try {
        config = await getHostedCheckoutRuntimeConfig(state, {
          ensureCurrentSmsEntry: false,
          allowExhaustedCurrentSmsEntry: true,
        });
      } catch (error) {
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：已检测到支付成功，但当前未能解析 PayPal 接码配置，跳过接码池次数更新。原因：${error.message}`,
          'warn'
        ).catch(() => {});
      }
      config = config || {
        oauthDelaySeconds: normalizeHostedCheckoutDelaySeconds(state?.plusHostedCheckoutOauthDelaySeconds),
        hostedCheckoutUsesSmsPool: false,
        hostedCheckoutCurrentSmsEntry: null,
        hostedCheckoutUsesPhoneSms: false,
        hostedCheckoutPhoneSmsActivation: null,
      };
      if (config?.hostedCheckoutUsesSmsPool && config?.hostedCheckoutCurrentSmsEntry) {
        await updateHostedCheckoutPoolUsage(config.hostedCheckoutCurrentSmsEntry, {
          incrementUseCount: true,
          success: true,
        });
      }
      if (config?.hostedCheckoutUsesPhoneSms && config?.hostedCheckoutPhoneSmsActivation) {
        await finalizeHostedCheckoutPhoneSmsActivationAfterSuccess(state, config.hostedCheckoutPhoneSmsActivation)
          .catch((error) => addHostedStepLog(
            stepKey,
            `步骤 ${getHostedStepNumber(stepKey)}：PayPal 手机接码复用状态更新失败：${error?.message || error}`,
            'warn'
          ));
      }
      const shouldWait = Boolean(options.waitBeforeComplete);
      if (shouldWait && config.oauthDelaySeconds > 0) {
        await addHostedStepLog(stepKey, `步骤 ${getHostedStepNumber(stepKey)}：支付成功后等待 ${config.oauthDelaySeconds} 秒，再继续账号接入。`, 'info');
        await sleepWithStop(config.oauthDelaySeconds * 1000);
      }
      await releaseHostedCheckoutConversionProxySessionAfterReviewAuthorization(stepKey, currentUrl, state, {
        successFallback: Boolean(options?.successFallback),
      });
      await completeHostedStep(stepKey, tabId, {
        plusReturnUrl: currentUrl,
        plusHostedCheckoutCompleted: true,
        plusHostedCheckoutOauthDelaySeconds: config.oauthDelaySeconds,
        ...(options.completionPayload && typeof options.completionPayload === 'object' ? options.completionPayload : {}),
      });
      return true;
    }

    async function inspectHostedCheckoutHomeFallback(tabId, stepKey, state = {}) {
      if (String(stepKey || '').trim() !== PAYPAL_HOSTED_STEP_REVIEW) {
        return {
          success: false,
          currentUrl: await getHostedCurrentUrl(tabId),
          detail: 'not-review-step',
        };
      }

      await addHostedStepLog(stepKey, `步骤 ${getHostedStepNumber(stepKey)}：未检测到 ChatGPT 支付成功 URL，打开 ChatGPT 主页面进行 Plus 状态兜底检查。`, 'warn');
      if (chrome?.tabs?.update) {
        await chrome.tabs.update(tabId, { url: HOSTED_CHECKOUT_HOME_FALLBACK_URL, active: true });
      }
      await waitForTabCompleteUntilStopped(tabId).catch(() => {});

      let lastFallback = null;
      let lastError = null;
      for (let attempt = 1; attempt <= HOSTED_CHECKOUT_HOME_FALLBACK_ATTEMPTS; attempt += 1) {
        throwIfStopped();
        try {
          const pageState = await inspectPlusCheckoutState(tabId);
          lastFallback = pageState?.homePlanFallback || null;
          const fallbackUrl = String(pageState?.url || await getHostedCurrentUrl(tabId) || '').trim();
          if (lastFallback?.successLikely) {
            await addHostedStepLog(
              stepKey,
              `步骤 ${getHostedStepNumber(stepKey)}：ChatGPT 主页面账号区域未出现 Free/Upgrade/免费/升级，按无卡直绑支付成功继续。`,
              'ok'
            );
            return {
              success: true,
              currentUrl: fallbackUrl || HOSTED_CHECKOUT_HOME_FALLBACK_URL,
              detail: lastFallback.reason || 'home-plan-fallback-success',
              fallback: lastFallback,
            };
          }
          await addHostedStepLog(
            stepKey,
            `步骤 ${getHostedStepNumber(stepKey)}：ChatGPT 主页面兜底检查第 ${attempt}/${HOSTED_CHECKOUT_HOME_FALLBACK_ATTEMPTS} 次未确认成功（${lastFallback?.reason || 'unknown'}${lastFallback?.blockingText ? `，命中文案：${lastFallback.blockingText}` : ''}）。`,
            'warn'
          );
        } catch (error) {
          lastError = error;
          await addHostedStepLog(
            stepKey,
            `步骤 ${getHostedStepNumber(stepKey)}：ChatGPT 主页面兜底检查第 ${attempt}/${HOSTED_CHECKOUT_HOME_FALLBACK_ATTEMPTS} 次失败：${error?.message || String(error || '未知错误')}`,
            'warn'
          );
        }

        if (attempt < HOSTED_CHECKOUT_HOME_FALLBACK_ATTEMPTS) {
          await sleepWithStop(HOSTED_CHECKOUT_HOME_FALLBACK_RETRY_DELAY_MS);
          if (chrome?.tabs?.reload) {
            await chrome.tabs.reload(tabId).catch(() => {});
            await waitForTabCompleteUntilStopped(tabId).catch(() => {});
          }
        }
      }

      const currentUrl = await getHostedCurrentUrl(tabId);
      return {
        success: false,
        currentUrl,
        detail: lastError?.message || lastFallback?.reason || 'home-plan-fallback-not-successful',
        fallback: lastFallback,
      };
    }

    function buildHostedCheckoutVerificationFailurePayload(strategy, fallbackResult = {}, stepKey = '') {
      const reason = String(
        fallbackResult?.detail
        || fallbackResult?.fallback?.reason
        || 'ChatGPT home fallback did not confirm Plus activation.'
      ).trim() || 'ChatGPT home fallback did not confirm Plus activation.';
      const failedAt = Date.now();
      const payload = {
        plusHostedCheckoutVerificationFailed: true,
        plusHostedCheckoutVerificationFailureStrategy: strategy,
        plusHostedCheckoutVerificationFailureReason: reason,
        plusHostedCheckoutVerificationFailurePreview: String(fallbackResult?.fallback?.accountAreaTextPreview || '').slice(0, 300),
        plusHostedCheckoutVerificationFailureAt: failedAt,
        plusHostedCheckoutCompleted: true,
        plusHostedCheckoutVerified: false,
      };
      if (strategy === PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY) {
        payload.plusCheckoutVerificationRetryRequested = true;
        payload.plusCheckoutVerificationRetryReason = reason;
        payload.plusCheckoutVerificationRetryAt = failedAt;
        payload.plusCheckoutVerificationRetryNodeId = String(stepKey || '').trim();
      }
      return payload;
    }

    async function completeHostedCheckoutAfterVerificationFailure(stepKey, tabId, state = {}, fallbackResult = {}, options = {}) {
      const strategy = normalizePlusCheckoutVerificationFailureStrategy(
        options.plusCheckoutVerificationFailureStrategy ?? state?.plusCheckoutVerificationFailureStrategy
      );
      const payload = buildHostedCheckoutVerificationFailurePayload(strategy, fallbackResult, stepKey);
      const reason = payload.plusHostedCheckoutVerificationFailureReason || 'unknown';

      if (strategy === PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY) {
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：Plus 最终状态验证未确认，按配置请求回到 plus-checkout-create 重建 Checkout。原因：${reason}`,
          'warn'
        );
        await completeHostedStep(stepKey, tabId, payload);
        return true;
      }

      await addHostedStepLog(
        stepKey,
        `步骤 ${getHostedStepNumber(stepKey)}：Plus 最终状态验证未确认，按配置继续后续流程；本次不会把账号簿标记为 Plus。原因：${reason}`,
        'warn'
      );
      return await completeHostedSuccessfulPayment(
        stepKey,
        tabId,
        state,
        fallbackResult.currentUrl || await getHostedCurrentUrl(tabId) || HOSTED_CHECKOUT_HOME_FALLBACK_URL,
        {
          ...options,
          successFallback: true,
          completionPayload: payload,
        }
      );
    }

    async function completeHostedStepIfSuccessful(stepKey, tabId, state = {}, options = {}) {
      const currentUrl = await getHostedCurrentUrl(tabId);
      if (isHostedCheckoutSuccessUrl(currentUrl)) {
        return await completeHostedSuccessfulPayment(stepKey, tabId, state, currentUrl, options);
      }
      if (!options.allowHomeFallback) {
        return false;
      }
      const fallbackResult = await inspectHostedCheckoutHomeFallback(tabId, stepKey, state);
      if (!fallbackResult.success) {
        if (options.throwOnHomeFallbackFailure) {
          return await completeHostedCheckoutAfterVerificationFailure(stepKey, tabId, state, fallbackResult, options);
        }
        return false;
      }
      return await completeHostedSuccessfulPayment(stepKey, tabId, state, fallbackResult.currentUrl, {
        ...options,
        successFallback: true,
        completionPayload: {
          plusHostedCheckoutSuccessFallback: true,
          plusHostedCheckoutSuccessFallbackReason: fallbackResult.detail || '',
          plusHostedCheckoutSuccessFallbackPreview: String(fallbackResult?.fallback?.accountAreaTextPreview || '').slice(0, 300),
          plusHostedCheckoutSuccessFallbackAt: Date.now(),
        },
      });
    }

    async function waitForUrlMatch(tabId, matcher, timeoutMs = 30000, retryDelayMs = 500) {
      const deadline = Date.now() + Math.max(1000, Number(timeoutMs) || 30000);
      while (Date.now() < deadline) {
        throwIfStopped();
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        if (!tab) {
          return null;
        }
        if (matcher(tab.url || '', tab)) {
          return tab;
        }
        await sleepWithStop(retryDelayMs);
      }
      return null;
    }

    async function inspectPlusCheckoutState(tabId, payload = {}) {
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
      });
      const result = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'PLUS_CHECKOUT_GET_STATE',
        source: 'background',
        payload,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result || {};
    }

    async function waitForCheckoutAmountSummary(tabId, options = {}) {
      const timeoutMs = Math.max(1000, Number(options.timeoutMs) || 8000);
      const retryDelayMs = Math.max(100, Number(options.retryDelayMs) || 500);
      const phaseLabel = String(options.phaseLabel || '').trim() || 'Checkout URL 打开后';
      const deadline = Date.now() + timeoutMs;
      let lastSummary = null;

      while (Date.now() < deadline) {
        throwIfStopped();
        try {
          const pageState = await inspectPlusCheckoutState(tabId);
          const amountSummary = pageState?.checkoutAmountSummary || null;
          if (amountSummary?.hasTodayDue) {
            return amountSummary;
          }
          lastSummary = amountSummary;
        } catch (error) {
          await addLog(`步骤 6：${phaseLabel}读取价格信息失败，将继续重试：${error?.message || String(error || '未知错误')}`, 'warn');
        }
        await sleepWithStop(retryDelayMs);
      }

      return lastSummary;
    }

    async function handlePhonePlusAmountGuardAtStep6(tabId, state = {}, options = {}) {
      const phaseLabel = String(options.phaseLabel || '').trim() || 'Checkout URL 打开后';
      const amountSummary = await waitForCheckoutAmountSummary(tabId, {
        timeoutMs: options.timeoutMs,
        retryDelayMs: options.retryDelayMs,
        phaseLabel,
      });

      if (!amountSummary?.hasTodayDue) {
        await addLog(`步骤 6：${phaseLabel}未能识别 checkout 的金额信息，将继续执行，后续由步骤 7 兜底检查。`, 'warn');
        return null;
      }

      if (amountSummary.isZero) {
        await addLog(`步骤 6：${phaseLabel}已确认金额为 ${amountSummary.rawAmount || '0'}，继续执行支付流程。`, 'ok');
        return {
          amountSummary,
          amountLabel: amountSummary.rawAmount || '0',
          phonePlusFallbackToFreeAuth: false,
        };
      }

      const amountLabel = amountSummary.rawAmount || (
        Number.isFinite(Number(amountSummary.amount)) ? String(amountSummary.amount) : '未知金额'
      );
      await addLog(`步骤 6：${phaseLabel}检测到金额不是 0（${amountLabel}），将停止 Phone Plus 支付链并切回 free auth 尾链。`, 'warn');

      if (isPhonePlusModeState(state) && typeof deps.handlePhonePlusNonFreeTrialFallback === 'function') {
        const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
          amountLabel,
          amountSummary,
          nodeId: String(options.nodeId || 'plus-checkout-create').trim() || 'plus-checkout-create',
          phaseLabel,
          tabId,
        });
        if (fallbackResult?.handled) {
          return {
            amountSummary,
            amountLabel,
            phonePlusFallbackToFreeAuth: true,
            fallbackResult,
          };
        }
      }

      return {
        amountSummary,
        amountLabel,
        phonePlusFallbackToFreeAuth: false,
      };
    }

    async function getHostedCheckoutRuntimeConfig(state = {}, options = {}) {
      try {
        return await resolveHostedCheckoutRuntimeConfig(state, options);
      } catch (error) {
        if (error?.hostedCheckoutConfigMeta) {
          const meta = error.hostedCheckoutConfigMeta;
          await addLog(
            `步骤 6：PayPal 接码配置校验失败。来源：${meta.configSource || 'unknown'}；池条目：${Math.max(0, Number(meta.poolSize) || 0)}；原因：${error.message}`,
            'error'
          ).catch(() => {});
        }
        throw error;
      }
    }

    function normalizeHostedCheckoutDelaySeconds(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return 3;
      }
      return Math.min(120, Math.max(0, Math.floor(numeric)));
    }

    function buildRandomHostedPassword() {
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^';
      let value = 'Aa1!';
      while (value.length < 14) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return value;
    }

    function buildRandomHostedBrazilPassword() {
      const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      const alphabet = `${letters}${digits}`;
      const chars = [
        letters[Math.floor(Math.random() * letters.length)],
        digits[Math.floor(Math.random() * digits.length)],
      ];
      while (chars.length < 14) {
        chars.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
      }
      for (let index = chars.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
      }
      return chars.join('');
    }

    function buildHostedVisaCard() {
      const digits = [4, 1, 4, 7];
      while (digits.length < 15) {
        digits.push(Math.floor(Math.random() * 10));
      }
      const reversed = digits.slice().reverse();
      let sum = 0;
      for (let index = 0; index < reversed.length; index += 1) {
        let digit = reversed[index];
        if (index % 2 === 0) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
      }
      digits.push((10 - (sum % 10)) % 10);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const year = (new Date().getFullYear() % 100) + 3;
      return {
        number: digits.join(''),
        expiry: `${month} / ${year}`,
        cvv: String(Math.floor(100 + Math.random() * 900)),
      };
    }

    function buildRandomHostedEmail() {
      const localPart = `guest.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      return `${localPart}@gmail.com`;
    }

    function normalizeHostedCheckoutAddress(address = {}, countryCode = 'US') {
      const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
      const location = source?.results?.[0]?.location || source?.location || {};
      const street = location?.street || {};
      const normalizedCountryCode = normalizeHostedProfileCountryCode(
        source.countryCode || source.country || countryCode,
        'US'
      );
      const streetLine = firstNonEmpty(
        [street?.number, street?.name].filter((item) => normalizeString(item)).join(' '),
        source.Address,
        source.Trans_Address,
        source.street,
        source.address1
      );
      const city = firstNonEmpty(source.City, source.city, location.city);
      const state = firstNonEmpty(source.State_Full, source.State, source.state, source.region, location.state);
      const zip = firstNonEmpty(source.Zip_Code, source.zip, source.postalCode, location.postcode)
        .replace(/[^\d-]/g, '')
        .slice(0, (() => {
          if (normalizedCountryCode === 'BR') return 9;
          if (normalizedCountryCode === 'JP') return 8;
          if (normalizedCountryCode === 'KZ') return 6;
          if (normalizedCountryCode === 'NP' || normalizedCountryCode === 'IQ') return 5;
          return 5;
        })());
      if (!streetLine || !city || !state || !zip) {
        return null;
      }
      const splitStreet = normalizedCountryCode === 'BR'
        ? splitHostedBrazilStreetAddress(streetLine)
        : { streetName: streetLine, number: '' };
      return {
        street: streetLine,
        address1: streetLine,
        streetName: firstNonEmpty(source.streetName, source.streetLine, splitStreet.streetName, streetLine),
        number: firstNonEmpty(source.number, source.streetNumber, splitStreet.number),
        neighborhood: firstNonEmpty(source.neighborhood, source.bairro),
        city,
        state,
        stateCode: firstNonEmpty(
          source.stateCode,
          source.uf,
          /^[A-Za-z]{2}$/.test(normalizeString(source.state)) ? source.state : ''
        ),
        zip,
        postalCode: zip,
        countryCode: normalizedCountryCode,
        country: getHostedCountryName(normalizedCountryCode),
        cpf: String(source.cpf || '').trim(),
        cpfDigits: String(source.cpfDigits || '').trim(),
        cnpj: String(source.cnpj || '').trim(),
        cnpjDigits: String(source.cnpjDigits || '').trim(),
        documentType: String(source.documentType || '').trim(),
        documentNumber: String(source.documentNumber || '').trim(),
        documentDigits: String(source.documentDigits || '').trim(),
        source: String(source.source || '').trim(),
      };
    }

    function normalizeBrazilHostedPostalCode(rawPostalCode = '', fallbackPostalCode = '') {
      const raw = normalizeString(rawPostalCode).replace(/[^\d-]/g, '');
      if (/^\d{5}-\d{3}$/.test(raw)) {
        return raw;
      }
      const rawDigits = raw.replace(/\D/g, '');
      if (rawDigits.length >= 8) {
        return `${rawDigits.slice(0, 5)}-${rawDigits.slice(5, 8)}`;
      }
      const fallback = normalizeString(fallbackPostalCode).replace(/[^\d-]/g, '');
      if (/^\d{5}-\d{3}$/.test(fallback)) {
        return fallback;
      }
      const fallbackDigits = fallback.replace(/\D/g, '');
      return fallbackDigits.length >= 8
        ? `${fallbackDigits.slice(0, 5)}-${fallbackDigits.slice(5, 8)}`
        : '';
    }

    function normalizeHostedBrazilAddress(address = {}, fallbackAddress = null) {
      const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
      const fallback = fallbackAddress && typeof fallbackAddress === 'object' && !Array.isArray(fallbackAddress)
        ? fallbackAddress
        : {};
      const street = firstNonEmpty(source.Trans_Address, source.Address, source.street, source.address1, fallback.street, fallback.address1);
      const city = firstNonEmpty(source.City, source.city, fallback.city, 'Sao Paulo');
      const state = firstNonEmpty(source.State_Full, source.State, source.state, source.region, fallback.state, fallback.region);
      const zip = normalizeBrazilHostedPostalCode(
        firstNonEmpty(source.Zip_Code, source.zip, source.postalCode),
        firstNonEmpty(fallback.zip, fallback.postalCode)
      );
      if (!street || !city || !state || !zip) {
        return null;
      }
      const splitStreet = splitHostedBrazilStreetAddress(street);
      return {
        street,
        address1: street,
        streetName: firstNonEmpty(source.streetName, fallback.streetName, splitStreet.streetName, street),
        number: firstNonEmpty(source.number, source.streetNumber, fallback.number, fallback.streetNumber, splitStreet.number),
        neighborhood: firstNonEmpty(source.neighborhood, source.bairro, fallback.neighborhood, fallback.bairro),
        city,
        state,
        stateCode: firstNonEmpty(
          source.stateCode,
          source.uf,
          /^[A-Za-z]{2}$/.test(normalizeString(source.state)) ? source.state : '',
          fallback.stateCode,
          fallback.uf,
          /^[A-Za-z]{2}$/.test(normalizeString(fallback.state)) ? fallback.state : ''
        ),
        zip,
        postalCode: zip,
        countryCode: 'BR',
        country: 'Brazil',
        cpf: String(source.cpf || fallback.cpf || '').trim(),
        cpfDigits: String(source.cpfDigits || fallback.cpfDigits || '').trim(),
        cnpj: String(source.cnpj || fallback.cnpj || '').trim(),
        cnpjDigits: String(source.cnpjDigits || fallback.cnpjDigits || '').trim(),
        documentType: String(source.documentType || fallback.documentType || 'cpf').trim(),
        documentNumber: String(source.documentNumber || fallback.documentNumber || source.cpf || fallback.cpf || '').trim(),
        documentDigits: String(source.documentDigits || fallback.documentDigits || source.cpfDigits || fallback.cpfDigits || '').trim(),
        source: String(source.source || fallback.source || 'local_brazil_profile_fallback').trim(),
      };
    }

    function enrichHostedBrazilAddress(address = {}) {
      const source = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
      const street = firstNonEmpty(source.street, source.address1);
      const splitStreet = splitHostedBrazilStreetAddress(street);
      const zip = normalizeBrazilHostedPostalCode(
        firstNonEmpty(source.zip, source.postalCode),
        firstNonEmpty(source.postalCode, source.zip)
      );
      return {
        ...source,
        street,
        address1: firstNonEmpty(source.address1, street),
        streetName: firstNonEmpty(source.streetName, source.streetLine, splitStreet.streetName, street),
        number: firstNonEmpty(source.number, source.streetNumber, splitStreet.number),
        neighborhood: firstNonEmpty(source.neighborhood, source.bairro),
        stateCode: firstNonEmpty(
          source.stateCode,
          source.uf,
          /^[A-Za-z]{2}$/.test(normalizeString(source.state)) ? source.state : ''
        ),
        zip: zip || firstNonEmpty(source.zip, source.postalCode),
        postalCode: zip || firstNonEmpty(source.postalCode, source.zip),
        countryCode: 'BR',
        country: 'Brazil',
      };
    }

    async function resolveHostedBrazilProfile(options = {}) {
      const generator = self.MultiPageBrazilProfileGenerator;
      if (generator?.resolveBrazilProfile) {
        return generator.resolveBrazilProfile({
          allowPublicLookup: typeof fetchImpl === 'function',
          fetchImpl,
          ...(options && typeof options === 'object' ? options : {}),
        });
      }
      const fallbackAddress = getFallbackHostedCheckoutAddress('BR');
      return {
        countryCode: 'BR',
        source: 'local_brazil_profile_fallback',
        street: fallbackAddress.street,
        address1: fallbackAddress.street,
        streetName: fallbackAddress.streetName || splitHostedBrazilStreetAddress(fallbackAddress.street).streetName,
        number: fallbackAddress.number || splitHostedBrazilStreetAddress(fallbackAddress.street).number,
        neighborhood: fallbackAddress.neighborhood || '',
        city: fallbackAddress.city,
        state: fallbackAddress.state,
        stateCode: fallbackAddress.stateCode || fallbackAddress.state,
        postalCode: fallbackAddress.zip,
        zip: fallbackAddress.zip,
        cpf: '',
        cpfDigits: '',
        cnpj: '',
        cnpjDigits: '',
        documentType: 'cpf',
        documentNumber: '',
        documentDigits: '',
        generatedFromCountry: 'BR',
        generatedAt: Date.now(),
      };
    }

    function normalizeHostedUsAddress(address = {}) {
      return normalizeHostedCheckoutAddress(address, 'US');
    }

    function getFallbackHostedCheckoutAddress(countryCode = 'US') {
      const normalizedCountryCode = normalizeHostedProfileCountryCode(countryCode, 'US');
      const candidates = HOSTED_CHECKOUT_REGIONAL_FALLBACK_ADDRESSES[normalizedCountryCode]
        || HOSTED_CHECKOUT_REGIONAL_FALLBACK_ADDRESSES.US;
      const index = Math.floor(Math.random() * candidates.length);
      return normalizeHostedCheckoutAddress(candidates[index] || candidates[0], normalizedCountryCode);
    }

    function getFallbackHostedUsAddress() {
      return getFallbackHostedCheckoutAddress('US');
    }

    async function fetchHostedCheckoutAddress(countryCode = 'US') {
      const normalizedCountryCode = normalizeHostedProfileCountryCode(countryCode, 'US');
      if (normalizedCountryCode === 'BR') {
        const profile = await resolveHostedBrazilProfile();
        if (profile?.publicLookupError) {
          await addLog(`步骤 6：巴西公开 CEP 地址增强不可用，使用本地巴西资料。${profile.publicLookupError}`, 'warn');
        }
        const address = self.MultiPageBrazilProfileGenerator?.toHostedCheckoutAddress
          ? self.MultiPageBrazilProfileGenerator.toHostedCheckoutAddress(profile)
          : normalizeHostedBrazilAddress(profile, getFallbackHostedCheckoutAddress('BR'));
        return address ? enrichHostedBrazilAddress(address) : getFallbackHostedCheckoutAddress('BR');
      }
      if (normalizedCountryCode !== 'US') {
        return getFallbackHostedCheckoutAddress(normalizedCountryCode);
      }
      try {
        const { response, data } = await fetchJsonWithTimeout(HOSTED_CHECKOUT_US_ADDRESS_ENDPOINT, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }, 30000);
        if (!response?.ok) {
          throw new Error(`HTTP ${response?.status || 0}`);
        }
        const address = normalizeHostedCheckoutAddress(data, normalizedCountryCode);
        if (address) {
          return address;
        }
        throw new Error('incomplete randomuser address');
      } catch (error) {
        await addLog(`Step 6: US hosted checkout address source unavailable, using built-in US fallback. ${error?.message || String(error || '')}`, 'warn');
        return getFallbackHostedCheckoutAddress(normalizedCountryCode);
      }
    }

    function getHostedProfileCountryCode(profile = {}) {
      return normalizeHostedProfileCountryCode(
        profile?.countryCode
        || profile?.generatedFromCountry
        || profile?.address?.countryCode
        || profile?.address?.country
        || 'US',
        'US'
      );
    }

    function buildHostedGuestProfile(address = {}, config = {}) {
      const card = buildHostedVisaCard();
      const countryCode = normalizeHostedProfileCountryCode(config?.countryCode || address?.countryCode || 'US', 'US');
      const normalizedAddress = normalizeHostedCheckoutAddress(address, countryCode) || getFallbackHostedCheckoutAddress(countryCode);
      const regionalName = pickHostedRegionalName(normalizedAddress.countryCode || countryCode);
      return {
        email: String(config?.email || buildRandomHostedEmail()).trim().toLowerCase(),
        password: normalizedAddress.countryCode === 'BR' ? buildRandomHostedBrazilPassword() : buildRandomHostedPassword(),
        phone: String(config?.phone || '').trim(),
        firstName: regionalName.firstName || 'James',
        lastName: regionalName.lastName || 'Smith',
        birthday: buildHostedBirthdayString(new Date(), normalizedAddress.countryCode === 'BR' ? 'br' : 'iso'),
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        cardType: 'credit',
        address: normalizedAddress,
        cpf: normalizedAddress.cpf || '',
        cpfDigits: normalizedAddress.cpfDigits || '',
        cnpj: normalizedAddress.cnpj || '',
        cnpjDigits: normalizedAddress.cnpjDigits || '',
        documentType: normalizedAddress.documentType || '',
        documentNumber: normalizedAddress.documentNumber || '',
        documentDigits: normalizedAddress.documentDigits || '',
        countryCode: normalizedAddress.countryCode || countryCode,
        generatedFromCountry: normalizedAddress.countryCode || countryCode,
        generatedAt: Date.now(),
      };
    }

    function getHostedProfileDocumentPayload(profile = {}) {
      const source = profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
      const address = source.address && typeof source.address === 'object' && !Array.isArray(source.address)
        ? source.address
        : {};
      return {
        birthday: firstNonEmptyHostedProfileValue(source.birthday, address.birthday),
        cardType: firstNonEmptyHostedProfileValue(source.cardType, address.cardType),
        streetName: firstNonEmptyHostedProfileValue(source.streetName, address.streetName),
        number: firstNonEmptyHostedProfileValue(source.number, source.streetNumber, address.number, address.streetNumber),
        neighborhood: firstNonEmptyHostedProfileValue(source.neighborhood, source.bairro, address.neighborhood, address.bairro),
        stateCode: firstNonEmptyHostedProfileValue(source.stateCode, address.stateCode),
        documentType: firstNonEmptyHostedProfileValue(source.documentType, address.documentType),
        documentNumber: firstNonEmptyHostedProfileValue(source.documentNumber, address.documentNumber, source.cpf, address.cpf),
        documentDigits: firstNonEmptyHostedProfileValue(source.documentDigits, address.documentDigits, source.cpfDigits, address.cpfDigits),
        cpf: firstNonEmptyHostedProfileValue(source.cpf, address.cpf),
        cpfDigits: firstNonEmptyHostedProfileValue(source.cpfDigits, address.cpfDigits),
        cnpj: firstNonEmptyHostedProfileValue(source.cnpj, address.cnpj),
        cnpjDigits: firstNonEmptyHostedProfileValue(source.cnpjDigits, address.cnpjDigits),
      };
    }

    function mergeHostedProfileAddress(profile = {}, address = {}) {
      const nextAddress = address && typeof address === 'object' && !Array.isArray(address) ? address : {};
      const addressPayload = getHostedProfileDocumentPayload({
        ...(profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {}),
        address: nextAddress,
      });
      return {
        ...(profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {}),
        address: nextAddress,
        birthday: addressPayload.birthday || profile.birthday || '',
        cardType: addressPayload.cardType || profile.cardType || '',
        ...addressPayload,
      };
    }

    function buildHostedOpenAiPayload(profile = {}, extra = {}) {
      return {
        email: String(profile?.email || '').trim(),
        address: profile?.address,
        ...getHostedProfileDocumentPayload(profile),
        ...(extra && typeof extra === 'object' ? extra : {}),
      };
    }

    function extractHostedVerificationCode(payload = '') {
      const trustedTextKeyPattern = /^(sms|message|msg|text|content|body|code|otp|verification_code|verificationCode)$/i;
      const metadataKeyPattern = /(^|[_-])(phone|mobile|tel|id|order|time|date|expired|expire|status)([_-]|$)/i;
      const contextualCodePattern = /(?:security\s*code|verification\s*code|one[-\s]?time\s*(?:passcode|code)|passcode|otp|code|验证码|安全码)[\s\S]{0,50}?(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)|(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)[\s\S]{0,50}?(?:security\s*code|verification\s*code|one[-\s]?time\s*(?:passcode|code)|passcode|otp|code|验证码|安全码)/i;
      const exactCodePattern = /^\D*(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)\D*$/;
      const seen = new Set();

      function collectCandidates(value, path = '') {
        if (value === null || value === undefined) {
          return [];
        }
        if (typeof value === 'string' || typeof value === 'number') {
          const text = String(value).trim();
          return text ? [{
            key: String(path).split('.').pop() || '',
            path,
            text,
          }] : [];
        }
        if (typeof value !== 'object') {
          return [];
        }
        if (seen.has(value)) {
          return [];
        }
        seen.add(value);
        if (Array.isArray(value)) {
          return value.flatMap((item, index) => collectCandidates(item, `${path}[${index}]`));
        }
        return Object.entries(value).flatMap(([key, child]) => (
          collectCandidates(child, path ? `${path}.${key}` : key)
        ));
      }

      function extractContextualCode(text) {
        const match = String(text || '').match(contextualCodePattern);
        return match ? (match[1] || match[2]).replace(/\D+/g, '') : '';
      }

      const candidates = collectCandidates(payload);

      for (const candidate of candidates) {
        const code = extractContextualCode(candidate.text);
        if (code) {
          return code;
        }
      }

      for (const candidate of candidates) {
        const key = String(candidate.key || '');
        const path = String(candidate.path || '');
        const isRootText = !path;
        if (!isRootText && (!trustedTextKeyPattern.test(key) || metadataKeyPattern.test(key) || metadataKeyPattern.test(path))) {
          continue;
        }
        const match = candidate.text.match(exactCodePattern);
        if (match) {
          return match[1].replace(/\D+/g, '');
        }
      }

      return '';
    }

    function collectHostedCheckoutPayloadTextCandidates(value, path = '', seen = new Set()) {
      if (value === null || value === undefined) {
        return [];
      }
      if (typeof value === 'string') {
        const text = value.trim();
        return text ? [{
          key: String(path).split('.').pop() || '',
          path,
          text,
        }] : [];
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return [];
      }
      if (typeof value !== 'object') {
        return [];
      }
      if (seen.has(value)) {
        return [];
      }
      seen.add(value);
      if (Array.isArray(value)) {
        return value.flatMap((item, index) => collectHostedCheckoutPayloadTextCandidates(item, `${path}[${index}]`, seen));
      }
      return Object.entries(value).flatMap(([key, child]) => (
        collectHostedCheckoutPayloadTextCandidates(child, path ? `${path}.${key}` : key, seen)
      ));
    }

    function isHostedCheckoutNoCodePlaceholderText(text = '') {
      const normalized = String(text || '').replace(/\s+/g, ' ').trim();
      if (!normalized) {
        return true;
      }
      if (/^(?:ok|success|true|false|null|none|no|0|200)$/i.test(normalized)) {
        return true;
      }
      return /暂无验证码|暂无(?:短信|消息)|未收到|没有(?:验证码|短信)|等待(?:短信|验证码)|no\s*(?:sms|code|message)|not\s*(?:found|ready|received)|pending|waiting/i.test(normalized);
    }

    function getHostedCheckoutNonVerificationContentPreview(payload = {}) {
      const candidates = collectHostedCheckoutPayloadTextCandidates(payload);
      for (const candidate of candidates) {
        const key = String(candidate.key || '');
        const path = String(candidate.path || '');
        const text = String(candidate.text || '').replace(/\s+/g, ' ').trim();
        if (!text || isHostedCheckoutNoCodePlaceholderText(text)) {
          continue;
        }
        if (/^(?:msg|message|status|code)$/i.test(key) && text.length < 16) {
          continue;
        }
        if (/(?:^|[.\[])(?:msg|message|status|code)(?:\]|\b|$)/i.test(path) && text.length < 16) {
          continue;
        }
        if (/paypal|thanks\s+for\s+confirming|confirming\s+your\s+phone|transaction\s+alerts|log\s+in\s+or\s+get\s+the\s+app|security|verification|验证码|安全码/i.test(text)) {
          return text.slice(0, 180);
        }
        if (text.length >= 24) {
          return text.slice(0, 180);
        }
      }
      return '';
    }

    function getHostedCheckoutNoCodeResponsePreview(payload = {}) {
      if (typeof payload === 'string') {
        return payload.replace(/\s+/g, ' ').trim().slice(0, 180);
      }
      try {
        return JSON.stringify(payload).replace(/\s+/g, ' ').trim().slice(0, 180);
      } catch {
        return '';
      }
    }

    function buildHostedCheckoutNoVerificationCodeError(payload = {}) {
      const preview = getHostedCheckoutNonVerificationContentPreview(payload);
      const error = new Error('hosted checkout 验证码接口暂未返回有效验证码（暂未返回有效 6 位验证码）。');
      if (preview) {
        error.hostedCheckoutResendImmediately = true;
        error.hostedCheckoutResponsePreview = preview;
        error.message = `hosted checkout 验证码接口暂未返回有效验证码（暂未返回有效 6 位验证码），返回了非验证码内容，准备直接 Resend：${preview}`;
      } else {
        const responsePreview = getHostedCheckoutNoCodeResponsePreview(payload);
        if (responsePreview) {
          error.hostedCheckoutResponsePreview = responsePreview;
          error.message = `hosted checkout 验证码接口暂未返回有效验证码（暂未返回有效 6 位验证码），响应预览：${responsePreview}`;
        }
      }
      return error;
    }

    function parseHostedCheckoutVerificationPayloadText(text = '') {
      const rawText = String(text || '');
      try {
        return rawText ? JSON.parse(rawText) : {};
      } catch {
        return rawText;
      }
    }

    async function readHostedCheckoutVerificationTextFromTab(tabId, timeoutMs = 9000) {
      const startedAt = Date.now();
      let lastText = '';
      while (Date.now() - startedAt < timeoutMs) {
        throwIfStopped();
        const injections = await chrome.scripting.executeScript({
          target: { tabId, allFrames: false },
          world: 'MAIN',
          func: () => {
            const bodyText = document.body?.innerText || '';
            const documentText = document.documentElement?.innerText || '';
            return String(bodyText || documentText || '').trim();
          },
        }).catch(() => []);
        const text = String(injections?.[0]?.result || '').trim();
        if (text) {
          lastText = text;
          const payload = parseHostedCheckoutVerificationPayloadText(text);
          if (extractHostedVerificationCode(payload)) {
            return text;
          }
          if (!/just a moment|enable javascript and cookies|checking your browser|cloudflare/i.test(text)) {
            return text;
          }
        }
        await sleepWithStop(1000);
      }
      return lastText;
    }

    async function fetchHostedCheckoutVerificationCodeViaBrowserTab(verificationUrl = '') {
      if (!chrome?.tabs || !chrome?.scripting?.executeScript) {
        throw new Error('当前运行环境不支持浏览器标签页兜底取码。');
      }
      const created = typeof createAutomationTab === 'function'
        ? await createAutomationTab({ url: verificationUrl, active: false })
        : await chrome.tabs.create({ url: verificationUrl, active: false });
      const tabId = Number(created?.id);
      if (!Number.isInteger(tabId)) {
        throw new Error('浏览器标签页兜底取码失败：无法打开验证码接口页面。');
      }
      try {
        await waitForTabCompleteUntilStopped(tabId, { timeoutMs: 15000 }).catch(() => null);
        const text = await readHostedCheckoutVerificationTextFromTab(tabId);
        const payload = parseHostedCheckoutVerificationPayloadText(text);
        const code = extractHostedVerificationCode(payload);
        if (!code) {
          const error = buildHostedCheckoutNoVerificationCodeError(payload);
          error.message = `浏览器标签页兜底取码未解析到验证码：${error.message}`;
          throw error;
        }
        await addLog('步骤 6：后台接口未直接返回验证码，已通过浏览器标签页兜底读取到验证码。', 'info');
        return {
          code,
          payload,
        };
      } finally {
        await chrome.tabs.remove(tabId).catch(() => {});
      }
    }

    async function fetchHostedVerificationCode(verificationUrl = '') {
      const url = String(verificationUrl || '').trim();
      if (!url) {
        throw new Error('未配置 OpenAI Checkout 验证码接口。');
      }
      const fetcher = typeof fetchImpl === 'function'
        ? fetchImpl
        : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前运行环境不支持 fetch，无法获取 OpenAI Checkout 验证码。');
      }
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetcher(`${url}${separator}t=${Date.now()}`, {
        method: 'GET',
        headers: { Accept: 'application/json,text/plain,*/*' },
      });
      const text = await response.text().catch(() => '');
      const payload = parseHostedCheckoutVerificationPayloadText(text);
      const code = extractHostedVerificationCode(payload);
      if (!code) {
        throw buildHostedCheckoutNoVerificationCodeError(payload);
      }
      return code;
    }

    async function fetchHostedCheckoutVerificationCodeManually(options = {}) {
      const manualVerificationUrl = String(options?.verificationUrl || '').trim();
      if (manualVerificationUrl) {
        const fetcher = typeof fetchImpl === 'function'
          ? fetchImpl
          : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        if (typeof fetcher !== 'function') {
          throw new Error('当前运行环境不支持 fetch，无法获取 hosted checkout 验证码。');
        }
        const response = await fetcher(manualVerificationUrl, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            Accept: 'application/json,text/plain,*/*',
            'Cache-Control': 'no-cache, no-store, max-age=0',
            Pragma: 'no-cache',
          },
        });
        const text = await response.text().catch(() => '');
        const payload = parseHostedCheckoutVerificationPayloadText(text);
        const code = extractHostedVerificationCode(payload);
        if (!code) {
          const noCodeError = buildHostedCheckoutNoVerificationCodeError(payload);
          if (!noCodeError.hostedCheckoutResendImmediately) {
            try {
              const fallbackResult = await fetchHostedCheckoutVerificationCodeViaBrowserTab(manualVerificationUrl);
              return {
                code: fallbackResult.code,
                verificationUrl: manualVerificationUrl,
              };
            } catch (fallbackError) {
              await addLog(`步骤 6：浏览器标签页兜底取码未成功：${fallbackError?.message || fallbackError}`, 'warn');
            }
          }
          throw noCodeError;
        }
        return {
          code,
          verificationUrl: manualVerificationUrl,
        };
      }
      try {
        const code = await fetchHostedCheckoutVerificationCode(options?.state || {});
        const runtimeConfig = await getHostedCheckoutRuntimeConfig(options?.state || {}, {
          ensureCurrentSmsEntry: true,
        });
        return {
          code,
          verificationUrl: String(runtimeConfig?.verificationUrl || '').trim(),
        };
      } finally {
        await clearHostedCheckoutCurrentSmsEntry();
      }
    }

    async function pollHostedVerificationCode(verificationUrl = '') {
      let lastError = null;
      for (let attempt = 1; attempt <= HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS; attempt += 1) {
        throwIfStopped();
        try {
          const code = await fetchHostedVerificationCode(verificationUrl);
          await addLog(`步骤 6：已获取 OpenAI Checkout 验证码（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}）。`, 'info');
          return code;
        } catch (error) {
          lastError = error;
          const runtimeConfig = await getHostedCheckoutRuntimeConfig({}, {
            ensureCurrentSmsEntry: false,
          }).catch(() => null);
          if (runtimeConfig?.hostedCheckoutUsesSmsPool && runtimeConfig?.hostedCheckoutCurrentSmsEntry) {
            await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
              success: false,
              error: error?.message || String(error || '验证码接口返回失败'),
            }).catch(() => {});
          }
          await addLog(`步骤 6：OpenAI Checkout 验证码暂不可用（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}）：${error?.message || error}`, 'warn');
          if (attempt < HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS) {
            await sleepWithStop(HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS);
          }
        }
      }
      throw lastError || new Error('OpenAI Checkout 验证码轮询失败。');
    }

    async function fetchHostedCheckoutVerificationCode(state = {}) {
      const runtimeConfig = await getHostedCheckoutRuntimeConfig(state, {
        ensureCurrentSmsEntry: true,
      });
      if (runtimeConfig?.hostedCheckoutUsesPhoneSms) {
        const activation = normalizeHostedCheckoutPhoneSmsActivation(runtimeConfig.hostedCheckoutPhoneSmsActivation);
        if (!activation) {
          throw new Error('PayPal 跟随手机接码配置未找到当前取号订单。');
        }
        if (typeof phoneVerificationHelpers?.pollPhoneActivationCode !== 'function') {
          throw new Error('PayPal 跟随手机接码配置无法取码：手机接码轮询模块未加载。');
        }
        const code = await phoneVerificationHelpers.pollPhoneActivationCode(state, activation, {
          timeoutMs: Math.max(1, Number(runtimeConfig?.verificationPollAttempts) || 1)
            * Math.max(1, Number(runtimeConfig?.verificationPollIntervalSeconds) || 5)
            * 1000,
          intervalMs: Math.max(1, Number(runtimeConfig?.verificationPollIntervalSeconds) || 5) * 1000,
        });
        if (code) {
          await persistHostedCheckoutPhoneSmsActivation({
            ...activation,
            phoneCodeReceived: true,
            phoneCodeReceivedAt: Date.now(),
          }, {
            requestedRegion: runtimeConfig?.hostedCheckoutPhoneSmsRequestedRegion,
            resolvedRegion: runtimeConfig?.hostedCheckoutPhoneSmsResolvedRegion,
          });
        }
        return code;
      }
      const verificationUrl = runtimeConfig.verificationUrl;
      if (runtimeConfig?.hostedCheckoutUsesSmsPool && !verificationUrl) {
        const phone = runtimeConfig?.hostedCheckoutCurrentSmsEntry?.phone || runtimeConfig?.phone || '';
        throw new Error(`PayPal 接码池条目 ${maskHostedPhoneForLog(phone)} 只有手机号，没有验证码接口；请人工取码，或为该号码补充验证码接口后重试。`);
      }
      await addLog(`步骤 6：当前 hosted checkout 验证码接口配置为 ${verificationUrl || '(空)'}。`, 'info');
      const fetcher = typeof fetchImpl === 'function'
        ? fetchImpl
        : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前运行环境不支持 fetch，无法获取 hosted checkout 验证码。');
      }
      if (!verificationUrl) {
        throw new Error('当前未配置 hosted checkout 验证码接口地址。');
      }
      const response = await fetcher(verificationUrl, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          Accept: 'application/json,text/plain,*/*',
          'Cache-Control': 'no-cache, no-store, max-age=0',
          Pragma: 'no-cache',
        },
      });
      const text = await response.text().catch(() => '');
      const payload = parseHostedCheckoutVerificationPayloadText(text);
      const code = extractHostedVerificationCode(payload);
      if (!code) {
        const noCodeError = buildHostedCheckoutNoVerificationCodeError(payload);
        if (!noCodeError.hostedCheckoutResendImmediately && verificationUrl) {
          try {
            const fallbackResult = await fetchHostedCheckoutVerificationCodeViaBrowserTab(verificationUrl);
            if (runtimeConfig.hostedCheckoutUsesSmsPool && runtimeConfig.hostedCheckoutCurrentSmsEntry) {
              await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
                success: true,
              });
            }
            return fallbackResult.code;
          } catch (fallbackError) {
            await addLog(`步骤 6：浏览器标签页兜底取码未成功：${fallbackError?.message || fallbackError}`, 'warn');
          }
        }
        if (runtimeConfig.hostedCheckoutUsesSmsPool && runtimeConfig.hostedCheckoutCurrentSmsEntry) {
          await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
            success: false,
            error: noCodeError.message,
          });
        }
        throw noCodeError;
      }
      if (runtimeConfig.hostedCheckoutUsesSmsPool && runtimeConfig.hostedCheckoutCurrentSmsEntry) {
        await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
          success: true,
        });
      }
      return code;
    }

    async function waitForHostedCheckoutVerificationCodeWindow(waitSeconds, options = {}) {
      const normalizedWaitSeconds = normalizeHostedCheckoutResendWaitSeconds(waitSeconds, 0);
      const label = String(options.label || 'PayPal 验证码').trim() || 'PayPal 验证码';
      const pollAttempts = normalizeHostedCheckoutVerificationPollAttempts(options.pollAttempts);
      const pollIntervalSeconds = normalizeHostedCheckoutVerificationPollIntervalSeconds(options.pollIntervalSeconds);
      const pollIntervalMs = pollIntervalSeconds * 1000;
      const allowImmediateResendOnNonCode = options.allowImmediateResendOnNonCode !== false;
      const excludedCodes = new Set(
        Array.isArray(options.excludedCodes)
          ? options.excludedCodes.map((item) => String(item || '').trim()).filter(Boolean)
          : []
      );
      const allowExcludedCodeFallback = options.allowExcludedCodeFallback !== false;
      const deadline = Date.now() + normalizedWaitSeconds * 1000;
      let attempt = 0;
      let lastError = null;
      let fallbackExcludedCode = '';

      while (attempt < pollAttempts && (attempt === 0 || Date.now() < deadline)) {
        throwIfStopped();
        attempt += 1;
        try {
          const code = await fetchHostedCheckoutVerificationCode();
          if (excludedCodes.has(code)) {
            fallbackExcludedCode = code;
            lastError = new Error(`接口仍返回已试过的旧验证码 ${code}，继续等待新验证码。`);
            const remainingMs = Math.max(0, deadline - Date.now());
            if (remainingMs <= 0 || attempt >= pollAttempts) {
              break;
            }
            await addLog(`步骤 6：${label} 命中已试过的旧验证码 ${code}（${attempt}/${pollAttempts}），继续等待 ${Math.ceil(remainingMs / 1000)} 秒。`, 'warn');
            await sleepWithStop(Math.min(pollIntervalMs, remainingMs));
            continue;
          }
          await addLog(`步骤 6：已获取 ${label}（等待窗口 ${normalizedWaitSeconds} 秒，第 ${attempt}/${pollAttempts} 次请求）。`, 'info');
          return code;
        } catch (error) {
          lastError = error;
          if (error?.hostedCheckoutResendImmediately) {
            if (allowImmediateResendOnNonCode) {
              await addLog(`步骤 6：${label} 接口返回非验证码内容，将立即触发 Resend：${error.hostedCheckoutResponsePreview || error.message}`, 'warn');
              return null;
            }
            const remainingMs = Math.max(0, deadline - Date.now());
            if (remainingMs <= 0 || attempt >= pollAttempts) {
              break;
            }
            await addLog(`步骤 6：${label} 接口返回非验证码内容，继续等待当前窗口：${error.hostedCheckoutResponsePreview || error.message}`, 'warn');
            await sleepWithStop(Math.min(pollIntervalMs, remainingMs));
            continue;
          }
          const remainingMs = Math.max(0, deadline - Date.now());
          if (remainingMs <= 0 || attempt >= pollAttempts) {
            break;
          }
          await addLog(`步骤 6：${label} 暂不可用（${attempt}/${pollAttempts}），继续等待 ${Math.ceil(remainingMs / 1000)} 秒：${error?.message || error}`, 'warn');
          await sleepWithStop(Math.min(pollIntervalMs, remainingMs));
        }
      }

      if (fallbackExcludedCode && allowExcludedCodeFallback) {
        await addLog(`步骤 6：${label} 在等待窗口内未拿到新验证码，接口始终返回同一码 ${fallbackExcludedCode}，本次将兜底再试一次该验证码。`, 'warn');
        return fallbackExcludedCode;
      }

      await addLog(
        `步骤 6：${label} 在 ${normalizedWaitSeconds} 秒等待窗口内仍未返回有效验证码${lastError ? `：${lastError.message || lastError}` : '。'}`,
        'warn'
      );
      return null;
    }

    async function clickHostedCheckoutVerificationResend(tabId, attempt = 1, maxAttempts = 1, reason = '', options = {}) {
      const reasonText = reason ? `${reason}，` : '';
      await addLog(`步骤 6：${reasonText}正在点击 PayPal 验证码 Resend（${attempt}/${maxAttempts}）...`, 'warn');
      const preClickDelayMs = Math.max(0, Math.floor(Number(options?.preClickDelayMs) || 0));
      if (preClickDelayMs > 0) {
        await sleepWithStop(preClickDelayMs);
      }
      const resendResult = await runHostedPayPalStep(tabId, {
        resendVerificationCode: true,
      });
      if (resendResult?.resendSkipped) {
        await addLog(`步骤 6：PayPal 页面已不在验证码页（当前阶段：${resendResult.stage || 'unknown'}），跳过本次 Resend。`, 'warn');
        return resendResult;
      }
      await addLog('步骤 6：已点击 PayPal 验证码 Resend。', 'info');
      return resendResult;
    }

    async function acquireHostedCheckoutPayPalVerificationCode(tabId, resendAttemptsUsed = 0) {
      const runtimeConfig = await getHostedCheckoutRuntimeConfig({}, {
        ensureCurrentSmsEntry: true,
      });
      const maxResendAttempts = normalizeHostedCheckoutVerificationResendMaxAttempts(
        runtimeConfig?.verificationResendMaxAttempts
      );
      const firstWaitSeconds = normalizeHostedCheckoutResendWaitSeconds(
        runtimeConfig?.firstResendWaitSeconds,
        HOSTED_CHECKOUT_FIRST_RESEND_WAIT_DEFAULT_SECONDS
      );
      const subsequentWaitSeconds = normalizeHostedCheckoutResendWaitSeconds(
        runtimeConfig?.subsequentResendWaitSeconds,
        HOSTED_CHECKOUT_SUBSEQUENT_RESEND_WAIT_DEFAULT_SECONDS
      );
      const pollOptions = {
        pollAttempts: runtimeConfig?.verificationPollAttempts,
        pollIntervalSeconds: runtimeConfig?.verificationPollIntervalSeconds,
      };
      let usedResendAttempts = Math.max(0, Math.floor(Number(resendAttemptsUsed) || 0));

      if (runtimeConfig?.firstDirectResendEnabled && usedResendAttempts < maxResendAttempts) {
        await addLog('步骤 6：已开启 PayPal 接码首次直接重发，检测到验证码弹窗后等待 1 秒并点击 Resend。', 'warn');
        await sleepWithStop(HOSTED_CHECKOUT_FIRST_DIRECT_RESEND_DELAY_MS);
        usedResendAttempts += 1;
        await clickHostedCheckoutVerificationResend(tabId, usedResendAttempts, maxResendAttempts, '首次直接重发');
        if (runtimeConfig?.hostedCheckoutUsesPhoneSms && runtimeConfig?.hostedCheckoutPhoneSmsActivation) {
          await phoneVerificationHelpers?.requestAdditionalPhoneSms?.(
            await getLatestHostedState({}),
            runtimeConfig.hostedCheckoutPhoneSmsActivation
          ).catch(() => {});
        }
        const directCode = await waitForHostedCheckoutVerificationCodeWindow(firstWaitSeconds, {
          label: 'PayPal 首次重发验证码',
          ...pollOptions,
        });
        if (directCode) {
          return {
            code: directCode,
            resendAttemptsUsed: usedResendAttempts,
          };
        }
      } else {
        const initialCode = await waitForHostedCheckoutVerificationCodeWindow(firstWaitSeconds, {
          label: 'PayPal 首次验证码',
          ...pollOptions,
        });
        if (initialCode) {
          return {
            code: initialCode,
            resendAttemptsUsed: usedResendAttempts,
          };
        }
      }

      while (usedResendAttempts < maxResendAttempts) {
        usedResendAttempts += 1;
        await clickHostedCheckoutVerificationResend(tabId, usedResendAttempts, maxResendAttempts, '等待窗口内未获取到有效验证码');
        if (runtimeConfig?.hostedCheckoutUsesPhoneSms && runtimeConfig?.hostedCheckoutPhoneSmsActivation) {
          await phoneVerificationHelpers?.requestAdditionalPhoneSms?.(
            await getLatestHostedState({}),
            runtimeConfig.hostedCheckoutPhoneSmsActivation
          ).catch(() => {});
        }
        const resentCode = await waitForHostedCheckoutVerificationCodeWindow(subsequentWaitSeconds, {
          label: 'PayPal 重发验证码',
          ...pollOptions,
        });
        if (resentCode) {
          return {
            code: resentCode,
            resendAttemptsUsed: usedResendAttempts,
          };
        }
      }

      throw buildHostedVerificationResendLimitError();
    }

    async function resendHostedCheckoutVerificationCodeAndRefill(
      tabId,
      guestProfile = {},
      attempt = 1,
      maxAttempts = 1,
      waitSeconds = HOSTED_CHECKOUT_SUBSEQUENT_RESEND_WAIT_DEFAULT_SECONDS,
      excludedCodes = []
    ) {
      const runtimeConfig = await getHostedCheckoutRuntimeConfig({}, {
        ensureCurrentSmsEntry: true,
      });
      await clickHostedCheckoutVerificationResend(tabId, attempt, maxAttempts, 'PayPal 提示验证码错误', {
        preClickDelayMs: HOSTED_CHECKOUT_VERIFICATION_INVALID_RESEND_DELAY_MS,
      });
      if (runtimeConfig?.hostedCheckoutUsesPhoneSms && runtimeConfig?.hostedCheckoutPhoneSmsActivation) {
        await phoneVerificationHelpers?.requestAdditionalPhoneSms?.(
          await getLatestHostedState({}),
          runtimeConfig.hostedCheckoutPhoneSmsActivation
        ).catch(() => {});
      }
      const verificationCode = await waitForHostedCheckoutVerificationCodeWindow(waitSeconds, {
        label: 'PayPal 验证码错误后重发验证码',
        pollAttempts: runtimeConfig?.verificationPollAttempts,
        pollIntervalSeconds: runtimeConfig?.verificationPollIntervalSeconds,
        excludedCodes,
        allowImmediateResendOnNonCode: false,
      });
      if (!verificationCode) {
        throw buildHostedVerificationResendLimitError();
      }
      await runHostedPayPalStep(tabId, {
        ...guestProfile,
        verificationCode,
      });
      return {
        verificationCode,
      };
    }

    async function runHostedOpenAiCheckout(tabId, profile, config) {
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        logMessage: '步骤 6：正在等待 OpenAI hosted checkout 脚本就绪...',
      });
      let currentProfile = profile && typeof profile === 'object' ? profile : {};
      const hostedCheckoutEmail = String(currentProfile.email || '').trim();
      let hostedOpenAiAddressRetries = 0;
      let hostedOpenAiCardDeclinedRetries = 0;
      const firstResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
        source: 'background',
        payload: buildHostedOpenAiPayload(currentProfile, {
          email: hostedCheckoutEmail,
        }),
      });
      if (firstResult?.error) {
        throw new Error(firstResult.error);
      }

      const deadline = Date.now() + HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS;
      let verificationSubmitted = false;
      while (Date.now() < deadline) {
        throwIfStopped();
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        if (!tab) {
          throw new Error('步骤 6：无卡直绑 checkout 标签页已关闭。');
        }
        const currentUrl = String(tab.url || '').trim();
        if (isPayPalUrl(currentUrl) || isHostedCheckoutSuccessUrl(currentUrl)) {
          return currentUrl;
        }
        await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
          inject: PLUS_CHECKOUT_INJECT_FILES,
          injectSource: PLUS_CHECKOUT_SOURCE,
        });
        const pageState = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
          type: 'PLUS_CHECKOUT_GET_STATE',
          source: 'background',
          payload: {},
        });
        if (pageState?.error) {
          throw new Error(pageState.error);
        }
        if (pageState?.hostedCardFallback) {
          throw new Error(
            `${HOSTED_CHECKOUT_CARD_FALLBACK_ERROR_PREFIX}Step 6: hosted checkout entered the card branch instead of PayPal. ${String(pageState?.hostedCardFallbackReason || '').trim() || 'Only card payment is visible.'}`
          );
        }
        if (isHostedCheckoutOpenAiCardDeclinedState(pageState)) {
          if (hostedOpenAiCardDeclinedRetries >= HOSTED_CHECKOUT_OPENAI_ADDRESS_RETRY_MAX_ATTEMPTS) {
            throw new Error(
              `${HOSTED_CHECKOUT_CARD_DECLINED_ERROR_PREFIX}Step 6: hosted checkout reported card declined ${HOSTED_CHECKOUT_OPENAI_ADDRESS_RETRY_MAX_ATTEMPTS} times: ${pageState.hostedCardDeclinedErrorMessage || 'Try another card.'}`
            );
          }
          hostedOpenAiCardDeclinedRetries += 1;
          verificationSubmitted = false;
          const retryAddress = await fetchHostedCheckoutAddress(getHostedProfileCountryCode(currentProfile));
          currentProfile = mergeHostedProfileAddress(currentProfile, retryAddress);
          await addLog(
            `Step 6: hosted checkout reported card declined; retrying with a fresh address (${hostedOpenAiCardDeclinedRetries}/${HOSTED_CHECKOUT_OPENAI_ADDRESS_RETRY_MAX_ATTEMPTS}). Error: ${pageState.hostedCardDeclinedErrorMessage || 'Try another card.'}`,
            'warn'
          );
          await persistHostedGuestProfile(currentProfile);
          const retryResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
            source: 'background',
            payload: buildHostedOpenAiPayload(currentProfile, {
              email: hostedCheckoutEmail,
            }),
          });
          if (retryResult?.error) {
            throw new Error(retryResult.error);
          }
          await sleepWithStop(1000);
          continue;
        }
        if (isHostedCheckoutOpenAiAddressErrorState(pageState)) {
          if (hostedOpenAiAddressRetries >= HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS) {
            throw new Error(`Step 6: hosted checkout address validation failed ${HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS} times: ${pageState.hostedAddressErrorMessage || 'Address cannot be used to calculate tax.'}`);
          }
          hostedOpenAiAddressRetries += 1;
          verificationSubmitted = false;
          const retryAddress = await fetchHostedCheckoutAddress(getHostedProfileCountryCode(currentProfile));
          currentProfile = mergeHostedProfileAddress(currentProfile, retryAddress);
          await addLog(
            `Step 6: hosted checkout address validation failed; retrying with a fresh address (${hostedOpenAiAddressRetries}/${HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS}). Error: ${pageState.hostedAddressErrorMessage || 'Address cannot be used to calculate tax.'}`,
            'warn'
          );
          await persistHostedGuestProfile(currentProfile);
          const retryResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
            source: 'background',
            payload: buildHostedOpenAiPayload(currentProfile, {
              email: hostedCheckoutEmail,
            }),
          });
          if (retryResult?.error) {
            throw new Error(retryResult.error);
          }
          await sleepWithStop(1000);
          continue;
        }
        if (isHostedCheckoutOpenAiAddressEmptyState(pageState)) {
          if (hostedOpenAiAddressRetries >= HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS) {
            throw new Error(`Step 6: hosted checkout billing address stayed empty after ${HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS} fresh address refills.`);
          }
          hostedOpenAiAddressRetries += 1;
          verificationSubmitted = false;
          const retryAddress = await fetchHostedCheckoutAddress(getHostedProfileCountryCode(currentProfile));
          currentProfile = mergeHostedProfileAddress(currentProfile, retryAddress);
          await addLog(
            `Step 6: hosted checkout billing address is empty after submit; retrying with a fresh address (${hostedOpenAiAddressRetries}/${HOSTED_CHECKOUT_OPENAI_TAX_ADDRESS_RETRY_MAX_ATTEMPTS}).`,
            'warn'
          );
          await persistHostedGuestProfile(currentProfile);
          const retryResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
            source: 'background',
            payload: buildHostedOpenAiPayload(currentProfile, {
              email: hostedCheckoutEmail,
            }),
          });
          if (retryResult?.error) {
            throw new Error(retryResult.error);
          }
          await sleepWithStop(1000);
          continue;
        }
        if (pageState?.hostedVerificationVisible && !verificationSubmitted) {
          const verificationCode = config?.hostedCheckoutUsesPhoneSms
            ? await fetchHostedCheckoutVerificationCode(config)
            : await pollHostedVerificationCode(config.verificationUrl);
          const verifyResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
            source: 'background',
            payload: { verificationCode },
          });
          if (verifyResult?.error) {
            throw new Error(verifyResult.error);
          }
          verificationSubmitted = true;
        }
        await sleepWithStop(500);
      }
      throw new Error('步骤 6：OpenAI hosted checkout 长时间未跳转到 PayPal 或支付成功页。');
    }

    async function getHostedPayPalState(tabId, options = {}) {
      const securityChallengeEnabled = await resolveHostedSecurityChallengeEnabled(options);
      await waitForTabCompleteUntilStopped(tabId);
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        logMessage: '步骤 6：正在等待 PayPal 无卡直绑页面脚本就绪...',
      });
      let result = await sendHostedPayPalContentMessage(tabId, PAYPAL_HOSTED_GET_STATE_MESSAGE, 'PAYPAL_HOSTED_GET_STATE', {
        securityChallengeEnabled,
      });
      if (shouldReinjectHostedPayPalContentScript(result, options)) {
        await forceReinjectHostedPayPalContentScript(tabId, options);
        result = await sendHostedPayPalContentMessage(tabId, PAYPAL_HOSTED_GET_STATE_MESSAGE, 'PAYPAL_HOSTED_GET_STATE', {
          securityChallengeEnabled,
        });
      }
      if (result?.error) {
        throw new Error(result.error);
      }
      const pageState = result || {};
      if (isHostedCheckoutGenericErrorState(pageState)) {
        const resolution = await requestHostedCheckoutGenericErrorChoice(tabId, pageState, options?.completionPayload || {});
        if (resolution?.resolvedByPlusActivation) {
          return {
            ...pageState,
            hostedStage: PAYPAL_HOSTED_STAGE_OUTSIDE,
            plusActivationResolved: true,
            resolvedByPlusActivation: true,
            plusDetectedPlanType: resolution.planType || '',
            plusCheckoutTabId: resolution.tabId,
          };
        }
        if (resolution?.phonePlusFallbackToFreeAuth) {
          return {
            ...pageState,
            ...resolution,
            hostedStage: PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
          };
        }
      }
      if (securityChallengeEnabled && pageState?.hostedSecurityChallengeVisible) {
        await logHostedSecurityChallengeProbeResult(options.stepKey || '', pageState);
      }
      return normalizeHostedSecurityChallengeState(pageState, {
        ...options,
        securityChallengeEnabled,
      });
    }

    async function runHostedPayPalStep(tabId, payload = {}, options = {}) {
      const securityChallengeEnabled = await resolveHostedSecurityChallengeEnabled(options);
      await waitForTabCompleteUntilStopped(tabId);
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        logMessage: '步骤 6：正在等待 PayPal 无卡直绑页面脚本就绪...',
      });
      const result = await sendHostedPayPalContentMessage(tabId, PAYPAL_RUN_HOSTED_CHECKOUT_STEP_MESSAGE, 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP', {
        ...payload,
        securityChallengeEnabled,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      const stepResult = result || {};
      if (isHostedCheckoutGenericErrorState(stepResult)) {
        const resolution = await requestHostedCheckoutGenericErrorChoice(tabId, stepResult, options?.completionPayload || {});
        if (resolution?.resolvedByPlusActivation) {
          return {
            ...stepResult,
            hostedStage: PAYPAL_HOSTED_STAGE_OUTSIDE,
            plusActivationResolved: true,
            resolvedByPlusActivation: true,
            plusDetectedPlanType: resolution.planType || '',
            plusCheckoutTabId: resolution.tabId,
          };
        }
        if (resolution?.phonePlusFallbackToFreeAuth) {
          return {
            ...stepResult,
            ...resolution,
            hostedStage: PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
          };
        }
      }
      if (securityChallengeEnabled && stepResult?.hostedSecurityChallengeVisible) {
        await logHostedSecurityChallengeProbeResult(options.stepKey || stepResult.stepKey || '', stepResult);
      }
      return normalizeHostedSecurityChallengeState(stepResult, {
        ...options,
        securityChallengeEnabled,
        expectedStage: payload.expectedStage || options.expectedStage || '',
      });
    }

    async function dismissHostedGuestPhoneErrorDialog(tabId, pageState = {}, stepKey = PAYPAL_HOSTED_STEP_CARD) {
      if (!pageState?.hostedGuestPhoneError) {
        return null;
      }
      try {
        const result = await sendHostedPayPalContentMessage(
          tabId,
          PAYPAL_HOSTED_DISMISS_PHONE_ERROR_MESSAGE,
          'PAYPAL_HOSTED_DISMISS_PHONE_ERROR',
          {
            dismissPhoneErrorDelayMs: PAYPAL_HOSTED_PHONE_ERROR_DISMISS_DELAY_MS,
          }
        );
        if (result?.error) {
          throw new Error(result.error);
        }
        if (result?.phoneErrorDismissed) {
          await addHostedStepLog(
            stepKey,
            `步骤 ${getHostedStepNumber(stepKey)}：检测到 PayPal 号码不可用提示，已等待 3 秒并点击 OK，准备切换号码。`,
            'warn'
          );
        } else {
          await addHostedStepLog(
            stepKey,
            `步骤 ${getHostedStepNumber(stepKey)}：检测到 PayPal 号码不可用提示，但未找到可点击的 OK 按钮，将继续切换号码。`,
            'warn'
          );
        }
        return result || null;
      } catch (error) {
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：关闭 PayPal 号码错误弹窗失败，将继续切换号码。${error?.message || String(error || '未知错误')}`,
          'warn'
        );
        return null;
      }
    }

    function buildHostedVerificationResendLimitError() {
      return new Error(
        `${HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX}PayPal 验证码自动 Resend 重试已达到上限，请尝试在页面手动获取验证码并填入。`
      );
    }

    function shouldAutoDisableHostedCheckoutSmsEntry(error) {
      const message = String(typeof error === 'string' ? error : error?.message || '');
      return message.includes(HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX)
        || /hosted checkout 验证码接口暂未返回有效验证码|浏览器标签页兜底取码|未解析到验证码|验证码自动 Resend 重试已达到上限/i.test(message);
    }

    function buildHostedCheckoutSmsPoolDisableReason(error) {
      const message = String(typeof error === 'string' ? error : error?.message || '')
        .replace(HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX, '')
        .trim();
      if (/验证码自动 Resend 重试已达到上限/i.test(message)) {
        return `PayPal 验证码多次失败：${message}`;
      }
      if (/hosted checkout 验证码接口暂未返回有效验证码|未解析到验证码/i.test(message)) {
        return `验证码接口连续异常：${message}`;
      }
      return message || 'PayPal 接码异常';
    }

    async function maybeAutoDisableHostedCheckoutCurrentSmsEntry(error) {
      const latestConfig = await getHostedCheckoutRuntimeConfig({}, {
        ensureCurrentSmsEntry: false,
      });
      if (!latestConfig?.hostedCheckoutSmsPoolAutoDisableEnabled) {
        return null;
      }
      if (!shouldAutoDisableHostedCheckoutSmsEntry(error)) {
        return null;
      }
      const currentEntry = latestConfig?.hostedCheckoutCurrentSmsEntry || null;
      if (!latestConfig?.hostedCheckoutUsesSmsPool || !currentEntry?.key) {
        return null;
      }
      const state = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      const usage = normalizeHostedCheckoutSmsPoolUsage(state?.hostedCheckoutSmsPoolUsage || {});
      const currentUsage = usage[currentEntry.key] || {};
      const nextFailureCount = Math.max(0, Math.floor(Number(currentUsage.failureCount) || 0)) + 1;
      const reason = buildHostedCheckoutSmsPoolDisableReason(error);
      if (nextFailureCount < HOSTED_CHECKOUT_SMS_POOL_DISABLE_THRESHOLD) {
        await updateHostedCheckoutPoolUsage(currentEntry, {
          success: false,
          error: reason,
          failureCount: nextFailureCount,
          incrementFailureCount: false,
        });
        await addLog(
          `步骤 6：PayPal 接码池号码 ${currentEntry.phone} 已累计失败 ${nextFailureCount}/${HOSTED_CHECKOUT_SMS_POOL_DISABLE_THRESHOLD} 次，暂不禁用。原因：${reason}`,
          'warn'
        );
        return {
          disabled: false,
          failureCount: nextFailureCount,
          threshold: HOSTED_CHECKOUT_SMS_POOL_DISABLE_THRESHOLD,
          entry: currentEntry,
        };
      }
      const result = await disableHostedCheckoutSmsPoolEntry(currentEntry, reason, {
        failureCount: nextFailureCount,
      });
      await addLog(`步骤 6：PayPal 接码池号码 ${currentEntry.phone} 已自动禁用。原因：${reason}`, 'warn');
      if (result?.nextEntry?.phone) {
        await addLog(`步骤 6：PayPal 接码池已切换到下一个启用号码 ${result.nextEntry.phone}。`, 'info');
      } else {
        await addLog('步骤 6：PayPal 接码池已无可用启用号码，请手动启用或导入新号码。', 'warn');
      }
      return {
        disabled: true,
        entry: currentEntry,
        nextEntry: result?.nextEntry || null,
      };
    }

    async function handleHostedGuestPhoneErrorWithSmsPool(tabId, pageState = {}, profile = {}, stepKey = PAYPAL_HOSTED_STEP_CARD) {
      const phoneErrorMessage = String(
        pageState?.hostedGuestPhoneErrorMessage
        || 'PayPal 提示当前号码不可用，请更换号码。'
      ).trim();
      await dismissHostedGuestPhoneErrorDialog(tabId, pageState, stepKey);
      const runtimeConfig = await getHostedCheckoutRuntimeConfig({}, {
        ensureCurrentSmsEntry: false,
      });
      if (runtimeConfig?.hostedCheckoutUsesPhoneSms && runtimeConfig?.hostedCheckoutPhoneSmsActivation) {
        const latestState = await getLatestHostedState({});
        await banHostedCheckoutPhoneSmsActivation(
          latestState,
          runtimeConfig.hostedCheckoutPhoneSmsActivation,
          `PayPal 提示号码不可用：${phoneErrorMessage}`
        );
        const nextResult = runtimeConfig?.hostedCheckoutUsesHeroSmsPayPalBr
          ? await requestHostedCheckoutHeroSmsPayPalActivation(latestState, { stepKey })
          : await requestHostedCheckoutPhoneSmsActivation(latestState, { stepKey });
        const nextActivation = normalizeHostedCheckoutPhoneSmsActivation(nextResult?.activation);
        if (!nextActivation?.phoneNumber) {
          throw new Error(`步骤 ${getHostedStepNumber(stepKey)}：PayPal 提示当前号码不可用，且跟随手机接码配置未获取到新号码：${phoneErrorMessage}`);
        }
        const nextProfile = {
          ...profile,
          phone: runtimeConfig?.hostedCheckoutUsesHeroSmsPayPalBr
            ? normalizeBrazilHostedPhoneForPayload(nextActivation.phoneNumber)
            : normalizeHostedPhoneForPayload(nextActivation.phoneNumber),
        };
        await persistHostedGuestProfile(nextProfile);
        await addHostedStepLog(
          stepKey,
          `步骤 ${getHostedStepNumber(stepKey)}：PayPal 已切换到新的手机接码号码 ${maskHostedPhoneForLog(nextProfile.phone)}，准备重新填写资料页。`,
          'info'
        );
        await runHostedPayPalStep(tabId, {
          ...nextProfile,
          expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
          phone: nextProfile.phone,
        });
        return {
          handled: true,
          profile: nextProfile,
          phoneSmsActivation: nextActivation,
        };
      }
      if (
        !runtimeConfig?.hostedCheckoutUsesSmsPool
        || !runtimeConfig?.hostedCheckoutCurrentSmsEntry?.key
        || !runtimeConfig?.hostedCheckoutSmsPoolAutoDisableEnabled
      ) {
        return {
          handled: false,
          message: phoneErrorMessage,
        };
      }

      const disableReason = `PayPal 提示号码不可用：${phoneErrorMessage}`;
      const disableResult = await disableHostedCheckoutSmsPoolEntry(
        runtimeConfig.hostedCheckoutCurrentSmsEntry,
        disableReason,
        { failureCount: HOSTED_CHECKOUT_SMS_POOL_DISABLE_THRESHOLD }
      );
      await addHostedStepLog(
        stepKey,
        `步骤 ${getHostedStepNumber(stepKey)}：PayPal 接码池号码 ${runtimeConfig.hostedCheckoutCurrentSmsEntry.phone} 已立即自动禁用。原因：${disableReason}`,
        'warn'
      );
      if (!disableResult?.nextEntry?.phone) {
        throw new Error(`步骤 ${getHostedStepNumber(stepKey)}：PayPal 提示当前号码不可用，且接码池已无其他启用号码：${phoneErrorMessage}`);
      }

      const nextProfile = {
        ...profile,
        phone: String(disableResult.nextEntry.phone || '').trim(),
      };
      await persistHostedGuestProfile(nextProfile);
      await addHostedStepLog(
        stepKey,
        `步骤 ${getHostedStepNumber(stepKey)}：PayPal 接码池已切换到下一个启用号码 ${disableResult.nextEntry.phone}，准备重新填写资料页。`,
        'info'
      );
      await runHostedPayPalStep(tabId, {
        ...nextProfile,
        expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
        phone: nextProfile.phone,
      });
      return {
        handled: true,
        profile: nextProfile,
        nextEntry: disableResult.nextEntry,
      };
    }

    function isHostedCheckoutGenericErrorState(pageState = {}) {
      return pageState?.hostedStage === PAYPAL_HOSTED_STAGE_GENERIC_ERROR
        || pageState?.hostedGenericError === true;
    }

    function isHostedCheckoutOpenAiAddressErrorState(state = {}) {
      const message = String(state?.hostedAddressErrorMessage || state?.error || '').trim();
      return Boolean(state?.hostedAddressError)
        || /customer'?s\s+location\s+isn'?t\s+recognized|set\s+a\s+valid\s+customer\s+address|automatically\s+calculate\s+tax|valid\s+customer\s+address|address\s+(?:is\s+)?(?:invalid|not\s+recognized)|invalid\s+address|\u65e0\u6cd5\u8bc6\u522b.*\u5730\u5740|\u5730\u5740.*\u65e0\u6cd5\u8bc6\u522b|\u6709\u6548.*\u5730\u5740|\u5730\u5740.*\u65e0\u6548/i.test(message);
    }

    function isHostedCheckoutOpenAiAddressEmptyState(state = {}) {
      if (!state?.hostedOpenAiPage) {
        return false;
      }
      const values = state?.hostedAddressFieldValues;
      if (!values || typeof values !== 'object' || Array.isArray(values)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(values, 'address1')) {
        return false;
      }
      return !normalizeString(values.address1);
    }

    function isHostedCheckoutPayPalCreateAccountAddressErrorState(state = {}) {
      const message = String(
        state?.hostedCreateAccountAddressErrorMessage
        || state?.error
        || ''
      ).trim();
      return Boolean(state?.hostedCreateAccountAddressError)
        || /pageLevelError\.invalidAddress|invalidAddress|check\s+the\s+address\s+you\s+entered\s+and\s+try\s+again\.?|invalid\s+address|address\s+(?:is\s+)?(?:invalid|not\s+recognized|unrecognized)|(?:检查|核对).*地址|地址.*(?:无效|错误|无法识别|不被识别)/i.test(message);
    }

    async function retryHostedPayPalAddressError(tabId, stateInfo = {}, context = {}) {
      if (!isHostedCheckoutPayPalCreateAccountAddressErrorState(stateInfo)) {
        return {
          handled: false,
          retries: Math.max(0, Math.floor(Number(context?.retries) || 0)),
          profile: context?.profile || {},
          state: context?.state || {},
        };
      }

      const stepKey = String(context?.stepKey || PAYPAL_HOSTED_STEP_CREATE_ACCOUNT).trim() || PAYPAL_HOSTED_STEP_CREATE_ACCOUNT;
      const stepNumber = getHostedStepNumber(stepKey);
      const retries = Math.max(0, Math.floor(Number(context?.retries) || 0));
      const errorMessage = String(
        stateInfo?.hostedCreateAccountAddressErrorMessage
        || stateInfo?.error
        || 'Check the address you entered and try again.'
      ).trim();
      const currentStage = String(
        stateInfo?.hostedStage
        || context?.expectedStage
        || PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT
      ).trim() || PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
      const retryStage = currentStage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
        ? PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
        : PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
      const previousProfile = context?.profile && typeof context.profile === 'object' && !Array.isArray(context.profile)
        ? context.profile
        : {};
      const previousState = context?.state && typeof context.state === 'object' && !Array.isArray(context.state)
        ? context.state
        : {};

      if (retries >= HOSTED_CHECKOUT_PAYPAL_ADDRESS_RETRY_MAX_ATTEMPTS) {
        if (context?.addressSuggestionFallbackUsed !== true) {
          const fallbackPayload = retryStage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
            ? {
              expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
              addressOnly: true,
              address: previousProfile.address,
              useAddressSuggestionFallback: true,
            }
            : {
              expectedStage: PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT,
              address: previousProfile.address,
              useAddressSuggestionFallback: true,
            };
          await addHostedStepLog(
            stepKey,
            `Step ${stepNumber}: PayPal ${retryStage} still reports an invalid address after ${HOSTED_CHECKOUT_PAYPAL_ADDRESS_RETRY_MAX_ATTEMPTS} fresh address retries; selecting the first PayPal address suggestion before continuing. Error: ${errorMessage}`,
            'warn'
          );
          await runHostedPayPalStep(tabId, fallbackPayload, { stepKey });
          await sleepWithStop(1000);
          return {
            handled: true,
            retries,
            profile: previousProfile,
            state: previousState,
            address: previousProfile.address || null,
            stage: retryStage,
            addressSuggestionFallbackUsed: true,
          };
        }
        throw new Error(`Step ${stepNumber}: PayPal ${retryStage} address validation failed after ${HOSTED_CHECKOUT_PAYPAL_ADDRESS_RETRY_MAX_ATTEMPTS} fresh address retries and PayPal address suggestion fallback: ${errorMessage}`);
      }

      const nextRetries = retries + 1;
      const retryAddress = await fetchHostedCheckoutAddress(getHostedProfileCountryCode(previousProfile));
      const nextProfile = {
        ...previousProfile,
        address: retryAddress,
      };
      const persistedProfile = await persistHostedGuestProfile(nextProfile);
      const profile = persistedProfile && typeof persistedProfile === 'object' && !Array.isArray(persistedProfile)
        ? persistedProfile
        : nextProfile;
      const nextState = {
        ...previousState,
        plusHostedCheckoutGuestProfile: profile,
        hostedCheckoutGuestProfile: profile,
        plusHostedCheckoutPhoneDigits: profile.phone || previousState.plusHostedCheckoutPhoneDigits || '',
      };
      await addHostedStepLog(
        stepKey,
        `Step ${stepNumber}: PayPal ${retryStage} reported an invalid address; retrying with a fresh address (${nextRetries}/${HOSTED_CHECKOUT_PAYPAL_ADDRESS_RETRY_MAX_ATTEMPTS}). Error: ${errorMessage}`,
        'warn'
      );
      const retryPayload = retryStage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
        ? {
          expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
          addressOnly: true,
          address: retryAddress,
        }
        : {
          expectedStage: PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT,
          address: retryAddress,
        };
      await runHostedPayPalStep(tabId, retryPayload, { stepKey });
      await sleepWithStop(1000);
      return {
        handled: true,
        retries: nextRetries,
        profile,
        state: nextState,
        address: retryAddress,
        stage: retryStage,
        addressSuggestionFallbackUsed: Boolean(context?.addressSuggestionFallbackUsed),
      };
    }

    function isHostedCheckoutOpenAiCardDeclinedState(state = {}) {
      const message = String(state?.hostedCardDeclinedErrorMessage || state?.error || '').trim();
      return Boolean(state?.hostedCardDeclinedError)
        || /(?:bank\s*)?card\s+(?:was\s+)?declined|try\s+another\s+card|payment\s+method\s+was\s+declined|payment\s+declined|card\s+decline|\u94f6\u884c\u5361.*\u62d2\u7edd|\u5361.*\u88ab\u62d2\u7edd|\u8bf7\u5c1d\u8bd5.*(?:\u53e6\u4e00\u5f20|\u5176\u4ed6).*(?:\u5361|\u94f6\u884c\u5361)/i.test(message);
    }

    function isHostedCheckoutGenericError(error) {
      return new RegExp(HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        .test(String(error?.message || error || ''));
    }

    function getHostedStepKeyForStage(stage = '') {
      switch (String(stage || '').trim()) {
        case PAYPAL_HOSTED_STAGE_LOGIN:
          return PAYPAL_HOSTED_STEP_EMAIL;
        case PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT:
        case PAYPAL_HOSTED_STAGE_VERIFICATION:
          return PAYPAL_HOSTED_STEP_CARD;
        case PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT:
          return PAYPAL_HOSTED_STEP_CREATE_ACCOUNT;
        case PAYPAL_HOSTED_STAGE_REVIEW:
        case PAYPAL_HOSTED_STAGE_APPROVAL:
          return PAYPAL_HOSTED_STEP_REVIEW;
        case PAYPAL_HOSTED_STAGE_GENERIC_ERROR:
          return '';
        default:
          return '';
      }
    }

    function isHostedCheckoutBlockedState(pageState = {}) {
      return (pageState?.hostedStage === PAYPAL_HOSTED_STAGE_BLOCKED || pageState?.hostedBlocked === true)
        && !pageState?.hostedSecurityChallengeVisible;
    }

    async function resolveHostedSecurityChallengeEnabled(options = {}) {
      if (Object.prototype.hasOwnProperty.call(options || {}, 'securityChallengeEnabled')) {
        return Boolean(options.securityChallengeEnabled);
      }
      if (options?.state && typeof options.state === 'object') {
        return Boolean(options.state.hostedCheckoutSecurityChallengeEnabled);
      }
      if (typeof getState === 'function') {
        const latestState = await getState().catch(() => ({}));
        return Boolean(latestState?.hostedCheckoutSecurityChallengeEnabled);
      }
      return false;
    }

    async function logHostedSecurityChallengeProbeResult(stepKey, pageState = {}) {
      if (!pageState?.hostedSecurityChallengeVisible) {
        return;
      }
      const stepNumber = getHostedStepNumber(stepKey);
      const selector = String(pageState.hostedSecurityChallengeSelector || 'unknown').trim();
      const resultText = pageState.hostedSecurityChallengeRemoved
        ? '已删除'
        : (pageState.hostedSecurityChallengeRemovable ? '已尝试删除' : '删除失败或无可删除容器');
      const errorText = String(pageState.hostedSecurityChallengeError || '').trim();
      await addHostedStepLog(
        stepKey,
        `步骤 ${stepNumber}：检测到 PayPal 安全挑战（${selector}），${resultText}，流程继续${errorText ? `。异常：${errorText}` : ''}。`,
        'warn'
      );
    }

    function getHostedStageForStepKey(stepKey = '') {
      switch (String(stepKey || '').trim()) {
        case PAYPAL_HOSTED_STEP_EMAIL:
          return PAYPAL_HOSTED_STAGE_LOGIN;
        case PAYPAL_HOSTED_STEP_CARD:
          return PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT;
        case PAYPAL_HOSTED_STEP_CREATE_ACCOUNT:
          return PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
        case PAYPAL_HOSTED_STEP_REVIEW:
          return PAYPAL_HOSTED_STAGE_REVIEW;
        default:
          return '';
      }
    }

    function normalizeHostedSecurityChallengeState(pageState = {}, options = {}) {
      if (options?.securityChallengeEnabled !== true) {
        return pageState || {};
      }
      if (!pageState?.hostedSecurityChallengeVisible) {
        return pageState || {};
      }
      const normalizedStage = pageState.hostedStage === PAYPAL_HOSTED_STAGE_BLOCKED
        ? String(options.expectedStage || getHostedStageForStepKey(options.stepKey) || PAYPAL_HOSTED_STAGE_UNKNOWN).trim()
        : pageState.hostedStage;
      return {
        ...pageState,
        hostedStage: normalizedStage,
        hostedBlocked: false,
        hostedBlockedMessage: '',
      };
    }

    function buildHostedCheckoutBlockedError(pageState = {}) {
      const blockedMessage = String(
        pageState?.hostedBlockedMessage
        || 'PayPal security challenge failed to load or the checkout page was blocked.'
      ).trim();
      return new Error(`${HOSTED_CHECKOUT_PAYPAL_BLOCKED_ERROR_PREFIX}${blockedMessage}`);
    }

    function isHostedCheckoutPlusActivationResolved(pageState = {}) {
      return pageState?.plusActivationResolved === true
        || pageState?.resolvedByPlusActivation === true;
    }

    function isHostedCheckoutPhonePlusFallbackResolved(pageState = {}) {
      return pageState?.phonePlusFallbackToFreeAuth === true
        || pageState?.fallbackToFreeAuth === true
        || pageState?.fallbackResult?.handled === true;
    }

    function isHostedPayPalEmailTargetMissingError(error) {
      return /未找到邮箱输入框(?:或只读邮箱字段)?|did not find.*email|email input/i
        .test(String(error?.message || error || ''));
    }

    function isHostedPayPalReadOnlyEmailActionRetryable(pageState = {}) {
      return pageState?.hostedStage === PAYPAL_HOSTED_STAGE_LOGIN
        && pageState?.readOnlyEmailDetected === true
        && pageState?.hostedEmailNextButtonDetected === true;
    }

    async function requestHostedCheckoutGenericErrorChoice(tabId, pageState = {}, completionPayload = {}) {
      const requestId = `paypal-hosted-generic-error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const pageMessage = String(pageState?.hostedGenericErrorMessage || '').trim()
        || 'Things don\'t appear to be working at the moment.';
      const latestState = typeof getState === 'function'
        ? await getState().catch(() => ({}))
        : {};
      const fallback = await handleHostedCheckoutGenericErrorFallback(latestState, {
        ...pageState,
        hostedGenericErrorMessage: pageMessage,
      }, {
        nodeId: completionPayload?.nodeId || completionPayload?.stepKey || pageState?.stepKey || '',
      });
      if (fallback?.phonePlusFallbackToFreeAuth) {
        return fallback;
      }
      try {
        const inspection = await refreshChatGptSessionAndInspectPlusActivation();
        if (inspection?.active) {
          await addLog(
            `步骤 6：PayPal hosted checkout 返回 genericError，但刷新 ChatGPT 会话后检测到 PLUS 已生效（planType=${inspection.planType || 'unknown'}），直接继续下一步。`,
            'ok'
          );
          await completeNodeFromBackground('plus-checkout-create', {
            ...completionPayload,
            plusDetectedPlanType: inspection.planType || '',
            plusCheckoutTabId: inspection.tabId,
          });
          return {
            resolvedByPlusActivation: true,
            planType: inspection.planType || '',
            tabId: inspection.tabId,
          };
        }
        await addLog(
          latestState?.autoRunRetryPaypalCallback
            ? `步骤 6：PayPal hosted checkout 返回 genericError，刷新 ChatGPT 会话后暂未检测到 PLUS 生效${inspection?.planType ? `（planType=${inspection.planType}）` : ''}，将继续按 PAYPAL回调自动重试处理。`
            : `步骤 6：PayPal hosted checkout 返回 genericError，刷新 ChatGPT 会话后暂未检测到 PLUS 生效${inspection?.planType ? `（planType=${inspection.planType}）` : ''}，将停止当前支付链路并等待你选择“检查”或“重试”。`,
          'warn'
        );
      } catch (error) {
        await addLog(
          latestState?.autoRunRetryPaypalCallback
            ? `步骤 6：PayPal hosted checkout 返回 genericError，刷新 ChatGPT 会话检查 PLUS 状态失败，将继续按 PAYPAL回调自动重试处理。原因：${error?.message || String(error || '未知错误')}`
            : `步骤 6：PayPal hosted checkout 返回 genericError，刷新 ChatGPT 会话检查 PLUS 状态失败，将停止当前支付链路并等待你选择“检查”或“重试”。原因：${error?.message || String(error || '未知错误')}`,
          'warn'
        );
      }
      if (latestState?.autoRunRetryPaypalCallback) {
        await addLog('步骤 6：PayPal hosted checkout 返回 genericError，PAYPAL回调自动重试已开启，将换新邮箱重走流程。', 'warn');
        throw new Error(`${HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX}${pageMessage}`);
      }
      const patch = {
        plusManualConfirmationPending: true,
        plusManualConfirmationRequestId: requestId,
        plusManualConfirmationStep: 6,
        plusManualConfirmationMethod: 'paypal-hosted-generic-error',
        plusManualConfirmationTitle: 'PayPal Checkout 异常',
        plusManualConfirmationMessage: `${pageMessage} 请检查 PLUS 是否正常开通，或重新创建 Plus Checkout。`,
      };
      await setState(patch);
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(patch);
      }
      await addLog('步骤 6：PayPal hosted checkout 返回 genericError，已停止当前支付链路并等待你选择“检查”或“重试”。', 'error');
      throw new Error(`${HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX}${pageMessage}`);
    }

    function createHostedVerificationRetryContext() {
      return {
        resendAttempts: 0,
        verificationSubmitted: false,
        attemptedCodes: [],
        lastSubmittedAt: 0,
      };
    }

    async function refillHostedPayPalVerificationCode(tabId, guestProfile = {}, verificationUrl = '') {
      const verificationCode = await pollHostedVerificationCode(verificationUrl);
      const result = await runHostedPayPalStep(tabId, {
        ...guestProfile,
        verificationCode,
      });
      return {
        result,
        verificationCode,
      };
    }

    async function resendHostedPayPalVerificationCodeAndRefill(tabId, guestProfile = {}, verificationUrl = '', context = createHostedVerificationRetryContext(), stepKey = PAYPAL_HOSTED_STEP_CARD) {
      const stepNumber = getHostedStepNumber(stepKey);
      context.resendAttempts += 1;
      await addHostedStepLog(
        stepKey,
        `步骤 ${stepNumber}：PayPal 提示验证码错误，${Math.round(HOSTED_CHECKOUT_VERIFICATION_INVALID_RESEND_DELAY_MS / 1000)} 秒后自动点击 Resend 重新发送验证码（${context.resendAttempts}/${HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS}）。`,
        'warn'
      );
      await sleepWithStop(HOSTED_CHECKOUT_VERIFICATION_INVALID_RESEND_DELAY_MS);
      await runHostedPayPalStep(tabId, {
        resendVerificationCode: true,
      });
      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：已点击 PayPal 验证码 Resend，正在重新获取并填写验证码。`, 'info');
      await refillHostedPayPalVerificationCode(tabId, guestProfile, verificationUrl);
      context.verificationSubmitted = true;
      return context;
    }

    async function handleHostedPayPalVerificationState(tabId, pageState = {}, state = {}, context = createHostedVerificationRetryContext(), stepKey = PAYPAL_HOSTED_STEP_CARD) {
      if (pageState?.hostedStage !== PAYPAL_HOSTED_STAGE_VERIFICATION && !pageState?.verificationInputsVisible) {
        return {
          handled: false,
          context,
        };
      }

      const stepNumber = getHostedStepNumber(stepKey);
      let profile = null;
      let config = null;
      if (context.verificationSubmitted && !pageState?.hostedVerificationInvalidCode) {
        await addHostedStepLog(stepKey, `Step ${stepNumber}: PayPal verification code already submitted; waiting for validation result or next page.`, 'info');
        return {
          handled: true,
          context,
        };
      }
      try {
        ({ profile, config } = await ensureHostedGuestProfile(state));
      } catch (error) {
        const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(state, error, {
          nodeId: stepKey,
          phaseLabel: 'PayPal hosted 验证码页',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return {
            handled: true,
            context,
            phonePlusFallbackToFreeAuth: true,
            fallbackResult: fallback.fallbackResult,
          };
        }
        throw error;
      }
      if (pageState?.hostedVerificationInvalidCode) {
        const maxResendAttempts = normalizeHostedCheckoutVerificationResendMaxAttempts(
          config?.verificationResendMaxAttempts
        );
        const subsequentWaitSeconds = normalizeHostedCheckoutResendWaitSeconds(
          config?.subsequentResendWaitSeconds,
          HOSTED_CHECKOUT_SUBSEQUENT_RESEND_WAIT_DEFAULT_SECONDS
        );
        if (context.resendAttempts >= maxResendAttempts) {
          const error = buildHostedVerificationResendLimitError();
          await addHostedStepLog(stepKey, error.message.replace(HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX, ''), 'error');
          throw error;
        }
        const attemptedCodes = Array.isArray(context.attemptedCodes) ? context.attemptedCodes : [];
        const refillResult = await resendHostedCheckoutVerificationCodeAndRefill(
          tabId,
          profile,
          context.resendAttempts + 1,
          maxResendAttempts,
          subsequentWaitSeconds,
          attemptedCodes
        );
        context.resendAttempts += 1;
        context.verificationSubmitted = true;
        context.lastSubmittedAt = Date.now();
        context.attemptedCodes = refillResult?.verificationCode
          ? [...attemptedCodes, String(refillResult.verificationCode)]
          : attemptedCodes;
        return {
          handled: true,
          context,
        };
      }

      if (context.verificationSubmitted) {
        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：PayPal 验证码已提交，继续等待校验结果或后续页面。`, 'info');
        return {
          handled: true,
          context,
        };
      }

      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：检测到 PayPal hosted checkout 验证码页，正在获取并填写验证码。`, 'info');
      const verificationResult = await acquireHostedCheckoutPayPalVerificationCode(tabId, context.resendAttempts);
      context.resendAttempts = Math.max(
        context.resendAttempts,
        Number(verificationResult?.resendAttemptsUsed) || 0
      );
      await runHostedPayPalStep(tabId, {
        ...profile,
        verificationCode: verificationResult.code,
      });
      context.verificationSubmitted = true;
      context.lastSubmittedAt = Date.now();
      context.attemptedCodes = [...(Array.isArray(context.attemptedCodes) ? context.attemptedCodes : []), String(verificationResult.code)];
      return {
        handled: true,
        context,
      };
    }

    function getHostedStageOrder(stage = '') {
      switch (stage) {
        case PAYPAL_HOSTED_STAGE_LOGIN:
          return 1;
        case PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT:
          return 2;
        case PAYPAL_HOSTED_STAGE_VERIFICATION:
          return 3;
        case PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT:
          return 4;
        case PAYPAL_HOSTED_STAGE_REVIEW:
          return 5;
        case PAYPAL_HOSTED_STAGE_OUTSIDE:
          return 6;
        default:
          return 0;
      }
    }

    function isHostedStageAtOrAfter(stage = '', expectedStage = '') {
      const currentOrder = getHostedStageOrder(stage);
      const expectedOrder = getHostedStageOrder(expectedStage);
      return currentOrder > 0 && expectedOrder > 0 && currentOrder >= expectedOrder;
    }

    async function waitForHostedPayPalStage(tabId, predicate, options = {}) {
      const timeoutMs = Math.max(1000, Number(options.timeoutMs) || HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS);
      const intervalMs = Math.max(100, Number(options.intervalMs) || 500);
      const label = String(options.label || 'PayPal 无卡直绑页面').trim();
      const deadline = Date.now() + timeoutMs;
      let lastStage = '';
      while (Date.now() < deadline) {
        throwIfStopped();
        const currentUrl = await getHostedCurrentUrl(tabId);
        if (isHostedCheckoutSuccessUrl(currentUrl)) {
          return {
            successUrl: currentUrl,
            hostedStage: PAYPAL_HOSTED_STAGE_OUTSIDE,
          };
        }
        if (!isPayPalUrl(currentUrl)) {
          await sleepWithStop(intervalMs);
          continue;
        }
        let pageState = null;
        try {
          pageState = await getHostedPayPalState(tabId, options);
          if (isHostedCheckoutPlusActivationResolved(pageState)) {
            return pageState;
          }
          if (isHostedCheckoutPhonePlusFallbackResolved(pageState)) {
            return pageState;
          }
          lastStage = pageState?.hostedStage || lastStage;
        } catch (error) {
          if (isHostedCheckoutGenericError(error)) {
            throw error;
          }
          lastStage = error?.message || lastStage;
          await sleepWithStop(intervalMs);
          continue;
        }
        if (await predicate(pageState)) {
          return pageState;
        }
        await sleepWithStop(intervalMs);
      }
      throw new Error(`${label}等待超时${lastStage ? `（最后状态：${lastStage}）` : ''}。`);
    }

    async function waitForHostedUrlAfterAction(tabId, matcher, options = {}) {
      const timeoutMs = Math.max(1000, Number(options.timeoutMs) || HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS);
      const intervalMs = Math.max(100, Number(options.intervalMs) || 500);
      const label = String(options.label || 'PayPal 无卡直绑跳转').trim();
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        throwIfStopped();
        const currentTab = await getTabById(tabId);
        const currentUrl = String(currentTab?.url || '').trim();
        if (matcher(currentUrl, currentTab)) {
          await waitForTabCompleteUntilStopped(tabId).catch(() => {});
          return currentUrl;
        }
        await sleepWithStop(intervalMs);
      }
      throw new Error(`${label}等待超时。`);
    }

    async function runHostedPayPalStepAndWaitForStageChange(tabId, payload = {}, previousStage = '', options = {}) {
      const normalizedPreviousStage = String(previousStage || payload.expectedStage || '').trim();
      const label = String(options.label || 'PayPal 无卡直绑页面跳转').trim();
      const predicate = typeof options.predicate === 'function'
        ? options.predicate
        : (stateInfo) => stateInfo?.hostedStage && stateInfo.hostedStage !== normalizedPreviousStage;
      const stageChangePromise = waitForHostedPayPalStage(tabId, predicate, {
        ...options,
        label,
        timeoutMs: options.timeoutMs || HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS,
        intervalMs: options.intervalMs || 500,
      }).then(
        (nextState) => ({ type: 'stage-change', nextState }),
        (error) => ({ type: 'stage-error', error })
      );
      const actionPromise = runHostedPayPalStep(tabId, payload, options).then(
        (result) => ({ type: 'action', result }),
        (error) => ({ type: 'action-error', error })
      );

      const first = await Promise.race([actionPromise, stageChangePromise]);
      if (first.type === 'stage-change') {
        return {
          result: null,
          nextState: first.nextState,
          completedByStageChange: true,
        };
      }
      if (first.type === 'action-error') {
        throw first.error;
      }
      if (first.type === 'stage-error') {
        throw first.error;
      }

      const stageOutcome = await stageChangePromise;
      if (stageOutcome.type === 'stage-change') {
        return {
          result: first.result,
          nextState: stageOutcome.nextState,
          completedByStageChange: false,
        };
      }
      throw stageOutcome.error;
    }

    async function runHostedPayPalEmailStepWithDiagnostics(tabId, payload = {}, previousStage = PAYPAL_HOSTED_STAGE_LOGIN, options = {}) {
      try {
        return await runHostedPayPalStepAndWaitForStageChange(tabId, payload, previousStage, options);
      } catch (error) {
        if (!isHostedPayPalEmailTargetMissingError(error)) {
          throw error;
        }
        const stepKey = options?.stepKey || PAYPAL_HOSTED_STEP_EMAIL;
        const stepNumber = getHostedStepNumber(stepKey);
        const latestState = await getHostedPayPalState(tabId, {
          ...options,
          forceReinjectChecked: true,
        });
        if (isHostedCheckoutPlusActivationResolved(latestState)) {
          return {
            result: null,
            nextState: latestState,
            completedByStageChange: true,
            recoveredAfterEmailTargetMissing: true,
          };
        }
        if (isHostedStageAtOrAfter(latestState.hostedStage, PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT)
          && latestState.hostedStage !== PAYPAL_HOSTED_STAGE_LOGIN) {
          await addHostedStepLog(
            stepKey,
            `步骤 ${stepNumber}：邮箱页动作提示未找到输入框，但二次确认 PayPal 已进入后续页面（${latestState.hostedStage}），继续流程。`,
            'warn'
          );
          return {
            result: null,
            nextState: latestState,
            completedByStageChange: true,
            recoveredAfterEmailTargetMissing: true,
          };
        }
        if (isHostedPayPalReadOnlyEmailActionRetryable(latestState)) {
          await addHostedStepLog(
            stepKey,
            `步骤 ${stepNumber}：邮箱页动作提示未找到输入框，二次确认检测到只读邮箱字段（${latestState.readOnlyEmailLabel || 'email'}），正在重试点击继续。`,
            'warn'
          );
          return runHostedPayPalStepAndWaitForStageChange(tabId, payload, previousStage, {
            ...options,
            forceReinjectChecked: true,
          });
        }
        const diagnostic = [
          latestState?.scriptVersion ? `script=${latestState.scriptVersion}` : '',
          latestState?.hostedStage ? `stage=${latestState.hostedStage}` : '',
          latestState?.readOnlyEmailSummary ? `readOnly=${latestState.readOnlyEmailSummary}` : '',
          latestState?.hostedEmailNextButtonSummary ? `button=${latestState.hostedEmailNextButtonSummary}` : '',
          latestState?.bodyTextPreview ? `body=${latestState.bodyTextPreview}` : '',
        ].filter(Boolean).join(' | ');
        throw new Error(`${error.message}${diagnostic ? ` 二次确认：${diagnostic}` : ''}`);
      }
    }

    function resolveCheckoutTargetUrl(result = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, options = {}) {
      const useHostedCheckoutFinalStep = Boolean(options.useHostedCheckoutFinalStep)
        || paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED;
      if (useHostedCheckoutFinalStep) {
        return String(
          result?.preferredCheckoutUrl
          || result?.hostedCheckoutUrl
          || result?.checkoutUrl
          || ''
        ).trim();
      }
      return String(result?.checkoutUrl || '').trim();
    }

    async function executeHostedCheckoutCreate(tabId, state = {}, result = {}) {
      const targetCheckoutUrl = resolveCheckoutTargetUrl(result, PLUS_PAYMENT_METHOD_PAYPAL_HOSTED, {
        useHostedCheckoutFinalStep: true,
      });
      if (!targetCheckoutUrl) {
        throw new Error('步骤 6：PayPal 无卡直绑未返回可用的订阅链接。');
      }

      await addLog('步骤 6：PayPal 无卡直绑链接已创建，正在打开并提交 OpenAI Checkout 页面...', 'ok');
      await chrome.tabs.update(tabId, { url: targetCheckoutUrl, active: true });
      await waitForTabCompleteUntilStopped(tabId);

      const landedTab = await waitForUrlMatch(
        tabId,
        (url) => isHostedOpenAiCheckoutUrl(url) || isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS,
        500
      );
      const landedUrl = String(landedTab?.url || targetCheckoutUrl || '').trim();
      let completedUrl = landedUrl;

      if (isHostedOpenAiCheckoutUrl(completedUrl)) {
        const initialAmountCheck = await handlePhonePlusAmountGuardAtStep6(tabId, state, {
          nodeId: 'plus-checkout-create',
          phaseLabel: 'Checkout URL 打开后',
          timeoutMs: 8000,
          retryDelayMs: 500,
        });
        if (initialAmountCheck?.phonePlusFallbackToFreeAuth) {
          return;
        }
      let profile = null;
      let config = null;
      try {
        ({ profile, config } = await ensureHostedGuestProfile(state));
      } catch (error) {
        const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(state, error, {
          nodeId: 'plus-checkout-create',
          phaseLabel: '创建 PayPal hosted checkout',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return;
        }
        throw error;
      }
      await logHostedCheckoutRuntimeConfig(PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT, config, {
        extra: `OpenAI Checkout 手机号 ${maskHostedPhoneForLog(profile.phone)}`,
      });
        await addLog(`步骤 6：正在提交 OpenAI Checkout，等待跳转到 PayPal 邮箱页（电话使用本地号码 ${profile.phone}）。`, 'info');
        const hostedCheckoutResult = await runHostedOpenAiCheckoutWithProxySession(
          tabId,
          profile,
          config,
          state,
          PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT
        );
        if (hostedCheckoutResult?.phonePlusFallbackToFreeAuth) {
          return;
        }
        completedUrl = String(hostedCheckoutResult || await getHostedCurrentUrl(tabId) || '').trim();
      }

      if (isPayPalUrl(completedUrl)) {
        await waitForTabCompleteUntilStopped(tabId).catch(() => {});
      }

      const isAlreadySuccessful = isHostedCheckoutSuccessUrl(completedUrl);
      await setState({
        plusCheckoutTabId: tabId,
        plusCheckoutUrl: completedUrl,
        plusCheckoutCountry: result.country || 'US',
        plusCheckoutCurrency: result.currency || 'USD',
        plusCheckoutSource: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
        plusReturnUrl: isAlreadySuccessful ? completedUrl : '',
        plusHostedCheckoutCompleted: isAlreadySuccessful,
      });

      await addLog(`步骤 6：PayPal 无卡直绑已提交 OpenAI Checkout（${result.country || 'US'} ${result.currency || 'USD'}），准备进入 PayPal 邮箱页。`, 'info');

      await completeNodeFromBackground('plus-checkout-create', {
        plusCheckoutCountry: result.country || 'US',
        plusCheckoutCurrency: result.currency || 'USD',
        plusCheckoutSource: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
        plusCheckoutUrl: completedUrl,
        plusReturnUrl: isAlreadySuccessful ? completedUrl : '',
        plusHostedCheckoutCompleted: isAlreadySuccessful,
      });
    }

    async function executePayPalHostedOpenAiCheckout(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_OPENAI_CHECKOUT;
      const stepNumber = getHostedStepNumber(stepKey);
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }

      let currentUrl = await getHostedCurrentUrl(tabId);
      if (isPayPalUrl(currentUrl)) {
        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：当前已在 PayPal 页面，OpenAI Checkout 节点直接完成。`, 'info');
        await completeHostedStep(stepKey, tabId, {
          plusCheckoutSource: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
        });
        return;
      }
      if (!isHostedOpenAiCheckoutUrl(currentUrl)) {
        currentUrl = await waitForHostedUrlAfterAction(
          tabId,
          (url) => isHostedOpenAiCheckoutUrl(url) || isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
          { label: `步骤 ${stepNumber}：等待 OpenAI hosted checkout 页面` }
        );
      }
      if (isHostedCheckoutSuccessUrl(currentUrl)) {
        await completeHostedStep(stepKey, tabId, {
          plusReturnUrl: currentUrl,
          plusHostedCheckoutCompleted: true,
        });
        return;
      }
      if (isPayPalUrl(currentUrl)) {
        await completeHostedStep(stepKey, tabId, {
          plusCheckoutSource: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
        });
        return;
      }

      const initialAmountCheck = await handlePhonePlusAmountGuardAtStep6(tabId, state, {
        nodeId: stepKey,
        phaseLabel: 'Checkout URL 打开后',
        timeoutMs: 8000,
        retryDelayMs: 500,
      });
      if (initialAmountCheck?.phonePlusFallbackToFreeAuth) {
        return;
      }

      let profile = null;
      let config = null;
      try {
        ({ profile, config } = await ensureHostedGuestProfile(state));
      } catch (error) {
        const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(state, error, {
          nodeId: stepKey,
          phaseLabel: '提交 OpenAI hosted checkout',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return;
        }
        throw error;
      }
      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在选择 PayPal 并提交 OpenAI hosted checkout（电话使用本地号码 ${profile.phone}）。`, 'info');
      const transitionUrl = await runHostedOpenAiCheckoutWithProxySession(
        tabId,
        profile,
        config,
        state,
        stepKey
      );
      if (transitionUrl?.phonePlusFallbackToFreeAuth) {
        return;
      }
      const completedUrl = String(transitionUrl || await getHostedCurrentUrl(tabId) || '').trim();
      await completeHostedStep(stepKey, tabId, {
        plusCheckoutSource: PLUS_PAYMENT_METHOD_PAYPAL_HOSTED,
        plusCheckoutUrl: completedUrl,
        plusReturnUrl: isHostedCheckoutSuccessUrl(completedUrl) ? completedUrl : '',
        plusHostedCheckoutCompleted: isHostedCheckoutSuccessUrl(completedUrl),
      });
    }

    async function executePayPalHostedEmail(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_EMAIL;
      const stepNumber = getHostedStepNumber(stepKey);
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }
      let profile = null;
      let config = null;
      try {
        ({ profile, config } = await ensureHostedGuestProfile(state));
      } catch (error) {
        const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(state, error, {
          nodeId: stepKey,
          phaseLabel: 'PayPal hosted 邮箱页',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return;
        }
        throw error;
      }
      await logHostedCheckoutRuntimeConfig(stepKey, config, {
        extra: `PayPal 填写手机号 ${maskHostedPhoneForLog(profile.phone)}`,
      });
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 邮箱页` }
      );
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }

      const pageState = await getHostedPayPalState(tabId, { stepKey });
      if (isHostedCheckoutPlusActivationResolved(pageState)) {
        return;
      }
      if (isHostedStageAtOrAfter(pageState.hostedStage, PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT)
        && pageState.hostedStage !== PAYPAL_HOSTED_STAGE_LOGIN) {
        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：当前 PayPal 已进入后续页面（${pageState.hostedStage}），邮箱节点直接完成。`, 'info');
        await completeHostedStep(stepKey, tabId, {
          plusHostedCheckoutLastStage: pageState.hostedStage,
        });
        return;
      }
      if (pageState.hostedStage !== PAYPAL_HOSTED_STAGE_LOGIN) {
        throw new Error(`步骤 ${stepNumber}：当前不是 PayPal 邮箱页（当前状态：${pageState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}）。`);
      }

      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在填写 PayPal 无卡直绑邮箱。`, 'info');
      const { nextState, completedByStageChange } = await runHostedPayPalEmailStepWithDiagnostics(tabId, {
        expectedStage: PAYPAL_HOSTED_STAGE_LOGIN,
        email: profile.email,
        emailInputStableWaitMs: HOSTED_CHECKOUT_EMAIL_INPUT_STABLE_WAIT_MS,
        emailInputTimeoutMs: HOSTED_CHECKOUT_EMAIL_INPUT_TIMEOUT_MS,
      }, PAYPAL_HOSTED_STAGE_LOGIN, { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 邮箱页跳转` });
      if (completedByStageChange) {
        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：已检测到 PayPal 进入后续页面（${nextState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}），邮箱节点直接完成。`, 'info');
      }
      await completeHostedStep(stepKey, tabId, {
        plusHostedCheckoutLastStage: nextState.hostedStage || '',
      });
    }

    async function executePayPalHostedCard(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_CARD;
      const stepNumber = getHostedStepNumber(stepKey);
      try {
        const tabId = await resolveHostedCheckoutTabId(state, stepKey);
        const verificationContext = createHostedVerificationRetryContext();
        let refreshedProfile = null;
        let refreshedProfileConfig = null;
        try {
          ({
            profile: refreshedProfile,
            config: refreshedProfileConfig,
          } = await ensureHostedGuestProfile(state, { forceRefresh: true }));
        } catch (error) {
          const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(state, error, {
            nodeId: stepKey,
            phaseLabel: 'PayPal hosted 资料页',
          });
          if (fallback?.phonePlusFallbackToFreeAuth) {
            return;
          }
          throw error;
        }
        let refreshedState = {
          ...state,
          plusHostedCheckoutGuestProfile: refreshedProfile,
          hostedCheckoutGuestProfile: refreshedProfile,
          plusHostedCheckoutPhoneDigits: refreshedProfile.phone,
        };
        let profile = refreshedProfile;
        let hostedProfileSubmitted = false;
        let hostedPayPalAddressRetries = 0;
        let hostedPayPalAddressSuggestionFallbackUsed = false;
        if (await completeHostedStepIfSuccessful(stepKey, tabId, refreshedState)) {
          return;
        }
        await waitForHostedUrlAfterAction(
          tabId,
          (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
          { label: `步骤 ${stepNumber}：等待 PayPal 资料页` }
        );
        if (await completeHostedStepIfSuccessful(stepKey, tabId, refreshedState)) {
          return;
        }

        let pageState = await getHostedPayPalState(tabId, {
          stepKey,
          completionPayload: {
            plusHostedCheckoutLastStage: PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
          },
        });
        if (isHostedCheckoutPlusActivationResolved(pageState)) {
          return;
        }
        if (isHostedCheckoutPhonePlusFallbackResolved(pageState)) {
          return;
        }
        const reviewConfig = refreshedProfileConfig || await getHostedCheckoutRuntimeConfig(refreshedState, {
          ensureCurrentSmsEntry: true,
        });
        await logHostedCheckoutRuntimeConfig(stepKey, reviewConfig, {
          extra: reviewConfig.hostedCheckoutUsesSmsPool
            ? `验证码链接已绑定当前池条目 ${maskHostedPhoneForLog(reviewConfig.hostedCheckoutCurrentSmsEntry?.phone)}`
            : `手动手机号 ${maskHostedPhoneForLog(reviewConfig.phone)}`,
        });
        if (isHostedCheckoutBlockedState(pageState)) {
          await logHostedSecurityChallengeProbeResult(stepKey, pageState);
          throw buildHostedCheckoutBlockedError(pageState);
        }
        if (pageState.hostedGuestPhoneError) {
          const phoneErrorResult = await handleHostedGuestPhoneErrorWithSmsPool(tabId, pageState, profile, stepKey);
          if (!phoneErrorResult.handled) {
            throw new Error(`步骤 ${stepNumber}：PayPal 提示当前号码不可用：${phoneErrorResult.message || pageState.hostedGuestPhoneErrorMessage || '未知号码错误'}`);
          }
          profile = phoneErrorResult.profile;
          refreshedState = {
            ...refreshedState,
            plusHostedCheckoutGuestProfile: profile,
            hostedCheckoutGuestProfile: profile,
            plusHostedCheckoutPhoneDigits: profile.phone,
          };
          hostedProfileSubmitted = true;
          pageState = await getHostedPayPalState(tabId, {
            stepKey,
            completionPayload: {
              plusHostedCheckoutLastStage: PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
            },
          });
          if (isHostedCheckoutPlusActivationResolved(pageState)) {
            return;
          }
          if (isHostedCheckoutBlockedState(pageState)) {
            await logHostedSecurityChallengeProbeResult(stepKey, pageState);
            throw buildHostedCheckoutBlockedError(pageState);
          }
        }
        const initialVerificationResult = await handleHostedPayPalVerificationState(tabId, pageState, refreshedState, verificationContext, stepKey);
        if (initialVerificationResult.phonePlusFallbackToFreeAuth) {
          return;
        }
        if (initialVerificationResult.handled) {
          const nextState = await waitForHostedPayPalStage(
            tabId,
            async (stateInfo) => {
              if (isHostedCheckoutPlusActivationResolved(stateInfo)) {
                return true;
              }
              const addressRetryResult = await retryHostedPayPalAddressError(tabId, stateInfo, {
                stepKey,
                retries: hostedPayPalAddressRetries,
                profile,
                state: refreshedState,
                addressSuggestionFallbackUsed: hostedPayPalAddressSuggestionFallbackUsed,
              });
              if (addressRetryResult.handled) {
                hostedPayPalAddressRetries = addressRetryResult.retries;
                hostedPayPalAddressSuggestionFallbackUsed = Boolean(addressRetryResult.addressSuggestionFallbackUsed);
                profile = addressRetryResult.profile;
                refreshedState = addressRetryResult.state;
                hostedProfileSubmitted = true;
                return false;
              }
              const verificationResult = await handleHostedPayPalVerificationState(tabId, stateInfo, refreshedState, verificationContext, stepKey);
              if (verificationResult.phonePlusFallbackToFreeAuth) {
                return true;
              }
              if (verificationResult.handled) {
                return false;
              }
              return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_VERIFICATION;
            },
            { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 验证码页跳转` }
          );
          if (isHostedCheckoutPlusActivationResolved(nextState)) {
            return;
          }
          if (nextState === true) {
            return;
          }
          await completeHostedStep(stepKey, tabId, {
            plusHostedCheckoutLastStage: nextState.hostedStage || '',
          });
          return;
        }
        const initialAddressRetryResult = await retryHostedPayPalAddressError(tabId, pageState, {
          stepKey,
          retries: hostedPayPalAddressRetries,
          profile,
          state: refreshedState,
          addressSuggestionFallbackUsed: hostedPayPalAddressSuggestionFallbackUsed,
        });
        if (initialAddressRetryResult.handled) {
          hostedPayPalAddressRetries = initialAddressRetryResult.retries;
          hostedPayPalAddressSuggestionFallbackUsed = Boolean(initialAddressRetryResult.addressSuggestionFallbackUsed);
          profile = initialAddressRetryResult.profile;
          refreshedState = initialAddressRetryResult.state;
          hostedProfileSubmitted = true;
          pageState = await getHostedPayPalState(tabId, {
            stepKey,
            completionPayload: {
              plusHostedCheckoutLastStage: PAYPAL_HOSTED_STAGE_GENERIC_ERROR,
            },
          });
          if (isHostedCheckoutPlusActivationResolved(pageState)) {
            return;
          }
        }
        if (isHostedStageAtOrAfter(pageState.hostedStage, PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT)
          && pageState.hostedStage !== PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT) {
          await addHostedStepLog(stepKey, `步骤 ${stepNumber}：当前 PayPal 已进入后续页面（${pageState.hostedStage}），资料节点直接完成。`, 'info');
          await completeHostedStep(stepKey, tabId, {
            plusHostedCheckoutLastStage: pageState.hostedStage,
          });
          return;
        }
        if (pageState.hostedStage !== PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT) {
          throw new Error(`步骤 ${stepNumber}：当前不是 PayPal 资料页（当前状态：${pageState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}）。`);
        }

        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在填写 PayPal 无卡直绑资料，提交前会复查电话是否为 ${profile.phone}。`, 'info');
        const cardResult = hostedProfileSubmitted
          ? null
          : await runHostedPayPalStep(tabId, {
            ...profile,
            expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
            phone: profile.phone,
          }, { stepKey });
        if (cardResult?.phoneMatched) {
          await addHostedStepLog(
            stepKey,
            `步骤 ${stepNumber}：PayPal 页面电话复查通过（配置 ${cardResult.payloadPhoneDigits}，页面 ${cardResult.renderedPhoneDigits}）。`,
            'info'
          );
        }
        if (cardResult) {
          assertHostedPayPalGuestCheckoutSubmitted(cardResult, stepNumber);
        }
        let hostedGuestCardErrorRetries = 0;
        let hostedGuestCardErrorRetrySettlingUntil = 0;
        let hostedGuestPhoneEmptyRefillRetries = 0;
        const nextState = await waitForHostedPayPalStage(
          tabId,
          async (stateInfo) => {
            if (isHostedCheckoutPlusActivationResolved(stateInfo)) {
              return true;
            }
            if (isHostedCheckoutBlockedState(stateInfo)) {
              await logHostedSecurityChallengeProbeResult(stepKey, stateInfo);
              throw buildHostedCheckoutBlockedError(stateInfo);
            }
            const addressRetryResult = await retryHostedPayPalAddressError(tabId, stateInfo, {
              stepKey,
              retries: hostedPayPalAddressRetries,
              profile,
              state: refreshedState,
              addressSuggestionFallbackUsed: hostedPayPalAddressSuggestionFallbackUsed,
            });
            if (addressRetryResult.handled) {
              hostedPayPalAddressRetries = addressRetryResult.retries;
              hostedPayPalAddressSuggestionFallbackUsed = Boolean(addressRetryResult.addressSuggestionFallbackUsed);
              profile = addressRetryResult.profile;
              refreshedState = addressRetryResult.state;
              hostedProfileSubmitted = true;
              return false;
            }
            if (stateInfo?.hostedGuestPhoneError) {
              const phoneErrorResult = await handleHostedGuestPhoneErrorWithSmsPool(tabId, stateInfo, profile, stepKey);
              if (!phoneErrorResult.handled) {
                throw new Error(`步骤 ${stepNumber}：PayPal 提示当前号码不可用：${phoneErrorResult.message || stateInfo.hostedGuestPhoneErrorMessage || '未知号码错误'}`);
              }
              profile = phoneErrorResult.profile;
              refreshedState = {
                ...refreshedState,
                plusHostedCheckoutGuestProfile: profile,
                hostedCheckoutGuestProfile: profile,
                plusHostedCheckoutPhoneDigits: profile.phone,
              };
              hostedProfileSubmitted = true;
              return false;
            }
            if (stateInfo?.hostedGuestCardError) {
              if (Date.now() < hostedGuestCardErrorRetrySettlingUntil) {
                return false;
              }
              if (hostedGuestCardErrorRetries >= HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS) {
                const cardErrorMessage = String(stateInfo.hostedGuestCardErrorMessage || 'unknown card error').trim();
                throw new Error(`Step ${stepNumber}: PayPal guest checkout card error exceeded ${HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS} retries. Error: ${cardErrorMessage}`);
              }
              hostedGuestCardErrorRetries += 1;
              let retryProfileResult = null;
              try {
                retryProfileResult = await ensureHostedGuestProfile(refreshedState, { forceRefresh: true });
              } catch (error) {
                const fallback = await handleHostedCheckoutSmsPoolExhaustedFallback(refreshedState, error, {
                  nodeId: stepKey,
                  phaseLabel: 'PayPal hosted 资料页重试',
                });
                if (fallback?.phonePlusFallbackToFreeAuth) {
                  return true;
                }
                throw error;
              }
              profile = retryProfileResult.profile;
              refreshedState = {
                ...refreshedState,
                plusHostedCheckoutGuestProfile: profile,
                hostedCheckoutGuestProfile: profile,
                plusHostedCheckoutPhoneDigits: profile.phone,
              };
              await addHostedStepLog(
                stepKey,
                `Step ${stepNumber}: PayPal guest checkout reported a card error; retrying with a fresh profile (${hostedGuestCardErrorRetries}/${HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS}). Error: ${stateInfo.hostedGuestCardErrorMessage || 'unknown card error'}`,
                'warn'
              );
              try {
                await runHostedPayPalStep(tabId, {
                  ...profile,
                  expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
                  phone: profile.phone,
                }, { stepKey });
              } catch (error) {
                const fallback = await handlePayPalHostedPhoneEmptyAfterFillFallback(refreshedState, error, {
                  nodeId: stepKey,
                  phaseLabel: 'PayPal hosted 资料页重试',
                });
                if (fallback?.phonePlusFallbackToFreeAuth) {
                  return true;
                }
                throw error;
              }
              hostedProfileSubmitted = true;
              hostedGuestCardErrorRetrySettlingUntil = Date.now() + HOSTED_CHECKOUT_GUEST_CARD_ERROR_SETTLE_MS;
              return false;
            }
            if (
              stateInfo?.hostedStage === PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT
              && stateInfo.hostedGuestPhoneValuePresent === false
              && !stateInfo.hostedGuestCardError
              && !stateInfo.hostedGuestPhoneError
            ) {
              if (hostedGuestPhoneEmptyRefillRetries >= HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS) {
                throw buildPayPalHostedPhoneEmptyAfterFillError(HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS);
              }
              hostedGuestPhoneEmptyRefillRetries += 1;
              await addHostedStepLog(
                stepKey,
                `步骤 ${stepNumber}：PayPal 资料页仍停留且 phone 输入框为空，正在重新填写资料 (${hostedGuestPhoneEmptyRefillRetries}/${HOSTED_CHECKOUT_CARD_ERROR_RETRY_MAX_ATTEMPTS})。`,
                'warn'
              );
              try {
                const refillResult = await runHostedPayPalStep(tabId, {
                  ...profile,
                  expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
                  phone: profile.phone,
                }, { stepKey });
                assertHostedPayPalGuestCheckoutSubmitted(refillResult, stepNumber);
                hostedProfileSubmitted = true;
              } catch (error) {
                const fallback = await handlePayPalHostedPhoneEmptyAfterFillFallback(refreshedState, error, {
                  nodeId: stepKey,
                  phaseLabel: 'PayPal hosted 资料页重填',
                });
                if (fallback?.phonePlusFallbackToFreeAuth) {
                  return true;
                }
                throw error;
              }
              return false;
            }
            const verificationResult = await handleHostedPayPalVerificationState(tabId, stateInfo, refreshedState, verificationContext, stepKey);
            if (verificationResult.phonePlusFallbackToFreeAuth) {
              return true;
            }
            if (verificationResult.handled) {
              return false;
            }
            return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT;
          },
          { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 资料页跳转` }
        );
        if (isHostedCheckoutPlusActivationResolved(nextState)) {
          return;
        }
        if (nextState === true) {
          return;
        }
        await completeHostedStep(stepKey, tabId, {
          plusHostedCheckoutLastStage: nextState.hostedStage || '',
        });
      } catch (error) {
        const fallback = await handlePayPalHostedPhoneEmptyAfterFillFallback(state, error, {
          nodeId: stepKey,
          phaseLabel: 'PayPal hosted 资料页',
        });
        if (fallback?.phonePlusFallbackToFreeAuth) {
          return;
        }
        await maybeAutoDisableHostedCheckoutCurrentSmsEntry(error).catch(() => null);
        if (shouldAutoDisableHostedCheckoutSmsEntry(error)) {
          const latestState = await getLatestHostedState(state).catch(() => state);
          await cancelHostedCheckoutPhoneSmsActivation(
            latestState,
            latestState?.[HOSTED_CHECKOUT_PHONE_SMS_ACTIVATION_KEY],
            error?.message || String(error || 'PayPal 验证码失败')
          ).catch(() => {});
        }
        throw error;
      }
    }

    async function executePayPalHostedCreateAccount(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_CREATE_ACCOUNT;
      const stepNumber = getHostedStepNumber(stepKey);
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      const verificationContext = createHostedVerificationRetryContext();
      let createAccountState = await getLatestHostedState(state);
      let profile = getHostedProfileFromState(createAccountState) || {};
      let hostedCreateAccountAddressRetries = 0;
      let hostedCreateAccountAddressSuggestionFallbackUsed = false;
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 创建确认页` }
      );
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }

      const pageState = await getHostedPayPalState(tabId, { stepKey });
      if (isHostedCheckoutPlusActivationResolved(pageState)) {
        return;
      }
      const initialVerificationResult = await handleHostedPayPalVerificationState(tabId, pageState, createAccountState, verificationContext, stepKey);
      if (initialVerificationResult.phonePlusFallbackToFreeAuth) {
        return;
      }
      if (initialVerificationResult.handled) {
        const nextState = await waitForHostedPayPalStage(
          tabId,
          async (stateInfo) => {
            if (isHostedCheckoutPlusActivationResolved(stateInfo)) {
              return true;
            }
            const verificationResult = await handleHostedPayPalVerificationState(tabId, stateInfo, createAccountState, verificationContext, stepKey);
            if (verificationResult.phonePlusFallbackToFreeAuth) {
              return true;
            }
            if (verificationResult.handled) {
              return false;
            }
            return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_VERIFICATION;
          },
          { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 验证码页跳转` }
        );
        if (nextState === true || isHostedCheckoutPlusActivationResolved(nextState)) {
          return;
        }
        await completeHostedStep(stepKey, tabId, {
          plusHostedCheckoutLastStage: nextState.hostedStage || '',
        });
        return;
      }
      if (isHostedStageAtOrAfter(pageState.hostedStage, PAYPAL_HOSTED_STAGE_REVIEW)
        && pageState.hostedStage !== PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT) {
        await addHostedStepLog(stepKey, `步骤 ${stepNumber}：当前 PayPal 已进入后续页面（${pageState.hostedStage}），创建确认节点直接完成。`, 'info');
        await completeHostedStep(stepKey, tabId, {
          plusHostedCheckoutLastStage: pageState.hostedStage,
        });
        return;
      }
      if (pageState.hostedStage !== PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT) {
        throw new Error(`步骤 ${stepNumber}：当前不是 PayPal 创建确认页（当前状态：${pageState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}）。`);
      }

      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在确认创建 PayPal 账号。`, 'info');
      await runHostedPayPalStep(tabId, {
        expectedStage: PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT,
      }, { stepKey });
      const nextState = await waitForHostedPayPalStage(
        tabId,
        async (stateInfo) => {
          if (isHostedCheckoutPlusActivationResolved(stateInfo)) {
            return true;
          }
          const addressRetryResult = await retryHostedPayPalAddressError(tabId, stateInfo, {
            stepKey,
            retries: hostedCreateAccountAddressRetries,
            profile,
            state: createAccountState,
            expectedStage: PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT,
            addressSuggestionFallbackUsed: hostedCreateAccountAddressSuggestionFallbackUsed,
          });
          if (addressRetryResult.handled) {
            hostedCreateAccountAddressRetries = addressRetryResult.retries;
            hostedCreateAccountAddressSuggestionFallbackUsed = Boolean(addressRetryResult.addressSuggestionFallbackUsed);
            profile = addressRetryResult.profile;
            createAccountState = addressRetryResult.state;
            return false;
          }
          const verificationResult = await handleHostedPayPalVerificationState(tabId, stateInfo, createAccountState, verificationContext, stepKey);
          if (verificationResult.phonePlusFallbackToFreeAuth) {
            return true;
          }
          if (verificationResult.handled) {
            return false;
          }
          return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
        },
        { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 创建确认页跳转` }
      );
      if (isHostedCheckoutPlusActivationResolved(nextState)) {
        return;
      }
      if (nextState === true) {
        return;
      }
      await completeHostedStep(stepKey, tabId, {
        plusHostedCheckoutLastStage: nextState.hostedStage || '',
      });
    }

    async function executePayPalHostedReview(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_REVIEW;
      const stepNumber = getHostedStepNumber(stepKey);
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      const verificationContext = createHostedVerificationRetryContext();
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state, { waitBeforeComplete: true })) {
        return;
      }
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 授权复核页` }
      );
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state, { waitBeforeComplete: true })) {
        return;
      }

      const pageState = await getHostedPayPalState(tabId, { stepKey });
      if (isHostedCheckoutPlusActivationResolved(pageState)) {
        return;
      }
      const initialVerificationResult = await handleHostedPayPalVerificationState(tabId, pageState, state, verificationContext, stepKey);
      if (initialVerificationResult.phonePlusFallbackToFreeAuth) {
        return;
      }
      if (initialVerificationResult.handled) {
        await waitForHostedUrlAfterAction(
          tabId,
          (url) => isHostedCheckoutSuccessUrl(url) || !isPayPalUrl(url),
          { label: `步骤 ${stepNumber}：等待 PayPal 验证码后回到 ChatGPT 页面`, timeoutMs: HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS }
        ).catch(() => null);
        await completeHostedStepIfSuccessful(stepKey, tabId, state, {
          waitBeforeComplete: true,
          allowHomeFallback: true,
          throwOnHomeFallbackFailure: true,
        });
        return;
      }
      if (pageState.hostedStage !== PAYPAL_HOSTED_STAGE_REVIEW) {
        throw new Error(`步骤 ${stepNumber}：当前不是 PayPal 授权复核页（当前状态：${pageState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}）。`);
      }

      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在确认 PayPal 授权复核页。`, 'info');
      await runHostedPayPalStep(tabId, {
        expectedStage: PAYPAL_HOSTED_STAGE_REVIEW,
      }, { stepKey });
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isHostedCheckoutSuccessUrl(url) || !isPayPalUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 回到 ChatGPT 页面`, timeoutMs: HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS }
      ).catch(async () => {
        await waitForHostedPayPalStage(
          tabId,
          async (stateInfo) => {
            if (isHostedCheckoutPlusActivationResolved(stateInfo)) {
              return true;
            }
            const verificationResult = await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey);
            if (verificationResult.phonePlusFallbackToFreeAuth) {
              return true;
            }
            if (verificationResult.handled) {
              return false;
            }
            return Boolean(stateInfo?.successUrl || stateInfo?.hostedStage === PAYPAL_HOSTED_STAGE_OUTSIDE);
          },
          { stepKey, label: `步骤 ${stepNumber}：等待 PayPal 回到 ChatGPT 支付成功页`, timeoutMs: HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS }
        );
      });
      await completeHostedStepIfSuccessful(stepKey, tabId, state, {
        waitBeforeComplete: true,
        allowHomeFallback: true,
        throwOnHomeFallbackFailure: true,
      });
    }

    function normalizeHelperCountryCode(countryCode = '86') {
      const digits = String(countryCode || '').replace(/\D/g, '');
      return digits || '86';
    }

    function normalizeHelperPhoneNumber(phone = '', countryCode = '86') {
      const cleaned = String(phone || '').replace(/\D/g, '');
      const countryDigits = normalizeHelperCountryCode(countryCode);
      if (countryDigits && cleaned.startsWith(countryDigits) && cleaned.length > countryDigits.length) {
        return cleaned.slice(countryDigits.length);
      }
      return cleaned;
    }

    function normalizeGpcHelperPhoneMode(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcHelperPhoneMode) {
        return rootScope.GoPayUtils.normalizeGpcHelperPhoneMode(value);
      }
      const normalized = String(value || '').trim().toLowerCase();
      return normalized === GPC_HELPER_PHONE_MODE_AUTO || normalized === 'builtin'
        ? GPC_HELPER_PHONE_MODE_AUTO
        : GPC_HELPER_PHONE_MODE_MANUAL;
    }

    function normalizeGpcOtpChannel(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcOtpChannel) {
        return rootScope.GoPayUtils.normalizeGpcOtpChannel(value);
      }
      return String(value || '').trim().toLowerCase() === 'sms' ? 'sms' : 'whatsapp';
    }

    function resolveGpcHelperApiKey(state = {}) {
      const apiKey = String(
        state?.gopayHelperApiKey
        || state?.gpcApiKey
        || state?.apiKey
        || ''
      ).trim();
      if (!apiKey) {
        throw new Error('创建 GPC 订单失败：缺少 API Key。');
      }
      return apiKey;
    }

    function normalizeGpcHelperBaseUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcHelperBaseUrl) {
        return rootScope.GoPayUtils.normalizeGpcHelperBaseUrl(apiUrl);
      }
      let normalized = String(apiUrl || DEFAULT_GPC_HELPER_API_URL).trim().replace(/\/+$/g, '');
      normalized = normalized.replace(/\/api\/checkout\/start$/i, '');
      normalized = normalized.replace(/\/api\/gopay\/(?:otp|pin)$/i, '');
      normalized = normalized.replace(/\/api\/gp\/tasks(?:\/[^/?#]+)?(?:\/(?:otp|pin|stop))?(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/gp\/balance(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/card\/balance(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/card\/redeem-api-key(?:\?.*)?$/i, '');
      return normalized || DEFAULT_GPC_HELPER_API_URL;
    }

    function buildGpcHelperApiUrl(apiUrl = '', path = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcHelperApiUrl) {
        return rootScope.GoPayUtils.buildGpcHelperApiUrl(apiUrl, path);
      }
      const baseUrl = normalizeGpcHelperBaseUrl(apiUrl);
      if (!baseUrl) {
        return '';
      }
      const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
      return `${baseUrl}${normalizedPath}`;
    }

    function buildGpcTaskCreateUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcTaskCreateUrl) {
        return rootScope.GoPayUtils.buildGpcTaskCreateUrl(apiUrl);
      }
      return buildGpcHelperApiUrl(apiUrl, '/api/gp/tasks');
    }

    function buildGpcBalanceUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcApiKeyBalanceUrl) {
        return rootScope.GoPayUtils.buildGpcApiKeyBalanceUrl(apiUrl);
      }
      if (rootScope.GoPayUtils?.buildGpcCardBalanceUrl) {
        return rootScope.GoPayUtils.buildGpcCardBalanceUrl(apiUrl);
      }
      return buildGpcHelperApiUrl(apiUrl, '/api/gp/balance');
    }

    function unwrapGpcResponse(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.unwrapGpcResponse) {
        return rootScope.GoPayUtils.unwrapGpcResponse(payload);
      }
      if (payload && typeof payload === 'object' && !Array.isArray(payload)
        && Object.prototype.hasOwnProperty.call(payload, 'data')
        && (Object.prototype.hasOwnProperty.call(payload, 'code') || Object.prototype.hasOwnProperty.call(payload, 'message'))) {
        return payload.data ?? {};
      }
      return payload;
    }

    function isGpcUnifiedResponseOk(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.isGpcUnifiedResponseOk) {
        return rootScope.GoPayUtils.isGpcUnifiedResponseOk(payload);
      }
      if (!payload || typeof payload !== 'object' || !Object.prototype.hasOwnProperty.call(payload, 'code')) {
        return true;
      }
      const code = Number(payload.code);
      return Number.isFinite(code) ? code >= 200 && code < 300 : String(payload.code || '').trim() === '200';
    }

    function getGpcResponseErrorDetail(payload = {}, status = 0) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.extractGpcResponseErrorDetail) {
        return rootScope.GoPayUtils.extractGpcResponseErrorDetail(payload, status);
      }
      return payload?.data?.detail || payload?.detail || payload?.message || payload?.error || `HTTP ${status || 0}`;
    }

    function getGpcRemainingUses(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.getGpcBalanceRemainingUses) {
        return rootScope.GoPayUtils.getGpcBalanceRemainingUses(payload);
      }
      const data = unwrapGpcResponse(payload);
      const numeric = Number(data?.remaining_uses ?? data?.remainingUses ?? data?.balance ?? data?.remaining);
      return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : null;
    }

    function normalizeGpcAutoModePermissionValue(value) {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
      }
      const normalized = String(value ?? '').trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      if (['true', '1', 'yes', 'y', 'on', 'enabled', 'enable'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'off', 'disabled', 'disable'].includes(normalized)) {
        return false;
      }
      return null;
    }

    function getGpcAutoModePermission(payload = {}) {
      const data = unwrapGpcResponse(payload);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
      }
      return normalizeGpcAutoModePermissionValue(
        data.auto_mode_enabled
        ?? data.autoModeEnabled
        ?? data.auto_enabled
        ?? data.autoEnabled
      );
    }

    function isGpcAutoModePermissionDenied(payload = {}) {
      return getGpcAutoModePermission(payload) === false;
    }

    async function assertGpcApiKeyReadyForCreate(state = {}, phoneMode = GPC_HELPER_PHONE_MODE_MANUAL, apiKey = '') {
      const apiUrl = buildGpcBalanceUrl(state?.gopayHelperApiUrl);
      if (!apiUrl) {
        throw new Error('创建 GPC 订单失败：缺少 API 地址。');
      }
      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Key': apiKey,
        },
      }, 30000);
      if (!response?.ok || !isGpcUnifiedResponseOk(data)) {
        const detail = getGpcResponseErrorDetail(data, response?.status || 0);
        throw new Error(`创建 GPC 订单失败：API Key 校验失败：${detail}`);
      }
      const balanceData = unwrapGpcResponse(data);
      const remainingUses = getGpcRemainingUses(balanceData);
      const status = String(balanceData?.status || balanceData?.card_status || balanceData?.cardStatus || '').trim().toLowerCase();
      if (status && status !== 'active') {
        throw new Error(`创建 GPC 订单失败：API Key 状态不可用（${status}）。`);
      }
      if (remainingUses !== null && remainingUses <= 0) {
        throw new Error('创建 GPC 订单失败：API Key 剩余次数不足。');
      }
      if (phoneMode === GPC_HELPER_PHONE_MODE_AUTO && isGpcAutoModePermissionDenied(balanceData)) {
        throw new Error('创建 GPC 订单失败：当前 GPC API Key 未开通自动模式。');
      }
    }

    async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
      const fetcher = typeof fetchImpl === 'function'
        ? fetchImpl
        : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前运行环境不支持 fetch，无法调用 GPC API。');
      }
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const effectiveTimeoutMs = Math.max(1000, Number(timeoutMs) || 30000);
      let didTimeout = false;
      let timer = null;
      const buildTimeoutError = () => new Error(`GPC API 请求超时（>${Math.round(effectiveTimeoutMs / 1000)} 秒）：${url}`);
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          didTimeout = true;
          reject(buildTimeoutError());
          if (controller) {
            controller.abort();
          }
        }, effectiveTimeoutMs);
      });
      try {
        const response = await Promise.race([
          fetcher(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }),
          timeoutPromise,
        ]);
        const data = await Promise.race([
          response.json().catch(() => ({})),
          timeoutPromise,
        ]);
        return { response, data };
      } catch (error) {
        if (didTimeout || error?.name === 'AbortError') {
          throw buildTimeoutError();
        }
        throw error;
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    async function readChatGptSessionStateFromTab(tabId) {
      await waitForTabCompleteUntilStopped(tabId);
      await sleepWithStop(1000);
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        logMessage: '步骤 6：正在等待 ChatGPT 页面完成加载，再继续获取 accessToken...',
      });

      const sessionResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'PLUS_CHECKOUT_GET_STATE',
        source: 'background',
        payload: {
          includeSession: true,
          includeAccessToken: true,
        },
      });
      if (sessionResult?.error) {
        throw new Error(sessionResult.error);
      }
      return {
        session: sessionResult?.session || null,
        accessToken: normalizeString(sessionResult?.accessToken || sessionResult?.session?.accessToken),
        raw: sessionResult || {},
      };
    }

    async function readAccessTokenFromChatGptSessionTab(tabId) {
      const sessionState = await readChatGptSessionStateFromTab(tabId);
      return normalizeString(sessionState?.accessToken);
    }

    async function refreshChatGptSessionAndInspectPlusActivation() {
      const tabId = await openFreshChatGptTabForCheckoutCreate();
      await waitForTabCompleteUntilStopped(tabId);
      await addLog('步骤 6：已打开 ChatGPT，等待 5 秒后刷新会话并检查 PLUS 状态。', 'info');
      await sleepWithStop(PAYPAL_GENERIC_ERROR_SESSION_SETTLE_WAIT_MS);
      if (chrome?.tabs?.reload) {
        await chrome.tabs.reload(tabId).catch(() => {});
        await waitForTabCompleteUntilStopped(tabId).catch(() => {});
      }
      const sessionState = await readChatGptSessionStateFromTab(tabId);
      return {
        tabId,
        session: sessionState?.session || null,
        accessToken: normalizeString(sessionState?.accessToken),
        ...inspectPlusActivationFromSession(sessionState?.session || null),
      };
    }

    function buildPhonePlusCheckFailureReason(inspection = null, fallback = '') {
      const detail = normalizeString(
        inspection?.planType
          ? `planType=${inspection.planType}`
          : (inspection?.planSignalPath ? `planSignalPath=${inspection.planSignalPath}` : '')
      );
      return detail || normalizeString(fallback) || '未检测到 Plus 激活信号';
    }

    async function requestPhonePlusCheckRetry(state = {}, options = {}) {
      const reason = normalizeString(options.reason || 'Plus Check 未确认 Plus 状态');
      const attemptCount = Math.max(1, Math.floor(Number(options.attemptCount) || 1));
      await setState({
        phonePlusCheckAttemptCount: attemptCount,
        phonePlusCheckLastCheckedAt: Date.now(),
        phonePlusCheckLastFailureReason: reason,
        phonePlusCheckVerifiedAt: 0,
        plusHostedCheckoutVerified: false,
        plusHostedCheckoutVerificationFailed: true,
        plusHostedCheckoutVerificationFailureStrategy: PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY_RETRY,
        plusHostedCheckoutVerificationFailureReason: reason,
        plusHostedCheckoutVerificationFailureAt: Date.now(),
        plusCheckoutVerificationRetryRequested: true,
        plusCheckoutVerificationRetryReason: reason,
        plusCheckoutVerificationRetryAt: Date.now(),
        plusCheckoutVerificationRetryNodeId: 'plus-check',
        plusCheckoutRetryCleanupRequested: true,
        plusCheckoutRetryCleanupReason: reason,
      });
      await addLog(
        `Plus Check：第 ${attemptCount}/${PHONE_PLUS_CHECK_MAX_ATTEMPTS} 次未确认 Plus 生效，准备重建 Plus Checkout 后再次检查。原因：${reason}`,
        'warn',
        { nodeId: 'plus-check' }
      );
      await completeNodeFromBackground('plus-check', {
        phonePlusCheckAttemptCount: attemptCount,
        plusHostedCheckoutVerified: false,
        plusHostedCheckoutVerificationFailed: true,
        plusCheckoutVerificationRetryRequested: true,
        plusCheckoutVerificationRetryReason: reason,
        plusCheckoutVerificationRetryNodeId: 'plus-check',
      });
    }

    async function fallbackPhonePlusCheckRetryExhausted(state = {}, options = {}) {
      const attemptCount = Math.max(PHONE_PLUS_CHECK_MAX_ATTEMPTS, Math.floor(Number(options.attemptCount) || 0));
      const reason = normalizeString(options.reason || 'Plus Check 已达到检查上限');
      await setState({
        phonePlusCheckAttemptCount: attemptCount,
        phonePlusCheckLastCheckedAt: Date.now(),
        phonePlusCheckLastFailureReason: reason,
        phonePlusCheckVerifiedAt: 0,
        plusHostedCheckoutVerified: false,
        plusHostedCheckoutVerificationFailed: true,
        plusHostedCheckoutVerificationFailureStrategy: 'skip_phone_plus',
        plusHostedCheckoutVerificationFailureReason: reason,
        plusHostedCheckoutVerificationFailureAt: Date.now(),
        plusCheckoutVerificationRetryRequested: false,
        plusCheckoutVerificationRetryReason: '',
        plusCheckoutVerificationRetryAt: 0,
        plusCheckoutVerificationRetryNodeId: '',
      });
      if (typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        throw new Error(`Plus Check 已连续 ${PHONE_PLUS_CHECK_MAX_ATTEMPTS} 次未确认 Plus 生效，但 Phone Plus fallback 能力不可用。原因：${reason}`);
      }
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'phone-plus-check-retry-exhausted',
        detail: reason,
        nodeId: 'plus-check',
      });
      if (!fallbackResult?.handled) {
        throw new Error(`Plus Check 已连续 ${PHONE_PLUS_CHECK_MAX_ATTEMPTS} 次未确认 Plus 生效，但跳过 Phone Plus 支付段失败：${fallbackResult?.reason || 'unknown'}。原因：${reason}`);
      }
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
      };
    }

    async function fallbackPhonePlusCheckNotPlus(state = {}, options = {}) {
      const attemptCount = Math.max(1, Math.floor(Number(options.attemptCount) || 1));
      const reason = normalizeString(options.reason || 'Plus Check 未确认 Plus 状态');
      const checkedAt = Date.now();
      await setState({
        phonePlusCheckAttemptCount: attemptCount,
        phonePlusCheckLastCheckedAt: checkedAt,
        phonePlusCheckLastFailureReason: reason,
        phonePlusCheckVerifiedAt: 0,
        plusHostedCheckoutVerified: false,
        plusHostedCheckoutVerificationFailed: true,
        plusHostedCheckoutVerificationFailureStrategy: 'skip_phone_plus',
        plusHostedCheckoutVerificationFailureReason: reason,
        plusHostedCheckoutVerificationFailureAt: checkedAt,
        plusCheckoutVerificationRetryRequested: false,
        plusCheckoutVerificationRetryReason: '',
        plusCheckoutVerificationRetryAt: 0,
        plusCheckoutVerificationRetryNodeId: '',
        plusCheckoutRetryCleanupRequested: false,
        plusCheckoutRetryCleanupReason: '',
      });
      if (typeof deps.handlePhonePlusNonFreeTrialFallback !== 'function') {
        throw new Error(`Plus Check 确认当前不是 Plus，但 Phone Plus fallback 能力不可用。原因：${reason}`);
      }
      const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
        reason: 'phone-plus-check-not-plus',
        detail: reason,
        nodeId: 'plus-check',
      });
      if (!fallbackResult?.handled) {
        throw new Error(`Plus Check 确认当前不是 Plus，但跳过 Phone Plus 支付段失败：${fallbackResult?.reason || 'unknown'}。原因：${reason}`);
      }
      return {
        phonePlusFallbackToFreeAuth: true,
        fallbackResult,
      };
    }

    async function executePhonePlusCheck(state = {}) {
      if (!isPhonePlusModeState(state)) {
        await addLog('Plus Check：当前不是 Phone Plus 模式，直接跳过检查。', 'info', { nodeId: 'plus-check' });
        await completeNodeFromBackground('plus-check', {
          phonePlusCheckSkipped: true,
          phonePlusCheckSkipReason: 'not-phone-plus',
        });
        return;
      }

      const currentAttempt = Math.max(0, Math.floor(Number(state?.phonePlusCheckAttemptCount) || 0)) + 1;
      const attemptCount = Math.min(PHONE_PLUS_CHECK_MAX_ATTEMPTS, currentAttempt);
      await addLog(
        `Plus Check：正在刷新 ChatGPT 会话并确认 Plus 状态（${attemptCount}/${PHONE_PLUS_CHECK_MAX_ATTEMPTS}）。`,
        'info',
        { nodeId: 'plus-check' }
      );

      let inspection = null;
      let failureReason = '';
      try {
        inspection = await refreshChatGptSessionAndInspectPlusActivation();
      } catch (error) {
        failureReason = getErrorMessage(error);
      }

      if (inspection?.active) {
        const checkedAt = Date.now();
        await setState({
          phonePlusCheckAttemptCount: attemptCount,
          phonePlusCheckLastCheckedAt: checkedAt,
          phonePlusCheckLastFailureReason: '',
          phonePlusCheckVerifiedAt: checkedAt,
          plusHostedCheckoutVerified: true,
          plusHostedCheckoutVerificationFailed: false,
          plusHostedCheckoutVerificationFailureReason: '',
          plusHostedCheckoutVerificationFailureAt: 0,
          plusCheckoutVerificationRetryRequested: false,
          plusCheckoutVerificationRetryReason: '',
          plusCheckoutVerificationRetryAt: 0,
          plusCheckoutVerificationRetryNodeId: '',
          plusCheckoutRetryCleanupRequested: false,
          plusCheckoutRetryCleanupReason: '',
          plusCheckoutTabId: inspection.tabId || state?.plusCheckoutTabId || null,
        });
        await addLog(
          `Plus Check：已确认 Plus 生效${inspection.planType ? `（planType=${inspection.planType}）` : ''}，继续 OAuth 流程。`,
          'ok',
          { nodeId: 'plus-check' }
        );
        await completeNodeFromBackground('plus-check', {
          phonePlusCheckAttemptCount: attemptCount,
          phonePlusCheckVerifiedAt: checkedAt,
          plusHostedCheckoutVerified: true,
          plusHostedCheckoutVerificationFailed: false,
          plusDetectedPlanType: inspection.planType || '',
          plusCheckoutTabId: inspection.tabId || null,
        });
        return;
      }

      const reason = buildPhonePlusCheckFailureReason(inspection, failureReason);
      await addLog(
        `Plus Check：未确认 Plus 生效，跳过 Phone Plus 支付段，继续 OAuth/free 流程。原因：${reason}`,
        'warn',
        { nodeId: 'plus-check' }
      );
      await fallbackPhonePlusCheckNotPlus(state, {
        attemptCount,
        reason,
      });
    }

    async function generateCloudCheckoutFromApi(accessToken = '', paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, state = {}) {
      const token = String(accessToken || '').trim();
      if (!token) {
        throw new Error('步骤 6：云端支付转换缺少 accessToken。');
      }

      const apiUrl = normalizePlusCheckoutCloudConversionApiUrl(
        state?.plusCheckoutCloudConversionApiUrl || 'https://gujumpgate.zg.fyi/api/checkout'
      );
      if (!apiUrl) {
        throw new Error('步骤 6：已启用云端支付转换，但未配置云端服务地址。');
      }
      try {
        const parsed = new URL(apiUrl);
        if (!/^https?:$/i.test(String(parsed.protocol || ''))) {
          throw new Error('unsupported protocol');
        }
      } catch {
        throw new Error('步骤 6：云端支付转换服务地址不是有效的 HTTP/HTTPS URL。');
      }

      const billingDetails = await getCheckoutBillingDetailsForState(paymentMethod, state, {
        context: 'plus-checkout-cloud-conversion',
      });
      const headers = {
        Accept: 'application/json',
        'Accept-Language': getBrowserFingerprintAcceptLanguageForState(state),
        'Content-Type': 'application/json',
      };
      const apiKey = String(state?.plusCheckoutCloudConversionApiKey || '2KwVxE6f0ABH002JLkoQJ9ReRf4_d01y').trim();
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          accessToken: token,
          paymentMethod: normalizePlusPaymentMethod(paymentMethod),
          country: billingDetails.country,
          currency: billingDetails.currency,
        }),
      }, 45000);

      const targetCheckoutUrl = String(
        data?.preferredCheckoutUrl
        || data?.hostedCheckoutUrl
        || data?.convertedCheckoutUrl
        || data?.chatgptCheckoutUrl
        || data?.checkoutUrl
        || ''
      ).trim();
      if (!response?.ok || !targetCheckoutUrl) {
        const detail = formatCloudCheckoutErrorDetail(
          data?.detail || data?.message || data?.error || data,
          `HTTP ${response?.status || 0}`
        );
        if (isCloudCheckoutAlreadyPaidMessage(detail)) {
          return {
            checkoutUrl: '',
            chatgptCheckoutUrl: '',
            checkoutSessionId: String(data?.checkoutSessionId || '').trim(),
            processorEntity: String(data?.processorEntity || '').trim(),
            hostedCheckoutUrl: '',
            convertedCheckoutUrl: '',
            preferredCheckoutUrl: '',
            country: String(data?.country || billingDetails.country).trim() || billingDetails.country,
            currency: String(data?.currency || billingDetails.currency).trim() || billingDetails.currency,
            checkoutSource: 'cloud-checkout-already-paid',
            alreadyPaid: true,
            alreadyPaidDetail: detail,
          };
        }
        throw new Error(`步骤 6：云端支付转换失败：${detail}`);
      }

      return {
        checkoutUrl: String(data?.checkoutUrl || '').trim(),
        chatgptCheckoutUrl: String(data?.chatgptCheckoutUrl || '').trim(),
        checkoutSessionId: String(data?.checkoutSessionId || '').trim(),
        processorEntity: String(data?.processorEntity || '').trim(),
        hostedCheckoutUrl: String(data?.hostedCheckoutUrl || '').trim(),
        convertedCheckoutUrl: String(data?.chatgptCheckoutUrl || data?.convertedCheckoutUrl || '').trim(),
        preferredCheckoutUrl: targetCheckoutUrl,
        country: String(data?.country || billingDetails.country).trim() || billingDetails.country,
        currency: String(data?.currency || billingDetails.currency).trim() || billingDetails.currency,
        checkoutSource: 'cloud-converted-checkout',
      };
    }

    async function generateGpcCheckoutFromApi(accessToken = '', state = {}) {
      const token = String(accessToken || '').trim();
      if (!token) {
        throw new Error('创建 GPC 订单失败：缺少 accessToken。');
      }
      const apiUrl = buildGpcTaskCreateUrl(state?.gopayHelperApiUrl);
      if (!apiUrl) {
        throw new Error('创建 GPC 订单失败：缺少 API 地址。');
      }
      const phoneMode = normalizeGpcHelperPhoneMode(state?.gopayHelperPhoneMode || state?.phoneMode);
      const isAutoMode = phoneMode === GPC_HELPER_PHONE_MODE_AUTO;
      const phoneNumber = String(state?.gopayHelperPhoneNumber || '').trim();
      const countryCode = normalizeHelperCountryCode(state?.gopayHelperCountryCode || '86');
      const pin = String(state?.gopayHelperPin || '').trim();
      const apiKey = resolveGpcHelperApiKey(state);
      if (!isAutoMode && !phoneNumber) {
        throw new Error('创建 GPC 订单失败：手动模式缺少手机号。');
      }
      if (!isAutoMode && !pin) {
        throw new Error('创建 GPC 订单失败：手动模式缺少 PIN。');
      }

      throwIfStopped();
      await assertGpcApiKeyReadyForCreate(state, phoneMode, apiKey);
      throwIfStopped();
      const payload = {
        access_token: token,
        phone_mode: phoneMode,
      };
      if (!isAutoMode) {
        payload.country_code = countryCode;
        payload.phone_number = normalizeHelperPhoneNumber(phoneNumber, countryCode);
        payload.otp_channel = normalizeGpcOtpChannel(state?.gopayHelperOtpChannel);
      }

      const orderCreatedAt = Date.now();
      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Accept-Language': getBrowserFingerprintAcceptLanguageForState(state),
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
      }, 30000);

      const taskData = unwrapGpcResponse(data);
      const taskId = String(taskData?.task_id || taskData?.taskId || '').trim();

      if (!response?.ok || !isGpcUnifiedResponseOk(data) || !taskId) {
        const detail = getGpcResponseErrorDetail(data, response?.status || 0);
        throw new Error(`创建 GPC 订单失败：${detail}`);
      }

      return {
        taskId,
        taskStatus: String(taskData?.status || '').trim(),
        statusText: String(taskData?.status_text || taskData?.statusText || '').trim(),
        remoteStage: String(taskData?.remote_stage || taskData?.remoteStage || '').trim(),
        orderCreatedAt,
        responsePayload: taskData && typeof taskData === 'object' && !Array.isArray(taskData) ? taskData : null,
        phoneMode: normalizeGpcHelperPhoneMode(taskData?.phone_mode || taskData?.phoneMode || phoneMode),
        country: 'ID',
        currency: 'IDR',
        checkoutSource: PLUS_PAYMENT_METHOD_GPC_HELPER,
      };
    }

    async function executeGpcCheckoutCreate(state = {}) {
      let accessToken = String(state?.contributionAccessToken || state?.accessToken || state?.chatgptAccessToken || '').trim();
      if (!accessToken) {
        await addLog('步骤 6：正在获取 accessToken...', 'info');
        const tokenTabId = await openFreshChatGptTabForCheckoutCreate();
        try {
          accessToken = await readAccessTokenFromChatGptSessionTab(tokenTabId);
        } finally {
          if (chrome?.tabs?.remove && Number.isInteger(tokenTabId)) {
            await chrome.tabs.remove(tokenTabId).catch(() => {});
          }
        }
      }
      if (!accessToken) {
        throw new Error('步骤 6：GPC 模式获取 accessToken 失败。');
      }

      await addLog('步骤 6：正在调用 GPC 接口创建订单...', 'info');
      const result = await generateGpcCheckoutFromApi(accessToken, state);
      await setState({
        plusCheckoutTabId: null,
        plusCheckoutUrl: '',
        plusCheckoutCountry: result.country || 'ID',
        plusCheckoutCurrency: result.currency || 'IDR',
        plusCheckoutSource: result.checkoutSource,
        gopayHelperTaskId: result.taskId,
        gopayHelperTaskStatus: result.taskStatus,
        gopayHelperStatusText: result.statusText,
        gopayHelperRemoteStage: result.remoteStage,
        gopayHelperTaskPayload: result.responsePayload,
        gopayHelperTaskProgressSignature: '',
        gopayHelperTaskProgressAt: 0,
        gopayHelperTaskProgressTaskId: result.taskId,
        gopayHelperReferenceId: '',
        gopayHelperGoPayGuid: '',
        gopayHelperRedirectUrl: '',
        gopayHelperNextAction: '',
        gopayHelperFlowId: '',
        gopayHelperChallengeId: '',
        gopayHelperStartPayload: null,
        gopayHelperOrderCreatedAt: result.orderCreatedAt || Date.now(),
      });
      await addLog(`步骤 6：GPC ${result.phoneMode === GPC_HELPER_PHONE_MODE_AUTO ? '自动' : '手动'}模式任务已创建（task_id: ${result.taskId}），准备继续下一步。`, 'info');
      await completeNodeFromBackground('plus-checkout-create', {
        plusCheckoutCountry: result.country || 'ID',
        plusCheckoutCurrency: result.currency || 'IDR',
        plusCheckoutSource: result.checkoutSource,
      });
    }

    async function enforcePlusRegistrationGateBeforeCheckout(state = {}) {
      if (!isPlusModeState(state)) {
        return null;
      }
      const freeStatus = normalizePlusRegistrationFreeStatus(state?.freeStatus);
      const isPhonePlus = isPhonePlusModeState(state);
      if (freeStatus !== 'free') {
        const reason = isPhonePlus ? 'phone-plus-registration-non-free' : 'plus-registration-non-free';
        const detail = `freeStatus=${freeStatus}`;
        await addLog(`Plus checkout skipped before create: ${detail}.`, 'warn');
        if (typeof deps.handlePhonePlusNonFreeTrialFallback === 'function') {
          const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
            reason,
            detail,
            nodeId: 'wait-registration-success',
          });
          if (fallbackResult?.handled) {
            return { phonePlusFallbackToFreeAuth: true, fallbackResult };
          }
        }
        throw new Error(`PLUS_CHECKOUT_NON_FREE_TRIAL::${detail}`);
      }

      const regionGate = getPlusRegistrationRegionGateResult(state);
      if (regionGate.enabled && !regionGate.matched) {
        const reason = isPhonePlus ? 'phone-plus-registration-region-mismatch' : 'plus-registration-region-mismatch';
        const allowedLabel = regionGate.allowedRegions.join(',');
        const exitLabel = regionGate.exitRegion || regionGate.rawExitRegion || 'unknown';
        const detail = `freeStatus=free; exitRegion=${exitLabel}; allowedRegions=${allowedLabel}`;
        await addLog(`Plus checkout skipped before create: ${detail}.`, 'warn');
        if (typeof deps.handlePhonePlusNonFreeTrialFallback === 'function') {
          const fallbackResult = await deps.handlePhonePlusNonFreeTrialFallback(state, {
            reason,
            detail,
            nodeId: 'wait-registration-success',
          });
          if (fallbackResult?.handled) {
            return { phonePlusFallbackToFreeAuth: true, fallbackResult };
          }
        }
        throw new Error(`PLUS_CHECKOUT_REGION_MISMATCH::${detail}`);
      }

      return null;
    }

    async function executePlusCheckoutCreate(state = {}, options = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      const useHostedCheckoutFinalStep = isHostedCheckoutFinalStepEnabled(state);
      await cleanupBeforePlusCheckoutRetryCreate(state, options);
      const registrationGate = await enforcePlusRegistrationGateBeforeCheckout(state);
      if (registrationGate?.phonePlusFallbackToFreeAuth) {
        return;
      }
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        await executeGpcCheckoutCreate(state);
        return;
      }

      const paymentMethodLabel = getPlusPaymentMethodLabel(paymentMethod);
      const checkoutModeLabel = getCheckoutModeLabel(state);
      await addLog(`步骤 6：正在打开新的 ChatGPT 会话，准备创建 ${checkoutModeLabel}...`, 'info');
      const tabId = await openFreshChatGptTabForCheckoutCreate();

      await waitForTabCompleteUntilStopped(tabId);
      await sleepWithStop(1000);
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        logMessage: '步骤 6：正在等待 ChatGPT 页面完成加载，再继续创建订阅页...',
      });

      let result = null;
      const checkoutBillingDetails = await getCheckoutBillingDetailsForState(paymentMethod, state, {
        context: 'plus-checkout-create',
      });
      if (isPlusCheckoutCloudConversionEnabled(state, paymentMethod)) {
        await addLog('步骤 6：已启用云端支付转换，正在读取 accessToken 并请求云端服务生成订阅链接...', 'info');
        const accessToken = await readAccessTokenFromChatGptSessionTab(tabId);
        if (!accessToken) {
          throw new Error('步骤 6：云端支付转换未获取到可用 accessToken。');
        }
        result = await generateCloudCheckoutFromApi(accessToken, paymentMethod, state);
      } else {
        result = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
          type: 'CREATE_PLUS_CHECKOUT',
          source: 'background',
          payload: {
            paymentMethod,
            hostedCheckoutFinalStep: useHostedCheckoutFinalStep,
            checkoutRegionCode: state?.plusCheckoutRegionCode || (state?.plusCheckoutRegionalCheckoutEnabled ? 'auto' : 'US'),
            regionalCheckoutEnabled: paymentMethod !== PLUS_PAYMENT_METHOD_GOPAY
              && (checkoutBillingDetails.country !== 'US' || checkoutBillingDetails.currency !== 'USD'),
            billingDetails: checkoutBillingDetails,
          },
        });
      }

      if (result?.error) {
        throw new Error(result.error);
      }
      if (result?.alreadyPaid) {
        await completeCloudCheckoutAlreadyPaid(tabId, result, state);
        return;
      }
      const targetCheckoutUrl = String(
        result?.preferredCheckoutUrl
        || result?.hostedCheckoutUrl
        || result?.convertedCheckoutUrl
        || result?.chatgptCheckoutUrl
        || result?.checkoutUrl
        || ''
      ).trim();
      if (!targetCheckoutUrl) {
        throw new Error(`步骤 6：${checkoutModeLabel} 未返回可用的订阅链接。`);
      }

      if (useHostedCheckoutFinalStep) {
        await executeHostedCheckoutCreate(tabId, state, result);
        return;
      }

      const proxySession = await applyClassicPaypalCheckoutConversionProxySessionBeforeOpen(state, paymentMethod);
      if (proxySession?.phonePlusFallbackToFreeAuth) {
        return;
      }

      await addLog(`步骤 6：${checkoutModeLabel} 已创建，正在打开订阅页面...`, 'ok');
      await chrome.tabs.update(tabId, { url: targetCheckoutUrl, active: true });
      await waitForTabCompleteUntilStopped(tabId);
      const openStableWaitSeconds = (() => {
        const numeric = Number(state?.plusCheckoutOpenStableWaitSeconds);
        if (!Number.isFinite(numeric)) {
          return 20;
        }
        return Math.min(120, Math.max(0, Math.floor(numeric)));
      })();
      if (openStableWaitSeconds > 0) {
        await addLog(`步骤 6：订阅页面已打开，固定等待 ${openStableWaitSeconds} 秒让页面稳定...`, 'info');
        await sleepWithStop(openStableWaitSeconds * 1000);
      }
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        logMessage: '步骤 6：正在等待订阅页面完成加载...',
      });

      const initialAmountCheck = await handlePhonePlusAmountGuardAtStep6(tabId, state, {
        nodeId: 'plus-checkout-create',
        phaseLabel: 'Checkout URL 打开后',
        timeoutMs: 8000,
        retryDelayMs: 500,
      });
      if (initialAmountCheck?.phonePlusFallbackToFreeAuth) {
        return;
      }

      await setState({
        plusCheckoutTabId: tabId,
        plusCheckoutUrl: targetCheckoutUrl,
        plusCheckoutCountry: result.country || 'DE',
        plusCheckoutCurrency: result.currency || 'EUR',
        plusCheckoutSource: String(result?.checkoutSource || '').trim(),
        plusCheckoutAlreadyPaid: false,
        plusCheckoutAlreadyPaidAt: 0,
        plusCheckoutAlreadyPaidDetail: '',
      });

      await addLog(
        `步骤 6：Plus Checkout 页面已就绪（${paymentMethodLabel} / ${result.country || 'DE'} ${result.currency || 'EUR'}），准备继续下一步。`,
        'info'
      );

      await completeNodeFromBackground('plus-checkout-create', {
        plusCheckoutCountry: result.country || 'DE',
        plusCheckoutCurrency: result.currency || 'EUR',
        plusCheckoutSource: String(result?.checkoutSource || '').trim(),
      });
    }

    return {
      executePlusCheckoutCreate,
      cleanupBeforePlusCheckoutRetryCreate,
      executePayPalHostedOpenAiCheckout,
      executePayPalHostedEmail,
      executePayPalHostedCard,
      executePayPalHostedCreateAccount,
      executePayPalHostedReview,
      executePhonePlusCheck,
      getHostedCheckoutRuntimeConfig,
      fetchHostedCheckoutVerificationCodeManually,
      testCheckoutConversionProxy,
    };
  }

  return {
    createPlusCheckoutCreateExecutor,
  };
});
