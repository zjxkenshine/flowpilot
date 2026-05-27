const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sidepanel/paypal-profile-generator.js', 'utf8');

function loadApi() {
  const windowObject = {};
  return new Function('window', `${source}; return window.SidepanelPayPalProfileGenerator;`)(windowObject);
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
        return { ok: true };
      },
    },
    data: {
      generateRandomBirthday: overrides.generateRandomBirthday || (() => ({ year: 2001, month: 2, day: 3 })),
      generateRandomName: overrides.generateRandomName || (() => ({ firstName: 'Ada', lastName: 'Lovelace' })),
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
        return ['DE', 'JP', 'KR', 'US'].includes(normalized) ? normalized : '';
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
  assert.equal(profile.firstName, 'Ada');
  assert.equal(profile.lastName, 'Lovelace');
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
      ipProxyAppliedExitRegion: 'DE',
    },
    getDraftEmail: () => 'user@example.com',
    getDraftHostedCheckoutPhone: () => '+4915123456789',
  });
  generator.bindPayPalProfileEvents();

  await btnGenerateProfile.click();
  const saveMessage = events.find((event) => event.type === 'message')?.message;

  assert.equal(saveMessage.type, 'SAVE_SETTING');
  assert.equal(saveMessage.payload.paypalGeneratedProfile.email, 'user@example.com');
  assert.equal(getLatestState().paypalGeneratedProfile.password, 'CustomSecret123!');
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardNumber, /^4147\d{12}$/);
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardExpiry, /^(0[1-9]|1[0-2]) \/ \d{2}$/);
  assert.match(saveMessage.payload.paypalGeneratedProfile.cardCvv, /^\d{3}$/);
  assert.equal(saveMessage.payload.paypalGeneratedProfile.fullAddress, 'Marunouchi 1-1 Chiyoda-ku Tokyo 100-0005 DE');

  await btnCopyProfile.click();
  const copied = events.filter((event) => event.type === 'copy').at(-1)?.text;

  assert.match(copied, /^邮箱：user@example\.com\n电话：\+4915123456789\n卡号：4147\d{12}\n有效期：(0[1-9]|1[0-2]) \/ \d{2}\nCVV：\d{3}\n密码：CustomSecret123!\n名字：Ada\n姓氏：Lovelace\n生日：2001-02-03\n国家：DE\n地址：Marunouchi 1-1\n城市：Chiyoda-ku\n州省：Tokyo\n邮编：100-0005$/);
  assert.equal(copied.includes('整段地址'), false);
});

test('PayPal profile generator reports toast error when copying empty profile', async () => {
  const { btnCopyProfile, events, generator } = createGenerator();
  generator.bindPayPalProfileEvents();

  await btnCopyProfile.click();

  const toast = events.find((event) => event.type === 'toast');
  assert.equal(toast.message, '没有可复制的内容。');
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
    generatedFromCountry: '',
    generatedAt: 123,
  });
});
