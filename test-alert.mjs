// Standalone test for notification duplication prevention & crossing logic
const STORAGE_KEY = 'carboncomply_notified_weeks';
const storage = {};

function hasBeenNotifiedForWeek(weekStart) {
  try {
    const raw = storage[STORAGE_KEY];
    if (!raw) return false;
    const notifiedMap = JSON.parse(raw);
    return Boolean(notifiedMap[weekStart]);
  } catch (e) {
    return false;
  }
}

function markWeekAsNotified(weekStart) {
  try {
    const raw = storage[STORAGE_KEY];
    const notifiedMap = raw ? JSON.parse(raw) : {};
    notifiedMap[weekStart] = true;
    storage[STORAGE_KEY] = JSON.stringify(notifiedMap);
  } catch (e) {}
}

function resetNotificationState() {
  delete storage[STORAGE_KEY];
}

function evaluateAndTriggerThresholdAlert(totalCo2, weekStart, onShowToast, isUserAction = true) {
  if (totalCo2 <= 100.00) return false;
  if (hasBeenNotifiedForWeek(weekStart)) return false;

  markWeekAsNotified(weekStart);
  onShowToast(totalCo2);
  return true;
}

console.log('--- TESTING THRESHOLD EXCEEDED NOTIFICATION ALERT LOGIC ---');

resetNotificationState();

let alertCount = 0;
let lastAlertTotal = 0;
const showToast = (total) => {
  alertCount++;
  lastAlertTotal = total;
};

// 1. Exactly 100.00 kg -> Compliant, MUST NOT TRIGGER
const week1 = '2026-09-14';
let triggered = evaluateAndTriggerThresholdAlert(100.00, week1, showToast, false);
console.assert(triggered === false && alertCount === 0, 'FAIL: Exactly 100.00 kg must NOT trigger alert');
console.log('✓ Test 1: Exactly 100.00 kg is compliant and did NOT trigger alert');

// 2. 99.50 kg -> MUST NOT TRIGGER
triggered = evaluateAndTriggerThresholdAlert(99.50, week1, showToast, false);
console.assert(triggered === false && alertCount === 0, 'FAIL: 99.50 kg must NOT trigger alert');
console.log('✓ Test 2: Sub-100 kg did NOT trigger alert');

// 3. 105.00 kg -> Newly crosses > 100 kg -> MUST TRIGGER
triggered = evaluateAndTriggerThresholdAlert(105.00, week1, showToast, false);
console.assert(triggered === true && alertCount === 1, 'FAIL: 105.00 kg must trigger alert');
console.assert(lastAlertTotal === 105.00, 'FAIL: Alert total mismatch');
console.log('✓ Test 3: Crossing to 105.00 kg (> 100 kg) successfully triggered the alert');

// 4. Adding more activities while already above 100 kg -> MUST NOT TRIGGER AGAIN
triggered = evaluateAndTriggerThresholdAlert(120.00, week1, showToast, false);
console.assert(triggered === false && alertCount === 1, 'FAIL: Duplicate activity in same week must NOT trigger duplicate alert');
console.log('✓ Test 4: Additional activity in same week did NOT trigger duplicate alert');

// 5. Subsequent call (simulating page reload / navigation) -> MUST NOT TRIGGER AGAIN
triggered = evaluateAndTriggerThresholdAlert(120.00, week1, showToast, false);
console.assert(triggered === false && alertCount === 1, 'FAIL: Subsequent reload must NOT trigger duplicate alert');
console.log('✓ Test 5: Page refresh / reload did NOT trigger duplicate alert');

// 6. New week (e.g. 2026-09-21) crosses threshold -> CAN TRIGGER FOR NEW WEEK
const week2 = '2026-09-21';
triggered = evaluateAndTriggerThresholdAlert(112.00, week2, showToast, false);
console.assert(triggered === true && alertCount === 2, 'FAIL: New week crossing threshold must trigger alert');
console.log('✓ Test 6: New week crossing threshold successfully triggered alert for new week');

console.log('ALL NOTIFICATION ALERT TESTS PASSED!');
