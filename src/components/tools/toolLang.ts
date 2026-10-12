import { useLanguage } from "@/contexts/LanguageContext";
import { toBirthDate, type BirthDate } from "@/lib/numerology-plus/core";
import { parseCalendarDate } from "@/lib/calendarDate";

export type Lang = "ro" | "en" | "ru";

export const useToolLang = (): Lang => {
  const { language } = useLanguage();
  return (["ro", "en", "ru"].includes(language) ? language : "en") as Lang;
};

/** `YYYY-MM-DD` din `<input type="date">` → zi calendaristică, sau null. */
export const birthFrom = (value: string): BirthDate | null => {
  const d = value ? parseCalendarDate(value) : null;
  return d ? toBirthDate(d) : null;
};
