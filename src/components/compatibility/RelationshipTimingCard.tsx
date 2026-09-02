import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AlignmentBand, RelationshipTiming } from "@/lib/relationshipTiming";

/**
 * Relația, desenată în timp.
 *
 * Culorile sunt `--harmony` și `--tension`, nu `--ok` și `--crit`: o lună în
 * care doi oameni trag în direcții diferite e o distanță, nu o defecțiune, iar
 * roșul de eroare ar spune exact lucrul greșit despre ea. Banda „mixed" nu
 * primește o culoare a ei -- e absența unei relații pronunțate, și se citește
 * cel mai onest ca neutru.
 *
 * Numele lunilor vin din locale-ul date-fns, nu din translations.ts: sunt
 * treizeci și șase de cuvinte pe care biblioteca le are deja corecte în toate
 * trei limbile.
 */

const locales = { ro, en: enUS, ru };

const BAND_CLASS: Record<AlignmentBand, string> = {
  harmony: "bg-harmony-soft text-harmony border-harmony",
  mixed: "bg-muted/40 text-muted-foreground border-border/40",
  tension: "bg-tension-soft text-tension border-tension",
};

interface RelationshipTimingCardProps {
  timing: RelationshipTiming;
  name1: string;
  name2: string;
}

export const RelationshipTimingCard = ({ timing, name1, name2 }: RelationshipTimingCardProps) => {
  const { language, t } = useLanguage();
  const dateLocale = locales[language];
  const { year, months } = timing;

  return (
    <section className="card-mystic rounded-lg p-6 space-y-6">
      <header className="space-y-2">
        <h3 className="font-heading text-xl text-foreground">{t.timing.title}</h3>
        <p className="text-sm text-muted-foreground font-raleway">{t.timing.subtitle}</p>
      </header>

      {/* Anul */}
      <div className={cn("rounded-xl border p-5 space-y-4", BAND_CLASS[year.band])} data-band={year.band}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.15em] font-raleway">{t.timing.thisYear}</span>
          <span className="num text-lg">{year.year}</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs font-raleway opacity-80">
              {name1} — {t.timing.yourYear}
            </div>
            <div className="num text-4xl" data-year-number>
              {year.person1}
            </div>
          </div>
          <div>
            <div className="text-xs font-raleway opacity-80">
              {name2} — {t.timing.theirYear}
            </div>
            <div className="num text-4xl" data-year-number>
              {year.person2}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-heading text-base">{t.timing.bands[year.band]}</p>
          <p className="text-sm opacity-90">{t.timing.bandHints[year.band]}</p>
        </div>
      </div>

      {/* Lunile */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-raleway">
          {t.timing.monthByMonth}
        </h4>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {months.map((month) => (
            <li
              key={month.month}
              data-month={month.month}
              data-band={month.band}
              className={cn("rounded-lg border p-3 space-y-1", BAND_CLASS[month.band])}
            >
              <div className="text-xs font-raleway uppercase tracking-wide opacity-80">
                {format(new Date(year.year, month.month - 1, 1), "LLLL", { locale: dateLocale })}
              </div>
              <div className="num text-lg">
                {month.person1} &middot; {month.person2}
              </div>
              <div className="text-xs font-raleway">{t.timing.bands[month.band]}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
