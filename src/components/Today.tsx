import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildToday, type TodayLang } from "@/lib/today";
import { Words } from "@/components/Words";
import { api } from "@/services/api";

/**
 * Ziua ta, în patru fraze și o întrebare.
 *
 * Harta se citește o dată -- douăzeci și doi de pași sunt potriviți pentru
 * ceva ce afli despre tine o singură dată. Ziua se citește în fiecare zi,
 * deci are alt ritm: patru-cinci fraze, un minut, gata.
 *
 * Și întreabă. O zi care doar informează e un difuzor, iar la un difuzor nu
 * te întorci. Răspunsul intră în jurnal cu cifra atașată, așa că peste
 * treizeci de zile jurnalul nu mai e o casetă goală: e dovada, scrisă de tine,
 * că harta spune adevărul -- sau că nu-l spune.
 */

interface Copy {
  kicker: string;
  more: string;
  keep: string;
  kept: string;
  saving: string;
  failed: string;
  entryTitle: (n: number) => string;
}

const COPY: Record<TodayLang, Copy> = {
  ro: {
    kicker: "ziua ta",
    more: "mai departe",
    keep: "ține minte",
    kept: "Scris în jurnal. Ne vedem mâine.",
    saving: "se scrie…",
    failed: "Nu s-a putut scrie. Încearcă din nou.",
    entryTitle: (n) => `Ziua ${n}`,
  },
  en: {
    kicker: "your day",
    more: "go on",
    keep: "keep this",
    kept: "Kept in your journal. See you tomorrow.",
    saving: "keeping…",
    failed: "Could not keep it. Try again.",
    entryTitle: (n) => `Day ${n}`,
  },
  ru: {
    kicker: "ваш день",
    more: "дальше",
    keep: "сохранить",
    kept: "Записано в дневник. До завтра.",
    saving: "сохраняем…",
    failed: "Не удалось сохранить. Попробуйте ещё раз.",
    entryTitle: (n) => `День ${n}`,
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

  // Fraza e unitatea, ca la fir: puse una sub alta, se anulează.
  const beats = useMemo(
    () => [reading.say, ...reading.relations.map((r) => r.text), reading.plain],
    [reading],
  );

  const [seen, setSeen] = useState(1);
  const [answer, setAnswer] = useState("");
  const [kept, setKept] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const done = seen >= beats.length;

  const keep = async () => {
    const text = answer.trim();
    if (!text || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await api.createJournalEntry({
        entryType: "prediction",
        title: copy.entryTitle(reading.day),
        content: text,
        date: reading.date.toISOString().slice(0, 10),
        numerologyData: {
          personalDay: reading.day,
          question: reading.ask,
          relations: reading.relations.map((r) => ({ kind: r.kind, value: r.value })),
        },
      });
      setKept(text);
    } catch {
      // Un răspuns pierdut în tăcere e mai rău decât o eroare spusă: omul a
      // scris ceva despre ziua lui.
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-3xl flex-col justify-center">
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
          {beats.slice(0, seen).map((text, i) => {
            const fresh = i === seen - 1;
            if (i === beats.length - 1)
              return (
                <p
                  key={i}
                  data-beat="plain"
                  className="border-t border-line pt-4 text-sm leading-relaxed text-muted-foreground"
                >
                  <Words text={text} animate={fresh} step={28} />
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
                <Words text={text} animate={fresh} step={i === 0 ? 55 : 34} />
              </p>
            );
          })}
        </div>

        {done && (
          <div className="mt-8 border-t border-line pt-7">
            <p className="font-heading text-lg text-foreground sm:text-xl">{reading.ask}</p>

            {kept ? (
              <div className="mt-4 space-y-2">
                <p className="text-[0.98rem] leading-relaxed text-foreground/85">{kept}</p>
                <p className="text-sm text-muted-foreground">{copy.kept}</p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-line bg-background p-4 text-[0.98rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary"
                />
                <div className="flex items-center gap-4">
                  <button type="button" onClick={keep} className="btn-primary text-sm">
                    {saving ? copy.saving : copy.keep}
                  </button>
                  {failed && <span className="text-sm text-tension">{copy.failed}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {!done && (
        <div className="mt-7 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSeen((s) => Math.min(s + 1, beats.length))}
            className="btn-primary text-sm"
          >
            {copy.more}
          </button>
          <span className="num text-xs text-muted-foreground">
            {seen} / {beats.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default Today;
