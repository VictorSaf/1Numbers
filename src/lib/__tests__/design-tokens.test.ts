import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The design system, asserted where it can be asserted.
 *
 * Stage 9f8f30b moved the application onto tokens and the charts were missed,
 * so under a light theme they stayed coloured for a dark one. These check the
 * things a type-checker cannot: that no component names a colour, that the
 * heading face covers the alphabets the product is written in, and that there
 * are two palettes rather than four names for two palettes.
 */

const ROOT = resolve(__dirname, "../../..");
const CSS = readFileSync(join(ROOT, "src/index.css"), "utf8");

// Comments name what was removed, on purpose. Assertions about what the
// stylesheet *does* have to read the declarations, not the prose about them.
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, "");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === "__tests__" ? [] : sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });

describe("colours live in tokens", () => {
  it("no component or page names an hsl colour of its own", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles(join(ROOT, "src/components")), ...sourceFiles(join(ROOT, "src/pages"))]) {
      const source = readFileSync(file, "utf8");
      for (const [i, line] of source.split("\n").entries()) {
        // Comments may quote the colours that were removed.
        if (/^\s*(\*|\/\/)/.test(line)) continue;
        const literal = line.match(/hsla?\((?!var\(--)[^)]*\)/);
        if (literal) offenders.push(`${file.replace(ROOT + "/", "")}:${i + 1}  ${literal[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  // `.on-plate` REMAPS tokens for the always-dark plate surface; it does not
  // define a palette. Counting palettes has to skip it, or the count says five.
  const ON_PLATE = RULES.slice(RULES.indexOf(".on-plate {"), RULES.indexOf("}", RULES.indexOf(".on-plate {")) + 1);
  const PALETTES = RULES.replace(ON_PLATE, "");

  it("defines tension and harmony in every palette", () => {
    // The relations between numbers used to be drawn in the accent, so nothing
    // distinguished a wide bridge from an aligned one.
    for (const token of ["--tension", "--tension-soft", "--harmony", "--harmony-soft"]) {
      const declarations = PALETTES.match(new RegExp(`${token}:`, "g")) ?? [];
      expect(declarations.length, `${token} declarations`).toBe(4);
    }
  });

  it("keeps the plate scope a remapping, never a fifth palette", () => {
    // Every value in it must point at another token. The moment one carries a
    // raw triple, the plate has its own colours and the four palettes are five.
    expect(ON_PLATE, ".on-plate block").toContain("--plate");
    for (const [, value] of ON_PLATE.matchAll(/--[\w-]+:\s*([^;]+);/g)) {
      expect(value.trim(), "value in .on-plate").toMatch(/^var\(--[\w-]+\)$/);
    }
  });

  it("keeps them clear of the alarm colours", () => {
    // A bridge of 6 is a distance, not an error. If tension drifted into the
    // hue of --crit or --warn it would read as one.
    const hue = (token: string) => Number(CSS.match(new RegExp(`${token}: (\\d+)`))![1]);
    const distance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

    for (const alarm of ["--crit", "--warn", "--ok"]) {
      expect(distance(hue("--tension"), hue(alarm)), `tension vs ${alarm}`).toBeGreaterThan(40);
    }
  });
});

describe("the heading face", () => {
  it("is Literata, with a Cyrillic subset", () => {
    // Cinzel had no Cyrillic at all: every Russian heading fell through to a
    // system serif, in an application that ships in three languages.
    expect(CSS).toContain("--font-heading: 'Literata'");
    expect(CSS).toMatch(/literata-variable-cyrillic\.woff2/);
    expect(CSS).toMatch(/literata-variable-latin\.woff2/);
    expect(CSS).toMatch(/literata-variable-latin-ext\.woff2/);
    expect(RULES).not.toContain("Cinzel");
  });

  it("declares one file per subset rather than one per weight", () => {
    const faces = CSS.match(/font-family: 'Literata'/g) ?? [];
    expect(faces).toHaveLength(3);
    // Cinzel shipped eight files that were two: the four latin weights were
    // byte-identical copies of one variable font declared as four static ones.
    expect(CSS).toMatch(/font-weight: 400 700;/);
  });
});

describe("two themes, not four names for two", () => {
  it("has no theme classes left", () => {
    expect(RULES).not.toMatch(/\.theme-[a-z]+/);
  });

  it("answers light and dark, and follows the system when neither is chosen", () => {
    expect(CSS).toContain(':root[data-theme="light"]');
    expect(CSS).toContain(':root[data-theme="dark"]');
    expect(CSS).toContain("@media (prefers-color-scheme: dark)");
  });

  it("respects a reduced-motion preference", () => {
    expect(CSS).toContain("@media (prefers-reduced-motion: reduce)");
    // And the switch that used to do this, on a screen nobody could open, is gone.
    expect(RULES).not.toContain(".no-animations");
  });
});

describe("reduced motion does not hide the page", () => {
  const RULES = readFileSync(join(ROOT, "src/index.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const block = RULES.slice(RULES.indexOf("@media (prefers-reduced-motion: reduce)"));

  it("shows what an entrance animation was going to reveal", () => {
    // Almost every block on the reading page is `opacity-0 animate-fade-in`:
    // invisible until an animation brings it in. Shortening that animation to
    // 0.01ms does not reliably leave the forwards fill applied, so the entire
    // result page rendered blank for anyone who had asked for less motion.
    // Measured in Chromium: five cards and thirteen blocks at opacity 0.
    for (const utility of [".animate-fade-in", ".animate-slide-up", ".animate-scale-in"]) {
      expect(block, utility).toContain(utility);
    }
    expect(block).toMatch(/opacity: 1 !important/);
    expect(block).toMatch(/animation: none !important/);
  });
});
