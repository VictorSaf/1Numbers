import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { vedicProfile } from "@/lib/numerology-plus/systems";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * Ank Jyotish: the three Vedic numbers, their Navagraha planets, and how the
 * three of them get on with each other.
 *
 * The engine computed all of this from the day it landed and none of it ever
 * reached a screen -- vedicProfile had no caller outside src/lib/numerology-plus.
 *
 * Two things this block has to be honest about:
 *
 * 1. Bhagyank is a flat digit sum of the whole date; the Pythagorean Life Path
 *    reduces day, month and year separately and only then adds. The two
 *    disagree often, and a reader who sees 2 here and 11 in chapter 1 is owed
 *    the reason rather than a contradiction.
 * 2. NAVAGRAHA in the engine is Romanian-only, and the engine is read-only, so
 *    the planet names live here in all three languages. PLANETS is pinned to
 *    NAVAGRAHA by its Sanskrit name in the test, so a drift fails the suite
 *    instead of quietly showing the wrong planet. Gem and colour are left out:
 *    they are astrological shopping advice, not numerology.
 */

type Lang = "ro" | "en" | "ru";
type Verdict = "friend" | "neutral" | "enemy";

export const PLANETS: Record<
  number,
  { sanskrit: string; name: Record<Lang, string>; day: Record<Lang, string> | null }
> = {
  1: { sanskrit: "Surya",   name: { ro: "Soare",   en: "Sun",     ru: "Солнце" },   day: { ro: "duminică", en: "Sunday",    ru: "воскресенье" } },
  2: { sanskrit: "Chandra", name: { ro: "Lună",    en: "Moon",    ru: "Луна" },     day: { ro: "luni",     en: "Monday",    ru: "понедельник" } },
  3: { sanskrit: "Guru",    name: { ro: "Jupiter", en: "Jupiter", ru: "Юпитер" },   day: { ro: "joi",      en: "Thursday",  ru: "четверг" } },
  4: { sanskrit: "Rahu",    name: { ro: "Rahu",    en: "Rahu",    ru: "Раху" },     day: null },
  5: { sanskrit: "Budha",   name: { ro: "Mercur",  en: "Mercury", ru: "Меркурий" }, day: { ro: "miercuri", en: "Wednesday", ru: "среда" } },
  6: { sanskrit: "Shukra",  name: { ro: "Venus",   en: "Venus",   ru: "Венера" },   day: { ro: "vineri",   en: "Friday",    ru: "пятница" } },
  7: { sanskrit: "Ketu",    name: { ro: "Ketu",    en: "Ketu",    ru: "Кету" },     day: null },
  8: { sanskrit: "Shani",   name: { ro: "Saturn",  en: "Saturn",  ru: "Сатурн" },   day: { ro: "sâmbătă",  en: "Saturday",  ru: "суббота" } },
  9: { sanskrit: "Mangal",  name: { ro: "Marte",   en: "Mars",    ru: "Марс" },     day: { ro: "marți",    en: "Tuesday",   ru: "вторник" } },
};

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    mulank: "Mulank", bhagyank: "Bhagyank", naamank: "Naamank",
    mulankNote: "Numărul psihic. Doar ziua nașterii.",
    bhagyankNote: "Numărul destinului vedic. Toate cifrele datei, adunate deodată.",
    naamankNote: "Numărul numelui, citit cu tabelul caldeean.",
    compound: "compus",
    relations: "Cum se împacă cele trei",
    nameToMulank: "Naamank față de Mulank",
    nameToBhagyank: "Naamank față de Bhagyank",
    mulankToBhagyank: "Bhagyank față de Mulank",
    friend: "prieten", neutral: "neutru", enemy: "dușman",
    relationsNote: "Tabelul vedic de prieteni și dușmani se citește dintr-un număr către altul; nu e simetric.",
    lifePath: "Calea Vieții",
    driftTitle: "Bhagyank și Calea Vieții",
    driftSame: "Aici cele două metode dau același număr. Se întâmplă des, dar nu întotdeauna.",
    driftDiffer: "Nu e o greșeală. Vedic adună toate cifrele datei deodată; pitagoreic reduce separat ziua, luna și anul, apoi adună rezultatele. Metode diferite, numere diferite — fiecare valabil în sistemul lui.",
  },
  en: {
    mulank: "Mulank", bhagyank: "Bhagyank", naamank: "Naamank",
    mulankNote: "The psychic number. The day of birth alone.",
    bhagyankNote: "The Vedic destiny number. Every digit of the date, added at once.",
    naamankNote: "The name number, read from the Chaldean table.",
    compound: "compound",
    relations: "How the three get on",
    nameToMulank: "Naamank towards Mulank",
    nameToBhagyank: "Naamank towards Bhagyank",
    mulankToBhagyank: "Bhagyank towards Mulank",
    friend: "friend", neutral: "neutral", enemy: "enemy",
    relationsNote: "The Vedic friend-and-enemy table is read from one number to another; it is not symmetric.",
    lifePath: "Life Path",
    driftTitle: "Bhagyank and the Life Path",
    driftSame: "Here the two methods land on the same number. That happens often, but not always.",
    driftDiffer: "This is not an error. Vedic adds every digit of the date at once; Pythagorean reduces day, month and year separately and then adds the results. Different methods, different numbers — each valid inside its own system.",
  },
  ru: {
    mulank: "Муланк", bhagyank: "Бхагьянк", naamank: "Нааманк",
    mulankNote: "Психическое число. Только день рождения.",
    bhagyankNote: "Ведическое число судьбы. Все цифры даты, сложенные разом.",
    naamankNote: "Число имени, прочитанное по халдейской таблице.",
    compound: "составное",
    relations: "Как эти три уживаются",
    nameToMulank: "Нааманк по отношению к Муланку",
    nameToBhagyank: "Нааманк по отношению к Бхагьянку",
    mulankToBhagyank: "Бхагьянк по отношению к Муланку",
    friend: "друг", neutral: "нейтрально", enemy: "враг",
    relationsNote: "Ведическая таблица друзей и врагов читается от одного числа к другому; она не симметрична.",
    lifePath: "Число Жизненного Пути",
    driftTitle: "Бхагьянк и Число Жизненного Пути",
    driftSame: "Здесь оба метода дают одно и то же число. Так бывает часто, но не всегда.",
    driftDiffer: "Это не ошибка. Ведический метод складывает все цифры даты сразу; пифагорейский сводит день, месяц и год по отдельности, а затем складывает результаты. Разные методы — разные числа, и каждое верно внутри своей системы.",
  },
};

/** A wide bridge is a distance, not an error -- hence harmony/tension, not ok/crit. */
/* Verdictul se citește din filetul de sus, nu dintr-un fundal colorat: pagina
   nu mai are cutii nicăieri, iar relația prieten/neutru/dușman e o distanță,
   nu o stare de alarmă. */
const TONE: Record<Verdict, string> = {
  friend: "border-harmony text-ink",
  neutral: "border-line text-ink-2",
  enemy: "border-tension text-ink",
};

interface VedicNumbersProps {
  fullName: string;
  birthDate: Date;
}

export const VedicNumbers = ({ fullName, birthDate }: VedicNumbersProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const { vedic, path } = useMemo(() => {
    const b = toBirthDate(birthDate);
    return { vedic: vedicProfile(fullName, b), path: lifePath(b) };
  }, [fullName, birthDate]);

  const figures: Array<{ key: string; value: number; title: string; note: string; compound: number | null }> = [
    { key: "mulank", value: vedic.mulank, title: l.mulank, note: l.mulankNote, compound: null },
    { key: "bhagyank", value: vedic.bhagyank, title: l.bhagyank, note: l.bhagyankNote, compound: null },
    { key: "naamank", value: vedic.naamank.root, title: l.naamank, note: l.naamankNote, compound: vedic.naamank.compound },
  ];

  const relations: Array<{ key: string; label: string; verdict: Verdict }> = [
    { key: "nameToMulank", label: l.nameToMulank, verdict: vedic.harmony.nameToMulank as Verdict },
    { key: "nameToBhagyank", label: l.nameToBhagyank, verdict: vedic.harmony.nameToBhagyank as Verdict },
    { key: "mulankToBhagyank", label: l.mulankToBhagyank, verdict: vedic.harmony.mulankToBhagyank as Verdict },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {figures.map((f) => {
          const planet = PLANETS[f.value];
          return (
            <div key={f.key} className="space-y-1 border-t border-gilt/40 pt-3">
              <div className="flex items-baseline gap-2">
                <span className="num text-3xl text-primary" data-figure={f.key}>{f.value}</span>
                <h4 className="font-heading text-base text-foreground">{f.title}</h4>
              </div>
              {f.compound !== null && (
                <p className="text-xs text-faint">
                  {l.compound}{" "}
                  <span className="num" data-figure="naamank-compound">{f.compound}</span>
                </p>
              )}
              {planet && (
                <p className="text-sm text-ink-2">
                  {planet.name[lang]}
                  <span className="text-faint"> · {planet.sanskrit}</span>
                  {planet.day && <span className="text-faint"> · {planet.day[lang]}</span>}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{f.note}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-base text-foreground">{l.relations}</h4>
        <ul className="grid gap-2 sm:grid-cols-3">
          {relations.map((r) => (
            <li
              key={r.key}
              data-relation={r.key}
              data-verdict={r.verdict}
              className={`border-t py-2.5 pl-3 text-sm ${TONE[r.verdict]}`}
            >
              <span className="block text-xs opacity-70">{r.label}</span>
              {l[r.verdict]}
            </li>
          ))}
        </ul>
        <p className="text-xs text-faint">{l.relationsNote}</p>
      </div>

      <div className="space-y-2 border-t border-gilt/40 pt-4">
        <h4 className="font-heading text-base text-foreground">{l.driftTitle}</h4>
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="block text-xs text-muted-foreground">{l.bhagyank}</span>
            <span className="num text-2xl text-foreground" data-figure="drift-bhagyank">{vedic.bhagyank}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">{l.lifePath}</span>
            <span className="num text-2xl text-foreground" data-figure="drift-lifepath">{path.value}</span>
          </div>
        </div>
        <p className="text-sm text-foreground/85">
          {vedic.bhagyank === path.value ? l.driftSame : l.driftDiffer}
        </p>
      </div>
    </div>
  );
};
