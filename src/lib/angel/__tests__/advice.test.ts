import { describe, it, expect } from "vitest";
import { DIGIT_ADVICE } from "../advice";

const LANGS = ["ro", "en", "ru"] as const;

describe("DIGIT_ADVICE", () => {
  it("acoperă toate cele zece cifre", () => {
    for (let n = 0; n <= 9; n++) expect(DIGIT_ADVICE[n], `cifra ${n}`).toBeTruthy();
  });

  it.each(LANGS)("dă exact trei sfaturi în %s, fiecare cu conținut", (lang) => {
    for (let n = 0; n <= 9; n++) {
      const lines = DIGIT_ADVICE[n][lang];
      expect(lines, `cifra ${n} / ${lang}`).toHaveLength(3);
      for (const line of lines) {
        expect(line.trim().length, `cifra ${n} / ${lang}: "${line}"`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("nu repetă același sfat la două cifre în aceeași limbă", () => {
    for (const lang of LANGS) {
      const all = Object.values(DIGIT_ADVICE).flatMap((a) => a[lang]);
      expect(new Set(all).size, lang).toBe(all.length);
    }
  });
});
