import { describe, it, expect } from "vitest";
import { buildDial } from "@/lib/dial";
import { dialThesis } from "@/lib/thesis";

/**
 * Propoziția din capul hărții.
 *
 * E singurul loc unde pagina spune harta întreagă într-o frază, deci nu are
 * voie să fie un șablon cu o cifră turnată în el: forma hărții decide ce se
 * spune. O hartă strânsă pe o cifră și una împrăștiată pe cinci sunt lucruri
 * diferite, iar propoziția trebuie să le deosebească.
 */

const T = new Date(2026, 8, 2);
const strânsă = buildDial("Maria Elena Popescu", new Date(1990, 4, 15), "ro", T);
const împrăștiată = buildDial("Ion Gheorghe Vasilescu", new Date(1983, 10, 7), "ro", T);

describe("dialThesis", () => {
  it("spune ce cifră adună harta, când o adună", () => {
    // 3 poartă patru din cinci numere.
    const t = dialThesis(strânsă, "ro");
    expect(t.lead).toContain("3");
    expect(`${t.lead} ${t.note}`).toMatch(/patru/i);
  });

  it("numește excepția, nu doar grămada", () => {
    // Fără ea, propoziția ar spune „totul e 3" -- ceea ce nu e adevărat, și
    // tocmai neadevărul ăla e miezul hărții.
    const t = dialThesis(strânsă, "ro");
    expect(`${t.lead} ${t.note}`).toContain("Sufletul");
    expect(`${t.lead} ${t.note}`).toContain("9");
  });

  it("spune altceva despre o hartă care nu se repetă", () => {
    const t = dialThesis(împrăștiată, "ro");
    const spus = `${t.lead} ${t.note}`;

    expect(spus).not.toMatch(/aproape tot/i);
    expect(spus).toMatch(/cinci/i);
  });

  it("nu inventează o excepție când nu există", () => {
    // Harta împrăștiată n-are grămadă, deci n-are nici excepție.
    const t = dialThesis(împrăștiată, "ro");
    expect(`${t.lead} ${t.note}`).not.toMatch(/spune altceva/i);
  });

  it("dă o propoziție în fiecare limbă, fără să lase română în engleză", () => {
    for (const lang of ["ro", "en", "ru"] as const) {
      const f = buildDial("Maria Elena Popescu", new Date(1990, 4, 15), lang, T);
      const t = dialThesis(f, lang);
      expect(t.lead.length, lang).toBeGreaterThan(10);
      expect(t.note.length, lang).toBeGreaterThan(10);
    }
    // Cuvântul care ar trăda un șablon românesc rămas în engleză.
    const en = dialThesis(buildDial("Maria Elena Popescu", new Date(1990, 4, 15), "en", T), "en");
    expect(`${en.lead} ${en.note}`).not.toMatch(/harta|spune|Sufletul/i);
  });
});
