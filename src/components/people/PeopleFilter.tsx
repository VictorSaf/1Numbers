import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PROFILE_CATEGORIES, type ProfileCategory } from "@/lib/profileCategories";

/**
 * Chip-urile de filtrare. Se arată numai categoriile care au hărți: un chip cu
 * zero în el ocupă un rând ca să nu spună nimic.
 */

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
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className="font-raleway"
      >
        {t.people.all} <span className="num ml-2">{total}</span>
      </Button>

      {PROFILE_CATEGORIES.filter((category) => counts[category] > 0).map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className="font-raleway"
        >
          {t.people.categories[category]} <span className="num ml-2">{counts[category]}</span>
        </Button>
      ))}
    </div>
  );
};
