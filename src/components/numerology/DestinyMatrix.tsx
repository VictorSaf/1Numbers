import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  destinyMatrix,
  compareReductions,
  compareModels,
  matrixZones,
  ageLine,
  exactAge,
  type CalcStep,
  type ModelComparison,
  type ReductionRow,
} from "@/lib/numerology-plus/matrix";
import type { Verdict } from "@/lib/models/compare";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { ARCANA_BY_N, MATRIX_POSITION_FRAME } from "@/lib/numerology-plus/content/arcana";

/**
 * The Destiny Matrix: the octagram, the derived zones, the age line.
 *
 * Only the nine base points are drawn in the figure. The derived zones -- money
 * and love channels, karmic tail, ancestral lines, purposes, the symbolic chakra
 * map -- are listed below it, each with its published source, both reductions
 * (digit sum and mod 22) side by side, the distance where they differ, and the
 * additions that produced it. Where sources publish different formulas for the
 * same zone, every model is shown next to the others; none is chosen.
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

type Lang = "ro" | "en" | "ru";

const COPY: Record<Lang, {
  zonesTitle: string; zonesLede: string; digitsum: string; mod22: string; distance: string;
  steps: string; unreduced: string; source: string; symbolic: string;
  modelsTitle: string; modelsLede: string; agreeAll: string; sameCells: string;
  ageTitle: string; ageLede: string; ageRule: string; now: string; after80: string;
  zones: Record<string, string>; models: Record<string, string>; cells: Record<string, string>;
  chakras: Record<string, string>; cols: Record<string, string>;
}> = {
  ro: {
    zonesTitle: "Zonele matricei",
    zonesLede: "Fiecare zonă în ambele reduceri: suma cifrelor (25 → 7) și scăderea lui 22 (25 → 3). Când dau altceva, distanța e pe scara celor 22 de arcane.",
    digitsum: "Σ cifre", mod22: "−22", distance: "distanță",
    steps: "Cum s-a calculat", unreduced: "* intră nereduse", source: "Sursa",
    symbolic: "Hartă simbolică, nu medicală. Nu spune nimic despre sănătatea corpului.",
    modelsTitle: "Unde școlile nu se potrivesc",
    modelsLede: "Aceeași zonă, formule publicate diferit. Fiecare model e corect în sistemul lui; distanța dintre ele e informația.",
    agreeAll: "La data aceasta modelele dau același rezultat.", sameCells: "celule identice",
    ageTitle: "Linia vârstei, 0–80",
    ageLede: "Perimetrul octagramei, câte zece ani între două puncte, cu punctele intermediare prin înjumătățire.",
    ageRule: "5 = capăt + capăt; 2,5 = 0 + 5; 7,5 = 5 + 10; 1–2 = 0 + 2,5; 3–4 = 2,5 + 5; 6–7 = 5 + 7,5; 8–9 = 7,5 + 10.",
    now: "acum", after80: "După 80 de ani linia nu mai are un punct curent.",
    zones: { gift: "Darul principal (centrul)", money: "Canalul banilor", love: "Canalul iubirii", karmicTail: "Coada karmică", ancestry: "Liniile neamului", purposes: "Destinațiile", chakras: "Harta chakrelor", portrait: "Portretul cuplului", points: "Punctele cuplului" },
    models: { ladini: "Ladini", axes: "pe axe", vratamir: "vratamir", numefy: "numefy", gadalkindom: "gadalkindom", pribylova: "Pribylova", pointwise: "punct cu punct" },
    cells: { E: "centru", entry: "intrare", center: "centrul liniei", heart: "sub inimă", dollar: "sub dolar", D1: "intrare (D+E)", D2: "mijloc", D: "capăt (D)", father: "linia tatălui", mother: "linia mamei", sky: "linia cerului", earth: "linia pământului", personal: "personală", social: "socială", spiritual: "spirituală", planetary: "planetară" },
    chakras: { sahasrara: "Sahasrara", ajna: "Ajna", vishuddha: "Vishuddha", anahata: "Anahata", manipura: "Manipura", svadhisthana: "Svadhisthana", muladhara: "Muladhara", total: "Total" },
    cols: { physics: "fizic", energy: "energie", emotions: "emoții" },
  },
  en: {
    zonesTitle: "The matrix zones",
    zonesLede: "Every zone in both reductions: digit sum (25 → 7) and subtracting 22 (25 → 3). Where they differ, the distance is on the scale of the 22 arcana.",
    digitsum: "digit sum", mod22: "−22", distance: "distance",
    steps: "How it was calculated", unreduced: "* enters unreduced", source: "Source",
    symbolic: "A symbolic map, not a medical one. It says nothing about the health of the body.",
    modelsTitle: "Where the schools disagree",
    modelsLede: "The same zone, published with different formulas. Each model is right within its system; the distance between them is the information.",
    agreeAll: "For this date the models give the same result.", sameCells: "identical cells",
    ageTitle: "The age line, 0–80",
    ageLede: "The perimeter of the octagram, ten years between two points, with the points in between found by halving.",
    ageRule: "5 = end + end; 2.5 = 0 + 5; 7.5 = 5 + 10; 1–2 = 0 + 2.5; 3–4 = 2.5 + 5; 6–7 = 5 + 7.5; 8–9 = 7.5 + 10.",
    now: "now", after80: "After 80 the line has no current point.",
    zones: { gift: "Main gift (the centre)", money: "Money channel", love: "Love channel", karmicTail: "Karmic tail", ancestry: "Ancestral lines", purposes: "Purposes", chakras: "Chakra map", portrait: "Couple portrait", points: "Couple points" },
    models: { ladini: "Ladini", axes: "on the axes", vratamir: "vratamir", numefy: "numefy", gadalkindom: "gadalkindom", pribylova: "Pribylova", pointwise: "point by point" },
    cells: { E: "centre", entry: "entry", center: "line centre", heart: "under the heart", dollar: "under the dollar", D1: "entry (D+E)", D2: "middle", D: "end (D)", father: "father's line", mother: "mother's line", sky: "sky line", earth: "earth line", personal: "personal", social: "social", spiritual: "spiritual", planetary: "planetary" },
    chakras: { sahasrara: "Sahasrara", ajna: "Ajna", vishuddha: "Vishuddha", anahata: "Anahata", manipura: "Manipura", svadhisthana: "Svadhisthana", muladhara: "Muladhara", total: "Total" },
    cols: { physics: "body", energy: "energy", emotions: "emotions" },
  },
  ru: {
    zonesTitle: "Зоны матрицы",
    zonesLede: "Каждая зона в обеих редукциях: сумма цифр (25 → 7) и вычитание 22 (25 → 3). Где они расходятся, расстояние считается по шкале 22 арканов.",
    digitsum: "сумма цифр", mod22: "−22", distance: "расстояние",
    steps: "Как посчитано", unreduced: "* входит без редукции", source: "Источник",
    symbolic: "Символическая карта, не медицинская. Она ничего не говорит о здоровье тела.",
    modelsTitle: "Где школы расходятся",
    modelsLede: "Одна и та же зона, опубликованная с разными формулами. Каждая модель верна в своей системе; расстояние между ними и есть информация.",
    agreeAll: "Для этой даты модели дают один результат.", sameCells: "совпадающих ячеек",
    ageTitle: "Линия возраста, 0–80",
    ageLede: "Периметр октаграммы, десять лет между двумя точками, промежуточные точки — делением пополам.",
    ageRule: "5 = конец + конец; 2,5 = 0 + 5; 7,5 = 5 + 10; 1–2 = 0 + 2,5; 3–4 = 2,5 + 5; 6–7 = 5 + 7,5; 8–9 = 7,5 + 10.",
    now: "сейчас", after80: "После 80 лет у линии нет текущей точки.",
    zones: { gift: "Главный дар (центр)", money: "Канал денег", love: "Канал любви", karmicTail: "Кармический хвост", ancestry: "Родовые линии", purposes: "Предназначения", chakras: "Карта чакр", portrait: "Портрет пары", points: "Точки пары" },
    models: { ladini: "Ладини", axes: "по осям", vratamir: "vratamir", numefy: "numefy", gadalkindom: "gadalkindom", pribylova: "Прибылова", pointwise: "точка к точке" },
    cells: { E: "центр", entry: "вход", center: "центр линии", heart: "под сердцем", dollar: "под долларом", D1: "вход (D+E)", D2: "середина", D: "конец (D)", father: "линия отца", mother: "линия матери", sky: "линия неба", earth: "линия земли", personal: "личное", social: "социальное", spiritual: "духовное", planetary: "планетарное" },
    chakras: { sahasrara: "Сахасрара", ajna: "Аджна", vishuddha: "Вишудха", anahata: "Анахата", manipura: "Манипура", svadhisthana: "Свадхистана", muladhara: "Муладхара", total: "Итог" },
    cols: { physics: "физика", energy: "энергия", emotions: "эмоции" },
  },
};

export type MatrixCopy = (typeof COPY)[Lang];

export const matrixCopy = (language: string): MatrixCopy => COPY[(language in COPY ? language : "en") as Lang];

/** Eticheta unei celule: cheile hărții de chakre sunt `chakra.coloană`. */
const cellLabel = (t: MatrixCopy, key: string): string => {
  const [a, b] = key.split(".");
  if (b) return `${t.chakras[a] ?? a} · ${t.cols[b] ?? b}`;
  return t.cells[key] ?? key;
};

const zoneTitle = (t: MatrixCopy, row: { family: string; id: string; model: string }) => {
  const base = t.zones[row.id] ?? t.zones[row.family] ?? row.family;
  return row.id.includes(".") ? `${base} · ${t.models[row.model] ?? row.model}` : base;
};

/** „A + E = 7 + 8 = 15 → 15". */
const stepText = (s: CalcStep, value: number) => {
  const codes = s.terms.map((x) => (x.unreduced ? `(${x.code})*` : x.code)).join(" + ");
  if (s.terms.length === 1) return `${codes} = ${value}`;
  const vals = s.terms.map((x) => x.value).join(" + ");
  return `${codes} = ${vals} = ${s.raw}${s.raw !== value ? ` → ${value}` : ""}`;
};

const DIST_TONE: Record<Verdict, string> = {
  agree: "text-muted-foreground",
  octave: "text-muted-foreground",
  near: "text-muted-foreground",
  apart: "text-tension",
};

/** Zonele, fiecare cu ambele reduceri, distanța și pașii. Folosită și de cuplu. */
export const MatrixZoneList = ({ rows, t }: { rows: ReductionRow[]; t: MatrixCopy }) => (
  <div className="space-y-6">
    {rows.map((row) => (
      <div key={row.id} data-zone={row.id} className="border-t border-line pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="font-heading text-base text-foreground">{zoneTitle(t, row)}</p>
          <p className="text-[11px] text-faint">{t.source}: {row.source}</p>
        </div>
        {row.symbolic && <p data-symbolic className="mt-1 text-xs text-muted-foreground">{t.symbolic}</p>}
        <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {row.cells.map((c) => (
            <div key={c.key} data-cell={c.key} className="flex items-baseline justify-between gap-3 border-b border-line py-1 text-sm">
              <dt className="text-muted-foreground">{cellLabel(t, c.key)}</dt>
              <dd className="m-0 flex items-baseline gap-2">
                <span data-reduction="digitsum" title={t.digitsum} className="num text-foreground">{c.digitsum}</span>
                <span aria-hidden className="text-faint">/</span>
                <span data-reduction="mod22" title={t.mod22} className="num text-muted-foreground">{c.mod22}</span>
                {c.distance > 0 && (
                  <span data-distance className={`num text-[11px] ${DIST_TONE[c.verdict]}`}>
                    Δ{c.distance}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <details data-steps className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer text-faint">{t.steps}</summary>
          <ul className="mt-1 space-y-0.5">
            {row.cells.map((c) => (
              <li key={c.key} className="num">
                {cellLabel(t, c.key)}: {stepText(c.steps.digitsum, c.digitsum)}
                {(c.steps.mod22.raw !== c.steps.digitsum.raw || c.mod22 !== c.digitsum) &&
                  ` · ${t.mod22}: ${stepText(c.steps.mod22, c.mod22)}`}
              </li>
            ))}
          </ul>
          {row.cells.some((c) => c.steps.digitsum.terms.some((x) => x.unreduced)) && (
            <p className="mt-1">{t.unreduced}</p>
          )}
        </details>
      </div>
    ))}
  </div>
);

/** Modelele aceleiași zone, unul lângă altul, cu distanța dintre ele. */
export const ModelComparisons = ({ comparisons, t }: { comparisons: ModelComparison[]; t: MatrixCopy }) => (
  <div className="space-y-5">
    {comparisons.map((cmp) => {
      const differing = cmp.cells.filter((c) => c.pairs.some((p) => p.distance > 0));
      const same = cmp.cells.length - differing.length;
      return (
        <div key={cmp.family} data-model-family={cmp.family} className="border-t border-line pt-3">
          <p className="font-heading text-base text-foreground">
            {t.zones[cmp.family] ?? cmp.family}
            <span className="ml-2 text-xs text-faint">
              {cmp.models.map((m) => t.models[m] ?? m).join(" · ")}
            </span>
          </p>
          {differing.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{t.agreeAll}</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {differing.map((c) => (
                <li key={c.key} className="flex flex-wrap items-baseline gap-x-3 border-b border-tension py-1">
                  <span className="text-muted-foreground">{cellLabel(t, c.key)}</span>
                  {c.values.map((v) => (
                    <span key={v.id}>
                      <span className="text-faint">{t.models[v.id] ?? v.id} </span>
                      <span className="num text-foreground">{v.value}</span>
                    </span>
                  ))}
                  {c.pairs.map((p) => (
                    <span key={`${p.a}-${p.b}`} className={`num text-[11px] ${DIST_TONE[p.verdict]}`}>
                      Δ{p.distance}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
          {differing.length > 0 && same > 0 && (
            <p className="mt-1 text-xs text-faint"><span className="num">{same}</span> {t.sameCells}</p>
          )}
        </div>
      );
    })}
  </div>
);

interface DestinyMatrixProps {
  birthDate: Date;
  /** Ziua față de care se marchează vârsta curentă. Implicit: azi. */
  today?: Date;
}

const DestinyMatrix = ({ birthDate, today }: DestinyMatrixProps) => {
  const { language } = useLanguage();
  const t = matrixCopy(language);
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

  const birth = useMemo(() => toBirthDate(birthDate), [birthDate]);
  const rows = useMemo(() => compareReductions(birth), [birth]);
  const models = useMemo(() => compareModels(matrixZones(birth)), [birth]);
  const age = useMemo(() => exactAge(birth, today ?? new Date()), [birth, today]);
  const line = useMemo(() => ageLine(birth, "digitsum", age), [birth, age]);
  const line22 = useMemo(() => ageLine(birth, "mod22", age), [birth, age]);

  return (
    <div className="space-y-10">
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
        <div className="space-y-3 border-t border-gilt/40 pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="num text-2xl text-primary">{point.arcana}</span>
            <h4 className="font-heading text-lg text-foreground">
              {arcana.title[language as "ro" | "en" | "ru"]}
            </h4>
          </div>
          {positionFrame && <p className="text-sm text-muted-foreground">{positionFrame}</p>}
          <div className="flex flex-wrap gap-1.5">
            {arcana.keywords[language as "ro" | "en" | "ru"].map((k) => (
              <span key={k} data-keyword className="num text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">{k}</span>
            ))}
          </div>
          <dl className="grid gap-2 text-sm">
            {/* Class names are written out rather than composed. Tailwind scans the
                source for complete strings, so a template literal like
                `bg-${tone}-soft` generates nothing and the panel loses its
                background without any error to show for it.
                Tenta a devenit FILET: culoarea spune care e blocul, nu îl
                inundă. */}
            {([
              ["light", "border-t border-harmony pt-3"],
              ["shadow", "border-t border-tension pt-3"],
              ["task", "border-t border-line pt-3"],
            ] as const).map(([field, tone]) => (
              <div key={field} className={tone}>
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

      <section className="space-y-3">
        <h3 className="font-heading text-lg text-foreground">{t.zonesTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.zonesLede}</p>
        <MatrixZoneList rows={rows} t={t} />
      </section>

      <section className="space-y-3">
        <h3 className="font-heading text-lg text-foreground">{t.modelsTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.modelsLede}</p>
        <ModelComparisons comparisons={models} t={t} />
      </section>

      <section className="space-y-3">
        <h3 className="font-heading text-lg text-foreground">{t.ageTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.ageLede}</p>
        <ol className="grid grid-cols-4 gap-x-2 gap-y-2 sm:grid-cols-8">
          {line.points.map((p, i) => {
            const isNow = i === line.current;
            const m22 = line22.points[i].arcana;
            return (
              <li
                key={p.age}
                data-age-point={p.age}
                aria-current={isNow ? "true" : undefined}
                className={isNow ? "border-t-2 border-accent pt-1" : "border-t border-line pt-1"}
              >
                <span className="num block text-[10px] text-faint">{p.label}</span>
                <span className={`num text-sm ${isNow ? "text-primary" : "text-foreground"}`}>{p.arcana}</span>
                {m22 !== p.arcana && (
                  <span className="num ml-1 text-[10px] text-muted-foreground" title={t.mod22}>/{m22}</span>
                )}
                {isNow && <span className="ml-1 text-[10px] uppercase tracking-wider text-primary">{t.now}</span>}
              </li>
            );
          })}
        </ol>
        {line.current === null && <p className="text-xs text-muted-foreground">{t.after80}</p>}
        <details data-steps className="text-xs text-muted-foreground">
          <summary className="cursor-pointer text-faint">{t.steps}</summary>
          <p className="mt-1">{t.ageRule}</p>
          {line.current !== null && (
            <p className="num mt-1">
              {line.points[line.current].label}: {stepText(line.points[line.current].step, line.points[line.current].arcana)}
            </p>
          )}
        </details>
      </section>
    </div>
  );
};

export default DestinyMatrix;
