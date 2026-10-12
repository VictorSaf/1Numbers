/**
 * Which of the engine's interpretations belongs to which chapter.
 *
 * interpretProfile emits eleven, and they used to arrive as one flat list under
 * "The New Numbers" -- so a reader had no way to see that the two bridges answer
 * a different question from the inclusion table, or that Essence is about this
 * year while Maturity is about the whole life.
 *
 * The lists are exported rather than inlined so a test can check they still
 * partition what the engine emits: a key added to the engine and forgotten here
 * would simply stop being rendered, silently.
 */

/** 1 — what you are made of, whatever the year. */
export const CHAPTER_SELF = ['attitude', 'maturity'] as const;

/** 2 — the two things in the map that do not agree. */
export const CHAPTER_TENSION = [
  'bridgeLifePathExpression',
  'bridgeSoulPersonality',
  'balance',
  'rationalThought',
  'subconsciousSelf',
] as const;

/** 3 — what is missing, and what that asks of you. */
export const CHAPTER_LESSONS = ['hiddenPassion'] as const;

/** 4 — this year, this month, today. */
export const CHAPTER_NOW = ['essence', 'universalYear'] as const;

export const ALL_CHAPTER_KEYS = [
  ...CHAPTER_SELF,
  ...CHAPTER_TENSION,
  ...CHAPTER_LESSONS,
  ...CHAPTER_NOW,
] as const;
