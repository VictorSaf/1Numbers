/**
 * Ce se recomandă pentru o zi, în limba omului.
 *
 * Recomandările, culoarea și genurile muzicale existau scrise doar în engleză,
 * în `predictions.ts`. Etichetele din jurul lor erau traduse -- „Recomandări”,
 * „Culoarea zilei”, „Muzică recomandată” -- deci pagina în română arăta titluri
 * românești peste conținut englezesc, ceea ce e mai rău decât o pagină întreagă
 * într-o limbă: pare o traducere abandonată la jumătate.
 *
 * Textele nu sunt traduceri cuvânt cu cuvânt ale celor englezești. „Engage in
 * creative activities” tradus mecanic dă „Angajează-te în activități creative”,
 * care nu e o propoziție pe care o spune cineva. Sunt scrise pe limba omului,
 * ca restul aplicației: un gest concret, nu o categorie.
 */

export type GuidanceLang = "ro" | "en" | "ru";

/** Ce ai de făcut azi. Gesturi, nu categorii. */
const ADVICE: Record<GuidanceLang, Record<number, string[]>> = {
  ro: {
    1: [
      "Începe lucrul pe care îl amâni de săptămâni",
      "Ia decizia singur, fără să mai ceri o părere",
      "Spune primul ce crezi, într-o discuție",
      "Scrie unde vrei să fii peste un an",
    ],
    2: [
      "Ascultă până la capăt, fără să pregătești răspunsul",
      "Repară o legătură care s-a răcit",
      "Lasă pe altcineva să conducă",
      "Pune la loc ceva ce s-a dezordonat",
    ],
    3: [
      "Spune ceva cu voce tare — scrie, desenează, sună pe cineva",
      "Arată cuiva la ce lucrezi, chiar neterminat",
      "Ieși printre oameni, chiar și pentru o oră",
      "Nu lăsa ideea de azi doar în cap",
    ],
    4: [
      "Termină ce e la 90%, nu începe altceva",
      "Pune ordine într-un singur loc, complet",
      "Fă lista lungă pe care o eviți",
      "Verifică cifrele pe care le-ai luat de bune",
    ],
    5: [
      "Schimbă drumul, ora, locul — ceva din rutină",
      "Spune da la ceva ce n-ai mai făcut",
      "Amână decizia definitivă cu o zi",
      "Ieși din casă fără plan",
    ],
    6: [
      "Sună pe cineva din familie, fără motiv",
      "Fă loc pentru cineva care are nevoie de tine",
      "Repară ceva în casă",
      "Spune un „nu” pe care îl datorezi ție",
    ],
    7: [
      "Rămâi singur o oră, fără ecran",
      "Citește ceva greu, nu ceva rapid",
      "Pune la îndoială o certitudine de-a ta",
      "Nu răspunde imediat la ce te-a supărat",
    ],
    8: [
      "Cere ce ți se cuvine — banii, creditul, timpul",
      "Uită-te la cifre: ce intră, ce iese",
      "Ia decizia care costă, dar rezolvă",
      "Negociază în loc să accepți",
    ],
    9: [
      "Încheie ceva ce se tot prelungește",
      "Dă ceva fără să aștepți nimic",
      "Iartă o datorie mică",
      "Fă curat în ce nu-ți mai trebuie",
    ],
  },
  en: {
    1: [
      "Start the thing you have been postponing for weeks",
      "Decide alone, without asking for one more opinion",
      "Say what you think first, in a conversation",
      "Write down where you want to be in a year",
    ],
    2: [
      "Listen to the end, without preparing your answer",
      "Mend a connection that has gone cold",
      "Let someone else lead",
      "Put back in order something that came undone",
    ],
    3: [
      "Say something out loud — write, draw, call someone",
      "Show someone what you are working on, unfinished",
      "Get among people, even for an hour",
      "Do not leave today's idea in your head",
    ],
    4: [
      "Finish what is at 90%, do not start something else",
      "Put one place in order, completely",
      "Make the long list you keep avoiding",
      "Check the figures you have been taking on trust",
    ],
    5: [
      "Change the route, the hour, the place — something in the routine",
      "Say yes to something you have not done before",
      "Postpone the final decision by a day",
      "Leave the house without a plan",
    ],
    6: [
      "Call someone in your family, for no reason",
      "Make room for someone who needs you",
      "Repair something in the house",
      "Say a no that you owe yourself",
    ],
    7: [
      "Stay alone for an hour, no screen",
      "Read something hard, not something fast",
      "Question one of your certainties",
      "Do not answer immediately what upset you",
    ],
    8: [
      "Ask for what is yours — the money, the credit, the time",
      "Look at the figures: what comes in, what goes out",
      "Make the decision that costs but settles it",
      "Negotiate instead of accepting",
    ],
    9: [
      "End something that keeps dragging on",
      "Give something expecting nothing",
      "Forgive a small debt",
      "Clear out what you no longer need",
    ],
  },
  ru: {
    1: [
      "Начните то, что откладываете неделями",
      "Решите сами, не спрашивая ещё одно мнение",
      "Скажите первым, что думаете",
      "Запишите, где хотите быть через год",
    ],
    2: [
      "Дослушайте до конца, не готовя ответ",
      "Восстановите связь, которая остыла",
      "Дайте вести другому",
      "Приведите в порядок то, что разладилось",
    ],
    3: [
      "Скажите вслух — напишите, нарисуйте, позвоните",
      "Покажите кому-то работу, пусть незаконченную",
      "Выйдите к людям хотя бы на час",
      "Не оставляйте сегодняшнюю идею в голове",
    ],
    4: [
      "Закончите то, что на 90%, не начинайте новое",
      "Наведите порядок в одном месте, до конца",
      "Составьте длинный список, который избегаете",
      "Проверьте цифры, принятые на веру",
    ],
    5: [
      "Смените маршрут, час, место — что-то в рутине",
      "Согласитесь на то, чего ещё не делали",
      "Отложите окончательное решение на день",
      "Выйдите из дома без плана",
    ],
    6: [
      "Позвоните родному человеку без повода",
      "Освободите место для того, кому вы нужны",
      "Почините что-то дома",
      "Скажите «нет», которое должны себе",
    ],
    7: [
      "Побудьте час в одиночестве, без экрана",
      "Читайте трудное, а не быстрое",
      "Поставьте под сомнение одну свою уверенность",
      "Не отвечайте сразу на то, что задело",
    ],
    8: [
      "Просите своё — деньги, признание, время",
      "Посмотрите на цифры: что приходит, что уходит",
      "Примите решение, которое стоит, но закрывает вопрос",
      "Договаривайтесь, а не соглашайтесь",
    ],
    9: [
      "Закончите то, что тянется",
      "Отдайте, ничего не ожидая",
      "Простите небольшой долг",
      "Уберите то, что больше не нужно",
    ],
  },
};

/** Numele culorii. Codul hex rămâne unul singur: culoarea nu are limbă. */
const COLOR_NAME: Record<GuidanceLang, Record<number, string>> = {
  ro: { 1: "Roșu", 2: "Portocaliu", 3: "Galben", 4: "Verde", 5: "Albastru", 6: "Indigo", 7: "Violet", 8: "Auriu", 9: "Purpuriu" },
  en: { 1: "Red", 2: "Orange", 3: "Yellow", 4: "Green", 5: "Blue", 6: "Indigo", 7: "Violet", 8: "Gold", 9: "Purple" },
  ru: { 1: "Красный", 2: "Оранжевый", 3: "Жёлтый", 4: "Зелёный", 5: "Синий", 6: "Индиго", 7: "Фиолетовый", 8: "Золотой", 9: "Пурпурный" },
};

const COLOR_HEX: Record<number, string> = {
  1: "#EF4444", 2: "#F97316", 3: "#EAB308", 4: "#22C55E", 5: "#3B82F6",
  6: "#6366F1", 7: "#8B5CF6", 8: "#F59E0B", 9: "#A855F7",
};

/** Genuri, nu titluri de piese: o listă de piese ar îmbătrâni într-un an. */
const MUSIC: Record<GuidanceLang, Record<number, string[]>> = {
  ro: {
    1: ["Ceva care pornește tare", "Rock energic", "Imnuri", "Pop cu nerv"],
    2: ["Instrumental blând", "Acustic", "Ambient liniștit", "Voci calde"],
    3: ["Pop vesel", "Jazz jucăuș", "Clasic expresiv", "Dans"],
    4: ["Clasic structurat", "Ritm constant", "Instrumental ordonat", "Bas care ține"],
    5: ["World music", "Ceva ce n-ai mai ascultat", "Fusion", "Ritmuri de călătorie"],
    6: ["Folk cald", "Cântece de familie", "Armonii vocale", "Ceva de acasă"],
    7: ["Ambient", "Clasic contemplativ", "Sunete de natură", "Liniște cu fundal"],
    8: ["Orchestral amplu", "Ceva cu greutate", "Ritm de mers înainte", "Muzică de generic final"],
    9: ["Coruri", "Muzică de film", "Ceva care închide", "Melancolie luminoasă"],
  },
  en: {
    1: ["Something that starts loud", "Energetic rock", "Anthems", "Pop with an edge"],
    2: ["Soft instrumental", "Acoustic", "Quiet ambient", "Warm voices"],
    3: ["Joyful pop", "Playful jazz", "Expressive classical", "Dance"],
    4: ["Structured classical", "Steady rhythm", "Orderly instrumental", "Bass that holds"],
    5: ["World music", "Something you have not heard", "Fusion", "Travelling rhythms"],
    6: ["Warm folk", "Family songs", "Vocal harmonies", "Something from home"],
    7: ["Ambient", "Contemplative classical", "Nature sounds", "Silence with a background"],
    8: ["Large orchestral", "Something with weight", "A forward-moving beat", "End-credits music"],
    9: ["Choirs", "Film music", "Something that closes", "Bright melancholy"],
  },
  ru: {
    1: ["То, что начинается громко", "Энергичный рок", "Гимны", "Поп с нервом"],
    2: ["Мягкий инструментал", "Акустика", "Тихий эмбиент", "Тёплые голоса"],
    3: ["Радостный поп", "Игривый джаз", "Выразительная классика", "Танцевальное"],
    4: ["Структурная классика", "Ровный ритм", "Упорядоченный инструментал", "Держащий бас"],
    5: ["Этника", "То, чего вы не слышали", "Фьюжн", "Ритмы дороги"],
    6: ["Тёплый фолк", "Семейные песни", "Вокальные гармонии", "Что-то из дома"],
    7: ["Эмбиент", "Созерцательная классика", "Звуки природы", "Тишина с фоном"],
    8: ["Большой оркестр", "Что-то весомое", "Ритм движения вперёд", "Музыка финальных титров"],
    9: ["Хоры", "Киномузыка", "То, что закрывает", "Светлая меланхолия"],
  },
};

const pick = <T,>(table: Record<GuidanceLang, Record<number, T>>, lang: GuidanceLang, n: number): T => {
  const forLang = table[lang] ?? table.en;
  return forLang[n] ?? forLang[1];
};

export const dayAdvice = (dayNumber: number, lang: GuidanceLang): string[] =>
  pick(ADVICE, lang, dayNumber);

export const dayColor = (dayNumber: number, lang: GuidanceLang): { name: string; hex: string } => ({
  name: pick(COLOR_NAME, lang, dayNumber),
  hex: COLOR_HEX[dayNumber] ?? COLOR_HEX[1],
});

export const dayMusic = (dayNumber: number, lang: GuidanceLang): string[] =>
  pick(MUSIC, lang, dayNumber);
