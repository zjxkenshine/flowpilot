(function attachBackgroundStep1(root, factory) {
  root.MultiPageBackgroundStep1 = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundStep1Module() {
  const STEP1_COOKIE_CLEAR_DOMAINS = [
    'chatgpt.com',
    'chat.openai.com',
    'openai.com',
    'auth.openai.com',
    'auth0.openai.com',
    'accounts.openai.com',
  ];

  function normalizeCookieDomainForStep1(domain) {
    return String(domain || '').trim().replace(/^\.+/, '').toLowerCase();
  }

  function shouldClearStep1Cookie(cookie) {
    const domain = normalizeCookieDomainForStep1(cookie?.domain);
    if (!domain) return false;
    return STEP1_COOKIE_CLEAR_DOMAINS.some((target) => (
      domain === target || domain.endsWith(`.${target}`)
    ));
  }

  function buildStep1CookieKey(cookie, fallbackStoreId = '') {
    return [
      cookie?.storeId || fallbackStoreId || '',
      cookie?.domain || '',
      cookie?.path || '',
      cookie?.name || '',
      cookie?.partitionKey ? JSON.stringify(cookie.partitionKey) : '',
    ].join('|');
  }

  function buildStep1CookieRemovalUrl(cookie) {
    const host = normalizeCookieDomainForStep1(cookie?.domain);
    const rawPath = String(cookie?.path || '/');
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `https://${host}${path}`;
  }

  function getStep1ErrorMessage(error) {
    return error?.message || String(error || '未知错误');
  }

  async function collectStep1Cookies(chromeApi) {
    if (!chromeApi.cookies?.getAll) {
      return [];
    }

    const stores = chromeApi.cookies.getAllCookieStores
      ? await chromeApi.cookies.getAllCookieStores()
      : [{ id: undefined }];
    const cookies = [];
    const seen = new Set();
    const queryDomains = Array.from(
      new Set(
        STEP1_COOKIE_CLEAR_DOMAINS
          .map((domain) => normalizeCookieDomainForStep1(domain))
          .filter(Boolean)
      )
    );

    for (const store of stores) {
      const storeId = store?.id;
      for (const domain of queryDomains) {
        let batch = [];
        try {
          batch = await chromeApi.cookies.getAll(
            storeId
              ? { storeId, domain }
              : { domain }
          );
        } catch (error) {
          console.warn('[MultiPage:step1] query cookies failed', {
            storeId: storeId || '',
            domain,
            message: getStep1ErrorMessage(error),
          });
          continue;
        }
        for (const cookie of batch || []) {
          if (!shouldClearStep1Cookie(cookie)) continue;
          const key = buildStep1CookieKey(cookie, storeId);
          if (seen.has(key)) continue;
          seen.add(key);
          cookies.push(cookie);
        }
      }
    }

    return cookies;
  }

  async function removeStep1Cookie(chromeApi, cookie) {
    const details = {
      url: buildStep1CookieRemovalUrl(cookie),
      name: cookie.name,
    };
    if (cookie.storeId) {
      details.storeId = cookie.storeId;
    }
    if (cookie.partitionKey) {
      details.partitionKey = cookie.partitionKey;
    }

    try {
      const result = await chromeApi.cookies.remove(details);
      return Boolean(result);
    } catch (error) {
      console.warn('[MultiPage:step1] remove cookie failed', {
        domain: cookie?.domain,
        name: cookie?.name,
        message: getStep1ErrorMessage(error),
      });
      return false;
    }
  }

  function createStep1Executor(deps = {}) {
    const {
      addLog,
      chrome: chromeApi = globalThis.chrome,
      completeNodeFromBackground,
      getState,
      openSignupEntryTab,
      probeIpProxyExit,
      switchIpProxy,
    } = deps;

    function unwrapProxyRoutingResult(result = {}) {
      if (result && typeof result === 'object' && result.proxyRouting && typeof result.proxyRouting === 'object') {
        return result.proxyRouting;
      }
      return result && typeof result === 'object' ? result : {};
    }

    function isReadyProxyRouting(routing = {}) {
      const exitIp = String(routing?.exitIp || '').trim();
      const reason = String(routing?.reason || '').trim().toLowerCase();
      if (!exitIp) {
        return false;
      }
      if (routing?.applied === false) {
        return false;
      }
      return ![
        'connectivity_failed',
        'apply_failed',
        'missing_proxy_entry',
        'proxy_api_unavailable',
        'disabled',
        'disabled_probe_only',
      ].includes(reason);
    }

    function formatProxyRoutingSummary(routing = {}) {
      const exitIp = String(routing?.exitIp || '').trim();
      const exitRegion = String(routing?.exitRegion || '').trim();
      const exitSource = String(routing?.exitSource || '').trim().toLowerCase();
      const regionPart = exitRegion ? ` [${exitRegion}]` : '';
      const sourcePart = exitSource ? `，来源 ${exitSource}` : '';
      return `${exitIp}${regionPart}${sourcePart}`;
    }

    async function ensureIpProxyExitReadyBeforeStep1() {
      const initialState = typeof getState === 'function' ? await getState() : {};
      if (!initialState?.ipProxyEnabled) {
        return { skipped: true, reason: 'proxy_disabled' };
      }

      if (typeof probeIpProxyExit !== 'function') {
        throw new Error('IP 代理出口检测能力不可用。');
      }
      if (typeof switchIpProxy !== 'function') {
        throw new Error('IP 代理切换能力不可用。');
      }

      const maxAttempts = 3;
      let currentState = initialState;
      let lastRouting = null;

      await addLog('步骤 1：已开启 IP 代理，正在执行访问 ChatGPT 前出口检测...', 'info');

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        let probeError = null;
        let probeResult = null;
        try {
          probeResult = await probeIpProxyExit({
            state: currentState,
            timeoutMs: 12000,
            authRebindRetry: true,
          });
        } catch (error) {
          probeError = error;
        }
        const routing = unwrapProxyRoutingResult(probeResult);
        if (probeError && !String(routing?.exitError || '').trim()) {
          routing.exitError = probeError?.message || String(probeError || 'probe failed');
        }
        lastRouting = routing;
        if (isReadyProxyRouting(routing)) {
          const summary = formatProxyRoutingSummary(routing);
          await addLog(
            summary
              ? `步骤 1：出口检测成功，当前出口 ${summary}，继续打开 ChatGPT。`
              : '步骤 1：出口检测成功，继续打开 ChatGPT。',
            'ok'
          );
          return routing;
        }

        const failureText = String(routing?.exitError || routing?.error || probeError?.message || '').trim();
        if (attempt >= maxAttempts) {
          throw new Error(
            failureText
              ? `步骤 1：IP 出口检测连续失败，已重试 ${maxAttempts} 次，暂停打开 ChatGPT。${failureText}`
              : `步骤 1：IP 出口检测连续失败，已重试 ${maxAttempts} 次，暂停打开 ChatGPT。`
          );
        }

        await addLog(
          failureText
            ? `步骤 1：出口检测失败（${failureText}），正在执行“下一条”换 IP 后复测（第 ${attempt} 次，共 ${maxAttempts} 次）...`
            : `步骤 1：出口检测失败，正在执行“下一条”换 IP 后复测（第 ${attempt} 次，共 ${maxAttempts} 次）...`,
          'warn'
        );
        try {
          await switchIpProxy('next', {
            state: currentState,
            skipExitProbe: true,
            forceRefresh: true,
          });
        } catch (error) {
          await addLog(
            `步骤 1：下一条换 IP 失败（第 ${attempt} 次，共 ${maxAttempts} 次）：${error?.message || String(error || '未知错误')}`,
            'warn'
          );
        }
        currentState = typeof getState === 'function' ? await getState() : currentState;
      }

      return lastRouting;
    }

    async function clearOpenAiCookiesBeforeStep1() {
      if (!chromeApi?.cookies?.getAll || !chromeApi.cookies?.remove) {
        await addLog('步骤 1：当前浏览器不支持 cookies API，跳过打开官网前 cookie 清理。', 'warn');
        return;
      }

      const startedAt = Date.now();
      await addLog('步骤 1：打开 ChatGPT 官网前清理 ChatGPT / OpenAI cookies...', 'info');
      const cookies = await collectStep1Cookies(chromeApi);
      let removedCount = 0;
      for (const cookie of cookies) {
        if (await removeStep1Cookie(chromeApi, cookie)) {
          removedCount += 1;
        }
      }

      const elapsedMs = Date.now() - startedAt;
      await addLog(`步骤 1：已清理 ${removedCount} 个 ChatGPT / OpenAI cookies（耗时 ${elapsedMs}ms）。`, 'ok');
    }

    async function executeStep1() {
      await clearOpenAiCookiesBeforeStep1();
      await ensureIpProxyExitReadyBeforeStep1();
      await addLog('步骤 1：正在打开 ChatGPT 官网...');
      await openSignupEntryTab(1);
      await completeNodeFromBackground('open-chatgpt', {});
    }

    return { executeStep1 };
  }

  return { createStep1Executor };
});
