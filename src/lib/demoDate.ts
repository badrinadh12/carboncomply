import { getTodayDateString } from './dateUtils';

const DEMO_DATE_KEY = 'carboncomply_demo_date';

/**
 * Returns the simulated demo date if configured by a developer/evaluator, or null if using real date.
 */
export function getAppDemoDate(): string | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(DEMO_DATE_KEY);
  if (!val) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  return null;
}

/**
 * Returns the effective application date: the simulated demo date if active, or today's real date.
 */
export function getAppEffectiveDate(): string {
  return getAppDemoDate() || getTodayDateString();
}

/**
 * Sets or clears the simulated demo date and notifies listening components.
 */
export function setAppDemoDate(dateStr: string | null): void {
  if (typeof window === 'undefined') return;
  if (!dateStr) {
    localStorage.removeItem(DEMO_DATE_KEY);
  } else {
    localStorage.setItem(DEMO_DATE_KEY, dateStr);
  }
  window.dispatchEvent(new CustomEvent('carboncomply_date_changed', { detail: { date: dateStr } }));
}

/**
 * Checks whether a simulated evaluation demo date is currently active.
 */
export function isDemoDateActive(): boolean {
  return getAppDemoDate() !== null;
}
