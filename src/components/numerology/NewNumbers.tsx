import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretProfile } from "@/lib/numerology-plus/content/interpret";
import { NumberCard } from "./NumberCard";

/**
 * The fourteen numbers the engine adds beyond the core five.
 *
 * This module and LetterStones are the only things that pull in the engine's
 * content layer -- archetypes, frames and arcana together run to well over a
 * thousand lines of copy in three languages. Both are loaded lazily by the
 * results page so the main bundle carries none of it until someone actually
 * asks for a reading.
 */

interface NewNumbersProps {
  fullName: string;
  birthDate: Date;
  /**
   * Which interpretations to render, in this order.
   *
   * The eleven used to arrive as one undifferentiated list under "The New
   * Numbers", which is why a reader had no way to tell that the two bridges
   * answer a different question from the inclusion table. The reading now
   * distributes them across its chapters, and each chapter asks for its own.
   */
  keys: readonly string[];
}

const NewNumbers = ({ fullName, birthDate, keys }: NewNumbersProps) => {
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

    const byKey = new Map(
      interpretProfile(profile.pythagorean, language).map((i) => [i.key, i]),
    );

    return keys.flatMap((key) => {
      const interpretation = byKey.get(key);
      if (!interpretation) return [];
      // Not every interpretation maps to a NumResult: subconsciousSelf and the
      // bridges are plain integers. Only the ones that do carry a raw total can
      // show where the value came from.
      const source = extended[interpretation.key];
      return [{
        interpretation,
        raw: typeof source?.raw === "number" ? source.raw : undefined,
        karmicDebt: source?.karmicDebt ?? null,
        isMaster: source?.isMaster ?? false,
      }];
    });
  }, [fullName, birthDate, language, keys]);

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
