import { 
  calcTransportEmissions, 
  calcHomeEmissions, 
  calcFoodEmissions, 
  calcShoppingEmissions 
} from './calculations.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

console.log('=== Running EcoTrace Unit Tests ===');

try {
  // Test 1: Transport Calculations
  assert(calcTransportEmissions(100, 'car') === 0.0171, 'Car transport emissions calculation');
  assert(calcTransportEmissions(1000, 'flight') === 0.254, 'Flight transport emissions calculation');
  assert(calcTransportEmissions(50, 'bike') === 0.0, 'Bike transport emissions calculation');

  // Test 2: Home Energy Calculations
  // kwh = 200, gas = 50 -> (200 * 0.385 + 50 * 0.185) / 1000 = (77 + 9.25) / 1000 = 86.25 / 1000 = 0.08625
  assert(calcHomeEmissions(200, 50) === 0.08625, 'Home energy emissions calculation');

  // Test 3: Food Diet Calculations
  // vegetarian = 1.2 kg per day -> 1.2 * 30 / 1000 = 0.036 tonnes
  assert(calcFoodEmissions('vegetarian', 30) === 0.036, 'Vegetarian food emissions calculation');
  assert(calcFoodEmissions('vegan', 30) === 0.021, 'Vegan food emissions calculation');

  // Test 4: Shopping Spend Calculations
  assert(calcShoppingEmissions(100) === 0.012, 'Shopping spend emissions calculation');

  console.log('\n✅ All tests passed successfully!');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
