import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { reduceToSingleDigit } from "@/lib/numerology";
import { useState } from "react";
import { ChevronDown, ChevronUp, Briefcase, Heart, Lightbulb, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDelayClass } from "@/components/design-system";
import { ResolveNumber } from "@/components/numerology/ResolveNumber";

interface NumberCardProps {
  title: string;
  number: number;
  /**
   * The unreduced total this number came from, when the caller has it. Only
   * used to replay the reduction; the displayed value is always `number`.
   */
  raw?: number;
  /** Play that replay. Off everywhere except the first reading a visitor sees. */
  resolve?: boolean;
  delay?: number;
  isMain?: boolean;
  showDetails?: boolean;
}

export const NumberCard = ({ title, number, raw, resolve = false, delay = 0, isMain = false, showDetails = true }: NumberCardProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const meaningKey = number as keyof typeof t.meanings;
  const meaning = t.meanings[meaningKey] || t.meanings[reduceToSingleDigit(number, false) as keyof typeof t.meanings];
  
  const hasDetailedInfo = meaning && 'strengths' in meaning;
  
  return (
    <div
      className={cn(
        "card-mystic rounded-xl p-6 opacity-0 animate-fade-in",
        isMain && "col-span-full lg:col-span-2",
        getDelayClass(delay)
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] text-primary/70 font-raleway">
          {title}
        </span>
        
        <div className={cn("number-display", isMain && "number-display-large")}>
          <ResolveNumber value={number} raw={raw} play={resolve} />
        </div>
        
        <h3 className="font-heading text-xl text-foreground">
          {meaning.title}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-2">
          {meaning.traits.map((trait, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {trait}
            </span>
          ))}
        </div>
        
        {/* The number's own reading. A second paragraph used to sit above this
            one -- t.lifePathDesc and its four siblings -- describing what a Life
            Path *is*, identical for every visitor, placed above the sentence
            that was actually about them. */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {meaning.description}
        </p>

        {/* Expandable Detailed Section */}
        {showDetails && hasDetailedInfo && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  {t.adviceLabel ? 'Ascunde detalii' : 'Hide details'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {t.adviceLabel || 'Sfaturi Personalizate'}
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="w-full space-y-4 pt-4 border-t border-border/30 animate-fade-in text-left">
                {/* Strengths */}
                {'strengths' in meaning && meaning.strengths && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-ok">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.strengthsLabel || 'Puncte Forte'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(meaning.strengths as string[]).map((strength, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-md bg-ok/10 text-ok border border-ok/20"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges */}
                {'challenges' in meaning && meaning.challenges && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-warn">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.challengesLabel || 'Provocări'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(meaning.challenges as string[]).map((challenge, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-md bg-warn/10 text-warn border border-warn/20"
                        >
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career */}
                {'career' in meaning && meaning.career && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-info">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.careerLabel || 'Carieră Potrivită'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(meaning.career as string[]).map((job, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-md bg-info/10 text-info border border-info/20"
                        >
                          {job}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relationships */}
                {'relationships' in meaning && meaning.relationships && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-crit">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.relationshipsLabel || 'Relații'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {meaning.relationships as string}
                    </p>
                  </div>
                )}

                {/* Personalized Advice */}
                {'advice' in meaning && meaning.advice && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.adviceLabel || 'Sfaturi Personalizate'}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {(meaning.advice as string[]).map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};