import { describe, it, expect } from "vitest";
import { CATALOG } from "../patterns";
import { getAngelNumberMeaning } from "../index";

/**
 * Completitudinea conținutului, verificată prin baleiaj, nu prin eșantion.
 * Modelat după src/lib/numerology-plus/__tests__/content.test.ts: un text lipsă
 * într-o singură limbă a unui singur câmp e invizibil până când cineva alege
 * acea limbă, iar tot rostul compunerii era ca un gol să fie găsibil mecanic.
 */

const LANGS = ["ro", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const NO_PLACEHOLDER =
  /\{(sequence|digitA|digitB|titleA|titleB|essenceA|essenceB|strengthA|strengthB|shadowA|shadowB)\}/;

/** Interpretările scurte sunt exact critica pe care piața o aduce concurenților. */
const MIN_FULL_MEANING = 600;

const COVERED = CATALOG;

describe("catalogul", () => {
  it("acoperă toate cele douăzeci", () => {
    expect(COVERED).toHaveLength(35);
    for (const seq of COVERED) expect(getAngelNumberMeaning(seq), seq).not.toBeNull();
  });

  it.each(LANGS)("are toate câmpurile pline în %s", (lang: Lang) => {
    for (const seq of COVERED) {
      const m = getAngelNumberMeaning(seq)!;
      for (const field of ["title", "shortMessage", "fullMeaning", "spiritualSignificance"] as const) {
        expect(m[field][lang].trim().length, `${seq}/${lang} ${field} gol`).toBeGreaterThanOrEqual(10);
        expect(m[field][lang], `${seq}/${lang} ${field} placeholder`).not.toMatch(NO_PLACEHOLDER);
      }
      expect(m.keywords[lang], `${seq}/${lang} keywords`).toHaveLength(4);
      expect(m.actionAdvice[lang], `${seq}/${lang} advice`).toHaveLength(4);
      for (const line of m.actionAdvice[lang]) {
        expect(line, `${seq}/${lang} advice placeholder`).not.toMatch(NO_PLACEHOLDER);
      }
    }
  });

  it.each(LANGS)("dă o interpretare lungă în %s, nu un rând", (lang: Lang) => {
    for (const seq of COVERED) {
      const len = getAngelNumberMeaning(seq)!.fullMeaning[lang].length;
      expect(len, `${seq}/${lang} are ${len} caractere`).toBeGreaterThanOrEqual(MIN_FULL_MEANING);
    }
  });

  it("compune și o secvență din afara catalogului", () => {
    const m = getAngelNumberMeaning("77777");
    expect(m).not.toBeNull();
    expect(m!.number).toBe("77777");
    expect(m!.fullMeaning.ro).toContain("77777");
  });

  it("returnează null când nu e niciun tipar", () => {
    expect(getAngelNumberMeaning("4729")).toBeNull();
  });

  it("leagă un triplu de rudele lui", () => {
    expect(getAngelNumberMeaning("444")!.relatedNumbers).toEqual(["4", "44", "4444"]);
  });
});

describe("formele relaționale", () => {
  it("numește ambele cifre într-o alternanță", () => {
    const m = getAngelNumberMeaning("1212")!;
    expect(m.fullMeaning.ro).toContain("1212");
    expect(m.relatedNumbers).toEqual(["1", "2", "2121"]);
  });

  it("ia câte două cuvinte-cheie din fiecare cifră", () => {
    const m = getAngelNumberMeaning("1221")!;
    expect(m.keywords.ro).toHaveLength(4);
    expect(m.keywords.en).toHaveLength(4);
    expect(m.keywords.ru).toHaveLength(4);
  });

  it("citește un urcuș de la prima la ultima cifră", () => {
    const m = getAngelNumberMeaning("1234")!;
    expect(m.fullMeaning.en).toContain("1234");
    expect(m.frequency).toBe("rare");
  });

  it("compune o alternanță care nu e în catalog", () => {
    expect(getAngelNumberMeaning("3434")).not.toBeNull();
  });
});
