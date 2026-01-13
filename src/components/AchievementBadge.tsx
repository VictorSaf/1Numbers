import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Achievement,
  getRarityColor,
  getRarityLabel,
  calculateAchievementProgress,
  UserGamificationState,
} from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  earned: boolean;
  state?: UserGamificationState;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  onClick?: () => void;
}

export const AchievementBadge = ({
  achievement,
  earned,
  state,
  size = "md",
  showProgress = false,
  onClick,
}: AchievementBadgeProps) => {
  const { language } = useLanguage();

  const rarityColor = getRarityColor(achievement.rarity);
  const progress = state ? calculateAchievementProgress(achievement, state) : 0;

  const sizeClasses = {
    sm: {
      container: "w-12 h-12",
      icon: "text-lg",
      text: "text-[10px]",
    },
    md: {
      container: "w-16 h-16",
      icon: "text-2xl",
      text: "text-xs",
    },
    lg: {
      container: "w-20 h-20",
      icon: "text-3xl",
      text: "text-sm",
    },
  };

  const classes = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl transition-all",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              earned ? "cursor-pointer" : "cursor-default",
              classes.container
            )}
            style={{
              backgroundColor: earned ? `${rarityColor}20` : "rgba(0,0,0,0.2)",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: earned ? rarityColor : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className={cn(
                "transition-all",
                classes.icon,
                !earned && "grayscale opacity-50"
              )}
            >
              {earned ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
            </span>

            {showProgress && !earned && state && (
              <Progress
                value={progress}
                className="absolute bottom-1 w-3/4 h-1"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>{achievement.icon}</span>
              <span className="font-medium">{achievement.name[language]}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {achievement.description[language]}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span
                className="font-medium"
                style={{ color: rarityColor }}
              >
                {getRarityLabel(achievement.rarity, language)}
              </span>
              <span className="text-primary">+{achievement.xpReward} XP</span>
            </div>
            {!earned && state && (
              <div className="pt-1">
                <Progress value={progress} className="h-1.5" />
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Grid display for multiple achievements
interface AchievementGridProps {
  achievements: Achievement[];
  earnedIds: string[];
  state?: UserGamificationState;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export const AchievementGrid = ({
  achievements,
  earnedIds,
  state,
  size = "md",
  showProgress = true,
}: AchievementGridProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          earned={earnedIds.includes(achievement.id)}
          state={state}
          size={size}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
};

export default AchievementBadge;
