import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { PROFILE_CATEGORIES, type ProfileCategory } from "@/lib/profileCategories";

/**
 * Filtrele. Se arată numai categoriile care au hărți: un filtru cu zero în el
 * ocupă un rând ca să nu spună nimic.
 *
 * Gramatica e a filelor -- etichetă cu filet dedesubt. Butoane pline și
 * conturate unul lângă altul spuneau „apasă-mă" de patru ori într-un rând
 * care doar filtrează o listă.
 */

const FILTER =
  "num flex min-h-11 items-center border-b-2 px-1 pb-1 text-[0.68rem] uppercase tracking-[0.14em] transition-colors";
const FILTER_ON = "border-gilt text-gilt";
const FILTER_OFF = "border-transparent text-muted-foreground hover:border-line hover:text-foreground";

interface PeopleFilterProps {
  selected: ProfileCategory | null;
  counts: Record<ProfileCategory, number>;
  onSelect: (category: ProfileCategory | null) => void;
}

export const PeopleFilter = ({ selected, counts, onSelect }: PeopleFilterProps) => {
  const { t } = useLanguage();
  const total = PROFILE_CATEGORIES.reduce((sum, category) => sum + counts[category], 0);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className={cn(FILTER, selected === null ? FILTER_ON : FILTER_OFF)}
      >
        {t.people.all} <span className="ml-2 opacity-70">{total}</span>
      </button>

      {PROFILE_CATEGORIES.filter((category) => counts[category] > 0).map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className={cn(FILTER, selected === category ? FILTER_ON : FILTER_OFF)}
        >
          {t.people.categories[category]} <span className="ml-2 opacity-70">{counts[category]}</span>
        </button>
      ))}
    </div>
  );
};
