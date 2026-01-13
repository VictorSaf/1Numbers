// Chaldean Numerology System
// Ancient Babylonian system using values 1-8 (no 9)
// More focused on name vibrations and compound numbers

// Chaldean letter values (different from Pythagorean)
// Note: 9 is considered sacred and not assigned to any letter
const CHALDEAN_VALUES: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Compound number meanings (11-52 are significant in Chaldean)
const COMPOUND_MEANINGS: Record<string, Record<number, { title: string; meaning: string; nature: 'positive' | 'negative' | 'neutral' }>> = {
  ro: {
    10: { title: 'Roata Norocului', meaning: 'Reprezintă onoare, încredere și ascensiune, dar poate aduce și căderi neașteptate. Simbolizează ciclul vieții.', nature: 'neutral' },
    11: { title: 'Leul Înmușcat', meaning: 'Avertizare de pericole ascunse, trădare și dificultăți. Necesită vigilență și prudență.', nature: 'negative' },
    12: { title: 'Sacrificiul', meaning: 'Sufeință și anxietate, dar și potențial de transcendență spirituală. Victimizare sau sacrificiu pentru alții.', nature: 'negative' },
    13: { title: 'Transformarea', meaning: 'Schimbare, transformare și regenerare. Deși considerat ghinionist, reprezintă puterea de a renaște.', nature: 'neutral' },
    14: { title: 'Temperanța', meaning: 'Mișcare, combinație de oameni și lucruri. Risc în afaceri și speculații, dar și potențial de câștig.', nature: 'neutral' },
    15: { title: 'Magicianul', meaning: 'Magnetism, elocvență și putere de a influența. Poate fi folosit pentru bine sau rău.', nature: 'neutral' },
    16: { title: 'Turnul Căzut', meaning: 'Distrugere bruscă, accidente, catastrofe. Un avertisment de a evita excesul de încredere.', nature: 'negative' },
    17: { title: 'Steaua', meaning: 'Unul dintre cele mai norocoase numere. Pace, speranță, intuiție și inspirație divină.', nature: 'positive' },
    18: { title: 'Luna', meaning: 'Conflicte, inamici ascunși, înșelăciune. Necesită precauție în relații și afaceri.', nature: 'negative' },
    19: { title: 'Soarele', meaning: 'Succes, fericire și realizare. Unul dintre cele mai favorabile numere compound.', nature: 'positive' },
    20: { title: 'Trezirea', meaning: 'Apel la acțiune, renaștere spirituală. Planuri și proiecte noi.', nature: 'positive' },
    21: { title: 'Universul', meaning: 'Avansare garantată, succes și onoare. Foarte favorabil pentru carieră.', nature: 'positive' },
    22: { title: 'Iluzia', meaning: 'Încredere excesivă în alții, posibile înșelăciuni. Trebuie să te bazezi pe propria judecată.', nature: 'negative' },
    23: { title: 'Leul Regal', meaning: 'Promisiune de succes, ajutor de la superiori, protecție. Foarte norocos.', nature: 'positive' },
    24: { title: 'Iubirea', meaning: 'Ajutor de la persoane influente, succes în dragoste și parteneriate.', nature: 'positive' },
    25: { title: 'Învățăturile', meaning: 'Succes prin încercare și eroare. Înțelepciune dobândită prin experiență.', nature: 'neutral' },
    26: { title: 'Parteneriatele', meaning: 'Avertizare despre parteneriate dezastruoase. Necesită alegerea atentă a asociaților.', nature: 'negative' },
    27: { title: 'Sceptrul', meaning: 'Autoritate, comandă și recompensă pentru eforturile creative.', nature: 'positive' },
    28: { title: 'Incertitudinea', meaning: 'Câștiguri urmate de pierderi. Schimbări bruște de situație.', nature: 'negative' },
    29: { title: 'Grațierea', meaning: 'Indicații de nesiguranță, pericole din partea inamicilor. Necesită precauție.', nature: 'negative' },
    30: { title: 'Intelectul', meaning: 'Potențial mental ridicat, poate fi folosit pentru bine sau rău. Neutral în sine.', nature: 'neutral' },
    31: { title: 'Ermitul', meaning: 'Solitudine prin alegere, auto-suficiență. Favorabil pentru cercetare și studiu.', nature: 'positive' },
    32: { title: 'Comunicarea', meaning: 'Magnetism, putere de comunicare. Favorabil pentru vorbitori și scriitori.', nature: 'positive' },
    33: { title: 'Maestrul Spiritual', meaning: 'Nu are semnificație proprie, se reduce la 6. Vibrație înaltă de iubire.', nature: 'positive' },
    34: { title: 'Efortul', meaning: 'Similar cu 25 - succes prin muncă grea și perseverență.', nature: 'neutral' },
    35: { title: 'Armonia', meaning: 'Favorabil pentru afaceri și parteneriate comerciale.', nature: 'positive' },
    36: { title: 'Geniul', meaning: 'Aptitudini pentru inventivitate și inovație.', nature: 'positive' },
    37: { title: 'Prietenia', meaning: 'Favorabil pentru relații de prietenie și parteneriate de afaceri.', nature: 'positive' },
    38: { title: 'Solitudinea', meaning: 'Similar cu 11 și 29 - tendința de a fi neînțeles.', nature: 'negative' },
    39: { title: 'Viziunea', meaning: 'Similar cu 30 - potențial mental ridicat.', nature: 'neutral' },
    40: { title: 'Organizarea', meaning: 'Similar cu 31 - capacitate organizatorică.', nature: 'positive' },
    41: { title: 'Expresia', meaning: 'Similar cu 32 - talent pentru comunicare.', nature: 'positive' },
    42: { title: 'Creativitatea', meaning: 'Similar cu 24 - succes în domenii creative.', nature: 'positive' },
    43: { title: 'Transformarea Radicală', meaning: 'Similar cu 16 - schimbări dramatice posibile.', nature: 'negative' },
    44: { title: 'Materialismul', meaning: 'Focus excesiv pe bunuri materiale. Avertisment.', nature: 'negative' },
    45: { title: 'Cunoașterea', meaning: 'Similar cu 27 - autoritate intelectuală.', nature: 'positive' },
    46: { title: 'Abundența', meaning: 'Similar cu 37 - prosperitate prin relații.', nature: 'positive' },
    47: { title: 'Înțelepciunea', meaning: 'Similar cu 29 - necesită discernământ.', nature: 'neutral' },
    48: { title: 'Consilierea', meaning: 'Similar cu 30 - talent pentru a ghida alții.', nature: 'positive' },
    49: { title: 'Liderul', meaning: 'Similar cu 31 - capacitate de conducere.', nature: 'positive' },
    50: { title: 'Comunicatorul', meaning: 'Similar cu 32 - elocvență și persuasiune.', nature: 'positive' },
    51: { title: 'Războinicul', meaning: 'Natura unui războinic, succes prin luptă.', nature: 'neutral' },
    52: { title: 'Magicianul', meaning: 'Similar cu 15 - influență puternică asupra altora.', nature: 'positive' },
  },
  en: {
    10: { title: 'Wheel of Fortune', meaning: 'Represents honor, trust and rise, but can also bring unexpected falls. Symbolizes the cycle of life.', nature: 'neutral' },
    11: { title: 'The Clenched Fist', meaning: 'Warning of hidden dangers, betrayal and difficulties. Requires vigilance and prudence.', nature: 'negative' },
    12: { title: 'The Sacrifice', meaning: 'Suffering and anxiety, but also potential for spiritual transcendence. Victimization or sacrifice for others.', nature: 'negative' },
    13: { title: 'Transformation', meaning: 'Change, transformation and regeneration. Although considered unlucky, it represents the power to be reborn.', nature: 'neutral' },
    14: { title: 'Temperance', meaning: 'Movement, combination of people and things. Risk in business and speculation, but also potential for gain.', nature: 'neutral' },
    15: { title: 'The Magician', meaning: 'Magnetism, eloquence and power to influence. Can be used for good or evil.', nature: 'neutral' },
    16: { title: 'The Fallen Tower', meaning: 'Sudden destruction, accidents, catastrophes. A warning to avoid overconfidence.', nature: 'negative' },
    17: { title: 'The Star', meaning: 'One of the luckiest numbers. Peace, hope, intuition and divine inspiration.', nature: 'positive' },
    18: { title: 'The Moon', meaning: 'Conflicts, hidden enemies, deception. Requires caution in relationships and business.', nature: 'negative' },
    19: { title: 'The Sun', meaning: 'Success, happiness and achievement. One of the most favorable compound numbers.', nature: 'positive' },
    20: { title: 'The Awakening', meaning: 'Call to action, spiritual rebirth. New plans and projects.', nature: 'positive' },
    21: { title: 'The Universe', meaning: 'Guaranteed advancement, success and honor. Very favorable for career.', nature: 'positive' },
    22: { title: 'Illusion', meaning: 'Excessive trust in others, possible deceptions. Must rely on own judgment.', nature: 'negative' },
    23: { title: 'The Royal Lion', meaning: 'Promise of success, help from superiors, protection. Very lucky.', nature: 'positive' },
    24: { title: 'Love', meaning: 'Help from influential people, success in love and partnerships.', nature: 'positive' },
    25: { title: 'The Lessons', meaning: 'Success through trial and error. Wisdom gained through experience.', nature: 'neutral' },
    26: { title: 'Partnerships', meaning: 'Warning about disastrous partnerships. Requires careful choice of associates.', nature: 'negative' },
    27: { title: 'The Scepter', meaning: 'Authority, command and reward for creative efforts.', nature: 'positive' },
    28: { title: 'Uncertainty', meaning: 'Gains followed by losses. Sudden changes in situation.', nature: 'negative' },
    29: { title: 'Grace', meaning: 'Indications of insecurity, dangers from enemies. Requires caution.', nature: 'negative' },
    30: { title: 'The Intellect', meaning: 'High mental potential, can be used for good or evil. Neutral in itself.', nature: 'neutral' },
    31: { title: 'The Hermit', meaning: 'Solitude by choice, self-sufficiency. Favorable for research and study.', nature: 'positive' },
    32: { title: 'Communication', meaning: 'Magnetism, power of communication. Favorable for speakers and writers.', nature: 'positive' },
    33: { title: 'The Spiritual Master', meaning: 'Has no meaning of its own, reduces to 6. High vibration of love.', nature: 'positive' },
    34: { title: 'The Effort', meaning: 'Similar to 25 - success through hard work and perseverance.', nature: 'neutral' },
    35: { title: 'Harmony', meaning: 'Favorable for business and commercial partnerships.', nature: 'positive' },
    36: { title: 'The Genius', meaning: 'Aptitude for inventiveness and innovation.', nature: 'positive' },
    37: { title: 'Friendship', meaning: 'Favorable for friendly relations and business partnerships.', nature: 'positive' },
    38: { title: 'Solitude', meaning: 'Similar to 11 and 29 - tendency to be misunderstood.', nature: 'negative' },
    39: { title: 'The Vision', meaning: 'Similar to 30 - high mental potential.', nature: 'neutral' },
    40: { title: 'Organization', meaning: 'Similar to 31 - organizational capacity.', nature: 'positive' },
    41: { title: 'Expression', meaning: 'Similar to 32 - talent for communication.', nature: 'positive' },
    42: { title: 'Creativity', meaning: 'Similar to 24 - success in creative fields.', nature: 'positive' },
    43: { title: 'Radical Transformation', meaning: 'Similar to 16 - dramatic changes possible.', nature: 'negative' },
    44: { title: 'Materialism', meaning: 'Excessive focus on material goods. Warning.', nature: 'negative' },
    45: { title: 'Knowledge', meaning: 'Similar to 27 - intellectual authority.', nature: 'positive' },
    46: { title: 'Abundance', meaning: 'Similar to 37 - prosperity through relationships.', nature: 'positive' },
    47: { title: 'Wisdom', meaning: 'Similar to 29 - requires discernment.', nature: 'neutral' },
    48: { title: 'Counseling', meaning: 'Similar to 30 - talent for guiding others.', nature: 'positive' },
    49: { title: 'The Leader', meaning: 'Similar to 31 - leadership capacity.', nature: 'positive' },
    50: { title: 'The Communicator', meaning: 'Similar to 32 - eloquence and persuasion.', nature: 'positive' },
    51: { title: 'The Warrior', meaning: 'Nature of a warrior, success through struggle.', nature: 'neutral' },
    52: { title: 'The Magician', meaning: 'Similar to 15 - strong influence over others.', nature: 'positive' },
  },
  ru: {
    10: { title: 'Колесо Фортуны', meaning: 'Представляет честь, доверие и подъем, но может принести неожиданные падения. Символизирует цикл жизни.', nature: 'neutral' },
    11: { title: 'Сжатый Кулак', meaning: 'Предупреждение о скрытых опасностях, предательстве и трудностях. Требует бдительности и осторожности.', nature: 'negative' },
    12: { title: 'Жертва', meaning: 'Страдание и тревога, но также потенциал для духовного преображения. Жертвенность ради других.', nature: 'negative' },
    13: { title: 'Трансформация', meaning: 'Изменение, трансформация и возрождение. Хотя считается несчастливым, представляет силу возрождения.', nature: 'neutral' },
    14: { title: 'Умеренность', meaning: 'Движение, комбинация людей и вещей. Риск в бизнесе и спекуляциях, но и потенциал для прибыли.', nature: 'neutral' },
    15: { title: 'Маг', meaning: 'Магнетизм, красноречие и сила влияния. Может быть использовано во благо или во зло.', nature: 'neutral' },
    16: { title: 'Падающая Башня', meaning: 'Внезапное разрушение, несчастные случаи, катастрофы. Предупреждение избегать самоуверенности.', nature: 'negative' },
    17: { title: 'Звезда', meaning: 'Одно из самых удачных чисел. Мир, надежда, интуиция и божественное вдохновение.', nature: 'positive' },
    18: { title: 'Луна', meaning: 'Конфликты, скрытые враги, обман. Требует осторожности в отношениях и бизнесе.', nature: 'negative' },
    19: { title: 'Солнце', meaning: 'Успех, счастье и достижение. Одно из самых благоприятных составных чисел.', nature: 'positive' },
    20: { title: 'Пробуждение', meaning: 'Призыв к действию, духовное возрождение. Новые планы и проекты.', nature: 'positive' },
    21: { title: 'Вселенная', meaning: 'Гарантированное продвижение, успех и честь. Очень благоприятно для карьеры.', nature: 'positive' },
    22: { title: 'Иллюзия', meaning: 'Чрезмерное доверие к другим, возможные обманы. Нужно полагаться на собственное суждение.', nature: 'negative' },
    23: { title: 'Королевский Лев', meaning: 'Обещание успеха, помощь от вышестоящих, защита. Очень удачное.', nature: 'positive' },
    24: { title: 'Любовь', meaning: 'Помощь от влиятельных людей, успех в любви и партнерстве.', nature: 'positive' },
    25: { title: 'Уроки', meaning: 'Успех через пробы и ошибки. Мудрость, полученная через опыт.', nature: 'neutral' },
    26: { title: 'Партнерства', meaning: 'Предупреждение о катастрофических партнерствах. Требует тщательного выбора партнеров.', nature: 'negative' },
    27: { title: 'Скипетр', meaning: 'Авторитет, командование и вознаграждение за творческие усилия.', nature: 'positive' },
    28: { title: 'Неопределенность', meaning: 'Прибыль, за которой следуют потери. Внезапные изменения ситуации.', nature: 'negative' },
    29: { title: 'Милость', meaning: 'Признаки неуверенности, опасности от врагов. Требует осторожности.', nature: 'negative' },
    30: { title: 'Интеллект', meaning: 'Высокий умственный потенциал, может быть использован во благо или во зло.', nature: 'neutral' },
    31: { title: 'Отшельник', meaning: 'Одиночество по выбору, самодостаточность. Благоприятно для исследований и учебы.', nature: 'positive' },
    32: { title: 'Коммуникация', meaning: 'Магнетизм, сила общения. Благоприятно для ораторов и писателей.', nature: 'positive' },
    33: { title: 'Духовный Мастер', meaning: 'Не имеет собственного значения, сводится к 6. Высокая вибрация любви.', nature: 'positive' },
    34: { title: 'Усилие', meaning: 'Подобно 25 - успех через упорный труд и настойчивость.', nature: 'neutral' },
    35: { title: 'Гармония', meaning: 'Благоприятно для бизнеса и коммерческих партнерств.', nature: 'positive' },
    36: { title: 'Гений', meaning: 'Способность к изобретательности и инновациям.', nature: 'positive' },
    37: { title: 'Дружба', meaning: 'Благоприятно для дружеских отношений и деловых партнерств.', nature: 'positive' },
    38: { title: 'Одиночество', meaning: 'Подобно 11 и 29 - склонность быть непонятым.', nature: 'negative' },
    39: { title: 'Видение', meaning: 'Подобно 30 - высокий умственный потенциал.', nature: 'neutral' },
    40: { title: 'Организация', meaning: 'Подобно 31 - организационные способности.', nature: 'positive' },
    41: { title: 'Выражение', meaning: 'Подобно 32 - талант к коммуникации.', nature: 'positive' },
    42: { title: 'Творчество', meaning: 'Подобно 24 - успех в творческих областях.', nature: 'positive' },
    43: { title: 'Радикальная Трансформация', meaning: 'Подобно 16 - возможны драматические изменения.', nature: 'negative' },
    44: { title: 'Материализм', meaning: 'Чрезмерное внимание к материальным благам. Предупреждение.', nature: 'negative' },
    45: { title: 'Знание', meaning: 'Подобно 27 - интеллектуальный авторитет.', nature: 'positive' },
    46: { title: 'Изобилие', meaning: 'Подобно 37 - процветание через отношения.', nature: 'positive' },
    47: { title: 'Мудрость', meaning: 'Подобно 29 - требует проницательности.', nature: 'neutral' },
    48: { title: 'Консультирование', meaning: 'Подобно 30 - талант направлять других.', nature: 'positive' },
    49: { title: 'Лидер', meaning: 'Подобно 31 - лидерские способности.', nature: 'positive' },
    50: { title: 'Коммуникатор', meaning: 'Подобно 32 - красноречие и убедительность.', nature: 'positive' },
    51: { title: 'Воин', meaning: 'Природа воина, успех через борьбу.', nature: 'neutral' },
    52: { title: 'Маг', meaning: 'Подобно 15 - сильное влияние на других.', nature: 'positive' },
  },
};

// Single digit meanings in Chaldean
const SINGLE_DIGIT_MEANINGS: Record<string, Record<number, { keywords: string[]; description: string }>> = {
  ro: {
    1: { keywords: ['Lider', 'Independent', 'Ambiție'], description: 'Numărul liderului. Independență, originalitate, ambiție și determinare. Asociat cu Soarele.' },
    2: { keywords: ['Diplomație', 'Parteneriat', 'Intuiție'], description: 'Numărul parteneriatelor. Cooperare, diplomație, sensibilitate și intuiție. Asociat cu Luna.' },
    3: { keywords: ['Creativitate', 'Expresie', 'Bucurie'], description: 'Numărul expresiei. Creativitate, comunicare, optimism și sociabilitate. Asociat cu Jupiter.' },
    4: { keywords: ['Stabilitate', 'Muncă', 'Ordine'], description: 'Numărul stabilității. Practicalitate, ordine, muncă asiduă și loialitate. Asociat cu Uranus/Rahu.' },
    5: { keywords: ['Libertate', 'Aventură', 'Schimbare'], description: 'Numărul libertății. Aventură, versatilitate, curiozitate și schimbare. Asociat cu Mercur.' },
    6: { keywords: ['Armonie', 'Familie', 'Responsabilitate'], description: 'Numărul armoniei. Familie, responsabilitate, iubire și echilibru. Asociat cu Venus.' },
    7: { keywords: ['Spiritualitate', 'Analiză', 'Mister'], description: 'Numărul spiritualității. Introspecție, analiză, misticism și înțelepciune. Asociat cu Neptun/Ketu.' },
    8: { keywords: ['Putere', 'Succes', 'Karma'], description: 'Numărul puterii. Ambiție materială, succes, karma și autoritate. Asociat cu Saturn.' },
    9: { keywords: ['Umanitarism', 'Completitudine', 'Înțelepciune'], description: 'Numărul completitudinii. Umanitarism, compasiune, înțelepciune universală. Asociat cu Marte.' },
  },
  en: {
    1: { keywords: ['Leader', 'Independent', 'Ambition'], description: 'The number of the leader. Independence, originality, ambition and determination. Associated with the Sun.' },
    2: { keywords: ['Diplomacy', 'Partnership', 'Intuition'], description: 'The number of partnerships. Cooperation, diplomacy, sensitivity and intuition. Associated with the Moon.' },
    3: { keywords: ['Creativity', 'Expression', 'Joy'], description: 'The number of expression. Creativity, communication, optimism and sociability. Associated with Jupiter.' },
    4: { keywords: ['Stability', 'Work', 'Order'], description: 'The number of stability. Practicality, order, hard work and loyalty. Associated with Uranus/Rahu.' },
    5: { keywords: ['Freedom', 'Adventure', 'Change'], description: 'The number of freedom. Adventure, versatility, curiosity and change. Associated with Mercury.' },
    6: { keywords: ['Harmony', 'Family', 'Responsibility'], description: 'The number of harmony. Family, responsibility, love and balance. Associated with Venus.' },
    7: { keywords: ['Spirituality', 'Analysis', 'Mystery'], description: 'The number of spirituality. Introspection, analysis, mysticism and wisdom. Associated with Neptune/Ketu.' },
    8: { keywords: ['Power', 'Success', 'Karma'], description: 'The number of power. Material ambition, success, karma and authority. Associated with Saturn.' },
    9: { keywords: ['Humanitarianism', 'Completion', 'Wisdom'], description: 'The number of completion. Humanitarianism, compassion, universal wisdom. Associated with Mars.' },
  },
  ru: {
    1: { keywords: ['Лидер', 'Независимый', 'Амбиции'], description: 'Число лидера. Независимость, оригинальность, амбиции и решимость. Связано с Солнцем.' },
    2: { keywords: ['Дипломатия', 'Партнерство', 'Интуиция'], description: 'Число партнерств. Сотрудничество, дипломатия, чувствительность и интуиция. Связано с Луной.' },
    3: { keywords: ['Творчество', 'Выражение', 'Радость'], description: 'Число выражения. Творчество, общение, оптимизм и общительность. Связано с Юпитером.' },
    4: { keywords: ['Стабильность', 'Работа', 'Порядок'], description: 'Число стабильности. Практичность, порядок, усердная работа и лояльность. Связано с Ураном/Раху.' },
    5: { keywords: ['Свобода', 'Приключение', 'Изменение'], description: 'Число свободы. Приключение, универсальность, любопытство и изменение. Связано с Меркурием.' },
    6: { keywords: ['Гармония', 'Семья', 'Ответственность'], description: 'Число гармонии. Семья, ответственность, любовь и баланс. Связано с Венерой.' },
    7: { keywords: ['Духовность', 'Анализ', 'Тайна'], description: 'Число духовности. Интроспекция, анализ, мистицизм и мудрость. Связано с Нептуном/Кету.' },
    8: { keywords: ['Власть', 'Успех', 'Карма'], description: 'Число власти. Материальные амбиции, успех, карма и авторитет. Связано с Сатурном.' },
    9: { keywords: ['Гуманизм', 'Завершение', 'Мудрость'], description: 'Число завершения. Гуманизм, сострадание, универсальная мудрость. Связано с Марсом.' },
  },
};

/**
 * Get Chaldean value for a single letter
 */
export function getChaldeanLetterValue(letter: string): number {
  const upper = letter.toUpperCase();
  return CHALDEAN_VALUES[upper] || 0;
}

/**
 * Calculate Chaldean name number (compound and single)
 */
export function calculateChaldeanNameNumber(name: string): { compound: number; single: number } {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;

  for (const letter of letters) {
    total += getChaldeanLetterValue(letter);
  }

  // The compound number is the total before final reduction
  const compound = total;

  // Reduce to single digit
  let single = total;
  while (single > 9) {
    single = String(single)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  return { compound, single };
}

/**
 * Calculate Chaldean birth number from date
 * In Chaldean, only the day is used (not full birthdate like Pythagorean)
 */
export function calculateChaldeanBirthNumber(birthDate: Date): { compound: number; single: number } {
  const day = birthDate.getDate();
  const compound = day;

  let single = day;
  while (single > 9) {
    single = String(single)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  return { compound, single };
}

/**
 * Calculate full Chaldean analysis
 */
export interface ChaldeanAnalysis {
  nameNumber: { compound: number; single: number };
  birthNumber: { compound: number; single: number };
  destinyNumber: { compound: number; single: number }; // Name + Birth combined
  letterBreakdown: Array<{ letter: string; value: number }>;
}

export function calculateChaldeanAnalysis(name: string, birthDate: Date): ChaldeanAnalysis {
  const nameNumber = calculateChaldeanNameNumber(name);
  const birthNumber = calculateChaldeanBirthNumber(birthDate);

  // Destiny number is name + birth combined
  const destinyCompound = nameNumber.single + birthNumber.single;
  let destinySingle = destinyCompound;
  while (destinySingle > 9) {
    destinySingle = String(destinySingle)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  // Letter breakdown
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  const letterBreakdown = letters.split('').map((letter) => ({
    letter,
    value: getChaldeanLetterValue(letter),
  }));

  return {
    nameNumber,
    birthNumber,
    destinyNumber: { compound: destinyCompound, single: destinySingle },
    letterBreakdown,
  };
}

/**
 * Get compound number meaning
 */
export function getCompoundMeaning(
  number: number,
  language: string = 'en'
): { title: string; meaning: string; nature: 'positive' | 'negative' | 'neutral' } | null {
  const meanings = COMPOUND_MEANINGS[language] || COMPOUND_MEANINGS.en;
  return meanings[number] || null;
}

/**
 * Get single digit meaning
 */
export function getSingleDigitMeaning(
  number: number,
  language: string = 'en'
): { keywords: string[]; description: string } | null {
  if (number < 1 || number > 9) return null;
  const meanings = SINGLE_DIGIT_MEANINGS[language] || SINGLE_DIGIT_MEANINGS.en;
  return meanings[number] || null;
}

/**
 * Calculate business name number for Chaldean analysis
 */
export function calculateBusinessNameNumber(businessName: string): {
  compound: number;
  single: number;
  isLucky: boolean;
  luckyNumbers: number[];
  avoidNumbers: number[];
} {
  const result = calculateChaldeanNameNumber(businessName);

  // Lucky compound numbers for business in Chaldean
  const luckyNumbers = [1, 5, 6, 15, 23, 24, 32, 33, 41, 42, 45, 46];

  // Numbers to avoid for business
  const avoidNumbers = [2, 4, 8, 11, 13, 14, 16, 18, 22, 26, 28, 29, 43, 44, 47, 48, 49, 52];

  const isLucky = luckyNumbers.includes(result.compound) || luckyNumbers.includes(result.single);

  return {
    ...result,
    isLucky,
    luckyNumbers,
    avoidNumbers,
  };
}

/**
 * Get favorable days for a number
 */
export function getFavorableDays(singleNumber: number): string[] {
  const dayMappings: Record<number, string[]> = {
    1: ['Sunday'],
    2: ['Monday'],
    3: ['Thursday'],
    4: ['Saturday', 'Sunday'],
    5: ['Wednesday'],
    6: ['Friday'],
    7: ['Monday'],
    8: ['Saturday'],
    9: ['Tuesday', 'Thursday'],
  };
  return dayMappings[singleNumber] || [];
}

/**
 * Get compatible numbers
 */
export function getCompatibleNumbers(singleNumber: number): number[] {
  const compatibility: Record<number, number[]> = {
    1: [1, 2, 3, 9],
    2: [1, 2, 7],
    3: [1, 3, 6, 9],
    4: [5, 6, 8],
    5: [4, 5, 6],
    6: [3, 4, 5, 6, 9],
    7: [2, 7],
    8: [4, 8],
    9: [1, 3, 6, 9],
  };
  return compatibility[singleNumber] || [];
}

/**
 * Get planetary association
 */
export function getPlanetaryAssociation(
  singleNumber: number,
  language: string = 'en'
): { planet: string; symbol: string } | null {
  const planets: Record<string, Record<number, { planet: string; symbol: string }>> = {
    en: {
      1: { planet: 'Sun', symbol: '☉' },
      2: { planet: 'Moon', symbol: '☽' },
      3: { planet: 'Jupiter', symbol: '♃' },
      4: { planet: 'Uranus/Rahu', symbol: '♅' },
      5: { planet: 'Mercury', symbol: '☿' },
      6: { planet: 'Venus', symbol: '♀' },
      7: { planet: 'Neptune/Ketu', symbol: '♆' },
      8: { planet: 'Saturn', symbol: '♄' },
      9: { planet: 'Mars', symbol: '♂' },
    },
    ro: {
      1: { planet: 'Soarele', symbol: '☉' },
      2: { planet: 'Luna', symbol: '☽' },
      3: { planet: 'Jupiter', symbol: '♃' },
      4: { planet: 'Uranus/Rahu', symbol: '♅' },
      5: { planet: 'Mercur', symbol: '☿' },
      6: { planet: 'Venus', symbol: '♀' },
      7: { planet: 'Neptun/Ketu', symbol: '♆' },
      8: { planet: 'Saturn', symbol: '♄' },
      9: { planet: 'Marte', symbol: '♂' },
    },
    ru: {
      1: { planet: 'Солнце', symbol: '☉' },
      2: { planet: 'Луна', symbol: '☽' },
      3: { planet: 'Юпитер', symbol: '♃' },
      4: { planet: 'Уран/Раху', symbol: '♅' },
      5: { planet: 'Меркурий', symbol: '☿' },
      6: { planet: 'Венера', symbol: '♀' },
      7: { planet: 'Нептун/Кету', symbol: '♆' },
      8: { planet: 'Сатурн', symbol: '♄' },
      9: { planet: 'Марс', symbol: '♂' },
    },
  };

  const langPlanets = planets[language] || planets.en;
  return langPlanets[singleNumber] || null;
}

/**
 * Compare Pythagorean vs Chaldean results
 */
export interface SystemComparison {
  pythagorean: {
    lifePath: number;
    destiny: number;
    soulUrge: number;
    personality: number;
  };
  chaldean: {
    nameNumber: { compound: number; single: number };
    birthNumber: { compound: number; single: number };
    destinyNumber: { compound: number; single: number };
  };
  differences: string[];
}

// Export types
export type { ChaldeanAnalysis, SystemComparison };
