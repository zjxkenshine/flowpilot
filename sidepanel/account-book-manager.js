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
          signupIp: normalizeString(item.signupIp || ''),
          signupRegion: normalizeSignupRegion(item.signupRegion || ''),
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
            <td class="account-book-empty" colspan="4">暂无账号信息</td>
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

    function buildExportFileName() {
      const now = new Date();
      const pad = (value) => String(value).padStart(2, '0');
      return `flowpilot-account-book-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
    }

    async function exportEntries() {
      const entries = getEntries();
      const payload = {
        exportedAt: new Date().toISOString(),
        count: entries.length,
        entries,
      };
      helpers.downloadTextFile?.(
        `${JSON.stringify(payload, null, 2)}\n`,
        buildExportFileName(),
        'application/json;charset=utf-8'
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
