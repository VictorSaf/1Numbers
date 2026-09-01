import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Thread } from "../Thread";
import { buildThread } from "@/lib/thread";

/**
 * Firul pe ecran: o frază pe rând, nu un card pe rând.
 *
 * Frazele motorului sunt dense. Puse una sub alta, se anulează: „ești locul
 * unde alții se așază" și „tot ea devine control prin grijă" sunt două idei,
 * iar citite lipite nu rămâne niciuna. De aceea unitatea dezvăluirii e fraza.
 *
 * Poziția supraviețuiește reîncărcării, altfel apăsarea ar fi o animație, nu o
 * citire care se reia mâine de unde a rămas.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);

const show = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <Thread fullName={NAME} birthDate={BIRTH} today={TODAY} />
      </LanguageProvider>
    </MemoryRouter>,
  );

const steps = buildThread(NAME, BIRTH, "en", TODAY);

/**
 * Frazele se dezvăluie cuvânt cu cuvânt, deci fiecare cuvânt e propriul span
 * și potrivirea pe text exact nu mai găsește nimic. Textul E în pagină -- de
 * asta decalajul e în CSS, nu pe cronometre -- doar că spart. Aici se
 * recompune, ca aserțiunile să rămână despre ce citește omul.
 */
const says = (el: HTMLElement, text: string) =>
  el.textContent?.replace(/\s+/g, " ").includes(text.replace(/\s+/g, " "));
const go = (times: number) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByRole("button", { name: /go on|continue/i }));
  }
};

beforeEach(() => localStorage.clear());

describe("Thread", () => {
  it("arată o singură frază la început, nu tot cardul", () => {
    const { container } = show();

    expect(container.querySelectorAll("[data-step]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(1);
    expect(says(container, steps[0].say)).toBe(true);
  });

  it("arată cifra mare și numele arhetipului de la prima frază", () => {
    show();

    // Cifra e prezență, nu semnătură: e acolo înainte de orice text.
    expect(screen.getByText(steps[0].figures)).toBeInTheDocument();
    expect(screen.getByText(steps[0].title!)).toBeInTheDocument();
  });

  it("adaugă fraza următoare în același card, nu un card nou", () => {
    const { container } = show();

    go(1);

    expect(container.querySelectorAll("[data-step]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(2);
    expect(says(container, steps[0].works!)).toBe(true);
  });

  it("spune de unde vine cifra, la finalul pasului", () => {
    const { container } = show();

    const beatsInFirst = 3 + (steps[0].details?.length ?? 0); // say, works, breaks, plain
    go(beatsInFirst);

    expect(says(container, steps[0].plain)).toBe(true);
  });

  it("ține un singur pas pe ecran în timpul citirii", () => {
    // Cardurile stivuite făceau din ecran o listă de derulat, adică tot un
    // depozit. Un pas pe ecran înseamnă că citești, nu că răsfoiești.
    const { container } = show();

    const beatsInFirst = 4 + (steps[0].details?.length ?? 0);
    go(beatsInFirst - 1);
    expect(container.querySelector("[data-step]")?.getAttribute("data-step")).toBe(steps[0].key);

    go(1);
    expect(container.querySelectorAll("[data-step]")).toHaveLength(1);
    expect(container.querySelector("[data-step]")?.getAttribute("data-step")).toBe(steps[1].key);
  });

  it("așază harta întreagă în pagină abia la final", () => {
    const { container } = show();

    for (let i = 0; i < 200; i++) {
      const btn = screen.queryByRole("button", { name: /go on|continue/i });
      if (!btn) break;
      fireEvent.click(btn);
    }

    expect(container.querySelectorAll("[data-step]")).toHaveLength(steps.length);
  });

  it("anunță ce urmează doar când butonul chiar schimbă pasul", () => {
    show();

    // În interiorul unui pas nu are ce anunța: urmează aceeași idee.
    expect(screen.queryByText(new RegExp(steps[0].teaser!))).not.toBeInTheDocument();

    const beatsInFirst = 4 + (steps[0].details?.length ?? 0);
    go(beatsInFirst - 1);

    expect(screen.getByText(new RegExp(steps[0].teaser!))).toBeInTheDocument();
  });

  it("o ia de la început la fiecare intrare", () => {
    // Poziția salvată omora chiar experiența: odată citită, harta rămânea
    // citită și nu mai era nimic de descoperit a doua zi.
    const first = show();
    go(3);
    first.unmount();

    const { container } = show();
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(1);
  });

  it("îți oferă să reiei de unde ai rămas, fără să te oblige", () => {
    // Harta are peste șaizeci de apăsări. Pornirea de la capăt e ritualul, dar
    // fără o cale de întoarcere nimeni n-ar ajunge vreodată la sfârșitul ei.
    const first = show();
    go(9);
    first.unmount();

    const { container } = show();
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /where you left|unde ai rămas/i }));
    expect(container.querySelectorAll("[data-beat]").length).toBeGreaterThan(1);
  });

  it("nu oferă întoarcerea cuiva care n-a fost nicăieri", () => {
    show();
    expect(screen.queryByRole("button", { name: /where you left/i })).not.toBeInTheDocument();
  });

  it("nu oferă scurtătura cuiva care n-a terminat harta niciodată", () => {
    show();
    go(2);

    expect(screen.queryByRole("button", { name: /whole map|harta întreagă/i })).not.toBeInTheDocument();
  });

  it("dă o scurtătură celui care a mai citit-o o dată", () => {
    // Fără ea, cine a citit ieri tot ar trebui să apese de douăzeci de ori
    // ca să-și revadă harta.
    const first = show();
    for (let i = 0; i < 200; i++) {
      const btn = screen.queryByRole("button", { name: /go on|continue/i });
      if (!btn) break;
      fireEvent.click(btn);
    }
    first.unmount();

    const { container } = show();
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /whole map/i }));
    expect(container.querySelectorAll("[data-step]")).toHaveLength(steps.length);
  });

  it("trimite spre ziua de azi când harta s-a terminat", () => {
    // Harta se citește o dată. Fără ieșirea asta, capătul ei e un capăt mort:
    // afli cine ești și nu ai ce face cu asta mâine.
    show();
    for (let i = 0; i < 200; i++) {
      const btn = screen.queryByRole("button", { name: /go on|continue/i });
      if (!btn) break;
      fireEvent.click(btn);
    }

    const out = screen.getByRole("link", { name: /today/i });
    expect(out).toHaveAttribute("href", "/azi");
  });

  it("ascunde butonul când firul s-a terminat", () => {
    const { container } = show();

    for (let i = 0; i < 200; i++) {
      const btn = screen.queryByRole("button", { name: /go on|continue/i });
      if (!btn) break;
      fireEvent.click(btn);
    }

    expect(screen.queryByRole("button", { name: /go on|continue/i })).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-step]")).toHaveLength(steps.length);
  });
});
