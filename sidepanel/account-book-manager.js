(function attachSidepanelAccountBookManager(globalScope) {
  function createAccountBookManager(context = {}) {
    const {
      state,
      dom,
      helpers,
      runtime,
    } = context;

    let eventsBound = false;
    let visiblePasswordRecordId = '';

    function normalizeString(value = '') {
      return String(value || '').trim();
    }

    function normalizeSignupRegion(value = '') {
      const letters = String(value || '').match(/[A-Za-z]/g);
      const normalized = letters ? letters.join('').toUpperCase() : '';
      return normalized.length === 2 ? normalized : '';
    }

    function normalizeTimestamp(value = '') {
      const timestamp = Date.parse(String(value || ''));
      return Number.isFinite(timestamp) ? timestamp : 0;
    }

    function normalizeCaptureStage(value = '') {
      const normalized = normalizeString(value).toLowerCase();
      if (normalized === 'phone_verification_passed') {
        return normalized;
      }
      if (normalized === 'registration_success') {
        return normalized;
      }
      return normalized === 'flow_completed' ? normalized : '';
    }

    function normalizeFreeStatus(value = '') {
      const normalized = normalizeString(value).toLowerCase();
      if (normalized === 'free' || normalized === 'paid' || normalized === 'plus' || normalized === 'unknown') {
        return normalized;
      }
      return 'unknown';
    }

    function getStatusMeta(captureStage = '') {
      switch (normalizeCaptureStage(captureStage)) {
        case 'phone_verification_passed':
          return {
            label: '验证成功',
            className: 'status-phone-verified',
          };
        case 'registration_success':
          return {
            label: '注册成功',
            className: 'status-registration-success',
          };
        case 'flow_completed':
          return {
            label: '导入成功',
            className: 'status-flow-completed',
          };
        default:
          return {
            label: '--',
            className: 'status-unknown',
          };
      }
    }

    function getFreeStatusMeta(freeStatus = '') {
      switch (normalizeFreeStatus(freeStatus)) {
        case 'free':
          return {
            label: '免费',
            className: 'free-status-free',
          };
        case 'paid':
          return {
            label: '付费',
            className: 'free-status-paid',
          };
        case 'plus':
          return {
            label: 'Plus',
            className: 'free-status-plus',
          };
        default:
          return {
            label: '未知',
            className: 'free-status-unknown',
          };
      }
    }

    function escapeHtml(value) {
      if (typeof helpers.escapeHtml === 'function') {
        return helpers.escapeHtml(String(value || ''));
      }
      return String(value || '');
    }

    function setNodeHidden(node, hidden) {
      if (node) {
        node.hidden = Boolean(hidden);
      }
    }

    function getEntries(currentState = state.getLatestState()) {
      const entries = Array.isArray(currentState?.accountBookEntries) ? currentState.accountBookEntries : [];
      return entries
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          ...item,
          captureStage: normalizeCaptureStage(item.captureStage),
          signupIp: normalizeString(item.signupIp || ''),
          signupRegion: normalizeSignupRegion(item.signupRegion || ''),
          freeStatus: normalizeFreeStatus(item.freeStatus || ''),
        }))
        .slice()
        .sort((left, right) => {
          const rightTime = normalizeTimestamp(right.updatedAt || right.createdAt || '');
          const leftTime = normalizeTimestamp(left.updatedAt || left.createdAt || '');
          return rightTime - leftTime;
        });
    }

    function maskPassword(password = '') {
      const value = normalizeString(password);
      if (!value) {
        return '--';
      }
      return '•'.repeat(Math.max(8, Math.min(16, value.length)));
    }

    function formatDisplayValue(value = '') {
      const normalized = normalizeString(value);
      return normalized || '--';
    }

    function formatSignupIp(entry = {}) {
      const signupIp = normalizeString(entry.signupIp || '');
      const signupRegion = normalizeSignupRegion(entry.signupRegion || '');
      if (signupIp && signupRegion) {
        return `${signupIp} [${signupRegion}]`;
      }
      return signupIp || '--';
    }

    function render(currentState = state.getLatestState()) {
      const entries = getEntries(currentState);
      if (dom.accountBookCount) {
        dom.accountBookCount.textContent = entries.length
          ? `共 ${entries.length} 条账号信息`
          : '暂无账号信息';
      }

      if (!dom.accountBookBody) {
        return;
      }

      if (!entries.length) {
        dom.accountBookBody.innerHTML = `
          <tr class="account-book-empty-row">
            <td class="account-book-empty" colspan="6">暂无账号信息</td>
          </tr>
        `;
        return;
      }

      dom.accountBookBody.innerHTML = entries.map((entry) => {
        const recordId = normalizeString(entry.recordId).toLowerCase();
        const passwordVisible = visiblePasswordRecordId === recordId;
        const passwordValue = normalizeString(entry.password);
        const displayPassword = passwordVisible ? formatDisplayValue(passwordValue) : maskPassword(passwordValue);
        const canTogglePassword = Boolean(passwordValue);
        const statusMeta = getStatusMeta(entry.captureStage);
        const freeStatusMeta = getFreeStatusMeta(entry.freeStatus);

        return `
          <tr data-account-book-row="${escapeHtml(recordId)}">
            <td class="mono account-book-cell">${escapeHtml(formatDisplayValue(entry.email))}</td>
            <td class="mono account-book-cell">${escapeHtml(formatDisplayValue(entry.phoneNumber))}</td>
            <td class="mono account-book-cell">
              <div class="account-book-password-cell">
                <span class="account-book-password-value">${escapeHtml(displayPassword)}</span>
                ${canTogglePassword ? `
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs account-book-password-toggle"
                    data-account-book-toggle-password="${escapeHtml(recordId)}"
                  >${passwordVisible ? '隐藏' : '显示'}</button>
                ` : ''}
              </div>
            </td>
            <td class="account-book-cell account-book-status-cell">
              <span class="account-book-status-chip ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
            </td>
            <td class="account-book-cell account-book-free-cell">
              <span class="account-book-free-chip ${freeStatusMeta.className}">${escapeHtml(freeStatusMeta.label)}</span>
            </td>
            <td class="mono account-book-cell account-book-ip-cell">${escapeHtml(formatSignupIp(entry))}</td>
          </tr>
        `;
      }).join('');
    }

    function openPanel() {
      setNodeHidden(dom.accountBookOverlay, false);
      render();
    }

    function closePanel() {
      setNodeHidden(dom.accountBookOverlay, true);
      visiblePasswordRecordId = '';
      render();
    }

    function buildExportFileName(format = 'json', date = new Date()) {
      const pad = (value) => String(value).padStart(2, '0');
      const extension = format === 'txt' ? 'txt' : 'json';
      return `flowpilot-account-book-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.${extension}`;
    }

    function withExportStatusLabels(entries = []) {
      return entries.map((entry) => ({
        ...entry,
        statusLabel: getStatusMeta(entry.captureStage).label,
        freeStatusLabel: getFreeStatusMeta(entry.freeStatus).label,
      }));
    }

    function buildJsonExportContent(entries = [], exportedAt = new Date().toISOString()) {
      const payload = {
        exportedAt,
        count: entries.length,
        entries: withExportStatusLabels(entries),
      };
      return `${JSON.stringify(payload, null, 2)}\n`;
    }

    function sanitizeTxtCell(value = '') {
      return formatDisplayValue(value).replace(/\r?\n/g, ' ');
    }

    function buildTxtExportContent(entries = [], exportedAt = new Date().toISOString()) {
      const lines = [
        '# FlowPilot Account Book Export',
        '# schemaVersion=1',
        '# encoding=UTF-8',
        `# exportedAt=${exportedAt}`,
        `# count=${entries.length}`,
        '',
        ['\u90ae\u7bb1', '\u624b\u673a\u53f7', '\u5bc6\u7801', '\u72b6\u6001', '\u514d\u8d39', 'IP'].join('\t'),
        ...entries.map((entry) => [
          sanitizeTxtCell(entry.email),
          sanitizeTxtCell(entry.phoneNumber),
          sanitizeTxtCell(entry.password),
          sanitizeTxtCell(getStatusMeta(entry.captureStage).label),
          sanitizeTxtCell(getFreeStatusMeta(entry.freeStatus).label),
          sanitizeTxtCell(formatSignupIp(entry)),
        ].join('\t')),
      ];
      return `${lines.join('\r\n')}\r\n`;
    }

    async function chooseExportFormat() {
      if (typeof helpers.openActionModal !== 'function') {
        return 'json';
      }
      const choice = await helpers.openActionModal({
        title: '\u5bfc\u51fa\u8d26\u53f7\u4fe1\u606f',
        message: '\u8bf7\u9009\u62e9\u8d26\u53f7\u7c3f\u7684\u5bfc\u51fa\u683c\u5f0f\u3002',
        actions: [
          { id: null, label: '\u53d6\u6d88', variant: 'btn-ghost' },
          { id: 'json', label: '\u5bfc\u51fa JSON', variant: 'btn-outline' },
          { id: 'txt', label: '\u5bfc\u51fa TXT', variant: 'btn-primary' },
        ],
      });
      return choice === 'txt' || choice === 'json' ? choice : '';
    }

    async function exportEntries() {
      const entries = getEntries();
      const format = await chooseExportFormat();
      if (!format) {
        return;
      }
      const exportedAt = new Date().toISOString();
      const isTxt = format === 'txt';
      helpers.downloadTextFile?.(
        isTxt ? buildTxtExportContent(entries, exportedAt) : buildJsonExportContent(entries, exportedAt),
        buildExportFileName(format),
        isTxt ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8',
        { prependUtf8Bom: true }
      );
      helpers.showToast?.(`已导出 ${entries.length} 条账号信息。`, 'success', 1800);
    }

    async function clearEntries() {
      const entries = getEntries();
      if (!entries.length) {
        helpers.showToast?.('没有可清空的账号信息。', 'warn', 1800);
        return;
      }

      const confirmed = await helpers.openConfirmModal?.({
        title: '清空账号信息',
        message: '确认清空当前全部账号信息吗？该操作不可撤销。',
        confirmLabel: '确认清空',
        confirmVariant: 'btn-danger',
      });
      if (!confirmed) {
        return;
      }

      const response = await runtime.sendMessage({
        type: 'CLEAR_ACCOUNT_BOOK',
        source: 'sidepanel',
      });
      if (response?.error) {
        throw new Error(response.error);
      }

      visiblePasswordRecordId = '';
      state.syncLatestState({ accountBookEntries: [] });
      helpers.showToast?.(`已清空 ${Math.max(0, Number(response?.clearedCount) || 0)} 条账号信息。`, 'success', 2200);
    }

    function handleBodyClick(event) {
      const button = event?.target?.closest?.('[data-account-book-toggle-password]');
      if (!button) {
        return;
      }
      const recordId = normalizeString(button.getAttribute('data-account-book-toggle-password')).toLowerCase();
      visiblePasswordRecordId = visiblePasswordRecordId === recordId ? '' : recordId;
      render();
    }

    function bindEvents() {
      if (eventsBound) {
        return;
      }
      eventsBound = true;

      dom.btnOpenAccountBook?.addEventListener('click', () => {
        openPanel();
      });
      dom.btnCloseAccountBook?.addEventListener('click', () => {
        closePanel();
      });
      dom.accountBookOverlay?.addEventListener('click', (event) => {
        if (event.target === dom.accountBookOverlay) {
          closePanel();
        }
      });
      dom.btnExportAccountBook?.addEventListener('click', async () => {
        try {
          await exportEntries();
        } catch (error) {
          helpers.showToast?.(`导出账号信息失败：${error.message}`, 'error');
        }
      });
      dom.btnClearAccountBook?.addEventListener('click', async () => {
        try {
          await clearEntries();
        } catch (error) {
          helpers.showToast?.(`清空账号信息失败：${error.message}`, 'error');
        }
      });
      dom.accountBookBody?.addEventListener('click', (event) => {
        handleBodyClick(event);
      });
    }

    return {
      bindEvents,
      closePanel,
      openPanel,
      render,
    };
  }

  globalScope.SidepanelAccountBookManager = {
    createAccountBookManager,
  };
})(typeof window !== 'undefined' ? window : globalThis);
