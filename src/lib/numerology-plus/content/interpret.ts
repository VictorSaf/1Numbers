/**
 * Motorul de compunere: ramă de context + arhetip → interpretare finală.
 *
 * 14 rame × 12 valori × 3 limbi = 504 interpretări, din 195 + 42 stringuri
 * scrise de mână. Consecvente prin construcție: dacă schimbi arhetipul „7",
 * se actualizează peste tot unde apare 7, în toate limbile.
 */

import type { fullPythagoreanProfile } from '../pythagorean.js';
import type { Lang } from './arcana.js';
import { archetypeFor } from './archetypes.js';
import { FRAME_BY_KEY, type Frame } from './frames.js';
import { LETTER_BY_CH } from './letters.js';

/** Ieșirea lui fullPythagoreanProfile() — singura formă pe care o citesc funcțiile de mai jos. */
type PythagoreanProfile = ReturnType<typeof fullPythagoreanProfile>;

export interface Interpretation {
  key: string;
  label: string;
  question: string;
  value: number;
  title: string;
  keywords: string[];
  lead: string;
  works: string;
  breaks: string;
}

function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function interpret(frameKey: string, value: number, lang: Lang = 'ro'): Interpretation | null {
  const f: Frame | undefined = FRAME_BY_KEY[frameKey];
  if (!f) return null;
  const a = archetypeFor(value);
  const vars = {
    n: value,
    title: a.title[lang],
    essence: a.essence[lang],
    strength: a.strength[lang],
    shadow: a.shadow[lang],
  };
  return {
    key: frameKey,
    label: f.label[lang],
    question: f.question[lang],
    value,
    title: a.title[lang],
    keywords: a.keywords[lang],
    lead: fill(f.lead[lang], vars),
    works: fill(f.works[lang], vars),
    breaks: fill(f.breaks[lang], vars),
  };
}

/** Interpretare pentru o literă (Piatra de Temelie / Vârf / Prima Vocală). */
export function interpretLetter(frameKey: string, letter: string, lang: Lang = 'ro') {
  const f = FRAME_BY_KEY[frameKey];
  const l = LETTER_BY_CH[letter?.toUpperCase()];
  if (!f || !l) return null;
  const base = interpret(frameKey, l.value, lang);
  return base ? { ...base, letter: l.ch, letterTrait: l.trait[lang] } : null;
}

/**
 * Construiește toate interpretările pentru un profil calculat.
 * `profile` = ieșirea din fullPythagoreanProfile().
 */
export function interpretProfile(profile: PythagoreanProfile, lang: Lang = 'ro'): Interpretation[] {
  const out: (Interpretation | null)[] = [];
  const e = profile.extended, c = profile.cycles, t = profile.transits;

  out.push(interpret('attitude', e.attitude.value, lang));
  out.push(interpret('maturity', e.maturity.value, lang));
  out.push(interpret('balance', e.balance.value, lang));
  out.push(interpret('hiddenPassion', e.hiddenPassion.value, lang));
  out.push(interpret('subconsciousSelf', e.subconsciousSelf, lang));
  out.push(interpret('rationalThought', e.rationalThought.value, lang));
  out.push(interpret('bridgeLifePathExpression', e.bridges.lifePathExpression, lang));
  out.push(interpret('bridgeSoulPersonality', e.bridges.soulUrgePersonality, lang));
  out.push(interpret('universalYear', c.universalYear.value, lang));
  out.push(interpret('essence', t.essence.value, lang));

  // „Tabelul de incluziune” redus la cifra dominantă era Pasiunea Ascunsă a doua
  // oară. Tabelul întreg se vede în distribuția cifrelor, iar comparația lui cu
  // media, în „toate școlile”.

  return out.filter(Boolean) as Interpretation[];
}

/** Interpretările bazate pe litere, separat (au câmp suplimentar). */
export function interpretLetters(profile: PythagoreanProfile, lang: Lang = 'ro') {
  const e = profile.extended;
  return [
    e.cornerstone ? interpretLetter('cornerstone', e.cornerstone.letter, lang) : null,
    e.capstone ? interpretLetter('capstone', e.capstone.letter, lang) : null,
    e.firstVowel ? interpretLetter('firstVowel', e.firstVowel.letter, lang) : null,
  ].filter(Boolean);
}
