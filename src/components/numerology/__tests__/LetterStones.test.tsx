import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretLetters } from "@/lib/numerology-plus/content/interpret";
import { analyzeIndividualLetters } from "@/lib/nameAnalysis";
import LetterStones from "../LetterStones";

/**
 * Cele trei litere de poziție, pe ecran.
 *
 * Motorul își demonstrează singur numerele; aici se demonstrează că textul
 * afișat e chiar textul lui, în fiecare limbă -- nu că s-a randat ceva. De
 * aceea fiecare aserțiune compară cu ce întoarce interpretLetters(), nu cu
 * un șir copiat în test: o copie ar putea rămâne în urmă fără să pice nimic.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
type Lang = "ro" | "en" | "ru";

const fromEngine = (lang: Lang) =>
  interpretLetters(
    fullProfile(NAME, { day: 25, month: 8, year: 1990 }).pythagorean,
    lang,
  ).flatMap((s) => (s ? [s] : []));

const renderStones = (lang: Lang) => {
  localStorage.setItem("language", lang);
  return render(
    <LanguageProvider>
      <LetterStones fullName={NAME} birthDate={BIRTH} />
    </LanguageProvider>,
  );
};

afterEach(() => {
  localStorage.clear();
});

describe("LetterStones", () => {
  it("randează un card pentru fiecare literă pe care o citește motorul", () => {
    renderStones("ro");
    // Nicio listă de chei între motor și ecran: câte întoarce, atâtea apar.
    expect(screen.getAllByRole("article")).toHaveLength(fromEngine("ro").length);
    expect(fromEngine("ro")).toHaveLength(3);
  });

  it.each<Lang>(["ro", "en", "ru"])(
    "arată litera, trăsătura ei și întrebarea ramei în %s",
    (lang) => {
      renderStones(lang);
      for (const stone of fromEngine(lang)) {
        expect(screen.getAllByText(stone.letter).length).toBeGreaterThan(0);
        expect(screen.getByText(stone.letterTrait)).toBeInTheDocument();
        expect(screen.getByText(stone.label)).toBeInTheDocument();
        expect(screen.getByText(stone.question)).toBeInTheDocument();
      }
    },
  );

  it.each<Lang>(["ro", "en", "ru"])(
    "arată interpretarea motorului, cuvânt cu cuvânt, în %s",
    (lang) => {
      renderStones(lang);
      for (const button of screen.getAllByRole("button")) fireEvent.click(button);

      for (const stone of fromEngine(lang)) {
        expect(screen.getByText(stone.lead)).toBeInTheDocument();
        expect(screen.getByText(stone.works)).toBeInTheDocument();
        expect(screen.getByText(stone.breaks)).toBeInTheDocument();
      }
    },
  );

  it("nu lasă niciun șablon nerezolvat pe ecran", () => {
    renderStones("ro");
    for (const button of screen.getAllByRole("button")) fireEvent.click(button);

    for (const article of screen.getAllByRole("article")) {
      const text = article.textContent ?? "";
      expect(text).not.toMatch(/\{(essence|strength|shadow|n|title)\}/);
      expect(text).not.toMatch(/undefined/);
    }
  });

  it("nu contrazice grila de litere despre valoarea unei litere", () => {
    // Grila din LetterMap afirmă un inventar, cardurile astea afirmă un
    // înțeles. Amândouă citesc PYTHAGOREAN din core.ts azi; dacă vreuna se
    // rupe de tabelă, aceeași literă ar apărea cu două valori pe o pagină.
    const grid = analyzeIndividualLetters(NAME);
    for (const stone of fromEngine("ro")) {
      const occurrences = grid.filter((l) => l.letter === stone.letter);
      expect(occurrences.length).toBeGreaterThan(0);
      for (const l of occurrences) expect(l.value).toBe(stone.value);
    }
  });
});
