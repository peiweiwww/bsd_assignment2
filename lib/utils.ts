/**
 * Returns an ISO date string (YYYY-MM-DD) using LOCAL calendar date,
 * avoiding the UTC-shift bug that toISOString() causes in non-UTC timezones.
 */
export function localISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
