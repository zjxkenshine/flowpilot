(function attachBackgroundStep6(root, factory) {
  root.MultiPageBackgroundStep6 = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundStep6Module() {
  const DEFAULT_REGISTRATION_SUCCESS_WAIT_MS = 20000;
  const STEP6_COOKIE_CLEAR_DOMAINS = [
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
  const STEP6_COOKIE_CLEAR_ORIGINS = [
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
  const STEP6_FREE_STATUS_UNKNOWN = 'unknown';
  const STEP6_FREE_STATUS_VALUES = new Set(['free', 'paid', STEP6_FREE_STATUS_UNKNOWN]);

  function normalizeStep6FreeStatus(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return STEP6_FREE_STATUS_VALUES.has(normalized) ? normalized : STEP6_FREE_STATUS_UNKNOWN;
  }

  function inspectStep6ChatgptFreeStatus() {
    function normalizeText(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function getElementText(element) {
      return normalizeText([
        element?.textContent,
        element?.value,
        element?.getAttribute?.('aria-label'),
        element?.getAttribute?.('title'),
      ].filter(Boolean).join(' '));
    }

    function isVisibleElement(element) {
      if (!element) return false;
      let style = null;
      try {
        style = window.getComputedStyle(element);
      } catch {
        style = null;
      }
      const rect = typeof element.getBoundingClientRect === 'function'
        ? element.getBoundingClientRect()
        : { width: 0, height: 0 };
      return style?.display !== 'none'
        && style?.visibility !== 'hidden'
        && Number(rect?.width) > 0
        && Number(rect?.height) > 0;
    }

    function isActionEnabled(element) {
      return Boolean(element)
        && !element.disabled
        && element.getAttribute?.('aria-disabled') !== 'true';
    }

    function isVisibleEnabledAction(element) {
      return isVisibleElement(element) && isActionEnabled(element);
    }

    function getActionCandidates() {
      return Array.from(document.querySelectorAll(
        'a, button, [role="button"], [role="link"], input[type="button"], input[type="submit"]'
      ));
    }

    function isStrictChatgptRootUrl(rawUrl) {
      try {
        const parsed = new URL(String(rawUrl || ''));
        return parsed.protocol === 'https:'
          && parsed.hostname.toLowerCase() === 'chatgpt.com'
          && (parsed.pathname || '/') === '/'
          && !parsed.search;
      } catch {
        return false;
      }
    }

    const url = String(location?.href || '');
    if (!isStrictChatgptRootUrl(url)) {
      return {
        freeStatus: 'unknown',
        reason: 'not_chatgpt_root',
        url,
      };
    }

    const loginTextPattern = /登录|log\s*in|sign\s*in/i;
    const logoutTextPattern = /退出登录|登出|log\s*out|sign\s*out/i;
    const loginButton = document.querySelector('button[data-testid="login-button"], [data-testid="login-button"]');
    if (loginButton && isVisibleEnabledAction(loginButton)) {
      return {
        freeStatus: 'unknown',
        reason: 'login_button_visible',
        url,
        matchedText: getElementText(loginButton),
      };
    }

    for (const element of getActionCandidates()) {
      if (!isVisibleEnabledAction(element)) continue;
      const text = getElementText(element);
      if (logoutTextPattern.test(text)) continue;
      if (text && loginTextPattern.test(text)) {
        return {
          freeStatus: 'unknown',
          reason: 'login_action_visible',
          url,
          matchedText: text,
        };
      }
    }

    const freeTrialPattern = /免费|free/i;
    const paidPattern = /升级|upgrade/i;
    let paidMatch = '';

    for (const element of getActionCandidates()) {
      if (!isVisibleElement(element)) continue;
      const text = getElementText(element);
      if (!text) continue;
      if (freeTrialPattern.test(text)) {
        return {
          freeStatus: 'free',
          reason: 'free_trial_action_visible',
          url,
          matchedText: text,
        };
      }
      if (!paidMatch && paidPattern.test(text)) {
        paidMatch = text;
      }
    }

    if (paidMatch) {
      return {
        freeStatus: 'paid',
        reason: 'paid_upgrade_action_visible',
        url,
        matchedText: paidMatch,
      };
    }

    return {
      freeStatus: 'unknown',
      reason: 'subscription_action_missing',
      url,
    };
  }

  function normalizeStep6CookieDomain(domain) {
    return String(domain || '').trim().replace(/^\.+/, '').toLowerCase();
  }

  function shouldClearStep6Cookie(cookie) {
    const domain = normalizeStep6CookieDomain(cookie?.domain);
    if (!domain) return false;
    return STEP6_COOKIE_CLEAR_DOMAINS.some((target) => (
      domain === target || domain.endsWith(`.${target}`)
    ));
  }

  function buildStep6CookieRemovalUrl(cookie) {
    const host = normalizeStep6CookieDomain(cookie?.domain);
    const rawPath = String(cookie?.path || '/');
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `https://${host}${path}`;
  }

  async function collectStep6Cookies(chromeApi) {
    if (!chromeApi.cookies?.getAll) {
      return [];
    }

    const stores = chromeApi.cookies.getAllCookieStores
      ? await chromeApi.cookies.getAllCookieStores()
      : [{ id: undefined }];
    const cookies = [];
    const seen = new Set();

    for (const store of stores) {
      const storeId = store?.id;
      const batch = await chromeApi.cookies.getAll(storeId ? { storeId } : {});
      for (const cookie of batch || []) {
        if (!shouldClearStep6Cookie(cookie)) continue;
        const key = [
          cookie.storeId || storeId || '',
          cookie.domain || '',
          cookie.path || '',
          cookie.name || '',
          cookie.partitionKey ? JSON.stringify(cookie.partitionKey) : '',
        ].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        cookies.push(cookie);
      }
    }

    return cookies;
  }

  async function removeStep6Cookie(chromeApi, cookie, getErrorMessage) {
    const details = {
      url: buildStep6CookieRemovalUrl(cookie),
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
      console.warn('[MultiPage:step6] remove cookie failed', {
        domain: cookie?.domain,
        name: cookie?.name,
        message: getErrorMessage(error),
      });
      return false;
    }
  }

  function createStep6Executor(deps = {}) {
    const {
      addLog = async () => {},
      chrome: chromeApi = globalThis.chrome,
      completeNodeFromBackground,
      CLOUDFLARE_TEMP_EMAIL_GENERATOR = 'cloudflare-temp-email',
      fetchCloudflareEmail = null,
      fetchCloudflareTempEmailAddress = null,
      getErrorMessage = (error) => error?.message || String(error || '未知错误'),
      getState = null,
      getTabId = async () => null,
      ensurePhonePrefixedCloudflareTempEmail = null,
      persistRegistrationEmailState = null,
      registrationSuccessWaitMs = DEFAULT_REGISTRATION_SUCCESS_WAIT_MS,
      resolveSignupMethod = null,
      setPlusPaymentEmailState = null,
      sleepWithStop = async (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0))),
    } = deps;

    function getStep6FreeStatusResult(injectionResults = []) {
      const result = Array.isArray(injectionResults) ? injectionResults[0]?.result : null;
      return {
        ...(result && typeof result === 'object' && !Array.isArray(result) ? result : {}),
        freeStatus: normalizeStep6FreeStatus(result?.freeStatus),
      };
    }

    async function detectStep6FreeStatus() {
      if (!chromeApi?.scripting?.executeScript) {
        return {
          freeStatus: STEP6_FREE_STATUS_UNKNOWN,
          reason: 'scripting_api_unavailable',
        };
      }

      const tabId = await Promise.resolve(getTabId('signup-page')).catch(() => null);
      if (!Number.isInteger(tabId)) {
        return {
          freeStatus: STEP6_FREE_STATUS_UNKNOWN,
          reason: 'signup_tab_missing',
        };
      }

      try {
        const injectionResults = await chromeApi.scripting.executeScript({
          target: { tabId },
          func: inspectStep6ChatgptFreeStatus,
        });
        return getStep6FreeStatusResult(injectionResults);
      } catch (error) {
        return {
          freeStatus: STEP6_FREE_STATUS_UNKNOWN,
          reason: 'inspection_failed',
          error: getErrorMessage(error),
        };
      }
    }

    async function clearCookiesIfEnabled(state = {}) {
      if (!state?.step6CookieCleanupEnabled) {
        return;
      }
      if (!chromeApi?.cookies?.getAll || !chromeApi.cookies?.remove) {
        await addLog('步骤 6：当前浏览器不支持 cookies API，跳过第六步 Cookies 清理。', 'warn');
        return;
      }

      try {
        await addLog('步骤 6：已开启 Cookies 清理，正在清理 ChatGPT / OpenAI cookies...', 'info');
        const cookies = await collectStep6Cookies(chromeApi);
        let removedCount = 0;
        for (const cookie of cookies) {
          if (await removeStep6Cookie(chromeApi, cookie, getErrorMessage)) {
            removedCount += 1;
          }
        }

        if (chromeApi.browsingData?.removeCookies) {
          try {
            await chromeApi.browsingData.removeCookies({
              since: 0,
              origins: STEP6_COOKIE_CLEAR_ORIGINS,
            });
          } catch (error) {
            await addLog(`步骤 6：browsingData 补扫 cookies 失败：${getErrorMessage(error)}`, 'warn');
          }
        }

        await addLog(`步骤 6：已清理 ${removedCount} 个 ChatGPT / OpenAI cookies。`, 'ok');
      } catch (error) {
        await addLog(`步骤 6：Cookies 清理失败，已跳过并继续后续流程：${getErrorMessage(error)}`, 'warn');
      }
    }

    function resolveStep6SignupMethod(state = {}) {
      if (typeof resolveSignupMethod === 'function') {
        return String(resolveSignupMethod(state) || '').trim().toLowerCase();
      }
      return String(state?.resolvedSignupMethod || state?.signupMethod || '').trim().toLowerCase();
    }

    function getStep6PhoneCloudflareEmailMode(state = {}) {
      const signupMethod = resolveStep6SignupMethod(state);
      const generator = String(state?.emailGenerator || '').trim().toLowerCase();
      const cloudflareTempEmailGenerator = String(CLOUDFLARE_TEMP_EMAIL_GENERATOR || 'cloudflare-temp-email').trim().toLowerCase();
      if (signupMethod !== 'phone') {
        return '';
      }
      return generator === 'cloudflare' || generator === cloudflareTempEmailGenerator
        ? generator
        : '';
    }

    function isStep6PhoneCloudflareEmailEnabled(state = {}) {
      return Boolean(getStep6PhoneCloudflareEmailMode(state));
    }

    function isStep6PhoneCloudflareAliasMode(state = {}) {
      return getStep6PhoneCloudflareEmailMode(state) === 'cloudflare';
    }

    function getStep6PhoneCloudflareLabel(state = {}) {
      return isStep6PhoneCloudflareAliasMode(state) ? 'Cloudflare' : 'Cloudflare Temp Email';
    }

    function getStep6PhoneCloudflareGeneratedSource(state = {}) {
      return isStep6PhoneCloudflareAliasMode(state)
        ? 'generated:cloudflare:phone-prefix'
        : 'generated:cloudflare-temp-email:phone-prefix';
    }

    function getStep6PhoneCloudflarePaymentSource(state = {}) {
      return isStep6PhoneCloudflareAliasMode(state)
        ? 'registration:phone-prefix-cloudflare-email'
        : 'registration:phone-prefix-cloudflare-temp-email';
    }

    function getStep6PhoneCloudflareFallbackGeneratedSource(state = {}) {
      return isStep6PhoneCloudflareAliasMode(state)
        ? 'generated:cloudflare:fallback'
        : 'generated:cloudflare-temp-email:fallback';
    }

    function getStep6PhoneCloudflareFallbackPaymentSource(state = {}) {
      return isStep6PhoneCloudflareAliasMode(state)
        ? 'registration:cloudflare:fallback'
        : 'registration:cloudflare-temp-email:fallback';
    }

    function getStep6PhoneEmailSourceValue(state = {}) {
      return String(
        state?.signupVerifiedPhoneNumber
        || state?.signupPhoneCompletedActivation?.phoneNumber
        || state?.signupPhoneNumber
        || (String(state?.accountIdentifierType || '').trim().toLowerCase() === 'phone' ? state?.accountIdentifier : '')
        || ''
      ).trim();
    }

    function buildStep6PhoneEmailLocalPart(state = {}) {
      return getStep6PhoneEmailSourceValue(state).replace(/\D+/g, '');
    }

    function getExistingStep6PhonePrefixedEmail(state = {}, localPart = '') {
      const normalizedLocalPart = String(localPart || '').trim().toLowerCase();
      if (!normalizedLocalPart) {
        return '';
      }
      const registrationEmailState = state?.registrationEmailState && typeof state.registrationEmailState === 'object'
        ? state.registrationEmailState
        : {};
      const candidates = [
        registrationEmailState.current,
        state?.email,
      ];
      for (const candidate of candidates) {
        const email = String(candidate || '').trim().toLowerCase();
        const separatorIndex = email.indexOf('@');
        if (separatorIndex > 0 && email.slice(0, separatorIndex) === normalizedLocalPart) {
          return email;
        }
      }
      return '';
    }

    async function resolveLatestStep6State(state = {}) {
      if (typeof getState !== 'function') {
        return state || {};
      }
      const latestState = await getState().catch(() => null);
      return latestState && typeof latestState === 'object' && !Array.isArray(latestState)
        ? latestState
        : (state || {});
    }

    async function ensurePhonePrefixedCloudflareTempEmailForStep6(state = {}) {
      const latestState = await resolveLatestStep6State(state);
      if (!isStep6PhoneCloudflareEmailEnabled(latestState)) {
        return null;
      }
      const localPart = buildStep6PhoneEmailLocalPart(latestState);
      const label = getStep6PhoneCloudflareLabel(latestState);
      if (!localPart) {
        if (typeof ensurePhonePrefixedCloudflareTempEmail === 'function') {
          const helperEmail = await ensurePhonePrefixedCloudflareTempEmail(latestState);
          if (helperEmail) {
            return helperEmail;
          }
        }
        const fallbackFetcher = isStep6PhoneCloudflareAliasMode(latestState)
          ? fetchCloudflareEmail
          : fetchCloudflareTempEmailAddress;
        if (typeof fallbackFetcher !== 'function') {
          throw new Error(`Step 6: ${label} generation capability is not wired, cannot create a phone-prefixed email.`);
        }
        await addLog(`Step 6: no usable phone number found; falling back to ${label} random generation.`, 'warn');
        const fallbackEmail = String(await fallbackFetcher(latestState, {
          preserveAccountIdentity: true,
          source: getStep6PhoneCloudflareFallbackGeneratedSource(latestState),
        }) || '').trim().toLowerCase();
        if (!fallbackEmail) {
          throw new Error(`Step 6: ${label} did not return a usable email.`);
        }
        if (typeof setPlusPaymentEmailState === 'function') {
          await setPlusPaymentEmailState(fallbackEmail, {
            source: getStep6PhoneCloudflareFallbackPaymentSource(latestState),
          });
        }
        await addLog(`步骤 6：本轮后续邮箱已回退为 ${fallbackEmail}。`, 'ok');
        return fallbackEmail;
      }

      const existingEmail = getExistingStep6PhonePrefixedEmail(latestState, localPart);
      if (existingEmail) {
        if (typeof setPlusPaymentEmailState === 'function') {
          await setPlusPaymentEmailState(existingEmail, {
            source: getStep6PhoneCloudflarePaymentSource(latestState),
          });
        }
        await addLog(`步骤 6：本轮后续邮箱已固定为 ${existingEmail}。`, 'ok');
        return existingEmail;
      }

      if (typeof ensurePhonePrefixedCloudflareTempEmail === 'function') {
        return ensurePhonePrefixedCloudflareTempEmail(latestState, { localPart });
      }

      const fetcher = isStep6PhoneCloudflareAliasMode(latestState)
        ? fetchCloudflareEmail
        : fetchCloudflareTempEmailAddress;
      if (typeof fetcher !== 'function') {
        throw new Error(`Step 6: ${label} generation capability is not wired, cannot create a phone-prefixed email.`);
      }

      await addLog(`Step 6: phone signup succeeded; creating phone-prefixed ${label} mailbox (${localPart})...`, 'info');
      const email = String(await fetcher(latestState, {
        localPart,
        preserveAccountIdentity: true,
        source: getStep6PhoneCloudflareGeneratedSource(latestState),
      }) || '').trim().toLowerCase();
      if (!email) {
        throw new Error(`Step 6: ${label} did not return a usable phone-prefixed email.`);
      }

      const postGenerateState = await resolveLatestStep6State(latestState);
      const persistedEmail = String(
        postGenerateState?.registrationEmailState?.current
        || postGenerateState?.email
        || ''
      ).trim().toLowerCase();
      if (typeof persistRegistrationEmailState === 'function' && persistedEmail !== email) {
        await persistRegistrationEmailState(latestState, email, {
          preserveAccountIdentity: true,
          source: getStep6PhoneCloudflareGeneratedSource(latestState),
        });
      }
      if (typeof setPlusPaymentEmailState === 'function') {
        await setPlusPaymentEmailState(email, {
          source: getStep6PhoneCloudflarePaymentSource(latestState),
        });
      }
      await addLog(`步骤 6：本轮后续邮箱已固定为 ${email}。`, 'ok');
      return email;
    }

    async function executeStep6(state = {}) {
      const waitMs = Math.max(0, Math.floor(Number(registrationSuccessWaitMs) || 0));
      if (waitMs > 0) {
        await addLog(`步骤 6：等待 ${Math.round(waitMs / 1000)} 秒，确认注册成功并让页面稳定...`, 'info');
        await sleepWithStop(waitMs);
      }
      const freeStatusResult = await detectStep6FreeStatus();
      const freeStatus = normalizeStep6FreeStatus(freeStatusResult?.freeStatus);
      await addLog(`步骤 6：账号免费状态判断结果：${freeStatus}。`, 'info');
      await clearCookiesIfEnabled(state);
      await ensurePhonePrefixedCloudflareTempEmailForStep6(state);
      await addLog('步骤 6：注册成功等待完成，准备继续获取 OAuth 链接并登录。', 'ok');
      await completeNodeFromBackground('wait-registration-success', {
        freeStatus,
        freeStatusDetection: freeStatusResult,
      });
    }

    return { executeStep6 };
  }

  return {
    createStep6Executor,
    inspectStep6ChatgptFreeStatus,
    normalizeStep6FreeStatus,
  };
});
