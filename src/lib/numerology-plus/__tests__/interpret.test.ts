import { describe, it, expect } from 'vitest';
import { interpretProfile } from '../content/interpret';
import { fullProfile } from '../index';

describe('interpretProfile', () => {
  it('produces a card for every new number, in each language', () => {
    const p = fullProfile('Victor Ion Safta', { day: 25, month: 8, year: 1990 }, { gender: 'male' });
    for (const lang of ['ro', 'en', 'ru'] as const) {
      const cards = interpretProfile(p.pythagorean, lang);
      const keys = Array.isArray(cards) ? cards.map((c) => c.key) : Object.keys(cards);
      if (lang === 'ro') console.log('  carduri:', keys.join(', '));
      expect(keys.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('leaves no placeholder unresolved', () => {
    const p = fullProfile('Ana Popescu', { day: 3, month: 2, year: 1978 }, { gender: 'female' });
    for (const lang of ['ro', 'en', 'ru'] as const) {
      const cards = interpretProfile(p.pythagorean, lang);
      const all = JSON.stringify(cards);
      expect(all).not.toMatch(/\{(essence|strength|shadow|n|title)\}/);
      expect(all).not.toMatch(/undefined/);
    }
  });
});
