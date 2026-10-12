import { describe, it, expect } from 'vitest';
import { calculateLifeCycles, calculatePinnacles, LIFE_CYCLE_STAGE_LABELS } from '../pinnacles';

// Same birth date as numerology-plus/__tests__/engine.test.ts's b1 (day 14,
// month 4, year 1995), so the expected digits here match the engine's own
// coverage of lifeCycles() instead of inventing a second set of numbers.
const birthDate = new Date(1995, 3, 14);

describe('calculateLifeCycles', () => {
  const cycles = calculateLifeCycles(birthDate);

  it('returns the three stages in order', () => {
    expect(cycles.map((c) => c.stage)).toEqual(['formative', 'productive', 'harvest']);
  });

  it('formative is the reduced month', () => {
    expect(cycles[0].number).toBe(4);
  });

  it('productive is the reduced day', () => {
    expect(cycles[1].number).toBe(5);
  });

  it('harvest is the reduced year', () => {
    expect(cycles[2].number).toBe(6);
  });

  it('shares its first boundary with the first Pinnacle', () => {
    const [firstPinnacle] = calculatePinnacles(birthDate);
    expect(cycles[0].endAge).toBe(firstPinnacle.endAge);
    expect(cycles[1].startAge).toBe(firstPinnacle.endAge + 1);
  });

  it('productive lasts 27 years', () => {
    expect(cycles[1].endAge - cycles[1].startAge + 1).toBe(27);
  });

  it('harvest is open-ended', () => {
    expect(cycles[2].endAge).toBe(99);
  });

  it('has a stage label for all three stages, in all three languages', () => {
    for (const stage of ['formative', 'productive', 'harvest'] as const) {
      const label = LIFE_CYCLE_STAGE_LABELS[stage];
      expect(label.title.ro).toBeTruthy();
      expect(label.title.en).toBeTruthy();
      expect(label.title.ru).toBeTruthy();
      expect(label.description.ro).toBeTruthy();
      expect(label.description.en).toBeTruthy();
      expect(label.description.ru).toBeTruthy();
    }
  });
});
