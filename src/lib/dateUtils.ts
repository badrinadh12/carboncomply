/**
 * TIMEZONE-SAFE DATE UTILITIES FOR MONDAY-TO-SUNDAY COMPLIANCE WEEKS
 * 
 * Government compliance strictly mandates:
 * Week start: Monday 00:00:00
 * Week end: Sunday 23:59:59
 * All calculations use activity_date (YYYY-MM-DD), never created_at.
 */

export interface WeekRange {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  label: string;     // e.g. "Sep 14 – Sep 20, 2026"
  year: number;
  weekNumber: number;
}

/**
 * Parses YYYY-MM-DD into a UTC Date object to avoid any local timezone shift bugs.
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Formats a Date object to YYYY-MM-DD using UTC components.
 */
export function formatDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date in YYYY-MM-DD formatted string based on user's current calendar day.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Given any date string (YYYY-MM-DD), computes the corresponding Monday (00:00)
 * and Sunday (23:59:59) compliance week.
 */
export function getWeekRangeForDate(dateStr: string): WeekRange {
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  // Difference to Monday:
  // Sunday (0) -> -6 days
  // Monday (1) -> 0 days
  // Tuesday (2) -> -1 day, etc.
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const weekStart = formatDateString(monday);
  const weekEnd = formatDateString(sunday);

  const label = formatWeekRangeLabel(weekStart, weekEnd);

  // ISO week number
  const d = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    weekStart,
    weekEnd,
    label,
    year: monday.getUTCFullYear(),
    weekNumber,
  };
}

/**
 * Formats a friendly label for Monday–Sunday, e.g. "Sep 14 – Sep 20, 2026"
 */
export function formatWeekRangeLabel(weekStart: string, weekEnd: string): string {
  const start = parseDateString(weekStart);
  const end = parseDateString(weekEnd);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
}

/**
 * Formats a single date nicely, e.g. "Sep 15, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Returns the month identifier (YYYY-MM) and friendly label (e.g. "September 2026")
 */
export function getMonthInfo(dateStr: string): { monthKey: string; monthLabel: string } {
  const d = parseDateString(dateStr);
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const monthKey = `${d.getUTCFullYear()}-${m}`;
  const monthLabel = `${fullMonths[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return { monthKey, monthLabel };
}
