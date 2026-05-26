// phone-sms/providers/chatgpt-api.js - custom pool-backed SMS provider
(function attachChatGptApiPhoneProvider(root, factory) {
  root.PhoneSmsChatGptApiProvider = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createChatGptApiPhoneProviderModule() {
  const PROVIDER_ID = 'chatgpt-api';
  const PROVIDER_LABEL = 'ChatGPT API 接码';
  const DEFAULT_SERVICE_LABEL = 'OpenAI / ChatGPT';
  const DEFAULT_SERVICE_CODE = 'custom-api';
  const DEFAULT_REQUEST_TIMEOUT_MS = 20000;
  const POOL_SEPARATOR = '----';
  const AUTO_DISABLE_THRESHOLD = 2;
  const COUNTRY_BY_PHONE_PREFIX = Object.freeze([
    { prefix: '63', id: 4, label: 'Philippines' },
    { prefix: '254', id: 8, label: 'Kenya' },
    { prefix: '84', id: 10, label: 'Vietnam' },
    { prefix: '48', id: 15, label: 'Poland' },
    { prefix: '44', id: 16, label: 'United Kingdom' },
    { prefix: '40', id: 32, label: 'Romania' },
    { prefix: '57', id: 33, label: 'Colombia' },
    { prefix: '62', id: 6, label: 'Indonesia' },
    { prefix: '66', id: 52, label: 'Thailand' },
    { prefix: '49', id: 43, label: 'Germany' },
    { prefix: '55', id: 73, label: 'Brazil' },
    { prefix: '33', id: 78, label: 'France' },
    { prefix: '56', id: 151, label: 'Chile' },
    { prefix: '81', id: 182, label: 'Japan' },
    { prefix: '1', id: 187, label: 'USA' },
  ]);
  const POOL_TEXT_KEY = 'chatGptApiSmsPoolText';
  const POOL_USAGE_KEY = 'chatGptApiSmsPoolUsage';
  const CURRENT_ENTRY_KEY = 'chatGptApiCurrentSmsEntry';
  const AUTO_DISABLE_ENABLED_KEY = 'chatGptApiSmsPoolAutoDisableEnabled';
  const PHONE_CODE_TIMEOUT_ERROR_PREFIX = 'PHONE_CODE_TIMEOUT::';

  function normalizeText(value = '') {
    return String(value || '').trim();
  }

  function normalizePoolText(value = '') {
    return String(value || '')
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }

  function normalizePoolPhone(value = '') {
    const rawValue = normalizeText(value);
    const digits = rawValue.replace(/\D+/g, '');
    return digits || rawValue;
  }

  function normalizePoolUrl(value = '') {
    const rawValue = normalizeText(value);
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

  function buildPoolKey(phone = '', verificationUrl = '') {
    const normalizedPhone = normalizePoolPhone(phone);
    const normalizedUrl = normalizePoolUrl(verificationUrl);
    return normalizedPhone && normalizedUrl ? `${normalizedPhone}${POOL_SEPARATOR}${normalizedUrl}` : '';
  }

  function parseEntries(text = '') {
    const lines = normalizePoolText(text).split('\n').filter(Boolean);
    const seen = new Set();
    const entries = [];
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const separatorIndex = line.indexOf(POOL_SEPARATOR);
      const hasSeparator = separatorIndex > 0;
      const phone = hasSeparator
        ? normalizePoolPhone(line.slice(0, separatorIndex))
        : normalizePoolPhone(line);
      const verificationUrl = hasSeparator
        ? normalizePoolUrl(line.slice(separatorIndex + POOL_SEPARATOR.length))
        : normalizePoolUrl(lines[index + 1] || '');
      if (!hasSeparator && verificationUrl) {
        index += 1;
      }
      const key = buildPoolKey(phone, verificationUrl);
      if (!phone || !verificationUrl || !key || seen.has(key)) {
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

  function normalizeUsage(value = {}) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
      const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
      const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
      return [normalizeText(key), {
        useCount,
        usedAt: Math.max(0, Number(usage.usedAt) || 0),
        lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
        lastError: normalizeText(usage.lastError),
        enabled: usage.enabled !== false,
        disabledReason: normalizeText(usage.disabledReason),
        disabledAt: Math.max(0, Number(usage.disabledAt) || 0),
        failureCount: Math.max(0, Math.floor(Number(usage.failureCount) || 0)),
      }];
    }).filter(([key]) => Boolean(key)));
  }

  function parsePayloadText(text = '') {
    const rawText = String(text || '');
    try {
      return rawText ? JSON.parse(rawText) : {};
    } catch {
      return rawText;
    }
  }

  function collectPayloadCandidates(value, path = '', seen = new Set()) {
    if (value === null || value === undefined) {
      return [];
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      return text ? [{ key: String(path).split('.').pop() || '', path, text }] : [];
    }
    if (typeof value !== 'object') {
      return [];
    }
    if (seen.has(value)) {
      return [];
    }
    seen.add(value);
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => collectPayloadCandidates(item, `${path}[${index}]`, seen));
    }
    return Object.entries(value).flatMap(([key, child]) => (
      collectPayloadCandidates(child, path ? `${path}.${key}` : key, seen)
    ));
  }

  function extractVerificationCode(payload = {}) {
    const contextualCodePattern = /(?:verification\s*code|one[-\s]?time\s*(?:passcode|code)|passcode|otp|code|验证码|安全码)[\s\S]{0,50}?(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)|(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)[\s\S]{0,50}?(?:verification\s*code|one[-\s]?time\s*(?:passcode|code)|passcode|otp|code|验证码|安全码)/i;
    const exactCodePattern = /^\D*(\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d)\D*$/;
    const trustedTextKeyPattern = /^(sms|message|msg|text|content|body|code|otp|verification_code|verificationCode)$/i;
    const metadataKeyPattern = /(^|[_-])(phone|mobile|tel|id|order|time|date|expired|expire|status)([_-]|$)/i;
    const candidates = collectPayloadCandidates(payload);

    for (const candidate of candidates) {
      const match = String(candidate.text || '').match(contextualCodePattern);
      const code = match ? (match[1] || match[2]).replace(/\D+/g, '') : '';
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
      const match = String(candidate.text || '').match(exactCodePattern);
      if (match) {
        return match[1].replace(/\D+/g, '');
      }
    }

    return '';
  }

  function describePayload(payload) {
    if (typeof payload === 'string') {
      return payload.trim();
    }
    if (payload && typeof payload === 'object') {
      const direct = String(payload.message || payload.msg || payload.error || payload.title || payload.status || '').trim();
      if (direct) {
        return direct;
      }
      try {
        return JSON.stringify(payload);
      } catch {
        return String(payload);
      }
    }
    return String(payload || '').trim();
  }

  function buildNoCodeMessage(payload = {}) {
    const preview = describePayload(payload).replace(/\s+/g, ' ').trim().slice(0, 180);
    return preview
      ? `验证码接口暂未返回有效验证码：${preview}`
      : '验证码接口暂未返回有效验证码。';
  }

  function chooseEntry(entries = [], usage = {}) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }
    const normalizedUsage = normalizeUsage(usage);
    return entries
      .map((entry, index) => {
        const itemUsage = normalizedUsage[entry.key] || {};
        return {
          ...entry,
          index: Number.isFinite(entry.index) ? entry.index : index,
          useCount: Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)),
          usedAt: Math.max(0, Number(itemUsage.usedAt) || 0),
          enabled: itemUsage.enabled !== false,
        };
      })
      .filter((entry) => entry.enabled)
      .sort((left, right) => {
        if (left.useCount !== right.useCount) {
          return left.useCount - right.useCount;
        }
        if (left.usedAt !== right.usedAt) {
          return left.usedAt - right.usedAt;
        }
        return left.index - right.index;
      })[0] || null;
  }

  function inferCountryFromPhone(phoneNumber = '') {
    const digits = String(phoneNumber || '').replace(/\D+/g, '');
    if (!digits) {
      return {
        id: null,
        label: '',
      };
    }
    const matched = COUNTRY_BY_PHONE_PREFIX.find((item) => digits.startsWith(item.prefix));
    if (!matched) {
      return {
        id: null,
        label: '',
      };
    }
    return {
      id: matched.id,
      label: matched.label,
    };
  }

  async function updateState(deps = {}, patch = {}) {
    if (typeof deps.setState === 'function') {
      await deps.setState(patch);
    }
    if (typeof deps.broadcastDataUpdate === 'function') {
      await deps.broadcastDataUpdate(patch);
    }
  }

  async function requestActivation(state = {}, deps = {}) {
    const entries = parseEntries(state?.[POOL_TEXT_KEY] || '');
    const usage = normalizeUsage(state?.[POOL_USAGE_KEY] || {});
    const selected = chooseEntry(entries, usage);
    if (!selected) {
      throw new Error('ChatGPT API 接码池为空，或所有号码都已被禁用。');
    }
    const nextUsage = {
      ...usage,
      [selected.key]: {
        ...(usage[selected.key] || {}),
        useCount: Math.max(0, Math.floor(Number(usage[selected.key]?.useCount) || 0)) + 1,
        usedAt: Date.now(),
        lastAttemptAt: Date.now(),
        lastError: '',
        enabled: usage[selected.key]?.enabled !== false,
        disabledReason: '',
        disabledAt: 0,
        failureCount: Math.max(0, Math.floor(Number(usage[selected.key]?.failureCount) || 0)),
      },
    };
    const currentEntry = {
      key: selected.key,
      phone: selected.phone,
      verificationUrl: selected.verificationUrl,
    };
    await updateState(deps, {
      [POOL_USAGE_KEY]: nextUsage,
      [CURRENT_ENTRY_KEY]: currentEntry,
    });

    const country = inferCountryFromPhone(selected.phone);
    return {
      provider: PROVIDER_ID,
      activationId: selected.key,
      phoneNumber: selected.phone,
      countryId: country.id,
      countryLabel: country.label,
      serviceCode: DEFAULT_SERVICE_CODE,
      successfulUses: 0,
      maxUses: 1,
      source: 'chatgpt-api-pool',
    };
  }

  async function finishActivation(_state = {}, _activation = {}, deps = {}) {
    await updateState(deps, {
      [CURRENT_ENTRY_KEY]: null,
    });
  }

  async function cancelActivation(_state = {}, _activation = {}, deps = {}) {
    await updateState(deps, {
      [CURRENT_ENTRY_KEY]: null,
    });
  }

  async function banActivation(state = {}, activation = {}, deps = {}) {
    const key = normalizeText(activation.activationId || activation.key);
    const usage = normalizeUsage(state?.[POOL_USAGE_KEY] || {});
    if (!key || !usage[key]) {
      await cancelActivation(state, activation, deps);
      return;
    }
    const nextUsage = {
      ...usage,
      [key]: {
        ...usage[key],
        enabled: false,
        disabledReason: normalizeText(usage[key].disabledReason || 'banned'),
        disabledAt: usage[key].disabledAt || Date.now(),
      },
    };
    await updateState(deps, {
      [POOL_USAGE_KEY]: nextUsage,
      [CURRENT_ENTRY_KEY]: null,
    });
  }

  async function requestAdditionalSms(_state = {}, _activation = {}, _deps = {}) {
    return;
  }

  async function fetchPayload(deps = {}, url = '') {
    const fetchImpl = deps.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    if (typeof fetchImpl !== 'function') {
      throw new Error('ChatGPT API 接码网络请求实现不可用。');
    }
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), Number(deps.requestTimeoutMs) || DEFAULT_REQUEST_TIMEOUT_MS)
      : null;
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        signal: controller?.signal,
      });
      const text = await response.text();
      const payload = parsePayloadText(text);
      if (!response.ok) {
        throw new Error(describePayload(payload) || `HTTP ${response.status}`);
      }
      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('ChatGPT API 接码请求超时。');
      }
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  async function pollActivationCode(state = {}, activation = {}, options = {}, deps = {}) {
    const key = normalizeText(activation.activationId || activation.key);
    const entries = parseEntries(state?.[POOL_TEXT_KEY] || '');
    const matchedEntry = entries.find((entry) => entry.key === key)
      || (state?.[CURRENT_ENTRY_KEY] && state[CURRENT_ENTRY_KEY].key === key ? state[CURRENT_ENTRY_KEY] : null);
    if (!matchedEntry?.verificationUrl) {
      throw new Error('ChatGPT API 接码池当前号码缺少验证码接口地址。');
    }
    const timeoutMs = Math.max(1, Number(options.timeoutMs) || 180000);
    const intervalMs = Math.max(1, Number(options.intervalMs) || 5000);
    const maxRoundsRaw = Math.floor(Number(options.maxRounds));
    const maxRounds = Number.isFinite(maxRoundsRaw) && maxRoundsRaw > 0 ? maxRoundsRaw : 0;
    const autoDisableEnabled = Boolean(state?.[AUTO_DISABLE_ENABLED_KEY]);
    const start = Date.now();
    let round = 0;
    let lastErrorMessage = '';
    let lastPayload = null;

    while ((Date.now() - start) < timeoutMs) {
      round += 1;
      lastPayload = await fetchPayload(deps, matchedEntry.verificationUrl);
      const code = extractVerificationCode(lastPayload);
      if (code) {
        const usage = normalizeUsage((typeof deps.getState === 'function' ? await deps.getState() : state)?.[POOL_USAGE_KEY] || state?.[POOL_USAGE_KEY] || {});
        const nextUsage = {
          ...usage,
          [key]: {
            ...(usage[key] || {}),
            lastAttemptAt: Date.now(),
            lastError: '',
            failureCount: 0,
            enabled: usage[key]?.enabled !== false,
            disabledReason: '',
            disabledAt: 0,
          },
        };
        await updateState(deps, {
          [POOL_USAGE_KEY]: nextUsage,
        });
        return code;
      }

      lastErrorMessage = buildNoCodeMessage(lastPayload);
      if (maxRounds && round >= maxRounds) {
        break;
      }
      if ((Date.now() - start + intervalMs) >= timeoutMs) {
        break;
      }
      if (typeof deps.sleepWithStop === 'function') {
        await deps.sleepWithStop(intervalMs);
      } else {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    const currentState = typeof deps.getState === 'function' ? await deps.getState() : state;
    const usage = normalizeUsage(currentState?.[POOL_USAGE_KEY] || {});
    const previous = usage[key] || {};
    const failureCount = Math.max(0, Math.floor(Number(previous.failureCount) || 0)) + 1;
    const shouldDisable = autoDisableEnabled && failureCount >= AUTO_DISABLE_THRESHOLD;
    const nextUsage = {
      ...usage,
      [key]: {
        ...previous,
        lastAttemptAt: Date.now(),
        lastError: lastErrorMessage,
        failureCount,
        enabled: shouldDisable ? false : previous.enabled !== false,
        disabledReason: shouldDisable ? lastErrorMessage : normalizeText(previous.disabledReason),
        disabledAt: shouldDisable ? Date.now() : Math.max(0, Number(previous.disabledAt) || 0),
      },
    };
    await updateState(deps, {
      [POOL_USAGE_KEY]: nextUsage,
    });
    throw new Error(`${PHONE_CODE_TIMEOUT_ERROR_PREFIX}${lastErrorMessage}`);
  }

  function createProvider(deps = {}) {
    return {
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      defaultProduct: DEFAULT_SERVICE_LABEL,
      defaultServiceCode: DEFAULT_SERVICE_CODE,
      requestActivation: async (state, options = {}) => requestActivation(state, { ...deps, ...options }),
      finishActivation: async (state, activation) => finishActivation(state, activation, deps),
      cancelActivation: async (state, activation) => cancelActivation(state, activation, deps),
      banActivation: async (state, activation) => banActivation(state, activation, deps),
      requestAdditionalSms: async (state, activation) => requestAdditionalSms(state, activation, deps),
      pollActivationCode: async (state, activation, options = {}) => pollActivationCode(state, activation, options, deps),
      normalizeUsage,
      parseEntries,
      extractVerificationCode,
      describePayload,
      inferCountryFromPhone,
    };
  }

  return {
    PROVIDER_ID,
    PROVIDER_LABEL,
    DEFAULT_SERVICE_LABEL,
    DEFAULT_SERVICE_CODE,
    POOL_TEXT_KEY,
    POOL_USAGE_KEY,
    CURRENT_ENTRY_KEY,
    AUTO_DISABLE_ENABLED_KEY,
    createProvider,
  };
});
