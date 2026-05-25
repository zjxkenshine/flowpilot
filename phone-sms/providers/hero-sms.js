// phone-sms/providers/hero-sms.js - HeroSMS provider helpers and adapter
(function attachHeroSmsProvider(root, factory) {
  root.PhoneSmsHeroSmsProvider = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createHeroSmsProviderModule() {
  const PROVIDER_ID = 'hero-sms';
  const DEFAULT_BASE_URL = 'https://hero-sms.com/stubs/handler_api.php';
  const DEFAULT_SERVICE_CODE = 'dr';
  const DEFAULT_SERVICE_LABEL = 'OpenAI';
  const DEFAULT_COUNTRY_ID = 52;
  const DEFAULT_COUNTRY_LABEL = 'Thailand';
  const DEFAULT_REQUEST_TIMEOUT_MS = 20000;
  const MAX_PRICE_CANDIDATES = 8;

  function normalizeHeroSmsCountryId(value, fallback = DEFAULT_COUNTRY_ID) {
    const parsed = Math.floor(Number(value));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    const fallbackParsed = Math.floor(Number(fallback));
    return Number.isFinite(fallbackParsed) && fallbackParsed > 0 ? fallbackParsed : DEFAULT_COUNTRY_ID;
  }

  function normalizeHeroSmsCountryLabel(value = '', fallback = DEFAULT_COUNTRY_LABEL) {
    return String(value || '').trim() || fallback;
  }

  function normalizeHeroSmsMaxPrice(value = '') {
    const normalized = normalizePrice(value);
    return normalized === null || normalized <= 0 ? '' : String(normalized);
  }

  function normalizeHeroSmsCountryFallback(value = []) {
    const source = Array.isArray(value)
      ? value
      : String(value || '')
        .split(/[\r\n,，、]+/)
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
    const seen = new Set();
    const normalized = [];
    for (const entry of source) {
      let id = 0;
      let label = '';
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        id = normalizeHeroSmsCountryId(entry.id ?? entry.countryId, 0);
        label = String((entry.label ?? entry.countryLabel) || '').trim();
      } else {
        const text = String(entry || '').trim();
        const structured = text.match(/^(\d+)\s*(?:[:|/-]\s*(.+))?$/);
        id = normalizeHeroSmsCountryId(structured?.[1] || text, 0);
        label = String(structured?.[2] || '').trim();
      }
      if (!id || seen.has(id)) {
        continue;
      }
      seen.add(id);
      normalized.push({ id, label: label || `Country #${id}` });
      if (normalized.length >= 20) {
        break;
      }
    }
    return normalized;
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
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  }

  function parsePayload(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) {
      return '';
    }
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  function describePayload(raw) {
    if (typeof raw === 'string') {
      return raw.trim();
    }
    if (raw && typeof raw === 'object') {
      const direct = String(raw.message || raw.msg || raw.error || raw.title || raw.status || '').trim();
      if (direct) {
        return direct;
      }
      try {
        return JSON.stringify(raw);
      } catch {
        return String(raw);
      }
    }
    return String(raw || '').trim();
  }

  function normalizePrice(value) {
    if (value === undefined || value === null) {
      return null;
    }
    const direct = Number(value);
    if (Number.isFinite(direct) && direct >= 0) {
      return Math.round(direct * 10000) / 10000;
    }
    const text = String(value ?? '').trim();
    if (!text) {
      return null;
    }
    const matched = text.match(/-?\d+(?:[.,]\d+)?/);
    if (!matched) {
      return null;
    }
    const parsed = Number(String(matched[0] || '').replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return Math.round(parsed * 10000) / 10000;
  }

  function formatPrice(value) {
    const normalized = normalizePrice(value);
    if (normalized === null) {
      return '';
    }
    return normalized.toFixed(4).replace(/\.?0+$/, '');
  }

  function resolveStockState(payload = {}) {
    const physicalCount = Number(payload.physicalCount);
    if (Number.isFinite(physicalCount)) {
      return {
        hasStockField: true,
        stockCount: Math.max(0, physicalCount),
      };
    }
    const stockCandidates = [
      payload.count,
      payload.stock,
      payload.available,
      payload.quantity,
      payload.qty,
      payload.left,
      payload.free,
    ]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (!stockCandidates.length) {
      return {
        hasStockField: false,
        stockCount: 0,
      };
    }
    return {
      hasStockField: true,
      stockCount: Math.max(0, ...stockCandidates),
    };
  }

  function isDecimalPriceKey(key = '') {
    const text = String(key || '').trim();
    return /^-?\d+[.,]\d+$/.test(text) || /^[^\d-]*-?\d+[.,]\d+[^\d]*$/.test(text);
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

    const cost = normalizePrice(payload.cost ?? payload.price ?? payload.Price);
    if (cost !== null) {
      const stockState = resolveStockState(payload);
      entries.push({
        price: cost,
        stockCount: stockState.stockCount,
        hasStockField: stockState.hasStockField,
        inStock: !stockState.hasStockField || stockState.stockCount > 0,
        sourceAction,
      });
    }

    const pushTierMapEntries = (tierMap) => {
      if (!tierMap || typeof tierMap !== 'object' || Array.isArray(tierMap)) {
        return;
      }
      Object.entries(tierMap).forEach(([priceKey, countRaw]) => {
        const price = normalizePrice(priceKey);
        const count = Number(countRaw);
        if (price === null || !Number.isFinite(count)) {
          return;
        }
        entries.push({
          price,
          stockCount: Math.max(0, count),
          hasStockField: true,
          inStock: count > 0,
          sourceAction,
        });
      });
    };

    pushTierMapEntries(payload.freePriceMap);
    pushTierMapEntries(payload.priceMap);

    Object.entries(payload).forEach(([key, value]) => {
      const keyedPrice = normalizePrice(key);
      if (keyedPrice === null) {
        return;
      }
      if (value && typeof value === 'object') {
        const stockState = resolveStockState(value);
        const looksLikeCountryOrServiceKey = /^[0-9]{1,4}$/.test(String(key || '').trim());
        if (looksLikeCountryOrServiceKey && !isDecimalPriceKey(key)) {
          if (!stockState.hasStockField) {
            return;
          }
        }
        entries.push({
          price: keyedPrice,
          stockCount: stockState.stockCount,
          hasStockField: stockState.hasStockField,
          inStock: !stockState.hasStockField || stockState.stockCount > 0,
          sourceAction,
        });
        return;
      }
      const numericCount = Number(value);
      if (!Number.isFinite(numericCount)) {
        return;
      }
      entries.push({
        price: keyedPrice,
        stockCount: Math.max(0, numericCount),
        hasStockField: true,
        inStock: numericCount > 0,
        sourceAction,
      });
    });

    Object.values(payload).forEach((entry) => collectPriceEntries(entry, { ...options, sourceAction }, entries));
    return entries;
  }

  function collectTopCountriesPriceEntries(payload, countryId, options = {}, entries = []) {
    const normalizedCountryId = normalizeHeroSmsCountryId(countryId, 0);
    if (normalizedCountryId <= 0) {
      return entries;
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return entries;
    }
    Object.values(payload).forEach((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return;
      }
      const entryCountryId = normalizeHeroSmsCountryId(
        entry.country ?? entry.countryId ?? entry.country_id ?? entry.id,
        0
      );
      if (entryCountryId !== normalizedCountryId) {
        return;
      }
      collectPriceEntries(entry, options, entries);
    });
    return entries;
  }

  function collectVerificationPriceEntries(payload, countryId, serviceCode = DEFAULT_SERVICE_CODE, options = {}, entries = []) {
    const normalizedCountryId = normalizeHeroSmsCountryId(countryId, 0);
    if (normalizedCountryId <= 0) {
      return entries;
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return entries;
    }
    const normalizedServiceCode = String(serviceCode || '').trim() || DEFAULT_SERVICE_CODE;
    const serviceNode = payload?.[normalizedServiceCode];
    if (!serviceNode || typeof serviceNode !== 'object' || Array.isArray(serviceNode)) {
      return entries;
    }
    const countryNode = serviceNode?.[String(normalizedCountryId)];
    if (!countryNode || typeof countryNode !== 'object' || Array.isArray(countryNode)) {
      return entries;
    }
    const price = normalizePrice(countryNode.price ?? countryNode.cost);
    if (price === null) {
      return entries;
    }
    const stockCount = Number(countryNode.count);
    entries.push({
      price,
      stockCount: Number.isFinite(stockCount) ? Math.max(0, stockCount) : 0,
      hasStockField: Number.isFinite(stockCount),
      inStock: !Number.isFinite(stockCount) || stockCount > 0,
      sourceAction: String(options?.sourceAction || '').trim() || 'getPricesVerification',
    });
    return entries;
  }

  function collectEntriesFromFetchResults(fetchResults = {}, options = {}) {
    const normalizedCountryId = normalizeHeroSmsCountryId(options?.countryId, 0);
    const serviceCode = String(options?.serviceCode || DEFAULT_SERVICE_CODE).trim() || DEFAULT_SERVICE_CODE;
    const entries = [];
    Object.entries(fetchResults || {}).forEach(([action, result]) => {
      if (!result || result.payload === undefined || result.payload === null) {
        return;
      }
      if (action === 'getTopCountriesByService') {
        collectTopCountriesPriceEntries(result.payload, normalizedCountryId, { sourceAction: action }, entries);
        return;
      }
      if (action === 'getPricesVerification') {
        collectVerificationPriceEntries(result.payload, normalizedCountryId, serviceCode, { sourceAction: action }, entries);
        return;
      }
      collectPriceEntries(result.payload, { sourceAction: action }, entries);
    });
    return entries;
  }

  function mergePriceEntries(entries = []) {
    const merged = new Map();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      const price = normalizePrice(entry?.price ?? entry?.cost);
      if (price === null || price <= 0) {
        return;
      }
      const stockCount = Number.isFinite(Number(entry?.stockCount ?? entry?.count))
        ? Math.max(0, Number(entry.stockCount ?? entry.count))
        : 0;
      const hasStockField = Boolean(entry?.hasStockField ?? Number.isFinite(Number(entry?.stockCount ?? entry?.count)));
      const sourceAction = String(entry?.sourceAction || '').trim() || 'unknown';
      const previous = merged.get(price);
      if (!previous) {
        merged.set(price, {
          price,
          stockCount,
          hasStockField,
          inStock: !hasStockField || stockCount > 0,
          sourceActions: [sourceAction],
        });
        return;
      }
      previous.stockCount = Math.max(previous.stockCount, stockCount);
      previous.hasStockField = previous.hasStockField || hasStockField;
      previous.inStock = !previous.hasStockField || previous.stockCount > 0;
      if (!previous.sourceActions.includes(sourceAction)) {
        previous.sourceActions.push(sourceAction);
      }
    });
    return Array.from(merged.values()).sort((left, right) => left.price - right.price);
  }

  function buildSortedUniquePriceCandidates(values = []) {
    return Array.from(
      new Set(
        (Array.isArray(values) ? values : [])
          .map((value) => normalizePrice(value))
          .filter((value) => value !== null)
      )
    )
      .sort((left, right) => left - right)
      .slice(0, MAX_PRICE_CANDIDATES);
  }

  function reorderPriceCandidates(prices = [], options = {}) {
    const acquirePriority = String(options?.acquirePriority || 'country').trim().toLowerCase();
    const preferredPrice = normalizePrice(options?.preferredPrice);
    const hasNullTier = Array.isArray(prices)
      && prices.some((value) => value === null || value === undefined || String(value).trim() === '');
    const ordered = buildSortedUniquePriceCandidates(prices);
    if (acquirePriority === 'price_high') {
      ordered.reverse();
    }
    if (preferredPrice === null || preferredPrice <= 0) {
      return ordered.length ? ordered : (hasNullTier ? [null] : []);
    }
    const withoutPreferred = ordered.filter((value) => Number(value) !== Number(preferredPrice));
    return [preferredPrice, ...withoutPreferred];
  }

  function isPriceWithinRange(price, minPrice = null, maxPrice = null) {
    const normalized = normalizePrice(price);
    if (normalized === null || normalized <= 0) {
      return false;
    }
    const normalizedMin = normalizePrice(minPrice);
    const normalizedMax = normalizePrice(maxPrice);
    if (normalizedMin !== null && normalized < normalizedMin) {
      return false;
    }
    if (normalizedMax !== null && normalized > normalizedMax) {
      return false;
    }
    return true;
  }

  function filterPriceCandidatesWithinRange(prices = [], minPrice = null, maxPrice = null) {
    return (Array.isArray(prices) ? prices : []).filter((price) => isPriceWithinRange(price, minPrice, maxPrice));
  }

  function filterPriceCandidatesAboveFloor(prices = [], minExclusivePrice = null) {
    const floor = normalizePrice(minExclusivePrice);
    if (floor === null || floor <= 0) {
      return Array.isArray(prices) ? [...prices] : [];
    }
    return (Array.isArray(prices) ? prices : []).filter((value) => {
      const normalized = normalizePrice(value);
      return normalized !== null && normalized > floor;
    });
  }

  function formatTierPrice(price) {
    return price === null || price === undefined || String(price).trim() === '' ? 'auto' : String(price);
  }

  function formatPriceList(prices = []) {
    const source = Array.isArray(prices) ? prices : [];
    if (!source.length) {
      return 'none';
    }
    return source.map((value) => formatTierPrice(value)).join(', ');
  }

  function formatMergedTierSummary(tiers = []) {
    const source = Array.isArray(tiers) ? tiers : [];
    if (!source.length) {
      return 'none';
    }
    return source.map((tier) => {
      const priceText = formatPrice(tier?.price) || String(tier?.price ?? '');
      const stockCount = Number.isFinite(Number(tier?.stockCount)) ? Math.max(0, Number(tier.stockCount)) : 0;
      const sources = Array.isArray(tier?.sourceActions) && tier.sourceActions.length
        ? tier.sourceActions.join('+')
        : String(tier?.sourceAction || '').trim();
      const stockText = tier?.hasStockField ? `x${stockCount}` : 'stock?';
      return `${priceText}(${stockText}${sources ? ` @${sources}` : ''})`;
    }).join(', ');
  }

  function summarizeTierDiagnostics(context = {}) {
    const rawVisiblePrices = Array.isArray(context.rawVisiblePrices) ? context.rawVisiblePrices : [];
    const dedupedVisiblePrices = Array.isArray(context.dedupedVisiblePrices) ? context.dedupedVisiblePrices : [];
    const rangeFilteredPrices = Array.isArray(context.rangeFilteredPrices) ? context.rangeFilteredPrices : [];
    const floorFilteredPrices = Array.isArray(context.floorFilteredPrices) ? context.floorFilteredPrices : [];
    const visiblePricesBeforeSlice = Array.isArray(context.visiblePricesBeforeSlice) ? context.visiblePricesBeforeSlice : [];
    const finalCandidatePrices = Array.isArray(context.finalCandidatePrices) ? context.finalCandidatePrices : [];
    const tierUpgradeLimit = Number.isFinite(Number(context.tierUpgradeLimit)) ? Number(context.tierUpgradeLimit) : 0;
    const maxTierCount = Math.max(1, tierUpgradeLimit + 1);
    const oneTierReasons = [];
    if (rawVisiblePrices.length === 1) {
      oneTierReasons.push('single_interface_tier');
    }
    if (rawVisiblePrices.length > 1 && dedupedVisiblePrices.length === 1) {
      oneTierReasons.push('deduped_to_one_tier');
    }
    if (dedupedVisiblePrices.length > 1 && rangeFilteredPrices.length === 1) {
      oneTierReasons.push('range_filtered_to_one_tier');
    }
    if (rangeFilteredPrices.length > 1 && floorFilteredPrices.length === 1) {
      oneTierReasons.push('floor_filtered_to_one_tier');
    }
    if (visiblePricesBeforeSlice.length > 1 && finalCandidatePrices.length === 1 && visiblePricesBeforeSlice.length > maxTierCount) {
      oneTierReasons.push('upgrade_limited');
    }
    const zeroTierReasons = [];
    if (!rangeFilteredPrices.length && dedupedVisiblePrices.length > 0) {
      zeroTierReasons.push('range_filtered_to_zero_tier');
    }
    if (!floorFilteredPrices.length && rangeFilteredPrices.length > 0) {
      zeroTierReasons.push('floor_filtered_to_zero_tier');
    }
    return {
      singleTierReasonCodes: oneTierReasons,
      zeroTierReasonCodes: zeroTierReasons,
    };
  }

  function getSingleTierReasonLabel(reasonCode = '') {
    const normalized = String(reasonCode || '').trim();
    if (normalized === 'single_interface_tier') {
      return '接口仅返回 1 档';
    }
    if (normalized === 'deduped_to_one_tier') {
      return '同价去重后只剩 1 档';
    }
    if (normalized === 'range_filtered_to_one_tier') {
      return '价格区间过滤后只剩 1 档';
    }
    if (normalized === 'floor_filtered_to_one_tier') {
      return '回退价格下限过滤后只剩 1 档';
    }
    if (normalized === 'upgrade_limited') {
      return '升档受限未继续尝试';
    }
    return '';
  }

  function planPriceTiers(options = {}) {
    const {
      fetchResults = {},
      countryId = DEFAULT_COUNTRY_ID,
      serviceCode = DEFAULT_SERVICE_CODE,
      userLimit = null,
      minPriceLimit = null,
      maxPriceLimit = null,
      countryPriceFloor = null,
      acquirePriority = 'country',
      preferredPrice = null,
      tierUpgradeLimit = 1,
      preserveUnboundedFallback = true,
      allowSingleCountryFloorFallback = false,
    } = options;
    const entries = collectEntriesFromFetchResults(fetchResults, { countryId, serviceCode });
    const validEntries = entries.filter((entry) => normalizePrice(entry?.price) !== null && Number(entry.price) > 0);
    const visibleTiersRaw = mergePriceEntries(validEntries);
    const rawVisiblePrices = validEntries
      .map((entry) => normalizePrice(entry?.price))
      .filter((value) => value !== null && value > 0);
    const dedupedVisiblePrices = visibleTiersRaw
      .filter((tier) => tier.inStock)
      .map((tier) => tier.price);
    const minCatalogPrice = visibleTiersRaw.length ? visibleTiersRaw[0].price : null;
    const orderedPrices = reorderPriceCandidates(dedupedVisiblePrices, {
      acquirePriority,
      preferredPrice,
    });
    const rangeFilteredPrices = filterPriceCandidatesWithinRange(
      orderedPrices,
      minPriceLimit,
      maxPriceLimit
    );
    const hasPriceBounds = normalizePrice(minPriceLimit) !== null || normalizePrice(maxPriceLimit) !== null;
    const visiblePricesBeforeFloor = rangeFilteredPrices.length
      ? rangeFilteredPrices
      : (hasPriceBounds && !preserveUnboundedFallback ? [] : orderedPrices);
    const floorFilteredPrices = filterPriceCandidatesAboveFloor(
      visiblePricesBeforeFloor,
      countryPriceFloor
    );
    const hasCountryFloor = normalizePrice(countryPriceFloor) !== null && Number(countryPriceFloor) > 0;
    const visiblePricesBeforeSlice = hasCountryFloor
      ? (
        floorFilteredPrices.length
          ? floorFilteredPrices
          : (allowSingleCountryFloorFallback ? visiblePricesBeforeFloor.slice(0, 1) : [])
      )
      : (floorFilteredPrices.length ? floorFilteredPrices : visiblePricesBeforeFloor);
    const maxTierCount = Math.max(1, Math.floor(Number(tierUpgradeLimit) || 0) + 1);
    const candidateTiersFinal = visiblePricesBeforeSlice.slice(0, maxTierCount);
    const visibleTiersInRange = visibleTiersRaw.filter((tier) => rangeFilteredPrices.includes(tier.price));
    const visibleTiersBeforeSlice = visibleTiersRaw.filter((tier) => visiblePricesBeforeSlice.includes(tier.price));
    const finalCandidateTierEntries = visibleTiersRaw.filter((tier) => candidateTiersFinal.includes(tier.price));
    const normalizedUserLimit = normalizePrice(userLimit);
    const syntheticUserLimitProbe = (
      normalizedUserLimit !== null
      && candidateTiersFinal.length === 0
      && dedupedVisiblePrices.length === 0
    ) ? false : (
      normalizedUserLimit !== null
      && candidateTiersFinal.length === 0
      && minCatalogPrice !== null
      && minCatalogPrice > normalizedUserLimit
    );
    const fallbackPrices = (
      normalizedUserLimit !== null
      && candidateTiersFinal.length === 0
      && visiblePricesBeforeSlice.length === 0
    )
      ? [normalizedUserLimit]
      : [];
    const diagnostics = summarizeTierDiagnostics({
      rawVisiblePrices,
      dedupedVisiblePrices,
      rangeFilteredPrices,
      floorFilteredPrices,
      visiblePricesBeforeSlice,
      finalCandidatePrices: candidateTiersFinal,
      tierUpgradeLimit,
    });
    return {
      entries: validEntries,
      mergedTiers: visibleTiersRaw,
      visibleTiersRaw,
      visibleTiersInRange,
      visibleTiersBeforeSlice,
      candidateTiersFinal: finalCandidateTierEntries,
      rawVisiblePrices,
      dedupedVisiblePrices,
      orderedPrices,
      rangeFilteredPrices,
      floorFilteredPrices,
      visiblePricesBeforeSlice,
      finalCandidatePrices: candidateTiersFinal,
      userLimit: normalizedUserLimit,
      minCatalogPrice,
      prices: candidateTiersFinal.length
        ? candidateTiersFinal
        : (
          fallbackPrices.length
            ? fallbackPrices
            : (hasPriceBounds ? [] : (dedupedVisiblePrices.length ? visiblePricesBeforeSlice : [null]))
        ),
      syntheticUserLimitProbe,
      diagnostics: {
        ...diagnostics,
        singleTierReasons: diagnostics.singleTierReasonCodes
          .map((code) => getSingleTierReasonLabel(code))
          .filter(Boolean),
      },
      summaries: {
        rawVisible: formatPriceList(rawVisiblePrices),
        mergedVisible: formatMergedTierSummary(visibleTiersRaw),
        inRangeVisible: formatPriceList(rangeFilteredPrices),
        finalVisible: formatPriceList(visiblePricesBeforeSlice),
        finalCandidates: formatPriceList(candidateTiersFinal),
      },
      fetchResults,
    };
  }

  function summarizePreviewPriceEntries(entries = []) {
    const mergedTiers = mergePriceEntries(entries);
    const inStockPrices = mergedTiers
      .filter((entry) => entry.inStock)
      .map((entry) => entry.price)
      .sort((left, right) => left - right);
    const allPrices = mergedTiers.map((entry) => entry.price);
    return {
      entries: Array.isArray(entries) ? entries : [],
      mergedTiers,
      inStockPrices,
      allPrices,
    };
  }

  function resolveConfig(state = {}, deps = {}) {
    return {
      apiKey: String(state.heroSmsApiKey || '').trim(),
      baseUrl: state.heroSmsBaseUrl || DEFAULT_BASE_URL,
      fetchImpl: deps.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null),
      requestTimeoutMs: deps.requestTimeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
    };
  }

  async function fetchPayload(config, query, actionLabel = 'HeroSMS request') {
    if (query.api_key === undefined && config.apiKey) {
      query = { api_key: config.apiKey, ...query };
    }
    if (!config.fetchImpl) {
      throw new Error('HeroSMS 网络请求实现不可用。');
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
        const error = new Error(`${actionLabel}失败：${describePayload(payload) || response.status}`);
        error.payload = payload;
        error.status = response.status;
        throw error;
      }
      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(`${actionLabel}超时。`);
      }
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  function resolveCountryConfig(state = {}) {
    return {
      id: normalizeHeroSmsCountryId(state.heroSmsCountryId),
      label: normalizeHeroSmsCountryLabel(state.heroSmsCountryLabel),
    };
  }

  function resolveCountryCandidates(state = {}) {
    const primary = resolveCountryConfig(state);
    const seen = new Set([primary.id]);
    const candidates = [primary];
    normalizeHeroSmsCountryFallback(state.heroSmsCountryFallback).forEach((entry) => {
      const id = normalizeHeroSmsCountryId(entry.id, 0);
      if (!id || seen.has(id)) {
        return;
      }
      seen.add(id);
      candidates.push({ id, label: normalizeHeroSmsCountryLabel(entry.label, `Country #${id}`) });
    });
    return candidates;
  }

  async function fetchBalance(state = {}, deps = {}) {
    const config = resolveConfig(state, deps);
    if (!config.apiKey) {
      throw new Error('HeroSMS API Key 缺失，请先在侧边栏保存接码 API Key。');
    }
    const payload = await fetchPayload(config, { action: 'getBalance' }, 'HeroSMS getBalance');
    const balance = Number(String(describePayload(payload)).replace(/^ACCESS_BALANCE:/i, '').trim());
    return { balance, raw: payload };
  }

  async function fetchPrices(state = {}, countryConfig = resolveCountryConfig(state), deps = {}) {
    const config = resolveConfig(state, deps);
    return fetchPayload(config, {
      action: 'getPrices',
      service: DEFAULT_SERVICE_CODE,
      country: normalizeHeroSmsCountryId(countryConfig?.id),
    }, 'HeroSMS getPrices');
  }

  function createProvider(deps = {}) {
    return {
      id: PROVIDER_ID,
      label: 'HeroSMS',
      defaultCountryId: DEFAULT_COUNTRY_ID,
      defaultCountryLabel: DEFAULT_COUNTRY_LABEL,
      defaultProduct: DEFAULT_SERVICE_LABEL,
      normalizeCountryId: normalizeHeroSmsCountryId,
      normalizeCountryLabel: normalizeHeroSmsCountryLabel,
      normalizeCountryFallback: normalizeHeroSmsCountryFallback,
      normalizeMaxPrice: normalizeHeroSmsMaxPrice,
      resolveCountryCandidates,
      fetchBalance: (state) => fetchBalance(state, deps),
      fetchPrices: (state, countryConfig) => fetchPrices(state, countryConfig, deps),
      collectPriceEntries,
      collectTopCountriesPriceEntries,
      collectVerificationPriceEntries,
      collectEntriesFromFetchResults,
      mergePriceEntries,
      buildSortedUniquePriceCandidates,
      reorderPriceCandidates,
      filterPriceCandidatesWithinRange,
      filterPriceCandidatesAboveFloor,
      planPriceTiers,
      summarizePreviewPriceEntries,
      formatPrice,
      formatPriceList,
      formatMergedTierSummary,
      getSingleTierReasonLabel,
      describePayload,
    };
  }

  return {
    PROVIDER_ID,
    DEFAULT_BASE_URL,
    DEFAULT_COUNTRY_ID,
    DEFAULT_COUNTRY_LABEL,
    DEFAULT_SERVICE_CODE,
    DEFAULT_SERVICE_LABEL,
    createProvider,
    collectPriceEntries,
    collectTopCountriesPriceEntries,
    collectVerificationPriceEntries,
    collectEntriesFromFetchResults,
    mergePriceEntries,
    buildSortedUniquePriceCandidates,
    reorderPriceCandidates,
    filterPriceCandidatesWithinRange,
    filterPriceCandidatesAboveFloor,
    planPriceTiers,
    summarizePreviewPriceEntries,
    formatPrice,
    formatPriceList,
    formatMergedTierSummary,
    getSingleTierReasonLabel,
    describePayload,
    normalizeHeroSmsCountryFallback,
    normalizeHeroSmsCountryId,
    normalizeHeroSmsCountryLabel,
    normalizeHeroSmsMaxPrice,
    normalizePrice,
  };
});
