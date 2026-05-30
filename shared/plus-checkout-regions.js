(function attachPlusCheckoutRegions(root, factory) {
  root.MultiPagePlusCheckoutRegions = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createPlusCheckoutRegionsModule() {
  const AUTO_REGION_CODE = 'auto';
  const DEFAULT_REGION_CODE = 'US';

  const REGION_DEFINITIONS = Object.freeze([
    Object.freeze({ code: 'US', country: 'US', currency: 'USD', label: 'US / USD' }),
    Object.freeze({ code: 'JP', country: 'JP', currency: 'JPY', label: 'JP / JPY' }),
    Object.freeze({ code: 'BR', country: 'BR', currency: 'BRL', label: 'BR / BRL', localPayment: 'Pix' }),
    Object.freeze({ code: 'KZ', country: 'KZ', currency: 'KZT', label: 'KZ / KZT' }),
    Object.freeze({ code: 'NP', country: 'NP', currency: 'NPR', label: 'NP / NPR' }),
    Object.freeze({ code: 'IQ', country: 'IQ', currency: 'IQD', label: 'IQ / IQD' }),
  ]);

  const REGION_BY_CODE = Object.freeze(REGION_DEFINITIONS.reduce((map, region) => {
    map[region.code] = region;
    return map;
  }, {}));

  const COUNTRY_ALIASES = Object.freeze({
    US: Object.freeze(['us', 'usa', 'united states', 'united states of america', 'america', '美国']),
    JP: Object.freeze(['jp', 'jpn', 'japan', '日本']),
    BR: Object.freeze(['br', 'bra', 'brazil', 'brasil', '巴西']),
    KZ: Object.freeze(['kz', 'kazakhstan', '哈萨克斯坦', '哈萨克']),
    NP: Object.freeze(['np', 'nepal', '尼泊尔']),
    IQ: Object.freeze(['iq', 'iraq', '伊拉克']),
  });

  function getSupportedRegionCodes() {
    return REGION_DEFINITIONS.map((region) => region.code);
  }

  function normalizeCheckoutRegionCode(value = '', fallback = DEFAULT_REGION_CODE) {
    const raw = String(value ?? '').trim();
    if (!raw) {
      return fallback === AUTO_REGION_CODE ? AUTO_REGION_CODE : normalizeCheckoutRegionCode(fallback, DEFAULT_REGION_CODE);
    }

    const lower = raw.toLowerCase();
    if (lower === AUTO_REGION_CODE || lower === 'follow' || lower === 'proxy' || lower === 'exit') {
      return AUTO_REGION_CODE;
    }

    const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
    if (bracketMatch) {
      const bracketCode = bracketMatch[1].toUpperCase();
      if (REGION_BY_CODE[bracketCode]) {
        return bracketCode;
      }
    }

    const compact = raw.toUpperCase().replace(/[^A-Z]/g, '');
    if (/^[A-Z]{2}$/.test(compact) && REGION_BY_CODE[compact]) {
      return compact;
    }

    for (const [code, aliases] of Object.entries(COUNTRY_ALIASES)) {
      if (aliases.some((alias) => lower === alias || lower.includes(alias))) {
        return code;
      }
    }

    if (fallback === AUTO_REGION_CODE) {
      return AUTO_REGION_CODE;
    }
    return REGION_BY_CODE[fallback] ? fallback : DEFAULT_REGION_CODE;
  }

  function normalizeFixedCheckoutRegionCode(value = '', fallback = '') {
    const normalized = normalizeCheckoutRegionCode(value, fallback || DEFAULT_REGION_CODE);
    return normalized === AUTO_REGION_CODE ? '' : normalized;
  }

  function getCheckoutRegionDefinition(value = '', fallback = DEFAULT_REGION_CODE) {
    const normalized = normalizeCheckoutRegionCode(value, fallback);
    if (normalized === AUTO_REGION_CODE) {
      return null;
    }
    return REGION_BY_CODE[normalized] || REGION_BY_CODE[DEFAULT_REGION_CODE];
  }

  function getCheckoutBillingDetailsForRegion(value = '', fallback = DEFAULT_REGION_CODE) {
    const region = getCheckoutRegionDefinition(value, fallback) || REGION_BY_CODE[DEFAULT_REGION_CODE];
    return {
      country: region.country,
      currency: region.currency,
    };
  }

  function isSupportedCheckoutRegion(value = '') {
    const normalized = normalizeCheckoutRegionCode(value, '');
    return normalized === AUTO_REGION_CODE || Boolean(REGION_BY_CODE[normalized]);
  }

  function isAutoCheckoutRegion(value = '') {
    return normalizeCheckoutRegionCode(value, DEFAULT_REGION_CODE) === AUTO_REGION_CODE;
  }

  return {
    AUTO_REGION_CODE,
    DEFAULT_REGION_CODE,
    REGION_DEFINITIONS,
    REGION_BY_CODE,
    getSupportedRegionCodes,
    normalizeCheckoutRegionCode,
    normalizeFixedCheckoutRegionCode,
    getCheckoutRegionDefinition,
    getCheckoutBillingDetailsForRegion,
    isSupportedCheckoutRegion,
    isAutoCheckoutRegion,
  };
});
