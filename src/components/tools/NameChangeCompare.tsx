import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { expression, soulUrge, personality } from "@/lib/numerology-plus/pythagorean";
import { CHALDEAN, sumLetters, reduce } from "@/lib/numerology-plus/core";
import { distance, pairVerdict } from "@/lib/models/compare";

/**
 * Ce se schimbă dacă îți schimbi numele — număr cu număr, pe două școli.
 *
 * Unealta veche dădea un verdict („negativ”) din câte numere se mișcau; o
 * distanță nu e un defect (R3). Aici se vede doar ce se mută și cât, pe
 * alfabetul pitagoreic și pe cel caldeean, care pot să nu fie de acord.
 */

type Lang = "ro" | "en" | "ru";

const COPY: Record<Lang, {
  number: string; before: string; after: string; dist: string; same: string;
  pyth: string; chald: string; summary: (n: number, total: number) => string; schoolsSplit: string;
  labels: { expression: string; soul: string; personality: string; chaldean: string };
}> = {
  ro: {
    number: "Numărul", before: "Înainte", after: "După", dist: "Distanța", same: "neschimbat",
    pyth: "Pitagoreic", chald: "Caldeean",
    summary: (n, t) => n === 0 ? `Niciunul dintre cele ${t} numere nu se mută.` : `Se mută ${n} din ${t} numere. O mutare nu e nici câștig, nici pierdere: e altă temă.`,
    schoolsSplit: "Cele două alfabete nu văd aceeași schimbare: unde unul mută numărul, celălalt poate să-l lase pe loc.",
    labels: { expression: "Destinul (Expresia)", soul: "Sufletul", personality: "Personalitatea", chaldean: "Numele (caldeean)" },
  },
  en: {
    number: "Number", before: "Before", after: "After", dist: "Distance", same: "unchanged",
    pyth: "Pythagorean", chald: "Chaldean",
    summary: (n, t) => n === 0 ? `None of the ${t} numbers moves.` : `${n} of ${t} numbers move. A move is neither gain nor loss: it is another theme.`,
    schoolsSplit: "The two alphabets do not see the same change: where one moves a number, the other may leave it in place.",
    labels: { expression: "Expression", soul: "Soul Urge", personality: "Personality", chaldean: "Name (Chaldean)" },
  },
  ru: {
    number: "Число", before: "До", after: "После", dist: "Расстояние", same: "без изменений",
    pyth: "Пифагорейская", chald: "Халдейская",
    summary: (n, t) => n === 0 ? `Ни одно из ${t} чисел не меняется.` : `Меняются ${n} из ${t} чисел. Перемена — не выигрыш и не потеря, а другая тема.`,
    schoolsSplit: "Два алфавита видят перемену по-разному: где один сдвигает число, другой может оставить его на месте.",
    labels: { expression: "Судьба (Выражение)", soul: "Душа", personality: "Личность", chaldean: "Имя (халдейское)" },
  },
};

export const NameChangeCompare = ({ before, after }: { before: string; after: string }) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as Lang;
  const t = COPY[lang];

  const rows = useMemo(() => {
    const ch = (n: string) => reduce(sumLetters(n, CHALDEAN), false);
    return [
      { key: "expression", school: t.pyth, a: expression(before).value, b: expression(after).value },
      { key: "soul", school: t.pyth, a: soulUrge(before).value, b: soulUrge(after).value },
      { key: "personality", school: t.pyth, a: personality(before).value, b: personality(after).value },
      { key: "chaldean", school: t.chald, a: ch(before), b: ch(after) },
    ] as const;
  }, [before, after, t]);

  const moved = rows.filter((r) => r.a !== r.b).length;
  const pythMoved = rows[0].a !== rows[0].b;
  const chaldMoved = rows[3].a !== rows[3].b;

  return (
    <div data-name-change className="space-y-4">
      <p className="text-sm text-foreground/85">{t.summary(moved, rows.length)}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-1 font-normal">{t.number}</th>
            <th className="py-1 font-normal">{t.before}</th>
            <th className="py-1 font-normal">{t.after}</th>
            <th className="py-1 font-normal">{t.dist}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const v = pairVerdict("digit", r.a, r.b);
            return (
              <tr key={r.key} data-row={r.key} className="border-b border-line">
                <td className="py-2 pr-3">
                  {t.labels[r.key]}
                  <span className="block text-xs text-muted-foreground">{r.school}</span>
                </td>
                <td className="num py-2 text-primary">{r.a}</td>
                <td className="num py-2 text-primary">{r.b}</td>
                <td className={`num py-2 ${v === "apart" ? "text-tension" : "text-muted-foreground"}`}>
                  {r.a === r.b ? t.same : v === "octave" ? "≡" : distance("digit", r.a, r.b)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pythMoved !== chaldMoved && <p className="text-xs text-muted-foreground">{t.schoolsSplit}</p>}
    </div>
  );
};

export default NameChangeCompare;
