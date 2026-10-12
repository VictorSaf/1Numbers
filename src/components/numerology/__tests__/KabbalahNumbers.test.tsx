import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KabbalahNumbers } from "../KabbalahNumbers";
import { popularKabbalah, hebrewGematria } from "@/lib/numerology-plus/systems";

/**
 * Two systems that share a name and nothing else. The block's whole job is to
 * show both and to say they are unrelated, so that is what this asserts --
 * alongside the numbers being the engine's rather than something rendered
 * nearby.
 */

const NAME = "Victor Ion Safta";

const draw = () =>
  render(
    <LanguageProvider>
      <KabbalahNumbers fullName={NAME} />
    </LanguageProvider>,
  );

const figure = (c: HTMLElement, key: string) =>
  Number(c.querySelector(`[data-figure="${key}"]`)?.textContent);

describe("KabbalahNumbers", () => {
  it("shows the popular figures the engine computed", () => {
    const { container } = draw();
    const engine = popularKabbalah(NAME);
    expect(figure(container, "popular-total")).toBe(engine.total);
    expect(figure(container, "popular-value")).toBe(engine.value);
    expect(figure(container, "popular-total")).toBe(64);
    expect(figure(container, "popular-value")).toBe(1);
  });

  it("shows the gematria figures the engine computed", () => {
    const { container } = draw();
    const engine = hebrewGematria(NAME);
    expect(figure(container, "hebrew-total")).toBe(engine.total);
    expect(figure(container, "hebrew-reduced")).toBe(engine.reduced);
    expect(figure(container, "hebrew-total")).toBe(464);
    expect(figure(container, "hebrew-reduced")).toBe(5);
  });

  it("prints the transliteration the engine produced, right to left", () => {
    const { container } = draw();
    const node = container.querySelector('[data-figure="hebrew-letters"]');
    expect(node?.textContent).toBe(hebrewGematria(NAME).hebrew);
    expect(node?.textContent).toBe("ביכטוריונסאפטא");
    // Hebrew rendered left-to-right is the wrong string on screen.
    expect(node?.getAttribute("dir")).toBe("rtl");
  });

  it("says the two systems are unrelated", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /nicio legătură|nothing to do with each other|никак не связаны/i,
    );
  });

  it("admits the transliteration is approximate", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /aproximativă|approximate|приблизительна/i,
    );
  });

  it("renders every figure through the tabular class", () => {
    const { container } = draw();
    for (const key of ["popular-total", "popular-value", "hebrew-total", "hebrew-reduced"]) {
      expect(container.querySelector(`[data-figure="${key}"]`)?.className, key).toContain("num");
    }
  });
});
