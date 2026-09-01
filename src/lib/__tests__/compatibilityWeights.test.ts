import { describe, it, expect } from "vitest";
import { calculateCompatibility, getCompatibilityScore } from "../compatibility";

/**
 * Stratul temporal se adaugă peste scor, nu în el.
 *
 * Ponderile Drum 50% / Destin 30% / Suflet 20% sunt contractul pe care îl
 * citește omul în /doi -- cele trei carduri își scriu procentele pe ecran.
 * Testul ăsta le recalculează din componente, ca o schimbare a lor să cadă aici
 * și nu la primul utilizator care observă că numerele nu mai ies.
 */

const ANA = { fullName: "Ana Pop", birthDate: new Date(1990, 4, 15) };
const ION = { fullName: "Ion Popescu", birthDate: new Date(1985, 10, 3) };

describe("ponderile compatibilității", () => {
  it("rămân 50 / 30 / 20", () => {
    const result = calculateCompatibility(ANA, ION);

    const expected = Math.round(
      result.lifePathCompatibility.score * 0.5 +
        result.destinyCompatibility.score * 0.3 +
        result.soulUrgeCompatibility.score * 0.2,
    );

    expect(result.overallScore).toBe(expected);
  });

  it("citesc fiecare componentă din aceeași matrice", () => {
    const result = calculateCompatibility(ANA, ION);

    expect(result.lifePathCompatibility.score).toBe(
      getCompatibilityScore(result.lifePathCompatibility.person1, result.lifePathCompatibility.person2),
    );
    expect(result.destinyCompatibility.score).toBe(
      getCompatibilityScore(result.destinyCompatibility.person1, result.destinyCompatibility.person2),
    );
    expect(result.soulUrgeCompatibility.score).toBe(
      getCompatibilityScore(result.soulUrgeCompatibility.person1, result.soulUrgeCompatibility.person2),
    );
  });

  it("nu depinde de anul în care e rulat", () => {
    // Stratul temporal are un an implicit. Scorul de bază nu are voie să-l
    // capete: aceeași pereche trebuie să dea același număr și la anul.
    const first = calculateCompatibility(ANA, ION).overallScore;
    const second = calculateCompatibility(ANA, ION).overallScore;

    expect(second).toBe(first);
    expect(Object.keys(calculateCompatibility(ANA, ION))).toEqual([
      "overallScore",
      "lifePathCompatibility",
      "destinyCompatibility",
      "soulUrgeCompatibility",
    ]);
  });
});
