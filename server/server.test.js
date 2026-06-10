import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistantPlan } from './assistant.js';
import { calculateActivity, normalizeEntry, summarizeEmissions } from './calculations.js';

test('normalizes entries and totals category values', () => {
  const entry = normalizeEntry({
    month: 'July',
    transport: '0.1234',
    home: 0.2,
    food: 0.05,
    shopping: 0.1
  });

  assert.deepEqual(entry, {
    month: 'July',
    transport: 0.123,
    home: 0.2,
    food: 0.05,
    shopping: 0.1,
    total: 0.473
  });
});

test('calculates a monthly activity footprint', () => {
  const entry = calculateActivity({
    month: 'August',
    transportTrips: [{ type: 'car', distanceKm: 100, frequency: 'weekly' }],
    electricityKwh: 250,
    gasUnits: 80,
    householdSize: 3,
    dietType: 'omnivore',
    foodWaste: 'medium',
    shoppingUsd: 120,
    secondHand: true
  });

  assert.equal(entry.month, 'August');
  assert.equal(entry.transport, 0.074);
  assert.equal(entry.total > 0, true);
});

test('assistant prioritizes the largest emissions category', () => {
  const emissions = [
    normalizeEntry({ month: 'May', transport: 1.5, home: 0.2, food: 0.1, shopping: 0.1 }),
    normalizeEntry({ month: 'June', transport: 1.2, home: 0.3, food: 0.1, shopping: 0.1 })
  ];
  const plan = createAssistantPlan({ profile: { name: 'Alex' }, emissions });

  assert.equal(summarizeEmissions(emissions).biggestCategory, 'transport');
  assert.match(plan.message, /transport/);
  assert.equal(plan.nextActions.length, 3);
});
