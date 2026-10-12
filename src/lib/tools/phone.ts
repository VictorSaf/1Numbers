/**
 * tools / phone — un număr de telefon, prin trei practici și o scară străină.
 *
 * - Suma tuturor cifrelor (pitagoreic; și verificarea principală în practica
 *   vedică indiană — luckymobilenumberbooth.in, nakshtratak.com).
 * - Ultimele patru cifre (practică vedică răspândită; aceeași sursă o numește
 *   și „mit", deci e o școală, nu un consens).
 * - Ultima cifră (citirea scurtă, des întâlnită în aplicații).
 * - Scorul homofon chinezesc — altă scară, arătat alături, fără distanță.
 *
 * Cu data nașterii, fiecare citire se pune lângă proprietar pe două căi care
 * nu se suprapun: distanța pitagoreică față de Drumul Vieții și relația vedică
 * prieten / neutru / dușman față de Mulank și Bhagyank (VEDIC_RELATIONS).
 */

import { type BirthDate } from "@/lib/numerology-plus/core";
import { homophoneScore } from "@/lib/numerology-plus/applied";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { bhagyank, mulank, VEDIC_RELATIONS } from "@/lib/numerology-plus/systems";
import { digitalRoot } from "@/lib/models/compare";
import { chain, compareSchools, digitsIn, plus, root, type Compared, type SchoolResult } from "./shared";

export type PhoneSchoolId = "full" | "last4" | "last1";
export type Relation = "friend" | "neutral" | "enemy";
/** good: prieten cu amândouă · mixed: cu una · avoid: dușman cel puțin uneia. */
export type VedicFit = "good" | "mixed" | "neutral" | "avoid";

export interface OwnerRow {
  id: PhoneSchoolId;
  value: number;
  lifePathDistance: number;
  withMulank: Relation;
  withBhagyank: Relation;
  vedic: VedicFit;
}

export interface PhoneResult extends Compared<SchoolResult & { id: PhoneSchoolId }> {
  homophone: ReturnType<typeof homophoneScore>;
  owner: { lifePath: number; mulank: number; bhagyank: number; rows: OwnerRow[] } | null;
}

export function relation(owner: number, n: number): Relation {
  const r = VEDIC_RELATIONS[owner];
  if (!r || n === 0) return "neutral";
  if (r.friends.includes(n)) return "friend";
  if (r.enemies.includes(n)) return "enemy";
  return "neutral";
}

function fit(a: Relation, b: Relation): VedicFit {
  if (a === "enemy" || b === "enemy") return "avoid";
  if (a === "friend" && b === "friend") return "good";
  if (a === "friend" || b === "friend") return "mixed";
  return "neutral";
}

function sumOf(ds: number[]): { value: number; steps: string[] } {
  const raw = ds.reduce((a, d) => a + d, 0);
  return { value: root(raw), steps: [`${plus(ds.length ? ds : [0])} = ${raw}`, chain(raw, false)] };
}

export function phoneSchools(phone: string, birth?: BirthDate): PhoneResult {
  const ds = digitsIn(phone);
  const models: Array<SchoolResult & { id: PhoneSchoolId }> = [
    { id: "full", ...sumOf(ds) },
    { id: "last4", ...sumOf(ds.slice(-4)) },
    { id: "last1", value: ds.length ? ds[ds.length - 1] : 0, steps: [String(ds.length ? ds[ds.length - 1] : 0)] },
  ];

  let owner: PhoneResult["owner"] = null;
  if (birth) {
    const lp = lifePath(birth).value;
    const mk = mulank(birth), bk = bhagyank(birth);
    owner = {
      lifePath: lp,
      mulank: mk,
      bhagyank: bk,
      rows: models.map((m) => {
        const withMulank = relation(mk, m.value), withBhagyank = relation(bk, m.value);
        return {
          id: m.id,
          value: m.value,
          lifePathDistance: Math.abs(digitalRoot(lp) - m.value),
          withMulank,
          withBhagyank,
          vedic: fit(withMulank, withBhagyank),
        };
      }),
    };
  }

  return { ...compareSchools(models), homophone: homophoneScore(phone), owner };
}
