/**
 * numerology-plus / applied
 * Faza C: module aplicate. Fiecare e o pagină nouă și un cuvânt-cheie propriu.
 */

import {
  CHALDEAN, PYTHAGOREAN, type BirthDate, type NumResult,
  digitSum, letters, reduce, result, sumLetters,
} from './core.js';
import { expression, personality, soulUrge, lifePath } from './pythagorean.js';
import { chaldeanName } from './systems.js';

// ═══════════════════════════════════════════════════════════
// C1 — Numerologia adresei
// ═══════════════════════════════════════════════════════════

/** `includeStreetName` e site-dependent în piață. Expune-l ca opțiune. */
export function addressNumerology(houseNumber: string, streetName = '', includeStreetName = false) {
  const digits = houseNumber.replace(/\D/g, '');
  let raw = digits.split('').reduce((a, d) => a + Number(d), 0);
  if (includeStreetName && streetName) raw += sumLetters(streetName, PYTHAGOREAN);
  // Litera de apartament (12B) se adaugă ca valoare de literă
  const suffix = houseNumber.replace(/[^A-Za-z]/g, '').toUpperCase();
  for (const ch of suffix) raw += PYTHAGOREAN[ch] ?? 0;
  return { ...result(raw, false), digits, suffix: suffix || null, includeStreetName };
}

// ═══════════════════════════════════════════════════════════
// C5 — Motor de scor homofonic (piețe asiatice)
//      Motor SEPARAT de cel de reducere. Nu sunt interschimbabile.
// ═══════════════════════════════════════════════════════════

export const DIGIT_HOMOPHONE: Record<string, { weight: number; meaning: string }> = {
  '0': { weight:  0, meaning: 'gol / infinit — neutru' },
  '1': { weight:  1, meaning: 'sigur, garantat' },
  '2': { weight:  2, meaning: 'ușor, perechi — favorabil' },
  '3': { weight:  2, meaning: 'creștere, viață' },
  '4': { weight: -5, meaning: 'omofon cu „moarte" — puternic nefavorabil' },
  '5': { weight: -1, meaning: '„nu / fără" — slăbește cifra următoare' },
  '6': { weight:  3, meaning: 'fluiditate, mers lin' },
  '7': { weight:  0, meaning: 'ambiguu — „sigur" sau „mânie", după dialect' },
  '8': { weight:  5, meaning: 'omofon cu „prosperitate" — cel mai favorabil' },
  '9': { weight:  3, meaning: 'longevitate, durabilitate' },
};

export const LUCKY_SEQUENCES: Record<string, { bonus: number; meaning: string }> = {
  '168':  { bonus: 8,  meaning: '„prosperitate tot drumul"' },
  '518':  { bonus: 6,  meaning: '„vreau să prosper"' },
  '888':  { bonus: 10, meaning: 'triplă prosperitate' },
  '666':  { bonus: 6,  meaning: 'totul merge lin' },
  '999':  { bonus: 6,  meaning: 'longevitate maximă' },
  '1314': { bonus: 5,  meaning: '„o viață întreagă"' },
  '520':  { bonus: 5,  meaning: '„te iubesc"' },
  '4':    { bonus: 0,  meaning: '' },
};

export function homophoneScore(numberString: string) {
  const digits = numberString.replace(/\D/g, '');
  if (!digits) return { score: 0, normalized: 0, digits: '', breakdown: [], sequences: [] };

  const breakdown = digits.split('').map((d) => ({ digit: d, ...DIGIT_HOMOPHONE[d] }));
  let score = breakdown.reduce((a, b) => a + b.weight, 0);

  const sequences: Array<{ seq: string; bonus: number; meaning: string }> = [];
  for (const [seq, info] of Object.entries(LUCKY_SEQUENCES)) {
    if (info.bonus > 0 && digits.includes(seq)) {
      score += info.bonus;
      sequences.push({ seq, ...info });
    }
  }
  // „5" înaintea unei cifre favorabile o neagă („nu prosperi")
  for (let i = 0; i < digits.length - 1; i++) {
    if (digits[i] === '5' && ['8', '6', '9'].includes(digits[i + 1])) score -= 3;
  }

  const max = digits.length * 5 + 10;
  const normalized = Math.max(0, Math.min(100, Math.round(((score + digits.length * 5) / (max + digits.length * 5)) * 100)));
  return { score, normalized, digits, breakdown, sequences };
}

// ═══════════════════════════════════════════════════════════
// C4 — Numerologia numelui de bebeluș
// ═══════════════════════════════════════════════════════════

/** Matrice de armonie 1–9 + master. Nicio sursă din piață nu publică valorile —
 *  aceasta e a noastră, documentată și consecventă. Ajusteaz-o dacă vrei. */
export const HARMONY_MATRIX: Record<number, Record<number, number>> = (() => {
  const groups: Record<number, string> = {
    1:'fire',2:'water',3:'fire',4:'earth',5:'air',6:'water',7:'air',8:'earth',9:'fire',
    11:'water',22:'earth',33:'water',
  };
  const affinity: Record<string, Record<string, number>> = {
    fire:  { fire: 85, air: 90, earth: 60, water: 55 },
    air:   { air: 85, fire: 90, water: 65, earth: 55 },
    earth: { earth: 88, water: 90, fire: 60, air: 55 },
    water: { water: 85, earth: 90, air: 65, fire: 55 },
  };
  const keys = [1,2,3,4,5,6,7,8,9,11,22,33];
  const m: Record<number, Record<number, number>> = {};
  for (const a of keys) {
    m[a] = {};
    for (const b of keys) {
      let score = affinity[groups[a]][groups[b]];
      if (a === b) score += 5;
      if ([11,22,33].includes(a) && [11,22,33].includes(b)) score += 4;
      m[a][b] = Math.min(99, score);
    }
  }
  return m;
})();

export function babyNameNumerology(candidateName: string, expectedBirth: BirthDate) {
  const lp = lifePath(expectedBirth);
  const exp = expression(candidateName);
  const su = soulUrge(candidateName);
  const pers = personality(candidateName);
  const chaldean = chaldeanName(candidateName);
  const harmony = HARMONY_MATRIX[exp.value]?.[lp.value] ?? 50;
  return {
    name: candidateName,
    lifePath: lp, expression: exp, soulUrge: su, personality: pers, chaldean,
    harmonyWithLifePath: harmony,
    verdict: harmony >= 85 ? 'excelent' : harmony >= 70 ? 'bun' : harmony >= 60 ? 'acceptabil' : 'tensionat',
  };
}

export function rankBabyNames(names: string[], expectedBirth: BirthDate) {
  return names
    .map((n) => babyNameNumerology(n, expectedBirth))
    .sort((a, b) => b.harmonyWithLifePath - a.harmonyWithLifePath);
}

// ═══════════════════════════════════════════════════════════
// C7 — Analiză schimbare de nume (setul complet, nu doar Expression)
// ═══════════════════════════════════════════════════════════

export function nameChangeAnalysis(oldName: string, newName: string) {
  const build = (n: string) => ({
    expression: expression(n), soulUrge: soulUrge(n), personality: personality(n),
    chaldean: chaldeanName(n),
  });
  const a = build(oldName), b = build(newName);
  const diff = (x: NumResult, y: NumResult) => ({ from: x.value, to: y.value, changed: x.value !== y.value });
  return {
    old: a, new: b,
    changes: {
      expression: diff(a.expression, b.expression),
      soulUrge: diff(a.soulUrge, b.soulUrge),
      personality: diff(a.personality, b.personality),
      chaldeanCompound: { from: a.chaldean.compound, to: b.chaldean.compound, changed: a.chaldean.compound !== b.chaldean.compound },
    },
    changedCount: [
      a.expression.value !== b.expression.value,
      a.soulUrge.value !== b.soulUrge.value,
      a.personality.value !== b.personality.value,
    ].filter(Boolean).length,
  };
}

// ═══════════════════════════════════════════════════════════
// Compatibilitate ponderată (înlocuiește scorul simplu)
// ═══════════════════════════════════════════════════════════

export type RelationshipType = 'romantic' | 'friendship' | 'professional' | 'family';

const WEIGHTS: Record<RelationshipType, { lifePath: number; expression: number; soulUrge: number; personality: number }> = {
  romantic:     { lifePath: 0.35, expression: 0.20, soulUrge: 0.30, personality: 0.15 },
  friendship:   { lifePath: 0.30, expression: 0.20, soulUrge: 0.25, personality: 0.25 },
  professional: { lifePath: 0.25, expression: 0.40, soulUrge: 0.10, personality: 0.25 },
  family:       { lifePath: 0.40, expression: 0.15, soulUrge: 0.30, personality: 0.15 },
};

export function compatibility(
  a: { name: string; birth: BirthDate },
  b: { name: string; birth: BirthDate },
  type: RelationshipType = 'romantic',
) {
  const pa = { lp: lifePath(a.birth), ex: expression(a.name), su: soulUrge(a.name), pe: personality(a.name) };
  const pb = { lp: lifePath(b.birth), ex: expression(b.name), su: soulUrge(b.name), pe: personality(b.name) };
  const h = (x: NumResult, y: NumResult) => HARMONY_MATRIX[x.value]?.[y.value] ?? 50;

  const parts = {
    lifePath: h(pa.lp, pb.lp),
    expression: h(pa.ex, pb.ex),
    soulUrge: h(pa.su, pb.su),
    personality: h(pa.pe, pb.pe),
  };
  const w = WEIGHTS[type];
  const score = Math.round(
    parts.lifePath * w.lifePath + parts.expression * w.expression +
    parts.soulUrge * w.soulUrge + parts.personality * w.personality,
  );

  const frictions: string[] = [];
  if (pa.lp.karmicDebt && pb.lp.karmicDebt) frictions.push('Ambii poartă datorie karmică pe Drumul Vieții');
  if (Math.abs(pa.su.value - pb.su.value) >= 5) frictions.push('Distanță mare între dorințele interioare');

  return {
    score,
    band: score >= 85 ? 'excelent' : score >= 70 ? 'bun' : score >= 60 ? 'echilibrat' : 'provocator',
    parts, weights: w, type, frictions,
    a: pa, b: pb,
  };
}
