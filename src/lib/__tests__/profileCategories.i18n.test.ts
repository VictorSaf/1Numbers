import { describe, it, expect } from 'vitest';
import { getTranslation, type Language } from '../translations';
import { PROFILE_CATEGORIES } from '../profileCategories';

/**
 * `translations.test.ts` verifică deja paritatea de chei între cele trei limbi.
 * Ce verifică fișierul ăsta e altceva: că fiecare categorie are o etichetă și
 * un indiciu, și că traducerile chiar diferă între limbi -- o cheie copiată din
 * engleză în rusă trece testul de paritate și cade pe cititor.
 */

const LANGS: Language[] = ['ro', 'en', 'ru'];

describe('fiecare categorie își spune numele în trei limbi', () => {
  it.each(LANGS)('%s are etichetă pentru fiecare categorie', (lang) => {
    const t = getTranslation(lang);
    for (const category of PROFILE_CATEGORIES) {
      expect(t.people.categories[category], `${lang}.people.categories.${category}`).toBeTruthy();
      expect(t.people.categoryHints[category], `${lang}.people.categoryHints.${category}`).toBeTruthy();
    }
  });

  it('nu repetă aceeași etichetă în toate cele trei limbi', () => {
    for (const category of PROFILE_CATEGORIES) {
      const labels = LANGS.map((lang) => getTranslation(lang).people.categories[category]);
      expect(new Set(labels).size, `categories.${category}`).toBe(3);
    }
  });

  it('spune în fiecare limbă că datele sunt ale altcuiva', () => {
    for (const lang of LANGS) {
      expect(getTranslation(lang).people.aboutSomeoneElse.length).toBeGreaterThan(20);
    }
  });
});
