import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCalendarDate } from "@/lib/calendarDate";
import { isWithinHorizon, shiftDay } from "@/lib/dayHorizon";

const locales = { ro, en: enUS, ru };

interface DayNavigatorProps {
  date: Date;
  today: Date;
  onChange: (date: Date) => void;
}

/**
 * Cele trei gesturi ale zilei.
 *
 * Prognoza lunară se putea alege înainte; cea zilnică era legată de
 * `new Date()`. Aici se mută cu o zi în fiecare direcție, până la marginea
 * orizontului, iar întoarcerea la azi e mereu la un singur clic -- omul nu
 * trebuie să numere înapoi ca să se întoarcă de unde a plecat.
 *
 * Fără animație de intrare: pe `/azi` conținutul se schimbă la fiecare clic,
 * iar ceva ce începe la `opacity: 0` și depinde de o animație ca să se vadă e
 * exact regresia reparată în 57f095a.
 *
 * Ziua și anul poartă `.num`: sunt coordonate. Ziua săptămânii și numele lunii
 * sunt cuvinte și rămân în fața de interfață.
 */
export const DayNavigator = ({ date, today, onChange }: DayNavigatorProps) => {
  const { t, language } = useLanguage();
  const dateLocale = locales[language] ?? enUS;

  const canGoBack = isWithinHorizon(shiftDay(date, -1), today);
  const canGoForward = isWithinHorizon(shiftDay(date, 1), today);
  const isToday = formatCalendarDate(date) === formatCalendarDate(today);
  const atEdge = !canGoBack || !canGoForward;

  return (
    <div className="card-mystic rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label={t.today.previousDay}
          disabled={!canGoBack}
          onClick={() => onChange(shiftDay(date, -1))}
          className="h-10 w-10 p-0 text-foreground/90"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="font-raleway text-sm capitalize text-muted-foreground">
            {format(date, "EEEE", { locale: dateLocale })}
          </p>
          <p className="font-raleway text-lg text-foreground">
            <span className="num">{date.getDate()}</span>{" "}
            {format(date, "MMMM", { locale: dateLocale })}{" "}
            <span className="num">{date.getFullYear()}</span>
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label={t.today.nextDay}
          disabled={!canGoForward}
          onClick={() => onChange(shiftDay(date, 1))}
          className="h-10 w-10 p-0 text-foreground/90"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {(atEdge || !isToday) && (
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-border/40 pt-3">
          {atEdge && (
            <p className="font-raleway text-xs text-muted-foreground">{t.today.horizonEdge}</p>
          )}
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(today)}
              className="h-8 gap-2 border-primary/30 font-raleway text-xs text-primary hover:bg-primary/10"
            >
              <RotateCcw className="h-3 w-3" />
              {t.today.backToToday}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
