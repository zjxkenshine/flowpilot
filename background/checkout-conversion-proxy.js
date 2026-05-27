(function attachBackgroundCheckoutConversionProxy(root, factory) {
  root.MultiPageBackgroundCheckoutConversionProxy = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundCheckoutConversionProxyModule() {
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
  const CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL = 'MULTIPAGE_CHECKOUT_CONVERSION_DIRECT_V1';
  const CHECKOUT_CONVERSION_PROXY_SESSION_KEY = 'plusCheckoutConversionProxySession';
  const CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY = 'plusCheckoutConversionProxyManualSession';
  const CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY = 'plusCheckoutConversionProxyExitCheck';

  function createCheckoutConversionProxyManager(deps = {}) {
    const {
      chrome,
      getState = null,
      setState = async () => {},
      addLog = async () => {},
      broadcastDataUpdate = null,
      detectProxyExitInfoByPageContext = null,
      detectProxyExitInfoByBackgroundFetch = null,
      detectIpProxyTargetReachabilityByPageContext = null,
      buildProbeDiagnosticsSummary = null,
      buildTargetReachabilityFailureMessage = null,
      installIpProxyAuthListener = null,
      installIpProxyErrorListener = null,
      getCurrentIpProxyAuthEntry = null,
      setCurrentIpProxyAuthEntry = null,
      normalizeIpProxyServiceProfiles = null,
      buildIpProxyServiceProfileFromState = null,
      normalizeIpProxyServiceProfile = null,
      pullIpProxyPoolFromApi = null,
      validate711ProxyApiConfig = null,
      build711ProxyApiUrl = null,
      normalizeIpProxyCountryCode = null,
    } = deps;

    function normalizeCheckoutConversionProxyUrl(value = '') {
      return String(value || '').trim();
    }

    function normalizeCheckoutConversionProxySource(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      return 'manual';
    }

    function normalizeCheckoutConversionProxy711Region(value = '') {
      if (typeof normalizeIpProxyCountryCode === 'function') {
        return normalizeIpProxyCountryCode(value);
      }
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      return /^[A-Z]{2}$/.test(normalized) ? normalized : '';
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

    function buildCheckoutConversionProxyUrlFromEntry(entry = null) {
      if (!entry || typeof entry !== 'object') {
        return '';
      }
      const protocol = normalizeCheckoutConversionProxyProtocol(entry.protocol);
      const host = String(entry.host || '').trim();
      const port = normalizeCheckoutConversionProxyPort(entry.port);
      if (!protocol || !host || !port) {
        return '';
      }
      const username = String(entry.username || '');
      const password = String(entry.password || '');
      const auth = username || password
        ? `${encodeURIComponent(username)}${password ? `:${encodeURIComponent(password)}` : ''}@`
        : '';
      return `${protocol}://${auth}${host}:${port}`;
    }

    function escapePacStringLiteral(value = '') {
      return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
    }

    function buildCheckoutConversionProxyPatternArrayLiteral(patterns = []) {
      return (Array.isArray(patterns) ? patterns : [])
        .map((pattern) => `"${escapePacStringLiteral(String(pattern || '').trim())}"`)
        .join(', ');
    }

    function buildPacMatchFunctionSource(functionName = 'matchesPatternList') {
      return `
function ${functionName}(host, patterns) {
  if (!host || !patterns || !patterns.length) return false;
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];
    if (!pattern) continue;
    if (pattern.indexOf('*.') === 0) {
      var suffix = pattern.substring(1);
      var directHost = pattern.substring(2);
      if (dnsDomainIs(host, suffix) || host === directHost) {
        return true;
      }
      continue;
    }
    if (host === pattern || dnsDomainIs(host, '.' + pattern)) {
      return true;
    }
  }
  return false;
}`.trim();
    }

    function buildCheckoutConversionPacProxyEndpoint(entry = null) {
      if (!entry?.host || !entry?.port) {
        return '';
      }
      const protocol = normalizeCheckoutConversionProxyProtocol(entry.protocol);
      if (!protocol) {
        return '';
      }
      return `${protocol.toUpperCase()} ${String(entry.host || '').trim()}:${Number(entry.port) || 0}`;
    }

    function buildCheckoutConversionDirectPacScript(previousProxySettings = {}, options = {}) {
      const previousValue = previousProxySettings?.value || {};
      const previousMode = String(previousValue?.mode || '').trim().toLowerCase();
      const directTargetHostPatterns = Array.isArray(options?.targetHostPatterns) && options.targetHostPatterns.length
        ? options.targetHostPatterns
        : CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS;
      const directTargetHostPatternsLiteral = buildCheckoutConversionProxyPatternArrayLiteral(directTargetHostPatterns);
      const bypassListLiteral = buildCheckoutConversionProxyPatternArrayLiteral(CHECKOUT_CONVERSION_PROXY_BYPASS_LIST);
      const sentinel = escapePacStringLiteral(CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL);
      if (!previousMode || previousMode === 'direct') {
        return `
var ${CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL} = true;
${buildPacMatchFunctionSource()}
function FindProxyForURL(url, host) {
  if (!host) return "DIRECT";
  var directTargets = [${directTargetHostPatternsLiteral}];
  if (matchesPatternList(host, directTargets)) {
    return "DIRECT";
  }
  return "DIRECT";
}`.trim();
      }
      if (previousMode === 'pac_script') {
        const previousPacData = String(previousValue?.pacScript?.data || '').trim();
        if (!previousPacData) {
          throw new Error('当前 PAC 代理缺少内联脚本数据，无法为支付转换无代理模式叠加直连规则。');
        }
        return `
var ${CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL} = true;
${previousPacData}
var __mpOriginalCheckoutFindProxyForURL = typeof FindProxyForURL === "function" ? FindProxyForURL : null;
${buildPacMatchFunctionSource()}
function FindProxyForURL(url, host) {
  if (!host) return "DIRECT";
  var directTargets = [${directTargetHostPatternsLiteral}];
  if (matchesPatternList(host, directTargets)) {
    return "DIRECT";
  }
  if (typeof __mpOriginalCheckoutFindProxyForURL === "function") {
    return __mpOriginalCheckoutFindProxyForURL(url, host);
  }
  return "DIRECT";
}`.trim();
      }
      if (previousMode === 'fixed_servers') {
        const singleProxy = previousValue?.rules?.singleProxy || null;
        const proxyEndpoint = buildCheckoutConversionPacProxyEndpoint({
          protocol: singleProxy?.scheme,
          host: singleProxy?.host,
          port: singleProxy?.port,
        });
        if (!proxyEndpoint) {
          throw new Error('当前 fixed_servers 代理缺少 singleProxy，无法为支付转换无代理模式生成委托路由。');
        }
        return `
var ${CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL} = true;
${buildPacMatchFunctionSource()}
function FindProxyForURL(url, host) {
  if (!host) return "DIRECT";
  var bypassList = [${bypassListLiteral}];
  if (matchesPatternList(host, bypassList)) {
    return "DIRECT";
  }
  var directTargets = [${directTargetHostPatternsLiteral}];
  if (matchesPatternList(host, directTargets)) {
    return "DIRECT";
  }
  return "${escapePacStringLiteral(proxyEndpoint)}";
}`.trim();
      }
      if (previousMode === 'system') {
        throw new Error('当前浏览器代理模式为 system，支付转换无代理模式不支持在系统代理之上叠加直连规则。');
      }
      if (previousMode === 'auto_detect') {
        throw new Error('当前浏览器代理模式为 auto_detect，支付转换无代理模式不支持在自动探测代理之上叠加直连规则。');
      }
      if (previousMode === 'fixed_servers') {
        throw new Error('当前 fixed_servers 代理配置不完整，支付转换无代理模式无法继续。');
      }
      throw new Error(`当前浏览器代理模式 ${previousMode || 'unknown'} 暂不支持支付转换无代理模式。`);
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
          message: `代理控制权不在当前扩展（levelOfControl=${level || 'unknown'}）。`,
        };
      }

      const mode = String(details?.value?.mode || '').trim().toLowerCase();
      if (mode !== 'fixed_servers') {
        return {
          ok: false,
          message: `代理模式不是 fixed_servers（当前为 ${mode || 'unknown'}）。`,
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

    function validateCheckoutDirectControlAfterApply(details = {}) {
      const level = String(details?.levelOfControl || '').trim();
      if (level && level !== 'controlled_by_this_extension') {
        return {
          ok: false,
          message: `代理控制权不在当前扩展（levelOfControl=${level || 'unknown'}）。`,
        };
      }
      const mode = String(details?.value?.mode || '').trim().toLowerCase();
      if (mode !== 'pac_script') {
        return {
          ok: false,
          message: `无代理模式未写入 pac_script（当前为 ${mode || 'unknown'}）。`,
        };
      }
      const pacData = String(details?.value?.pacScript?.data || '').trim();
      if (!pacData || !pacData.includes(CHECKOUT_CONVERSION_PROXY_DIRECT_PAC_SENTINEL)) {
        return {
          ok: false,
          message: '无代理模式 PAC 校验失败，未检测到预期的直连覆盖标记。',
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

    async function restoreCheckoutProxySettingsFromSnapshot(previousProxySettings = {}) {
      const restoreValue = previousProxySettings?.value;
      if (restoreValue && restoreValue.mode) {
        await setCheckoutProxySettings(restoreValue);
        return;
      }
      await clearCheckoutProxySettings();
    }

    function build711TemporaryPoolDirectRouteError(error, details = {}) {
      const baseMessage = error?.message || String(error || '711 temporary pool API request failed');
      const directMessage = details.directApplied
        ? '711 temporary pool API request used Chrome direct.'
        : '711 temporary pool API request did not reach Chrome direct before failing.';
      const restoreMessage = details.restoreError
        ? `Proxy restore failed: ${details.restoreError?.message || String(details.restoreError)}.`
        : 'Proxy restore succeeded.';
      const wrapped = new Error(`${baseMessage} ${directMessage} ${restoreMessage}`);
      try {
        wrapped.cause = error;
      } catch {
        // cause is best-effort for older runtimes.
      }
      return wrapped;
    }

    async function pull711TemporaryPoolFromApiDirect(poolState = {}, options = {}) {
      const previousProxySettings = await getCheckoutProxySettings({ incognito: false }).catch((error) => {
        throw build711TemporaryPoolDirectRouteError(error, {
          directApplied: false,
          restoreError: null,
        });
      });
      let directApplied = false;
      let operationError = null;
      let pool = null;

      try {
        await setCheckoutProxySettings({ mode: 'direct' });
        directApplied = true;
        pool = await pullIpProxyPoolFromApi(poolState, options);
      } catch (error) {
        operationError = error;
      }

      let restoreError = null;
      try {
        await restoreCheckoutProxySettingsFromSnapshot(previousProxySettings);
      } catch (error) {
        restoreError = error;
      }

      if (operationError) {
        throw build711TemporaryPoolDirectRouteError(operationError, {
          directApplied,
          restoreError,
        });
      }
      if (restoreError) {
        throw new Error(
          `711 temporary pool API request used Chrome direct and succeeded, but proxy restore failed: ${restoreError?.message || String(restoreError)}`
        );
      }
      return pool;
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
          await restoreCheckoutProxySettingsFromSnapshot(previousProxySettings);
        } catch {
          // Surface the original apply error.
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

    async function defaultApplyCheckoutScopedDirectMode(options = {}) {
      const previousProxySettings = await getCheckoutProxySettings({ incognito: false }).catch(() => ({}));
      const previousAuthEntry = typeof getCurrentIpProxyAuthEntry === 'function'
        ? (getCurrentIpProxyAuthEntry() || null)
        : null;
      const pacScript = buildCheckoutConversionDirectPacScript(previousProxySettings, options);
      try {
        if (typeof installIpProxyAuthListener === 'function') {
          installIpProxyAuthListener();
        }
        if (typeof installIpProxyErrorListener === 'function') {
          installIpProxyErrorListener();
        }
        if (typeof setCurrentIpProxyAuthEntry === 'function') {
          setCurrentIpProxyAuthEntry(previousAuthEntry ? { ...previousAuthEntry } : null);
        }
        await setCheckoutProxySettings({
          mode: 'pac_script',
          pacScript: {
            data: pacScript,
            mandatory: true,
          },
        });
        const appliedSettings = await getCheckoutProxySettings({ incognito: false }).catch(() => null);
        const takeoverCheck = validateCheckoutDirectControlAfterApply(appliedSettings || {});
        if (!takeoverCheck?.ok) {
          throw new Error(takeoverCheck.message || '支付转换无代理模式接管校验失败。');
        }
      } catch (error) {
        if (typeof setCurrentIpProxyAuthEntry === 'function') {
          setCurrentIpProxyAuthEntry(previousAuthEntry ? { ...previousAuthEntry } : null);
        }
        try {
          await restoreCheckoutProxySettingsFromSnapshot(previousProxySettings);
        } catch {
          // Surface the original apply error.
        }
        throw error;
      }
      return {
        applied: true,
        entry: null,
        displayName: '无代理模式',
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
      await restoreCheckoutProxySettingsFromSnapshot(snapshot?.previousProxySettings || {});
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

    function sanitizeSnapshot(snapshot = null) {
      if (!snapshot?.applied) {
        return null;
      }
      return {
        applied: true,
        entry: snapshot.entry ? {
          protocol: String(snapshot.entry.protocol || '').trim(),
          host: String(snapshot.entry.host || '').trim(),
          port: Number(snapshot.entry.port) || 0,
          username: String(snapshot.entry.username || ''),
          password: String(snapshot.entry.password || ''),
        } : null,
        previousProxySettings: snapshot.previousProxySettings
          ? JSON.parse(JSON.stringify(snapshot.previousProxySettings))
          : null,
        previousAuthEntry: snapshot.previousAuthEntry
          ? JSON.parse(JSON.stringify(snapshot.previousAuthEntry))
          : null,
      };
    }

    function sanitizeCheckoutConversionProxyEntry(entry = null) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }
      const protocol = normalizeCheckoutConversionProxyProtocol(entry.protocol);
      const host = String(entry.host || '').trim();
      const port = normalizeCheckoutConversionProxyPort(entry.port);
      if (!protocol || !host || !port) {
        return null;
      }
      return {
        protocol,
        host,
        port,
        username: String(entry.username || ''),
        password: String(entry.password || ''),
      };
    }

    function sanitizeCheckoutConversionProxyPool(pool = []) {
      return Array.isArray(pool)
        ? pool.map((entry) => sanitizeCheckoutConversionProxyEntry(entry)).filter(Boolean)
        : [];
    }

    function normalizeCheckoutConversionProxyPoolIndex(value = 0, poolLength = 0) {
      const length = Math.max(0, Number(poolLength) || 0);
      if (!length) {
        return -1;
      }
      const numeric = Number.parseInt(String(value ?? ''), 10);
      if (!Number.isInteger(numeric)) {
        return 0;
      }
      return Math.max(0, Math.min(length - 1, numeric));
    }

    function normalizeCheckoutConversionProxyExitCheckStatus(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      return ['idle', 'running', 'success', 'error'].includes(normalized) ? normalized : 'idle';
    }

    function buildCheckoutConversionProxyExitCheckPayload(value = {}) {
      const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      const status = normalizeCheckoutConversionProxyExitCheckStatus(source.status);
      const checkedAt = Math.max(0, Number(source.checkedAt) || Date.now());
      return {
        status,
        exitIp: String(source.exitIp || '').trim(),
        exitRegion: String(source.exitRegion || '').trim(),
        exitSource: String(source.exitSource || '').trim(),
        exitEndpoint: String(source.exitEndpoint || '').trim(),
        diagnostics: String(source.diagnostics || source.error || '').trim(),
        displayName: String(source.displayName || '').trim(),
        checkedAt,
        context: String(source.context || '').trim(),
      };
    }

    function buildCheckoutConversionProxyExitCheckFromResult(result = {}, options = {}) {
      const exitIp = String(result?.exitIp || '').trim();
      const diagnostics = String(result?.diagnostics || result?.error || '').trim();
      return buildCheckoutConversionProxyExitCheckPayload({
        status: exitIp ? 'success' : 'error',
        exitIp,
        exitRegion: String(result?.exitRegion || '').trim(),
        exitSource: String(result?.exitSource || '').trim(),
        exitEndpoint: String(result?.exitEndpoint || '').trim(),
        diagnostics: exitIp ? diagnostics : (diagnostics || '未检测到支付转换代理出口 IP。'),
        displayName: options.displayName,
        checkedAt: Date.now(),
        context: options.context,
      });
    }

    function buildCheckoutConversionProxyExitCheckFromError(error, options = {}) {
      return buildCheckoutConversionProxyExitCheckPayload({
        status: 'error',
        diagnostics: error?.message || String(error || '支付转换代理出口检测失败。'),
        displayName: options.displayName,
        checkedAt: Date.now(),
        context: options.context,
      });
    }

    function getCheckoutConversionProxySourceFromState(state = {}, options = {}) {
      return normalizeCheckoutConversionProxySource(
        options?.source
        ?? state?.plusCheckoutConversionProxySource
        ?? 'manual'
      );
    }

    function getCheckoutConversionProxy711RegionFromState(state = {}, options = {}) {
      return normalizeCheckoutConversionProxy711Region(
        options?.proxy711Region
        ?? state?.plusCheckoutConversionProxy711Region
        ?? ''
      );
    }

    function resolve711ProfileFromState(state = {}) {
      const profiles = typeof normalizeIpProxyServiceProfiles === 'function'
        ? normalizeIpProxyServiceProfiles(state?.ipProxyServiceProfiles || {}, state || {})
        : null;
      const profile = profiles?.['711proxy']
        || (typeof buildIpProxyServiceProfileFromState === 'function'
          ? buildIpProxyServiceProfileFromState({
            ...(state || {}),
            ipProxyService: '711proxy',
          })
          : null)
        || {};
      return typeof normalizeIpProxyServiceProfile === 'function'
        ? normalizeIpProxyServiceProfile(profile)
        : profile;
    }

    function build711TemporaryPoolState(state = {}, options = {}) {
      const profile = resolve711ProfileFromState(state);
      if (String(profile?.mode || '').trim().toLowerCase() !== 'api') {
        throw new Error('711 临时池仅支持读取已保存的 711Proxy API 模式配置，请先在 IP 代理中切换到 711 API 模式。');
      }
      const apiUrl = String(profile?.apiUrl || '').trim();
      if (!apiUrl) {
        throw new Error('711 临时池缺少可用的 API 地址，请先在 IP 代理中保存 711 API 配置。');
      }
      const requestedRegion = getCheckoutConversionProxy711RegionFromState(state, options);
      const validation = typeof validate711ProxyApiConfig === 'function'
        ? validate711ProxyApiConfig({
          apiUrl: typeof build711ProxyApiUrl === 'function'
            ? build711ProxyApiUrl(apiUrl, {
              ...profile,
              region: requestedRegion || profile?.apiRegion || profile?.region || '',
            })
            : apiUrl,
        })
        : { valid: true, config: null };
      if (!validation?.valid) {
        throw new Error(String(validation?.errors?.[0] || '711Proxy API 参数无效。'));
      }
      const resolvedConfig = validation?.config || null;
      const resolvedRegion = String(
        requestedRegion
        || resolvedConfig?.region
        || profile?.apiRegion
        || profile?.region
        || ''
      ).trim();
      return {
        profile,
        requestedRegion,
        resolvedRegion,
        apiUrl: typeof build711ProxyApiUrl === 'function'
          ? build711ProxyApiUrl(apiUrl, {
            ...profile,
            region: requestedRegion || profile?.apiRegion || profile?.region || '',
          })
          : apiUrl,
      };
    }

    function buildSessionPayload(session = {}) {
      const normalizedSession = session && typeof session === 'object' && !Array.isArray(session)
        ? session
        : {};
      const flowType = String(normalizedSession.flowType || '').trim();
      const releaseNodeKey = String(normalizedSession.releaseNodeKey || '').trim();
      const appliedStepKey = String(normalizedSession.appliedStepKey || '').trim();
      const displayName = String(normalizedSession.displayName || '').trim();
      const snapshot = sanitizeSnapshot(normalizedSession.snapshot);
      if (!flowType || !releaseNodeKey || !appliedStepKey || !displayName || !snapshot?.applied) {
        return null;
      }
      return {
        active: true,
        flowType,
        releaseNodeKey,
        appliedStepKey,
        displayName,
        source: normalizeCheckoutConversionProxySource(normalizedSession.source || 'manual'),
        provider: String(normalizedSession.provider || '').trim(),
        requestedRegion: normalizeCheckoutConversionProxy711Region(normalizedSession.requestedRegion || ''),
        resolvedRegion: normalizeCheckoutConversionProxy711Region(normalizedSession.resolvedRegion || ''),
        selectedEntryDisplayName: String(normalizedSession.selectedEntryDisplayName || '').trim(),
        exitIp: String(normalizedSession.exitIp || '').trim(),
        exitRegion: String(normalizedSession.exitRegion || '').trim(),
        exitSource: String(normalizedSession.exitSource || '').trim(),
        exitEndpoint: String(normalizedSession.exitEndpoint || '').trim(),
        diagnostics: String(normalizedSession.diagnostics || '').trim(),
        snapshot,
        appliedAt: Math.max(0, Number(normalizedSession.appliedAt) || Date.now()),
      };
    }

    function buildManualSessionPayload(session = {}) {
      const normalizedSession = session && typeof session === 'object' && !Array.isArray(session)
        ? session
        : {};
      const proxyUrl = normalizeCheckoutConversionProxyUrl(normalizedSession.proxyUrl);
      const displayName = String(normalizedSession.displayName || '').trim();
      const entry = sanitizeCheckoutConversionProxyEntry(normalizedSession.entry);
      const baseSnapshot = sanitizeSnapshot(normalizedSession.baseSnapshot);
      const source = normalizeCheckoutConversionProxySource(normalizedSession.source || 'manual');
      const appliedAt = Math.max(0, Number(normalizedSession.appliedAt) || Date.now());
      const lastSwitchedAt = Math.max(0, Number(normalizedSession.lastSwitchedAt) || appliedAt);
      const isDirectSource = source === 'direct';
      if (
        !displayName
        || !baseSnapshot?.applied
        || (!isDirectSource && (!proxyUrl || !entry?.host || !entry?.port))
      ) {
        return null;
      }
      return {
        active: true,
        mode: 'manual',
        source,
        provider: String(normalizedSession.provider || '').trim(),
        proxyUrl: isDirectSource ? '' : proxyUrl,
        displayName,
        requestedRegion: normalizeCheckoutConversionProxy711Region(normalizedSession.requestedRegion || ''),
        resolvedRegion: normalizeCheckoutConversionProxy711Region(normalizedSession.resolvedRegion || ''),
        selectedEntryDisplayName: String(normalizedSession.selectedEntryDisplayName || '').trim(),
        entry: isDirectSource ? null : entry,
        pool: source === '711proxy_pool'
          ? sanitizeCheckoutConversionProxyPool(normalizedSession.pool || [])
          : [],
        candidateIndex: source === '711proxy_pool'
          ? normalizeCheckoutConversionProxyPoolIndex(
            normalizedSession.candidateIndex,
            Array.isArray(normalizedSession.pool) ? normalizedSession.pool.length : normalizedSession.poolSize
          )
          : -1,
        poolSize: source === '711proxy_pool'
          ? Math.max(
            sanitizeCheckoutConversionProxyPool(normalizedSession.pool || []).length,
            Number(normalizedSession.poolSize) || 0
          )
          : 0,
        exitIp: String(normalizedSession.exitIp || '').trim(),
        exitRegion: String(normalizedSession.exitRegion || '').trim(),
        exitSource: String(normalizedSession.exitSource || '').trim(),
        exitEndpoint: String(normalizedSession.exitEndpoint || '').trim(),
        diagnostics: String(normalizedSession.diagnostics || '').trim(),
        baseSnapshot,
        appliedAt,
        lastSwitchedAt,
      };
    }

    async function loadState(state = null) {
      if (state && typeof state === 'object') {
        return state;
      }
      return typeof getState === 'function' ? await getState() : {};
    }

    async function validateCheckoutProxyCandidateWithSnapshot(snapshot = null, diagnostics = {}, options = {}) {
      const probeDiagnostics = Array.isArray(diagnostics?.probeDiagnostics) ? diagnostics.probeDiagnostics : [];
      const targetDiagnostics = Array.isArray(diagnostics?.targetDiagnostics) ? diagnostics.targetDiagnostics : [];
      const allowMissingExit = Boolean(options?.allowMissingExit);
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
      if (!exitIp && !allowMissingExit) {
        const diagnosticsSummary = summarizeCheckoutConversionProxyDiagnostics(probeDiagnostics, 4);
        throw new Error(diagnosticsSummary
          ? `未检测到代理出口 IP。诊断：${diagnosticsSummary}`
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
        snapshot,
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
    }

    async function resolve711TemporaryPoolSnapshot(state = {}, options = {}) {
      if (typeof pullIpProxyPoolFromApi !== 'function') {
        throw new Error('711 临时池能力尚未接入。');
      }
      const sourceState = await loadState(state);
      const temporaryPoolState = build711TemporaryPoolState(sourceState, options);
      const poolState = {
        ...(sourceState || {}),
        ipProxyService: '711proxy',
        ipProxyMode: 'api',
        ipProxyApiUrl: temporaryPoolState.apiUrl,
      };
      const pool = await pull711TemporaryPoolFromApiDirect(poolState, {
        maxItems: Number(options?.maxItems) || 100,
        timeoutMs: options?.timeoutMs,
      });
      if (!Array.isArray(pool) || !pool.length) {
        throw new Error('711 临时池为空，请检查 API 返回。');
      }

      const attemptErrors = [];
      for (let index = 0; index < pool.length; index += 1) {
        const entry = sanitizeCheckoutConversionProxyEntry(pool[index]);
        if (!entry) {
          continue;
        }
        const proxyUrl = buildCheckoutConversionProxyUrlFromEntry(entry);
        if (!proxyUrl) {
          continue;
        }
        let snapshot = null;
        try {
          snapshot = await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, options?.applyOptions || {});
          const checked = await validateCheckoutProxyCandidateWithSnapshot(snapshot, {
            probeDiagnostics: [],
            targetDiagnostics: [],
          });
          return {
            ...checked,
            snapshot,
            proxyUrl,
            source: '711proxy_pool',
            provider: '711proxy',
            entry: snapshot?.entry || entry,
            displayName: String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry || entry) || proxyUrl).trim(),
            selectedEntryDisplayName: String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry || entry) || proxyUrl).trim(),
            requestedRegion: temporaryPoolState.requestedRegion,
            resolvedRegion: temporaryPoolState.resolvedRegion,
            pool: sanitizeCheckoutConversionProxyPool(pool),
            poolSize: pool.length,
            candidateIndex: index,
          };
        } catch (error) {
          attemptErrors.push(`candidate_${index + 1}:${error?.message || error}`);
          if (snapshot?.applied) {
            await defaultRestoreCheckoutScopedProxySnapshot(snapshot).catch(() => {});
          }
        }
      }

      throw new Error(
        attemptErrors.length
          ? `711 临时池所有候选节点均不可用。${summarizeCheckoutConversionProxyDiagnostics(attemptErrors, 4)}`
          : '711 临时池所有候选节点均不可用。'
      );
    }

    async function getStoredSession(state = null) {
      const sourceState = await loadState(state);
      const session = sourceState?.[CHECKOUT_CONVERSION_PROXY_SESSION_KEY];
      return buildSessionPayload(session);
    }

    async function clearStoredSession() {
      await setState({
        [CHECKOUT_CONVERSION_PROXY_SESSION_KEY]: null,
      });
    }

    async function persistCheckoutConversionProxyExitCheck(exitCheck = {}) {
      const payload = buildCheckoutConversionProxyExitCheckPayload(exitCheck);
      await setState({
        [CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY]: payload,
      });
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate({
          [CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY]: payload,
        });
      }
      return payload;
    }

    async function clearCheckoutConversionProxyExitCheck() {
      await setState({
        [CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY]: null,
      });
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate({
          [CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY]: null,
        });
      }
    }

    async function markCheckoutConversionProxyExitCheckRunning(options = {}) {
      return persistCheckoutConversionProxyExitCheck({
        status: 'running',
        displayName: options.displayName,
        context: options.context,
        checkedAt: Date.now(),
      });
    }

    async function persistSession(session = {}) {
      const payload = buildSessionPayload(session);
      if (!payload) {
        throw new Error('支付转换代理运行态会话无效，无法保存。');
      }
      await setState({
        [CHECKOUT_CONVERSION_PROXY_SESSION_KEY]: payload,
      });
      return payload;
    }

    async function restoreSession(session = null) {
      const normalizedSession = buildSessionPayload(session);
      if (!normalizedSession?.snapshot?.applied) {
        await clearStoredSession();
        await clearCheckoutConversionProxyExitCheck();
        return false;
      }
      await defaultRestoreCheckoutScopedProxySnapshot(normalizedSession.snapshot);
      await clearStoredSession();
      await clearCheckoutConversionProxyExitCheck();
      return true;
    }

    async function getStoredManualSession(state = null) {
      const sourceState = await loadState(state);
      const session = sourceState?.[CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY];
      return buildManualSessionPayload(session);
    }

    async function clearStoredManualSession() {
      await setState({
        [CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY]: null,
      });
    }

    async function checkCheckoutConversionProxySessionExit(session = null, options = {}) {
      const normalizedSession = buildManualSessionPayload(session) || buildSessionPayload(session);
      if (!normalizedSession?.active) {
        return null;
      }
      const displayName = String(options?.displayName || normalizedSession.displayName || '').trim();
      const context = String(
        options?.context
        || normalizedSession.flowType
        || normalizedSession.mode
        || normalizedSession.source
        || 'checkout-conversion-proxy'
      ).trim();
      const requireExit = Boolean(options?.requireExit);
      const shouldLog = options?.log !== false;
      if (shouldLog) {
        await addLog('支付转换代理已切换，正在检测支付出口...', 'info').catch(() => {});
      }
      if (options?.persistRunning !== false) {
        await markCheckoutConversionProxyExitCheckRunning({ displayName, context }).catch(() => {});
      }

      try {
        const existingExitIp = String(normalizedSession.exitIp || '').trim();
        const result = existingExitIp
          ? {
            exitIp: existingExitIp,
            exitRegion: String(normalizedSession.exitRegion || '').trim(),
            exitSource: String(normalizedSession.exitSource || '').trim(),
            exitEndpoint: String(normalizedSession.exitEndpoint || '').trim(),
            diagnostics: String(normalizedSession.diagnostics || '').trim(),
          }
          : await validateCheckoutProxyCandidateWithSnapshot(
            normalizedSession.snapshot || normalizedSession.baseSnapshot,
            {
              probeDiagnostics: [],
              targetDiagnostics: [],
            },
            { allowMissingExit: !requireExit }
          );
        const exitCheck = buildCheckoutConversionProxyExitCheckFromResult(result, {
          displayName,
          context,
        });
        const persisted = await persistCheckoutConversionProxyExitCheck(exitCheck);
        if (!persisted.exitIp && requireExit) {
          const error = new Error(persisted.diagnostics || '支付转换代理出口检测未获取到出口 IP。');
          error.exitCheck = persisted;
          throw error;
        }
        if (shouldLog) {
          if (persisted.exitIp) {
            await addLog(
              `支付转换代理出口检测成功：${persisted.exitIp}${persisted.exitRegion ? ` [${persisted.exitRegion}]` : ''}`,
              'ok'
            ).catch(() => {});
          } else {
            await addLog(`支付转换代理出口检测失败：${persisted.diagnostics || '未检测到出口 IP。'}`, 'warn').catch(() => {});
          }
        }
        return persisted;
      } catch (error) {
        const exitCheck = error?.exitCheck || buildCheckoutConversionProxyExitCheckFromError(error, {
          displayName,
          context,
        });
        const persisted = await persistCheckoutConversionProxyExitCheck(exitCheck).catch(() => exitCheck);
        if (shouldLog) {
          await addLog(`支付转换代理出口检测失败：${persisted.diagnostics || error?.message || String(error)}`, 'warn').catch(() => {});
        }
        if (requireExit) {
          const wrapped = new Error(persisted.diagnostics || error?.message || String(error || '支付转换代理出口检测失败。'));
          wrapped.exitCheck = persisted;
          throw wrapped;
        }
        return persisted;
      }
    }

    async function persistManualSession(session = {}) {
      const payload = buildManualSessionPayload(session);
      if (!payload) {
        throw new Error('支付转换代理手动会话无效，无法保存。');
      }
      await setState({
        [CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY]: payload,
      });
      return payload;
    }

    async function switchManualSession(options = {}) {
      const sourceState = await loadState(options?.state);
      const source = getCheckoutConversionProxySourceFromState(sourceState, options);
      const proxy711Region = getCheckoutConversionProxy711RegionFromState(sourceState, options);
      const proxyUrl = normalizeCheckoutConversionProxyUrl(
        options?.proxyUrl ?? sourceState?.plusCheckoutConversionProxyUrl
      );
      if (source === 'manual' && !proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }
      const existingSession = await getStoredManualSession(sourceState);
      if (
        existingSession?.active
        && existingSession.source === source
        && (
          (source === 'manual' && existingSession.proxyUrl === proxyUrl)
          || (source === '711proxy_pool' && existingSession.requestedRegion === proxy711Region)
          || source === 'direct'
        )
      ) {
        return {
          switched: false,
          alreadyActive: true,
          session: existingSession,
          displayName: existingSession.displayName,
          exitCheck: buildCheckoutConversionProxyExitCheckPayload(sourceState?.[CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY] || {}),
        };
      }
      let restoreSnapshot = null;
      let resolved = null;
      let snapshot = null;
      try {
        if (source === 'direct' && existingSession?.baseSnapshot?.applied) {
          await defaultRestoreCheckoutScopedProxySnapshot(existingSession.baseSnapshot);
          restoreSnapshot = existingSession.baseSnapshot;
        }
        resolved = source === '711proxy_pool'
          ? await resolve711TemporaryPoolSnapshot(sourceState, {
            ...options,
            proxy711Region,
            applyOptions: options?.applyOptions || {},
          })
          : (source === 'direct'
            ? await defaultApplyCheckoutScopedDirectMode(options?.applyOptions || {})
            : await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, options?.applyOptions || {}));
        snapshot = source === '711proxy_pool' ? resolved?.snapshot : resolved;
      } catch (error) {
        if (source === 'direct' && restoreSnapshot?.applied) {
          try {
            await defaultApplyCheckoutScopedProxyFromUrl(existingSession?.proxyUrl || '', options?.applyOptions || {});
          } catch {
            // Best-effort restore only.
          }
        }
        throw error;
      }
      const displayName = source === '711proxy_pool'
        ? String(resolved?.displayName || resolved?.selectedEntryDisplayName || '711 临时池').trim()
        : (source === 'direct'
          ? '无代理模式'
          : String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim());
      const payload = await persistManualSession({
        source,
        provider: source === '711proxy_pool' ? '711proxy' : '',
        proxyUrl: source === '711proxy_pool'
          ? (resolved?.proxyUrl || buildCheckoutConversionProxyUrlFromEntry(snapshot?.entry) || proxyUrl)
          : (source === 'direct' ? '' : proxyUrl),
        displayName,
        requestedRegion: source === '711proxy_pool' ? resolved?.requestedRegion || proxy711Region : '',
        resolvedRegion: source === '711proxy_pool' ? resolved?.resolvedRegion || '' : '',
        selectedEntryDisplayName: source === '711proxy_pool' ? resolved?.selectedEntryDisplayName || displayName : '',
        entry: source === 'direct' ? null : snapshot?.entry,
        pool: source === '711proxy_pool' ? resolved?.pool || [] : [],
        candidateIndex: source === '711proxy_pool' ? resolved?.candidateIndex ?? -1 : -1,
        poolSize: source === '711proxy_pool' ? resolved?.poolSize || 0 : 0,
        exitIp: resolved?.exitIp || '',
        exitRegion: resolved?.exitRegion || '',
        exitSource: resolved?.exitSource || '',
        exitEndpoint: resolved?.exitEndpoint || '',
        diagnostics: resolved?.diagnostics || '',
        baseSnapshot: existingSession?.baseSnapshot || snapshot,
        appliedAt: existingSession?.appliedAt || Date.now(),
        lastSwitchedAt: Date.now(),
      });
      const exitCheck = await checkCheckoutConversionProxySessionExit(payload, {
        context: 'manual-switch',
        requireExit: false,
      });
      return {
        switched: true,
        alreadyActive: false,
        session: payload,
        displayName: payload.displayName,
        exitCheck,
      };
    }

    async function switchManualSessionToNext711Proxy(options = {}) {
      if (typeof pullIpProxyPoolFromApi !== 'function') {
        throw new Error('711 临时池能力尚未接入。');
      }
      const sourceState = await loadState(options?.state);
      const source = getCheckoutConversionProxySourceFromState(sourceState, {
        ...options,
        source: options?.source ?? '711proxy_pool',
      });
      if (source !== '711proxy_pool') {
        throw new Error('“下一个”仅支持 711 临时池支付转换代理。');
      }
      const proxy711Region = getCheckoutConversionProxy711RegionFromState(sourceState, options);
      const existingSession = await getStoredManualSession(sourceState);
      const existing711Session = existingSession?.active && existingSession.source === '711proxy_pool'
        ? existingSession
        : null;
      const previousExitIp = String(existing711Session?.exitIp || '').trim();
      const allowRefreshOnExhausted = options?.allowRefreshOnExhausted === undefined
        ? Boolean(sourceState?.ipProxyAutoRefreshPoolOnExhausted)
        : Boolean(options.allowRefreshOnExhausted);
      const attemptErrors = [];
      let skippedReason = '';
      let lastAccepted = null;

      const applyCandidate = async (entry = null, context = {}) => {
        const sanitizedEntry = sanitizeCheckoutConversionProxyEntry(entry);
        const proxyUrl = buildCheckoutConversionProxyUrlFromEntry(sanitizedEntry);
        if (!sanitizedEntry || !proxyUrl) {
          return null;
        }
        let snapshot = null;
        try {
          snapshot = await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, options?.applyOptions || {});
          const checked = await validateCheckoutProxyCandidateWithSnapshot(snapshot, {
            probeDiagnostics: [],
            targetDiagnostics: [],
          }, {
            allowMissingExit: true,
          });
          const displayName = String(
            snapshot?.displayName
            || describeCheckoutConversionProxyEntry(snapshot?.entry || sanitizedEntry)
            || proxyUrl
          ).trim();
          return {
            ...checked,
            snapshot,
            proxyUrl,
            source: '711proxy_pool',
            provider: '711proxy',
            entry: snapshot?.entry || sanitizedEntry,
            displayName,
            selectedEntryDisplayName: displayName,
            requestedRegion: context.requestedRegion || proxy711Region,
            resolvedRegion: context.resolvedRegion || '',
            pool: sanitizeCheckoutConversionProxyPool(context.pool || []),
            poolSize: Number(context.poolSize) || sanitizeCheckoutConversionProxyPool(context.pool || []).length,
            candidateIndex: Number(context.candidateIndex) || 0,
          };
        } catch (error) {
          attemptErrors.push(`candidate_${Number(context.candidateIndex) + 1 || '?'}:${error?.message || error}`);
          if (snapshot?.applied) {
            await defaultRestoreCheckoutScopedProxySnapshot(snapshot).catch(() => {});
          }
          return null;
        }
      };

      const tryPoolFromIndex = async (pool = [], startIndex = 0, context = {}) => {
        const sanitizedPool = sanitizeCheckoutConversionProxyPool(pool);
        if (!sanitizedPool.length) {
          return null;
        }
        const firstIndex = Math.max(0, Math.min(sanitizedPool.length, Number(startIndex) || 0));
        let firstReachable = null;
        for (let index = firstIndex; index < sanitizedPool.length; index += 1) {
          const result = await applyCandidate(sanitizedPool[index], {
            ...context,
            pool: sanitizedPool,
            poolSize: sanitizedPool.length,
            candidateIndex: index,
          });
          if (!result) {
            continue;
          }
          const exitIp = String(result.exitIp || '').trim();
          if (!previousExitIp || !exitIp || exitIp !== previousExitIp) {
            return {
              result,
              exitChanged: Boolean(previousExitIp && exitIp && exitIp !== previousExitIp),
              fallbackSameExit: false,
            };
          }
          if (!firstReachable) {
            firstReachable = result;
          } else if (result.snapshot?.applied) {
            await defaultRestoreCheckoutScopedProxySnapshot(result.snapshot).catch(() => {});
          }
        }
        if (firstReachable) {
          skippedReason = '当前 711 临时池没有检测到不同出口，已切换到下一条可用节点。';
          return {
            result: firstReachable,
            exitChanged: false,
            fallbackSameExit: true,
          };
        }
        return null;
      };

      const pullFreshPool = async () => {
        const temporaryPoolState = build711TemporaryPoolState(sourceState, {
          ...options,
          proxy711Region,
        });
        const poolState = {
          ...(sourceState || {}),
          ipProxyService: '711proxy',
          ipProxyMode: 'api',
          ipProxyApiUrl: temporaryPoolState.apiUrl,
        };
        const pool = await pull711TemporaryPoolFromApiDirect(poolState, {
          maxItems: Number(options?.maxItems) || 100,
          timeoutMs: options?.timeoutMs,
        });
        return {
          pool: sanitizeCheckoutConversionProxyPool(pool),
          requestedRegion: temporaryPoolState.requestedRegion,
          resolvedRegion: temporaryPoolState.resolvedRegion,
        };
      };

      const storedPool = sanitizeCheckoutConversionProxyPool(existing711Session?.pool || []);
      let fallbackAccepted = null;
      if (existing711Session && storedPool.length) {
        const currentIndex = normalizeCheckoutConversionProxyPoolIndex(existing711Session.candidateIndex, storedPool.length);
        const nextFromStored = await tryPoolFromIndex(storedPool, currentIndex + 1, {
          requestedRegion: existing711Session.requestedRegion || proxy711Region,
          resolvedRegion: existing711Session.resolvedRegion || '',
        });
        if (nextFromStored?.result && (!nextFromStored.fallbackSameExit || !allowRefreshOnExhausted)) {
          lastAccepted = nextFromStored;
        } else if (nextFromStored?.result) {
          fallbackAccepted = nextFromStored;
        } else if (!allowRefreshOnExhausted) {
          skippedReason = attemptErrors.length
            ? `当前 711 临时池已到末尾，未找到不同出口。${summarizeCheckoutConversionProxyDiagnostics(attemptErrors, 4)}`
            : '当前 711 临时池已到末尾，未找到不同出口。';
        }
      }

      if (!lastAccepted && (!existing711Session || !storedPool.length || allowRefreshOnExhausted)) {
        try {
          const fresh = await pullFreshPool();
          if (!fresh.pool.length) {
            throw new Error('711 临时池为空，请检查 API 返回。');
          }
          const nextFromFresh = await tryPoolFromIndex(fresh.pool, 0, fresh);
          if (nextFromFresh?.result) {
            lastAccepted = nextFromFresh;
          } else if (!skippedReason) {
            skippedReason = attemptErrors.length
              ? `711 临时池所有候选节点均不可用。${summarizeCheckoutConversionProxyDiagnostics(attemptErrors, 4)}`
              : '711 临时池所有候选节点均不可用。';
          }
        } catch (error) {
          if (!fallbackAccepted?.result) {
            throw error;
          }
          skippedReason = String(error?.message || error || skippedReason || '').trim() || skippedReason;
        }
      }

      if (!lastAccepted && fallbackAccepted?.result) {
        lastAccepted = fallbackAccepted;
      }

      if (!lastAccepted?.result) {
        return {
          switched: false,
          skipped: true,
          skippedReason,
          reason: skippedReason,
          exitChanged: false,
          session: existing711Session,
          displayName: String(existing711Session?.displayName || '').trim(),
          exitCheck: buildCheckoutConversionProxyExitCheckPayload(sourceState?.[CHECKOUT_CONVERSION_PROXY_EXIT_CHECK_KEY] || {}),
        };
      }

      const resolved = lastAccepted.result;
      const finalSkippedReason = lastAccepted.fallbackSameExit
        ? String(skippedReason || '').trim()
        : '';
      const payload = await persistManualSession({
        source: '711proxy_pool',
        provider: '711proxy',
        proxyUrl: resolved.proxyUrl || buildCheckoutConversionProxyUrlFromEntry(resolved.snapshot?.entry) || '',
        displayName: resolved.displayName || resolved.selectedEntryDisplayName || '711 临时池',
        requestedRegion: resolved.requestedRegion || proxy711Region,
        resolvedRegion: resolved.resolvedRegion || '',
        selectedEntryDisplayName: resolved.selectedEntryDisplayName || resolved.displayName || '',
        entry: resolved.snapshot?.entry || resolved.entry,
        pool: resolved.pool || [],
        candidateIndex: resolved.candidateIndex ?? -1,
        poolSize: resolved.poolSize || 0,
        exitIp: resolved.exitIp || '',
        exitRegion: resolved.exitRegion || '',
        exitSource: resolved.exitSource || '',
        exitEndpoint: resolved.exitEndpoint || '',
        diagnostics: resolved.diagnostics || '',
        baseSnapshot: existing711Session?.baseSnapshot || existingSession?.baseSnapshot || resolved.snapshot,
        appliedAt: existing711Session?.appliedAt || existingSession?.appliedAt || Date.now(),
        lastSwitchedAt: Date.now(),
      });
      const exitCheck = await checkCheckoutConversionProxySessionExit(payload, {
        context: 'manual-next-711',
        requireExit: false,
      });
      return {
        switched: true,
        skipped: false,
        exitChanged: Boolean(lastAccepted.exitChanged),
        previousExitIp,
        session: payload,
        displayName: payload.displayName,
        skippedReason: finalSkippedReason,
        reason: finalSkippedReason,
        exitCheck,
      };
    }

    async function cancelManualSession(state = null) {
      const session = await getStoredManualSession(state);
      if (!session?.active) {
        await clearStoredManualSession();
        return {
          cancelled: false,
          alreadyInactive: true,
          session: null,
        };
      }
      await defaultRestoreCheckoutScopedProxySnapshot(session.baseSnapshot);
      await clearStoredManualSession();
      await clearCheckoutConversionProxyExitCheck();
      return {
        cancelled: true,
        alreadyInactive: false,
        session,
      };
    }

    async function cleanupResidualSession(state = null, context = {}) {
      const existingSession = await getStoredSession(state);
      if (!existingSession) {
        return null;
      }
      try {
        await restoreSession(existingSession);
        if (context.logMessage) {
          await addLog(context.logMessage, context.logLevel || 'warn', context.logOptions || {});
        }
        return existingSession;
      } catch (error) {
        const displayName = existingSession.displayName || '未知代理';
        throw new Error(
          context.failureMessage
            || `检测到残留的支付转换代理会话 ${displayName}，尝试恢复失败：${error?.message || String(error || '未知错误')}`
        );
      }
    }

    async function applySessionFromState(state = {}, sessionOptions = {}, applyOptions = {}) {
      const source = getCheckoutConversionProxySourceFromState(state, sessionOptions);
      const proxyUrl = normalizeCheckoutConversionProxyUrl(state?.plusCheckoutConversionProxyUrl);
      const proxy711Region = getCheckoutConversionProxy711RegionFromState(state, sessionOptions);
      if (source === 'manual' && !proxyUrl) {
        return null;
      }
      const manualSession = await getStoredManualSession(state);
      if (manualSession?.active) {
        throw new Error(`当前已手动启用支付转换代理 ${manualSession.displayName}。请先点击“取消代理”后再运行支付流程。`);
      }
      await cleanupResidualSession(state, {
        failureMessage: `检测到残留的支付转换代理会话，无法在当前支付提交前继续切换代理。请先处理残留代理：${sessionOptions.flowType || 'unknown'}`,
      });
      const resolved = source === '711proxy_pool'
        ? await resolve711TemporaryPoolSnapshot(state, {
          ...sessionOptions,
          proxy711Region,
          applyOptions,
        })
        : (source === 'direct'
          ? await defaultApplyCheckoutScopedDirectMode(applyOptions)
          : await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, applyOptions));
      const snapshot = source === '711proxy_pool' ? resolved?.snapshot : resolved;
      const displayName = source === '711proxy_pool'
        ? String(resolved?.displayName || resolved?.selectedEntryDisplayName || '711 临时池').trim()
        : (source === 'direct'
          ? '无代理模式'
          : String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim());
      const payload = await persistSession({
        flowType: sessionOptions.flowType,
        releaseNodeKey: sessionOptions.releaseNodeKey,
        appliedStepKey: sessionOptions.appliedStepKey,
        displayName,
        source,
        provider: source === '711proxy_pool' ? '711proxy' : '',
        requestedRegion: source === '711proxy_pool' ? resolved?.requestedRegion || proxy711Region : '',
        resolvedRegion: source === '711proxy_pool' ? resolved?.resolvedRegion || '' : '',
        selectedEntryDisplayName: source === '711proxy_pool' ? resolved?.selectedEntryDisplayName || displayName : '',
        exitIp: resolved?.exitIp || '',
        exitRegion: resolved?.exitRegion || '',
        exitSource: resolved?.exitSource || '',
        exitEndpoint: resolved?.exitEndpoint || '',
        diagnostics: resolved?.diagnostics || '',
        snapshot,
        appliedAt: Date.now(),
      });
      return payload;
    }

    async function releaseSessionForNode(nodeKey = '', state = null) {
      const session = await getStoredSession(state);
      if (!session?.active) {
        return { released: false, session: null };
      }
      if (nodeKey && session.releaseNodeKey !== nodeKey) {
        return { released: false, session };
      }
      await restoreSession(session);
      return { released: true, session };
    }

    async function testCheckoutConversionProxy(options = {}) {
      const sourceState = await loadState(options?.state);
      const source = getCheckoutConversionProxySourceFromState(sourceState, options);
      const proxyUrl = normalizeCheckoutConversionProxyUrl(options?.proxyUrl);
      const proxy711Region = getCheckoutConversionProxy711RegionFromState(sourceState, options);
      if (source === 'manual' && !proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }
      const probeDiagnostics = [];
      const targetDiagnostics = [];
      let snapshot = null;

      try {
        const result = source === '711proxy_pool'
          ? await resolve711TemporaryPoolSnapshot(sourceState, {
            ...options,
            proxy711Region,
            applyOptions: {
              targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
            },
          })
          : await (async () => {
            snapshot = source === 'direct'
              ? await defaultApplyCheckoutScopedDirectMode({
                targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
              })
              : await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, {
                targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
              });
            const checked = await validateCheckoutProxyCandidateWithSnapshot(snapshot, {
              probeDiagnostics,
              targetDiagnostics,
            });
            return {
              ...checked,
              proxyDisplayName: source === 'direct'
                ? '无代理模式'
                : describeCheckoutConversionProxyEntry(parseCheckoutConversionProxyUrl(proxyUrl)),
            };
          })();
        snapshot = result?.snapshot || snapshot;

        return {
          ok: true,
          proxyDisplayName: String(result?.proxyDisplayName || result?.displayName || result?.selectedEntryDisplayName || '').trim(),
          exitIp: String(result?.exitIp || '').trim(),
          exitRegion: String(result?.exitRegion || '').trim(),
          exitSource: String(result?.exitSource || '').trim(),
          exitEndpoint: String(result?.exitEndpoint || '').trim(),
          targetEndpoint: String(result?.targetEndpoint || '').trim(),
          diagnostics: String(result?.diagnostics || '').trim(),
        };
      } finally {
        if (snapshot?.applied) {
          await defaultRestoreCheckoutScopedProxySnapshot(snapshot).catch(() => {});
        }
      }
    }

    return {
      CHECKOUT_CONVERSION_PROXY_SESSION_KEY,
      CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY,
      CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
      CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
      defaultApplyCheckoutScopedProxyFromUrl,
      defaultApplyCheckoutScopedDirectMode,
      defaultRestoreCheckoutScopedProxySnapshot,
      normalizeCheckoutConversionProxyUrl,
      parseCheckoutConversionProxyUrl,
      describeCheckoutConversionProxyEntry,
      sanitizeSnapshot,
      getStoredSession,
      persistSession,
      clearStoredSession,
      restoreSession,
      getStoredManualSession,
      persistManualSession,
      clearStoredManualSession,
      switchManualSession,
      switchManualSessionToNext711Proxy,
      cancelManualSession,
      cleanupResidualSession,
      applySessionFromState,
      checkCheckoutConversionProxySessionExit,
      releaseSessionForNode,
      testCheckoutConversionProxy,
    };
  }

  return {
    CHECKOUT_CONVERSION_PROXY_SESSION_KEY,
    CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY,
    CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
    CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
    createCheckoutConversionProxyManager,
  };
});
