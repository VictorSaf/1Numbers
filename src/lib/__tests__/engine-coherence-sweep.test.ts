import { describe, it, expect } from 'vitest';
import { calculateLifePathNumber } from '../numerology';
import { calculatePinnacles, calculateChallenges } from '../pinnacles';
import { calculateKarmicDebts } from '../karmic';
import { calculatePersonalDayNumber, calculateUniversalDay } from '../personalCycles';
import { lifePath, pinnacles, challenges, personalYear, personalMonth, personalDay, universalDay }
  from '../numerology-plus/pythagorean';

/**
 * Every consumer against the engine, on every birth date.
 *
 * The audit measured 974 of 27,216 dates showing two different Life Paths on
 * one page, because pinnacles.ts and karmic.ts reduced the month, day and year
 * one way and numerology-plus reduced them another. That divergence is what
 * this sweeps for: it does not check that the numbers are right -- the
 * reference table does that -- it checks that there is only one answer.
 *
 * A sweep rather than samples, because the disagreement only showed up for the
 * 4% of dates with a master in a segment. Anything narrower would have passed
 * while the bug was live.
 */

const YEARS = { from: 1930, to: 2029 };
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function* everyBirthDate() {
  for (let year = YEARS.from; year <= YEARS.to; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= DAYS_IN[month - 1]; day++) {
        if (month === 2 && day === 29 && !isLeap(year)) continue;
        yield { year, month, day };
      }
    }
  }
}

const dates = [...everyBirthDate()];

describe('one answer per number, across every consumer', () => {
  it(`sweeps ${dates.length.toLocaleString('en-US')} birth dates`, () => {
    expect(dates.length).toBeGreaterThan(27_216);
  });

  it('life path agrees between the engine and the calculator', () => {
    const divergences: string[] = [];
    for (const { year, month, day } of dates) {
      const fromEngine = lifePath({ day, month, year }).value;
      const fromCalculator = calculateLifePathNumber(new Date(year, month - 1, day));
      if (fromEngine !== fromCalculator) divergences.push(`${year}-${month}-${day}`);
    }
    expect(divergences).toEqual([]);
  });

  it('pinnacles and challenges agree between the engine and pinnacles.ts', () => {
    const divergences: string[] = [];
    for (const { year, month, day } of dates) {
      const b = { day, month, year };
      const lp = lifePath(b);
      const enginePins = pinnacles(b, lp);
      const modulePins = calculatePinnacles(new Date(year, month - 1, day));
      const engineCh = challenges(b, lp);
      const moduleCh = calculateChallenges(new Date(year, month - 1, day));

      for (let i = 0; i < 4; i++) {
        if (enginePins[i].value !== modulePins[i].number) divergences.push(`${year}-${month}-${day} P${i + 1}`);
        if (enginePins[i].fromAge !== modulePins[i].startAge) divergences.push(`${year}-${month}-${day} P${i + 1} start`);
        if (engineCh[i].value !== moduleCh[i].number) divergences.push(`${year}-${month}-${day} C${i + 1}`);
      }
    }
    expect(divergences.slice(0, 10)).toEqual([]);
  });

  it('the personal and universal day agree between the engine and personalCycles', () => {
    const divergences: string[] = [];
    // One target date is enough: the cycle functions differ in how they reduce,
    // not in which day they are asked about.
    const target = new Date(2026, 7, 30);
    for (const { year, month, day } of dates) {
      const b = { day, month, year };
      const pm = personalMonth(personalYear(b, target.getFullYear()), target.getMonth() + 1);
      const fromEngine = personalDay(pm, target.getDate()).value;
      const fromModule = calculatePersonalDayNumber(new Date(year, month - 1, day), target);
      if (fromEngine !== fromModule) divergences.push(`${year}-${month}-${day}`);
    }
    expect(divergences.slice(0, 10)).toEqual([]);
    expect(calculateUniversalDay(target)).toBe(
      universalDay(target.getFullYear(), target.getMonth() + 1, target.getDate()).value,
    );
  });

  it('karmic debts on the life path agree with the engine', () => {
    const divergences: string[] = [];
    for (const { year, month, day } of dates) {
      const expected = lifePath({ day, month, year }).karmicDebt;
      const reported = calculateKarmicDebts(new Date(year, month - 1, day), 'Test Name')
        .find((d) => d.source === 'lifePath')?.number ?? null;
      if (expected !== reported) divergences.push(`${year}-${month}-${day}: ${expected} vs ${reported}`);
    }
    expect(divergences.slice(0, 10)).toEqual([]);
  });
});
