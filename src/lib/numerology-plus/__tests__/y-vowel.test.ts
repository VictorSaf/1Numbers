import { describe, it, expect } from 'vitest';
import { classifyFullName, normalizeName, isNameSupported, isCyrillic } from '../core';

/**
 * Two things the engine used to get wrong about which letters it was even
 * looking at, written down as rules rather than left to whatever the code did.
 */

const vowelsOf = (name: string) =>
  classifyFullName(name).filter((l) => l.vowel).map((l) => l.ch).join('');

describe('Y is a consonant only when it opens a syllable', () => {
  // The rule, in one line: Y is a consonant when a hard vowel follows it
  // directly; everywhere else it carries the vowel sound itself.
  const CASES: Array<[string, boolean[], string]> = [
    // Word-initial Y before a consonant. This is what the old rule could not
    // express: it asked whether the previous letter was a consonant, and at the
    // start of a word there is no previous letter.
    ['YVONNE', [true, false, true, false, false, true], 'Y opens the word, V follows'],
    ['YVES',   [true, false, true, false],               'same, four letters'],

    // Word-initial Y before a vowel: a glide, so a consonant.
    ['YOLANDA', [false, true, false, true, false, false, true], 'YO- is a syllable opening'],
    ['YURI',    [false, true, false, true],                     'YU- likewise'],

    // Y inside a word, before a vowel.
    ['BRYAN', [false, false, false, true, false], 'BRY-AN, A follows the Y'],
    ['MAYA',  [false, true, false, true],         'MA-YA'],

    // Y inside or at the end, with no vowel after it.
    ['MARY', [false, true, false, true],        'nothing follows the Y'],
    ['LYNN', [false, true, false, false],       'N follows'],
    ['BRYN', [false, false, true, false],       'no hard vowel anywhere'],
    ['KYLIE', [false, true, false, true, true], 'L follows the Y'],
  ];

  it.each(CASES)('%s (%s)', (word, expected) => {
    expect(classifyFullName(word).map((l) => l.vowel)).toEqual(expected);
  });

  it('treats every Y in an all-Y word as a vowel', () => {
    expect(vowelsOf('SYZYGY')).toBe('YYY');
  });
});

describe('a name the engine cannot read says so', () => {
  it('romanises Cyrillic instead of deleting it', () => {
    // normalizeName used to end at [^A-Z\s'-] -> '', so this was a single space:
    // every position came out 0 and the UI interpreted it anyway.
    expect(normalizeName('Анна Петрова')).toBe('ANNA PETROVA');
    expect(isNameSupported('Анна Петрова')).toBe(true);
    expect(isCyrillic('Анна Петрова')).toBe(true);
  });

  it('spells out the multi-letter Cyrillic sounds', () => {
    expect(normalizeName('Юлия Щербакова')).toBe('YULIYA SHCHERBAKOVA');
    expect(normalizeName('Жуков')).toBe('ZHUKOV');
    // The soft and hard signs are silent and contribute no letter.
    expect(normalizeName('Игорь')).toBe('IGOR');
  });

  it('leaves Romanian diacritics exactly as they were', () => {
    expect(normalizeName('Ștefan Ioniță')).toBe('STEFAN IONITA');
    expect(normalizeName('Ştefan Ioniţa')).toBe('STEFAN IONITA');
  });

  it('reports a script it cannot romanise rather than returning nothing', () => {
    expect(isNameSupported('李小龙')).toBe(false);
    expect(isNameSupported('Δημήτριος')).toBe(false);
    expect(isNameSupported('   ')).toBe(false);
    expect(isNameSupported('Victor Ion Safta')).toBe(true);
  });
});
