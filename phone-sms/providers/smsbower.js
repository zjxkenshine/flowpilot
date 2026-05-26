// phone-sms/providers/smsbower.js - SMSBower phone SMS provider adapter
(function attachSmsBowerProvider(root, factory) {
  root.PhoneSmsBowerProvider = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createSmsBowerProviderModule() {
  const PROVIDER_ID = 'smsbower';
  const DEFAULT_BASE_URL = 'https://smsbower.page/stubs/handler_api.php';
  const DEFAULT_SERVICE_CODE = 'dr';
  const DEFAULT_SERVICE_LABEL = 'OpenAI';
  const DEFAULT_COUNTRY_ID = 52;
  const DEFAULT_COUNTRY_LABEL = 'Thailand';
  const DEFAULT_REQUEST_TIMEOUT_MS = 20000;
  const DEFAULT_LANG = '';
  const DEFAULT_PRICES_ACTION = 'getPricesV3';

  function normalizeSmsBowerCountryId(value, fallback = DEFAULT_COUNTRY_ID) {
    const parsed = Math.floor(Number(value));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const fallbackParsed = Math.floor(Number(fallback));
    return Number.isFinite(fallbackParsed) && fallbackParsed > 0 ? fallbackParsed : DEFAULT_COUNTRY_ID;
  }

  function normalizeSmsBowerCountryLabel(value = '', fallback = DEFAULT_COUNTRY_LABEL) {
    return String(value || '').trim() || fallback;
  }

  function normalizeSmsBowerCountryFallback(value = []) {
    const source = Array.isArray(value)
      ? value
      : String(value || '')
        .split(/[\r\n,，;；]+/)
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
    const seen = new Set();
    const normalized = [];

    for (const entry of source) {
      let id = 0;
      let label = '';
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        id = normalizeSmsBowerCountryId(entry.id ?? entry.countryId, 0);
        label = String((entry.label ?? entry.countryLabel) || '').trim();
      } else {
        const text = String(entry || '').trim();
        const structured = text.match(/^(\d+)\s*(?:[:|/-]\s*(.+))?$/);
        id = normalizeSmsBowerCountryId(structured?.[1] || text, 0);
        label = String(structured?.[2] || '').trim();
      }
      if (!id || seen.has(id)) continue;
      seen.add(id);
      normalized.push({ id, label: label || `Country #${id}` });
      if (normalized.length >= 10) break;
    }
    return normalized;
  }

  function normalizeSmsBowerPrice(value = '') {
    const rawValue = String(value ?? '').trim();
    if (!rawValue) return '';
    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';
    return String(Math.round(numeric * 10000) / 10000);
  }

  function normalizeSmsBowerServiceCode(value = '', fallback = DEFAULT_SERVICE_CODE) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
    if (normalized) return normalized;
    const fallbackNormalized = String(fallback || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
    return fallbackNormalized || DEFAULT_SERVICE_CODE;
  }

  function normalizeSmsBowerLang(value = '', fallback = DEFAULT_LANG) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'ru' || normalized === 'en') {
      return normalized;
    }
    const fallbackNormalized = String(fallback || '').trim().toLowerCase();
    return fallbackNormalized === 'ru' || fallbackNormalized === 'en' ? fallbackNormalized : DEFAULT_LANG;
  }

  function normalizeSmsBowerPricesAction(value = '', fallback = DEFAULT_PRICES_ACTION) {
    const normalized = String(value || '').trim();
    if (normalized === 'getPrices' || normalized === 'getPricesV3') {
      return normalized;
    }
    const fallbackNormalized = String(fallback || '').trim();
    return fallbackNormalized === 'getPrices' || fallbackNormalized === 'getPricesV3'
      ? fallbackNormalized
      : DEFAULT_PRICES_ACTION;
  }

  function normalizeBaseUrl(value = '') {
    const trimmed = String(value || '').trim() || DEFAULT_BASE_URL;
    try {
      return new URL(trimmed).toString();
    } catch {
      return DEFAULT_BASE_URL;
    }
  }

  function buildUrl(config = {}, query = {}) {
    const url = new URL(normalizeBaseUrl(config.baseUrl));
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  }

  function parsePayload(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return '';
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try { return JSON.parse(trimmed); } catch { return trimmed; }
    }
    return trimmed;
  }

  function describePayload(raw) {
    if (typeof raw === 'string') return raw.trim();
    if (raw && typeof raw === 'object') {
      const direct = String(raw.message || raw.msg || raw.error || raw.title || raw.status || '').trim();
      if (direct) return direct;
      try { return JSON.stringify(raw); } catch { return String(raw); }
    }
    return String(raw || '').trim();
  }

  function resolveConfig(state = {}, deps = {}) {
    return {
      apiKey: String(state.smsBowerApiKey || '').trim(),
      baseUrl: state.smsBowerBaseUrl || DEFAULT_BASE_URL,
      lang: normalizeSmsBowerLang(state.smsBowerLang, deps.lang),
      pricesAction: normalizeSmsBowerPricesAction(state.smsBowerPricesAction, deps.pricesAction),
      fetchImpl: deps.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null),
      requestTimeoutMs: deps.requestTimeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
    };
  }

  async function fetchPayload(config, query, actionLabel = 'SMSBower request') {
    if (query.api_key === undefined && config.apiKey) {
      query = { api_key: config.apiKey, ...query };
    }
    if (query.lang === undefined && config.lang) {
      query = { ...query, lang: config.lang };
    }
    if (!config.apiKey) {
      throw new Error('SMSBower API Key 缺失，请先在侧边栏保存接码 API Key。');
    }
    if (!config.fetchImpl) {
      throw new Error('SMSBower 网络请求实现不可用。');
    }

    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), Number(config.requestTimeoutMs) || DEFAULT_REQUEST_TIMEOUT_MS)
      : null;
    try {
      const response = await config.fetchImpl(buildUrl(config, query), {
        method: 'GET',
        signal: controller?.signal,
      });
      const text = await response.text();
      const payload = parsePayload(text);
      if (!response.ok) {
        const error = new Error(`${actionLabel} failed: ${describePayload(payload) || response.status}`);
        error.payload = payload;
        error.status = response.status;
        throw error;
      }
      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(`${actionLabel} timeout.`);
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  function resolveCountryConfig(state = {}) {
    return {
      id: normalizeSmsBowerCountryId(state.smsBowerCountryId ?? state.heroSmsCountryId),
      label: normalizeSmsBowerCountryLabel(state.smsBowerCountryLabel || state.heroSmsCountryLabel),
    };
  }

  function resolveCountryCandidates(state = {}) {
    const primary = resolveCountryConfig(state);
    const fallbackSource = state.smsBowerCountryFallback !== undefined
      ? state.smsBowerCountryFallback
      : state.heroSmsCountryFallback;
    const seen = new Set([primary.id]);
    const candidates = [primary];
    normalizeSmsBowerCountryFallback(fallbackSource).forEach((entry) => {
      const id = normalizeSmsBowerCountryId(entry.id, 0);
      if (!id || seen.has(id)) return;
      seen.add(id);
      candidates.push({ id, label: normalizeSmsBowerCountryLabel(entry.label, `Country #${id}`) });
    });
    return candidates;
  }

  function getServiceCode(state = {}) {
    return normalizeSmsBowerServiceCode(state.smsBowerServiceCode || DEFAULT_SERVICE_CODE);
  }

  function getPriceBounds(state = {}) {
    return {
      minPrice: normalizeSmsBowerPrice(state.smsBowerMinPrice || state.heroSmsMinPrice),
      maxPrice: normalizeSmsBowerPrice(state.smsBowerMaxPrice || state.heroSmsMaxPrice),
    };
  }

  function normalizeActivation(record, fallback = {}) {
    let activationId = '';
    let phoneNumber = '';
    let activationCost;

    if (typeof record === 'string') {
      const accessNumberMatch = record.match(/^ACCESS_NUMBER:([^:]+):(.+)$/i);
      if (accessNumberMatch) {
        activationId = String(accessNumberMatch[1] || '').trim();
        phoneNumber = String(accessNumberMatch[2] || '').trim();
      }
    } else if (record && typeof record === 'object' && !Array.isArray(record)) {
      activationId = String(record.activationId ?? record.id ?? record.activation ?? '').trim();
      phoneNumber = String(record.phoneNumber ?? record.number ?? record.phone ?? '').trim();
      if (record.cost !== undefined) {
        const normalizedCost = Number(normalizeSmsBowerPrice(record.cost));
        if (Number.isFinite(normalizedCost)) {
          activationCost = normalizedCost;
        }
      }
    }

    if (!activationId || !phoneNumber) {
      return null;
    }

    return {
      activationId,
      phoneNumber,
      provider: PROVIDER_ID,
      serviceCode: String(fallback.serviceCode || record?.serviceCode || DEFAULT_SERVICE_CODE).trim() || DEFAULT_SERVICE_CODE,
      countryId: normalizeSmsBowerCountryId(
        fallback.countryId ?? record?.countryId ?? record?.country,
        DEFAULT_COUNTRY_ID
      ),
      countryLabel: normalizeSmsBowerCountryLabel(
        fallback.countryLabel || record?.countryLabel || '',
        fallback.countryLabel || DEFAULT_COUNTRY_LABEL
      ),
      successfulUses: Math.max(0, Math.floor(Number(record?.successfulUses ?? fallback.successfulUses ?? 0) || 0)),
      maxUses: Math.max(1, Math.floor(Number(record?.maxUses ?? fallback.maxUses ?? 3) || 3)),
      ...(fallback.statusAction || record?.statusAction ? {
        statusAction: String(fallback.statusAction || record?.statusAction || '').trim(),
      } : {}),
      ...(activationCost !== undefined ? { activationCost } : {}),
    };
  }

  function parseStatusText(payload) {
    if (typeof payload === 'string') {
      return payload.trim();
    }
    return describePayload(payload);
  }

  function extractVerificationCode(payload) {
    const text = parseStatusText(payload);
    const codeMatch = text.match(/\b(\d{4,8})\b/);
    return codeMatch?.[1] || '';
  }

  function isWaitingStatus(payload) {
    return /^STATUS_(WAIT_CODE|WAIT_RETRY|WAIT_RESEND)(?::.+)?$/i.test(parseStatusText(payload));
  }

  function isSuccessStatus(payload) {
    return /^STATUS_OK:(.+)$/i.test(parseStatusText(payload));
  }

  function isNoNumbersStatus(payload) {
    return /\bNO_NUMBERS\b/i.test(parseStatusText(payload));
  }

  function isTerminalStatus(payload) {
    return /\b(NO_BALANCE|BAD_KEY|WRONG_KEY|BANNED|BAD_SERVICE|BAD_ACTION)\b/i.test(parseStatusText(payload));
  }

  async function requestActivation(state = {}, options = {}) {
    const config = resolveConfig(state, options);
    const countryCandidates = resolveCountryCandidates(state);
    if (!countryCandidates.length) {
      throw new Error('SMSBower 未选择国家，请先在侧边栏接码设置中至少选择 1 个国家。');
    }
    const serviceCode = getServiceCode(state);
    const priceBounds = getPriceBounds(state);
    const preferredPrice = normalizeSmsBowerPrice(state.smsBowerPreferredPrice);
    let lastFailure = '';
    for (const country of countryCandidates) {
      const pricesPayload = await fetchPayload(config, {
        action: config.pricesAction || DEFAULT_PRICES_ACTION,
        service: serviceCode,
        country: country.id,
      }, 'SMSBower get prices');
      const priceEntries = collectPriceEntries(pricesPayload, { sourceAction: config.pricesAction || DEFAULT_PRICES_ACTION }, []);
      const candidateTiers = buildSortedUniquePriceCandidates(
        priceEntries
          .filter((entry) => entry.inStock)
          .map((entry) => entry.price)
      ).filter((price) => {
        if (priceBounds.minPrice && price < Number(priceBounds.minPrice)) return false;
        if (priceBounds.maxPrice && price > Number(priceBounds.maxPrice)) return false;
        return true;
      });
      const orderedCandidates = preferredPrice && candidateTiers.includes(Number(preferredPrice))
        ? [Number(preferredPrice), ...candidateTiers.filter((value) => value !== Number(preferredPrice))]
        : candidateTiers;
      const tierList = orderedCandidates.length ? orderedCandidates : [null];
      for (const price of tierList) {
        const payload = await fetchPayload(config, {
          action: 'getNumber',
          service: serviceCode,
          country: country.id,
          ...(price !== null ? { maxPrice: price } : {}),
        }, 'SMSBower get number');
        if (isNoNumbersStatus(payload)) {
          lastFailure = parseStatusText(payload);
          continue;
        }
        if (isTerminalStatus(payload)) {
          throw new Error(`SMSBower request activation failed: ${parseStatusText(payload)}`);
        }
        const activation = normalizeActivation(payload, {
          serviceCode,
          countryId: country.id,
          countryLabel: country.label,
        });
        if (activation) {
          return activation;
        }
        lastFailure = parseStatusText(payload) || 'empty response';
      }
    }
    throw new Error(`SMSBower no numbers available: ${lastFailure || 'NO_NUMBERS'}.`);
  }

  async function finishActivation(state = {}, activation) {
    const normalizedActivation = normalizeActivation(activation);
    if (!normalizedActivation) {
      throw new Error('Missing SMSBower activation.');
    }
    const config = resolveConfig(state);
    await fetchPayload(config, {
      action: 'setStatus',
      id: normalizedActivation.activationId,
      status: 6,
    }, 'SMSBower finish activation');
  }

  async function cancelActivation(state = {}, activation) {
    const normalizedActivation = normalizeActivation(activation);
    if (!normalizedActivation) {
      throw new Error('Missing SMSBower activation.');
    }
    const config = resolveConfig(state);
    await fetchPayload(config, {
      action: 'setStatus',
      id: normalizedActivation.activationId,
      status: 8,
    }, 'SMSBower cancel activation');
  }

  async function banActivation(state = {}, activation) {
    return cancelActivation(state, activation);
  }

  async function requestAdditionalSms(state = {}, activation) {
    const normalizedActivation = normalizeActivation(activation);
    if (!normalizedActivation) {
      throw new Error('Missing SMSBower activation.');
    }
    const config = resolveConfig(state);
    await fetchPayload(config, {
      action: 'setStatus',
      id: normalizedActivation.activationId,
      status: 3,
    }, 'SMSBower request additional sms');
  }

  async function pollActivationCode(state = {}, activation, options = {}) {
    const normalizedActivation = normalizeActivation(activation);
    if (!normalizedActivation) {
      throw new Error('Missing SMSBower activation.');
    }
    const config = resolveConfig(state, options);
    const timeoutMs = Math.max(1000, Number(options.timeoutMs) || 180000);
    const intervalMs = Math.max(500, Number(options.intervalMs) || 5000);
    const maxRoundsRaw = Math.floor(Number(options.maxRounds));
    const maxRounds = Number.isFinite(maxRoundsRaw) && maxRoundsRaw > 0 ? maxRoundsRaw : 0;
    const start = Date.now();
    let rounds = 0;
    let lastStatus = '';
    while ((Date.now() - start) < timeoutMs) {
      rounds += 1;
      const payload = await fetchPayload(config, {
        action: normalizedActivation.statusAction === 'getStatusV2' ? 'getStatusV2' : 'getStatus',
        id: normalizedActivation.activationId,
      }, 'SMSBower get status');
      lastStatus = parseStatusText(payload);
      if (isSuccessStatus(payload)) {
        const code = extractVerificationCode(payload);
        if (code) {
          return code;
        }
      }
      if (!isWaitingStatus(payload) && !isSuccessStatus(payload)) {
        throw new Error(`SMSBower poll activation code failed: ${lastStatus || 'unknown status'}`);
      }
      if (maxRounds && rounds >= maxRounds) {
        break;
      }
      if ((Date.now() - start + intervalMs) >= timeoutMs) {
        break;
      }
      if (typeof options.sleepWithStop === 'function') {
        await options.sleepWithStop(intervalMs);
      } else if (typeof setTimeout === 'function') {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    throw new Error(`PHONE_CODE_TIMEOUT::SMSBower did not return a verification code in time. Last status: ${lastStatus || 'unknown'}.`);
  }

  async function fetchBalance(state = {}, options = {}) {
    const config = resolveConfig(state, options);
    const payload = await fetchPayload(config, {
      action: 'getBalance',
    }, 'SMSBower get balance');
    const text = parseStatusText(payload);
    const match = text.match(/BALANCE:?([0-9]+(?:\.[0-9]+)?)/i);
    return match ? Number(match[1]) : null;
  }

  async function fetchPrices(state = {}, countryConfig, options = {}) {
    const config = resolveConfig(state, options);
    return fetchPayload(config, {
      action: config.pricesAction || DEFAULT_PRICES_ACTION,
      service: getServiceCode(state),
      country: normalizeSmsBowerCountryId(countryConfig?.id ?? state.smsBowerCountryId),
    }, 'SMSBower get prices');
  }

  function collectPriceEntries(payload, options = {}, entries = []) {
    const sourceAction = String(options?.sourceAction || '').trim() || 'unknown';
    if (Array.isArray(payload)) {
      payload.forEach((entry) => collectPriceEntries(entry, { ...options, sourceAction }, entries));
      return entries;
    }
    if (!payload || typeof payload !== 'object') {
      return entries;
    }

    const cost = Number(normalizeSmsBowerPrice(payload.cost ?? payload.price ?? payload.Price));
    if (Number.isFinite(cost) && cost > 0) {
      const stockCount = Math.max(
        0,
        Number(payload.physicalCount ?? payload.count ?? payload.stock ?? payload.available ?? payload.quantity ?? payload.qty ?? payload.left ?? payload.free) || 0
      );
      entries.push({
        price: cost,
        stockCount,
        hasStockField: true,
        inStock: stockCount > 0,
        sourceAction,
      });
    }

    const pushMapEntries = (node) => {
      if (!node || typeof node !== 'object' || Array.isArray(node)) {
        return;
      }
      Object.entries(node).forEach(([priceKey, value]) => {
        const price = Number(normalizeSmsBowerPrice(priceKey));
        if (!Number.isFinite(price) || price <= 0) {
          return;
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const stockCount = Math.max(
            0,
            Number(value.physicalCount ?? value.count ?? value.stock ?? value.available ?? value.quantity ?? value.qty ?? value.left ?? value.free) || 0
          );
          entries.push({
            price,
            stockCount,
            hasStockField: true,
            inStock: stockCount > 0,
            sourceAction,
          });
          return;
        }
        const numericCount = Number(value);
        if (!Number.isFinite(numericCount)) {
          return;
        }
        entries.push({
          price,
          stockCount: Math.max(0, numericCount),
          hasStockField: true,
          inStock: numericCount > 0,
          sourceAction,
        });
      });
    };

    pushMapEntries(payload.priceMap);
    Object.values(payload).forEach((value) => collectPriceEntries(value, options, entries));
    return entries;
  }

  function buildSortedUniquePriceCandidates(values = []) {
    return Array.from(
      new Set(
        (Array.isArray(values) ? values : [])
          .map((value) => Number(normalizeSmsBowerPrice(value)))
          .filter((value) => Number.isFinite(value) && value > 0)
          .map((value) => Math.round(value * 10000) / 10000)
      )
    ).sort((left, right) => left - right);
  }

  function createProvider(deps = {}) {
    return {
      id: PROVIDER_ID,
      label: 'SMSBower',
      defaultCountryId: DEFAULT_COUNTRY_ID,
      defaultCountryLabel: DEFAULT_COUNTRY_LABEL,
      defaultProduct: DEFAULT_SERVICE_LABEL,
      defaultServiceCode: DEFAULT_SERVICE_CODE,
      normalizeCountryId: normalizeSmsBowerCountryId,
      normalizeCountryLabel: normalizeSmsBowerCountryLabel,
      normalizeCountryFallback: normalizeSmsBowerCountryFallback,
      normalizeMaxPrice: normalizeSmsBowerPrice,
      normalizeServiceCode: normalizeSmsBowerServiceCode,
      resolveCountryCandidates,
      requestActivation: (state, options) => requestActivation(state, { ...deps, ...options }),
      finishActivation,
      cancelActivation,
      banActivation,
      requestAdditionalSms,
      pollActivationCode: (state, activation, options) => pollActivationCode(state, activation, { ...deps, ...options }),
      fetchBalance: (state, options) => fetchBalance(state, { ...deps, ...options }),
      fetchPrices: (state, countryConfig, options) => fetchPrices(state, countryConfig, { ...deps, ...options }),
      collectPriceEntries,
      describePayload,
      normalizeSmsBowerServiceCode,
    };
  }

  return {
    PROVIDER_ID,
    DEFAULT_BASE_URL,
    DEFAULT_COUNTRY_ID,
    DEFAULT_COUNTRY_LABEL,
    DEFAULT_LANG,
    DEFAULT_PRICES_ACTION,
    DEFAULT_SERVICE_CODE,
    DEFAULT_SERVICE_LABEL,
    createProvider,
    normalizeSmsBowerCountryId,
    normalizeSmsBowerCountryLabel,
    normalizeSmsBowerCountryFallback,
    normalizeSmsBowerPrice,
    normalizeSmsBowerServiceCode,
    collectPriceEntries,
    describePayload,
  };
});
