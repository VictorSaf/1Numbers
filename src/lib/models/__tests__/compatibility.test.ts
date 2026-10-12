import { describe, it, expect } from "vitest";
import { compareCouple, type CoupleComparison } from "../compatibility";
import { personalYear } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * Fiecare metodă de compatibilitate din piață, pusă pe aceeași pereche.
 * Testele verifică verdictele calculabile de mână și forma rezultatului:
 * grupuri, perechi de dezacord, o propoziție care numără — niciodată o medie.
 */

const v = (r: CoupleComparison, id: string) => {
  const m = r.methods.find((x) => x.id === id);
  if (!m) throw new Error(`lipsește metoda ${id}`);
  return m;
};

const today = new Date(2026, 9, 12);
// Ana: 2000-01-01 → Drumul 1+1+2 = 4, Mulank 1.  Ion: 2000-01-06 → 1+6+2 = 9, Mulank 6.
const ana = { name: "Ana Pop", birthDate: new Date(2000, 0, 1) };
const ion = { name: "Ion Rus", birthDate: new Date(2000, 0, 6) };

describe("compareCouple — metodele", () => {
  const r = compareCouple(ana, ion, { lang: "ro", today });

  it("are toate metodele, fără Kua când lipsesc genurile", () => {
    const ids = r.methods.map((m) => m.id);
    expect(ids).toEqual([
      "lp-cheatsheet", "lp-harmony", "lp-app-matrix", "odd-even", "core-five",
      "relationship-lp", "relationship-expression", "soul-a-personality-b", "soul-b-personality-a",
      "karmic-lessons", "lo-shu", "psychomatrix", "vedic-app", "vedic-grahai",
      "chaldean-cheiro", "personal-year",
    ]);
    expect(r.skipped.map((s) => s.id)).toEqual(["kua"]);
  });

  it("fiecare metodă are școală, metodă, intrări, pași și motiv", () => {
    for (const m of r.methods) {
      expect(m.school.length).toBeGreaterThan(0);
      expect(m.method.length).toBeGreaterThan(0);
      expect(m.inputs.a.length).toBeGreaterThan(0);
      expect(m.inputs.b.length).toBeGreaterThan(0);
      expect(m.steps.length).toBeGreaterThan(0);
      expect(m.reason.length).toBeGreaterThan(0);
      expect(["harmonious", "neutral", "challenging"]).toContain(m.verdict);
    }
  });

  it("par/impar: 4 și 9 sunt de parități diferite", () => {
    expect(v(r, "odd-even").verdict).toBe("challenging");
  });

  it("cele două tabele numerologist.com nu spun același lucru despre 4 și 9", () => {
    expect(v(r, "lp-cheatsheet").verdict).toBe("neutral"); // 4: possible 9
    expect(v(r, "lp-harmony").verdict).toBe("challenging"); // 9: growth-edge 4
  });

  it("matricea aplicației dă 50 pentru 4 și 9", () => {
    expect(v(r, "lp-app-matrix").verdict).toBe("challenging");
    expect(v(r, "lp-app-matrix").steps.join(" ")).toContain("50");
  });

  it("numărul relației: 4 + 9 = 13 → 4, unul dintre cele trei numite favorabile", () => {
    expect(v(r, "relationship-lp").verdict).toBe("harmonious");
    expect(v(r, "relationship-lp").steps.join(" ")).toContain("13 → 4");
  });

  it("tabelul vedic al aplicației și cel grahai.com se despart pe Mulank 1 și 6", () => {
    expect(v(r, "vedic-app").verdict).toBe("neutral"); // neutru–neutru = 3 puncte
    expect(v(r, "vedic-grahai").verdict).toBe("challenging"); // dușman–dușman = 0
  });

  it("cele cinci numere de bază sunt citite pereche cu pereche", () => {
    expect(v(r, "core-five").steps).toHaveLength(5);
  });
});

describe("compareCouple — tabelele Drumului", () => {
  // 1 ianuarie 2000 + zi d → Drumul 1 + d + 2; ziua se alege ca să dea n.
  const withLp = (n: number) => new Date(2000, 0, ((n - 3 + 18) % 9) || 9);
  const run = (a: number, b: number) =>
    compareCouple({ name: "X", birthDate: withLp(a) }, { name: "Y", birthDate: withLp(b) }, { lang: "en", today });

  it("fișa numerologist.com acoperă orice pereche 1–9, fără goluri și fără contradicții", () => {
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++)
        expect(v(run(a, b), "lp-cheatsheet").reason).not.toMatch(/does not name|contradicts/);
  });

  it("tabelul cu rânduri pentru masteri citește 11 ca 11: 11 și 8 sunt prag de creștere", () => {
    // 2000-01-08 → 1 + 8 + 2 = 11
    const r = compareCouple({ name: "X", birthDate: new Date(2000, 0, 8) }, { name: "Y", birthDate: withLp(8) }, { lang: "en", today });
    expect(v(r, "lp-harmony").inputs.a).toContain("11");
    expect(v(r, "lp-harmony").verdict).toBe("challenging");
  });
});

describe("compareCouple — acoperiri", () => {
  it("lecțiile karmice: fiecare umple tot ce îi lipsește celuilalt", () => {
    // „Ana" are doar 1 și 5; „Bcd Fghi" are 2,3,4,6,7,8,9.
    const r = compareCouple({ name: "Ana", birthDate: ana.birthDate }, { name: "Bcd Fghi", birthDate: ion.birthDate }, { today });
    expect(v(r, "karmic-lessons").verdict).toBe("harmonious");
  });

  it("lecțiile karmice: două nume identice nu acoperă nimic", () => {
    const r = compareCouple({ name: "Ana", birthDate: ana.birthDate }, { name: "Ana", birthDate: ion.birthDate }, { today });
    expect(v(r, "karmic-lessons").verdict).toBe("challenging");
  });

  it("Lo Shu și psihomatricea: aceeași dată nu umple nicio celulă goală", () => {
    const r = compareCouple(ana, { name: "Ion Rus", birthDate: ana.birthDate }, { today });
    expect(v(r, "lo-shu").verdict).toBe("challenging");
    expect(v(r, "psychomatrix").verdict).toBe("challenging");
  });
});

describe("compareCouple — timp și Kua", () => {
  it("anul personal: aceeași zi și lună dau același an personal", () => {
    const r = compareCouple(ana, { name: "Ion Rus", birthDate: new Date(1987, 0, 1) }, { today });
    const py = personalYear(toBirthDate(ana.birthDate), 2026).value;
    expect(v(r, "personal-year").verdict).toBe("harmonious");
    expect(v(r, "personal-year").inputs.a).toContain(String(py));
  });

  it("Kua: același grup (vest) e armonie, grupuri diferite e tensiune", () => {
    const f1990 = { name: "Ana Pop", birthDate: new Date(1990, 4, 1) }; // femeie 1990 → 8, vest
    const m1985 = { name: "Ion Rus", birthDate: new Date(1985, 4, 1) }; // bărbat 1985 → 6, vest
    const m1990 = { name: "Ion Rus", birthDate: new Date(1990, 4, 1) }; // bărbat 1990 → 1, est
    const same = compareCouple(f1990, m1985, { today, genderA: "female", genderB: "male" });
    const diff = compareCouple(f1990, m1990, { today, genderA: "female", genderB: "male" });
    expect(v(same, "kua").verdict).toBe("harmonious");
    expect(v(diff, "kua").verdict).toBe("challenging");
    expect(same.skipped).toEqual([]);
  });
});

describe("compareCouple — întregul", () => {
  const r = compareCouple(ana, ion, { lang: "ro", today });

  it("grupurile acoperă toate metodele, cel mai numeros primul", () => {
    const total = r.groups.reduce((a, g) => a + g.ids.length, 0);
    expect(total).toBe(r.methods.length);
    for (let i = 1; i < r.groups.length; i++)
      expect(r.groups[i - 1].ids.length).toBeGreaterThanOrEqual(r.groups[i].ids.length);
    expect(r.counts.harmonious + r.counts.neutral + r.counts.challenging).toBe(r.methods.length);
  });

  it("măsoară fiecare pereche de metode o singură dată, pe scara categoriei", () => {
    const n = r.methods.length;
    expect(r.pairs).toHaveLength((n * (n - 1)) / 2);
    expect(r.disagreements).toBe(r.pairs.filter((p) => p.distance > 0).length);
    expect(r.verdict).toBe("apart");
    expect(r.spread).toBe(1);
  });

  it("propoziția numără metodele și nu dă niciun procent", () => {
    expect(r.says).toContain(String(r.methods.length));
    expect(r.says).toContain(String(r.counts.harmonious));
    expect(r.says).not.toMatch(/%/);
  });

  it("vorbește în limba cerută", () => {
    const en = compareCouple(ana, ion, { lang: "en", today });
    const ru = compareCouple(ana, ion, { lang: "ru", today });
    expect(en.methods[0].school).not.toBe(r.methods[0].school);
    expect(ru.methods[0].school).not.toBe(en.methods[0].school);
    expect(en.says).toMatch(/methods/);
  });
});
