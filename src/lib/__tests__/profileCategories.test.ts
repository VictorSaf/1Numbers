import { describe, it, expect } from 'vitest';
import {
  PROFILE_CATEGORIES,
  DEFAULT_CATEGORY,
  isProfileCategory,
  normalizeCategory,
  isAboutSomeoneElse,
  groupProfilesByCategory,
} from '../profileCategories';

/**
 * Categoria vine de pe rețea, deci poate fi orice. Modulul ăsta e locul unde
 * „orice" devine una dintre cele patru valori, o singură dată, ca restul
 * aplicației să nu mai verifice.
 */

describe('setul de categorii', () => {
  it('are exact cele patru valori, în ordinea în care se afișează', () => {
    expect(PROFILE_CATEGORIES).toEqual(['eu', 'apropiat', 'copil', 'afacere']);
  });

  it('are eu ca implicită', () => {
    expect(DEFAULT_CATEGORY).toBe('eu');
  });
});

describe('normalizarea', () => {
  it('recunoaște fiecare valoare validă', () => {
    for (const category of PROFILE_CATEGORIES) {
      expect(isProfileCategory(category)).toBe(true);
    }
  });

  it('respinge orice altceva', () => {
    for (const value of ['pisica', '', null, undefined, 7, {}]) {
      expect(isProfileCategory(value)).toBe(false);
    }
  });

  it('cade înapoi pe eu pentru o valoare pe care n-o cunoaște', () => {
    expect(normalizeCategory('pisica')).toBe('eu');
    expect(normalizeCategory(undefined)).toBe('eu');
    expect(normalizeCategory(null)).toBe('eu');
  });

  it('lasă valorile bune neatinse', () => {
    expect(normalizeCategory('copil')).toBe('copil');
  });
});

describe('a cui e harta', () => {
  it('spune că eu nu e despre altcineva', () => {
    expect(isAboutSomeoneElse('eu')).toBe(false);
  });

  it('spune că restul sunt', () => {
    expect(isAboutSomeoneElse('apropiat')).toBe(true);
    expect(isAboutSomeoneElse('copil')).toBe(true);
    expect(isAboutSomeoneElse('afacere')).toBe(true);
  });

  it('tratează o categorie necunoscută drept a mea, nu a altcuiva', () => {
    // Un fals „e a altcuiva" ar pune nota de confidențialitate pe harta
    // proprie; căderea pe eu e cea care nu minte pe nimeni.
    expect(isAboutSomeoneElse('pisica')).toBe(false);
  });
});

describe('gruparea', () => {
  const profiles = [
    { id: '1', category: 'copil' },
    { id: '2', category: 'eu' },
    { id: '3', category: 'copil' },
    { id: '4', category: null },
  ];

  it('grupează în ordinea categoriilor, nu în cea a intrărilor', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups.map((g) => g.category)).toEqual(['eu', 'copil']);
  });

  it('duce profilurile fără categorie la eu', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups[0].profiles.map((p) => p.id)).toEqual(['2', '4']);
  });

  it('păstrează ordinea din listă înăuntrul unui grup', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups[1].profiles.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('nu întoarce grupuri goale', () => {
    const groups = groupProfilesByCategory([{ id: '1', category: 'afacere' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('afacere');
  });

  it('întoarce o listă goală pentru nicio hartă', () => {
    expect(groupProfilesByCategory([])).toEqual([]);
  });
});
