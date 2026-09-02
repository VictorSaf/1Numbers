import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { buildThread, type ThreadLang } from "@/lib/thread";
import { api } from "@/services/api";

/**
 * Citirea întreagă: harta legată, nu enumerată.
 *
 * Raportul de dedesubt are douăzeci și trei de blocuri care nu se cunosc între
 * ele. Un om cu Drum 7, Destin 1 și o datorie de 16 află ce înseamnă fiecare și
 * nu află niciodată ce ies împreună -- deși acolo stă tot ce e de spus.
 *
 * Nu se generează singură. Ziua e ieftină și e motivul pentru care intri;
 * citirea asta e cea mai scumpă operație din aplicație, iar pornită automat ar
 * fi plătită pentru fiecare vizitator care doar trece pe pagină. Un buton e și
 * mai onest cu ce e: analiza pe care o ceri, nu una care ți se întâmplă.
 *
 * Propozițiile vin din `buildThread` -- aceleași care compuneau firul. Firul a
 * rămas fără interfață când harta autentificată a devenit raportul întreg, dar
 * logica lui era partea valoroasă: toată harta, în propoziții adevărate,
 * ordonate după cât de rar e fiecare lucru.
 */

interface Copy {
  invite: string;
  why: string;
  ask: string;
  writing: string;
  failed: string;
}

const COPY: Record<ThreadLang, Copy> = {
  ro: {
    invite: "Citirea ta întreagă",
    why: "Mai jos, fiecare număr e explicat separat. Aici sunt puse împreună: ce iese din ele, ce se ajută și ce se ceartă în harta ta anume.",
    ask: "Scrie-mi citirea",
    writing: "se scrie… durează un minut",
    failed: "Nu s-a putut scrie acum. Încearcă din nou.",
  },
  en: {
    invite: "Your whole reading",
    why: "Below, each number is explained on its own. Here they are put together: what comes of them, what helps and what fights in your chart.",
    ask: "Write my reading",
    writing: "writing… this takes a minute",
    failed: "Could not write it now. Try again.",
  },
  ru: {
    invite: "Ваше полное прочтение",
    why: "Ниже каждое число объясняется отдельно. Здесь они собраны вместе: что из них следует, что помогает и что спорит в вашей карте.",
    ask: "Написать прочтение",
    writing: "пишем… это займёт минуту",
    failed: "Сейчас не удалось. Попробуйте ещё раз.",
  },
};

type Body = { opening: string; chapters: Array<{ title: string; text: string }>; closing: string };

export const DeepReading = ({
  fullName,
  birthDate,
}: {
  fullName: string;
  birthDate: Date;
}) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const lang = (language in COPY ? language : "en") as ThreadLang;
  const copy = COPY[lang];

  const [body, setBody] = useState<Body | null>(null);
  const [writing, setWriting] = useState(false);
  const [failed, setFailed] = useState(false);

  /**
   * `.then/.catch`, nu un handler `async`.
   *
   * O funcție async dată direct lui onClick întoarce o promisiune pe care
   * nimeni n-o preia. Componenta prinde tot ce se strică înăuntru, dar forma
   * asta lasă respingerea să iasă din lucrarea pe care React o urmărește --
   * suficient cât un test s-o vadă ca eroare proprie. Aceeași formă ca în
   * Today.tsx, care face același lucru și n-a avut niciodată problema.
   */
  const ask = () => {
    if (writing) return;
    setWriting(true);
    setFailed(false);

    const steps = buildThread(fullName, birthDate, lang).map((s) => ({
      name: s.name,
      figures: s.figures,
      say: s.say,
    }));

    api
      .getDeepReading({ language: lang, steps })
      .then((r) => setBody(r.body))
      .catch(() => setFailed(true))
      .finally(() => setWriting(false));
  };

  /**
   * Nimic pentru vizitatorul anonim.
   *
   * Ruta cere autentificare, iar harta de exemplu de pe pagina publică ar
   * primi 401 și ar arăta „nu s-a putut scrie” -- un eșec afișat pentru ceva
   * ce n-a fost niciodată oferit. Un buton care nu poate funcționa nu se
   * arată; asta e altceva decât un buton care duce la autentificare, și
   * pagina publică are deja unul.
   */
  if (!isAuthenticated) return null;

  return (
    <section
      data-deep-reading
      className="mb-10 border-t border-gilt pt-7"
    >
      <h2 className="font-heading text-2xl text-foreground sm:text-3xl">{copy.invite}</h2>

      {!body && (
        <>
          <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{copy.why}</p>
          <div className="mt-6 flex items-center gap-4">
            <button type="button" onClick={ask} disabled={writing} className="num inline-flex min-h-11 items-center rounded-sm border border-gilt px-4 text-[0.68rem] uppercase tracking-[0.14em] text-gilt transition-colors hover:bg-gilt-soft disabled:opacity-50">
              {writing ? copy.writing : copy.ask}
            </button>
            {failed && <span className="text-sm text-tension">{copy.failed}</span>}
          </div>
        </>
      )}

      {body && (
        <div className="mt-6 space-y-8">
          <p className="font-heading text-xl leading-relaxed text-foreground sm:text-[1.6rem] sm:leading-[1.45]">
            {body.opening}
          </p>

          {body.chapters.map((c, i) => (
            <div key={`${i}-${c.title}`} className="space-y-2">
              <h3 className="text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">
                {c.title}
              </h3>
              <p className="max-w-prose leading-relaxed text-foreground/90">{c.text}</p>
            </div>
          ))}

          {body.closing && (
            <p className="border-t border-line pt-6 font-heading text-lg leading-relaxed text-foreground">
              {body.closing}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default DeepReading;
