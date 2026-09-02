import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PinnacleData, ChallengeData, PINNACLE_MEANINGS, CHALLENGE_MEANINGS } from "@/lib/pinnacles";
import { cn } from "@/lib/utils";
import { getDelayClass } from "@/components/design-system";

/**
 * O etapă din viață: vârful ei și provocarea care vine la pachet.
 *
 * Era un card rotunjit cu insignă rotundă, text albastru pentru vârf și
 * chihlimbar pentru provocare, plus „Detalii" cu chevron -- adică stilul de
 * dinaintea plăcii. Patru dintre ele, unul lângă altul, făceau ca tocmai
 * capitolul despre timp să arate ca un panou de control.
 *
 * Acum e un rând cu filet, ca restul citirii. Intervalul de vârstă stă în mono
 * lângă cifră, fiindcă el e datul: un vârf care ține treizeci de ani și unul
 * care ține nouă nu sunt același lucru, iar patru carduri de aceeași mărime
 * ascundeau exact asta.
 */

interface PinnacleCardProps {
  pinnacle: PinnacleData;
  challenge: ChallengeData;
  isCurrentPeriod: boolean;
  delay?: number;
}

export const PinnacleCard = ({ pinnacle, challenge, isCurrentPeriod, delay = 0 }: PinnacleCardProps) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const pinnacleInfo = PINNACLE_MEANINGS[pinnacle.number] || PINNACLE_MEANINGS[pinnacle.number > 9 ? pinnacle.number : 1];
  const challengeInfo = CHALLENGE_MEANINGS[challenge.number] || CHALLENGE_MEANINGS[0];

  const periodLabels = {
    ro: ["Prima Perioadă", "A Doua Perioadă", "A Treia Perioadă", "A Patra Perioadă"],
    en: ["First Period", "Second Period", "Third Period", "Fourth Period"],
    ru: ["Первый Период", "Второй Период", "Третий Период", "Четвёртый Период"],
  };
  const copy = {
    ro: { now: "acum", details: "Detalii", pin: "Despre vârf", chal: "Despre provocare", challenge: "provocarea" },
    en: { now: "now", details: "Details", pin: "About the pinnacle", chal: "About the challenge", challenge: "challenge" },
    ru: { now: "сейчас", details: "Подробности", pin: "О пиннакле", chal: "О вызове", challenge: "вызов" },
  }[language] ?? { now: "acum", details: "Detalii", pin: "Despre vârf", chal: "Despre provocare", challenge: "provocarea" };

  const ageRangeLabel = pinnacle.endAge >= 99 ? `${pinnacle.startAge}+` : `${pinnacle.startAge}–${pinnacle.endAge}`;

  return (
    <article className={cn("border-b border-line opacity-0 animate-fade-in", getDelayClass(delay))}>
      <div className="flex items-start gap-5 py-5 sm:gap-7">
        <span className="shrink-0 text-right sm:w-[88px]">
          <span
            className={cn(
              "num block w-14 text-right text-4xl leading-[0.86] sm:w-full sm:text-5xl",
              isCurrentPeriod ? "text-gilt" : "text-accent",
            )}
          >
            {pinnacle.number}
          </span>
          <span className="num mt-2 block w-14 text-right text-[0.68rem] text-muted-foreground sm:w-full">
            {ageRangeLabel}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-gilt">
              {periodLabels[language]?.[pinnacle.period - 1] ?? periodLabels.ro[pinnacle.period - 1]}
            </span>
            {isCurrentPeriod && (
              <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-foreground">
                · {copy.now}
              </span>
            )}
          </div>

          <h4 className="mt-1.5 font-heading text-lg text-foreground sm:text-xl">
            {pinnacleInfo?.title[language]}
          </h4>
          <p className="num mt-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-tension">
            {copy.challenge} {challenge.number} · {challengeInfo?.title[language]}
          </p>

          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
            className="num mt-3 inline-flex min-h-11 items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-gilt transition-colors hover:text-foreground"
          >
            <span>{copy.details}</span>
            <span aria-hidden="true" className={cn("transition-transform", isExpanded && "rotate-180")}>
              ▾
            </span>
          </button>

          {isExpanded && (
            <div className="mt-3 grid animate-fade-in gap-5 sm:grid-cols-2">
              <div className="border-t border-gilt/40 pt-3">
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-gilt">{copy.pin}</span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {pinnacleInfo?.description[language]}
                </p>
              </div>
              <div className="border-t border-tension/40 pt-3">
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-tension">{copy.chal}</span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {challengeInfo?.description[language]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
