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
  const CHECKOUT_CONVERSION_PROXY_SESSION_KEY = 'plusCheckoutConversionProxySession';
  const CHECKOUT_CONVERSION_PROXY_MANUAL_SESSION_KEY = 'plusCheckoutConversionProxyManualSession';

  function createCheckoutConversionProxyManager(deps = {}) {
    const {
      chrome,
      getState = null,
      setState = async () => {},
      addLog = async () => {},
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
      const appliedAt = Math.max(0, Number(normalizedSession.appliedAt) || Date.now());
      const lastSwitchedAt = Math.max(0, Number(normalizedSession.lastSwitchedAt) || appliedAt);
      if (!proxyUrl || !displayName || !entry?.host || !entry?.port || !baseSnapshot?.applied) {
        return null;
      }
      return {
        active: true,
        mode: 'manual',
        proxyUrl,
        displayName,
        entry,
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
        return false;
      }
      await defaultRestoreCheckoutScopedProxySnapshot(normalizedSession.snapshot);
      await clearStoredSession();
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
      const proxyUrl = normalizeCheckoutConversionProxyUrl(
        options?.proxyUrl ?? sourceState?.plusCheckoutConversionProxyUrl
      );
      if (!proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }
      const existingSession = await getStoredManualSession(sourceState);
      if (existingSession?.active && existingSession.proxyUrl === proxyUrl) {
        return {
          switched: false,
          alreadyActive: true,
          session: existingSession,
          displayName: existingSession.displayName,
        };
      }
      const snapshot = await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, options?.applyOptions || {});
      const payload = await persistManualSession({
        proxyUrl,
        displayName: String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim(),
        entry: snapshot?.entry,
        baseSnapshot: existingSession?.baseSnapshot || snapshot,
        appliedAt: existingSession?.appliedAt || Date.now(),
        lastSwitchedAt: Date.now(),
      });
      return {
        switched: true,
        alreadyActive: false,
        session: payload,
        displayName: payload.displayName,
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
      const proxyUrl = normalizeCheckoutConversionProxyUrl(state?.plusCheckoutConversionProxyUrl);
      if (!proxyUrl) {
        return null;
      }
      const manualSession = await getStoredManualSession(state);
      if (manualSession?.active) {
        throw new Error(`当前已手动启用支付转换代理 ${manualSession.displayName}。请先点击“取消代理”后再运行支付流程。`);
      }
      await cleanupResidualSession(state, {
        failureMessage: `检测到残留的支付转换代理会话，无法在当前支付提交前继续切换代理。请先处理残留代理：${sessionOptions.flowType || 'unknown'}`,
      });
      const snapshot = await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, applyOptions);
      const payload = await persistSession({
        flowType: sessionOptions.flowType,
        releaseNodeKey: sessionOptions.releaseNodeKey,
        appliedStepKey: sessionOptions.appliedStepKey,
        displayName: String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim(),
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
      const proxyUrl = normalizeCheckoutConversionProxyUrl(options?.proxyUrl);
      if (!proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }

      const parsedEntry = parseCheckoutConversionProxyUrl(proxyUrl);
      const probeDiagnostics = [];
      const targetDiagnostics = [];
      let snapshot = null;

      try {
        snapshot = await defaultApplyCheckoutScopedProxyFromUrl(proxyUrl, {
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
      cancelManualSession,
      cleanupResidualSession,
      applySessionFromState,
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
