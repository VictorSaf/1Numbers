// Daily and Monthly Predictions based on Numerology
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculatePersonalYearNumber
} from './numerology';
import { calculateLuckyScore } from './luckyDates';
// The cycles live in one place. This module used to carry its own copies, which
// agreed by accident -- repeated digit sums are associative -- rather than by
// construction.
import {
  calculatePersonalDayNumber,
  calculateUniversalDay,
  calculatePersonalMonthNumber as personalMonthFor,
} from './personalCycles';
import type { Language } from './translations';

export interface DailyPrediction {
  number: number;
  energy: string;
  focus: string;
  advice: string;
  luckyHours: string[];
  challenges: string;
  opportunities: string;
}

export interface MonthlyPrediction {
  number: number;
  theme: string;
  overview: string;
  career: string;
  relationships: string;
  health: string;
  finances: string;
  spirituality: string;
  keyDays: number[];
}

// Daily predictions data
const dailyPredictionsData: Record<number, Omit<DailyPrediction, 'number'>> = {
  1: {
    energy: "leadership",
    focus: "new beginnings",
    advice: "Take initiative today. Start that project you've been postponing.",
    luckyHours: ["9:00", "11:00", "19:00"],
    challenges: "Avoid being too self-centered or impatient with others.",
    opportunities: "Perfect day for launching new ventures or asserting yourself."
  },
  2: {
    energy: "cooperation",
    focus: "partnerships",
    advice: "Focus on collaboration and diplomacy. Listen more than you speak.",
    luckyHours: ["8:00", "14:00", "20:00"],
    challenges: "Don't let indecision hold you back from making necessary choices.",
    opportunities: "Excellent for negotiations, meetings, and deepening relationships."
  },
  3: {
    energy: "creativity",
    focus: "self-expression",
    advice: "Express yourself creatively. Share your ideas with enthusiasm.",
    luckyHours: ["10:00", "15:00", "21:00"],
    challenges: "Avoid scattering your energy on too many projects at once.",
    opportunities: "Great for artistic pursuits, social events, and communication."
  },
  4: {
    energy: "stability",
    focus: "organization",
    advice: "Build solid foundations. Focus on practical matters and planning.",
    luckyHours: ["7:00", "12:00", "16:00"],
    challenges: "Don't become too rigid or resistant to necessary changes.",
    opportunities: "Ideal for detailed work, budgeting, and establishing routines."
  },
  5: {
    energy: "change",
    focus: "freedom",
    advice: "Embrace change and variety. Be open to unexpected opportunities.",
    luckyHours: ["11:00", "17:00", "22:00"],
    challenges: "Avoid impulsive decisions that you might regret later.",
    opportunities: "Perfect for travel, trying new things, and breaking routines."
  },
  6: {
    energy: "harmony",
    focus: "responsibility",
    advice: "Focus on home, family, and nurturing relationships.",
    luckyHours: ["6:00", "13:00", "18:00"],
    challenges: "Don't sacrifice your own needs to please everyone else.",
    opportunities: "Excellent for domestic matters, healing, and community service."
  },
  7: {
    energy: "introspection",
    focus: "spiritual growth",
    advice: "Take time for solitude and reflection. Trust your intuition.",
    luckyHours: ["5:00", "14:00", "23:00"],
    challenges: "Avoid isolation or becoming too lost in your thoughts.",
    opportunities: "Ideal for research, meditation, and deep study."
  },
  8: {
    energy: "abundance",
    focus: "achievement",
    advice: "Focus on professional goals and financial matters with confidence.",
    luckyHours: ["8:00", "16:00", "20:00"],
    challenges: "Don't let material concerns overshadow spiritual or emotional needs.",
    opportunities: "Great for business decisions, investments, and career advancement."
  },
  9: {
    energy: "completion",
    focus: "humanitarianism",
    advice: "Let go of what no longer serves you. Give back to others.",
    luckyHours: ["9:00", "15:00", "21:00"],
    challenges: "Avoid holding onto the past or unresolved emotions.",
    opportunities: "Perfect for charitable work, endings, and spiritual practices."
  }
};

// ===== Text, în trei limbi =====
//
// Tabelele de mai jos erau scrise numai în engleză, iar /azi le punea sub
// titluri românești: „Luna Curentă" deasupra lui „New Beginnings". Fiecare
// funcție primește acum limba și o alege aici. Engleza rămâne varianta `en`,
// curățată de clișee („trust the universe's timing"); româna și rusa sunt
// scrise pe limba omului, ca `dayContent.ts`: un gest concret, nu o
// caracterizare a energiei.

type ByLang<T> = Record<Language, Record<number, T>>;

/** Masterii nu apar aici (ciclurile personale nu-i păstrează), dar dacă apar,
 *  cad pe rădăcina lor, nu pe 1. */
const pick = <T>(table: ByLang<T>, lang: Language, n: number): T => {
  const byNumber = table[lang] ?? table.en;
  return byNumber[n] ?? byNumber[((n - 1) % 9) + 1] ?? byNumber[1];
};

type MonthText = Omit<MonthlyPrediction, 'number' | 'keyDays'>;

const MONTHLY: ByLang<MonthText> = {
  en: {
    1: {
      theme: "A month for starting",
      overview: "Something new wants a first step this month. What you begin now sets the direction for the next nine months, so start what you actually want, not what is convenient.",
      career: "Pitch the project, ask to lead, send the application. People notice whoever moves first.",
      relationships: "Say plainly what you need. New people may come in; let them see who you are, not who fits.",
      health: "You have energy to spare. A habit started now sticks better than in any other month.",
      finances: "A good month to open a new source of income. Decide on your own judgement, but write the numbers down first.",
      spirituality: "Ask yourself what you want for yourself, not for others. Write the answer down."
    },
    2: {
      theme: "A month for patience",
      overview: "Things move slowly this month, and through other people. What you push alone stalls; what you build with someone holds.",
      career: "Work in pairs, not alone. Keep the ultimatum in your pocket; a conversation settles more.",
      relationships: "Listen to the end before you answer. Small gestures count for more than big declarations.",
      health: "Your body feels the tension at home. Sleep and quiet matter more than the gym.",
      finances: "Don't sign anything big. Gather information, compare, wait for next month.",
      spirituality: "Notice what you feel before you explain it. A few quiet minutes a day are enough."
    },
    3: {
      theme: "A month to speak up",
      overview: "This month asks you to show what you have: write, talk, go out among people. Ideas kept in your head go stale.",
      career: "Show your work, even unfinished. Your ideas land better when said out loud.",
      relationships: "Go out, call, invite. Tell people what you like about them now, not later.",
      health: "Your mood lifts when you make something with your hands. Watch the late nights and the extra glass.",
      finances: "Money can come from what you create or say. Small, scattered spending adds up fast.",
      spirituality: "Each evening, write down three things that went well. It changes what you notice the next day."
    },
    4: {
      theme: "A month of groundwork",
      overview: "A month of steady, unglamorous work. What you build carefully now holds for years.",
      career: "Finish what is half-done before starting anything new. Details and deadlines count now.",
      relationships: "Show up when you said you would. Trust grows from reliability, not from words.",
      health: "Fix the routine: bedtime, meals, the check-up you keep postponing.",
      finances: "Make a budget and keep it for four weeks. What you save now is the foundation for later.",
      spirituality: "A small habit done every day beats a big one done once."
    },
    5: {
      theme: "A month of change",
      overview: "Plans shift this month. Something unexpected comes in; make room for it instead of fighting it.",
      career: "Something at work is likely to change. Whoever adapts first gets the better seat.",
      relationships: "Do something new together. Watch the urge to leave when things turn routine.",
      health: "Try a different kind of movement. Notice where you overdo it: food, screens, coffee.",
      finances: "Unexpected money may come, and unexpected costs too. Don't bet what you can't afford to lose.",
      spirituality: "Go somewhere you have never been, even close to home. A new place shows you something new about yourself."
    },
    6: {
      theme: "A month for home and the people close to you",
      overview: "Home, family and the people who rely on you come first. Care is the work this month, including care for yourself.",
      career: "Help where it is needed; work that serves others goes well. Don't take on everyone's tasks.",
      relationships: "Old tensions can be mended. Make the call, cook the dinner, say what you have to say.",
      health: "Rest at home counts. Look after yourself the way you look after others.",
      finances: "Money spent on home and family comes back. Don't lend more than you can afford to lose.",
      spirituality: "Ordinary chores, done with attention, are practice enough this month."
    },
    7: {
      theme: "A month to look inward",
      overview: "A quieter month. You need time alone to understand what is going on; give yourself that time.",
      career: "Research, analysis and working on your own go well. Decide after you have checked, not before.",
      relationships: "Fewer people, longer conversations. Say you need space before others have to guess.",
      health: "Your mind tires before your body does. Sleep, walks, fewer screens.",
      finances: "Read the small print. Something hidden may come to light; wait until it does.",
      spirituality: "Read something difficult, meditate, take long walks alone. This is the month for questions."
    },
    8: {
      theme: "A month for ambition and money",
      overview: "Work, money and authority move to the front. Ask for what you deserve; people will take you seriously.",
      career: "Ask for the promotion, the raise, the bigger role. Decisions you make now carry weight.",
      relationships: "Watch who gets the last word. Generosity strengthens a relationship more than being right.",
      health: "You can push hard; notice too where the stress settles in your body.",
      finances: "A good month for big money decisions. Think larger, but check the numbers twice.",
      spirituality: "Ask yourself what the money is for. The answer says more than the amount."
    },
    9: {
      theme: "A month for closing",
      overview: "Something ends this month: a project, a habit, a chapter. Let it go to make room for what comes next.",
      career: "Finish the projects that keep dragging on and hand over what you no longer want to carry.",
      relationships: "Forgive what can be forgiven. Some people leave; others come back changed.",
      health: "Clear out the cupboard, the inbox, the grudges. It shows in how you sleep.",
      finances: "Pay off debts, close what is still open. What you give now costs less than it seems.",
      spirituality: "Look back over the last nine months. Write down what you take with you and what you leave."
    }
  },
  ro: {
    1: {
      theme: "Lună de început",
      overview: "Luna asta cere un prim pas. Ce începi acum dă direcția pentru următoarele nouă luni, așa că începe ce vrei cu adevărat, nu ce e comod.",
      career: "Propune proiectul, cere să conduci, trimite cererea. Se observă cine se mișcă primul.",
      relationships: "Spune limpede de ce ai nevoie. Pot apărea oameni noi; lasă-i să vadă cine ești, nu cine se potrivește.",
      health: "Ai energie de dat. Un obicei început acum se prinde mai ușor decât în orice altă lună.",
      finances: "Lună bună pentru o sursă nouă de venit. Decide după capul tău, dar scrie mai întâi cifrele pe hârtie.",
      spirituality: "Întreabă-te ce vrei pentru tine, nu pentru alții. Scrie răspunsul."
    },
    2: {
      theme: "Lună de răbdare",
      overview: "Lucrurile merg încet luna asta și trec prin alți oameni. Ce împingi singur se blochează; ce construiești cu cineva ține.",
      career: "Lucrează în doi, nu singur. Ține ultimatumul în buzunar; o discuție rezolvă mai mult.",
      relationships: "Ascultă până la capăt înainte să răspunzi. Gesturile mici contează mai mult decât declarațiile mari.",
      health: "Corpul simte tensiunea din casă. Somnul și liniștea contează mai mult decât sala.",
      finances: "Nu semna nimic mare. Strânge informații, compară, așteaptă luna următoare.",
      spirituality: "Observă ce simți înainte să-ți explici. Câteva minute de liniște pe zi ajung."
    },
    3: {
      theme: "Lună în care să vorbești",
      overview: "Luna asta îți cere să arăți ce ai: scrie, vorbește, ieși printre oameni. Ideile ținute în cap se învechesc.",
      career: "Arată la ce lucrezi, chiar neterminat. Ideile tale prind mai bine spuse cu voce tare.",
      relationships: "Ieși, sună, invită. Spune-le oamenilor ce-ți place la ei acum, nu mai târziu.",
      health: "Starea se ridică atunci când faci ceva cu mâinile. Ai grijă la nopțile lungi și la paharul în plus.",
      finances: "Banii pot veni din ce creezi sau din ce spui. Cheltuielile mici și împrăștiate se adună repede.",
      spirituality: "Seara, scrie trei lucruri care au mers bine. Schimbă ce observi a doua zi."
    },
    4: {
      theme: "Lună de temelie",
      overview: "Lună de muncă migăloasă, fără strălucire. Ce construiești atent acum ține ani de zile.",
      career: "Termină ce e pe jumătate înainte să începi altceva. Acum contează detaliile și termenele.",
      relationships: "Fii acolo când ai spus că vii. Încrederea crește din seriozitate, nu din vorbe.",
      health: "Pune la punct rutina: ora de culcare, mesele, controlul medical pe care îl tot amâni.",
      finances: "Fă un buget și ține-l patru săptămâni. Ce economisești acum e temelia de mai târziu.",
      spirituality: "Un obicei mic, făcut zilnic, bate unul mare făcut o dată."
    },
    5: {
      theme: "Lună de schimbare",
      overview: "Planurile se mută luna asta. Intră ceva neprevăzut; fă-i loc în loc să te lupți cu el.",
      career: "La muncă se schimbă probabil ceva. Cine se adaptează primul prinde locul mai bun.",
      relationships: "Faceți ceva nou împreună. Ai grijă la pornirea de a pleca atunci când totul devine rutină.",
      health: "Încearcă un alt fel de mișcare. Observă unde exagerezi: mâncare, ecrane, cafea.",
      finances: "Pot veni bani neașteptați, dar și cheltuieli neașteptate. Nu miza ce nu-ți permiți să pierzi.",
      spirituality: "Du-te undeva unde n-ai mai fost, chiar și aproape de casă. Un loc nou îți arată ceva nou despre tine."
    },
    6: {
      theme: "Lună pentru casă și pentru cei apropiați",
      overview: "Casa, familia și oamenii care se bazează pe tine trec pe primul loc. Grija e munca lunii, inclusiv grija față de tine.",
      career: "Ajută acolo unde e nevoie; munca în folosul altora merge bine. Nu prelua sarcinile tuturor.",
      relationships: "Tensiunile vechi se pot repara. Dă telefonul, gătește cina, spune ce ai de spus.",
      health: "Odihna acasă contează. Ai grijă de tine cum ai grijă de alții.",
      finances: "Banii puși în casă și în familie se întorc. Nu împrumuta mai mult decât îți permiți să pierzi.",
      spirituality: "Treburile obișnuite, făcute cu atenție, sunt de ajuns ca practică luna asta."
    },
    7: {
      theme: "Lună de privit înăuntru",
      overview: "O lună mai liniștită. Ai nevoie de timp singur ca să înțelegi ce se întâmplă; dă-ți timpul ăsta.",
      career: "Merg bine cercetarea, analiza și munca pe cont propriu. Decide după ce ai verificat, nu înainte.",
      relationships: "Mai puțini oameni, discuții mai lungi. Spune că ai nevoie de spațiu înainte să fie nevoiți alții să ghicească.",
      health: "Mintea obosește înaintea corpului. Somn, plimbări, mai puține ecrane.",
      finances: "Citește literele mici. Poate ieși la iveală ceva ascuns; așteaptă să iasă.",
      spirituality: "Citește ceva greu, meditează, plimbă-te mult singur. E luna întrebărilor."
    },
    8: {
      theme: "Lună de ambiție și bani",
      overview: "Munca, banii și autoritatea trec în prim-plan. Cere ce meriți; ceilalți te vor lua în serios.",
      career: "Cere promovarea, mărirea, rolul mai mare. Deciziile de acum au greutate.",
      relationships: "Fii atent cine are ultimul cuvânt. Generozitatea întărește o relație mai mult decât a avea dreptate.",
      health: "Poți trage tare; observă și unde se așază stresul în corp.",
      finances: "Lună bună pentru deciziile mari cu bani. Gândește mai larg, dar verifică cifrele de două ori.",
      spirituality: "Întreabă-te la ce-ți folosesc banii. Răspunsul spune mai mult decât suma."
    },
    9: {
      theme: "Lună de încheiere",
      overview: "Ceva se termină luna asta: un proiect, un obicei, un capitol. Lasă-l să plece ca să faci loc pentru ce urmează.",
      career: "Termină proiectele care se tot lungesc și predă ce nu mai vrei să cari.",
      relationships: "Iartă ce se poate ierta. Unii oameni pleacă; alții se întorc schimbați.",
      health: "Fă curat în dulap, în mesaje, în supărări. Se vede în cum dormi.",
      finances: "Plătește datoriile, închide ce e încă deschis. Ce dai acum costă mai puțin decât pare.",
      spirituality: "Privește înapoi la ultimele nouă luni. Scrie ce iei cu tine și ce lași în urmă."
    }
  },
  ru: {
    1: {
      theme: "Месяц начинаний",
      overview: "Этот месяц просит первого шага. То, что вы начнёте сейчас, задаст направление на следующие девять месяцев, поэтому начинайте то, чего действительно хотите, а не то, что удобно.",
      career: "Предложите проект, попросите руководящую роль, отправьте заявку. Замечают того, кто двинулся первым.",
      relationships: "Говорите прямо, что вам нужно. Могут появиться новые люди — покажите им, кто вы, а не кем удобно быть.",
      health: "Сил с запасом. Привычка, начатая сейчас, приживается легче, чем в любой другой месяц.",
      finances: "Хороший месяц для нового источника дохода. Решайте сами, но сначала запишите цифры.",
      spirituality: "Спросите себя, чего вы хотите для себя, а не для других. Запишите ответ."
    },
    2: {
      theme: "Месяц терпения",
      overview: "В этом месяце всё движется медленно и через других людей. То, что вы толкаете в одиночку, застревает; то, что строите с кем-то, держится.",
      career: "Работайте в паре, а не в одиночку. Ультиматум отложите — разговор решит больше.",
      relationships: "Дослушайте до конца, прежде чем отвечать. Маленькие жесты значат больше громких слов.",
      health: "Тело чувствует напряжение в доме. Сон и тишина важнее спортзала.",
      finances: "Не подписывайте ничего крупного. Собирайте информацию, сравнивайте, ждите следующего месяца.",
      spirituality: "Замечайте, что чувствуете, прежде чем объяснять это. Нескольких минут тишины в день достаточно."
    },
    3: {
      theme: "Месяц, чтобы говорить",
      overview: "Этот месяц просит показать, что у вас есть: пишите, говорите, выходите к людям. Идеи, оставленные в голове, черствеют.",
      career: "Покажите свою работу, даже незаконченную. Идеи, сказанные вслух, принимают лучше.",
      relationships: "Выходите, звоните, приглашайте. Скажите людям, что вам в них нравится, сейчас, а не потом.",
      health: "Настроение поднимается, когда вы делаете что-то руками. Осторожнее с поздними ночами и лишним бокалом.",
      finances: "Деньги могут прийти от того, что вы создаёте или говорите. Мелкие разбросанные траты быстро складываются.",
      spirituality: "Вечером записывайте три вещи, которые получились. Это меняет то, что вы замечаете на следующий день."
    },
    4: {
      theme: "Месяц фундамента",
      overview: "Месяц кропотливой работы без блеска. То, что вы аккуратно построите сейчас, простоит годы.",
      career: "Доделайте начатое, прежде чем браться за новое. Сейчас важны детали и сроки.",
      relationships: "Приходите, когда обещали. Доверие растёт из надёжности, а не из слов.",
      health: "Наладьте режим: время сна, еду, обследование, которое всё откладываете.",
      finances: "Составьте бюджет и держитесь его четыре недели. Сбережения сейчас — фундамент на потом.",
      spirituality: "Маленькая привычка, которой вы следуете каждый день, лучше большой, сделанной один раз."
    },
    5: {
      theme: "Месяц перемен",
      overview: "В этом месяце планы сдвигаются. Приходит что-то неожиданное — освободите для него место, вместо того чтобы бороться.",
      career: "На работе, вероятно, что-то изменится. Кто приспособится первым, займёт лучшее место.",
      relationships: "Сделайте вместе что-то новое. Следите за желанием сбежать, когда всё становится привычным.",
      health: "Попробуйте новый вид движения. Заметьте, где перебираете: еда, экраны, кофе.",
      finances: "Могут прийти неожиданные деньги — и неожиданные расходы. Не ставьте на кон то, что не можете потерять.",
      spirituality: "Съездите туда, где ещё не были, пусть и рядом с домом. Новое место показывает что-то новое о вас самих."
    },
    6: {
      theme: "Месяц дома и близких",
      overview: "Дом, семья и люди, которые на вас рассчитывают, выходят на первый план. Забота — главная работа месяца, включая заботу о себе.",
      career: "Помогайте там, где нужно: работа на благо других идёт хорошо. Но не берите на себя чужие задачи.",
      relationships: "Старые обиды можно залечить. Позвоните, приготовьте ужин, скажите то, что хотели сказать.",
      health: "Отдых дома тоже считается. Заботьтесь о себе так, как заботитесь о других.",
      finances: "Траты на дом и семью окупаются. Не одалживайте больше, чем готовы потерять.",
      spirituality: "Обычные домашние дела, сделанные со вниманием, — достаточная практика в этом месяце."
    },
    7: {
      theme: "Месяц, чтобы заглянуть внутрь",
      overview: "Более тихий месяц. Вам нужно время наедине с собой, чтобы понять, что происходит, — дайте его себе.",
      career: "Хорошо идут исследования, анализ и самостоятельная работа. Решайте после проверки, а не до неё.",
      relationships: "Меньше людей, длиннее разговоры. Скажите, что вам нужно пространство, прежде чем другим придётся догадываться.",
      health: "Голова устаёт раньше тела. Сон, прогулки, меньше экранов.",
      finances: "Читайте мелкий шрифт. Может всплыть что-то скрытое — дождитесь этого.",
      spirituality: "Читайте что-то трудное, медитируйте, подолгу гуляйте в одиночестве. Это месяц вопросов."
    },
    8: {
      theme: "Месяц амбиций и денег",
      overview: "Работа, деньги и авторитет выходят на первый план. Просите то, чего заслуживаете, — к вам отнесутся серьёзно.",
      career: "Просите повышения, прибавки, большей роли. Решения, принятые сейчас, имеют вес.",
      relationships: "Следите, за кем последнее слово. Щедрость укрепляет отношения больше, чем правота.",
      health: "Вы можете работать с полной отдачей; заметьте и то, где в теле оседает стресс.",
      finances: "Хороший месяц для крупных денежных решений. Думайте шире, но проверяйте цифры дважды.",
      spirituality: "Спросите себя, для чего вам деньги. Ответ скажет больше, чем сумма."
    },
    9: {
      theme: "Месяц завершений",
      overview: "В этом месяце что-то заканчивается: проект, привычка, глава. Отпустите это, чтобы освободить место для следующего.",
      career: "Завершите затянувшиеся проекты и передайте то, что больше не хотите нести.",
      relationships: "Простите то, что можно простить. Кто-то уходит, кто-то возвращается другим.",
      health: "Разберите шкаф, почту, обиды. Это скажется на том, как вы спите.",
      finances: "Погасите долги, закройте то, что ещё открыто. Отдать что-то сейчас стоит меньше, чем кажется.",
      spirituality: "Оглянитесь на последние девять месяцев. Запишите, что берёте с собой, а что оставляете."
    }
  }
};

export const getDailyPrediction = (birthDate: Date, date: Date = new Date()): DailyPrediction => {
  const number = calculatePersonalDayNumber(birthDate, date);
  return {
    number,
    ...dailyPredictionsData[number]
  };
};

export const getMonthlyPrediction = (
  birthDate: Date,
  month: number,
  year: number,
  lang: Language = 'en'
): MonthlyPrediction => {
  const number = personalMonthFor(birthDate, year, month);

  // Calculate key days for this month (days where personal day number matches personal month number)
  const daysInMonth = new Date(year, month, 0).getDate();
  const keyDays: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayNumber = calculatePersonalDayNumber(birthDate, date);
    if (dayNumber === number || dayNumber === 1 || dayNumber === 8) {
      keyDays.push(day);
    }
  }

  return {
    number,
    keyDays: keyDays.slice(0, 5), // Return top 5 key days
    ...pick(MONTHLY, lang, number)
  };
};

export const getUniversalDayEnergy = (date: Date = new Date()): { number: number; energy: string } => {
  const number = calculateUniversalDay(date);
  return {
    number,
    energy: dailyPredictionsData[number].energy
  };
};

// ===== PHASE 5.2: Weekly Predictions =====

/** O zi din săptămână: data ei, cifra ei personală, un rând. */
export interface WeekDay {
  date: Date;
  personalDay: number;
  line: string;
}

/**
 * Săptămâna nu are o cifră a ei. Era calculată ca media celor șapte zile
 * personale -- o cifră care nu iese din niciun calcul numerologic și pe care
 * doctrina o interzice (R1: nu facem medii). Acum săptămâna e ce e: șapte
 * zile, fiecare cu cifra ei, în cadrul lunii personale în care începe.
 */
export interface WeeklyPrediction {
  weekStart: Date;
  weekEnd: Date;
  /** Luna personală a zilei de început. */
  personalMonth: number;
  monthTheme: string;
  days: WeekDay[];
}

/** Un rând scurt pe zi personală. */
const WEEK_DAY_LINES: ByLang<string> = {
  en: {
    1: "Make a first move on something.",
    2: "Do it together, not alone.",
    3: "Say it out loud, show it to someone.",
    4: "Finish one practical thing.",
    5: "Leave room for the unplanned.",
    6: "Time for home and the people close to you.",
    7: "Keep an hour just for yourself.",
    8: "Ask, negotiate, settle money matters.",
    9: "Close something and let it go."
  },
  ro: {
    1: "Fă primul pas la ceva.",
    2: "Fă-o împreună, nu singur.",
    3: "Spune-o cu voce tare, arat-o cuiva.",
    4: "Termină un lucru practic.",
    5: "Lasă loc pentru neprevăzut.",
    6: "Timp pentru casă și pentru cei apropiați.",
    7: "Păstrează o oră doar pentru tine.",
    8: "Cere, negociază, rezolvă ce ține de bani.",
    9: "Închide ceva și dă-i drumul."
  },
  ru: {
    1: "Сделайте первый шаг к чему-то.",
    2: "Делайте вместе, а не в одиночку.",
    3: "Скажите вслух, покажите кому-нибудь.",
    4: "Доведите до конца одно практическое дело.",
    5: "Оставьте место для незапланированного.",
    6: "Время для дома и близких.",
    7: "Оставьте час только для себя.",
    8: "Просите, договаривайтесь, решайте денежное.",
    9: "Закройте что-то и отпустите."
  }
};

/**
 * The week as its seven personal days, framed by the personal month.
 * @param birthDate - Birth date
 * @param weekStartDate - First day of the week
 * @param lang - Language of the text
 */
export const calculateWeeklyTheme = (
  birthDate: Date,
  weekStartDate: Date = new Date(),
  lang: Language = 'en'
): WeeklyPrediction => {
  const start = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
  const month = start.getMonth() + 1;
  const year = start.getFullYear();

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(year, start.getMonth(), start.getDate() + i);
    const personalDay = calculatePersonalDayNumber(birthDate, date);
    days.push({ date, personalDay, line: pick(WEEK_DAY_LINES, lang, personalDay) });
  }

  const monthly = getMonthlyPrediction(birthDate, month, year, lang);

  return {
    weekStart: start,
    weekEnd: days[6].date,
    personalMonth: monthly.number,
    monthTheme: monthly.theme,
    days
  };
};

// ===== PHASE 5.2: Extended Monthly Predictions =====

const MONTHLY_FOCUS: ByLang<string[]> = {
  en: {
    1: ["New projects", "Leading", "Independence", "Initiative"],
    2: ["Partnerships", "Cooperation", "Patience", "Details"],
    3: ["Creativity", "Expression", "Friends", "Conversation"],
    4: ["Order", "Structure", "Groundwork", "Discipline"],
    5: ["Change", "Freedom", "Travel", "Flexibility"],
    6: ["Family", "Home", "Responsibility", "Care"],
    7: ["Reflection", "Study", "Solitude", "Questions"],
    8: ["Career", "Money", "Authority", "Results"],
    9: ["Endings", "Letting go", "Forgiveness", "Giving"]
  },
  ro: {
    1: ["Proiecte noi", "Conducere", "Independență", "Inițiativă"],
    2: ["Parteneriate", "Cooperare", "Răbdare", "Detalii"],
    3: ["Creativitate", "Exprimare", "Prieteni", "Conversație"],
    4: ["Ordine", "Structură", "Temelie", "Disciplină"],
    5: ["Schimbare", "Libertate", "Drumuri", "Flexibilitate"],
    6: ["Familie", "Casă", "Răspundere", "Grijă"],
    7: ["Reflecție", "Studiu", "Singurătate", "Întrebări"],
    8: ["Carieră", "Bani", "Autoritate", "Rezultate"],
    9: ["Încheieri", "Desprindere", "Iertare", "Dăruire"]
  },
  ru: {
    1: ["Новые проекты", "Лидерство", "Независимость", "Инициатива"],
    2: ["Партнёрство", "Сотрудничество", "Терпение", "Детали"],
    3: ["Творчество", "Самовыражение", "Друзья", "Разговоры"],
    4: ["Порядок", "Структура", "Фундамент", "Дисциплина"],
    5: ["Перемены", "Свобода", "Поездки", "Гибкость"],
    6: ["Семья", "Дом", "Ответственность", "Забота"],
    7: ["Размышление", "Учёба", "Уединение", "Вопросы"],
    8: ["Карьера", "Деньги", "Авторитет", "Результаты"],
    9: ["Завершения", "Отпускание", "Прощение", "Отдача"]
  }
};

/**
 * Calculate detailed monthly focus areas.
 * @param birthDate - Birth date
 * @param month - Month number (1-12)
 * @param year - Year
 * @param lang - Language of the text
 * @returns Array of focus areas for the month
 */
export const calculateMonthlyFocus = (
  birthDate: Date,
  month: number,
  year: number,
  lang: Language = 'en'
): string[] => pick(MONTHLY_FOCUS, lang, personalMonthFor(birthDate, year, month));

const MONTHLY_RECOMMENDATIONS: ByLang<string[]> = {
  en: {
    1: [
      "Start the project you keep putting off",
      "Offer to lead something",
      "Write down one clear goal for the month",
      "Make the first move instead of waiting",
      "Decide on your own judgement, then act"
    ],
    2: [
      "Do the important work together with someone",
      "Give slow things the time they need",
      "Check the details twice",
      "Listen more than you speak",
      "Choose collaboration over competition"
    ],
    3: [
      "Make something and show it",
      "Say yes to invitations",
      "Share an idea before it is perfect",
      "Notice one good thing every day",
      "Say what you think, kindly and clearly"
    ],
    4: [
      "Clear your desk and your inbox",
      "Finish what is half-done",
      "Deal with the practical things first",
      "Keep the same routine for four weeks",
      "Break the big goal into weekly steps"
    ],
    5: [
      "Say yes to something you have never done",
      "Keep your plans loose",
      "Change one habit",
      "Go somewhere, even briefly",
      "Do one thing that scares you a little"
    ],
    6: [
      "Spend unhurried time with your family",
      "Fix something in the house",
      "Make up with someone",
      "Help whoever asks you",
      "Say one no that protects your own time"
    ],
    7: [
      "Keep a few hours alone each week",
      "Study something in depth",
      "Keep a journal",
      "Wait before answering what upset you",
      "Write down the questions you can't answer yet"
    ],
    8: [
      "Ask for the raise or the promotion",
      "Make the money decision you keep delaying",
      "Take a risk you have calculated",
      "Invest in a skill that pays",
      "Take responsibility in front of others"
    ],
    9: [
      "Finish what has dragged on",
      "Give away what you no longer use",
      "Forgive one old grudge",
      "Help without expecting anything back",
      "Write down what you want to start next"
    ]
  },
  ro: {
    1: [
      "Începe proiectul pe care îl tot amâni",
      "Oferă-te să conduci ceva",
      "Scrie un singur scop limpede pentru luna asta",
      "Fă tu primul pas, nu aștepta",
      "Decide după capul tău, apoi treci la fapte"
    ],
    2: [
      "Fă lucrul important împreună cu cineva",
      "Dă-le timp lucrurilor care merg încet",
      "Verifică detaliile de două ori",
      "Ascultă mai mult decât vorbești",
      "Alege colaborarea, nu întrecerea"
    ],
    3: [
      "Fă ceva și arată-l",
      "Spune da la invitații",
      "Împărtășește o idee înainte să fie perfectă",
      "Observă în fiecare zi un lucru bun",
      "Spune ce crezi, blând și limpede"
    ],
    4: [
      "Fă ordine pe birou și în mesaje",
      "Termină ce e pe jumătate",
      "Rezolvă întâi lucrurile practice",
      "Ține aceeași rutină patru săptămâni",
      "Împarte scopul mare în pași de o săptămână"
    ],
    5: [
      "Spune da la ceva ce n-ai mai făcut",
      "Ține planurile largi",
      "Schimbă un obicei",
      "Pleacă undeva, fie și pentru puțin",
      "Fă un lucru care te sperie puțin"
    ],
    6: [
      "Petrece timp fără grabă cu familia",
      "Repară ceva în casă",
      "Împacă-te cu cineva",
      "Ajută-l pe cel care îți cere",
      "Spune un „nu” care îți apără timpul"
    ],
    7: [
      "Păstrează câteva ore doar pentru tine în fiecare săptămână",
      "Studiază ceva în profunzime",
      "Ține un jurnal",
      "Așteaptă înainte să răspunzi la ce te-a supărat",
      "Scrie întrebările la care încă n-ai răspuns"
    ],
    8: [
      "Cere mărirea sau promovarea",
      "Ia decizia cu bani pe care o tot amâni",
      "Asumă-ți un risc calculat",
      "Investește într-o abilitate care aduce bani",
      "Asumă-ți răspunderea în fața celorlalți"
    ],
    9: [
      "Termină ce s-a tot lungit",
      "Dă ce nu mai folosești",
      "Iartă o supărare veche",
      "Ajută fără să aștepți nimic înapoi",
      "Scrie ce vrei să începi după"
    ]
  },
  ru: {
    1: [
      "Начните проект, который всё откладываете",
      "Вызовитесь чем-то руководить",
      "Запишите одну ясную цель на месяц",
      "Сделайте первый шаг сами, не ждите",
      "Решите своим умом и действуйте"
    ],
    2: [
      "Делайте важное вместе с кем-то",
      "Дайте медленным делам время",
      "Проверяйте детали дважды",
      "Слушайте больше, чем говорите",
      "Выбирайте сотрудничество, а не соперничество"
    ],
    3: [
      "Сделайте что-то и покажите",
      "Принимайте приглашения",
      "Делитесь идеей, пока она ещё не идеальна",
      "Каждый день замечайте одну хорошую вещь",
      "Говорите, что думаете, мягко и ясно"
    ],
    4: [
      "Разберите стол и почту",
      "Доделайте начатое",
      "Сначала решите практические вопросы",
      "Держите один режим четыре недели",
      "Разбейте большую цель на шаги по неделям"
    ],
    5: [
      "Согласитесь на то, чего никогда не делали",
      "Не стройте жёстких планов",
      "Измените одну привычку",
      "Съездите куда-нибудь, хотя бы ненадолго",
      "Сделайте одну вещь, которая немного пугает"
    ],
    6: [
      "Проведите неспешное время с семьёй",
      "Почините что-то дома",
      "Помиритесь с кем-то",
      "Помогите тому, кто просит",
      "Скажите одно «нет», которое бережёт ваше время"
    ],
    7: [
      "Выделяйте каждую неделю несколько часов наедине с собой",
      "Изучите что-то глубоко",
      "Ведите дневник",
      "Не отвечайте сразу на то, что задело",
      "Запишите вопросы, на которые пока нет ответа"
    ],
    8: [
      "Попросите прибавку или повышение",
      "Примите денежное решение, которое откладываете",
      "Пойдите на просчитанный риск",
      "Вложитесь в навык, который приносит деньги",
      "Возьмите ответственность на виду у других"
    ],
    9: [
      "Завершите то, что затянулось",
      "Отдайте то, чем больше не пользуетесь",
      "Простите одну старую обиду",
      "Помогите, ничего не ожидая взамен",
      "Запишите, что хотите начать потом"
    ]
  }
};

/**
 * Get detailed monthly recommendations.
 * @param birthDate - Birth date
 * @param month - Month number (1-12)
 * @param year - Year
 * @param lang - Language of the text
 * @returns Array of specific recommendations for the month
 */
export const getMonthlyRecommendations = (
  birthDate: Date,
  month: number,
  year: number,
  lang: Language = 'en'
): string[] => pick(MONTHLY_RECOMMENDATIONS, lang, personalMonthFor(birthDate, year, month));

// ===== PHASE 5.3: Annual Predictions =====

const ANNUAL_THEMES: ByLang<{ theme: string; description: string }> = {
  en: {
    1: { theme: "A year of beginnings", description: "The first year of a nine-year cycle. What you start now sets the direction of the years that follow, so choose deliberately." },
    2: { theme: "A year of patience and partnership", description: "Things grow slowly this year, and through other people. Cooperation, patience and attention to detail pay off more than force." },
    3: { theme: "A year of expression", description: "A year to show what you have: create, speak, meet people. What stays unsaid this year stays unused." },
    4: { theme: "A year of groundwork", description: "A year of steady work and structure. It is not spectacular, but what you build now holds for a long time." },
    5: { theme: "A year of change", description: "Plans move this year: a new place, a new job, new people. Flexibility serves you better than control." },
    6: { theme: "A year of home and responsibility", description: "Family, home and the people who rely on you come first. The work is caring well, including for yourself." },
    7: { theme: "A year to look inward", description: "A quieter year of study and reflection. You understand more than you achieve, and that is the point of it." },
    8: { theme: "A year of ambition and results", description: "Work, money and recognition are in play. What you built in the past years can pay off now — ask for it." },
    9: { theme: "A year of closing", description: "The last year of the cycle. Finish, let go, clear space. What ends now makes room for what starts next year." }
  },
  ro: {
    1: { theme: "An de început", description: "Primul an dintr-un ciclu de nouă. Ce începi acum dă direcția anilor care urmează, așa că alege cu bună știință." },
    2: { theme: "An de răbdare și de parteneriat", description: "Lucrurile cresc încet anul ăsta și trec prin alți oameni. Colaborarea, răbdarea și atenția la detalii aduc mai mult decât forța." },
    3: { theme: "An de exprimare", description: "Un an în care să arăți ce ai: creează, vorbește, ieși printre oameni. Ce rămâne nespus anul ăsta rămâne nefolosit." },
    4: { theme: "An de temelie", description: "Un an de muncă constantă și de ordine. Nu e spectaculos, dar ce construiești acum ține mult." },
    5: { theme: "An de schimbare", description: "Planurile se mută anul ăsta: alt loc, altă slujbă, alți oameni. Flexibilitatea te ajută mai mult decât controlul." },
    6: { theme: "An pentru casă și răspundere", description: "Familia, casa și oamenii care se bazează pe tine vin pe primul loc. Munca anului e să ai grijă bine, inclusiv de tine." },
    7: { theme: "An de privit înăuntru", description: "Un an mai liniștit, de studiu și de reflecție. Înțelegi mai mult decât realizezi, și tocmai ăsta e rostul lui." },
    8: { theme: "An de ambiție și rezultate", description: "Munca, banii și recunoașterea sunt în joc. Ce ai construit în anii din urmă poate da roade acum — cere-le." },
    9: { theme: "An de încheiere", description: "Ultimul an din ciclu. Termină, dă drumul, fă loc. Ce se încheie acum face loc pentru ce începe anul viitor." }
  },
  ru: {
    1: { theme: "Год начинаний", description: "Первый год девятилетнего цикла. То, что вы начнёте сейчас, задаст направление следующим годам, поэтому выбирайте осознанно." },
    2: { theme: "Год терпения и партнёрства", description: "В этом году всё растёт медленно и через других людей. Сотрудничество, терпение и внимание к деталям дают больше, чем напор." },
    3: { theme: "Год самовыражения", description: "Год, чтобы показать, что у вас есть: создавайте, говорите, выходите к людям. То, что останется несказанным, останется неиспользованным." },
    4: { theme: "Год фундамента", description: "Год упорной работы и порядка. Он не эффектный, но то, что вы построите сейчас, продержится долго." },
    5: { theme: "Год перемен", description: "В этом году планы сдвигаются: новое место, новая работа, новые люди. Гибкость поможет больше, чем контроль." },
    6: { theme: "Год дома и ответственности", description: "Семья, дом и люди, которые на вас рассчитывают, на первом месте. Задача года — хорошо заботиться, в том числе о себе." },
    7: { theme: "Год, чтобы заглянуть внутрь", description: "Более тихий год учёбы и размышлений. Вы больше понимаете, чем достигаете, — в этом и смысл." },
    8: { theme: "Год амбиций и результатов", description: "Работа, деньги и признание в игре. То, что вы строили в прошлые годы, может принести плоды сейчас — просите о них." },
    9: { theme: "Год завершений", description: "Последний год цикла. Заканчивайте, отпускайте, освобождайте место. То, что закончится сейчас, даст место тому, что начнётся в следующем году." }
  }
};

/**
 * Calculate annual theme based on personal year number.
 * @param birthDate - Birth date
 * @param year - Year to analyze
 * @param lang - Language of the text
 * @returns Annual theme description
 */
export const calculateAnnualTheme = (
  birthDate: Date,
  year: number,
  lang: Language = 'en'
): { theme: string; description: string } =>
  pick(ANNUAL_THEMES, lang, calculatePersonalYearNumber(birthDate, year));

const ANNUAL_OPPORTUNITIES: ByLang<string[]> = {
  en: {
    1: ["Starting something of your own", "Taking the lead", "Changing direction at work", "Learning a new skill", "Deciding where the next nine years go"],
    2: ["Finding the right partner for a project", "Deepening a close relationship", "Working as a team", "Settling a conflict calmly", "Learning to wait without giving up"],
    3: ["Creative projects", "Meeting new people", "Writing, speaking, performing", "Making your work visible", "Enjoying things again"],
    4: ["Putting your finances in order", "Planning for the long term", "Building a routine you can rely on", "Finishing a qualification", "Steady progress"],
    5: ["Travel", "Moving house or changing jobs", "Trying new things", "More freedom in your schedule", "Saying yes to the unexpected"],
    6: ["Mending family relationships", "Improving your home", "Committing to someone", "Helping the people around you", "Making things beautiful around you"],
    7: ["Studying something in depth", "Understanding yourself better", "Research and analysis", "A regular quiet practice", "Answering questions you have avoided"],
    8: ["A promotion or a bigger role", "Better income", "Recognition for past work", "Business opportunities", "Taking on authority"],
    9: ["Finishing long projects", "Clearing out what no longer fits", "Helping others", "Forgiving and moving on", "Preparing for a new cycle"]
  },
  ro: {
    1: ["Să începi ceva al tău", "Să iei conducerea", "O schimbare de direcție la muncă", "Să înveți o abilitate nouă", "Să hotărăști încotro merg următorii nouă ani"],
    2: ["Să găsești partenerul potrivit pentru un proiect", "Să adâncești o relație apropiată", "Lucrul în echipă", "Să rezolvi un conflict cu calm", "Să înveți să aștepți fără să renunți"],
    3: ["Proiecte creative", "Oameni noi", "Să scrii, să vorbești, să urci pe scenă", "Să faci vizibil ce lucrezi", "Să te bucuri din nou de lucruri"],
    4: ["Să-ți pui banii în ordine", "Planuri pe termen lung", "O rutină pe care te poți baza", "Să termini o calificare", "Progres constant"],
    5: ["Călătorii", "O mutare sau o slujbă nouă", "Să încerci lucruri noi", "Mai multă libertate în program", "Să spui da neprevăzutului"],
    6: ["Să repari relațiile din familie", "Să-ți îmbunătățești casa", "Să te angajezi față de cineva", "Să-i ajuți pe cei din jur", "Să faci frumos în jurul tău"],
    7: ["Să studiezi ceva în profunzime", "Să te înțelegi mai bine", "Cercetare și analiză", "O practică liniștită, regulată", "Să răspunzi la întrebările pe care le-ai ocolit"],
    8: ["Promovare sau un rol mai mare", "Venit mai bun", "Recunoaștere pentru munca de până acum", "Oportunități de afaceri", "Să-ți asumi autoritatea"],
    9: ["Să termini proiectele lungi", "Să scapi de ce nu se mai potrivește", "Să-i ajuți pe alții", "Să ierți și să mergi mai departe", "Să te pregătești pentru un ciclu nou"]
  },
  ru: {
    1: ["Начать что-то своё", "Взять руководство на себя", "Сменить направление в работе", "Освоить новый навык", "Решить, куда пойдут следующие девять лет"],
    2: ["Найти подходящего партнёра для проекта", "Углубить близкие отношения", "Работа в команде", "Спокойно уладить конфликт", "Научиться ждать, не сдаваясь"],
    3: ["Творческие проекты", "Новые знакомства", "Писать, выступать, говорить", "Сделать свою работу заметной", "Снова радоваться жизни"],
    4: ["Навести порядок в финансах", "Долгосрочные планы", "Распорядок, на который можно положиться", "Получить квалификацию", "Постоянный прогресс"],
    5: ["Путешествия", "Переезд или новая работа", "Пробовать новое", "Больше свободы в расписании", "Говорить «да» неожиданному"],
    6: ["Наладить отношения в семье", "Обустроить дом", "Серьёзные обязательства перед близким человеком", "Помогать людям вокруг", "Создавать красоту вокруг себя"],
    7: ["Глубоко изучить что-то", "Лучше понять себя", "Исследования и анализ", "Регулярная тихая практика", "Ответить на вопросы, которых вы избегали"],
    8: ["Повышение или более крупная роль", "Более высокий доход", "Признание прежней работы", "Деловые возможности", "Взять на себя ответственность и власть"],
    9: ["Завершить долгие проекты", "Избавиться от того, что больше не подходит", "Помогать другим", "Простить и идти дальше", "Подготовиться к новому циклу"]
  }
};

/**
 * Calculate annual opportunities based on personal year.
 * @param birthDate - Birth date
 * @param year - Year to analyze
 * @param lang - Language of the text
 * @returns Array of opportunities for the year
 */
export const calculateAnnualOpportunities = (
  birthDate: Date,
  year: number,
  lang: Language = 'en'
): string[] => pick(ANNUAL_OPPORTUNITIES, lang, calculatePersonalYearNumber(birthDate, year));

const ANNUAL_CHALLENGES: ByLang<string[]> = {
  en: {
    1: ["Acting on impulse", "Doing everything alone", "Impatience", "Forgetting the people around you"],
    2: ["Indecision", "Taking things too personally", "Losing yourself in others", "Depending on someone's approval"],
    3: ["Spreading yourself too thin", "Too much going out, too little rest", "Staying on the surface", "Overdoing food, drink or spending"],
    4: ["Rigidity", "Working without rest", "Turning into a workaholic", "Resisting a change you need"],
    5: ["Acting on impulse", "Freedom without responsibility", "Restlessness", "Hasty decisions"],
    6: ["Overprotecting others", "Forgetting to look after yourself", "Giving up what you need", "Perfectionism"],
    7: ["Isolating yourself", "Too little contact with others", "Withdrawing completely", "Overthinking"],
    8: ["Measuring everything in money", "Ambition without kindness", "Needing control", "Stress from pushing too hard"],
    9: ["Holding on to the past", "Starting new things too early", "Melancholy", "Clinging to what is ending"]
  },
  ro: {
    1: ["Să acționezi din impuls", "Să faci totul singur", "Nerăbdarea", "Să-i uiți pe cei din jur"],
    2: ["Nehotărârea", "Să iei totul personal", "Să te pierzi în ceilalți", "Să depinzi de aprobarea cuiva"],
    3: ["Să te împrăștii în prea multe", "Prea multe ieșiri, prea puțină odihnă", "Să rămâi la suprafață", "Excesul de mâncare, băutură sau cumpărături"],
    4: ["Rigiditatea", "Munca fără odihnă", "Să nu mai știi să te oprești din muncă", "Să te împotrivești unei schimbări de care ai nevoie"],
    5: ["Să acționezi din impuls", "Libertate fără răspundere", "Neliniștea", "Deciziile grăbite"],
    6: ["Să-i protejezi prea mult pe ceilalți", "Să uiți să ai grijă de tine", "Să renunți la ce-ți trebuie", "Perfecționismul"],
    7: ["Să te izolezi", "Prea puțin contact cu ceilalți", "Să te retragi de tot", "Să gândești prea mult"],
    8: ["Să măsori totul în bani", "Ambiție fără bunătate", "Nevoia de control", "Stresul de a trage prea tare"],
    9: ["Să ții de trecut", "Să începi lucruri noi prea devreme", "Melancolia", "Să te agăți de ce se termină"]
  },
  ru: {
    1: ["Действовать импульсивно", "Делать всё в одиночку", "Нетерпение", "Забывать о людях рядом"],
    2: ["Нерешительность", "Принимать всё на свой счёт", "Растворяться в других", "Зависеть от чужого одобрения"],
    3: ["Распыляться", "Слишком много встреч, слишком мало отдыха", "Оставаться на поверхности", "Излишества в еде, выпивке или покупках"],
    4: ["Жёсткость", "Работа без отдыха", "Превратиться в трудоголика", "Сопротивляться нужным переменам"],
    5: ["Действовать импульсивно", "Свобода без ответственности", "Беспокойство", "Поспешные решения"],
    6: ["Чрезмерная опека", "Забывать заботиться о себе", "Жертвовать своими нуждами", "Перфекционизм"],
    7: ["Изоляция", "Слишком мало общения", "Полный уход в себя", "Слишком много размышлений"],
    8: ["Измерять всё деньгами", "Амбиции без доброты", "Желание всё контролировать", "Стресс от чрезмерного напора"],
    9: ["Держаться за прошлое", "Начинать новое слишком рано", "Меланхолия", "Цепляться за то, что заканчивается"]
  }
};

/**
 * Calculate annual challenges based on personal year.
 * @param birthDate - Birth date
 * @param year - Year to analyze
 * @param lang - Language of the text
 * @returns Array of challenges for the year
 */
export const calculateAnnualChallenges = (
  birthDate: Date,
  year: number,
  lang: Language = 'en'
): string[] => pick(ANNUAL_CHALLENGES, lang, calculatePersonalYearNumber(birthDate, year));

// ===== PHASE 5.4: Calendar Functions =====

/**
 * Get favorable days in a date range based on numerology.
 * @param birthDate - Birth date
 * @param startDate - Start date of range
 * @param endDate - End date of range
 * @param minScore - Minimum lucky score (default: 40)
 * @returns Array of favorable dates with their scores
 */
export const getFavorableDays = (
  birthDate: Date,
  startDate: Date,
  endDate: Date,
  minScore: number = 40
): Array<{ date: Date; score: number; reasons: string[] }> => {
  const lifePath = calculateLifePathNumber(birthDate);
  const favorableDays: Array<{ date: Date; score: number; reasons: string[] }> = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const personalYear = calculatePersonalYearNumber(birthDate, currentDate.getFullYear());
    const { score, reasons } = calculateLuckyScore(currentDate, lifePath, 0, personalYear);
    
    if (score >= minScore) {
      favorableDays.push({
        date: new Date(currentDate),
        score,
        reasons
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return favorableDays.sort((a, b) => b.score - a.score);
};
