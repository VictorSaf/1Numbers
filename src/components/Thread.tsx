import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildThread, type ThreadLang } from "@/lib/thread";

/**
 * Harta, spusă pe rând.
 *
 * Ce înlocuiește: un panou de unsprezece blocuri, fiecare o cifră mare fără
 * propoziție, toate cu aceeași greutate -- „Drumul Vieții" avea exact cât
 * „Streak: 0 days". Un om care intra prima dată vedea șapte numere și nicio
 * frază care să le lege, așa că nu știa de unde s-o apuce.
 *
 * Inversarea care contează: propoziția e conținutul, cifra e semnătura. Acum
 * cifra era titlu de 2rem și textul subtitlu; aici e invers, iar sub fiecare
 * cifră stă o linie care spune DE UNDE vine -- cine n-a auzit niciodată de
 * „Suflet" află că vine din vocalele numelui. Cum se calculează rămâne la
 * /invata: aici nu se predă numerologie, se citește o hartă.
 *
 * Poziția se ține în localStorage, per om. Fără ea, „continuă" ar fi o
 * animație, nu o citire care se reia mâine de unde a rămas.
 */

const seenKey = (fullName: string, birthDate: Date) =>
  `thread-seen:${fullName.trim().toLowerCase()}:${birthDate.toISOString().slice(0, 10)}`;

const COPY = {
  ro: { more: "continuă", done: "Ai citit toată harta.", of: "din" },
  en: { more: "continue", done: "You have read the whole map.", of: "of" },
  ru: { more: "продолжить", done: "Вы прочитали всю карту.", of: "из" },
} as const;

export const Thread = ({
  fullName,
  birthDate,
  today,
}: {
  fullName: string;
  birthDate: Date;
  today?: Date;
}) => {
  const { language } = useLanguage();
  const lang = language as ThreadLang;
  const copy = COPY[lang] ?? COPY.en;

  const steps = useMemo(
    () => buildThread(fullName, birthDate, lang, today),
    [fullName, birthDate, lang, today],
  );

  const key = seenKey(fullName, birthDate);
  const [seen, setSeen] = useState(1);

  // Poziția se citește o dată, la montare. Se mărginește la lungimea firului:
  // dacă motorul emite mai puțini pași decât data trecută, o valoare veche ar
  // lăsa ecranul gol fără niciun mesaj.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(key));
      if (Number.isFinite(saved) && saved >= 1) setSeen(Math.min(saved, steps.length));
    } catch {
      // localStorage indisponibil în unele moduri private; firul pornește de la 1.
    }
  }, [key, steps.length]);

  const advance = () => {
    const next = Math.min(seen + 1, steps.length);
    setSeen(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // Nesalvat înseamnă că mâine reia de unde știe, nu că se strică ceva.
    }
  };

  const done = seen >= steps.length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-4">
        {steps.slice(0, seen).map((step) => (
          <article
            key={step.key}
            data-step={step.key}
            className="rounded-2xl border border-line bg-surface/70 p-7 shadow-[0_1px_2px_rgba(0,0,0,.06),0_18px_40px_-28px_rgba(0,0,0,.35)] sm:p-9"
          >
            <span className="mb-4 block text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
              {step.kicker}
            </span>

            {/* Propoziția e conținutul: Literata, mare, cu spațiu în jur. */}
            <p className="font-heading text-xl leading-relaxed text-foreground sm:text-2xl">
              {step.say}
            </p>

            <div className="mt-6 flex items-start gap-3 border-t border-line pt-4">
              <span className="num shrink-0 pt-0.5 text-base text-primary">{step.figures}</span>
              <span className="flex flex-col gap-1">
                <span className="text-sm text-foreground/80">{step.name}</span>
                <span className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {step.plain}
                </span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {!done && (
          <button
            type="button"
            onClick={advance}
            className="btn-mystic rounded-xl px-5 py-2.5 text-sm"
          >
            {copy.more}
          </button>
        )}
        {done && <span className="text-sm text-muted-foreground">{copy.done}</span>}

        <span className="num text-xs text-muted-foreground">
          {seen} / {steps.length}
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden="true">
          <span
            className="block h-px bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${Math.round((seen / steps.length) * 100)}%` }}
          />
        </span>
      </div>
    </div>
  );
};

export default Thread;
