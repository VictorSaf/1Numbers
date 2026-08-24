/**
 * Cele 22 de arcane majore — conținut pentru Matrița Destinului, RO / EN / RU.
 *
 * Structura fiecărei arcane:
 *   title     — numele arcanei
 *   keywords  — 4 cuvinte-cheie pentru chip-uri în UI
 *   light     — expresia sănătoasă a energiei
 *   shadow    — expresia distorsionată (partea pe care o caută utilizatorii)
 *   task      — sarcina de dezvoltare, folosită în poziția D (sarcină karmică)
 *
 * Aceleași texte alimentează toate cele 9 poziții ale octagramei; poziția
 * schimbă rama de interpretare, nu conținutul arcanei.
 */

export type Lang = 'ro' | 'en' | 'ru';

export interface Arcana {
  n: number;
  title: Record<Lang, string>;
  keywords: Record<Lang, string[]>;
  light: Record<Lang, string>;
  shadow: Record<Lang, string>;
  task: Record<Lang, string>;
}

export const ARCANA: Arcana[] = [
  {
    n: 1,
    title: { ro: 'Magicianul', en: 'The Magician', ru: 'Маг' },
    keywords: {
      ro: ['Inițiativă', 'Voință', 'Comunicare', 'Început'],
      en: ['Initiative', 'Will', 'Communication', 'Beginning'],
      ru: ['Инициатива', 'Воля', 'Общение', 'Начало'],
    },
    light: {
      ro: 'Ai instrumentele și dreptul de a începe. Energia ta transformă intenția în acțiune fără intermediari.',
      en: 'You hold the tools and the right to begin. Your energy turns intention into action without intermediaries.',
      ru: 'У вас есть инструменты и право начинать. Ваша энергия превращает намерение в действие напрямую.',
    },
    shadow: {
      ro: 'Manipulare, vorbe fără acoperire, început după început fără a duce nimic la capăt.',
      en: 'Manipulation, words without backing, one new start after another with nothing finished.',
      ru: 'Манипуляция, слова без опоры, бесконечные начинания без завершения.',
    },
    task: {
      ro: 'Învață să-ți folosești puterea de convingere în serviciul adevărului, nu al avantajului imediat.',
      en: 'Learn to use your persuasive power in service of the truth, not of immediate advantage.',
      ru: 'Научитесь использовать силу убеждения ради истины, а не сиюминутной выгоды.',
    },
  },
  {
    n: 2,
    title: { ro: 'Preoteasa', en: 'The High Priestess', ru: 'Жрица' },
    keywords: {
      ro: ['Intuiție', 'Tăcere', 'Mister', 'Receptivitate'],
      en: ['Intuition', 'Silence', 'Mystery', 'Receptivity'],
      ru: ['Интуиция', 'Тишина', 'Тайна', 'Восприимчивость'],
    },
    light: {
      ro: 'Știi înainte să ți se explice. Puterea ta e în ascultare, nu în afirmare.',
      en: 'You know before it is explained to you. Your power lies in listening, not in asserting.',
      ru: 'Вы знаете раньше, чем вам объяснят. Ваша сила — в слушании, а не в утверждении.',
    },
    shadow: {
      ro: 'Retragere din realitate, secrete păstrate inutil, pasivitate mascată în profunzime.',
      en: 'Withdrawal from reality, needlessly kept secrets, passivity dressed up as depth.',
      ru: 'Уход от реальности, ненужные тайны, пассивность под маской глубины.',
    },
    task: {
      ro: 'Transformă cunoașterea tăcută în ceva folositor pentru alții, nu doar pentru tine.',
      en: 'Turn silent knowing into something useful for others, not only for yourself.',
      ru: 'Превратите молчаливое знание в пользу для других, а не только для себя.',
    },
  },
  {
    n: 3,
    title: { ro: 'Împărăteasa', en: 'The Empress', ru: 'Императрица' },
    keywords: {
      ro: ['Abundență', 'Creație', 'Grijă', 'Frumusețe'],
      en: ['Abundance', 'Creation', 'Nurture', 'Beauty'],
      ru: ['Изобилие', 'Творчество', 'Забота', 'Красота'],
    },
    light: {
      ro: 'Creezi confort și creștere în jurul tău. Ce atingi rodește.',
      en: 'You create comfort and growth around you. What you touch bears fruit.',
      ru: 'Вы создаёте комфорт и рост вокруг себя. То, к чему прикасаетесь, плодоносит.',
    },
    shadow: {
      ro: 'Sufocare prin grijă, consum ca substitut al bucuriei, dependență de confort.',
      en: 'Smothering care, consumption as a substitute for joy, dependence on comfort.',
      ru: 'Удушающая забота, потребление вместо радости, зависимость от комфорта.',
    },
    task: {
      ro: 'Dăruiește fără să ceri recunoștință în schimb.',
      en: 'Give without demanding gratitude in return.',
      ru: 'Отдавайте, не требуя благодарности взамен.',
    },
  },
  {
    n: 4,
    title: { ro: 'Împăratul', en: 'The Emperor', ru: 'Император' },
    keywords: {
      ro: ['Structură', 'Autoritate', 'Ordine', 'Responsabilitate'],
      en: ['Structure', 'Authority', 'Order', 'Responsibility'],
      ru: ['Структура', 'Власть', 'Порядок', 'Ответственность'],
    },
    light: {
      ro: 'Construiești sisteme care rezistă. Oamenii se sprijină pe cuvântul tău.',
      en: 'You build systems that last. People lean on your word.',
      ru: 'Вы строите системы, которые держатся. На ваше слово опираются.',
    },
    shadow: {
      ro: 'Rigiditate, control asupra celor din jur, confundarea puterii cu valoarea personală.',
      en: 'Rigidity, control over others, mistaking power for personal worth.',
      ru: 'Жёсткость, контроль над другими, подмена ценности властью.',
    },
    task: {
      ro: 'Învață unde se termină responsabilitatea ta și începe libertatea celuilalt.',
      en: 'Learn where your responsibility ends and another person’s freedom begins.',
      ru: 'Поймите, где заканчивается ваша ответственность и начинается свобода другого.',
    },
  },
  {
    n: 5,
    title: { ro: 'Marele Preot', en: 'The Hierophant', ru: 'Иерофант' },
    keywords: {
      ro: ['Tradiție', 'Învățătură', 'Reguli', 'Transmitere'],
      en: ['Tradition', 'Teaching', 'Rules', 'Transmission'],
      ru: ['Традиция', 'Учение', 'Правила', 'Передача'],
    },
    light: {
      ro: 'Ești puntea între ce s-a învățat înainte și cei care vin acum. Explici fără să simplifici.',
      en: 'You are the bridge between what was learned before and those arriving now. You explain without dumbing down.',
      ru: 'Вы мост между прежним знанием и теми, кто приходит сейчас. Объясняете, не упрощая.',
    },
    shadow: {
      ro: 'Dogmatism, respect pentru formă în locul sensului, teamă de a ieși din tipar.',
      en: 'Dogmatism, respect for form over meaning, fear of stepping outside the pattern.',
      ru: 'Догматизм, форма важнее смысла, страх выйти за рамки.',
    },
    task: {
      ro: 'Verifică regulile pe care le aperi. Unele nu mai sunt ale tale.',
      en: 'Examine the rules you defend. Some of them are no longer yours.',
      ru: 'Проверьте правила, которые защищаете. Некоторые уже не ваши.',
    },
  },
  {
    n: 6,
    title: { ro: 'Îndrăgostiții', en: 'The Lovers', ru: 'Влюблённые' },
    keywords: {
      ro: ['Alegere', 'Relație', 'Valori', 'Atracție'],
      en: ['Choice', 'Relationship', 'Values', 'Attraction'],
      ru: ['Выбор', 'Отношения', 'Ценности', 'Притяжение'],
    },
    light: {
      ro: 'Alegi conștient, nu din obișnuință. Relațiile tale sunt oglinzi, nu refugii.',
      en: 'You choose consciously, not out of habit. Your relationships are mirrors, not shelters.',
      ru: 'Вы выбираете осознанно, а не по привычке. Отношения — зеркало, а не убежище.',
    },
    shadow: {
      ro: 'Indecizie cronică, dependență de aprobare, amânarea alegerii până alege altcineva.',
      en: 'Chronic indecision, dependence on approval, postponing the choice until someone else makes it.',
      ru: 'Хроническая нерешительность, зависимость от одобрения, откладывание выбора.',
    },
    task: {
      ro: 'Asumă-ți alegerea făcută, inclusiv ce ai lăsat în urmă prin ea.',
      en: 'Own the choice you made, including what you left behind by making it.',
      ru: 'Примите сделанный выбор — вместе с тем, от чего он вас отделил.',
    },
  },
  {
    n: 7,
    title: { ro: 'Carul', en: 'The Chariot', ru: 'Колесница' },
    keywords: {
      ro: ['Direcție', 'Disciplină', 'Victorie', 'Mișcare'],
      en: ['Direction', 'Discipline', 'Victory', 'Movement'],
      ru: ['Направление', 'Дисциплина', 'Победа', 'Движение'],
    },
    light: {
      ro: 'Duci lucrurile la capăt prin voință susținută. Forțele contradictorii lucrează sub controlul tău.',
      en: 'You see things through by sustained will. Opposing forces work under your control.',
      ru: 'Вы доводите до конца силой воли. Противоположные силы работают под вашим контролем.',
    },
    shadow: {
      ro: 'Goană fără destinație, agresivitate în locul determinării, epuizare mascată în ambiție.',
      en: 'Racing with no destination, aggression instead of resolve, burnout dressed as ambition.',
      ru: 'Гонка без цели, агрессия вместо решимости, выгорание под видом амбиций.',
    },
    task: {
      ro: 'Alege destinația înainte de a accelera.',
      en: 'Choose the destination before you accelerate.',
      ru: 'Выберите пункт назначения прежде, чем ускоряться.',
    },
  },
  {
    n: 8,
    title: { ro: 'Dreptatea', en: 'Justice', ru: 'Справедливость' },
    keywords: {
      ro: ['Echilibru', 'Adevăr', 'Consecință', 'Claritate'],
      en: ['Balance', 'Truth', 'Consequence', 'Clarity'],
      ru: ['Равновесие', 'Истина', 'Последствие', 'Ясность'],
    },
    light: {
      ro: 'Vezi lucrurile așa cum sunt și acționezi în consecință. Cuvântul tău cântărește.',
      en: 'You see things as they are and act accordingly. Your word carries weight.',
      ru: 'Вы видите вещи как они есть и действуете соответственно. Ваше слово весомо.',
    },
    shadow: {
      ro: 'Judecată aspră, nevoia de a avea dreptate, rigiditate morală aplicată selectiv.',
      en: 'Harsh judgment, the need to be right, moral rigidity applied selectively.',
      ru: 'Жёсткое осуждение, потребность быть правым, избирательная моральная жёсткость.',
    },
    task: {
      ro: 'Aplică-ți propriile standarde întâi ție, apoi celorlalți.',
      en: 'Apply your own standards to yourself first, then to others.',
      ru: 'Применяйте свои стандарты сначала к себе, потом к другим.',
    },
  },
  {
    n: 9,
    title: { ro: 'Eremitul', en: 'The Hermit', ru: 'Отшельник' },
    keywords: {
      ro: ['Retragere', 'Înțelepciune', 'Căutare', 'Singurătate'],
      en: ['Retreat', 'Wisdom', 'Search', 'Solitude'],
      ru: ['Уединение', 'Мудрость', 'Поиск', 'Одиночество'],
    },
    light: {
      ro: 'Găsești răspunsurile în liniște și le oferi celor care le caută. Prezența ta calmează.',
      en: 'You find answers in stillness and offer them to those searching. Your presence steadies people.',
      ru: 'Вы находите ответы в тишине и делитесь с ищущими. Ваше присутствие успокаивает.',
    },
    shadow: {
      ro: 'Izolare aleasă din teamă, superioritate tăcută, refuzul ajutorului.',
      en: 'Isolation chosen out of fear, silent superiority, refusal of help.',
      ru: 'Изоляция из страха, молчаливое превосходство, отказ от помощи.',
    },
    task: {
      ro: 'Ieși din retragere destul cât să dai mai departe ce ai aflat.',
      en: 'Come out of retreat far enough to pass on what you have learned.',
      ru: 'Выйдите из уединения настолько, чтобы передать найденное.',
    },
  },
  {
    n: 10,
    title: { ro: 'Roata Norocului', en: 'Wheel of Fortune', ru: 'Колесо Фортуны' },
    keywords: {
      ro: ['Ciclu', 'Șansă', 'Schimbare', 'Destin'],
      en: ['Cycle', 'Chance', 'Change', 'Fate'],
      ru: ['Цикл', 'Шанс', 'Перемена', 'Судьба'],
    },
    light: {
      ro: 'Prinzi momentul potrivit. Viața ta se mișcă în valuri și știi să înoți cu ele.',
      en: 'You catch the right moment. Your life moves in waves and you know how to swim with them.',
      ru: 'Вы ловите нужный момент. Ваша жизнь движется волнами, и вы плывёте с ними.',
    },
    shadow: {
      ro: 'Pasivitate în fața hazardului, joc de noroc, așteptarea salvării din exterior.',
      en: 'Passivity before chance, gambling, waiting for rescue from outside.',
      ru: 'Пассивность перед случаем, азарт, ожидание спасения извне.',
    },
    task: {
      ro: 'Recunoaște ce ține de tine în ceea ce numești noroc sau ghinion.',
      en: 'Recognise your own part in what you call luck or misfortune.',
      ru: 'Признайте свою роль в том, что называете удачей или невезением.',
    },
  },
  {
    n: 11,
    title: { ro: 'Forța', en: 'Strength', ru: 'Сила' },
    keywords: {
      ro: ['Blândețe', 'Curaj', 'Stăpânire', 'Vitalitate'],
      en: ['Gentleness', 'Courage', 'Mastery', 'Vitality'],
      ru: ['Мягкость', 'Мужество', 'Владение', 'Витальность'],
    },
    light: {
      ro: 'Îmblânzești prin calm ce alții încearcă să învingă prin forță. Curajul tău e liniștit.',
      en: 'You tame with calm what others try to defeat by force. Your courage is quiet.',
      ru: 'Вы укрощаете спокойствием то, что другие ломают силой. Ваше мужество тихое.',
    },
    shadow: {
      ro: 'Reprimarea propriilor instincte, control cu prețul vitalității, izbucniri bruște.',
      en: 'Suppressing your own instincts, control at the cost of vitality, sudden outbursts.',
      ru: 'Подавление инстинктов, контроль ценой жизненной силы, внезапные срывы.',
    },
    task: {
      ro: 'Împrietenește-te cu partea din tine pe care încerci s-o ții în lesă.',
      en: 'Make peace with the part of you that you keep on a leash.',
      ru: 'Подружитесь с той частью себя, которую держите на поводке.',
    },
  },
  {
    n: 12,
    title: { ro: 'Spânzuratul', en: 'The Hanged Man', ru: 'Повешенный' },
    keywords: {
      ro: ['Pauză', 'Perspectivă', 'Sacrificiu', 'Predare'],
      en: ['Pause', 'Perspective', 'Sacrifice', 'Surrender'],
      ru: ['Пауза', 'Перспектива', 'Жертва', 'Принятие'],
    },
    light: {
      ro: 'Vezi altfel pentru că ai acceptat să stai pe loc. Renunțarea ta e alegere, nu înfrângere.',
      en: 'You see differently because you agreed to stand still. Your letting go is a choice, not a defeat.',
      ru: 'Вы видите иначе, потому что согласились остановиться. Ваш отказ — выбор, а не поражение.',
    },
    shadow: {
      ro: 'Victimizare, sacrificiu care cere plată, blocaj prezentat drept răbdare.',
      en: 'Victimhood, sacrifice that demands payment, stagnation presented as patience.',
      ru: 'Жертвенность с оплатой, застой под видом терпения, роль жертвы.',
    },
    task: {
      ro: 'Renunță la ceva fără să ții socoteala.',
      en: 'Give something up without keeping score.',
      ru: 'Откажитесь от чего-то, не ведя счёт.',
    },
  },
  {
    n: 13,
    title: { ro: 'Transformarea', en: 'Death / Transformation', ru: 'Смерть / Трансформация' },
    keywords: {
      ro: ['Sfârșit', 'Reînnoire', 'Eliberare', 'Prag'],
      en: ['Ending', 'Renewal', 'Release', 'Threshold'],
      ru: ['Завершение', 'Обновление', 'Освобождение', 'Порог'],
    },
    light: {
      ro: 'Închizi ce s-a terminat și faci loc. Capacitatea ta de a lăsa în urmă e o forță rară.',
      en: 'You close what is finished and make room. Your ability to leave things behind is a rare strength.',
      ru: 'Вы закрываете завершённое и освобождаете место. Умение отпускать — редкая сила.',
    },
    shadow: {
      ro: 'Agățare de ce s-a încheiat, teamă de schimbare, distrugere ca reflex.',
      en: 'Clinging to what has ended, fear of change, destruction as a reflex.',
      ru: 'Цепляние за законченное, страх перемен, разрушение как рефлекс.',
    },
    task: {
      ro: 'Recunoaște ce s-a terminat deja și nu mai ține în viață artificial.',
      en: 'Name what has already ended and stop keeping it artificially alive.',
      ru: 'Признайте то, что уже закончилось, и перестаньте искусственно продлевать.',
    },
  },
  {
    n: 14,
    title: { ro: 'Cumpătarea', en: 'Temperance', ru: 'Умеренность' },
    keywords: {
      ro: ['Măsură', 'Alchimie', 'Răbdare', 'Amestec'],
      en: ['Measure', 'Alchemy', 'Patience', 'Blending'],
      ru: ['Мера', 'Алхимия', 'Терпение', 'Смешение'],
    },
    light: {
      ro: 'Combini opusuri și obții ceva nou. Ritmul tău e sustenabil.',
      en: 'You combine opposites and get something new. Your pace is sustainable.',
      ru: 'Вы соединяете противоположности и получаете новое. Ваш ритм устойчив.',
    },
    shadow: {
      ro: 'Excese urmate de restricții, incapacitatea de a te opri la timp, compromis permanent.',
      en: 'Excess followed by restriction, inability to stop in time, permanent compromise.',
      ru: 'Излишества и ограничения по кругу, неумение вовремя остановиться.',
    },
    task: {
      ro: 'Găsește măsura care nu e nici renunțare, nici exces.',
      en: 'Find the measure that is neither denial nor excess.',
      ru: 'Найдите меру, которая не отказ и не излишество.',
    },
  },
  {
    n: 15,
    title: { ro: 'Diavolul', en: 'The Devil', ru: 'Дьявол' },
    keywords: {
      ro: ['Atracție', 'Legătură', 'Materie', 'Umbră'],
      en: ['Attraction', 'Bondage', 'Matter', 'Shadow'],
      ru: ['Притяжение', 'Привязка', 'Материя', 'Тень'],
    },
    light: {
      ro: 'Ai magnetism și înțelegi puterea dorinței. Știi să lucrezi cu materia și cu banii.',
      en: 'You have magnetism and understand the power of desire. You know how to work with matter and money.',
      ru: 'У вас магнетизм и понимание силы желания. Вы умеете работать с материей и деньгами.',
    },
    shadow: {
      ro: 'Dependențe, relații care leagă în loc să elibereze, justificarea a ceea ce te consumă.',
      en: 'Addictions, relationships that bind rather than free, justifying what consumes you.',
      ru: 'Зависимости, связывающие отношения, оправдание того, что вас поглощает.',
    },
    task: {
      ro: 'Numește lanțul pe care singur ți l-ai pus și verifică dacă e încuiat.',
      en: 'Name the chain you put on yourself and check whether it is even locked.',
      ru: 'Назовите цепь, которую надели сами, и проверьте, заперта ли она.',
    },
  },
  {
    n: 16,
    title: { ro: 'Turnul', en: 'The Tower', ru: 'Башня' },
    keywords: {
      ro: ['Ruptură', 'Adevăr brusc', 'Prăbușire', 'Eliberare'],
      en: ['Rupture', 'Sudden truth', 'Collapse', 'Release'],
      ru: ['Разрыв', 'Внезапная правда', 'Крушение', 'Освобождение'],
    },
    light: {
      ro: 'Ce se prăbușește la tine era construit strâmb. Ai capacitatea de a reconstrui repede și mai bine.',
      en: 'What collapses in your life was built crooked. You can rebuild quickly and better.',
      ru: 'То, что рушится, было построено криво. Вы способны отстроить быстрее и лучше.',
    },
    shadow: {
      ro: 'Crize provocate inconștient, trufie înaintea căderii, refuzul de a vedea semnele.',
      en: 'Crises unconsciously provoked, pride before the fall, refusing to read the signs.',
      ru: 'Кризисы, спровоцированные неосознанно, гордыня перед падением, игнорирование знаков.',
    },
    task: {
      ro: 'Demontează singur ce știi că nu stă drept, înainte să cadă peste tine.',
      en: 'Take down yourself what you know is not standing straight, before it falls on you.',
      ru: 'Разберите сами то, что стоит криво, пока оно не упало на вас.',
    },
  },
  {
    n: 17,
    title: { ro: 'Steaua', en: 'The Star', ru: 'Звезда' },
    keywords: {
      ro: ['Speranță', 'Inspirație', 'Vindecare', 'Vizibilitate'],
      en: ['Hope', 'Inspiration', 'Healing', 'Visibility'],
      ru: ['Надежда', 'Вдохновение', 'Исцеление', 'Видимость'],
    },
    light: {
      ro: 'Ești reper pentru alții fără efort. Ai acces la inspirație și la vindecare, a ta și a altora.',
      en: 'You are a reference point for others without trying. You have access to inspiration and healing, yours and other people’s.',
      ru: 'Вы ориентир для других без усилий. У вас есть доступ к вдохновению и исцелению.',
    },
    shadow: {
      ro: 'Idealizare, așteptări nerealiste, nevoie de admirație pentru a te simți real.',
      en: 'Idealisation, unrealistic expectations, needing admiration to feel real.',
      ru: 'Идеализация, нереальные ожидания, потребность в восхищении.',
    },
    task: {
      ro: 'Lasă-te văzut așa cum ești, nu doar cum strălucești.',
      en: 'Let yourself be seen as you are, not only as you shine.',
      ru: 'Позвольте видеть себя настоящим, а не только сияющим.',
    },
  },
  {
    n: 18,
    title: { ro: 'Luna', en: 'The Moon', ru: 'Луна' },
    keywords: {
      ro: ['Subconștient', 'Iluzie', 'Frică', 'Imaginație'],
      en: ['Subconscious', 'Illusion', 'Fear', 'Imagination'],
      ru: ['Подсознание', 'Иллюзия', 'Страх', 'Воображение'],
    },
    light: {
      ro: 'Ai o imaginație puternică și acces la ce e sub suprafață. Simți atmosfera dintr-o cameră.',
      en: 'You have strong imagination and access to what lies beneath. You feel the atmosphere of a room.',
      ru: 'У вас сильное воображение и доступ к подповерхностному. Вы чувствуете атмосферу.',
    },
    shadow: {
      ro: 'Anxietate difuză, scenarii construite în minte, confuzie între intuiție și teamă.',
      en: 'Diffuse anxiety, scenarios built in the mind, confusing intuition with fear.',
      ru: 'Размытая тревога, сценарии в голове, путаница интуиции и страха.',
    },
    task: {
      ro: 'Verifică în realitate ce ți-a spus frica.',
      en: 'Check against reality what fear told you.',
      ru: 'Проверьте в реальности то, что сказал страх.',
    },
  },
  {
    n: 19,
    title: { ro: 'Soarele', en: 'The Sun', ru: 'Солнце' },
    keywords: {
      ro: ['Claritate', 'Bucurie', 'Succes', 'Vizibilitate'],
      en: ['Clarity', 'Joy', 'Success', 'Visibility'],
      ru: ['Ясность', 'Радость', 'Успех', 'Видимость'],
    },
    light: {
      ro: 'Aduci claritate și căldură. Reușita ta e vizibilă și nu are nevoie de explicații.',
      en: 'You bring clarity and warmth. Your success is visible and needs no explaining.',
      ru: 'Вы приносите ясность и тепло. Ваш успех виден и не требует объяснений.',
    },
    shadow: {
      ro: 'Egocentrism, nevoia de a fi mereu în centru, optimism care refuză realitatea.',
      en: 'Self-centredness, needing to be always at the centre, optimism that refuses reality.',
      ru: 'Эгоцентризм, потребность быть в центре, оптимизм, отрицающий реальность.',
    },
    task: {
      ro: 'Luminează și pe alții, nu doar drumul tău.',
      en: 'Light other people’s way too, not only your own.',
      ru: 'Освещайте и чужой путь, не только свой.',
    },
  },
  {
    n: 20,
    title: { ro: 'Judecata', en: 'Judgement', ru: 'Суд' },
    keywords: {
      ro: ['Trezire', 'Chemare', 'Bilanț', 'Renaștere'],
      en: ['Awakening', 'Calling', 'Reckoning', 'Rebirth'],
      ru: ['Пробуждение', 'Призвание', 'Итог', 'Возрождение'],
    },
    light: {
      ro: 'Auzi chemarea și răspunzi. Ai capacitatea de a-ți reevalua viața fără să te distrugi.',
      en: 'You hear the call and answer it. You can re-evaluate your life without destroying yourself.',
      ru: 'Вы слышите зов и отвечаете. Вы способны переоценить жизнь, не разрушая себя.',
    },
    shadow: {
      ro: 'Autocritică distructivă, judecarea trecutului cu ochii prezentului, amânarea chemării.',
      en: 'Destructive self-criticism, judging the past with today’s eyes, postponing the call.',
      ru: 'Разрушительная самокритика, суд над прошлым из настоящего, откладывание зова.',
    },
    task: {
      ro: 'Iartă versiunea ta de atunci, care lucra cu ce știa atunci.',
      en: 'Forgive the version of you that worked with what it knew at the time.',
      ru: 'Простите себя прежнего — он работал с тем, что знал тогда.',
    },
  },
  {
    n: 21,
    title: { ro: 'Lumea', en: 'The World', ru: 'Мир' },
    keywords: {
      ro: ['Împlinire', 'Integrare', 'Deschidere', 'Ciclu închis'],
      en: ['Completion', 'Integration', 'Openness', 'Closed cycle'],
      ru: ['Завершение', 'Интеграция', 'Открытость', 'Замкнутый цикл'],
    },
    light: {
      ro: 'Duci lucrurile până la capăt și le integrezi. Lumea largă îți răspunde — călătorii, oameni, oportunități.',
      en: 'You take things all the way and integrate them. The wider world responds to you — travel, people, opportunity.',
      ru: 'Вы доводите до конца и интегрируете. Большой мир откликается — поездки, люди, возможности.',
    },
    shadow: {
      ro: 'Amânarea finalizării, fugă permanentă spre următorul loc, teamă de a încheia.',
      en: 'Postponing completion, permanent flight to the next place, fear of finishing.',
      ru: 'Откладывание завершения, вечный побег в следующее место, страх закончить.',
    },
    task: {
      ro: 'Termină un lucru complet înainte de a începe următorul.',
      en: 'Finish one thing completely before beginning the next.',
      ru: 'Завершите одно дело полностью, прежде чем начать следующее.',
    },
  },
  {
    n: 22,
    title: { ro: 'Nebunul', en: 'The Fool', ru: 'Шут' },
    keywords: {
      ro: ['Libertate', 'Început pur', 'Risc', 'Încredere'],
      en: ['Freedom', 'Pure beginning', 'Risk', 'Trust'],
      ru: ['Свобода', 'Чистое начало', 'Риск', 'Доверие'],
    },
    light: {
      ro: 'Pornești fără garanții și ajungi unde alții nu îndrăznesc. Nu porți greutatea trecutului.',
      en: 'You set out without guarantees and arrive where others do not dare. You do not carry the weight of the past.',
      ru: 'Вы отправляетесь без гарантий и доходите туда, куда другие не решаются.',
    },
    shadow: {
      ro: 'Iresponsabilitate, fugă de angajament, riscuri asumate din inconștiență, nu din curaj.',
      en: 'Irresponsibility, avoidance of commitment, risks taken from obliviousness rather than courage.',
      ru: 'Безответственность, бегство от обязательств, риск от беспечности, а не смелости.',
    },
    task: {
      ro: 'Rămâi într-un loc destul cât să vezi ce crește acolo.',
      en: 'Stay in one place long enough to see what grows there.',
      ru: 'Останьтесь на одном месте достаточно, чтобы увидеть, что там растёт.',
    },
  },
];

export const ARCANA_BY_N: Record<number, Arcana> =
  Object.fromEntries(ARCANA.map((a) => [a.n, a]));

/** Rama de interpretare pentru fiecare poziție a octagramei. */
export const MATRIX_POSITION_FRAME: Record<string, Record<Lang, string>> = {
  A: { ro: 'Cine ești în ochii lumii și cum intri în situații noi.',
       en: 'Who you are in the eyes of the world and how you enter new situations.',
       ru: 'Кто вы в глазах мира и как входите в новые ситуации.' },
  B: { ro: 'Talentul cu care ai venit și resursa pe care te poți baza.',
       en: 'The talent you arrived with and the resource you can rely on.',
       ru: 'Талант, с которым вы пришли, и ресурс, на который опираетесь.' },
  C: { ro: 'Moștenirea de familie și tiparul pe care îl repeți fără să vrei.',
       en: 'The family inheritance and the pattern you repeat without meaning to.',
       ru: 'Родовое наследие и паттерн, который вы повторяете невольно.' },
  D: { ro: 'Sarcina de care nu poți scăpa până nu o rezolvi.',
       en: 'The task you cannot escape until you resolve it.',
       ru: 'Задача, от которой не уйти, пока не решите.' },
  E: { ro: 'Zona ta de confort — unde te retragi și unde te regăsești.',
       en: 'Your comfort zone — where you retreat and where you find yourself again.',
       ru: 'Ваша зона комфорта — куда вы уходите и где находите себя.' },
  F: { ro: 'Puntea dintre cine ești și ce știi să faci.',
       en: 'The bridge between who you are and what you can do.',
       ru: 'Мост между тем, кто вы есть, и тем, что умеете.' },
  G: { ro: 'Cum îți transformi talentul în rezultat vizibil.',
       en: 'How you turn talent into visible result.',
       ru: 'Как вы превращаете талант в видимый результат.' },
  H: { ro: 'Unde se întâlnesc identitatea ta și sarcina ta de viață.',
       en: 'Where your identity and your life task meet.',
       ru: 'Где встречаются ваша личность и жизненная задача.' },
  I: { ro: 'Cum se manifestă moștenirea în alegerile tale zilnice.',
       en: 'How the inheritance shows up in your daily choices.',
       ru: 'Как наследие проявляется в ежедневных выборах.' },
};
