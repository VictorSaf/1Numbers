import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dualitiesTimeline, ageAt } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { cn } from "@/lib/utils";

/**
 * Transits and Essence, year by year.
 *
 * Each part of the name runs its own clock: a letter stays active for as many
 * years as its value, then the next takes over and the part loops. The three
 * active letters sum to the year's Essence.
 *
 * A Duality is the year where Essence equals the Personal Year. Decoz treats it
 * as the year of highest intensity, so it is the one thing on this table worth
 * highlighting -- and it is genuinely rare: eight years in a lifetime for a
 * typical name, which is why the row style has to be strong enough to find by
 * eye but not so strong that twelve ordinary rows become unreadable.
 */

const PAST_YEARS = 2;
const FUTURE_YEARS = 9;

const LABELS = {
  ro: {
    year: "An", age: "Vârstă", physical: "Fizic", mental: "Mental", spiritual: "Spiritual",
    essence: "Esență", personalYear: "An personal", duality: "Dualitate",
    now: "anul curent", none: "—",
    legend: "Dualitate: Esența coincide cu Anul Personal — an de intensitate maximă.",
    ofLetter: "anul {a} din {b}",
  },
  en: {
    year: "Year", age: "Age", physical: "Physical", mental: "Mental", spiritual: "Spiritual",
    essence: "Essence", personalYear: "Personal Year", duality: "Duality",
    now: "current year", none: "—",
    legend: "Duality: Essence meets the Personal Year — a year of peak intensity.",
    ofLetter: "year {a} of {b}",
  },
  ru: {
    year: "Год", age: "Возраст", physical: "Физический", mental: "Ментальный", spiritual: "Духовный",
    essence: "Сущность", personalYear: "Личный год", duality: "Дуальность",
    now: "текущий год", none: "—",
    legend: "Дуальность: Сущность совпадает с Личным годом — год наибольшей интенсивности.",
    ofLetter: "год {a} из {b}",
  },
};

type Transit = { letter: string; value: number; yearInLetter: number } | null;

interface TransitsTimelineProps {
  fullName: string;
  birthDate: Date;
  /** Injectable so the tests can pin the window; the engine takes `today` for
   *  the same reason. Without it, a time-dependent assertion goes vacuous the
   *  year the highlighted row drifts out of range. */
  today?: Date;
}

const TransitCell = ({ t, hint, none }: { t: Transit; hint: string; none: string }) => {
  if (!t) return <td className="p-2 text-center text-faint">{none}</td>;
  return (
    <td className="p-2 text-center">
      <span className="num text-base text-foreground">{t.letter}</span>
      <span className="num ml-1 text-xs text-muted-foreground">{t.value}</span>
      <span className="block text-[10px] text-faint">
        {hint.replace("{a}", String(t.yearInLetter)).replace("{b}", String(t.value))}
      </span>
    </td>
  );
};

const TransitsTimeline = ({ fullName, birthDate, today }: TransitsTimelineProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;

  const { rows, currentAge } = useMemo(() => {
    const b = toBirthDate(birthDate);
    // Age comes from the engine's own helper; a second formula here would drift
    // from the one behind every other calculation on the page.
    const age = ageAt(b, today ?? new Date());
    const from = Math.max(0, age - PAST_YEARS);
    return { rows: dualitiesTimeline(fullName, b, from, age + FUTURE_YEARS), currentAge: age };
  }, [fullName, birthDate, today]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-line">
              {[l.year, l.age, l.physical, l.mental, l.spiritual, l.essence, l.personalYear].map((h) => (
                <th key={h} className="p-2 text-center text-xs font-normal text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isNow = r.age === currentAge;
              return (
                <tr
                  key={r.age}
                  aria-current={isNow ? "date" : undefined}
                  data-duality={r.duality ? "true" : undefined}
                  className={cn(
                    "border-b border-line/50",
                    r.duality && "border-l-2 border-gilt pl-3",
                    isNow && "outline outline-1 outline-primary/60",
                  )}
                >
                  <td className="num p-2 text-center text-foreground">
                    {r.calendarYear}
                    {isNow && <span className="ml-1 text-[10px] text-primary">({l.now})</span>}
                  </td>
                  <td className="num p-2 text-center text-muted-foreground">{r.age}</td>
                  <TransitCell t={r.physical} hint={l.ofLetter} none={l.none} />
                  <TransitCell t={r.mental} hint={l.ofLetter} none={l.none} />
                  <TransitCell t={r.spiritual} hint={l.ofLetter} none={l.none} />
                  <td className="num p-2 text-center">
                    <span className={cn("text-base", r.duality ? "text-accent-ink" : "text-foreground")}>
                      {r.essence}
                    </span>
                  </td>
                  <td className="num p-2 text-center">
                    <span className={cn("text-base", r.duality ? "text-accent-ink" : "text-foreground")}>
                      {r.personalYear}
                    </span>
                    {r.duality && (
                      <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                        {l.duality}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-faint">{l.legend}</p>
    </div>
  );
};

export default TransitsTimeline;
