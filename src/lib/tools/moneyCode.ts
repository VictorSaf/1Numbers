/**
 * tools / moneyCode — „денежный код" / „финансовый код" (piața rusă).
 *
 * Trei variante publicate, calculate toate:
 * - O cifră: toate cifrele datei, reduse la 1–9 (numeria.ru, „число богатства").
 * - Patru cifre: ziua, luna, anul — fiecare redusă — și suma lor redusă
 *   (chronos.mg/blog/finansovy-kod, peopletalk.ru).
 * - Patru „cifre" cu a patra NEREDUSĂ (exemplul bizmedia.kz: 20.06.1996 →
 *   2, 6, 7, 15).
 *
 * O observație de aritmetică, nu de doctrină: a patra cifră a variantei de
 * patru e MEREU egală cu varianta de o cifră — rădăcina digitală nu depinde de
 * ordinea reducerii. Cele două școli nu se contrazic pe cifra finală; varianta
 * de patru doar mai arată trei cifre pe drum.
 *
 * Nu e un PIN. Un cod derivat din data nașterii e cel mai ușor de ghicit.
 */

import { type BirthDate } from "@/lib/numerology-plus/core";
import { chain, compareSchools, dateDigits, plus, root, type Compared, type SchoolResult } from "./shared";

export interface MoneyCode {
  single: { value: number; steps: string[] };
  fourDigit: { digits: [number, number, number, number]; code: string; steps: string[] };
  unreducedFourth: { parts: [number, number, number, number]; code: string; steps: string[] };
  fourthEqualsSingle: boolean;
  compared: Compared;
}

const sumDigits = (n: number) => String(n).split("").reduce((a, d) => a + Number(d), 0);

export function moneyCode(b: BirthDate): MoneyCode {
  const all = dateDigits(b);
  const allRaw = all.reduce((a, d) => a + d, 0);
  const single = { value: root(allRaw), steps: [`${plus(all)} = ${allRaw}`, chain(allRaw, false)] };

  const d = root(b.day), m = root(b.month), y = root(sumDigits(b.year));
  const s = d + m + y;
  const fourth = root(s);
  const fourDigit = {
    digits: [d, m, y, fourth] as [number, number, number, number],
    code: `${d}${m}${y}${fourth}`,
    steps: [
      `${b.day} → ${chain(b.day, false)}`,
      `${b.month} → ${chain(b.month, false)}`,
      `${b.year} → ${chain(sumDigits(b.year), false)}`,
      `${d} + ${m} + ${y} = ${chain(s, false)}`,
    ],
  };
  const unreducedFourth = {
    parts: [d, m, y, s] as [number, number, number, number],
    code: `${d}-${m}-${y}-${s}`,
    steps: [`${d} + ${m} + ${y} = ${s}`],
  };

  const models: SchoolResult[] = [
    { id: "single", value: single.value, steps: single.steps },
    { id: "four", value: fourth, steps: fourDigit.steps },
    { id: "unreduced", value: s, steps: unreducedFourth.steps },
  ];

  return { single, fourDigit, unreducedFourth, fourthEqualsSingle: fourth === single.value, compared: compareSchools(models) };
}
