import { describe, it, expect } from "vitest";
import { findCoupleDisagreements } from "../coupleDisagreements";

/**
 * Unde cele două hărți se judecă de două ori.
 *
 * Pagina arăta un procent și componentele lui. Dar procentul e o medie
 * ponderată, iar o medie ascunde exact ce e interesant: două perechi cu
 * același 72% pot fi una echilibrată pe toate liniile și alta ruptă în două.
 * Aceeași cifră, două relații complet diferite.
 *
 * Peste asta, tradiția vedică judecă aceeași pereche prin alt criteriu -- nu un
 * scor, ci prietenie sau dușmănie între planetele zilelor de naștere -- și
 * poate spune „dușmani” acolo unde matricea pitagoreică dă 80.
 */

const A = { name: "Victor Ion Safta", birthDate: new Date(1990, 7, 25) };
const B = { name: "Ana Maria Pop", birthDate: new Date(1993, 2, 4) };
type Lang = "ro" | "en" | "ru";

describe("findCoupleDisagreements", () => {
  it("măsoară cât ascunde media", () => {
    const { spread } = findCoupleDisagreements(A, B, "ro");

    expect(spread.parts).toHaveLength(4);
    expect(spread.range).toBe(spread.best.score - spread.worst.score);
    expect(spread.best.score).toBeGreaterThanOrEqual(spread.worst.score);
  });

  it("numește regimul după cât de departe sunt liniile", () => {
    const { spread } = findCoupleDisagreements(A, B, "ro");
    const expected = spread.range < 15 ? "aligned" : spread.range < 35 ? "mixed" : "split";
    expect(spread.agreement).toBe(expected);
    expect(spread.says.length).toBeGreaterThan(40);
  });

  it("spune care linie e cea bună și care e cea slabă, pe nume", () => {
    const { spread } = findCoupleDisagreements(A, B, "ro");
    if (spread.agreement !== "aligned") {
      expect(spread.says).toContain(spread.best.label);
      expect(spread.says).toContain(spread.worst.label);
    }
  });

  it("judecă perechea și prin tradiția vedică, care nu dă un scor", () => {
    const { traditions } = findCoupleDisagreements(A, B, "ro");

    expect(["friends", "neutral", "enemies"]).toContain(traditions.vedic.relation);
    expect(traditions.pythagorean.score).toBeGreaterThan(0);
    // Fără sursă, două verdicte diferite arată ca o eroare.
    expect(traditions.pythagorean.reads.length).toBeGreaterThan(8);
    expect(traditions.vedic.reads).toMatch(/↔/);
  });

  it("spune când cele două tradiții nu sunt de acord, fără să aleagă una", () => {
    const { traditions } = findCoupleDisagreements(A, B, "ro");
    expect(traditions.says.length).toBeGreaterThan(40);
    expect(traditions.says).not.toMatch(/medi[ea]|mai corect|adevărat[ăa] e/i);
  });

  it("dă același rezultat pentru aceeași pereche, altul pentru alta", () => {
    const x = findCoupleDisagreements(A, B, "ro");
    const y = findCoupleDisagreements(A, B, "ro");
    const z = findCoupleDisagreements(A, { name: "Ion Popescu", birthDate: new Date(1980, 0, 1) }, "ro");

    expect(x.spread.score).toBe(y.spread.score);
    expect(`${x.spread.score}-${x.traditions.vedic.relation}`).not.toBe(
      `${z.spread.score}-${z.traditions.vedic.relation}`,
    );
  });

  it.each<Lang>(["ro", "en", "ru"])("scrie tot, nevid, în %s", (lang) => {
    const d = findCoupleDisagreements(A, B, lang);
    const all = `${d.spread.says} ${d.traditions.says} ${d.traditions.question} ${d.traditions.vedic.reads}`;
    expect(all).not.toMatch(/undefined|NaN|\{/);
    for (const p of d.spread.parts) expect(p.label.length).toBeGreaterThan(3);
  });
});
