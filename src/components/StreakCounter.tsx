import { Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  size?: "sm" | "md" | "lg";
  showLongest?: boolean;
}

export const StreakCounter = ({
  currentStreak,
  longestStreak,
  size = "md",
  showLongest = false,
}: StreakCounterProps) => {
  const { language } = useLanguage();

  const labels = {
    days: { ro: "zile", en: "days", ru: "дней" },
    day: { ro: "zi", en: "day", ru: "день" },
    streak: { ro: "Serie", en: "Streak", ru: "Серия" },
    best: { ro: "Record", en: "Best", ru: "Рекорд" },
  };

  const isOnFire = currentStreak >= 7;
  const isMilestone = [7, 30, 100, 365].includes(currentStreak);

  const sizeClasses = {
    sm: {
      container: "p-2 gap-1",
      icon: "h-4 w-4",
      number: "text-xl",
      label: "text-[10px]",
    },
    md: {
      container: "p-3 gap-2",
      icon: "h-5 w-5",
      number: "text-2xl",
      label: "text-xs",
    },
    lg: {
      container: "p-4 gap-3",
      icon: "h-6 w-6",
      number: "text-3xl",
      label: "text-sm",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center rounded-xl",
        "bg-gradient-to-br from-orange-500/20 to-red-500/20",
        "border border-orange-500/30",
        isMilestone && "animate-pulse",
        classes.container
      )}
    >
      <div className="relative">
        <Flame
          className={cn(
            classes.icon,
            "text-orange-500",
            isOnFire && "animate-bounce"
          )}
        />
        {isOnFire && (
          <Sparkles
            className={cn(
              "absolute -top-1 -right-1 h-3 w-3 text-yellow-400"
            )}
          />
        )}
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-cinzel font-bold text-orange-500",
            classes.number
          )}
        >
          {currentStreak}
        </span>
        <span className={cn("text-muted-foreground", classes.label)}>
          {currentStreak === 1 ? labels.day[language] : labels.days[language]}
        </span>
      </div>

      {showLongest && longestStreak > currentStreak && (
        <div className="ml-2 pl-2 border-l border-orange-500/30 flex flex-col">
          <span className={cn("text-muted-foreground", classes.label)}>
            {labels.best[language]}
          </span>
          <span className={cn("font-semibold text-orange-400/70", classes.label)}>
            {longestStreak} {labels.days[language]}
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
