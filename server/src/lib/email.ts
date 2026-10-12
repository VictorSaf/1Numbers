/**
 * Singurul loc din server care știe cum pleacă un email.
 *
 * Aceeași formă ca `anthropic.ts`, și din același motiv: nu există comutator de
 * furnizor, există doar întrebarea dacă avem sau nu cheia. Fără cheie nu se
 * trimite nimic ȘI nu se pretinde că s-a trimis -- un `sendMail` care întoarce
 * tăcut `true` fără configurare e felul în care cineva descoperă peste o lună că
 * niciun email de resetare n-a plecat vreodată.
 *
 * Nicio dependință nouă. SDK-ul Resend e un înveliș peste un singur POST, iar
 * `fetch` e global din Node 18. O bibliotecă pentru o cerere HTTP e cod pe care
 * îl întreținem degeaba.
 *
 * Regiunea contează juridic: contul Resend trebuie creat în UE. Altfel adăugăm
 * un transfer către Statele Unite în politica de confidențialitate, pentru un
 * serviciu care n-are niciun motiv să-l ceară.
 */

const ENDPOINT = 'https://api.resend.com/emails';

/** Cât așteptăm furnizorul. Un email nu merită să țină o cerere HTTP mai mult. */
const TIMEOUT_MS = 10_000;

export class EmailUnavailableError extends Error {
  constructor() {
    super('RESEND_API_KEY is not configured');
    this.name = 'EmailUnavailableError';
  }
}

/** Furnizorul a răspuns, dar a refuzat. Se deosebește de „nu e configurat”. */
export class EmailRejectedError extends Error {
  constructor(readonly status: number, detail: string) {
    super(`email provider refused the message (${status}): ${detail}`);
    this.name = 'EmailRejectedError';
  }
}

// Citite leneș, la fiecare apel: procesul poate porni fără ele, iar testele le
// pun și le scot între cazuri.
const apiKey = (): string | undefined => process.env.RESEND_API_KEY || undefined;
const from = (): string => process.env.EMAIL_FROM || 'Numerologia <nu-raspunde@localhost>';

export const isEmailConfigured = (): boolean => Boolean(apiKey());

export interface Letter {
  to: string;
  subject: string;
  /** Textul simplu e obligatoriu; el e mesajul. HTML-ul e o comoditate. */
  text: string;
  html?: string;
}

/**
 * Trimite o scrisoare. Aruncă dacă nu e configurat sau dacă furnizorul refuză.
 *
 * Cine cheamă decide ce face cu eșecul. La resetarea de parolă, de pildă,
 * răspunsul către om rămâne același indiferent -- altfel diferența dintre
 * „am trimis” și „n-am putut” spune cine are cont și cine nu.
 */
export async function sendLetter(letter: Letter): Promise<{ id: string }> {
  const key = apiKey();
  if (!key) throw new EmailUnavailableError();

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from(),
        to: [letter.to],
        subject: letter.subject,
        text: letter.text,
        ...(letter.html ? { html: letter.html } : {}),
      }),
      signal: abort.signal,
    });

    if (!res.ok) {
      // Corpul erorii poate conține adresa; nu se scurge mai departe decât ca
      // detaliu al excepției, care se loghează, nu se arată omului.
      throw new EmailRejectedError(res.status, (await res.text()).slice(0, 300));
    }
    const body = (await res.json()) as { id?: string };
    return { id: body.id ?? 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}
