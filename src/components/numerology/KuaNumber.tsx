import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { kuaNumber } from "@/lib/numerology-plus/systems";

/**
 * The Kua number, and the one parameter the application has never collected.
 *
 * kuaNumber() takes 'male' | 'female' because the Feng Shui formula it encodes
 * has exactly two arithmetic branches: one subtracts the reduced year from 10,
 * the other adds 5 to it. That is what the question is, and that is what the
 * block says -- naming the branches by their arithmetic as well as by their
 * traditional names, so neither the reader who knows Feng Shui nor the reader
 * who does not is misled about what is being asked.
 *
 * Where the answer lives: here, in component state, mirrored into localStorage.
 * Not in user_profiles. NumerologyResults receives fullName, birthDate and
 * onReset and never sees a profile (src/pages/Index.tsx), the reading page works
 * for signed-out visitors, and for a field of this kind "it never leaves the
 * device" is the right default rather than a shortcut. If a saved map ever needs
 * a Kua number, that is a migration and a backend change, and a separate piece
 * of work.
 *
 * When no branch is chosen the block still renders, with the invitation. Hiding
 * it would make Kua undiscoverable and would give chapter 5 a variable number of
 * blocks, which reads as a bug rather than as a choice.
 */

type Lang = "ro" | "en" | "ru";
type Branch = "male" | "female";

const STORAGE_KEY = "kua-branch";

const readBranch = (): Branch | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "male" || stored === "female" ? stored : null;
  } catch {
    // Private modes disable localStorage; the block simply asks every time.
    return null;
  }
};

/** The engine speaks Romanian compass points; every language gets its own. */
const COMPASS: Record<string, Record<Lang, string>> = {
  N:  { ro: "N",  en: "N",  ru: "С"  },
  S:  { ro: "S",  en: "S",  ru: "Ю"  },
  E:  { ro: "E",  en: "E",  ru: "В"  },
  V:  { ro: "V",  en: "W",  ru: "З"  },
  NE: { ro: "NE", en: "NE", ru: "СВ" },
  NV: { ro: "NV", en: "NW", ru: "СЗ" },
  SE: { ro: "SE", en: "SE", ru: "ЮВ" },
  SV: { ro: "SV", en: "SW", ru: "ЮЗ" },
};

const DIRECTION_KEYS = ["shengChi", "tienYi", "nienYen", "fuWei"] as const;

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    ask: "Numărul Kua vine dintr-o formulă Feng Shui de secol trecut, cu două ramuri de calcul: una scade din 10, cealaltă adaugă 5. Alege ramura pe care vrei s-o calculăm.",
    askPrivacy: "Nu clasificăm pe nimeni. Alegerea rămâne în browserul tău și nu pleacă nicăieri.",
    male: "Ramura masculină (10 − n)",
    female: "Ramura feminină (n + 5)",
    kuaLabel: "Numărul Kua",
    group: "Grup", east: "Est", west: "Vest",
    groupNote: "Grupul de Est ține direcțiile N, S, E, SE. Grupul de Vest ține NE, NV, V, SV.",
    directions: "Direcțiile favorabile",
    shengChi: "Sheng Chi — prosperitate",
    tienYi: "Tien Yi — sănătate",
    nienYen: "Nien Yen — relații",
    fuWei: "Fu Wei — creștere personală",
    change: "Schimbă ramura",
    convention: "Convenție clasică (10 − / + 5). Sursele diferă pentru cei născuți după 2000.",
  },
  en: {
    ask: "The Kua number comes from a last-century Feng Shui formula with two branches: one subtracts from 10, the other adds 5. Pick the branch you want calculated.",
    askPrivacy: "We classify no one. The choice stays in your browser and goes nowhere else.",
    male: "Male branch (10 − n)",
    female: "Female branch (n + 5)",
    kuaLabel: "Kua number",
    group: "Group", east: "East", west: "West",
    groupNote: "The East group holds N, S, E, SE. The West group holds NE, NW, W, SW.",
    directions: "Favourable directions",
    shengChi: "Sheng Chi — prosperity",
    tienYi: "Tien Yi — health",
    nienYen: "Nien Yen — relationships",
    fuWei: "Fu Wei — personal growth",
    change: "Change branch",
    convention: "Classic convention (10 − / + 5). Sources differ for those born after 2000.",
  },
  ru: {
    ask: "Число Гуа происходит из формулы фэн-шуй прошлого века с двумя ветвями расчёта: одна вычитает из 10, другая прибавляет 5. Выберите ветвь, которую посчитать.",
    askPrivacy: "Мы никого не классифицируем. Выбор остаётся в вашем браузере и никуда не уходит.",
    male: "Мужская ветвь (10 − n)",
    female: "Женская ветвь (n + 5)",
    kuaLabel: "Число Гуа",
    group: "Группа", east: "Восток", west: "Запад",
    groupNote: "Восточная группа держит С, Ю, В, ЮВ. Западная — СВ, СЗ, З, ЮЗ.",
    directions: "Благоприятные направления",
    shengChi: "Шэн Ци — процветание",
    tienYi: "Тянь И — здоровье",
    nienYen: "Нянь Янь — отношения",
    fuWei: "Фу Вэй — личностный рост",
    change: "Сменить ветвь",
    convention: "Классическая конвенция (10 − / + 5). Источники расходятся для родившихся после 2000 года.",
  },
};

interface KuaNumberProps {
  birthDate: Date;
}

export const KuaNumber = ({ birthDate }: KuaNumberProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const [branch, setBranch] = useState<Branch | null>(readBranch);

  const choose = (next: Branch | null) => {
    setBranch(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The reading still works; only the memory of the choice is lost.
    }
  };

  const kua = useMemo(
    () => (branch ? kuaNumber(birthDate.getFullYear(), branch) : null),
    [birthDate, branch],
  );

  if (!kua) {
    return (
      <div className="space-y-3 border-t border-gilt/40 pt-4">
        <p className="text-sm text-foreground/85">{l.ask}</p>
        <p className="text-xs text-faint">{l.askPrivacy}</p>
        <div className="flex flex-wrap gap-2">
          {(["male", "female"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => choose(b)}
              className="num min-h-11 rounded-sm border border-gilt px-4 text-[0.68rem] uppercase tracking-[0.14em] text-gilt transition-colors hover:bg-gilt-soft"
            >
              {l[b]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="num text-4xl text-primary" data-figure="kua">{kua.kua}</span>
        <div>
          <span className="block text-xs text-muted-foreground">{l.kuaLabel}</span>
          <span className="text-sm text-ink-2" data-group={kua.group}>
            {l.group}: {kua.group === "east" ? l.east : l.west}
          </span>
        </div>
        <button
          type="button"
          onClick={() => choose(null)}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {l.change}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-base text-foreground">{l.directions}</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DIRECTION_KEYS.map((key) => (
            <li key={key} className="flex items-baseline gap-3 rounded-lg bg-sunken px-3 py-2">
              <span className="num text-lg text-foreground" data-direction={key}>
                {COMPASS[kua.favorable[key]]?.[lang] ?? kua.favorable[key]}
              </span>
              <span className="text-sm text-ink-2">{l[key]}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-faint">{l.groupNote}</p>
      </div>

      <p className="text-xs text-faint">{l.convention}</p>
    </div>
  );
};
