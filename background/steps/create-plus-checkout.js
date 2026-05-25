(function attachBackgroundPlusCheckoutCreate(root, factory) {
  root.MultiPageBackgroundPlusCheckoutCreate = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundPlusCheckoutCreateModule() {
  const PLUS_CHECKOUT_SOURCE = 'plus-checkout';
  const PAYPAL_SOURCE = 'paypal-flow';
  const PLUS_CHECKOUT_ENTRY_URL = 'https://chatgpt.com/';
  const PLUS_CHECKOUT_INJECT_FILES = ['content/utils.js', 'content/operation-delay.js', 'content/plus-checkout.js'];
  const PAYPAL_INJECT_FILES = ['content/utils.js', 'content/operation-delay.js', 'content/paypal-flow.js'];
  const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
  const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
  const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
  const PLUS_PAYMENT_METHOD_GPC_HELPER = 'gpc-helper';
  const DEFAULT_GPC_HELPER_API_URL = 'https://gpc.qlhazycoder.top';
  const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
  const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
  const HOSTED_CHECKOUT_ADDRESS_ENDPOINT = 'https://www.meiguodizhi.com/api/v1/dz';
  const HOSTED_CHECKOUT_SUCCESS_URL_PATTERN = /^https:\/\/(?:chatgpt\.com|www\.chatgpt\.com|chat\.openai\.com)\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i;
  const HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS = 120000;
  const HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS = 10 * 60 * 1000;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS = 12;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS = 5000;
  const HOSTED_CHECKOUT_VERIFICATION_INVALID_RESEND_DELAY_MS = 3000;
  const HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX = 'HOSTED_CHECKOUT_GENERIC_ERROR::';
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX = 'HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT::';
  const HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS = 1;
  const HOSTED_CHECKOUT_DEFAULT_PHONE = '1234567890';
  const CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE = 'regular';
  const CHECKOUT_CONVERSION_PROXY_BYPASS_LIST = ['<local>', 'localhost', '127.0.0.1'];
  const CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS = [
    'chatgpt.com',
    '*.chatgpt.com',
    'openai.com',
    '*.openai.com',
    'oaistatic.com',
    '*.oaistatic.com',
    'stripe.com',
    '*.stripe.com',
    'paypal.com',
    '*.paypal.com',
    'gopayapi.com',
    '*.gopayapi.com',
    'gojek.com',
    '*.gojek.com',
    'midtrans.com',
    '*.midtrans.com',
    'xendit.co',
    '*.xendit.co',
    'gpc.qlhazycoder.top',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS = [
    'http://ip-api.com/json?lang=en',
    'https://ipinfo.io/json',
    'https://chatgpt.com/cdn-cgi/trace',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS = [
    'https://chatgpt.com/',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS = [
    ...CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
    'ip-api.com',
    '*.ip-api.com',
    'ipinfo.io',
    '*.ipinfo.io',
  ];
  const PAYPAL_HOSTED_STAGE_OUTSIDE = 'outside_paypal';
  const PAYPAL_HOSTED_STAGE_LOGIN = 'pay_login';
  const PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT = 'guest_checkout';
  const PAYPAL_HOSTED_STAGE_VERIFICATION = 'verification';
  const PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT = 'create_account';
  const PAYPAL_HOSTED_STAGE_REVIEW = 'review_consent';
  const PAYPAL_HOSTED_STAGE_APPROVAL = 'approval';
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

  function createPlusCheckoutCreateExecutor(deps = {}) {
    const {
      addLog: rawAddLog = async () => {},
      broadcastDataUpdate = null,
      chrome,
      completeNodeFromBackground,
      createAutomationTab = null,
      ensureContentScriptReadyOnTabUntilStopped,
      fetch: fetchImpl = null,
      getTabId = null,
      getState = null,
      isTabAlive = null,
      queryTabsInAutomationWindow = null,
      registerTab,
      sendTabMessageUntilStopped,
      setState,
      sleepWithStop,
      waitForTabCompleteUntilStopped,
      waitForTabUrlMatchUntilStopped = null,
      throwIfStopped = () => {},
      applyCheckoutScopedProxyFromUrl = null,
      restoreCheckoutScopedProxySnapshot = null,
      detectProxyExitInfoByPageContext = null,
      detectProxyExitInfoByBackgroundFetch = null,
      detectIpProxyTargetReachabilityByPageContext = null,
      buildProbeDiagnosticsSummary = null,
      buildTargetReachabilityFailureMessage = null,
      installIpProxyAuthListener = null,
      installIpProxyErrorListener = null,
      getCurrentIpProxyAuthEntry = null,
      setCurrentIpProxyAuthEntry = null,
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

    function normalizeCheckoutConversionProxyUrl(value = '') {
      return String(value || '').trim();
    }

    function normalizeCheckoutConversionProxyProtocol(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'socks5h') {
        return 'socks5';
      }
      return ['http', 'https', 'socks4', 'socks5'].includes(normalized) ? normalized : '';
    }

    function normalizeCheckoutConversionProxyPort(value = '') {
      const numeric = Number.parseInt(String(value || '').trim(), 10);
      if (!Number.isInteger(numeric) || numeric <= 0 || numeric > 65535) {
        return 0;
      }
      return numeric;
    }

    function parseCheckoutConversionProxyUrl(value = '') {
      const rawValue = normalizeCheckoutConversionProxyUrl(value);
      if (!rawValue) {
        return null;
      }

      let parsed = null;
      try {
        parsed = new URL(rawValue);
      } catch {
        throw new Error('支付转换代理不是有效 URL，请填写 http://host:port 或 socks5h://user:pass@host:port。');
      }

      const protocol = normalizeCheckoutConversionProxyProtocol(String(parsed.protocol || '').replace(/:$/g, ''));
      if (!protocol) {
        throw new Error('支付转换代理仅支持 http / https / socks4 / socks5 / socks5h。');
      }

      const host = String(parsed.hostname || '').trim();
      if (!host) {
        throw new Error('支付转换代理缺少主机名。');
      }

      const port = normalizeCheckoutConversionProxyPort(parsed.port);
      if (!port) {
        throw new Error('支付转换代理缺少有效端口。');
      }

      return {
        protocol,
        host,
        port,
        username: parsed.username ? decodeURIComponent(parsed.username) : '',
        password: parsed.password ? decodeURIComponent(parsed.password) : '',
      };
    }

    function describeCheckoutConversionProxyEntry(entry = null) {
      if (!entry || typeof entry !== 'object') {
        return '';
      }
      return `${String(entry.protocol || '').toLowerCase()}://${String(entry.host || '').trim()}:${Number(entry.port) || 0}`;
    }

    function buildCheckoutConversionFixedProxyConfig(entry = null) {
      if (!entry?.host || !entry?.port) {
        return null;
      }
      const scheme = String(entry.protocol || '').trim().toLowerCase();
      return {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: scheme === 'socks5h' ? 'socks5' : scheme,
            host: entry.host,
            port: entry.port,
          },
          bypassList: CHECKOUT_CONVERSION_PROXY_BYPASS_LIST.slice(),
        },
      };
    }

    function validateCheckoutProxyControlAfterApply(details = {}, entry = null) {
      const level = String(details?.levelOfControl || '').trim();
      if (level && level !== 'controlled_by_this_extension') {
        return {
          ok: false,
          message: `代理控制权不在当前扩展（levelOfControl=${level || 'unknown'}）`,
        };
      }

      const mode = String(details?.value?.mode || '').trim().toLowerCase();
      if (mode !== 'fixed_servers') {
        return {
          ok: false,
          message: `代理模式不是 fixed_servers（当前为 ${mode || 'unknown'}）`,
        };
      }

      const singleProxy = details?.value?.rules?.singleProxy || null;
      const appliedHost = String(singleProxy?.host || '').trim().toLowerCase();
      const appliedPort = Number.parseInt(String(singleProxy?.port || ''), 10) || 0;
      const expectedHost = String(entry?.host || '').trim().toLowerCase();
      const expectedPort = Number.parseInt(String(entry?.port || ''), 10) || 0;
      if (!appliedHost || !appliedPort || appliedHost !== expectedHost || appliedPort !== expectedPort) {
        return {
          ok: false,
          message: `fixed_servers 未绑定到当前代理节点 ${expectedHost}:${expectedPort}，疑似被其他代理配置覆盖`,
        };
      }

      return { ok: true };
    }

    function getCheckoutProxySettings(details = { incognito: false }) {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.get !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.get(details, (value) => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '读取浏览器代理配置失败。'));
            return;
          }
          resolve(value || {});
        });
      });
    }

    function setCheckoutProxySettings(value) {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.set !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.set({
          value,
          scope: CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE,
        }, () => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '写入浏览器代理配置失败。'));
            return;
          }
          resolve();
        });
      });
    }

    function clearCheckoutProxySettings() {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.clear !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.clear({
          scope: CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE,
        }, () => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '清理浏览器代理配置失败。'));
            return;
          }
          resolve();
        });
      });
    }

    async function defaultApplyCheckoutScopedProxyFromUrl(proxyUrl) {
      const entry = parseCheckoutConversionProxyUrl(proxyUrl);
      if (!entry) {
        return null;
      }

      const previousProxySettings = await getCheckoutProxySettings({ incognito: false }).catch(() => ({}));
      const previousAuthEntry = typeof getCurrentIpProxyAuthEntry === 'function'
        ? (getCurrentIpProxyAuthEntry() || null)
        : null;
      const fixedProxyConfig = buildCheckoutConversionFixedProxyConfig(entry);
      if (!fixedProxyConfig) {
        throw new Error('支付转换代理配置不完整，无法生成 fixed_servers 规则。');
      }

      try {
        if (typeof installIpProxyAuthListener === 'function') {
          installIpProxyAuthListener();
        }
        if (typeof installIpProxyErrorListener === 'function') {
          installIpProxyErrorListener();
        }
        if (typeof setCurrentIpProxyAuthEntry === 'function') {
          setCurrentIpProxyAuthEntry(entry.username
            ? {
                host: entry.host,
                port: entry.port,
                username: entry.username,
                password: String(entry.password || ''),
              }
            : null);
        }
        await setCheckoutProxySettings(fixedProxyConfig);
        const appliedSettings = await getCheckoutProxySettings({ incognito: false }).catch(() => null);
        const takeoverCheck = validateCheckoutProxyControlAfterApply(appliedSettings || {}, entry);
        if (!takeoverCheck?.ok) {
          throw new Error(takeoverCheck.message || '支付转换代理接管校验失败。');
        }
      } catch (error) {
        if (typeof setCurrentIpProxyAuthEntry === 'function') {
          setCurrentIpProxyAuthEntry(previousAuthEntry ? { ...previousAuthEntry } : null);
        }
        try {
          const restoreValue = previousProxySettings?.value;
          if (restoreValue && restoreValue.mode) {
            await setCheckoutProxySettings(restoreValue);
          } else {
            await clearCheckoutProxySettings();
          }
        } catch {
          // Ignore restore failures here and surface the original apply error.
        }
        throw error;
      }

      return {
        applied: true,
        entry,
        displayName: describeCheckoutConversionProxyEntry(entry),
        previousProxySettings,
        previousAuthEntry,
      };
    }

    async function defaultRestoreCheckoutScopedProxySnapshot(snapshot = null) {
      if (!snapshot?.applied) {
        return;
      }
      if (typeof setCurrentIpProxyAuthEntry === 'function') {
        setCurrentIpProxyAuthEntry(snapshot.previousAuthEntry ? { ...snapshot.previousAuthEntry } : null);
      }
      const restoreValue = snapshot?.previousProxySettings?.value;
      if (restoreValue && restoreValue.mode) {
        await setCheckoutProxySettings(restoreValue);
        return;
      }
      await clearCheckoutProxySettings();
    }

    function summarizeCheckoutConversionProxyDiagnostics(items = [], maxItems = 3) {
      const normalizedItems = Array.isArray(items)
        ? Array.from(new Set(items.map((item) => String(item || '').trim()).filter(Boolean)))
        : [];
      if (!normalizedItems.length) {
        return '';
      }
      if (typeof buildProbeDiagnosticsSummary === 'function') {
        return buildProbeDiagnosticsSummary(normalizedItems, maxItems);
      }
      return normalizedItems.slice(0, Math.max(1, Number(maxItems) || 3)).join(' | ');
    }

    async function testCheckoutConversionProxy(options = {}) {
      const proxyUrl = normalizeCheckoutConversionProxyUrl(options?.proxyUrl);
      if (!proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }

      const parsedEntry = parseCheckoutConversionProxyUrl(proxyUrl);
      const applyProxy = typeof applyCheckoutScopedProxyFromUrl === 'function'
        ? applyCheckoutScopedProxyFromUrl
        : defaultApplyCheckoutScopedProxyFromUrl;
      const restoreProxy = typeof restoreCheckoutScopedProxySnapshot === 'function'
        ? restoreCheckoutScopedProxySnapshot
        : defaultRestoreCheckoutScopedProxySnapshot;
      const probeDiagnostics = [];
      const targetDiagnostics = [];
      let snapshot = null;

      try {
        snapshot = await applyProxy(proxyUrl, {
          targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
        });

        let exit = null;
        if (typeof detectProxyExitInfoByPageContext === 'function') {
          exit = await detectProxyExitInfoByPageContext({
            timeoutMs: 12000,
            errors: probeDiagnostics,
            probeEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS,
          }).catch((error) => {
            probeDiagnostics.push(`probe:page_context:${error?.message || error}`);
            return { ip: '', region: '', source: 'page_context_unavailable', endpoint: '' };
          });
        }
        if (!exit?.ip && typeof detectProxyExitInfoByBackgroundFetch === 'function') {
          exit = await detectProxyExitInfoByBackgroundFetch({
            timeoutMs: 12000,
            errors: probeDiagnostics,
            probeEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS,
          }).catch((error) => {
            probeDiagnostics.push(`probe:background:${error?.message || error}`);
            return exit || { ip: '', region: '', source: 'background_unavailable', endpoint: '' };
          });
        }

        const exitIp = String(exit?.ip || '').trim();
        const exitRegion = String(exit?.region || '').trim();
        if (!exitIp) {
          const diagnostics = summarizeCheckoutConversionProxyDiagnostics(probeDiagnostics, 4);
          throw new Error(diagnostics
            ? `未检测到代理出口 IP。诊断：${diagnostics}`
            : '未检测到代理出口 IP。');
        }

        let reachability = { reachable: true, skipped: true, endpoint: '', source: '' };
        if (typeof detectIpProxyTargetReachabilityByPageContext === 'function') {
          reachability = await detectIpProxyTargetReachabilityByPageContext({
            timeoutMs: 12000,
            errors: targetDiagnostics,
            targetReachabilityEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS,
          }).catch((error) => {
            targetDiagnostics.push(`target:${error?.message || error}`);
            return {
              reachable: false,
              endpoint: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS[0],
              source: 'target_page_context',
              error: error?.message || String(error || '目标站点连通性检测失败'),
            };
          });
        }

        if (reachability?.reachable === false && reachability?.skipped !== true) {
          const failureMessage = typeof buildTargetReachabilityFailureMessage === 'function'
            ? buildTargetReachabilityFailureMessage({
              exitIp,
              exitRegion,
            }, reachability)
            : `已检测到出口 IP ${exitIp}${exitRegion ? ` [${exitRegion}]` : ''}，但 chatgpt.com 不可达。`;
          throw new Error(failureMessage);
        }

        return {
          ok: true,
          proxyDisplayName: describeCheckoutConversionProxyEntry(parsedEntry),
          exitIp,
          exitRegion,
          exitSource: String(exit?.source || '').trim(),
          exitEndpoint: String(exit?.endpoint || '').trim(),
          targetEndpoint: String(reachability?.endpoint || CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS[0] || '').trim(),
          diagnostics: summarizeCheckoutConversionProxyDiagnostics([
            ...probeDiagnostics,
            ...targetDiagnostics,
          ], 4),
        };
      } finally {
        if (snapshot?.applied) {
          await restoreProxy(snapshot).catch(() => {});
        }
      }
    }

    async function maybeApplyCheckoutConversionProxy(state = {}) {
      const proxyUrl = normalizeCheckoutConversionProxyUrl(state?.plusCheckoutConversionProxyUrl);
      if (!proxyUrl) {
        return null;
      }
      const applyProxy = typeof applyCheckoutScopedProxyFromUrl === 'function'
        ? applyCheckoutScopedProxyFromUrl
        : defaultApplyCheckoutScopedProxyFromUrl;
      const snapshot = await applyProxy(proxyUrl, {
        targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
      });
      const displayName = String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim();
      await addLog(`步骤 6：已启用支付转换代理 ${displayName}，仅临时接管支付创建/转换链路。`, 'info');
      return snapshot;
    }

    async function maybeRestoreCheckoutConversionProxy(snapshot = null) {
      if (!snapshot?.applied) {
        return;
      }
      const restoreProxy = typeof restoreCheckoutScopedProxySnapshot === 'function'
        ? restoreCheckoutScopedProxySnapshot
        : defaultRestoreCheckoutScopedProxySnapshot;
      await restoreProxy(snapshot);
      await addLog('步骤 6：支付转换代理已释放，后续步骤恢复原网络/原代理环境。', 'info');
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

    function isHostedOpenAiCheckoutUrl(url = '') {
      return /^https:\/\/(?:pay\.openai\.com|checkout\.stripe\.com)\/c\/pay(?:\/|$)/i.test(String(url || ''));
    }

    function isHostedCheckoutRuntimeUrl(url = '') {
      return isHostedOpenAiCheckoutUrl(url) || isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url);
    }

    function getHostedStepNumber(stepKey = '') {
      return PAYPAL_HOSTED_STEP_META[stepKey]?.step || 6;
    }

    function normalizeHostedPhoneForPayload(phone = '') {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) {
        return HOSTED_CHECKOUT_DEFAULT_PHONE;
      }
      if (digits.length > 10 && digits.startsWith('1')) {
        return digits.slice(-10);
      }
      return digits.length > 10 ? digits.slice(-10) : digits;
    }

    function getHostedProfileFromState(state = {}) {
      const profile = state?.plusHostedCheckoutGuestProfile || state?.hostedCheckoutGuestProfile || null;
      return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : null;
    }

    async function getLatestHostedState(state = {}) {
      const latestState = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      return {
        ...(latestState && typeof latestState === 'object' ? latestState : {}),
        ...(state && typeof state === 'object' ? state : {}),
      };
    }

    async function ensureHostedGuestProfile(state = {}) {
      const mergedState = await getLatestHostedState(state);
      const existingProfile = getHostedProfileFromState(mergedState) || {};
      const config = await getHostedCheckoutRuntimeConfig(mergedState);
      const address = existingProfile.address && typeof existingProfile.address === 'object'
        ? existingProfile.address
        : await fetchHostedCheckoutAddress();
      const generatedProfile = buildHostedGuestProfile(address, {
        phone: normalizeHostedPhoneForPayload(config.phone),
      });
      const nextProfile = {
        ...generatedProfile,
        ...existingProfile,
        address,
        phone: normalizeHostedPhoneForPayload(config.phone || existingProfile.phone),
      };
      await setState({
        plusHostedCheckoutGuestProfile: nextProfile,
        plusHostedCheckoutPhoneDigits: nextProfile.phone,
      });
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

    async function completeHostedStepIfSuccessful(stepKey, tabId, state = {}, options = {}) {
      const currentUrl = await getHostedCurrentUrl(tabId);
      if (!isHostedCheckoutSuccessUrl(currentUrl)) {
        return false;
      }
      const config = await getHostedCheckoutRuntimeConfig(state);
      const shouldWait = Boolean(options.waitBeforeComplete);
      if (shouldWait && config.oauthDelaySeconds > 0) {
        await addHostedStepLog(stepKey, `步骤 ${getHostedStepNumber(stepKey)}：支付成功后等待 ${config.oauthDelaySeconds} 秒，再继续账号接入。`, 'info');
        await sleepWithStop(config.oauthDelaySeconds * 1000);
      }
      await completeHostedStep(stepKey, tabId, {
        plusReturnUrl: currentUrl,
        plusHostedCheckoutCompleted: true,
        plusHostedCheckoutOauthDelaySeconds: config.oauthDelaySeconds,
      });
      return true;
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

    async function getHostedCheckoutRuntimeConfig(state = {}) {
      const latestState = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      return {
        verificationUrl: String(
          latestState?.hostedCheckoutVerificationUrl
          || state?.hostedCheckoutVerificationUrl
          || ''
        ).trim(),
        phone: String(
          latestState?.hostedCheckoutPhoneNumber
          || state?.hostedCheckoutPhoneNumber
          || HOSTED_CHECKOUT_DEFAULT_PHONE
        ).trim(),
        oauthDelaySeconds: normalizeHostedCheckoutDelaySeconds(
          latestState?.plusHostedCheckoutOauthDelaySeconds
          ?? state?.plusHostedCheckoutOauthDelaySeconds
        ),
      };
    }

    function normalizeHostedCheckoutDelaySeconds(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return 3;
      }
      return Math.min(120, Math.max(0, Math.floor(numeric)));
    }

    async function fetchHostedCheckoutAddress() {
      const { response, data } = await fetchJsonWithTimeout(HOSTED_CHECKOUT_ADDRESS_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/', method: 'address' }),
      }, 30000);
      if (!response?.ok) {
        throw new Error(`获取无卡直绑地址失败（HTTP ${response?.status || 0}）。`);
      }
      const address = data?.address || data || {};
      return {
        street: String(address.Address || address.street || '123 Main St').trim(),
        city: String(address.City || address.city || 'New York').trim(),
        state: String(address.State_Full || address.State || address.state || 'New York').trim(),
        zip: String(address.Zip_Code || address.zip || '10001').trim().slice(0, 5) || '10001',
      };
    }

    function buildRandomHostedEmail() {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let localPart = '';
      for (let index = 0; index < 16; index += 1) {
        localPart += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return `${localPart}@gmail.com`;
    }

    function buildRandomHostedPassword() {
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^';
      let value = 'Aa1!';
      while (value.length < 14) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return value;
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

    function buildHostedGuestProfile(address = {}, config = {}) {
      const card = buildHostedVisaCard();
      return {
        email: buildRandomHostedEmail(),
        password: buildRandomHostedPassword(),
        phone: String(config?.phone || HOSTED_CHECKOUT_DEFAULT_PHONE).trim(),
        firstName: 'James',
        lastName: 'Smith',
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        address,
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
      let payload = text;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = text;
      }
      const code = extractHostedVerificationCode(payload);
      if (!code) {
        throw new Error('验证码接口暂未返回有效 6 位验证码。');
      }
      return code;
    }

    async function fetchHostedCheckoutVerificationCodeManually(options = {}) {
      const manualVerificationUrl = String(options?.verificationUrl || '').trim();
      if (manualVerificationUrl) {
        return {
          code: await fetchHostedVerificationCode(manualVerificationUrl),
          verificationUrl: manualVerificationUrl,
        };
      }
      const runtimeConfig = await getHostedCheckoutRuntimeConfig(options?.state || {});
      return {
        code: await fetchHostedVerificationCode(runtimeConfig.verificationUrl),
        verificationUrl: String(runtimeConfig.verificationUrl || '').trim(),
      };
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
          await addLog(`步骤 6：OpenAI Checkout 验证码暂不可用（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}）：${error?.message || error}`, 'warn');
          if (attempt < HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS) {
            await sleepWithStop(HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS);
          }
        }
      }
      throw lastError || new Error('OpenAI Checkout 验证码轮询失败。');
    }

    async function runHostedOpenAiCheckout(tabId, profile, config) {
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        logMessage: '步骤 6：正在等待 OpenAI hosted checkout 脚本就绪...',
      });
      const firstResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'RUN_PAYPAL_HOSTED_OPENAI_CHECKOUT_STEP',
        source: 'background',
        payload: { address: profile.address },
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
        if (pageState?.hostedVerificationVisible && !verificationSubmitted) {
          const verificationCode = await pollHostedVerificationCode(config.verificationUrl);
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

    async function getHostedPayPalState(tabId) {
      await waitForTabCompleteUntilStopped(tabId);
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        logMessage: '步骤 6：正在等待 PayPal 无卡直绑页面脚本就绪...',
      });
      const result = await sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
        type: 'PAYPAL_HOSTED_GET_STATE',
        source: 'background',
        payload: {},
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      const pageState = result || {};
      if (isHostedCheckoutGenericErrorState(pageState)) {
        await requestHostedCheckoutGenericErrorChoice(tabId, pageState);
      }
      return pageState;
    }

    async function runHostedPayPalStep(tabId, payload = {}) {
      await waitForTabCompleteUntilStopped(tabId);
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        logMessage: '步骤 6：正在等待 PayPal 无卡直绑页面脚本就绪...',
      });
      const result = await sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
        type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
        source: 'background',
        payload,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      const stepResult = result || {};
      if (isHostedCheckoutGenericErrorState(stepResult)) {
        await requestHostedCheckoutGenericErrorChoice(tabId, stepResult);
      }
      return stepResult;
    }

    function buildHostedVerificationResendLimitError() {
      return new Error(
        `${HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX}PayPal 验证码自动 Resend 重试已达到上限，请尝试在页面手动获取验证码并填入。`
      );
    }

    function isHostedCheckoutGenericErrorState(pageState = {}) {
      return pageState?.hostedStage === PAYPAL_HOSTED_STAGE_GENERIC_ERROR
        || pageState?.hostedGenericError === true;
    }

    function isHostedCheckoutGenericError(error) {
      return new RegExp(HOSTED_CHECKOUT_GENERIC_ERROR_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        .test(String(error?.message || error || ''));
    }

    async function requestHostedCheckoutGenericErrorChoice(tabId, pageState = {}) {
      const requestId = `paypal-hosted-generic-error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const pageMessage = String(pageState?.hostedGenericErrorMessage || '').trim()
        || 'Things don\'t appear to be working at the moment.';
      const latestState = typeof getState === 'function'
        ? await getState().catch(() => ({}))
        : {};
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
      const { profile, config } = await ensureHostedGuestProfile(state);
      if (pageState?.hostedVerificationInvalidCode) {
        if (context.resendAttempts >= HOSTED_CHECKOUT_VERIFICATION_RESEND_MAX_ATTEMPTS) {
          const error = buildHostedVerificationResendLimitError();
          await addHostedStepLog(stepKey, error.message.replace(HOSTED_CHECKOUT_VERIFICATION_RESEND_LIMIT_PREFIX, ''), 'error');
          throw error;
        }
        await resendHostedPayPalVerificationCodeAndRefill(tabId, profile, config.verificationUrl, context, stepKey);
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
      await refillHostedPayPalVerificationCode(tabId, profile, config.verificationUrl);
      context.verificationSubmitted = true;
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
          pageState = await getHostedPayPalState(tabId);
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
        label,
        timeoutMs: options.timeoutMs || HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS,
        intervalMs: options.intervalMs || 500,
      }).then(
        (nextState) => ({ type: 'stage-change', nextState }),
        (error) => ({ type: 'stage-error', error })
      );
      const actionPromise = runHostedPayPalStep(tabId, payload).then(
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
        const { profile, config } = await ensureHostedGuestProfile(state);
        await addLog(`步骤 6：正在提交 OpenAI Checkout，等待跳转到 PayPal 邮箱页（电话使用本地号码 ${profile.phone}）。`, 'info');
        completedUrl = String(await runHostedOpenAiCheckout(tabId, profile, config) || await getHostedCurrentUrl(tabId) || '').trim();
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

      const { profile, config } = await ensureHostedGuestProfile(state);
      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在选择 PayPal 并提交 OpenAI hosted checkout（电话使用本地号码 ${profile.phone}）。`, 'info');
      const transitionUrl = await runHostedOpenAiCheckout(tabId, profile, config);
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
      const { profile } = await ensureHostedGuestProfile(state);
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 邮箱页` }
      );
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }

      const pageState = await getHostedPayPalState(tabId);
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
      const { nextState, completedByStageChange } = await runHostedPayPalStepAndWaitForStageChange(tabId, {
        expectedStage: PAYPAL_HOSTED_STAGE_LOGIN,
        email: profile.email,
      }, PAYPAL_HOSTED_STAGE_LOGIN, { label: `步骤 ${stepNumber}：等待 PayPal 邮箱页跳转` });
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
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      const verificationContext = createHostedVerificationRetryContext();
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }
      await waitForHostedUrlAfterAction(
        tabId,
        (url) => isPayPalUrl(url) || isHostedCheckoutSuccessUrl(url),
        { label: `步骤 ${stepNumber}：等待 PayPal 资料页` }
      );
      if (await completeHostedStepIfSuccessful(stepKey, tabId, state)) {
        return;
      }

      const pageState = await getHostedPayPalState(tabId);
      if ((await handleHostedPayPalVerificationState(tabId, pageState, state, verificationContext, stepKey)).handled) {
        const nextState = await waitForHostedPayPalStage(
          tabId,
          async (stateInfo) => {
            if ((await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey)).handled) {
              return false;
            }
            return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_VERIFICATION;
          },
          { label: `步骤 ${stepNumber}：等待 PayPal 验证码页跳转` }
        );
        await completeHostedStep(stepKey, tabId, {
          plusHostedCheckoutLastStage: nextState.hostedStage || '',
        });
        return;
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

      const { profile } = await ensureHostedGuestProfile(state);
      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在填写 PayPal 无卡直绑资料，提交前会复查电话是否为 ${profile.phone}。`, 'info');
      const cardResult = await runHostedPayPalStep(tabId, {
        ...profile,
        expectedStage: PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT,
        phone: profile.phone,
      });
      if (cardResult?.phoneMatched) {
        await addHostedStepLog(
          stepKey,
          `步骤 ${stepNumber}：PayPal 页面电话复查通过（配置 ${cardResult.payloadPhoneDigits}，页面 ${cardResult.renderedPhoneDigits}）。`,
          'info'
        );
      }
      const nextState = await waitForHostedPayPalStage(
        tabId,
        async (stateInfo) => {
          if ((await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey)).handled) {
            return false;
          }
          return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_GUEST_CHECKOUT;
        },
        { label: `步骤 ${stepNumber}：等待 PayPal 资料页跳转` }
      );
      await completeHostedStep(stepKey, tabId, {
        plusHostedCheckoutLastStage: nextState.hostedStage || '',
      });
    }

    async function executePayPalHostedCreateAccount(state = {}) {
      const stepKey = PAYPAL_HOSTED_STEP_CREATE_ACCOUNT;
      const stepNumber = getHostedStepNumber(stepKey);
      const tabId = await resolveHostedCheckoutTabId(state, stepKey);
      const verificationContext = createHostedVerificationRetryContext();
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

      const pageState = await getHostedPayPalState(tabId);
      if ((await handleHostedPayPalVerificationState(tabId, pageState, state, verificationContext, stepKey)).handled) {
        const nextState = await waitForHostedPayPalStage(
          tabId,
          async (stateInfo) => {
            if ((await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey)).handled) {
              return false;
            }
            return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_VERIFICATION;
          },
          { label: `步骤 ${stepNumber}：等待 PayPal 验证码页跳转` }
        );
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
      });
      const nextState = await waitForHostedPayPalStage(
        tabId,
        async (stateInfo) => {
          if ((await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey)).handled) {
            return false;
          }
          return stateInfo?.hostedStage && stateInfo.hostedStage !== PAYPAL_HOSTED_STAGE_CREATE_ACCOUNT;
        },
        { label: `步骤 ${stepNumber}：等待 PayPal 创建确认页跳转` }
      );
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

      const pageState = await getHostedPayPalState(tabId);
      if ((await handleHostedPayPalVerificationState(tabId, pageState, state, verificationContext, stepKey)).handled) {
        await waitForHostedUrlAfterAction(
          tabId,
          (url) => isHostedCheckoutSuccessUrl(url),
          { label: `步骤 ${stepNumber}：等待 PayPal 验证码后回到 ChatGPT 支付成功页`, timeoutMs: HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS }
        );
        if (!await completeHostedStepIfSuccessful(stepKey, tabId, state, { waitBeforeComplete: true })) {
          throw new Error(`步骤 ${stepNumber}：PayPal 验证码提交后未检测到 ChatGPT 支付成功页。`);
        }
        return;
      }
      if (pageState.hostedStage !== PAYPAL_HOSTED_STAGE_REVIEW) {
        throw new Error(`步骤 ${stepNumber}：当前不是 PayPal 授权复核页（当前状态：${pageState.hostedStage || PAYPAL_HOSTED_STAGE_UNKNOWN}）。`);
      }

      await addHostedStepLog(stepKey, `步骤 ${stepNumber}：正在确认 PayPal 授权复核页。`, 'info');
      await runHostedPayPalStep(tabId, {
        expectedStage: PAYPAL_HOSTED_STAGE_REVIEW,
      });
      await waitForHostedPayPalStage(
        tabId,
        async (stateInfo) => {
          if ((await handleHostedPayPalVerificationState(tabId, stateInfo, state, verificationContext, stepKey)).handled) {
            return false;
          }
          return Boolean(stateInfo?.successUrl || stateInfo?.hostedStage === PAYPAL_HOSTED_STAGE_OUTSIDE);
        },
        { label: `步骤 ${stepNumber}：等待 PayPal 回到 ChatGPT 支付成功页`, timeoutMs: HOSTED_CHECKOUT_PAYPAL_TIMEOUT_MS }
      );
      if (!await completeHostedStepIfSuccessful(stepKey, tabId, state, { waitBeforeComplete: true })) {
        throw new Error(`步骤 ${stepNumber}：PayPal 授权后未检测到 ChatGPT 支付成功页。`);
      }
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

    async function readAccessTokenFromChatGptSessionTab(tabId) {
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
      return String(sessionResult?.accessToken || sessionResult?.session?.accessToken || '').trim();
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
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
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

    async function executePlusCheckoutCreate(state = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      const useHostedCheckoutFinalStep = isHostedCheckoutFinalStepEnabled(state);
      let checkoutScopedProxySnapshot = null;
      try {
        checkoutScopedProxySnapshot = await maybeApplyCheckoutConversionProxy(state);
        if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
          await executeGpcCheckoutCreate(state);
          return;
        }

        const paymentMethodLabel = getPlusPaymentMethodLabel(paymentMethod);
        const checkoutModeLabel = getCheckoutModeLabel(state);
        await addLog(`步骤 6：正在打开新的 ChatGPT 会话，准备创建${checkoutModeLabel}...`, 'info');
        const tabId = await openFreshChatGptTabForCheckoutCreate();

        await waitForTabCompleteUntilStopped(tabId);
        await sleepWithStop(1000);
        await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
          inject: PLUS_CHECKOUT_INJECT_FILES,
          injectSource: PLUS_CHECKOUT_SOURCE,
          logMessage: '步骤 6：正在等待 ChatGPT 页面完成加载，再继续创建订阅页...',
        });

        const result = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
          type: 'CREATE_PLUS_CHECKOUT',
          source: 'background',
          payload: {
            paymentMethod,
            hostedCheckoutFinalStep: useHostedCheckoutFinalStep,
          },
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        const targetCheckoutUrl = resolveCheckoutTargetUrl(result, paymentMethod, {
          useHostedCheckoutFinalStep,
        });
        if (!targetCheckoutUrl) {
          throw new Error(`步骤 6：${checkoutModeLabel}未返回可用的订阅链接。`);
        }

        if (useHostedCheckoutFinalStep) {
          await executeHostedCheckoutCreate(tabId, state, result);
          return;
        }

        await addLog(`步骤 6：${checkoutModeLabel}已创建，正在打开订阅页面...`, 'ok');
        await chrome.tabs.update(tabId, { url: targetCheckoutUrl, active: true });
        await waitForTabCompleteUntilStopped(tabId);
        await sleepWithStop(1000);
        await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
          inject: PLUS_CHECKOUT_INJECT_FILES,
          injectSource: PLUS_CHECKOUT_SOURCE,
          logMessage: '步骤 6：正在等待订阅页面完成加载...',
        });

        await setState({
          plusCheckoutTabId: tabId,
          plusCheckoutUrl: targetCheckoutUrl,
          plusCheckoutCountry: result.country || 'DE',
          plusCheckoutCurrency: result.currency || 'EUR',
          plusCheckoutSource: '',
        });

        await addLog(`步骤 6：Plus Checkout 页面已就绪（${paymentMethodLabel} / ${result.country || 'DE'} ${result.currency || 'EUR'}），准备继续下一步。`, 'info');

        await completeNodeFromBackground('plus-checkout-create', {
          plusCheckoutCountry: result.country || 'DE',
          plusCheckoutCurrency: result.currency || 'EUR',
        });
      } finally {
        if (checkoutScopedProxySnapshot?.applied) {
          try {
            await maybeRestoreCheckoutConversionProxy(checkoutScopedProxySnapshot);
          } catch (restoreError) {
            await addLog(`步骤 6：支付转换代理释放失败：${restoreError?.message || String(restoreError || '未知错误')}`, 'warn');
          }
        }
      }
    }

    return {
      executePlusCheckoutCreate,
      executePayPalHostedOpenAiCheckout,
      executePayPalHostedEmail,
      executePayPalHostedCard,
      executePayPalHostedCreateAccount,
      executePayPalHostedReview,
      fetchHostedCheckoutVerificationCodeManually,
      testCheckoutConversionProxy,
    };
  }

  return {
    createPlusCheckoutCreateExecutor,
  };
});
