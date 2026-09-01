import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VedicNumbers } from "../VedicNumbers";
import { vedicProfile, NAVAGRAHA } from "@/lib/numerology-plus/systems";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { PLANETS } from "../VedicNumbers";

/**
 * The engine's own suite proves the arithmetic. This proves the block shows
 * the numbers the engine actually computed, for a name and a date fixed here
 * -- `new Date()` with no arguments would make every assertion below expire.
 */

const NAME = "Victor Ion Safta";
const AGREE = new Date(1990, 7, 25);   // bhagyank 7, Life Path 7 -- the two agree
const DIVERGE = new Date(1993, 2, 4);  // bhagyank 2, Life Path 11 -- they do not

const draw = (birthDate: Date) =>
  render(
    <LanguageProvider>
      <VedicNumbers fullName={NAME} birthDate={birthDate} />
    </LanguageProvider>,
  );

const figure = (c: HTMLElement, key: string) =>
  Number(c.querySelector(`[data-figure="${key}"]`)?.textContent);

describe("VedicNumbers", () => {
  it("shows the three numbers the engine computed", () => {
    const { container } = draw(AGREE);
    const engine = vedicProfile(NAME, toBirthDate(AGREE));
    expect(figure(container, "mulank")).toBe(engine.mulank);
    expect(figure(container, "bhagyank")).toBe(engine.bhagyank);
    expect(figure(container, "naamank")).toBe(engine.naamank.root);
    expect(figure(container, "naamank-compound")).toBe(engine.naamank.compound);
    // The fixture, spelled out, so a change in the engine is visible here.
    expect(figure(container, "mulank")).toBe(7);
    expect(figure(container, "naamank-compound")).toBe(53);
  });

  it("names the planet the engine assigns to each number", () => {
    const { container } = draw(AGREE);
    const engine = vedicProfile(NAME, toBirthDate(AGREE));
    const text = container.textContent ?? "";
    expect(text).toContain(engine.planets.mulank.sanskrit);   // Ketu
    expect(text).toContain(engine.planets.naamank.sanskrit);  // Shani
  });

  it("keeps its planet table pinned to the engine's", () => {
    // NAVAGRAHA is Romanian-only and the engine is read-only, so the block
    // carries its own three-language table. If the two ever drift apart, this
    // fails instead of the wrong planet reaching the screen.
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(PLANETS[n].sanskrit, `planet ${n}`).toBe(NAVAGRAHA[n].sanskrit);
    }
  });

  it("marks each relation with the engine's verdict", () => {
    const { container } = draw(DIVERGE);
    const engine = vedicProfile(NAME, toBirthDate(DIVERGE));
    for (const key of ["nameToMulank", "nameToBhagyank", "mulankToBhagyank"] as const) {
      const node = container.querySelector(`[data-relation="${key}"]`);
      expect(node, key).toBeTruthy();
      expect(node!.getAttribute("data-verdict"), key).toBe(engine.harmony[key]);
    }
    // This fixture is the one that reaches all three verdicts.
    expect(container.querySelector('[data-verdict="friend"]')).toBeTruthy();
    expect(container.querySelector('[data-verdict="enemy"]')).toBeTruthy();
    expect(container.querySelector('[data-verdict="neutral"]')).toBeTruthy();
  });

  it("puts Bhagyank beside the Life Path and explains the drift", () => {
    const { container } = draw(DIVERGE);
    expect(figure(container, "drift-bhagyank")).toBe(2);
    expect(figure(container, "drift-lifepath")).toBe(lifePath(toBirthDate(DIVERGE)).value);
    expect(figure(container, "drift-lifepath")).toBe(11);
    // The reader is owed the reason, not a bare contradiction.
    expect(container.textContent ?? "").toMatch(/deodată|at once|разом/);
  });

  it("says so when the two methods agree, rather than explaining a drift that is not there", () => {
    const { container } = draw(AGREE);
    expect(figure(container, "drift-bhagyank")).toBe(figure(container, "drift-lifepath"));
    expect(container.textContent ?? "").toMatch(/același număr|the same number|одно и то же число/);
  });

  it("renders every figure through the tabular class", () => {
    const { container } = draw(AGREE);
    for (const key of ["mulank", "bhagyank", "naamank", "naamank-compound"]) {
      expect(container.querySelector(`[data-figure="${key}"]`)?.className, key).toContain("num");
    }
  });
});
