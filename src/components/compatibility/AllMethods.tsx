import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  compareCouple, type CoupleVerdict, type Gender, type Lang, type CouplePerson,
} from "@/lib/models/compatibility";

/**
 * Toate metodele de compatibilitate, una sub alta, pe aceeași pereche.
 *
 * Fiecare rând: școala, ce intră din fiecare partener, verdictul și, sub un
 * <details>, aritmetica. Deasupra, câte metode spun ce. Nicio medie, niciun
 * procent: două metode corecte care nu sunt de acord spun ceva despre pereche
 * pe care un scor unic l-ar șterge.
 */

const TEXT: Record<CoupleVerdict, string> = {
  harmonious: "text-harmony",
  neutral: "text-muted-foreground",
  challenging: "text-tension",
};

const RULE: Record<CoupleVerdict, string> = {
  harmonious: "border-harmony",
  neutral: "border-line",
  challenging: "border-tension",
};

const BAR: Record<CoupleVerdict, string> = {
  harmonious: "bg-harmony",
  neutral: "bg-line",
  challenging: "bg-tension",
};

const ORDER: CoupleVerdict[] = ["harmonious", "neutral", "challenging"];

const COPY: Record<Lang, {
  title: string;
  verdict: Record<CoupleVerdict, string>;
  steps: string;
  source: string;
  skipped: string;
}> = {
  ro: {
    title: "Ce spune fiecare metodă",
    verdict: { harmonious: "armonie", neutral: "neutru", challenging: "tensiune" },
    steps: "Calculul",
    source: "Sursa",
    skipped: "Necalculat",
  },
  en: {
    title: "What each method says",
    verdict: { harmonious: "harmony", neutral: "neutral", challenging: "tension" },
    steps: "The calculation",
    source: "Source",
    skipped: "Not calculated",
  },
  ru: {
    title: "Что говорит каждый метод",
    verdict: { harmonious: "гармония", neutral: "нейтрально", challenging: "напряжение" },
    steps: "Расчёт",
    source: "Источник",
    skipped: "Не рассчитано",
  },
};

export const AllMethods = ({
  a,
  b,
  genderA,
  genderB,
  today,
}: {
  a: CouplePerson;
  b: CouplePerson;
  genderA?: Gender;
  genderB?: Gender;
  today?: Date;
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as Lang;
  const t = COPY[lang];

  const result = useMemo(
    () => compareCouple(a, b, { lang, today, genderA, genderB }),
    [a, b, lang, today, genderA, genderB],
  );

  const total = result.methods.length;

  return (
    <div data-all-methods className="space-y-6">
      {/* ── Împărțirea: cine spune ce ─────────────────────────────── */}
      <div data-block="split" className="border-t-2 border-line pt-5 sm:pt-6">
        <h4 className="font-heading text-base text-foreground sm:text-lg">{t.title}</h4>

        {/* O bară împărțită după număr de metode, nu un scor: lățimea fiecărei
            bucăți e doar câte metode stau acolo. */}
        <div className="mt-4 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
          {ORDER.map((k) =>
            result.counts[k] ? (
              <span key={k} className={BAR[k]} style={{ width: `${(result.counts[k] / total) * 100}%` }} />
            ) : null,
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          {ORDER.map((k) => (
            <span key={k} className="text-sm">
              <span className={`num ${TEXT[k]}`}>{result.counts[k]}</span>{" "}
              <span className="text-muted-foreground">{t.verdict[k]}</span>
            </span>
          ))}
        </div>

        <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-foreground/85">
          {result.says}
        </p>
      </div>

      {/* ── Metodele, una câte una ────────────────────────────────── */}
      <div>
        {result.methods.map((m) => (
          <div
            key={m.id}
            data-method={m.id}
            className={`grid gap-3 border-t-2 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6 ${RULE[m.verdict]}`}
          >
            <div className="min-w-0">
              <p className="font-heading text-sm text-foreground sm:text-base">{m.school}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{m.method}</p>
            </div>

            <dl className="min-w-0 space-y-1 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-foreground/80">{a.name}</dt>
                <dd className="num text-foreground">{m.inputs.a}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-foreground/80">{b.name}</dt>
                <dd className="num text-foreground">{m.inputs.b}</dd>
              </div>
            </dl>

            <div className="min-w-0">
              <span
                data-verdict={m.verdict}
                className={`num text-xs uppercase tracking-[0.14em] ${TEXT[m.verdict]}`}
              >
                {t.verdict[m.verdict]}
              </span>
              <p className="mt-1 text-xs leading-snug text-foreground/85">{m.reason}</p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-muted-foreground">{t.steps}</summary>
                <ol className="mt-2 space-y-1">
                  {m.steps.map((s, i) => (
                    <li key={i} className="num text-foreground/85">{s}</li>
                  ))}
                </ol>
                {m.source && (
                  <p className="mt-2 text-muted-foreground">
                    {t.source}:{" "}
                    <a href={m.source} target="_blank" rel="noreferrer" className="underline">
                      {new URL(m.source).hostname}
                    </a>
                  </p>
                )}
              </details>
            </div>
          </div>
        ))}

        {result.skipped.map((s) => (
          <p key={s.id} data-skipped={s.id} className="border-t border-line py-3 text-xs text-muted-foreground">
            {t.skipped}: {s.reason}
          </p>
        ))}
      </div>
    </div>
  );
};

export default AllMethods;
