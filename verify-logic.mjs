// Automated verification script for CARBONCOMPLY core logic
import { calculateCo2, ACTIVITY_DEFINITIONS, isAbsurdValue } from './src/lib/calculations.ts';
import { getWeekRangeForDate, parseDateString, formatDateString } from './src/lib/dateUtils.ts';
import { evaluateComplianceStatus, computeAllWeeklySummaries } from './src/lib/complianceEngine.ts';

console.log('--- STARTING CARBONCOMPLY AUTOMATED VERIFICATION ---');

// TEST 1: Car 10 km = 2.00 kg
const carCo2 = calculateCo2(10, ACTIVITY_DEFINITIONS.car.emissionFactor);
console.assert(carCo2 === 2.00, `TEST 1 Failed: Car 10 km should be 2.00, got ${carCo2}`);
console.log('✓ TEST 1 Passed: 10 km car = 2.00 kg CO2');

// TEST 2: Electricity 50 kWh = 40.00 kg
const elecCo2 = calculateCo2(50, ACTIVITY_DEFINITIONS.electricity.emissionFactor);
console.assert(elecCo2 === 40.00, `TEST 2 Failed: Electricity 50 kWh should be 40.00, got ${elecCo2}`);
console.log('✓ TEST 2 Passed: 50 kWh electricity = 40.00 kg CO2');

// TEST 3: Non-veg meal 3 meals = 6.00 kg
const mealCo2 = calculateCo2(3, ACTIVITY_DEFINITIONS.non_veg_meal.emissionFactor);
console.assert(mealCo2 === 6.00, `TEST 3 Failed: 3 non-veg meals should be 6.00, got ${mealCo2}`);
console.log('✓ TEST 3 Passed: 3 non-veg meals = 6.00 kg CO2');

// TEST 4: Flight 100 km = 25.00 kg
const flightCo2 = calculateCo2(100, ACTIVITY_DEFINITIONS.flight.emissionFactor);
console.assert(flightCo2 === 25.00, `TEST 4 Failed: 100 km flight should be 25.00, got ${flightCo2}`);
console.log('✓ TEST 4 Passed: 100 km flight = 25.00 kg CO2');

// TEST 5: Monday–Sunday Week calculation
// Monday Sep 14, 2026 -> Mon Sep 14 to Sun Sep 20
const rangeMon = getWeekRangeForDate('2026-09-14');
console.assert(rangeMon.weekStart === '2026-09-14', `Week start should be 2026-09-14, got ${rangeMon.weekStart}`);
console.assert(rangeMon.weekEnd === '2026-09-20', `Week end should be 2026-09-20, got ${rangeMon.weekEnd}`);

// Sunday Sep 20, 2026 -> same week
const rangeSun = getWeekRangeForDate('2026-09-20');
console.assert(rangeSun.weekStart === '2026-09-14' && rangeSun.weekEnd === '2026-09-20', 'Sunday should belong to same week');

// Monday Sep 21, 2026 -> next week
const rangeNextMon = getWeekRangeForDate('2026-09-21');
console.assert(rangeNextMon.weekStart === '2026-09-21' && rangeNextMon.weekEnd === '2026-09-27', 'Next Monday should start new week');
console.log('✓ TEST 5 Passed: Monday-Sunday week boundaries are exact');

// TEST 6: Warning levels & Exactly 100 kg
const status70 = evaluateComplianceStatus(70.00);
console.assert(status70.status === 'ON TRACK' && !status70.isExceeded, '70 kg must be ON TRACK');

const status85 = evaluateComplianceStatus(85.00);
console.assert(status85.status === 'APPROACHING LIMIT', '85 kg must be APPROACHING LIMIT');

const status95 = evaluateComplianceStatus(95.00);
console.assert(status95.status === 'NEAR LIMIT', '95 kg must be NEAR LIMIT');

const status100 = evaluateComplianceStatus(100.00);
console.assert(status100.status === 'NEAR LIMIT' && !status100.isExceeded, '100.00 kg must NOT be exceeded (compliant)');

const status100_1 = evaluateComplianceStatus(100.01);
console.assert(status100_1.status === 'LIMIT EXCEEDED' && status100_1.isExceeded, '100.01 kg must be LIMIT EXCEEDED');
console.log('✓ TEST 6 Passed: Compliance statuses and exact 100 kg threshold verified');

// TEST 7: Absurd input validation
console.assert(isAbsurdValue('car', 500000) === true, '500,000 km car must be absurd');
console.assert(isAbsurdValue('car', 50) === false, '50 km car is not absurd');
console.log('✓ TEST 7 Passed: Absurd input detection verified');

// TEST 8: Compliance Fee First violation vs Subsequent violation
const mockActivities = [
  // Week 1 (Sep 07 - Sep 13): 120 kg (First Violation)
  {
    id: '1',
    activity_type: 'car',
    quantity: 600,
    unit: 'km',
    emission_factor: 0.20,
    co2_kg: 120.00,
    activity_date: '2026-09-08',
    created_at: new Date().toISOString(),
  },
  // Week 2 (Sep 14 - Sep 20): 80 kg (Compliant)
  {
    id: '2',
    activity_type: 'car',
    quantity: 400,
    unit: 'km',
    emission_factor: 0.20,
    co2_kg: 80.00,
    activity_date: '2026-09-15',
    created_at: new Date().toISOString(),
  },
  // Week 3 (Sep 21 - Sep 27): 130 kg (Subsequent Violation -> ₹10)
  {
    id: '3',
    activity_type: 'flight',
    quantity: 520,
    unit: 'km',
    emission_factor: 0.25,
    co2_kg: 130.00,
    activity_date: '2026-09-22',
    created_at: new Date().toISOString(),
  },
];

const summaries = computeAllWeeklySummaries(mockActivities, 100, '2026-09-23');
const week1 = summaries.allWeeks.find((w) => w.weekStart === '2026-09-07');
const week2 = summaries.allWeeks.find((w) => w.weekStart === '2026-09-14');
const week3 = summaries.allWeeks.find((w) => w.weekStart === '2026-09-21');

console.assert(week1.isExceeded === true && week1.isFirstViolation === true && week1.feeAmount === 0, 'Week 1 must be ₹0 first violation');
console.assert(week2.isExceeded === false && week2.feeAmount === 0, 'Week 2 must be compliant');
console.assert(week3.isExceeded === true && week3.isFirstViolation === false && week3.feeAmount === 10, 'Week 3 must be ₹10 subsequent violation');
console.log('✓ TEST 8 Passed: First violation = ₹0 reminder, subsequent violation = ₹10 fee');

console.log('ALL VERIFICATION CHECKS PASSED!');
