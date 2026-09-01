import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildThread, type ThreadLang, type ThreadStep } from "@/lib/thread";
import { Words } from "@/components/Words";

/**
 * Harta, spusă pe rând -- o frază pe rând.
 *
 * Trei corecții succesive au dus aici, și fiecare a fost o lecție:
 *
 * 1. Panoul de dinainte arăta unsprezece blocuri deodată, fiecare o cifră fără
 *    propoziție. Nimeni nu știa de unde s-o apuce.
 * 2. Prima versiune a firului a dezvăluit pas cu pas, dar a făcut cifra o notă
 *    de subsol -- deși ea e chiar lucrul dezvăluit -- și a folosit o singură
 *    frază din arhetip, deși motorul avea patru.
 * 3. A doua a pus toate frazele deodată în card. Fiind fiecare densă, se
 *    anulau: „ești locul unde alții se așază" și „tot ea devine control prin
 *    grijă" sunt două idei, iar citite lipite nu rămâne niciuna.
 *
 * De aceea unitatea dezvăluirii e fraza, nu cardul. Apeși, apare o idee. O
 * citești. Apeși din nou. Cardul se umple sub ochii tăi, iar când s-a umplut,
 * următoarea apăsare începe pasul următor.
 *
 * 4. Cardurile se stivuiau, iar ecranul devenea o listă de derulat -- adică
 *    tot un depozit, doar dezvăluit mai încet. Acum e un pas pe ecran, centrat,
 *    cu cuvintele care apar eșalonat. Harta întreagă se așază în pagină abia
 *    la final, când chiar există o hartă de privit dintr-o dată.
 */

/**
 * Se ține minte cât de departe ai ajuns vreodată -- nu ca să pornească de
 * acolo, ci ca să existe o cale de întoarcere.
 *
 * Pornirea automată din poziția salvată omora experiența: odată citită, harta
 * rămânea citită, iar a doua zi nu mai era nimic de descoperit. Firul pornește
 * de la prima frază de fiecare dată, și asta rămâne.
 *
 * Dar harta are peste șaizeci de apăsări de când arată tot ce calculează
 * motorul, nu o șesime. Fără o întoarcere, nimeni n-ar ajunge la capătul ei
 * niciodată. Deci: pornire de la zero, cu întoarcerea oferită alături -- iar
 * cine a fost o dată până la capăt primește și saltul direct la hartă.
 */
const farKey = (fullName: string, birthDate: Date) =>
  `thread-far:${fullName.trim().toLowerCase()}:${birthDate.toISOString().slice(0, 10)}`;

interface Copy {
  more: string;
  next: string;
  done: string;
  works: string;
  breaks: string;
  /** Scurtătura, pentru cine a mai citit harta o dată. */
  whole: string;
  /** Întoarcerea, pentru cine a rămas pe drum. */
  resume: (n: number) => string;
  /** Ieșirea. Harta se citește o dată; ziua, în fiecare zi. */
  today: string;
}

const COPY: Record<ThreadLang, Copy> = {
  ro: { more: "mai departe", next: "continuă", done: "Ai citit toată harta.", works: "când funcționează", breaks: "când se strică", whole: "sari la harta întreagă", today: "Vezi ce cere ziua de azi", resume: (n) => `reia de unde ai rămas (${n})` },
  en: { more: "go on", next: "continue", done: "You have read the whole map.", works: "when it works", breaks: "when it breaks", whole: "skip to the whole map", today: "See what today asks", resume: (n) => `pick up where you left off (${n})` },
  ru: { more: "дальше", next: "продолжить", done: "Вы прочитали всю карту.", works: "когда работает", breaks: "когда ломается", whole: "перейти ко всей карте", today: "Посмотреть, чего требует сегодня", resume: (n) => `продолжить с того места (${n})` },
};

type BeatKind = "say" | "works" | "breaks" | "detail" | "plain";
interface Beat {
  kind: BeatKind;
  text: string;
  step: ThreadStep;
  /** Al câtelea e în pasul lui; 0 înseamnă că pasul abia începe. */
  within: number;
}

/** Un pas se desface în fraze, în ordinea în care se citesc. */
const beatsOf = (step: ThreadStep): Omit<Beat, "step" | "within">[] => [
  { kind: "say", text: step.say },
  ...(step.works ? [{ kind: "works" as const, text: step.works }] : []),
  ...(step.breaks ? [{ kind: "breaks" as const, text: step.breaks }] : []),
  ...(step.details ?? []).map((text) => ({ kind: "detail" as const, text })),
  { kind: "plain", text: step.plain },
];

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
  const lang = (language in COPY ? language : "en") as ThreadLang;
  const copy = COPY[lang];

  const steps = useMemo(
    () => buildThread(fullName, birthDate, lang, today),
    [fullName, birthDate, lang, today],
  );

  const beats = useMemo<Beat[]>(
    () =>
      steps.flatMap((step) =>
        beatsOf(step).map((b, within) => ({ ...b, step, within })),
      ),
    [steps],
  );

  const key = farKey(fullName, birthDate);
  const [seen, setSeen] = useState(1);
  /** Cel mai departe ajuns vreodată. 0 = niciodată. */
  const [far, setFar] = useState(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(key));
      if (Number.isFinite(saved) && saved > 1) setFar(Math.min(saved, beats.length));
    } catch {
      // localStorage indisponibil în unele moduri private: fără întoarcere.
    }
  }, [key, beats.length]);

  const remember = (n: number) => {
    if (n <= far) return;
    setFar(n);
    try {
      localStorage.setItem(key, String(n));
    } catch {
      // Nesalvat înseamnă doar că data viitoare nu apare întoarcerea.
    }
  };

  const advance = () => {
    const next = Math.min(seen + 1, beats.length);
    setSeen(next);
    remember(next);
  };

  const resume = () => setSeen(far);

  const skipToMap = () => {
    setSeen(beats.length);
    remember(beats.length);
  };

  const shown = beats.slice(0, seen);
  const done = seen >= beats.length;

  // Butonul spune unde duce doar când trece la alt pas. În interiorul unui pas
  // nu are ce anunța: urmează aceeași idee, dusă mai departe.
  const current = beats[seen - 1];
  const upcoming = beats[seen];
  const crossing = upcoming && upcoming.step.key !== current?.step.key;
  const label = crossing ? copy.next : copy.more;
  const teaser = crossing ? current?.step.teaser : undefined;

  // În timpul citirii: doar pasul curent, singur pe ecran. La final: toată
  // harta, fiindcă abia atunci există ceva de privit dintr-o dată.
  const open = done
    ? steps.map((step) => ({ step, mine: beats.filter((b) => b.step.key === step.key) }))
    : (() => {
        const step = current?.step ?? steps[0];
        return [{ step, mine: shown.filter((b) => b.step.key === step.key) }];
      })();

  // Se animează doar fraza tocmai dezvăluită. La revenire, ce era citit e citit.
  const freshest = shown[shown.length - 1];

  return (
    <div
      className={
        done
          ? "mx-auto w-full max-w-3xl"
          : "mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-3xl flex-col justify-center"
      }
    >
      <div className="space-y-5">
        {open.map(({ step, mine }) => (
          <article
            key={step.key}
            data-step={step.key}
            className="rounded-2xl border border-line bg-surface/70 p-7 shadow-[0_1px_2px_rgba(0,0,0,.06),0_22px_48px_-30px_rgba(0,0,0,.4)] sm:p-10"
          >
            <span className="mb-6 block text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">
              {step.kicker}
            </span>

            {/* Cifra e prezență, nu semnătură: o vezi înainte de orice text. */}
            <div className="mb-7 flex items-center gap-5">
              <span className="num text-6xl leading-none text-primary sm:text-7xl">
                {step.figures}
              </span>
              {(step.title || step.keywords?.length) && (
                <span className="flex min-w-0 flex-col gap-1.5">
                  {step.title && (
                    <span className="font-heading text-lg text-foreground sm:text-xl">
                      {step.title}
                    </span>
                  )}
                  {step.keywords?.length ? (
                    <span className="text-sm text-muted-foreground">
                      {step.keywords.join(" · ")}
                    </span>
                  ) : null}
                </span>
              )}
            </div>

            <div className="space-y-6">
              {mine.map((beat) => {
                if (beat.kind === "say")
                  return (
                    <p
                      key="say"
                      data-beat="say"
                      className="font-heading text-xl leading-relaxed text-foreground sm:text-[1.6rem] sm:leading-[1.45]"
                    >
                      <Words text={beat.text} animate={!done && beat === freshest} />
                    </p>
                  );

                if (beat.kind === "plain")
                  return (
                    <p
                      key="plain"
                      data-beat="plain"
                      className="border-t border-line pt-4 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="text-foreground/70">{step.name}</span> ·{" "}
                      <Words text={beat.text} animate={!done && beat === freshest} step={28} />
                    </p>
                  );

                if (beat.kind === "detail")
                  return (
                    <p
                      key={beat.text}
                      data-beat="detail"
                      className="flex gap-3 text-[0.98rem] leading-relaxed text-foreground/85"
                    >
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <Words text={beat.text} animate={!done && beat === freshest} step={34} />
                    </p>
                  );

                return (
                  <div key={beat.kind} data-beat={beat.kind} className="flex flex-col gap-1.5">
                    <span className="text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {beat.kind === "works" ? copy.works : copy.breaks}
                    </span>
                    <p className="max-w-prose text-[0.98rem] leading-relaxed text-foreground/85">
                      <Words text={beat.text} animate={!done && beat === freshest} step={34} />
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        {!done ? (
          <button type="button" onClick={advance} className="btn-primary text-sm">
            {label}
            {teaser && <span className="opacity-70"> → {teaser}</span>}
          </button>
        ) : (
          <>
            {/* Capătul hărții era un capăt mort: aflai cine ești și nu aveai
                ce face cu asta mâine. Harta se citește o dată, ziua în fiecare
                zi -- deci de aici se pleacă spre zi, nu se rămâne. */}
            <Link to="/azi" className="btn-primary text-sm">
              {copy.today}
            </Link>
            <span className="text-sm text-muted-foreground">{copy.done}</span>
          </>
        )}

        {!done && far > seen && far < beats.length && (
          <button
            type="button"
            onClick={resume}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {copy.resume(far)}
          </button>
        )}

        {!done && far >= beats.length && (
          <button
            type="button"
            onClick={skipToMap}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {copy.whole}
          </button>
        )}

        <span className="num text-xs text-muted-foreground">
          {seen} / {beats.length}
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden="true">
          <span
            className="block h-px bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${Math.round((seen / beats.length) * 100)}%` }}
          />
        </span>
      </div>
    </div>
  );
};

export default Thread;
