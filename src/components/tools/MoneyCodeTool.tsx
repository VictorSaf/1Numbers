import { useMemo, useState } from "react";
import { moneyCode } from "@/lib/tools/moneyCode";
import { Field, SchoolsCompare, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; birth: string;
  single: { label: string; method: string }; four: { label: string; method: string }; unreduced: { label: string; method: string };
  codeTitle: string; same: string; differ: string; pin: string;
}> = {
  ro: {
    title: "Codul banilor",
    lede: "„Денежный код” din piața rusă circulă în două forme: o cifră și patru. Le arătăm pe amândouă.",
    birth: "Data nașterii",
    single: { label: "O cifră", method: "Toate cifrele datei, reduse la 1–9 („число богатства”)." },
    four: { label: "Patru cifre — a patra", method: "Ziua, luna, anul — fiecare redusă — și suma lor, redusă." },
    unreduced: { label: "A patra, nereducută", method: "Aceeași sumă, lăsată cum iese (așa apare în unele articole)." },
    codeTitle: "Codul de patru cifre",
    same: "A patra cifră e aceeași cu varianta de o cifră — întotdeauna: rădăcina unei sume nu depinde de ordinea reducerii. Școlile nu se contrazic pe cifra finală; varianta de patru arată doar drumul.",
    differ: "A patra cifră diferă de varianta de o cifră.",
    pin: "Nu îl folosi ca PIN sau parolă. Un cod scos din data nașterii e primul lucru pe care îl încearcă cineva care îți cunoaște data.",
  },
  en: {
    title: "Money code",
    lede: "The Russian-market \"money code\" circulates in two forms: one digit and four. We show both.",
    birth: "Birth date",
    single: { label: "One digit", method: "Every digit of the date, reduced to 1–9 (\"wealth number\")." },
    four: { label: "Four digits — the fourth", method: "Day, month, year — each reduced — and their sum, reduced." },
    unreduced: { label: "The fourth, unreduced", method: "The same sum, left as it comes (as some articles print it)." },
    codeTitle: "The four-digit code",
    same: "The fourth digit equals the one-digit version — always: the root of a sum does not depend on the order of reduction. The schools do not disagree on the final digit; the four-digit version only shows the way there.",
    differ: "The fourth digit differs from the one-digit version.",
    pin: "Do not use it as a PIN or password. A code taken from your birth date is the first thing anyone who knows your birthday will try.",
  },
  ru: {
    title: "Денежный код",
    lede: "Денежный код ходит в двух формах: одна цифра и четыре. Показываем обе.",
    birth: "Дата рождения",
    single: { label: "Одна цифра", method: "Все цифры даты, сведённые к 1–9 («число богатства»)." },
    four: { label: "Четыре цифры — четвёртая", method: "День, месяц, год — каждое сведено — и их сумма, сведённая." },
    unreduced: { label: "Четвёртая, несведённая", method: "Та же сумма как есть (так её печатают некоторые статьи)." },
    codeTitle: "Четырёхзначный код",
    same: "Четвёртая цифра совпадает с однозначным вариантом — всегда: корень суммы не зависит от порядка сведения. Школы не спорят о последней цифре; четырёхзначный вариант лишь показывает путь.",
    differ: "Четвёртая цифра отличается от однозначного варианта.",
    pin: "Не используйте его как PIN или пароль. Код из даты рождения — первое, что попробует тот, кто знает ваш день рождения.",
  },
};

const MoneyCodeTool = ({ defaultBirthDate = "" }: { defaultBirthDate?: string }) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [birth, setBirth] = useState(defaultBirthDate);
  const r = useMemo(() => {
    const b = birthFrom(birth);
    return b ? moneyCode(b) : null;
  }, [birth]);

  const meta = { single: t.single, four: t.four, unreduced: t.unreduced } as const;

  return (
    <div data-testid="tool-money-code" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="max-w-xs">
          <Field id="money-birth" type="date" label={t.birth} value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        {/* Avertismentul stă deasupra rezultatului, nu sub el: e citit înainte de cod. */}
        <p className="max-w-prose border-t border-tension pt-3 text-sm leading-relaxed text-foreground/85">{t.pin}</p>
        {r && (
          <>
            <div className="border-t border-line pt-4">
              <p className="text-xs text-muted-foreground">{t.codeTitle}</p>
              <p className="num mt-1 text-4xl tracking-[0.2em] text-primary">{r.fourDigit.code}</p>
              <p className="num mt-1 text-xs text-muted-foreground">{r.unreducedFourth.code}</p>
            </div>
            <SchoolsCompare
              rows={r.compared.models.map((m) => ({
                id: m.id,
                ...meta[m.id as keyof typeof meta],
                value: m.value,
                steps: m.steps,
              }))}
              pairs={r.compared.pairs}
              verdict={r.compared.verdict}
              spread={r.compared.spread}
            />
            <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
              {r.fourthEqualsSingle ? t.same : t.differ}
            </p>
          </>
        )}
      </ToolBlock>
    </div>
  );
};

export default MoneyCodeTool;
