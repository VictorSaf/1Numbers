export type LegalLang = "ro" | "en" | "ru";

/**
 * Politica de confidențialitate și termenii, ca DATE.
 *
 * Nu în `translations.ts`: acolo stau etichete de interfață, iar un document
 * juridic împrăștiat printre ele nu se mai poate citi cap-coadă ca să vezi dacă
 * e adevărat. Aici cele trei limbi stau una lângă alta, secțiune cu secțiune,
 * deci o schimbare care atinge doar româna se vede imediat.
 *
 * Ce e scris aici e verificat în cod, nu presupus: tabelele sunt cele 24 din
 * migrații, destinatarii sunt cei trei care chiar primesc ceva, iar drepturile
 * trimit la butoane care există -- de asta documentul se scrie DUPĂ ele.
 *
 * `[...]` marchează ce nu poate ști decât operatorul. Sunt lăsate vizibile
 * intenționat: o paranteză goală se vede și se completează, o valoare
 * inventată nu se vede și rămâne minciună.
 */

export interface LegalSection {
  heading: string;
  /** Paragrafe. Un rând care începe cu „• ” se randează ca element de listă. */
  body: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  lede: string;
  sections: LegalSection[];
}

/** Data ultimei revizuiri de fond. Se schimbă cu mâna, când se schimbă textul. */
export const LEGAL_UPDATED = "2026-09-03";

const OPERATOR = "[DENUMIREA OPERATORULUI]";
const ADRESA = "[ADRESA]";
const CONTACT = "[ADRESA DE CONTACT]";
const GAZDUIRE = "[UNDE SUNT GĂZDUITE SERVERELE]";

export const PRIVACY: Record<LegalLang, LegalDocument> = {
  ro: {
    title: "Confidențialitate",
    updated: LEGAL_UPDATED,
    lede:
      "Ce date ținem, de ce, cui ajung și cum le poți lua înapoi sau șterge. Scrisă ca să fie citită, nu ca să fie bifată.",
    sections: [
      {
        heading: "Cine răspunde",
        body: [
          `Operatorul datelor este ${OPERATOR}, ${ADRESA}. Pentru orice întrebare despre datele tale sau ca să-ți exerciți drepturile de mai jos, scrie la ${CONTACT}.`,
        ],
      },
      {
        heading: "Ce ținem",
        body: [
          "Numai ce ne dai tu sau ce iese din ce ne dai. Nimic cumpărat de la terți, niciun profil construit din altă parte.",
          "• Contul: adresa de email, o parolă păstrată ca hash (nu o putem citi), numele pe care ți-l pui, momentul creării și dacă ți-ai confirmat adresa.",
          "• Hărțile: numele complet și data nașterii, opțional ora și locul. Din ele se calculează toate cifrele, în browserul tău.",
          "• Hărțile altor oameni, pe care le salvezi în cercul tău: aceleași câmpuri.",
          "• Jurnalul: ce scrii tu acolo, text liber.",
          "• Citirile zilei și cele profunde, păstrate ca să nu se schimbe la reîncărcare.",
          "• Preferințe: limba, tema, notificările, cine scrie textul zilei.",
          "• Prietenii și comparațiile partajate, dacă folosești cercul.",
          "• Un jurnal tehnic de activitate, pentru securitate.",
          "Nu folosim cookie-uri de urmărire și nu avem banner de consimțământ pentru ele, fiindcă n-am avea ce cere: statisticile de trafic se fac cu Plausible, care nu pune cookie-uri și nu construiește profiluri.",
        ],
      },
      {
        heading: "De ce, și pe ce temei",
        body: [
          "• Contul, hărțile, jurnalul și citirile — ca să existe serviciul pe care l-ai cerut. Temei: executarea contractului, art. 6(1)(b).",
          "• Textul scris de model și consultantul — numai cu acordul tău, pe care îl poți retrage oricând din profil. Temei: consimțământ, art. 6(1)(a).",
          "• Notificările — numai cu acordul tău, retractabil la fel.",
          "• Limitarea numărului de cereri, jurnalul de activitate și securitatea contului — interesul nostru legitim de a ține serviciul în picioare, art. 6(1)(f).",
          "Folosirea unei aplicații de numerologie poate spune ceva despre convingerile tale, iar autoritățile citesc categoria asta larg. De aceea acordul pentru model e cerut separat, nu împachetat în acceptarea termenilor.",
        ],
      },
      {
        heading: "Cui ajung",
        body: [
          "Trei destinatari, și niciunul nu primește mai mult decât are nevoie.",
          "• Anthropic — pentru textul zilei și pentru consultant, numai dacă ai dat acordul. Primește CIFRELE hărții și vârsta. Nu primește numele și nu primește data nașterii. Este în Statele Unite, deci transferul se face pe clauze contractuale standard.",
          "• Furnizorul de email — pentru confirmări, resetări de parolă și confirmarea ștergerii. Primește adresa ta și textul mesajului.",
          `• Găzduirea — ${GAZDUIRE}.`,
          "Nu vindem date. Nu le dăm nimănui pentru publicitate.",
        ],
      },
      {
        heading: "Cât le ținem",
        body: [
          "• Contul, hărțile și jurnalul: până le ștergi tu. Sunt ale tale.",
          "• Citirile zilei: 90 de zile. Se pot reface oricând din hartă.",
          "• Jurnalul de activitate: 12 luni.",
          "• Istoricul notificărilor: 90 de zile.",
          "• Jetoanele din emailuri: 7 zile după ce expiră.",
          "Când ștergi contul, ștergem. Nu îl marcăm inactiv și nu păstrăm o copie.",
        ],
      },
      {
        heading: "Drepturile tale, cu butoanele lângă ele",
        body: [
          "• Să vezi și să iei tot ce ținem: butonul „Descarcă” din profil îți dă un fișier JSON, pe loc.",
          "• Să ștergi: butonul „Șterge contul”, tot din profil. Trece printr-un email de confirmare, fiindcă e ireversibil.",
          "• Să corectezi ce e greșit: direct în profil.",
          "• Să retragi un acord: comutatoarele din profil, oricând, fără să pierzi contul.",
          "• Să te opui prelucrării sau să ceri restrângerea ei: scrie-ne.",
          `Dacă răspunsul nostru nu te mulțumește, te poți plânge la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (anspdcp.ro). Înainte de asta, încearcă la ${CONTACT} — de obicei e mai rapid.`,
        ],
      },
      {
        heading: "Datele altor oameni",
        body: [
          "Poți salva hărți pentru alții — copii, parteneri, colegi. Alea sunt datele lor, nu ale tale, chiar dacă tu le-ai scris. Rămân la tine, le poți șterge oricând, și dispar odată cu contul tău. Tu răspunzi pentru ce introduci despre alți oameni; dacă cineva îți cere să-i scoți datele, scoate-le.",
        ],
      },
      {
        heading: "Ce nu suntem",
        body: [
          "Interpretările din aplicație sunt simbolice, pentru reflecție. Nu înlocuiesc decizii medicale, financiare, juridice sau de relație, și nu prezic nimic.",
        ],
      },
    ],
  },

  en: {
    title: "Privacy",
    updated: LEGAL_UPDATED,
    lede:
      "What we hold, why, who receives it, and how you take it back or delete it. Written to be read, not ticked.",
    sections: [
      {
        heading: "Who is responsible",
        body: [
          `The data controller is ${OPERATOR}, ${ADRESA}. For any question about your data, or to exercise the rights below, write to ${CONTACT}.`,
        ],
      },
      {
        heading: "What we hold",
        body: [
          "Only what you give us, or what follows from it. Nothing bought from third parties, no profile assembled elsewhere.",
          "• The account: your email address, a password kept as a hash (we cannot read it), the name you choose, when it was created, and whether you confirmed the address.",
          "• Charts: full name and birth date, optionally time and place. Every number is computed from those, in your browser.",
          "• Charts you save for other people: the same fields.",
          "• The journal: whatever you write there, free text.",
          "• Daily and deep readings, kept so they do not change on reload.",
          "• Preferences: language, theme, notifications, who writes the day's text.",
          "• Friends and shared comparisons, if you use the circle.",
          "• A technical activity log, for security.",
          "We use no tracking cookies and have no consent banner for them, because there would be nothing to ask: traffic statistics come from Plausible, which sets no cookies and builds no profiles.",
        ],
      },
      {
        heading: "Why, and on what basis",
        body: [
          "• Account, charts, journal and readings — so the service you asked for exists. Basis: performance of a contract, Art. 6(1)(b).",
          "• Model-written text and the consultant — only with your consent, which you can withdraw at any time from your profile. Basis: consent, Art. 6(1)(a).",
          "• Notifications — only with your consent, withdrawable the same way.",
          "• Rate limiting, the activity log and account security — our legitimate interest in keeping the service standing, Art. 6(1)(f).",
          "Using a numerology app can say something about your beliefs, and regulators read that category broadly. That is why consent for the model is asked separately, not bundled into accepting the terms.",
        ],
      },
      {
        heading: "Who receives it",
        body: [
          "Three recipients, none of which gets more than it needs.",
          "• Anthropic — for the day's text and the consultant, only if you consented. It receives the chart's NUMBERS and your age. It does not receive your name and does not receive your birth date. It is in the United States, so the transfer runs on standard contractual clauses.",
          "• The email provider — for confirmations, password resets and deletion confirmations. It receives your address and the message.",
          `• Hosting — ${GAZDUIRE}.`,
          "We do not sell data. We give it to no one for advertising.",
        ],
      },
      {
        heading: "How long",
        body: [
          "• Account, charts and journal: until you delete them. They are yours.",
          "• Daily readings: 90 days. They can be rebuilt from the chart at any time.",
          "• Activity log: 12 months.",
          "• Notification history: 90 days.",
          "• Email tokens: 7 days after they expire.",
          "When you delete your account, we delete. We do not mark it inactive and we keep no copy.",
        ],
      },
      {
        heading: "Your rights, with the buttons beside them",
        body: [
          "• To see and take everything we hold: the “Download” button in your profile hands you a JSON file, immediately.",
          "• To delete: the “Delete your account” button, also in your profile. It goes through an email confirmation, because it cannot be undone.",
          "• To correct what is wrong: directly in your profile.",
          "• To withdraw a consent: the switches in your profile, at any time, without losing the account.",
          "• To object to processing or ask for it to be restricted: write to us.",
          `If our answer does not satisfy you, you may complain to your national data protection authority — in Romania, ANSPDCP (anspdcp.ro). Before that, try ${CONTACT}; it is usually faster.`,
        ],
      },
      {
        heading: "Other people's data",
        body: [
          "You can save charts for others — children, partners, colleagues. That is their data, not yours, even though you typed it. It stays with you, you can delete it at any time, and it goes when your account goes. You are responsible for what you enter about other people; if someone asks you to remove their data, remove it.",
        ],
      },
      {
        heading: "What we are not",
        body: [
          "The readings in this app are symbolic, meant for reflection. They do not replace medical, financial, legal or relationship decisions, and they predict nothing.",
        ],
      },
    ],
  },

  ru: {
    title: "Конфиденциальность",
    updated: LEGAL_UPDATED,
    lede:
      "Что мы храним, зачем, кому это уходит и как забрать или удалить. Написано, чтобы читать, а не чтобы поставить галочку.",
    sections: [
      {
        heading: "Кто отвечает",
        body: [
          `Оператор данных — ${OPERATOR}, ${ADRESA}. По любым вопросам о ваших данных и для осуществления прав ниже пишите на ${CONTACT}.`,
        ],
      },
      {
        heading: "Что мы храним",
        body: [
          "Только то, что вы даёте, или то, что из этого следует. Ничего купленного у третьих лиц, никаких профилей со стороны.",
          "• Аккаунт: адрес почты, пароль в виде хеша (прочитать его мы не можем), выбранное имя, время создания и подтверждён ли адрес.",
          "• Карты: полное имя и дата рождения, по желанию время и место. Все числа считаются из них, в вашем браузере.",
          "• Карты, сохранённые для других людей: те же поля.",
          "• Дневник: то, что вы там пишете, свободным текстом.",
          "• Чтения дня и глубокие чтения — чтобы они не менялись при перезагрузке.",
          "• Настройки: язык, тема, уведомления, кто пишет текст дня.",
          "• Друзья и общие сравнения, если вы пользуетесь кругом.",
          "• Технический журнал активности, для безопасности.",
          "Мы не используем отслеживающие cookie и не показываем баннер согласия — просить было бы не о чем: статистика собирается через Plausible, который не ставит cookie и не строит профили.",
        ],
      },
      {
        heading: "Зачем и на каком основании",
        body: [
          "• Аккаунт, карты, дневник и чтения — чтобы существовал сервис, о котором вы просили. Основание: исполнение договора, ст. 6(1)(b).",
          "• Текст, написанный моделью, и консультант — только с вашего согласия, которое можно отозвать в профиле в любой момент. Основание: согласие, ст. 6(1)(a).",
          "• Уведомления — только с вашего согласия, отзывается так же.",
          "• Ограничение частоты запросов, журнал активности и безопасность аккаунта — наш законный интерес в том, чтобы сервис работал, ст. 6(1)(f).",
          "Использование приложения по нумерологии может говорить о ваших убеждениях, а регуляторы толкуют эту категорию широко. Поэтому согласие на модель спрашивается отдельно, а не вместе с принятием условий.",
        ],
      },
      {
        heading: "Кому это уходит",
        body: [
          "Три получателя, и каждый получает не больше нужного.",
          "• Anthropic — для текста дня и консультанта, только если вы дали согласие. Получает ЧИСЛА карты и возраст. Не получает имя и не получает дату рождения. Находится в США, поэтому передача идёт по стандартным договорным условиям.",
          "• Поставщик почты — для подтверждений, сброса пароля и подтверждения удаления. Получает ваш адрес и текст письма.",
          `• Хостинг — ${GAZDUIRE}.`,
          "Мы не продаём данные. Никому не передаём их для рекламы.",
        ],
      },
      {
        heading: "Сколько храним",
        body: [
          "• Аккаунт, карты и дневник: пока вы их не удалите. Они ваши.",
          "• Чтения дня: 90 дней. Их можно пересобрать из карты в любой момент.",
          "• Журнал активности: 12 месяцев.",
          "• История уведомлений: 90 дней.",
          "• Токены из писем: 7 дней после истечения.",
          "Когда вы удаляете аккаунт, мы удаляем. Не помечаем неактивным и не оставляем копию.",
        ],
      },
      {
        heading: "Ваши права, и кнопки рядом с ними",
        body: [
          "• Посмотреть и забрать всё, что мы храним: кнопка «Скачать» в профиле сразу выдаёт файл JSON.",
          "• Удалить: кнопка «Удалить аккаунт», там же. Идёт через подтверждение по почте, потому что отменить нельзя.",
          "• Исправить неверное: прямо в профиле.",
          "• Отозвать согласие: переключатели в профиле, в любой момент, не теряя аккаунт.",
          "• Возразить против обработки или потребовать её ограничения: напишите нам.",
          `Если наш ответ вас не устроит, можно пожаловаться в надзорный орган — в Румынии это ANSPDCP (anspdcp.ro). Но сначала попробуйте ${CONTACT}, обычно это быстрее.`,
        ],
      },
      {
        heading: "Данные других людей",
        body: [
          "Вы можете сохранять карты для других — детей, партнёров, коллег. Это их данные, а не ваши, даже если вводили их вы. Они остаются у вас, вы можете удалить их в любой момент, и они исчезают вместе с вашим аккаунтом. Вы отвечаете за то, что вводите о других; если человек просит убрать его данные — уберите.",
        ],
      },
      {
        heading: "Чем мы не являемся",
        body: [
          "Толкования в приложении символичны и предназначены для размышления. Они не заменяют медицинских, финансовых, юридических или личных решений и ничего не предсказывают.",
        ],
      },
    ],
  },
};

export const TERMS: Record<LegalLang, LegalDocument> = {
  ro: {
    title: "Termeni",
    updated: LEGAL_UPDATED,
    lede: "Ce îți dăm, ce îți cerem, și ce se întâmplă dacă unul dintre noi se oprește.",
    sections: [
      {
        heading: "Ce este acest serviciu",
        body: [
          "O aplicație de numerologie: calculează cifre din numele și data nașterii tale și le explică. Sistemul de bază e cel pitagoreic; mai sunt și altele — caldeean, vedic, Lo Shu, Kua, kabbalistic — arătate în paralel, tocmai fiindcă uneori nu sunt de acord între ele.",
          "Interpretările sunt simbolice, pentru reflecție. Nu sunt sfat medical, financiar, juridic sau psihologic, și nu prezic viitorul. Deciziile rămân ale tale.",
        ],
      },
      {
        heading: "Contul",
        body: [
          "Ai nevoie de cont doar pentru ce se salvează: hărțile, jurnalul, cercul tău. Calculatoarele publice merg fără.",
          "Ești răspunzător pentru parola ta. Dacă o uiți, o poți reseta prin email; dacă bănuiești că a aflat-o cineva, schimb-o — te deconectăm de pe toate dispozitivele.",
          "Îți poți lua datele sau șterge contul oricând, din profil. Ștergerea e definitivă.",
        ],
      },
      {
        heading: "Ce îți cerem",
        body: [
          "• Să nu introduci datele altor oameni fără să ai un motiv rezonabil, și să le scoți dacă ți se cere.",
          "• Să nu încerci să obții acces la conturile altora sau să încarci serviciul intenționat.",
          "• Să nu prezinți rezultatele ca fiind sfat profesional, dacă le arăți altcuiva.",
        ],
      },
      {
        heading: "Ce nu promitem",
        body: [
          "Serviciul se oferă așa cum este. Ne străduim să meargă, dar nu garantăm că e neîntrerupt sau fără erori, iar textele scrise de model pot greși — de asta scrie lângă ele că sunt scrise de un model.",
          "Nu răspundem pentru decizii luate pe baza interpretărilor. Vezi prima secțiune.",
        ],
      },
      {
        heading: "Dacă se schimbă",
        body: [
          "Când schimbăm ceva de fond, actualizăm data de sus și, dacă schimbarea te privește direct, îți spunem în aplicație. Dacă nu ești de acord, poți pleca — cu datele tale, din profil.",
        ],
      },
    ],
  },

  en: {
    title: "Terms",
    updated: LEGAL_UPDATED,
    lede: "What we give you, what we ask of you, and what happens if either of us stops.",
    sections: [
      {
        heading: "What this service is",
        body: [
          "A numerology app: it computes numbers from your name and birth date and explains them. The base system is Pythagorean; others — Chaldean, Vedic, Lo Shu, Kua, Kabbalistic — are shown alongside, precisely because they sometimes disagree.",
          "The readings are symbolic, meant for reflection. They are not medical, financial, legal or psychological advice, and they do not predict the future. The decisions stay yours.",
        ],
      },
      {
        heading: "The account",
        body: [
          "You need an account only for what gets saved: charts, journal, your circle. The public calculators work without one.",
          "You are responsible for your password. If you forget it you can reset it by email; if you suspect someone else has it, change it — that signs you out on every device.",
          "You can take your data or delete your account at any time, from your profile. Deletion is permanent.",
        ],
      },
      {
        heading: "What we ask of you",
        body: [
          "• Do not enter other people's data without a reasonable reason, and remove it if you are asked to.",
          "• Do not try to reach other people's accounts or deliberately overload the service.",
          "• Do not present the results as professional advice if you show them to someone.",
        ],
      },
      {
        heading: "What we do not promise",
        body: [
          "The service is offered as it is. We work to keep it running, but we do not guarantee it is uninterrupted or free of errors, and text written by a model can be wrong — which is why it says beside it that a model wrote it.",
          "We are not liable for decisions taken on the basis of the readings. See the first section.",
        ],
      },
      {
        heading: "If this changes",
        body: [
          "When we change something substantial we update the date above, and if the change concerns you directly we say so in the app. If you do not agree, you can leave — with your data, from your profile.",
        ],
      },
    ],
  },

  ru: {
    title: "Условия",
    updated: LEGAL_UPDATED,
    lede: "Что мы даём, что просим взамен и что будет, если кто-то из нас остановится.",
    sections: [
      {
        heading: "Что это за сервис",
        body: [
          "Приложение по нумерологии: считает числа из вашего имени и даты рождения и объясняет их. Базовая система — пифагорейская; рядом показаны и другие — халдейская, ведическая, Ло Шу, Куа, каббалистическая — именно потому, что иногда они не сходятся.",
          "Толкования символичны и предназначены для размышления. Это не медицинский, финансовый, юридический или психологический совет, и они не предсказывают будущее. Решения остаются вашими.",
        ],
      },
      {
        heading: "Аккаунт",
        body: [
          "Аккаунт нужен только для того, что сохраняется: карты, дневник, ваш круг. Публичные калькуляторы работают и без него.",
          "Вы отвечаете за свой пароль. Забыли — сбросьте по почте; подозреваете, что его узнали, — смените: мы выйдем из аккаунта на всех устройствах.",
          "Забрать данные или удалить аккаунт можно в любой момент, в профиле. Удаление окончательно.",
        ],
      },
      {
        heading: "О чём мы просим",
        body: [
          "• Не вводите данные других людей без разумной причины и удаляйте их по просьбе.",
          "• Не пытайтесь получить доступ к чужим аккаунтам и не перегружайте сервис намеренно.",
          "• Не выдавайте результаты за профессиональную консультацию, если показываете их кому-то.",
        ],
      },
      {
        heading: "Чего мы не обещаем",
        body: [
          "Сервис предоставляется как есть. Мы стараемся, чтобы он работал, но не гарантируем непрерывности и отсутствия ошибок, а текст, написанный моделью, может ошибаться — поэтому рядом с ним написано, что его писала модель.",
          "Мы не отвечаем за решения, принятые на основе толкований. См. первый раздел.",
        ],
      },
      {
        heading: "Если что-то изменится",
        body: [
          "При существенных изменениях мы обновляем дату сверху, а если изменение касается вас напрямую — говорим об этом в приложении. Не согласны — можете уйти, забрав данные из профиля.",
        ],
      },
    ],
  },
};
