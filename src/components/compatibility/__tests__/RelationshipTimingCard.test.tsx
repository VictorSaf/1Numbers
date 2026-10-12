import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RelationshipTimingCard } from "../RelationshipTimingCard";
import { calculateRelationshipTiming } from "@/lib/relationshipTiming";

/**
 * Cardul desenează stratul temporal. Ce trebuie să fie adevărat: toate cele
 * douăsprezece luni sunt acolo, cifrele poartă `.num`, iar benzile poartă
 * `--harmony` / `--tension` -- nu `--ok` / `--crit`. O lună de tensiune între
 * doi oameni e o distanță, nu o eroare, și culoarea trebuie s-o spună.
 *
 * `LanguageProvider` citește `navigator.language` când nu există nimic în
 * localStorage, iar în jsdom asta rezolvă la engleză, nu la română -- de-aia
 * testele forțează explicit "ro", ca peste tot în restul suitei.
 */

const timing = calculateRelationshipTiming(new Date(1990, 4, 15), new Date(1985, 10, 3), 2026);

const renderCard = () => {
  localStorage.setItem("language", "ro");
  return render(
    <LanguageProvider>
      <RelationshipTimingCard timing={timing} name1="Ana" name2="Ion" />
    </LanguageProvider>,
  );
};

afterEach(() => {
  localStorage.clear();
});

describe("RelationshipTimingCard", () => {
  it("își scrie titlul și anul", () => {
    const { container } = renderCard();

    expect(screen.getByText("Relația în timp")).toBeInTheDocument();
    expect(container.textContent).toContain("2026");
  });

  it("numește amândoi oamenii", () => {
    const { container } = renderCard();

    expect(container.textContent).toContain("Ana");
    expect(container.textContent).toContain("Ion");
  });

  it("desenează toate cele douăsprezece luni", () => {
    const { container } = renderCard();

    expect(container.querySelectorAll("[data-month]")).toHaveLength(12);
  });

  it("pune anii personali ai amândurora, cu cifre tabulare", () => {
    const { container } = renderCard();
    const yearNumbers = container.querySelectorAll("[data-year-number]");

    expect(yearNumbers).toHaveLength(2);
    for (const node of yearNumbers) {
      expect(node.className).toContain("num");
    }
    expect(yearNumbers[0].textContent).toBe(String(timing.year.person1));
    expect(yearNumbers[1].textContent).toBe(String(timing.year.person2));
  });

  it("colorează relațiile în harmony și tension, nu în ok și crit", () => {
    const { container } = renderCard();
    const banded = container.querySelectorAll("[data-band]");

    expect(banded.length).toBeGreaterThan(0);
    for (const node of banded) {
      expect(node.className).not.toMatch(/\b(bg|text|border)-(ok|crit|warn)\b/);
    }
    const classes = [...banded].map((n) => n.className).join(" ");
    expect(classes).toMatch(/harmony|tension|muted/);
  });

  it("spune banda anului în cuvinte, nu doar în culoare", () => {
    renderCard();
    const labels = [
      "Vă trageți în aceeași direcție",
      "Mergeți în paralel",
      "Trageți în direcții diferite",
    ];

    expect(labels.some((label) => screen.queryAllByText(label).length > 0)).toBe(true);
  });
});
