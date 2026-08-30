import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { contradictions } from "@/lib/numerology-plus/content/contradiction";

/**
 * The headline of chapter 2.
 *
 * The chapter used to open straight into five cards -- two bridges, balance,
 * rational thought, subconscious self -- each correct and each about a number
 * on its own. None of them said which two parts of the profile were arguing,
 * which is the only thing the chapter's question asks.
 *
 * Lazy for the same reason NewNumbers is: this is the engine's content layer,
 * over a thousand lines of copy in three languages.
 */

interface ContradictionsProps {
  fullName: string;
  birthDate: Date;
}

const Contradictions = ({ fullName, birthDate }: ContradictionsProps) => {
  const { language } = useLanguage();

  const found = useMemo(() => {
    const profile = fullProfile(fullName, {
      day: birthDate.getDate(),
      month: birthDate.getMonth() + 1,
      year: birthDate.getFullYear(),
    });
    return contradictions(profile.pythagorean, language);
  }, [fullName, birthDate, language]);

  return (
    <div className="space-y-4">
      {found.map((c) => (
        <article
          key={c.key}
          className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-cinzel text-base text-foreground">{c.label}</h4>
            <span
              className="num shrink-0 text-2xl text-primary"
              aria-label={`${c.label}: ${c.distance}`}
            >
              {c.distance}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">{c.text}</p>
        </article>
      ))}
    </div>
  );
};

// Default export so React.lazy can pick it up without a wrapper.
export default Contradictions;
