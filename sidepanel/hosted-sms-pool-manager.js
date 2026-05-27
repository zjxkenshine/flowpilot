(function attachSidepanelHostedSmsPoolManager(globalScope) {
  const SEPARATOR = '----';
  const EXPORT_SCHEMA_VERSION = 1;
  const EXPORT_HEADER = 'FlowPilot PayPal SMS Pool Export';
  const EXPORT_ENCODING = 'UTF-8';

  function createHostedSmsPoolManager(context = {}) {
    const {
      dom = {},
      helpers = {},
      state = {},
      actions = {},
      constants = {},
      labels = {},
      normalizers = {},
    } = context;

    const copyIcon = constants.copyIcon || '';
    const poolLabel = String(labels.poolLabel || 'PayPal 接码池').trim() || 'PayPal 接码池';
    const importSubject = String(labels.importSubject || `${poolLabel}号码`).trim() || `${poolLabel}号码`;
    const numberNoun = String(labels.numberNoun || '号码').trim() || '号码';
    const localPhonePrefix = String(labels.localPhonePrefix || 'PayPal 填').trim();
    const emptySummary = String(
      labels.emptySummary || `导入 ${importSubject}，每行一个号码和验证码接口。`
    ).trim() || `导入 ${importSubject}，每行一个号码和验证码接口。`;
    const emptyListText = String(
      labels.emptyListText || `还没有 ${poolLabel}号码，先导入一批号码再开始。`
    ).trim() || `还没有 ${poolLabel}号码，先导入一批号码再开始。`;
    const noMatchText = String(
      labels.noMatchText || `没有匹配当前筛选条件的${numberNoun}。`
    ).trim() || `没有匹配当前筛选条件的${numberNoun}。`;
    const refreshLoadingText = String(
      labels.refreshLoadingText || `正在刷新${poolLabel}...`
    ).trim() || `正在刷新${poolLabel}...`;
    const updateLoadingText = String(
      labels.updateLoadingText || `正在更新${poolLabel}...`
    ).trim() || `正在更新${poolLabel}...`;
    const updateFailedPrefix = String(
      labels.updateFailedPrefix || `更新${poolLabel}失败`
    ).trim() || `更新${poolLabel}失败`;
    const copySuccessText = String(labels.copySuccessText || '号码已复制').trim() || '号码已复制';
    const importEmptyWarning = String(
      labels.importEmptyWarning || `请先粘贴${importSubject}，每行一个号码和验证码接口。`
    ).trim() || `请先粘贴${importSubject}，每行一个号码和验证码接口。`;
    const deleteTitle = String(labels.deleteTitle || `删除${poolLabel}号码`).trim() || `删除${poolLabel}号码`;
    const clearUsageTitle = String(labels.clearUsageTitle || '清空使用次数').trim() || '清空使用次数';
    const clearUsageMessage = String(
      labels.clearUsageMessage || `确认清空${poolLabel}的使用次数吗？号码本身会保留。`
    ).trim() || `确认清空${poolLabel}的使用次数吗？号码本身会保留。`;
    const deleteAllTitle = String(labels.deleteAllTitle || `删除${poolLabel}`).trim() || `删除${poolLabel}`;
    const deleteAllMessage = String(
      labels.deleteAllMessage || `确认删除当前全部${importSubject}吗？此操作不可撤销。`
    ).trim() || `确认删除当前全部${importSubject}吗？此操作不可撤销。`;

    let renderedEntries = [];
    let searchTerm = '';
    let filterMode = 'all';
    let loading = false;
    let refreshQueued = false;

    function normalizeText(value = '') {
      return String(value || '').trim();
    }

    function normalizePoolText(value = '') {
      return String(value || '')
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
    }

    function normalizePoolFileText(value = '') {
      return String(value || '')
        .replace(/^\uFEFF/, '')
        .replace(/\r\n?/g, '\n');
    }

    function normalizeUsHostedPhoneDigits(value = '') {
      const rawValue = normalizeText(value);
      const digits = rawValue.replace(/\D+/g, '');
      if (digits.length === 11 && digits.startsWith('1')) {
        return digits.slice(1);
      }
      return digits || rawValue;
    }

    function normalizePoolPhone(value = '') {
      if (typeof normalizers.normalizePhone === 'function') {
        return normalizers.normalizePhone(value);
      }
      return normalizeUsHostedPhoneDigits(value);
    }

    function normalizePoolUrl(value = '') {
      const rawValue = normalizeText(value);
      if (!rawValue) {
        return '';
      }
      try {
        const parsed = new URL(rawValue);
        parsed.searchParams.delete('t');
        return parsed.toString();
      } catch {
        return rawValue
          .replace(/([?&])t=\d+(?=(&|$))/i, '$1')
          .replace(/[?&]$/g, '');
      }
    }

    function formatLocalPhone(value = '') {
      if (typeof normalizers.formatLocalPhone === 'function') {
        return normalizers.formatLocalPhone(value);
      }
      return normalizeUsHostedPhoneDigits(value);
    }

    function buildKey(phone = '', verificationUrl = '') {
      const normalizedPhone = normalizePoolPhone(phone);
      const normalizedUrl = normalizePoolUrl(verificationUrl);
      return normalizedPhone && normalizedUrl ? `${normalizedPhone}${SEPARATOR}${normalizedUrl}` : '';
    }

    function parseEntries(text = '') {
      const lines = normalizePoolText(text).split('\n').filter(Boolean);
      const seen = new Set();
      const entries = [];
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const separatorIndex = line.indexOf(SEPARATOR);
        const hasSeparator = separatorIndex > 0;
        const phone = hasSeparator
          ? normalizePoolPhone(line.slice(0, separatorIndex))
          : normalizePoolPhone(line);
        const verificationUrl = hasSeparator
          ? normalizePoolUrl(line.slice(separatorIndex + SEPARATOR.length))
          : normalizePoolUrl(lines[index + 1] || '');
        if (!hasSeparator && verificationUrl) {
          index += 1;
        }
        const key = buildKey(phone, verificationUrl);
        if (!phone || !verificationUrl || !key || seen.has(key)) {
          continue;
        }
        seen.add(key);
        entries.push({
          index,
          key,
          phone,
          verificationUrl,
        });
      }
      return entries;
    }

    function entriesToText(entries = []) {
      return parseEntries(entries.map((entry) => `${entry.phone}${SEPARATOR}${entry.verificationUrl}`).join('\n'))
        .map((entry) => `${entry.phone}${SEPARATOR}${entry.verificationUrl}`)
        .join('\n');
    }

    function normalizeUsage(value = {}) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
      }
      return Object.fromEntries(Object.entries(value).map(([key, item]) => {
        const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
        const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
        const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
        return [normalizeText(key), {
          useCount,
          usedAt: Math.max(0, Number(usage.usedAt) || 0),
          lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
          lastError: normalizeText(usage.lastError),
          enabled: usage.enabled !== false,
          disabledReason: normalizeText(usage.disabledReason),
          disabledAt: Math.max(0, Number(usage.disabledAt) || 0),
          failureCount: Math.max(0, Math.floor(Number(usage.failureCount) || 0)),
        }];
      }).filter(([key]) => Boolean(key)));
    }

    function normalizeExportUsage(value = {}, allowedKeys = null) {
      const normalizedUsage = normalizeUsage(value);
      const allowedKeySet = allowedKeys instanceof Set ? allowedKeys : null;
      return Object.fromEntries(
        Object.entries(normalizedUsage).filter(([key]) => !allowedKeySet || allowedKeySet.has(key))
      );
    }

    function normalizeCurrentEntry(entry = null, entries = []) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }
      const key = normalizeText(entry.key || buildKey(entry.phone, entry.verificationUrl));
      if (!key) {
        return null;
      }
      const matchedEntry = Array.isArray(entries)
        ? entries.find((candidate) => candidate.key === key)
        : null;
      if (matchedEntry) {
        return {
          key: matchedEntry.key,
          phone: matchedEntry.phone,
          verificationUrl: matchedEntry.verificationUrl,
        };
      }
      const phone = normalizePoolPhone(entry.phone);
      const verificationUrl = normalizePoolUrl(entry.verificationUrl);
      if (!phone || !verificationUrl) {
        return null;
      }
      return {
        key,
        phone,
        verificationUrl,
      };
    }

    function buildExportFileName(date = new Date()) {
      const pad = (value) => String(value).padStart(2, '0');
      return `flowpilot-paypal-sms-pool-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.txt`;
    }

    function buildExportPayload(entries = renderedEntries) {
      const normalizedEntries = parseEntries(entriesToText(entries));
      const allowedKeys = new Set(normalizedEntries.map((entry) => entry.key));
      const currentEntry = normalizeCurrentEntry(state.getCurrentEntry?.(), normalizedEntries);
      const meta = {
        currentKey: currentEntry?.key || '',
        usage: normalizeExportUsage(state.getUsage?.(), allowedKeys),
      };
      return [
        `# ${EXPORT_HEADER}`,
        `# schemaVersion=${EXPORT_SCHEMA_VERSION}`,
        `# encoding=${EXPORT_ENCODING}`,
        `# exportedAt=${new Date().toISOString()}`,
        `# meta=${JSON.stringify(meta)}`,
        '',
        ...normalizedEntries.map((entry) => `${entry.phone}${SEPARATOR}${entry.verificationUrl}`),
      ].join('\r\n');
    }

    function parsePoolImportFileContent(content = '') {
      const lines = normalizePoolFileText(content).split('\n');
      const bodyLines = [];
      let metaSeen = false;
      let parsedMeta = null;

      for (const rawLine of lines) {
        const line = String(rawLine || '').trim();
        if (!line) {
          continue;
        }
        if (line.startsWith('#')) {
          if (line.startsWith('# meta=')) {
            const metaText = line.slice('# meta='.length).trim();
            try {
              parsedMeta = metaText ? JSON.parse(metaText) : {};
              metaSeen = true;
            } catch {
              throw new Error('接码池文件中的 meta JSON 无效。');
            }
          }
          continue;
        }
        bodyLines.push(line);
      }

      const entries = parseEntries(bodyLines.join('\n'));
      const allowedKeys = new Set(entries.map((entry) => entry.key));
      if (!metaSeen) {
        return {
          entries,
          usage: {},
          currentEntry: null,
        };
      }

      const meta = parsedMeta && typeof parsedMeta === 'object' && !Array.isArray(parsedMeta)
        ? parsedMeta
        : {};
      const usage = normalizeExportUsage(meta.usage || {}, allowedKeys);
      const currentKey = normalizeText(meta.currentKey);
      return {
        entries,
        usage,
        currentEntry: currentKey ? normalizeCurrentEntry({ key: currentKey }, entries) : null,
      };
    }

    function getCurrentKey() {
      const current = state.getCurrentEntry?.() || null;
      return normalizeText(current?.key || buildKey(current?.phone, current?.verificationUrl));
    }

    function getEntriesWithState(entries = renderedEntries) {
      const usage = normalizeUsage(state.getUsage?.());
      const currentKey = getCurrentKey();
      return parseEntries(entriesToText(entries)).map((entry) => {
        const itemUsage = usage[entry.key] || {};
        return {
          ...entry,
          current: Boolean(currentKey && entry.key === currentKey),
          useCount: Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)),
          used: Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)) > 0,
          lastAttemptAt: Math.max(0, Number(itemUsage.lastAttemptAt) || 0),
          lastError: normalizeText(itemUsage.lastError),
          enabled: itemUsage.enabled !== false,
          disabledReason: normalizeText(itemUsage.disabledReason),
          disabledAt: Math.max(0, Number(itemUsage.disabledAt) || 0),
          failureCount: Math.max(0, Math.floor(Number(itemUsage.failureCount) || 0)),
        };
      });
    }

    function getFilteredEntries(entries = renderedEntries) {
      const normalizedSearch = normalizeText(searchTerm).toLowerCase();
      return getEntriesWithState(entries).filter((entry) => {
        const matchesFilter = (() => {
          switch (filterMode) {
            case 'enabled': return Boolean(entry.enabled);
            case 'disabled': return !entry.enabled;
            case 'current': return Boolean(entry.current);
            case 'used': return Boolean(entry.used);
            case 'unused': return !entry.used;
            case 'error': return Boolean(entry.lastError);
            default: return true;
          }
        })();
        if (!matchesFilter) {
          return false;
        }
        if (!normalizedSearch) {
          return true;
        }
        return [
          entry.phone,
          entry.verificationUrl,
          entry.enabled ? 'enabled 启用' : 'disabled 禁用',
          entry.current ? 'current 当前' : '',
          entry.used ? 'used 已用' : 'unused 未用',
          entry.disabledReason ? `disabledReason ${entry.disabledReason}` : '',
          entry.lastError ? `error 异常 ${entry.lastError}` : '',
        ].join(' ').toLowerCase().includes(normalizedSearch);
      });
    }

    function setLoading(nextLoading, summary = '') {
      loading = Boolean(nextLoading);
      [
        dom.btnHostedSmsPoolRefresh,
        dom.btnHostedSmsPoolClearUsed,
        dom.btnHostedSmsPoolDeleteAll,
        dom.btnHostedSmsPoolExport,
        dom.btnHostedSmsPoolImport,
        dom.btnHostedSmsPoolImportFile,
      ].forEach((button) => {
        if (button) button.disabled = loading;
      });
      if (dom.inputHostedSmsPoolImport) {
        dom.inputHostedSmsPoolImport.disabled = loading;
      }
      if (dom.inputHostedSmsPoolImportFile) {
        dom.inputHostedSmsPoolImportFile.disabled = loading;
      }
      if (summary && dom.hostedSmsPoolSummary) {
        dom.hostedSmsPoolSummary.textContent = summary;
      }
    }

    function getMaxUsesSummaryText() {
      if (typeof state.getMaxUses !== 'function') {
        return '';
      }
      const numeric = Number(state.getMaxUses());
      if (!Number.isFinite(numeric)) {
        return '';
      }
      const maxUses = Math.min(99, Math.max(1, Math.floor(numeric)));
      return `每号最多 ${maxUses} 次`;
    }

    function updateControls(entries = renderedEntries) {
      const entriesWithState = getEntriesWithState(entries);
      const usedCount = entriesWithState.filter((entry) => entry.useCount > 0).length;
      const disabledCount = entriesWithState.filter((entry) => !entry.enabled).length;
      if (dom.btnHostedSmsPoolClearUsed) {
        dom.btnHostedSmsPoolClearUsed.disabled = loading || (usedCount === 0 && disabledCount === 0);
      }
      if (dom.btnHostedSmsPoolDeleteAll) {
        dom.btnHostedSmsPoolDeleteAll.disabled = loading || entriesWithState.length === 0;
      }
      if (dom.btnHostedSmsPoolExport) {
        dom.btnHostedSmsPoolExport.disabled = loading || entriesWithState.length === 0;
      }
    }

    function render(entries = parseEntries(state.getText?.())) {
      if (!dom.hostedSmsPoolList || !dom.hostedSmsPoolSummary) {
        return;
      }
      renderedEntries = parseEntries(entriesToText(entries));
      dom.hostedSmsPoolList.innerHTML = '';

      const entriesWithState = getEntriesWithState(renderedEntries);
      if (!entriesWithState.length) {
        dom.hostedSmsPoolList.innerHTML = `<div class="luckmail-empty">${helpers.escapeHtml?.(emptyListText) || emptyListText}</div>`;
        dom.hostedSmsPoolSummary.textContent = emptySummary;
        updateControls([]);
        return;
      }

      const usedCount = entriesWithState.filter((entry) => entry.useCount > 0).length;
      const disabledCount = entriesWithState.filter((entry) => !entry.enabled).length;
      const totalUseCount = entriesWithState.reduce((sum, entry) => sum + Math.max(0, Number(entry.useCount) || 0), 0);
      const maxUsesSummary = getMaxUsesSummaryText();
      dom.hostedSmsPoolSummary.textContent = `已加载 ${entriesWithState.length} 个号码，${usedCount} 个有使用记录，${disabledCount} 个已禁用，累计使用 ${totalUseCount} 次${maxUsesSummary ? `，${maxUsesSummary}` : ''}。`;

      const visibleEntries = getFilteredEntries(renderedEntries);
      if (!visibleEntries.length) {
        dom.hostedSmsPoolList.innerHTML = `<div class="luckmail-empty">${helpers.escapeHtml?.(noMatchText) || noMatchText}</div>`;
        updateControls(renderedEntries);
        return;
      }

      for (const entry of visibleEntries) {
        const item = document.createElement('div');
        item.className = `luckmail-item${entry.current ? ' is-current' : ''}${entry.enabled ? '' : ' is-disabled'}`;
        const localPhone = formatLocalPhone(entry.phone);
        item.innerHTML = `
          <div class="luckmail-item-main">
            <div class="luckmail-item-email-row">
              <div class="luckmail-item-email hosted-sms-pool-phone">
                <span>${helpers.escapeHtml?.(entry.phone) || entry.phone}</span>
                ${entry.current ? '<span class="hosted-sms-pool-current-label">当前</span>' : ''}
                ${localPhonePrefix && localPhone && localPhone !== entry.phone ? `<span class="hosted-sms-pool-phone-local">${helpers.escapeHtml?.(localPhonePrefix) || localPhonePrefix} ${helpers.escapeHtml?.(localPhone) || localPhone}</span>` : ''}
              </div>
              <button
                class="hotmail-copy-btn"
                type="button"
                data-action="copy-phone"
                title="复制号码"
                aria-label="复制号码 ${helpers.escapeHtml?.(entry.phone) || entry.phone}"
              >${copyIcon}</button>
            </div>
            <div class="luckmail-item-details mono">${helpers.escapeHtml?.(entry.verificationUrl) || entry.verificationUrl}</div>
            <div class="luckmail-item-meta">
              ${entry.current ? '<span class="luckmail-tag current">当前</span>' : ''}
              ${entry.enabled ? '<span class="luckmail-tag active">启用中</span>' : '<span class="luckmail-tag fail">已禁用</span>'}
              <span class="luckmail-tag active">使用 ${Math.max(0, Number(entry.useCount) || 0)} 次</span>
              ${entry.failureCount > 0 ? `<span class="luckmail-tag fail">失败 ${Math.max(0, Number(entry.failureCount) || 0)} 次</span>` : ''}
              ${entry.lastError ? `<span class="luckmail-tag fail">${helpers.escapeHtml?.(entry.lastError) || entry.lastError}</span>` : ''}
            </div>
            ${entry.disabledReason ? `<div class="luckmail-item-details">${helpers.escapeHtml?.(entry.disabledReason) || entry.disabledReason}</div>` : ''}
          </div>
          <div class="luckmail-item-actions">
            <button class="btn btn-outline btn-xs" type="button" data-action="${entry.enabled ? 'disable' : 'enable'}">${entry.enabled ? '禁用' : '启用'}</button>
            <button class="btn btn-outline btn-xs" type="button" data-action="increment-usage">次数 +1</button>
            <button class="btn btn-outline btn-xs" type="button" data-action="reset-usage">清零</button>
            <button class="btn btn-outline btn-xs" type="button" data-action="delete">删除</button>
          </div>
        `;

        item.querySelector('[data-action="copy-phone"]')?.addEventListener('click', async () => {
          await helpers.copyTextToClipboard?.(entry.phone || '');
          helpers.showToast?.(copySuccessText, 'success', 1600);
        });

        item.querySelector('[data-action="enable"]')?.addEventListener('click', async () => {
          await patchPool(({ entries: entriesList, usage }) => {
            const nextUsage = { ...usage };
            nextUsage[entry.key] = {
              ...(nextUsage[entry.key] || {}),
              enabled: true,
              disabledReason: '',
              disabledAt: 0,
              failureCount: 0,
            };
            return { entries: entriesList, usage: nextUsage };
          });
        });

        item.querySelector('[data-action="disable"]')?.addEventListener('click', async () => {
          await patchPool(({ entries: entriesList, usage }) => {
            const nextUsage = { ...usage };
            nextUsage[entry.key] = {
              ...(nextUsage[entry.key] || {}),
              enabled: false,
              disabledReason: '手动禁用',
              disabledAt: Date.now(),
            };
            return { entries: entriesList, usage: nextUsage };
          });
        });

        item.querySelector('[data-action="increment-usage"]')?.addEventListener('click', async () => {
          await patchPool(({ entries: entriesList, usage }) => {
            const nextUsage = { ...usage };
            nextUsage[entry.key] = {
              ...(nextUsage[entry.key] || {}),
              useCount: Math.max(0, Number(nextUsage[entry.key]?.useCount) || 0) + 1,
              usedAt: Date.now(),
              lastAttemptAt: Math.max(0, Number(nextUsage[entry.key]?.lastAttemptAt) || 0),
              lastError: normalizeText(nextUsage[entry.key]?.lastError),
              enabled: nextUsage[entry.key]?.enabled !== false,
              disabledReason: normalizeText(nextUsage[entry.key]?.disabledReason),
              disabledAt: Math.max(0, Number(nextUsage[entry.key]?.disabledAt) || 0),
              failureCount: Math.max(0, Math.floor(Number(nextUsage[entry.key]?.failureCount) || 0)),
            };
            return { entries: entriesList, usage: nextUsage };
          });
        });

        item.querySelector('[data-action="reset-usage"]')?.addEventListener('click', async () => {
          await patchPool(({ entries: entriesList, usage }) => {
            const nextUsage = { ...usage };
            nextUsage[entry.key] = {
              ...(nextUsage[entry.key] || {}),
              useCount: 0,
              usedAt: 0,
              lastAttemptAt: 0,
              lastError: '',
              failureCount: 0,
              enabled: nextUsage[entry.key]?.enabled !== false,
              disabledReason: normalizeText(nextUsage[entry.key]?.disabledReason),
              disabledAt: Math.max(0, Number(nextUsage[entry.key]?.disabledAt) || 0),
            };
            return { entries: entriesList, usage: nextUsage };
          });
        });

        item.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
          const confirmed = await helpers.openConfirmModal?.({
            title: deleteTitle,
            message: `确认删除 ${entry.phone} 吗？此操作不可撤销。`,
            confirmLabel: '确认删除',
            confirmVariant: 'btn-danger',
          });
          if (!confirmed) return;
          await patchPool(({ entries: entriesList, usage, currentEntry }) => {
            const nextUsage = { ...usage };
            delete nextUsage[entry.key];
            return {
              entries: entriesList.filter((candidate) => candidate.key !== entry.key),
              usage: nextUsage,
              currentEntry: currentEntry?.key === entry.key ? null : currentEntry,
            };
          });
        });

        dom.hostedSmsPoolList.appendChild(item);
      }

      updateControls(renderedEntries);
    }

    async function patchPool(mutator) {
      const previousText = normalizePoolText(state.getText?.());
      const previousUsage = normalizeUsage(state.getUsage?.());
      const previousEntries = parseEntries(previousText);
      const previousCurrentEntry = normalizeCurrentEntry(state.getCurrentEntry?.(), previousEntries);
      const result = mutator({
        entries: previousEntries.map((entry) => ({ ...entry })),
        usage: { ...previousUsage },
        currentEntry: previousCurrentEntry ? { ...previousCurrentEntry } : null,
      }) || {};
      const nextEntries = parseEntries(entriesToText(result.entries || previousEntries));
      const nextUsage = normalizeExportUsage(
        result.usage || previousUsage,
        new Set(nextEntries.map((entry) => entry.key))
      );
      const nextText = entriesToText(nextEntries);
      const nextCurrentEntry = normalizeCurrentEntry(
        Object.prototype.hasOwnProperty.call(result, 'currentEntry')
          ? result.currentEntry
          : previousCurrentEntry,
        nextEntries
      );

      setLoading(true, updateLoadingText);
      state.setText?.(nextText);
      state.setUsage?.(nextUsage);
      state.setCurrentEntry?.(nextCurrentEntry);
      render(nextEntries);
      try {
        await actions.persistPool?.();
        return true;
      } catch (error) {
        state.setText?.(previousText);
        state.setUsage?.(previousUsage);
        state.setCurrentEntry?.(previousCurrentEntry);
        render(previousEntries);
        helpers.showToast?.(`${updateFailedPrefix}：${error.message}`, 'error');
        return false;
      } finally {
        setLoading(false);
      }
    }

    async function importEntries() {
      const text = normalizePoolText(dom.inputHostedSmsPoolImport?.value || '');
      if (!text) {
        helpers.showToast?.(importEmptyWarning, 'warn');
        return;
      }

      const previousEntries = parseEntries(state.getText?.());
      const knownKeys = new Set(previousEntries.map((entry) => entry.key));
      const imported = [];
      let skippedCount = 0;
      for (const entry of parseEntries(text)) {
        if (knownKeys.has(entry.key)) {
          skippedCount += 1;
          continue;
        }
        knownKeys.add(entry.key);
        imported.push(entry);
      }
      if (!imported.length) {
        helpers.showToast?.(
          skippedCount > 0
            ? `没有可导入的新${numberNoun}，可能都重复了或格式无效。`
            : `没有识别到有效${numberNoun}。`,
          'warn'
        );
        return;
      }

      const persisted = await patchPool(({ entries, usage }) => ({
        entries: [...entries, ...imported],
        usage,
      }));
      if (!persisted) {
        return;
      }
      if (dom.inputHostedSmsPoolImport) {
        dom.inputHostedSmsPoolImport.value = '';
      }
      helpers.showToast?.(
        skippedCount > 0
          ? `已导入 ${imported.length} 个号码，跳过 ${skippedCount} 条重复数据。`
          : `已导入 ${imported.length} 个号码。`,
        'success',
        2200
      );
    }

    async function clearUsedState() {
      const confirmed = await helpers.openConfirmModal?.({
        title: clearUsageTitle,
        message: clearUsageMessage,
        confirmLabel: '清空次数',
      });
      if (!confirmed) return;
      await patchPool(({ entries, usage }) => ({
        entries,
        usage: Object.fromEntries(Object.entries(normalizeUsage(usage)).map(([key, item]) => [key, {
          ...item,
          useCount: 0,
          usedAt: 0,
          lastAttemptAt: 0,
          lastError: '',
          failureCount: 0,
        }])),
      }));
    }

    async function deleteAll() {
      const confirmed = await helpers.openConfirmModal?.({
        title: deleteAllTitle,
        message: deleteAllMessage,
        confirmLabel: '确认删除',
        confirmVariant: 'btn-danger',
      });
      if (!confirmed) return;
      await patchPool(() => ({ entries: [], usage: {}, currentEntry: null }));
    }

    function triggerImportFilePicker() {
      if (loading || !dom.inputHostedSmsPoolImportFile) {
        return;
      }
      dom.inputHostedSmsPoolImportFile.value = '';
      dom.inputHostedSmsPoolImportFile.click();
    }

    async function exportPool() {
      const entries = parseEntries(state.getText?.());
      if (!entries.length) {
        helpers.showToast?.(`当前没有可导出的${importSubject}。`, 'warn');
        return;
      }
      helpers.downloadTextFile?.(
        buildExportPayload(entries),
        buildExportFileName(),
        'text/plain;charset=utf-8',
        { prependUtf8Bom: true }
      );
      helpers.showToast?.(`已导出 ${entries.length} 个号码。`, 'success', 2200);
    }

    async function importPoolFile(file) {
      if (!file) {
        return;
      }
      const confirmed = await helpers.openConfirmModal?.({
        title: `导入${poolLabel}文件`,
        message: `确认导入文件 "${file.name}" 吗？导入后会覆盖当前 ${poolLabel}，并恢复文件中的状态。`,
        confirmLabel: '确认覆盖导入',
        confirmVariant: 'btn-danger',
      });
      if (!confirmed) {
        if (dom.inputHostedSmsPoolImportFile) {
          dom.inputHostedSmsPoolImportFile.value = '';
        }
        return;
      }

      const previousText = normalizePoolText(state.getText?.());
      const previousUsage = normalizeUsage(state.getUsage?.());
      const previousCurrentEntry = normalizeCurrentEntry(state.getCurrentEntry?.(), parseEntries(previousText));

      setLoading(true, `正在导入${poolLabel}文件...`);
      try {
        const parsed = parsePoolImportFileContent(await file.text());
        state.setText?.(entriesToText(parsed.entries));
        state.setUsage?.(parsed.usage);
        state.setCurrentEntry?.(parsed.currentEntry);
        render(parsed.entries);
        await actions.persistPool?.();
        helpers.showToast?.(`已导入 ${parsed.entries.length} 个号码。`, 'success', 2200);
      } catch (error) {
        state.setText?.(previousText);
        state.setUsage?.(previousUsage);
        state.setCurrentEntry?.(previousCurrentEntry);
        render(parseEntries(previousText));
        helpers.showToast?.(`导入${poolLabel}失败：${error.message}`, 'error');
      } finally {
        if (dom.inputHostedSmsPoolImportFile) {
          dom.inputHostedSmsPoolImportFile.value = '';
        }
        setLoading(false);
      }
    }

    function refresh(options = {}) {
      const { silent = false } = options;
      if (state.isVisible && !state.isVisible()) {
        return;
      }
      if (!silent) setLoading(true, refreshLoadingText);
      render(parseEntries(state.getText?.()));
      if (!silent) setLoading(false);
    }

    function queueRefresh() {
      if (refreshQueued) return;
      refreshQueued = true;
      setTimeout(() => {
        refreshQueued = false;
        refresh({ silent: true });
      }, 120);
    }

    function bindEvents() {
      dom.btnHostedSmsPoolRefresh?.addEventListener('click', () => refresh());
      dom.btnHostedSmsPoolExport?.addEventListener('click', () => {
        void exportPool();
      });
      dom.btnHostedSmsPoolImportFile?.addEventListener('click', () => {
        triggerImportFilePicker();
      });
      dom.btnHostedSmsPoolImport?.addEventListener('click', () => {
        void importEntries();
      });
      dom.inputHostedSmsPoolImportFile?.addEventListener('change', () => {
        const file = dom.inputHostedSmsPoolImportFile.files?.[0] || null;
        void importPoolFile(file);
      });
      dom.inputHostedSmsPoolImport?.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          void importEntries();
        }
      });
      dom.inputHostedSmsPoolSearch?.addEventListener('input', (event) => {
        searchTerm = normalizeText(event.target.value);
        render(renderedEntries);
      });
      dom.selectHostedSmsPoolFilter?.addEventListener('change', (event) => {
        filterMode = normalizeText(event.target.value) || 'all';
        render(renderedEntries);
      });
      dom.btnHostedSmsPoolClearUsed?.addEventListener('click', () => {
        void clearUsedState();
      });
      dom.btnHostedSmsPoolDeleteAll?.addEventListener('click', () => {
        void deleteAll();
      });
    }

    function reset() {
      searchTerm = '';
      filterMode = 'all';
      if (dom.inputHostedSmsPoolSearch) dom.inputHostedSmsPoolSearch.value = '';
      if (dom.selectHostedSmsPoolFilter) dom.selectHostedSmsPoolFilter.value = 'all';
      if (dom.inputHostedSmsPoolImport) dom.inputHostedSmsPoolImport.value = '';
      if (dom.inputHostedSmsPoolImportFile) dom.inputHostedSmsPoolImportFile.value = '';
      if (dom.hostedSmsPoolList) dom.hostedSmsPoolList.innerHTML = '';
      if (dom.hostedSmsPoolSummary) {
        dom.hostedSmsPoolSummary.textContent = emptySummary;
      }
      updateControls([]);
    }

    return {
      bindEvents,
      queueRefresh,
      refresh,
      render,
      reset,
    };
  }

  globalScope.SidepanelHostedSmsPoolManager = {
    createHostedSmsPoolManager,
  };
})(typeof window !== 'undefined' ? window : globalThis);
