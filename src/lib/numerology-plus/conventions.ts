/**
 * Contested conventions.
 *
 * Published numerology sources disagree on each of these, and the disagreement
 * changes results. Every one is an exported constant with the alternatives named,
 * so a reader can see which reading this engine follows and switch it in one place
 * rather than discovering it scattered through the calculations.
 */

/**
 * When Y counts as a vowel.
 *
 * 'heuristic' — Y is a vowel when its word contains no other hard vowel (Lynn,
 *   Bryn), or when it follows a consonant and is not followed by a vowel (Mary).
 *   This is the most common treatment in English-language sources.
 * 'never'  — Y is always a consonant. Simplest, and what several older texts use.
 * 'always' — Y is always a vowel. Rare, but used by some Chaldean practitioners.
 */
export const Y_VOWEL_MODE: 'heuristic' | 'never' | 'always' = 'heuristic';

/**
 * Whether 33 survives reduction as a master number.
 *
 * true  — 33 is kept, alongside 11 and 22. The common modern reading.
 * false — 33 reduces to 6. Classic Decoz treats 33 as a master number only when
 *   it appears as a Life Path from a specific pattern, and reduces it otherwise.
 */
export const KEEP_MASTER_33 = true;

/**
 * How Destiny Matrix values reduce into the 1..22 arcana range.
 *
 * 'digitsum' — repeatedly sum the digits while above 22, so 25 becomes 7.
 * 'mod22'    — subtract 22 while above 22, so 25 becomes 3.
 * Russian-language operators are split between the two; 'digitsum' matches the
 * worked example most widely republished (25.08.1990 -> A=7 B=8 C=19 D=7 E=5).
 */
export const MATRIX_REDUCTION: 'digitsum' | 'mod22' = 'digitsum';

/**
 * Which Kua epoch rule applies.
 *
 * 'classic' — the traditional formula, unchanged for every birth year.
 * 'century' — an adjusted formula some schools apply to births from 2000 on.
 */
export const KUA_ERA: 'classic' | 'century' = 'classic';

/** Master numbers, subject to KEEP_MASTER_33. */
export const MASTER_NUMBERS: readonly number[] = KEEP_MASTER_33 ? [11, 22, 33] : [11, 22];

/** Totals that carry a karmic debt when they appear before the final reduction. */
export const KARMIC_DEBT_TOTALS: readonly number[] = [13, 14, 16, 19];
