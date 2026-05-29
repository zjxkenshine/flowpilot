(function attachBrazilProfileGenerator(root, factory) {
  root.MultiPageBrazilProfileGenerator = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBrazilProfileGeneratorModule() {
  const BRASIL_API_CEP_ENDPOINT = 'https://brasilapi.com.br/api/cep/v2/';
  const VIACEP_ENDPOINT_PREFIX = 'https://viacep.com.br/ws/';

  const FIRST_NAMES = Object.freeze([
    'Lucas', 'Gabriel', 'Rafael', 'Pedro', 'Matheus', 'Mariana', 'Juliana',
    'Camila', 'Ana', 'Beatriz', 'Joao', 'Miguel', 'Helena', 'Alice',
  ]);
  const LAST_NAMES = Object.freeze([
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues',
    'Almeida', 'Nascimento', 'Lima', 'Ferreira', 'Gomes',
  ]);
  const EMAIL_DOMAINS = Object.freeze([
    'gmail.com', 'outlook.com', 'yahoo.com.br', 'bol.com.br', 'uol.com.br',
  ]);
  const ADDRESS_POOL = Object.freeze([
    Object.freeze({
      street: 'Avenida Paulista',
      address1: 'Avenida Paulista 1578',
      neighborhood: 'Bela Vista',
      city: 'Sao Paulo',
      state: 'Sao Paulo',
      stateCode: 'SP',
      postalCode: '01310-200',
      areaCodes: Object.freeze(['11']),
    }),
    Object.freeze({
      street: 'Rua Haddock Lobo',
      address1: 'Rua Haddock Lobo 1307',
      neighborhood: 'Jardins',
      city: 'Sao Paulo',
      state: 'Sao Paulo',
      stateCode: 'SP',
      postalCode: '01414-003',
      areaCodes: Object.freeze(['11']),
    }),
    Object.freeze({
      street: 'Praca da Se',
      address1: 'Praca da Se 1',
      neighborhood: 'Se',
      city: 'Sao Paulo',
      state: 'Sao Paulo',
      stateCode: 'SP',
      postalCode: '01001-000',
      areaCodes: Object.freeze(['11']),
    }),
    Object.freeze({
      street: 'Avenida Atlantica',
      address1: 'Avenida Atlantica 1702',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'Rio de Janeiro',
      stateCode: 'RJ',
      postalCode: '22021-001',
      areaCodes: Object.freeze(['21']),
    }),
    Object.freeze({
      street: 'Praca Maua',
      address1: 'Praca Maua 1',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'Rio de Janeiro',
      stateCode: 'RJ',
      postalCode: '20081-240',
      areaCodes: Object.freeze(['21']),
    }),
    Object.freeze({
      street: 'Avenida Afonso Pena',
      address1: 'Avenida Afonso Pena 1537',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'Minas Gerais',
      stateCode: 'MG',
      postalCode: '30130-004',
      areaCodes: Object.freeze(['31']),
    }),
  ]);

  function onlyDigits(value = '') {
    return String(value || '').replace(/\D/g, '');
  }

  function pick(list = [], random = Math.random) {
    const values = Array.isArray(list) ? list.filter(Boolean) : [];
    if (!values.length) return '';
    const index = Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * values.length);
    return values[index] || values[0];
  }

  function randomDigit(random = Math.random) {
    return Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * 10);
  }

  function randomDigits(length = 1, random = Math.random) {
    return Array.from({ length: Math.max(0, Math.floor(Number(length) || 0)) }, () => randomDigit(random)).join('');
  }

  function isRepeatedDigits(digits = '') {
    return /^(\d)\1+$/.test(String(digits || ''));
  }

  function calculateCpfCheckDigit(baseDigits = '') {
    const digits = onlyDigits(baseDigits);
    const factorStart = digits.length + 1;
    let sum = 0;
    for (let index = 0; index < digits.length; index += 1) {
      sum += Number(digits[index]) * (factorStart - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  function formatCpf(value = '') {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length !== 11) return digits;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function validateCpf(value = '') {
    const digits = onlyDigits(value);
    if (digits.length !== 11 || isRepeatedDigits(digits)) return false;
    const first = calculateCpfCheckDigit(digits.slice(0, 9));
    const second = calculateCpfCheckDigit(`${digits.slice(0, 9)}${first}`);
    return digits === `${digits.slice(0, 9)}${first}${second}`;
  }

  function generateCpf(options = {}) {
    const random = typeof options.random === 'function' ? options.random : Math.random;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const base = randomDigits(9, random);
      if (isRepeatedDigits(base)) continue;
      const first = calculateCpfCheckDigit(base);
      const second = calculateCpfCheckDigit(`${base}${first}`);
      const digits = `${base}${first}${second}`;
      if (validateCpf(digits)) return formatCpf(digits);
    }
    return '529.982.247-25';
  }

  function calculateCnpjCheckDigit(baseDigits = '') {
    const digits = onlyDigits(baseDigits);
    const weights = digits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = digits.split('').reduce((total, digit, index) => total + (Number(digit) * weights[index]), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  function formatCnpj(value = '') {
    const digits = onlyDigits(value).slice(0, 14);
    if (digits.length !== 14) return digits;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  function validateCnpj(value = '') {
    const digits = onlyDigits(value);
    if (digits.length !== 14 || isRepeatedDigits(digits)) return false;
    const first = calculateCnpjCheckDigit(digits.slice(0, 12));
    const second = calculateCnpjCheckDigit(`${digits.slice(0, 12)}${first}`);
    return digits === `${digits.slice(0, 12)}${first}${second}`;
  }

  function generateCnpj(options = {}) {
    const random = typeof options.random === 'function' ? options.random : Math.random;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const base = `${randomDigits(8, random)}0001`;
      if (isRepeatedDigits(base)) continue;
      const first = calculateCnpjCheckDigit(base);
      const second = calculateCnpjCheckDigit(`${base}${first}`);
      const digits = `${base}${first}${second}`;
      if (validateCnpj(digits)) return formatCnpj(digits);
    }
    return '04.252.011/0001-10';
  }

  function normalizeBrazilPostalCode(value = '', fallback = '') {
    const digits = onlyDigits(value).slice(0, 8) || onlyDigits(fallback).slice(0, 8);
    return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : '';
  }

  function removeAccents(value = '') {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function normalizeBrazilPhone(value = '') {
    const digits = onlyDigits(value);
    if (/^55\d{10,11}$/.test(digits)) return `+${digits}`;
    return '';
  }

  function buildPhone(address = {}, random = Math.random) {
    const areaCode = pick(address.areaCodes || ['11'], random) || '11';
    return `+55${areaCode}9${randomDigits(8, random)}`;
  }

  function buildFullAddress(parts = {}) {
    return [
      parts.address1,
      parts.neighborhood,
      parts.city,
      parts.stateCode || parts.state,
      parts.postalCode,
      'Brazil',
    ].map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  }

  function normalizeDocumentType(value = '') {
    return String(value || '').trim().toLowerCase() === 'cnpj' ? 'cnpj' : 'cpf';
  }

  function buildProfileFromAddress(address = {}, options = {}) {
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const firstName = String(options.firstName || pick(FIRST_NAMES, random) || 'Lucas').trim();
    const lastName = String(options.lastName || pick(LAST_NAMES, random) || 'Silva').trim();
    const cpf = formatCpf(options.cpf || generateCpf({ random }));
    const cnpj = formatCnpj(options.cnpj || generateCnpj({ random }));
    const documentType = normalizeDocumentType(options.documentType);
    const documentNumber = documentType === 'cnpj' ? cnpj : cpf;
    const address1 = String(address.address1 || `${address.street || 'Avenida Paulista'} ${Math.floor((Number(random()) || 0.5) * 9000) + 1}`).trim();
    const city = String(address.city || 'Sao Paulo').trim();
    const state = String(address.state || address.region || 'Sao Paulo').trim();
    const stateCode = String(address.stateCode || address.uf || 'SP').trim().toUpperCase();
    const postalCode = normalizeBrazilPostalCode(address.postalCode || address.zip || address.cep, '01310-200');
    const neighborhood = String(address.neighborhood || address.bairro || '').trim();
    const emailLocal = `${removeAccents(firstName).toLowerCase()}.${removeAccents(lastName).toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    return {
      countryCode: 'BR',
      country: 'Brazil',
      source: String(options.source || address.source || 'local_brazil_profile').trim(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phone: normalizeBrazilPhone(options.phone) || buildPhone(address, random),
      email: String(options.email || `${emailLocal}@${pick(EMAIL_DOMAINS, random) || 'gmail.com'}`).trim().toLowerCase(),
      street: address1,
      address1,
      neighborhood,
      city,
      state,
      stateCode,
      postalCode,
      zip: postalCode,
      fullAddress: buildFullAddress({ address1, neighborhood, city, stateCode, postalCode }),
      cpf,
      cpfDigits: onlyDigits(cpf),
      cnpj,
      cnpjDigits: onlyDigits(cnpj),
      documentType,
      documentNumber,
      documentDigits: onlyDigits(documentNumber),
      generatedFromCountry: 'BR',
      generatedAt: Math.max(0, Number(options.generatedAt) || Date.now()),
    };
  }

  function generateLocalBrazilProfile(options = {}) {
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const address = options.address && typeof options.address === 'object'
      ? options.address
      : pick(ADDRESS_POOL, random);
    return buildProfileFromAddress(address, {
      ...options,
      random,
      source: options.source || 'local_brazil_profile',
    });
  }

  function normalizeApiAddressPayload(payload = {}, fallbackProfile = {}) {
    const source = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    if (source.erro) return null;
    const street = source.street || source.logradouro || source.address1 || source.Address || source.Trans_Address;
    const city = source.city || source.localidade || source.City || fallbackProfile.city;
    const rawState = String(source.state || '').trim();
    const stateCode = source.uf || source.State || (/^[A-Za-z]{2}$/.test(rawState) ? rawState : '') || fallbackProfile.stateCode;
    const state = source.estado || source.State_Full || (/^[A-Za-z]{2}$/.test(rawState) ? rawState.toUpperCase() : rawState) || fallbackProfile.state || stateCode;
    const postalCode = normalizeBrazilPostalCode(source.cep || source.postalCode || source.Zip_Code, fallbackProfile.postalCode);
    if (!street || !city || !stateCode || !postalCode) return null;
    return {
      address1: String(street).trim(),
      street: String(street).trim(),
      neighborhood: String(source.neighborhood || source.bairro || fallbackProfile.neighborhood || '').trim(),
      city: String(city).trim(),
      state: String(state || stateCode).trim(),
      stateCode: String(stateCode).trim().toUpperCase(),
      postalCode,
    };
  }

  async function fetchJson(fetcher, url) {
    const response = await fetcher(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response?.ok) throw new Error(`HTTP ${response?.status || 0}`);
    return response.json();
  }

  async function resolveBrazilProfile(options = {}) {
    const localProfile = generateLocalBrazilProfile(options);
    const fetcher = typeof options.fetchImpl === 'function'
      ? options.fetchImpl
      : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    if (!options.allowPublicLookup || typeof fetcher !== 'function') {
      return localProfile;
    }
    const cepDigits = onlyDigits(options.cep || localProfile.postalCode);
    if (cepDigits.length !== 8) {
      return localProfile;
    }
    const errors = [];
    for (const source of ['brasilapi', 'viacep']) {
      try {
        const url = source === 'brasilapi'
          ? `${BRASIL_API_CEP_ENDPOINT}${cepDigits}`
          : `${VIACEP_ENDPOINT_PREFIX}${cepDigits}/json/`;
        const payload = await fetchJson(fetcher, url);
        const address = normalizeApiAddressPayload(payload, localProfile);
        if (address) {
          return buildProfileFromAddress(address, {
            ...localProfile,
            ...options,
            source,
            generatedAt: localProfile.generatedAt,
          });
        }
        errors.push(`${source}: incomplete address`);
      } catch (error) {
        errors.push(`${source}: ${error?.message || String(error || 'failed')}`);
      }
    }
    return {
      ...localProfile,
      publicLookupError: errors.join('; '),
    };
  }

  function toClassicAddressSeed(profile = {}) {
    const normalized = profile && typeof profile === 'object' && !Array.isArray(profile)
      ? profile
      : generateLocalBrazilProfile();
    const address1 = String(normalized.address1 || normalized.street || '').trim();
    const city = String(normalized.city || '').trim();
    const region = String(normalized.state || normalized.region || normalized.stateCode || '').trim();
    const postalCode = normalizeBrazilPostalCode(normalized.postalCode || normalized.zip, '01310-200');
    return {
      countryCode: 'BR',
      query: [address1, city].filter(Boolean).join(', '),
      source: String(normalized.source || 'local_brazil_profile').trim(),
      skipAutocomplete: true,
      autoCheckAgreement: true,
      documentType: normalizeDocumentType(normalized.documentType),
      documentNumber: String(normalized.documentNumber || normalized.cpf || '').trim(),
      documentDigits: onlyDigits(normalized.documentNumber || normalized.cpf),
      cpf: String(normalized.cpf || '').trim(),
      cpfDigits: onlyDigits(normalized.cpf),
      cnpj: String(normalized.cnpj || '').trim(),
      cnpjDigits: onlyDigits(normalized.cnpj),
      fallback: {
        address1,
        city,
        region,
        postalCode,
        neighborhood: String(normalized.neighborhood || '').trim(),
      },
    };
  }

  function toHostedCheckoutAddress(profile = {}) {
    const normalized = profile && typeof profile === 'object' && !Array.isArray(profile)
      ? profile
      : generateLocalBrazilProfile();
    return {
      street: String(normalized.address1 || normalized.street || '').trim(),
      address1: String(normalized.address1 || normalized.street || '').trim(),
      city: String(normalized.city || '').trim(),
      state: String(normalized.state || normalized.region || normalized.stateCode || '').trim(),
      region: String(normalized.state || normalized.region || normalized.stateCode || '').trim(),
      zip: normalizeBrazilPostalCode(normalized.postalCode || normalized.zip, '01310-200'),
      postalCode: normalizeBrazilPostalCode(normalized.postalCode || normalized.zip, '01310-200'),
      neighborhood: String(normalized.neighborhood || '').trim(),
      countryCode: 'BR',
      country: 'Brazil',
      documentType: normalizeDocumentType(normalized.documentType),
      documentNumber: String(normalized.documentNumber || normalized.cpf || '').trim(),
      documentDigits: onlyDigits(normalized.documentNumber || normalized.cpf),
      cpf: String(normalized.cpf || '').trim(),
      cpfDigits: onlyDigits(normalized.cpf),
      cnpj: String(normalized.cnpj || '').trim(),
      cnpjDigits: onlyDigits(normalized.cnpj),
      source: String(normalized.source || 'local_brazil_profile').trim(),
    };
  }

  return {
    ADDRESS_POOL,
    generateLocalBrazilProfile,
    resolveBrazilProfile,
    generateCpf,
    generateCnpj,
    validateCpf,
    validateCnpj,
    formatCpf,
    formatCnpj,
    onlyDigits,
    normalizeBrazilPostalCode,
    normalizeBrazilPhone,
    toClassicAddressSeed,
    toHostedCheckoutAddress,
  };
});
