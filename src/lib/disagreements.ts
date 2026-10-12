import { fullPythagoreanProfile } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { bhagyank, naamank } from "@/lib/numerology-plus/systems";
import { ARCHETYPES } from "@/lib/numerology-plus/content/archetypes";
import { generateLoShuGrid } from "@/lib/loShuGrid";

/**
 * Locurile unde harta se răspunde singură de două ori.
 *
 * Motorul calculează același lucru pe mai multe căi -- iar căile nu sunt de
 * acord întotdeauna. Până acum fiecare răspuns stătea în colțul lui, iar
 * dezacordul nu era nicăieri: cititorul vedea un an personal de 1 într-un
 * capitol și o esență de 9 în altul, fără nimic care să-i spună că cele două
 * vorbesc despre același an.
 *
 * Dezacordul NU e o eroare de calcul. Fiecare cale e corectă în sistemul ei --
 * ce diferă e din ce se citește: din dată sau din nume, prin alfabetul
 * pitagoreic sau prin cel caldeean, cu componentele reduse separat sau
 * împreună. Când două căi corecte dau răspunsuri diferite, diferența e chiar
 * informația, exact ca la podurile din hartă.
 *
 * De aceea nimic de aici nu „rezolvă” contradicția și nu face medii. O medie
 * între un 1 pitagoreic și un 5 caldeean n-ar însemna nimic: sunt două lecturi
 * ale aceluiași nume prin alfabete formate în locuri diferite.
 */

export type DisagreementLang = "ro" | "en" | "ru";

/** Cât de departe sunt două răspunsuri unul de altul. */
export type Verdict = "agree" | "near" | "apart";

export interface Side {
  /** Cum se numește calea. */
  label: string;
  /** Din ce se citește: data, numele, sau amândouă. */
  from: string;
  value: number;
  /** Ce înseamnă cifra, din arhetipul ei. */
  essence: string;
}

export interface Disagreement {
  key: string;
  /** Întrebarea la care răspund amândouă. */
  question: string;
  a: Side;
  b: Side;
  /** |a − b|, redusă la 0-8 ca la poduri. */
  distance: number;
  verdict: Verdict;
  /** Ce înseamnă distanța asta, spus. */
  says: string;
}

/** Perechea de absențe se compară ca mulțimi, nu ca numere. */
export interface MissingComparison {
  key: "missing";
  question: string;
  fromName: number[];
  fromDate: number[];
  /** Lipsesc din amândouă: semnalul cel mai tare din hartă. */
  both: number[];
  says: string;
}

export interface Disagreements {
  pairs: Disagreement[];
  missing: MissingComparison | null;
}

const archetype = (n: number) => ARCHETYPES.find((a) => a.n === n) ?? ARCHETYPES[0];

const COPY: Record<DisagreementLang, {
  questions: Record<string, string>;
  labels: Record<string, string>;
  from: Record<string, string>;
  agree: (q: string, n: number) => string;
  near: (d: number) => string;
  apart: (d: number) => string;
  missingBoth: (list: string) => string;
  missingOne: () => string;
  missingNone: () => string;
}> = {
  ro: {
    questions: {
      year: "Despre ce e anul ăsta?",
      path: "Ce direcție are viața ta?",
      destiny: "Ce ai de făcut cu ce ți s-a dat?",
      seen: "Cum te văd oamenii?",
      missing: "Ce îți lipsește?",
    },
    labels: {
      personalYear: "Anul personal",
      essence: "Esența anului",
      lifePath: "Drumul Vieții",
      bhagyank: "Bhagyank (vedic)",
      expression: "Destinul (pitagoreic)",
      naamank: "Naamank (caldeean)",
      personality: "Personalitatea",
      attitude: "Atitudinea",
    },
    from: {
      date: "din data nașterii",
      name: "din nume",
      dateNested: "din dată, componente reduse separat",
      dateFlat: "din dată, toate cifrele adunate deodată",
      pyth: "din nume, alfabetul pitagoreic 1–9",
      chald: "din nume, alfabetul caldeean 1–8",
      consonants: "din consoanele numelui",
      monthDay: "din lună și zi",
      letters: "din literele active la vârsta ta",
    },
    agree: (q, n) => `Amândouă căile dau ${n}. Rar, și înseamnă că nu ai de împăcat nimic aici: ${q.toLowerCase().replace("?", "")} primește un singur răspuns.`,
    near: (d) => `Distanță de ${d}. Aceeași temă, spusă din două unghiuri — recognoscibil, nu identic.`,
    apart: (d) => `Distanță de ${d}. Cele două căi trag în direcții diferite, iar tensiunea asta e chiar ce ai de dus. Niciuna nu e greșită; se citesc din lucruri diferite.`,
    missingBoth: (l) => `Lipsesc din amândouă: ${l}. Cel mai tare semnal din hartă — nici numele, nici data nu le susțin.`,
    missingOne: () => "Nicio cifră nu lipsește din amândouă. Ce lipsește dintr-o parte e susținut de cealaltă.",
    missingNone: () => "Nu lipsește nimic din nicio parte.",
  },
  en: {
    questions: {
      year: "What is this year about?",
      path: "What direction does your life have?",
      destiny: "What are you to do with what you were given?",
      seen: "How do people see you?",
      missing: "What are you missing?",
    },
    labels: {
      personalYear: "Personal Year",
      essence: "Essence of the year",
      lifePath: "Life Path",
      bhagyank: "Bhagyank (Vedic)",
      expression: "Expression (Pythagorean)",
      naamank: "Naamank (Chaldean)",
      personality: "Personality",
      attitude: "Attitude",
    },
    from: {
      date: "from your birth date",
      name: "from your name",
      dateNested: "from the date, parts reduced separately",
      dateFlat: "from the date, all digits added at once",
      pyth: "from the name, Pythagorean alphabet 1–9",
      chald: "from the name, Chaldean alphabet 1–8",
      consonants: "from the consonants of your name",
      monthDay: "from month and day",
      letters: "from the letters active at your age",
    },
    agree: (q, n) => `Both paths give ${n}. Rare, and it means there is nothing to reconcile here: ${q.toLowerCase().replace("?", "")} gets a single answer.`,
    near: (d) => `A distance of ${d}. The same theme from two angles — recognisable, not identical.`,
    apart: (d) => `A distance of ${d}. The two paths pull in different directions, and that tension is exactly what you carry. Neither is wrong; they read from different things.`,
    missingBoth: (l) => `Missing from both: ${l}. The strongest signal in the map — neither your name nor your date supports them.`,
    missingOne: () => "No figure is missing from both. What one side lacks, the other supports.",
    missingNone: () => "Nothing is missing from either side.",
  },
  ru: {
    questions: {
      year: "О чём этот год?",
      path: "Какое направление у вашей жизни?",
      destiny: "Что делать с тем, что вам дано?",
      seen: "Каким вас видят люди?",
      missing: "Чего вам не хватает?",
    },
    labels: {
      personalYear: "Личный год",
      essence: "Сущность года",
      lifePath: "Жизненный путь",
      bhagyank: "Бхагьянк (ведич.)",
      expression: "Судьба (пифагор.)",
      naamank: "Наамank (халдейск.)",
      personality: "Личность",
      attitude: "Отношение",
    },
    from: {
      date: "из даты рождения",
      name: "из имени",
      dateNested: "из даты, части сведены отдельно",
      dateFlat: "из даты, все цифры сложены сразу",
      pyth: "из имени, пифагорейский алфавит 1–9",
      chald: "из имени, халдейский алфавит 1–8",
      consonants: "из согласных имени",
      monthDay: "из месяца и дня",
      letters: "из букв,活 в вашем возрасте",
    },
    agree: (q, n) => `Оба пути дают ${n}. Редкость: примирять здесь нечего.`,
    near: (d) => `Расстояние ${d}. Одна тема с двух сторон — узнаваемо, но не одно и то же.`,
    apart: (d) => `Расстояние ${d}. Пути тянут в разные стороны, и это напряжение — то, что вы несёте. Ни один не ошибочен; они читаются из разного.`,
    missingBoth: (l) => `Нет ни там, ни там: ${l}. Самый сильный сигнал карты.`,
    missingOne: () => "Ни одна цифра не отсутствует с обеих сторон.",
    missingNone: () => "Ничего не отсутствует.",
  },
};

const verdictOf = (d: number): Verdict => (d === 0 ? "agree" : d <= 2 ? "near" : "apart");

/**
 * Perechile în care motorul răspunde de două ori la aceeași întrebare.
 *
 * Fiecare e o alegere, nu o generare: două numere care se întâmplă să existe
 * nu formează o pereche. Trebuie să răspundă la aceeași întrebare pe căi
 * diferite -- altfel comparația e o coincidență aritmetică.
 */
export function findDisagreements(
  fullName: string,
  birthDate: Date,
  lang: DisagreementLang = "ro",
  today: Date = new Date(),
): Disagreements {
  const t = COPY[lang];
  const b = toBirthDate(birthDate);
  const p = fullPythagoreanProfile(fullName, b, today);

  const side = (labelKey: string, fromKey: string, value: number): Side => ({
    label: t.labels[labelKey],
    from: t.from[fromKey],
    value,
    essence: archetype(value).essence[lang],
  });

  const pair = (key: string, questionKey: string, a: Side, bSide: Side): Disagreement => {
    const distance = Math.abs(a.value - bSide.value);
    const verdict = verdictOf(distance);
    const question = t.questions[questionKey];
    return {
      key,
      question,
      a,
      b: bSide,
      distance,
      verdict,
      says:
        verdict === "agree"
          ? t.agree(question, a.value)
          : verdict === "near"
            ? t.near(distance)
            : t.apart(distance),
    };
  };

  const pairs: Disagreement[] = [
    // Două ceasuri diferite: unul se schimbă la aniversare, celălalt când se
    // termină o literă din nume. Pot să nu fie de acord, iar dezacordul lor
    // descrie exact senzația de a porni ceva în timp ce altceva se termină.
    pair(
      "year",
      "year",
      side("personalYear", "date", p.cycles.personalYear.value),
      side("essence", "letters", p.transits.essence.value),
    ),

    // Aceeași dată, două ordini de reducere. Pitagoreicul reduce luna, ziua și
    // anul separat înainte să adune; vedicul adună toate cifrele deodată.
    pair(
      "path",
      "path",
      side("lifePath", "dateNested", p.core.lifePath.value),
      side("bhagyank", "dateFlat", bhagyank(b)),
    ),

    // Același nume, două alfabete. Caldeeanul n-are 9 -- e considerat sacru --
    // și grupează literele după sunet, nu după ordinea alfabetului.
    pair(
      "destiny",
      "destiny",
      side("expression", "pyth", p.core.expression.value),
      side("naamank", "chald", naamank(fullName).root),
    ),

    // Cea mai interesantă: una vine din nume, cealaltă din dată, și amândouă
    // pretind că descriu ce ajunge la celălalt înainte să apuci să explici.
    pair(
      "seen",
      "seen",
      side("personality", "consonants", p.core.personality.value),
      side("attitude", "monthDay", p.extended.attitude.value),
    ),
  ];

  // Absențele se compară ca mulțimi: lecțiile karmice numără cifrele care
  // lipsesc din NUME, Lo Shu pe cele care lipsesc din DATĂ. Aceeași întrebare,
  // două surse -- iar ce lipsește din amândouă n-are de nicăieri sprijin.
  const fromName = [...p.extended.karmicLessons].sort((x, y) => x - y);
  const fromDate = [...generateLoShuGrid(birthDate).missingNumbers].sort((x, y) => x - y);
  const both = fromName.filter((n) => fromDate.includes(n));

  const missing: MissingComparison = {
    key: "missing",
    question: t.questions.missing,
    fromName,
    fromDate,
    both,
    says:
      both.length > 0
        ? t.missingBoth(both.join(", "))
        : fromName.length || fromDate.length
          ? t.missingOne()
          : t.missingNone(),
  };

  return { pairs, missing };
}
