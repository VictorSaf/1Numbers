/**
 * numerology-plus / psychomatrix — Pătratul lui Pitagora (А. Ф. Александров)
 *
 * Standardul pieței ruse. Aceleași cifre ale datei ca Lo Shu, dar:
 * - li se adaugă patru „numere de lucru" (рабочие числа), calculate din dată;
 * - se așază pe o grilă 1-4-7 / 2-5-8 / 3-6-9, citită pe rânduri, coloane și
 *   diagonale, nu pe săgețile Lo Shu.
 *
 * Numerele de lucru:
 *   N1 = suma tuturor cifrelor datei
 *   N2 = suma cifrelor lui N1
 *   N3 = N1 − 2 × prima cifră nenulă a zilei
 *   N4 = suma cifrelor lui N3
 *
 * DEZACORD ÎN ȘCOALĂ — născuții după 2000. Formula dă N3 negativ sau mic, iar
 * școlile se despart:
 *   'absolute' — se ia |N3| (regula clasică, extinsă)
 *   'plus19'   — N3 = N1 + 19, N4 = suma cifrelor lui N3 (varianta „2000+")
 * Înainte de 2000 cele două coincid. Aplicațiile aleg una în tăcere; noi le
 * calculăm pe amândouă.
 */

import type { BirthDate } from "./core.js";

export type Post2000Rule = "absolute" | "plus19";

const digits = (n: number) => String(Math.abs(n)).split("").map(Number);
const dsum = (n: number) => digits(n).reduce((a, d) => a + d, 0);

export interface Psychomatrix {
  dateDigits: number[];
  working: [number, number, number, number];
  /** counts[d] = de câte ori apare cifra d (1..9). Zero nu intră în grilă. */
  counts: Record<number, number>;
  /** Cifrele 1..9 care nu apar deloc. */
  missing: number[];
  lines: Record<LineKey, number>;
  rule: Post2000Rule;
}

export type LineKey =
  | "purpose" | "family" | "habits" // rânduri: 1-4-7, 2-5-8, 3-6-9
  | "selfEsteem" | "work" | "talent" // coloane: 1-2-3, 4-5-6, 7-8-9
  | "spirit" | "temperament"; // diagonale: 1-5-9, 3-5-7

export const LINES: Record<LineKey, number[]> = {
  purpose: [1, 4, 7],
  family: [2, 5, 8],
  habits: [3, 6, 9],
  selfEsteem: [1, 2, 3],
  work: [4, 5, 6],
  talent: [7, 8, 9],
  spirit: [1, 5, 9],
  temperament: [3, 5, 7],
};

/** Grila în ordinea de afișare clasică: coloane 1-2-3, 4-5-6, 7-8-9. */
export const GRID_LAYOUT = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

export function workingNumbers(b: BirthDate, rule: Post2000Rule = "absolute"): [number, number, number, number] {
  const all = [...digits(b.day), ...digits(b.month), ...digits(b.year)];
  const n1 = all.reduce((a, d) => a + d, 0);
  const n2 = dsum(n1);
  let n3: number;
  if (b.year >= 2000 && rule === "plus19") {
    n3 = n1 + 19;
  } else {
    const first = digits(b.day).find((d) => d !== 0) ?? 0;
    n3 = Math.abs(n1 - 2 * first);
  }
  const n4 = dsum(n3);
  return [n1, n2, n3, n4];
}

export function psychomatrix(b: BirthDate, rule: Post2000Rule = "absolute"): Psychomatrix {
  const dateDigits = [
    ...String(b.day).padStart(2, "0").split("").map(Number),
    ...String(b.month).padStart(2, "0").split("").map(Number),
    ...String(b.year).split("").map(Number),
  ];
  const working = workingNumbers(b, rule);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of [...dateDigits, ...working.flatMap(digits)]) if (d > 0) counts[d]++;
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => counts[d] === 0);
  const lines = Object.fromEntries(
    (Object.keys(LINES) as LineKey[]).map((k) => [k, LINES[k].reduce((a, d) => a + counts[d], 0)]),
  ) as Record<LineKey, number>;
  return { dateDigits, working, counts, missing, lines, rule };
}

/** Puterea unei linii, după convenția școlii: 0–2 slab, 3–4 mediu, 5+ puternic. */
export function lineStrength(n: number): "weak" | "medium" | "strong" {
  return n <= 2 ? "weak" : n <= 4 ? "medium" : "strong";
}

/** Puterea unei celule: 0 lipsă, 1 normal, 2 accentuat, 3+ excesiv. */
export function cellStrength(n: number): "absent" | "normal" | "strong" | "excess" {
  return n === 0 ? "absent" : n === 1 ? "normal" : n === 2 ? "strong" : "excess";
}
