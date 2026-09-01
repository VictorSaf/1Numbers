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
    1: 'Astăzi este o zi perfectă pentru noi începuturi! Energia numărului 1 te susține.',
    2: 'Ziua favorizează cooperarea și relațiile armonioase. Fii diplomat!',
    3: 'Creativitatea ta este la maxim astăzi! Exprimă-te liber.',
    4: 'O zi excelentă pentru organizare și muncă practică.',
    5: 'Schimbarea și aventura sunt în aer! Fii deschis la nou.',
    6: 'Energia zilei se concentrează pe familie și iubire.',
    7: 'Zi ideală pentru introspecție și studiu profund.',
    8: 'Energia abundenței și succesului este puternică astăzi!',
    9: 'O zi pentru compasiune și încheierea ciclurilor.',
  },
  en: {
    1: 'Today is perfect for new beginnings! Number 1 energy supports you.',
    2: 'The day favors cooperation and harmonious relationships. Be diplomatic!',
    3: 'Your creativity is at its peak today! Express yourself freely.',
    4: 'An excellent day for organization and practical work.',
    5: 'Change and adventure are in the air! Be open to the new.',
    6: "Today's energy focuses on family and love.",
    7: 'An ideal day for introspection and deep study.',
    8: 'The energy of abundance and success is strong today!',
    9: 'A day for compassion and completing cycles.',
  },
  ru: {
    1: 'Сегодня идеальный день для новых начинаний! Энергия числа 1 поддерживает вас.',
    2: 'День благоприятствует сотрудничеству и гармоничным отношениям. Будьте дипломатичны!',
    3: 'Ваша креативность на пике сегодня! Выражайте себя свободно.',
    4: 'Отличный день для организации и практической работы.',
    5: 'Перемены и приключения в воздухе! Будьте открыты новому.',
    6: 'Энергия дня сосредоточена на семье и любви.',
    7: 'Идеальный день для самоанализа и глубокого изучения.',
    8: 'Энергия изобилия и успеха сильна сегодня!',
    9: 'День для сострадания и завершения циклов.',
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
