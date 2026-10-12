import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildToday, type TodayLang } from "@/lib/today";
import { Words } from "@/components/Words";
import { api } from "@/services/api";
import { formatCalendarDate } from "@/lib/calendarDate";
import { useDayTextSource } from "@/hooks/use-day-text-source";

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
  card: string;
  light: string;
  shadow: string;
  /** Cât se scrie ziua. O dată pe zi, deci merită spus ce se întâmplă. */
  writing: string;
  /** Cine a scris textul. Obligatoriu, nu politețe -- vezi mai jos. */
  byModel: string;
}

const COPY: Record<TodayLang, Copy> = {
  ro: {
    kicker: "ziua ta",
    card: "cartea zilei",
    light: "când merge",
    shadow: "când se strică",
    writing: "se scrie ziua ta…",
    byModel: "scris de un model",
  },
  en: {
    kicker: "your day",
    card: "card of the day",
    light: "when it works",
    shadow: "when it breaks",
    writing: "writing your day…",
    byModel: "written by a model",
  },
  ru: {
    kicker: "ваш день",
    card: "карта дня",
    light: "когда работает",
    shadow: "когда ломается",
    writing: "пишем ваш день…",
    byModel: "написано моделью",
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
  const [textSource] = useDayTextSource();
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

    // Cine a ales textul compus local nu trimite nimic nicăieri. Cererea nu se
    // face deloc -- nu se face și se ignoră răspunsul.
    if (textSource === "local") {
      setWritten(composed);
      return () => { alive = false; };
    }

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
  }, [reading, lang, textSource]);

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
    <>
      {!written && (
        <p className="text-sm text-muted-foreground" role="status">
          {copy.writing}
        </p>
      )}

      {/* Prima suprafață a zilei e o placă, cu ANATOMIA celorlalte plăci din
          platformă: filet de alamă cu etichetă, titlu în Literata, figura la
          dreapta. Înainte era o placă cu alt schelet -- eticheta fără filet,
          cartea aruncată sub tot -- și, mai rău, sta pe `max-w-3xl`: 768px
          într-o pagină de 1024, adică o treaptă de 256px față de tot ce urma
          sub ea.
          Cerul stă ÎN placă, nu în spatele paginii: altfel placa l-ar acoperi. */}
      {written && (
        <section className="relative overflow-hidden rounded-2xl bg-plate">
          <div className="day-sky" data-mood={reading.mood} aria-hidden="true">
            <span />
          </div>

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:items-start lg:gap-12 lg:py-12">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 shrink-0 bg-plate-gilt-dim" aria-hidden="true" />
                <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-plate-gilt">
                  {copy.kicker}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <span className="num text-6xl leading-none text-plate-gilt-hi sm:text-7xl">
                  {reading.day}
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-heading text-xl text-plate-ink sm:text-2xl">
                    {reading.title}
                  </span>
                  <span className="num text-[0.68rem] uppercase tracking-[0.12em] text-plate-muted">
                    {reading.keywords.join(" · ")}
                  </span>
                </span>
              </div>

              {/* Cine a scris textul de dedesubt.
                  Articolul 50 din AI Act, în vigoare de la 2 august 2026: un
                  text generat trebuie să se vadă că e generat. Stă exact
                  deasupra frazelor, fiindcă ghidul Comisiei spune că o singură
                  notă în capul paginii nu ajunge acolo unde omul poate să nu
                  vadă începutul conținutului.
                  `data-ai-generated` e pentru marcarea citibilă de mașină, cu
                  termen separat -- 2 decembrie 2026. Atributul e primul pas;
                  restul se decide când se așază standardul. */}
              {textSource === "model" && (
              <div className="mt-7 flex items-center gap-3" data-ai-generated>
                <span className="h-px w-10 shrink-0 bg-plate-gilt-dim" aria-hidden="true" />
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-plate-muted">
                  {copy.byModel}
                </span>
              </div>
              )}

              <div className="mt-5 space-y-6">
                {beats.map((text, i) => {
                  /**
                   * Toate frazele sunt în pagină de la început; ce se eșalonează
                   * e scrierea lor. Decalajul se calculează din lungimile de
                   * dinainte: o frază lungă întârzie mai mult pe următoarea,
                   * exact cât îi ia să se scrie.
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
                        className="border-t border-plate-gilt-dim pt-4 text-sm leading-relaxed text-plate-muted"
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
                          ? "font-heading text-xl leading-relaxed text-plate-ink sm:text-[1.6rem] sm:leading-[1.45]"
                          : "text-[0.98rem] leading-relaxed text-plate-ink/85"
                      }
                    >
                      <Words text={text} step={stepOf(i)} from={from} />
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Cartea zilei e FIGURA plăcii, ca în celelalte pagini -- coloana
                din dreapta, nu un bloc aruncat sub text.
                Cifra zilei E numărul arcanei: ziua 3 e Împărăteasa. Nu se trage
                nimic la întâmplare -- o carte aleatoare n-ar avea nicio legătură
                cu harta omului, iar aici tocmai legătura e produsul. */}
            <div className="min-w-0">
              <img
                src={`/tarot/${reading.card.n}.jpg`}
                alt={reading.card.title}
                width={140}
                height={239}
                loading="lazy"
                decoding="async"
                className="w-[120px] rounded-md border border-plate-gilt-dim shadow-[0_12px_28px_-14px_rgba(0,0,0,.9)] sm:w-[140px]"
              />
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-plate-gilt">
                  {copy.card}
                </span>
                <span className="font-heading text-lg text-plate-ink">{reading.card.title}</span>
              </div>
              <p className="num mt-1.5 text-[0.63rem] uppercase tracking-[0.12em] text-plate-muted">
                {reading.card.keywords.join(" · ")}
              </p>

              <div className="mt-5 space-y-4">
                <div className="border-t border-plate-harmony pt-3">
                  <span className="num block text-[0.6rem] uppercase tracking-[0.18em] text-plate-harmony">
                    {copy.light}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-plate-ink/85">
                    {reading.card.light}
                  </p>
                </div>
                <div className="border-t border-plate-tension pt-3">
                  <span className="num block text-[0.6rem] uppercase tracking-[0.18em] text-plate-tension">
                    {copy.shadow}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-plate-ink/85">
                    {reading.card.shadow}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Today;
