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
  const ALLOWED_711_API_HOSTS = [
    'http://us.rotgbapi.711proxy.com:8089',
    'http://global.rotgbapi.711proxy.com:8089',
    'http://as.rotgbapi.711proxy.com:8089',
  ];
  const DEFAULT_711_API_HOST = 'http://global.rotgbapi.711proxy.com:8089';
  const DEFAULT_711_API_PATHNAME = '/gen';
  const DEFAULT_711_API_COUNT = '1';
  const DEFAULT_711_API_SPLIT = '\\r\\n';
  const DEFAULT_711_API_PROTO = 'http';
  const DEFAULT_711_API_STYLE = 'text';
  const DEFAULT_711_API_SESSION_TYPE = 'rotating';
  const DEFAULT_711_API_SESSION_TIME = '5';
  const DEFAULT_711_API_ZONE = 'custom';
  const DEFAULT_711_API_PTYPE = '1';

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
    return String(Math.max(5, Math.min(180, numeric)));
  }

  function normalize711ApiCount(value = '') {
    const raw = String(value ?? '').trim();
    if (!raw) return DEFAULT_711_API_COUNT;
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isInteger(numeric)) return DEFAULT_711_API_COUNT;
    return String(Math.max(1, Math.min(200, numeric)));
  }

  function normalize711ApiHost(value = '') {
    const raw = String(value || '').trim();
    if (!raw) {
      return DEFAULT_711_API_HOST;
    }
    let normalizedHost = raw.toLowerCase().replace(/\/+$/, '');
    try {
      const urlObject = new URL(raw);
      normalizedHost = `${urlObject.protocol}//${urlObject.host}`.toLowerCase();
    } catch {
      normalizedHost = raw.toLowerCase().replace(/\/+$/, '');
    }
    const match = ALLOWED_711_API_HOSTS.find((candidate) => candidate.toLowerCase() === normalizedHost);
    return match || DEFAULT_711_API_HOST;
  }

  function normalize711ApiHostLabel(value = '') {
    const normalized = normalize711ApiHost(value);
    if (normalized.includes('://us.rotgbapi.711proxy.com:8089')) return 'us';
    if (normalized.includes('://as.rotgbapi.711proxy.com:8089')) return 'as';
    return 'global';
  }

  function build711ApiBaseUrl(host = '') {
    return `${normalize711ApiHost(host)}${DEFAULT_711_API_PATHNAME}`;
  }

  function parse711ApiHostFromUrl(apiUrl = '') {
    const rawUrl = String(apiUrl || '').trim();
    if (!rawUrl) {
      return DEFAULT_711_API_HOST;
    }
    try {
      const urlObject = new URL(rawUrl);
      return normalize711ApiHost(`${urlObject.protocol}//${urlObject.host}`);
    } catch {
      return DEFAULT_711_API_HOST;
    }
  }

  function normalize711ApiProtocol(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'socks5' ? 'socks5' : DEFAULT_711_API_PROTO;
  }

  function normalize711ApiProtocolLabel(value = '') {
    return normalize711ApiProtocol(value) === 'socks5' ? 'socks5' : 'http';
  }

  function normalize711ApiStyle(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'json' ? 'json' : DEFAULT_711_API_STYLE;
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

  function normalize711ApiSplitOption(value = '', fallback = DEFAULT_711_API_SPLIT) {
    const normalized = normalize711ApiSplitValue(value, fallback);
    return ['\r\n', '\r', '\n', '\t'].includes(normalized)
      ? normalized
      : String(fallback ?? DEFAULT_711_API_SPLIT);
  }

  function normalize711ApiZone() {
    return DEFAULT_711_API_ZONE;
  }

  function normalize711ApiPlanType() {
    return DEFAULT_711_API_PTYPE;
  }

  function normalize711ApiSessionType(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'sticky' || normalized === 'static') return 'sticky';
    return DEFAULT_711_API_SESSION_TYPE;
  }

  function normalize711ApiSessionTypeLabel(value = '') {
    return normalize711ApiSessionType(value) === 'sticky' ? 'sticky' : 'rotating';
  }

  function normalize711ApiSessionAuto(value = '', fallback = '1') {
    const raw = String(value ?? '').trim();
    if (!raw) return String(fallback || '');
    if (raw === '0') return '0';
    if (raw === '1') return '1';
    return String(fallback || '');
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

  function build711ApiRefreshUrl(options = {}) {
    const host = String(options?.host || '').trim();
    const port = Number.parseInt(String(options?.port || '').trim(), 10);
    const key = String(options?.key || '').trim();
    const ts = Number.isFinite(Number(options?.ts)) ? Number(options.ts) : Date.now();
    if (!host || !Number.isInteger(port) || port <= 0 || !key) {
      return '';
    }
    const refreshUrl = new URL(`http://${host}:8089/change`);
    refreshUrl.searchParams.set('key', key);
    refreshUrl.searchParams.set('ts', String(ts));
    refreshUrl.searchParams.set('ptype', DEFAULT_711_API_PTYPE);
    refreshUrl.searchParams.set('zone', DEFAULT_711_API_ZONE);
    refreshUrl.searchParams.set('port', String(port));
    return refreshUrl.toString();
  }

  function parse711ProxyApiConfigFromUrl(apiUrl = '') {
    const rawUrl = String(apiUrl || '').trim();
    const defaultResult = {
      apiUrl: rawUrl,
      baseUrl: build711ApiBaseUrl(DEFAULT_711_API_HOST),
      isValidUrl: false,
      urlObject: null,
      host: DEFAULT_711_API_HOST,
      hostLabel: normalize711ApiHostLabel(DEFAULT_711_API_HOST),
      count: DEFAULT_711_API_COUNT,
      region: '',
      proto: DEFAULT_711_API_PROTO,
      protoLabel: normalize711ApiProtocolLabel(DEFAULT_711_API_PROTO),
      stype: DEFAULT_711_API_STYLE,
      split: DEFAULT_711_API_SPLIT,
      zone: DEFAULT_711_API_ZONE,
      ptype: DEFAULT_711_API_PTYPE,
      sessType: DEFAULT_711_API_SESSION_TYPE,
      sessTypeLabel: normalize711ApiSessionTypeLabel(DEFAULT_711_API_SESSION_TYPE),
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

    const sessType = normalize711ApiSessionType(urlObject.searchParams.get('sessType') || '');
    return {
      apiUrl: rawUrl,
      baseUrl: `${normalize711ApiHost(`${urlObject.protocol}//${urlObject.host}`)}${DEFAULT_711_API_PATHNAME}`,
      isValidUrl: true,
      urlObject,
      host: normalize711ApiHost(`${urlObject.protocol}//${urlObject.host}`),
      hostLabel: normalize711ApiHostLabel(`${urlObject.protocol}//${urlObject.host}`),
      count: normalize711ApiCount(urlObject.searchParams.get('count') || ''),
      region: normalizeCountryCode(urlObject.searchParams.get('region') || ''),
      proto: normalize711ApiProtocol(urlObject.searchParams.get('proto') || ''),
      protoLabel: normalize711ApiProtocolLabel(urlObject.searchParams.get('proto') || ''),
      stype: normalize711ApiStyle(urlObject.searchParams.get('stype') || ''),
      split: normalize711ApiSplitOption(urlObject.searchParams.get('split') || ''),
      zone: DEFAULT_711_API_ZONE,
      ptype: DEFAULT_711_API_PTYPE,
      sessType,
      sessTypeLabel: normalize711ApiSessionTypeLabel(sessType),
      sessTime: sessType === 'sticky'
        ? normalize711SessionMinutes(urlObject.searchParams.get('sessTime') || '')
        : '',
      sessAuto: sessType === 'sticky'
        ? normalize711ApiSessionAuto(urlObject.searchParams.get('sessAuto') || '', '')
        : '',
    };
  }

  function normalize711ProxyApiConfig(config = {}) {
    const host = normalize711ApiHost(
      config?.host
      ?? config?.apiHost
      ?? parse711ApiHostFromUrl(config?.apiUrl || config?.baseUrl || '')
    );
    const parsed = parse711ProxyApiConfigFromUrl(
      config?.apiUrl
      || config?.baseUrl
      || build711ApiBaseUrl(host)
    );
    const sessType = normalize711ApiSessionType(config?.sessType ?? parsed.sessType);
    const stype = normalize711ApiStyle(config?.stype ?? parsed.stype);
    return {
      apiUrl: String(config?.apiUrl ?? parsed.apiUrl ?? '').trim(),
      baseUrl: build711ApiBaseUrl(host),
      isValidUrl: Boolean(config?.isValidUrl ?? parsed.isValidUrl ?? true),
      host,
      hostLabel: normalize711ApiHostLabel(host),
      count: normalize711ApiCount(config?.count ?? parsed.count),
      region: '',
      proto: normalize711ApiProtocol(config?.proto ?? parsed.proto),
      protoLabel: normalize711ApiProtocolLabel(config?.proto ?? parsed.proto),
      stype,
      split: stype === 'json'
        ? ''
        : normalize711ApiSplitOption(config?.split ?? parsed.split),
      zone: DEFAULT_711_API_ZONE,
      ptype: DEFAULT_711_API_PTYPE,
      sessType,
      sessTypeLabel: normalize711ApiSessionTypeLabel(sessType),
      sessTime: sessType === 'sticky'
        ? normalize711SessionMinutes(config?.sessTime ?? parsed.sessTime ?? DEFAULT_711_API_SESSION_TIME)
        : '',
      sessAuto: sessType === 'sticky'
        ? normalize711ApiSessionAuto(config?.sessAuto ?? parsed.sessAuto, '1')
        : '',
    };
  }

  function build711ProxyApiUrl(apiUrl = '', config = {}) {
    const inputApiUrl = String(apiUrl || config?.apiUrl || '').trim();
    const parsed = parse711ProxyApiConfigFromUrl(
      inputApiUrl
      || config?.baseUrl
      || build711ApiBaseUrl(config?.host || config?.apiHost || DEFAULT_711_API_HOST)
    );
    const normalized = normalize711ProxyApiConfig({
      ...parsed,
      ...config,
      apiUrl: inputApiUrl || parsed.apiUrl || build711ApiBaseUrl(config?.host || config?.apiHost || DEFAULT_711_API_HOST),
      isValidUrl: true,
    });
    const existingUrl = parsed?.urlObject ? parsed.urlObject.toString() : normalized.baseUrl;
    const nextUrl = new URL(existingUrl);
    nextUrl.protocol = 'http:';
    nextUrl.host = new URL(normalized.baseUrl).host;
    nextUrl.pathname = DEFAULT_711_API_PATHNAME;
    const setOrDelete = (key, value) => {
      const normalizedValue = String(value ?? '').trim();
      if (normalizedValue) {
        nextUrl.searchParams.set(key, normalizedValue);
      } else {
        nextUrl.searchParams.delete(key);
      }
    };

    setOrDelete('count', normalized.count);
    setOrDelete('proto', normalized.proto);
    setOrDelete('stype', normalized.stype);
    setOrDelete('zone', DEFAULT_711_API_ZONE);
    setOrDelete('ptype', DEFAULT_711_API_PTYPE);
    setOrDelete('sessType', normalized.sessType);

    if (normalized.stype === 'json') {
      nextUrl.searchParams.delete('split');
    } else {
      nextUrl.searchParams.set('split', encode711ApiSplitValue(normalized.split || DEFAULT_711_API_SPLIT));
    }

    if (normalized.sessType === 'sticky') {
      setOrDelete('sessTime', normalized.sessTime);
      if (String(normalized.sessAuto || '').trim() === '1') {
        nextUrl.searchParams.set('sessAuto', '1');
      } else {
        nextUrl.searchParams.delete('sessAuto');
      }
    } else {
      nextUrl.searchParams.delete('sessTime');
      nextUrl.searchParams.delete('sessAuto');
    }

    nextUrl.searchParams.delete('region');
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
      errors.push(`711Proxy API 缺少或无效的必填参数：${missingOrInvalid.join(', ')}。`);
    }
    if (normalized.stype !== 'json' && !String(normalized.split || '')) {
      errors.push('711Proxy API 的 split 不能为空。');
    }
    if (normalized.sessType === 'sticky' && String(config?.sessTime ?? parsed.sessTime ?? '').trim() && !normalized.sessTime) {
      errors.push('711Proxy API 的 sessTime 仅支持 5-180 分钟。');
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
    ALLOWED_711_API_HOSTS,
    DEFAULT_711_API_COUNT,
    DEFAULT_711_API_HOST,
    DEFAULT_711_API_PATHNAME,
    DEFAULT_711_API_PTYPE,
    DEFAULT_711_API_SESSION_TIME,
    DEFAULT_711_API_SESSION_TYPE,
    DEFAULT_711_API_SPLIT,
    DEFAULT_711_API_STYLE,
    DEFAULT_711_API_ZONE,
    apply711RegionToUsername,
    apply711SessionToUsername,
    build711ApiBaseUrl,
    build711ApiRefreshUrl,
    build711ProxyApiUrl,
    decode711ApiSplitValue,
    encode711ApiSplitValue,
    has711SessionToken,
    normalize711ApiCount,
    normalize711ApiHost,
    normalize711ApiHostLabel,
    normalize711ApiPlanType,
    normalize711ApiProtocol,
    normalize711ApiProtocolLabel,
    normalize711ApiSessionAuto,
    normalize711ApiSessionType,
    normalize711ApiSessionTypeLabel,
    normalize711ApiSplitOption,
    normalize711ApiSplitValue,
    normalize711ApiStyle,
    normalize711ApiZone,
    normalize711ProxyApiConfig,
    normalize711SessionId,
    normalize711SessionMinutes,
    parse711ApiHostFromUrl,
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
