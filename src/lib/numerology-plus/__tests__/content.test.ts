import { describe, it, expect } from "vitest";
import { ARCANA, ARCANA_BY_N, MATRIX_POSITION_FRAME } from "../content/arcana";
import { ARCHETYPES, archetypeFor } from "../content/archetypes";
import { FRAMES } from "../content/frames";
import { LETTER_MEANINGS } from "../content/letters";
import { interpret, interpretLetter } from "../content/interpret";

/**
 * Content completeness.
 *
 * The engine shipped a standalone checker in content/check.ts, but nothing ran
 * it, so the arcana -- 22 entries across three languages and five fields -- had
 * no verification at all. A test file that never runs looks exactly like one
 * that passes.
 *
 * This walks every combination rather than sampling. Missing copy in one
 * language of one field is invisible until a user picks that language, and the
 * whole point of composing interpretations from archetype plus frame was that a
 * gap should be findable mechanically.
 */

const LANGS = ["ro", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const filled = (v: unknown, min = 3) => typeof v === "string" && v.trim().length >= min;
const NO_PLACEHOLDER = /\{(essence|strength|shadow|n|title|label|question)\}/;

describe("archetypes", () => {
  // ARCHETYPES is a list of thirteen; the mapping from a numerology value to one
  // of them lives in archetypeFor, which also reduces anything unrecognised. What
  // matters is that every value a calculation can produce resolves to an entry.
  const VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

  it("resolves every value a calculation can produce", () => {
    expect(ARCHETYPES).toHaveLength(13);
    for (const n of VALUES) expect(archetypeFor(n), `archetype for ${n}`).toBeTruthy();
  });

  it("reduces an unrecognised total rather than failing", () => {
    expect(archetypeFor(47)).toBe(archetypeFor(2)); // 47 -> 11 -> 2
  });

  it.each(LANGS)("is complete in %s", (lang: Lang) => {
    for (const [n, a] of ARCHETYPES.entries()) {
      expect(filled(a.title[lang]), `archetype ${n} title`).toBe(true);
      expect(filled(a.essence[lang], 10), `archetype ${n} essence`).toBe(true);
      expect(filled(a.strength[lang], 10), `archetype ${n} strength`).toBe(true);
      expect(filled(a.shadow[lang], 10), `archetype ${n} shadow`).toBe(true);
      expect(a.keywords[lang], `archetype ${n} keywords`).toHaveLength(4);
    }
  });
});

describe("every frame against every archetype, in every language", () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

  it("resolves without leaving a placeholder or an empty field", () => {
    let combinations = 0;
    for (const frame of FRAMES) {
      for (const value of values) {
        for (const lang of LANGS) {
          const out = interpret(frame.key, value, lang);
          expect(out, `${frame.key} / ${value} / ${lang}`).not.toBeNull();
          const r = out!;
          for (const [field, text] of Object.entries({
            label: r.label, question: r.question, title: r.title,
            lead: r.lead, works: r.works, breaks: r.breaks,
          })) {
            expect(filled(text), `${frame.key}/${value}/${lang} ${field} empty`).toBe(true);
            expect(text, `${frame.key}/${value}/${lang} ${field} placeholder`).not.toMatch(NO_PLACEHOLDER);
          }
          expect(r.keywords.length, `${frame.key}/${value}/${lang} keywords`).toBe(4);
          combinations++;
        }
      }
    }
    // 14 frames x 13 values x 3 languages; a shrinking number means content was lost.
    expect(combinations).toBeGreaterThanOrEqual(14 * 13 * 3);
  });
});

describe("arcana", () => {
  it("has all 22, indexed by number", () => {
    expect(ARCANA).toHaveLength(22);
    for (let n = 1; n <= 22; n++) expect(ARCANA_BY_N[n], `arcana ${n}`).toBeTruthy();
  });

  it.each(LANGS)("is complete in %s", (lang: Lang) => {
    for (const a of ARCANA) {
      expect(filled(a.title[lang]), `arcana ${a.n} title`).toBe(true);
      expect(a.keywords[lang], `arcana ${a.n} keywords`).toHaveLength(4);
      for (const field of ["light", "shadow", "task"] as const) {
        expect(filled(a[field][lang], 10), `arcana ${a.n} ${field}`).toBe(true);
      }
    }
  });

  it.each(LANGS)("has a frame for each of the nine octagram positions in %s", (lang: Lang) => {
    for (const key of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
      expect(filled(MATRIX_POSITION_FRAME[key]?.[lang]), `position ${key}`).toBe(true);
    }
  });
});

describe("letters", () => {
  it("covers the whole alphabet", () => {
    expect(LETTER_MEANINGS).toHaveLength(26);
  });

  it.each(LANGS)("interprets every letter in %s", (lang: Lang) => {
    for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      const out = interpretLetter("cornerstone", ch, lang);
      expect(out, `letter ${ch}`).toBeTruthy();
      expect(JSON.stringify(out), `letter ${ch}`).not.toMatch(NO_PLACEHOLDER);
    }
  });
});
