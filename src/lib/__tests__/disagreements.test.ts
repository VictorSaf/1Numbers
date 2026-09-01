import { describe, it, expect } from "vitest";
import { findDisagreements } from "../disagreements";

/**
 * Locurile unde harta se răspunde singură de două ori.
 *
 * Motorul calculează același lucru pe mai multe căi, iar căile nu sunt de acord
 * întotdeauna. Fiecare răspuns stătea în colțul lui, iar dezacordul nu era
 * nicăieri: se vedea un an personal de 1 într-un capitol și o esență de 9 în
 * altul, fără nimic care să spună că vorbesc despre același an.
 *
 * Dezacordul nu e o eroare de calcul. Fiecare cale e corectă în sistemul ei;
 * ce diferă e din ce se citește.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);
type Lang = "ro" | "en" | "ru";

describe("findDisagreements", () => {
  it("compară patru perechi și absențele", () => {
    const d = findDisagreements(NAME, BIRTH, "ro", TODAY);

    expect(d.pairs.map((p) => p.key)).toEqual(["year", "path", "destiny", "seen"]);
    expect(d.missing).not.toBeNull();
  });

  it("pune amândouă răspunsurile, cu sursa fiecăruia", () => {
    for (const p of findDisagreements(NAME, BIRTH, "ro", TODAY).pairs) {
      for (const s of [p.a, p.b]) {
        expect(s.label.length, p.key).toBeGreaterThan(3);
        // Fără sursă, două cifre diferite arată ca o eroare de calcul.
        expect(s.from.length, p.key).toBeGreaterThan(6);
        expect(s.essence.length, p.key).toBeGreaterThan(15);
        expect(s.value).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("măsoară distanța și o numește", () => {
    for (const p of findDisagreements(NAME, BIRTH, "ro", TODAY).pairs) {
      expect(p.distance).toBe(Math.abs(p.a.value - p.b.value));
      const expected = p.distance === 0 ? "agree" : p.distance <= 2 ? "near" : "apart";
      expect(p.verdict, p.key).toBe(expected);
      expect(p.says.length).toBeGreaterThan(30);
    }
  });

  it("spune explicit că niciuna dintre căi nu e greșită, când se ceartă", () => {
    // Aserțiunea e pe prezența asigurării, nu pe absența unui cuvânt: prima
    // versiune căuta „greșit” și prindea chiar fraza „Niciuna nu e greșită”,
    // adică exact ce voia să apere.
    for (const p of findDisagreements(NAME, BIRTH, "ro", TODAY).pairs) {
      if (p.verdict === "apart") expect(p.says).toMatch(/niciuna nu e greșită/i);
    }
  });

  it("nu propune o medie între două sisteme", () => {
    // O medie între un 1 pitagoreic și un 5 caldeean n-ar însemna nimic.
    const d = findDisagreements(NAME, BIRTH, "ro", TODAY);
    expect(Object.keys(d.pairs[0])).not.toContain("average");
    expect(d.pairs.map((p) => p.says).join(" ")).not.toMatch(/medi[ea]|average/i);
  });

  it("compară absențele ca mulțimi, din două surse diferite", () => {
    const m = findDisagreements(NAME, BIRTH, "ro", TODAY).missing!;

    // Lecțiile karmice numără ce lipsește din NUME; Lo Shu, ce lipsește din DATĂ.
    expect(Array.isArray(m.fromName)).toBe(true);
    expect(Array.isArray(m.fromDate)).toBe(true);
    expect(m.both).toEqual(m.fromName.filter((n) => m.fromDate.includes(n)));
  });

  it("ridică ce lipsește din amândouă, fiindcă n-are sprijin de nicăieri", () => {
    const m = findDisagreements(NAME, BIRTH, "ro", TODAY).missing!;
    if (m.both.length) expect(m.says).toContain(String(m.both[0]));
  });

  it("dă același rezultat pentru aceeași hartă, altul pentru alta", () => {
    const a = findDisagreements(NAME, BIRTH, "ro", TODAY);
    const b = findDisagreements(NAME, BIRTH, "ro", TODAY);
    const c = findDisagreements("Ana Maria Pop", new Date(1993, 2, 4), "ro", TODAY);

    expect(a.pairs.map((p) => p.distance)).toEqual(b.pairs.map((p) => p.distance));
    expect(a.pairs.map((p) => `${p.a.value}-${p.b.value}`).join()).not.toBe(
      c.pairs.map((p) => `${p.a.value}-${p.b.value}`).join(),
    );
  });

  it.each<Lang>(["ro", "en", "ru"])("scrie tot, nevid, în %s", (lang) => {
    const d = findDisagreements(NAME, BIRTH, lang, TODAY);
    for (const p of d.pairs) {
      expect(`${p.question} ${p.says} ${p.a.label} ${p.b.label}`).not.toMatch(/undefined|\{|NaN/);
      expect(p.question.length).toBeGreaterThan(8);
    }
    expect(d.missing!.says).not.toMatch(/undefined|NaN/);
  });
});
