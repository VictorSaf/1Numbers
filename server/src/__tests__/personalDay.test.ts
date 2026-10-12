import { describe, it, expect } from 'vitest';
import { personalDayNumber, parseCalendarDate } from '../lib/personalDay';

/**
 * Valorile sunt calculate din formula motorului
 * (src/lib/numerology-plus/pythagorean.ts, personalYear/Month/Day cu
 * keepMasters = false), nu din rularea acestui cod. Serverul nu poate importa
 * motorul -- rootDir e ./src -- deci acest tabel e singurul lucru care ține
 * cele două copii pe aceeași valoare.
 *
 * 1990-05-15 la 2026-09-01: an personal reduce(5)+reduce(15)+reduce(digitSum(2026)=10)
 *   = 5+6+1 = 12 -> 3; lună personală 3+9 = 12 -> 3; zi personală 3+1 = 4.
 * 1985-11-29 verifică reducerea unei zile care trece prin 11:
 *   reduce(29) = 11 -> 2, nu 11, fiindcă masterii nu se păstrează în segmente.
 */
const CASES: Array<[string, string, number]> = [
  ['1990-05-15', '2026-09-01', 4],
  ['1985-11-29', '2026-09-01', 6],
  ['2000-01-01', '2026-12-31', 1],
  ['1977-07-07', '2026-09-02', 8],
];

describe('personalDayNumber', () => {
  it.each(CASES)('naștere %s, zi %s -> %i', (birth, on, expected) => {
    expect(personalDayNumber(parseCalendarDate(birth), parseCalendarDate(on))).toBe(expected);
  });

  it('nu întoarce niciodată un master sau un zero', () => {
    for (let day = 1; day <= 28; day++) {
      const value = personalDayNumber(
        parseCalendarDate('1990-05-15'),
        parseCalendarDate(`2026-09-${String(day).padStart(2, '0')}`),
      );
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    }
  });
});

describe('parseCalendarDate', () => {
  it('citește un YYYY-MM-DD fără să treacă printr-un Date', () => {
    expect(parseCalendarDate('1990-05-15')).toEqual({ year: 1990, month: 5, day: 15 });
  });
});
