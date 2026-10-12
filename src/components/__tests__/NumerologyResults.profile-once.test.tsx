import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NumerologyResults } from "../NumerologyResults";

/**
 * Profilul pitagoreic al hărții se calculează o dată pe pagină, nu de șase ori.
 *
 * NewNumbers (de patru ori), LetterStones și Contradictions chemau fiecare
 * `fullProfile()` -- pitagoreic, caldean, vedic, kabbalah, matricea destinului
 * și treizeci de zile de bioritm -- ca să folosească doar `.pythagorean`.
 */

const fullProfileSpy = vi.fn();
vi.mock("@/lib/numerology-plus", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/numerology-plus")>();
  return {
    ...actual,
    fullProfile: (...a: Parameters<typeof actual.fullProfile>) => {
      fullProfileSpy(...a);
      return actual.fullProfile(...a);
    },
  };
});

const pythagoreanSpy = vi.fn();
vi.mock("@/lib/numerology-plus/pythagorean", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/numerology-plus/pythagorean")>();
  return {
    ...actual,
    fullPythagoreanProfile: (...a: Parameters<typeof actual.fullPythagoreanProfile>) => {
      pythagoreanSpy(...a);
      return actual.fullPythagoreanProfile(...a);
    },
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, isLoading: false }),
}));

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
// O dată nouă la fiecare randare, cum o dă Index pentru harta proprie.
const page = () => (
  <QueryClientProvider client={client}>
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <NumerologyResults fullName="Victor Ion Safta" birthDate={new Date(1990, 7, 25)} onReset={() => {}} />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  </QueryClientProvider>
);
const show = () => render(page());

beforeEach(() => {
  localStorage.clear();
  fullProfileSpy.mockReset();
  pythagoreanSpy.mockReset();
});

/**
 * Calculele făcute pentru blocuri: fără `today`. Cadranul (buildDial) și
 * dezacordurile (findDisagreements) își fac singure calculul și dau `today`
 * explicit -- cinci apeluri ale lor, în afara a ce măsoară testul ăsta.
 */
const forBlocks = () => pythagoreanSpy.mock.calls.filter((args) => args.length === 2).length;

describe("NumerologyResults, profilul calculat o dată", () => {
  it("niciun bloc nu mai cere profilul complet al tuturor sistemelor", async () => {
    const { container, rerender } = show();

    // Deschide straturile ascunse, ca LetterStones să se monteze și el.
    for (const button of screen.getAllByRole("button", { expanded: false })) {
      fireEvent.click(button);
    }
    // Blocurile sunt leneșe: așteaptă contradicțiile, cele trei pietre și
    // grilele celor patru NewNumbers plus a pietrelor.
    await waitFor(() => {
      expect(container.querySelectorAll("article").length).toBeGreaterThan(0);
      expect(container.querySelectorAll("span.num.text-2xl.text-primary").length).toBeGreaterThanOrEqual(3);
      expect(container.querySelectorAll("div.grid.gap-3").length).toBeGreaterThanOrEqual(5);
    }, { timeout: 5000 });

    expect(fullProfileSpy).not.toHaveBeenCalled();
    // O dată pentru toate blocurile de mai sus.
    expect(forBlocks()).toBe(1);

    // Aceeași zi, alt obiect Date -- cum o dă Index la fiecare randare: nimic
    // de recalculat.
    rerender(page());
    expect(forBlocks()).toBe(1);
  }, 10000);
});
