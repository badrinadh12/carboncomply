/**
 * NOTIFICATION DUPLICATION PREVENTER & ALERT TRIGGER
 * 
 * Tracks notified compliance weeks in localStorage.
 * Ensures the alert and audio chime ONLY fire once per week when newly crossing > 100 kg.
 */

import { playThresholdExceededSound } from './audioNotification';

const STORAGE_KEY = 'carboncomply_notified_weeks';

export function hasBeenNotifiedForWeek(weekStart: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const notifiedMap: Record<string, boolean> = JSON.parse(raw);
    return Boolean(notifiedMap[weekStart]);
  } catch (e) {
    return false;
  }
}

export function markWeekAsNotified(weekStart: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const notifiedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    notifiedMap[weekStart] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifiedMap));
  } catch (e) {
    console.error('Failed to save notification state:', e);
  }
}

export function resetNotificationState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

/**
 * Checks if the threshold was newly crossed (> 100 kg) and triggers the sound + toast alert.
 * Returns true if alert was newly triggered.
 */
export function evaluateAndTriggerThresholdAlert(
  totalCo2: number,
  weekStart: string,
  onShowToast: (total: number) => void,
  isUserAction: boolean = true
): boolean {
  // Must be strictly greater than 100 kg. Exactly 100.00 kg is compliant.
  if (totalCo2 <= 100.00) return false;

  // If already notified for this week, do not repeat
  if (hasBeenNotifiedForWeek(weekStart)) {
    return false;
  }

  // Mark as notified in localStorage
  markWeekAsNotified(weekStart);

  // Play subtle sound if user has interacted
  if (isUserAction) {
    playThresholdExceededSound();
  }

  // Trigger visual toast
  onShowToast(totalCo2);
  return true;
}
