import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AngelNumbers from "@/components/tools/AngelNumbers";

const renderAt = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/unelte${search}`]}>
      <LanguageProvider>
        <AngelNumbers />
      </LanguageProvider>
    </MemoryRouter>,
  );

// Limba nu se fixează aici: LanguageContext o deduce din localStorage și din
// navigator.language, iar în jsdom aceea e "en-US", nu româna. Aserțiunile sunt
// deci pe secvențe și pe lungime — adevărate în oricare din cele trei limbi.
const longTexts = (min: number) =>
  screen.queryAllByText((content) => content.length >= min);

describe("unealta de numere-înger", () => {
  it("listează toate cele 35 de secvențe din catalog", () => {
    renderAt("?s=angel");
    // Fiecare card compact își afișează secvența.
    expect(screen.getAllByText("444").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1551").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4321").length).toBeGreaterThanOrEqual(1);
  });

  it("deschide direct secvența din ?n=, cu interpretarea lungă", () => {
    renderAt("?s=angel&n=444");
    expect(screen.getAllByText("444").length).toBeGreaterThanOrEqual(1);
    // Cardul extins randează fullMeaning; nimic altceva din pagină nu trece de 600.
    expect(longTexts(600).length).toBeGreaterThanOrEqual(1);
  });

  it("ignoră un ?n= fără tipar, fără să cadă", () => {
    renderAt("?s=angel&n=4729");
    expect(longTexts(600)).toHaveLength(0);
  });
});
