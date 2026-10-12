import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { coupleMatrix, compareModels } from "@/lib/numerology-plus/matrix";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { MatrixZoneList, ModelComparisons, matrixCopy } from "./DestinyMatrix";

/**
 * Matricea cuplului: cele două matrici adunate punct cu punct, fiecare sumă
 * redusă în ambele feluri (suma cifrelor și scăderea lui 22), cu distanța și
 * pașii. Coada cuplului apare în ambele modele publicate (Ladini, vratamir).
 *
 * Nu e încă legată de nicio pagină; /doi o va primi separat.
 */

const COPY = {
  ro: {
    title: "Matricea cuplului",
    lede: "Fiecare punct al cuplului e suma punctelor celor doi. Nu e o notă de compatibilitate: arată ce construiesc împreună și unde se împiedică.",
  },
  en: {
    title: "The couple matrix",
    lede: "Each point of the couple is the sum of the two people's points. It is not a compatibility score: it shows what they build together and where they trip.",
  },
  ru: {
    title: "Матрица пары",
    lede: "Каждая точка пары — сумма точек двоих. Это не оценка совместимости: она показывает, что они строят вместе и где спотыкаются.",
  },
};

interface CoupleMatrixProps {
  birthDateA: Date;
  birthDateB: Date;
}

const CoupleMatrix = ({ birthDateA, birthDateB }: CoupleMatrixProps) => {
  const { language } = useLanguage();
  const t = matrixCopy(language);
  const c = COPY[(language in COPY ? language : "en") as keyof typeof COPY];

  const m = useMemo(
    () => coupleMatrix(toBirthDate(birthDateA), toBirthDate(birthDateB)),
    [birthDateA, birthDateB],
  );
  const models = useMemo(() => compareModels(m.zones), [m]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-heading text-lg text-foreground">{c.title}</h3>
        <p className="text-sm text-muted-foreground">{c.lede}</p>
        <p className="text-xs text-faint">{t.zonesLede}</p>
      </div>
      <MatrixZoneList rows={m.reductions} t={t} />
      <div className="space-y-3">
        <h4 className="font-heading text-base text-foreground">{t.modelsTitle}</h4>
        <ModelComparisons comparisons={models} t={t} />
      </div>
    </section>
  );
};

export default CoupleMatrix;
