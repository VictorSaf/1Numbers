/**
 * models / compare — cât de departe sunt răspunsurile mai multor școli.
 *
 * O școală nu greșește când dă alt număr decât alta: citește din alt loc, prin
 * alt alfabet, cu altă regulă de reducere. Aici nu se alege un câștigător și
 * nu se face o medie. Se măsoară doar distanța, pe scara elementului.
 *
 * O capcană de aritmetică stă la baza scării `digit`: rădăcina digitală nu
 * depinde de ordinea reducerii. „Părți reduse separat" și „toate cifrele
 * deodată" dau MEREU aceeași rădăcină; diferă doar când un drum se oprește pe
 * un număr master. 11 față de 2 nu e o distanță de 9 — e aceeași rădăcină,
 * citită în alt registru. De aceea relația „octave" există separat.
 */

export type Scale = "digit" | "arcana" | "age" | "set" | "category";

/** agree: toate la fel · octave: aceeași rădăcină, unele în registru master ·
 *  near: aproape · apart: departe. */
export type Verdict = "agree" | "octave" | "near" | "apart";

export type ModelValue = number | number[] | string;

const root = (n: number): number => {
  let x = Math.abs(n);
  while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
  return x;
};

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/** Distanța dintre două valori pe o scală. Pentru `set` e mărimea diferenței
 *  simetrice; pentru `category`, 0 sau 1. */
export function distance(scale: Scale, a: ModelValue, b: ModelValue): number {
  switch (scale) {
    case "digit":
      return Math.abs(root(a as number) - root(b as number));
    case "arcana":
    case "age":
      return Math.abs((a as number) - (b as number));
    case "set": {
      const x = a as number[], y = b as number[];
      return x.filter((v) => !y.includes(v)).length + y.filter((v) => !x.includes(v)).length;
    }
    case "category":
      return a === b ? 0 : 1;
  }
}

export const equal = (a: ModelValue, b: ModelValue): boolean =>
  Array.isArray(a) && Array.isArray(b) ? sameSet(a, b) : a === b;

/** Pragul de sub care două răspunsuri diferite sunt încă „aproape". */
const NEAR: Record<Scale, number> = { digit: 2, arcana: 3, age: 2, set: 2, category: 0 };

export function pairVerdict(scale: Scale, a: ModelValue, b: ModelValue): Verdict {
  if (equal(a, b)) return "agree";
  const d = distance(scale, a, b);
  if (scale === "digit" && d === 0) return "octave";
  return d <= NEAR[scale] ? "near" : "apart";
}

export interface Group<V extends ModelValue = ModelValue> {
  value: V;
  ids: string[];
}

/** Modelele care dau același răspuns, cel mai numeros grup primul. */
export function groupsOf<V extends ModelValue>(values: Array<{ id: string; value: V }>): Group<V>[] {
  const out: Group<V>[] = [];
  for (const v of values) {
    const g = out.find((x) => equal(x.value, v.value));
    if (g) g.ids.push(v.id);
    else out.push({ value: v.value, ids: [v.id] });
  }
  return out.sort((a, b) => b.ids.length - a.ids.length);
}

export interface PairDistance {
  a: string;
  b: string;
  distance: number;
  verdict: Verdict;
}

/** Fiecare pereche de modele, o singură dată. */
export function pairwise(scale: Scale, values: Array<{ id: string; value: ModelValue }>): PairDistance[] {
  const out: PairDistance[] = [];
  for (let i = 0; i < values.length; i++)
    for (let j = i + 1; j < values.length; j++)
      out.push({
        a: values[i].id,
        b: values[j].id,
        distance: distance(scale, values[i].value, values[j].value),
        verdict: pairVerdict(scale, values[i].value, values[j].value),
      });
  return out;
}

const RANK: Record<Verdict, number> = { agree: 0, octave: 1, near: 2, apart: 3 };

/** Verdictul întregului element = cea mai mare depărtare dintre două modele. */
export function overallVerdict(pairs: PairDistance[]): Verdict {
  return pairs.reduce<Verdict>((w, p) => (RANK[p.verdict] > RANK[w] ? p.verdict : w), "agree");
}

export const spread = (pairs: PairDistance[]): number =>
  pairs.reduce((m, p) => Math.max(m, p.distance), 0);

export { root as digitalRoot };
