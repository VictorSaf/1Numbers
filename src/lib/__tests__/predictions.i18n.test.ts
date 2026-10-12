import { describe, it, expect } from "vitest";
import {
  getMonthlyPrediction,
  calculateWeeklyTheme,
  calculateMonthlyFocus,
  getMonthlyRecommendations,
  calculateAnnualTheme,
  calculateAnnualOpportunities,
  calculateAnnualChallenges,
} from "../predictions";
import { calculatePersonalDayNumber, calculatePersonalMonthNumber } from "../personalCycles";
import { calculatePersonalYearNumber } from "../numerology";
import type { Language } from "../translations";

/**
 * Luna, săptămâna și anul de pe /azi, în limba omului.
 *
 * Tabelele din `predictions.ts` erau scrise numai în engleză, iar pagina le
 * punea sub titluri românești: „Luna Curentă" deasupra lui „New Beginnings".
 * Iar săptămâna făcea media celor șapte zile personale -- o cifră care nu
 * există nicăieri în calcul (doctrina, R1: nu facem medii).
 */

/** Cuvinte care n-au ce căuta într-un text românesc sau rusesc. `\b` din JS
 *  vede doar ASCII -- „forța" ar da „for" urmat de graniță -- deci granițele
 *  sunt pe orice literă Unicode. */
const ENGLISH = /(?<!\p{L})(the|your|and|with|for|of|new|week|year|month|beginnings|avoid|focus|time)(?!\p{L})/iu;

// Câte o dată de naștere pentru fiecare an personal 1..9 în 2026.
const births: Date[] = [];
for (let d = 1; births.length < 9 && d <= 400; d++) {
  const b = new Date(1980, 0, d);
  const py = calculatePersonalYearNumber(b, 2026);
  if (!births.some((x) => calculatePersonalYearNumber(x, 2026) === py)) births.push(b);
}

const textOf = (lang: Language, birth: Date): string[] => {
  const m = getMonthlyPrediction(birth, 3, 2026, lang);
  const w = calculateWeeklyTheme(birth, new Date(2026, 2, 2), lang);
  const a = calculateAnnualTheme(birth, 2026, lang);
  return [
    m.theme, m.overview, m.career, m.relationships, m.health, m.finances, m.spirituality,
    w.monthTheme,
    ...w.days.map((d) => d.line),
    ...calculateMonthlyFocus(birth, 3, 2026, lang),
    ...getMonthlyRecommendations(birth, 3, 2026, lang),
    a.theme, a.description,
    ...calculateAnnualOpportunities(birth, 2026, lang),
    ...calculateAnnualChallenges(birth, 2026, lang),
  ];
};

describe("predictions — limbă", () => {
  it("acoperă toți anii personali 1..9", () => {
    expect(new Set(births.map((b) => calculatePersonalYearNumber(b, 2026))).size).toBe(9);
  });

  it.each(["ro", "ru"] as Language[])("nu lasă engleză în %s", (lang) => {
    for (const b of births) {
      const english = new Set(textOf("en", b));
      for (const line of textOf(lang, b)) {
        expect(line.length, `${lang}: gol`).toBeGreaterThan(2);
        expect(english.has(line), `${lang}: „${line}" e textul englezesc`).toBe(false);
        expect(line, `${lang}: „${line}"`).not.toMatch(ENGLISH);
      }
    }
  });

  it("are diacritice în română și chirilice în rusă", () => {
    const ro = births.flatMap((b) => textOf("ro", b)).join(" ");
    const ru = births.flatMap((b) => textOf("ru", b)).join(" ");
    expect(ro).toMatch(/[ăâîșțĂÂÎȘȚ]/);
    expect(ru).toMatch(/[а-яё]/i);
  });

  it("vorbește engleză în en, implicit", () => {
    const b = births[0];
    expect(getMonthlyPrediction(b, 3, 2026).theme).toBe(getMonthlyPrediction(b, 3, 2026, "en").theme);
    expect(calculateAnnualTheme(b, 2026).theme).toMatch(/[a-z]/i);
  });
});

describe("săptămâna — fără medie", () => {
  const birth = new Date(1985, 6, 23);
  const monday = new Date(2026, 9, 12);

  it("arată cele șapte zile personale, fiecare cu cifra ei", () => {
    const w = calculateWeeklyTheme(birth, monday, "ro");
    expect(w.days).toHaveLength(7);
    w.days.forEach((d, i) => {
      const expected = new Date(2026, 9, 12 + i);
      expect(d.date.getDate()).toBe(expected.getDate());
      expect(d.personalDay).toBe(calculatePersonalDayNumber(birth, expected));
      expect(d.line.length).toBeGreaterThan(10);
    });
  });

  it("e încadrată de luna personală, nu de o cifră sintetică", () => {
    const w = calculateWeeklyTheme(birth, monday, "ro");
    expect(w.personalMonth).toBe(calculatePersonalMonthNumber(birth, 2026, 10));
    expect(w.monthTheme).toBe(getMonthlyPrediction(birth, 10, 2026, "ro").theme);
    // Câmpurile care purtau media au dispărut.
    for (const k of ["theme", "overallEnergy", "keyEvents", "focusAreas", "advice"]) {
      expect(w).not.toHaveProperty(k);
    }
  });

  it("o săptămână peste granița lunii ia luna fiecărei zile", () => {
    const w = calculateWeeklyTheme(birth, new Date(2026, 9, 29), "en");
    const nov2 = w.days[4];
    expect(nov2.date.getMonth()).toBe(10);
    expect(nov2.personalDay).toBe(calculatePersonalDayNumber(birth, new Date(2026, 10, 2)));
  });
});
