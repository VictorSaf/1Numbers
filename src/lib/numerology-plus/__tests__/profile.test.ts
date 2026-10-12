import { describe, it, expect } from 'vitest';
import { fullProfile } from '../index';

/**
 * fullProfile is the single entry point the UI will consume, so its shape is
 * part of the contract: a page that reads profile.pythagorean.core should not
 * break because a section was renamed. These assertions pin the sections rather
 * than their contents, which the engine's own 78 assertions already cover.
 */
describe('fullProfile', () => {
  const profile = fullProfile(
    'Victor Ion Safta',
    { day: 25, month: 8, year: 1990 },
    { gender: 'male' },
  );

  it('exposes every system as its own section', () => {
    expect(Object.keys(profile).sort()).toEqual([
      'biorhythms', 'chaldean', 'destinyMatrix', 'input',
      'kabbalah', 'kua', 'pythagorean', 'vedic',
    ]);
  });

  it('groups the Pythagorean work the way the results page needs it', () => {
    expect(Object.keys(profile.pythagorean).sort()).toEqual([
      'core', 'cycles', 'extended', 'karmicDebts', 'planes', 'transits',
    ]);
  });

  it('reports karmic debts found across positions', () => {
    expect(Array.isArray(profile.pythagorean.karmicDebts)).toBe(true);
    expect(profile.pythagorean.karmicDebts.length).toBeGreaterThan(0);
  });

  it('always shows the Chaldean compound beside its root', () => {
    // Without the compound the module is only Pythagorean with a different table.
    expect(profile.chaldean.display).toBe(
      `${profile.chaldean.compound}/${profile.chaldean.root}`,
    );
  });

  it('gives the matrix nine points, each a valid arcana', () => {
    expect(profile.destinyMatrix.points).toHaveLength(9);
    for (const p of profile.destinyMatrix.points) {
      expect(p.arcana).toBeGreaterThanOrEqual(1);
      expect(p.arcana).toBeLessThanOrEqual(22);
    }
  });

  it('produces a biorhythm series that can be plotted', () => {
    expect(profile.biorhythms.series.length).toBeGreaterThan(0);
    expect(profile.biorhythms.daysAlive).toBeGreaterThan(0);
  });
});
