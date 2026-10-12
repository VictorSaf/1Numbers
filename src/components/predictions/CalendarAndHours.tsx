import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { buildIcs, personalDays, personalHours, type IcsLang } from "@/lib/ics";
import { getDailyPrediction } from "@/lib/predictions";

/**
 * Zilele personale duse în calendarul tău, și orele zilei de azi.
 *
 * Fișierul .ics se face în browser; nimic nu pleacă. Unde ziua diferă după cum
 * începe anul (1 ianuarie sau aniversarea), o arătăm cu ambele cifre.
 */

const COPY: Record<IcsLang, {
  title: string; lede: string; days: (n: number) => string; hours: string; hoursNote: string;
  h24: string; h12: string; differs: string; lucky: string;
}> = {
  ro: {
    title: "În calendarul tău",
    lede: "Ziua personală pentru fiecare zi, ca fișier de calendar. Unde anul de la 1 ianuarie și anul de la aniversare dau altă zi, evenimentul le poartă pe amândouă.",
    days: (n) => `Descarcă ${n} de zile (.ics)`,
    hours: "Orele de azi",
    hoursNote: "Trei convenții, niciuna publicată: ora personală (ziua personală + ora) pe ceasul de 24 și pe cel de 12, și orele norocoase din tabelul prognozei de mai sus. Unde ora personală e egală cu ziua ta, ora e marcată; compară cu punctele prognozei.",
    h24: "ceas de 24 h",
    h12: "ceas de 12 h",
    lucky: "prognoza",
    differs: "zile în care cele două convenții dau altă cifră",
  },
  en: {
    title: "In your calendar",
    lede: "Your personal day for every day, as a calendar file. Where the year from 1 January and the year from your birthday give a different day, the event carries both.",
    days: (n) => `Download ${n} days (.ics)`,
    hours: "Today's hours",
    hoursNote: "Three conventions, none published: the personal hour (personal day + the hour) on the 24-hour and the 12-hour clock, and the lucky hours from the forecast table above. Where the personal hour equals your day it is marked; compare with the forecast's dots.",
    h24: "24 h clock",
    h12: "12 h clock",
    lucky: "forecast",
    differs: "days on which the two conventions give a different figure",
  },
  ru: {
    title: "В вашем календаре",
    lede: "Личный день на каждый день — файлом календаря. Где год с 1 января и год со дня рождения дают разный день, в событии стоят оба.",
    days: (n) => `Скачать ${n} дней (.ics)`,
    hours: "Часы сегодня",
    hoursNote: "Три соглашения, ни одно не опубликовано: личный час (личный день + час) по 24- и 12-часовому циферблату и счастливые часы из таблицы прогноза выше. Где личный час равен вашему дню, он отмечен; сравните с точками прогноза.",
    h24: "24-часовой",
    h12: "12-часовой",
    lucky: "прогноз",
    differs: "дней, в которые соглашения дают разные цифры",
  },
};

const SPAN = 90;

export const CalendarAndHours = ({ birthDate, today = new Date() }: { birthDate: Date; today?: Date }) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as IcsLang;
  const t = COPY[lang];
  const b = toBirthDate(birthDate);
  const [now] = useState(() => today.getHours());

  const { differ, todayPd } = useMemo(() => {
    const list = personalDays(b, today, SPAN);
    return { differ: list.filter((d) => d.jan !== d.birthday).length, todayPd: list[0].jan };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- b derivă din birthDate
  }, [birthDate, today]);
  const hours = useMemo(() => personalHours(todayPd), [todayPd]);
  const lucky = useMemo(
    () => new Set(getDailyPrediction(birthDate, today).luckyHours.map((h) => Number(h.split(":")[0]))),
    [birthDate, today],
  );

  const download = () => {
    const blob = new Blob([buildIcs(b, today, SPAN, lang)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zile-personale.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-calendar-hours className="space-y-8">
      <div className="space-y-3">
        <h3 className="font-heading text-xl text-foreground">{t.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{t.lede}</p>
        <p className="num text-xs text-muted-foreground">
          <span className="text-tension">{differ}</span> / {SPAN} — {t.differs}
        </p>
        <Button variant="outline" onClick={download} className="border-line text-primary hover:bg-sunken">
          <Download className="mr-2 h-4 w-4" />
          {t.days(SPAN)}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-xl text-foreground">{t.hours}</h3>
        <p className="max-w-prose text-xs text-muted-foreground">{t.hoursNote}</p>
        <div className="overflow-x-auto">
          <table className="num text-xs" data-hours>
            <tbody>
              <tr>
                <th className="pr-3 text-left font-normal text-muted-foreground" scope="row">h</th>
                {hours.map((h) => (
                  <td key={h.hour} className={`px-1.5 text-center ${h.hour === now ? "text-gilt" : "text-muted-foreground"}`}>{h.hour}</td>
                ))}
              </tr>
              <tr>
                <th className="pr-3 text-left font-normal text-muted-foreground" scope="row">{t.h24}</th>
                {hours.map((h) => (
                  <td key={h.hour} className={`px-1.5 text-center ${h.h24 === todayPd ? "text-gilt underline" : h.hour === now ? "text-primary" : "text-foreground/80"}`}>{h.h24}</td>
                ))}
              </tr>
              <tr>
                <th className="pr-3 text-left font-normal text-muted-foreground" scope="row">{t.h12}</th>
                {hours.map((h) => (
                  <td key={h.hour} className={`px-1.5 text-center ${h.h12 === todayPd ? "text-gilt underline" : h.h12 !== h.h24 ? "text-tension" : "text-foreground/80"}`}>{h.h12}</td>
                ))}
              </tr>
              <tr data-lucky-row>
                <th className="pr-3 text-left font-normal text-muted-foreground" scope="row">{t.lucky}</th>
                {hours.map((h) => (
                  <td key={h.hour} className="px-1.5 text-center text-gilt">{lucky.has(h.hour) ? "●" : ""}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarAndHours;
