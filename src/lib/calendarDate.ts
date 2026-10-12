/**
 * A birth date is a calendar date, not a moment in time.
 *
 * `new Date("1990-05-15")` is parsed as UTC midnight by specification, so
 * reading `.getDate()` off it anywhere at or behind UTC returns the 14th -- and
 * since the whole profile is derived from the day, month and year, the person
 * gets someone else's numbers depending on where they happen to be sitting.
 *
 * These two functions are the boundary: strings from the API become local
 * midnight, and dates going back become plain YYYY-MM-DD.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Parses `YYYY-MM-DD` (or a Date, passed through) as a local calendar date. */
export function parseCalendarDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const match = ISO_DATE.exec(value);
  if (!match) {
    // Not a date-only string. Whatever it is, it is not something to guess at.
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Serialises a Date as `YYYY-MM-DD`, reading the local calendar fields. */
export function formatCalendarDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
