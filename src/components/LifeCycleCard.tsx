import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LifeCycleData, LIFE_CYCLE_STAGE_LABELS, PINNACLE_MEANINGS } from "@/lib/pinnacles";
import { cn } from "@/lib/utils";
import { getDelayClass } from "@/components/design-system";

/**
 * O treaptă lungă, nu un vârf: aceeași formă de rând ca PinnacleCard, fără
 * provocarea alăturată -- ciclurile de viață nu au una.
 *
 * Cifra vine din lună, zi sau an, redusă (vezi lifeCycles în engine); ce
 * înseamnă acea cifră e exact ce înseamnă și la un vârf -- PINNACLE_MEANINGS,
 * nu un text nou. Ce diferă e etapa însăși: LIFE_CYCLE_STAGE_LABELS spune
 * despre ce e vorba în Formare/Producție/Recoltă, indiferent de cifră.
 */

interface LifeCycleCardProps {
  cycle: LifeCycleData;
  isCurrent: boolean;
  delay?: number;
}

export const LifeCycleCard = ({ cycle, isCurrent, delay = 0 }: LifeCycleCardProps) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const stageInfo = LIFE_CYCLE_STAGE_LABELS[cycle.stage];
  const numberInfo = PINNACLE_MEANINGS[cycle.number] || PINNACLE_MEANINGS[1];

  const copy = {
    ro: { now: "acum", details: "Detalii", stage: "Despre etapă", number: "Despre cifră" },
    en: { now: "now", details: "Details", stage: "About the stage", number: "About the number" },
    ru: { now: "сейчас", details: "Подробности", stage: "О этапе", number: "О числе" },
  }[language] ?? { now: "acum", details: "Detalii", stage: "Despre etapă", number: "Despre cifră" };

  const ageRangeLabel = cycle.endAge >= 99 ? `${cycle.startAge}+` : `${cycle.startAge}–${cycle.endAge}`;

  return (
    <article className={cn("border-b border-line opacity-0 animate-fade-in", getDelayClass(delay))}>
      <div className="flex items-start gap-5 py-5 sm:gap-7">
        <span className="shrink-0 text-right sm:w-[88px]">
          <span
            className={cn(
              "num block w-14 text-right text-4xl leading-[0.86] sm:w-full sm:text-5xl",
              isCurrent ? "text-gilt" : "text-accent",
            )}
          >
            {cycle.number}
          </span>
          <span className="num mt-2 block w-14 text-right text-[0.68rem] text-muted-foreground sm:w-full">
            {ageRangeLabel}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-gilt">
              {stageInfo.title[language]}
            </span>
            {isCurrent && (
              <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-foreground">
                · {copy.now}
              </span>
            )}
          </div>

          <h4 className="mt-1.5 font-heading text-lg text-foreground sm:text-xl">
            {numberInfo?.title[language]}
          </h4>

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
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-gilt">{copy.stage}</span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {stageInfo.description[language]}
                </p>
              </div>
              <div className="border-t border-line pt-3">
                <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{copy.number}</span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {numberInfo?.description[language]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
