import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { findDisagreements, type DisagreementLang, type Verdict } from "@/lib/disagreements";

/**
 * Unde harta se răspunde singură de două ori.
 *
 * Motorul calculează același lucru pe mai multe căi, iar fiecare răspuns stătea
 * în colțul lui: un an personal de 7 într-un capitol, o esență de 6 în altul,
 * fără nimic care să spună că vorbesc despre același an. Dezacordul exista de
 * la început și nu era nicăieri.
 *
 * Nimic de aici nu împacă nimic. Nu se fac medii, nu se alege un câștigător:
 * fiecare cale e corectă în sistemul ei, iar diferența dintre ele e chiar
 * informația -- exact cum distanța dintre două poziții e conținut la poduri,
 * nu o eroare de calcul.
 *
 * De aceea sub fiecare cifră scrie DIN CE se citește. Fără sursă, două cifre
 * diferite pentru aceeași întrebare arată ca un bug.
 */

const TONE: Record<Verdict, string> = {
  agree: "border-harmony",
  near: "border-line",
  apart: "border-tension",
};

const DOT: Record<Verdict, string> = {
  agree: "bg-harmony",
  near: "bg-muted-foreground/50",
  apart: "bg-tension",
};

const COPY: Record<DisagreementLang, { title: string; lede: string; both: string; name: string; date: string; none: string }> = {
  ro: {
    title: "Unde harta se răspunde de două ori",
    lede: "Aceleași întrebări, puse prin sisteme diferite. Când răspunsurile diferă, diferența e informația — nu o greșeală de calcul.",
    both: "lipsesc din amândouă",
    name: "lipsesc din nume",
    date: "lipsesc din dată",
    none: "nimic",
  },
  en: {
    title: "Where the map answers twice",
    lede: "The same questions, put through different systems. When the answers differ, the difference is the information — not a mistake in the arithmetic.",
    both: "missing from both",
    name: "missing from the name",
    date: "missing from the date",
    none: "nothing",
  },
  ru: {
    title: "Где карта отвечает дважды",
    lede: "Одни и те же вопросы через разные системы. Когда ответы расходятся, расхождение и есть информация — не ошибка в расчёте.",
    both: "нет ни там, ни там",
    name: "нет в имени",
    date: "нет в дате",
    none: "ничего",
  },
};

export const TwoAnswers = ({
  fullName,
  birthDate,
  today,
}: {
  fullName: string;
  birthDate: Date;
  today?: Date;
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as DisagreementLang;
  const t = COPY[lang];

  const { pairs, missing } = useMemo(
    () => findDisagreements(fullName, birthDate, lang, today),
    [fullName, birthDate, lang, today],
  );

  return (
    <div data-two-answers className="space-y-4">
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{t.lede}</p>

      {pairs.map((p) => (
        <div key={p.key} data-pair={p.key} className={`border-t pt-5 ${TONE[p.verdict]}`}>
          <div className="mb-4 flex items-center gap-2.5">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[p.verdict]}`} aria-hidden="true" />
            <h4 className="font-heading text-base text-foreground sm:text-lg">{p.question}</h4>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-5">
            {[p.a, p.b].map((s, i) => (
              <div key={s.label} className={i === 1 ? "sm:col-start-3" : undefined}>
                <div className="flex items-baseline gap-3">
                  <span className="num text-3xl leading-none text-primary">{s.value}</span>
                  <span className="text-sm text-foreground/90">{s.label}</span>
                </div>
                {/* Fără sursă, două cifre diferite arată ca un bug. */}
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{s.from}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{s.essence}</p>
              </div>
            ))}

            <div className="hidden sm:col-start-2 sm:flex sm:flex-col sm:items-center sm:gap-1">
              <span className="num text-xs text-muted-foreground">{p.distance}</span>
              <span className="h-10 w-px bg-line" aria-hidden="true" />
            </div>
          </div>

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-foreground/85">
            {p.says}
          </p>
        </div>
      ))}

      {missing && (
        <div data-pair="missing" className={`border-t pt-5 ${missing.both.length ? TONE.apart : TONE.near}`}>
          <div className="mb-4 flex items-center gap-2.5">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${missing.both.length ? DOT.apart : DOT.near}`}
              aria-hidden="true"
            />
            <h4 className="font-heading text-base text-foreground sm:text-lg">{missing.question}</h4>
          </div>

          {/* Absențele se compară ca mulțimi, nu ca numere: una vine din nume,
              cealaltă din dată, iar ce lipsește din amândouă n-are sprijin de
              nicăieri. */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: t.name, list: missing.fromName },
              { label: t.date, list: missing.fromDate },
              { label: t.both, list: missing.both, strong: true },
            ].map((col) => (
              <div key={col.label}>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{col.label}</p>
                <p className={`num mt-1.5 text-xl ${col.strong && col.list.length ? "text-tension" : "text-primary"}`}>
                  {col.list.length ? col.list.join(" · ") : <span className="text-muted-foreground">{t.none}</span>}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-foreground/85">
            {missing.says}
          </p>
        </div>
      )}
    </div>
  );
};

export default TwoAnswers;
