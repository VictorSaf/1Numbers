import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { destinyMatrix } from "@/lib/numerology-plus/matrix";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { ARCANA_BY_N, MATRIX_POSITION_FRAME } from "@/lib/numerology-plus/content/arcana";

/**
 * The Destiny Matrix octagram: two squares overlapping at 45 degrees, with the
 * soul point at the centre.
 *
 * Only the nine base points are drawn. The derived points -- the money channel,
 * the chakra map, the forty-year graph -- are not published by any commercial
 * operator, so the engine marks them confidence:'low' and keeps them out of the
 * default reading. Drawing them here would present a reconstruction as fact.
 *
 * Positions come from geometry rather than a hand-placed list: the cardinal four
 * sit on the axes, the diagonal four at 45 degrees, both at the same radius, so
 * the two squares are congruent and the figure stays true at any size.
 */

const R = 76;
const C = 100;
const DIAG = R / Math.SQRT2;

const POINTS: Record<string, { x: number; y: number }> = {
  B: { x: C, y: C - R },
  C: { x: C + R, y: C },
  D: { x: C, y: C + R },
  A: { x: C - R, y: C },
  F: { x: C - DIAG, y: C - DIAG },
  G: { x: C + DIAG, y: C - DIAG },
  I: { x: C + DIAG, y: C + DIAG },
  H: { x: C - DIAG, y: C + DIAG },
  E: { x: C, y: C },
};

const LABELS = {
  ro: { title: "Octagrama Matriței Destinului", hint: "Apasă pe un punct pentru interpretare", light: "Lumina", shadow: "Umbra", task: "Sarcina" },
  en: { title: "Destiny Matrix Octagram", hint: "Select a point for its reading", light: "Light", shadow: "Shadow", task: "Task" },
  ru: { title: "Октаграмма Матрицы Судьбы", hint: "Выберите точку для толкования", light: "Свет", shadow: "Тень", task: "Задача" },
};

interface DestinyMatrixProps {
  birthDate: Date;
}

const DestinyMatrix = ({ birthDate }: DestinyMatrixProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;
  const [selected, setSelected] = useState<string>("E");

  const matrix = useMemo(() => destinyMatrix(toBirthDate(birthDate)), [birthDate]);
  const byKey = useMemo(
    () => Object.fromEntries(matrix.points.map((p) => [p.key, p])),
    [matrix],
  );

  const point = byKey[selected];
  const arcana = point ? ARCANA_BY_N[point.arcana] : undefined;
  const positionFrame = MATRIX_POSITION_FRAME[selected]?.[language as "ro" | "en" | "ru"];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
      <figure className="m-0">
        <svg viewBox="0 0 200 200" role="img" aria-label={l.title} className="w-full max-w-xs mx-auto">
          {/* The two squares. Drawn first so the points sit above them. */}
          <polygon
            points={`${POINTS.B.x},${POINTS.B.y} ${POINTS.C.x},${POINTS.C.y} ${POINTS.D.x},${POINTS.D.y} ${POINTS.A.x},${POINTS.A.y}`}
            fill="none" stroke="hsl(var(--line-2))" strokeWidth="1"
          />
          <polygon
            points={`${POINTS.F.x},${POINTS.F.y} ${POINTS.G.x},${POINTS.G.y} ${POINTS.I.x},${POINTS.I.y} ${POINTS.H.x},${POINTS.H.y}`}
            fill="none" stroke="hsl(var(--line-2))" strokeWidth="1"
          />
          <line x1={POINTS.A.x} y1={POINTS.A.y} x2={POINTS.C.x} y2={POINTS.C.y} stroke="hsl(var(--line))" strokeWidth="0.75" />
          <line x1={POINTS.B.x} y1={POINTS.B.y} x2={POINTS.D.x} y2={POINTS.D.y} stroke="hsl(var(--line))" strokeWidth="0.75" />

          {matrix.points.map(({ key, arcana: value, label }) => {
            const pos = POINTS[key];
            const isCentre = key === "E";
            const isSelected = key === selected;
            return (
              <g key={key}>
                <circle
                  cx={pos.x} cy={pos.y} r={isCentre ? 19 : 15}
                  fill={isSelected ? "hsl(var(--accent))" : "hsl(var(--surface-2))"}
                  stroke={isSelected ? "hsl(var(--accent))" : "hsl(var(--line-2))"}
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors"
                  onClick={() => setSelected(key)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${label}: ${value}`}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(key); }
                  }}
                />
                <text
                  x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                  className="num pointer-events-none"
                  fontSize={isCentre ? 15 : 13}
                  fill={isSelected ? "hsl(var(--surface))" : "hsl(var(--ink))"}
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-2 text-center text-xs text-faint">{l.hint}</figcaption>
      </figure>

      {arcana && (
        <div className="space-y-3 rounded-xl border border-line bg-surface/60 p-4">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="num text-2xl text-primary">{point.arcana}</span>
            <h4 className="font-cinzel text-lg text-foreground">
              {arcana.title[language as "ro" | "en" | "ru"]}
            </h4>
          </div>
          {positionFrame && <p className="text-sm text-muted-foreground">{positionFrame}</p>}
          <div className="flex flex-wrap gap-1.5">
            {arcana.keywords[language as "ro" | "en" | "ru"].map((k) => (
              <span key={k} className="rounded bg-sunken px-2 py-0.5 text-xs text-ink-2">{k}</span>
            ))}
          </div>
          <dl className="grid gap-2 text-sm">
            {/* Class names are written out rather than composed. Tailwind scans the
                source for complete strings, so a template literal like
                `bg-${tone}-soft` generates nothing and the panel loses its
                background without any error to show for it. */}
            {([
              ["light", "bg-ok-soft/60"],
              ["shadow", "bg-warn-soft/60"],
              ["task", "bg-accent-soft/60"],
            ] as const).map(([field, tone]) => (
              <div key={field} className={`rounded-lg p-3 ${tone}`}>
                <dt className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {l[field]}
                </dt>
                <dd className="m-0 text-foreground/90">
                  {arcana[field][language as "ro" | "en" | "ru"]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export default DestinyMatrix;
