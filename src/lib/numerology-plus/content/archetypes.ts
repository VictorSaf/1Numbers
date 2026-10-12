/**
 * Arhetipurile numerice — sursa unică de adevăr pentru interpretări.
 *
 * De ce așa: 14 calcule noi × 12 valori posibile × 3 limbi = 504 texte.
 * Scrise separat, ar diverge și s-ar contrazice între ele. Compuse din
 * arhetip + ramă de context, rămân consecvente și se traduc o singură dată.
 *
 * 13 arhetipuri × 3 limbi × 5 câmpuri = 195 de stringuri scrise de mână,
 * din care motorul produce toate cele 504 interpretări.
 */

import type { Lang } from './arcana.js';

export interface Archetype {
  n: number;
  title: Record<Lang, string>;
  keywords: Record<Lang, string[]>;
  /** Esența — ce ESTE energia. Se folosește ca predicat după rama de context. */
  essence: Record<Lang, string>;
  /** Forța — cum arată când funcționează bine. */
  strength: Record<Lang, string>;
  /** Umbra — cum arată când se distorsionează. Partea căutată de utilizatori. */
  shadow: Record<Lang, string>;
}

export const ARCHETYPES: Archetype[] = [
  {
    n: 1,
    title: { ro: 'Liderul', en: 'The Leader', ru: 'Лидер' },
    keywords: { ro: ['Independență','Inițiativă','Curaj','Originalitate'],
                en: ['Independence','Initiative','Courage','Originality'],
                ru: ['Независимость','Инициатива','Смелость','Оригинальность'] },
    essence: { ro: 'energia începutului și a deciziei asumate singur',
               en: 'the energy of beginning and of deciding alone',
               ru: 'энергия начала и решения, принятого самостоятельно' },
    strength: { ro: 'pornești lucruri pe care alții doar le discută și duci responsabilitatea fără să o împarți',
                en: 'you start what others only discuss, and carry responsibility without splitting it',
                ru: 'вы начинаете то, что другие только обсуждают, и несёте ответственность целиком' },
    shadow: { ro: 'încăpățânare confundată cu principii, dificultate în a cere ajutor, izolare la vârf',
              en: 'stubbornness mistaken for principle, difficulty asking for help, isolation at the top',
              ru: 'упрямство под видом принципов, трудность просить помощь, изоляция на вершине' },
  },
  {
    n: 2,
    title: { ro: 'Diplomatul', en: 'The Diplomat', ru: 'Дипломат' },
    keywords: { ro: ['Sensibilitate','Cooperare','Răbdare','Intuiție'],
                en: ['Sensitivity','Cooperation','Patience','Intuition'],
                ru: ['Чуткость','Сотрудничество','Терпение','Интуиция'] },
    essence: { ro: 'energia legăturii, a echilibrului între doi poli',
               en: 'the energy of connection, of balance between two poles',
               ru: 'энергия связи, равновесия между двумя полюсами' },
    strength: { ro: 'simți tensiunea dintr-o cameră înainte să fie spusă și o dezamorsezi fără să pară efort',
                en: 'you feel the tension in a room before it is spoken and defuse it without visible effort',
                ru: 'вы чувствуете напряжение до того, как о нём скажут, и снимаете его незаметно' },
    shadow: { ro: 'te ștergi pe tine ca să păstrezi pacea, aduni resentiment în tăcere, eviți conflictul necesar',
              en: 'you erase yourself to keep the peace, store resentment in silence, avoid necessary conflict',
              ru: 'вы стираете себя ради мира, копите обиду молча, избегаете нужного конфликта' },
  },
  {
    n: 3,
    title: { ro: 'Creatorul', en: 'The Creator', ru: 'Творец' },
    keywords: { ro: ['Expresie','Bucurie','Imaginație','Sociabilitate'],
                en: ['Expression','Joy','Imagination','Sociability'],
                ru: ['Выражение','Радость','Воображение','Общительность'] },
    essence: { ro: 'energia expresiei — ce simți trebuie să iasă în afară',
               en: 'the energy of expression — what you feel has to come out',
               ru: 'энергия выражения — то, что вы чувствуете, должно выйти наружу' },
    strength: { ro: 'transformi o idee în ceva ce alții pot vedea și simți; ridici moralul unei încăperi',
                en: 'you turn an idea into something others can see and feel; you lift the mood of a room',
                ru: 'вы превращаете идею в то, что другие видят и чувствуют; поднимаете настроение' },
    shadow: { ro: 'risipire pe zece direcții, superficialitate mascată în entuziasm, fugă de disciplină',
              en: 'scattering across ten directions, shallowness dressed as enthusiasm, flight from discipline',
              ru: 'распыление на десять направлений, поверхностность под видом энтузиазма' },
  },
  {
    n: 4,
    title: { ro: 'Constructorul', en: 'The Builder', ru: 'Строитель' },
    keywords: { ro: ['Stabilitate','Disciplină','Metodă','Loialitate'],
                en: ['Stability','Discipline','Method','Loyalty'],
                ru: ['Стабильность','Дисциплина','Метод','Верность'] },
    essence: { ro: 'energia structurii — ce durează se construiește încet',
               en: 'the energy of structure — what lasts is built slowly',
               ru: 'энергия структуры — то, что держится, строится медленно' },
    strength: { ro: 'ce promiți se întâmplă; oamenii își construiesc planurile pe cuvântul tău',
                en: 'what you promise happens; people build their plans on your word',
                ru: 'обещанное вами сбывается; на ваше слово опираются' },
    shadow: { ro: 'rigiditate, teamă de schimbare prezentată drept prudență, muncă folosită ca refugiu',
              en: 'rigidity, fear of change presented as prudence, work used as a hiding place',
              ru: 'жёсткость, страх перемен под видом осторожности, работа как убежище' },
  },
  {
    n: 5,
    title: { ro: 'Aventurierul', en: 'The Adventurer', ru: 'Искатель приключений' },
    keywords: { ro: ['Libertate','Schimbare','Curiozitate','Adaptabilitate'],
                en: ['Freedom','Change','Curiosity','Adaptability'],
                ru: ['Свобода','Перемены','Любопытство','Адаптивность'] },
    essence: { ro: 'energia mișcării — stagnarea te costă mai mult decât riscul',
               en: 'the energy of movement — standing still costs you more than risk does',
               ru: 'энергия движения — застой обходится дороже риска' },
    strength: { ro: 'te adaptezi în situații care blochează pe alții; înveți repede din experiență directă',
                en: 'you adapt where others freeze; you learn fast from direct experience',
                ru: 'вы адаптируетесь там, где другие замирают; быстро учитесь на опыте' },
    shadow: { ro: 'fugă de angajament, excese ca substitut al sensului, nimic dus până la capăt',
              en: 'flight from commitment, excess as a substitute for meaning, nothing carried to the end',
              ru: 'бегство от обязательств, излишества вместо смысла, ничего не доведено до конца' },
  },
  {
    n: 6,
    title: { ro: 'Protectorul', en: 'The Nurturer', ru: 'Защитник' },
    keywords: { ro: ['Responsabilitate','Grijă','Armonie','Devotament'],
                en: ['Responsibility','Care','Harmony','Devotion'],
                ru: ['Ответственность','Забота','Гармония','Преданность'] },
    essence: { ro: 'energia grijii — ești locul unde alții se așază',
               en: 'the energy of care — you are the place where others settle',
               ru: 'энергия заботы — вы то место, где другие находят опору' },
    strength: { ro: 'creezi un cadru în care oamenii se simt în siguranță și dau ce au mai bun',
                en: 'you create a frame where people feel safe and give their best',
                ru: 'вы создаёте рамку, в которой люди чувствуют себя в безопасности' },
    shadow: { ro: 'control prin grijă, martiraj, standarde imposibile impuse celor apropiați',
              en: 'control through caring, martyrdom, impossible standards imposed on those close to you',
              ru: 'контроль через заботу, мученичество, невыполнимые требования к близким' },
  },
  {
    n: 7,
    title: { ro: 'Căutătorul', en: 'The Seeker', ru: 'Искатель' },
    keywords: { ro: ['Analiză','Profunzime','Independență','Discernământ'],
                en: ['Analysis','Depth','Independence','Discernment'],
                ru: ['Анализ','Глубина','Независимость','Различение'] },
    essence: { ro: 'energia întrebării — nu accepți un răspuns pentru că e comod',
               en: 'the energy of the question — you do not accept an answer because it is convenient',
               ru: 'энергия вопроса — вы не принимаете ответ лишь потому, что он удобен' },
    strength: { ro: 'vezi structura sub aparență; ceilalți vin la tine când au nevoie de o judecată curată',
                en: 'you see the structure beneath appearances; people come to you for clean judgment',
                ru: 'вы видите структуру за видимостью; к вам приходят за чистым суждением' },
    shadow: { ro: 'retragere din relații, superioritate intelectuală, analiză folosită ca să eviți simțirea',
              en: 'withdrawal from relationships, intellectual superiority, analysis used to avoid feeling',
              ru: 'уход из отношений, интеллектуальное превосходство, анализ вместо чувств' },
  },
  {
    n: 8,
    title: { ro: 'Realizatorul', en: 'The Achiever', ru: 'Достигатор' },
    keywords: { ro: ['Putere','Ambiție','Autoritate','Abundență'],
                en: ['Power','Ambition','Authority','Abundance'],
                ru: ['Власть','Амбиции','Авторитет','Изобилие'] },
    essence: { ro: 'energia rezultatului material — ce nu se măsoară, nu contează pentru tine',
               en: 'the energy of material result — what cannot be measured does not count for you',
               ru: 'энергия материального результата — неизмеримое для вас не считается' },
    strength: { ro: 'transformi viziunea în structură economică; ai instinct pentru scară și pentru pârghii',
                en: 'you turn vision into economic structure; you have instinct for scale and leverage',
                ru: 'вы превращаете видение в экономическую структуру; чувствуете масштаб и рычаги' },
    shadow: { ro: 'valoare personală confundată cu cifra din cont, dominare, muncă fără oprire',
              en: 'self-worth confused with the number in the account, domination, work without stopping',
              ru: 'самооценка через цифру на счету, доминирование, работа без остановки' },
  },
  {
    n: 9,
    title: { ro: 'Umanitarul', en: 'The Humanitarian', ru: 'Гуманист' },
    keywords: { ro: ['Compasiune','Viziune','Generozitate','Încheiere'],
                en: ['Compassion','Vision','Generosity','Completion'],
                ru: ['Сострадание','Видение','Щедрость','Завершение'] },
    essence: { ro: 'energia întregului — vezi imaginea largă și oamenii din ea',
               en: 'the energy of the whole — you see the wide picture and the people inside it',
               ru: 'энергия целого — вы видите широкую картину и людей в ней' },
    strength: { ro: 'dai fără să ții socoteala și înțelegi oameni foarte diferiți de tine',
                en: 'you give without keeping score and understand people very unlike yourself',
                ru: 'вы отдаёте, не ведя счёт, и понимаете очень непохожих людей' },
    shadow: { ro: 'salvezi pe alții ca să nu te uiți la tine, dificultate în a încheia, dezamăgire cronică',
              en: 'you rescue others to avoid looking at yourself, struggle to end things, chronic disappointment',
              ru: 'спасаете других, чтобы не смотреть на себя, трудно завершать, хроническое разочарование' },
  },
  {
    n: 11,
    title: { ro: 'Maestrul Intuitor', en: 'The Master Intuitive', ru: 'Мастер Интуиции' },
    keywords: { ro: ['Viziune','Inspirație','Sensibilitate','Iluminare'],
                en: ['Vision','Inspiration','Sensitivity','Illumination'],
                ru: ['Видение','Вдохновение','Чувствительность','Озарение'] },
    essence: { ro: 'energia lui 2 ridicată la tensiune maximă — percepi mai mult decât poți explica',
               en: 'the energy of 2 raised to maximum tension — you perceive more than you can explain',
               ru: 'энергия двойки на пределе — вы воспринимаете больше, чем можете объяснить' },
    strength: { ro: 'inspiri fără să încerci; oamenii își schimbă direcția după ce vorbesc cu tine',
                en: 'you inspire without trying; people change direction after talking to you',
                ru: 'вы вдохновляете без усилий; после разговора с вами люди меняют курс' },
    shadow: { ro: 'anxietate, supraîncărcare nervoasă, potențial neasumat din teamă de propria intensitate',
              en: 'anxiety, nervous overload, unclaimed potential from fear of your own intensity',
              ru: 'тревога, нервная перегрузка, непринятый потенциал из страха своей интенсивности' },
  },
  {
    n: 22,
    title: { ro: 'Maestrul Constructor', en: 'The Master Builder', ru: 'Мастер-Строитель' },
    keywords: { ro: ['Viziune practică','Scară','Disciplină','Materializare'],
                en: ['Practical vision','Scale','Discipline','Manifestation'],
                ru: ['Практическое видение','Масштаб','Дисциплина','Воплощение'] },
    essence: { ro: 'energia lui 4 la scară mare — visul are plan de execuție',
               en: 'the energy of 4 at large scale — the dream comes with an execution plan',
               ru: 'энергия четвёрки в масштабе — у мечты есть план исполнения' },
    strength: { ro: 'construiești lucruri care supraviețuiesc celui care le-a construit',
                en: 'you build things that outlive the person who built them',
                ru: 'вы строите то, что переживает своего создателя' },
    shadow: { ro: 'presiune internă zdrobitoare, amânare din teama de a nu fi la înălțime, epuizare',
              en: 'crushing internal pressure, delay from fear of not measuring up, burnout',
              ru: 'сокрушительное внутреннее давление, промедление из страха не соответствовать' },
  },
  {
    n: 33,
    title: { ro: 'Maestrul Învățător', en: 'The Master Teacher', ru: 'Мастер-Учитель' },
    keywords: { ro: ['Compasiune','Vindecare','Serviciu','Înțelepciune'],
                en: ['Compassion','Healing','Service','Wisdom'],
                ru: ['Сострадание','Исцеление','Служение','Мудрость'] },
    essence: { ro: 'energia lui 6 fără condiții — grija devine vocație, nu obligație',
               en: 'the energy of 6 without conditions — care becomes vocation, not obligation',
               ru: 'энергия шестёрки без условий — забота становится призванием, а не долгом' },
    strength: { ro: 'ceilalți se vindecă în prezența ta fără să faci ceva anume',
                en: 'people heal in your presence without you doing anything in particular',
                ru: 'люди исцеляются рядом с вами без ваших особых усилий' },
    shadow: { ro: 'te consumi pentru alții, refuzi să primești, idealism care ignoră limitele reale',
              en: 'you consume yourself for others, refuse to receive, idealism that ignores real limits',
              ru: 'вы истощаетесь ради других, отказываетесь принимать, идеализм без границ' },
  },
  {
    n: 0,
    title: { ro: 'Potențialul', en: 'Potential', ru: 'Потенциал' },
    keywords: { ro: ['Deschidere','Nedefinit','Început','Vid fertil'],
                en: ['Openness','Undefined','Beginning','Fertile void'],
                ru: ['Открытость','Неопределённость','Начало','Плодородная пустота'] },
    essence: { ro: 'energia nescrisă — nimic nu e încă fixat',
               en: 'the unwritten energy — nothing is fixed yet',
               ru: 'ненаписанная энергия — ничто ещё не закреплено' },
    strength: { ro: 'nu porți tipare vechi în această zonă; poți alege liber',
                en: 'you carry no old pattern here; you can choose freely',
                ru: 'здесь на вас нет старых паттернов; вы свободны в выборе' },
    shadow: { ro: 'lipsă de direcție, amânare pe termen nelimitat, teamă de a te fixa',
              en: 'lack of direction, indefinite postponement, fear of committing to a shape',
              ru: 'отсутствие направления, бесконечное откладывание, страх определиться' },
  },
];

export const ARCHETYPE_BY_N: Record<number, Archetype> =
  Object.fromEntries(ARCHETYPES.map((a) => [a.n, a]));

/** Fallback sigur: dacă un calcul produce o valoare fără arhetip, folosește rădăcina. */
export function archetypeFor(n: number): Archetype {
  if (ARCHETYPE_BY_N[n]) return ARCHETYPE_BY_N[n];
  let x = Math.abs(n);
  while (x > 9) x = x.toString().split('').reduce((a, d) => a + Number(d), 0);
  return ARCHETYPE_BY_N[x] ?? ARCHETYPE_BY_N[0];
}
