import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LetterMap } from "../LetterMap";
import { analyzeIndividualLetters } from "@/lib/nameAnalysis";
import { inclusionTable } from "@/lib/numerology-plus/pythagorean";

/**
 * What replaced NameAnalysisCard.
 *
 * The card held two things of its own and three that were already answered
 * elsewhere on the same page. What survives is the inclusion table drawn and
 * the letters it was counted from -- and the point of the first test is that
 * those really are the same counts the engine reports, not a second tally.
 */

const NAME = "Ștefan Țîrlea";

const renderMap = () =>
  render(
    <LanguageProvider>
      <LetterMap fullName={NAME} />
    </LanguageProvider>,
  );

describe("LetterMap", () => {
  it("counts the same letters the engine's inclusion table does", () => {
    const fromCard = analyzeIndividualLetters(NAME).length;
    const fromEngine = Object.values(inclusionTable(NAME)).reduce((a, b) => a + b, 0);

    // A diacritic dropped instead of transliterated on one side, and the two
    // would disagree on the same screen. They have one source now.
    expect(fromCard).toBe(fromEngine);
  });

  it("keeps the letters folded away until asked", () => {
    renderMap();
    expect(screen.queryByText("Ș")).toBeNull();
    expect(screen.queryByText("T")).toBeNull();
  });

  it("shows one tile per letter once opened", () => {
    renderMap();
    fireEvent.click(screen.getByRole("button"));

    const expected = analyzeIndividualLetters(NAME);
    // One vowel-or-consonant badge per tile. Matched across the three languages
    // because jsdom reports its own navigator.language and the provider honours
    // it -- the count is the assertion, not which words it picked.
    const badges = screen.getAllByText(
      /^(Vowel|Vocală|Гласная|Consonant|Consoană|Согласная)$/,
    );
    expect(badges).toHaveLength(expected.length);
    expect(screen.getAllByText(/^(Value|Valoare|Значение) \d$/)).toHaveLength(expected.length);
  });

  it("transliterates rather than dropping the diacritics", () => {
    renderMap();
    fireEvent.click(screen.getByRole("button"));

    // Ș and Ț reach the table as S and T; before the engine took over the
    // normalisation they were deleted, and the count came out short.
    expect(analyzeIndividualLetters(NAME).map((l) => l.letter).join("")).toBe("STEFANTIRLEA");
  });
});
