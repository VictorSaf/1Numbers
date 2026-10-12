import { useLanguage } from "@/contexts/LanguageContext";
import { useDayTextSource, type DayTextSource } from "@/hooks/use-day-text-source";
import { cn } from "@/lib/utils";

/**
 * Cine scrie textul zilei.
 *
 * Nu e o setare de aspect: pe „model”, propozițiile compuse din harta omului
 * pleacă spre un furnizor extern. Deci nota de dedesubt spune exact asta, în
 * loc să spună „îmbunătățește experiența”.
 *
 * Două rânduri, cu filet la stânga pentru cel ales -- aceeași gramatică ca
 * filele și ca filtrele. Un radio nativ ar fi adus înapoi cerculețul din
 * stilul dinaintea plăcii.
 */
export const DayTextChoice = () => {
  const { t } = useLanguage();
  const [source, choose] = useDayTextSource();

  const options: Array<{ value: DayTextSource; label: string }> = [
    { value: "model", label: t.dayTextModel },
    { value: "local", label: t.dayTextLocal },
  ];

  return (
    <section className="border-t border-line pt-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
        <h3 className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">{t.dayTextTitle}</h3>
      </div>

      <div className="mt-4 flex flex-col" role="radiogroup" aria-label={t.dayTextTitle}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={source === option.value}
            onClick={() => choose(option.value)}
            className={cn(
              "flex min-h-11 items-center border-l-2 pl-3 text-left text-sm transition-colors",
              source === option.value
                ? "border-gilt text-foreground"
                : "border-transparent text-muted-foreground hover:border-line hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{t.dayTextNote}</p>
    </section>
  );
};

export default DayTextChoice;
