export const emissionFactors = {
  transport: {
    car: 0.171,
    flight: 0.254,
    bus: 0.082,
    train: 0.041,
    bike: 0
  },
  home: {
    electricity: 0.385,
    gas: 0.185
  },
  food: {
    meat_heavy: 2.9,
    omnivore: 1.7,
    vegetarian: 1.2,
    vegan: 0.7
  },
  shopping: {
    spend_usd: 0.12
  }
};

const frequencyMultiplier = {
  daily: 30,
  weekly: 4.3,
  monthly: 1,
  'one-time': 1
};

export function roundTonnes(value) {
  return Number((Number(value) || 0).toFixed(3));
}

export function normalizeEntry(entry) {
  const transport = roundTonnes(entry.transport);
  const home = roundTonnes(entry.home);
  const food = roundTonnes(entry.food);
  const shopping = roundTonnes(entry.shopping);

  return {
    month: String(entry.month || '').trim(),
    transport,
    home,
    food,
    shopping,
    total: roundTonnes(transport + home + food + shopping)
  };
}

export function calculateActivity(payload = {}) {
  const transport = (payload.transportTrips || []).reduce((sum, trip) => {
    const type = trip.type || 'car';
    const distance = Math.max(0, Number(trip.distanceKm) || 0);
    const frequency = trip.frequency || 'monthly';
    return sum + ((distance * (emissionFactors.transport[type] || 0) * (frequencyMultiplier[frequency] || 1)) / 1000);
  }, 0);

  const householdSize = Math.max(1, Number(payload.householdSize) || 1);
  const renewableFactor = payload.renewable ? 0.3 : 1;
  const home =
    (((Math.max(0, Number(payload.electricityKwh) || 0) * emissionFactors.home.electricity) +
      (Math.max(0, Number(payload.gasUnits) || 0) * emissionFactors.home.gas)) /
      1000 /
      householdSize) *
    renewableFactor;

  const dietType = payload.dietType || 'omnivore';
  const wasteFactor = { low: 1.05, medium: 1.15, high: 1.25 }[payload.foodWaste] || 1;
  const localFactor = payload.localSeasonal ? 0.9 : 1;
  const food = ((emissionFactors.food[dietType] || 0) * 30 * wasteFactor * localFactor) / 1000;

  const shoppingUsd = Math.max(0, Number(payload.shoppingUsd) || 0);
  const secondHandFactor = payload.secondHand ? 0.6 : 1;
  const shopping = (shoppingUsd * emissionFactors.shopping.spend_usd * secondHandFactor) / 1000;

  return normalizeEntry({
    month: payload.month || 'Current',
    transport,
    home,
    food,
    shopping
  });
}

export function summarizeEmissions(emissions = []) {
  const totals = emissions.reduce(
    (acc, entry) => {
      acc.transport += Number(entry.transport) || 0;
      acc.home += Number(entry.home) || 0;
      acc.food += Number(entry.food) || 0;
      acc.shopping += Number(entry.shopping) || 0;
      acc.total += Number(entry.total) || 0;
      return acc;
    },
    { transport: 0, home: 0, food: 0, shopping: 0, total: 0 }
  );

  const biggestCategory = ['transport', 'home', 'food', 'shopping'].reduce((highest, key) => {
    return totals[key] > totals[highest] ? key : highest;
  }, 'transport');

  return {
    annualTotal: roundTonnes(totals.total),
    categoryTotals: {
      transport: roundTonnes(totals.transport),
      home: roundTonnes(totals.home),
      food: roundTonnes(totals.food),
      shopping: roundTonnes(totals.shopping)
    },
    biggestCategory,
    monthsLogged: emissions.length
  };
}
