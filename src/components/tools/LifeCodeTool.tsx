import { useMemo, useState } from "react";
import { lifeCode } from "@/lib/tools/lifeCode";
import { Field, SchoolsCompare, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; birth: string; code: string; digits: (n: number) => string;
  counts: string; absent: string;
  negTitle: string; negLede: string; post2000Title: string; post2000Lede: string;
  absolute: string; plus19: string;
  vsTitle: string; w2: { label: string; method: string }; lp: { label: string; method: string };
  name: string;
}> = {
  ro: {
    title: "Codul vieții (Kuzdenbaeva)",
    lede: "Patru numere de lucru scoase din data nașterii, scrise unul după altul. De obicei șase cifre, uneori șapte.",
    birth: "Data nașterii", code: "Codul", digits: (n) => `${n} cifre`,
    counts: "Cifrele din dată și cod, numărate", absent: "lipsește",
    negTitle: "Al treilea număr iese negativ",
    negLede: "Sursa nu spune ce se face aici. Pătratul lui Pitagora (Alexandrov), care folosește aceleași numere de lucru, are două convenții. Le arătăm pe amândouă, fără să alegem.",
    post2000Title: "Născut după 2000: pătratul se desparte",
    post2000Lede: "Pentru anii 2000+, școala pătratului lui Pitagora are două reguli pentru al treilea număr. Codul de mai sus urmează formula publicată de Kuzdenbaeva; acestea sunt celelalte.",
    absolute: "|W3| — regula clasică, extinsă", plus19: "W1 + 19 — varianta „2000+”",
    vsTitle: "Al doilea număr față de Drumul Vieții",
    w2: { label: "W2 — suma cifrelor lui W1", method: "Redus o singură dată, cum cere metoda." },
    lp: { label: "Drumul Vieții (pitagoreic)", method: "Luna, ziua și anul reduse separat, apoi adunate." },
    name: "Nu e nevoie de nume. Kuzdenbaeva spune că în consultații lucrează și cu numele și patronimicul, dar acea metodă nu e publicată — nu o inventăm.",
  },
  en: {
    title: "Life code (Kuzdenbaeva)",
    lede: "Four working numbers taken from the birth date, written one after another. Usually six digits, sometimes seven.",
    birth: "Birth date", code: "The code", digits: (n) => `${n} digits`,
    counts: "The digits of the date and the code, counted", absent: "missing",
    negTitle: "The third number comes out negative",
    negLede: "The source does not say what to do here. The Pythagorean square (Alexandrov), which uses the same working numbers, has two conventions. We show both, without choosing.",
    post2000Title: "Born after 2000: the square splits",
    post2000Lede: "For 2000+, the Pythagorean-square school has two rules for the third number. The code above follows Kuzdenbaeva's published formula; these are the others.",
    absolute: "|W3| — the classic rule, extended", plus19: "W1 + 19 — the \"2000+\" variant",
    vsTitle: "The second number against the Life Path",
    w2: { label: "W2 — digit sum of W1", method: "Reduced once only, as the method requires." },
    lp: { label: "Life Path (Pythagorean)", method: "Month, day and year reduced separately, then added." },
    name: "No name is needed. Kuzdenbaeva says that in consultations she also works with the name and patronymic, but that method is not published — we do not invent it.",
  },
  ru: {
    title: "Жизненный код (Кузденбаева)",
    lede: "Четыре рабочих числа из даты рождения, записанные подряд. Обычно шесть цифр, иногда семь.",
    birth: "Дата рождения", code: "Код", digits: (n) => `${n} цифр`,
    counts: "Цифры даты и кода, посчитанные", absent: "нет",
    negTitle: "Третье число выходит отрицательным",
    negLede: "Источник не говорит, что делать в этом случае. У квадрата Пифагора (Александров), где те же рабочие числа, есть две конвенции. Показываем обе, не выбирая.",
    post2000Title: "Рождённые после 2000: квадрат расходится",
    post2000Lede: "Для 2000+ школа квадрата Пифагора знает два правила для третьего числа. Код выше следует опубликованной формуле Кузденбаевой; здесь — остальные.",
    absolute: "|W3| — классическое правило, расширенное", plus19: "W1 + 19 — вариант «2000+»",
    vsTitle: "Второе число против Жизненного пути",
    w2: { label: "W2 — сумма цифр W1", method: "Сводится один раз, как требует метод." },
    lp: { label: "Жизненный путь (пифагорейский)", method: "Месяц, день и год сводятся отдельно, затем складываются." },
    name: "Имя не нужно. Кузденбаева говорит, что на консультациях работает и с именем и отчеством, но этот метод не опубликован — мы его не придумываем.",
  },
};

const LifeCodeTool = ({ defaultBirthDate = "" }: { defaultBirthDate?: string }) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [birth, setBirth] = useState(defaultBirthDate);
  const r = useMemo(() => {
    const b = birthFrom(birth);
    return b ? lifeCode(b) : null;
  }, [birth]);

  return (
    <div data-testid="tool-life-code" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="max-w-xs">
          <Field id="life-birth" type="date" label={t.birth} value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">{t.name}</p>
        {r && (
          <>
            <div className="border-t border-line pt-4">
              <p className="text-xs text-muted-foreground">
                {t.code} · {t.digits(r.length)}
              </p>
              <p className="num mt-1 text-4xl tracking-[0.2em] text-primary">{r.code}</p>
              <ul className="num mt-2 space-y-0.5 text-xs text-foreground/75">
                {r.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-line pt-4">
              <p className="text-xs text-muted-foreground">{t.counts}</p>
              <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1 sm:grid-cols-9">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <span key={d} className={`num text-sm ${r.counts[d] ? "text-foreground" : "text-muted-foreground"}`}>
                    {r.counts[d] ? String(d).repeat(r.counts[d]) : `${d} — ${t.absent}`}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </ToolBlock>

      {r && r.alternatives.length > 0 && (
        <ToolBlock
          title={r.negativeThird ? t.negTitle : t.post2000Title}
          lede={r.negativeThird ? t.negLede : t.post2000Lede}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {r.alternatives.map((a) => (
              <div key={a.id} data-school={a.id} className="border-t border-line pt-4">
                <span className="num text-2xl tracking-[0.15em] text-primary">{a.code}</span>
                <p className="mt-1.5 text-xs text-muted-foreground">{a.id === "absolute" ? t.absolute : t.plus19}</p>
                <p className="num mt-1 text-xs text-foreground/75">{a.working.join(" · ")}</p>
              </div>
            ))}
          </div>
        </ToolBlock>
      )}

      {r && (
        <ToolBlock title={t.vsTitle}>
          <SchoolsCompare
            rows={[
              { id: "w2", ...t.w2, value: r.vsLifePath.w2 },
              { id: "lp", ...t.lp, value: r.vsLifePath.lifePath },
            ]}
            pairs={[{ a: "w2", b: "lp", distance: r.vsLifePath.distance, verdict: r.vsLifePath.verdict }]}
            verdict={r.vsLifePath.verdict}
          />
        </ToolBlock>
      )}
    </div>
  );
};

export default LifeCodeTool;
