import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Replaces the calendar popover for birth dates.
//
// A month-grid calendar opens on the current month, so entering a birth year
// meant paging back through decades, and the popover covered the primary call
// to action underneath it. Three selects reach any date in three interactions,
// never overlay anything, and use the platform's native picker on mobile.
//
// Years descend because the value being entered is always in the past.

const LOCALES: Record<string, string> = { ro: "ro-RO", en: "en-US", ru: "ru-RU" };
const OLDEST_YEAR = 1920;

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

interface BirthDateSelectProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const BirthDateSelect = ({ value, onChange, className, disabled, id }: BirthDateSelectProps) => {
  const { language } = useLanguage();
  const locale = LOCALES[language] ?? "en-US";
  const currentYear = new Date().getFullYear();

  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    // Built from Intl rather than a hardcoded table so a fourth language needs
    // no new translations here.
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2000, m, 1)));
  }, [locale]);

  const years = useMemo(
    () => Array.from({ length: currentYear - OLDEST_YEAR + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );

  // The three parts are held locally because a Date cannot represent a partial
  // selection. Deriving them from `value` alone discarded the first choice: the
  // date was still incomplete, so onChange fired undefined and the select reset.
  const [parts, setParts] = useState<{ d?: number; m?: number; y?: number }>(() =>
    value ? { d: value.getDate(), m: value.getMonth(), y: value.getFullYear() } : {},
  );

  // Follow the value when the parent changes it (form reset, loading a profile).
  useEffect(() => {
    if (!value) return;
    setParts({ d: value.getDate(), m: value.getMonth(), y: value.getFullYear() });
  }, [value]);

  const { d: day, m: month, y: year } = parts;
  const dayCount = daysInMonth(year ?? 2000, month ?? 0);

  const emit = (d?: number, m?: number, y?: number) => {
    // Clamp so switching from the 31st into a shorter month cannot roll over
    // into the next one.
    const clamped = d !== undefined && m !== undefined && y !== undefined ? Math.min(d, daysInMonth(y, m)) : d;
    setParts({ d: clamped, m, y });
    onChange(clamped !== undefined && m !== undefined && y !== undefined ? new Date(y, m, clamped) : undefined);
  };

  const selectClass =
    "h-11 rounded-none border-0 border-b border-line bg-transparent px-0 text-sm text-foreground " +
    "transition-colors focus:border-gilt focus:outline-none disabled:opacity-50";

  const labels = {
    ro: { day: "Ziua", month: "Luna", year: "Anul" },
    en: { day: "Day", month: "Month", year: "Year" },
    ru: { day: "День", month: "Месяц", year: "Год" },
  }[language] ?? { day: "Day", month: "Month", year: "Year" };

  return (
    <div className={cn("grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)_minmax(0,7rem)] gap-2", className)}>
      <select
        id={id}
        aria-label={labels.day}
        className={selectClass}
        disabled={disabled}
        value={day ?? ""}
        onChange={(e) => emit(Number(e.target.value) || undefined, month, year)}
      >
        <option value="">{labels.day}</option>
        {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        aria-label={labels.month}
        className={selectClass}
        disabled={disabled}
        value={month ?? ""}
        onChange={(e) => emit(day, e.target.value === "" ? undefined : Number(e.target.value), year)}
      >
        <option value="">{labels.month}</option>
        {months.map((name, m) => (
          <option key={name} value={m}>{name}</option>
        ))}
      </select>

      <select
        aria-label={labels.year}
        className={selectClass}
        disabled={disabled}
        value={year ?? ""}
        onChange={(e) => emit(day, month, Number(e.target.value) || undefined)}
      >
        <option value="">{labels.year}</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
};
