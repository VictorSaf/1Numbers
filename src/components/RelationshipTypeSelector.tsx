import { Heart, Users, Briefcase, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RelationshipType } from "@/lib/compatibility";
import { cn } from "@/lib/utils";

interface RelationshipTypeSelectorProps {
  selectedType: RelationshipType;
  onTypeChange: (type: RelationshipType) => void;
}

const relationshipTypes: {
  type: RelationshipType;
  icon: React.ReactNode;
  label: { ro: string; en: string; ru: string };
}[] = [
  {
    type: "romantic",
    icon: <Heart className="h-4 w-4" />,
    label: { ro: "Romantică", en: "Romantic", ru: "Романтическая" },
  },
  {
    type: "friendship",
    icon: <Users className="h-4 w-4" />,
    label: { ro: "Prietenie", en: "Friendship", ru: "Дружба" },
  },
  {
    type: "professional",
    icon: <Briefcase className="h-4 w-4" />,
    label: { ro: "Profesională", en: "Professional", ru: "Профессиональная" },
  },
  {
    type: "family",
    icon: <Home className="h-4 w-4" />,
    label: { ro: "Familie", en: "Family", ru: "Семейная" },
  },
];

export const RelationshipTypeSelector = ({
  selectedType,
  onTypeChange,
}: RelationshipTypeSelectorProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {t.compatibility?.relationshipType || "Tipul Relației"}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {relationshipTypes.map(({ type, icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            aria-pressed={selectedType === type}
            className={cn(
              "num flex min-h-11 flex-col items-center justify-center gap-1.5 border-b-2 pb-2",
              "text-[0.63rem] uppercase tracking-[0.14em] transition-colors",
              selectedType === type
                ? "border-gilt text-gilt"
                : "border-transparent text-muted-foreground hover:border-line hover:text-foreground",
            )}
          >
            {icon}
            <span>{label[language]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

