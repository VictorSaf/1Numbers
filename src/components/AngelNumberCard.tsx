import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { AngelNumberMeaning } from "@/lib/angelNumbers";
import { ChevronDown, ChevronUp, Sparkles, MessageCircle, Lightbulb, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AngelNumberCardProps {
  meaning: AngelNumberMeaning;
  expanded?: boolean;
  onToggle?: () => void;
}

export const AngelNumberCard = ({
  meaning,
  expanded = false,
  onToggle,
}: AngelNumberCardProps) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const frequencyLabels = {
    common: { ro: "Frecvent", en: "Common", ru: "Частый" },
    uncommon: { ro: "Mai rar", en: "Uncommon", ru: "Редкий" },
    rare: { ro: "Foarte rar", en: "Rare", ru: "Очень редкий" },
  };

  const frequencyColors = {
    common: "bg-green-500/20 text-green-600 dark:text-green-400",
    uncommon: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    rare: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  };

  const sectionLabels = {
    meaning: { ro: "Semnificație", en: "Meaning", ru: "Значение" },
    spiritual: { ro: "Spiritualitate", en: "Spirituality", ru: "Духовность" },
    action: { ro: "Sfaturi", en: "Advice", ru: "Советы" },
    related: { ro: "Numere conexe", en: "Related Numbers", ru: "Связанные числа" },
  };

  return (
    <div className="card-mystic rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-start gap-4">
          {/* Number Display */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
              <span className="font-cinzel text-2xl text-gradient-gold">
                {meaning.number}
              </span>
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400" />
          </div>

          {/* Title and Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cinzel text-lg text-foreground truncate">
                {meaning.title[language]}
              </h3>
              <Badge className={cn("text-[10px]", frequencyColors[meaning.frequency])}>
                {frequencyLabels[meaning.frequency][language]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meaning.shortMessage[language]}
            </p>
          </div>

          {/* Expand/Collapse */}
          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {meaning.keywords[language].map((keyword, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border/30 pt-4">
          {/* Full Meaning */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {sectionLabels.meaning[language]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {meaning.fullMeaning[language]}
            </p>
          </div>

          {/* Spiritual Significance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                {sectionLabels.spiritual[language]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {meaning.spiritualSignificance[language]}
            </p>
          </div>

          {/* Action Advice */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">
                {sectionLabels.action[language]}
              </span>
            </div>
            <ul className="space-y-1.5">
              {meaning.actionAdvice[language].map((advice, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Numbers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Link className="h-4 w-4" />
              <span className="text-sm font-medium">
                {sectionLabels.related[language]}
              </span>
            </div>
            <div className="flex gap-2">
              {meaning.relatedNumbers.map((num) => (
                <span
                  key={num}
                  className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact display for search results
interface AngelNumberCompactProps {
  meaning: AngelNumberMeaning;
  onClick?: () => void;
}

export const AngelNumberCompact = ({
  meaning,
  onClick,
}: AngelNumberCompactProps) => {
  const { language } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="font-cinzel text-xl text-primary">{meaning.number}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">
            {meaning.title[language]}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {meaning.shortMessage[language]}
          </p>
        </div>
      </div>
    </button>
  );
};

export default AngelNumberCard;
