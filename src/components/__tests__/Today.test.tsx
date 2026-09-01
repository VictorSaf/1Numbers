import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Today } from "../Today";
import { buildToday } from "@/lib/today";

/**
 * Ziua: scurtă, personală, și cu o întrebare la capăt.
 *
 * Harta se citește o dată. Ziua se citește în fiecare zi, deci trebuie să
 * încapă într-un minut -- patru-cinci fraze, nu douăzeci. Iar la capăt
 * întreabă: o zi care doar informează e un difuzor, și n-ai de ce să te
 * întorci la un difuzor.
 */

const create = vi.fn().mockResolvedValue({ success: true, entry: {} });
vi.mock("@/services/api", () => ({
  api: { createJournalEntry: (...a: unknown[]) => create(...a) },
  default: { createJournalEntry: (...a: unknown[]) => create(...a) },
}));

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
const toEnd = () => { for (let i = 0; i < 20; i++) { const b = on(); if (!b) break; fireEvent.click(b); } };

beforeEach(() => { create.mockClear(); localStorage.clear(); });

describe("Today", () => {
  it("arată cifra zilei tale, mare, de la început", () => {
    const { container } = show();

    expect(screen.getByText(String(reading.day))).toBeInTheDocument();
    expect(screen.getByText(reading.title)).toBeInTheDocument();
    expect(said(container, reading.say)).toBe(true);
  });

  it("încape într-un minut: cel mult șase apăsări", () => {
    show();
    let clicks = 0;
    for (let i = 0; i < 20; i++) { const b = on(); if (!b) break; fireEvent.click(b); clicks++; }

    expect(clicks).toBeLessThanOrEqual(6);
  });

  it("spune cum întâlnește ziua harta ta", () => {
    const { container } = show();
    toEnd();

    for (const rel of reading.relations) expect(said(container, rel.text)).toBe(true);
  });

  it("întreabă abia la capăt, nu peste text", () => {
    show();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    toEnd();
    expect(screen.getByText(new RegExp(reading.ask.replace("?", "\\?")))).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("scrie răspunsul în jurnal, cu ziua atașată", async () => {
    show();
    toEnd();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Am plecat din ședință." } });
    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const sent = create.mock.calls[0][0] as Record<string, unknown>;
    expect(sent.entryType).toBe("prediction");
    expect(sent.content).toBe("Am plecat din ședință.");
    expect((sent.numerologyData as Record<string, unknown>).personalDay).toBe(reading.day);
  });

  it("nu trimite un răspuns gol", () => {
    show();
    toEnd();

    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));
    expect(create).not.toHaveBeenCalled();
  });

  it("după ce ai răspuns, arată ce ai scris, nu caseta", async () => {
    const { container } = show();
    toEnd();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Am plecat din ședință." } });
    fireEvent.click(screen.getByRole("button", { name: /keep|save/i }));

    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
    expect(said(container, "Am plecat din ședință.")).toBe(true);
  });
});
