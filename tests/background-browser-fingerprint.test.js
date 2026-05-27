const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadBrowserFingerprintModule() {
  const source = fs.readFileSync('background/browser-fingerprint.js', 'utf8');
  return new Function('self', `${source}; return self.MultiPageBackgroundBrowserFingerprint;`)({});
}

test('browser fingerprint profile is stable for the same proxy exit and run id', () => {
  const api = loadBrowserFingerprintModule();
  const input = {
    exitIp: '198.51.100.8',
    exitRegion: 'JP',
    exitSource: 'page_context',
  };
  const state = { activeRunId: 'run-001' };

  const first = api.buildBrowserFingerprintProfile(input, state, { createdAt: 1 });
  const second = api.buildBrowserFingerprintProfile(input, state, { createdAt: 1 });

  assert.deepEqual(second, first);
  assert.equal(first.exitRegion, 'JP');
  assert.equal(first.locale, 'ja-JP');
  assert.equal(first.acceptLanguage, 'ja-JP,ja;q=0.9,en-US;q=0.7,en;q=0.6');
  assert.equal(first.timezoneId, 'Asia/Tokyo');
});

test('browser fingerprint profile changes when exit or run changes', () => {
  const api = loadBrowserFingerprintModule();
  const base = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.8', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1 }
  );
  const differentRun = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.8', exitRegion: 'US' },
    { activeRunId: 'run-002' },
    { createdAt: 1 }
  );
  const differentExit = api.buildBrowserFingerprintProfile(
    { exitIp: '198.51.100.9', exitRegion: 'US' },
    { activeRunId: 'run-001' },
    { createdAt: 1 }
  );

  assert.notEqual(differentRun.profileId, base.profileId);
  assert.notEqual(differentExit.profileId, base.profileId);
  assert.equal(api.isValidBrowserFingerprintProfile(base), true);
});

test('browser fingerprint maps common regions to matching locale timezone and coordinates', () => {
  const api = loadBrowserFingerprintModule();
  const jp = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.1', exitRegion: 'JP' }, { runId: 'a' }, { createdAt: 1 });
  const th = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.2', exitRegion: 'TH' }, { runId: 'a' }, { createdAt: 1 });
  const sg = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.3', exitRegion: 'SG' }, { runId: 'a' }, { createdAt: 1 });
  const unknown = api.buildBrowserFingerprintProfile({ exitIp: '1.1.1.4', exitRegion: 'Atlantis' }, { runId: 'a' }, { createdAt: 1 });

  assert.equal(jp.locale, 'ja-JP');
  assert.equal(jp.timezoneId, 'Asia/Tokyo');
  assert.ok(jp.geolocation.latitude > 35 && jp.geolocation.latitude < 36);
  assert.ok(jp.geolocation.longitude > 139 && jp.geolocation.longitude < 140);

  assert.equal(th.locale, 'th-TH');
  assert.equal(th.timezoneId, 'Asia/Bangkok');
  assert.ok(th.geolocation.latitude > 13 && th.geolocation.latitude < 14.5);

  assert.equal(sg.locale, 'en-SG');
  assert.equal(sg.timezoneId, 'Asia/Singapore');
  assert.ok(sg.geolocation.longitude > 103 && sg.geolocation.longitude < 105);

  assert.equal(unknown.exitRegion, 'US');
  assert.equal(unknown.fallbackRegion, true);
  assert.equal(unknown.locale, 'en-US');
});

test('browser fingerprint manager persists runtime-only profile fields', async () => {
  const api = loadBrowserFingerprintModule();
  const updates = [];
  const broadcasts = [];
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
    addLog: async () => {},
  });

  const result = await manager.ensureBrowserFingerprintForProxyExit({
    exitIp: '198.51.100.8',
    exitRegion: 'US',
  });

  assert.equal(result.profile.exitIp, '198.51.100.8');
  assert.equal(updates.some((entry) => entry.browserFingerprintProfile), true);
  assert.equal(broadcasts.length, 1);
  assert.equal(broadcasts[0].browserFingerprintExitRegion, 'US');
});
