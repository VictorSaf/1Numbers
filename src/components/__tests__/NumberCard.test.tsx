import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NumberCard } from "../NumberCard";
import { getTranslation } from "@/lib/translations";

/**
 * The first paragraph under a number has to be about that number.
 *
 * The card used to take a `description` prop and render it above the reading:
 * t.lifePathDesc and its four siblings, which describe what a Life Path *is* --
 * the same words for every visitor, placed above the sentence that was actually
 * about them.
 */

const renderCard = (number: number) =>
  render(
    <LanguageProvider>
      <NumberCard title="Drumul Vieții" number={number} />
    </LanguageProvider>,
  );

describe("NumberCard", () => {
  it("opens with the reading for the number it was given", () => {
    const t = getTranslation("en");
    renderCard(7);
    expect(screen.getByText(t.meanings[7].description)).toBeTruthy();
  });

  it("says something different for a different number", () => {
    const t = getTranslation("en");
    const { unmount } = renderCard(7);
    expect(screen.queryByText(t.meanings[3].description)).toBeNull();
    unmount();

    renderCard(3);
    expect(screen.getByText(t.meanings[3].description)).toBeTruthy();
  });

  it("takes no generic description any more", () => {
    // The prop is gone from the type, so this is about the five keys that fed
    // it: nothing reads them, and they are no longer in the translations.
    const t = getTranslation("ro") as unknown as Record<string, unknown>;
    for (const key of ["lifePathDesc", "destinyDesc", "soulUrgeDesc", "personalityDesc", "personalYearDesc"]) {
      expect(t[key], key).toBeUndefined();
    }
  });
});
