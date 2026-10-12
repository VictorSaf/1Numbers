import { describe, it, expect } from "vitest";
import { kuaNumber } from "../systems";

describe("kuaNumber", () => {
  it("rămâne în 1–9 pentru orice an și orice convenție", () => {
    for (let year = 1920; year <= 2030; year++)
      for (const g of ["male", "female"] as const)
        for (const era of ["classic", "century"] as const) {
          const { kua } = kuaNumber(year, g, era);
          expect(kua, `${year} ${g} ${era}`).toBeGreaterThanOrEqual(1);
          expect(kua, `${year} ${g} ${era}`).toBeLessThanOrEqual(9);
          expect(kua).not.toBe(5);
        }
  });

  it("un bărbat născut în 2000, formula clasică: 10 − 0 = 10 → 1", () => {
    expect(kuaNumber(2000, "male", "classic").kua).toBe(1);
  });
});
