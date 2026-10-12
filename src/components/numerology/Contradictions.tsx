import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { fullPythagoreanProfile } from "@/lib/numerology-plus/pythagorean";
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

type PythagoreanProfile = ReturnType<typeof fullPythagoreanProfile>;

interface ContradictionsProps {
  /** Profilul pitagoreic, calculat o dată de pagina de rezultate. */
  profile: PythagoreanProfile;
}

const Contradictions = ({ profile }: ContradictionsProps) => {
  const { language } = useLanguage();

  const found = useMemo(() => contradictions(profile, language), [profile, language]);

  return (
    <div>
      {found.map((c) => (
        <article key={c.key} className="flex items-start gap-5 border-b border-line py-5 sm:gap-7">
          {/* Distanța e cifra, nu o notiță din colț: ea e chiar subiectul.
              O distanță de 6 nu e o eroare -- de-aia stă în tensiune, nu în
              culoarea de alarmă. */}
          <span
            className="num w-14 shrink-0 text-right text-4xl leading-[0.86] text-tension sm:w-[88px] sm:text-5xl"
            aria-label={`${c.label}: ${c.distance}`}
          >
            {c.distance}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading text-lg text-foreground sm:text-xl">{c.label}</h4>
            <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-foreground/85">{c.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
};

// Default export so React.lazy can pick it up without a wrapper.
export default Contradictions;
