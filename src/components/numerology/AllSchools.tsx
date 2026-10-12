import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { compareAll, type Comparison, type Lang } from "@/lib/models/elements";
import type { Verdict } from "@/lib/models/compare";
import { renderShareCard, pickSplits } from "@/lib/shareCard";

/**
 * Aceeași întrebare, toate școlile.
 *
 * Fiecare aplicație din piață alege o convenție — Y vocală sau nu, anul de la
 * 1 ianuarie sau de la aniversare, alfabetul pitagoreic sau caldeean — și o
 * aplică fără să spună. Aici le punem pe toate una lângă alta, cu calculul
 * fiecăreia, și măsurăm cât de departe sunt. Nu alegem un câștigător și nu
 * facem medii: diferența dintre școli e chiar ce are omul de citit.
 *
 * Rezumatul de sus numără, nu face medie: „în câte întrebări cad de acord".
 */

const DOT: Record<Verdict, string> = {
  agree: "bg-harmony",
  octave: "bg-gilt",
  near: "bg-muted-foreground/50",
  apart: "bg-tension",
};

const RULE: Record<Verdict, string> = {
  agree: "border-harmony",
  octave: "border-gilt",
  near: "border-line",
  apart: "border-tension",
};

const COPY: Record<Lang, {
  lede: string;
  summary: (agree: number, total: number) => string;
  verdict: Record<Verdict, string>;
  spread: string;
  school: string;
  value: string;
  steps: string;
  matrix: string;
  currentName: string;
  currentNameHint: string;
  gender: string;
  genderHint: string;
  none: string;
  female: string;
  male: string;
  share: string;
  cardTitle: string;
  cardFooter: string;
}> = {
  ro: {
    lede: "Aceleași întrebări, puse prin fiecare școală care le calculează. Unde școlile dau răspunsuri diferite, le vezi pe toate, cu calculul fiecăreia, și distanța dintre ele. Diferența nu e o greșeală — e informația.",
    summary: (a, t) => `În ${a} din ${t} întrebări școlile cad de acord. În celelalte ${t - a} se despart — acolo e de citit.`,
    verdict: { agree: "acord", octave: "aceeași rădăcină", near: "aproape", apart: "departe" },
    spread: "distanța maximă",
    school: "Școala",
    value: "Răspuns",
    steps: "calculul",
    matrix: "Distanța dintre fiecare două școli",
    currentName: "Numele pe care îl folosești azi",
    currentNameHint: "Opțional. Dacă diferă de cel din actul de naștere, îl punem lângă el.",
    gender: "Pentru Kua",
    genderHint: "Doar formula Kua îl folosește.",
    none: "—",
    female: "femeie",
    male: "bărbat",
    share: "Imagine cu diferențele (fără nume, fără dată)",
    cardTitle: "Unde școlile nu se pun de acord despre mine",
    cardFooter: "numerology compass · aceeași întrebare, toate școlile",
  },
  en: {
    lede: "The same questions, put through every school that calculates them. Where the schools give different answers, you see all of them, each with its arithmetic, and the distance between them. The difference is not a mistake — it is the information.",
    summary: (a, t) => `In ${a} of ${t} questions the schools agree. In the other ${t - a} they part — that is where there is something to read.`,
    verdict: { agree: "agree", octave: "same root", near: "near", apart: "apart" },
    spread: "widest distance",
    school: "School",
    value: "Answer",
    steps: "the arithmetic",
    matrix: "The distance between every two schools",
    currentName: "The name you use today",
    currentNameHint: "Optional. If it differs from your birth name, we set it beside it.",
    gender: "For Kua",
    genderHint: "Only the Kua formula uses it.",
    none: "—",
    female: "female",
    male: "male",
    share: "Image of the differences (no name, no date)",
    cardTitle: "Where the schools disagree about me",
    cardFooter: "numerology compass · the same question, every school",
  },
  ru: {
    lede: "Одни и те же вопросы через каждую школу, которая их считает. Где школы отвечают по-разному, вы видите все ответы, расчёт каждого и расстояние между ними. Разница — не ошибка, а информация.",
    summary: (a, t) => `В ${a} из ${t} вопросов школы согласны. В остальных ${t - a} расходятся — там и есть что читать.`,
    verdict: { agree: "согласие", octave: "один корень", near: "близко", apart: "далеко" },
    spread: "наибольшее расстояние",
    school: "Школа",
    value: "Ответ",
    steps: "расчёт",
    matrix: "Расстояние между каждыми двумя школами",
    currentName: "Имя, которым вы пользуетесь сегодня",
    currentNameHint: "Необязательно. Если оно отличается от имени при рождении, поставим рядом.",
    gender: "Для Гуа",
    genderHint: "Используется только формулой Гуа.",
    none: "—",
    female: "женщина",
    male: "мужчина",
    share: "Картинка с расхождениями (без имени и даты)",
    cardTitle: "Где школы расходятся обо мне",
    cardFooter: "numerology compass · один вопрос, все школы",
  },
};

const DistanceMatrix = ({ c, title }: { c: Comparison; title: string }) => {
  const ids = c.models.map((m) => m.id);
  const d = (a: string, b: string) =>
    c.pairs.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));
  return (
    <div className="mt-4">
      <p className="num text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="num text-xs" data-distance-matrix>
          <thead>
            <tr>
              <th />
              {c.models.map((m, i) => (
                <th key={m.id} scope="col" title={m.school} className="px-2 pb-1 font-normal text-muted-foreground">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.models.map((row, i) => (
              <tr key={row.id}>
                <th scope="row" title={row.school} className="pr-2 text-right font-normal text-muted-foreground">
                  {i + 1}
                </th>
                {ids.map((col) => {
                  if (col === row.id) return <td key={col} className="px-2 py-1 text-center text-muted-foreground/40">·</td>;
                  const p = d(row.id, col)!;
                  return (
                    <td
                      key={col}
                      className={`px-2 py-1 text-center ${p.verdict === "apart" ? "text-tension" : p.verdict === "agree" ? "text-harmony" : p.verdict === "octave" ? "text-gilt" : "text-foreground/80"}`}
                    >
                      {p.verdict === "octave" ? "≡" : p.distance}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Row = ({ c, t }: { c: Comparison; t: (typeof COPY)[Lang] }) => (
  <details data-comparison={c.key} className={`group border-t pt-4 ${RULE[c.verdict]}`}>
    <summary className="flex cursor-pointer list-none items-baseline gap-3 pb-3 [&::-webkit-details-marker]:hidden">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 self-start rounded-full ${DOT[c.verdict]}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base text-foreground sm:text-lg">{c.question}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {t.verdict[c.verdict]}
          {c.verdict !== "agree" && c.verdict !== "octave" && c.scale !== "category" && ` · ${t.spread} ${c.spread}`}
        </span>
      </span>
      <span className="num shrink-0 text-right text-lg text-primary sm:text-xl">
        {/* Un grup e un răspuns; „/” le desparte, „·” stă în interiorul unei mulțimi. */}
        {c.groups.map((g) => g.display).join("  /  ")}
      </span>
      <span className="num shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true">›</span>
    </summary>

    <ol className="space-y-0">
      {c.models.map((m, i) => (
        <li key={m.id} data-model={m.id} className="grid grid-cols-[1.5rem_1fr_auto] gap-x-3 border-b border-line py-3">
          <span className="num pt-0.5 text-xs text-muted-foreground">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-sm text-foreground/90">{m.school}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{m.method}</p>
            {m.steps.length > 0 && (
              <details className="mt-1.5">
                <summary className="num cursor-pointer text-[0.63rem] uppercase tracking-[0.14em] text-gilt">{t.steps}</summary>
                <ul className="num mt-1.5 space-y-0.5 break-words text-xs text-foreground/75">
                  {m.steps.map((s, k) => <li key={k}>{s}</li>)}
                </ul>
              </details>
            )}
          </div>
          <span className="num text-right text-2xl leading-none text-primary">{m.display}</span>
        </li>
      ))}
    </ol>

    {/* Când toate cad de acord, matricea ar fi numai zerouri. */}
    {c.models.length > 2 && c.verdict !== "agree" && <DistanceMatrix c={c} title={t.matrix} />}

    <p className="mt-4 pb-2 text-sm leading-relaxed text-foreground/85">{c.says}</p>
  </details>
);

export const AllSchools = ({
  fullName,
  birthDate,
  today,
}: {
  fullName: string;
  birthDate: Date;
  today?: Date;
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as Lang;
  const t = COPY[lang];
  const [currentName, setCurrentName] = useState("");
  const [gender, setGender] = useState<"" | "male" | "female">("");

  const list = useMemo(
    () => compareAll(fullName, birthDate, { lang, today, currentName, gender: gender || undefined }),
    [fullName, birthDate, lang, today, currentName, gender],
  );
  const agree = list.filter((c) => c.verdict === "agree").length;

  const share = async () => {
    const blob = await renderShareCard(list, {
      title: t.cardTitle,
      summary: t.summary(agree, list.length),
      footer: t.cardFooter,
    });
    if (!blob) return;
    const file = new File([blob], "scoli.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] }).catch(() => undefined);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scoli.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-all-schools className="space-y-5">
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{t.lede}</p>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="num text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">{t.currentName}</span>
          <input
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            className="mt-1 w-full border-0 border-b border-line bg-transparent py-1.5 text-sm text-foreground outline-none focus:border-primary"
            autoComplete="off"
          />
          <span className="mt-1 block text-xs text-muted-foreground">{t.currentNameHint}</span>
        </label>
        <fieldset>
          <legend className="num text-[0.63rem] uppercase tracking-[0.16em] text-muted-foreground">{t.gender}</legend>
          <div className="mt-1.5 flex gap-4 text-sm">
            {(["", "female", "male"] as const).map((g) => (
              <label key={g || "none"} className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="kua-gender" checked={gender === g} onChange={() => setGender(g)} />
                {g === "" ? t.none : t[g]}
              </label>
            ))}
          </div>
          <span className="mt-1 block text-xs text-muted-foreground">{t.genderHint}</span>
        </fieldset>
      </div>

      <p data-summary className="border-l-2 border-gilt py-1 pl-4 text-sm leading-relaxed text-foreground/85">
        {t.summary(agree, list.length)}
      </p>

      <div>
        {list.map((c) => <Row key={c.key} c={c} t={t} />)}
      </div>

      {pickSplits(list).length > 0 && (
        <button
          type="button"
          onClick={share}
          data-share-card
          className="num border-b border-gilt pb-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-gilt hover:text-primary"
        >
          {t.share}
        </button>
      )}
    </div>
  );
};

export default AllSchools;
