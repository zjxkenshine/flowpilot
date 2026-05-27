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

  const REGION_DEFAULTS = Object.freeze({
    US: Object.freeze({
      locale: 'en-US',
      languages: Object.freeze(['en-US', 'en']),
      acceptLanguage: 'en-US,en;q=0.9',
      timezoneIds: Object.freeze(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']),
      geolocation: Object.freeze({ latitude: 39.8283, longitude: -98.5795, accuracy: 80 }),
    }),
    JP: Object.freeze({
      locale: 'zh-CN',
      languages: Object.freeze(['zh-CN', 'zh']),
      acceptLanguage: 'zh-CN,zh;q=0.9,en;q=0.8',
      timezoneIds: Object.freeze(['Asia/Tokyo']),
      geolocation: Object.freeze({ latitude: 35.6762, longitude: 139.6503, accuracy: 70 }),
    }),
    TH: Object.freeze({
      locale: 'zh-CN',
      languages: Object.freeze(['zh-CN', 'zh']),
      acceptLanguage: 'zh-CN,zh;q=0.9,en;q=0.8',
      timezoneIds: Object.freeze(['Asia/Bangkok']),
      geolocation: Object.freeze({ latitude: 13.7563, longitude: 100.5018, accuracy: 80 }),
    }),
    SG: Object.freeze({
      locale: 'en-US',
      languages: Object.freeze(['en-US', 'en']),
      acceptLanguage: 'en-US,en;q=0.9',
      timezoneIds: Object.freeze(['Asia/Singapore']),
      geolocation: Object.freeze({ latitude: 1.3521, longitude: 103.8198, accuracy: 60 }),
    }),
  });

  const LANGUAGE_FINGERPRINT_PROFILES = Object.freeze({
    EN: Object.freeze({
      locale: 'en-US',
      languages: Object.freeze(['en-US', 'en']),
      acceptLanguage: 'en-US,en;q=0.9',
    }),
    ZH_CN: Object.freeze({
      locale: 'zh-CN',
      languages: Object.freeze(['zh-CN', 'zh']),
      acceptLanguage: 'zh-CN,zh;q=0.9,en;q=0.8',
    }),
  });

  const ENGLISH_LANGUAGE_REGIONS = Object.freeze(new Set([
    'US',
    'SG',
    'GB',
    'UK',
    'CA',
    'AU',
    'NZ',
    'IE',
  ]));

  const SIMPLIFIED_CHINESE_LANGUAGE_REGIONS = Object.freeze(new Set([
    'CN',
  ]));

  const REGION_NAME_ALIASES = Object.freeze({
    AUSTRALIA: 'AU',
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

  function pickFrom(list = [], random = Math.random) {
    if (!Array.isArray(list) || !list.length) {
      return null;
    }
    return list[Math.floor(random() * list.length) % list.length];
  }

  function resolveLanguageFingerprintProfile(regionCode = '') {
    const normalizedRegion = normalizeRegionCode(regionCode);
    if (ENGLISH_LANGUAGE_REGIONS.has(normalizedRegion)) {
      return LANGUAGE_FINGERPRINT_PROFILES.EN;
    }
    if (SIMPLIFIED_CHINESE_LANGUAGE_REGIONS.has(normalizedRegion)) {
      return LANGUAGE_FINGERPRINT_PROFILES.ZH_CN;
    }
    return LANGUAGE_FINGERPRINT_PROFILES.ZH_CN;
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

  function buildBrowserFingerprintProfile(proxyRouting = {}, state = {}, options = {}) {
    const exitIp = String(proxyRouting?.exitIp || proxyRouting?.ipProxyAppliedExitIp || '').trim();
    const rawRegion = String(proxyRouting?.exitRegion || proxyRouting?.region || proxyRouting?.ipProxyAppliedExitRegion || '').trim();
    const normalizedRegion = normalizeRegionCode(rawRegion);
    const regionCode = normalizedRegion || 'US';
    const regionDefaults = REGION_DEFAULTS[regionCode] || REGION_DEFAULTS.US;
    const languageProfile = resolveLanguageFingerprintProfile(regionCode);
    const runId = String(
      state?.activeRunId
      || state?.runId
      || state?.autoRunSessionId
      || state?.flowStartTime
      || options?.runId
      || 'manual'
    ).trim();
    const seedKey = [
      exitIp || 'no-exit-ip',
      regionCode,
      runId || 'manual',
    ].join('|');
    const random = createSeededRandom(seedKey);
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
      profileId: `fp_${hashString(seedKey).toString(16)}`,
      seedKey,
      exitIp,
      exitRegion: regionCode,
      rawExitRegion: rawRegion,
      exitSource: String(proxyRouting?.exitSource || '').trim().toLowerCase(),
      fallbackRegion: !normalizedRegion,
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

  function buildNavigatorPatchPayload(profile = {}) {
    return {
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
          defineGetter(navigatorProto, 'userAgent', payload.userAgent);
          defineGetter(navigatorProto, 'language', payload.language);
          defineGetter(navigatorProto, 'languages', Object.freeze([...(payload.languages || [])]));
          defineGetter(navigatorProto, 'platform', payload.platform);
          defineGetter(navigatorProto, 'hardwareConcurrency', payload.hardwareConcurrency);
          defineGetter(navigatorProto, 'deviceMemory', payload.deviceMemory);
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

          if (payload.geolocation && navigator.geolocation) {
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

          if (payload.screen && typeof Screen !== 'undefined') {
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
          patchWebGl('WebGLRenderingContext');
          patchWebGl('WebGL2RenderingContext');

          window.__FLOWPILOT_BROWSER_FINGERPRINT__ = Object.freeze({
            profileAppliedAt: Date.now(),
            language: payload.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        },
        args: [buildNavigatorPatchPayload(profile)],
      });
    }

    return { applied: true, tabId: Number(tabId), profileId: profile.profileId };
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
      const profile = buildBrowserFingerprintProfile(proxyRouting, state, options);
      if (!String(profile.exitIp || '').trim()) {
        return { skipped: true, reason: 'missing_exit_ip' };
      }
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
      if (typeof addLog === 'function' && profile.fallbackRegion) {
        await addLog('步骤 1：代理出口地区未识别，已使用默认 US 浏览器指纹。', 'warn');
      }
      return { profile, updates };
    }

    async function applyProfileToTab(tabId, profile = null, options = {}) {
      const resolvedProfile = profile || options?.profile || (typeof getState === 'function'
        ? (await getState())?.browserFingerprintProfile
        : null);
      return applyBrowserFingerprintToTab(tabId, resolvedProfile, { ...options, chrome: chromeApi });
    }

    return {
      applyBrowserFingerprintHeaderRules: (profile) => applyBrowserFingerprintHeaderRules(chromeApi, profile),
      applyBrowserFingerprintToTab: applyProfileToTab,
      buildBrowserFingerprintProfile,
      ensureBrowserFingerprintForProxyExit,
      isValidBrowserFingerprintProfile,
      shouldApplyBrowserFingerprintToSource,
    };
  }

  return {
    LANGUAGE_FINGERPRINT_PROFILES,
    REGION_DEFAULTS,
    applyBrowserFingerprintHeaderRules,
    applyBrowserFingerprintToTab,
    buildBrowserFingerprintProfile,
    createBrowserFingerprintManager,
    isValidBrowserFingerprintProfile,
    normalizeRegionCode,
    resolveLanguageFingerprintProfile,
    shouldApplyBrowserFingerprintToSource,
  };
});
