import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TwoAnswers } from "../TwoAnswers";
import { findDisagreements } from "@/lib/disagreements";

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);
const data = findDisagreements(NAME, BIRTH, "en", TODAY);

const show = () =>
  render(
    <LanguageProvider>
      <TwoAnswers fullName={NAME} birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

describe("TwoAnswers", () => {
  it("arată fiecare pereche, plus absențele", () => {
    const { container } = show();
    expect(container.querySelectorAll("[data-pair]")).toHaveLength(data.pairs.length + 1);
  });

  it("pune amândouă răspunsurile, cu sursa fiecăruia", () => {
    const { container } = show();
    for (const p of data.pairs) {
      const card = container.querySelector(`[data-pair="${p.key}"]`)!;
      // Fără sursă, două cifre diferite pentru aceeași întrebare arată ca un bug.
      expect(card.textContent).toContain(p.a.from);
      expect(card.textContent).toContain(p.b.from);
    }
  });

  it("spune distanța dintre ele", () => {
    const { container } = show();
    for (const p of data.pairs) {
      expect(container.querySelector(`[data-pair="${p.key}"]`)!.textContent).toContain(p.says);
    }
  });

  it("arată întrebarea, nu numele calculului, ca titlu", () => {
    show();
    for (const p of data.pairs) {
      expect(screen.getByText(p.question)).toBeInTheDocument();
    }
  });

  it("compară absențele din trei unghiuri: nume, dată, amândouă", () => {
    const { container } = show();
    const card = container.querySelector('[data-pair="missing"]')!;
    expect(card.textContent).toMatch(/missing from the name/i);
    expect(card.textContent).toMatch(/missing from the date/i);
    expect(card.textContent).toMatch(/missing from both/i);
  });

  it("nu propune niciun câștigător și nicio medie", () => {
    const { container } = show();
    expect(container.textContent).not.toMatch(/average|correct one|winner/i);
  });
});
