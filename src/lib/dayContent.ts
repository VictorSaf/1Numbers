/**
 * Ce se poate spune despre o zi.
 *
 * Un singur loc, pentru că același conținut pleacă în două direcții: pagina
 * `/azi` îl randează, iar notificarea de dimineață îl trimite. Dacă ar fi
 * compus de două ori, ar începe să difere.
 *
 * O zi nu e o cifră. Ziua personală stă în luna personală, care stă în anul
 * personal; peste toate trece ziua universală, care nu ține de naștere. Cele
 * patru se întorc împreună.
 *
 * Copia pe număr stă aici, lângă cea din `personalCycles.ts`, pentru că e
 * conținut de domeniu -- ce înseamnă o zi 4 -- nu text de interfață. Etichetele
 * butoanelor și titlurile de coloană stau în `translations.ts`, unde le
 * protejează testul de paritate.
 */

import { formatCalendarDate } from "./calendarDate";
import { calculatePersonalYearNumber } from "./numerology";
import {
  calculatePersonalDayNumber,
  calculatePersonalMonthNumber,
  calculateUniversalDay,
  PERSONAL_CYCLE_MEANINGS,
} from "./personalCycles";
import { getDailyPrediction } from "./predictions";
import type { Language } from "./translations";

export interface DayContent {
  /** Ziua, ca dată calendaristică `YYYY-MM-DD`. Merge direct în `?zi=`. */
  date: string;
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  universalDay: number;
  /** Două-trei cuvinte. Titlul unei notificări. */
  keywords: string;
  /** O propoziție despre ce e ziua. */
  meaning: string;
  /** O propoziție despre ce are omul de făcut. Corpul unei notificări. */
  advice: string;
  luckyHours: string[];
}

/**
 * Un lucru de făcut, pe număr, în trei limbi.
 *
 * `dailyPredictionsData` din `predictions.ts` are un câmp `advice`, dar numai
 * în engleză -- și pagina îl punea pe ecran ca atare, într-o interfață
 * românească. Astea sunt scrise pe limba omului: un gest concret, nu o
 * caracterizare a energiei.
 */
export const DAY_ADVICE: Record<number, Record<Language, string>> = {
  1: {
    ro: "Fă azi primul pas la lucrul pe care îl tot amâni. Nu e nevoie să-l termini, doar să-l începi.",
    en: "Take the first step today on the thing you keep postponing. You don't have to finish it, only to start.",
    ru: "Сделайте сегодня первый шаг к тому, что откладываете. Не обязательно закончить — достаточно начать.",
  },
  2: {
    ro: "Ascultă mai mult decât vorbești. Ce ai de rezolvat azi se rezolvă cu cineva, nu singur.",
    en: "Listen more than you speak. What you have to settle today gets settled with someone, not alone.",
    ru: "Слушайте больше, чем говорите. То, что нужно решить сегодня, решается с кем-то, а не в одиночку.",
  },
  3: {
    ro: "Spune ceva cu voce tare — scrie, desenează, sună pe cineva. Ideile de azi se pierd dacă rămân în cap.",
    en: "Say something out loud — write it, draw it, call someone. Today's ideas are lost if they stay in your head.",
    ru: "Скажите что-то вслух — напишите, нарисуйте, позвоните. Сегодняшние идеи пропадут, если останутся в голове.",
  },
  4: {
    ro: "Alege un lucru plictisitor și termină-l. Azi munca migăloasă îți iese mai bine decât ideile mari.",
    en: "Pick one boring thing and finish it. Patient work goes better for you today than big ideas.",
    ru: "Выберите одно скучное дело и доведите его до конца. Сегодня кропотливая работа удаётся лучше больших идей.",
  },
  5: {
    ro: "Lasă loc în program pentru ce nu ai planificat. Ziua asta aduce ceva ce nu încape în agendă.",
    en: "Leave room in your schedule for what you did not plan. This day brings something the calendar has no slot for.",
    ru: "Оставьте в расписании место для незапланированного. Этот день приносит то, для чего в календаре нет строки.",
  },
  6: {
    ro: "Sună pe cineva de acasă. Ce e de reparat azi e între oameni, nu în muncă.",
    en: "Call someone from home. What needs mending today is between people, not at work.",
    ru: "Позвоните кому-то из близких. То, что нужно починить сегодня, — между людьми, а не в работе.",
  },
  7: {
    ro: "Nu decide nimic în grabă. Stai singur o oră și lasă răspunsul să vină, în loc să-l cauți.",
    en: "Decide nothing in a hurry. Sit alone for an hour and let the answer arrive instead of hunting it.",
    ru: "Не решайте ничего второпях. Побудьте час в одиночестве и дайте ответу прийти, вместо того чтобы искать его.",
  },
  8: {
    ro: "Cere ce ți se cuvine — o mărire, o plată, un răspuns amânat. Azi ai greutate în discuție.",
    en: "Ask for what you are owed — a raise, a payment, a delayed answer. You carry weight in the room today.",
    ru: "Просите то, что вам причитается, — повышение, оплату, отложенный ответ. Сегодня ваше слово весит.",
  },
  9: {
    ro: "Termină ceva vechi și dă-i drumul. Azi o închidere face mai mult decât un început.",
    en: "Finish something old and let it go. A closing serves you better today than an opening.",
    ru: "Завершите что-то старое и отпустите. Сегодня завершение полезнее начала.",
  },
};

export const getDayContent = (
  birthDate: Date,
  date: Date,
  language: Language,
): DayContent => {
  // Ziua personală nu păstrează masterii (`result(..., false)` în
  // pythagorean.ts), deci e mereu 1..9 și indexarea de mai jos nu poate rata.
  const personalDay = calculatePersonalDayNumber(birthDate, date);
  const meanings = PERSONAL_CYCLE_MEANINGS[personalDay];

  return {
    date: formatCalendarDate(date),
    personalDay,
    personalMonth: calculatePersonalMonthNumber(birthDate, date.getFullYear(), date.getMonth() + 1),
    personalYear: calculatePersonalYearNumber(birthDate, date.getFullYear()),
    universalDay: calculateUniversalDay(date),
    keywords: meanings.keywords[language],
    meaning: meanings.dayMeaning[language],
    advice: DAY_ADVICE[personalDay][language],
    // Orele vin din motor ca atare: sunt coordonate, nu text de tradus.
    luckyHours: getDailyPrediction(birthDate, date).luckyHours,
  };
};
