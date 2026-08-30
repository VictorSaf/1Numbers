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

/** Y ca vocală. Decoz și Numerologist.com diferă.
 *  'heuristic' = Y e consoană doar când deschide o silabă, adică e urmat direct
 *  de o vocală tare (Yolanda, Bryan, Maya). În rest e vocală: Yvonne, Yves,
 *  Mary, Lynn, Bryn. Vezi classifyLetters. */
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

/**
 * Cyrillic → Latin, so a Russian name reaches the letter table at all.
 *
 * The app is RO/EN/RU, but normalizeName ended with `[^A-Z\s'-]` → '', which
 * for 'Анна Петрова' left a single space: every position came out 0, all nine
 * karmic lessons read as missing, and archetypeFor(0) exists — so the UI
 * rendered a confident interpretation of nothing at all.
 *
 * This is a romanisation, not a Cyrillic numerology table. The two are different
 * methods and give different numbers: Ш becomes SH and so counts as two letters.
 * A native Cyrillic table is the other way to do this and would be a larger
 * change than a bug fix; romanising is what makes the existing engine answer.
 *
 * Ordered longest-first is unnecessary here because each key is one character,
 * but Ъ and Ь map to nothing on purpose: they are silent.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A',  Б: 'B',  В: 'V',  Г: 'G',  Д: 'D',  Е: 'E',  Ё: 'E',  Ж: 'ZH',
  З: 'Z',  И: 'I',  Й: 'Y',  К: 'K',  Л: 'L',  М: 'M',  Н: 'N',  О: 'O',
  П: 'P',  Р: 'R',  С: 'S',  Т: 'T',  У: 'U',  Ф: 'F',  Х: 'KH', Ц: 'TS',
  Ч: 'CH', Ш: 'SH', Щ: 'SHCH', Ъ: '',  Ы: 'Y', Ь: '',   Э: 'E',  Ю: 'YU',
  Я: 'YA',
  // Ukrainian and Belarusian letters that appear in names written in Cyrillic.
  І: 'I',  Ї: 'YI', Є: 'YE', Ґ: 'G',  Ў: 'U',
};

const CYRILLIC = /[\u0400-\u04FF]/;

/** Elimină diacriticele (ă→a, ș→s), transliterează chirilicele, păstrează A–Z. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș|ş/gi, 's')
    .replace(/ț|ţ/gi, 't')
    .toUpperCase()
    .replace(/[\u0400-\u04FF]/g, (ch) => CYRILLIC_TO_LATIN[ch] ?? '')
    .replace(/[^A-Z\s'-]/g, '');
}

/**
 * Does this name reach the letter table at all?
 *
 * Anything the engine cannot romanise — Greek, Arabic, Han, an emoji — still
 * normalises to nothing, and a profile built on nothing is indistinguishable
 * from a real one on screen. Callers ask before they calculate, so the answer
 * is a message rather than a page of zeroes.
 */
export function isNameSupported(name: string): boolean {
  if (!name.trim()) return false;
  return letters(name).length > 0;
}

/** True if the name needed romanising to be read. Useful for telling the user. */
export function isCyrillic(name: string): boolean {
  return CYRILLIC.test(name);
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
  return w.split('').map((ch, i) => {
    if (HARD_VOWELS.has(ch)) return { ch, vowel: true };
    if (ch !== 'Y') return { ch, vowel: false };
    if (Y_VOWEL_MODE === 'always') return { ch, vowel: true };
    if (Y_VOWEL_MODE === 'never') return { ch, vowel: false };

    // One rule: Y is a consonant when it opens a syllable, which in writing is
    // when a hard vowel follows it directly. Otherwise it is carrying the vowel
    // sound itself.
    //
    // What this replaced also asked whether the previous letter was a consonant,
    // and that was false at the start of a word -- so a word-initial Y could
    // never be a vowel and Yvonne and Yves came out with none. The
    // `hasHardVowel` special case for Bryn is subsumed: a Y with no vowel after
    // it is a vowel whether or not the word has one elsewhere.
    return { ch, vowel: !HARD_VOWELS.has(w[i + 1]) };
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

/**
 * The karmic debt hiding in a reduction, not just the one sitting on top of it.
 *
 * This used to look only at `raw`, which works for a Life Path -- three reduced
 * segments cannot exceed 27 -- but never fires for a name, where the letter sum
 * lands somewhere between 40 and 120. expression('Ștefan Țîrlea') is 49, and
 * 49 -> 4+9 = 13 is a debt that was dropped in silence.
 *
 * The walk stops where reduce() stops, so a chain that reaches a preserved
 * master ends there. At most one debt can appear in a chain: none of 13, 14, 16
 * or 19 has a digit sum that is itself a debt.
 */
function karmicDebtIn(raw: number, keepMasters: boolean): number | null {
  let x = Math.abs(raw);
  while (x > 9) {
    if ((KARMIC_DEBTS as readonly number[]).includes(x)) return x;
    if (keepMasters && isMaster(x)) break;
    x = digitSum(x);
  }
  return null;
}

export function result(raw: number, keepMasters = true): NumResult {
  const value = reduce(raw, keepMasters);
  return {
    raw,
    value,
    isMaster: isMaster(value),
    karmicDebt: karmicDebtIn(raw, keepMasters),
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
