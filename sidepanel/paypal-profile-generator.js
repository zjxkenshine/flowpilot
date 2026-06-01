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

    const brazilProfileGenerator = data.brazilProfileGenerator
      || globalScope.MultiPageBrazilProfileGenerator
      || null;

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
      cpf: '',
      cpfDigits: '',
      cnpj: '',
      cnpjDigits: '',
      documentType: '',
      documentNumber: '',
      documentDigits: '',
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
      'cpf',
      'cpfDigits',
      'cnpj',
      'cnpjDigits',
      'documentType',
      'documentNumber',
      'documentDigits',
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
      ['CPF', 'cpf'],
      ['CNPJ', 'cnpj'],
    ];

    function normalizeCountryCode(value = '') {
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      return normalized.length === 2 ? normalized : '';
    }

    function normalizeProfileCountryCode(value = '', fallback = '') {
      const raw = String(value || '').trim();
      const direct = normalizeCountryCode(raw);
      const lower = raw.toLowerCase();
      const normalized = direct
        || (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower) ? 'US' : '')
        || (/\b(?:jp|jpn|japan)\b|日本/.test(lower) ? 'JP' : '')
        || (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower) ? 'BR' : '')
        || (() => {
          const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
          return bracketMatch ? normalizeCountryCode(bracketMatch[1]) : '';
        })();
      return ['US', 'JP', 'BR'].includes(normalized) ? normalized : normalizeCountryCode(fallback);
    }

    function getCountryDisplayName(countryCode = '') {
      const normalized = normalizeProfileCountryCode(countryCode, 'US') || 'US';
      return {
        US: 'United States',
        JP: 'Japan',
        BR: 'Brazil',
      }[normalized] || normalized;
    }

    function chooseFromList(list = []) {
      const values = Array.isArray(list) ? list.filter(Boolean) : [];
      return values.length ? String(values[Math.floor(Math.random() * values.length)] || '').trim() : '';
    }

    function generateRegionalName(countryCode = '') {
      const normalized = normalizeProfileCountryCode(countryCode, 'US') || 'US';
      const pools = {
        US: {
          firstNames: ['James', 'John', 'Robert', 'Michael', 'William', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth'],
          lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Anderson'],
        },
        JP: {
          firstNames: ['Haruto', 'Yuto', 'Sota', 'Ren', 'Yuma', 'Yui', 'Aoi', 'Hina', 'Sakura', 'Mei'],
          lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
        },
        BR: {
          firstNames: ['Lucas', 'Gabriel', 'Rafael', 'Pedro', 'Matheus', 'Mariana', 'Juliana', 'Camila', 'Ana', 'Beatriz'],
          lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima'],
        },
      };
      const pool = pools[normalized] || pools.US;
      return {
        firstName: chooseFromList(pool.firstNames),
        lastName: chooseFromList(pool.lastNames),
      };
    }

    function normalizeGeneratedAt(value) {
      return Math.max(0, Number(value) || 0);
    }

    function isPlainObject(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function firstNonEmpty(...values) {
      for (const value of values) {
        const normalized = String(value || '').trim();
        if (normalized) {
          return normalized;
        }
      }
      return '';
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

    function buildRandomPayPalEmail() {
      if (globalScope.PayPalUtils?.buildRandomPayPalGmailEmail) {
        return globalScope.PayPalUtils.buildRandomPayPalGmailEmail();
      }
      const localPart = `fp.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`;
      return `${localPart}@gmail.com`;
    }

    function buildBrazilPassword() {
      const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      const alphabet = `${letters}${digits}`;
      const chars = [
        letters[Math.floor(Math.random() * letters.length)],
        digits[Math.floor(Math.random() * digits.length)],
      ];
      while (chars.length < 14) {
        chars.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
      }
      for (let index = chars.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
      }
      return chars.join('');
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

    function buildBirthdayString(birthday = null, format = 'iso') {
      if (!birthday || typeof birthday !== 'object') {
        return '';
      }
      const year = Number(birthday.year);
      const month = Number(birthday.month);
      const day = Number(birthday.day);
      if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return '';
      }
      const yearText = String(year).padStart(4, '0');
      const monthText = String(month).padStart(2, '0');
      const dayText = String(day).padStart(2, '0');
      if (format === 'br') {
        return `${dayText}/${monthText}/${yearText}`;
      }
      return `${yearText}-${monthText}-${dayText}`;
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

    function createLocalBrazilProfile(options = {}) {
      if (brazilProfileGenerator?.generateLocalBrazilProfile) {
        return brazilProfileGenerator.generateLocalBrazilProfile(options);
      }
      return {
        countryCode: 'BR',
        generatedFromCountry: 'BR',
        source: 'local_brazil_profile_fallback',
        firstName: 'Lucas',
        lastName: 'Silva',
        address1: 'Avenida Paulista 1578',
        street: 'Avenida Paulista 1578',
        city: 'Sao Paulo',
        state: 'Sao Paulo',
        stateCode: 'SP',
        postalCode: '01310-200',
        cpf: '',
        cpfDigits: '',
        cnpj: '',
        cnpjDigits: '',
        documentType: 'cpf',
        documentNumber: '',
        documentDigits: '',
        fullAddress: 'Avenida Paulista 1578 Sao Paulo SP 01310-200 Brazil',
        generatedAt: Date.now(),
      };
    }

    function buildBrazilAddressSeedFromProfile(profile = {}) {
      if (brazilProfileGenerator?.toClassicAddressSeed) {
        return brazilProfileGenerator.toClassicAddressSeed(profile);
      }
      return {
        countryCode: 'BR',
        query: [profile.address1, profile.city].filter(Boolean).join(', '),
        source: profile.source || 'local_brazil_profile_fallback',
        skipAutocomplete: true,
        fallback: {
          address1: String(profile.address1 || 'Avenida Paulista 1578').trim(),
          city: String(profile.city || 'Sao Paulo').trim(),
          region: String(profile.state || profile.region || 'Sao Paulo').trim(),
          postalCode: String(profile.postalCode || '01310-200').trim(),
        },
        cpf: String(profile.cpf || '').trim(),
        cpfDigits: String(profile.cpfDigits || '').trim(),
        cnpj: String(profile.cnpj || '').trim(),
        cnpjDigits: String(profile.cnpjDigits || '').trim(),
        documentType: String(profile.documentType || 'cpf').trim(),
        documentNumber: String(profile.documentNumber || profile.cpf || '').trim(),
        documentDigits: String(profile.documentDigits || profile.cpfDigits || '').trim(),
      };
    }

    async function fetchBrazilAddressSeedFromMeiguodizhi(fallbackSeed = null) {
      const fetcher = typeof data.fetchImpl === 'function'
        ? data.fetchImpl
        : (typeof globalScope.fetch === 'function' ? globalScope.fetch.bind(globalScope) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前环境不支持 fetch。');
      }
      const response = await fetcher(BRAZIL_PROFILE_ADDRESS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: fallbackSeed?.fallback?.city || BRAZIL_PROFILE_ADDRESS_CITY,
          path: BRAZIL_PROFILE_ADDRESS_PATH,
          method: 'refresh',
        }),
      });
      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status || 0}`);
      }
      const payload = await response.json();
      if (payload?.status !== 'ok') {
        throw new Error(payload?.message || payload?.status || '巴西地址接口返回异常。');
      }
      const seed = buildBrazilAddressSeedFromApiAddress(payload.address || {}, fallbackSeed);
      if (!seed) {
        throw new Error('巴西地址接口返回字段不完整。');
      }
      return seed;
    }

    async function resolveProfileAddressSeed(countryCode = 'US') {
      const normalizedCountryCode = resolveSupportedProfileCountryCode(countryCode);
      if (normalizedCountryCode === 'BR') {
        const fetcher = typeof data.fetchImpl === 'function'
          ? data.fetchImpl
          : (typeof globalScope.fetch === 'function' ? globalScope.fetch.bind(globalScope) : null);
        const profile = brazilProfileGenerator?.resolveBrazilProfile
          ? await brazilProfileGenerator.resolveBrazilProfile({
            allowPublicLookup: Boolean(fetcher),
            fetchImpl: fetcher,
          })
          : createLocalBrazilProfile();
        if (profile?.publicLookupError) {
          helpers?.showToast?.(
            `Brazil CEP lookup unavailable; using local Brazil profile. ${profile.publicLookupError}`,
            'warn',
            2600
          );
        }
        return buildBrazilAddressSeedFromProfile(profile);
      }
      return typeof data.getAddressSeedForCountry === 'function'
        ? data.getAddressSeedForCountry(normalizedCountryCode, { fallbackCountry: 'US' })
        : null;
    }

    function normalizeBrazilPhoneForProfile(value = '') {
      const digits = String(value || '').replace(/\D/g, '');
      if (/^55\d{10,11}$/.test(digits)) {
        return `+${digits}`;
      }
      return '';
    }

    function normalizeHostedProfile(input = {}) {
      const source = isPlainObject(input) ? input : {};
      const address = isPlainObject(source.address) ? source.address : {};
      const countryCode = normalizeCountryCode(firstNonEmpty(
        source.countryCode,
        address.countryCode,
        source.generatedFromCountry,
        address.country
      ));
      const address1 = firstNonEmpty(source.address1, address.address1, address.street);
      const city = firstNonEmpty(source.city, address.city);
      const region = firstNonEmpty(source.region, source.state, address.region, address.state);
      const postalCode = firstNonEmpty(source.postalCode, source.zip, address.postalCode, address.zip);
      const flatProfile = normalizeProfile({
        email: source.email,
        phone: source.phone,
        cardNumber: source.cardNumber,
        cardExpiry: source.cardExpiry,
        cardCvv: source.cardCvv,
        password: source.password,
        firstName: source.firstName,
        lastName: source.lastName,
        birthday: source.birthday,
        cpf: firstNonEmpty(source.cpf, address.cpf),
        cpfDigits: firstNonEmpty(source.cpfDigits, address.cpfDigits),
        cnpj: firstNonEmpty(source.cnpj, address.cnpj),
        cnpjDigits: firstNonEmpty(source.cnpjDigits, address.cnpjDigits),
        documentType: firstNonEmpty(source.documentType, address.documentType),
        documentNumber: firstNonEmpty(source.documentNumber, address.documentNumber),
        documentDigits: firstNonEmpty(source.documentDigits, address.documentDigits),
        countryCode,
        address1,
        city,
        region,
        postalCode,
        fullAddress: firstNonEmpty(
          source.fullAddress,
          buildFullAddress({ address1, city, region, postalCode, countryCode })
        ),
        generatedFromCountry: source.generatedFromCountry || countryCode,
        generatedAt: source.generatedAt,
      });
      return flatProfile;
    }

    function getHostedProfileFromState(currentState = getLatestState()) {
      const profile = currentState?.plusHostedCheckoutGuestProfile || currentState?.hostedCheckoutGuestProfile || null;
      return isPlainObject(profile) ? profile : null;
    }

    function getCurrentProfile(currentState = getLatestState()) {
      const hostedProfile = normalizeHostedProfile(getHostedProfileFromState(currentState));
      if (hasRenderableProfile(hostedProfile)) {
        return hostedProfile;
      }
      return normalizeProfile(currentState?.paypalGeneratedProfile);
    }

    function buildHostedProfileFromFlatProfile(profile = {}) {
      const normalizedProfile = normalizeProfile(profile);
      return {
        email: normalizedProfile.email,
        phone: normalizedProfile.phone,
        cardNumber: normalizedProfile.cardNumber,
        cardExpiry: normalizedProfile.cardExpiry,
        cardCvv: normalizedProfile.cardCvv,
        password: normalizedProfile.password,
        firstName: normalizedProfile.firstName,
        lastName: normalizedProfile.lastName,
        birthday: normalizedProfile.birthday,
        cpf: normalizedProfile.cpf,
        cpfDigits: normalizedProfile.cpfDigits,
        cnpj: normalizedProfile.cnpj,
        cnpjDigits: normalizedProfile.cnpjDigits,
        documentType: normalizedProfile.documentType,
        documentNumber: normalizedProfile.documentNumber,
        documentDigits: normalizedProfile.documentDigits,
        generatedAt: normalizedProfile.generatedAt,
        address: {
          street: normalizedProfile.address1,
          address1: normalizedProfile.address1,
          city: normalizedProfile.city,
          state: normalizedProfile.region,
          region: normalizedProfile.region,
          zip: normalizedProfile.postalCode,
          postalCode: normalizedProfile.postalCode,
          countryCode: normalizedProfile.countryCode,
          country: getCountryDisplayName(normalizedProfile.countryCode),
          cpf: normalizedProfile.cpf,
          cpfDigits: normalizedProfile.cpfDigits,
          cnpj: normalizedProfile.cnpj,
          cnpjDigits: normalizedProfile.cnpjDigits,
          documentType: normalizedProfile.documentType,
          documentNumber: normalizedProfile.documentNumber,
          documentDigits: normalizedProfile.documentDigits,
        },
        countryCode: normalizedProfile.countryCode,
        generatedFromCountry: normalizedProfile.generatedFromCountry || normalizedProfile.countryCode,
      };
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
        const normalized = normalizeProfileCountryCode(token);
        if (normalized) {
          return normalized;
        }
      }
      if (typeof data.normalizeCountryCode === 'function') {
        return normalizeProfileCountryCode(data.normalizeCountryCode(raw));
      }
      return '';
    }

    function resolveSupportedProfileCountryCode(countryCode = '') {
      return normalizeProfileCountryCode(countryCode, 'US') || 'US';
    }

    function normalizePayPalProfileCountryCodePreference(value = '') {
      const normalized = normalizeProfileCountryCode(value, '');
      return ['US', 'JP', 'BR'].includes(normalized) ? normalized : '';
    }

    function resolvePayPalProfileCountryPreference(currentState = getLatestState()) {
      return normalizePayPalProfileCountryCodePreference(currentState?.paypalProfileCountryCode);
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
          return resolveSupportedProfileCountryCode(sessionCountry);
        }
      }
      const exitCheck = currentState?.plusCheckoutConversionProxyExitCheck;
      const exitCountry = normalizeExitRegionToCountryCode(
        exitCheck?.exitRegion
        || currentState?.ipProxyAppliedExitRegion
        || ''
      );
      if (exitCountry) {
        return resolveSupportedProfileCountryCode(exitCountry);
      }
      return 'US';
    }

    function getProfilePhoneCandidates(currentState = getLatestState()) {
      const currentSmsEntry = currentState?.hostedCheckoutCurrentSmsEntry;
      const hostedProfile = getHostedProfileFromState(currentState);
      return [
        currentSmsEntry?.phone,
        helpers?.getDraftHostedCheckoutPhone?.(),
        currentState?.hostedCheckoutPhoneNumber,
        hostedProfile?.phone,
      ];
    }

    function resolveProfilePhone(currentState = getLatestState(), countryCode = '') {
      const candidates = getProfilePhoneCandidates(currentState)
        .map((value) => String(value || '').trim())
        .filter(Boolean);
      if (resolveSupportedProfileCountryCode(countryCode) === 'BR') {
        for (const candidate of candidates) {
          const normalized = normalizeBrazilPhoneForProfile(candidate);
          if (normalized) {
            return normalized;
          }
        }
        return '';
      }
      return candidates[0] || '';
    }

    function generateProfile(currentState = getLatestState(), options = {}) {
      const birthday = typeof data.generateRandomBirthday === 'function'
        ? data.generateRandomBirthday()
        : null;
      const preferredCountryCode = normalizePayPalProfileCountryCodePreference(options?.countryCode)
        || resolvePayPalProfileCountryPreference(currentState);
      const countryCode = resolveSupportedProfileCountryCode(
        preferredCountryCode
        || options?.profileRegion?.countryCode
        || resolveProfileCountryCode(currentState)
      );
      const fallbackName = typeof data.generateRandomName === 'function'
        ? data.generateRandomName()
        : { firstName: '', lastName: '' };
      const regionalName = generateRegionalName(countryCode);
      const name = {
        firstName: regionalName.firstName || fallbackName?.firstName || '',
        lastName: regionalName.lastName || fallbackName?.lastName || '',
      };
      const addressSeed = options?.addressSeed
        || (countryCode === 'BR'
          ? buildBrazilAddressSeedFromProfile(createLocalBrazilProfile())
          : (typeof data.getAddressSeedForCountry === 'function'
            ? data.getAddressSeedForCountry(countryCode, { fallbackCountry: 'US' })
            : null));
      const effectiveCountryCode = resolveSupportedProfileCountryCode(
        typeof data.normalizeCountryCode === 'function'
          ? data.normalizeCountryCode(addressSeed?.countryCode || countryCode)
          : (addressSeed?.countryCode || countryCode)
      );
      const fallback = addressSeed?.fallback || {};
      const email = buildRandomPayPalEmail();
      const phone = resolveProfilePhone(currentState, effectiveCountryCode);
      const generatedPassword = effectiveCountryCode === 'BR' ? buildBrazilPassword() : buildPassword();
      const password = String(
        helpers?.getDraftCustomPassword?.()
        || currentState?.customPassword
        || generatedPassword
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
        birthday: buildBirthdayString(birthday, effectiveCountryCode === 'BR' ? 'br' : 'iso'),
        cpf: addressSeed?.cpf,
        cpfDigits: addressSeed?.cpfDigits,
        cnpj: addressSeed?.cnpj,
        cnpjDigits: addressSeed?.cnpjDigits,
        documentType: addressSeed?.documentType,
        documentNumber: addressSeed?.documentNumber,
        documentDigits: addressSeed?.documentDigits,
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
        ['CPF', 'cpf'],
        ['CNPJ', 'cnpj'],
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
      const hostedProfile = buildHostedProfileFromFlatProfile(normalizedProfile);
      const response = await runtime.sendMessage({
        type: 'SAVE_SETTING',
        source: 'sidepanel',
        payload: {
          paypalGeneratedProfile: normalizedProfile,
          plusHostedCheckoutGuestProfile: hostedProfile,
          hostedCheckoutGuestProfile: hostedProfile,
        },
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      state.syncLatestState({
        paypalGeneratedProfile: normalizedProfile,
        plusHostedCheckoutGuestProfile: hostedProfile,
        hostedCheckoutGuestProfile: hostedProfile,
      });
      renderProfile(normalizedProfile);
      return normalizedProfile;
    }

    async function resolveProfileRegionForGeneration(currentState = getLatestState()) {
      const preferredCountryCode = resolvePayPalProfileCountryPreference(currentState);
      if (preferredCountryCode) {
        return {
          countryCode: preferredCountryCode,
          preferenceApplied: true,
        };
      }
      const localCountryCode = resolveProfileCountryCode(currentState);
      if (typeof runtime?.sendMessage !== 'function') {
        return { countryCode: localCountryCode };
      }
      try {
        const response = await runtime.sendMessage({
          type: 'RESOLVE_PLUS_CHECKOUT_PROFILE_REGION',
          source: 'sidepanel',
          payload: {},
        });
        if (response?.error) {
          throw new Error(response.error);
        }
        return {
          ...(response && typeof response === 'object' ? response : {}),
          countryCode: resolveSupportedProfileCountryCode(response?.countryCode || localCountryCode),
        };
      } catch (error) {
        helpers?.showToast?.(
          `支付出口地区解析失败，已使用 ${localCountryCode} 生成资料：${error?.message || String(error || '')}`,
          'warn',
          2600
        );
        return { countryCode: localCountryCode, error: error?.message || String(error || '') };
      }
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
        cpf: 'CPF',
        cnpj: 'CNPJ',
        documentNumber: 'Document',
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
        const currentState = getLatestState();
        const profileRegion = await resolveProfileRegionForGeneration(currentState);
        const countryCode = resolveSupportedProfileCountryCode(
          profileRegion?.countryCode || resolveProfileCountryCode(currentState)
        );
        const addressSeed = await resolveProfileAddressSeed(countryCode);
        const profile = generateProfile(currentState, {
          profileRegion,
          addressSeed,
          countryCode: profileRegion?.preferenceApplied ? countryCode : undefined,
        });
        await persistProfile(profile);
        helpers.showToast('已生成 PayPal 注册资料', 'success', 1800);
      } finally {
        actionInFlight = false;
        renderProfile(getCurrentProfile());
      }
    }

    function bindPayPalProfileEvents() {
      dom.btnGenerateProfile?.addEventListener('click', () => handleGenerateProfile().catch((error) => {
          renderProfile(getCurrentProfile());
          helpers.showToast(error?.message || '生成 PayPal 资料失败。', 'error');
        }));
      dom.btnCopyProfile?.addEventListener('click', () => handleCopyProfile().catch((error) => {
          helpers.showToast(error?.message || '复制 PayPal 资料失败。', 'error');
        }));
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
      resolveProfileAddressSeed,
      resolveProfileCountryCode,
      resolveProfileRegionForGeneration,
      resolvePayPalProfileCountryPreference,
      syncCollapseState,
      toggleProfileDetails,
    };
  }

  globalScope.SidepanelPayPalProfileGenerator = {
    createPayPalProfileGenerator,
  };
})(typeof window !== 'undefined' ? window : globalThis);
