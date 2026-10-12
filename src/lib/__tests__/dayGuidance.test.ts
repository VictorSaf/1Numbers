import { describe, it, expect } from "vitest";
import {
  dayAdvice,
  dayColor,
  dayMusic,
  dayFocus,
  dayChallenge,
  dayOpportunity,
  type GuidanceLang,
} from "../dayGuidance";

/**
 * Conținutul zilei, în limba omului.
 *
 * Recomandările, culoarea și genurile erau scrise doar în engleză, iar
 * etichetele din jurul lor erau traduse: pagina în română arăta „Recomandări”
 * peste „Engage in creative activities”. Mai rău decât o pagină întreagă
 * într-o limbă, fiindcă pare o traducere abandonată la jumătate.
 */

const LANGS: GuidanceLang[] = ["ro", "en", "ru"];
const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Cuvinte care n-au ce căuta într-un text românesc sau rusesc. */
const ENGLISH = /\b(the|your|and|with|for|activities|yourself|through|everyday)\b/i;

describe("dayGuidance", () => {
  it.each(LANGS)("are sfaturi pentru toate cele nouă zile, în %s", (lang) => {
    for (const d of DAYS) {
      const a = dayAdvice(d, lang);
      expect(a.length, `ziua ${d}`).toBeGreaterThanOrEqual(3);
      for (const line of a) expect(line.length).toBeGreaterThan(15);
    }
  });

  it("nu lasă engleză în română sau rusă", () => {
    for (const lang of ["ro", "ru"] as GuidanceLang[]) {
      for (const d of DAYS) {
        const all = [
          ...dayAdvice(d, lang),
          ...dayMusic(d, lang),
          dayColor(d, lang).name,
          dayFocus(d, lang),
          dayChallenge(d, lang),
          dayOpportunity(d, lang),
        ].join(" ");
        expect(all, `${lang}/${d}`).not.toMatch(ENGLISH);
      }
    }
  });

  it("dă altă culoare pe nume în fiecare limbă, dar același hex", () => {
    // Culoarea nu are limbă; numele ei, da.
    for (const d of DAYS) {
      const hexes = new Set(LANGS.map((l) => dayColor(d, l).hex));
      const names = new Set(LANGS.map((l) => dayColor(d, l).name));
      expect(hexes.size, `ziua ${d}`).toBe(1);
      // Nu toate cele trei diferă: „Indigo” e același cuvânt în română și
      // engleză. Ce contează e că numele NU e același peste tot.
      expect(names.size, `ziua ${d}`).toBeGreaterThan(1);
    }
  });

  it("dă genuri muzicale pentru fiecare zi și limbă", () => {
    for (const lang of LANGS) {
      for (const d of DAYS) expect(dayMusic(d, lang).length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(LANGS)("spune ce cere ziua, ce se strică și ce se deschide, în %s", (lang) => {
    // Astea trei au stat în engleză în `predictions.ts` până la capăt, sub
    // titluri românești. Un tabel adăugat mai târziu într-o singură limbă e
    // exact felul în care se întâmplă din nou.
    for (const d of DAYS) {
      expect(dayFocus(d, lang).length, `focus ${d}`).toBeGreaterThan(3);
      expect(dayChallenge(d, lang).length, `provocare ${d}`).toBeGreaterThan(25);
      expect(dayOpportunity(d, lang).length, `oportunitate ${d}`).toBeGreaterThan(25);
    }
    // Nouă zile, nouă texte diferite -- nu o propoziție copiată de nouă ori.
    expect(new Set(DAYS.map((d) => dayChallenge(d, lang))).size).toBe(9);
    expect(new Set(DAYS.map((d) => dayOpportunity(d, lang))).size).toBe(9);
  });

  it("nu cade pe o cifră din afara intervalului", () => {
    expect(dayAdvice(99, "ro").length).toBeGreaterThan(0);
    expect(dayColor(0, "ro").hex).toMatch(/^#/);
  });
});
