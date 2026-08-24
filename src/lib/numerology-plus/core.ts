import {
  KARMIC_DEBT_TOTALS,
  MASTER_NUMBERS,
  Y_VOWEL_MODE,
} from './conventions';

/**
 * Every calculation returns this shape.
 *
 * `raw` is the total before the final reduction and is not decoration: karmic
 * debt is a property of that total, not of the digit it reduces to. A function
 * that returns only 7 cannot say whether it came from 16 (debt) or 25 (no debt),
 * so the previous engine could not detect debts at all.
 */
export interface NumerologyResult {
  /** Total before the final reduction. */
  raw: number;
  /** Final value, after reduction. */
  value: number;
  /** Whether `value` is a master number that survived reduction. */
  isMaster: boolean;
  /** 13, 14, 16 or 19 when `raw` carries a karmic debt, otherwise null. */
  karmicDebt: number | null;
}

const isMasterNumber = (n: number, keepMasters: boolean) =>
  keepMasters && MASTER_NUMBERS.includes(n);

const digitSum = (n: number): number =>
  String(Math.abs(n))
    .split('')
    .reduce((sum, d) => sum + Number(d), 0);

/** Reduce to a single digit, optionally stopping on master numbers. */
export const reduce = (n: number, keepMasters = true): number => {
  let current = Math.abs(n);
  while (current > 9 && !isMasterNumber(current, keepMasters)) {
    current = digitSum(current);
  }
  return current;
};

/** Wrap a raw total into the full result shape. */
export const toResult = (raw: number, keepMasters = true): NumerologyResult => {
  const value = reduce(raw, keepMasters);
  return {
    raw,
    value,
    isMaster: isMasterNumber(value, keepMasters),
    karmicDebt: KARMIC_DEBT_TOTALS.includes(raw) ? raw : null,
  };
};

// --- letters -------------------------------------------------------------

/**
 * Strip diacritics so Romanian and Russian-transliterated input scores the same
 * as its ASCII spelling: ă/â/î -> a/a/i, ș -> s, ț -> t.
 */
export const normalizeName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Comma-below forms used by Romanian are separate codepoints, not combining marks.
    .replace(/[șş]/gi, (m) => (m === m.toUpperCase() ? 'S' : 's'))
    .replace(/[țţ]/gi, (m) => (m === m.toUpperCase() ? 'T' : 't'))
    .toUpperCase()
    .replace(/[^A-Z\s'-]/g, '');

/** Pythagorean values: A=1..I=9, J=1..R=9, S=1..Z=8. */
export const pythagoreanValue = (letter: string): number => {
  const code = letter.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  return ((code - 65) % 9) + 1;
};

const HARD_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Whether the Y at `index` of `word` counts as a vowel, under Y_VOWEL_MODE.
 *
 * The heuristic reading: a Y is a vowel when its word has no other hard vowel
 * (LYNN, BRYN), or when it follows a consonant and is not followed by a vowel
 * (MARY). Both clauses are needed; either alone misses one of those names.
 */
export const isYVowel = (word: string, index: number): boolean => {
  if (Y_VOWEL_MODE === 'always') return true;
  if (Y_VOWEL_MODE === 'never') return false;

  const hasOtherHardVowel = [...word].some((c) => HARD_VOWELS.has(c));
  if (!hasOtherHardVowel) return true;

  const prev = word[index - 1];
  const next = word[index + 1];
  const followsConsonant = prev !== undefined && !HARD_VOWELS.has(prev) && prev !== 'Y';
  const notFollowedByVowel = next === undefined || !HARD_VOWELS.has(next);
  return followsConsonant && notFollowedByVowel;
};

export interface LetterSplit {
  vowels: string[];
  consonants: string[];
  all: string[];
}

/** Split a normalized name into vowels and consonants, resolving Y per word. */
export const splitLetters = (name: string): LetterSplit => {
  const vowels: string[] = [];
  const consonants: string[] = [];
  const all: string[] = [];

  for (const word of normalizeName(name).split(/[\s'-]+/).filter(Boolean)) {
    [...word].forEach((letter, index) => {
      all.push(letter);
      const isVowel = HARD_VOWELS.has(letter) || (letter === 'Y' && isYVowel(word, index));
      (isVowel ? vowels : consonants).push(letter);
    });
  }

  return { vowels, consonants, all };
};

/** Sum Pythagorean values over a list of letters. */
export const sumLetters = (letters: string[]): number =>
  letters.reduce((sum, letter) => sum + pythagoreanValue(letter), 0);
