import { describe, it, expect } from 'vitest';
import { parseCalendarDate, formatCalendarDate } from '../calendarDate';
import { calculateLifePathNumber } from '../numerology';

/**
 * A birth date has to mean the same thing in every timezone.
 *
 * `new Date("1990-05-15")` is UTC midnight by specification, so `.getDate()`
 * read anywhere at or behind UTC returns the 14th -- and the whole profile is
 * derived from the day, month and year. The tests in this directory carried the
 * same hazard: their expected values were only correct east of UTC.
 */

describe('parseCalendarDate', () => {
  it('keeps the calendar fields the string names', () => {
    const d = parseCalendarDate('1990-05-15')!;
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([1990, 5, 15]);
  });

  it('does not shift a date that would land on the previous day in UTC', () => {
    // The failing case: `new Date("2000-01-01").getDate()` is 31 in any zone
    // behind UTC. This has to be 1 everywhere.
    expect(parseCalendarDate('2000-01-01')!.getDate()).toBe(1);
  });

  it('round-trips through the formatter', () => {
    for (const iso of ['1990-05-15', '2000-01-01', '1985-12-25', '1980-02-29']) {
      expect(formatCalendarDate(parseCalendarDate(iso)!)).toBe(iso);
    }
  });

  it('passes a Date straight through and refuses nonsense', () => {
    const d = new Date(1990, 4, 15);
    expect(parseCalendarDate(d)).toBe(d);
    expect(parseCalendarDate(null)).toBeNull();
    expect(parseCalendarDate('')).toBeNull();
    expect(parseCalendarDate('not a date')).toBeNull();
  });

  it('accepts the timestamp form the API used to send, reading its date part', () => {
    // Before the DATE type parser on the server, birth dates arrived like this.
    expect(parseCalendarDate('1990-05-15T00:00:00.000Z')!.getDate()).toBe(15);
  });
});

describe('the profile does not depend on where the reader is sitting', () => {
  // TZ is read by the Date constructor at call time, so switching it between
  // calls is enough; no module reload is needed.
  const withTZ = <T,>(tz: string, fn: () => T): T => {
    const previous = process.env.TZ;
    process.env.TZ = tz;
    try {
      return fn();
    } finally {
      process.env.TZ = previous;
    }
  };

  const ZONES = ['UTC', 'Pacific/Auckland', 'Pacific/Honolulu', 'Europe/Bucharest'];

  it.each(['1990-05-15', '2000-01-01', '1985-12-25'])(
    '%s gives one life path in every zone',
    (iso) => {
      const answers = ZONES.map((tz) =>
        withTZ(tz, () => calculateLifePathNumber(parseCalendarDate(iso)!)),
      );
      expect(new Set(answers).size, `answers: ${answers.join(', ')}`).toBe(1);
    },
  );
});
