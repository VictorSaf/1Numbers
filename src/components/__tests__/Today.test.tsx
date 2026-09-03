import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Today } from "../Today";
import { buildToday } from "@/lib/today";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * Ziua: scurtă, personală, întreagă.
 *
 * Harta se citește o dată în viață și merită pași. Ziua se citește în fiecare
 * dimineață, deci se arată dintr-o bucată -- patru apăsări ca să afli ce cere
 * ziua fac dintr-un minut de citit cinci de clicuri.
 *
 * Câte fraze depinde de câte relații are ziua cu harta. Cerându-le mereu pe
 * amândouă, aceeași propoziție pleca de două ori spre model și se întorcea
 * reformulată de două ori: două paragrafe cu același înțeles, unul sub altul.
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

const show = (on: Date = TODAY) =>
  render(
    <LanguageProvider>
      <Today fullName={NAME} birthDate={BIRTH} today={on} />
    </LanguageProvider>,
  );

/**
 * Frazele se dezvăluie cuvânt cu cuvânt, deci fiecare cuvânt e propriul span
 * și potrivirea pe text exact nu găsește nimic. Textul E în pagină -- de asta
 * decalajul e în CSS, nu pe cronometre -- doar că spart. Aici se recompune.
 */
const says = (el: HTMLElement, text: string) =>
  el.textContent?.replace(/\s+/g, " ").includes(text.replace(/\s+/g, " "));

/** Semnalul că textul a sosit e chiar textul: nu mai există buton, nici casetă. */
const ready = () =>
  waitFor(() => expect(document.querySelectorAll("[data-beat]").length).toBeGreaterThan(0));

beforeEach(() => {
  create.mockClear();
  // Implicit: serverul întoarce exact ce i s-a trimis, ca testele să vorbească
  // despre structură, nu despre ce scrie modelul.
  read.mockReset().mockImplementation(async (body: { composed: Record<string, string> }) => ({
    body: body.composed,
    source: "composed",
    cached: false,
  }));
  localStorage.clear();
});

describe("Today", () => {
  it("arată cifra zilei tale, mare, cu numele arhetipului", async () => {
    show();
    await ready();

    // Cifra apare o singură dată: numărul arcanei E cifra zilei, iar scris de
    // două ori ar fi chiar duplicarea pe care pagina o avea.
    expect(screen.getAllByText(String(reading.day))).toHaveLength(1);
    expect(screen.getByText(reading.title)).toBeInTheDocument();
  });

  it("arată ziua întreagă dintr-o dată, fără pași intermediari", async () => {
    const { container } = show();
    await ready();

    expect(container.querySelectorAll("[data-beat]").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByRole("button", { name: /go on|continue|mai departe/i }),
    ).not.toBeInTheDocument();
  });

  it("spune cum întâlnește ziua harta ta", async () => {
    const { container } = show();
    await ready();

    for (const rel of reading.relations) expect(says(container, rel.text)).toBe(true);
  });

  it("spune de unde vine cifra, la final", async () => {
    const { container } = show();
    await ready();

    expect(says(container, reading.plain)).toBe(true);
  });
});

describe("Today, cartea zilei", () => {
  it("dă cartea cu numărul zilei, nu una trasă la întâmplare", async () => {
    const { container } = show();
    await ready();

    expect(container.textContent).toContain(reading.card.title);
    expect(container.textContent).toContain(reading.card.light);
    expect(container.textContent).toContain(reading.card.shadow);
  });

  it("arată chiar cartea, nu doar numele ei", async () => {
    const { container } = show();
    await ready();

    const img = container.querySelector("img") as HTMLImageElement | null;
    expect(img).not.toBeNull();
    // Fișierul poartă numărul arcanei DIN MOTOR. Motorul are 8 = Dreptatea și
    // 11 = Forța; pachetul din 1909 le are invers, fiindcă Waite le-a schimbat
    // locul. Maparea s-a făcut la descărcare, deci aici indicele e al nostru.
    expect(img!.getAttribute("src")).toBe(`/tarot/${reading.card.n}.jpg`);
    expect(img!.getAttribute("alt")).toBe(reading.card.title);
  });

  it("arată atmosfera potrivită tonului zilei", async () => {
    const { container } = show();
    await ready();

    // Tonul iese din relația cifrei de azi cu harta. Decorativ ar fi fost dacă
    // ar fi arătat la fel în fiecare zi.
    expect(container.querySelector(".day-sky")?.getAttribute("data-mood")).toBe(reading.mood);
  });
});

describe("Today, cine scrie textul", () => {
  it("nu trimite nimic nicăieri dacă omul a ales textul local", async () => {
    // Nu „trimite și ignoră răspunsul”: cererea nu se face deloc. Altfel
    // comutatorul ar schimba ce VEDE omul, nu ce PLEACĂ despre el.
    localStorage.setItem("day-text-source", "local");
    const { container } = show();

    await waitFor(() => expect(container.querySelectorAll("[data-beat]").length).toBeGreaterThan(0));
    expect(read).not.toHaveBeenCalled();
    expect(says(container, reading.say)).toBe(true);
  });

  it("spune că textul e scris de un model, dar numai când chiar e", async () => {
    // Articolul 50 din AI Act: un text generat trebuie să se vadă că e generat.
    // Iar unul compus local nu trebuie să pretindă că a fost.
    const cuModel = show();
    await ready();
    expect(cuModel.container.querySelector("[data-ai-generated]")).not.toBeNull();
    cuModel.unmount();

    localStorage.setItem("day-text-source", "local");
    const local = show();
    await waitFor(() => expect(local.container.querySelectorAll("[data-beat]").length).toBeGreaterThan(0));
    expect(local.container.querySelector("[data-ai-generated]")).toBeNull();
  });
});

describe("Today, ce trimite la server", () => {
  it("trimite exact atâtea relații câte are ziua, fără să repete", async () => {
    // Cerându-le mereu pe amândouă, `fric` și `aproape` cădeau pe aceeași
    // propoziție când exista o singură relație -- iar modelul o reformula de
    // două ori.
    show();
    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));

    const sent = read.mock.calls[0][0] as { composed: Record<string, string> };
    const parts = Object.entries(sent.composed)
      .filter(([k]) => k === "fric" || k === "aproape")
      .map(([, v]) => v);

    expect(parts.length).toBe(reading.relations.length);
    expect(new Set(parts).size).toBe(parts.length);
  });

  it("nu randează de două ori aceeași propoziție", async () => {
    const { container } = show();
    await ready();

    const beats = [...container.querySelectorAll("[data-beat]")].map((b) =>
      b.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(new Set(beats).size).toBe(beats.length);
  });

  it("trimite propozițiile compuse, nu doar cifrele", async () => {
    show();
    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));

    const sent = read.mock.calls[0][0] as { personalDay: number; composed: { ziua: string } };
    expect(sent.personalDay).toBe(reading.day);
    expect(sent.composed.ziua).toBe(reading.say);
  });

  it("trimite ziua din calendarul omului, nu din UTC", async () => {
    // toISOString() convertește în UTC. La est de Greenwich, orele mici ale
    // nopții cad în ziua precedentă; la vest, serile cad în ziua următoare.
    const noaptea = new Date(2026, 8, 1, 1, 30);
    show(noaptea);

    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));
    expect((read.mock.calls[0][0] as { date: string }).date).toBe(formatCalendarDate(noaptea));
  });

  it("arată ziua compusă dacă serverul cade, fără să spună nimic despre eroare", async () => {
    read.mockRejectedValue(new Error("offline"));
    const { container } = show();

    await waitFor(() => expect(says(container, reading.say)).toBe(true));
    expect(container.textContent).not.toMatch(/eroare|error|failed/i);
  });

  it("nu arată nimic până nu știe ce arată", () => {
    const { container } = show();
    expect(container.querySelectorAll("[data-beat]")).toHaveLength(0);
  });
});
