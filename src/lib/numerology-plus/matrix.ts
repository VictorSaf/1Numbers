/**
 * numerology-plus / matrix — Matrița Destinului (Матрица Судьбы)
 *
 * Sistem pe 22 de arcane, NU pe 1–9. Nu refolosește motorul pitagoreic.
 *
 * ONESTITATE ASUPRA SURSELOR:
 * Punctele A–I (octagrama de bază) sunt consens ferm, verificate pe patru surse
 * independente cu exemplu numeric identic. Le poți livra cu încredere.
 *
 * Liniile pe axe, punctul de predestinare, canalul de bani, harta chakrelor,
 * graficul pe 40 de ani și formula de compatibilitate NU sunt publicate de
 * niciun operator comercial — sunt produsul plătit al ecosistemului.
 * Ce e mai jos în secțiunea EXPERIMENTAL e o reconstrucție parțială dintr-o
 * singură sursă. NU o prezenta ca fiind canonică în UI.
 */

import type { BirthDate } from './core.js';

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
 * EXPERIMENTAL — reconstrucție parțială dintr-o singură sursă (matrixdestiny.io).
 * Nu e verificabilă încrucișat. Marchează-o vizibil în UI sau ține-o în spatele
 * unui flag de dezvoltare până o validezi contra unui raport plătit.
 */
export function destinyMatrixExperimental(b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION) {
  const r = (n: number) => reduce22(n, mode);
  const base = destinyMatrix(b, mode).byKey;
  const { A, C, E } = base;

  const J = r(A + E);
  const L = r(C + E);
  const Jfar = r(A + J);
  const Lfar = r(C + L);
  const heart = r(J + L);

  return {
    axisPoints: [
      { key: 'J',     arcana: J,    label: 'Axă stânga (linie masculină)' },
      { key: 'L',     arcana: L,    label: 'Axă dreapta (linie feminină)' },
      { key: 'J_far', arcana: Jfar, label: 'Axă stânga extern' },
      { key: 'L_far', arcana: Lfar, label: 'Axă dreapta extern' },
      { key: 'HEART', arcana: heart, label: 'Punct al inimii' },
    ],
    confidence: 'low' as const,
    warning: 'Reconstrucție dintr-o singură sursă. Nu prezenta ca metodologie canonică.',
  };
}

/**
 * Graficul pe decade — modelul arcurilor. Fiecare decadă se citește pe arcul
 * dintre două puncte adiacente ale octagramei. Sub-punctele din interiorul
 * fiecărei decade NU sunt publicate nicăieri; aici livrăm doar arcurile.
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

/**
 * Compatibilitate — suprapunerea a două matrițe.
 * Metoda e consens (se suprapun diagramele și se citesc coincidențele);
 * formula punctului „numărul relației" NU e publicată. Aici folosim
 * reduce22(E₁ + E₂) ca aproximare declarată, nu ca adevăr.
 */
export function matrixCompatibility(a: BirthDate, b: BirthDate, mode: MatrixReduction = MATRIX_REDUCTION) {
  const ma = destinyMatrix(a, mode).byKey;
  const mb = destinyMatrix(b, mode).byKey;
  const shared = Object.keys(ma).filter((k) => ma[k] === mb[k]);
  return {
    a: ma, b: mb,
    sharedPositions: shared,
    affinityScore: Math.round((shared.length / Object.keys(ma).length) * 100),
    relationshipArcana: reduce22(ma.E + mb.E, mode),
    confidence: 'medium' as const,
    warning: 'Punctul relației e o aproximare declarată — formula oficială nu e publicată public.',
  };
}
