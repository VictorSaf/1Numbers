import { describe, it, expect } from 'vitest';
import { lifePath } from '../pythagorean';

/**
 * The Life Path reference table.
 *
 * The engine used to disagree with itself about one thing: whether the month,
 * day and year keep a master number while being reduced. lifePath() kept them;
 * challenges(), five lines below and working from the same three segments, did
 * not -- and could not, since a challenge is an absolute difference in 0..8.
 * pinnacles.ts and karmic.ts outside the engine did not either. NumerologyResults
 * rendered both answers on one page, so 4% of birth dates showed two different
 * Life Paths.
 *
 * The convention, decided 2026-08-30: **the segments reduce to a single digit,
 * and a master number can only appear in the total.**
 *
 * A consequence worth stating out loud: the largest total this can produce is
 * 9 + 9 + 9 = 27, so a Life Path of 33 is now arithmetically impossible. 11 and
 * 22 remain reachable; 33 does not.
 *
 * Every row below is `reduce(month) + reduce(day) + reduce(digitSum(year))`,
 * then that sum reduced with masters preserved. The dates are chosen for the
 * cases that separate the two conventions, plus the four the audit measured.
 */

type Row = {
  date: string;
  segments: [number, number, number];
  sum: number;
  value: number;
  isMaster: boolean;
  karmicDebt: number | null;
  why: string;
};

const TABLE: Row[] = [
  // The four dates the audit named. Under the old rule these read 2, 22, 33, 33.
  { date: '1930-05-11', segments: [5, 2, 4], sum: 11, value: 11, isMaster: true,  karmicDebt: null, why: 'day 11' },
  { date: '1930-07-11', segments: [7, 2, 4], sum: 13, value: 4,  isMaster: false, karmicDebt: 13,   why: 'day 11' },
  { date: '1930-07-22', segments: [7, 4, 4], sum: 15, value: 6,  isMaster: false, karmicDebt: null, why: 'day 22' },
  { date: '1975-02-09', segments: [2, 9, 4], sum: 15, value: 6,  isMaster: false, karmicDebt: null, why: 'year 1975 -> 22 -> 4' },

  // Month 11, on its own and doubled up with a master day.
  { date: '1985-11-11', segments: [2, 2, 5], sum: 9,  value: 9,  isMaster: false, karmicDebt: null, why: 'month 11 and day 11' },
  { date: '1999-11-29', segments: [2, 2, 1], sum: 5,  value: 5,  isMaster: false, karmicDebt: null, why: 'month 11 and day 29' },
  { date: '1963-11-02', segments: [2, 2, 1], sum: 5,  value: 5,  isMaster: false, karmicDebt: null, why: 'month 11' },
  { date: '1985-11-05', segments: [2, 5, 5], sum: 12, value: 3,  isMaster: false, karmicDebt: null, why: 'month 11' },

  // Day 22 and day 29 -- 29 reduces to 11 before it reduces to 2.
  { date: '1966-04-22', segments: [4, 4, 4], sum: 12, value: 3,  isMaster: false, karmicDebt: null, why: 'day 22' },
  { date: '1975-08-22', segments: [8, 4, 4], sum: 16, value: 7,  isMaster: false, karmicDebt: 16,   why: 'day 22' },
  { date: '1930-05-29', segments: [5, 2, 4], sum: 11, value: 11, isMaster: true,  karmicDebt: null, why: 'day 29' },
  { date: '1980-02-29', segments: [2, 2, 9], sum: 13, value: 4,  isMaster: false, karmicDebt: 13,   why: 'day 29, leap year' },

  // Years whose digits sum to a master.
  { date: '1901-03-04', segments: [3, 4, 2], sum: 9,  value: 9,  isMaster: false, karmicDebt: null, why: 'year 1901 -> 11 -> 2' },
  { date: '2009-06-07', segments: [6, 7, 2], sum: 15, value: 6,  isMaster: false, karmicDebt: null, why: 'year 2009 -> 11 -> 2' },
  { date: '1948-01-02', segments: [1, 2, 4], sum: 7,  value: 7,  isMaster: false, karmicDebt: null, why: 'year 1948 -> 22 -> 4' },
  { date: '1993-09-08', segments: [9, 8, 4], sum: 21, value: 3,  isMaster: false, karmicDebt: null, why: 'year 1993 -> 22 -> 4' },

  // The two profiles the rest of the suite is built on. Neither moves.
  { date: '1990-08-25', segments: [8, 7, 1], sum: 16, value: 7,  isMaster: false, karmicDebt: 16,   why: 'reference profile' },
  { date: '1995-04-14', segments: [4, 5, 6], sum: 15, value: 6,  isMaster: false, karmicDebt: null, why: 'reference profile' },

  // Each karmic debt reachable as a total, including 19, which reduces through
  // 10 and so is invisible to anything that only inspects the final step.
  { date: '1990-09-04', segments: [9, 4, 1], sum: 14, value: 5,  isMaster: false, karmicDebt: 14,   why: 'total 14' },
  { date: '1990-09-09', segments: [9, 9, 1], sum: 19, value: 1,  isMaster: false, karmicDebt: 19,   why: 'total 19, chain 19 -> 10 -> 1' },
  { date: '1930-09-09', segments: [9, 9, 4], sum: 22, value: 22, isMaster: true,  karmicDebt: null, why: 'total 22, the largest master still reachable' },

  { date: '2000-01-01', segments: [1, 1, 2], sum: 4,  value: 4,  isMaster: false, karmicDebt: null, why: 'smallest segments' },
  { date: '1969-07-20', segments: [7, 2, 7], sum: 16, value: 7,  isMaster: false, karmicDebt: 16,   why: 'control' },
];

describe('Life Path reference table', () => {
  it.each(TABLE)('$date -> $value ($why)', ({ date, segments, sum, value, isMaster, karmicDebt }) => {
    const [year, month, day] = date.split('-').map(Number);
    const lp = lifePath({ day, month, year });

    // raw is the sum of the three reduced segments, which is what makes the
    // convention visible: under the old rule it was the sum of segments that
    // could themselves be 11 or 22.
    expect(lp.raw, 'sum of segments').toBe(sum);
    expect(segments.reduce((a, b) => a + b, 0), 'table row is self-consistent').toBe(sum);
    expect(lp.value, 'life path').toBe(value);
    expect(lp.isMaster, 'is master').toBe(isMaster);
    expect(lp.karmicDebt, 'karmic debt').toBe(karmicDebt);
  });

  it('cannot produce a Life Path of 33', () => {
    // 9 + 9 + 9 is the ceiling, so the only masters left are 11 and 22.
    const seen = new Set<number>();
    for (let year = 1900; year <= 2100; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 28; day++) seen.add(lifePath({ day, month, year }).value);
      }
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22]);
  });
});
