// background/ip-proxy-provider-711proxy.js — 711Proxy 参数、账号规则与 API URL 规则
(function register711ProxyProvider(root) {
  const GLOBAL_ROOT = (typeof globalThis !== 'undefined' && globalThis) ? globalThis : root;
  const KNOWN_711_API_PARAM_KEYS = new Set([
    'count',
    'region',
    'proto',
    'stype',
    'split',
    'zone',
    'ptype',
    'sessType',
    'sessTime',
    'sessAuto',
  ]);
  const DEFAULT_711_API_SPLIT = '\\r\\n';

  function publish711Exports(exportsObject = {}) {
    Object.keys(exportsObject).forEach((key) => {
      root[key] = exportsObject[key];
      if (GLOBAL_ROOT && GLOBAL_ROOT !== root) {
        GLOBAL_ROOT[key] = exportsObject[key];
      }
    });
  }

  function normalizeCountryCode(value = '') {
    const raw = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
    return /^[A-Z]{2}$/.test(raw) ? raw : '';
  }

  function normalize711SessionId(value = '') {
    return String(value || '').trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  }

  function normalize711SessionMinutes(value = '') {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isInteger(numeric)) return '';
    return String(Math.max(1, Math.min(180, numeric)));
  }

  function normalize711ApiCount(value = '') {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 900) return '';
    return String(numeric);
  }

  function normalize711ApiProtocol(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return ['http', 'https', 'socks4', 'socks5'].includes(normalized) ? normalized : '';
  }

  function normalize711ApiStyle(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'json' ? 'json' : 'text';
  }

  function decode711ApiSplitValue(value = '') {
    return String(value ?? '')
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t');
  }

  function encode711ApiSplitValue(value = '') {
    return String(value ?? '')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
  }

  function normalize711ApiSplitValue(value = '', fallback = DEFAULT_711_API_SPLIT) {
    const raw = String(value ?? '');
    if (!raw) {
      return String(fallback ?? DEFAULT_711_API_SPLIT);
    }
    const decoded = decode711ApiSplitValue(raw);
    return decoded || String(fallback ?? DEFAULT_711_API_SPLIT);
  }

  function normalize711ApiZone(value = '') {
    return String(value || '').trim();
  }

  function normalize711ApiPlanType(value = '') {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isInteger(numeric) || numeric <= 0) return '';
    return String(numeric);
  }

  function normalize711ApiSessionType(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized === 'sticky' || normalized === 'static') return 'sticky';
    if (normalized === 'rotating' || normalized === 'rotation') return 'rotating';
    return '';
  }

  function normalize711ApiSessionAuto(value = '') {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    return raw === '0' || raw === '1' ? raw : '';
  }

  function has711SessionToken(username = '') {
    const text = String(username || '').trim();
    if (!text) {
      return false;
    }
    return /(?:^|[-_])session[-_:][A-Za-z0-9_-]+?(?=(?:[-_](?:sessTime|sessAuto|region|life|zone|ptype|country|area)\b)|$)/i.test(text);
  }

  function apply711SessionToUsername(username = '', options = {}) {
    const text = String(username || '').trim();
    if (!text) {
      return text;
    }

    const sessionId = normalize711SessionId(options?.sessionId || '');
    const sessTime = normalize711SessionMinutes(options?.sessTime || '');
    let next = text;

    if (sessionId) {
      if (/(?:^|[-_])session[-_:][A-Za-z0-9_-]+?(?=(?:[-_](?:sessTime|sessAuto|region|life|zone|ptype|country|area)\b)|$)/i.test(next)) {
        next = next.replace(
          /((?:^|[-_])session[-_:])([A-Za-z0-9_-]+?)(?=(?:[-_](?:sessTime|sessAuto|region|life|zone|ptype|country|area)\b)|$)/i,
          `$1${sessionId}`
        );
      } else {
        next = `${next}-session-${sessionId}`;
      }
    }

    if (sessTime) {
      if (/(?:^|[-_])sessTime[-_:]?\d+\b/i.test(next)) {
        next = next.replace(/((?:^|[-_])sessTime[-_:]?)(\d+)\b/i, `$1${sessTime}`);
      } else {
        next = `${next}-sessTime-${sessTime}`;
      }
    }

    return next;
  }

  function apply711RegionToUsername(username = '', regionCode = '') {
    const text = String(username || '').trim();
    const normalizedRegion = normalizeCountryCode(regionCode);
    if (!text || !normalizedRegion) {
      return text;
    }
    if (/(?:^|[-_])region[-_:]?[A-Za-z]{2}\b/i.test(text)) {
      return text.replace(/((?:^|[-_])region[-_:]?)([A-Za-z]{2})\b/i, `$1${normalizedRegion}`);
    }
    return `${text}-region-${normalizedRegion}`;
  }

  function resolve711ProxyRegionFromInputs({ host = '', username = '', region = '' } = {}) {
    const fromUsername = String(username || '').match(/(?:^|[-_])region[-_:]?([A-Za-z]{2})\b/i);
    if (fromUsername?.[1]) {
      return normalizeCountryCode(fromUsername[1]);
    }
    const hostText = String(host || '').trim().toLowerCase().replace(/\.$/, '');
    if (hostText && hostText.includes('.')) {
      const firstLabel = String(hostText.split('.')[0] || '').trim();
      if (/^[a-z]{2}$/.test(firstLabel)) {
        return firstLabel.toUpperCase();
      }
    }
    return normalizeCountryCode(region);
  }

  function transform711ProxyAccountEntry(entry = {}, context = {}) {
    const state = context?.state || {};
    const hasAccountList = Boolean(context?.hasAccountList);
    const nextEntry = { ...entry };
    const username = String(nextEntry.username || '').trim();
    if (!username) {
      return nextEntry;
    }

    const configuredRegion = normalizeCountryCode(state?.ipProxyRegion || '');
    if (!hasAccountList && configuredRegion) {
      nextEntry.username = apply711RegionToUsername(username, configuredRegion);
      if (!String(nextEntry.region || '').trim()) {
        nextEntry.region = configuredRegion;
      }
    }

    if (hasAccountList) {
      return nextEntry;
    }

    const sessionId = normalize711SessionId(state?.ipProxyAccountSessionPrefix || '');
    const sessTime = normalize711SessionMinutes(state?.ipProxyAccountLifeMinutes || '');
    if (!sessionId && !sessTime) {
      return nextEntry;
    }

    nextEntry.username = apply711SessionToUsername(nextEntry.username, {
      sessionId,
      sessTime,
    });
    return nextEntry;
  }

  function parse711ProxyApiConfigFromUrl(apiUrl = '') {
    const rawUrl = String(apiUrl || '').trim();
    const defaultResult = {
      apiUrl: rawUrl,
      baseUrl: '',
      isValidUrl: false,
      urlObject: null,
      count: '',
      region: '',
      proto: '',
      stype: 'text',
      split: DEFAULT_711_API_SPLIT,
      zone: '',
      ptype: '',
      sessType: '',
      sessTime: '',
      sessAuto: '',
    };
    if (!rawUrl) {
      return defaultResult;
    }

    let urlObject;
    try {
      urlObject = new URL(rawUrl);
    } catch {
      return defaultResult;
    }
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return defaultResult;
    }

    return {
      apiUrl: rawUrl,
      baseUrl: `${urlObject.origin}${urlObject.pathname}`,
      isValidUrl: true,
      urlObject,
      count: normalize711ApiCount(urlObject.searchParams.get('count') || ''),
      region: normalizeCountryCode(urlObject.searchParams.get('region') || ''),
      proto: normalize711ApiProtocol(urlObject.searchParams.get('proto') || ''),
      stype: normalize711ApiStyle(urlObject.searchParams.get('stype') || ''),
      split: normalize711ApiSplitValue(urlObject.searchParams.get('split') || ''),
      zone: normalize711ApiZone(urlObject.searchParams.get('zone') || ''),
      ptype: normalize711ApiPlanType(urlObject.searchParams.get('ptype') || ''),
      sessType: normalize711ApiSessionType(urlObject.searchParams.get('sessType') || ''),
      sessTime: normalize711SessionMinutes(urlObject.searchParams.get('sessTime') || ''),
      sessAuto: normalize711ApiSessionAuto(urlObject.searchParams.get('sessAuto') || ''),
    };
  }

  function normalize711ProxyApiConfig(config = {}) {
    const parsed = parse711ProxyApiConfigFromUrl(config?.apiUrl || config?.baseUrl || '');
    const sessType = normalize711ApiSessionType(config?.sessType ?? parsed.sessType);
    const stype = normalize711ApiStyle(config?.stype ?? parsed.stype);
    return {
      apiUrl: String(config?.apiUrl ?? parsed.apiUrl ?? '').trim(),
      baseUrl: String(config?.baseUrl ?? parsed.baseUrl ?? '').trim(),
      isValidUrl: Boolean(config?.isValidUrl ?? parsed.isValidUrl),
      count: normalize711ApiCount(config?.count ?? parsed.count),
      region: normalizeCountryCode(config?.region ?? parsed.region),
      proto: normalize711ApiProtocol(config?.proto ?? parsed.proto),
      stype,
      split: stype === 'json'
        ? ''
        : normalize711ApiSplitValue(config?.split ?? parsed.split),
      zone: normalize711ApiZone(config?.zone ?? parsed.zone),
      ptype: normalize711ApiPlanType(config?.ptype ?? parsed.ptype),
      sessType,
      sessTime: sessType === 'sticky'
        ? normalize711SessionMinutes(config?.sessTime ?? parsed.sessTime)
        : '',
      sessAuto: sessType === 'sticky'
        ? normalize711ApiSessionAuto(config?.sessAuto ?? parsed.sessAuto)
        : '',
    };
  }

  function build711ProxyApiUrl(apiUrl = '', config = {}) {
    const parsed = parse711ProxyApiConfigFromUrl(apiUrl || config?.apiUrl || config?.baseUrl || '');
    if (!parsed.isValidUrl || !parsed.urlObject) {
      return String(apiUrl || config?.apiUrl || '').trim();
    }

    const normalized = normalize711ProxyApiConfig({
      ...parsed,
      ...config,
      apiUrl: String(apiUrl || config?.apiUrl || parsed.apiUrl || '').trim(),
      baseUrl: parsed.baseUrl,
      isValidUrl: parsed.isValidUrl,
    });
    const nextUrl = new URL(parsed.urlObject.toString());
    const setOrDelete = (key, value) => {
      const normalizedValue = String(value ?? '').trim();
      if (normalizedValue) {
        nextUrl.searchParams.set(key, normalizedValue);
      } else {
        nextUrl.searchParams.delete(key);
      }
    };

    setOrDelete('count', normalized.count);
    setOrDelete('region', normalized.region);
    setOrDelete('proto', normalized.proto);
    setOrDelete('stype', normalized.stype);
    setOrDelete('zone', normalized.zone);
    setOrDelete('ptype', normalized.ptype);
    setOrDelete('sessType', normalized.sessType);

    if (normalized.stype === 'json') {
      nextUrl.searchParams.delete('split');
    } else {
      nextUrl.searchParams.set('split', encode711ApiSplitValue(normalized.split || DEFAULT_711_API_SPLIT));
    }

    if (normalized.sessType === 'sticky') {
      setOrDelete('sessTime', normalized.sessTime);
      setOrDelete('sessAuto', normalized.sessAuto);
    } else {
      nextUrl.searchParams.delete('sessTime');
      nextUrl.searchParams.delete('sessAuto');
    }

    return nextUrl.toString();
  }

  function validate711ProxyApiConfig(config = {}, options = {}) {
    const apiUrl = String(config?.apiUrl || '').trim();
    if (!apiUrl) {
      return {
        valid: false,
        errors: ['请先粘贴 711Proxy 后台生成的代理 API 链接。'],
        config: normalize711ProxyApiConfig(config),
      };
    }

    const parsed = parse711ProxyApiConfigFromUrl(apiUrl);
    if (!parsed.isValidUrl) {
      return {
        valid: false,
        errors: ['711Proxy 代理 API 不是有效 URL，或协议不是 http/https。'],
        config: normalize711ProxyApiConfig(config),
      };
    }

    const normalized = normalize711ProxyApiConfig({
      ...parsed,
      ...config,
      apiUrl,
    });
    const missingOrInvalid = [];
    if (!normalized.count) missingOrInvalid.push('count');
    if (!normalized.proto) missingOrInvalid.push('proto');
    if (!normalized.zone) missingOrInvalid.push('zone');
    if (!normalized.ptype) missingOrInvalid.push('ptype');

    const errors = [];
    if (missingOrInvalid.length) {
      errors.push(`711Proxy API 缺少或无效的必填参数：${missingOrInvalid.join(', ')}。请从后台重新生成链接或补齐参数。`);
    }
    if (String(config?.region ?? parsed.region ?? '').trim() && !normalized.region) {
      errors.push('711Proxy API 的 region 仅支持两位国家码，例如 US / DE / HK。');
    }
    if (normalized.stype !== 'json' && !String(normalized.split || '')) {
      errors.push('711Proxy API 的 split 不能为空。');
    }
    if (normalized.sessType === 'sticky' && String(config?.sessTime ?? parsed.sessTime ?? '').trim() && !normalized.sessTime) {
      errors.push('711Proxy API 的 sessTime 仅支持 1-180 分钟。');
    }
    if (normalized.sessType === 'sticky' && String(config?.sessAuto ?? parsed.sessAuto ?? '').trim() && !normalized.sessAuto) {
      errors.push('711Proxy API 的 sessAuto 仅支持 0 或 1。');
    }

    return {
      valid: errors.length === 0,
      errors,
      config: normalized,
      knownParamKeys: KNOWN_711_API_PARAM_KEYS,
      options,
    };
  }

  publish711Exports({
    apply711RegionToUsername,
    apply711SessionToUsername,
    build711ProxyApiUrl,
    decode711ApiSplitValue,
    encode711ApiSplitValue,
    has711SessionToken,
    normalize711ApiCount,
    normalize711ApiPlanType,
    normalize711ApiProtocol,
    normalize711ApiSessionAuto,
    normalize711ApiSessionType,
    normalize711ApiSplitValue,
    normalize711ApiStyle,
    normalize711ApiZone,
    normalize711ProxyApiConfig,
    normalize711SessionId,
    normalize711SessionMinutes,
    parse711ProxyApiConfigFromUrl,
    resolve711ProxyRegionFromInputs,
    transformIpProxyAccountEntryByProvider(provider = '', entry = {}, context = {}) {
      const normalizedProvider = String(provider || '').trim().toLowerCase();
      if (normalizedProvider === '711proxy') {
        return transform711ProxyAccountEntry(entry, context);
      }
      return entry;
    },
    validate711ProxyApiConfig,
  });
})(typeof self !== 'undefined' ? self : globalThis);
