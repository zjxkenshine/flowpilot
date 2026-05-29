(function attachBackgroundBrowserFingerprint(root, factory) {
  root.MultiPageBackgroundBrowserFingerprint = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundBrowserFingerprintModule() {
  const HEADER_RULE_IDS = [12051];
  const TARGET_HEADER_REGEX = '^https?:\\/\\/([^\\/]+\\.)?(chatgpt\\.com|openai\\.com|paypal\\.com|stripe\\.com|gopay\\.com|hwork\\.pro)(\\/|$)';
  const TARGET_RESOURCE_TYPES = [
    'main_frame',
    'sub_frame',
    'stylesheet',
    'script',
    'image',
    'font',
    'object',
    'xmlhttprequest',
    'ping',
    'csp_report',
    'media',
    'websocket',
    'other',
  ];
  const FINGERPRINT_LOG_LABEL = '[FlowPilot:browser-fingerprint] generated';
  const BROWSER_FINGERPRINT_LEVEL_BASIC = 'basic';
  const BROWSER_FINGERPRINT_LEVEL_STANDARD = 'standard';
  const BROWSER_FINGERPRINT_LEVEL_ENHANCED = 'enhanced';
  const BROWSER_FINGERPRINT_LANGUAGE_EN_US = 'en-US';
  const BROWSER_FINGERPRINT_LANGUAGE_ZH_CN = 'zh-CN';
  const BROWSER_FINGERPRINT_LANGUAGE_RANDOM = 'random';
  const RANDOM_LANGUAGE_FINGERPRINT_OPTIONS = Object.freeze([
    BROWSER_FINGERPRINT_LANGUAGE_ZH_CN,
    BROWSER_FINGERPRINT_LANGUAGE_EN_US,
  ]);
  let randomFingerprintSeedCounter = 0;

  const REGION_DEFAULTS = Object.freeze({
    US: Object.freeze({
      timezoneIds: Object.freeze(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']),
      geolocation: Object.freeze({ latitude: 39.8283, longitude: -98.5795, accuracy: 80 }),
    }),
    JP: Object.freeze({
      timezoneIds: Object.freeze(['Asia/Tokyo']),
      geolocation: Object.freeze({ latitude: 35.6762, longitude: 139.6503, accuracy: 70 }),
    }),
    TH: Object.freeze({
      timezoneIds: Object.freeze(['Asia/Bangkok']),
      geolocation: Object.freeze({ latitude: 13.7563, longitude: 100.5018, accuracy: 80 }),
    }),
    SG: Object.freeze({
      timezoneIds: Object.freeze(['Asia/Singapore']),
      geolocation: Object.freeze({ latitude: 1.3521, longitude: 103.8198, accuracy: 60 }),
    }),
    BR: Object.freeze({
      timezoneIds: Object.freeze(['America/Sao_Paulo']),
      geolocation: Object.freeze({ latitude: -23.5505, longitude: -46.6333, accuracy: 90 }),
    }),
  });

  const LANGUAGE_FINGERPRINT_PROFILES = Object.freeze({
    [BROWSER_FINGERPRINT_LANGUAGE_EN_US]: Object.freeze({
      locale: 'en-US',
      languages: Object.freeze(['en-US', 'en']),
      acceptLanguage: 'en-US,en;q=0.9',
    }),
    [BROWSER_FINGERPRINT_LANGUAGE_ZH_CN]: Object.freeze({
      locale: 'zh-CN',
      languages: Object.freeze(['zh-CN', 'zh']),
      acceptLanguage: 'zh-CN,zh;q=0.9,en;q=0.8',
    }),
  });

  const REGION_NAME_ALIASES = Object.freeze({
    AUSTRALIA: 'AU',
    BRASIL: 'BR',
    BRAZIL: 'BR',
    CANADA: 'CA',
    CHINA: 'CN',
    ENGLAND: 'GB',
    IRELAND: 'IE',
    JAPAN: 'JP',
    'NEW ZEALAND': 'NZ',
    'PEOPLE REPUBLIC OF CHINA': 'CN',
    "PEOPLE'S REPUBLIC OF CHINA": 'CN',
    PRC: 'CN',
    THAILAND: 'TH',
    SINGAPORE: 'SG',
    UK: 'GB',
    'UNITED KINGDOM': 'GB',
    'UNITED STATES': 'US',
    USA: 'US',
    'UNITED STATES OF AMERICA': 'US',
  });

  const SCREEN_PROFILES = Object.freeze([
    Object.freeze({ width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, deviceScaleFactor: 1 }),
    Object.freeze({ width: 1680, height: 1050, availWidth: 1680, availHeight: 1010, deviceScaleFactor: 1 }),
    Object.freeze({ width: 1536, height: 864, availWidth: 1536, availHeight: 824, deviceScaleFactor: 1.25 }),
    Object.freeze({ width: 1440, height: 900, availWidth: 1440, availHeight: 860, deviceScaleFactor: 1 }),
    Object.freeze({ width: 1366, height: 768, availWidth: 1366, availHeight: 728, deviceScaleFactor: 1 }),
  ]);

  const WINDOWS_WEBGL_PROFILES = Object.freeze([
    Object.freeze({
      webglVendor: 'Google Inc. (Intel)',
      webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    }),
    Object.freeze({
      webglVendor: 'Google Inc. (NVIDIA)',
      webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    }),
    Object.freeze({
      webglVendor: 'Google Inc. (AMD)',
      webglRenderer: 'ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    }),
  ]);

  const MAC_WEBGL_PROFILES = Object.freeze([
    Object.freeze({
      webglVendor: 'Apple Inc.',
      webglRenderer: 'Apple GPU',
    }),
    Object.freeze({
      webglVendor: 'Intel Inc.',
      webglRenderer: 'Intel Iris OpenGL Engine',
    }),
  ]);

  function normalizeRegionCode(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';
    const upper = text.toUpperCase();
    if (/^[A-Z]{2}$/.test(upper)) {
      return upper;
    }
    return REGION_NAME_ALIASES[upper] || '';
  }

  function normalizeBrowserFingerprintLevel(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === BROWSER_FINGERPRINT_LEVEL_BASIC || normalized === BROWSER_FINGERPRINT_LEVEL_ENHANCED) {
      return normalized;
    }
    return BROWSER_FINGERPRINT_LEVEL_STANDARD;
  }

  function normalizeBrowserFingerprintLanguage(value = '') {
    const normalized = String(value || '').trim().replace(/_/g, '-').toLowerCase();
    if (normalized === 'random' || normalized === 'auto') {
      return BROWSER_FINGERPRINT_LANGUAGE_RANDOM;
    }
    if (normalized === 'en' || normalized === 'en-us') {
      return BROWSER_FINGERPRINT_LANGUAGE_EN_US;
    }
    if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-hans') {
      return BROWSER_FINGERPRINT_LANGUAGE_ZH_CN;
    }
    return BROWSER_FINGERPRINT_LANGUAGE_ZH_CN;
  }

  function isBrowserFingerprintEnabled(state = {}) {
    const nestedEnabled = state?.settingsState?.flows?.openai?.browserFingerprint?.enabled;
    if (nestedEnabled === false) {
      return false;
    }
    return state?.browserFingerprintEnabled !== false;
  }

  function getBrowserFingerprintLevelFromState(state = {}, fallback = BROWSER_FINGERPRINT_LEVEL_STANDARD) {
    const rawLevel = state?.browserFingerprintLevel
      ?? state?.settingsState?.flows?.openai?.browserFingerprint?.level;
    if (rawLevel === undefined || rawLevel === null || String(rawLevel || '').trim() === '') {
      return normalizeBrowserFingerprintLevel(fallback);
    }
    return normalizeBrowserFingerprintLevel(rawLevel);
  }

  function getBrowserFingerprintLanguageFromState(state = {}, fallback = BROWSER_FINGERPRINT_LANGUAGE_ZH_CN) {
    const rawLanguage = state?.browserFingerprintLanguage
      ?? state?.settingsState?.flows?.openai?.browserFingerprint?.language;
    if (rawLanguage === undefined || rawLanguage === null || String(rawLanguage || '').trim() === '') {
      return normalizeBrowserFingerprintLanguage(fallback);
    }
    return normalizeBrowserFingerprintLanguage(rawLanguage);
  }

  function hashString(value = '') {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createSeededRandom(seedText = '') {
    let state = hashString(seedText) || 0x9e3779b9;
    return function nextRandom() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function bytesToHex(values = []) {
    return Array.from(values || [])
      .map((value) => Number(value || 0).toString(16).padStart(8, '0'))
      .join('');
  }

  function createRandomFingerprintSeed(options = {}) {
    const explicitSeed = String(
      options?.seedKey
      ?? options?.randomSeed
      ?? options?.seed
      ?? ''
    ).trim();
    if (explicitSeed) {
      return explicitSeed;
    }

    randomFingerprintSeedCounter += 1;
    const prefix = `fp_seed_${Date.now().toString(36)}_${randomFingerprintSeedCounter.toString(36)}`;
    try {
      const cryptoApi = globalThis.crypto;
      if (cryptoApi?.randomUUID) {
        return `${prefix}_${cryptoApi.randomUUID()}`;
      }
      if (cryptoApi?.getRandomValues) {
        const values = new Uint32Array(4);
        cryptoApi.getRandomValues(values);
        return `${prefix}_${bytesToHex(values)}`;
      }
    } catch {
      // Fall back below; random seed generation must not block the flow.
    }

    return `${prefix}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  }

  function pickFrom(list = [], random = Math.random) {
    if (!Array.isArray(list) || !list.length) {
      return null;
    }
    return list[Math.floor(random() * list.length) % list.length];
  }

  function resolveLanguageFingerprintProfile(language = '') {
    const normalizedLanguage = normalizeBrowserFingerprintLanguage(language);
    return LANGUAGE_FINGERPRINT_PROFILES[normalizedLanguage] || LANGUAGE_FINGERPRINT_PROFILES[BROWSER_FINGERPRINT_LANGUAGE_ZH_CN];
  }

  function resolveBrowserFingerprintLanguage(language = '', random = Math.random) {
    const normalizedLanguage = normalizeBrowserFingerprintLanguage(language);
    if (normalizedLanguage === BROWSER_FINGERPRINT_LANGUAGE_RANDOM) {
      return pickFrom(RANDOM_LANGUAGE_FINGERPRINT_OPTIONS, random) || BROWSER_FINGERPRINT_LANGUAGE_ZH_CN;
    }
    return normalizedLanguage;
  }

  function roundCoordinate(value) {
    return Math.round(Number(value || 0) * 1000000) / 1000000;
  }

  function jitterCoordinate(baseValue, random, spread) {
    const offset = (random() - 0.5) * Number(spread || 0);
    return roundCoordinate(Number(baseValue || 0) + offset);
  }

  function getChromeMajorVersion(userAgent = '') {
    const match = String(userAgent || '').match(/Chrome\/(\d+)/i);
    const parsed = Number.parseInt(match?.[1] || '', 10);
    return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : '124';
  }

  function buildUserAgent(osProfile = {}, chromeMajor = '124') {
    if (osProfile.userAgentOs === 'mac') {
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.0.0 Safari/537.36`;
    }
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.0.0 Safari/537.36`;
  }

  function buildUserAgentMetadata(osProfile = {}, chromeMajor = '124') {
    const platform = osProfile.userAgentOs === 'mac' ? 'macOS' : 'Windows';
    const platformVersion = osProfile.userAgentOs === 'mac' ? '14.0.0' : '10.0.0';
    return {
      brands: [
        { brand: 'Not A(Brand', version: '99' },
        { brand: 'Google Chrome', version: chromeMajor },
        { brand: 'Chromium', version: chromeMajor },
      ],
      fullVersionList: [
        { brand: 'Not A(Brand', version: '99.0.0.0' },
        { brand: 'Google Chrome', version: `${chromeMajor}.0.0.0` },
        { brand: 'Chromium', version: `${chromeMajor}.0.0.0` },
      ],
      platform,
      platformVersion,
      architecture: 'x86',
      model: '',
      mobile: false,
      bitness: '64',
      wow64: false,
    };
  }

  function clonePlain(value) {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function abbreviateFingerprintLogText(value = '', maxLength = 96) {
    const text = String(value || '').trim();
    const limit = Number(maxLength) || 96;
    if (text.length <= limit) {
      return text;
    }
    if (limit <= 3) {
      return text.slice(0, limit);
    }
    return `${text.slice(0, limit - 3)}...`;
  }

  function summarizeBrowserFingerprintForConsole(profile = {}) {
    const screen = profile.screen && typeof profile.screen === 'object'
      ? {
        width: Number(profile.screen.width) || 0,
        height: Number(profile.screen.height) || 0,
        availWidth: Number(profile.screen.availWidth) || 0,
        availHeight: Number(profile.screen.availHeight) || 0,
        deviceScaleFactor: Number(profile.screen.deviceScaleFactor) || 1,
      }
      : null;
    return {
      profileId: String(profile.profileId || '').trim(),
      level: normalizeBrowserFingerprintLevel(profile.level),
      language: String(profile.language || '').trim(),
      exitRegion: String(profile.exitRegion || '').trim(),
      fallbackRegion: Boolean(profile.fallbackRegion),
      locale: String(profile.locale || '').trim(),
      languages: Array.isArray(profile.languages) ? profile.languages.map((language) => String(language || '')) : [],
      timezoneId: String(profile.timezoneId || '').trim(),
      platform: String(profile.platform || '').trim(),
      screen,
      hardwareConcurrency: Number(profile.hardwareConcurrency) || 0,
      deviceMemory: Number(profile.deviceMemory) || 0,
      webglRenderer: abbreviateFingerprintLogText(profile.webglRenderer),
    };
  }

  function formatBrowserFingerprintLogSummary(profile = {}) {
    const summary = summarizeBrowserFingerprintForConsole(profile);
    const screen = summary.screen
      ? `${summary.screen.width}x${summary.screen.height}`
        + ` avail=${summary.screen.availWidth}x${summary.screen.availHeight}`
        + ` scale=${summary.screen.deviceScaleFactor}`
      : 'unknown';
    const region = summary.exitRegion || 'US';
    const regionText = summary.fallbackRegion ? `${region}（默认）` : region;
    const ipBindingText = String(profile.exitIp || '').trim()
      ? '代理 IP 仅用于诊断，不参与指纹随机种子'
      : '未绑定代理 IP，使用随机指纹';
    return '步骤 1：浏览器指纹已生成：'
      + `profile=${summary.profileId || 'unknown'}，`
      + `level=${summary.level}，`
      + `language=${summary.language || summary.locale || 'unknown'}/${summary.locale || 'unknown'}，`
      + `timezone=${summary.timezoneId || 'unknown'}，`
      + `platform=${summary.platform || 'unknown'}，`
      + `screen=${screen}，`
      + `hardwareConcurrency=${summary.hardwareConcurrency}，`
      + `deviceMemory=${summary.deviceMemory}GB，`
      + `webglRenderer=${summary.webglRenderer || 'unknown'}，`
      + `region=${regionText}，`
      + `${ipBindingText}。`;
  }

  function logGeneratedBrowserFingerprint(profile = {}) {
    if (!globalThis.console?.info) {
      return;
    }
    try {
      globalThis.console.info(FINGERPRINT_LOG_LABEL, summarizeBrowserFingerprintForConsole(profile));
    } catch {
      // Console logging must never affect fingerprint application.
    }
  }

  function buildBrowserFingerprintProfile(proxyRouting = {}, state = {}, options = {}) {
    const exitIp = String(proxyRouting?.exitIp || proxyRouting?.ipProxyAppliedExitIp || '').trim();
    const rawRegion = String(proxyRouting?.exitRegion || proxyRouting?.region || proxyRouting?.ipProxyAppliedExitRegion || '').trim();
    const normalizedRegion = normalizeRegionCode(rawRegion);
    const regionCode = normalizedRegion || 'US';
    const regionDefaults = REGION_DEFAULTS[regionCode] || REGION_DEFAULTS.US;
    const browserFingerprintLanguageSetting = normalizeBrowserFingerprintLanguage(
      options?.language ?? options?.browserFingerprintLanguage ?? getBrowserFingerprintLanguageFromState(state)
    );
    const seedKey = createRandomFingerprintSeed(options);
    const random = createSeededRandom(seedKey);
    const languageRandom = createSeededRandom(`${seedKey}|language`);
    const browserFingerprintLanguage = resolveBrowserFingerprintLanguage(browserFingerprintLanguageSetting, languageRandom);
    const languageProfile = resolveLanguageFingerprintProfile(browserFingerprintLanguage);
    const chromeMajor = getChromeMajorVersion(options?.baseUserAgent || globalThis.navigator?.userAgent || '');
    const osProfile = random() < 0.82
      ? { userAgentOs: 'windows', platform: 'Win32' }
      : { userAgentOs: 'mac', platform: 'MacIntel' };
    const screen = clonePlain(pickFrom(SCREEN_PROFILES, random));
    const webgl = clonePlain(pickFrom(
      osProfile.userAgentOs === 'mac' ? MAC_WEBGL_PROFILES : WINDOWS_WEBGL_PROFILES,
      random
    ));
    const timezoneId = pickFrom(regionDefaults.timezoneIds, random) || REGION_DEFAULTS.US.timezoneIds[0];
    const baseGeo = regionDefaults.geolocation || REGION_DEFAULTS.US.geolocation;
    const geolocation = {
      latitude: jitterCoordinate(baseGeo.latitude, random, regionCode === 'US' ? 8 : 0.8),
      longitude: jitterCoordinate(baseGeo.longitude, random, regionCode === 'US' ? 12 : 0.8),
      accuracy: Math.max(20, Math.round(Number(baseGeo.accuracy || 80) + (random() * 40))),
    };
    const hardwareConcurrency = pickFrom([4, 6, 8, 12], random) || 8;
    const deviceMemory = pickFrom([4, 8, 16], random) || 8;
    const userAgent = buildUserAgent(osProfile, chromeMajor);

    return {
      profileId: `fp_${hashString(`profile|${seedKey}`).toString(16)}`,
      level: normalizeBrowserFingerprintLevel(
        options?.level ?? options?.browserFingerprintLevel ?? getBrowserFingerprintLevelFromState(state)
      ),
      seedKey,
      exitIp,
      exitRegion: regionCode,
      rawExitRegion: rawRegion,
      exitSource: String(proxyRouting?.exitSource || '').trim().toLowerCase(),
      fallbackRegion: !normalizedRegion,
      language: browserFingerprintLanguage,
      locale: languageProfile.locale,
      languages: [...languageProfile.languages],
      acceptLanguage: languageProfile.acceptLanguage,
      timezoneId,
      geolocation,
      userAgent,
      userAgentMetadata: buildUserAgentMetadata(osProfile, chromeMajor),
      platform: osProfile.platform,
      hardwareConcurrency,
      deviceMemory,
      screen,
      colorDepth: 24,
      pixelDepth: 24,
      mobile: false,
      webglVendor: webgl.webglVendor,
      webglRenderer: webgl.webglRenderer,
      createdAt: Number(options?.createdAt) || Date.now(),
    };
  }

  function isValidBrowserFingerprintProfile(profile = {}) {
    return Boolean(
      profile
      && typeof profile === 'object'
      && String(profile.profileId || '').trim()
      && String(profile.userAgent || '').trim()
      && String(profile.acceptLanguage || '').trim()
      && String(profile.timezoneId || '').trim()
      && Array.isArray(profile.languages)
      && profile.languages.length
    );
  }

  function shouldApplyBrowserFingerprintToSource(source = '', options = {}) {
    if (options?.state && !isBrowserFingerprintEnabled(options.state)) {
      return false;
    }
    const canonicalSource = String(options?.canonicalSource || source || '').trim();
    return new Set([
      'chatgpt',
      'openai-auth',
      'signup-page',
      'plus-checkout',
      'paypal-flow',
      'gopay-flow',
    ]).has(canonicalSource);
  }

  function buildHeaderRules(profile = {}) {
    if (!isValidBrowserFingerprintProfile(profile)) {
      return [];
    }
    return [{
      id: HEADER_RULE_IDS[0],
      priority: 2,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'User-Agent', operation: 'set', value: profile.userAgent },
          { header: 'Accept-Language', operation: 'set', value: profile.acceptLanguage },
        ],
      },
      condition: {
        regexFilter: TARGET_HEADER_REGEX,
        resourceTypes: TARGET_RESOURCE_TYPES,
      },
    }];
  }

  async function applyBrowserFingerprintHeaderRules(chromeApi, profile = {}) {
    if (!chromeApi?.declarativeNetRequest?.updateDynamicRules) {
      return { skipped: true, reason: 'dnr_unavailable' };
    }
    const addRules = buildHeaderRules(profile);
    await chromeApi.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: HEADER_RULE_IDS,
      addRules,
    });
    return { skipped: false, ruleIds: HEADER_RULE_IDS.slice(), applied: addRules.length > 0 };
  }

  async function clearBrowserFingerprintHeaderRules(chromeApi) {
    if (!chromeApi?.declarativeNetRequest?.updateDynamicRules) {
      return { skipped: true, reason: 'dnr_unavailable' };
    }
    await chromeApi.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: HEADER_RULE_IDS,
      addRules: [],
    });
    return { skipped: false, ruleIds: HEADER_RULE_IDS.slice(), applied: false };
  }

  function buildClearedBrowserFingerprintState() {
    return {
      browserFingerprintProfile: null,
      browserFingerprintAppliedAt: 0,
      browserFingerprintExitIp: '',
      browserFingerprintExitRegion: '',
    };
  }

  function buildNavigatorPatchPayload(profile = {}, options = {}) {
    const level = normalizeBrowserFingerprintLevel(options?.level ?? profile.level);
    return {
      level,
      userAgent: profile.userAgent,
      language: profile.languages?.[0] || profile.locale,
      languages: Array.isArray(profile.languages) ? profile.languages : [profile.locale || 'en-US'],
      platform: profile.platform,
      hardwareConcurrency: profile.hardwareConcurrency,
      deviceMemory: profile.deviceMemory,
      userAgentData: profile.userAgentMetadata,
      screen: {
        ...(profile.screen || {}),
        colorDepth: Number(profile.colorDepth) || 24,
        pixelDepth: Number(profile.pixelDepth) || 24,
      },
      webglVendor: profile.webglVendor,
      webglRenderer: profile.webglRenderer,
      geolocation: profile.geolocation,
      noiseSeed: level === BROWSER_FINGERPRINT_LEVEL_ENHANCED
        ? `fp_noise_${hashString(`enhanced|${profile.profileId || ''}`).toString(16)}`
        : '',
    };
  }

  async function applyBrowserFingerprintToTab(tabId, profile = {}, options = {}) {
    const chromeApi = options?.chrome || globalThis.chrome;
    if (!Number.isInteger(Number(tabId))) {
      throw new Error('浏览器指纹应用失败：缺少有效标签页。');
    }
    if (!isValidBrowserFingerprintProfile(profile)) {
      return { skipped: true, reason: 'missing_profile' };
    }
    if (options?.state && !isBrowserFingerprintEnabled(options.state)) {
      return { skipped: true, reason: 'disabled' };
    }
    const level = normalizeBrowserFingerprintLevel(
      options?.level
      ?? options?.browserFingerprintLevel
      ?? getBrowserFingerprintLevelFromState(options?.state, profile.level)
    );
    const target = { tabId: Number(tabId) };
    let attached = false;
    if (chromeApi?.debugger?.attach && chromeApi?.debugger?.sendCommand) {
      try {
        await chromeApi.debugger.attach(target, '1.3');
        attached = true;
      } catch (error) {
        if (!/already attached|another debugger/i.test(String(error?.message || error || ''))) {
          throw error;
        }
      }
      try {
        await chromeApi.debugger.sendCommand(target, 'Network.enable').catch(() => {});
        await chromeApi.debugger.sendCommand(target, 'Network.setUserAgentOverride', {
          userAgent: profile.userAgent,
          acceptLanguage: profile.acceptLanguage,
          platform: profile.platform,
          userAgentMetadata: profile.userAgentMetadata,
        });
        if (level !== BROWSER_FINGERPRINT_LEVEL_BASIC) {
          await chromeApi.debugger.sendCommand(target, 'Emulation.setLocaleOverride', {
            locale: profile.locale,
          });
          await chromeApi.debugger.sendCommand(target, 'Emulation.setTimezoneOverride', {
            timezoneId: profile.timezoneId,
          });
          await chromeApi.debugger.sendCommand(target, 'Emulation.setGeolocationOverride', {
            latitude: profile.geolocation.latitude,
            longitude: profile.geolocation.longitude,
            accuracy: profile.geolocation.accuracy,
          });
          await chromeApi.debugger.sendCommand(target, 'Emulation.setDeviceMetricsOverride', {
            width: Number(profile.screen?.width) || 1440,
            height: Number(profile.screen?.height) || 900,
            deviceScaleFactor: Number(profile.screen?.deviceScaleFactor) || 1,
            mobile: false,
            screenWidth: Number(profile.screen?.width) || 1440,
            screenHeight: Number(profile.screen?.height) || 900,
            positionX: 0,
            positionY: 0,
            dontSetVisibleSize: false,
          });
        }
      } finally {
        if (attached && chromeApi.debugger?.detach) {
          await chromeApi.debugger.detach(target).catch(() => {});
        }
      }
    }

    if (chromeApi?.scripting?.executeScript) {
      await chromeApi.scripting.executeScript({
        target,
        world: 'MAIN',
        func: (payload) => {
          const defineGetter = (targetObject, name, value) => {
            try {
              Object.defineProperty(targetObject, name, {
                configurable: true,
                get: () => value,
              });
            } catch {
              // ignore read-only descriptor failures
            }
          };
          const navigatorProto = Navigator.prototype;
          const isStandardOrEnhanced = payload.level !== 'basic';
          const isEnhanced = payload.level === 'enhanced';
          defineGetter(navigatorProto, 'userAgent', payload.userAgent);
          defineGetter(navigatorProto, 'language', payload.language);
          defineGetter(navigatorProto, 'languages', Object.freeze([...(payload.languages || [])]));
          if (isStandardOrEnhanced) {
            defineGetter(navigatorProto, 'platform', payload.platform);
            defineGetter(navigatorProto, 'hardwareConcurrency', payload.hardwareConcurrency);
            defineGetter(navigatorProto, 'deviceMemory', payload.deviceMemory);
          }
          if (payload.userAgentData) {
            const userAgentData = {
              ...payload.userAgentData,
              brands: Object.freeze([...(payload.userAgentData.brands || [])]),
              mobile: Boolean(payload.userAgentData.mobile),
              getHighEntropyValues: async (hints = []) => {
                const result = {};
                for (const hint of hints || []) {
                  if (Object.prototype.hasOwnProperty.call(payload.userAgentData, hint)) {
                    result[hint] = payload.userAgentData[hint];
                  }
                }
                if (!Object.prototype.hasOwnProperty.call(result, 'brands')) {
                  result.brands = payload.userAgentData.brands || [];
                }
                if (!Object.prototype.hasOwnProperty.call(result, 'mobile')) {
                  result.mobile = Boolean(payload.userAgentData.mobile);
                }
                return result;
              },
              toJSON: () => ({
                brands: payload.userAgentData.brands || [],
                mobile: Boolean(payload.userAgentData.mobile),
                platform: payload.userAgentData.platform || '',
              }),
            };
            defineGetter(navigatorProto, 'userAgentData', userAgentData);
          }

          if (isStandardOrEnhanced && payload.geolocation && navigator.geolocation) {
            const position = {
              coords: {
                latitude: payload.geolocation.latitude,
                longitude: payload.geolocation.longitude,
                accuracy: payload.geolocation.accuracy,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            };
            try {
              navigator.geolocation.getCurrentPosition = (success) => {
                if (typeof success === 'function') {
                  setTimeout(() => success(position), 0);
                }
              };
              navigator.geolocation.watchPosition = (success) => {
                if (typeof success === 'function') {
                  setTimeout(() => success(position), 0);
                }
                return 1;
              };
              navigator.geolocation.clearWatch = () => {};
            } catch {
              // ignore geolocation patch failures
            }
          }

          if (isStandardOrEnhanced && payload.screen && typeof Screen !== 'undefined') {
            for (const [key, value] of Object.entries(payload.screen)) {
              if (['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'].includes(key)) {
                defineGetter(Screen.prototype, key, value);
              }
            }
          }

          const patchWebGl = (constructorName) => {
            const Ctor = window[constructorName];
            if (!Ctor || !Ctor.prototype || Ctor.prototype.__flowPilotFingerprintPatched) {
              return;
            }
            const originalGetParameter = Ctor.prototype.getParameter;
            Object.defineProperty(Ctor.prototype, '__flowPilotFingerprintPatched', {
              configurable: true,
              value: true,
            });
            Ctor.prototype.getParameter = function getParameter(parameter) {
              if (parameter === 37445 || parameter === 7936) return payload.webglVendor;
              if (parameter === 37446 || parameter === 7937) return payload.webglRenderer;
              return originalGetParameter.call(this, parameter);
            };
          };
          if (isStandardOrEnhanced) {
            patchWebGl('WebGLRenderingContext');
            patchWebGl('WebGL2RenderingContext');
          }

          if (isEnhanced) {
            let canvasNoiseInternalRead = false;
            const hashText = (text) => {
              let hash = 2166136261;
              const source = String(text || '');
              for (let index = 0; index < source.length; index += 1) {
                hash ^= source.charCodeAt(index);
                hash = Math.imul(hash, 16777619);
              }
              return hash >>> 0;
            };
            const noiseFor = (suffix, modulo = 3) => (hashText(`${payload.noiseSeed}|${suffix}`) % modulo);
            const withCanvasNoise = (canvas, suffix, callback) => {
              if (!canvas || typeof canvas.getContext !== 'function') {
                return callback();
              }
              const width = Math.max(0, Number(canvas.width) || 0);
              const height = Math.max(0, Number(canvas.height) || 0);
              if (!width || !height) {
                return callback();
              }
              const context = canvas.getContext('2d', { willReadFrequently: true });
              if (!context?.getImageData || !context?.putImageData) {
                return callback();
              }
              const x = noiseFor(`${suffix}|x`, width);
              const y = noiseFor(`${suffix}|y`, height);
              let imageData;
              canvasNoiseInternalRead = true;
              try {
                imageData = context.getImageData(x, y, 1, 1);
              } finally {
                canvasNoiseInternalRead = false;
              }
              const original = new Uint8ClampedArray(imageData.data);
              for (let index = 0; index < 3; index += 1) {
                const delta = noiseFor(`${suffix}|${index}`, 3) - 1;
                imageData.data[index] = Math.max(0, Math.min(255, imageData.data[index] + delta));
              }
              context.putImageData(imageData, x, y);
              let restored = false;
              const restore = () => {
                if (restored) return;
                restored = true;
                imageData.data.set(original);
                context.putImageData(imageData, x, y);
              };
              try {
                const result = callback(restore);
                if (result && typeof result.then === 'function') {
                  return result.finally(restore);
                }
                return result;
              } finally {
                if (suffix !== 'toBlob') {
                  restore();
                }
              }
            };
            if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.__flowPilotCanvasFingerprintPatched) {
              const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
              const originalToBlob = HTMLCanvasElement.prototype.toBlob;
              Object.defineProperty(HTMLCanvasElement.prototype, '__flowPilotCanvasFingerprintPatched', {
                configurable: true,
                value: true,
              });
              if (typeof originalToDataURL === 'function') {
                HTMLCanvasElement.prototype.toDataURL = function toDataURLWithFingerprintNoise(...args) {
                  return withCanvasNoise(this, 'toDataURL', () => originalToDataURL.apply(this, args));
                };
              }
              if (typeof originalToBlob === 'function') {
                HTMLCanvasElement.prototype.toBlob = function toBlobWithFingerprintNoise(callback, ...args) {
                  return withCanvasNoise(this, 'toBlob', (restore) => originalToBlob.call(this, (...callbackArgs) => {
                    try {
                      if (typeof callback === 'function') {
                        callback(...callbackArgs);
                      }
                    } finally {
                      restore();
                    }
                  }, ...args));
                };
              }
            }
            if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.__flowPilotImageDataFingerprintPatched) {
              const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
              Object.defineProperty(CanvasRenderingContext2D.prototype, '__flowPilotImageDataFingerprintPatched', {
                configurable: true,
                value: true,
              });
              CanvasRenderingContext2D.prototype.getImageData = function getImageDataWithFingerprintNoise(...args) {
                const imageData = originalGetImageData.apply(this, args);
                if (canvasNoiseInternalRead) {
                  return imageData;
                }
                if (imageData?.data?.length >= 4) {
                  for (let index = 0; index < Math.min(12, imageData.data.length); index += 4) {
                    const delta = noiseFor(`imageData|${index}`, 3) - 1;
                    imageData.data[index] = Math.max(0, Math.min(255, imageData.data[index] + delta));
                  }
                }
                return imageData;
              };
            }
            if (typeof AudioBuffer !== 'undefined' && !AudioBuffer.prototype.__flowPilotAudioFingerprintPatched) {
              const originalGetChannelData = AudioBuffer.prototype.getChannelData;
              const patchedAudioChannels = new WeakMap();
              Object.defineProperty(AudioBuffer.prototype, '__flowPilotAudioFingerprintPatched', {
                configurable: true,
                value: true,
              });
              AudioBuffer.prototype.getChannelData = function getChannelDataWithFingerprintNoise(...args) {
                const channelData = originalGetChannelData.apply(this, args);
                const channel = Math.max(0, Math.floor(Number(args?.[0]) || 0));
                let channelSet = patchedAudioChannels.get(this);
                if (!channelSet) {
                  channelSet = new Set();
                  patchedAudioChannels.set(this, channelSet);
                }
                if (channelData?.length && !channelSet.has(channel)) {
                  const stride = Math.max(1, Math.floor(channelData.length / 16));
                  for (let index = 0; index < channelData.length; index += stride) {
                    channelData[index] += (noiseFor(`audio|${channel}|${index}`, 3) - 1) * 0.0000001;
                  }
                  channelSet.add(channel);
                }
                return channelData;
              };
            }
          }

          window.__FLOWPILOT_BROWSER_FINGERPRINT__ = Object.freeze({
            profileAppliedAt: Date.now(),
            level: payload.level,
            language: payload.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        },
        args: [buildNavigatorPatchPayload(profile, { level })],
      });
    }

    return { applied: true, tabId: Number(tabId), profileId: profile.profileId, level };
  }

  function createBrowserFingerprintManager(deps = {}) {
    const {
      addLog = null,
      broadcastDataUpdate = null,
      chrome: chromeApi = globalThis.chrome,
      getState = null,
      setState = null,
    } = deps;

    async function ensureBrowserFingerprintForProxyExit(proxyRouting = {}, options = {}) {
      const state = options?.state || (typeof getState === 'function' ? await getState() : {});
      if (!isBrowserFingerprintEnabled(state)) {
        const clearResult = await clearBrowserFingerprint({ log: false });
        return { skipped: true, reason: 'disabled', ...clearResult };
      }
      const profile = buildBrowserFingerprintProfile(proxyRouting, state, options);
      await applyBrowserFingerprintHeaderRules(chromeApi, profile);
      const updates = {
        browserFingerprintProfile: profile,
        browserFingerprintAppliedAt: Date.now(),
        browserFingerprintExitIp: profile.exitIp,
        browserFingerprintExitRegion: profile.exitRegion,
      };
      if (typeof setState === 'function') {
        await setState(updates);
      }
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(updates);
      }
      logGeneratedBrowserFingerprint(profile);
      if (typeof addLog === 'function') {
        await addLog(formatBrowserFingerprintLogSummary(profile), 'info');
      }
      if (typeof addLog === 'function' && profile.fallbackRegion) {
        await addLog('步骤 1：代理出口地区未识别，已使用默认 US 浏览器指纹。', 'warn');
      }
      return { profile, updates };
    }

    async function applyProfileToTab(tabId, profile = null, options = {}) {
      const state = options?.state || (typeof getState === 'function' ? await getState() : {});
      if (!isBrowserFingerprintEnabled(state)) {
        return { skipped: true, reason: 'disabled' };
      }
      const resolvedProfile = profile || options?.profile || (typeof getState === 'function'
        ? state?.browserFingerprintProfile
        : null);
      return applyBrowserFingerprintToTab(tabId, resolvedProfile, { ...options, chrome: chromeApi, state });
    }

    async function clearBrowserFingerprint(options = {}) {
      const updates = buildClearedBrowserFingerprintState();
      await clearBrowserFingerprintHeaderRules(chromeApi);
      if (options?.setState !== false && options?.persist !== false && typeof setState === 'function') {
        await setState(updates);
      }
      if (options?.broadcast !== false && typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(updates);
      }
      if (options?.log !== false && typeof addLog === 'function') {
        await addLog('浏览器指纹已关闭，已清理本轮指纹运行态。', 'info');
      }
      return { updates };
    }

    return {
      applyBrowserFingerprintHeaderRules: (profile) => applyBrowserFingerprintHeaderRules(chromeApi, profile),
      applyBrowserFingerprintToTab: applyProfileToTab,
      buildBrowserFingerprintProfile,
      clearBrowserFingerprint,
      ensureBrowserFingerprintForProxyExit,
      isValidBrowserFingerprintProfile,
      normalizeBrowserFingerprintLanguage,
      normalizeBrowserFingerprintLevel,
      resolveBrowserFingerprintLanguage,
      shouldApplyBrowserFingerprintToSource,
    };
  }

  return {
    LANGUAGE_FINGERPRINT_PROFILES,
    REGION_DEFAULTS,
    BROWSER_FINGERPRINT_LEVEL_BASIC,
    BROWSER_FINGERPRINT_LEVEL_STANDARD,
    BROWSER_FINGERPRINT_LEVEL_ENHANCED,
    BROWSER_FINGERPRINT_LANGUAGE_EN_US,
    BROWSER_FINGERPRINT_LANGUAGE_RANDOM,
    BROWSER_FINGERPRINT_LANGUAGE_ZH_CN,
    applyBrowserFingerprintHeaderRules,
    applyBrowserFingerprintToTab,
    buildClearedBrowserFingerprintState,
    buildBrowserFingerprintProfile,
    buildNavigatorPatchPayload,
    clearBrowserFingerprintHeaderRules,
    createBrowserFingerprintManager,
    getBrowserFingerprintLevelFromState,
    getBrowserFingerprintLanguageFromState,
    isBrowserFingerprintEnabled,
    isValidBrowserFingerprintProfile,
    formatBrowserFingerprintLogSummary,
    normalizeBrowserFingerprintLanguage,
    normalizeBrowserFingerprintLevel,
    normalizeRegionCode,
    resolveBrowserFingerprintLanguage,
    resolveLanguageFingerprintProfile,
    shouldApplyBrowserFingerprintToSource,
  };
});
