/**
 * Returns a date offset by `days` from today.
 */
export function getOffsetDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Returns the day number (1-31) of a date offset by `days` from today.
 */
export function getOffsetDay(days: number): number {
  return getOffsetDate(days).getDate();
}

/**
 * Returns formatted string "YYYY-MM-DD" for a given Date.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatAriaDateLabel(date: Date): string {
  // Agoda's calendar uses aria-label in format "Sat, Apr 04, 2026"
  const label = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  // toLocaleDateString trả về "Sat, Apr 04, 2026" → bỏ dấu phẩy
  const ariaLabel = label.replace(/,/g, '').slice(0, -5);

  return ariaLabel;
}
