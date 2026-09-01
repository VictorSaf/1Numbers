import { fullPythagoreanProfile } from "@/lib/numerology-plus/pythagorean";
import { ARCHETYPES } from "@/lib/numerology-plus/content/archetypes";
import { POSITIONS } from "@/lib/numerology-plus/content/contradiction";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { calculatePersonalDayNumber } from "@/lib/personalCycles";
import { ARCANA_BY_N } from "@/lib/numerology-plus/content/arcana";

/**
 * Ziua, citită prin harta ta.
 *
 * `/azi` calcula ziua personală corect și apoi o descria singură: ziua 5
 * spunea același lucru unui Drum 6 și unui Drum 1. Aia e o efemeridă -- adevărată
 * despre toată lumea, deci despre nimeni -- și se găsește gratis oriunde.
 *
 * Textul NU se scrie pe combinații. 9 zile × 12 numere × 3 limbi ar fi 324 de
 * paragrafe scrise de mână, care ar diverge de arhetipuri în două săptămâni.
 * Se compune din RAPORTUL dintre ziua de azi și pozițiile hărții, exact cum
 * `contradictions()` compune podurile: distanța e conținut, nu o eroare.
 *
 * Trei rapoarte posibile, și toate trei spun ceva:
 *   distanță 0     -- ziua cade pe un număr al tău. Azi nu te lupți cu tine.
 *   distanță 1-2   -- o variație pe tema ta. Recognoscibil, nu identic.
 *   distanță >= 4  -- ziua cere invers decât ești. Aici se rupe o zi.
 */

export type TodayLang = "ro" | "en" | "ru";

export interface TodayRelation {
  kind: "resonance" | "echo" | "friction";
  /** Care poziție din hartă întâlnește ziua. */
  position: string;
  /** Cifra poziției. */
  value: number;
  /** Cifra zilei, ca aserțiunile să poată compara fără să recalculeze. */
  dayValue: number;
  distance: number;
  text: string;
}

/**
 * Tonul zilei, din care se scoate și cum arată pagina.
 *
 * Nu e o decorație aleasă separat: iese din aceleași relații care compun
 * textul. O zi care rezonează cu harta ta chiar e altă zi decât una care trage
 * împotriva ei, iar pagina n-are de ce s-o spună doar în cuvinte.
 */
export type DayMood = "bright" | "even" | "charged";

/**
 * Cartea zilei.
 *
 * Corespondența numerologie–tarot e directă și veche: cifra zilei e numărul
 * arcanei. Ziua 3 e Împărăteasa, ziua 16 ar fi Turnul. Nu se trage nimic la
 * întâmplare -- o carte trasă aleator n-ar avea nicio legătură cu harta ta,
 * iar aici tocmai legătura e produsul.
 *
 * Cele 22 de arcane existau deja în motor, cu lumină și umbră în trei limbi,
 * folosite doar de matricea destinului.
 */
export interface DayCard {
  n: number;
  title: string;
  keywords: string[];
  /** Ce aduce cartea când ziua merge. */
  light: string;
  /** Ce aduce când se strică. */
  shadow: string;
}

export interface TodayReading {
  /** Ziua personală -- a ta, nu a calendarului. */
  day: number;
  date: Date;
  title: string;
  keywords: string[];
  /** Ce cere ziua, ca propoziție. */
  say: string;
  /** Cel mult două: ce rezonează, ce se freacă. */
  relations: TodayRelation[];
  /** Întrebarea. O zi care nu întreabă nimic e un difuzor. */
  ask: string;
  /** De unde vine cifra, pentru cine n-a auzit de ea. */
  plain: string;
  /** Cum se simte ziua, pentru text și pentru cum arată pagina. */
  mood: DayMood;
  /** Arcana cu numărul zilei. */
  card: DayCard;
}

const archetype = (n: number) => ARCHETYPES.find((a) => a.n === n) ?? ARCHETYPES[0];

const JOIN: Record<TodayLang, {
  asks: (essence: string) => string;
  resonance: (position: string, n: number) => string;
  echo: (position: string, n: number, essence: string) => string;
  friction: (position: string, n: number, essence: string) => string;
  /* Întrebările își cară singure contextul. Apar sub o linie de separare, la
   * distanță de text, deci „care dintre cele două a câștigat?" nu are cum să
   * fie înțeles: cele două n-au fost numite niciodată acolo unde se citește. */
  askResonance: (position: string, n: number) => string;
  askEcho: (position: string, n: number, day: number) => string;
  askFriction: (position: string, n: number, day: number) => string;
  askNone: (day: number) => string;
  plain: string;
}> = {
  ro: {
    asks: (e) => `Ziua asta cere ${e}.`,
    resonance: (p, n) =>
      `${p} e tot ${n}. Azi nu te lupți cu tine: ziua merge în direcția în care ești oricum întors.`,
    echo: (p, n, e) =>
      `${p} e ${n} — ${e}. Ziua nu cere exact asta, dar cere ceva din aceeași familie.`,
    friction: (p, n, e) =>
      `${p} e ${n}: ${e}. Ziua trage în partea cealaltă, și de-aia o zi ca asta obosește fără motiv vizibil.`,
    askResonance: (p, n) => `${p} e ${n}, și ziua de azi tot ${n}. Unde s-a văzut asta azi?`,
    askEcho: (p, n, d) => `${p} e ${n}, ziua e ${d}. Ce a ieșit din asta azi?`,
    askFriction: (p, n, d) => `${p} e ${n}, ziua cere ${d}. Care dintre ele a câștigat azi?`,
    askNone: (d) => `Ziua a fost ${d}. Ce ți-a cerut, de fapt?`,
    plain:
      "Ziua personală iese din ziua și luna nașterii tale adunate cu data de azi, reduse la o cifră. Se schimbă zilnic — de-aia e a ta, nu a calendarului.",
  },
  en: {
    asks: (e) => `Today asks for ${e}.`,
    resonance: (p, n) =>
      `${p} is ${n} too. Today you are not fighting yourself: the day runs the way you already face.`,
    echo: (p, n, e) =>
      `${p} is ${n} — ${e}. The day does not ask for exactly that, but for something in the same family.`,
    friction: (p, n, e) =>
      `${p} is ${n}: ${e}. The day pulls the other way, which is why a day like this tires you for no visible reason.`,
    askResonance: (p, n) => `${p} is ${n}, and so is today. Where did that show today?`,
    askEcho: (p, n, d) => `${p} is ${n}, today is ${d}. What came of that today?`,
    askFriction: (p, n, d) => `${p} is ${n}, today asks for ${d}. Which of them won today?`,
    askNone: (d) => `Today was ${d}. What did it actually ask of you?`,
    plain:
      "Your personal day comes from your birth day and month added to today's date, reduced to one figure. It changes daily — that is what makes it yours, not the calendar's.",
  },
  ru: {
    asks: (e) => `Этот день требует ${e}.`,
    resonance: (p, n) =>
      `${p} — тоже ${n}. Сегодня вы не боретесь с собой: день идёт туда, куда вы и так повёрнуты.`,
    echo: (p, n, e) =>
      `${p} — ${n}: ${e}. День требует не совсем этого, но чего-то из той же семьи.`,
    friction: (p, n, e) =>
      `${p} — ${n}: ${e}. День тянет в другую сторону, поэтому такой день утомляет без видимой причины.`,
    askResonance: (p, n) => `${p} — ${n}, и сегодняшний день тоже ${n}. Где это проявилось сегодня?`,
    askEcho: (p, n, d) => `${p} — ${n}, день — ${d}. Что из этого вышло сегодня?`,
    askFriction: (p, n, d) => `${p} — ${n}, день требует ${d}. Что из них победило сегодня?`,
    askNone: (d) => `День был ${d}. Чего он на самом деле от вас потребовал?`,
    plain:
      "Личный день складывается из дня и месяца вашего рождения и сегодняшней даты, сведённых к одной цифре. Он меняется каждый день — поэтому он ваш, а не календарный.",
  },
};

/** Rezonanța se caută în ordinea asta: ce vrei, unde mergi, ce faci, cum arăți. */
const ORDER = ["soulUrge", "lifePath", "expression", "personality"] as const;

export function buildToday(
  fullName: string,
  birthDate: Date,
  lang: TodayLang = "ro",
  today: Date = new Date(),
): TodayReading {
  const join = JOIN[lang];
  const profile = fullPythagoreanProfile(fullName, toBirthDate(birthDate), today);
  const day = calculatePersonalDayNumber(birthDate, today);
  const dayArch = archetype(day);

  const spread = ORDER.map((position) => {
    const value = profile.core[position].value;
    return { position, value, distance: Math.abs(value - day) };
  });

  // Cel mai apropiat și cel mai depărtat. Restul ar face din zi tot un depozit.
  const closest = [...spread].sort((a, b) => a.distance - b.distance)[0];
  const farthest = [...spread].sort((a, b) => b.distance - a.distance)[0];

  const relations: TodayRelation[] = [];
  const name = (p: string) => POSITIONS[p][lang];

  if (closest.distance === 0) {
    relations.push({
      kind: "resonance",
      position: name(closest.position),
      value: closest.value,
      dayValue: day,
      distance: 0,
      text: join.resonance(name(closest.position), closest.value),
    });
  } else if (closest.distance <= 2) {
    relations.push({
      kind: "echo",
      position: name(closest.position),
      value: closest.value,
      dayValue: day,
      distance: closest.distance,
      text: join.echo(name(closest.position), closest.value, archetype(closest.value).essence[lang]),
    });
  }

  // Ziua trebuie să spună ceva despre TINE, în fiecare zi. O zi fără nicio
  // relație e exact efemerida de la care am plecat -- deci dacă nimic nu
  // rezonează, distanța cea mai mare devine ea însăși ce e de spus.
  const needsFar = farthest.distance >= 4 || relations.length === 0;

  if (needsFar && farthest.position !== closest.position) {
    relations.push({
      kind: "friction",
      position: name(farthest.position),
      value: farthest.value,
      dayValue: day,
      distance: farthest.distance,
      text: join.friction(
        name(farthest.position),
        farthest.value,
        archetype(farthest.value).essence[lang],
      ),
    });
  }

  // Întrebarea urmează cel mai tare raport: fricțiunea, dacă există, fiindcă
  // ea e ce se simte peste zi.
  const lead = relations.find((r) => r.kind === "friction") ?? relations[0];
  const ask = !lead
    ? join.askNone(day)
    : lead.kind === "friction"
      ? join.askFriction(lead.position, lead.value, day)
      : lead.kind === "resonance"
        ? join.askResonance(lead.position, lead.value)
        : join.askEcho(lead.position, lead.value, day);

  /**
   * Tonul iese din relația cea mai tare, nu dintr-o listă separată: o zi care
   * cade pe un număr al tău chiar e altfel decât una care trage împotriva lui.
   */
  const mood: DayMood = relations.some((r) => r.kind === "friction")
    ? "charged"
    : relations.some((r) => r.kind === "resonance")
      ? "bright"
      : "even";

  const arcana = ARCANA_BY_N[day] ?? ARCANA_BY_N[1];
  const card: DayCard = {
    n: arcana.n,
    title: arcana.title[lang],
    keywords: arcana.keywords[lang],
    light: arcana.light[lang],
    shadow: arcana.shadow[lang],
  };

  return {
    day,
    date: today,
    title: dayArch.title[lang],
    keywords: dayArch.keywords[lang],
    say: join.asks(dayArch.essence[lang]),
    relations,
    ask,
    plain: join.plain,
    mood,
    card,
  };
}
