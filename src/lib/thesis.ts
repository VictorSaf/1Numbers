import type { DialFigure, DialLang } from "@/lib/dial";

/**
 * Harta întreagă, într-o frază.
 *
 * E singurul loc din pagină care spune ce formă are harta înainte ca omul să
 * citească vreun capitol. De-aia nu e un șablon cu o cifră turnată în el: o
 * hartă strânsă pe o cifră și una împrăștiată pe cinci sunt lucruri diferite,
 * iar dacă propoziția n-ar deosebi între ele, ar suna la fel pentru toată
 * lumea -- adică n-ar spune nimic.
 *
 * Trei forme, fiindcă cinci numere pe nouă locuri n-au mai multe: se adună, se
 * strâng câte două, sau nu se repetă deloc.
 */

export interface Thesis {
  /** Fraza mare din capul plăcii. */
  lead: string;
  /** Ce o susține: câte cad acolo, și care e excepția. */
  note: string;
}

const WORDS: Record<DialLang, Record<number, string>> = {
  ro: { 2: "două", 3: "trei", 4: "patru", 5: "cinci" },
  en: { 2: "two", 3: "three", 4: "four", 5: "five" },
  ru: { 2: "два", 3: "три", 4: "четыре", 5: "пять" },
};

const COPY: Record<DialLang, {
  gathered: (n: number) => string;
  gatheredNote: (count: string) => string;
  exception: (label: string, n: number) => string;
  paired: (n: number) => string;
  pairedNote: string;
  spread: string;
  spreadNote: string;
  chord: (a: string, b: string, d: number) => string;
}> = {
  ro: {
    gathered: (n) => `Aproape tot în harta ta spune ${n}.`,
    gatheredNote: (c) => `${c[0].toUpperCase()}${c.slice(1)} din cinci numere cad acolo`,
    exception: (label, n) => `, iar ${label} spune altceva: ${n}`,
    paired: (n) => `Harta ta se sprijină pe ${n}, dar nu se repetă mult.`,
    pairedNote: "Două numere cad acolo; restul sunt fiecare pe locul lui",
    spread: "Cele cinci numere ale tale cad în cinci locuri diferite.",
    spreadNote: "Nimic nu se repetă — nu ai un singur registru, dar nici nu te contrazici pe față",
    chord: (a, b, d) => `Cea mai mare distanță e de ${d} trepte: ${a} și ${b}.`,
  },
  en: {
    gathered: (n) => `Almost everything in your map says ${n}.`,
    gatheredNote: (c) => `${c[0].toUpperCase()}${c.slice(1)} of the five numbers land there`,
    exception: (label, n) => `, and ${label} says otherwise: ${n}`,
    paired: (n) => `Your map leans on ${n}, but it does not repeat much.`,
    pairedNote: "Two numbers land there; the rest each hold their own place",
    spread: "Your five numbers land in five different places.",
    spreadNote: "Nothing repeats — you have no single register, but you do not openly contradict yourself either",
    chord: (a, b, d) => `The widest distance runs between ${a} and ${b}: ${d} steps.`,
  },
  ru: {
    gathered: (n) => `Почти всё в вашей карте говорит ${n}.`,
    gatheredNote: (c) => `${c[0].toUpperCase()}${c.slice(1)} из пяти чисел приходятся туда`,
    exception: (label, n) => `, а ${label} говорит иное: ${n}`,
    paired: (n) => `Ваша карта опирается на ${n}, но повторяется мало.`,
    pairedNote: "Два числа приходятся туда; остальные — каждое на своём месте",
    spread: "Ваши пять чисел приходятся на пять разных мест.",
    spreadNote: "Ничто не повторяется — у вас нет одного регистра, но и явного противоречия тоже нет",
    chord: (a, b, d) => `Наибольшее расстояние — между ${a} и ${b}: ${d} ступеней.`,
  },
};

export function dialThesis(figure: DialFigure, lang: DialLang = "ro"): Thesis {
  const t = COPY[lang] ?? COPY.ro;
  const words = WORDS[lang] ?? WORDS.ro;

  const heaviest = [...figure.points].sort((a, b) => b.weight - a.weight)[0];
  const chord = figure.chord
    ? t.chord(figure.chord.fromLabel, figure.chord.toLabel, figure.chord.distance)
    : "";

  // Grămada. Excepția se numește doar dacă e una singură: „iar Sufletul spune
  // altceva" e adevărat cu un singur alt loc ocupat, și fals cu trei.
  if (heaviest && heaviest.weight >= 3) {
    const others = figure.points.filter((p) => p.n !== heaviest.n);
    const lone = others.length === 1 ? others[0] : null;
    return {
      lead: t.gathered(heaviest.master ?? heaviest.n),
      note:
        t.gatheredNote(words[heaviest.weight] ?? String(heaviest.weight)) +
        (lone ? t.exception(lone.labels[0], lone.master ?? lone.n) : "") +
        ".",
    };
  }

  if (heaviest && heaviest.weight === 2) {
    return {
      lead: t.paired(heaviest.master ?? heaviest.n),
      note: `${t.pairedNote}. ${chord}`.trim(),
    };
  }

  return { lead: t.spread, note: `${t.spreadNote}. ${chord}`.trim() };
}
