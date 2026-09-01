import { calculatePersonalYearNumber } from "./numerology";
import { getCompatibilityScore, getCompatibilityLevel } from "./compatibility";

/**
 * Relația, în timp.
 *
 * Scorul din /doi spune cât de aproape sunt doi oameni. Nu spune nimic despre
 * *acum*: doi oameni care se potrivesc bine pot fi, anul ăsta, în ani personali
 * care trag în direcții opuse. Modulul ăsta adaugă exact stratul acela.
 *
 * Nu inventează nicio formulă. Anul personal vine din motor
 * (`calculatePersonalYearNumber`), iar relația dintre două numere vine din
 * matricea care există deja (`getCompatibilityScore`). Ponderile
 * Drum 50% / Destin 30% / Suflet 20% din `calculateCompatibility` rămân
 * neatinse -- stratul ăsta stă lângă ele, nu în ele.
 */

export type AlignmentBand = "harmony" | "mixed" | "tension";

/**
 * Trei benzi, nu patru: pragurile sunt cele din `getCompatibilityLevel`, ca să
 * nu apară un al doilea set de praguri care poate să dea alt răspuns decât
 * scorul de deasupra. „excellent" și „good" citesc amândouă ca armonie.
 */
export const bandForScore = (score: number): AlignmentBand => {
  const level = getCompatibilityLevel(score);
  if (level === "excellent" || level === "good") return "harmony";
  if (level === "moderate") return "mixed";
  return "tension";
};

export interface YearAlignment {
  year: number;
  person1: number;
  person2: number;
  score: number;
  band: AlignmentBand;
}

export const calculateYearAlignment = (
  birthDate1: Date,
  birthDate2: Date,
  year: number = new Date().getFullYear(),
): YearAlignment => {
  const person1 = calculatePersonalYearNumber(birthDate1, year);
  const person2 = calculatePersonalYearNumber(birthDate2, year);
  const score = getCompatibilityScore(person1, person2);

  return { year, person1, person2, score, band: bandForScore(score) };
};
