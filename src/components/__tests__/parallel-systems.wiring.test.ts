import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The wiring of chapter 5, asserted at the source.
 *
 * Rendering NumerologyResults whole would need a router, an AuthProvider that
 * calls the API on mount and a React Query client -- a brittle test for one
 * question. design-tokens.test.ts already reads source files and asserts about
 * their text; this is the same instrument aimed at the same kind of fact.
 *
 * What it protects: the engine's three parallel systems were computed and never
 * rendered for the whole life of numerology-plus, and a comment promised they
 * would be. The promise is not allowed back without the blocks.
 */

const ROOT = resolve(__dirname, "../../..");
const SOURCE = readFileSync(join(ROOT, "src/components/NumerologyResults.tsx"), "utf8");

describe("chapter 5 renders the parallel systems", () => {
  it("imports all three blocks", () => {
    for (const name of ["VedicNumbers", "KuaNumber", "KabbalahNumbers"]) {
      expect(SOURCE, name).toContain(`import { ${name} } from "@/components/numerology/${name}"`);
    }
  });

  it("renders all three", () => {
    expect(SOURCE).toContain("<VedicNumbers fullName={fullName} birthDate={birthDate} />");
    expect(SOURCE).toContain("<KuaNumber birthDate={birthDate} />");
    expect(SOURCE).toContain("<KabbalahNumbers fullName={fullName} />");
  });

  it("has stopped promising them for later", () => {
    expect(SOURCE).not.toContain("until then, the link is the entrance");
    expect(SOURCE).not.toContain("will render inline");
  });

  it("keeps the Chaldean page reachable", () => {
    // /chaldean carries the 52-entry compound table and the business-name
    // reading, which none of the three new blocks do. Cutting its only link
    // would orphan the page again.
    expect(SOURCE).toContain('to="/chaldean"');
  });

  it("names every new block in all three languages", () => {
    for (const key of ["vedic:", "kua:", "kabbalah:"]) {
      const occurrences = SOURCE.split(key).length - 1;
      // Once in sectionLabels, once in teasers.
      expect(occurrences, key).toBeGreaterThanOrEqual(2);
    }
    // No English fallback slipped in where a translation was meant to be.
    expect(SOURCE).not.toMatch(/\bkua: \{ ro: "([^"]*)", en: "\1"/);
  });
});
