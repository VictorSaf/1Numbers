import { describe, it, expect } from "vitest";
import { bridges, fullPythagoreanProfile } from "../pythagorean";
import { result } from "../core";

describe("bridges", () => {
  it("reduce masterii înainte de diferență (Decoz): Drum 3, Destin 11 → puntea 1, nu 8", () => {
    const b = bridges(result(21), result(65), result(5), result(6));
    expect(b.lifePathExpression).toBe(1);
  });

  it("rămân în 0–8 pentru orice profil", () => {
    for (const [name, day, month, year] of [
      ["Maya Lynn Popescu", 27, 4, 1988],
      ["Victor Ion Safta", 25, 8, 1990],
      ["Ana Maria Ionescu", 29, 11, 1975],
    ] as const) {
      const p = fullPythagoreanProfile(name, { day, month, year });
      for (const v of Object.values(p.extended.bridges)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(8);
      }
    }
  });
});
