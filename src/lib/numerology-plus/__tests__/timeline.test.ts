import { describe, it, expect } from "vitest";
import { transits, essence, dualitiesTimeline, personalYear, ageAt } from "../pythagorean";
import { PYTHAGOREAN, nameParts, toBirthDate } from "../core";
import { biorhythm, biorhythmSeries, BIORHYTHM_CYCLES } from "../systems";

/**
 * Transits, Essence and biorhythms.
 *
 * Both feed a chart, and a chart is the easiest place for a quiet arithmetic
 * error to hide: a line that is merely plausible still looks like a line. These
 * assert the structural claims the drawings will rest on -- that a letter
 * occupies exactly as many years as its value, that the cycle closes, and that
 * a sine wave really does return to where it started.
 */

const NAME = "Victor Ion Safta";
const BIRTH = toBirthDate(new Date(1990, 7, 25));

describe("transits", () => {
  it("gives each letter a run of years equal to its value", () => {
    // The first name drives the physical transit. Walking one full cycle, each
    // letter must hold the slot for exactly its own value in years.
    const first = nameParts(NAME)[0];
    const cycle = first.split("").reduce((a, c) => a + (PYTHAGOREAN[c] ?? 0), 0);

    const occupancy = new Map<string, number>();
    for (let age = 0; age < cycle; age++) {
      const t = transits(NAME, age).physical!;
      occupancy.set(t.letter, (occupancy.get(t.letter) ?? 0) + 1);
    }
    for (const ch of new Set(first.split(""))) {
      const expected = first.split("").filter((c) => c === ch).length * (PYTHAGOREAN[ch] ?? 0);
      expect(occupancy.get(ch), `letter ${ch}`).toBe(expected);
    }
  });

  it("closes the cycle rather than running off the end of the name", () => {
    const first = nameParts(NAME)[0];
    const cycle = first.split("").reduce((a, c) => a + (PYTHAGOREAN[c] ?? 0), 0);
    // Age 0 and age cycle must land on the same letter, in the same year of it.
    expect(transits(NAME, cycle).physical).toEqual(transits(NAME, 0).physical);
    expect(transits(NAME, cycle * 3 + 5).physical).toEqual(transits(NAME, 5).physical);
  });

  it("counts the year within a letter from one, not zero", () => {
    // A reader seeing "year 0 of 5" would reasonably think the transit had not
    // started yet.
    for (let age = 0; age < 40; age++) {
      const t = transits(NAME, age).physical!;
      expect(t.yearInLetter).toBeGreaterThanOrEqual(1);
      expect(t.yearInLetter).toBeLessThanOrEqual(t.value);
    }
  });

  it("has no middle transit for a two-part name", () => {
    expect(transits("Ion Safta", 5).mental).toBeNull();
    expect(transits("Ion Safta", 5).physical).not.toBeNull();
    expect(transits("Ion Safta", 5).spiritual).not.toBeNull();
  });
});

describe("essence", () => {
  it("is the sum of the active transit letters", () => {
    for (let age = 0; age < 60; age++) {
      const t = transits(NAME, age);
      const raw = (t.physical?.value ?? 0) + (t.mental?.value ?? 0) + (t.spiritual?.value ?? 0);
      expect(essence(NAME, age).raw, `age ${age}`).toBe(raw);
    }
  });

  it("keeps master numbers rather than flattening them", () => {
    // Essence runs through the same reduction as everything else; if a year
    // sums to 11 or 22 it must survive as such.
    const values = Array.from({ length: 90 }, (_, age) => essence(NAME, age).value);
    for (const v of values) {
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(v);
    }
  });
});

describe("dualities timeline", () => {
  const rows = dualitiesTimeline(NAME, BIRTH, 0, 80);

  it("covers every year in the range, once", () => {
    expect(rows).toHaveLength(81);
    expect(rows.map((r) => r.age)).toEqual(Array.from({ length: 81 }, (_, i) => i));
  });

  it("pairs each age with the right calendar year", () => {
    for (const r of rows) expect(r.calendarYear).toBe(BIRTH.year + r.age);
  });

  it("flags a duality exactly when Essence meets the Personal Year", () => {
    // This is the whole point of the row highlight, so it is asserted against
    // both source calculations rather than against the flag alone.
    for (const r of rows) {
      const e = essence(NAME, r.age).value;
      const py = personalYear(BIRTH, r.calendarYear).value;
      expect(r.essence).toBe(e);
      expect(r.personalYear).toBe(py);
      expect(r.duality, `age ${r.age}: ${e} vs ${py}`).toBe(e === py);
    }
  });

  it("finds at least one duality across a lifetime", () => {
    // Not a mathematical necessity, but a timeline with none would mean the
    // highlight is dead code for this name and worth knowing about.
    expect(rows.some((r) => r.duality)).toBe(true);
  });
});

describe("biorhythms", () => {
  const CYCLES = ["physical", "emotional", "intellectual"] as const;

  it("starts every cycle at zero on the day of birth", () => {
    for (const c of CYCLES) expect(biorhythm(0, c)).toBe(0);
  });

  it("returns to the same value after a full period", () => {
    for (const c of CYCLES) {
      const period = BIORHYTHM_CYCLES[c];
      for (const d of [1, 17, 400, 9000]) {
        expect(biorhythm(d + period, c), `${c} at ${d}`).toBeCloseTo(biorhythm(d, c), 10);
      }
    }
  });

  it("stays inside the sine's range", () => {
    for (const c of CYCLES) {
      for (let d = 0; d < 500; d++) {
        const v = biorhythm(d, c);
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("spans the requested window symmetrically around today", () => {
    const rows = biorhythmSeries(11000, 30);
    expect(rows).toHaveLength(31); // -15..+15
    expect(rows[0].offset).toBe(-15);
    expect(rows[rows.length - 1].offset).toBe(15);
    expect(rows.some((r) => r.offset === 0)).toBe(true);
  });

  it("marks a day critical when any cycle crosses the axis", () => {
    const daysAlive = 11000;
    for (const row of biorhythmSeries(daysAlive, 60)) {
      const d = daysAlive + (row.offset as number);
      const anyNearZero = CYCLES.some((c) => Math.abs(biorhythm(d, c)) < 0.05);
      expect(row.critical, `offset ${row.offset}`).toBe(anyNearZero ? 1 : 0);
    }
  });

  it("does mark some days critical in a two-month window", () => {
    // With three cycles crossing zero twice each per period, a 60-day window
    // that flagged nothing would mean the threshold is wrong.
    const rows = biorhythmSeries(11000, 60);
    expect(rows.filter((r) => r.critical === 1).length).toBeGreaterThan(0);
  });
});

describe("ageAt", () => {
  // The timeline highlights "this year", so an off-by-one here would point the
  // reader at the wrong row for months at a time.
  const b = { year: 1990, month: 8, day: 25 };

  it("does not count the birthday before it arrives", () => {
    expect(ageAt(b, new Date(2026, 7, 24))).toBe(35); // 24 Aug, one day short
    expect(ageAt(b, new Date(2026, 7, 25))).toBe(36); // the day itself
  });

  it("handles the months either side of the birthday", () => {
    expect(ageAt(b, new Date(2026, 0, 1))).toBe(35);
    expect(ageAt(b, new Date(2026, 11, 31))).toBe(36);
  });
});
