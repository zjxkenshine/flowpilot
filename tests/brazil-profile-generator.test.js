const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('shared/brazil-profile-generator.js', 'utf8');

function loadApi() {
  const root = {};
  return new Function('self', `${source}; return self.MultiPageBrazilProfileGenerator;`)(root);
}

test('Brazil profile generator creates valid formatted CPF and CNPJ numbers', () => {
  const api = loadApi();

  for (let index = 0; index < 20; index += 1) {
    const cpf = api.generateCpf();
    const cnpj = api.generateCnpj();
    assert.match(cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    assert.match(cnpj, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
    assert.equal(api.validateCpf(cpf), true);
    assert.equal(api.validateCnpj(cnpj), true);
    assert.equal(/^(\d)\1+$/.test(api.onlyDigits(cpf)), false);
    assert.equal(/^(\d)\1+$/.test(api.onlyDigits(cnpj)), false);
  }
});

test('Brazil profile generator validates known CPF and CNPJ fixtures', () => {
  const api = loadApi();

  assert.equal(api.validateCpf('529.982.247-25'), true);
  assert.equal(api.validateCpf('111.111.111-11'), false);
  assert.equal(api.validateCnpj('04.252.011/0001-10'), true);
  assert.equal(api.validateCnpj('11.111.111/1111-11'), false);
  assert.equal(api.formatCpf('52998224725'), '529.982.247-25');
  assert.equal(api.formatCnpj('04252011000110'), '04.252.011/0001-10');
});

test('local Brazil profile includes address, phone, CPF, CNPJ, and adapters', () => {
  const api = loadApi();
  const profile = api.generateLocalBrazilProfile({
    address: {
      address1: 'Rua Haddock Lobo 1307',
      neighborhood: 'Jardins',
      city: 'Sao Paulo',
      state: 'Sao Paulo',
      stateCode: 'SP',
      postalCode: '01414-003',
      areaCodes: ['11'],
    },
    firstName: 'Ana',
    lastName: 'Silva',
    phone: '+55 11 98765-4321',
  });

  assert.equal(profile.countryCode, 'BR');
  assert.equal(profile.fullName, 'Ana Silva');
  assert.equal(profile.phone, '+5511987654321');
  assert.equal(profile.address1, 'Rua Haddock Lobo 1307');
  assert.equal(profile.neighborhood, 'Jardins');
  assert.equal(profile.postalCode, '01414-003');
  assert.equal(profile.documentType, 'cpf');
  assert.equal(profile.documentNumber, profile.cpf);
  assert.equal(api.validateCpf(profile.cpf), true);
  assert.equal(api.validateCnpj(profile.cnpj), true);

  const seed = api.toClassicAddressSeed(profile);
  assert.equal(seed.countryCode, 'BR');
  assert.equal(seed.skipAutocomplete, true);
  assert.equal(seed.documentNumber, profile.cpf);
  assert.equal(seed.fallback.address1, 'Rua Haddock Lobo 1307');

  const hostedAddress = api.toHostedCheckoutAddress(profile);
  assert.equal(hostedAddress.countryCode, 'BR');
  assert.equal(hostedAddress.street, 'Rua Haddock Lobo 1307');
  assert.equal(hostedAddress.documentNumber, profile.cpf);
});

test('public CEP lookup can enrich local Brazil profile through BrasilAPI', async () => {
  const api = loadApi();
  const calls = [];
  const profile = await api.resolveBrazilProfile({
    allowPublicLookup: true,
    cep: '01001000',
    firstName: 'Joao',
    lastName: 'Santos',
    fetchImpl: async (url) => {
      calls.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          cep: '01001000',
          state: 'SP',
          city: 'Sao Paulo',
          neighborhood: 'Se',
          street: 'Praca da Se',
        }),
      };
    },
  });

  assert.equal(calls[0], 'https://brasilapi.com.br/api/cep/v2/01001000');
  assert.equal(profile.source, 'brasilapi');
  assert.equal(profile.address1, 'Praca da Se');
  assert.equal(profile.city, 'Sao Paulo');
  assert.equal(profile.stateCode, 'SP');
  assert.equal(profile.postalCode, '01001-000');
  assert.equal(api.validateCpf(profile.cpf), true);
});

test('public CEP lookup falls back to ViaCEP and then local profile on failure', async () => {
  const api = loadApi();
  const calls = [];
  const viaCepProfile = await api.resolveBrazilProfile({
    allowPublicLookup: true,
    cep: '01001000',
    fetchImpl: async (url) => {
      calls.push(url);
      if (url.includes('brasilapi')) {
        return { ok: false, status: 503, json: async () => ({}) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          cep: '01001-000',
          logradouro: 'Praca da Se',
          bairro: 'Se',
          localidade: 'Sao Paulo',
          uf: 'SP',
          estado: 'Sao Paulo',
        }),
      };
    },
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[1], 'https://viacep.com.br/ws/01001000/json/');
  assert.equal(viaCepProfile.source, 'viacep');
  assert.equal(viaCepProfile.address1, 'Praca da Se');

  const failedProfile = await api.resolveBrazilProfile({
    allowPublicLookup: true,
    cep: '01001000',
    fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({}) }),
  });

  assert.equal(failedProfile.countryCode, 'BR');
  assert.match(failedProfile.publicLookupError, /brasilapi/);
  assert.match(failedProfile.publicLookupError, /viacep/);
  assert.equal(api.validateCpf(failedProfile.cpf), true);
});
