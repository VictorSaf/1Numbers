import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toBirthDate } from "@/lib/numerology-plus/core";
import {
  psychomatrix, lineStrength, GRID_LAYOUT, LINES, type LineKey, type Psychomatrix as PM,
} from "@/lib/numerology-plus/psychomatrix";

/**
 * Pătratul lui Pitagora, în varianta lui Alexandrov — standardul pieței ruse.
 *
 * Lângă fiecare celulă stă și ce ar avea în Lo Shu, care citește aceleași cifre
 * ale datei FĂRĂ numerele de lucru. Diferența dintre cele două grile e exact ce
 * adaugă numerele de lucru: aceeași dată, două școli, alte goluri.
 *
 * Pentru născuții după 2000 școala însăși se desparte; arătăm ambele reguli.
 */

type Lang = "ro" | "en" | "ru";

const CELL: Record<Lang, Record<number, string>> = {
  ro: { 1: "caracter", 2: "energie", 3: "interes", 4: "sănătate", 5: "logică", 6: "muncă", 7: "noroc", 8: "datorie", 9: "memorie" },
  en: { 1: "character", 2: "energy", 3: "interest", 4: "health", 5: "logic", 6: "work", 7: "luck", 8: "duty", 9: "memory" },
  ru: { 1: "характер", 2: "энергия", 3: "интерес", 4: "здоровье", 5: "логика", 6: "труд", 7: "удача", 8: "долг", 9: "память" },
};

const LINE: Record<Lang, Record<LineKey, string>> = {
  ro: { purpose: "scop", family: "familie", habits: "obiceiuri", selfEsteem: "stima de sine", work: "bani și muncă", talent: "talent", spirit: "spiritualitate", temperament: "temperament" },
  en: { purpose: "purpose", family: "family", habits: "habits", selfEsteem: "self-esteem", work: "money and work", talent: "talent", spirit: "spirituality", temperament: "temperament" },
  ru: { purpose: "цель", family: "семья", habits: "привычки", selfEsteem: "самооценка", work: "деньги и труд", talent: "талант", spirit: "духовность", temperament: "темперамент" },
};

const COPY: Record<Lang, {
  working: string; loShu: string; added: string; strength: Record<string, string>;
  rules: string; absolute: string; plus19: string; rulesNote: string; empty: string;
}> = {
  ro: {
    working: "numerele de lucru",
    loShu: "în Lo Shu",
    added: "Numerele de lucru adaugă",
    strength: { weak: "slabă", medium: "medie", strong: "puternică" },
    rules: "Două reguli pentru născuții după 2000",
    absolute: "|N1 − 2 × prima cifră a zilei|",
    plus19: "N1 + 19",
    rulesNote: "Celulele în care regulile dau altceva sunt marcate.",
    empty: "gol",
  },
  en: {
    working: "working numbers",
    loShu: "in Lo Shu",
    added: "The working numbers add",
    strength: { weak: "weak", medium: "medium", strong: "strong" },
    rules: "Two rules for births from 2000",
    absolute: "|N1 − 2 × first digit of the day|",
    plus19: "N1 + 19",
    rulesNote: "Cells where the rules disagree are marked.",
    empty: "empty",
  },
  ru: {
    working: "рабочие числа",
    loShu: "в Ло Шу",
    added: "Рабочие числа добавляют",
    strength: { weak: "слабая", medium: "средняя", strong: "сильная" },
    rules: "Два правила для рождённых после 2000",
    absolute: "|N1 − 2 × первая цифра дня|",
    plus19: "N1 + 19",
    rulesNote: "Клетки, где правила расходятся, отмечены.",
    empty: "пусто",
  },
};

const Grid = ({ pm, compare, lang, loShu }: { pm: PM; compare?: PM; lang: Lang; loShu?: Record<number, number> }) => (
  <div className="grid grid-cols-3 border-l border-t border-line" data-psychomatrix-grid={pm.rule}>
    {GRID_LAYOUT.flat().map((d) => {
      const n = pm.counts[d];
      const differs = compare && compare.counts[d] !== n;
      return (
        <div key={d} data-cell={d} className={`border-b border-r border-line p-2 sm:p-3 ${differs ? "bg-tension-soft" : ""}`}>
          <p className={`num min-h-[1.75rem] text-lg leading-tight break-all ${n ? "text-primary" : "text-muted-foreground/50"}`}>
            {n ? String(d).repeat(n) : COPY[lang].empty}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">{CELL[lang][d]}</p>
          {loShu && (
            <p className="num mt-0.5 text-[0.63rem] text-muted-foreground/80">
              {COPY[lang].loShu}: {loShu[d] ?? 0}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

export const Psychomatrix = ({ birthDate }: { birthDate: Date }) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "en") as Lang;
  const t = COPY[lang];
  const b = toBirthDate(birthDate);

  const { abs, p19, loShu } = useMemo(() => {
    // Lo Shu numără doar cifrele datei, fără zero și fără numere de lucru.
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (const ch of `${b.day}${b.month}${b.year}`) if (ch !== "0") counts[Number(ch)]++;
    return {
      abs: psychomatrix(b, "absolute"),
      p19: b.year >= 2000 ? psychomatrix(b, "plus19") : null,
      loShu: counts,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- b e derivat din birthDate
  }, [birthDate]);

  const added = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter((d) => abs.counts[d] > loShu[d])
    .map((d) => `${d}×${abs.counts[d] - loShu[d]}`);

  return (
    <div data-psychomatrix className="space-y-5">
      <p className="num text-xs text-muted-foreground">
        {t.working}: <span className="text-foreground">{abs.working.join(" · ")}</span>
      </p>

      <Grid pm={abs} compare={p19 ?? undefined} lang={lang} loShu={loShu} />

      {added.length > 0 && (
        <p className="text-sm text-foreground/85">
          {t.added}: <span className="num text-primary">{added.join("  ")}</span>
        </p>
      )}

      <div className="grid gap-x-6 sm:grid-cols-2">
        {(Object.keys(LINES) as LineKey[]).map((k) => {
          const s = lineStrength(abs.lines[k]);
          return (
            <div key={k} data-line={k} className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-sm">
              <span className="text-foreground/85">
                {LINE[lang][k]} <span className="num text-xs text-muted-foreground">({LINES[k].join("-")})</span>
              </span>
              <span className={`num ${s === "strong" ? "text-harmony" : s === "weak" ? "text-tension" : "text-foreground/80"}`}>
                {abs.lines[k]} · {t.strength[s]}
              </span>
            </div>
          );
        })}
      </div>

      {p19 && (
        <div className="space-y-3 border-t border-tension pt-4" data-psychomatrix-rules>
          <h4 className="font-heading text-base text-foreground">{t.rules}</h4>
          <p className="text-xs text-muted-foreground">{t.rulesNote}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="num mb-2 text-xs text-muted-foreground">N3 = {t.absolute} → {abs.working.join(" · ")}</p>
              <Grid pm={abs} compare={p19} lang={lang} />
            </div>
            <div>
              <p className="num mb-2 text-xs text-muted-foreground">N3 = {t.plus19} → {p19.working.join(" · ")}</p>
              <Grid pm={p19} compare={abs} lang={lang} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Psychomatrix;
