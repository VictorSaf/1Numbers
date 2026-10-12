/**
 * numerology-plus / matrix — Matrița Destinului (Матрица Судьбы, metoda Ladini)
 *
 * Sistem pe 22 de arcane, NU pe 1–9. Nu refolosește motorul pitagoreic.
 *
 * SURSE (verificate 2026-10-12):
 *  - Punctele A–I: consens, exemplu numeric identic pe numefy.me,
 *    synastrychart.org/destiny-matrix-chart, matrixdestiny.io.
 *  - Canalul iubirii și al banilor: matrixdestiny.io/en/love-line (exemplu
 *    25.11.2002 → 3-18-15), tvoyamatritsa.ru/dengi-v-matricze-sudby,
 *    5prism.ru (punctele „sub dolar" / „sub inimă"). Variantă pe axe:
 *    destinymatrixfree.com.
 *  - Coada karmică: numefy.ru/matrica-sudby/karmichesky-hvost și
 *    synastrychart.org (15.06.1990 → 12,16,4); varianta cu sumă nereduse:
 *    vratamir.com/blog/karmicheskiy-khvost-pary (03.10.1974 → 12-19-7; cuplu 3-10-16).
 *  - Liniile de neam, cerul/pământul, destinațiile: E. Pribylova, „Матрица
 *    Судьбы. Карма и предназначение" (fragment pe livelib.ru); destinațiile
 *    spirituală și planetară: 22-arkana.ru/blog/prednaznacheniya-matrica-sudby.
 *  - Harta chakrelor: numefy.ru/blog/karta-zdorovya (tabel complet + total);
 *    etichetarea coloanelor diferă la gadalkindom.ru/matritsa-sudby/karta-zdorovya.html.
 *  - Linia vârstei (bisecție pe fiecare decadă): Pribylova (livelib.ru);
 *    etichetele 1–2, 2–3, 3–4, 5, 6–7… după calculatorul lidrekon.ru/articles/13.
 *  - Cuplul (sumă punct cu punct): human-design.space/matrix-compatibility,
 *    vratamir.com (centrul și coada cuplului).
 *
 * Unde sursele nu se potrivesc, fiecare variantă e un model separat cu id
 * propriu; nu se alege câștigător, se măsoară distanța (vezi compareModels).
 */

import type { BirthDate } from './core.js';
import { distance, pairVerdict, pairwise, type PairDistance, type Verdict } from '../models/compare.js';

/** Regula de reducere — DEZACORD REAL ÎNTRE SURSE.
 *  'digitsum' = 25 → 7  (ce fac calculatoarele populare, deci ce recunosc utilizatorii)
 *  'mod22'    = 25 → 3  (coerent cu teoria celor 22 de arcane majore)
 *  Nici școlile rusești originale nu sunt consecvente între ele. */
export type MatrixReduction = 'digitsum' | 'mod22';
export const MATRIX_REDUCTION: MatrixReduction = 'digitsum';

export function reduce22(n: number, mode: MatrixReduction = MATRIX_REDUCTION): number {
  let x = Math.abs(n);
  if (x === 0) return 22;
  if (mode === 'mod22') {
    while (x > 22) x -= 22;
    return x === 0 ? 22 : x;
  }
  while (x > 22) x = x.toString().split('').reduce((a, d) => a + Number(d), 0);
  return x;
}

export interface MatrixPoint { key: string; arcana: number; label: string }

/** Octagrama de bază — 9 puncte. Consens ferm. */
export function destinyMatrix(b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION) {
  const r = (n: number) => reduce22(n, mode);

  const A = r(b.day);                                                    // stânga
  const B = b.month;                                                     // sus (1–12, fără reducere)
  const C = r(b.year.toString().split('').reduce((a, d) => a + Number(d), 0)); // dreapta
  const D = r(A + B + C);                                                // jos
  const E = r(A + B + C + D);                                            // centru

  const F = r(A + B); // stânga-sus
  const G = r(B + C); // dreapta-sus
  const H = r(A + D); // stânga-jos
  const I = r(C + D); // dreapta-jos

  const points: MatrixPoint[] = [
    { key: 'A', arcana: A, label: 'Personalitate (zi)' },
    { key: 'B', arcana: B, label: 'Talent (lună)' },
    { key: 'C', arcana: C, label: 'Karmă (an)' },
    { key: 'D', arcana: D, label: 'Sarcină karmică' },
    { key: 'E', arcana: E, label: 'Zonă de confort / suflet' },
    { key: 'F', arcana: F, label: 'Diagonală stânga-sus' },
    { key: 'G', arcana: G, label: 'Diagonală dreapta-sus' },
    { key: 'H', arcana: H, label: 'Diagonală stânga-jos' },
    { key: 'I', arcana: I, label: 'Diagonală dreapta-jos' },
  ];

  return {
    points,
    byKey: Object.fromEntries(points.map((p) => [p.key, p.arcana])) as Record<string, number>,
    reduction: mode,
    confidence: 'high' as const,
  };
}

/**
 * Graficul pe decade — modelul arcurilor. Fiecare decadă se citește pe arcul
 * dintre două puncte adiacente ale octagramei; valoarea arcului e punctul de
 * 5 ani al decadei. Sub-punctele (bisecția) sunt în `ageLine`.
 */
export function lifePeriods(b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION) {
  const m = destinyMatrix(b, mode).byKey;
  const arcs: Array<[string, string]> = [
    ['A','F'], ['F','B'], ['B','G'], ['G','C'],
    ['C','I'], ['I','D'], ['D','H'], ['H','A'],
  ];
  return arcs.map(([from, to], i) => ({
    fromAge: i * 10,
    toAge: i * 10 + 10,
    from, to,
    arcana: reduce22(m[from] + m[to], mode),
  }));
}

// ─────────────────────────────────────────────────────────────
// Zonele derivate
// ─────────────────────────────────────────────────────────────

/** Un termen al unei sume. `unreduced` = valoarea intră înainte de reducere
 *  (doar modelul vratamir al cozii face asta). */
export interface StepTerm { code: string; value: number; unreduced?: boolean }

/** Cum s-a ajuns la o celulă: ce s-a adunat și cât a dat înainte de reducere. */
export interface CalcStep { terms: StepTerm[]; raw: number }

export interface ZoneCell { key: string; value: number; step: CalcStep }

/** Familiile de zone. O familie cu mai multe modele = un dezacord publicat. */
export type ZoneFamily =
  | 'gift' | 'money' | 'love' | 'karmicTail' | 'ancestry' | 'purposes' | 'chakras' | 'portrait';

export interface MatrixZone {
  /** `family.model`, sau doar `family` când există un singur model. */
  id: string;
  family: ZoneFamily;
  model: string;
  /** De unde vine formula. */
  source: string;
  /** Harta chakrelor e o hartă simbolică, nu un diagnostic medical. */
  symbolic?: boolean;
  cells: ZoneCell[];
}

type R = (n: number) => number;

const term = (code: string, value: number, unreduced?: boolean): StepTerm =>
  unreduced ? { code, value, unreduced } : { code, value };

/** Suma termenilor, redusă; păstrează pașii. */
const add = (r: R, key: string, ...terms: StepTerm[]): ZoneCell => {
  const raw = terms.reduce((a, x) => a + x.value, 0);
  return { key, value: r(raw), step: { terms, raw } };
};

const ref = (c: ZoneCell, code = c.key) => term(code, c.value);

const single = (key: string, code: string, v: number): ZoneCell =>
  ({ key, value: v, step: { terms: [term(code, v)], raw: v } });

export type TailModel = 'ladini' | 'vratamir';

/**
 * Coada karmică, citită dinăuntru în afară: D1, D2, D.
 *  ladini   — D1 = D+E, D2 = D+D1, fiecare redus (numefy.ru, synastrychart.org).
 *  vratamir — D1 = D+E redus, dar D2 = (D+E) NEREDUSĂ + D (vratamir.com:
 *             „к сумме из предыдущего шага до редукции еще раз плюсуется").
 * Diferă doar când D+E > 22.
 */
export function karmicTailCells(D: number, E: number, model: TailModel, mode: MatrixReduction = MATRIX_REDUCTION): ZoneCell[] {
  const r: R = (n) => reduce22(n, mode);
  const D1 = add(r, 'D1', term('D', D), term('E', E));
  const D2 = model === 'ladini'
    ? add(r, 'D2', term('D', D), ref(D1))
    : add(r, 'D2', term('D+E', D1.step.raw, true), term('D', D));
  return [D1, D2, single('D', 'D', D)];
}

export const CHAKRAS = ['sahasrara', 'ajna', 'vishuddha', 'anahata', 'manipura', 'svadhisthana', 'muladhara'] as const;
export type Chakra = (typeof CHAKRAS)[number];
export type ChakraModel = 'numefy' | 'gadalkindom';

/**
 * Harta chakrelor — SIMBOLICĂ, nu medicală. Tabelul numefy.ru (metoda Ladini),
 * calculat de sus în jos:
 *   Sahasrara  A        | B        | sumă
 *   Ajna       A1=A+A2  | B1=B+B2  | sumă      (A2 = A+E, B2 = B+E)
 *   Vishuddha  A2=A+E   | B2=B+E   | sumă
 *   Anahata    A3=A2+E  | B3=B2+E  | sumă
 *   Manipura   E        | E        | E+E
 *   Svadhisth. C1=C+E   | D1=D+E   | sumă
 *   Muladhara  C        | D        | C+D
 *   Total      Σ col.1  | Σ col.2  | total1 + total2
 * Modele:
 *   numefy      — coloanele sunt Fizic / Energie / Emoții (suma = emoții).
 *   gadalkindom — „первому числу — физическая, второму — эмоциональная, их
 *                 сумма — энергия": aceleași numere, dar energia și emoția schimbă locul.
 */
function chakraZone(p: Record<string, number>, r: R, model: ChakraModel): MatrixZone {
  const { A, B, C, D, E } = p;
  const [second, third] = model === 'numefy' ? ['energy', 'emotions'] : ['emotions', 'energy'];
  const cells: ZoneCell[] = [];
  const row = (name: string, x: ZoneCell, y: ZoneCell) => {
    cells.push({ ...x, key: `${name}.physics` }, { ...y, key: `${name}.${second}` }, add(r, `${name}.${third}`, ref(x), ref(y)));
  };
  const A2 = add(r, 'A2', term('A', A), term('E', E));
  const B2 = add(r, 'B2', term('B', B), term('E', E));
  row('sahasrara', single('A', 'A', A), single('B', 'B', B));
  row('ajna', add(r, 'A1', term('A', A), ref(A2)), add(r, 'B1', term('B', B), ref(B2)));
  row('vishuddha', A2, B2);
  row('anahata', add(r, 'A3', ref(A2), term('E', E)), add(r, 'B3', ref(B2), term('E', E)));
  row('manipura', single('E', 'E', E), single('E', 'E', E));
  row('svadhisthana', add(r, 'C1', term('C', C), term('E', E)), add(r, 'D1', term('D', D), term('E', E)));
  row('muladhara', single('C', 'C', C), single('D', 'D', D));

  const col = (suffix: string) => CHAKRAS.map((c) => cells.find((x) => x.key === `${c}.${suffix}`)!);
  const total1 = add(r, 'total.physics', ...col('physics').map((c) => ref(c)));
  const total2 = add(r, `total.${second}`, ...col(second).map((c) => ref(c)));
  cells.push(total1, total2, add(r, `total.${third}`, ref(total1), ref(total2)));

  return {
    id: `chakras.${model}`, family: 'chakras', model, symbolic: true, cells,
    source: model === 'numefy' ? 'numefy.ru/blog/karta-zdorovya' : 'gadalkindom.ru/matritsa-sudby/karta-zdorovya.html',
  };
}

/**
 * Toate zonele derivate ale unei matrici personale, într-o reducere.
 * Ordinea e fixă; `compareReductions` se bazează pe ea.
 */
export function matrixZones(b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION): MatrixZone[] {
  const p = destinyMatrix(b, mode).byKey;
  const r: R = (n) => reduce22(n, mode);
  const P = (k: string) => term(k, p[k]);

  // Diagonala bunăstării: C1 = C+E (intrarea banilor), D1 = D+E (intrarea
  // relațiilor), X = C1+D1 (centrul), X1 = X+D1 („sub inimă"), X2 = X+C1 („sub dolar").
  const C1 = add(r, 'entry', P('C'), P('E'));
  const D1 = add(r, 'entry', P('D'), P('E'));
  const X = add(r, 'center', ref(D1, 'D1'), ref(C1, 'C1'));
  const heart = add(r, 'heart', ref(D1, 'D1'), ref(X, 'X'));
  const dollar = add(r, 'dollar', ref(X, 'X'), ref(C1, 'C1'));

  const father = add(r, 'father', P('F'), P('I'));
  const mother = add(r, 'mother', P('G'), P('H'));
  const sky = add(r, 'sky', P('B'), P('D'));
  const earth = add(r, 'earth', P('A'), P('C'));
  const personal = add(r, 'personal', ref(sky), ref(earth));
  const social = add(r, 'social', ref(father), ref(mother));
  const spiritual = add(r, 'spiritual', ref(personal), ref(social));
  const planetary = add(r, 'planetary', ref(social), ref(spiritual));

  const tail = (model: TailModel): MatrixZone => ({
    id: `karmicTail.${model}`, family: 'karmicTail', model,
    source: model === 'ladini' ? 'numefy.ru; synastrychart.org' : 'vratamir.com/blog/karmicheskiy-khvost-pary',
    cells: karmicTailCells(p.D, p.E, model, mode),
  });

  return [
    { id: 'gift', family: 'gift', model: 'ladini', source: 'consens (centrul E)', cells: [single('E', 'E', p.E)] },
    { id: 'money.ladini', family: 'money', model: 'ladini',
      source: 'matrixdestiny.io/en/love-line; tvoyamatritsa.ru', cells: [X, dollar, C1] },
    { id: 'money.axes', family: 'money', model: 'axes', source: 'destinymatrixfree.com',
      cells: [add(r, 'dollar', P('B'), P('D'))] },
    { id: 'love.ladini', family: 'love', model: 'ladini',
      source: 'matrixdestiny.io/en/love-line', cells: [D1, heart, X] },
    { id: 'love.axes', family: 'love', model: 'axes', source: 'destinymatrixfree.com',
      cells: [add(r, 'heart', P('A'), P('C'))] },
    tail('ladini'),
    tail('vratamir'),
    { id: 'ancestry', family: 'ancestry', model: 'pribylova', source: 'Pribylova (livelib.ru)', cells: [father, mother] },
    { id: 'purposes', family: 'purposes', model: 'pribylova',
      source: 'Pribylova (livelib.ru); 22-arkana.ru',
      cells: [sky, earth, personal, social, spiritual, planetary] },
    chakraZone(p, r, 'numefy'),
    chakraZone(p, r, 'gadalkindom'),
  ];
}

// ─────────────────────────────────────────────────────────────
// Comparații
// ─────────────────────────────────────────────────────────────

export interface ReductionCell {
  key: string;
  digitsum: number;
  mod22: number;
  distance: number;
  verdict: Verdict;
  steps: { digitsum: CalcStep; mod22: CalcStep };
}

export interface ReductionRow {
  id: string; family: ZoneFamily; model: string; source: string; symbolic?: boolean;
  cells: ReductionCell[];
}

const reductionCell = (key: string, ds: number, m22: number, sd: CalcStep, sm: CalcStep): ReductionCell => ({
  key, digitsum: ds, mod22: m22,
  distance: distance('arcana', ds, m22),
  verdict: pairVerdict('arcana', ds, m22),
  steps: { digitsum: sd, mod22: sm },
});

/** Aceleași zone în ambele reduceri, celulă cu celulă, cu distanța pe scara arcanelor. */
function reductionRows(ds: MatrixZone[], m22: MatrixZone[]): ReductionRow[] {
  return ds.map((z, i) => ({
    id: z.id, family: z.family, model: z.model, source: z.source, symbolic: z.symbolic,
    cells: z.cells.map((c, j) => {
      const o = m22[i].cells[j];
      return reductionCell(c.key, c.value, o.value, c.step, o.step);
    }),
  }));
}

export function compareReductions(b: BirthDate): ReductionRow[] {
  return reductionRows(matrixZones(b, 'digitsum'), matrixZones(b, 'mod22'));
}

export interface ModelComparison {
  family: ZoneFamily;
  models: string[];
  /** Doar celulele pe care toate modelele le calculează. */
  cells: Array<{ key: string; values: Array<{ id: string; value: number }>; pairs: PairDistance[] }>;
}

/** Pentru fiecare familie cu mai multe modele: aceeași celulă, fiecare model, distanța. */
export function compareModels(zones: MatrixZone[]): ModelComparison[] {
  const out: ModelComparison[] = [];
  for (const family of [...new Set(zones.map((z) => z.family))]) {
    const group = zones.filter((z) => z.family === family);
    if (group.length < 2) continue;
    const keys = group[0].cells.map((c) => c.key)
      .filter((k) => group.every((z) => z.cells.some((c) => c.key === k)));
    out.push({
      family,
      models: group.map((z) => z.model),
      cells: keys.map((key) => {
        const values = group.map((z) => ({ id: z.model, value: z.cells.find((c) => c.key === key)!.value }));
        return { key, values, pairs: pairwise('arcana', values) };
      }),
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Linia vârstei
// ─────────────────────────────────────────────────────────────

export interface AgePoint { age: number; label: string; arcana: number; step: CalcStep }

/** Vârsta exactă, în ani, la o dată. */
export function exactAge(b: BirthDate, today: Date): number {
  const born = Date.UTC(b.year, b.month - 1, b.day);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return (now - born) / (365.2425 * 86_400_000);
}

const SUB_LABEL = ['0', '1–2', '2–3', '3–4', '5', '6–7', '7–8', '8–9'];

/**
 * Linia vârstei 0–80 pe perimetrul octagramei: A (0) → F (10) → B (20) →
 * G (30) → C (40) → I (50) → D (60) → H (70) → A (80).
 * În fiecare decadă, prin bisecție (Pribylova, „сложение в середину отрезка"):
 *   5 = 0+10 · 2,5 = 0+5 · 7,5 = 5+10 · 1–2 = 0+2,5 · 3–4 = 2,5+5 ·
 *   6–7 = 5+7,5 · 8–9 = 7,5+10.
 * Sub-punctele stau la 1,25 / 2,5 / 3,75 / 5 / 6,25 / 7,5 / 8,75 din decadă;
 * etichetele urmează calculatoarele publicate (lidrekon.ru).
 * `current` = indicele ultimului punct atins la `age`; null după 80 sau fără vârstă.
 */
export function ageLine(b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION, age?: number) {
  const m = destinyMatrix(b, mode).byKey;
  const r: R = (n) => reduce22(n, mode);
  const ORDER = ['A', 'F', 'B', 'G', 'C', 'I', 'D', 'H', 'A'];
  const points: AgePoint[] = [];
  for (let d = 0; d < 8; d++) {
    const s = d * 10;
    const at = (k: number) => String(s + k);
    const mk = (x: StepTerm, y: StepTerm) => {
      const raw = x.value + y.value;
      return { arcana: r(raw), step: { terms: [x, y], raw } };
    };
    const a = term(`${ORDER[d]} · ${at(0)}`, m[ORDER[d]]);
    const z = term(`${ORDER[d + 1]} · ${at(10)}`, m[ORDER[d + 1]]);
    const mid = mk(a, z);
    const M = term(at(5), mid.arcana);
    const q1 = mk(a, M);
    const q3 = mk(M, z);
    const Q1 = term(String(s + 2.5), q1.arcana);
    const Q3 = term(String(s + 7.5), q3.arcana);
    const sub = [
      { arcana: a.value, step: { terms: [a], raw: a.value } },
      mk(a, Q1), q1, mk(Q1, M), mid, mk(M, Q3), q3, mk(Q3, z),
    ];
    sub.forEach((p, i) => points.push({
      age: s + i * 1.25,
      label: SUB_LABEL[i].replace(/\d+/g, (n) => String(s + Number(n))),
      ...p,
    }));
  }
  points.push({ age: 80, label: '80', arcana: m.A, step: { terms: [term('A · 80', m.A)], raw: m.A } });
  let current: number | null = null;
  if (age !== undefined && age >= 0 && age < 80)
    for (let i = 0; i < points.length; i++) if (points[i].age <= age) current = i;
  return { points, current, reduction: mode };
}

// ─────────────────────────────────────────────────────────────
// Matricea cuplului
// ─────────────────────────────────────────────────────────────

/**
 * Matricea cuplului: cele două matrici „сложенные точка к точке"
 * (human-design.space/matrix-compatibility) — fiecare punct A–I = punctul
 * primului + punctul celui de-al doilea, redus. Centrul cuplului (portretul)
 * = Ea + Eb, baza cozii = Da + Db (vratamir.com dă același lucru).
 * Coada cuplului apare în ambele modele (ladini, vratamir).
 * O formulă separată pentru „destinația cuplului" sau „sarcina comună" NU am
 * găsit publicată; numefy.ru citește tripletul cozii cuplului ca sarcina comună.
 */
export function coupleMatrix(a: BirthDate, b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION) {
  const build = (md: MatrixReduction) => {
    const pa = destinyMatrix(a, md).byKey, pb = destinyMatrix(b, md).byKey;
    const byKey: Record<string, number> = {};
    const steps: Record<string, CalcStep> = {};
    for (const k of Object.keys(pa)) {
      const raw = pa[k] + pb[k];
      byKey[k] = reduce22(raw, md);
      steps[k] = { terms: [term(`${k}₁`, pa[k]), term(`${k}₂`, pb[k])], raw };
    }
    const zones: MatrixZone[] = [
      { id: 'portrait', family: 'portrait', model: 'pointwise', source: 'human-design.space; vratamir.com',
        cells: [{ key: 'E', value: byKey.E, step: steps.E }] },
      ...(['ladini', 'vratamir'] as const).map((model): MatrixZone => ({
        id: `karmicTail.${model}`, family: 'karmicTail', model,
        source: model === 'ladini' ? 'numefy.ru (tripletul aplicat matricei cuplului)' : 'vratamir.com',
        cells: karmicTailCells(byKey.D, byKey.E, model, md),
      })),
    ];
    return { byKey, steps, zones };
  };
  const main = build(mode);
  const ds = build('digitsum'), m22 = build('mod22');
  const keys = Object.keys(main.byKey);
  const pointsRow: ReductionRow = {
    id: 'points', family: 'portrait', model: 'pointwise', source: 'human-design.space',
    cells: keys.map((k) => reductionCell(k, ds.byKey[k], m22.byKey[k], ds.steps[k], m22.steps[k])),
  };
  return {
    points: keys.map((k) => ({ key: k, arcana: main.byKey[k] })),
    byKey: main.byKey,
    steps: main.steps,
    zones: main.zones,
    reductions: [pointsRow, ...reductionRows(ds.zones, m22.zones)],
    reduction: mode,
  };
}
