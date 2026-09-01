/**
 * Codurile de eroare la crearea unui profil, spuse pe limba omului.
 *
 * De când profilurile le face administratorul, trei butoane din aplicație pot
 * primi un refuz -- „Salvează harta”, „Ține minte numele” și formularul din
 * /eu -- iar toate trei arătau textul brut al serverului: „admin_only”.
 * Adevărat, și fără să spună nici ce s-a întâmplat, nici ce se poate face în
 * schimb.
 *
 * Traducerea stă într-un singur loc fiindcă refuzul e același lucru oriunde
 * s-ar lovi de el. Trei tabele separate ar diverge la prima schimbare de
 * regulă -- exact cum au divergat mesajele de share.
 *
 * Ce nu e recunoscut rămâne nerecunoscut: o eroare necunoscută îmbrăcată
 * într-o explicație inventată e mai rea decât una spusă ca atare.
 */

export type ProfileErrorLang = 'ro' | 'en' | 'ru';

export interface HumanError {
  title: string;
  body: string;
  /** Fals pentru o regulă. Un toast roșu ar spune „s-a stricat ceva”. */
  isFailure: boolean;
}

const MESSAGES: Record<string, Record<ProfileErrorLang, { title: string; body: string }>> = {
  admin_only: {
    ro: {
      title: 'Harta ta o pune administratorul',
      body: 'Harta proprie e legată de contul tău, așa că o pune administratorul. Poți în schimb să ții harta asta ca om apropiat, în secțiunea cu oameni.',
    },
    en: {
      title: 'Your own map is set up by the administrator',
      body: 'Your own map is tied to your account, so an administrator sets it. You can instead keep this map as someone close, in the people section.',
    },
    ru: {
      title: 'Вашу карту создаёт администратор',
      body: 'Своя карта привязана к аккаунту, поэтому её задаёт администратор. Зато эту карту можно сохранить как близкого человека, в разделе людей.',
    },
  },
  own_map_exists: {
    ro: {
      title: 'Ai deja harta ta',
      body: 'Harta proprie se pune o singură dată și nu se mai schimbă. Ca să ții harta altcuiva, folosește secțiunea cu oameni apropiați.',
    },
    en: {
      title: 'You already have your own map',
      body: 'Your own map is set once and does not change. To keep someone else’s map, use the people section.',
    },
    ru: {
      title: 'У вас уже есть своя карта',
      body: 'Своя карта задаётся один раз и не меняется. Чтобы сохранить чужую карту, используйте раздел близких людей.',
    },
  },
  identity_is_fixed: {
    ro: {
      title: 'Numele și data nu se mai schimbă',
      body: 'Tot ce ai scris în jurnal e legat de cifrele hărții tale. Schimbate, ce ai scris ar rămâne adevărat despre altcineva.',
    },
    en: {
      title: 'The name and date no longer change',
      body: 'Everything you have written in the journal is tied to the figures of your map. Changed, what you wrote would stay true about someone else.',
    },
    ru: {
      title: 'Имя и дата больше не меняются',
      body: 'Всё, что вы написали в дневнике, связано с числами вашей карты. Изменив их, написанное осталось бы правдой о ком-то другом.',
    },
  },
};

/** Întoarce `null` pentru orice cod pe care nu-l cunoaștem. */
export function humanProfileError(
  raw: string | undefined,
  lang: ProfileErrorLang,
): HumanError | null {
  if (!raw) return null;
  const code = Object.keys(MESSAGES).find((k) => raw.includes(k));
  if (!code) return null;
  const m = MESSAGES[code][lang] ?? MESSAGES[code].en;
  return { ...m, isFailure: false };
}
