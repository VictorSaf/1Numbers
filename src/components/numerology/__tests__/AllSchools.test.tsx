import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AllSchools } from "../AllSchools";
import { compareAll } from "@/lib/models/elements";

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);

const show = () =>
  render(
    <LanguageProvider>
      <AllSchools fullName={NAME} birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

describe("AllSchools", () => {
  it("arată fiecare întrebare, cu fiecare școală și cu propoziția ei", () => {
    const { container } = show();
    const lang = (document.documentElement.lang || "ro").slice(0, 2) as "ro" | "en" | "ru";
    const data = compareAll(NAME, BIRTH, { today: TODAY, lang: ["ro", "en", "ru"].includes(lang) ? lang : "ro" });
    expect(container.querySelectorAll("[data-comparison]")).toHaveLength(data.length);
    for (const c of data) {
      const row = container.querySelector(`[data-comparison="${c.key}"]`)!;
      expect(row.querySelectorAll("[data-model]")).toHaveLength(c.models.length);
    }
  });

  it("pune matricea distanțelor doar unde trei sau mai multe școli se despart", () => {
    const { container } = show();
    const data = compareAll(NAME, BIRTH, { today: TODAY, lang: "ro" });
    for (const c of data) {
      const row = container.querySelector(`[data-comparison="${c.key}"]`)!;
      const want = c.models.length > 2 && c.verdict !== "agree";
      expect(row.querySelector("[data-distance-matrix]") !== null, c.key).toBe(want);
    }
  });

  it("numără acordurile, nu face medii", () => {
    const { container } = show();
    expect(container.querySelector("[data-summary]")!.textContent).not.toMatch(/%/);
  });

  it("adaugă Kua când se alege genul", () => {
    const { container } = show();
    expect(container.querySelector('[data-comparison="kua"]')).toBeNull();
    const radios = container.querySelectorAll('input[name="kua-gender"]');
    fireEvent.click(radios[1]);
    expect(container.querySelector('[data-comparison="kua"]')).not.toBeNull();
  });
});
