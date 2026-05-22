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
  buildIpProxyPacScript,
  build711ProxyApiUrl,
  chrome,
  createAutomationScopedTab,
  buildIpProxyRoutingStatePatch,
  applyTargetReachabilityExpectation,
  getAccountModeProxyPoolFromState,
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
  resolveTargetReachabilityEndpoints,
  shouldEnableIpProxyLeakGuardForStatus,
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
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&region=us&proto=http&stype=text&split=\\r\\n&sessType=rotating'
  );
  assert.equal(rotating.isValidUrl, true);
  assert.equal(rotating.zone, 'custom');
  assert.equal(rotating.ptype, '1');
  assert.equal(rotating.count, '1');
  assert.equal(rotating.region, 'US');
  assert.equal(rotating.proto, 'http');
  assert.equal(rotating.stype, 'text');
  assert.equal(rotating.split, '\r\n');
  assert.equal(rotating.sessType, 'rotating');
  assert.equal(rotating.sessTime, '');
  assert.equal(rotating.sessAuto, '');

  const sticky = api.parse711ProxyApiConfigFromUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n&sessType=sticky&sessTime=5&sessAuto=1'
  );
  assert.equal(sticky.sessType, 'sticky');
  assert.equal(sticky.sessTime, '5');
  assert.equal(sticky.sessAuto, '1');
});

test('711 API URL builder preserves host, keeps rotating sessType, and omits sticky-only fields when not sticky', () => {
  const api = loadIpProxyCore();

  const stickyUrl = api.build711ProxyApiUrl(
    'http://global.rotgbapi.711proxy.com:8089/gen?zone=custom&ptype=1&count=1&proto=http&stype=text&split=\\r\\n&trace=keepme',
    {
      count: '3',
      region: 'jp',
      zone: 'custom',
      ptype: '1',
      proto: 'http',
      stype: 'text',
      split: '\\r\\n',
      sessType: 'sticky',
      sessTime: '5',
      sessAuto: '1',
    }
  );
  assert.match(stickyUrl, /^http:\/\/global\.rotgbapi\.711proxy\.com:8089\/gen\?/);
  assert.match(stickyUrl, /trace=keepme/);
  assert.match(stickyUrl, /region=JP/);
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
});

test('711 JSON API payload normalization supports wrapped object candidates', () => {
  const api = loadIpProxyCore();

  assert.deepEqual(
    api.normalizeIpProxyListFromPayload({ data: [{ ip: '1.2.3.4', port: 9000 }] }, '711proxy'),
    [{
      host: '1.2.3.4',
      port: 9000,
      username: '',
      password: '',
      protocol: 'http',
      region: '',
      provider: '711proxy',
    }]
  );

  assert.deepEqual(
    api.normalizeIpProxyListFromPayload({ result: { ip: '5.6.7.8', port: 10000 } }, '711proxy'),
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
