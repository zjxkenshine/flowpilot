const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function loadModule() {
  const source = fs.readFileSync('background/webrtc-leak-protection.js', 'utf8');
  const globalScope = { console };
  return new Function('self', `${source}; return self.MultiPageBackgroundWebRtcLeakProtection;`)(globalScope);
}

function createHarness(options = {}) {
  const api = loadModule();
  const calls = {
    clear: [],
    get: [],
    set: [],
    warnings: [],
  };
  const policy = options.policy === null
    ? null
    : {
      get: async (details) => {
        calls.get.push(details);
        if (options.getError) throw options.getError;
        return options.current || {
          levelOfControl: 'controllable_by_this_extension',
          value: 'default',
        };
      },
      set: async (details) => {
        calls.set.push(details);
        if (options.setError) throw options.setError;
      },
      clear: async (details) => {
        calls.clear.push(details);
        if (options.clearError) throw options.clearError;
      },
    };
  const chrome = policy
    ? { privacy: { network: { webRTCIPHandlingPolicy: policy } } }
    : {};
  const manager = api.createWebRtcLeakProtectionManager({
    chrome,
    warn: (message) => calls.warnings.push(message),
  });
  return { api, calls, manager };
}

test('manifest declares privacy permission for WebRTC IP handling policy', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  assert.ok(manifest.permissions.includes('privacy'));
});

test('WebRTC leak protection enables disable_non_proxied_udp in regular scope', async () => {
  const { calls, manager } = createHarness();

  const result = await manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: true,
  });

  assert.equal(result.applied, true);
  assert.equal(result.reason, 'applied');
  assert.deepEqual(calls.set, [{
    value: 'disable_non_proxied_udp',
    scope: 'regular',
  }]);
  assert.deepEqual(calls.clear, []);
});

test('WebRTC leak protection clears this extension policy when disabled', async () => {
  const { calls, manager } = createHarness({
    current: {
      levelOfControl: 'controlled_by_this_extension',
      value: 'disable_non_proxied_udp',
    },
  });

  const result = await manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: false,
  });

  assert.equal(result.applied, false);
  assert.equal(result.reason, 'cleared');
  assert.deepEqual(calls.clear, [{ scope: 'regular' }]);
  assert.deepEqual(calls.set, []);
});

test('WebRTC leak protection warns and skips set when another extension controls policy', async () => {
  const { calls, manager } = createHarness({
    current: {
      levelOfControl: 'controlled_by_other_extensions',
      value: 'default',
    },
  });

  const result = await manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: true,
  });

  assert.equal(result.applied, false);
  assert.equal(result.reason, 'not_controllable');
  assert.deepEqual(calls.set, []);
  assert.equal(calls.warnings.length, 1);
});

test('WebRTC leak protection leaves another extension policy untouched when disabled', async () => {
  const { calls, manager } = createHarness({
    current: {
      levelOfControl: 'controlled_by_other_extensions',
      value: 'default_public_interface_only',
    },
  });

  const result = await manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: false,
  });

  assert.equal(result.reason, 'disabled');
  assert.deepEqual(calls.clear, []);
  assert.deepEqual(calls.set, []);
  assert.deepEqual(calls.warnings, []);
});

test('WebRTC leak protection API absence and failures warn without throwing', async () => {
  const missing = createHarness({ policy: null });
  const missingResult = await missing.manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: true,
  });
  assert.equal(missingResult.reason, 'api_unavailable');
  assert.equal(missing.calls.warnings.length, 1);

  const failed = createHarness({
    setError: new Error('set failed'),
  });
  const failedResult = await failed.manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: true,
  });
  assert.equal(failedResult.reason, 'set_failed');
  assert.equal(failed.calls.warnings.length, 1);

  const readFailed = createHarness({
    getError: new Error('get failed'),
  });
  const readFailedResult = await readFailed.manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: true,
  });
  assert.equal(readFailedResult.reason, 'get_failed');
  assert.equal(readFailed.calls.warnings.length, 1);

  const clearFailed = createHarness({
    current: {
      levelOfControl: 'controlled_by_this_extension',
      value: 'disable_non_proxied_udp',
    },
    clearError: new Error('clear failed'),
  });
  const clearFailedResult = await clearFailed.manager.syncWebRtcLeakProtectionFromState({
    webRtcLeakProtectionEnabled: false,
  });
  assert.equal(clearFailedResult.reason, 'clear_failed');
  assert.equal(clearFailedResult.applied, true);
  assert.equal(clearFailed.calls.warnings.length, 1);
});

test('background restores WebRTC policy on lifecycle entrypoints and message router syncs saves', () => {
  const backgroundSource = fs.readFileSync('background.js', 'utf8');
  const routerSource = fs.readFileSync('background/message-router.js', 'utf8');

  assert.match(backgroundSource, /background\/webrtc-leak-protection\.js/);
  assert.equal(
    backgroundSource.match(/syncWebRtcLeakProtectionFromCurrentState\(\)\.catch/g)?.length,
    3
  );
  assert.match(routerSource, /hasOwnProperty\.call\(updates,\s*'webRtcLeakProtectionEnabled'\)/);
  assert.match(routerSource, /syncWebRtcLeakProtectionFromState\(mergedState\)/);
});
