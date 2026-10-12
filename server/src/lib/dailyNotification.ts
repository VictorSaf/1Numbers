import type { PushPayload } from './push';

/**
 * Textele notificării zilnice, RO/EN/RU.
 *
 * Copiate verbatim din generateDailyPredictionNotification, în
 * src/lib/notifications.ts. Acolo rămân, fiindcă acolo se folosesc pentru
 * notificarea locală de test; aici sunt fiindcă serverul nu poate importa din
 * src/ (rootDir). Dacă schimbi un text, schimbă-l în ambele locuri --
 * testul de aici fixează exact șirurile, deci o divergență cade la `npm run test`.
 */

export type NotificationLanguage = 'ro' | 'en' | 'ru';

const TITLES: Record<NotificationLanguage, string> = {
  ro: 'Energia Zilei Tale',
  en: 'Your Daily Energy',
  ru: 'Ваша Энергия Дня',
};

const BODIES: Record<NotificationLanguage, Record<number, string>> = {
  ro: {
    1: 'Zi de început. Pornește ce amâni, și cere ajutorul înainte să ai nevoie de el.',
    2: 'Simți azi tensiunea din cameră înainte să fie spusă. Dezamorseaz-o fără să te ștergi pe tine.',
    3: 'Ce simți vrea azi să iasă în afară. Spune-o într-un singur loc, nu în zece.',
    4: 'Zi bună pentru ce se construiește încet. Ai grijă să nu folosești munca drept adăpost.',
    5: 'Stagnarea te costă azi mai mult decât riscul. Alege o direcție și du-o până la capăt.',
    6: 'Azi alții se sprijină pe tine. Ai grijă de ei fără să decizi în locul lor.',
    7: 'Zi de întrebări, nu de răspunsuri comode. Ai grijă să nu folosești analiza ca să nu simți.',
    8: 'Azi se măsoară. Uită-te la cifre, și ține minte că nu ele spun cât valorezi.',
    9: 'Vezi azi imaginea largă. Închide ce trebuie închis, chiar dacă nu iese perfect.',
  },
  en: {
    1: 'A day for beginnings. Start what you postpone, and ask for help before you need it.',
    2: 'Today you feel the tension before anyone names it. Defuse it without erasing yourself.',
    3: 'What you feel wants out today. Say it in one place, not in ten.',
    4: 'A good day for what is built slowly. Watch that work does not become a place to hide.',
    5: 'Standing still costs you more than the risk today. Pick one direction and finish it.',
    6: "People lean on you today. Care for them without deciding for them.",
    7: 'A day for questions, not for comfortable answers. Watch that analysis is not a way to not feel.',
    8: 'Today things get measured. Look at the numbers, and remember they do not say what you are worth.',
    9: 'You see the whole picture today. Close what needs closing, even if it is not perfect.',
  },
  ru: {
    1: 'День начала. Начните то, что откладываете, и попросите помощь до того, как она понадобится.',
    2: 'Сегодня вы чувствуете напряжение раньше слов. Снимите его, не стирая себя.',
    3: 'То, что вы чувствуете, просится наружу. Скажите это в одном месте, а не в десяти.',
    4: 'Хороший день для того, что строится медленно. Следите, чтобы работа не стала укрытием.',
    5: 'Сегодня застой обходится дороже риска. Выберите одно направление и доведите его до конца.',
    6: 'Сегодня на вас опираются. Позаботьтесь о других, не решая за них.',
    7: 'День вопросов, а не удобных ответов. Следите, чтобы анализ не заменял чувство.',
    8: 'Сегодня всё измеряется. Смотрите на цифры и помните: они не говорят, чего вы стоите.',
    9: 'Сегодня вы видите картину целиком. Закройте то, что пора закрыть, даже если оно не идеально.',
  },
};

/**
 * data.url e mereu setat: sw.js îl citește înaintea propriei mapări, iar
 * maparea lui pentru 'daily-prediction' trimite la /predictions, o rută care
 * nu există în routes.json.
 */
export function buildDailyPredictionPayload(
  personalDay: number,
  language: NotificationLanguage,
): PushPayload {
  return {
    title: TITLES[language],
    body: BODIES[language][personalDay],
    tag: 'daily-prediction',
    data: {
      type: 'daily-prediction',
      personalDay,
      url: '/azi',
    },
  };
}
