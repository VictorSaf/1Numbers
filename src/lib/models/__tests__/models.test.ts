import { describe, it, expect } from "vitest";
import { distance, pairVerdict, groupsOf } from "../compare";
import { compareAll, chain } from "../elements";
import { psychomatrix, workingNumbers } from "@/lib/numerology-plus/psychomatrix";
import { birthCards, yearCard, toArcana } from "@/lib/numerology-plus/tarot";

const byKey = (list: ReturnType<typeof compareAll>, key: string) => list.find((c) => c.key === key)!;
const model = (c: ReturnType<typeof compareAll>[number], id: string) => c.models.find((m) => m.id === id)!;

describe("compare", () => {
  it("măsoară cifrele pe rădăcină: 11 și 2 sunt la distanța 0, alt registru", () => {
    expect(distance("digit", 11, 2)).toBe(0);
    expect(pairVerdict("digit", 11, 2)).toBe("octave");
    expect(pairVerdict("digit", 3, 9)).toBe("apart");
    expect(pairVerdict("digit", 3, 4)).toBe("near");
  });

  it("compară mulțimile prin diferența simetrică, indiferent de ordine", () => {
    expect(distance("set", [1, 2, 3], [3, 2, 1])).toBe(0);
    expect(distance("set", [1, 2], [2, 5])).toBe(2);
    expect(pairVerdict("set", [], [])).toBe("agree");
  });

  it("grupează modelele care dau același răspuns, cel mai mare grup primul", () => {
    const g = groupsOf([
      { id: "a", value: 2 },
      { id: "b", value: 11 },
      { id: "c", value: 11 },
    ]);
    expect(g[0]).toEqual({ value: 11, ids: ["b", "c"] });
  });

  it("scrie lanțul de reducere și se oprește pe un master", () => {
    expect(chain(49)).toBe("49 → 13 → 4");
    expect(chain(29)).toBe("29 → 11");
    expect(chain(29, false)).toBe("29 → 11 → 2");
  });
});

describe("psihomatricea Alexandrov", () => {
  it("dă numerele de lucru ale exemplului standard (29.03.1985 → 37, 10, 33, 6)", () => {
    expect(workingNumbers({ day: 29, month: 3, year: 1985 })).toEqual([37, 10, 33, 6]);
  });

  it("numără cifrele datei și ale numerelor de lucru, fără zero", () => {
    const p = psychomatrix({ day: 29, month: 3, year: 1985 });
    // 2 9 0 3 1 9 8 5 | 3 7 1 0 3 3 6
    expect(p.counts).toEqual({ 1: 2, 2: 1, 3: 4, 4: 0, 5: 1, 6: 1, 7: 1, 8: 1, 9: 2 });
    expect(p.missing).toEqual([4]);
    expect(p.lines.spirit).toBe(2 + 1 + 2);
  });

  it("are două reguli după 2000 și le ține separat", () => {
    const b = { day: 5, month: 6, year: 2004 };
    expect(workingNumbers(b, "absolute")).not.toEqual(workingNumbers(b, "plus19"));
    expect(workingNumbers(b, "plus19")[2]).toBe(17 + 19);
  });
});

describe("tarot (Arrien, Greer)", () => {
  it("reduce suma la cel mult 22", () => {
    expect(birthCards({ day: 25, month: 8, year: 1990 })).toEqual({ sum: 2023, personality: 7, soul: 7 });
    expect(toArcana(1999)).toBe(10); // 28 → 10
    expect(yearCard({ day: 25, month: 8, year: 1990 }, 2026).arcana).toBe(toArcana(8 + 25 + 2026));
  });
});

describe("compareAll", () => {
  const TODAY = new Date(2026, 2, 1);

  it("pune Drumul Vieții prin cinci școli și vede că 2 și 11 au aceeași rădăcină", () => {
    const c = byKey(compareAll("Ana Pop", new Date(1988, 2, 27), { today: TODAY }), "lifePath");
    expect(model(c, "segments").value).toBe(2);
    expect(model(c, "flat").value).toBe(11);
    expect(model(c, "bhagyank").value).toBe(2);
    expect(model(c, "horizontal").value).toBe(11);
    expect(c.verdict).toBe("octave");
    expect(c.spread).toBe(0);
  });

  it("pune anul pe 1 ianuarie și pe aniversare, iar înainte de ziua ta ele diferă", () => {
    const c = byKey(compareAll("Ana Pop", new Date(1990, 7, 25), { today: TODAY }), "year");
    expect(model(c, "pyJan").value).toBe(7); // 8 + 7 + (2026 → 1)
    expect(model(c, "pyBirthday").value).toBe(6); // 8 + 7 + (2025 → 9)
  });

  it("citește punctul zilei din Matrice în ambele reduceri peste 22", () => {
    const c = byKey(compareAll("Ana Pop", new Date(1990, 7, 25), { today: TODAY }), "birthArchetype");
    expect(model(c, "matrixDigit").value).toBe(7);
    expect(model(c, "matrixMod").value).toBe(3);
    expect(model(c, "greer").value).toBe(7);
  });

  it("adaugă variantele lui Y doar când numele are Y", () => {
    const withY = byKey(compareAll("Maya Lynn", new Date(1990, 0, 1), { today: TODAY }), "soul");
    const noY = byKey(compareAll("Ana Pop", new Date(1990, 0, 1), { today: TODAY }), "soul");
    expect(withY.models.map((m) => m.id)).toContain("yAlways");
    expect(noY.models.map((m) => m.id)).not.toContain("yAlways");
  });

  it("pune numele de azi lângă cel de la naștere, doar când e dat", () => {
    const c = byKey(compareAll("Ana Pop", new Date(1990, 0, 1), { today: TODAY, currentName: "Ana Ionescu" }), "expression");
    expect(c.models.map((m) => m.id)).toContain("currentName");
  });

  it("calculează Kua doar când genul e dat, cu anul solar de la 4 februarie", () => {
    const none = compareAll("Ana Pop", new Date(1985, 0, 20), { today: TODAY });
    expect(none.find((c) => c.key === "kua")).toBeUndefined();
    const k = byKey(compareAll("Ana Pop", new Date(1985, 0, 20), { today: TODAY, gender: "female" }), "kua");
    expect(model(k, "solar").steps[0]).toBe("1984");
  });

  it("are pentru fiecare comparație o propoziție și cel puțin două modele", () => {
    for (const lang of ["ro", "en", "ru"] as const) {
      for (const c of compareAll("Victor Ion Safta", new Date(1990, 7, 25), { today: TODAY, lang })) {
        expect(c.models.length, c.key).toBeGreaterThanOrEqual(2);
        expect(c.says.length, c.key).toBeGreaterThan(10);
        expect(c.question.length).toBeGreaterThan(3);
      }
    }
  });

  it("spune acordul ca rezultat, nu ca lipsă", () => {
    const c = byKey(compareAll("Ana Pop", new Date(1990, 7, 25), { today: TODAY }), "luckyDays");
    if (c.verdict === "agree") expect(c.says).toMatch(/acord/);
  });
});

describe("zodiac", () => {
  it("tropicalul și sideralul se despart la sfârșitul lui martie", () => {
    const c = compareAll("Ana Pop", new Date(1990, 2, 30), { today: new Date(2026, 0, 1) }).find((x) => x.key === "sunSign")!;
    expect(c.models.map((m) => m.value)).toEqual(["aries", "pisces"]);
    expect(c.verdict).toBe("apart");
  });
  it("animalul chinezesc diferă în ianuarie după convenție", () => {
    const c = compareAll("Ana Pop", new Date(1990, 0, 20), { today: new Date(2026, 0, 1) }).find((x) => x.key === "chineseAnimal")!;
    expect(c.models.map((m) => m.value)).toEqual(["horse", "snake"]);
  });
});
