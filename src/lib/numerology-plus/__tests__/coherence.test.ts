import { describe, it, expect } from 'vitest';
import { splitLetters, classifyLetters } from '../core';
import { analyzeIndividualLetters } from '@/lib/nameAnalysis';
import { calculateKarmicLessons } from '@/lib/karmic';

/**
 * These guard the property the unit tests could not: that separate modules agree
 * with each other. Every module used to carry its own letter table, its own
 * vowel list and its own name cleaning, so each was internally consistent and
 * collectively wrong -- the results page could show one Soul Urge in the header
 * and analyse a different set of letters directly underneath it.
 *
 * Names chosen for the two ways the old copies diverged: Romanian diacritics,
 * which were dropped rather than transliterated, and Y, which was always a
 * consonant regardless of Y_VOWEL_MODE.
 */
const NAMES = [
  'Ștefan Mureșan',
  'Mihaela Țăran',
  'Mary Johnson',
  'Lynn Bryant',
  'Ana Popescu',
  'Maria Elena Popescu',
];

describe('modules agree with the engine', () => {
  it.each(NAMES)('analyzeIndividualLetters sees the same letters as the engine: %s', (name) => {
    const core = splitLetters(name);
    const letters = analyzeIndividualLetters(name);

    expect(letters).toHaveLength(core.all.length);
    expect(letters.filter((l) => l.isVowel)).toHaveLength(core.vowels.length);
    expect(letters.filter((l) => l.isConsonant)).toHaveLength(core.consonants.length);
  });

  it.each(NAMES)('positions run 1..n without gaps: %s', (name) => {
    const letters = analyzeIndividualLetters(name);
    expect(letters.map((l) => l.position)).toEqual(letters.map((_, i) => i + 1));
  });

  it.each(NAMES)('a karmic lesson is never a number present in the name: %s', (name) => {
    const present = new Set(classifyLetters(name).map((l) => l.value));
    const contradictions = calculateKarmicLessons(name).filter((n) => present.has(n));
    expect(contradictions).toEqual([]);
  });

  it('classifyLetters and splitLetters resolve Y identically', () => {
    for (const name of NAMES) {
      const bySplit = splitLetters(name).vowels.length;
      const byClassify = classifyLetters(name).filter((l) => l.isVowel).length;
      expect(byClassify).toBe(bySplit);
    }
  });
});
