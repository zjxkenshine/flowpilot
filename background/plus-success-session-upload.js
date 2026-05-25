(function attachBackgroundPlusSuccessSessionUpload(root, factory) {
  root.MultiPageBackgroundPlusSuccessSessionUpload = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundPlusSuccessSessionUploadModule() {
  const PAYMENTS_SUCCESS_URL_PATTERN = /^https:\/\/(?:chatgpt\.com|www\.chatgpt\.com|chat\.openai\.com)\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i;
  const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
  const PAYPAL_HOSTED_REVIEW_NODE_ID = 'paypal-hosted-review';
  const HOSTED_SUCCESS_CANDIDATE_NODE_IDS = Object.freeze([
    'paypal-hosted-review',
    'paypal-hosted-create-account',
    'paypal-hosted-card',
    'paypal-hosted-email',
    'paypal-hosted-openai-checkout',
    'plus-checkout-create',
  ]);
  const HOSTED_SUCCESS_CANDIDATE_NODE_ID_SET = new Set(HOSTED_SUCCESS_CANDIDATE_NODE_IDS);

  function createPlusSuccessSessionUploadManager(deps = {}) {
    const {
      addLog: rawAddLog = async () => {},
      broadcastDataUpdate = null,
      completeNodeFromBackground = null,
      getState = async () => ({}),
      setState = async () => {},
      sleepWithStop = (ms = 0) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0))),
    } = deps;

    const activeTabIds = new Set();

    function normalizeString(value = '') {
      return String(value || '').trim();
    }

    function normalizeStatus(value = '') {
      return normalizeString(value).toLowerCase();
    }

    function normalizePlusPaymentMethod(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizePlusPaymentMethod) {
        return rootScope.GoPayUtils.normalizePlusPaymentMethod(value);
      }
      const normalized = normalizeString(value).toLowerCase();
      if (normalized === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED || normalized === 'paypal_direct' || normalized === 'paypal-direct') {
        return PLUS_PAYMENT_METHOD_PAYPAL_HOSTED;
      }
      return normalized;
    }

    function normalizeOauthDelaySeconds(value = 0) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return 0;
      }
      return Math.min(120, Math.max(0, Math.floor(numeric)));
    }

    function isPaymentsSuccessUrl(url = '') {
      return PAYMENTS_SUCCESS_URL_PATTERN.test(normalizeString(url));
    }

    function isHostedSuccessCandidateNode(nodeId = '') {
      return HOSTED_SUCCESS_CANDIDATE_NODE_ID_SET.has(normalizeString(nodeId));
    }

    function isHostedSuccessNodePending(nodeId = '', state = {}) {
      if (!isHostedSuccessCandidateNode(nodeId)) {
        return false;
      }
      const nodeStatuses = state?.nodeStatuses && typeof state.nodeStatuses === 'object' && !Array.isArray(state.nodeStatuses)
        ? state.nodeStatuses
        : {};
      const status = normalizeStatus(nodeStatuses[nodeId]);
      if (status) {
        return ['pending', 'running'].includes(status);
      }
      return normalizeString(state?.currentNodeId) === normalizeString(nodeId);
    }

    function resolveHostedSuccessTargetNodeId(state = {}) {
      const currentNodeId = normalizeString(state?.currentNodeId);
      if (isHostedSuccessNodePending(currentNodeId, state)) {
        return currentNodeId;
      }
      for (const nodeId of HOSTED_SUCCESS_CANDIDATE_NODE_IDS) {
        if (isHostedSuccessNodePending(nodeId, state)) {
          return nodeId;
        }
      }
      return '';
    }

    function isHostedSuccessWaitActive(state = {}, tabId = null) {
      if (normalizePlusPaymentMethod(state?.plusPaymentMethod) !== PLUS_PAYMENT_METHOD_PAYPAL_HOSTED) {
        return false;
      }
      const checkoutTabId = Number(state?.plusCheckoutTabId);
      if (!Number.isInteger(checkoutTabId) || checkoutTabId <= 0) {
        return false;
      }
      if (tabId !== null && checkoutTabId !== Number(tabId)) {
        return false;
      }
      return Boolean(resolveHostedSuccessTargetNodeId(state));
    }

    async function addLog(message, level = 'info', options = {}) {
      return rawAddLog(message, level, options && typeof options === 'object' ? options : {});
    }

    async function processPaymentsSuccessTab(tabId, successUrl = '') {
      const numericTabId = Number(tabId);
      const normalizedSuccessUrl = normalizeString(successUrl);
      if (!Number.isInteger(numericTabId) || numericTabId <= 0 || activeTabIds.has(numericTabId)) {
        return null;
      }
      if (!isPaymentsSuccessUrl(normalizedSuccessUrl)) {
        return null;
      }

      activeTabIds.add(numericTabId);
      let targetNodeId = '';
      try {
        const initialState = await getState();
        if (!isHostedSuccessWaitActive(initialState, numericTabId)) {
          return null;
        }

        const latestState = await getState();
        if (!isHostedSuccessWaitActive(latestState, numericTabId)) {
          return null;
        }

        targetNodeId = resolveHostedSuccessTargetNodeId(latestState);
        if (!targetNodeId) {
          return null;
        }

        const statePatch = {
          plusCheckoutTabId: numericTabId,
          plusCheckoutUrl: normalizedSuccessUrl,
          plusReturnUrl: normalizedSuccessUrl,
        };
        await setState(statePatch);
        if (typeof broadcastDataUpdate === 'function') {
          broadcastDataUpdate(statePatch);
        }

        await addLog(
          `节点 ${targetNodeId}：检测到 ChatGPT 支付成功页，准备由后台继续自动流程。`,
          'info',
          { nodeId: targetNodeId }
        );

        const oauthDelaySeconds = targetNodeId === PAYPAL_HOSTED_REVIEW_NODE_ID
          ? normalizeOauthDelaySeconds(latestState?.plusHostedCheckoutOauthDelaySeconds)
          : 0;

        if (oauthDelaySeconds > 0) {
          await addLog(
            `节点 ${targetNodeId}：支付成功后按设置等待 ${oauthDelaySeconds} 秒，再继续账号接入。`,
            'info',
            { nodeId: targetNodeId }
          );
          await sleepWithStop(oauthDelaySeconds * 1000);
        }

        const finalState = await getState();
        if (!isHostedSuccessWaitActive(finalState, numericTabId)) {
          return null;
        }

        const finalTargetNodeId = resolveHostedSuccessTargetNodeId(finalState);
        if (!finalTargetNodeId || finalTargetNodeId !== targetNodeId) {
          return null;
        }

        if (typeof completeNodeFromBackground !== 'function') {
          throw new Error('plus-success-session-upload 缺少 completeNodeFromBackground。');
        }

        const completionPayload = {
          plusCheckoutUrl: normalizedSuccessUrl,
          plusReturnUrl: normalizedSuccessUrl,
          plusHostedCheckoutCompleted: true,
        };
        if (targetNodeId === PAYPAL_HOSTED_REVIEW_NODE_ID) {
          completionPayload.plusHostedCheckoutOauthDelaySeconds = oauthDelaySeconds;
        }

        await completeNodeFromBackground(targetNodeId, completionPayload);

        return {
          completed: true,
          nodeId: targetNodeId,
          plusReturnUrl: normalizedSuccessUrl,
          oauthDelaySeconds,
        };
      } catch (error) {
        const message = normalizeString(error?.message) || 'unknown error';
        await addLog(
          `Hosted PayPal 支付成功页自动续跑失败：${message}`,
          'error',
          targetNodeId ? { nodeId: targetNodeId } : {}
        );
        throw error;
      } finally {
        activeTabIds.delete(numericTabId);
      }
    }

    async function handleTabUpdated(tabId, changeInfo = {}, tab = {}) {
      if (changeInfo?.status !== 'complete') {
        return null;
      }
      const nextUrl = normalizeString(changeInfo?.url || tab?.url);
      if (!isPaymentsSuccessUrl(nextUrl)) {
        return null;
      }
      return processPaymentsSuccessTab(tabId, nextUrl);
    }

    return {
      isPaymentsSuccessUrl,
      processPaymentsSuccessTab,
      handleTabUpdated,
    };
  }

  return {
    createPlusSuccessSessionUploadManager,
  };
});
