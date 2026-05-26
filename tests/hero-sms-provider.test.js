const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('phone-sms/providers/hero-sms.js', 'utf8');
const api = new Function('self', `${source}; return self.PhoneSmsHeroSmsProvider;`)({});

test('HeroSMS country fallback normalization keeps at most 10 countries', () => {
  const countries = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, label: `Country ${index + 1}` }));
  assert.deepStrictEqual(
    api.normalizeHeroSmsCountryFallback(countries).map((country) => country.id),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
});

test('HeroSMS provider merges multi-endpoint tiers by price and keeps max visible stock', () => {
  const plan = api.planPriceTiers({
    fetchResults: {
      getPricesExtended: {
        payload: {
          52: {
            dr: {
              a: { cost: 0.05, count: 3, physicalCount: 3 },
              b: { cost: 0.08, count: 1, physicalCount: 1 },
            },
          },
        },
      },
      getPrices: {
        payload: {
          52: {
            dr: {
              c: { cost: 0.05, count: 8, physicalCount: 8 },
              d: { cost: 0.12, count: 5, physicalCount: 5 },
            },
          },
        },
      },
      getPricesVerification: {
        payload: {
          dr: {
            52: {
              price: 0.09,
              count: 4,
            },
          },
        },
      },
    },
    countryId: 52,
    serviceCode: 'dr',
    acquirePriority: 'price',
    tierUpgradeLimit: 3,
  });

  assert.deepStrictEqual(plan.dedupedVisiblePrices, [0.05, 0.08, 0.09, 0.12]);
  assert.deepStrictEqual(plan.visiblePricesBeforeSlice, [0.05, 0.08, 0.09, 0.12]);
  assert.deepStrictEqual(plan.finalCandidatePrices, [0.05, 0.08, 0.09, 0.12]);
  assert.equal(plan.mergedTiers.find((tier) => Number(tier.price) === 0.05)?.stockCount, 8);
});

test('HeroSMS provider reports single-tier reason after price-range filtering', () => {
  const plan = api.planPriceTiers({
    fetchResults: {
      getPrices: {
        payload: {
          52: {
            dr: {
              low: { cost: 0.05, count: 9, physicalCount: 9 },
              mid: { cost: 0.08, count: 9, physicalCount: 9 },
              high: { cost: 0.12, count: 9, physicalCount: 9 },
            },
          },
        },
      },
    },
    countryId: 52,
    serviceCode: 'dr',
    minPriceLimit: 0.08,
    maxPriceLimit: 0.08,
    acquirePriority: 'price',
    tierUpgradeLimit: 3,
  });

  assert.deepStrictEqual(plan.rangeFilteredPrices, [0.08]);
  assert.deepStrictEqual(plan.diagnostics.singleTierReasonCodes, ['range_filtered_to_one_tier']);
  assert.deepStrictEqual(plan.diagnostics.singleTierReasons, ['价格区间过滤后只剩 1 档']);
});

test('HeroSMS provider reports single-tier reason after floor filtering', () => {
  const plan = api.planPriceTiers({
    fetchResults: {
      getPrices: {
        payload: {
          52: {
            dr: {
              low: { cost: 0.05, count: 9, physicalCount: 9 },
              mid: { cost: 0.08, count: 9, physicalCount: 9 },
              high: { cost: 0.12, count: 9, physicalCount: 9 },
            },
          },
        },
      },
    },
    countryId: 52,
    serviceCode: 'dr',
    countryPriceFloor: 0.08,
    acquirePriority: 'price',
    tierUpgradeLimit: 3,
  });

  assert.deepStrictEqual(plan.floorFilteredPrices, [0.12]);
  assert.deepStrictEqual(plan.diagnostics.singleTierReasonCodes, ['floor_filtered_to_one_tier']);
  assert.deepStrictEqual(plan.diagnostics.singleTierReasons, ['回退价格下限过滤后只剩 1 档']);
});
