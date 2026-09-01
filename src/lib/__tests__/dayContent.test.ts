import { describe, it, expect } from "vitest";
import { getDayContent, DAY_ADVICE } from "../dayContent";
import type { Language } from "../translations";

/**
 * O zi nu e o singură cifră redusă.
 *
 * Pagina arăta ziua personală și atât. Ziua e compusă: ziua personală stă în
 * luna personală, care stă în anul personal, iar peste toate trece ziua
 * universală, care e a tuturor. Funcția asta le întoarce pe toate patru
 * împreună, plus textul, în limba cerută -- pentru că același conținut
 * pleacă și în interfață, și în notificarea de dimineață.
 *
 * Datele sunt fixe. O naștere fixă și o zi fixă dau numere fixe; `new Date()`
 * fără argument ar face aserțiunile vacue peste un an.
 */

const BIRTH = new Date(1990, 4, 15); // 15 mai 1990
const DAY = new Date(2026, 8, 1);    // 1 septembrie 2026
const LANGS: Language[] = ["ro", "en", "ru"];

describe("getDayContent", () => {
  it("compune ziua din patru numere, nu dintr-unul", () => {
    const content = getDayContent(BIRTH, DAY, "ro");
    // Luna 5 -> 5, ziua 15 -> 6, anul 2026 -> 10 -> 1; 5+6+1 = 12 -> 3.
    expect(content.personalYear).toBe(3);
    // 3 + 9 = 12 -> 3.
    expect(content.personalMonth).toBe(3);
    // 3 + 1 = 4.
    expect(content.personalDay).toBe(4);
    // Anul universal 2026 -> 10 -> 1; luna 1 + 9 = 10 -> 1; ziua 1 + 1 = 2.
    expect(content.universalDay).toBe(2);
  });

  it("întoarce ziua ca dată calendaristică, nu ca instant", () => {
    expect(getDayContent(BIRTH, DAY, "ro").date).toBe("2026-09-01");
  });

  it("ia textul zilei din motor, în limba cerută", () => {
    expect(getDayContent(BIRTH, DAY, "ro").keywords).toBe("Muncă, Fundament");
    expect(getDayContent(BIRTH, DAY, "en").keywords).toBe("Work, Foundation");
    expect(getDayContent(BIRTH, DAY, "ru").keywords).toBe("Работа, Основа");
  });

  it("dă înțelesul zilei, nu al lunii", () => {
    expect(getDayContent(BIRTH, DAY, "ro").meaning).toBe(
      "Zi pentru muncă practică, organizare și construirea fundamentelor solide.",
    );
  });

  it("dă sfatul numărului zilei", () => {
    expect(getDayContent(BIRTH, DAY, "ro").advice).toBe(DAY_ADVICE[4].ro);
    expect(getDayContent(BIRTH, DAY, "ru").advice).toBe(DAY_ADVICE[4].ru);
  });

  it("păstrează orele venite din motor", () => {
    expect(getDayContent(BIRTH, DAY, "en").luckyHours).toEqual(["7:00", "12:00", "16:00"]);
  });

  it("dă alt conținut pentru altă zi", () => {
    const first = getDayContent(BIRTH, DAY, "ro");
    const second = getDayContent(BIRTH, new Date(2026, 8, 2), "ro");
    expect(second.personalDay).toBe(5);
    expect(second.advice).not.toBe(first.advice);
  });

  it("dă alt conținut pentru altă naștere, în aceeași zi", () => {
    const other = getDayContent(new Date(1975, 10, 3), DAY, "ro");
    expect(other.personalDay).not.toBe(4);
    // Ziua universală nu depinde de naștere.
    expect(other.universalDay).toBe(2);
  });
});

describe("DAY_ADVICE", () => {
  it("acoperă toate cele nouă numere", () => {
    expect(Object.keys(DAY_ADVICE).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(LANGS)("are text în %s pentru fiecare număr", (lang) => {
    const missing = Object.entries(DAY_ADVICE)
      .filter(([, byLang]) => !byLang[lang]?.trim())
      .map(([n]) => n);
    expect(missing).toEqual([]);
  });

  it("nu repetă engleza în locul celorlalte limbi", () => {
    for (const [number, byLang] of Object.entries(DAY_ADVICE)) {
      expect(byLang.ro, `ziua ${number} în ro`).not.toBe(byLang.en);
      expect(byLang.ru, `ziua ${number} în ru`).not.toBe(byLang.en);
    }
  });
});
