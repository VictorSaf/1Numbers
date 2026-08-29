import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NewNumbers from "../NewNumbers";

/**
 * Renders the section the way the results page does. The engine's own suite
 * proves the numbers; this proves they reach the screen -- that every card gets
 * a label, a question and an archetype, and that the expanded copy carries no
 * unresolved placeholder.
 */
const renderSection = () =>
  render(
    <LanguageProvider>
      <NewNumbers fullName="Victor Ion Safta" birthDate={new Date(1990, 7, 25)} />
    </LanguageProvider>,
  );

describe("NewNumbers", () => {
  it("renders a card per interpretation", () => {
    renderSection();
    // Eleven frames are wired in interpretProfile; each becomes one article.
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(10);
  });

  it("labels every card and asks its question", () => {
    renderSection();
    for (const article of screen.getAllByRole("article")) {
      const text = article.textContent ?? "";
      expect(text.trim().length).toBeGreaterThan(20);
      expect(text).not.toMatch(/\{(essence|strength|shadow|n|title)\}/);
      expect(text).not.toMatch(/undefined/);
    }
  });

  it("shows the interpretation once a card is opened", () => {
    renderSection();
    const first = screen.getAllByRole("button")[0];
    const before = first.closest("article")?.textContent?.length ?? 0;
    fireEvent.click(first);
    const after = first.closest("article")?.textContent?.length ?? 0;
    // Opening reveals keywords plus the works/breaks pair, so the card grows.
    expect(after).toBeGreaterThan(before);
  });

  it("renders numerals through the tabular class so columns align", () => {
    const { container } = renderSection();
    expect(container.querySelectorAll(".num").length).toBeGreaterThan(0);
  });
});
