import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { biorhythmSeries, BIORHYTHM_CYCLES } from "@/lib/numerology-plus/systems";
import { daysBetween } from "@/lib/numerology-plus/core";

/**
 * The three classical biorhythm curves across a month centred on today.
 *
 * These are plain sine waves keyed to the days since birth -- 23, 28 and 33 day
 * periods -- so the interesting days are not the peaks but the zero crossings,
 * where a cycle changes sign. The engine marks those critical at |value| < 0.05
 * and they are drawn as vertical rules, because a crossing is a property of a
 * day rather than of one curve.
 *
 * Recharts is already on this page for the radar and distribution charts, so
 * this adds a lazy chunk rather than a new dependency.
 */

const CYCLES = ["physical", "emotional", "intellectual"] as const;
const SPAN = 30;

const LABELS = {
  ro: {
    physical: "Fizic", emotional: "Emoțional", intellectual: "Intelectual",
    today: "azi", day: "Ziua", critical: "Zile critice",
    lead: "Cicluri de {p}, {e} și {i} zile de la naștere.",
    note: "Zilele critice sunt cele în care un ciclu trece prin zero — tranziții, nu verdicte.",
    none: "Nicio zi critică în acest interval.",
  },
  en: {
    physical: "Physical", emotional: "Emotional", intellectual: "Intellectual",
    today: "today", day: "Day", critical: "Critical days",
    lead: "Cycles of {p}, {e} and {i} days since birth.",
    note: "Critical days are those where a cycle passes through zero — transitions, not verdicts.",
    none: "No critical day in this window.",
  },
  ru: {
    physical: "Физический", emotional: "Эмоциональный", intellectual: "Интеллектуальный",
    today: "сегодня", day: "День", critical: "Критические дни",
    lead: "Циклы в {p}, {e} и {i} дней от рождения.",
    note: "Критические дни — те, когда цикл проходит через ноль: переходы, а не приговоры.",
    none: "В этом интервале критических дней нет.",
  },
};

const STROKE = {
  physical: "hsl(var(--chart-1))",
  emotional: "hsl(var(--chart-2))",
  intellectual: "hsl(var(--chart-3))",
};

interface BiorhythmsProps {
  birthDate: Date;
  /** Injectable for the same reason as the timeline: which days come out
   *  critical depends entirely on the day you ask. */
  today?: Date;
}

const Biorhythms = ({ birthDate, today }: BiorhythmsProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;

  const { data, criticalOffsets } = useMemo(() => {
    const daysAlive = daysBetween(birthDate, today ?? new Date());
    const series = biorhythmSeries(daysAlive, SPAN);
    return {
      data: series,
      criticalOffsets: series.filter((r) => r.critical === 1).map((r) => r.offset as number),
    };
  }, [birthDate, today]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {l.lead
          .replace("{p}", String(BIORHYTHM_CYCLES.physical))
          .replace("{e}", String(BIORHYTHM_CYCLES.emotional))
          .replace("{i}", String(BIORHYTHM_CYCLES.intellectual))}
      </p>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
            <CartesianGrid stroke="hsl(var(--line))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="offset"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--line-2))"
              tickFormatter={(v: number) => (v === 0 ? l.today : v > 0 ? `+${v}` : String(v))}
            />
            <YAxis
              domain={[-1, 1]} ticks={[-1, 0, 1]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--line-2))"
            />

            {/* A crossing belongs to the day, not to one curve, so it is drawn as
                a rule behind all three rather than as a dot on one. */}
            {criticalOffsets.map((off) => (
              <ReferenceLine key={off} x={off} stroke="hsl(var(--warn))" strokeOpacity={0.45} strokeWidth={1} />
            ))}
            <ReferenceLine y={0} stroke="hsl(var(--line-2))" />
            <ReferenceLine x={0} stroke="hsl(var(--primary))" strokeDasharray="4 3" />

            <Tooltip
              contentStyle={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--line))",
                borderRadius: "0.5rem",
                color: "hsl(var(--ink))",
              }}
              labelFormatter={(v: number) => `${l.day} ${v === 0 ? l.today : v > 0 ? `+${v}` : v}`}
              formatter={(value: number, name: string) => [value.toFixed(2), l[name as keyof typeof l] ?? name]}
            />
            <Legend formatter={(name: string) => l[name as keyof typeof l] ?? name} />

            {CYCLES.map((c) => (
              <Line
                key={c} type="monotone" dataKey={c} stroke={STROKE[c]}
                strokeWidth={2} dot={false} activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-faint">
        <span className="text-warn">{l.critical}</span>
        {": "}
        {criticalOffsets.length
          ? criticalOffsets.map((o) => (o === 0 ? l.today : o > 0 ? `+${o}` : String(o))).join(", ")
          : l.none}
      </p>
      <p className="text-xs text-faint">{l.note}</p>
    </div>
  );
};

export default Biorhythms;
