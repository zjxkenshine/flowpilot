const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadBrowserFingerprintModule() {
  const source = fs.readFileSync('background/browser-fingerprint.js', 'utf8');
  return new Function('self', `${source}; return self.MultiPageBackgroundBrowserFingerprint;`)({});
}

function assertAllowedLanguageProfile(profile) {
  const allowed = new Set([
    'en-US|en-US,en|en-US,en;q=0.9',
    'zh-CN|zh-CN,zh|zh-CN,zh;q=0.9,en;q=0.8',
  ]);
  assert.equal(
    allowed.has(`${profile.locale}|${profile.languages.join(',')}|${profile.acceptLanguage}`),
    true
  );
}

test('browser fingerprint profile is stable only when an explicit seed is provided', () => {
  const api = loadBrowserFingerprintModule();
  const input = {
    exitIp: '198.51.100.8',
    exitRegion: 'JP',
    exitSource: 'page_context',
  };
  const state = { activeRunId: 'run-001' };

  const first = api.buildBrowserFingerprintProfile(input, state, { createdAt: 1, seed: 'fixed-jp-seed' });
  const second = api.buildBrowserFingerprintProfile(input, state, { createdAt: 1, seed: 'fixed-jp-seed' });

  assert.deepEqual(second, first);
  assert.equal(first.exitRegion, 'JP');
  assert.equal(first.locale, 'zh-CN');
  assert.deepEqual(first.languages, ['zh-CN', 'zh']);
  assert.equal(first.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
  assert.equal(first.timezoneId, 'Asia/Tokyo');
  assert.equal(first.level, 'standard');
  assert.equal(first.language, 'zh-CN');
});

test('browser fingerprint level normalization supports basic standard and enhanced', () => {
  const api = loadBrowserFingerprintModule();

  assert.equal(api.normalizeBrowserFingerprintLevel('basic'), 'basic');
  assert.equal(api.normalizeBrowserFingerprintLevel('standard'), 'standard');
  assert.equal(api.normalizeBrowserFingerprintLevel('enhanced'), 'enhanced');
  assert.equal(api.normalizeBrowserFingerprintLevel(' BASIC '), 'basic');
  assert.equal(api.normalizeBrowserFingerprintLevel('unknown'), 'standard');
  assert.equal(api.normalizeBrowserFingerprintLevel(''), 'standard');
});

test('browser fingerprint language normalization supports random', () => {
  const api = loadBrowserFingerprintModule();

  assert.equal(api.normalizeBrowserFingerprintLanguage('random'), 'random');
  assert.equal(api.normalizeBrowserFingerprintLanguage(' auto '), 'random');
  assert.equal(api.normalizeBrowserFingerprintLanguage('en'), 'en-US');
  assert.equal(api.normalizeBrowserFingerprintLanguage('zh-Hans'), 'zh-CN');
  assert.equal(api.normalizeBrowserFingerprintLanguage('unknown'), 'zh-CN');
});

test('browser fingerprint profile uses random seed instead of proxy ip binding', () => {
  const api = loadBrowserFingerprintModule();
  const first = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.8', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1 }
  );
  const second = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.8', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1 }
  );
  const differentExitWithSameSeed = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.9', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1, seed: 'same-random-seed' }
  );
  const baseWithSameSeed = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.8', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1, seed: 'same-random-seed' }
  );

  assert.notEqual(second.profileId, first.profileId);
  assert.equal(differentExitWithSameSeed.profileId, baseWithSameSeed.profileId);
  assert.equal(first.seedKey.includes('198.51.100.8'), false);
  assert.equal(first.seedKey.includes('run-001'), false);
  assert.equal(api.isValidBrowserFingerprintProfile(first), true);
});

test('browser fingerprint random language chooses an allowed concrete profile consistently for a seed', () => {
  const api = loadBrowserFingerprintModule();
  const profiles = Array.from({ length: 16 }, (_value, index) => api.buildBrowserFingerprintProfile(
    { exitIp: `198.51.100.${index + 1}`, exitRegion: index % 2 ? 'US' : 'SG' },
    { browserFingerprintLanguage: 'random' },
    { createdAt: 1, seed: `random-language-seed-${index}` }
  ));
  const repeat = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.99', exitRegion: 'BR' },
    { browserFingerprintLanguage: 'random' },
    { createdAt: 1, seed: 'random-language-seed-repeat' }
  );
  const repeatAgain = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.100', exitRegion: 'JP' },
    { browserFingerprintLanguage: 'random' },
    { createdAt: 1, seed: 'random-language-seed-repeat' }
  );

  assert.equal(api.normalizeBrowserFingerprintLanguage('random'), 'random');
  assert.equal(repeat.language, repeatAgain.language);
  assert.equal(repeat.locale, repeatAgain.locale);
  for (const profile of profiles.concat(repeat, repeatAgain)) {
    assert.notEqual(profile.language, 'random');
    assert.equal(profile.language, profile.locale);
    assert.equal(profile.languages[0], profile.language);
    assertAllowedLanguageProfile(profile);
  }
  assert.equal(new Set(profiles.map((profile) => profile.language)).size, 2);
});

test('browser fingerprint profile generates without exit ip and defaults to US region', () => {
  const api = loadBrowserFingerprintModule();
  const profile = api.buildBrowserFingerprintProfile({}, { activeRunId: 'run-no-ip' }, { createdAt: 1, seed: 'no-ip-seed' });

  assert.equal(api.isValidBrowserFingerprintProfile(profile), true);
  assert.equal(profile.exitIp, '');
  assert.equal(profile.exitRegion, 'US');
  assert.equal(profile.fallbackRegion, true);
  assert.ok(profile.timezoneId.startsWith('America/'));
  assert.equal(profile.seedKey.includes('no-exit-ip'), false);
});

test('browser fingerprint maps common regions to matching timezone and coordinates while defaulting language to simplified Chinese', () => {
  const api = loadBrowserFingerprintModule();
  const jp = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.1', exitRegion: 'JP' }, { runId: 'a' }, { createdAt: 1, seed: '1.1.1.1|JP|a' });
  const th = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.2', exitRegion: 'TH' }, { runId: 'a' }, { createdAt: 1, seed: '1.1.1.2|TH|a' });
  const sg = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.3', exitRegion: 'SG' }, { runId: 'a' }, { createdAt: 1, seed: '1.1.1.3|SG|a' });
  const br = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.4', exitRegion: 'BR' }, { runId: 'a' }, { createdAt: 1, seed: '1.1.1.4|BR|a' });
  const unknown = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.5', exitRegion: 'Atlantis' }, { runId: 'a' }, { createdAt: 1, seed: '1.1.1.5|Atlantis|a' });

  assert.equal(jp.locale, 'zh-CN');
  assert.deepEqual(jp.languages, ['zh-CN', 'zh']);
  assert.equal(jp.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
  assert.equal(jp.timezoneId, 'Asia/Tokyo');
  assert.ok(jp.geolocation.latitude > 35 && jp.geolocation.latitude < 36);
  assert.ok(jp.geolocation.longitude > 139 && jp.geolocation.longitude < 140);

  assert.equal(th.locale, 'zh-CN');
  assert.deepEqual(th.languages, ['zh-CN', 'zh']);
  assert.equal(th.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
  assert.equal(th.timezoneId, 'Asia/Bangkok');
  assert.ok(th.geolocation.latitude > 13 && th.geolocation.latitude < 14.5);

  assert.equal(sg.locale, 'zh-CN');
  assert.deepEqual(sg.languages, ['zh-CN', 'zh']);
  assert.equal(sg.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
  assert.equal(sg.timezoneId, 'Asia/Singapore');
  assert.ok(sg.geolocation.longitude > 103 && sg.geolocation.longitude < 105);

  assert.equal(br.exitRegion, 'BR');
  assert.equal(br.fallbackRegion, false);
  assert.equal(br.locale, 'zh-CN');
  assert.deepEqual(br.languages, ['zh-CN', 'zh']);
  assert.equal(br.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
  assert.equal(br.timezoneId, 'America/Sao_Paulo');
  assert.ok(br.geolocation.latitude > -24 && br.geolocation.latitude < -23);
  assert.ok(br.geolocation.longitude > -47 && br.geolocation.longitude < -46);

  assert.equal(unknown.exitRegion, 'US');
  assert.equal(unknown.fallbackRegion, true);
  assert.equal(unknown.locale, 'zh-CN');
  assert.deepEqual(unknown.languages, ['zh-CN', 'zh']);
  assert.equal(unknown.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');

  for (const profile of [jp, th, sg, br, unknown]) {
    assertAllowedLanguageProfile(profile);
  }
});

test('browser fingerprint language defaults to simplified Chinese regardless of region', () => {
  const api = loadBrowserFingerprintModule();
  for (const region of ['US', 'SG', 'BR', 'KR', 'DE', 'FR']) {
    const profile = api.buildBrowserFingerprintProfile(
      { exitIp: `203.0.113.${region.charCodeAt(0)}`, exitRegion: region },
      { runId: 'language-whitelist' },
      { createdAt: 1 }
    );
    assert.equal(profile.exitRegion, region);
    assert.equal(profile.fallbackRegion, false);
    assert.equal(profile.locale, 'zh-CN');
    assert.deepEqual(profile.languages, ['zh-CN', 'zh']);
    assert.equal(profile.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
    assertAllowedLanguageProfile(profile);
  }
});

test('browser fingerprint language uses manual English setting for any region', () => {
  const api = loadBrowserFingerprintModule();
  for (const region of ['US', 'SG', 'BR', 'JP', 'TH']) {
    const profile = api.buildBrowserFingerprintProfile(
      { exitIp: `203.0.113.${region.charCodeAt(0)}`, exitRegion: region },
      { runId: 'language-whitelist', browserFingerprintLanguage: 'en-US' },
      { createdAt: 1 }
    );
    assert.equal(profile.exitRegion, region);
    assert.equal(profile.language, 'en-US');
    assert.equal(profile.locale, 'en-US');
    assert.deepEqual(profile.languages, ['en-US', 'en']);
    assert.equal(profile.acceptLanguage, 'en-US,en;q=0.9');
    assertAllowedLanguageProfile(profile);
  }
});

test('browser fingerprint normalizes Brazil region names to BR', () => {
  const api = loadBrowserFingerprintModule();
  for (const region of ['Brazil', 'BRASIL']) {
    const profile = api.buildBrowserFingerprintProfile(
      { exitIp: `203.0.113.${region.length}`, exitRegion: region },
      { runId: 'brazil-aliases' },
      { createdAt: 1 }
    );
    assert.equal(profile.exitRegion, 'BR');
    assert.equal(profile.fallbackRegion, false);
    assert.equal(profile.locale, 'zh-CN');
    assert.deepEqual(profile.languages, ['zh-CN', 'zh']);
    assert.equal(profile.acceptLanguage, 'zh-CN,zh;q=0.9,en;q=0.8');
    assert.equal(profile.timezoneId, 'America/Sao_Paulo');
    assertAllowedLanguageProfile(profile);
  }
});

test('browser fingerprint keeps Brazil region parameters when language is set to English', () => {
  const api = loadBrowserFingerprintModule();
  const profile = api.buildBrowserFingerprintProfile(
    { exitIp: '203.0.113.44', exitRegion: 'BR' },
    { runId: 'br-english', browserFingerprintLanguage: 'en-US' },
    { createdAt: 1 }
  );

  assert.equal(profile.exitRegion, 'BR');
  assert.equal(profile.language, 'en-US');
  assert.equal(profile.locale, 'en-US');
  assert.deepEqual(profile.languages, ['en-US', 'en']);
  assert.equal(profile.acceptLanguage, 'en-US,en;q=0.9');
  assert.equal(profile.timezoneId, 'America/Sao_Paulo');
  assert.ok(profile.geolocation.latitude > -24 && profile.geolocation.latitude < -23);
  assert.ok(profile.geolocation.longitude > -47 && profile.geolocation.longitude < -46);
});

test('browser fingerprint manager persists runtime-only profile fields', async () => {
  const api = loadBrowserFingerprintModule();
  const updates = [];
  const broadcasts = [];
  const executionLogs = [];
  const originalInfo = console.info;
  console.info = () => {};
  const manager = api.createBrowserFingerprintManager({
    chrome: {
      declarativeNetRequest: {
        updateDynamicRules: async (payload) => {
          updates.push({ dnr: payload });
        },
      },
    },
    getState: async () => ({ activeRunId: 'run-001' }),
    setState: async (payload) => {
      updates.push(payload);
    },
    broadcastDataUpdate: (payload) => {
      broadcasts.push(payload);
    },
    addLog: async (message, level) => {
      executionLogs.push({ message, level });
    },
  });

  try {
    const result = await manager.ensureBrowserFingerprintForProxyExit({
      exitIp: '198.51.100.8',
      exitRegion: 'US',
    });

    assert.equal(result.profile.exitIp, '198.51.100.8');
    assert.equal(updates.some((entry) => entry.browserFingerprintProfile), true);
    assert.equal(broadcasts.length, 1);
    assert.equal(broadcasts[0].browserFingerprintExitRegion, 'US');
    assert.equal(executionLogs.length, 1);
    assert.equal(executionLogs[0].level, 'info');
    assert.match(executionLogs[0].message, /浏览器指纹已生成/);
    assert.match(executionLogs[0].message, /profile=fp_/);
    assert.match(executionLogs[0].message, /level=standard/);
    assert.match(executionLogs[0].message, /timezone=/);
    assert.match(executionLogs[0].message, /screen=/);
    assert.match(executionLogs[0].message, /hardwareConcurrency=/);
    assert.match(executionLogs[0].message, /deviceMemory=/);
    assert.match(executionLogs[0].message, /webglRenderer=/);
    assert.match(executionLogs[0].message, /代理 IP 仅用于诊断，不参与指纹随机种子/);
    assert.equal(executionLogs[0].message.includes(result.profile.seedKey), false);
  } finally {
    console.info = originalInfo;
  }
});

test('browser fingerprint manager generates and logs summary without exit ip', async () => {
  const api = loadBrowserFingerprintModule();
  const stateUpdates = [];
  const executionLogs = [];
  const originalInfo = console.info;
  console.info = () => {};
  const manager = api.createBrowserFingerprintManager({
    chrome: {
      declarativeNetRequest: {
        updateDynamicRules: async () => {},
      },
    },
    getState: async () => ({ activeRunId: 'run-no-ip' }),
    setState: async (payload) => {
      stateUpdates.push(payload);
    },
    broadcastDataUpdate: () => {},
    addLog: async (message, level) => {
      executionLogs.push({ message, level });
    },
  });

  try {
    const result = await manager.ensureBrowserFingerprintForProxyExit({});

    assert.equal(result.skipped, undefined);
    assert.equal(result.profile.exitIp, '');
    assert.equal(result.profile.exitRegion, 'US');
    assert.equal(stateUpdates[0].browserFingerprintProfile.profileId, result.profile.profileId);
    assert.equal(stateUpdates[0].browserFingerprintExitIp, '');
    assert.equal(executionLogs.some((entry) => /未绑定代理 IP，使用随机指纹/.test(entry.message)), true);
    assert.equal(JSON.stringify(executionLogs).includes(result.profile.seedKey), false);
  } finally {
    console.info = originalInfo;
  }
});

test('browser fingerprint header rule applies generated user agent and accept language', async () => {
  const api = loadBrowserFingerprintModule();
  const dnrCalls = [];
  const profile = api.buildBrowserFingerprintProfile(
    {},
    { browserFingerprintLanguage: 'en-US' },
    { createdAt: 1, seed: 'header-rule-seed' }
  );

  const result = await api.applyBrowserFingerprintHeaderRules({
    declarativeNetRequest: {
      updateDynamicRules: async (payload) => {
        dnrCalls.push(payload);
      },
    },
  }, profile);

  assert.equal(result.applied, true);
  assert.equal(dnrCalls.length, 1);
  assert.deepEqual(dnrCalls[0].removeRuleIds, [12051]);
  const requestHeaders = dnrCalls[0].addRules[0].action.requestHeaders;
  assert.deepEqual(
    requestHeaders.map((header) => [header.header, header.operation, header.value]),
    [
      ['User-Agent', 'set', profile.userAgent],
      ['Accept-Language', 'set', profile.acceptLanguage],
    ]
  );
});

test('browser fingerprint manager skips generation and clears runtime when disabled', async () => {
  const api = loadBrowserFingerprintModule();
  const dnrCalls = [];
  const stateUpdates = [];
  const broadcasts = [];
  const manager = api.createBrowserFingerprintManager({
    chrome: {
      declarativeNetRequest: {
        updateDynamicRules: async (payload) => {
          dnrCalls.push(payload);
        },
      },
    },
    getState: async () => ({
      activeRunId: 'run-disabled',
      browserFingerprintEnabled: false,
      browserFingerprintProfile: { profileId: 'old' },
    }),
    setState: async (payload) => {
      stateUpdates.push(payload);
    },
    broadcastDataUpdate: (payload) => {
      broadcasts.push(payload);
    },
    addLog: async () => {},
  });

  const result = await manager.ensureBrowserFingerprintForProxyExit({
    exitIp: '198.51.100.8',
    exitRegion: 'US',
  });

  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'disabled');
  assert.deepEqual(dnrCalls, [{ removeRuleIds: [12051], addRules: [] }]);
  assert.deepEqual(stateUpdates, [{
    browserFingerprintProfile: null,
    browserFingerprintAppliedAt: 0,
    browserFingerprintExitIp: '',
    browserFingerprintExitRegion: '',
  }]);
  assert.deepEqual(broadcasts, stateUpdates);
});

test('enhanced browser fingerprint patch payload is stable and does not include exit ip', () => {
  const api = loadBrowserFingerprintModule();
  const profile = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.77', exitRegion: 'SG' },
    { activeRunId: 'run-enhanced', browserFingerprintLevel: 'enhanced' },
    { createdAt: 1 }
  );

  const first = api.buildNavigatorPatchPayload(profile);
  const second = api.buildNavigatorPatchPayload(profile);

  assert.equal(profile.level, 'enhanced');
  assert.equal(first.level, 'enhanced');
  assert.equal(first.noiseSeed, second.noiseSeed);
  assert.match(first.noiseSeed, /^fp_noise_/);
  assert.equal(first.language, profile.languages[0]);
  assert.deepEqual(first.languages, profile.languages);
  assert.equal(first.locale, profile.locale);
  assert.equal(first.acceptLanguage, profile.acceptLanguage);
  assert.equal(JSON.stringify(first).includes('198.51.100.77'), false);
  assert.equal(JSON.stringify(first).includes(profile.seedKey), false);
});

test('browser fingerprint can register an early new-document language patch', async () => {
  const api = loadBrowserFingerprintModule();
  const profile = api.buildBrowserFingerprintProfile(
    {},
    { browserFingerprintLanguage: 'en-US' },
    { createdAt: 1, seed: 'new-document-language-seed' }
  );
  const commands = [];
  let attachCount = 0;
  let detachCount = 0;

  const result = await api.applyBrowserFingerprintToNewDocument(42, profile, {
    browserFingerprintLevel: 'standard',
    chrome: {
      debugger: {
        attach: async (target, version) => {
          attachCount += 1;
          assert.deepEqual(target, { tabId: 42 });
          assert.equal(version, '1.3');
        },
        detach: async (target) => {
          detachCount += 1;
          assert.deepEqual(target, { tabId: 42 });
        },
        sendCommand: async (_target, method, params) => {
          commands.push({ method, params });
          if (method === 'Page.addScriptToEvaluateOnNewDocument') {
            return { identifier: 'script-42' };
          }
          return {};
        },
      },
    },
  });

  assert.equal(result.applied, true);
  assert.equal(result.scriptIdentifier, 'script-42');
  assert.equal(attachCount, 1);
  assert.equal(detachCount, 1);
  assert.deepEqual(
    commands.map((entry) => entry.method),
    [
      'Network.enable',
      'Page.enable',
      'Network.setUserAgentOverride',
      'Emulation.setLocaleOverride',
      'Page.addScriptToEvaluateOnNewDocument',
    ]
  );
  assert.equal(commands[2].params.acceptLanguage, 'en-US,en;q=0.9');
  assert.equal(commands[3].params.locale, 'en-US');
  assert.match(commands[4].params.source, /navigatorProto/);
  assert.match(commands[4].params.source, /"language":"en-US"/);
  assert.match(commands[4].params.source, /"acceptLanguage":"en-US,en;q=0\.9"/);
});

test('browser fingerprint manager logs generated profile summary without exit ip', async () => {
  const api = loadBrowserFingerprintModule();
  const originalInfo = console.info;
  const logs = [];
  const executionLogs = [];
  console.info = (...args) => {
    logs.push(args);
  };
  try {
    const manager = api.createBrowserFingerprintManager({
      chrome: {
        declarativeNetRequest: {
          updateDynamicRules: async () => {},
        },
      },
      getState: async () => ({ activeRunId: 'run-logging' }),
      setState: async () => {},
      broadcastDataUpdate: () => {},
      addLog: async (message, level) => {
        executionLogs.push({ message, level });
      },
    });

    const result = await manager.ensureBrowserFingerprintForProxyExit({
      exitIp: '198.51.100.77',
      exitRegion: 'SG',
    });

    assert.equal(logs.length, 1);
    assert.equal(logs[0][0], '[FlowPilot:browser-fingerprint] generated');
    assert.equal(logs[0].length, 2);
    const summary = logs[0][1];
    assert.equal(summary.profileId, result.profile.profileId);
    assert.equal(summary.exitRegion, 'SG');
    assert.equal(summary.fallbackRegion, false);
    assert.equal(summary.locale, 'zh-CN');
    assert.deepEqual(summary.languages, ['zh-CN', 'zh']);
    assert.equal(summary.timezoneId, 'Asia/Singapore');
    assert.equal(summary.platform, result.profile.platform);
    assert.deepEqual(summary.screen, {
      width: result.profile.screen.width,
      height: result.profile.screen.height,
      availWidth: result.profile.screen.availWidth,
      availHeight: result.profile.screen.availHeight,
      deviceScaleFactor: result.profile.screen.deviceScaleFactor,
    });
    assert.equal(summary.hardwareConcurrency, result.profile.hardwareConcurrency);
    assert.equal(summary.deviceMemory, result.profile.deviceMemory);
    assert.equal(typeof summary.webglRenderer, 'string');
    assert.equal(Object.prototype.hasOwnProperty.call(summary, 'exitIp'), false);
    assert.equal(summary.level, 'standard');
    assert.equal(summary.language, 'zh-CN');
    assert.equal(JSON.stringify(logs).includes('198.51.100.77'), false);
    assert.equal(executionLogs.length, 1);
    assert.match(executionLogs[0].message, /浏览器指纹已生成/);
    assert.match(executionLogs[0].message, /profile=fp_/);
    assert.match(executionLogs[0].message, /region=SG/);
    assert.equal(executionLogs[0].message.includes(result.profile.seedKey), false);
  } finally {
    console.info = originalInfo;
  }
});
