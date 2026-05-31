const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const brazilSource = fs.readFileSync('shared/brazil-profile-generator.js', 'utf8');
const source = fs.readFileSync('sidepanel/paypal-profile-generator.js', 'utf8');

function loadApi() {
  const windowObject = {};
  return new Function('window', 'self', `${brazilSource}; ${source}; return window.SidepanelPayPalProfileGenerator;`)(windowObject, windowObject);
}

function createButton() {
  const handlers = {};
  return {
    attributes: {},
    disabled: false,
    textContent: '',
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    async click() {
      await handlers.click?.();
    },
  };
}

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    contains(name) {
      return values.has(name);
    },
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) {
        values.add(name);
      } else {
        values.delete(name);
      }
      return enabled;
    },
  };
}

function createProfileDetails() {
  return {
    hidden: false,
    innerHTML: '',
    querySelectorAll() {
      return [];
    },
  };
}

function createGenerator(overrides = {}) {
  const api = loadApi();
  let latestState = {
    email: '',
    hostedCheckoutPhoneNumber: '',
    customPassword: '',
    paypalGeneratedProfile: null,
    ...overrides.initialState,
  };
  const events = [];
  const btnGenerateProfile = createButton();
  const btnCopyProfile = createButton();
  const btnToggleProfile = createButton();
  const profileShell = {
    classList: createClassList(overrides.initialCollapsed === false ? [] : ['is-collapsed']),
  };
  const profileSummary = { textContent: '' };
  const profileDetails = createProfileDetails();
  const generator = api.createPayPalProfileGenerator({
    state: {
      getLatestState: () => latestState,
      syncLatestState(updates) {
        latestState = { ...latestState, ...updates };
      },
    },
    dom: {
      profileShell,
      btnGenerateProfile,
      btnCopyProfile,
      btnToggleProfile,
      profileSummary,
      profileDetails,
    },
    helpers: {
      copyTextToClipboard: async (text) => {
        events.push({ type: 'copy', text });
      },
      escapeHtml: (value) => String(value || ''),
      getCurrentPayPalAccount: overrides.getCurrentPayPalAccount || (() => null),
      getDraftCustomPassword: overrides.getDraftCustomPassword || (() => ''),
      getDraftEmail: overrides.getDraftEmail || (() => ''),
      getDraftHostedCheckoutPhone: overrides.getDraftHostedCheckoutPhone || (() => ''),
      showToast(message, tone) {
        events.push({ type: 'toast', message, tone });
      },
    },
    runtime: {
      sendMessage: async (message) => {
        events.push({ type: 'message', message });
        if (typeof overrides.sendMessage === 'function') {
          return await overrides.sendMessage(message, events);
        }
        return { ok: true };
      },
    },
    data: {
      generateRandomBirthday: overrides.generateRandomBirthday || (() => ({ year: 2001, month: 2, day: 3 })),
      generateRandomName: overrides.generateRandomName || (() => ({ firstName: 'Ada', lastName: 'Lovelace' })),
      fetchImpl: overrides.fetchImpl,
      getAddressSeedForCountry: overrides.getAddressSeedForCountry || ((countryCode) => ({
        countryCode,
        fallback: {
          address1: 'Marunouchi 1-1',
          city: 'Chiyoda-ku',
          region: 'Tokyo',
          postalCode: '100-0005',
        },
      })),
      normalizeCountryCode: overrides.normalizeCountryCode || ((value) => {
        const normalized = String(value || '').trim().toUpperCase();
        return ['BR', 'DE', 'JP', 'KR', 'US'].includes(normalized) ? normalized : '';
      }),
    },
  });

  return {
    btnCopyProfile,
    btnGenerateProfile,
    btnToggleProfile,
    events,
    generator,
    getLatestState: () => latestState,
    profileShell,
    profileDetails,
    profileSummary,
  };
}

function assertLuhn(number) {
  const digits = String(number || '').split('').map((digit) => Number(digit));
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits[index];
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  assert.equal(sum % 10, 0);
}

test('PayPal profile generator binds current email, phone, proxy country, and local address seed', () => {
  const { generator } = createGenerator({
    initialState: {
      email: 'state@example.com',
      hostedCheckoutPhoneNumber: '+818012345678',
      customPassword: '',
      paypalProfileCountryCode: '',
      plusCheckoutConversionProxyManualSession: {
        exitRegion: 'jp',
      },
    },
    getDraftEmail: () => 'draft@example.com',
    getDraftHostedCheckoutPhone: () => '+819012345678',
  });

  const profile = generator.generateProfile();

  assert.equal(profile.email, 'draft@example.com');
  assert.equal(profile.phone, '+819012345678');
  assert.match(profile.cardNumber, /^4147\d{12}$/);
  assertLuhn(profile.cardNumber);
  assert.match(profile.cardExpiry, /^(0[1-9]|1[0-2]) \/ \d{2}$/);
  assert.match(profile.cardCvv, /^\d{3}$/);
  assert.equal(profile.password.length >= 14, true);
  assert.ok(profile.firstName);
  assert.ok(profile.lastName);
  assert.equal(profile.birthday, '2001-02-03');
  assert.equal(profile.countryCode, 'JP');
  assert.equal(profile.generatedFromCountry, 'JP');
  assert.equal(profile.address1, 'Marunouchi 1-1');
  assert.equal(profile.city, 'Chiyoda-ku');
  assert.equal(profile.region, 'Tokyo');
  assert.equal(profile.postalCode, '100-0005');
  assert.equal(profile.fullAddress, 'Marunouchi 1-1 Chiyoda-ku Tokyo 100-0005 JP');
  assert.equal(profile.generatedAt > 0, true);
});

test('PayPal profile generator defaults country preference to US over IP exit country', async () => {
  const { btnGenerateProfile, generator, getLatestState } = createGenerator({
    initialState: {
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'JP',
      },
      paypalProfileCountryCode: 'US',
      hostedCheckoutPhoneNumber: '+819012345678',
      email: 'default-us@example.com',
    },
    getAddressSeedForCountry: (countryCode) => ({
      countryCode,
      fallback: countryCode === 'US'
        ? {
          address1: '350 Fifth Avenue',
          city: 'New York',
          region: 'NY',
          postalCode: '10118',
        }
        : {
          address1: 'Marunouchi 1-1',
          city: 'Chiyoda-ku',
          region: 'Tokyo',
          postalCode: '100-0005',
        },
    }),
  });

  generator.bindPayPalProfileEvents();
  await btnGenerateProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  assert.equal(profile.countryCode, 'US');
  assert.equal(profile.generatedFromCountry, 'US');
  assert.equal(profile.city, 'New York');
  assert.equal(profile.fullAddress, '350 Fifth Avenue New York NY 10118 US');
});

test('PayPal profile generator empty country preference follows IP exit country', async () => {
  const { btnGenerateProfile, generator, getLatestState } = createGenerator({
    initialState: {
      paypalProfileCountryCode: '',
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'JP',
      },
      hostedCheckoutPhoneNumber: '+819012345678',
      email: 'ip-exit@example.com',
    },
  });

  generator.bindPayPalProfileEvents();
  await btnGenerateProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  assert.equal(profile.countryCode, 'JP');
  assert.equal(profile.generatedFromCountry, 'JP');
  assert.equal(profile.city, 'Chiyoda-ku');
});

test('PayPal profile generator explicit BR country preference uses Brazil profile data', async () => {
  const { btnGenerateProfile, generator, getLatestState } = createGenerator({
    initialState: {
      paypalProfileCountryCode: 'BR',
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'US',
      },
      hostedCheckoutPhoneNumber: '+5511987654321',
      email: 'br-pref@example.com',
    },
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        cep: '01414-003',
        state: 'SP',
        city: 'Sao Paulo',
        neighborhood: 'Jardins',
        street: 'Rua Haddock Lobo 1307',
      }),
    }),
  });

  generator.bindPayPalProfileEvents();
  await btnGenerateProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.generatedFromCountry, 'BR');
  assert.equal(profile.phone, '+5511987654321');
  assert.equal(profile.address1, 'Rua Haddock Lobo 1307');
  assert.equal(profile.fullAddress, 'Rua Haddock Lobo 1307 Sao Paulo SP 01414-003 BR');
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(profile.cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  assert.equal(profile.documentType, 'cpf');
  assert.equal(profile.documentNumber, profile.cpf);
});

test('PayPal profile generator falls back to selected PayPal account email and US address for unsupported country', () => {
  const { generator } = createGenerator({
    initialState: {
      ipProxyAppliedExitRegion: 'GB London',
    },
    getCurrentPayPalAccount: () => ({ email: 'paypal@example.com' }),
    getAddressSeedForCountry: (countryCode) => ({
      countryCode: countryCode === 'GB' ? 'US' : countryCode,
      fallback: {
        address1: '350 Fifth Avenue',
        city: 'New York',
        region: 'NY',
        postalCode: '10118',
      },
    }),
    normalizeCountryCode: (value) => {
      const normalized = String(value || '').trim().toUpperCase();
      return normalized === 'US' ? 'US' : '';
    },
  });

  const profile = generator.generateProfile();

  assert.equal(profile.email, 'paypal@example.com');
  assert.equal(profile.phone, '');
  assert.equal(profile.countryCode, 'US');
  assert.equal(profile.generatedFromCountry, 'US');
  assert.equal(profile.city, 'New York');
  assert.equal(profile.fullAddress, '350 Fifth Avenue New York NY 10118 US');
});

test('PayPal profile generator supports Brazil exit profiles and keeps existing email and phone sources', () => {
  const { generator } = createGenerator({
    initialState: {
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'Brazil [BR]',
      },
      email: 'state@example.com',
      hostedCheckoutPhoneNumber: '5511999998888',
    },
    getAddressSeedForCountry: (countryCode) => ({
      countryCode,
      fallback: {
        address1: 'Avenida Paulista 1000',
        city: 'Sao Paulo',
        region: 'Sao Paulo',
        postalCode: '01310-100',
      },
    }),
  });

  const profile = generator.generateProfile();

  assert.equal(profile.email, 'state@example.com');
  assert.equal(profile.phone, '+5511999998888');
  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.generatedFromCountry, 'BR');
  assert.notEqual(profile.address1, 'Avenida Paulista 1000');
  assert.ok(profile.city);
  assert.match(profile.postalCode, /^\d{5}-\d{3}$/);
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(profile.cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  assert.match(profile.fullAddress, / BR$/);
  assert.ok(profile.firstName);
  assert.ok(profile.lastName);
});

test('PayPal profile generator fetches a real Brazil address and requires a +55 phone', async () => {
  const fetchCalls = [];
  const { btnGenerateProfile, events, generator, getLatestState } = createGenerator({
    initialState: {
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'Brazil [BR]',
      },
      hostedCheckoutCurrentSmsEntry: {
        key: '5511987654321----http://pool.test/api/sms',
        phone: '+55 11 98765-4321',
        verificationUrl: 'http://pool.test/api/sms',
      },
      email: 'br@example.com',
    },
    fetchImpl: async (url, init) => {
      fetchCalls.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          cep: '01414-003',
          state: 'SP',
          city: 'Sao Paulo',
          neighborhood: 'Jardins',
          street: 'Rua Haddock Lobo 1307',
        }),
      };
    },
  });

  generator.bindPayPalProfileEvents();
  await btnGenerateProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.generatedFromCountry, 'BR');
  assert.equal(profile.phone, '+5511987654321');
  assert.equal(profile.address1, 'Rua Haddock Lobo 1307');
  assert.equal(profile.city, 'Sao Paulo');
  assert.equal(profile.postalCode, '01414-003');
  assert.equal(profile.fullAddress, 'Rua Haddock Lobo 1307 Sao Paulo SP 01414-003 BR');
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(profile.cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  assert.match(fetchCalls[0].url, /^https:\/\/brasilapi\.com\.br\/api\/cep\/v2\/\d{8}$/);
  assert.equal(fetchCalls[0].init.method, 'GET');
  assert.equal(events.some((event) => event.type === 'message' && event.message.type === 'SAVE_SETTING'), true);
});

test('PayPal profile generator keeps Brazil phone empty when no +55 phone is available', () => {
  const { generator } = createGenerator({
    initialState: {
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'Brazil [BR]',
      },
      hostedCheckoutPhoneNumber: '4155551234',
    },
  });

  const profile = generator.generateProfile();

  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.generatedFromCountry, 'BR');
  assert.equal(profile.phone, '');
  assert.ok(profile.firstName);
  assert.ok(profile.lastName);
  assert.match(profile.cardNumber, /^4147\d{12}$/);
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.equal(profile.generatedAt > 0, true);
});

test('PayPal profile generator generates other fields when email and phone are missing', () => {
  const { generator } = createGenerator({
    initialState: {
      email: '',
      hostedCheckoutPhoneNumber: '',
      customPassword: '',
      paypalProfileCountryCode: 'US',
    },
    getDraftEmail: () => '',
    getDraftHostedCheckoutPhone: () => '',
    getCurrentPayPalAccount: () => null,
    getAddressSeedForCountry: (countryCode) => ({
      countryCode,
      fallback: {
        address1: '350 Fifth Avenue',
        city: 'New York',
        region: 'NY',
        postalCode: '10118',
      },
    }),
  });

  const profile = generator.generateProfile();

  assert.equal(profile.email, '');
  assert.equal(profile.phone, '');
  assert.match(profile.cardNumber, /^4147\d{12}$/);
  assertLuhn(profile.cardNumber);
  assert.match(profile.cardExpiry, /^(0[1-9]|1[0-2]) \/ \d{2}$/);
  assert.match(profile.cardCvv, /^\d{3}$/);
  assert.equal(profile.password.length >= 14, true);
  assert.ok(profile.firstName);
  assert.ok(profile.lastName);
  assert.equal(profile.birthday, '2001-02-03');
  assert.equal(profile.countryCode, 'US');
  assert.equal(profile.address1, '350 Fifth Avenue');
  assert.equal(profile.city, 'New York');
  assert.equal(profile.region, 'NY');
  assert.equal(profile.postalCode, '10118');
  assert.equal(profile.fullAddress, '350 Fifth Avenue New York NY 10118 US');
  assert.equal(profile.generatedAt > 0, true);
});

test('PayPal profile generator falls back to a built-in real Brazil address when remote address fails', async () => {
  const { btnGenerateProfile, events, generator, getLatestState } = createGenerator({
    initialState: {
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'Brazil [BR]',
      },
      hostedCheckoutPhoneNumber: '+5511987654321',
      email: 'br-fallback@example.com',
    },
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    }),
  });

  generator.bindPayPalProfileEvents();
  await btnGenerateProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.phone, '+5511987654321');
  assert.notEqual(profile.address1, 'Avenida Paulista 1000');
  assert.match(profile.postalCode, /^\d{5}-\d{3}$/);
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(profile.cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  assert.equal(events.some((event) => event.type === 'toast' && /Brazil CEP lookup unavailable/.test(event.message)), true);
});

test('PayPal profile generator defaults to a local US address seed without proxy country', () => {
  const requestedSeeds = [];
  const { generator } = createGenerator({
    getAddressSeedForCountry: (countryCode, options) => {
      requestedSeeds.push({ countryCode, options });
      return {
        countryCode,
        fallback: {
          address1: '3450 Broadway',
          city: 'New York',
          region: 'New York',
          postalCode: '10031',
        },
      };
    },
  });

  const profile = generator.generateProfile();

  assert.deepEqual(requestedSeeds, [{ countryCode: 'US', options: { fallbackCountry: 'US' } }]);
  assert.equal(profile.countryCode, 'US');
  assert.equal(profile.generatedFromCountry, 'US');
  assert.equal(profile.address1, '3450 Broadway');
  assert.equal(profile.city, 'New York');
  assert.equal(profile.fullAddress, '3450 Broadway New York New York 10031 US');
});

test('PayPal profile generator persists generated profile and copies full profile in fixed order', async () => {
  const { btnCopyProfile, btnGenerateProfile, events, generator, getLatestState } = createGenerator({
    initialState: {
      customPassword: 'CustomSecret123!',
      plusCheckoutConversionProxyExitCheck: {
        exitRegion: 'JP',
      },
    },
    getDraftEmail: () => 'user@example.com',
    getDraftHostedCheckoutPhone: () => '+4915123456789',
    getAddressSeedForCountry: (countryCode) => ({
      countryCode,
      fallback: {
        address1: 'Marunouchi 1-1',
        city: 'Chiyoda-ku',
        region: 'Tokyo',
        postalCode: '100-0005',
      },
    }),
  });
  generator.bindPayPalProfileEvents();

  await btnGenerateProfile.click();
  const saveMessage = events.filter((event) => event.type === 'message').find((event) => event.message.type === 'SAVE_SETTING')?.message;

  assert.equal(saveMessage.type, 'SAVE_SETTING');
  assert.equal(saveMessage.payload.paypalGeneratedProfile.email, 'user@example.com');
  assert.equal(saveMessage.payload.plusHostedCheckoutGuestProfile.email, 'user@example.com');
  assert.equal(saveMessage.payload.plusHostedCheckoutGuestProfile.address.street, 'Marunouchi 1-1');
  assert.equal(saveMessage.payload.plusHostedCheckoutGuestProfile.address.zip, '100-0005');
  assert.equal(saveMessage.payload.hostedCheckoutGuestProfile.address.street, 'Marunouchi 1-1');
  assert.equal(getLatestState().paypalGeneratedProfile.password, 'CustomSecret123!');
  assert.equal(getLatestState().plusHostedCheckoutGuestProfile.address.city, 'Chiyoda-ku');
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardNumber, /^4147\d{12}$/);
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardExpiry, /^(0[1-9]|1[0-2]) \/ \d{2}$/);
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardCvv, /^\d{3}$/);
  assert.equal(saveMessage.payload.paypalGeneratedProfile.fullAddress, 'Marunouchi 1-1 Chiyoda-ku Tokyo 100-0005 JP');

  await btnCopyProfile.click();
  const copied = events.filter((event) => event.type === 'copy').at(-1)?.text;

  assert.match(copied, /user@example\.com/);
  assert.match(copied, /\+4915123456789/);
  assert.match(copied, /4147\d{12}/);
  assert.match(copied, /CustomSecret123!/);
  assert.match(copied, /JP/);
  assert.match(copied, /Marunouchi 1-1/);
  assert.equal(copied.includes('鏁存鍦板潃'), false);
});

test('PayPal profile generator copies Brazil CPF and CNPJ fields', async () => {
  const { btnCopyProfile, btnGenerateProfile, events, generator, getLatestState } = createGenerator({
    initialState: {
      paypalProfileCountryCode: 'BR',
      hostedCheckoutPhoneNumber: '+5511987654321',
      email: 'copy-br@example.com',
    },
  });
  generator.bindPayPalProfileEvents();

  await btnGenerateProfile.click();
  await btnCopyProfile.click();

  const profile = getLatestState().paypalGeneratedProfile;
  const copied = events.filter((event) => event.type === 'copy').at(-1)?.text || '';
  assert.match(profile.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  assert.match(profile.cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  assert.match(copied, new RegExp(profile.cpf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(copied, new RegExp(profile.cnpj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('PayPal profile generator displays hosted checkout profile before persisted profile', () => {
  const { generator, profileDetails, profileSummary } = createGenerator({
    initialState: {
      paypalGeneratedProfile: {
        email: 'persisted@example.com',
        address1: 'Old Address',
        city: 'Old City',
        region: 'Old Region',
        postalCode: '00000',
        countryCode: 'US',
        generatedAt: 111,
      },
      plusHostedCheckoutGuestProfile: {
        email: 'runtime@example.com',
        phone: '4155551234',
        firstName: 'James',
        lastName: 'Smith',
        cardNumber: '4147200000000000',
        cardExpiry: '12 / 29',
        cardCvv: '123',
        password: 'Aa1!runtime',
        generatedAt: 222,
        address: {
          street: '8 Retry Ave',
          city: 'Austin',
          state: 'Texas',
          zip: '73301',
          countryCode: 'US',
        },
      },
    },
    initialCollapsed: false,
  });

  const profile = generator.getCurrentProfile();
  generator.renderPayPalProfile();

  assert.equal(profile.email, 'runtime@example.com');
  assert.equal(profile.address1, '8 Retry Ave');
  assert.equal(profile.city, 'Austin');
  assert.equal(profile.region, 'Texas');
  assert.equal(profile.postalCode, '73301');
  assert.equal(profile.fullAddress, '8 Retry Ave Austin Texas 73301 US');
  assert.notEqual(profileSummary.textContent, '');
  assert.match(profileSummary.textContent, /\d{4}|\d{1,2}\//);
  assert.match(profileDetails.innerHTML, /runtime@example\.com/);
  assert.match(profileDetails.innerHTML, /8 Retry Ave/);
  assert.doesNotMatch(profileDetails.innerHTML, /Old Address/);
});

test('PayPal profile generator reports toast error when copying empty profile', async () => {
  const { btnCopyProfile, events, generator } = createGenerator();
  generator.bindPayPalProfileEvents();

  await btnCopyProfile.click();

  const toast = events.find((event) => event.type === 'toast');
  assert.equal(typeof toast.message, 'string');
  assert.notEqual(toast.message.length, 0);
  assert.equal(toast.tone, 'error');
  assert.equal(events.some((event) => event.type === 'copy'), false);
});

test('PayPal profile generator keeps profile details collapsed by default and toggles visibility', () => {
  const { btnToggleProfile, generator, profileDetails, profileShell } = createGenerator();
  generator.bindPayPalProfileEvents();
  generator.renderPayPalProfile();

  assert.equal(profileShell.classList.contains('is-collapsed'), true);
  assert.equal(profileDetails.hidden, true);
  assert.equal(btnToggleProfile.textContent, '展开');
  assert.equal(btnToggleProfile.getAttribute('aria-expanded'), 'false');

  btnToggleProfile.click();

  assert.equal(profileShell.classList.contains('is-collapsed'), false);
  assert.equal(profileDetails.hidden, false);
  assert.equal(btnToggleProfile.textContent, '收起');
  assert.equal(btnToggleProfile.getAttribute('aria-expanded'), 'true');

  btnToggleProfile.click();

  assert.equal(profileShell.classList.contains('is-collapsed'), true);
  assert.equal(profileDetails.hidden, true);
  assert.equal(btnToggleProfile.textContent, '展开');
  assert.equal(btnToggleProfile.getAttribute('aria-expanded'), 'false');
});

test('PayPal profile generator normalizes persisted profile shape', () => {
  const { generator } = createGenerator();

  assert.deepEqual(generator.normalizeProfile({
    email: ' user@example.com ',
    phone: ' +1 555 ',
    countryCode: ' jp ',
    generatedFromCountry: 'United States',
    generatedAt: '123',
  }), {
    email: 'user@example.com',
    phone: '+1 555',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    password: '',
    firstName: '',
    lastName: '',
    birthday: '',
    countryCode: 'JP',
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
    generatedAt: 123,
  });
});
