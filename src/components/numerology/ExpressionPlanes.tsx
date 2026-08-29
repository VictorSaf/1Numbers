import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { planesOfExpression } from "@/lib/numerology-plus/pythagorean";
import { cn } from "@/lib/utils";

/**
 * The 4x3 grid of Planes against Natures, drawn as a heatmap.
 *
 * A sequential ramp is the right encoding here because the quantity is one
 * dimension with a natural order -- how much of the name falls in each cell.
 * Categorical colours would imply the cells are different kinds of thing rather
 * than more or less of the same thing.
 *
 * The letter tables behind this are a reconstruction from published charts, not
 * a primary source; planes.test.ts holds them to the invariant that the cells
 * must sum to Expression.raw.
 */

const PLANES = ["physical", "mental", "emotional", "intuitive"] as const;
const NATURES = ["creative", "vacillating", "grounded"] as const;

const LABELS = {
  ro: {
    planes: { physical: "Fizic", mental: "Mental", emotional: "Emoțional", intuitive: "Intuitiv" },
    natures: { creative: "Creativ", vacillating: "Oscilant", grounded: "Ancorat" },
    total: "Total", legend: "Puține litere", legendHigh: "Multe litere", cells: "litere",
  },
  en: {
    planes: { physical: "Physical", mental: "Mental", emotional: "Emotional", intuitive: "Intuitive" },
    natures: { creative: "Creative", vacillating: "Vacillating", grounded: "Grounded" },
    total: "Total", legend: "Few letters", legendHigh: "Many letters", cells: "letters",
  },
  ru: {
    planes: { physical: "Физический", mental: "Ментальный", emotional: "Эмоциональный", intuitive: "Интуитивный" },
    natures: { creative: "Творческий", vacillating: "Колеблющийся", grounded: "Заземлённый" },
    total: "Всего", legend: "Мало букв", legendHigh: "Много букв", cells: "букв",
  },
};

/** Map a cell's share of the maximum onto one of the six ramp steps. */
const rampStep = (count: number, max: number): number => {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  return Math.min(6, Math.max(1, Math.ceil((count / max) * 6)));
};

interface ExpressionPlanesProps {
  fullName: string;
}

const ExpressionPlanes = ({ fullName }: ExpressionPlanesProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;

  const { grid, planeTotals, natureTotals, max } = useMemo(() => {
    const p = planesOfExpression(fullName);
    const counts = PLANES.flatMap((pl) => NATURES.map((n) => p.grid[pl][n].count));
    return { ...p, max: Math.max(...counts, 0) };
  }, [fullName]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-24" />
              {NATURES.map((n) => (
                <th key={n} className="pb-1 text-xs font-normal text-muted-foreground">
                  {l.natures[n]}
                </th>
              ))}
              <th className="w-16 pb-1 text-xs font-normal text-faint">{l.total}</th>
            </tr>
          </thead>
          <tbody>
            {PLANES.map((plane) => (
              <tr key={plane}>
                <th scope="row" className="pr-2 text-right text-xs font-normal text-muted-foreground">
                  {l.planes[plane]}
                </th>
                {NATURES.map((nature) => {
                  const cell = grid[plane][nature];
                  const step = rampStep(cell.count, max);
                  return (
                    <td
                      key={nature}
                      title={`${l.planes[plane]} · ${l.natures[nature]}: ${cell.count} ${l.cells}`}
                      className="rounded-md p-2 text-center align-middle"
                      style={{
                        backgroundColor: step === 0 ? "hsl(var(--sunken))" : `hsl(var(--ramp-${step}))`,
                        // The ramp darkens as it climbs, so the label flips once the
                        // background is dark enough for light text to be the legible one.
                        color: step >= 4 ? "hsl(var(--surface))" : "hsl(var(--ink))",
                      }}
                    >
                      <span className="num block text-lg leading-none">{cell.count}</span>
                      <span className="num block text-[10px] opacity-70">{cell.sum}</span>
                    </td>
                  );
                })}
                <td className="num rounded-md bg-surface-2 p-2 text-center text-sm text-ink-2">
                  {planeTotals[plane].sum}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="pr-2 text-right text-xs font-normal text-faint">
                {l.total}
              </th>
              {NATURES.map((n) => (
                <td key={n} className="num rounded-md bg-surface-2 p-2 text-center text-sm text-ink-2">
                  {natureTotals[n].sum}
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* A sequential ramp is meaningless without its ends named. */}
      <div className="flex items-center gap-2 text-[11px] text-faint">
        <span>{l.legend}</span>
        <span className="flex">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <span
              key={s}
              className={cn("h-3 w-5", s === 1 && "rounded-l", s === 6 && "rounded-r")}
              style={{ backgroundColor: `hsl(var(--ramp-${s}))` }}
            />
          ))}
        </span>
        <span>{l.legendHigh}</span>
      </div>
    </div>
  );
};

export default ExpressionPlanes;
