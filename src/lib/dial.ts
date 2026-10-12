import { fullPythagoreanProfile } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { reduceToSingleDigit } from "@/lib/numerology";
import { findDisagreements, type DisagreementLang } from "@/lib/disagreements";

/**
 * Harta așezată pe cele nouă cifre.
 *
 * Pagina spunea harta în propoziții și în tabele; nimic nu arăta forma ei. Din
 * patru cifre scrise una lângă alta nu se vede că trei dintre ele cad în același
 * loc și a patra e de partea cealaltă a cadranului -- se vede abia când sunt
 * puse pe un cerc.
 *
 * Figura asta apare de trei ori în citire: mare în frontispiciu, mică în
 * capitolul 2 (unde coarda e chiar subiectul) și în capitolul 3 (unde subiectul
 * sunt golurile). De-aia datele ei se calculează aici, o dată, în loc să fie
 * desenate de mână în fiecare loc: un cadran care se contrazice cu textul de
 * lângă el ar fi mai rău decât niciun cadran.
 */

export type DialLang = DisagreementLang;

/** Un loc ocupat de pe inel. */
export interface DialPoint {
  /** Poziția pe inel, 1..9. Un maestru stă pe cifra lui redusă. */
  n: number;
  /** Câte dintre numerele de bază cad aici. Punctul crește cu ea. */
  weight: number;
  labels: string[];
  /** Numele scurte, pentru sub punct: patru „Drumul Vieții" nu încap pe un inel. */
  short: string[];
  /** 11, 22 sau 33 dacă vreunul dintre ele e maestru; altfel null. */
  master: number | null;
}

/** Puntea desenată peste cadran. Lungimea coardei E distanța. */
export interface DialChord {
  from: number;
  to: number;
  distance: number;
  fromLabel: string;
  toLabel: string;
}

export interface DialFigure {
  points: DialPoint[];
  /** Cifrele care lipsesc și din nume, și din dată. Se desenează ca inele goale. */
  missing: number[];
  chord: DialChord | null;
}

const COPY: Record<DialLang, Record<string, { long: string; short: string }>> = {
  ro: {
    lifePath: { long: "Drumul Vieții", short: "DRUM" },
    destiny: { long: "Destinul", short: "DESTIN" },
    soul: { long: "Sufletul", short: "SUFLET" },
    personality: { long: "Personalitatea", short: "CHIP" },
    year: { long: "Anul personal", short: "AN" },
  },
  en: {
    lifePath: { long: "Life Path", short: "PATH" },
    destiny: { long: "Destiny", short: "DESTINY" },
    soul: { long: "Soul Urge", short: "SOUL" },
    personality: { long: "Personality", short: "FACE" },
    year: { long: "Personal Year", short: "YEAR" },
  },
  ru: {
    lifePath: { long: "Число жизненного пути", short: "ПУТЬ" },
    destiny: { long: "Число судьбы", short: "СУДЬБА" },
    soul: { long: "Число души", short: "ДУША" },
    personality: { long: "Число личности", short: "ЛИК" },
    year: { long: "Личный год", short: "ГОД" },
  },
};

/**
 * Locul cifrei pe cercul unitate, cu 1 în vârf.
 *
 * Componenta scalează; aici stă doar unghiul, ca poziția să fie aceeași în
 * toate cele trei mărimi ale figurii. 360/9 = 40° între vecini.
 */
export const dialPosition = (n: number): { x: number; y: number } => {
  const angle = ((-90 + (n - 1) * 40) * Math.PI) / 180;
  return { x: Math.cos(angle), y: Math.sin(angle) };
};

/** Unde stă un număr pe inel. Un maestru nu are loc propriu, deci se reduce. */
const seat = (value: number): number => (value > 9 ? reduceToSingleDigit(value, false) : value);

export function buildDial(
  fullName: string,
  birthDate: Date,
  lang: DialLang = "ro",
  today: Date = new Date(),
): DialFigure {
  const t = COPY[lang] ?? COPY.ro;
  const p = fullPythagoreanProfile(fullName, toBirthDate(birthDate), today);

  const placed = [
    { value: p.core.lifePath.value, ...t.lifePath },
    { value: p.core.expression.value, ...t.destiny },
    { value: p.core.soulUrge.value, ...t.soul },
    { value: p.core.personality.value, ...t.personality },
    { value: p.cycles.personalYear.value, ...t.year },
  ];

  const bySeat = new Map<number, DialPoint>();
  for (const { value, long, short } of placed) {
    const n = seat(value);
    const point = bySeat.get(n) ?? { n, weight: 0, labels: [], short: [], master: null };
    point.weight += 1;
    point.labels.push(long);
    point.short.push(short);
    // Un singur maestru se reține pe loc: două pe aceeași cifră ar fi 11 și 22
    // reduse amândouă la 2, iar figura n-are unde să scrie două valori.
    if (value > 9 && point.master === null) point.master = value;
    bySeat.set(n, point);
  }

  const b = p.extended.bridges;
  const widest =
    b.soulUrgePersonality >= b.lifePathExpression
      ? {
          distance: b.soulUrgePersonality,
          from: seat(p.core.soulUrge.value), to: seat(p.core.personality.value),
          fromLabel: t.soul.long, toLabel: t.personality.long,
        }
      : {
          distance: b.lifePathExpression,
          from: seat(p.core.lifePath.value), to: seat(p.core.expression.value),
          fromLabel: t.lifePath.long, toLabel: t.destiny.long,
        };

  return {
    points: [...bySeat.values()].sort((a, z) => a.n - z.n),
    missing: findDisagreements(fullName, birthDate, lang, today).missing.both,
    // O coardă de lungime zero ar fi un punct desenat peste un punct.
    chord: widest.distance > 0 ? widest : null,
  };
}
