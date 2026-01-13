/**
 * Angel Numbers - Spiritual Number Meanings
 *
 * Angel numbers are sequences of numbers that carry divine guidance
 * by referring to specific numerological meanings.
 */

import { Language } from './translations';

export interface AngelNumberMeaning {
  number: string;
  title: Record<Language, string>;
  shortMessage: Record<Language, string>;
  fullMeaning: Record<Language, string>;
  spiritualSignificance: Record<Language, string>;
  actionAdvice: Record<Language, string[]>;
  relatedNumbers: string[];
  keywords: Record<Language, string[]>;
  frequency: 'common' | 'uncommon' | 'rare';
}

// Common angel numbers and their meanings
export const ANGEL_NUMBERS: Record<string, AngelNumberMeaning> = {
  '111': {
    number: '111',
    title: {
      ro: 'Manifestare și Noi Începuturi',
      en: 'Manifestation & New Beginnings',
      ru: 'Проявление и Новые Начинания',
    },
    shortMessage: {
      ro: 'Gândurile tale devin realitate. Fii atent la ce gândești!',
      en: 'Your thoughts are becoming reality. Be mindful of what you think!',
      ru: 'Твои мысли становятся реальностью. Следи за тем, о чём думаешь!',
    },
    fullMeaning: {
      ro: 'Numărul 111 este un semn puternic de la univers că gândurile tale se manifestă rapid în realitate. Este timpul să te concentrezi pe dorințele tale pozitive și să elimini orice negativitate. Îngerul păzitor îți spune că ești pe calea corectă și că abilitățile tale de manifestare sunt puternice în acest moment.',
      en: 'The number 111 is a powerful sign from the universe that your thoughts are manifesting rapidly into reality. It is time to focus on your positive desires and eliminate any negativity. Your guardian angel is telling you that you are on the right path and your manifestation abilities are powerful right now.',
      ru: 'Число 111 — это мощный знак от Вселенной о том, что твои мысли быстро воплощаются в реальность. Пришло время сосредоточиться на позитивных желаниях и устранить негатив. Твой ангел-хранитель говорит, что ты на правильном пути, и твои способности к проявлению сейчас очень сильны.',
    },
    spiritualSignificance: {
      ro: 'Portal spiritual deschis; conexiune directă cu divinitatea.',
      en: 'Spiritual portal open; direct connection with divinity.',
      ru: 'Духовный портал открыт; прямая связь с божественным.',
    },
    actionAdvice: {
      ro: [
        'Monitorizează-ți gândurile - concentrează-te doar pe pozitiv',
        'Scrie-ți intențiile și dorințele',
        'Meditează pentru claritate',
        'Fă primul pas către un obiectiv nou',
      ],
      en: [
        'Monitor your thoughts - focus only on positive',
        'Write down your intentions and desires',
        'Meditate for clarity',
        'Take the first step toward a new goal',
      ],
      ru: [
        'Следи за мыслями - концентрируйся только на позитивном',
        'Запиши свои намерения и желания',
        'Медитируй для ясности',
        'Сделай первый шаг к новой цели',
      ],
    },
    relatedNumbers: ['11', '1111', '1'],
    keywords: {
      ro: ['manifestare', 'începuturi', 'gânduri', 'creație'],
      en: ['manifestation', 'beginnings', 'thoughts', 'creation'],
      ru: ['проявление', 'начинания', 'мысли', 'творение'],
    },
    frequency: 'common',
  },
  '222': {
    number: '222',
    title: {
      ro: 'Echilibru și Armonie',
      en: 'Balance & Harmony',
      ru: 'Баланс и Гармония',
    },
    shortMessage: {
      ro: 'Ai încredere în proces. Totul se desfășoară perfect.',
      en: 'Trust the process. Everything is unfolding perfectly.',
      ru: 'Доверься процессу. Всё разворачивается идеально.',
    },
    fullMeaning: {
      ro: 'Numărul 222 este un mesaj de încurajare că ești pe drumul cel bun. Îngerii îți cer să menții echilibrul și armonia în toate aspectele vieții tale. Fii răbdător, pentru că semințele pe care le-ai plantat încep să crească. Este un semn să ai încredere în parteneriate și colaborări.',
      en: 'The number 222 is a message of encouragement that you are on the right path. Angels are asking you to maintain balance and harmony in all aspects of your life. Be patient, as the seeds you have planted are beginning to grow. It is a sign to trust in partnerships and collaborations.',
      ru: 'Число 222 — это послание поддержки о том, что ты на правильном пути. Ангелы просят тебя сохранять баланс и гармонию во всех аспектах жизни. Будь терпелив, семена, которые ты посеял, начинают прорастать. Это знак доверять партнёрству и сотрудничеству.',
    },
    spiritualSignificance: {
      ro: 'Alinierea energiilor; echilibru între dualități.',
      en: 'Energy alignment; balance between dualities.',
      ru: 'Выравнивание энергий; баланс между двойственностями.',
    },
    actionAdvice: {
      ro: [
        'Practică răbdarea în toate situațiile',
        'Caută echilibrul în relații',
        'Cooperează cu ceilalți',
        'Ai încredere în timing-ul divin',
      ],
      en: [
        'Practice patience in all situations',
        'Seek balance in relationships',
        'Cooperate with others',
        'Trust in divine timing',
      ],
      ru: [
        'Практикуй терпение во всех ситуациях',
        'Ищи баланс в отношениях',
        'Сотрудничай с другими',
        'Доверься божественному времени',
      ],
    },
    relatedNumbers: ['22', '2222', '2'],
    keywords: {
      ro: ['echilibru', 'armonie', 'răbdare', 'parteneriat'],
      en: ['balance', 'harmony', 'patience', 'partnership'],
      ru: ['баланс', 'гармония', 'терпение', 'партнёрство'],
    },
    frequency: 'common',
  },
  '333': {
    number: '333',
    title: {
      ro: 'Protecție și Ghidare Divină',
      en: 'Protection & Divine Guidance',
      ru: 'Защита и Божественное Руководство',
    },
    shortMessage: {
      ro: 'Maeștrii Ascensionați sunt cu tine. Exprimă-ți adevărul!',
      en: 'Ascended Masters are with you. Express your truth!',
      ru: 'Вознесённые Мастера с тобой. Выражай свою истину!',
    },
    fullMeaning: {
      ro: 'Când vezi 333, Maeștrii Ascensionați și îngerii îți sunt aproape, oferindu-ți ghidare și protecție. Este un semn să-ți exprimi creativitatea și să comunici autentic. Numărul te încurajează să-ți urmezi pasiunile și să-ți folosești darurile pentru a ajuta pe alții.',
      en: 'When you see 333, the Ascended Masters and angels are near, offering you guidance and protection. It is a sign to express your creativity and communicate authentically. The number encourages you to follow your passions and use your gifts to help others.',
      ru: 'Когда ты видишь 333, Вознесённые Мастера и ангелы рядом, предлагая руководство и защиту. Это знак выражать свою креативность и общаться аутентично. Число побуждает следовать своим страстям и использовать дары, чтобы помогать другим.',
    },
    spiritualSignificance: {
      ro: 'Prezența Maeștrilor Ascensionați; trinitatea divină.',
      en: 'Presence of Ascended Masters; divine trinity.',
      ru: 'Присутствие Вознесённых Мастеров; божественная троица.',
    },
    actionAdvice: {
      ro: [
        'Exprimă-te creativ',
        'Vorbește adevărul tău',
        'Folosește-ți talentele pentru binele altora',
        'Cere ajutorul Maeștrilor Ascensionați',
      ],
      en: [
        'Express yourself creatively',
        'Speak your truth',
        'Use your talents for the good of others',
        'Ask for help from Ascended Masters',
      ],
      ru: [
        'Выражай себя творчески',
        'Говори свою правду',
        'Используй таланты для блага других',
        'Проси помощи у Вознесённых Мастеров',
      ],
    },
    relatedNumbers: ['33', '3333', '3'],
    keywords: {
      ro: ['creativitate', 'comunicare', 'ghidare', 'exprimare'],
      en: ['creativity', 'communication', 'guidance', 'expression'],
      ru: ['креативность', 'общение', 'руководство', 'выражение'],
    },
    frequency: 'common',
  },
  '444': {
    number: '444',
    title: {
      ro: 'Protecție și Fundament Solid',
      en: 'Protection & Solid Foundation',
      ru: 'Защита и Прочный Фундамент',
    },
    shortMessage: {
      ro: 'Ești protejat și susținut. Construiește cu încredere!',
      en: 'You are protected and supported. Build with confidence!',
      ru: 'Ты защищён и поддержан. Строй с уверенностью!',
    },
    fullMeaning: {
      ro: 'Numărul 444 este un semn puternic că îngerii te înconjoară și te protejează. Este un mesaj că ești pe drumul cel bun și că fundamentul pe care îl construiești este solid. Continuă să muncești cu dedicare, pentru că eforturile tale vor fi răsplătite.',
      en: 'The number 444 is a powerful sign that angels surround and protect you. It is a message that you are on the right path and the foundation you are building is solid. Continue working with dedication, as your efforts will be rewarded.',
      ru: 'Число 444 — это мощный знак того, что ангелы окружают и защищают тебя. Это послание о том, что ты на правильном пути, и фундамент, который строишь, прочен. Продолжай работать с самоотдачей, твои усилия будут вознаграждены.',
    },
    spiritualSignificance: {
      ro: 'Protecție angelică completă; stabilitate divină.',
      en: 'Complete angelic protection; divine stability.',
      ru: 'Полная ангельская защита; божественная стабильность.',
    },
    actionAdvice: {
      ro: [
        'Continuă să lucrezi cu perseverență',
        'Construiește fundații solide în toate proiectele',
        'Ai încredere în protecția divină',
        'Fii disciplinat și organizat',
      ],
      en: [
        'Continue working with perseverance',
        'Build solid foundations in all projects',
        'Trust in divine protection',
        'Be disciplined and organized',
      ],
      ru: [
        'Продолжай работать с упорством',
        'Строй прочные основы во всех проектах',
        'Доверься божественной защите',
        'Будь дисциплинированным и организованным',
      ],
    },
    relatedNumbers: ['44', '4444', '4'],
    keywords: {
      ro: ['protecție', 'fundament', 'stabilitate', 'muncă'],
      en: ['protection', 'foundation', 'stability', 'work'],
      ru: ['защита', 'фундамент', 'стабильность', 'работа'],
    },
    frequency: 'common',
  },
  '555': {
    number: '555',
    title: {
      ro: 'Schimbare Majoră',
      en: 'Major Change',
      ru: 'Большие Перемены',
    },
    shortMessage: {
      ro: 'Schimbări mari vin. Pregătește-te pentru transformare!',
      en: 'Big changes are coming. Prepare for transformation!',
      ru: 'Большие перемены на подходе. Готовься к трансформации!',
    },
    fullMeaning: {
      ro: 'Când vezi 555, universul te pregătește pentru schimbări semnificative în viața ta. Nu te teme de aceste transformări, pentru că sunt necesare pentru creșterea ta spirituală. Eliberează ceea ce nu-ți mai servește și îmbrățișează noul cu brațele deschise.',
      en: 'When you see 555, the universe is preparing you for significant changes in your life. Do not fear these transformations, as they are necessary for your spiritual growth. Release what no longer serves you and embrace the new with open arms.',
      ru: 'Когда ты видишь 555, Вселенная готовит тебя к значительным переменам в жизни. Не бойся этих трансформаций, они необходимы для духовного роста. Отпусти то, что больше не служит тебе, и прими новое с открытыми объятиями.',
    },
    spiritualSignificance: {
      ro: 'Transformare spirituală; portal de schimbare.',
      en: 'Spiritual transformation; portal of change.',
      ru: 'Духовная трансформация; портал перемен.',
    },
    actionAdvice: {
      ro: [
        'Fii deschis la schimbare',
        'Eliberează vechile obiceiuri',
        'Îmbrățișează necunoscutul',
        'Ai încredere în procesul de transformare',
      ],
      en: [
        'Be open to change',
        'Release old habits',
        'Embrace the unknown',
        'Trust the transformation process',
      ],
      ru: [
        'Будь открыт переменам',
        'Отпусти старые привычки',
        'Прими неизвестное',
        'Доверься процессу трансформации',
      ],
    },
    relatedNumbers: ['55', '5555', '5'],
    keywords: {
      ro: ['schimbare', 'transformare', 'libertate', 'aventură'],
      en: ['change', 'transformation', 'freedom', 'adventure'],
      ru: ['перемены', 'трансформация', 'свобода', 'приключения'],
    },
    frequency: 'common',
  },
  '666': {
    number: '666',
    title: {
      ro: 'Echilibru și Grijă de Sine',
      en: 'Balance & Self-Care',
      ru: 'Баланс и Забота о Себе',
    },
    shortMessage: {
      ro: 'Reechilibrează-te. Concentrează-te pe grija de sine și familie.',
      en: 'Rebalance yourself. Focus on self-care and family.',
      ru: 'Восстанови баланс. Сосредоточься на заботе о себе и семье.',
    },
    fullMeaning: {
      ro: 'Contrar credinței populare, 666 nu este un număr negativ. Este un mesaj de la îngeri să reechilibrezi aspectele materiale și spirituale ale vieții tale. Ai grijă de tine și de cei dragi. Nu te concentra excesiv pe lucruri materiale în detrimentul sufletului.',
      en: 'Contrary to popular belief, 666 is not a negative number. It is a message from angels to rebalance the material and spiritual aspects of your life. Take care of yourself and loved ones. Do not focus excessively on material things at the expense of your soul.',
      ru: 'Вопреки распространённому мнению, 666 не является негативным числом. Это послание от ангелов восстановить баланс между материальными и духовными аспектами жизни. Заботься о себе и близких. Не концентрируйся чрезмерно на материальном в ущерб душе.',
    },
    spiritualSignificance: {
      ro: 'Reechilibrare necesară; atenție la aspectele domestice.',
      en: 'Rebalancing needed; attention to domestic aspects.',
      ru: 'Необходимо восстановление баланса; внимание к домашним аспектам.',
    },
    actionAdvice: {
      ro: [
        'Echilibrează munca cu viața personală',
        'Practică grija de sine',
        'Petrece timp cu familia',
        'Nu te îngrijora excesiv de aspectele materiale',
      ],
      en: [
        'Balance work with personal life',
        'Practice self-care',
        'Spend time with family',
        'Do not worry excessively about material aspects',
      ],
      ru: [
        'Сбалансируй работу и личную жизнь',
        'Практикуй заботу о себе',
        'Проводи время с семьёй',
        'Не беспокойся чрезмерно о материальном',
      ],
    },
    relatedNumbers: ['66', '6666', '6'],
    keywords: {
      ro: ['echilibru', 'familie', 'grijă', 'armonie'],
      en: ['balance', 'family', 'care', 'harmony'],
      ru: ['баланс', 'семья', 'забота', 'гармония'],
    },
    frequency: 'uncommon',
  },
  '777': {
    number: '777',
    title: {
      ro: 'Noroc Divin și Înțelepciune',
      en: 'Divine Luck & Wisdom',
      ru: 'Божественная Удача и Мудрость',
    },
    shortMessage: {
      ro: 'Ești aliniat cu universul. Miracole sunt pe drum!',
      en: 'You are aligned with the universe. Miracles are on the way!',
      ru: 'Ты в гармонии со Вселенной. Чудеса уже в пути!',
    },
    fullMeaning: {
      ro: 'Numărul 777 este unul dintre cele mai norocoase numere angelice. Este un semn că ești perfect aliniat cu scopul divin și că miracolele sunt pe cale să se întâmple în viața ta. Continuă să-ți urmezi intuiția și să cauți înțelepciunea spirituală.',
      en: 'The number 777 is one of the luckiest angel numbers. It is a sign that you are perfectly aligned with divine purpose and miracles are about to happen in your life. Continue to follow your intuition and seek spiritual wisdom.',
      ru: 'Число 777 — одно из самых счастливых ангельских чисел. Это знак идеальной гармонии с божественным предназначением, чудеса вот-вот произойдут в твоей жизни. Продолжай следовать интуиции и искать духовную мудрость.',
    },
    spiritualSignificance: {
      ro: 'Iluminare spirituală; conectare cu înțelepciunea divină.',
      en: 'Spiritual enlightenment; connection with divine wisdom.',
      ru: 'Духовное просветление; связь с божественной мудростью.',
    },
    actionAdvice: {
      ro: [
        'Urmează-ți intuiția',
        'Studiază și caută cunoaștere',
        'Meditează regulat',
        'Fii recunoscător pentru binecuvântări',
      ],
      en: [
        'Follow your intuition',
        'Study and seek knowledge',
        'Meditate regularly',
        'Be grateful for blessings',
      ],
      ru: [
        'Следуй интуиции',
        'Учись и ищи знания',
        'Медитируй регулярно',
        'Будь благодарен за благословения',
      ],
    },
    relatedNumbers: ['77', '7777', '7'],
    keywords: {
      ro: ['noroc', 'înțelepciune', 'spiritualitate', 'miracole'],
      en: ['luck', 'wisdom', 'spirituality', 'miracles'],
      ru: ['удача', 'мудрость', 'духовность', 'чудеса'],
    },
    frequency: 'common',
  },
  '888': {
    number: '888',
    title: {
      ro: 'Abundență și Prosperitate',
      en: 'Abundance & Prosperity',
      ru: 'Изобилие и Процветание',
    },
    shortMessage: {
      ro: 'Abundența financiară este pe drum. Fii deschis să primești!',
      en: 'Financial abundance is on the way. Be open to receive!',
      ru: 'Финансовое изобилие на подходе. Будь открыт получать!',
    },
    fullMeaning: {
      ro: 'Numărul 888 este un semn puternic de abundență și prosperitate care vine în viața ta. Este un ciclu de recompensă karmică - ceea ce ai semănat, acum vei culege. Fii pregătit să primești binecuvântările universului și să le folosești cu înțelepciune.',
      en: 'The number 888 is a powerful sign of abundance and prosperity coming into your life. It is a cycle of karmic reward - what you have sown, you will now reap. Be ready to receive the blessings of the universe and use them wisely.',
      ru: 'Число 888 — это мощный знак изобилия и процветания, которые входят в твою жизнь. Это цикл кармического вознаграждения — что посеял, то и пожнёшь. Будь готов принять благословения Вселенной и использовать их мудро.',
    },
    spiritualSignificance: {
      ro: 'Ciclu karmic de abundență; infinitul divin.',
      en: 'Karmic cycle of abundance; divine infinity.',
      ru: 'Кармический цикл изобилия; божественная бесконечность.',
    },
    actionAdvice: {
      ro: [
        'Fii deschis să primești abundență',
        'Împărtășește binecuvântările cu alții',
        'Investește în tine și în viitor',
        'Exprimă recunoștință pentru ceea ce ai',
      ],
      en: [
        'Be open to receiving abundance',
        'Share blessings with others',
        'Invest in yourself and your future',
        'Express gratitude for what you have',
      ],
      ru: [
        'Будь открыт принятию изобилия',
        'Делись благословениями с другими',
        'Инвестируй в себя и будущее',
        'Выражай благодарность за то, что имеешь',
      ],
    },
    relatedNumbers: ['88', '8888', '8'],
    keywords: {
      ro: ['abundență', 'prosperitate', 'succes', 'recompensă'],
      en: ['abundance', 'prosperity', 'success', 'reward'],
      ru: ['изобилие', 'процветание', 'успех', 'награда'],
    },
    frequency: 'common',
  },
  '999': {
    number: '999',
    title: {
      ro: 'Finalizare și Noi Începuturi',
      en: 'Completion & New Beginnings',
      ru: 'Завершение и Новые Начинания',
    },
    shortMessage: {
      ro: 'Un ciclu se încheie. Pregătește-te pentru un nou capitol!',
      en: 'A cycle is ending. Prepare for a new chapter!',
      ru: 'Цикл завершается. Готовься к новой главе!',
    },
    fullMeaning: {
      ro: 'Numărul 999 semnalează sfârșitul unui ciclu important în viața ta. Este un semn să eliberezi trecutul și să te pregătești pentru noi începuturi. Îngerii îți amintesc că fiecare sfârșit este un nou început și că ai misiunea de a ajuta pe alții cu înțelepciunea dobândită.',
      en: 'The number 999 signals the end of an important cycle in your life. It is a sign to release the past and prepare for new beginnings. Angels remind you that every ending is a new beginning and that you have a mission to help others with the wisdom you have gained.',
      ru: 'Число 999 сигнализирует об окончании важного цикла в твоей жизни. Это знак отпустить прошлое и подготовиться к новым начинаниям. Ангелы напоминают, что каждое окончание — это новое начало, и у тебя есть миссия помогать другим обретённой мудростью.',
    },
    spiritualSignificance: {
      ro: 'Completarea unui ciclu spiritual; misiune umanitară.',
      en: 'Completion of a spiritual cycle; humanitarian mission.',
      ru: 'Завершение духовного цикла; гуманитарная миссия.',
    },
    actionAdvice: {
      ro: [
        'Eliberează ce nu-ți mai servește',
        'Finalizează proiectele neterminate',
        'Pregătește-te pentru noi oportunități',
        'Ajută-i pe alții cu experiența ta',
      ],
      en: [
        'Release what no longer serves you',
        'Complete unfinished projects',
        'Prepare for new opportunities',
        'Help others with your experience',
      ],
      ru: [
        'Отпусти то, что больше не служит тебе',
        'Заверши незаконченные проекты',
        'Готовься к новым возможностям',
        'Помогай другим своим опытом',
      ],
    },
    relatedNumbers: ['99', '9999', '9'],
    keywords: {
      ro: ['finalizare', 'completare', 'eliberare', 'misiune'],
      en: ['completion', 'closure', 'release', 'mission'],
      ru: ['завершение', 'окончание', 'освобождение', 'миссия'],
    },
    frequency: 'common',
  },
  '000': {
    number: '000',
    title: {
      ro: 'Unitate Divină și Potențial Infinit',
      en: 'Divine Unity & Infinite Potential',
      ru: 'Божественное Единство и Бесконечный Потенциал',
    },
    shortMessage: {
      ro: 'Ești conectat cu tot ce există. Potențialul tău este infinit!',
      en: 'You are connected to all that exists. Your potential is infinite!',
      ru: 'Ты связан со всем сущим. Твой потенциал бесконечен!',
    },
    fullMeaning: {
      ro: 'Numărul 000 reprezintă unitatea cu Sursa Divină și posibilitățile infinite. Este un semn că ești la începutul unui nou ciclu spiritual și că ai acces la puterea creatoare a universului. Meditează asupra conexiunii tale cu tot ce există.',
      en: 'The number 000 represents unity with the Divine Source and infinite possibilities. It is a sign that you are at the beginning of a new spiritual cycle and have access to the creative power of the universe. Meditate on your connection to all that exists.',
      ru: 'Число 000 представляет единство с Божественным Источником и бесконечные возможности. Это знак начала нового духовного цикла и доступа к творческой силе Вселенной. Медитируй о своей связи со всем сущим.',
    },
    spiritualSignificance: {
      ro: 'Conectare cu Sursa; ciclu complet de creație.',
      en: 'Connection with Source; complete creation cycle.',
      ru: 'Связь с Источником; полный цикл творения.',
    },
    actionAdvice: {
      ro: [
        'Meditează asupra unității cu toate',
        'Recunoaște-ți potențialul infinit',
        'Începe proiecte noi cu încredere',
        'Conectează-te cu esența ta divină',
      ],
      en: [
        'Meditate on unity with all',
        'Recognize your infinite potential',
        'Start new projects with confidence',
        'Connect with your divine essence',
      ],
      ru: [
        'Медитируй о единстве со всем',
        'Осознай свой бесконечный потенциал',
        'Начинай новые проекты с уверенностью',
        'Соединись со своей божественной сущностью',
      ],
    },
    relatedNumbers: ['0', '00', '0000'],
    keywords: {
      ro: ['unitate', 'infinit', 'divin', 'potențial'],
      en: ['unity', 'infinity', 'divine', 'potential'],
      ru: ['единство', 'бесконечность', 'божественный', 'потенциал'],
    },
    frequency: 'uncommon',
  },
  '1111': {
    number: '1111',
    title: {
      ro: 'Portal de Manifestare',
      en: 'Manifestation Portal',
      ru: 'Портал Проявления',
    },
    shortMessage: {
      ro: 'Portal spiritual deschis! Gândurile tale sunt puternice acum.',
      en: 'Spiritual portal open! Your thoughts are powerful now.',
      ru: 'Духовный портал открыт! Твои мысли сейчас очень сильны.',
    },
    fullMeaning: {
      ro: 'Numărul 1111 este considerat cel mai puternic portal de manifestare. Când vezi acest număr, universul ascultă activ gândurile și dorințele tale. Este momentul perfect pentru a-ți clarifica intențiile și a te concentra pe ceea ce dorești cu adevărat să manifești.',
      en: 'The number 1111 is considered the most powerful manifestation portal. When you see this number, the universe is actively listening to your thoughts and desires. It is the perfect time to clarify your intentions and focus on what you truly want to manifest.',
      ru: 'Число 1111 считается самым мощным порталом проявления. Когда видишь это число, Вселенная активно слушает твои мысли и желания. Это идеальное время прояснить намерения и сосредоточиться на том, что действительно хочешь проявить.',
    },
    spiritualSignificance: {
      ro: 'Aliniere perfectă pentru manifestare; trezire spirituală.',
      en: 'Perfect alignment for manifestation; spiritual awakening.',
      ru: 'Идеальное выравнивание для проявления; духовное пробуждение.',
    },
    actionAdvice: {
      ro: [
        'Formulează-ți dorințele clar',
        'Gândește doar pozitiv',
        'Vizualizează rezultatul dorit',
        'Ia acțiune imediată spre scopuri',
      ],
      en: [
        'Formulate your desires clearly',
        'Think only positively',
        'Visualize the desired outcome',
        'Take immediate action toward goals',
      ],
      ru: [
        'Сформулируй желания чётко',
        'Думай только позитивно',
        'Визуализируй желаемый результат',
        'Действуй немедленно к целям',
      ],
    },
    relatedNumbers: ['111', '11', '1'],
    keywords: {
      ro: ['manifestare', 'trezire', 'portal', 'intenție'],
      en: ['manifestation', 'awakening', 'portal', 'intention'],
      ru: ['проявление', 'пробуждение', 'портал', 'намерение'],
    },
    frequency: 'uncommon',
  },
  '1234': {
    number: '1234',
    title: {
      ro: 'Progres și Simplificare',
      en: 'Progress & Simplification',
      ru: 'Прогресс и Упрощение',
    },
    shortMessage: {
      ro: 'Pași mici duc la succese mari. Simplificați-vă viața!',
      en: 'Small steps lead to big successes. Simplify your life!',
      ru: 'Маленькие шаги ведут к большим успехам. Упростите жизнь!',
    },
    fullMeaning: {
      ro: 'Când vezi 1234, îngerii îți spun să faci pași secvențiali către obiectivele tale. Nu încerca să sări etape. Simplificați-vă viața și concentrați-vă pe fundamentele importante. Progresul vine prin consecvență și răbdare.',
      en: 'When you see 1234, angels are telling you to take sequential steps toward your goals. Do not try to skip stages. Simplify your life and focus on important fundamentals. Progress comes through consistency and patience.',
      ru: 'Когда видишь 1234, ангелы говорят делать последовательные шаги к целям. Не пытайся пропускать этапы. Упрости жизнь и сосредоточься на важных основах. Прогресс приходит через последовательность и терпение.',
    },
    spiritualSignificance: {
      ro: 'Evoluție pas cu pas; ordine în haos.',
      en: 'Step-by-step evolution; order in chaos.',
      ru: 'Пошаговая эволюция; порядок в хаосе.',
    },
    actionAdvice: {
      ro: [
        'Creează un plan pas cu pas',
        'Simplifică-ți rutina',
        'Concentrează-te pe un lucru pe rând',
        'Elimină ce nu este esențial',
      ],
      en: [
        'Create a step-by-step plan',
        'Simplify your routine',
        'Focus on one thing at a time',
        'Eliminate what is not essential',
      ],
      ru: [
        'Создай пошаговый план',
        'Упрости рутину',
        'Концентрируйся на одном за раз',
        'Устрани несущественное',
      ],
    },
    relatedNumbers: ['1', '2', '3', '4'],
    keywords: {
      ro: ['progres', 'simplitate', 'ordine', 'pași'],
      en: ['progress', 'simplicity', 'order', 'steps'],
      ru: ['прогресс', 'простота', 'порядок', 'шаги'],
    },
    frequency: 'uncommon',
  },
};

/**
 * Look up an angel number meaning
 */
export const getAngelNumberMeaning = (number: string): AngelNumberMeaning | null => {
  // Clean the input
  const cleanNumber = number.replace(/\D/g, '');

  // Direct lookup
  if (ANGEL_NUMBERS[cleanNumber]) {
    return ANGEL_NUMBERS[cleanNumber];
  }

  // Check for repeating pattern (e.g., 1111 → 111)
  if (cleanNumber.length > 3) {
    const firstDigit = cleanNumber[0];
    const isRepeating = cleanNumber.split('').every((d) => d === firstDigit);
    if (isRepeating) {
      const reducedNumber = firstDigit.repeat(3);
      if (ANGEL_NUMBERS[reducedNumber]) {
        return ANGEL_NUMBERS[reducedNumber];
      }
    }
  }

  return null;
};

/**
 * Check if a number is an angel number
 */
export const isAngelNumber = (number: string): boolean => {
  return getAngelNumberMeaning(number) !== null;
};

/**
 * Get all angel numbers
 */
export const getAllAngelNumbers = (): AngelNumberMeaning[] => {
  return Object.values(ANGEL_NUMBERS);
};

/**
 * Get angel numbers by frequency
 */
export const getAngelNumbersByFrequency = (
  frequency: AngelNumberMeaning['frequency']
): AngelNumberMeaning[] => {
  return getAllAngelNumbers().filter((an) => an.frequency === frequency);
};

/**
 * Search angel numbers by keyword
 */
export const searchAngelNumbers = (
  query: string,
  language: Language
): AngelNumberMeaning[] => {
  const lowerQuery = query.toLowerCase();

  return getAllAngelNumbers().filter((an) => {
    // Check number
    if (an.number.includes(query)) return true;

    // Check title
    if (an.title[language].toLowerCase().includes(lowerQuery)) return true;

    // Check keywords
    if (an.keywords[language].some((k) => k.toLowerCase().includes(lowerQuery)))
      return true;

    return false;
  });
};
