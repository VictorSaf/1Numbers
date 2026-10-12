import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseCalendarDate } from "@/lib/calendarDate";
import { isAboutSomeoneElse, type ProfileCategory } from "@/lib/profileCategories";
import type { Profile } from "@/hooks/use-profiles";

interface PeopleGroupProps {
  category: ProfileCategory;
  profiles: Profile[];
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
}

export const PeopleGroup = ({ category, profiles, onEdit, onDelete }: PeopleGroupProps) => {
  const { t } = useLanguage();
  const someoneElse = isAboutSomeoneElse(category);
  const dateLabel = category === "afacere" ? t.people.foundedLabel : t.people.dateLabel;

  return (
    <section className="card-mystic py-6 space-y-4">
      <header className="flex items-center gap-3">
        <h3 className="font-heading text-lg text-foreground">{t.people.categories[category]}</h3>
        <Badge variant="secondary" className="num">{profiles.length}</Badge>
      </header>

      <p className="text-sm text-muted-foreground font-raleway">{t.people.categoryHints[category]}</p>

      {someoneElse && (
        <p className="text-xs text-muted-foreground font-raleway border-t border-line pt-3">
          {t.people.aboutSomeoneElse}
        </p>
      )}

      <ul className="space-y-2">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className={cn(
              "flex items-center justify-between gap-4 border-t border-line py-3 pl-3",
              profile.isActive && "border-l-2 border-l-gilt",
            )}
          >
            <div className="min-w-0">
              <div className="font-heading text-foreground truncate">{profile.fullName}</div>
              <div className="text-sm text-muted-foreground font-raleway">
                <span>{dateLabel}: </span>
                <span className="num">
                  {parseCalendarDate(profile.birthDate)?.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(profile.id)}>
                <Pencil className="mr-1 h-4 w-4" />
                {t.editProfile}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(profile.id)}>
                <Trash2 className="mr-1 h-4 w-4" />
                {t.deleteProfile}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
