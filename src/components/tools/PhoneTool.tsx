import { useMemo, useState } from "react";
import { phoneSchools, type PhoneSchoolId, type Relation, type VedicFit } from "@/lib/tools/phone";
import { Field, SchoolsCompare, ToolBlock } from "./SchoolsCompare";
import { birthFrom, useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; number: string; birth: string; birthHint: string;
  schools: Record<PhoneSchoolId, { label: string; method: string }>;
  chinese: string; chineseLede: string; score: string;
  owner: string; ownerLede: string; lifePath: string; mulank: string; bhagyank: string;
  distanceLp: string; rel: Record<Relation, string>; fit: Record<VedicFit, string>;
}> = {
  ro: {
    title: "Numărul de telefon",
    lede: "Trei practici citesc același număr din locuri diferite: toate cifrele, ultimele patru, ultima.",
    number: "Numărul", birth: "Data nașterii proprietarului (opțional)",
    birthHint: "Cu ea, fiecare citire se pune lângă tine — pitagoreic și vedic.",
    schools: {
      full: { label: "Toate cifrele", method: "Pitagoreic; și verificarea principală în practica vedică." },
      last4: { label: "Ultimele patru", method: "Practică vedică răspândită — alte surse o numesc mit." },
      last1: { label: "Ultima cifră", method: "Citirea scurtă din aplicații." },
    },
    chinese: "Homofonele chinezești",
    chineseLede: "Altă scară: 4 sună a „moarte”, 8 a „prosperitate”, 168 a „prosperitate tot drumul”. Nu se reduce, deci nu are distanță față de cifrele de mai sus.",
    score: "scor",
    owner: "Față de tine",
    ownerLede: "Pitagoreicul măsoară distanța până la Drumul Vieții. Vedicul întreabă dacă numărul e prieten, neutru sau dușman pentru Mulank și Bhagyank. Pot spune lucruri diferite despre același număr.",
    lifePath: "Drumul Vieții", mulank: "Mulank", bhagyank: "Bhagyank",
    distanceLp: "distanța față de DV",
    rel: { friend: "prieten", neutral: "neutru", enemy: "dușman" },
    fit: { good: "vedic: favorabil", mixed: "vedic: amestecat", neutral: "vedic: neutru", avoid: "vedic: de evitat" },
  },
  en: {
    title: "Phone number",
    lede: "Three practices read the same number from different places: all digits, the last four, the last one.",
    number: "Number", birth: "Owner's birth date (optional)",
    birthHint: "With it, each reading is set beside you — Pythagorean and Vedic.",
    schools: {
      full: { label: "All digits", method: "Pythagorean; also the main check in Vedic practice." },
      last4: { label: "Last four", method: "A common Vedic practice — other sources call it a myth." },
      last1: { label: "Last digit", method: "The short reading apps use." },
    },
    chinese: "Chinese homophones",
    chineseLede: "A different scale: 4 sounds like \"death\", 8 like \"prosperity\", 168 like \"prosperity all the way\". Nothing is reduced, so it has no distance to the digits above.",
    score: "score",
    owner: "Against you",
    ownerLede: "The Pythagorean reading measures the distance to your Life Path. The Vedic one asks whether the number is a friend, neutral or enemy of your Mulank and Bhagyank. They can say different things about the same number.",
    lifePath: "Life Path", mulank: "Mulank", bhagyank: "Bhagyank",
    distanceLp: "distance to LP",
    rel: { friend: "friend", neutral: "neutral", enemy: "enemy" },
    fit: { good: "Vedic: favourable", mixed: "Vedic: mixed", neutral: "Vedic: neutral", avoid: "Vedic: avoid" },
  },
  ru: {
    title: "Номер телефона",
    lede: "Три практики читают один номер с разных мест: все цифры, последние четыре, последнюю.",
    number: "Номер", birth: "Дата рождения владельца (необязательно)",
    birthHint: "С ней каждое прочтение ставится рядом с вами — по-пифагорейски и по-ведически.",
    schools: {
      full: { label: "Все цифры", method: "Пифагорейская; и главная проверка в ведической практике." },
      last4: { label: "Последние четыре", method: "Распространённая ведическая практика — другие источники называют её мифом." },
      last1: { label: "Последняя цифра", method: "Краткое прочтение из приложений." },
    },
    chinese: "Китайские омофоны",
    chineseLede: "Другая шкала: 4 звучит как «смерть», 8 — как «процветание», 168 — «процветание всю дорогу». Ничего не сводится, поэтому расстояния до цифр выше нет.",
    score: "балл",
    owner: "Относительно вас",
    ownerLede: "Пифагорейская мерит расстояние до Числа жизненного пути. Ведическая спрашивает, друг ли номер, нейтрален или враг для Муланка и Бхагьянка. Они могут говорить разное об одном номере.",
    lifePath: "Жизненный путь", mulank: "Муланк", bhagyank: "Бхагьянк",
    distanceLp: "расстояние до ЖП",
    rel: { friend: "друг", neutral: "нейтрален", enemy: "враг" },
    fit: { good: "ведич.: благоприятно", mixed: "ведич.: смешанно", neutral: "ведич.: нейтрально", avoid: "ведич.: избегать" },
  },
};

const FIT_TONE: Record<VedicFit, string> = {
  good: "border-harmony",
  mixed: "border-line",
  neutral: "border-line",
  avoid: "border-tension",
};

const PhoneTool = ({ defaultBirthDate = "" }: { defaultBirthDate?: string }) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState(defaultBirthDate);

  const r = useMemo(
    () => (/\d/.test(phone) ? phoneSchools(phone, birthFrom(birth) ?? undefined) : null),
    [phone, birth],
  );

  return (
    <div data-testid="tool-phone" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone-number" label={t.number} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+40 7xx xxx xxx" />
          <Field id="phone-birth" type="date" label={t.birth} hint={t.birthHint} value={birth} onChange={(e) => setBirth(e.target.value)} />
        </div>
        {r && (
          <SchoolsCompare
            rows={r.models.map((m) => ({ id: m.id, ...t.schools[m.id], value: m.value, steps: m.steps }))}
            pairs={r.pairs}
            verdict={r.verdict}
            spread={r.spread}
          />
        )}
      </ToolBlock>

      {r?.owner && (
        <ToolBlock title={t.owner} lede={t.ownerLede}>
          <p data-owner className="num text-sm text-foreground/85">
            {t.lifePath} {r.owner.lifePath} · {t.mulank} {r.owner.mulank} · {t.bhagyank} {r.owner.bhagyank}
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {r.owner.rows.map((row) => (
              <div key={row.id} className={`border-t pt-4 ${FIT_TONE[row.vedic]}`}>
                <div className="flex items-baseline gap-3">
                  <span className="num text-2xl text-primary">{row.value}</span>
                  <span className="text-sm text-foreground/90">{t.schools[row.id].label}</span>
                </div>
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <li>
                    {t.distanceLp} <span className="num">{row.lifePathDistance}</span>
                  </li>
                  <li>
                    {t.mulank}: {t.rel[row.withMulank]} · {t.bhagyank}: {t.rel[row.withBhagyank]}
                  </li>
                  <li className="text-foreground/85">{t.fit[row.vedic]}</li>
                </ul>
              </div>
            ))}
          </div>
        </ToolBlock>
      )}

      {r && (
        <ToolBlock title={t.chinese} lede={t.chineseLede}>
          <p className="num text-sm text-foreground/85">
            {t.score} {r.homophone.score} · {r.homophone.normalized}/100
            {r.homophone.sequences.length > 0 && ` · ${r.homophone.sequences.map((s) => s.seq).join(", ")}`}
          </p>
        </ToolBlock>
      )}
    </div>
  );
};

export default PhoneTool;
