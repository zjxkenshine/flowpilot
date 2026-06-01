const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadIpProxyCore({ accountListEnabled = true } = {}) {
  const providerSource = fs.readFileSync('background/ip-proxy-provider-711proxy.js', 'utf8');
  const coreSource = fs.readFileSync('background/ip-proxy-core.js', 'utf8');
  return new Function(`
const self = {};
const chrome = {};
const DEFAULT_IP_PROXY_SERVICE = '711proxy';
const IP_PROXY_SERVICE_VALUES = ['711proxy', 'lumiproxy', 'iproyal', 'omegaproxy'];
const IP_PROXY_ENABLED_SERVICE_VALUES = ['711proxy'];
const DEFAULT_IP_PROXY_MODE = 'account';
const IP_PROXY_MODE_VALUES = ['api', 'account'];
const DEFAULT_IP_PROXY_PROTOCOL = 'http';
const IP_PROXY_PROTOCOL_VALUES = ['http', 'https', 'socks4', 'socks5'];
const DEFAULT_IP_PROXY_API_ROUTE_MODE = 'direct';
const IP_PROXY_API_ROUTE_MODE_VALUES = ['direct', 'local_proxy', 'provider_proxy'];
const DEFAULT_IP_PROXY_SPECIAL_DOMAIN_ROUTE_MODE = 'local_proxy';
const IP_PROXY_SPECIAL_DOMAIN_ROUTE_MODE_VALUES = ['local_proxy', 'direct', 'provider_proxy'];
const IP_PROXY_FETCH_TIMEOUT_MS = 20000;
const IP_PROXY_SETTINGS_SCOPE = 'regular';
const IP_PROXY_BYPASS_LIST = ['<local>', 'localhost', '127.0.0.1'];
const IP_PROXY_ROUTE_ALL_TRAFFIC = true;
const IP_PROXY_FORCE_DIRECT_HOST_PATTERNS = [
  'pm-redirects.stripe.com',
  '*.pm-redirects.stripe.com',
  'hwork.pro',
  '*.hwork.pro',
  'auth.openai.com',
  'auth0.openai.com',
  'accounts.openai.com',
  'luckyous.com',
  '*.luckyous.com',
];
const IP_PROXY_FORCE_DIRECT_FALLBACK = 'PROXY 127.0.0.1:7897';
const IP_PROXY_ACCOUNT_LIST_ENABLED = ${accountListEnabled ? 'true' : 'false'};
const IP_PROXY_TARGET_HOST_PATTERNS = [
  'openai.com',
  '*.openai.com',
  'chatgpt.com',
  '*.chatgpt.com',
];
${providerSource}
const transformIpProxyAccountEntryByProvider = self.transformIpProxyAccountEntryByProvider;
${coreSource}
return {
  applyExitRegionExpectation,
  applyIpProxySettingsFromState,
  buildIpProxyPacScript,
  build711ProxyApiUrl,
  chrome,
  createAutomationScopedTab,
  buildIpProxyRoutingStatePatch,
  applyTargetReachabilityExpectation,
  pullIpProxyPoolFromApi,
  getAccountModeProxyPoolFromState,
  getCurrentIpProxyAuthEntry,
  normalize711ProxyApiConfig,
  normalizeIpProxyAccountList,
  normalizeIpProxyListFromPayload,
  normalizeProxyPoolEntries,
  parseProxyExitProbePayload,
  parse711ProxyApiConfigFromUrl,
  parseIpProxyLine,
  queryAutomationScopedTabs,
  resolveExitProbeEndpoints,
  resolveIpProxyAutoSwitchThreshold,
  resolveIpProxySwitchIpRoundCount,
  resolveTargetReachabilityEndpoints,
  shouldEnableIpProxyLeakGuardForStatus,
  switch711ApiProxyUntilExitChanged,
  switchIpProxyUntilExitRegionMatches,
  validate711ProxyApiConfig,
};
`)();
}

test('IP proxy parser ignores disabled lines and normalizes proxy entries', () => {
  const api = loadIpProxyCore();

  assert.equal(
    api.normalizeIpProxyAccountList([
      '# disabled',
      ' // disabled',
      '; disabled',
      'global.rotgb.711proxy.com:10000:user:pass',
      '',
    ].join('\n')),
    'global.rotgb.711proxy.com:10000:user:pass'
  );

  const pool = api.normalizeProxyPoolEntries([
    'http://global.rotgb.711proxy.com:10000:user:pa:ss',
    'http://global.rotgb.711proxy.com:10000:user:pa:ss',
    { host: 'us.proxy.example', port: '8080', username: 'u2', password: 'p2' },
  ]);

  assert.equal(pool.length, 2);
  assert.deepStrictEqual(pool[0], {
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    username: 'user',
    password: 'pa:ss',
    protocol: 'http',
    region: '',
    provider: '711proxy',
  });
  assert.equal(pool[1].host, 'us.proxy.example');
  assert.equal(pool[1].port, 8080);
});

test('IP proxy probe payload parser extracts country from common probe endpoints', () => {
  const api = loadIpProxyCore();

  assert.deepEqual(
    api.parseProxyExitProbePayload('ip=219.104.171.52\nloc=JP\ncolo=NRT', 'text/plain'),
    { ip: '219.104.171.52', region: 'JP' }
  );
  assert.deepEqual(
    api.parseProxyExitProbePayload(JSON.stringify({
      ip: '219.104.171.52',
      country: 'JP',
      city: 'Osaka',
    }), 'application/json'),
    { ip: '219.104.171.52', region: 'JP' }
  );
  assert.deepEqual(
    api.parseProxyExitProbePayload(JSON.stringify({
      ip: '219.104.171.52',
      country_code: 'JP',
      country: 'Japan',
    }), 'application/json'),
    { ip: '219.104.171.52', region: 'JP' }
  );
});

test('IP proxy routing state patch keeps exit probe endpoint for diagnostics', () => {
  const api = loadIpProxyCore();
  const patch = api.buildIpProxyRoutingStatePatch({
    applied: true,
    reason: 'applied',
    provider: '711proxy',
    exitIp: '219.104.171.52',
    exitRegion: 'JP',
    exitSource: 'page_context',
    exitEndpoint: 'https://ipinfo.io/json',
  });

  assert.equal(patch.ipProxyAppliedExitIp, '219.104.171.52');
  assert.equal(patch.ipProxyAppliedExitRegion, 'JP');
  assert.equal(patch.ipProxyAppliedExitEndpoint, 'https://ipinfo.io/json');
});

test('IP proxy page probes do not fall back to other windows when the locked window is unavailable', async () => {
  const api = loadIpProxyCore();
  const created = [];
  const queries = [];
  api.chrome.tabs = {
    create: async (payload) => {
      created.push(payload);
      if (payload.windowId === 77) {
        throw new Error('No window with id: 77');
      }
      return { id: 12, windowId: payload.windowId, url: payload.url };
    },
    query: async (queryInfo) => {
      queries.push(queryInfo);
      if (queryInfo.windowId === 77) {
        throw new Error('No window with id: 77');
      }
      return [{ id: 99, windowId: 1, url: 'https://ipinfo.io/json' }];
    },
  };

  await assert.rejects(
    () => api.createAutomationScopedTab(
      { url: 'https://ipinfo.io/json', active: false },
      { state: { automationWindowId: 77 } }
    ),
    /自动任务窗口已不可用/
  );
  await assert.rejects(
    () => api.queryAutomationScopedTabs(
      { url: 'https://ipinfo.io/*' },
      { state: { automationWindowId: 77 } }
    ),
    /自动任务窗口已不可用/
  );

  assert.deepEqual(created, [{ url: 'https://ipinfo.io/json', active: false, windowId: 77 }]);
  assert.deepEqual(queries, [{ url: 'https://ipinfo.io/*', windowId: 77 }]);
});

test('711 fixed-account mode applies region and sticky session parameters', () => {
  const api = loadIpProxyCore();
  const pool = api.getAccountModeProxyPoolFromState({
    ipProxyService: '711proxy',
    ipProxyMode: 'account',
    ipProxyHost: 'global.rotgb.711proxy.com',
    ipProxyPort: '10000',
    ipProxyProtocol: 'http',
    ipProxyUsername: 'USER047152-zone-custom',
    ipProxyPassword: 'secret',
    ipProxyRegion: 'US',
    ipProxyAccountSessionPrefix: 'sticky_001',
    ipProxyAccountLifeMinutes: '30',
  });

  assert.equal(pool.length, 1);
  assert.equal(pool[0].host, 'global.rotgb.711proxy.com');
  assert.equal(pool[0].port, 10000);
  assert.equal(pool[0].region, 'US');
  assert.match(pool[0].username, /region-US/);
  assert.match(pool[0].username, /session-sticky_001/);
  assert.match(pool[0].username, /sessTime-30/);
});

test('IP proxy PAC keeps local traffic direct and routes target traffic through proxy', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  });

  assert.match(pac, /FindProxyForURL/);
  assert.match(pac, /localhost/);
  assert.match(pac, /PROXY global\.rotgb\.711proxy\.com:10000/);
  assert.match(pac, /chatgpt\.com/);
  assert.match(pac, /openai\.com/);
  assert.match(pac, /pm-redirects\.stripe\.com/);
  assert.match(pac, /hwork\.pro/);
  assert.match(pac, /auth\.openai\.com/);
  assert.match(pac, /auth0\.openai\.com/);
  assert.match(pac, /accounts\.openai\.com/);
  assert.match(pac, /luckyous\.com/);
  assert.match(pac, /forceDirectPatterns/);
  assert.match(pac, /PROXY 127\.0\.0\.1:7897/);
  assert.doesNotMatch(pac, /PROXY 127\.0\.0\.1:7897; DIRECT/);
});

test('IP proxy PAC routes sync API host direct before route-all traffic', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  }, {
    syncApiProfile: {
      apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=1',
      apiHost: 'http://global.rotgbapi.711proxy.com:8089',
    },
    syncApiRouteMode: 'direct',
  });

  assert.match(pac, /syncApiHosts/);
  assert.match(pac, /global\.rotgbapi\.711proxy\.com/);
  assert.match(pac, /return "DIRECT";/);
  assert.match(pac, /return "PROXY global\.rotgb\.711proxy\.com:10000";/);
});

test('IP proxy PAC can route sync API host through local proxy before route-all traffic', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  }, {
    syncApiProfile: {
      apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=1',
    },
    syncApiRouteMode: 'local_proxy',
  });

  assert.match(pac, /syncApiHosts/);
  assert.match(pac, /global\.rotgbapi\.711proxy\.com/);
  assert.match(pac, /return "PROXY 127\.0\.0\.1:7897";/);
  assert.match(pac, /routeAllTraffic = true/);
});

test('IP proxy PAC can route sync API host through current provider proxy before route-all traffic', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  }, {
    syncApiProfile: {
      apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=1',
    },
    syncApiRouteMode: 'provider_proxy',
  });

  assert.match(pac, /syncApiHosts/);
  assert.match(pac, /global\.rotgbapi\.711proxy\.com/);
  assert.match(pac, /return "PROXY global\.rotgb\.711proxy\.com:10000";/);
});

test('IP proxy PAC can route special domains through current provider proxy', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  }, {
    specialDomainFallback: 'PROXY global.rotgb.711proxy.com:10000',
  });

  assert.match(pac, /return "PROXY global\.rotgb\.711proxy\.com:10000";/);
  assert.doesNotMatch(pac, /PROXY 127\.0\.0\.1:7897/);
});

test('IP proxy PAC can route special domains direct', () => {
  const api = loadIpProxyCore();
  const pac = api.buildIpProxyPacScript({
    host: 'global.rotgb.711proxy.com',
    port: 10000,
    protocol: 'http',
  }, {
    specialDomainFallback: 'DIRECT',
  });

  assert.match(pac, /return "DIRECT";/);
  assert.doesNotMatch(pac, /PROXY 127\.0\.0\.1:7897/);
});

test('IP proxy apply supports a temporary direct override for special domains', async () => {
  const api = loadIpProxyCore();
  let appliedPac = '';
  const stateUpdates = [];
  const originalChrome = globalThis.chrome;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;
  const originalAddLog = globalThis.addLog;

  try {
    api.chrome.proxy = {
      settings: {
        clear(_details, callback) {
          callback();
        },
        set(details, callback) {
          appliedPac = details?.value?.pacScript?.data || '';
          callback();
        },
        get(_details, callback) {
          callback({
            levelOfControl: 'controlled_by_this_extension',
            value: {
              mode: 'pac_script',
              pacScript: {
                data: appliedPac,
              },
            },
          });
        },
      },
    };
    api.chrome.runtime = {};
    globalThis.chrome = api.chrome;
    globalThis.setState = async (updates) => {
      stateUpdates.push(updates);
    };
    globalThis.broadcastDataUpdate = () => {};
    globalThis.addLog = async () => {};

    const status = await api.applyIpProxySettingsFromState({
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'account',
      ipProxyHost: 'global.rotgb.711proxy.com',
      ipProxyPort: '10000',
      ipProxyProtocol: 'http',
      ipProxySpecialDomainRouteMode: 'provider_proxy',
    }, {
      specialDomainRouteModeOverride: 'direct',
      skipExitProbe: true,
    });

    assert.equal(status.applied, true);
    assert.match(appliedPac, /forceDirectPatterns[\s\S]*return "DIRECT";[\s\S]*syncApiHosts/);
    assert.equal(
      stateUpdates.some((patch) => Object.hasOwn(patch, 'ipProxySpecialDomainRouteMode')),
      false
    );
  } finally {
    if (originalChrome === undefined) {
      delete globalThis.chrome;
    } else {
      globalThis.chrome = originalChrome;
    }
    if (originalSetState === undefined) {
      delete globalThis.setState;
    } else {
      globalThis.setState = originalSetState;
    }
    if (originalBroadcastDataUpdate === undefined) {
      delete globalThis.broadcastDataUpdate;
    } else {
      globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
    }
    if (originalAddLog === undefined) {
      delete globalThis.addLog;
    } else {
      globalThis.addLog = originalAddLog;
    }
  }
});

test('sidepanel loads IP proxy scripts before sidepanel bootstrap', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const providerIndex = html.indexOf('<script src="ip-proxy-provider-711proxy.js"></script>');
  const panelIndex = html.indexOf('<script src="ip-proxy-panel.js"></script>');
  const sidepanelIndex = html.indexOf('<script src="sidepanel.js"></script>');

  assert.notEqual(providerIndex, -1);
  assert.notEqual(panelIndex, -1);
  assert.notEqual(sidepanelIndex, -1);
  assert.ok(providerIndex < panelIndex);
  assert.ok(panelIndex < sidepanelIndex);
});

test('IP proxy auto-switch threshold is clamped to the supported range', () => {
  const api = loadIpProxyCore();

  assert.equal(api.resolveIpProxyAutoSwitchThreshold({ ipProxyPoolTargetCount: '0' }), 1);
  assert.equal(api.resolveIpProxyAutoSwitchThreshold({ ipProxyPoolTargetCount: '25' }), 25);
  assert.equal(api.resolveIpProxyAutoSwitchThreshold({ ipProxyPoolTargetCount: '9999' }), 500);
});

test('IP proxy switch-IP round count defaults to one and is clamped to the supported range', () => {
  const api = loadIpProxyCore();

  assert.equal(api.resolveIpProxySwitchIpRoundCount({}), 1);
  assert.equal(api.resolveIpProxySwitchIpRoundCount({ ipProxySwitchIpRoundCount: '0' }), 1);
  assert.equal(api.resolveIpProxySwitchIpRoundCount({ ipProxySwitchIpRoundCount: '25' }), 25);
  assert.equal(api.resolveIpProxySwitchIpRoundCount({ ipProxySwitchIpRoundCount: '9999' }), 500);
});

test('711 proxy region mismatch with missing auth challenge keeps routing as warning instead of hard failure', () => {
  const api = loadIpProxyCore();

  const status = api.applyExitRegionExpectation({
    applied: true,
    reason: 'applied',
    provider: '711proxy',
    hasAuth: true,
    username: 'USER047152-zone-custom-region-US',
    entrySource: 'fixed_account',
    exitIp: '1.2.3.4',
    exitRegion: 'BR',
    authDiagnostics: 'auth(challenge=0,provided=0,isProxy=n/a,status=0,host=unknown)',
    error: '',
    warning: '',
  }, 'US');

  assert.equal(status.applied, true);
  assert.equal(status.reason, 'applied_with_warning');
  assert.equal(status.error, '');
  assert.match(
    String(status.warning || ''),
    /地区校验未通过且未触发代理鉴权挑战，疑似匿名链路；先保留代理接管并给出强告警/
  );
  assert.match(String(status.warning || ''), /期望 US，实际 BR/);
});

test('711 sticky session keeps IP probe on ipinfo but separately checks ChatGPT target', () => {
  const api = loadIpProxyCore();

  assert.deepStrictEqual(
    api.resolveExitProbeEndpoints({
      provider: '711proxy',
      username: 'USER794331-zone-custom-region-TH-session-69381850-sessTime-5',
    }),
    ['https://ipinfo.io/json']
  );

  assert.deepStrictEqual(api.resolveTargetReachabilityEndpoints(), ['https://chatgpt.com/']);
});

test('711 API URL parser supports real split and sticky/rotating session types', () => {
  const api = loadIpProxyCore();

  const rotating = api.parse711ProxyApiConfigFromUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom-plus&ptype=7&count=1&region=us&proto=https&stype=text&split=\\r\\n&sessType=rotating&trace=keepme'
  );
  assert.equal(rotating.isValidUrl, true);
  assert.equal(rotating.zone, 'custom-plus');
  assert.equal(rotating.ptype, '7');
  assert.equal(rotating.count, '1');
  assert.equal(rotating.region, 'US');
  assert.equal(rotating.proto, 'http');
  assert.equal(rotating.stype, 'text');
  assert.equal(rotating.split, '\r\n');
  assert.equal(rotating.sessType, 'rotating');
  assert.equal(rotating.sessTime, '');
  assert.equal(rotating.sessAuto, '');
  assert.deepEqual(rotating.extraQueryEntries, [{ key: 'trace', value: 'keepme' }]);

  const sticky = api.parse711ProxyApiConfigFromUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n&sessType=sticky&sessTime=5&sessAuto=1'
  );
  assert.equal(sticky.sessType, 'sticky');
  assert.equal(sticky.sessTime, '5');
  assert.equal(sticky.sessAuto, '1');

  const noRegion = api.parse711ProxyApiConfigFromUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n&sessType=rotating'
  );
  assert.equal(noRegion.region, '');
});

test('711 API URL builder preserves host, keeps rotating sessType, and omits sticky-only fields when not sticky', () => {
  const api = loadIpProxyCore();

  const stickyUrl = api.build711ProxyApiUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n&trace=keepme&token=abc',
    {
      count: '3',
      region: 'jp',
      zone: 'custom-plus',
      ptype: '7',
      proto: 'https',
      stype: 'text',
      split: '\\r\\n',
      sessType: 'sticky',
      sessTime: '5',
      sessAuto: '1',
    }
  );
  assert.match(stickyUrl, /^http:\/\/global\.rotgbapi\.711proxy\.com:8089\/gen\?/);
  assert.match(stickyUrl, /trace=keepme/);
  assert.match(stickyUrl, /token=abc/);
  assert.match(stickyUrl, /region=JP/);
  assert.match(stickyUrl, /zone=custom-plus/);
  assert.match(stickyUrl, /ptype=7/);
  assert.match(stickyUrl, /proto=http/);
  assert.match(stickyUrl, /split=%5Cr%5Cn/);
  assert.match(stickyUrl, /sessType=sticky/);
  assert.match(stickyUrl, /sessTime=5/);
  assert.match(stickyUrl, /sessAuto=1/);

  const rotatingUrl = api.build711ProxyApiUrl(stickyUrl, {
    sessType: 'rotating',
  });
  assert.match(rotatingUrl, /sessType=rotating/);
  assert.doesNotMatch(rotatingUrl, /sessTime=/);
  assert.doesNotMatch(rotatingUrl, /sessAuto=/);

  const optionalSessTypeUrl = api.build711ProxyApiUrl(stickyUrl, {
    sessType: '',
  });
  assert.match(optionalSessTypeUrl, /sessType=rotating/);
  assert.doesNotMatch(optionalSessTypeUrl, /sessTime=/);
  assert.doesNotMatch(optionalSessTypeUrl, /sessAuto=/);

  const removedRegionUrl = api.build711ProxyApiUrl(stickyUrl, {
    region: '',
  });
  assert.doesNotMatch(removedRegionUrl, /region=/);
});

test('711 API validation normalizes missing count to default 1 and still validates required fixed params', () => {
  const api = loadIpProxyCore();

  const valid = api.validate711ProxyApiConfig({
    apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n',
  });
  assert.equal(valid.valid, true);

  const normalizedMissingCount = api.validate711ProxyApiConfig({
    apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&proto=http&stype=text&split=\\r\\n',
  });
  assert.equal(normalizedMissingCount.valid, true);
  assert.equal(normalizedMissingCount.config.count, '1');

  const normalizedMissingProto = api.validate711ProxyApiConfig({
    apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&stype=text&split=\\r\\n',
  });
  assert.equal(normalizedMissingProto.valid, true);
  assert.equal(normalizedMissingProto.config.proto, 'http');

  const invalidRegion = api.validate711ProxyApiConfig({
    apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n',
    region: 'J',
  });
  assert.equal(invalidRegion.valid, true);
  assert.equal(invalidRegion.config.region, '');

  const normalizedProto = api.validate711ProxyApiConfig({
    apiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=socks4&stype=text&split=\\r\\n',
  });
  assert.equal(normalizedProto.valid, true);
  assert.equal(normalizedProto.config.proto, 'socks5');
});

test('711 JSON API payload normalization supports wrapped object candidates', () => {
  const api = loadIpProxyCore();

  assert.deepEqual(
    api.normalizeIpProxyListFromPayload({ data: [{ ip: '1.2.3.4', port: 9000 }] }, '711proxy', {
      mode: 'api',
      apiProtocol: 'socks5',
    }),
    [{
      host: '1.2.3.4',
      port: 9000,
      username: '',
      password: '',
      protocol: 'socks5',
      region: '',
      provider: '711proxy',
    }]
  );

  assert.deepEqual(
    api.normalizeIpProxyListFromPayload({
      result: { ip: '5.6.7.8', port: 10000, protocol: 'socks4' },
    }, '711proxy', {
      mode: 'api',
      apiProtocol: 'http',
    }),
    [{
      host: '5.6.7.8',
      port: 10000,
      username: '',
      password: '',
      protocol: 'http',
      region: '',
      provider: '711proxy',
    }]
  );
});

test('711 API pool normalization preserves duplicate ip:port entries while non-API normalization still deduplicates', () => {
  const api = loadIpProxyCore();
  const duplicatePayload = [
    { ip: '1.2.3.4', port: 9000 },
    { ip: '1.2.3.4', port: 9000 },
    { ip: '5.6.7.8', port: 10000 },
  ];

  const apiPool = api.normalizeIpProxyListFromPayload(duplicatePayload, '711proxy', {
    mode: 'api',
  });
  assert.equal(apiPool.length, 3);
  assert.equal(apiPool[0].host, '1.2.3.4');
  assert.equal(apiPool[1].host, '1.2.3.4');
  assert.equal(apiPool[2].host, '5.6.7.8');
  assert.equal(apiPool[0].protocol, 'http');
  assert.equal(apiPool[1].protocol, 'http');
  assert.equal(apiPool[2].protocol, 'http');

  const dedupedPool = api.normalizeProxyPoolEntries([
    'http://global.rotgb.711proxy.com:10000:user:pass',
    'http://global.rotgb.711proxy.com:10000:user:pass',
  ], '711proxy');
  assert.equal(dedupedPool.length, 1);
});

test('pullIpProxyPoolFromApi always uses the apiUrl from the provided state snapshot', async () => {
  const api = loadIpProxyCore();
  const fetchCalls = [];
  global.fetch = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      text: async () => '1.2.3.4:8080:user:pass',
    };
  };

  const pool = await api.pullIpProxyPoolFromApi({
    ipProxyService: '711proxy',
    ipProxyMode: 'api',
    ipProxyApiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=1&proto=https&stype=text&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating',
  });

  assert.equal(fetchCalls[0], 'http://global.rotgbapi.711proxy.com:8089/gen?count=1&proto=http&stype=text&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating');
  assert.equal(pool.length, 1);
  assert.equal(pool[0].host, '1.2.3.4');
  assert.equal(pool[0].protocol, 'http');
});

test('IP proxy disabled state releases Chrome proxy control and clears runtime auth state', async () => {
  const api = loadIpProxyCore();
  const proxyEvents = [];
  const stateUpdates = [];
  const broadcasts = [];
  const guardEvents = [];
  const browsingDataCalls = [];
  let proxyValue = { mode: 'direct' };
  const originalChrome = globalThis.chrome;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;

  try {
    api.chrome.proxy = {
      settings: {
        clear(details, callback) {
          proxyEvents.push({ type: 'clear', details });
          callback();
        },
        set(details, callback) {
          proxyEvents.push({ type: 'set', details });
          proxyValue = details?.value || {};
          callback();
        },
        get(_details, callback) {
          callback({
            levelOfControl: 'controlled_by_this_extension',
            value: proxyValue,
          });
        },
      },
    };
    api.chrome.runtime = {};
    api.chrome.webRequest = {
      handlerBehaviorChanged(callback) {
        callback();
      },
    };
    api.chrome.browsingData = {
      remove(options, dataTypes) {
        browsingDataCalls.push({ options, dataTypes });
        return Promise.resolve();
      },
    };
    api.chrome.declarativeNetRequest = {
      updateDynamicRules(payload) {
        guardEvents.push(payload);
        return Promise.resolve();
      },
    };
    globalThis.chrome = api.chrome;
    globalThis.setState = async (updates) => {
      stateUpdates.push(updates);
    };
    globalThis.broadcastDataUpdate = (updates) => {
      broadcasts.push(updates);
    };

    await api.applyIpProxySettingsFromState({
      ipProxyEnabled: true,
      ipProxyService: '711proxy',
      ipProxyMode: 'account',
      ipProxyHost: 'global.rotgb.711proxy.com',
      ipProxyPort: '10000',
      ipProxyProtocol: 'http',
      ipProxyUsername: 'user-a',
      ipProxyPassword: 'pass-a',
    }, {
      skipExitProbe: true,
    });
    assert.deepEqual(api.getCurrentIpProxyAuthEntry(), {
      host: 'global.rotgb.711proxy.com',
      port: 10000,
      username: 'user-a',
      password: 'pass-a',
    });
    proxyEvents.length = 0;
    stateUpdates.length = 0;
    broadcasts.length = 0;

    const status = await api.applyIpProxySettingsFromState({
      ipProxyEnabled: false,
      ipProxyService: '711proxy',
      ipProxyMode: 'account',
      ipProxyHost: 'global.rotgb.711proxy.com',
      ipProxyPort: '10000',
      ipProxyProtocol: 'http',
      ipProxyUsername: 'user-a',
      ipProxyPassword: 'pass-a',
    }, {
      resetNetworkState: true,
    });

    assert.equal(status.enabled, false);
    assert.equal(status.applied, false);
    assert.equal(status.reason, 'disabled');
    assert.equal(status.warning, '');
    assert.equal(api.getCurrentIpProxyAuthEntry(), null);
    assert.deepEqual(proxyEvents.map((event) => event.type), ['clear']);
    assert.deepEqual(proxyEvents[0].details, {
      scope: 'regular',
    });
    assert.equal(browsingDataCalls.length, 1);
    assert.ok(guardEvents.some((event) => event.addRules.length === 0));
    assert.ok(stateUpdates.length > 0);
    const finalPatch = stateUpdates.at(-1);
    assert.equal(finalPatch.ipProxyApplied, false);
    assert.equal(finalPatch.ipProxyAppliedReason, 'disabled');
    assert.equal(finalPatch.ipProxyAppliedHost, '');
    assert.equal(finalPatch.ipProxyAppliedPort, 0);
    assert.equal(finalPatch.ipProxyAppliedHasAuth, false);
    assert.equal(finalPatch.ipProxyAppliedExitIp, '');
    assert.equal(finalPatch.ipProxyAppliedExitRegion, '');
    assert.equal(finalPatch.ipProxyAppliedExitDetecting, false);
    assert.deepEqual(broadcasts.at(-1), finalPatch);
  } finally {
    if (originalChrome === undefined) {
      delete globalThis.chrome;
    } else {
      globalThis.chrome = originalChrome;
    }
    if (originalSetState === undefined) {
      delete globalThis.setState;
    } else {
      globalThis.setState = originalSetState;
    }
    if (originalBroadcastDataUpdate === undefined) {
      delete globalThis.broadcastDataUpdate;
    } else {
      globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
    }
  }
});

function installProxySettingsMock(api, initialValue = { mode: 'pac_script', pacScript: { data: 'original' } }) {
  const events = [];
  let currentValue = structuredClone(initialValue);
  api.chrome.runtime = {};
  api.chrome.proxy = {
    settings: {
      get(details, callback) {
        events.push({ type: 'get', details });
        callback({ levelOfControl: 'controlled_by_this_extension', value: structuredClone(currentValue) });
      },
      set(details, callback) {
        events.push({ type: 'set', details: structuredClone(details) });
        currentValue = structuredClone(details.value);
        callback();
      },
      clear(details, callback) {
        events.push({ type: 'clear', details: structuredClone(details) });
        currentValue = {};
        callback();
      },
    },
  };
  return {
    events,
    get currentValue() {
      return currentValue;
    },
  };
}

async function pull711PoolWithRoute(routeMode, extraState = {}, fetchImpl = null) {
  const api = loadIpProxyCore();
  const proxyMock = installProxySettingsMock(api);
  const originalFetch = global.fetch;
  global.fetch = fetchImpl || (async () => ({
    ok: true,
    text: async () => '1.2.3.4:8080:user:pass',
  }));

  try {
    const pool = await api.pullIpProxyPoolFromApi({
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyApiRouteMode: routeMode,
      ipProxyApiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=1&proto=http&stype=text&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating',
      ...extraState,
    });
    return { api, pool, proxyMock };
  } catch (error) {
    error.proxyMock = proxyMock;
    throw error;
  } finally {
    if (originalFetch === undefined) {
      delete global.fetch;
    } else {
      global.fetch = originalFetch;
    }
  }
}

test('pullIpProxyPoolFromApi routes 711 API fetch direct and restores previous proxy settings', async () => {
  const { pool, proxyMock } = await pull711PoolWithRoute('direct');

  const setEvents = proxyMock.events.filter((event) => event.type === 'set');
  assert.equal(pool.length, 1);
  assert.equal(setEvents.length, 2);
  assert.deepEqual(setEvents[0].details.value, { mode: 'direct' });
  assert.deepEqual(setEvents[1].details.value, { mode: 'pac_script', pacScript: { data: 'original' } });
});

test('pullIpProxyPoolFromApi routes 711 API fetch through local proxy and restores previous proxy settings', async () => {
  const { proxyMock } = await pull711PoolWithRoute('local_proxy');

  const setEvents = proxyMock.events.filter((event) => event.type === 'set');
  assert.equal(setEvents.length, 2);
  assert.equal(setEvents[0].details.value.mode, 'pac_script');
  assert.match(setEvents[0].details.value.pacScript.data, /PROXY 127\.0\.0\.1:7897/);
  assert.deepEqual(setEvents[1].details.value, { mode: 'pac_script', pacScript: { data: 'original' } });
});

test('pullIpProxyPoolFromApi routes 711 API fetch through current provider proxy and restores previous proxy settings', async () => {
  const { proxyMock } = await pull711PoolWithRoute('provider_proxy', {
    ipProxyApiPool: [
      {
        host: 'global.rotgb.711proxy.com',
        port: 10000,
        username: 'user',
        password: 'pass',
        protocol: 'http',
        provider: '711proxy',
      },
    ],
    ipProxyApiCurrentIndex: 0,
  });

  const setEvents = proxyMock.events.filter((event) => event.type === 'set');
  assert.equal(setEvents.length, 2);
  assert.equal(setEvents[0].details.value.mode, 'pac_script');
  assert.match(setEvents[0].details.value.pacScript.data, /PROXY global\.rotgb\.711proxy\.com:10000/);
  assert.deepEqual(setEvents[1].details.value, { mode: 'pac_script', pacScript: { data: 'original' } });
});

test('pullIpProxyPoolFromApi restores previous proxy settings after 711 API fetch failure', async () => {
  let thrown = null;
  await assert.rejects(
    async () => {
      try {
        await pull711PoolWithRoute('local_proxy', {}, async () => ({
          ok: false,
          status: 500,
          text: async () => '',
        }));
      } catch (error) {
        thrown = error;
        throw error;
      }
    },
    /HTTP 500/
  );
  const setEvents = thrown.proxyMock.events.filter((event) => event.type === 'set');
  assert.equal(setEvents.length, 2);
  assert.match(setEvents[0].details.value.pacScript.data, /PROXY 127\.0\.0\.1:7897/);
  assert.deepEqual(setEvents[1].details.value, { mode: 'pac_script', pacScript: { data: 'original' } });
});

test('pullIpProxyPoolFromApi preserves duplicate entries for 711 API mode', async () => {
  const api = loadIpProxyCore();
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({
      data: [
        { ip: '1.2.3.4', port: 9000 },
        { ip: '1.2.3.4', port: 9000 },
        { ip: '5.6.7.8', port: 10000 },
      ],
    }),
  });

  try {
    const pool = await api.pullIpProxyPoolFromApi({
      ipProxyService: '711proxy',
      ipProxyMode: 'api',
      ipProxyApiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=3&proto=socks4&stype=json&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating',
    });

    assert.equal(pool.length, 3);
    assert.equal(pool[0].host, '1.2.3.4');
    assert.equal(pool[1].host, '1.2.3.4');
    assert.equal(pool[2].host, '5.6.7.8');
    assert.equal(pool[0].protocol, 'socks5');
    assert.equal(pool[1].protocol, 'socks5');
    assert.equal(pool[2].protocol, 'socks5');
  } finally {
    if (originalFetch === undefined) {
      delete global.fetch;
    } else {
      global.fetch = originalFetch;
    }
  }
});

test('711 API different-exit rotation skips same exit and accepts the next detected exit', async () => {
  const api = loadIpProxyCore();
  const originalGetState = globalThis.getState;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;
  const oldExitIp = '203.0.113.8';
  const pool = [
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy' },
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy' },
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy' },
  ];
  let state = {
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    ipProxyMode: 'api',
    ipProxyApiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=3&proto=http&stype=text&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating',
    ipProxyApiPool: pool,
    ipProxyApiCurrentIndex: 0,
    ipProxyApiCurrent: pool[0],
    ipProxyApplied: true,
    ipProxyAppliedReason: 'applied',
    ipProxyAppliedExitIp: oldExitIp,
    ipProxyAppliedExitRegion: 'JP',
    ipProxyAppliedExitDetecting: false,
  };
  const stateUpdates = [];
  let switchCalls = 0;

  try {
    globalThis.getState = async () => state;
    globalThis.setState = async (updates) => {
      state = { ...state, ...updates };
      stateUpdates.push(updates);
    };
    globalThis.broadcastDataUpdate = () => {};

    const result = await api.switch711ApiProxyUntilExitChanged({
      state,
      switchProxyFn: async () => {
        switchCalls += 1;
        const index = switchCalls;
        state = {
          ...state,
          ipProxyApiCurrentIndex: index,
          ipProxyApiCurrent: pool[index],
        };
        return {
          mode: 'api',
          provider: '711proxy',
          count: pool.length,
          index,
          current: pool[index],
          display: `${pool[index].host}:${pool[index].port} (${index + 1}/${pool.length})`,
          pool,
          proxyRouting: {
            enabled: true,
            applied: true,
            reason: 'applied',
            host: pool[index].host,
            port: pool[index].port,
            provider: '711proxy',
            exitDetecting: false,
            exitIp: switchCalls === 1 ? oldExitIp : '198.51.100.9',
            exitRegion: switchCalls === 1 ? 'JP' : 'US',
            exitSource: 'page_context',
          },
        };
      },
    });

    assert.equal(result.exitChanged, true);
    assert.equal(result.previousExitIp, oldExitIp);
    assert.equal(result.attemptedCount, 2);
    assert.equal(result.proxyRouting.exitIp, '198.51.100.9');
    assert.equal(
      stateUpdates.some((patch) => patch.ipProxyAppliedExitDetecting === true && patch.ipProxyAppliedExitIp === ''),
      true
    );
    assert.equal(state.ipProxyAppliedExitDetecting, false);
    assert.equal(state.ipProxyAppliedExitIp, '198.51.100.9');
    assert.equal(state.ipProxyAppliedExitRegion, 'US');
  } finally {
    if (originalGetState === undefined) delete globalThis.getState;
    else globalThis.getState = originalGetState;
    if (originalSetState === undefined) delete globalThis.setState;
    else globalThis.setState = originalSetState;
    if (originalBroadcastDataUpdate === undefined) delete globalThis.broadcastDataUpdate;
    else globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
  }
});

test('711 API different-exit rotation restores old exit state when every candidate keeps the same exit', async () => {
  const api = loadIpProxyCore();
  const originalGetState = globalThis.getState;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;
  const originalAddLog = globalThis.addLog;
  const oldExitIp = '203.0.113.8';
  const pool = [
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy' },
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy' },
  ];
  let state = {
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    ipProxyMode: 'api',
    ipProxyApiUrl: 'http://global.rotgbapi.711proxy.com:8089/gen?count=2&proto=http&stype=text&split=%5Cr%5Cn&zone=custom&ptype=1&sessType=rotating',
    ipProxyApiPool: pool,
    ipProxyApiCurrentIndex: 0,
    ipProxyApiCurrent: pool[0],
    ipProxyApplied: true,
    ipProxyAppliedReason: 'applied',
    ipProxyAppliedExitIp: oldExitIp,
    ipProxyAppliedExitRegion: 'JP',
    ipProxyAppliedExitDetecting: false,
  };
  let appliedPac = '';

  try {
    api.chrome.proxy = {
      settings: {
        clear(_details, callback) {
          callback();
        },
        set(details, callback) {
          appliedPac = details?.value?.pacScript?.data || '';
          callback();
        },
        get(_details, callback) {
          callback({
            levelOfControl: 'controlled_by_this_extension',
            value: {
              mode: 'pac_script',
              pacScript: { data: appliedPac },
            },
          });
        },
      },
    };
    api.chrome.runtime = {};
    globalThis.getState = async () => state;
    globalThis.setState = async (updates) => {
      state = { ...state, ...updates };
    };
    globalThis.broadcastDataUpdate = () => {};
    globalThis.addLog = async () => {};

    const result = await api.switch711ApiProxyUntilExitChanged({
      state,
      switchProxyFn: async () => ({
        mode: 'api',
        provider: '711proxy',
        count: pool.length,
        index: 1,
        current: pool[1],
        display: `${pool[1].host}:${pool[1].port} (2/${pool.length})`,
        pool,
        proxyRouting: {
          enabled: true,
          applied: true,
          reason: 'applied',
          host: pool[1].host,
          port: pool[1].port,
          provider: '711proxy',
          exitDetecting: false,
          exitIp: oldExitIp,
          exitRegion: 'JP',
          exitSource: 'page_context',
        },
      }),
    });

    assert.equal(result.skipped, true);
    assert.equal(result.exitChanged, false);
    assert.equal(result.skippedReason, 'same_exit_exhausted');
    assert.equal(result.attemptedCount, 1);
    assert.equal(state.ipProxyAppliedExitDetecting, false);
    assert.equal(state.ipProxyAppliedExitIp, oldExitIp);
    assert.equal(state.ipProxyAppliedExitRegion, 'JP');
  } finally {
    if (originalGetState === undefined) delete globalThis.getState;
    else globalThis.getState = originalGetState;
    if (originalSetState === undefined) delete globalThis.setState;
    else globalThis.setState = originalSetState;
    if (originalBroadcastDataUpdate === undefined) delete globalThis.broadcastDataUpdate;
    else globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
    if (originalAddLog === undefined) delete globalThis.addLog;
    else globalThis.addLog = originalAddLog;
  }
});

test('IP proxy region-match rotation skips mismatched exit country and accepts matching exit', async () => {
  const api = loadIpProxyCore();
  const originalGetState = globalThis.getState;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;
  const pool = [
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy', region: 'US' },
    { host: '10.0.0.2', port: 9000, protocol: 'http', provider: '711proxy', region: 'US' },
  ];
  let state = {
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    ipProxyMode: 'account',
    ipProxyAccountPool: pool,
    ipProxyAccountCurrentIndex: 0,
    ipProxyAccountCurrent: pool[0],
  };
  let switchCalls = 0;

  try {
    globalThis.getState = async () => state;
    globalThis.setState = async (updates) => {
      state = { ...state, ...updates };
    };
    globalThis.broadcastDataUpdate = () => {};

    const result = await api.switchIpProxyUntilExitRegionMatches({
      state,
      switchProxyFn: async () => {
        switchCalls += 1;
        const current = pool[Math.min(switchCalls - 1, pool.length - 1)];
        state = {
          ...state,
          ipProxyAccountCurrentIndex: switchCalls - 1,
          ipProxyAccountCurrent: current,
        };
        return {
          mode: 'account',
          provider: '711proxy',
          count: pool.length,
          index: switchCalls - 1,
          current,
          display: `${current.host}:${current.port} [${current.region}]`,
          pool,
          proxyRouting: {
            enabled: true,
            applied: true,
            reason: 'applied',
            host: current.host,
            port: current.port,
            region: current.region,
            provider: '711proxy',
            exitDetecting: false,
            exitIp: switchCalls === 1 ? '198.51.100.10' : '203.0.113.10',
            exitRegion: switchCalls === 1 ? 'DE' : 'US',
            exitSource: 'page_context',
          },
        };
      },
      maxAttempts: 2,
    });

    assert.equal(result.exitRegionMatched, true);
    assert.equal(result.expectedRegion, 'US');
    assert.equal(result.attemptedCount, 2);
    assert.equal(result.proxyRouting.exitRegion, 'US');
    assert.equal(switchCalls, 2);
  } finally {
    if (originalGetState === undefined) delete globalThis.getState;
    else globalThis.getState = originalGetState;
    if (originalSetState === undefined) delete globalThis.setState;
    else globalThis.setState = originalSetState;
    if (originalBroadcastDataUpdate === undefined) delete globalThis.broadcastDataUpdate;
    else globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
  }
});

test('IP proxy region-match rotation reports skipped when exit country never matches', async () => {
  const api = loadIpProxyCore();
  const originalGetState = globalThis.getState;
  const originalSetState = globalThis.setState;
  const originalBroadcastDataUpdate = globalThis.broadcastDataUpdate;
  const pool = [
    { host: '10.0.0.1', port: 9000, protocol: 'http', provider: '711proxy', region: 'US' },
    { host: '10.0.0.2', port: 9000, protocol: 'http', provider: '711proxy', region: 'US' },
  ];
  let state = {
    ipProxyEnabled: true,
    ipProxyService: '711proxy',
    ipProxyMode: 'account',
    ipProxyAccountPool: pool,
    ipProxyAccountCurrentIndex: 0,
    ipProxyAccountCurrent: pool[0],
  };

  try {
    globalThis.getState = async () => state;
    globalThis.setState = async (updates) => {
      state = { ...state, ...updates };
    };
    globalThis.broadcastDataUpdate = () => {};

    const result = await api.switchIpProxyUntilExitRegionMatches({
      state,
      switchProxyFn: async (_direction, options = {}) => {
        const currentIndex = Number(options?.state?.ipProxyAccountCurrentIndex || 0);
        const nextIndex = (currentIndex + 1) % pool.length;
        const current = pool[nextIndex];
        state = {
          ...state,
          ipProxyAccountCurrentIndex: nextIndex,
          ipProxyAccountCurrent: current,
        };
        return {
          mode: 'account',
          provider: '711proxy',
          count: pool.length,
          index: nextIndex,
          current,
          display: `${current.host}:${current.port} [${current.region}]`,
          pool,
          proxyRouting: {
            enabled: true,
            applied: true,
            reason: 'applied',
            host: current.host,
            port: current.port,
            region: current.region,
            provider: '711proxy',
            exitDetecting: false,
            exitIp: '198.51.100.10',
            exitRegion: 'DE',
            exitSource: 'page_context',
          },
        };
      },
      maxAttempts: 2,
    });

    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'region_mismatch');
    assert.equal(result.exitRegionMatched, false);
    assert.equal(result.expectedRegion, 'US');
    assert.equal(result.attemptedCount, 2);
    assert.match(result.error, /期望 US，实际 DE/);
  } finally {
    if (originalGetState === undefined) delete globalThis.getState;
    else globalThis.getState = originalGetState;
    if (originalSetState === undefined) delete globalThis.setState;
    else globalThis.setState = originalSetState;
    if (originalBroadcastDataUpdate === undefined) delete globalThis.broadcastDataUpdate;
    else globalThis.broadcastDataUpdate = originalBroadcastDataUpdate;
  }
});

test('target reachability failure turns detected exit IP into connectivity_failed', () => {
  const api = loadIpProxyCore();
  const status = api.applyTargetReachabilityExpectation({
    applied: true,
    reason: 'applied',
    exitIp: '58.10.48.73',
    exitRegion: 'TH',
  }, {
    reachable: false,
    endpoint: 'https://chatgpt.com/',
    error: 'target:page_context:https://chatgpt.com/:net::ERR_EMPTY_RESPONSE',
  });

  assert.equal(status.applied, false);
  assert.equal(status.reason, 'connectivity_failed');
  assert.match(status.error, /已检测到出口 IP 58\.10\.48\.73 \[TH\]/);
  assert.match(status.error, /真实目标 chatgpt\.com 不可达/);
  assert.match(status.error, /ERR_EMPTY_RESPONSE/);
});

test('connectivity_failed keeps DNR leak guard off so ChatGPT shows proxy error instead of blocked by extension', () => {
  const api = loadIpProxyCore();

  assert.equal(api.shouldEnableIpProxyLeakGuardForStatus({
    enabled: true,
    applied: false,
    reason: 'connectivity_failed',
  }), false);

  assert.equal(api.shouldEnableIpProxyLeakGuardForStatus({
    enabled: true,
    applied: false,
    reason: 'missing_proxy_entry',
  }), true);
});
