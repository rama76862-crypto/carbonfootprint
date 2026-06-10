import { EMISSION_FACTORS } from './constants.js';

/**
 * Calculates transport emissions in tonnes of CO2.
 * @param {number} km - Distance in kilometers
 * @param {string} type - 'car' | 'flight' | 'bus' | 'train' | 'bike'
 * @returns {number} Emissions in tonnes of CO2
 */
export function calcTransportEmissions(km, type) {
  const factor = EMISSION_FACTORS.transport[type] || 0;
  return (km * factor) / 1000;
}

/**
 * Calculates home energy emissions in tonnes of CO2.
 * @param {number} kwh - Electricity usage in kWh
 * @param {number} gas_units - Gas usage in kWh or equivalent units
 * @returns {number} Emissions in tonnes of CO2
 */
export function calcHomeEmissions(kwh, gas_units) {
  const electricityEmissions = kwh * EMISSION_FACTORS.home.electricity;
  const gasEmissions = gas_units * EMISSION_FACTORS.home.gas;
  return (electricityEmissions + gasEmissions) / 1000;
}

/**
 * Calculates food diet emissions in tonnes of CO2.
 * Defaults to a 30-day month for monthly calculations.
 * @param {string} diet_type - 'meat_heavy' | 'omnivore' | 'vegetarian' | 'vegan'
 * @param {number} days - Number of days, defaults to 30
 * @returns {number} Emissions in tonnes of CO2
 */
export function calcFoodEmissions(diet_type, days = 30) {
  const factor = EMISSION_FACTORS.food[diet_type] || 0;
  return (factor * days) / 1000;
}

/**
 * Calculates shopping emissions in tonnes of CO2.
 * @param {number} spend_usd - Amount spent in USD
 * @returns {number} Emissions in tonnes of CO2
 */
export function calcShoppingEmissions(spend_usd) {
  const factor = EMISSION_FACTORS.shopping.spend_usd || 0;
  return (spend_usd * factor) / 1000;
}

/**
 * Categorizes annual emissions in tonnes of CO2 and returns the category and color.
 * @param {number} total_tonnes - Total emissions in tonnes of CO2
 * @returns {{category: string, color: string}} Category and CSS variable color
 */
export function getEmissionsCategory(total_tonnes) {
  if (total_tonnes <= 2.0) {
    return { category: 'low', color: 'var(--color-accent)' }; // Paris target or below
  } else if (total_tonnes <= 4.7) {
    return { category: 'medium', color: 'var(--color-accent-soft)' }; // Moderate, below global average
  } else if (total_tonnes <= 8.0) {
    return { category: 'high', color: 'var(--color-warning)' }; // High emissions
  } else {
    return { category: 'critical', color: 'var(--color-danger)' }; // Critical level
  }
}
