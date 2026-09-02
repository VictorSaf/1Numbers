import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { findCoupleDisagreements, type CoupleLang } from "@/lib/coupleDisagreements";

/**
 * Unde cele două hărți se judecă de două ori.
 *
 * Pagina arăta un procent și componentele lui, unele lângă altele. Dar
 * procentul e o medie ponderată, iar o medie ascunde exact ce e interesant:
 * două perechi cu același 74% pot fi una echilibrată pe toate liniile și alta
 * ruptă în două, cu 90 pe una și 55 pe alta. Aceeași cifră, două relații care
 * n-au nimic în comun.
 *
 * Peste asta, tradiția vedică judecă aceeași pereche prin alt criteriu -- nu un
 * scor, ci prietenie sau dușmănie între planetele zilelor de naștere. Poate
 * spune „prieteni” acolo unde matricea pitagoreică vede distanță.
 *
 * Ca peste tot: nu se fac medii între tradiții și nu se alege un câștigător.
 * Când două judecăți corecte diferă, diferența e informația.
 */

const TONE = {
  aligned: "border-harmony",
  mixed: "border-line bg-surface/60",
  split: "border-tension",
} as const;

const COPY: Record<CoupleLang, { hides: string; both: string; agreeYes: string; agreeNo: string; gap: string }> = {
  ro: {
    hides: "Ce ascunde procentul",
    both: "Aceeași pereche, două tradiții",
    agreeYes: "de acord",
    agreeNo: "nu sunt de acord",
    gap: "interval",
  },
  en: {
    hides: "What the percentage hides",
    both: "The same couple, two traditions",
    agreeYes: "they agree",
    agreeNo: "they disagree",
    gap: "range",
  },
  ru: {
    hides: "Что скрывает процент",
    both: "Одна пара, две традиции",
    agreeYes: "согласны",
    agreeNo: "расходятся",
    gap: "разброс",
  },
};

export const TwoJudgements = ({
  a,
  b,
}: {
  a: { name: string; birthDate: Date };
  b: { name: string; birthDate: Date };
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as CoupleLang;
  const t = COPY[lang];

  const { spread, traditions } = useMemo(
    () => findCoupleDisagreements(a, b, lang),
    [a, b, lang],
  );

  return (
    <div data-two-judgements className="space-y-4">
      {/* ── Ce ascunde media ─────────────────────────────────────── */}
      <div data-block="spread" className={`rounded-lg border p-5 sm:p-6 ${TONE[spread.agreement]}`}>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h4 className="font-heading text-base text-foreground sm:text-lg">{t.hides}</h4>
          <span className="num text-xs text-muted-foreground">
            {t.gap} {spread.range}
          </span>
        </div>

        {/* Cele patru linii, la scară comună: fără o scară comună, „90” și „55”
            sunt două cifre; cu ea, sunt o distanță pe care o vezi. */}
        <div className="space-y-2.5">
          {spread.parts.map((p) => (
            <div key={p.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-foreground/85 sm:w-36">{p.label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className={`block h-1.5 rounded-full ${ p.score === spread.best.score ? "bg-harmony" : p.score === spread.worst.score ? "bg-tension" : "bg-primary" }`}
                  style={{ width: `${Math.max(2, p.score)}%` }}
                />
              </span>
              <span className="num w-9 shrink-0 text-right text-sm text-foreground">{p.score}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-foreground/85">
          {spread.says}
        </p>
      </div>

      {/* ── Două tradiții, aceeași pereche ────────────────────────── */}
      <div
        data-block="traditions"
        className={`rounded-lg border p-5 sm:p-6 ${traditions.agree ? TONE.aligned : TONE.split}`}
      >
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h4 className="font-heading text-base text-foreground sm:text-lg">{t.both}</h4>
          <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {traditions.agree ? t.agreeYes : t.agreeNo}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-foreground/90">{traditions.pythagorean.label}</p>
            {/* Fără sursă, două verdicte diferite arată ca o eroare de calcul. */}
            <p className="num mt-1 text-2xl text-primary">{traditions.pythagorean.score}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {traditions.pythagorean.reads}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground/90">{traditions.vedic.label}</p>
            <p
              className={`mt-1 font-heading text-xl ${ traditions.vedic.relation === "friends" ? "text-harmony" : traditions.vedic.relation === "enemies" ? "text-tension" : "text-foreground/80" }`}
            >
              {traditions.vedic.reads}
            </p>
          </div>
        </div>

        <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-foreground/85">
          {traditions.says}
        </p>
      </div>
    </div>
  );
};

export default TwoJudgements;
