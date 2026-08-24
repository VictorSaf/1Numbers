import { describe, it, expect } from 'vitest';
import {
  reduce,
  toResult,
  normalizeName,
  splitLetters,
  pythagoreanValue,
  sumLetters,
} from '../core';
import { lifePath, expression, soulUrge, personality, birthday, corePositions, karmicDebts } from '../calculations';

describe('reduce', () => {
  it('keeps master numbers by default', () => {
    expect(reduce(29)).toBe(11);
  });

  it('reduces past master numbers when asked', () => {
    expect(reduce(29, false)).toBe(2);
  });

  it('reduces multi-step totals', () => {
    expect(reduce(19)).toBe(1); // 19 -> 10 -> 1
  });

  it('leaves single digits alone', () => {
    expect(reduce(7)).toBe(7);
    expect(reduce(0)).toBe(0);
  });
});

describe('toResult', () => {
  it('keeps the raw total alongside the reduced value', () => {
    const r = toResult(16);
    expect(r.raw).toBe(16);
    expect(r.value).toBe(7);
  });

  it('flags karmic debt on the raw total, not the value', () => {
    // Both reduce to 7; only one carries a debt. This is the distinction the
    // previous engine could not make.
    expect(toResult(16).karmicDebt).toBe(16);
    expect(toResult(25).karmicDebt).toBeNull();
  });

  it('detects all four debt totals', () => {
    expect([13, 14, 16, 19].map((n) => toResult(n).karmicDebt)).toEqual([13, 14, 16, 19]);
  });

  it('marks surviving master numbers', () => {
    expect(toResult(29).isMaster).toBe(true);
    expect(toResult(29, false).isMaster).toBe(false);
  });
});

describe('normalizeName', () => {
  it('strips Romanian diacritics', () => {
    expect(normalizeName('Ștefan Mureșan')).toBe('STEFAN MURESAN');
    expect(normalizeName('Ana-Maria Țăran')).toBe('ANA-MARIA TARAN');
  });

  it('scores a diacritic name the same as its ASCII spelling', () => {
    expect(expression('Ștefan').raw).toBe(expression('Stefan').raw);
  });
});

describe('Y as a vowel', () => {
  it('treats Y as a vowel when the word has no other hard vowel', () => {
    expect(splitLetters('Lynn').vowels).toContain('Y');
    expect(splitLetters('Bryn').vowels).toContain('Y');
  });

  it('treats a trailing Y after a consonant as a vowel', () => {
    expect(splitLetters('Mary').vowels).toEqual(['A', 'Y']);
  });

  it('treats Y before a vowel as a consonant', () => {
    expect(splitLetters('Yolanda').consonants).toContain('Y');
  });
});

describe('letter values', () => {
  it('follows the Pythagorean table', () => {
    expect(pythagoreanValue('A')).toBe(1);
    expect(pythagoreanValue('I')).toBe(9);
    expect(pythagoreanValue('J')).toBe(1);
    expect(pythagoreanValue('R')).toBe(9);
    expect(pythagoreanValue('S')).toBe(1);
    expect(pythagoreanValue('Z')).toBe(8);
  });

  it('splits a name without losing letters', () => {
    const { vowels, consonants, all } = splitLetters('Maria Elena Popescu');
    expect(vowels.length + consonants.length).toBe(all.length);
    expect(sumLetters(vowels) + sumLetters(consonants)).toBe(sumLetters(all));
  });
});

describe('reference date 25.08.1990', () => {
  const date = new Date(1990, 7, 25);

  it('gives Life Path 7 from a raw total of 16', () => {
    const lp = lifePath(date);
    expect(lp.value).toBe(7);
    expect(lp.raw).toBe(16);
  });

  it('reports the karmic debt that the raw total carries', () => {
    expect(lifePath(date).karmicDebt).toBe(16);
  });
});

describe('core positions', () => {
  it('exposes all six debt-bearing positions', () => {
    const p = corePositions('Maria Elena Popescu', new Date(1990, 7, 25), 2026);
    expect(Object.keys(p)).toEqual([
      'lifePath', 'expression', 'soulUrge', 'personality', 'birthday', 'personalYear',
    ]);
    Object.values(p).forEach((r) => {
      expect(r).toHaveProperty('raw');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('isMaster');
      expect(r).toHaveProperty('karmicDebt');
    });
  });

  it('collects debts across positions', () => {
    const p = corePositions('Maria Elena Popescu', new Date(1990, 7, 25), 2026);
    expect(karmicDebts(p)).toContainEqual({ position: 'lifePath', debt: 16 });
  });

  it('reads Birthday as the day itself', () => {
    expect(birthday(new Date(1990, 7, 13)).raw).toBe(13);
    expect(birthday(new Date(1990, 7, 13)).karmicDebt).toBe(13);
  });
});

describe('agreement with the existing engine', () => {
  it('matches soul urge and personality splits', () => {
    const name = 'Maria Elena Popescu';
    expect(soulUrge(name).value).toBeGreaterThan(0);
    expect(personality(name).value).toBeGreaterThan(0);
    expect(soulUrge(name).raw + personality(name).raw).toBe(expression(name).raw);
  });
});
