import { useMemo, useState } from "react";
import { turningYears, type TurningMethodId } from "@/lib/tools/turningYears";
import { Field, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; birth: string;
  methods: Record<TurningMethodId, { label: string; method: string }>;
  together: string; togetherLede: string; noneTogether: string; age: string;
}> = {
  ro: {
    title: "Anii de cotitură",
    lede: "Fiecare metodă își numește anii. Nu le amestecăm: le punem una sub alta și arătăm anii pe care îi numesc cel puțin două.",
    birth: "Data nașterii",
    methods: {
      pinnacles: { label: "Pitagoreic — pinacolele", method: "Trecerea la pinacolul următor: 36 − Drumul Vieții, apoi la fiecare 9 ani." },
      py1: { label: "Pitagoreic — anul personal 1", method: "Începutul fiecărui ciclu de nouă ani." },
      py9: { label: "Pitagoreic — anul personal 9", method: "Încheierea fiecărui ciclu." },
      "year-donor": { label: "„Anul-donor” (rus)", method: "Ultima cifră a anului + cifrele zilei și lunii, adăugate la an; se repetă. Sub 6: un interval fix." },
      product: { label: "Produsul ZZLL × AAAA (rus)", method: "Fiecare cifră a produsului + 10, 20, 30… dă o vârstă." },
      matrix: { label: "Matricea Destinului — decadele", method: "Schimbarea arcului, la fiecare 10 ani." },
    },
    together: "Unde se întâlnesc",
    togetherLede: "Anii numiți de cel puțin două metode. O coincidență nu e o confirmare: metodele cu pas fix (9, 10 ani) se întâlnesc și din aritmetică.",
    noneTogether: "Nicio metodă nu numește același an cu alta.",
    age: "vârsta",
  },
  en: {
    title: "Turning-point years",
    lede: "Each method names its own years. We do not mix them: they sit one under another, and we show the years named by at least two.",
    birth: "Birth date",
    methods: {
      pinnacles: { label: "Pythagorean — pinnacles", method: "The move to the next pinnacle: 36 − Life Path, then every 9 years." },
      py1: { label: "Pythagorean — personal year 1", method: "The start of each nine-year cycle." },
      py9: { label: "Pythagorean — personal year 9", method: "The close of each cycle." },
      "year-donor": { label: "\"Donor year\" (Russian)", method: "Last digit of the year + the digits of day and month, added to the year; repeated. Under 6: one fixed interval." },
      product: { label: "DDMM × YYYY product (Russian)", method: "Each digit of the product + 10, 20, 30… gives an age." },
      matrix: { label: "Destiny Matrix — decades", method: "The change of arc, every 10 years." },
    },
    together: "Where they meet",
    togetherLede: "Years named by at least two methods. A coincidence is not a confirmation: fixed-step methods (9, 10 years) meet by arithmetic too.",
    noneTogether: "No method names the same year as another.",
    age: "age",
  },
  ru: {
    title: "Переломные годы",
    lede: "Каждый метод называет свои годы. Мы их не смешиваем: ставим один под другим и показываем годы, которые называют хотя бы два.",
    birth: "Дата рождения",
    methods: {
      pinnacles: { label: "Пифагорейская — вершины", method: "Переход к следующей вершине: 36 − Жизненный путь, затем каждые 9 лет." },
      py1: { label: "Пифагорейская — личный год 1", method: "Начало каждого девятилетнего цикла." },
      py9: { label: "Пифагорейская — личный год 9", method: "Завершение каждого цикла." },
      "year-donor": { label: "«Год-донор»", method: "Последняя цифра года + цифры дня и месяца прибавляются к году; повторяется. Меньше 6 — постоянный интервал." },
      product: { label: "Произведение ДДММ × ГГГГ", method: "Каждая цифра произведения + 10, 20, 30… даёт возраст." },
      matrix: { label: "Матрица судьбы — десятилетия", method: "Смена дуги каждые 10 лет." },
    },
    together: "Где совпадают",
    togetherLede: "Годы, которые называют хотя бы два метода. Совпадение — не подтверждение: методы с постоянным шагом (9, 10 лет) встречаются и арифметически.",
    noneTogether: "Ни один метод не называет тот же год, что другой.",
    age: "возраст",
  },
};

const TurningYearsTool = ({ defaultBirthDate = "" }: { defaultBirthDate?: string }) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [birth, setBirth] = useState(defaultBirthDate);
  const b = useMemo(() => birthFrom(birth), [birth]);
  const r = useMemo(() => (b ? turningYears(b) : null), [b]);

  return (
    <div data-testid="tool-turning-years" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="max-w-xs">
          <Field id="turning-birth" type="date" label={t.birth} value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        {r && b && (
          <div className="space-y-0">
            {r.methods.map((m) => (
              <div key={m.id} data-method={m.id} className="grid gap-2 border-t border-line py-4 sm:grid-cols-[16rem_1fr]">
                <div>
                  <p className="text-sm text-foreground">{t.methods[m.id].label}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">{t.methods[m.id].method}</p>
                  {m.steps.length > 0 && <p className="num mt-1 text-xs text-foreground/70">{m.steps[0]}</p>}
                </div>
                <p className="num flex flex-wrap gap-x-3 gap-y-1 text-sm text-foreground">
                  {m.years.map((y) => (
                    <span key={y} title={`${t.age} ${y - b.year}`}>
                      {y}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        )}
      </ToolBlock>

      {r && b && (
        <ToolBlock title={t.together} lede={t.togetherLede}>
          {r.coincidences.length ? (
            <ul className="space-y-1">
              {r.coincidences.map((c) => (
                <li key={c.year} className="flex flex-wrap items-baseline gap-x-3 border-t border-line py-2 text-sm">
                  <span className="num text-foreground">{c.year}</span>
                  <span className="num text-xs text-muted-foreground">
                    {t.age} {c.year - b.year}
                  </span>
                  <span className="text-xs text-foreground/80">{c.methods.map((id) => t.methods[id].label).join(" · ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.noneTogether}</p>
          )}
        </ToolBlock>
      )}
    </div>
  );
};

export default TurningYearsTool;
