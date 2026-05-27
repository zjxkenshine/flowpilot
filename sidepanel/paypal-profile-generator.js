(function attachSidepanelPayPalProfileGenerator(globalScope) {
  function createPayPalProfileGenerator(context = {}) {
    const {
      state,
      dom,
      helpers,
      runtime,
      data = {},
    } = context;

    let actionInFlight = false;

    const EMPTY_PROFILE = {
      email: '',
      phone: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      password: '',
      firstName: '',
      lastName: '',
      birthday: '',
      countryCode: '',
      address1: '',
      city: '',
      region: '',
      postalCode: '',
      fullAddress: '',
      generatedFromCountry: '',
      generatedAt: 0,
    };

    const FIELD_ORDER = [
      'email',
      'phone',
      'cardNumber',
      'cardExpiry',
      'cardCvv',
      'password',
      'firstName',
      'lastName',
      'birthday',
      'countryCode',
      'address1',
      'city',
      'region',
      'postalCode',
      'fullAddress',
      'generatedFromCountry',
      'generatedAt',
    ];

    const PROFILE_COPY_LINES = [
      ['邮箱', 'email'],
      ['电话', 'phone'],
      ['卡号', 'cardNumber'],
      ['有效期', 'cardExpiry'],
      ['CVV', 'cardCvv'],
      ['密码', 'password'],
      ['名字', 'firstName'],
      ['姓氏', 'lastName'],
      ['生日', 'birthday'],
      ['国家', 'countryCode'],
      ['地址', 'address1'],
      ['城市', 'city'],
      ['州省', 'region'],
      ['邮编', 'postalCode'],
    ];

    function normalizeCountryCode(value = '') {
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      return normalized.length === 2 ? normalized : '';
    }

    function normalizeGeneratedAt(value) {
      return Math.max(0, Number(value) || 0);
    }

    function normalizeProfile(input = {}) {
      const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
      const next = { ...EMPTY_PROFILE };
      FIELD_ORDER.forEach((field) => {
        if (field === 'generatedAt') {
          next.generatedAt = normalizeGeneratedAt(source.generatedAt);
          return;
        }
        if (field === 'countryCode' || field === 'generatedFromCountry') {
          next[field] = normalizeCountryCode(source[field]);
          return;
        }
        next[field] = String(source[field] || '').trim();
      });
      return next;
    }

    function getLatestState() {
      return typeof state?.getLatestState === 'function'
        ? state.getLatestState()
        : {};
    }

    function getCurrentProfile(currentState = getLatestState()) {
      return normalizeProfile(currentState?.paypalGeneratedProfile);
    }

    function formatTimestamp(timestamp) {
      const value = normalizeGeneratedAt(timestamp);
      if (!value) {
        return '--';
      }
      return new Date(value).toLocaleString('zh-CN', {
        hour12: false,
      });
    }

    function escapeHtml(value) {
      if (typeof helpers?.escapeHtml === 'function') {
        return helpers.escapeHtml(String(value || ''));
      }
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function hasRenderableProfile(profile = {}) {
      return FIELD_ORDER.some((field) => {
        if (field === 'generatedAt') {
          return normalizeGeneratedAt(profile.generatedAt) > 0;
        }
        return String(profile[field] || '').trim() !== '';
      });
    }

    function buildPassword() {
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^';
      let value = 'Aa1!';
      while (value.length < 14) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return value;
    }

    function buildVisaCard() {
      const digits = [4, 1, 4, 7];
      while (digits.length < 15) {
        digits.push(Math.floor(Math.random() * 10));
      }
      const reversed = digits.slice().reverse();
      let sum = 0;
      for (let index = 0; index < reversed.length; index += 1) {
        let digit = reversed[index];
        if (index % 2 === 0) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
      }
      digits.push((10 - (sum % 10)) % 10);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const year = (new Date().getFullYear() % 100) + 3;
      return {
        number: digits.join(''),
        expiry: `${month} / ${year}`,
        cvv: String(Math.floor(100 + Math.random() * 900)),
      };
    }

    function buildBirthdayString(birthday = null) {
      if (!birthday || typeof birthday !== 'object') {
        return '';
      }
      const year = Number(birthday.year);
      const month = Number(birthday.month);
      const day = Number(birthday.day);
      if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return '';
      }
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function buildFullAddress({
      address1 = '',
      city = '',
      region = '',
      postalCode = '',
      countryCode = '',
    } = {}) {
      return [address1, city, region, postalCode, countryCode]
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join(' ');
    }

    function normalizeExitRegionToCountryCode(value = '') {
      const raw = String(value || '').trim();
      if (!raw) {
        return '';
      }
      const direct = normalizeCountryCode(raw);
      if (direct) {
        return direct;
      }
      const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
      if (bracketMatch) {
        return normalizeCountryCode(bracketMatch[1]);
      }
      const upperTokens = raw.toUpperCase().match(/[A-Z]{2,3}/g) || [];
      for (const token of upperTokens) {
        const normalized = normalizeCountryCode(token);
        if (normalized) {
          return normalized;
        }
      }
      if (typeof data.normalizeCountryCode === 'function') {
        return normalizeCountryCode(data.normalizeCountryCode(raw));
      }
      return '';
    }

    function resolveProfileCountryCode(currentState = getLatestState()) {
      const manualSession = currentState?.plusCheckoutConversionProxyManualSession;
      if (manualSession && typeof manualSession === 'object' && !Array.isArray(manualSession)) {
        const sessionCountry = normalizeExitRegionToCountryCode(
          manualSession.exitRegion
          || manualSession.countryCode
          || manualSession.region
          || ''
        );
        if (sessionCountry) {
          return sessionCountry;
        }
      }
      const exitCountry = normalizeExitRegionToCountryCode(currentState?.ipProxyAppliedExitRegion || '');
      if (exitCountry) {
        return exitCountry;
      }
      return 'US';
    }

    function generateProfile(currentState = getLatestState()) {
      const name = typeof data.generateRandomName === 'function'
        ? data.generateRandomName()
        : { firstName: '', lastName: '' };
      const birthday = typeof data.generateRandomBirthday === 'function'
        ? data.generateRandomBirthday()
        : null;
      const countryCode = resolveProfileCountryCode(currentState);
      const addressSeed = typeof data.getAddressSeedForCountry === 'function'
        ? data.getAddressSeedForCountry(countryCode, { fallbackCountry: 'US' })
        : null;
      const effectiveCountryCode = normalizeCountryCode(
        typeof data.normalizeCountryCode === 'function'
          ? data.normalizeCountryCode(addressSeed?.countryCode || countryCode)
          : (addressSeed?.countryCode || countryCode)
      ) || 'US';
      const fallback = addressSeed?.fallback || {};
      const currentPayPalAccount = typeof helpers?.getCurrentPayPalAccount === 'function'
        ? helpers.getCurrentPayPalAccount(currentState)
        : null;
      const email = String(
        helpers?.getDraftEmail?.()
        || currentState?.email
        || currentPayPalAccount?.email
        || ''
      ).trim();
      const phone = String(
        helpers?.getDraftHostedCheckoutPhone?.()
        || currentState?.hostedCheckoutPhoneNumber
        || ''
      ).trim();
      const password = String(
        helpers?.getDraftCustomPassword?.()
        || currentState?.customPassword
        || buildPassword()
      ).trim();
      const card = buildVisaCard();
      const address1 = String(fallback.address1 || '').trim();
      const city = String(fallback.city || '').trim();
      const region = String(fallback.region || '').trim();
      const postalCode = String(fallback.postalCode || '').trim();

      return normalizeProfile({
        email,
        phone,
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        password,
        firstName: String(name?.firstName || '').trim(),
        lastName: String(name?.lastName || '').trim(),
        birthday: buildBirthdayString(birthday),
        countryCode: effectiveCountryCode,
        address1,
        city,
        region,
        postalCode,
        fullAddress: buildFullAddress({ address1, city, region, postalCode, countryCode: effectiveCountryCode }),
        generatedFromCountry: effectiveCountryCode,
        generatedAt: Date.now(),
      });
    }

    function getFieldDisplayValue(field, profile) {
      if (field === 'generatedAt') {
        return formatTimestamp(profile.generatedAt);
      }
      return String(profile[field] || '').trim() || '--';
    }

    function getFieldRawValue(field, profile) {
      if (field === 'generatedAt') {
        const timestamp = normalizeGeneratedAt(profile.generatedAt);
        return timestamp ? String(timestamp) : '';
      }
      return String(profile[field] || '').trim();
    }

    function renderProfileDetails(profile = getCurrentProfile()) {
      if (!dom.profileDetails) {
        return;
      }
      if (!hasRenderableProfile(profile)) {
        dom.profileDetails.innerHTML = `
          <div class="paypal-profile-empty">点击“生成 PayPal 资料”后在这里展示结果。</div>
        `;
        return;
      }

      const fields = [
        ['邮箱', 'email'],
        ['电话', 'phone'],
        ['卡号', 'cardNumber'],
        ['有效期', 'cardExpiry'],
        ['CVV', 'cardCvv'],
        ['密码', 'password'],
        ['名字', 'firstName'],
        ['姓氏', 'lastName'],
        ['生日', 'birthday'],
        ['国家', 'countryCode'],
        ['地址', 'address1'],
        ['城市', 'city'],
        ['州省', 'region'],
        ['邮编', 'postalCode'],
        ['整段地址', 'fullAddress'],
        ['来源国家', 'generatedFromCountry'],
        ['生成时间', 'generatedAt'],
      ];

      dom.profileDetails.innerHTML = fields.map(([label, field]) => `
        <div class="paypal-profile-field">
          <span class="paypal-profile-field-label">${escapeHtml(label)}</span>
          <span class="paypal-profile-field-value mono">${escapeHtml(getFieldDisplayValue(field, profile))}</span>
          <button type="button" class="btn btn-outline btn-xs paypal-profile-copy-btn" data-paypal-profile-copy-field="${escapeHtml(field)}">复制</button>
        </div>
      `).join('');

      Array.from(dom.profileDetails.querySelectorAll('[data-paypal-profile-copy-field]')).forEach((button) => {
        button.addEventListener('click', async () => {
          const field = String(button.dataset.paypalProfileCopyField || '').trim();
          await copyField(field);
        });
      });
    }

    function renderProfile(profile = getCurrentProfile()) {
      if (dom.profileSummary) {
        dom.profileSummary.textContent = hasRenderableProfile(profile)
          ? `最近生成：${formatTimestamp(profile.generatedAt)}`
          : '未生成';
      }
      if (dom.btnCopyProfile) {
        dom.btnCopyProfile.disabled = !hasRenderableProfile(profile) || actionInFlight;
      }
      if (dom.btnGenerateProfile) {
        dom.btnGenerateProfile.disabled = actionInFlight;
        dom.btnGenerateProfile.textContent = actionInFlight ? '生成中...' : '生成 PayPal 资料';
      }
      syncCollapseState();
      renderProfileDetails(profile);
    }

    async function persistProfile(profile) {
      const normalizedProfile = normalizeProfile(profile);
      const response = await runtime.sendMessage({
        type: 'SAVE_SETTING',
        source: 'sidepanel',
        payload: {
          paypalGeneratedProfile: normalizedProfile,
        },
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      state.syncLatestState({
        paypalGeneratedProfile: normalizedProfile,
      });
      renderProfile(normalizedProfile);
      return normalizedProfile;
    }

    function buildProfileCopyText(profile = getCurrentProfile()) {
      return PROFILE_COPY_LINES
        .map(([label, field]) => {
          const value = getFieldRawValue(field, profile);
          return `${label}：${value}`;
        })
        .join('\n');
    }

    async function copyField(field) {
      const profile = getCurrentProfile();
      const value = getFieldRawValue(field, profile);
      if (!value) {
        throw new Error('没有可复制的内容。');
      }
      await helpers.copyTextToClipboard(value);
      const label = {
        email: '邮箱',
        phone: '电话',
        cardNumber: '卡号',
        cardExpiry: '有效期',
        cardCvv: 'CVV',
        password: '密码',
        firstName: '名字',
        lastName: '姓氏',
        birthday: '生日',
        countryCode: '国家',
        address1: '地址',
        city: '城市',
        region: '州省',
        postalCode: '邮编',
        fullAddress: '整段地址',
        generatedFromCountry: '来源国家',
        generatedAt: '生成时间',
      }[field] || '字段';
      helpers.showToast(`${label}已复制`, 'success', 1600);
    }

    async function handleCopyProfile() {
      const profile = getCurrentProfile();
      const hasCopyableValue = PROFILE_COPY_LINES.some(([, field]) => getFieldRawValue(field, profile));
      if (!hasCopyableValue) {
        throw new Error('没有可复制的内容。');
      }
      const text = buildProfileCopyText(profile);
      await helpers.copyTextToClipboard(text);
      helpers.showToast('PayPal 资料已复制', 'success', 1800);
    }

    function isProfileCollapsed() {
      if (!dom.profileShell?.classList?.contains) {
        return false;
      }
      return dom.profileShell.classList.contains('is-collapsed');
    }

    function syncCollapseState() {
      const collapsed = isProfileCollapsed();
      if (dom.profileDetails) {
        dom.profileDetails.hidden = collapsed;
      }
      if (dom.btnToggleProfile) {
        dom.btnToggleProfile.textContent = collapsed ? '展开' : '收起';
        dom.btnToggleProfile.setAttribute?.('aria-expanded', String(!collapsed));
      }
    }

    function toggleProfileDetails() {
      const nextCollapsed = !isProfileCollapsed();
      dom.profileShell?.classList?.toggle?.('is-collapsed', nextCollapsed);
      syncCollapseState();
    }

    async function handleGenerateProfile() {
      if (actionInFlight) {
        return;
      }
      actionInFlight = true;
      renderProfile(getCurrentProfile());
      try {
        const profile = generateProfile(getLatestState());
        await persistProfile(profile);
        helpers.showToast('已生成 PayPal 注册资料', 'success', 1800);
      } finally {
        actionInFlight = false;
        renderProfile(getCurrentProfile());
      }
    }

    function bindPayPalProfileEvents() {
      dom.btnGenerateProfile?.addEventListener('click', () => {
        handleGenerateProfile().catch((error) => {
          renderProfile(getCurrentProfile());
          helpers.showToast(error?.message || '生成 PayPal 资料失败。', 'error');
        });
      });
      dom.btnCopyProfile?.addEventListener('click', () => {
        handleCopyProfile().catch((error) => {
          helpers.showToast(error?.message || '复制 PayPal 资料失败。', 'error');
        });
      });
      dom.btnToggleProfile?.addEventListener('click', () => {
        toggleProfileDetails();
      });
      syncCollapseState();
    }

    return {
      bindPayPalProfileEvents,
      generateProfile,
      getCurrentProfile,
      normalizeProfile,
      renderPayPalProfile: renderProfile,
      resolveProfileCountryCode,
      syncCollapseState,
      toggleProfileDetails,
    };
  }

  globalScope.SidepanelPayPalProfileGenerator = {
    createPayPalProfileGenerator,
  };
})(typeof window !== 'undefined' ? window : globalThis);
