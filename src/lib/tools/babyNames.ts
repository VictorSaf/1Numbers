/**
 * tools / babyNames — o listă de nume, clasată de trei școli, separat.
 *
 * - Pitagoreic: Expresia numelui (toate literele, tabelul pitagoreic) față de
 *   Drumul Vieții al datei așteptate. Potrivirea = distanța dintre ele
 *   (0 = același număr). Nu folosim HARMONY_MATRIX din `applied`: e o matrice
 *   a noastră, nepublicată de nicio sursă, iar aici fiecare scor trebuie să se
 *   poată urmări.
 * - Caldeean (Cheiro): numărul numelui pe tabelul caldeean, față de numărul
 *   zilei de naștere („own number" la Cheiro). Potrivirea = distanța.
 * - Vedic: același număr caldeean al numelui (Naamank), dar judecat altfel —
 *   prieten / neutru / dușman față de Mulank și Bhagyank (VEDIC_RELATIONS).
 *   Prieten 2, neutru 1, dușman 0, adunat pe amândouă: 0–4.
 *
 * Caldeeanul și vedicul citesc ACELAȘI număr și pot da clasamente diferite:
 * acolo dezacordul e în criteriu, nu în aritmetică.
 */

import { type BirthDate } from "@/lib/numerology-plus/core";
import { expression, lifePath } from "@/lib/numerology-plus/pythagorean";
import { bhagyank, chaldeanName, mulank } from "@/lib/numerology-plus/systems";
import { distance } from "@/lib/models/compare";
import { relation, type Relation } from "./phone";

export interface NameReading {
  name: string;
  pyth: { number: number; raw: number; fit: number };
  chaldean: { number: number; compound: number; fit: number };
  vedic: { number: number; withMulank: Relation; withBhagyank: Relation; fit: number };
  ranks: { pyth: number; chaldean: number; vedic: number };
  /** Cel mai mare salt de loc între școli. 0 = toate trei îl pun pe același loc. */
  rankSpread: number;
}

export interface BabyNamesResult {
  lifePath: number;
  mulank: number;
  bhagyank: number;
  names: NameReading[];
}

const REL_SCORE: Record<Relation, number> = { friend: 2, neutral: 1, enemy: 0 };

/** Clasament „de competiție": egalii împart locul (1, 1, 3). */
function ranks<T>(xs: T[], key: (x: T) => number, better: "low" | "high"): number[] {
  const v = xs.map(key);
  return v.map((a) => 1 + v.filter((b) => (better === "low" ? b < a : b > a)).length);
}

export function babyNameSchools(candidates: string[], birth: BirthDate): BabyNamesResult {
  const lp = lifePath(birth).value;
  const mk = mulank(birth), bk = bhagyank(birth);
  const names = candidates.map((n) => n.trim()).filter((n) => /\p{L}/u.test(n));

  const base = names.map((name) => {
    const ex = expression(name);
    const ch = chaldeanName(name);
    const withMulank = relation(mk, ch.root), withBhagyank = relation(bk, ch.root);
    return {
      name,
      pyth: { number: ex.value, raw: ex.raw, fit: distance("digit", ex.value, lp) },
      chaldean: { number: ch.root, compound: ch.compound, fit: distance("digit", ch.root, mk) },
      vedic: {
        number: ch.root, withMulank, withBhagyank,
        fit: REL_SCORE[withMulank] + REL_SCORE[withBhagyank],
      },
    };
  });

  const rp = ranks(base, (x) => x.pyth.fit, "low");
  const rc = ranks(base, (x) => x.chaldean.fit, "low");
  const rv = ranks(base, (x) => x.vedic.fit, "high");

  return {
    lifePath: lp,
    mulank: mk,
    bhagyank: bk,
    names: base.map((b, i) => {
      const r = { pyth: rp[i], chaldean: rc[i], vedic: rv[i] };
      return { ...b, ranks: r, rankSpread: Math.max(r.pyth, r.chaldean, r.vedic) - Math.min(r.pyth, r.chaldean, r.vedic) };
    }),
  };
}
