import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { babyNameSchools } from "@/lib/tools/babyNames";
import { Field, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; birth: string; names: string; namesHint: string;
  numbers: string; lifePath: string; mulank: string; bhagyank: string;
  name: string; pyth: string; chaldean: string; vedic: string;
  pythHow: string; chaldeanHow: string; vedicHow: string;
  place: string; agree: string; disagree: (n: number) => string;
  rel: Record<"friend" | "neutral" | "enemy", string>;
}> = {
  ro: {
    title: "Alegerea numelui",
    lede: "Fiecare școală își face propriul clasament. Nu le adunăm: unde un nume urcă într-una și coboară în alta, asta e de văzut.",
    birth: "Data așteptată a nașterii", names: "Numele candidate", namesHint: "Câte unul pe rând.",
    numbers: "Numerele datei", lifePath: "Drumul Vieții", mulank: "Mulank", bhagyank: "Bhagyank",
    name: "Nume", pyth: "Pitagoreic", chaldean: "Caldeean", vedic: "Vedic",
    pythHow: "Expresia numelui față de Drumul Vieții — distanța; 0 e același număr.",
    chaldeanHow: "Numărul caldeean al numelui față de numărul zilei de naștere (Cheiro) — distanța.",
    vedicHow: "Același număr caldeean, judecat prieten / neutru / dușman față de Mulank și Bhagyank (0–4, mai mult e mai bine).",
    place: "locul", agree: "școlile îl pun pe același loc",
    disagree: (n) => `școlile îl mută cu ${n} ${n === 1 ? "loc" : "locuri"}`,
    rel: { friend: "prieten", neutral: "neutru", enemy: "dușman" },
  },
  en: {
    title: "Choosing a name",
    lede: "Each school makes its own ranking. We do not add them up: where a name climbs in one and drops in another, that is the thing to see.",
    birth: "Expected birth date", names: "Candidate names", namesHint: "One per line.",
    numbers: "The date's numbers", lifePath: "Life Path", mulank: "Mulank", bhagyank: "Bhagyank",
    name: "Name", pyth: "Pythagorean", chaldean: "Chaldean", vedic: "Vedic",
    pythHow: "The name's Expression against the Life Path — the distance; 0 is the same number.",
    chaldeanHow: "The name's Chaldean number against the birth-day number (Cheiro) — the distance.",
    vedicHow: "The same Chaldean number, judged friend / neutral / enemy of Mulank and Bhagyank (0–4, higher is better).",
    place: "place", agree: "the schools put it in the same place",
    disagree: (n) => `the schools move it by ${n} ${n === 1 ? "place" : "places"}`,
    rel: { friend: "friend", neutral: "neutral", enemy: "enemy" },
  },
  ru: {
    title: "Выбор имени",
    lede: "Каждая школа строит свой рейтинг. Мы их не складываем: где имя поднимается в одной и опускается в другой — это и нужно видеть.",
    birth: "Ожидаемая дата рождения", names: "Имена-кандидаты", namesHint: "По одному в строке.",
    numbers: "Числа даты", lifePath: "Жизненный путь", mulank: "Муланк", bhagyank: "Бхагьянк",
    name: "Имя", pyth: "Пифагорейская", chaldean: "Халдейская", vedic: "Ведическая",
    pythHow: "Число выражения имени против Жизненного пути — расстояние; 0 — то же число.",
    chaldeanHow: "Халдейское число имени против числа дня рождения (Хейро) — расстояние.",
    vedicHow: "То же халдейское число: друг / нейтрален / враг для Муланка и Бхагьянка (0–4, больше — лучше).",
    place: "место", agree: "школы ставят его на одно место",
    disagree: (n) => `школы сдвигают его на ${n}`,
    rel: { friend: "друг", neutral: "нейтр.", enemy: "враг" },
  },
};

const BabyNameTool = () => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [birth, setBirth] = useState("");
  const [text, setText] = useState("");

  const r = useMemo(() => {
    const b = birthFrom(birth);
    return b && text.trim() ? babyNameSchools(text.split(/\n|,/), b) : null;
  }, [birth, text]);

  const names = r ? [...r.names].sort((a, b) => a.ranks.pyth - b.ranks.pyth) : [];

  return (
    <div data-testid="tool-baby-name" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="baby-birth" type="date" label={t.birth} value={birth} onChange={(e) => setBirth(e.target.value)} />
          <div className="space-y-1.5">
            <Label htmlFor="baby-names">{t.names}</Label>
            <Textarea id="baby-names" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={"Ana\nMaria\nIoana"} />
            <p className="text-xs text-muted-foreground">{t.namesHint}</p>
          </div>
        </div>

        {r && (
          <>
            <p className="num text-sm text-foreground/85">
              {t.lifePath} {r.lifePath} · {t.mulank} {r.mulank} · {t.bhagyank} {r.bhagyank}
            </p>
            <ul className="space-y-1 text-xs leading-snug text-muted-foreground">
              <li><span className="text-foreground/85">{t.pyth}.</span> {t.pythHow}</li>
              <li><span className="text-foreground/85">{t.chaldean}.</span> {t.chaldeanHow}</li>
              <li><span className="text-foreground/85">{t.vedic}.</span> {t.vedicHow}</li>
            </ul>

            <div className="space-y-0">
              {names.map((n) => (
                <div
                  key={n.name}
                  data-name-row={n.name}
                  className={`grid gap-3 border-t py-4 sm:grid-cols-[10rem_1fr_1fr_1fr] ${n.rankSpread >= 2 ? "border-tension" : n.rankSpread === 0 ? "border-harmony" : "border-line"}`}
                >
                  <div>
                    <p className="font-heading text-base text-foreground">{n.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.rankSpread === 0 ? t.agree : t.disagree(n.rankSpread)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">{t.pyth}</p>
                    <p className="num text-foreground">
                      {n.pyth.raw} → {n.pyth.number} · Δ {n.pyth.fit} · {t.place} {n.ranks.pyth}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">{t.chaldean}</p>
                    <p className="num text-foreground">
                      {n.chaldean.compound}/{n.chaldean.number} · Δ {n.chaldean.fit} · {t.place} {n.ranks.chaldean}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">{t.vedic}</p>
                    <p className="num text-foreground">
                      {n.vedic.number} · {n.vedic.fit}/4 · {t.place} {n.ranks.vedic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.mulank}: {t.rel[n.vedic.withMulank]} · {t.bhagyank}: {t.rel[n.vedic.withBhagyank]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </ToolBlock>
    </div>
  );
};

export default BabyNameTool;
