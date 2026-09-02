import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Frontispiciu } from "../Frontispiciu";
import { buildDial } from "@/lib/dial";
import { dialThesis } from "@/lib/thesis";

/**
 * Capul hărții.
 *
 * Ce era înainte -- insignă, nume, subtitlu, trei butoane -- nu spunea nimic
 * despre omul care tocmai își deschisese harta. Ce se verifică aici e că noul
 * cap chiar spune ceva: figura, propoziția scoasă din ea, și cifra care adună,
 * cu arcana și planeta ei.
 */

const NAME = "Maria Elena Popescu";
const BIRTH = new Date(1990, 4, 15);

const show = () =>
  render(
    <LanguageProvider>
      <Frontispiciu fullName={NAME} birthDate={BIRTH} actions={<button>Descarcă</button>} />
    </LanguageProvider>,
  );

describe("Frontispiciu", () => {
  it("pune numele și data, o dată fiecare", () => {
    show();
    expect(screen.getByText(NAME)).toBeInTheDocument();
    expect(screen.getByText("15/05/1990")).toBeInTheDocument();
  });

  it("spune harta în propoziția scoasă din figură, nu într-un subtitlu fix", () => {
    const { container } = show();
    // LanguageProvider pornește pe engleză -- asta primește un vizitator.
    const t = dialThesis(buildDial(NAME, BIRTH, "en"), "en");
    expect(container.textContent).toContain(t.lead);
  });

  it("desenează cadranul, la două proporții, cu una singură vizibilă", () => {
    const { container } = show();
    // Una pentru desktop, una pentru telefon: inelul stă altfel la 340px.
    const dials = container.querySelectorAll('svg[role="img"]');
    expect(dials).toHaveLength(2);

    // Ascunderea trebuie să stea pe înveliș. Pusă pe svg, `hidden` era învinsă
    // de `display: block` scris inline de componentă -- stilul inline bate
    // orice clasă -- și se vedeau amândouă, una sub alta.
    for (const dial of dials) {
      const wrapper = dial.parentElement;
      expect(wrapper?.className, "învelișul ascunde, nu svg-ul").toMatch(/lg:block|lg:hidden/);
      expect(dial.className.baseVal ?? "").not.toMatch(/hidden/);
    }
  });

  it("arată arcana cifrei care adună harta, nu una la întâmplare", () => {
    const { container } = show();
    // 3 poartă patru din cinci numere; arcana 3 e Împărăteasa.
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/tarot/3.jpg");
    expect(container.textContent).toContain("The Empress");
  });

  it("scoate planeta și piatra din motor, nu din capul meu", () => {
    const { container } = show();
    // Graha 3 — Jupiter / Guru / Thursday / yellow sapphire. Traduse: motorul
    // le are numai în română, iar sub „stone" nu are ce căuta „safir galben".
    expect(container.textContent).toContain("Jupiter · Guru");
    expect(container.textContent).toContain("yellow sapphire");
    expect(container.textContent).not.toMatch(/safir|joi\b/);
  });

  it("primește acțiunile paginii, în loc să și le inventeze", () => {
    show();
    expect(screen.getByRole("button", { name: "Descarcă" })).toBeInTheDocument();
  });
});
