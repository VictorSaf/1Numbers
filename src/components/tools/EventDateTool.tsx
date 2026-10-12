import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { parseCalendarDate } from "@/lib/calendarDate";
import { electionalDates, PURPOSE_NUMBERS, type DayReading, type Purpose } from "@/lib/tools/electional";
import { Field, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const PURPOSES: Purpose[] = ["wedding", "launch", "contract", "move", "study", "ending"];

const COPY: Record<Lang, {
  title: string; lede: string; purpose: string; purposes: Record<Purpose, string>;
  personA: string; personB: string; from: string; to: string; range: string;
  numbers: string; numbersNote: string;
  pyth: string; pythHow: string; cheiro: string; cheiroHow: string;
  ud: string; pd: string; karmic: string; none: string;
  both: string; pythOnly: string; cheiroOnly: string; disagreeTitle: string;
}> = {
  ro: {
    title: "Data evenimentului",
    lede: "Două convenții întreabă „e ziua asta a mea?” și răspund din locuri diferite. Zilele de datorie karmică (13, 14, 16, 19) sunt scoase din amândouă.",
    purpose: "Scopul",
    purposes: { wedding: "Nuntă", launch: "Lansare, început", contract: "Contract, semnătură", move: "Mutare, călătorie", study: "Studiu, retragere", ending: "Încheiere" },
    personA: "Data ta de naștere", personB: "A doua persoană (opțional)", from: "De la", to: "Până la",
    range: "Cel mult un an.",
    numbers: "Numerele scopului", numbersNote: "convenția aplicațiilor, nu o regulă cu o singură sursă",
    pyth: "Pitagoreic", pythHow: "Ziua Personală a fiecăruia cade pe numărul scopului; Ziua Universală pe el e un bonus.",
    cheiro: "Caldeean / Cheiro", cheiroHow: "Ziua lunii se reduce la numărul zilei tale de naștere (1, 10, 19, 28 pentru un 1). Scopul nu contează.",
    ud: "ZU", pd: "ZP", karmic: "datorie karmică", none: "Nicio zi în interval.",
    both: "În ambele", pythOnly: "Doar pitagoreic", cheiroOnly: "Doar Cheiro", disagreeTitle: "Unde se despart",
  },
  en: {
    title: "Event date",
    lede: "Two conventions ask \"is this day mine?\" and answer from different places. Karmic-debt days (13, 14, 16, 19) are left out of both.",
    purpose: "Purpose",
    purposes: { wedding: "Wedding", launch: "Launch, beginning", contract: "Contract, signing", move: "Move, travel", study: "Study, retreat", ending: "Ending" },
    personA: "Your birth date", personB: "Second person (optional)", from: "From", to: "To",
    range: "One year at most.",
    numbers: "The purpose's numbers", numbersNote: "an app convention, not a rule with one source",
    pyth: "Pythagorean", pythHow: "Each person's Personal Day falls on the purpose's number; the Universal Day on it is a bonus.",
    cheiro: "Chaldean / Cheiro", cheiroHow: "The day of the month reduces to your birth-day number (1, 10, 19, 28 for a 1). The purpose does not matter.",
    ud: "UD", pd: "PD", karmic: "karmic debt", none: "No day in range.",
    both: "In both", pythOnly: "Pythagorean only", cheiroOnly: "Cheiro only", disagreeTitle: "Where they part",
  },
  ru: {
    title: "Дата события",
    lede: "Две конвенции спрашивают «мой ли это день?» и отвечают с разных мест. Дни кармического долга (13, 14, 16, 19) исключены из обеих.",
    purpose: "Цель",
    purposes: { wedding: "Свадьба", launch: "Запуск, начало", contract: "Договор, подпись", move: "Переезд, поездка", study: "Учёба, уединение", ending: "Завершение" },
    personA: "Ваша дата рождения", personB: "Второй человек (необязательно)", from: "С", to: "По",
    range: "Не больше года.",
    numbers: "Числа цели", numbersNote: "конвенция приложений, не правило с одним источником",
    pyth: "Пифагорейская", pythHow: "Личный день каждого приходится на число цели; Универсальный день на нём — бонус.",
    cheiro: "Халдейская / Хейро", cheiroHow: "День месяца сводится к числу вашего дня рождения (1, 10, 19, 28 для единицы). Цель не важна.",
    ud: "УД", pd: "ЛД", karmic: "кармический долг", none: "В интервале нет дней.",
    both: "В обоих", pythOnly: "Только пифагорейская", cheiroOnly: "Только Хейро", disagreeTitle: "Где расходятся",
  },
};

const LOCALE: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", ru: "ru-RU" };

const EventDateTool = ({ defaultBirthDate = "" }: { defaultBirthDate?: string }) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [purpose, setPurpose] = useState<Purpose>("wedding");
  const [a, setA] = useState(defaultBirthDate);
  const [b, setB] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const r = useMemo(() => {
    const people = [birthFrom(a), birthFrom(b)].filter((x): x is NonNullable<typeof x> => x !== null);
    const f = from ? parseCalendarDate(from) : null, e = to ? parseCalendarDate(to) : null;
    if (!people.length || !f || !e) return null;
    try {
      return electionalDates({ from: f, to: e, people, purpose });
    } catch {
      return null;
    }
  }, [a, b, from, to, purpose]);

  const fmt = (d: Date) => d.toLocaleDateString(LOCALE[lang], { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const DayLine = ({ d }: { d: DayReading }) => (
    <li className="flex flex-wrap items-baseline gap-x-3 border-t border-line py-2 text-sm">
      <span className="text-foreground">{fmt(d.date)}</span>
      <span className="num text-xs text-muted-foreground">
        {t.ud} {d.universalDay} · {t.pd} {d.personalDays.join("/")}
      </span>
    </li>
  );

  return (
    <div data-testid="tool-event-date" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-purpose">{t.purpose}</Label>
            <select
              id="event-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as Purpose)}
              className="flex h-10 w-full border-0 border-b border-line bg-transparent px-0 text-sm text-foreground focus:border-gilt focus:outline-none"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {t.purposes[p]}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {t.numbers}: <span className="num">{PURPOSE_NUMBERS[purpose].join(", ")}</span> — {t.numbersNote}
            </p>
          </div>
          <Field id="event-birth-a" type="date" label={t.personA} value={a} onChange={(e) => setA(e.target.value)} />
          <Field id="event-birth-b" type="date" label={t.personB} value={b} onChange={(e) => setB(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Field id="event-from" type="date" label={t.from} value={from} onChange={(e) => setFrom(e.target.value)} />
            <Field id="event-to" type="date" label={t.to} hint={t.range} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </ToolBlock>

      {r && (
        <>
          <div className="grid gap-10 md:grid-cols-2">
            {(["pyth", "cheiro"] as const).map((k) => (
              <ToolBlock key={k} title={k === "pyth" ? t.pyth : t.cheiro} lede={k === "pyth" ? t.pythHow : t.cheiroHow}>
                <ul data-top={k}>
                  {r.top[k].length ? r.top[k].map((d) => <DayLine key={d.date.getTime()} d={d} />) : <li className="text-sm text-muted-foreground">{t.none}</li>}
                </ul>
              </ToolBlock>
            ))}
          </div>

          <p className="num text-xs text-muted-foreground">
            {t.karmic}: {r.days.filter((d) => d.karmic.length > 0).length} / {r.days.length}
          </p>

          <ToolBlock title={t.disagreeTitle}>
            <div className="grid gap-6 sm:grid-cols-3">
              {([
                ["both", t.both, r.agreement.both, "border-harmony"],
                ["pythOnly", t.pythOnly, r.agreement.pythOnly, "border-tension"],
                ["cheiroOnly", t.cheiroOnly, r.agreement.cheiroOnly, "border-tension"],
              ] as const).map(([key, label, list, tone]) => (
                <div key={key} className={`border-t pt-3 ${tone}`}>
                  <p className="text-sm text-foreground">
                    {label} <span className="num text-muted-foreground">{list.length}</span>
                  </p>
                  <ul className="mt-2 space-y-0.5 text-xs text-foreground/80">
                    {list.map((d) => (
                      <li key={d.date.getTime()}>{fmt(d.date)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ToolBlock>
        </>
      )}
    </div>
  );
};

export default EventDateTool;
