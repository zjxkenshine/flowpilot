(function attachBackgroundWebRtcLeakProtection(root, factory) {
  root.MultiPageBackgroundWebRtcLeakProtection = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundWebRtcLeakProtectionModule() {
  const WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY = 'disable_non_proxied_udp';
  const CONTROLLABLE_LEVELS = new Set([
    'controllable_by_this_extension',
    'controlled_by_this_extension',
  ]);

  function getWebRtcIpHandlingPolicy(chromeApi) {
    return chromeApi?.privacy?.network?.webRTCIPHandlingPolicy || null;
  }

  function createWebRtcLeakProtectionManager(deps = {}) {
    const {
      chrome: chromeApi = null,
      warn = (...args) => console.warn(...args),
    } = deps;

    function logWarning(message, error = null) {
      const detail = error?.message || String(error || '');
      warn(detail ? `${message}: ${detail}` : message);
    }

    async function syncWebRtcLeakProtectionFromState(state = {}) {
      const enabled = Boolean(
        state?.webRtcLeakProtectionEnabled
        ?? state?.settingsState?.flows?.openai?.webRtcLeakProtection?.enabled
      );
      const setting = getWebRtcIpHandlingPolicy(chromeApi);
      if (!setting?.get) {
        if (enabled) {
          logWarning('WebRTC leak protection is enabled, but chrome.privacy.network.webRTCIPHandlingPolicy is unavailable');
        }
        return {
          enabled,
          applied: false,
          reason: 'api_unavailable',
        };
      }

      let current;
      try {
        current = await setting.get({});
      } catch (error) {
        logWarning('Failed to read WebRTC IP handling policy', error);
        return {
          enabled,
          applied: false,
          reason: 'get_failed',
          error: error?.message || String(error || ''),
        };
      }

      const levelOfControl = String(current?.levelOfControl || '').trim();
      if (enabled) {
        if (!CONTROLLABLE_LEVELS.has(levelOfControl)) {
          logWarning(`WebRTC IP handling policy cannot be controlled by this extension (${levelOfControl || 'unknown'})`);
          return {
            enabled: true,
            applied: false,
            reason: 'not_controllable',
            levelOfControl,
          };
        }
        if (
          levelOfControl === 'controlled_by_this_extension'
          && current?.value === WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY
        ) {
          return {
            enabled: true,
            applied: true,
            reason: 'already_applied',
            levelOfControl,
            value: WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY,
          };
        }
        if (!setting?.set) {
          logWarning('WebRTC IP handling policy set API is unavailable');
          return {
            enabled: true,
            applied: false,
            reason: 'set_unavailable',
            levelOfControl,
          };
        }
        try {
          await setting.set({
            value: WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY,
            scope: 'regular',
          });
          return {
            enabled: true,
            applied: true,
            reason: 'applied',
            levelOfControl,
            value: WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY,
          };
        } catch (error) {
          logWarning('Failed to apply WebRTC IP handling policy', error);
          return {
            enabled: true,
            applied: false,
            reason: 'set_failed',
            levelOfControl,
            error: error?.message || String(error || ''),
          };
        }
      }

      if (levelOfControl !== 'controlled_by_this_extension') {
        return {
          enabled: false,
          applied: false,
          reason: 'disabled',
          levelOfControl,
        };
      }
      if (!setting?.clear) {
        logWarning('WebRTC IP handling policy clear API is unavailable');
        return {
          enabled: false,
          applied: true,
          reason: 'clear_unavailable',
          levelOfControl,
        };
      }
      try {
        await setting.clear({ scope: 'regular' });
        return {
          enabled: false,
          applied: false,
          reason: 'cleared',
          levelOfControl,
        };
      } catch (error) {
        logWarning('Failed to clear WebRTC IP handling policy', error);
        return {
          enabled: false,
          applied: true,
          reason: 'clear_failed',
          levelOfControl,
          error: error?.message || String(error || ''),
        };
      }
    }

    return {
      syncWebRtcLeakProtectionFromState,
    };
  }

  return {
    WEB_RTC_DISABLE_NON_PROXIED_UDP_POLICY,
    createWebRtcLeakProtectionManager,
    getWebRtcIpHandlingPolicy,
  };
});
