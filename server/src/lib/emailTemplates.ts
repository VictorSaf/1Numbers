import type { Letter } from './email';

/**
 * Ce scrie în emailurile tranzacționale.
 *
 * Trei reguli, toate din același motiv -- un email de la un serviciu de
 * numerologie ajunge într-un inbox printre încercări de fraudă, iar omul are
 * două secunde să decidă dacă e real:
 *
 *   1. Spune ce s-a întâmplat înainte să ceară ceva. „Cineva a cerut o parolă
 *      nouă pentru contul tău” explică de ce a venit mesajul; „Apasă aici”
 *      arată exact ca o înșelătorie.
 *   2. Spune cât e valabil linkul, în minute. Un link fără termen pare fals și
 *      chiar e mai periculos.
 *   3. Spune ce se întâmplă dacă n-ai cerut tu. Fără asta, omul care primește
 *      mesajul din greșeală nu știe dacă trebuie să se sperie.
 *
 * Zero marketing. Un email tranzacțional care vinde ceva își pierde dreptul de
 * a fi tranzacțional, și odată cu el livrabilitatea.
 */

export type MailLang = 'ro' | 'en' | 'ru';

export const mailLang = (v: string | undefined | null): MailLang =>
  v === 'en' || v === 'ru' ? v : 'ro';

/** Numele produsului, în semnătură. Nu se traduce. */
const SIGNATURE = 'Numerologia';

/** Ce se pune sub fiecare mesaj, în limba lui. */
const FOOTER: Record<MailLang, string> = {
  ro: `${SIGNATURE}\nAcesta este un email automat. Nu răspunde la el.`,
  en: `${SIGNATURE}\nThis is an automated message. Please do not reply.`,
  ru: `${SIGNATURE}\nЭто автоматическое письмо. Пожалуйста, не отвечайте на него.`,
};

const wrap = (lang: MailLang, body: string): string => `${body.trim()}\n\n—\n${FOOTER[lang]}\n`;

/**
 * HTML-ul e deliberat sărac: un paragraf pe rând și linkul scris în clar sub
 * buton. Clienții de email taie CSS-ul, iar un link ascuns într-un buton pe
 * care nu-l poți inspecta e chiar tiparul pe care omul e învățat să nu-l apese.
 */
const asHtml = (lang: MailLang, body: string): string => {
  const paragraphs = body
    .trim()
    .split('\n\n')
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  return [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;color:#16181f;max-width:34em">',
    paragraphs,
    `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e4ea;font-size:13px;color:#6b6f7d;line-height:1.6">${FOOTER[lang].replace(/\n/g, '<br>')}</p>`,
    '</div>',
  ].join('');
};

const letter = (lang: MailLang, to: string, subject: string, body: string): Letter => ({
  to,
  subject,
  text: wrap(lang, body),
  html: asHtml(lang, body),
});

/** Verificarea adresei, la înregistrare. */
export const verifyEmail = (lang: MailLang, to: string, link: string, minutes: number): Letter => {
  const body = {
    ro: `Ai creat un cont pe ${SIGNATURE} cu această adresă.

Confirmă că e a ta:
${link}

Linkul e valabil ${minutes} de minute. Poți folosi aplicația și fără să confirmi — confirmarea e necesară doar ca să-ți putem trimite notificări și ca să-ți poți recupera contul dacă uiți parola.

Dacă nu tu ai creat contul, ignoră mesajul. Fără confirmare, adresa nu e folosită la nimic.`,
    en: `An account was created on ${SIGNATURE} with this address.

Confirm that it is yours:
${link}

The link is valid for ${minutes} minutes. You can use the app without confirming — confirmation is only needed so we can send you notifications and so you can recover your account if you forget your password.

If you did not create this account, ignore this message. Without confirmation, the address is not used for anything.`,
    ru: `На ${SIGNATURE} был создан аккаунт с этим адресом.

Подтвердите, что он ваш:
${link}

Ссылка действительна ${minutes} минут. Приложением можно пользоваться и без подтверждения — оно нужно только для уведомлений и для восстановления доступа, если вы забудете пароль.

Если аккаунт создавали не вы, просто не отвечайте. Без подтверждения адрес нигде не используется.`,
  }[lang];

  const subject = {
    ro: 'Confirmă adresa de email',
    en: 'Confirm your email address',
    ru: 'Подтвердите адрес электронной почты',
  }[lang];

  return letter(lang, to, subject, body);
};

/** Resetarea parolei. */
export const resetPassword = (lang: MailLang, to: string, link: string, minutes: number): Letter => {
  const body = {
    ro: `Cineva a cerut o parolă nouă pentru contul ${SIGNATURE} legat de această adresă.

Alege parola nouă:
${link}

Linkul e valabil ${minutes} de minute și poate fi folosit o singură dată. După ce îl folosești, te deconectăm de pe toate dispozitivele.

Dacă nu tu ai cerut, nu trebuie să faci nimic — parola rămâne cea veche, iar linkul expiră singur.`,
    en: `Someone asked for a new password for the ${SIGNATURE} account linked to this address.

Choose a new password:
${link}

The link is valid for ${minutes} minutes and can be used once. After you use it, you will be signed out on every device.

If this was not you, you do not need to do anything — the old password still works and the link expires on its own.`,
    ru: `Кто-то запросил новый пароль для аккаунта ${SIGNATURE}, привязанного к этому адресу.

Выберите новый пароль:
${link}

Ссылка действительна ${minutes} минут и срабатывает один раз. После использования вы выйдете из аккаунта на всех устройствах.

Если это были не вы, ничего делать не нужно — старый пароль продолжает работать, а ссылка истечёт сама.`,
  }[lang];

  const subject = {
    ro: 'Parolă nouă pentru contul tău',
    en: 'A new password for your account',
    ru: 'Новый пароль для вашего аккаунта',
  }[lang];

  return letter(lang, to, subject, body);
};

/**
 * Confirmarea ștergerii contului.
 *
 * Ștergerea trece prin email tocmai fiindcă e ireversibilă: cineva care îți
 * lasă laptopul deschis nu trebuie să-ți poată șterge harta cu două apăsări.
 */
export const confirmDeletion = (lang: MailLang, to: string, link: string, minutes: number): Letter => {
  const body = {
    ro: `Ai cerut ștergerea contului ${SIGNATURE}.

Confirmă aici:
${link}

Linkul e valabil ${minutes} de minute. Când îl apeși, ștergem definitiv contul, hărțile tale și cele pe care le-ai salvat pentru alții, jurnalul, citirile și preferințele. Nu se poate anula și nu păstrăm o copie.

Dacă vrei să iei datele cu tine, descarcă-le din profil înainte.

Dacă nu tu ai cerut ștergerea, ignoră mesajul și schimbă-ți parola.`,
    en: `You asked to delete your ${SIGNATURE} account.

Confirm here:
${link}

The link is valid for ${minutes} minutes. When you use it, we permanently delete your account, your charts and the ones you saved for other people, your journal, your readings and your preferences. This cannot be undone and we keep no copy.

If you want to take your data with you, download it from your profile first.

If you did not ask for this, ignore the message and change your password.`,
    ru: `Вы запросили удаление аккаунта ${SIGNATURE}.

Подтвердите здесь:
${link}

Ссылка действительна ${minutes} минут. После подтверждения мы навсегда удалим аккаунт, ваши карты и те, что вы сохранили для других, дневник, чтения и настройки. Отменить это нельзя, копии не остаётся.

Если хотите забрать данные с собой, сначала скачайте их в профиле.

Если запрос был не от вас, не отвечайте на письмо и смените пароль.`,
  }[lang];

  const subject = {
    ro: 'Confirmă ștergerea contului',
    en: 'Confirm deleting your account',
    ru: 'Подтвердите удаление аккаунта',
  }[lang];

  return letter(lang, to, subject, body);
};
