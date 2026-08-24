/**
 * numerology-plus / core
 *
 * Fundația refactorizată: fiecare calcul întoarce ȘI totalul dinaintea reducerii.
 * Fără `raw`, datoriile karmice nu pot fi detectate corect.
 *
 * CONVENȚII CONTESTATE — sursele din piață se contrazic. Fiecare e o constantă
 * cu nume explicit, ca să fie o decizie conștientă și nu un accident.
 */

// ─────────────────────────────────────────────────────────────
// Convenții configurabile
// ─────────────────────────────────────────────────────────────

/** Y ca vocală. Decoz și Numerologist.com diferă. 'heuristic' = Y e vocală doar
 *  când e singura vocală din silabă (Bryn, Kylie) sau finală după consoană (Mary). */
export type YMode = 'never' | 'always' | 'heuristic';
export const Y_VOWEL_MODE: YMode = 'heuristic';

/** Master 33: Decoz îl reduce la 6 „în sistemul clasic"; alte motoare îl păstrează. */
export const KEEP_MASTER_33 = true;

export const MASTERS = [11, 22, 33] as const;
export const KARMIC_DEBTS = [13, 14, 16, 19] as const;

// ─────────────────────────────────────────────────────────────
// Tabele de litere
// ─────────────────────────────────────────────────────────────

export const PYTHAGOREAN: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};

/** Chaldean: 9 nu se atribuie niciunei litere (număr sacru). */
export const CHALDEAN: Record<string, number> = {
  A:1,I:1,J:1,Q:1,Y:1,
  B:2,K:2,R:2,
  C:3,G:3,L:3,S:3,
  D:4,M:4,T:4,
  E:5,H:5,N:5,X:5,
  U:6,V:6,W:6,
  O:7,Z:7,
  F:8,P:8,
};

/** „Kabbalah" populară (mod-9 ciclic). NU e gematria ebraică — vezi kabbalah.ts. */
export const KABBALAH_SIMPLE: Record<string, number> = (() => {
  const t: Record<string, number> = {};
  'ABCDEFGHI'.split('').forEach((c, i) => (t[c] = i + 1));
  'JKLMNOPQR'.split('').forEach((c, i) => (t[c] = i + 1));
  'STUVWXYZ'.split('').forEach((c, i) => (t[c] = i + 1));
  return t;
})();

const HARD_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// ─────────────────────────────────────────────────────────────
// Normalizare
// ─────────────────────────────────────────────────────────────

/** Elimină diacriticele (ă→a, ș→s, й→и nu se atinge) și păstrează doar A–Z. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ș|ş/gi, 's')
    .replace(/ț|ţ/gi, 't')
    .toUpperCase()
    .replace(/[^A-Z\s'-]/g, '');
}

export function letters(name: string): string[] {
  return normalizeName(name).replace(/[^A-Z]/g, '').split('');
}

export function nameParts(name: string): string[] {
  return normalizeName(name).split(/[\s'-]+/).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// Vocale / consoane (cu tratarea lui Y)
// ─────────────────────────────────────────────────────────────

/**
 * Marchează fiecare literă a unui cuvânt ca vocală sau consoană.
 * Euristica pentru Y: e vocală dacă în cuvânt nu există altă vocală tare,
 * SAU dacă e precedată de consoană și nu urmată de vocală (Mary, Lynn, Bryn).
 */
export function classifyLetters(word: string): Array<{ ch: string; vowel: boolean }> {
  const w = word.toUpperCase().replace(/[^A-Z]/g, '');
  const hasHardVowel = w.split('').some((c) => HARD_VOWELS.has(c));
  return w.split('').map((ch, i) => {
    if (HARD_VOWELS.has(ch)) return { ch, vowel: true };
    if (ch !== 'Y') return { ch, vowel: false };
    if (Y_VOWEL_MODE === 'always') return { ch, vowel: true };
    if (Y_VOWEL_MODE === 'never') return { ch, vowel: false };
    if (!hasHardVowel) return { ch, vowel: true };
    const prev = w[i - 1];
    const next = w[i + 1];
    const prevIsConsonant = prev !== undefined && !HARD_VOWELS.has(prev);
    const nextIsVowel = next !== undefined && HARD_VOWELS.has(next);
    return { ch, vowel: prevIsConsonant && !nextIsVowel };
  });
}

export function classifyFullName(name: string): Array<{ ch: string; vowel: boolean }> {
  return nameParts(name).flatMap(classifyLetters);
}

// ─────────────────────────────────────────────────────────────
// Reducere
// ─────────────────────────────────────────────────────────────

export function digitSum(n: number): number {
  return Math.abs(n).toString().split('').reduce((a, d) => a + Number(d), 0);
}

export function isMaster(n: number): boolean {
  if (n === 33) return KEEP_MASTER_33;
  return n === 11 || n === 22;
}

/** Reducere cu păstrarea opțională a numerelor master. */
export function reduce(n: number, keepMasters = true): number {
  let x = Math.abs(n);
  while (x > 9) {
    if (keepMasters && isMaster(x)) return x;
    x = digitSum(x);
  }
  return x;
}

export interface NumResult {
  /** Totalul înainte de reducerea finală — necesar pentru datoriile karmice. */
  raw: number;
  value: number;
  isMaster: boolean;
  karmicDebt: number | null;
}

export function result(raw: number, keepMasters = true): NumResult {
  const value = reduce(raw, keepMasters);
  return {
    raw,
    value,
    isMaster: isMaster(value),
    karmicDebt: (KARMIC_DEBTS as readonly number[]).includes(raw) ? raw : null,
  };
}

// ─────────────────────────────────────────────────────────────
// Sume de litere
// ─────────────────────────────────────────────────────────────

export type LetterTable = Record<string, number>;

export function sumLetters(
  name: string,
  table: LetterTable = PYTHAGOREAN,
  filter?: (l: { ch: string; vowel: boolean }) => boolean,
): number {
  return classifyFullName(name)
    .filter((l) => (filter ? filter(l) : true))
    .reduce((a, l) => a + (table[l.ch] ?? 0), 0);
}

/** Frecvența cifrelor 1–9 în tot numele. Baza pentru Pasiune Ascunsă,
 *  Lecții Karmice, Tabel de Incluziune și Subconștient. */
export function letterFrequency(name: string, table: LetterTable = PYTHAGOREAN): Record<number, number> {
  const freq: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  for (const ch of letters(name)) {
    const v = table[ch];
    if (v && v >= 1 && v <= 9) freq[v]++;
  }
  return freq;
}

// ─────────────────────────────────────────────────────────────
// Date
// ─────────────────────────────────────────────────────────────

export interface BirthDate { day: number; month: number; year: number }

export function toBirthDate(d: Date): BirthDate {
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
}

export function daysBetween(a: Date, b: Date): number {
  const MS = 86_400_000;
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / MS);
}
