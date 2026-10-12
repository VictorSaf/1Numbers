/**
 * numerology-plus / tarot — cărțile nașterii și cartea anului (Arrien, Greer)
 *
 * Lună + zi + anul întreg, adunate ca numere; suma cifrelor se repetă până
 * ajunge la cel mult 22. Acela e arcanul Personalității. Redus mai departe la o
 * cifră, dă arcanul Sufletului. Cartea anului e aceeași operație cu anul-țintă
 * în locul anului nașterii.
 *
 * Numerotarea e Rider-Waite (8 Puterea, 11 Dreptatea, 22 = Nebunul). Școala
 * Ladini a Matricei folosește ordinea veche, cu 8 și 11 inversate — încă un loc
 * unde două școli citesc aceeași cifră ca alt arcan.
 */

import type { BirthDate } from "./core.js";

const dsum = (n: number) => String(Math.abs(n)).split("").reduce((a, d) => a + Number(d), 0);

/** Suma cifrelor repetată până la ≤ 22. */
export function toArcana(n: number): number {
  let x = n;
  while (x > 22) x = dsum(x);
  return x === 0 ? 22 : x;
}

export function birthCards(b: BirthDate) {
  const sum = b.month + b.day + b.year;
  const personality = toArcana(sum);
  let soul = personality;
  while (soul > 9) soul = dsum(soul);
  return { sum, personality, soul };
}

export function yearCard(b: BirthDate, year: number) {
  const sum = b.month + b.day + year;
  return { sum, arcana: toArcana(sum) };
}
