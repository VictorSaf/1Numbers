/**
 * Sfaturi per cifră, scrise de mână, în trei limbi.
 *
 * Nu vin din motor: arhetipurile n-au câmp de sfat, iar numerology-plus e
 * read-only. Trei rânduri per cifră; al patrulea rând al unei intrări vine din
 * rama tiparului, ca sfatul să fie și despre cifră, și despre formă.
 */

import type { Lang } from "@/lib/numerology-plus";

export const DIGIT_ADVICE: Record<number, Record<Lang, string[]>> = {
  0: {
    ro: [
      "Nu te grăbi să dai un nume la ce abia se deschide",
      "Lasă o decizie nefixată încă o săptămână",
      "Notează ce ai amânat din teamă, nu din lipsă de timp",
    ],
    en: [
      "Do not rush to name what is only beginning to open",
      "Leave one decision unfixed for another week",
      "Write down what you postponed out of fear, not lack of time",
    ],
    ru: [
      "Не спешите называть то, что только открывается",
      "Оставьте одно решение незакреплённым ещё на неделю",
      "Запишите, что вы откладывали из страха, а не из-за нехватки времени",
    ],
  },
  1: {
    ro: [
      "Fă primul pas la ceva ce amâni de o lună",
      "Ia o decizie singur, fără să întrebi în jur",
      "Scrie ce vrei tu, înainte să te uiți la ce se așteaptă de la tine",
    ],
    en: [
      "Take the first step on something you have postponed for a month",
      "Make one decision alone, without polling anyone",
      "Write what you want before looking at what is expected of you",
    ],
    ru: [
      "Сделайте первый шаг в том, что откладываете месяц",
      "Примите одно решение самостоятельно, никого не спрашивая",
      "Запишите, чего хотите вы, прежде чем смотреть, чего ждут от вас",
    ],
  },
  2: {
    ro: [
      "Spune o nemulțumire pe care ai înghițit-o ca să păstrezi pacea",
      "Cere ajutor concret unei persoane anume, nu în general",
      "Ascultă până la capăt înainte să propui soluția",
    ],
    en: [
      "Say one grievance you swallowed to keep the peace",
      "Ask one specific person for concrete help, not the room",
      "Listen all the way through before offering the solution",
    ],
    ru: [
      "Скажите об одном недовольстве, которое проглотили ради мира",
      "Попросите конкретной помощи у конкретного человека, а не у всех",
      "Дослушайте до конца, прежде чем предлагать решение",
    ],
  },
  3: {
    ro: [
      "Termină un lucru început și arată-l cuiva",
      "Spune ceva ce simți, în locul în care de obicei glumești",
      "Alege o singură direcție creativă pentru luna asta",
    ],
    en: [
      "Finish one thing you started and show it to someone",
      "Say what you feel in the place where you would normally joke",
      "Pick a single creative direction for this month",
    ],
    ru: [
      "Закончите одно начатое дело и покажите его кому-нибудь",
      "Скажите то, что чувствуете, там, где обычно шутите",
      "Выберите одно творческое направление на этот месяц",
    ],
  },
  4: {
    ro: [
      "Pune în calendar un pas mic și repetabil, nu un obiectiv mare",
      "Repară un lucru pe care îl ocolești de luni de zile",
      "Verifică dacă disciplina ta servește un scop sau te ascunde",
    ],
    en: [
      "Put a small repeatable step in the calendar, not a large goal",
      "Repair the one thing you have been walking around for months",
      "Check whether your discipline serves a purpose or hides you",
    ],
    ru: [
      "Внесите в календарь маленький повторяемый шаг, а не большую цель",
      "Почините то, что обходите месяцами",
      "Проверьте, служит ли ваша дисциплина цели или прячет вас",
    ],
  },
  5: {
    ro: [
      "Schimbă un singur obicei zilnic, nu toată rutina",
      "Spune „nu” la ceva care doar te ține ocupat",
      "Du până la capăt un lucru început, înainte să pornești altul",
    ],
    en: [
      "Change one daily habit, not the whole routine",
      "Say no to something that only keeps you busy",
      "Carry one started thing to the end before beginning another",
    ],
    ru: [
      "Измените одну ежедневную привычку, а не весь распорядок",
      "Скажите «нет» тому, что просто занимает вас",
      "Доведите начатое до конца, прежде чем браться за новое",
    ],
  },
  6: {
    ro: [
      "Întreabă pe cineva apropiat de ce are nevoie, fără să presupui",
      "Refuză o responsabilitate care nu era a ta",
      "Fă ceva pentru tine cu seriozitatea cu care faci pentru alții",
    ],
    en: [
      "Ask someone close what they need, without assuming",
      "Refuse one responsibility that was never yours to carry",
      "Do something for yourself with the seriousness you give others",
    ],
    ru: [
      "Спросите близкого, что ему нужно, ничего не предполагая",
      "Откажитесь от ответственности, которая не была вашей",
      "Сделайте для себя что-то с той же серьёзностью, что и для других",
    ],
  },
  7: {
    ro: [
      "Rezervă o oră fără ecran și fără scop declarat",
      "Verifică o convingere pe care nu ai testat-o niciodată",
      "Spune cuiva ceva ce de obicei ții pentru tine",
    ],
    en: [
      "Reserve one hour with no screen and no stated purpose",
      "Test one belief you have never actually checked",
      "Tell someone something you usually keep to yourself",
    ],
    ru: [
      "Выделите час без экрана и без заявленной цели",
      "Проверьте убеждение, которое никогда не проверяли",
      "Скажите кому-то то, что обычно держите при себе",
    ],
  },
  8: {
    ro: [
      "Uită-te la cifrele reale, nu la senzația despre ele",
      "Cere ce ți se cuvine, într-un loc în care ai tăcut",
      "Decide ce faci cu un câștig înainte să vină",
    ],
    en: [
      "Look at the actual numbers, not at your feeling about them",
      "Ask for what you are owed in the place where you stayed quiet",
      "Decide what a gain is for before it arrives",
    ],
    ru: [
      "Посмотрите на реальные цифры, а не на ощущение от них",
      "Попросите то, что вам причитается, там, где вы молчали",
      "Решите, на что пойдёт прибыль, прежде чем она придёт",
    ],
  },
  9: {
    ro: [
      "Închide oficial ceva ce s-a terminat de mult în fapt",
      "Dăruiește ceva ce nu-ți mai folosește, dar altcuiva da",
      "Scrie ce ai învățat din capitolul care se închide",
    ],
    en: [
      "Formally close something that in fact ended long ago",
      "Give away what no longer serves you but would serve someone else",
      "Write down what you learned from the chapter that is closing",
    ],
    ru: [
      "Официально закройте то, что фактически давно закончилось",
      "Отдайте то, что не нужно вам, но нужно другому",
      "Запишите, чему научила закрывающаяся глава",
    ],
  },
};
