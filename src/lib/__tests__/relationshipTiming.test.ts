import { describe, it, expect } from "vitest";
import { calculateYearAlignment, bandForScore } from "../relationshipTiming";
import { calculatePersonalYearNumber } from "../numerology";
import { getCompatibilityScore } from "../compatibility";

/**
 * Stratul temporal nu inventează nicio formulă. Anul personal vine din motor,
 * relația dintre două numere vine din matricea care există. Testele de aici
 * verifică exact asta: că modulul nu calculează nimic pe cont propriu.
 *
 * De aceea nu se asertează constante magice pentru anul personal -- s-ar
 * transforma într-o a doua definiție a formulei, care poate diverge de motor
 * fără să spună nimeni. Se asertează egalitatea cu motorul însuși.
 */

const ANA = new Date(1990, 4, 15);
const ION = new Date(1985, 10, 3);

describe("banda unui scor", () => {
  it("citește armonie de la 70 în sus", () => {
    // 85 e pragul „excellent" și 70 cel de „good" din getCompatibilityLevel.
    expect(bandForScore(100)).toBe("harmony");
    expect(bandForScore(85)).toBe("harmony");
    expect(bandForScore(70)).toBe("harmony");
  });

  it("citește amestec între 55 și 69", () => {
    expect(bandForScore(69)).toBe("mixed");
    expect(bandForScore(55)).toBe("mixed");
  });

  it("citește tensiune sub 55", () => {
    expect(bandForScore(54)).toBe("tension");
    expect(bandForScore(40)).toBe("tension");
  });
});

describe("alinierea anului", () => {
  it("ia anii personali direct din motor", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.person1).toBe(calculatePersonalYearNumber(ANA, 2026));
    expect(alignment.person2).toBe(calculatePersonalYearNumber(ION, 2026));
  });

  it("ia scorul din matricea existentă, nu dintr-o formulă nouă", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.score).toBe(getCompatibilityScore(alignment.person1, alignment.person2));
  });

  it("poartă anul cerut", () => {
    expect(calculateYearAlignment(ANA, ION, 2031).year).toBe(2031);
  });

  it("cade pe anul curent când nu i se dă unul", () => {
    expect(calculateYearAlignment(ANA, ION).year).toBe(new Date().getFullYear());
  });

  it("îi dă o bandă care se potrivește cu scorul", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.band).toBe(bandForScore(alignment.score));
  });

  it("e simetrică: cine e primul nu schimbă scorul", () => {
    const forward = calculateYearAlignment(ANA, ION, 2026);
    const backward = calculateYearAlignment(ION, ANA, 2026);

    expect(backward.score).toBe(forward.score);
    expect(backward.person1).toBe(forward.person2);
  });
});

import { calculateMonthAlignments, calculateRelationshipTiming } from "../relationshipTiming";
import { calculatePersonalMonthNumber } from "../personalCycles";

describe("alinierea lunilor", () => {
  it("întoarce douăsprezece luni, de la 1 la 12", () => {
    const months = calculateMonthAlignments(ANA, ION, 2026);

    expect(months).toHaveLength(12);
    expect(months.map((m) => m.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("ia lunile personale direct din motor", () => {
    const months = calculateMonthAlignments(ANA, ION, 2026);

    for (const month of months) {
      expect(month.person1).toBe(calculatePersonalMonthNumber(ANA, 2026, month.month));
      expect(month.person2).toBe(calculatePersonalMonthNumber(ION, 2026, month.month));
    }
  });

  it("dă fiecărei luni banda potrivită scorului ei", () => {
    for (const month of calculateMonthAlignments(ANA, ION, 2026)) {
      expect(month.band).toBe(bandForScore(month.score));
    }
  });

  it("ține scorurile în intervalul matricei", () => {
    for (const month of calculateMonthAlignments(ANA, ION, 2026)) {
      expect(month.score).toBeGreaterThanOrEqual(40);
      expect(month.score).toBeLessThanOrEqual(100);
    }
  });

  it("nu întoarce aceeași lună de douăsprezece ori", () => {
    // Dacă indexul s-ar fi pierdut pe drum, toate lunile ar avea aceleași
    // numere -- lucru pe care o aserțiune de lungime nu-l prinde.
    const numbers = calculateMonthAlignments(ANA, ION, 2026).map((m) => `${m.person1}-${m.person2}`);
    expect(new Set(numbers).size).toBeGreaterThan(1);
  });
});

describe("întregul strat temporal", () => {
  it("adună anul și lunile într-un singur obiect", () => {
    const timing = calculateRelationshipTiming(ANA, ION, 2026);

    expect(timing.year).toEqual(calculateYearAlignment(ANA, ION, 2026));
    expect(timing.months).toHaveLength(12);
  });

  it("folosește același an pentru amândouă", () => {
    const timing = calculateRelationshipTiming(ANA, ION, 2029);

    expect(timing.year.year).toBe(2029);
    expect(timing.months[0].person1).toBe(calculatePersonalMonthNumber(ANA, 2029, 1));
  });
});
