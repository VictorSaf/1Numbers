import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Today } from "../Today";
import { buildToday } from "@/lib/today";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * Ziua: scurtă, personală, și cu o întrebare la capăt.
 *
 * Harta se citește o dată. Ziua se citește în fiecare zi, deci trebuie să
 * încapă într-un minut -- patru-cinci fraze, nu douăzeci. Iar la capăt
 * întreabă: o zi care doar informează e un difuzor, și n-ai de ce să te
 * întorci la un difuzor.
 */

const create = vi.fn().mockResolvedValue({ success: true, entry: {} });
const read = vi.fn();
vi.mock("@/services/api", () => {
  const svc = {
    createJournalEntry: (...a: unknown[]) => create(...a),
    getTodayReading: (...a: unknown[]) => read(...a),
  };
  return { api: svc, default: svc };
});

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);
const reading = buildToday(NAME, BIRTH, "en", TODAY);

const show = () =>
  render(
    <LanguageProvider>
      <Today fullName={NAME} birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

const said = (el: HTMLElement, text: string) =>
  el.textContent?.replace(/\s+/g, " ").includes(text.replace(/\s+/g, " "));
const on = () => screen.queryByRole("button", { name: /go on|continue/i });
/** Textul vine de la server, deci nimic nu e pe ecran înainte de răspuns. */
const ready = () => waitFor(() => expect(on()).toBeInTheDocument());
const toEnd = () => { for (let i = 0; i < 20; i++) { const b = on(); if (!b) break; fireEvent.click(b); } };

beforeEach(() => {
  create.mockClear();
  // Implicit: serverul întoarce exact textul compus, ca testele existente să
  // vorbească despre ce vorbeau. Cazurile modelului au testele lor mai jos.
  read.mockReset().mockResolvedValue({
    body: {
      ziua: reading.say,
      fric: reading.relations[1]?.text ?? reading.relations[0].text,
      aproape: reading.relations[0].text,
      intrebare: reading.ask,
    },
    source: "composed", cached: false,
  });
  localStorage.clear();
});

describe("Today", () => {
  it("arată cifra zilei tale, mare, de la început", async () => {
    const { container } = show();
    await ready();

    expect(screen.getByText(String(reading.day))).toBeInTheDocument();
    expect(screen.getByText(reading.title)).toBeInTheDocument();
    expect(said(container, reading.say)).toBe(true);
  });

  it("încape într-un minut: cel mult șase apăsări", async () => {
    show();
    await ready();
    let clicks = 0;
    for (let i = 0; i < 20; i++) { const b = on(); if (!b) break; fireEvent.click(b); clicks++; }

    expect(clicks).toBeLessThanOrEqual(6);
  });

  it("spune cum întâlnește ziua harta ta", async () => {
    const { container } = show();
    await ready();
    toEnd();

    for (const rel of reading.relations) expect(said(container, rel.text)).toBe(true);
  });

  it("întreabă abia la capăt, nu peste text", async () => {
    show();
    await ready();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    toEnd();
    expect(screen.getByText(new RegExp(reading.ask.replace("?", "\\?")))).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("scrie răspunsul în jurnal, cu ziua atașată", async () => {
    show();
    await ready();
    toEnd();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Am plecat din ședință." } });
    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const sent = create.mock.calls[0][0] as Record<string, unknown>;
    expect(sent.entryType).toBe("prediction");
    expect(sent.content).toBe("Am plecat din ședință.");
    expect((sent.numerologyData as Record<string, unknown>).personalDay).toBe(reading.day);
  });

  it("nu trimite un răspuns gol", async () => {
    show();
    await ready();
    toEnd();

    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));
    expect(create).not.toHaveBeenCalled();
  });

  it("după ce ai răspuns, arată ce ai scris, nu caseta", async () => {
    const { container } = show();
    await ready();
    toEnd();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Am plecat din ședință." } });
    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));

    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
    expect(said(container, "Am plecat din ședință.")).toBe(true);
  });
});

describe("Today, textul scris de model", () => {
  it("arată ce a scris modelul, nu ce a compus motorul", async () => {
    const mine = { ...reading.relations.reduce((a, r, i) => a, {}) };
    read.mockResolvedValue({
      body: { ziua: "Astăzi contează rezultatul concret.", fric: "F.", aproape: "A.", intrebare: "Î?" },
      source: "model", model: "claude-sonnet-5", cached: false,
    });
    const { container } = show();

    await waitFor(() => expect(said(container, "Astăzi contează rezultatul concret.")).toBe(true));
    expect(said(container, reading.say)).toBe(false);
  });

  it("trimite propozițiile compuse, nu doar cifrele", async () => {
    show();
    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));

    const sent = read.mock.calls[0][0] as Record<string, unknown>;
    expect(sent.personalDay).toBe(reading.day);
    expect((sent.composed as Record<string, string>).ziua).toBe(reading.say);
  });

  it("arată ziua compusă dacă serverul cade, fără să spună nimic despre eroare", async () => {
    read.mockRejectedValue(new Error("offline"));
    const { container } = show();

    await waitFor(() => expect(said(container, reading.say)).toBe(true));
    expect(container.textContent).not.toMatch(/eroare|error|failed/i);
  });

  it("nu schimbă textul sub ochii omului: nu arată nimic până nu știe ce arată", () => {
    const { container } = show();
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(0);
  });
});

describe("Today și ziua de calendar", () => {
  it("trimite ziua din calendarul omului, nu din UTC", async () => {
    // toISOString() convertește în UTC. La est de UTC, orele mici ale nopții
    // cad în ziua precedentă; la vest, serile cad în ziua următoare. În ambele
    // cazuri omul primește citirea altei zile decât cea în care trăiește.
    const noaptea = new Date(2026, 8, 1, 1, 30);
    render(
      <LanguageProvider>
        <Today fullName={NAME} birthDate={BIRTH} today={noaptea} />
      </LanguageProvider>,
    );

    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));
    expect((read.mock.calls[0][0] as Record<string, string>).date).toBe(formatCalendarDate(noaptea));
  });

  it("datează în jurnal ziua trăită, nu ziua UTC", async () => {
    const noaptea = new Date(2026, 8, 1, 1, 30);
    render(
      <LanguageProvider>
        <Today fullName={NAME} birthDate={BIRTH} today={noaptea} />
      </LanguageProvider>,
    );
    await waitFor(() => expect(on()).toBeInTheDocument());
    toEnd();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ceva" } });
    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect((create.mock.calls[0][0] as Record<string, string>).date).toBe(formatCalendarDate(noaptea));
  });
});

describe("Today își amintește", () => {
  const withEcho = (echo?: string) =>
    read.mockResolvedValue({
      body: { ziua: "Z.", fric: "F.", aproape: "A.", intrebare: "Ce a câștigat azi?" },
      source: "model", echo, cached: false,
    });

  it("arată ce ai scris ultima dată, lângă întrebare", async () => {
    withEcho("Ultima dată când ziua a fost 8, ai scris: „Am plecat din ședință.”");
    const { container } = show();
    await waitFor(() => expect(on()).toBeInTheDocument());
    toEnd();

    expect(said(container, "Am plecat din ședință.")).toBe(true);
  });

  it("pune întrebarea scrisă de model, nu pe cea compusă", async () => {
    // Modelul o rescrie în fiecare zi; dacă ecranul o arată pe cea compusă,
    // singura frază pe care omul o citește cu adevărat rămâne mereu aceeași.
    withEcho(undefined);
    const { container } = show();
    await waitFor(() => expect(on()).toBeInTheDocument());
    toEnd();

    expect(said(container, "Ce a câștigat azi?")).toBe(true);
    expect(said(container, reading.ask)).toBe(false);
  });

  it("nu arată nimic despre trecut când nu există trecut", async () => {
    withEcho(undefined);
    const { container } = show();
    await waitFor(() => expect(on()).toBeInTheDocument());
    toEnd();

    expect(container.querySelector("[data-echo]")).toBeNull();
  });

  it("nu pune trecutul peste text, ci abia la întrebare", async () => {
    withEcho("Ultima dată când ziua a fost 8, ai scris: „ceva”");
    const { container } = show();
    await waitFor(() => expect(on()).toBeInTheDocument());

    expect(container.querySelector("[data-echo]")).toBeNull();
  });
});
