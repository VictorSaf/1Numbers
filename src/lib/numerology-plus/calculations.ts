import { NumerologyResult, reduce, splitLetters, sumLetters, toResult } from './core';

/**
 * The six positions where a karmic debt can appear.
 *
 * Each is computed from a raw total that is kept, so a 7 arriving from 16 is
 * distinguishable from a 7 arriving from 25.
 */

const digitsOf = (n: number): number =>
  String(n).split('').reduce((sum, d) => sum + Number(d), 0);

/**
 * Life Path, by the segmented method: day, month and year are each reduced
 * before being added. The alternative (summing all digits of the date flat)
 * gives a different result often enough to matter, and is used here only for the
 * Vedic Bhagyank, which is defined that way.
 */
export const lifePath = (birthDate: Date): NumerologyResult => {
  const day = reduce(birthDate.getDate(), false);
  const month = reduce(birthDate.getMonth() + 1, false);
  const year = reduce(digitsOf(birthDate.getFullYear()), false);
  return toResult(day + month + year);
};

/** Expression (Destiny): every letter of the full name. */
export const expression = (fullName: string): NumerologyResult =>
  toResult(sumLetters(splitLetters(fullName).all));

/** Soul Urge (Heart's Desire): the vowels. */
export const soulUrge = (fullName: string): NumerologyResult =>
  toResult(sumLetters(splitLetters(fullName).vowels));

/** Personality: the consonants. */
export const personality = (fullName: string): NumerologyResult =>
  toResult(sumLetters(splitLetters(fullName).consonants));

/**
 * Birthday: the day of the month as it stands, 1..31.
 *
 * raw carries the day itself because the unreduced day is read as meaningful
 * here, and because a 13th, 14th, 16th or 19th is a karmic debt position.
 */
export const birthday = (birthDate: Date): NumerologyResult =>
  toResult(birthDate.getDate());

/** Personal Year: birth day and month against the year in question. */
export const personalYear = (
  birthDate: Date,
  year: number = new Date().getFullYear(),
): NumerologyResult => {
  const day = reduce(birthDate.getDate(), false);
  const month = reduce(birthDate.getMonth() + 1, false);
  const yearValue = reduce(digitsOf(year), false);
  return toResult(day + month + yearValue, false);
};

/** All six debt-bearing positions at once. */
export interface CorePositions {
  lifePath: NumerologyResult;
  expression: NumerologyResult;
  soulUrge: NumerologyResult;
  personality: NumerologyResult;
  birthday: NumerologyResult;
  personalYear: NumerologyResult;
}

export const corePositions = (
  fullName: string,
  birthDate: Date,
  year?: number,
): CorePositions => ({
  lifePath: lifePath(birthDate),
  expression: expression(fullName),
  soulUrge: soulUrge(fullName),
  personality: personality(fullName),
  birthday: birthday(birthDate),
  personalYear: personalYear(birthDate, year),
});

/** Every karmic debt found across the six positions. */
export const karmicDebts = (positions: CorePositions): { position: keyof CorePositions; debt: number }[] =>
  (Object.entries(positions) as [keyof CorePositions, NumerologyResult][])
    .filter(([, r]) => r.karmicDebt !== null)
    .map(([position, r]) => ({ position, debt: r.karmicDebt as number }));
