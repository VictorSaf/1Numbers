import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretProfile } from "@/lib/numerology-plus/content/interpret";
import { NumberCard } from "./NumberCard";

/**
 * The fourteen numbers the engine adds beyond the core five.
 *
 * This module is the only thing that pulls in the engine's content layer --
 * archetypes, frames and arcana together run to well over a thousand lines of
 * copy in three languages. It is loaded lazily by the results page so the main
 * bundle carries none of it until someone actually asks for a reading.
 */

interface NewNumbersProps {
  fullName: string;
  birthDate: Date;
}

const NewNumbers = ({ fullName, birthDate }: NewNumbersProps) => {
  const { language } = useLanguage();

  const cards = useMemo(() => {
    const profile = fullProfile(fullName, {
      day: birthDate.getDate(),
      month: birthDate.getMonth() + 1,
      year: birthDate.getFullYear(),
    });
    const extended = profile.pythagorean.extended as Record<
      string,
      { raw?: number; value?: number; isMaster?: boolean; karmicDebt?: number | null }
    >;

    return interpretProfile(profile.pythagorean, language).map((interpretation) => {
      // Not every interpretation maps to a NumResult: subconsciousSelf and the
      // bridges are plain integers. Only the ones that do carry a raw total can
      // show where the value came from.
      const source = extended[interpretation.key];
      return {
        interpretation,
        raw: typeof source?.raw === "number" ? source.raw : undefined,
        karmicDebt: source?.karmicDebt ?? null,
        isMaster: source?.isMaster ?? false,
      };
    });
  }, [fullName, birthDate, language]);

  return (
    <div className="grid gap-3">
      {cards.map(({ interpretation, raw, karmicDebt, isMaster }) => (
        <NumberCard
          key={interpretation.key}
          interpretation={interpretation}
          raw={raw}
          karmicDebt={karmicDebt}
          isMaster={isMaster}
        />
      ))}
    </div>
  );
};

// Default export so React.lazy can pick it up without a wrapper.
export default NewNumbers;
