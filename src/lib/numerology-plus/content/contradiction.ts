import type { Lang } from './arcana.js';
import { archetypeFor } from './archetypes.js';
import { FRAME_BY_KEY } from './frames.js';
import type { fullPythagoreanProfile } from '../pythagorean.js';

type PythagoreanProfile = ReturnType<typeof fullPythagoreanProfile>;

/**
 * The two places a profile argues with itself.
 *
 * Nothing here is calculated: the bridges are already in the profile, and every
 * phrase comes from an archetype or a frame that was written months ago. What
 * was missing was the sentence that puts them side by side -- the engine could
 * say what a 7 is and what a 3 is, and could report that the bridge between
 * them is 4, but never that those three facts were about each other.
 *
 * A bridge of 0 is not a failure to find tension; it is the answer. The two
 * sides agree, and saying so is worth as much as naming a gap.
 */

export interface Contradiction {
  key: 'bridgeLifePathExpression' | 'bridgeSoulPersonality';
  /** The frame's own name for this tension. */
  label: string;
  /** The two sides, each with its number and what that number is. */
  sides: [Side, Side];
  /** The distance between them. 0 when the two sides say the same thing. */
  distance: number;
  /** One paragraph, composed. */
  text: string;
}

interface Side {
  /** Which position of the profile this is. */
  position: string;
  value: number;
  /** The archetype's one-line essence, used as a predicate. */
  essence: string;
}

/** Numele pozițiilor. Exportat: citirea zilei compară ziua cu aceleași patru
 * poziții, iar două tabele separate ar diverge la prima redenumire. */
export const POSITIONS: Record<string, Record<Lang, string>> = {
  lifePath: { ro: 'Drumul tău', en: 'Your Life Path', ru: 'Ваш Жизненный путь' },
  expression: { ro: 'Destinul tău', en: 'Your Expression', ru: 'Ваша Судьба' },
  soulUrge: { ro: 'Sufletul tău', en: 'Your Soul Urge', ru: 'Ваша Душа' },
  personality: { ro: 'Personalitatea ta', en: 'Your Personality', ru: 'Ваша Личность' },
};

// The connective tissue, and the only strings this module adds. Everything
// between them is archetype and frame copy.
//
// The separator after the number is a colon, not a dash: several archetype
// essences carry an em dash of their own, and "says 7 — the energy of the
// question — you do not accept" reads as one clause too many.
const JOIN: Record<Lang, {
  says: (position: string, n: number, essence: string) => string;
  bridged: (n: number, strength: string) => string;
  aligned: (a: string, b: string, n: number, essence: string) => string;
}> = {
  ro: {
    says: (p, n, e) => `${p} spune ${n}: ${e}.`,
    bridged: (n, s) => `Puntea dintre ele e ${n}: distanța se închide acolo unde ${s}.`,
    aligned: (a, b, n, e) =>
      `${a} și ${b} spun amândouă ${n}: ${e}. Nu e nicio distanță de acoperit aici — ce vrei și ce arăți trag în aceeași direcție, iar asta e la fel de rar ca o contradicție.`,
  },
  en: {
    says: (p, n, e) => `${p} says ${n}: ${e}.`,
    bridged: (n, s) => `The bridge between them is ${n}: the distance closes where ${s}.`,
    aligned: (a, b, n, e) =>
      `${a} and ${b} both say ${n}: ${e}. There is no distance to cover here — what you want and what you show pull the same way, which is as rare as a contradiction.`,
  },
  ru: {
    says: (p, n, e) => `${p} говорит ${n}: ${e}.`,
    bridged: (n, s) => `Мост между ними — ${n}: расстояние закрывается там, где ${s}.`,
    aligned: (a, b, n, e) =>
      `${a} и ${b} называют ${n}: ${e}. Здесь нечего преодолевать — желаемое и показываемое тянут в одну сторону, и это так же редко, как противоречие.`,
  },
};

function compose(
  key: Contradiction['key'],
  left: { position: string; value: number },
  right: { position: string; value: number },
  distance: number,
  lang: Lang,
): Contradiction {
  const join = JOIN[lang];
  const side = (s: { position: string; value: number }): Side => ({
    position: POSITIONS[s.position][lang],
    value: s.value,
    essence: archetypeFor(s.value).essence[lang],
  });

  const sides: [Side, Side] = [side(left), side(right)];
  const label = FRAME_BY_KEY[key]?.label[lang] ?? key;

  const text =
    distance === 0
      ? join.aligned(sides[0].position, sides[1].position, sides[0].value, sides[0].essence)
      : [
          join.says(sides[0].position, sides[0].value, sides[0].essence),
          join.says(sides[1].position, sides[1].value, sides[1].essence),
          join.bridged(distance, archetypeFor(distance).strength[lang]),
        ].join(' ');

  return { key, label, sides, distance, text };
}

/** The two contradictions, in the order a reading should meet them. */
export function contradictions(profile: PythagoreanProfile, lang: Lang = 'ro'): Contradiction[] {
  const { core, extended } = profile;

  return [
    compose(
      'bridgeLifePathExpression',
      { position: 'lifePath', value: core.lifePath.value },
      { position: 'expression', value: core.expression.value },
      extended.bridges.lifePathExpression,
      lang,
    ),
    compose(
      'bridgeSoulPersonality',
      { position: 'soulUrge', value: core.soulUrge.value },
      { position: 'personality', value: core.personality.value },
      extended.bridges.soulUrgePersonality,
      lang,
    ),
  ];
}
