import { describe, it, expect } from "vitest";
import { buildToday } from "../today";

/**
 * Ziua, citită prin harta ta.
 *
 * `/azi` calcula ziua personală corect, dar nu știa nimic despre om: ziua 5
 * spunea același lucru unui Drum 6 și unui Drum 1. Asta e o efemeridă, nu o
 * citire -- și e exact ce se găsește gratis în orice aplicație.
 *
 * Textul nu se scrie pe combinații (9 zile × 12 numere × 3 limbi = 324 de
 * paragrafe care ar diverge). Se compune din RAPORTUL dintre ziua de azi și
 * pozițiile hărții, exact cum podurile existente compun contradicțiile.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
type Lang = "ro" | "en" | "ru";

describe("buildToday", () => {
  it("dă ziua personală, nu ziua din calendar", () => {
    const r = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, 1));

    expect(r.day).toBeGreaterThanOrEqual(1);
    expect(r.day).toBeLessThanOrEqual(33);
    // Aceeași zi de calendar, alt om, altă cifră -- altfel nu e a lui.
    const other = buildToday("Ana Maria Pop", new Date(1993, 2, 4), "ro", new Date(2026, 8, 1));
    expect(r.day === other.day && r.say === other.say).toBe(false);
  });

  it("citește ziua prin hartă, nu doar ziua în sine", () => {
    const r = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, 1));

    // Fără nicio relație, textul e o efemeridă: adevărat despre toată lumea.
    expect(r.relations.length).toBeGreaterThan(0);
    for (const rel of r.relations) {
      expect(rel.position.length).toBeGreaterThan(2);
      expect(rel.text.length).toBeGreaterThan(30);
      expect(["resonance", "echo", "friction"]).toContain(rel.kind);
    }
  });

  it("ține ziua pe un ecran: cel mult două relații", () => {
    // Patru poziții comparate cu ziua ar da patru paragrafe, adică iar un
    // depozit. Se arată doar ce e cel mai tare.
    for (let d = 1; d <= 28; d++) {
      const r = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, d));
      expect(r.relations.length, `ziua ${d}`).toBeLessThanOrEqual(2);
    }
  });

  it("numește rezonanța când ziua cade pe un număr din hartă", () => {
    // Peste o lună întreagă, ziua personală trece prin toate cifrele, deci
    // măcar o dată nimerește o poziție a hărții.
    const hits = Array.from({ length: 31 }, (_, i) =>
      buildToday(NAME, BIRTH, "ro", new Date(2026, 8, i + 1)),
    ).flatMap((r) => r.relations.filter((x) => x.kind === "resonance"));

    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h.value).toBe(h.dayValue);
  });

  it("pune o întrebare, ca ziua să nu fie un monolog", () => {
    const r = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, 1));

    expect(r.ask.length).toBeGreaterThan(15);
    expect(r.ask).toMatch(/\?/);
  });

  it("numește în întrebare lucrurile despre care întreabă", () => {
    // „Care dintre cele două a câștigat azi?" -- care două? Întrebarea apare
    // singură, sub o linie de separare, deci nu se poate sprijini pe textul
    // de deasupra: trebuie să-și care singură contextul.
    for (let d = 1; d <= 31; d++) {
      const r = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, d));
      const lead = r.relations.find((x) => x.kind === "friction") ?? r.relations[0];
      if (!lead) continue;

      expect(r.ask, `ziua ${d}`).toContain(lead.position);
      expect(r.ask, `ziua ${d}`).toMatch(new RegExp(`\\b${lead.value}\\b`));
      expect(r.ask, `ziua ${d}`).not.toMatch(/cele două|the two|из двух/);
    }
  });

  it.each<Lang>(["ro", "en", "ru"])("scrie tot, nevid, în %s", (lang) => {
    for (let d = 1; d <= 31; d++) {
      const r = buildToday(NAME, BIRTH, lang, new Date(2026, 8, d));
      expect(r.title.length, `title ${d}`).toBeGreaterThan(2);
      expect(r.say.length, `say ${d}`).toBeGreaterThan(20);
      expect(r.plain.length, `plain ${d}`).toBeGreaterThan(20);
      expect(r.keywords.length).toBeGreaterThanOrEqual(3);
      expect(`${r.say} ${r.plain} ${r.ask}`).not.toMatch(/\{|undefined|NaN/);
    }
  });

  it("dă același răspuns pentru aceeași zi", () => {
    const a = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, 1));
    const b = buildToday(NAME, BIRTH, "ro", new Date(2026, 8, 1));
    expect(a.say).toBe(b.say);
  });
});
