/**
 * tools / shared — ce au în comun uneltele care pun aceeași întrebare prin mai
 * multe școli: o listă de răspunsuri, fiecare cu pașii lui, și distanța dintre
 * ele. Distanța vine din `models/compare`; nimic de aici nu alege un câștigător.
 */

import {
  type ModelValue, type Scale, type Verdict, type PairDistance, type Group,
  groupsOf, pairwise, overallVerdict, spread,
} from "@/lib/models/compare";
import { reduce } from "@/lib/numerology-plus/core";

export { chain } from "@/lib/models/elements";
export type { Verdict, PairDistance };

export interface SchoolResult {
  /** Identificatorul școlii; eticheta și metoda stau în componentă, pe limbi. */
  id: string;
  value: number;
  /** Calculul, pas cu pas, în cifre — se poate urmări până la intrare. */
  steps: string[];
}

export interface Compared<S extends SchoolResult = SchoolResult> {
  models: S[];
  groups: Group<ModelValue>[];
  pairs: PairDistance[];
  verdict: Verdict;
  spread: number;
}

export function compareSchools<S extends SchoolResult>(models: S[], scale: Scale = "digit"): Compared<S> {
  const values = models.map((m) => ({ id: m.id, value: m.value as ModelValue }));
  const pairs = pairwise(scale, values);
  return { models, groups: groupsOf(values), pairs, verdict: overallVerdict(pairs), spread: spread(pairs) };
}

export const digitsIn = (s: string): number[] => s.replace(/\D/g, "").split("").filter(Boolean).map(Number);

export const plus = (xs: number[]) => xs.join(" + ");

/** Rădăcina fără masteri — cifrele unei adrese sau ale unui telefon. */
export const root = (n: number) => reduce(n, false);

/** Toate cifrele unei date, cu zerourile, în ordinea ZZLLAAAA. */
export const dateDigits = (b: { day: number; month: number; year: number }): number[] =>
  `${String(b.day).padStart(2, "0")}${String(b.month).padStart(2, "0")}${b.year}`.split("").map(Number);
