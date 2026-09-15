import { ActivityType, ActivityDefinition, ActivityCategory } from './types';

/**
 * EXACT FIXED CO2 EMISSION FACTORS
 * Strictly specified by government compliance guidelines.
 * Never call external APIs or modify these factors.
 */
export const ACTIVITY_DEFINITIONS: Record<ActivityType, ActivityDefinition> = {
  car: {
    type: 'car',
    label: 'Car',
    category: 'transport',
    categoryLabel: 'Transport',
    unit: 'km',
    emissionFactor: 0.20, // 0.20 kg CO2 / km
    description: 'Personal car commute or passenger travel (0.20 kg CO₂/km)',
    absurdThreshold: 2000, // > 2,000 km in a single log triggers confirmation
  },
  bus: {
    type: 'bus',
    label: 'Bus',
    category: 'transport',
    categoryLabel: 'Transport',
    unit: 'km',
    emissionFactor: 0.08, // 0.08 kg CO2 / km
    description: 'Public transit or intercity bus travel (0.08 kg CO₂/km)',
    absurdThreshold: 2000,
  },
  flight: {
    type: 'flight',
    label: 'Flight',
    category: 'travel',
    categoryLabel: 'Travel',
    unit: 'km',
    emissionFactor: 0.25, // 0.25 kg CO2 / km
    description: 'Commercial air flight travel (0.25 kg CO₂/km, subject to travel allowance)',
    absurdThreshold: 20000, // Longest non-stop flights are ~16,000 km
  },
  electricity: {
    type: 'electricity',
    label: 'Electricity',
    category: 'electricity',
    categoryLabel: 'Electricity',
    unit: 'kWh',
    emissionFactor: 0.80, // 0.80 kg CO2 / kWh
    description: 'Residential or personal power consumption (0.80 kg CO₂/kWh)',
    absurdThreshold: 1500, // > 1,500 kWh in a single log triggers confirmation
  },
  veg_meal: {
    type: 'veg_meal',
    label: 'Vegetarian Meal',
    category: 'food',
    categoryLabel: 'Food',
    unit: 'meals',
    emissionFactor: 0.50, // 0.50 kg CO2 / meal
    description: 'Plant-based vegetarian meal (0.50 kg CO₂/meal)',
    absurdThreshold: 30, // > 30 meals in one log triggers confirmation
  },
  non_veg_meal: {
    type: 'non_veg_meal',
    label: 'Non-Vegetarian Meal',
    category: 'food',
    categoryLabel: 'Food',
    unit: 'meals',
    emissionFactor: 2.00, // 2.00 kg CO2 / meal
    description: 'Meat/poultry or animal protein meal (2.00 kg CO₂/meal)',
    absurdThreshold: 30,
  },
};

/**
 * FIXED GOVERNMENT THRESHOLDS & ALLOWANCES
 */
export const GOVERNMENT_WEEKLY_THRESHOLD = 100.00; // Fixed 100 kg CO2/week
export const DEFAULT_PERSONAL_TARGET = 100.00;     // Default 100 kg CO2/week
export const MONTHLY_TRAVEL_ALLOWANCE = 200.00;    // 200 kg CO2/month for flights
export const CARBON_COMPLIANCE_FEE = 10;           // ₹10 compliance fee

/**
 * Calculates CO2 in kg: quantity * factor rounded to 2 decimal places.
 */
export function calculateCo2(quantity: number, emissionFactor: number): number {
  if (isNaN(quantity) || quantity <= 0) return 0;
  const raw = quantity * emissionFactor;
  return Math.round((raw + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number to 2 decimal places with comma separation.
 */
export function formatCo2(val: number): string {
  if (isNaN(val)) return '0.00';
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Checks if a given quantity exceeds the absurd threshold for that activity type.
 */
export function isAbsurdValue(type: ActivityType, quantity: number): boolean {
  const def = ACTIVITY_DEFINITIONS[type];
  if (!def) return false;
  return quantity > def.absurdThreshold;
}
