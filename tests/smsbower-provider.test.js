const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('phone-sms/providers/smsbower.js', 'utf8');
const api = new Function('self', `${source}; return self.PhoneSmsBowerProvider;`)({});

test('SMSBower country fallback normalization keeps at most 10 countries', () => {
  const countries = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, label: `Country ${index + 1}` }));
  assert.deepStrictEqual(
    api.normalizeSmsBowerCountryFallback(countries).map((country) => country.id),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
});
