/**
 * tools / address — numărul casei, prin patru citiri.
 *
 * Unde se despart sursele:
 * - CE număr se citește. Majoritatea (numerologist.com, apartmenttherapy.com,
 *   aurastrology.com) spun: la bloc, apartamentul, nu blocul — e spațiul tău.
 *   Alții (insightsbyomkar.com, mysticaldigits.com) citesc blocul separat.
 *   Le calculăm pe amândouă.
 * - Litera din număr (12B). Cei mai mulți o adaugă cu valoarea pitagoreică;
 *   unii o ignoră și citesc doar cifrele. Ambele.
 * - Alfabetul literei: pitagoreic sau caldeean (Cheiro).
 * - Homofonele chinezești (4 ≈ „moarte", 8 ≈ „prosperitate") nu reduc nimic:
 *   e o scară diferită (scor, nu cifră), deci nu are distanță față de celelalte.
 *   Se arată alături, fără să fie amestecată în ele.
 */

import { CHALDEAN, PYTHAGOREAN } from "@/lib/numerology-plus/core";
import { homophoneScore } from "@/lib/numerology-plus/applied";
import { chain, compareSchools, digitsIn, plus, root, type Compared, type SchoolResult } from "./shared";

export type AddressSchoolId = "pyth-unit" | "pyth-building" | "unit-digits" | "chaldean-unit";

export interface HomophoneReading {
  digits: string;
  score: number;
  normalized: number;
  has4: boolean;
  has8: boolean;
  sequences: string[];
}

export interface AddressResult extends Compared<SchoolResult & { id: AddressSchoolId }> {
  /** Ce s-a citit ca „unitate": apartamentul dacă există, altfel clădirea. */
  unit: string;
  homophone: { unit: HomophoneReading; building: HomophoneReading | null };
}

function read(label: string, table: Record<string, number> | null): { value: number; steps: string[] } {
  const ds = digitsIn(label);
  const letters = label.toUpperCase().replace(/[^A-Z]/g, "").split("").filter(Boolean);
  const lv = table ? letters.map((ch) => table[ch] ?? 0) : [];
  const parts = [...ds, ...lv];
  const raw = parts.reduce((a, x) => a + x, 0);
  const lettersNote = table && letters.length ? ` (${letters.map((ch, i) => `${ch}=${lv[i]}`).join(", ")})` : "";
  return {
    value: root(raw),
    steps: [`${plus(parts.length ? parts : [0])} = ${raw}${lettersNote}`, chain(raw, false)],
  };
}

function homophone(label: string): HomophoneReading {
  const h = homophoneScore(label);
  return {
    digits: h.digits,
    score: h.score,
    normalized: h.normalized,
    has4: h.digits.includes("4"),
    has8: h.digits.includes("8"),
    sequences: h.sequences.map((s) => s.seq),
  };
}

export function addressSchools(input: { building: string; apartment?: string }): AddressResult {
  const building = input.building.trim();
  const apartment = (input.apartment ?? "").trim();
  const unit = apartment || building;

  const models: Array<SchoolResult & { id: AddressSchoolId }> = [
    { id: "pyth-unit", ...read(unit, PYTHAGOREAN) },
  ];
  if (apartment) models.push({ id: "pyth-building", ...read(building, PYTHAGOREAN) });
  // Fără literă, „doar cifrele" e chiar citirea pitagoreică: n-are ce adăuga.
  if (/[a-z]/i.test(unit)) models.push({ id: "unit-digits", ...read(unit, null) });
  models.push({ id: "chaldean-unit", ...read(unit, CHALDEAN) });

  return {
    ...compareSchools(models),
    unit,
    homophone: { unit: homophone(unit), building: apartment ? homophone(building) : null },
  };
}
