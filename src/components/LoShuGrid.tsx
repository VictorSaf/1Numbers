import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDelayClass } from "@/components/design-system";
import {
  generateLoShuGrid,
  LO_SHU_GRID_LAYOUT,
  LO_SHU_NUMBER_MEANINGS,
  NUMBER_REMEDIES,
  type LoShuGridResult,
  type NumberRemedy,
} from "@/lib/loShuGrid";
import { ChevronDown, ChevronUp, Gem, Palette, Calendar, Sparkles, AlertTriangle, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LoShuGridProps {
  birthDate: Date;
  delay?: number;
}

export const LoShuGrid = ({ birthDate, delay = 0 }: LoShuGridProps) => {
  const { language } = useLanguage();
  const [showRemedies, setShowRemedies] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const result = useMemo(() => generateLoShuGrid(birthDate), [birthDate]);

  const labels = {
    title: {
      ro: "Grila Lo Shu",
      en: "Lo Shu Grid",
      ru: "Сетка Ло Шу",
    },
    subtitle: {
      ro: "Analiza numerologiei chinezești bazată pe data nașterii",
      en: "Chinese numerology analysis based on birth date",
      ru: "Анализ китайской нумерологии на основе даты рождения",
    },
    presentNumbers: {
      ro: "Numere Prezente",
      en: "Present Numbers",
      ru: "Присутствующие Числа",
    },
    missingNumbers: {
      ro: "Numere Lipsă",
      en: "Missing Numbers",
      ru: "Отсутствующие Числа",
    },
    repeatedNumbers: {
      ro: "Numere Repetate",
      en: "Repeated Numbers",
      ru: "Повторяющиеся Числа",
    },
    planes: {
      ro: "Plane",
      en: "Planes",
      ru: "Планы",
    },
    arrows: {
      ro: "Săgeți și Combinații",
      en: "Arrows & Combinations",
      ru: "Стрелы и Комбинации",
    },
    remedies: {
      ro: "Remedii",
      en: "Remedies",
      ru: "Средства",
    },
    strengths: {
      ro: "Puncte Forte",
      en: "Strengths",
      ru: "Сильные Стороны",
    },
    weaknesses: {
      ro: "Provocări",
      en: "Challenges",
      ru: "Вызовы",
    },
    recommendations: {
      ro: "Recomandări",
      en: "Recommendations",
      ru: "Рекомендации",
    },
    showRemedies: {
      ro: "Arată Remediile",
      en: "Show Remedies",
      ru: "Показать Средства",
    },
    hideRemedies: {
      ro: "Ascunde Remediile",
      en: "Hide Remedies",
      ru: "Скрыть Средства",
    },
    showArrows: {
      ro: "Arată Săgeți",
      en: "Show Arrows",
      ru: "Показать Стрелы",
    },
    hideArrows: {
      ro: "Ascunde Săgeți",
      en: "Hide Arrows",
      ru: "Скрыть Стрелы",
    },
    clickForDetails: {
      ro: "Click pentru detalii",
      en: "Click for details",
      ru: "Нажмите для подробностей",
    },
  };

  const planeLabels: Record<string, Record<string, string>> = {
    mental: { ro: "Mental", en: "Mental", ru: "Ментальный" },
    emotional: { ro: "Emoțional", en: "Emotional", ru: "Эмоциональный" },
    practical: { ro: "Practic", en: "Practical", ru: "Практический" },
    thought: { ro: "Gândire", en: "Thought", ru: "Мышление" },
    will: { ro: "Voință", en: "Will", ru: "Воля" },
    action: { ro: "Acțiune", en: "Action", ru: "Действие" },
  };

  const strengthLabels: Record<string, Record<string, string>> = {
    empty: { ro: "Gol", en: "Empty", ru: "Пустой" },
    weak: { ro: "Slab", en: "Weak", ru: "Слабый" },
    balanced: { ro: "Echilibrat", en: "Balanced", ru: "Сбалансированный" },
    strong: { ro: "Puternic", en: "Strong", ru: "Сильный" },
    dominant: { ro: "Dominant", en: "Dominant", ru: "Доминирующий" },
  };

  return (
    <div
      className={cn(
        "space-y-6 opacity-0 animate-fade-in",
        getDelayClass(delay)
      )}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-raleway text-primary">
            {labels.title[language]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {labels.subtitle[language]}
        </p>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Grid Visualization */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <TooltipProvider>
            <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              {LO_SHU_GRID_LAYOUT.map((row, rowIndex) =>
                row.map((num, colIndex) => {
                  const count = result.grid[rowIndex][colIndex];
                  const isSelected = selectedNumber === num;
                  const isMissing = count === 0;
                  const isRepeated = count > 1;
                  const numberMeaning = LO_SHU_NUMBER_MEANINGS[num];

                  return (
                    <Tooltip key={`${rowIndex}-${colIndex}`}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedNumber(isSelected ? null : num)}
                          className={cn(
                            "w-16 h-16 md:w-20 md:h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-300",
                            "hover:scale-105 cursor-pointer",
                            isMissing && "bg-muted/30 border border-dashed border-border/50",
                            !isMissing && !isRepeated && "bg-primary/10 border border-primary/30",
                            isRepeated && "bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50",
                            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )}
                        >
                          <span
                            className={cn(
                              "font-cinzel text-2xl md:text-3xl",
                              isMissing && "text-muted-foreground/50",
                              !isMissing && "text-primary",
                              isRepeated && "text-gradient-gold"
                            )}
                          >
                            {num}
                          </span>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ×{count}
                            </span>
                          )}
                          {isMissing && (
                            <span className="text-[10px] text-muted-foreground/50">-</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{numberMeaning[language].title}</p>
                          <p className="text-xs text-muted-foreground">
                            {numberMeaning[language].description}
                          </p>
                          <p className="text-xs text-primary">
                            {numberMeaning[language].energy}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}
            </div>
          </TooltipProvider>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {labels.clickForDetails[language]}
          </p>
        </div>

        {/* Analysis Section */}
        <div className="flex-1 space-y-4">
          {/* Present & Missing Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Present Numbers */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {labels.presentNumbers[language]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.presentNumbers.map((num) => (
                  <span
                    key={num}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    )}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Numbers */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {labels.missingNumbers[language]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingNumbers.length > 0 ? (
                  result.missingNumbers.map((num) => (
                    <span
                      key={num}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {num}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {language === "ro"
                      ? "Toate numerele sunt prezente!"
                      : language === "ru"
                      ? "Все числа присутствуют!"
                      : "All numbers are present!"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Repeated Numbers */}
          {result.repeatedNumbers.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                {labels.repeatedNumbers[language]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.repeatedNumbers.map(({ number, count }) => (
                  <span
                    key={number}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-700 dark:text-purple-300"
                  >
                    {number} × {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Planes */}
          <div className="p-4 rounded-xl bg-card/50 border border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">
              {labels.planes[language]}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {result.planes.map((plane) => (
                <div
                  key={plane.type}
                  className={cn(
                    "p-2 rounded-lg text-xs",
                    plane.strength === "empty" && "bg-muted/30 text-muted-foreground",
                    plane.strength === "weak" && "bg-amber-500/10 text-amber-600",
                    plane.strength === "balanced" && "bg-blue-500/10 text-blue-600",
                    plane.strength === "strong" && "bg-emerald-500/10 text-emerald-600",
                    plane.strength === "dominant" && "bg-purple-500/10 text-purple-600"
                  )}
                >
                  <div className="font-medium">
                    {planeLabels[plane.type][language]}
                  </div>
                  <div className="text-[10px] opacity-80">
                    {strengthLabels[plane.strength][language]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArrows(!showArrows)}
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          {showArrows ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              {labels.hideArrows[language]}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              {labels.showArrows[language]}
            </>
          )}
        </Button>

        {result.missingNumbers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRemedies(!showRemedies)}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            {showRemedies ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                {labels.hideRemedies[language]}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                {labels.showRemedies[language]}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Arrows Section */}
      {showArrows && result.arrows.length > 0 && (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            {labels.arrows[language]}
          </h4>
          <div className="space-y-3">
            {result.arrows.map((arrow, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg",
                  arrow.direction === "positive"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-amber-500/10 border border-amber-500/20"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      arrow.direction === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {arrow.numbers.join(" - ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {arrow.meaning[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remedies Section */}
      {showRemedies && result.missingNumbers.length > 0 && (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Gem className="h-4 w-4 text-primary" />
            {labels.remedies[language]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.missingNumbers.map((num) => {
              const remedy = NUMBER_REMEDIES[num];
              if (!remedy) return null;

              return (
                <RemedyCard key={num} remedy={remedy} language={language} />
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {result.analysis.strengths[language].length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
              {labels.strengths[language]}
            </h4>
            <ul className="space-y-1">
              {result.analysis.strengths[language].map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {result.analysis.weaknesses[language].length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
              {labels.weaknesses[language]}
            </h4>
            <ul className="space-y-1">
              {result.analysis.weaknesses[language].map((weakness, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-1">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Remedy Card Component
interface RemedyCardProps {
  remedy: NumberRemedy;
  language: "ro" | "en" | "ru";
}

const RemedyCard = ({ remedy, language }: RemedyCardProps) => {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-cinzel text-lg text-primary">
          {remedy.number}
        </span>
        <div>
          <p className="text-sm font-medium">
            {language === "ro"
              ? `Remediu pentru ${remedy.number}`
              : language === "ru"
              ? `Средство для ${remedy.number}`
              : `Remedy for ${remedy.number}`}
          </p>
          <p className="text-xs text-muted-foreground">{remedy.element}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Colors */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Palette className="h-3 w-3" />
            <span>
              {language === "ro" ? "Culori" : language === "ru" ? "Цвета" : "Colors"}
            </span>
          </div>
          <div className="flex gap-1">
            {remedy.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full border border-border/50"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Gemstones */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Gem className="h-3 w-3" />
            <span>
              {language === "ro" ? "Pietre" : language === "ru" ? "Камни" : "Gemstones"}
            </span>
          </div>
          <div className="text-foreground">
            {remedy.gemstones[language].join(", ")}
          </div>
        </div>

        {/* Favorable Days */}
        <div className="col-span-2 space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {language === "ro"
                ? "Zile favorabile"
                : language === "ru"
                ? "Благоприятные дни"
                : "Favorable days"}
            </span>
          </div>
          <div className="text-foreground">
            {remedy.favorableDays[language].join(", ")}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{remedy.description[language]}</p>
    </div>
  );
};

export default LoShuGrid;
