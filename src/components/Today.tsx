import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildToday, type TodayLang } from "@/lib/today";
import { Words } from "@/components/Words";
import { api } from "@/services/api";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * Ziua ta, în trei-patru fraze.
 *
 * Harta se citește o dată în viață și merită pași. Ziua se citește în fiecare
 * dimineață, deci are alt ritm: se arată întreagă, cu frazele scriindu-se una
 * după alta -- ăla e ritm de lectură, nu o poartă de trecut.
 *
 * Câte fraze depinde de câte relații are ziua cu harta: una sau două. Cerându-le
 * mereu pe amândouă, aceeași propoziție pleca de două ori și se întorcea
 * reformulată de două ori.
 */

interface Copy {
  kicker: string;
  /** Cât se scrie ziua. O dată pe zi, deci merită spus ce se întâmplă. */
  writing: string;
}

const COPY: Record<TodayLang, Copy> = {
  ro: {
    kicker: "ziua ta",
    writing: "se scrie ziua ta…",
  },
  en: {
    kicker: "your day",
    writing: "writing your day…",
  },
  ru: {
    kicker: "ваш день",
    writing: "пишем ваш день…",
  },
};

export const Today = ({
  fullName,
  birthDate,
  today,
}: {
  fullName: string;
  birthDate: Date;
  today?: Date;
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as TodayLang;
  const copy = COPY[lang];

  const reading = useMemo(
    () => buildToday(fullName, birthDate, lang, today),
    [fullName, birthDate, lang, today],
  );

  /**
   * Textul vine de la server, unde un model îl rescrie în fiecare zi altfel.
   *
   * Nu se arată nimic până nu se știe ce se arată. Varianta „pune textul compus
   * și schimbă-l când sosește al modelului” ar face literele să se schimbe sub
   * ochii omului -- iar o citire care se rescrie singură nu mai e o citire.
   * Se întâmplă o dată pe zi; a doua vizită vine din cache, instantaneu.
   */
  const [written, setWritten] = useState<{ ziua: string; fric?: string; aproape?: string; intrebare: string } | null>(null);

  useEffect(() => {
    let alive = true;
    /**
     * Exact atâtea bucăți câte relații are ziua.
     *
     * Varianta de dinainte cerea mereu și `fric`, și `aproape`, iar când exista
     * o singură relație amândouă cădeau pe `relations[0]`: aceeași propoziție
     * trimisă de două ori, reformulată de două ori, două paragrafe cu același
     * înțeles unul sub altul.
     */
    const friction = reading.relations.find((r) => r.kind === "friction");
    const close = reading.relations.find((r) => r.kind !== "friction");
    const composed = {
      ziua: reading.say,
      ...(friction ? { fric: friction.text } : {}),
      ...(close ? { aproape: close.text } : {}),
      intrebare: reading.ask,
    };

    api
      .getTodayReading({
        date: formatCalendarDate(reading.date),
        language: lang,
        personalDay: reading.day,
        composed,
      })
      .then((r) => { if (alive) setWritten(r.body); })
      // Ziua trebuie să existe. Nu se spune nimic despre eroare: omul n-are ce
      // face cu ea, iar textul compus spune aceleași fapte.
      .catch(() => { if (alive) setWritten(composed); });

    return () => { alive = false; };
  }, [reading, lang]);

  // Fraza e unitatea, ca la fir: puse una sub alta, se anulează.
  const beats = useMemo(
    () =>
      written
        ? [written.ziua, written.aproape, written.fric, reading.plain].filter(
            (x): x is string => typeof x === "string",
          )
        : [],
    [written, reading.plain],
  );

  /**
   * Ziua se citește întreagă, dintr-o dată.
   *
   * Dezvăluirea frază cu frază a fost construită pentru HARTĂ, care se citește
   * o singură dată și merită timpul ăla. Ziua se citește în fiecare dimineață,
   * iar patru apăsări ca să afli ce cere ziua transformă un minut de citit în
   * cinci de clicuri. Cuvintele apar în continuare eșalonat -- ăla e ritm de
   * lectură, nu o poartă.
   */
  const done = beats.length > 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-3xl flex-col justify-center">
      {!written && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          {copy.writing}
        </p>
      )}

      {written && (
      <article className="rounded-2xl border border-line bg-surface/70 p-7 shadow-[0_1px_2px_rgba(0,0,0,.06),0_22px_48px_-30px_rgba(0,0,0,.4)] sm:p-10">
        <span className="mb-6 block text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">
          {copy.kicker}
        </span>

        <div className="mb-7 flex items-center gap-5">
          <span className="num text-6xl leading-none text-primary sm:text-7xl">{reading.day}</span>
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="font-heading text-lg text-foreground sm:text-xl">{reading.title}</span>
            <span className="text-sm text-muted-foreground">{reading.keywords.join(" · ")}</span>
          </span>
        </div>

        <div className="space-y-6">
          {beats.map((text, i) => {
            /**
             * Toate frazele sunt în pagină de la început; ce se eșalonează e
             * scrierea lor. Fiecare pornește după ce s-a terminat cea de
             * dinainte, altfel patru fraze s-ar scrie una peste alta și
             * ochiul n-ar avea unde să se așeze.
             *
             * Decalajul se calculează din lungimile de dinainte, nu se
             * ghicește: o frază lungă întârzie mai mult pe următoarea, exact
             * cât îi ia să se scrie. 260ms de pauză între ele.
             */
            const stepOf = (n: number) => (n === 0 ? 55 : n === beats.length - 1 ? 28 : 34);
            const from = beats
              .slice(0, i)
              .reduce((acc, prev, j) => acc + prev.split(" ").length * stepOf(j) + 260, 0);

            if (i === beats.length - 1)
              return (
                <p
                  key={i}
                  data-beat="plain"
                  className="border-t border-line pt-4 text-sm leading-relaxed text-muted-foreground"
                >
                  <Words text={text} step={28} from={from} />
                </p>
              );
            return (
              <p
                key={i}
                data-beat={i === 0 ? "say" : "relation"}
                className={
                  i === 0
                    ? "font-heading text-xl leading-relaxed text-foreground sm:text-[1.6rem] sm:leading-[1.45]"
                    : "text-[0.98rem] leading-relaxed text-foreground/85"
                }
              >
                <Words text={text} step={stepOf(i)} from={from} />
              </p>
            );
          })}
        </div>

        {/* Întrebarea și caseta de răspuns au fost scoase.
            „Sufletul tău e 5, ziua e 3. Ce a ieșit din asta azi?” cerea omului
            să facă singur legătura dintre două cifre, adică munca pe care ar
            trebui s-o facem noi. O întrebare la care nu știi ce să răspunzi nu
            e o invitație, e un blocaj.
            Odată cu ea a plecat și bucla de jurnal: nimic nu se mai scrie,
            deci nici ecoul „ultima dată când ziua a fost 8 ai scris…” n-are de
            unde. Serverul le păstrează pe amândouă -- ruta scrie în jurnal și
            citește ecoul -- ca să se poată întoarce cu o întrebare mai bună,
            una concretă, despre ce ai făcut, nu despre ce înseamnă. */}
      </article>
      )}

    </div>
  );
};

export default Today;
