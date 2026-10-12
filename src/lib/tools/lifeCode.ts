/**
 * tools / lifeCode — „жизненный код" după Klara Kuzdenbaeva.
 *
 * Formula, așa cum e publicată (ok.ru/vitomatematika/topic/63334202067815,
 * exemplu 05.06.1977 → 358257; aceeași pe taynoeznanie.com):
 *   W1 = suma tuturor cifrelor datei (zerourile nu adaugă nimic)
 *   W2 = suma cifrelor lui W1
 *   W3 = W1 − 2 × prima cifră (nenulă) a zilei
 *   W4 = suma cifrelor lui W3 — o singură dată; dacă iese de două cifre, rămâne
 *   Codul = W1 W2 W3 W4 scrise unul după altul. De obicei 6 cifre, uneori 7.
 * Apoi se numără, pentru fiecare cifră 1–9, de câte ori apare în dată și cod.
 *
 * Nu are nevoie de nume. Kuzdenbaeva spune că în consultații folosește și
 * numele și patronimicul, dar acea metodă NU e publicată — n-o inventăm.
 *
 * Ce sursa nu spune: ce se face când W3 iese negativ (născuți după 2000, ziua
 * cu prima cifră mare). Pentru acest caz arătăm cele două convenții ale
 * pătratului lui Pitagora (Alexandrov), care folosește exact aceleași numere de
 * lucru: |W3| și W1 + 19. Le arătăm și pentru orice an ≥ 2000, unde școala
 * pătratului se desparte oricum.
 */

import { type BirthDate } from "@/lib/numerology-plus/core";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { workingNumbers, type Post2000Rule } from "@/lib/numerology-plus/psychomatrix";
import { pairVerdict, distance, type Verdict } from "@/lib/models/compare";
import { dateDigits, plus } from "./shared";

const ds = (n: number) => String(Math.abs(n)).split("").map(Number);
const dsum = (n: number) => ds(n).reduce((a, d) => a + d, 0);

export interface LifeCode {
  working: [number, number, number, number];
  code: string;
  length: number;
  steps: string[];
  /** counts[d] — de câte ori apare cifra d (1–9) în dată și în cod. */
  counts: Record<number, number>;
  /** Grupurile de cifre egale, cum le scrie metoda: „111", „88", „5". */
  groups: string[];
  negativeThird: boolean;
  alternatives: Array<{ id: Post2000Rule; working: [number, number, number, number]; code: string }>;
  vsLifePath: { w2: number; lifePath: number; distance: number; verdict: Verdict };
}

export function lifeCode(b: BirthDate): LifeCode {
  const date = dateDigits(b);
  const w1 = date.reduce((a, d) => a + d, 0);
  const w2 = dsum(w1);
  const first = ds(b.day).find((d) => d !== 0) ?? 0;
  const w3 = w1 - 2 * first;
  const w4 = dsum(w3);
  const working: [number, number, number, number] = [w1, w2, w3, w4];
  const code = working.map((n) => String(Math.abs(n))).join("");

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of [...date, ...code.split("").map(Number)]) if (d > 0) counts[d]++;
  const groups = Object.entries(counts)
    .filter(([, c]) => c > 0)
    .map(([d, c]) => d.repeat(c));

  const negativeThird = w3 < 0;
  const alternatives =
    negativeThird || b.year >= 2000
      ? (["absolute", "plus19"] as const).map((id) => {
          const w = workingNumbers(b, id);
          return { id, working: w, code: w.join("") };
        })
      : [];

  const lp = lifePath(b).value;
  return {
    working,
    code,
    length: code.length,
    steps: [
      `W1 = ${plus(date)} = ${w1}`,
      `W2 = ${plus(ds(w1))} = ${w2}`,
      `W3 = ${w1} − 2 × ${first} = ${w3}`,
      `W4 = ${plus(ds(w3))} = ${w4}`,
    ],
    counts,
    groups,
    negativeThird,
    alternatives,
    vsLifePath: { w2, lifePath: lp, distance: distance("digit", w2, lp), verdict: pairVerdict("digit", w2, lp) },
  };
}
