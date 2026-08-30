import { describe, it, expect } from 'vitest';
import { fullProfile } from '../index';
import { contradictions } from '../content/contradiction';

/**
 * Chapter 2 asks which two parts of a profile disagree. The chapter used to
 * answer with five cards, each correct and each about one number on its own --
 * nothing said what was arguing with what.
 *
 * Nothing here is calculated: the bridges come out of the profile and every
 * phrase out of an archetype or a frame. What is asserted is that the sentence
 * is about *this* profile.
 */

const LANGS = ['ro', 'en', 'ru'] as const;

const profileFor = (name: string, day: number, month: number, year: number) =>
  fullProfile(name, { day, month, year }).pythagorean;

const VICTOR = profileFor('Victor Ion Safta', 25, 8, 1990);
const ANA = profileFor('Ana Maria Popescu', 3, 2, 1978);

describe('contradictions', () => {
  it.each(LANGS)('names both bridges in %s', (lang) => {
    const found = contradictions(VICTOR, lang);
    expect(found.map((c) => c.key)).toEqual([
      'bridgeLifePathExpression',
      'bridgeSoulPersonality',
    ]);
    for (const c of found) {
      expect(c.label.trim().length).toBeGreaterThan(3);
      expect(c.sides).toHaveLength(2);
    }
  });

  it.each(LANGS)('says something different for a different profile in %s', (lang) => {
    const mine = contradictions(VICTOR, lang).map((c) => c.text);
    const theirs = contradictions(ANA, lang).map((c) => c.text);

    // Two profiles whose numbers differ must not read the same. This is the
    // whole point: the five cards it replaced were identical for anyone who
    // happened to share a value.
    expect(mine).not.toEqual(theirs);
  });

  it.each(LANGS)('reports the distance the engine computed in %s', (lang) => {
    const found = contradictions(VICTOR, lang);
    expect(found[0].distance).toBe(VICTOR.extended.bridges.lifePathExpression);
    expect(found[1].distance).toBe(VICTOR.extended.bridges.soulUrgePersonality);

    // And the two sides are the numbers the distance was taken between.
    expect(Math.abs(found[0].sides[0].value - found[0].sides[1].value)).toBe(found[0].distance);
    expect(Math.abs(found[1].sides[0].value - found[1].sides[1].value)).toBe(found[1].distance);
  });

  it.each(LANGS)('leaves no placeholder and no empty field in %s', (lang) => {
    for (const profile of [VICTOR, ANA]) {
      for (const c of contradictions(profile, lang)) {
        expect(c.text).not.toMatch(/\{(essence|strength|shadow|n)\}/);
        expect(c.text).not.toMatch(/undefined/);
        expect(c.text.length).toBeGreaterThan(60);
      }
    }
  });

  it('answers a bridge of zero rather than reporting a gap that is not there', () => {
    // Soul Urge and Personality can land on the same number, and "the bridge is
    // 0" read as a missing answer. Agreement is an answer.
    const found = [VICTOR, ANA]
      .flatMap((p) => LANGS.map((l) => contradictions(p, l)))
      .flat();

    for (const c of found) {
      if (c.distance !== 0) continue;
      // Never the bare "0", and it names the number the two sides agree on --
      // otherwise agreement reads as a blank where an answer should be.
      expect(c.text).not.toMatch(/\b0\b/);
      expect(c.text).toContain(String(c.sides[0].value));
      expect(c.text).toContain(c.sides[0].essence);
      expect(c.text.length).toBeGreaterThan(60);
    }
  });

  it('composes from the archetypes rather than from new copy', () => {
    // The essence of each side is the archetype's own sentence, verbatim.
    const [first] = contradictions(VICTOR, 'ro');
    for (const side of first.sides) {
      expect(first.text).toContain(side.essence);
      expect(first.text).toContain(String(side.value));
    }
  });
});
