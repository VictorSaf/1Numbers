import { compatibility, type RelationshipType } from "@/lib/numerology-plus/applied";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { mulank, VEDIC_RELATIONS } from "@/lib/numerology-plus/systems";

/**
 * Unde cele două hărți se judecă de două ori.
 *
 * Pagina de compatibilitate arăta un procent și componentele lui. Dar procentul
 * e o medie ponderată -- Drumul 50%, Destinul 30%, Sufletul 20% -- iar o medie
 * ascunde exact ce e interesant: două perechi cu același 72% pot fi una
 * echilibrată pe toate liniile și alta ruptă în două, cu 95 pe una și 30 pe
 * alta. Aceeași cifră, două relații complet diferite.
 *
 * Peste asta, tradiția vedică judecă aceeași pereche prin alt criteriu: nu un
 * scor, ci prietenie, neutralitate sau dușmănie între planetele zilelor de
 * naștere. Poate spune „dușmani” acolo unde matricea pitagoreică dă 80.
 *
 * Nimic de aici nu împacă nimic, la fel ca la harta unui singur om: nu se fac
 * medii între tradiții și nu se alege un câștigător. Când două judecăți
 * corecte diferă, diferența e informația.
 */

export type CoupleLang = "ro" | "en" | "ru";
export type Agreement = "aligned" | "mixed" | "split";

export interface SpreadPart {
  label: string;
  score: number;
}

export interface Spread {
  /** Media ponderată, adică cifra pe care o vede toată lumea. */
  score: number;
  parts: SpreadPart[];
  /** Cea mai mare minus cea mai mică. Ce ascunde media. */
  range: number;
  best: SpreadPart;
  worst: SpreadPart;
  agreement: Agreement;
  says: string;
}

export interface TraditionVerdict {
  question: string;
  /** Pitagoreic: un procent. */
  pythagorean: { label: string; score: number; reads: string };
  /** Vedic: o relație între planete, nu un scor. */
  vedic: { label: string; relation: "friends" | "neutral" | "enemies"; reads: string };
  agree: boolean;
  says: string;
}

export interface CoupleDisagreements {
  spread: Spread;
  traditions: TraditionVerdict;
}

const COPY: Record<CoupleLang, {
  parts: Record<string, string>;
  spreadTitle: string;
  aligned: (r: number) => string;
  mixed: (best: string, worst: string, r: number) => string;
  split: (best: string, bs: number, worst: string, ws: number, r: number) => string;
  traditionQuestion: string;
  pythLabel: string;
  vedicLabel: string;
  pythReads: (s: number) => string;
  vedicReads: Record<string, string>;
  bothWarm: string;
  bothCool: string;
  disagreeWarmCool: string;
  disagreeCoolWarm: string;
}> = {
  ro: {
    parts: { lifePath: "Drumul Vieții", expression: "Destinul", soulUrge: "Sufletul", personality: "Personalitatea" },
    spreadTitle: "Ce ascunde procentul",
    aligned: (r) => `Cele patru linii sunt strânse — între cea mai bună și cea mai slabă sunt ${r} puncte. Procentul spune adevărul despre toate.`,
    mixed: (b, w, r) => `Între ${b} și ${w} sunt ${r} puncte. Procentul e o medie peste lucruri care nu seamănă: o parte a relației merge singură, alta cere lucru.`,
    split: (b, bs, w, ws, r) => `Relația e ruptă în două: ${b} stă la ${bs}, iar ${w} la ${ws} — ${r} puncte între ele. Procentul de deasupra nu descrie nici una dintre cele două, ci un loc în care nu se află nimeni.`,
    traditionQuestion: "Vă potriviți?",
    pythLabel: "Matricea pitagoreică",
    vedicLabel: "Relația vedică",
    pythReads: (s) => `${s} din 100, pe Drumurile Vieții`,
    vedicReads: {
      friends: "planete prietene",
      neutral: "planete neutre",
      enemies: "planete în dușmănie",
    },
    bothWarm: "Amândouă tradițiile spun același lucru: aici e ușor. Când două sisteme construite separat cad de acord, afirmația cântărește mai mult decât fiecare în parte.",
    bothCool: "Amândouă tradițiile văd frecare. Nu înseamnă că nu merge — înseamnă că merge cu lucru, și că nimeni nu vă va spune contrariul.",
    disagreeWarmCool: "Pitagoreicul vede potrivire, vedicul vede dușmănie. Se citesc din lucruri diferite: unul din cifra întregii date, celălalt din ziua nașterii și planeta ei. Niciunul nu e greșit, dar înseamnă că ce merge ușor la nivelul direcției poate scârțâi la nivelul reflexului zilnic.",
    disagreeCoolWarm: "Vedicul vede prietenie acolo unde pitagoreicul vede distanță. Reflexele zilnice se potrivesc mai bine decât direcțiile de viață — adică vă înțelegeți ușor de la o zi la alta și greu când vine vorba încotro mergeți.",
  },
  en: {
    parts: { lifePath: "Life Path", expression: "Expression", soulUrge: "Soul Urge", personality: "Personality" },
    spreadTitle: "What the percentage hides",
    aligned: (r) => `The four lines sit close together — ${r} points between the best and the weakest. The percentage tells the truth about all of them.`,
    mixed: (b, w, r) => `${r} points between ${b} and ${w}. The percentage is an average over things that do not resemble each other: one part of the relationship runs itself, another asks for work.`,
    split: (b, bs, w, ws, r) => `The relationship is split in two: ${b} sits at ${bs} while ${w} sits at ${ws} — ${r} points apart. The percentage above describes neither, only a place where nobody stands.`,
    traditionQuestion: "Do you fit?",
    pythLabel: "The Pythagorean matrix",
    vedicLabel: "The Vedic relation",
    pythReads: (s) => `${s} out of 100, on the Life Paths`,
    vedicReads: { friends: "friendly planets", neutral: "neutral planets", enemies: "planets in enmity" },
    bothWarm: "Both traditions say the same thing: this part is easy. When two systems built separately agree, the claim weighs more than either alone.",
    bothCool: "Both traditions see friction. It does not mean it fails — it means it works with effort, and nobody will tell you otherwise.",
    disagreeWarmCool: "The Pythagorean sees a fit, the Vedic sees enmity. They read from different things: one from the whole date reduced, the other from the birth day and its planet. Neither is wrong, but it means what runs easily at the level of direction can grind at the level of daily reflex.",
    disagreeCoolWarm: "The Vedic sees friendship where the Pythagorean sees distance. Daily reflexes match better than life directions — you get along easily day to day, and less easily about where you are going.",
  },
  ru: {
    parts: { lifePath: "Жизненный путь", expression: "Судьба", soulUrge: "Душа", personality: "Личность" },
    spreadTitle: "Что скрывает процент",
    aligned: (r) => `Четыре линии близки — между лучшей и слабейшей ${r} пунктов. Процент говорит правду обо всех.`,
    mixed: (b, w, r) => `${r} пунктов между «${b}» и «${w}». Процент — среднее по несхожим вещам.`,
    split: (b, bs, w, ws, r) => `Отношения расколоты: «${b}» — ${bs}, «${w}» — ${ws}, разрыв ${r}. Процент сверху не описывает ни одно из них.`,
    traditionQuestion: "Подходите ли вы друг другу?",
    pythLabel: "Пифагорейская матрица",
    vedicLabel: "Ведическое отношение",
    pythReads: (s) => `${s} из 100, по Жизненным путям`,
    vedicReads: { friends: "дружественные планеты", neutral: "нейтральные планеты", enemies: "враждующие планеты" },
    bothWarm: "Обе традиции говорят одно: здесь легко. Когда две отдельно построенные системы совпадают, утверждение весит больше.",
    bothCool: "Обе традиции видят трение. Это не значит «не выйдет» — значит, выйдет с работой.",
    disagreeWarmCool: "Пифагорейская видит совпадение, ведическая — вражду. Они читаются из разного: одна из всей даты, другая из дня рождения и его планеты. Ни одна не ошибается.",
    disagreeCoolWarm: "Ведическая видит дружбу там, где пифагорейская видит дистанцию. Ежедневные рефлексы сходятся лучше, чем жизненные направления.",
  },
};

/** Peste 70 e cald în ambele tradiții; sub, e rece. Pragul e al benzii „bun”. */
const WARM = 70;

export function findCoupleDisagreements(
  a: { name: string; birthDate: Date },
  b: { name: string; birthDate: Date },
  lang: CoupleLang = "ro",
  type: RelationshipType = "romantic",
): CoupleDisagreements {
  const t = COPY[lang];
  const ba = toBirthDate(a.birthDate);
  const bb = toBirthDate(b.birthDate);
  const c = compatibility({ name: a.name, birth: ba }, { name: b.name, birth: bb }, type);

  // ── Ce ascunde media ────────────────────────────────────────────────
  const parts: SpreadPart[] = Object.entries(c.parts).map(([k, score]) => ({
    label: t.parts[k] ?? k,
    score: Math.round(score as number),
  }));
  const sorted = [...parts].sort((x, y) => y.score - x.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const range = best.score - worst.score;

  /**
   * Pragurile: sub 15 puncte, media chiar descrie toate liniile. Peste 35,
   * relația are două regimuri diferite și media nu descrie niciunul -- e un
   * punct în care nu se află nimeni.
   */
  const agreement: Agreement = range < 15 ? "aligned" : range < 35 ? "mixed" : "split";

  const spread: Spread = {
    score: c.score,
    parts,
    range,
    best,
    worst,
    agreement,
    says:
      agreement === "aligned"
        ? t.aligned(range)
        : agreement === "mixed"
          ? t.mixed(best.label, worst.label, range)
          : t.split(best.label, best.score, worst.label, worst.score, range),
  };

  // ── Două tradiții, aceeași pereche ──────────────────────────────────
  const pythScore = Math.round(c.parts.lifePath);
  const ma = mulank(ba);
  const mb = mulank(bb);
  const rel = VEDIC_RELATIONS[ma];
  const relation: TraditionVerdict["vedic"]["relation"] = rel?.friends.includes(mb)
    ? "friends"
    : rel?.enemies.includes(mb)
      ? "enemies"
      : "neutral";

  const pythWarm = pythScore >= WARM;
  const vedicWarm = relation === "friends";
  const agree = pythWarm === vedicWarm;

  const traditions: TraditionVerdict = {
    question: t.traditionQuestion,
    pythagorean: { label: t.pythLabel, score: pythScore, reads: t.pythReads(pythScore) },
    vedic: {
      label: t.vedicLabel,
      relation,
      reads: `${ma} ↔ ${mb} — ${t.vedicReads[relation]}`,
    },
    agree,
    says: agree
      ? pythWarm
        ? t.bothWarm
        : t.bothCool
      : pythWarm
        ? t.disagreeWarmCool
        : t.disagreeCoolWarm,
  };

  return { spread, traditions };
}
