import { lazy, Suspense, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeIndividualLetters } from "@/lib/nameAnalysis";

const LetterAnalysisChart = lazy(() =>
  import("../charts/LetterAnalysisChart").then((m) => ({ default: m.LetterAnalysisChart })),
);

const ChartSkeleton = () => (
  <div className="h-48 animate-pulse rounded border border-line bg-sunken" />
);

/**
 * The inclusion table, drawn, plus the letters it was counted from.
 *
 * This replaces NameAnalysisCard, which held five things and only two of them
 * were its own:
 *
 *   - the letter chart, kept here -- it is the number distribution with the
 *     vowel and consonant split added, so it strictly supersedes the plain
 *     distribution chart that used to sit beside it;
 *   - the letter grid, kept here;
 *   - a Soul Urge and Personality reading, which chapter 1 already gives from
 *     the engine. Two answers to one question, on one page;
 *   - "hidden numbers", which is the Hidden Passion counted a second way, and
 *     chapter 3 already shows the engine's;
 *   - name optimisation suggestions, which is a tool rather than a reading, and
 *     /unelte already has one.
 */
export const LetterMap = ({ fullName }: { fullName: string }) => {
  const { t, language } = useLanguage();
  const [showLetters, setShowLetters] = useState(false);
  const letters = useMemo(() => analyzeIndividualLetters(fullName), [fullName]);

  const l = t.nameAnalysis;
  const labels = {
    ro: { show: "Arată fiecare literă", hide: "Ascunde literele", value: "Valoare" },
    en: { show: "Show every letter", hide: "Hide the letters", value: "Value" },
    ru: { show: "Показать каждую букву", hide: "Скрыть буквы", value: "Значение" },
  }[language as "ro" | "en" | "ru"] ?? { show: "Show every letter", hide: "Hide the letters", value: "Value" };

  return (
    <div className="space-y-4">
      <Suspense fallback={<ChartSkeleton />}>
        <LetterAnalysisChart name={fullName} />
      </Suspense>

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLetters((v) => !v)}
          aria-expanded={showLetters}
          className="gap-2 text-muted-foreground"
        >
          {showLetters ? labels.hide : labels.show}
          <ChevronDown className={cn("h-4 w-4 transition-transform", showLetters && "rotate-180")} />
        </Button>

        {showLetters && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {letters.map((letter, i) => (
              <div
                key={`${letter.letter}-${i}`}
                className="border-t border-line pt-2 text-center"
              >
                <div className="num text-lg text-primary">{letter.letter}</div>
                <div className="num text-xs text-muted-foreground">
                  {labels.value} {letter.value}
                </div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {letter.isVowel ? l.vowel : l.consonant}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
