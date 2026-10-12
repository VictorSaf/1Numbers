import { describe, it, expect } from 'vitest';
import { classifyFullName, PYTHAGOREAN, CHALDEAN, toBirthDate } from '../core';
import { lifePath, inclusionTable, hiddenPassion } from '../pythagorean';
import * as M from '../matrix';
import * as S from '../systems';
import { chaldeanName } from '../systems';
import {
  calculateChaldeanNameNumber,
  calculateChaldeanAnalysis,
  getChaldeanLetterValue,
} from '@/lib/chaldean';
import { analyzeIndividualLetters } from '@/lib/nameAnalysis';
import { calculateKarmicLessons } from '@/lib/karmic';
import { calculateHiddenPassions, analyzeLetterDistribution } from '@/lib/numerology';

/**
 * Guards the property unit tests cannot: that separate modules agree with each
 * other. Every module used to carry its own letter table, its own vowel list and
 * its own name cleaning, so each was internally consistent and collectively
 * wrong -- the results page showed one Soul Urge in the header and analysed a
 * different set of letters underneath it.
 *
 * Names chosen for the two ways those copies diverged: Romanian diacritics,
 * dropped rather than transliterated, and Y, treated as always a consonant.
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
  it.each(NAMES)('analyzeIndividualLetters sees the same letters: %s', (name) => {
    const core = classifyFullName(name);
    const letters = analyzeIndividualLetters(name);
    expect(letters).toHaveLength(core.length);
    expect(letters.filter((l) => l.isVowel)).toHaveLength(core.filter((l) => l.vowel).length);
  });

  it.each(NAMES)('positions run 1..n without gaps: %s', (name) => {
    const letters = analyzeIndividualLetters(name);
    expect(letters.map((l) => l.position)).toEqual(letters.map((_, i) => i + 1));
  });

  it.each(NAMES)('a karmic lesson is never present in the name: %s', (name) => {
    const present = new Set(classifyFullName(name).map((l) => PYTHAGOREAN[l.ch]));
    expect(calculateKarmicLessons(name).filter((n) => present.has(n))).toEqual([]);
  });

  it.each(NAMES)('letter distribution counts the same letters: %s', (name) => {
    const core = classifyFullName(name);
    const d = analyzeLetterDistribution(name);
    const counted = Object.values(d.letterCounts).reduce((a, c) => a + c, 0);
    expect(counted).toBe(core.length);
    expect(d.vowels).toBe(core.filter((l) => l.vowel).length);
    expect(d.vowels + d.consonants).toBe(core.length);
  });

  it.each(NAMES)('hidden passions come from the engine frequencies: %s', (name) => {
    const freq = inclusionTable(name);
    const passions = calculateHiddenPassions(name);
    expect(passions.length).toBeLessThanOrEqual(3);
    const top = Math.max(...Object.values(freq));
    // Whatever leads must be a digit that actually reaches the peak.
    expect(freq[passions[0]]).toBe(top);
    for (const pn of passions) expect(freq[pn]).toBeGreaterThan(0);
  });

  it.each(NAMES)('hidden passions agree with the engine on the peak: %s', (name) => {
    // The shapes differ -- an array here, a value-plus-ties there -- but they
    // must not disagree about which digit dominates the name.
    expect(hiddenPassion(name).tied).toContain(calculateHiddenPassions(name)[0]);
  });
});

describe('chaldean agrees with the engine', () => {
  it.each(NAMES)('name number matches, letter for letter: %s', (name) => {
    const engine = chaldeanName(name);
    const module_ = calculateChaldeanNameNumber(name);
    expect(module_.compound).toBe(engine.compound);
    expect(module_.single).toBe(engine.root);
  });

  it.each(NAMES)('the breakdown adds up to the number above it: %s', (name) => {
    // A list of letters that sums to something other than the headline number
    // is worse than no list at all.
    const { letterBreakdown, nameNumber } = calculateChaldeanAnalysis(name, new Date(1990, 7, 25));
    expect(letterBreakdown).toHaveLength(classifyFullName(name).length);
    expect(letterBreakdown.reduce((a, l) => a + l.value, 0)).toBe(nameNumber.compound);
  });

  it('reads every letter value from the engine table', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      expect(getChaldeanLetterValue(ch), `letter ${ch}`).toBe(CHALDEAN[ch]);
    }
  });

  it('counts a transliterated name rather than dropping the letter', () => {
    // The regression this delegation fixes: the local pass saw eleven letters
    // and summed to 46; the engine reads thirteen and reaches 52.
    expect(classifyFullName('Ștefan Mureșan')).toHaveLength(13);
    expect(calculateChaldeanNameNumber('Ștefan Mureșan').compound).toBe(52);
  });
});

describe('published reference values', () => {
  it('Life Path 25.08.1990 is 7 from a raw 16', () => {
    const lp = lifePath(toBirthDate(new Date(1990, 7, 25)));
    expect([lp.value, lp.raw, lp.karmicDebt]).toEqual([7, 16, 16]);
  });

  it('Destiny Matrix 25.08.1990 matches the published worked example', () => {
    const at = (k: string) => M.destinyMatrix(toBirthDate(new Date(1990, 7, 25)))
      .points.find((p) => p.key === k)?.arcana;
    expect(['A', 'B', 'C', 'D', 'E'].map(at)).toEqual([7, 8, 19, 7, 5]);
  });

  it('every matrix point lands inside the arcana range', () => {
    for (const d of [new Date(1990, 7, 25), new Date(1985, 0, 1), new Date(2003, 11, 31)]) {
      for (const { arcana } of M.destinyMatrix(toBirthDate(d)).points) {
        expect(arcana).toBeGreaterThanOrEqual(1);
        expect(arcana).toBeLessThanOrEqual(22);
      }
    }
  });

  it('Kua follows the classic rule for both sexes', () => {
    expect(S.kuaNumber(1990, 'male').kua).toBe(1);
    expect(S.kuaNumber(1990, 'female').kua).toBe(8);
    expect(S.kuaNumber(1985, 'male').kua).toBe(6);
    expect(S.kuaNumber(1985, 'female').kua).toBe(9);
  });

  it('Bhagyank 14.04.1995 is 6', () => {
    expect(S.bhagyank(toBirthDate(new Date(1995, 3, 14)))).toBe(6);
  });
});
