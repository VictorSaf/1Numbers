import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LoShuGrid } from "../LoShuGrid";
import { LO_SHU_NUMBER_MEANINGS } from "@/lib/loShuGrid";

/**
 * „Click for details” chiar trebuie să dea detalii la clic.
 *
 * Clicul seta o stare folosită într-un singur loc: ca să deseneze un inel în
 * jurul celulei. Detaliile stăteau într-un tooltip, adică pe hover -- care pe
 * un ecran cu atingere nu se declanșează niciodată. Textul promitea una,
 * componenta făcea alta, iar pe telefon nu făcea nimic.
 */

const BIRTH = new Date(1977, 6, 29);
const show = () =>
  render(
    <LanguageProvider>
      <LoShuGrid birthDate={BIRTH} />
    </LanguageProvider>,
  );

// Cifrele din 29.07.1977: 2, 9, 7, 1, 9, 7, 7 -- deci 7 apare de trei ori.
const cell = (n: number) => screen.getByRole("button", { name: new RegExp(`^${n}(×|\\s|$)`) });

beforeEach(() => localStorage.clear());

describe("LoShuGrid", () => {
  it("nu arată detalii înainte de clic", () => {
    const { container } = show();
    expect(container.querySelector("[data-cell-details]")).toBeNull();
  });

  it("arată înțelesul cifrei la clic, nu doar un inel", () => {
    const { container } = show();

    fireEvent.click(cell(7));

    const panel = container.querySelector("[data-cell-details]");
    expect(panel).toBeInTheDocument();
    expect(panel!.textContent).toContain(LO_SHU_NUMBER_MEANINGS[7].en.title);
    expect(panel!.textContent).toContain(LO_SHU_NUMBER_MEANINGS[7].en.description);
  });

  it("schimbă detaliile când apeși altă cifră", () => {
    const { container } = show();

    fireEvent.click(cell(7));
    fireEvent.click(cell(9));

    const panel = container.querySelector("[data-cell-details]");
    expect(panel!.textContent).toContain(LO_SHU_NUMBER_MEANINGS[9].en.title);
    expect(panel!.textContent).not.toContain(LO_SHU_NUMBER_MEANINGS[7].en.description);
  });

  it("închide detaliile la al doilea clic pe aceeași cifră", () => {
    const { container } = show();

    fireEvent.click(cell(7));
    fireEvent.click(cell(7));

    expect(container.querySelector("[data-cell-details]")).toBeNull();
  });

  it("spune și cât de des apare cifra, fiindcă asta e ce distinge harta", () => {
    const { container } = show();

    fireEvent.click(cell(7));
    // 7 apare de trei ori în 29.07.1977.
    expect(container.querySelector("[data-cell-details]")!.textContent).toMatch(/3/);
  });
});
