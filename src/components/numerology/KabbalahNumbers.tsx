import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { popularKabbalah, hebrewGematria } from "@/lib/numerology-plus/systems";

/**
 * Two systems that share a name and nothing else.
 *
 * popularKabbalah is a modern mod-9 scheme sold under the word "Kabbalah";
 * hebrewGematria is the traditional 1-400 table applied to a transliteration of
 * the name. Showing either alone would be fine; showing both without saying they
 * are unrelated would invite the reader to treat two numbers as two
 * confirmations of one thing, which is the failure mode this block exists to
 * avoid.
 *
 * The engine ships a `disclaimer` string on popularKabbalah, but in Romanian
 * only, and the engine is read-only -- so the warning is written here, in all
 * three languages, and applies to the pair rather than to one half of it.
 */

type Lang = "ro" | "en" | "ru";

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    popularTitle: "Kabbalah populară (mod-9)",
    popularNote: "Literele se numără ciclic, 1–9, iar totalul se ia modulo 9. E varianta care circulă pe piață.",
    hebrewTitle: "Gematria ebraică",
    hebrewNote: "Numele transliterat în alfabet ebraic, cu valorile clasice 1–400. Tradiția nu reduce totalul; îl arătăm și redus, doar ca punct de comparație.",
    total: "Total", value: "Valoare", reduced: "Redus", translit: "Transliterare",
    warning: "Cele două nu au nicio legătură între ele. Prima e o schemă modernă de piață, a doua e gematria tradițională. Nu le citi ca pe două confirmări ale aceluiași lucru.",
    translitNote: "Transliterarea latină → ebraică e aproximativă: unele sunete latine nu au corespondent exact.",
  },
  en: {
    popularTitle: "Popular Kabbalah (mod-9)",
    popularNote: "Letters are numbered cyclically 1–9 and the total is taken modulo 9. This is the version that circulates on the market.",
    hebrewTitle: "Hebrew gematria",
    hebrewNote: "The name transliterated into the Hebrew alphabet, with the classical values 1–400. Tradition does not reduce the total; the reduction is shown only as a point of comparison.",
    total: "Total", value: "Value", reduced: "Reduced", translit: "Transliteration",
    warning: "The two have nothing to do with each other. The first is a modern market scheme, the second is traditional gematria. Do not read them as two confirmations of the same thing.",
    translitNote: "The Latin-to-Hebrew transliteration is approximate: some Latin sounds have no exact counterpart.",
  },
  ru: {
    popularTitle: "Популярная каббала (мод-9)",
    popularNote: "Буквы нумеруются циклически 1–9, а сумма берётся по модулю 9. Это вариант, который ходит по рынку.",
    hebrewTitle: "Еврейская гематрия",
    hebrewNote: "Имя, транслитерированное в еврейский алфавит, с классическими значениями 1–400. Традиция не сводит сумму; свёрнутое число показано лишь для сравнения.",
    total: "Сумма", value: "Значение", reduced: "Свёрнуто", translit: "Транслитерация",
    warning: "Эти две системы никак не связаны. Первая — современная рыночная схема, вторая — традиционная гематрия. Не читайте их как два подтверждения одного и того же.",
    translitNote: "Транслитерация с латиницы на иврит приблизительна: у некоторых латинских звуков нет точного соответствия.",
  },
};

interface KabbalahNumbersProps {
  fullName: string;
}

export const KabbalahNumbers = ({ fullName }: KabbalahNumbersProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const { popular, hebrew } = useMemo(
    () => ({ popular: popularKabbalah(fullName), hebrew: hebrewGematria(fullName) }),
    [fullName],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-line bg-surface/60 p-4">
          <h4 className="font-heading text-base text-foreground">{l.popularTitle}</h4>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="block text-xs text-muted-foreground">{l.total}</span>
              <span className="num text-2xl text-ink-2" data-figure="popular-total">{popular.total}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">{l.value}</span>
              <span className="num text-3xl text-primary" data-figure="popular-value">{popular.value}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{l.popularNote}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-line bg-surface/60 p-4">
          <h4 className="font-heading text-base text-foreground">{l.hebrewTitle}</h4>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="block text-xs text-muted-foreground">{l.total}</span>
              <span className="num text-3xl text-primary" data-figure="hebrew-total">{hebrew.total}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">{l.reduced}</span>
              <span className="num text-2xl text-ink-2" data-figure="hebrew-reduced">{hebrew.reduced}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">{l.translit}</span>
            <span
              dir="rtl"
              lang="he"
              className="block text-xl text-foreground"
              data-figure="hebrew-letters"
            >
              {hebrew.hebrew}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{l.hebrewNote}</p>
          <p className="text-xs text-faint">{l.translitNote}</p>
        </div>
      </div>

      <p className="rounded-lg bg-warn-soft/60 p-3 text-sm text-foreground/90">{l.warning}</p>
    </div>
  );
};
