import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  calculateLevel,
  calculateLevelProgress,
  USER_LEVELS,
  UserLevel,
} from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProgressLevelProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  showXP?: boolean;
  showNextLevel?: boolean;
}

export const ProgressLevel = ({
  xp,
  size = "md",
  showXP = true,
  showNextLevel = true,
}: ProgressLevelProps) => {
  const { language } = useLanguage();

  const currentLevel = calculateLevel(xp);
  const progress = calculateLevelProgress(xp);
  const nextLevelIndex = Math.min(currentLevel.level, USER_LEVELS.length - 1);
  const nextLevel = USER_LEVELS[nextLevelIndex];
  const isMaxLevel = currentLevel.level === USER_LEVELS.length;

  const labels = {
    level: { ro: "Nivel", en: "Level", ru: "Уровень" },
    xp: { ro: "XP", en: "XP", ru: "Опыт" },
    nextLevel: { ro: "Următorul nivel", en: "Next level", ru: "Следующий уровень" },
    maxLevel: { ro: "Nivel maxim atins!", en: "Max level reached!", ru: "Максимальный уровень!" },
    xpNeeded: { ro: "XP necesar", en: "XP needed", ru: "Нужно XP" },
  };

  const sizeClasses = {
    sm: {
      container: "p-2 gap-2",
      icon: "text-lg",
      level: "text-sm",
      name: "text-xs",
      xp: "text-[10px]",
      progress: "h-1.5",
    },
    md: {
      container: "p-3 gap-3",
      icon: "text-2xl",
      level: "text-lg",
      name: "text-sm",
      xp: "text-xs",
      progress: "h-2",
    },
    lg: {
      container: "p-4 gap-4",
      icon: "text-3xl",
      level: "text-xl",
      name: "text-base",
      xp: "text-sm",
      progress: "h-2.5",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center rounded-xl",
        "bg-gradient-to-br from-primary/10 to-purple-500/10",
        "border border-primary/20",
        classes.container
      )}
    >
      {/* Level Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full w-12 h-12 shrink-0",
          size === "sm" && "w-8 h-8",
          size === "lg" && "w-14 h-14"
        )}
        style={{ backgroundColor: `${currentLevel.color}30` }}
      >
        <span className={classes.icon}>{currentLevel.icon}</span>
      </div>

      {/* Level Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn("font-cinzel font-bold", classes.level)}
            style={{ color: currentLevel.color }}
          >
            {labels.level[language]} {currentLevel.level}
          </span>
          <span className={cn("text-foreground truncate", classes.name)}>
            {currentLevel.name[language]}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Progress
                    value={progress.percentage}
                    className={cn(classes.progress)}
                    style={
                      {
                        "--progress-color": currentLevel.color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isMaxLevel ? (
                  <span>{labels.maxLevel[language]}</span>
                ) : (
                  <div className="text-xs">
                    <div>
                      {progress.current} / {progress.next} XP
                    </div>
                    <div className="text-muted-foreground">
                      {labels.xpNeeded[language]}: {progress.next - progress.current}
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* XP Display */}
        {showXP && (
          <div className={cn("flex items-center gap-2 mt-1", classes.xp)}>
            <span className="text-muted-foreground">{labels.xp[language]}:</span>
            <span className="text-primary font-medium">{xp.toLocaleString()}</span>
            {showNextLevel && !isMaxLevel && (
              <span className="text-muted-foreground">
                / {nextLevel.minXP.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for headers
export const ProgressLevelCompact = ({ xp }: { xp: number }) => {
  const { language } = useLanguage();
  const currentLevel = calculateLevel(xp);
  const progress = calculateLevelProgress(xp);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 cursor-help">
            <span className="text-lg">{currentLevel.icon}</span>
            <span className="text-sm font-medium" style={{ color: currentLevel.color }}>
              {currentLevel.level}
            </span>
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress.percentage}%`,
                  backgroundColor: currentLevel.color,
                }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">
              {currentLevel.name[language]} - Lv.{currentLevel.level}
            </div>
            <div className="text-xs text-muted-foreground">
              {xp.toLocaleString()} XP
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// All levels display
export const AllLevelsDisplay = () => {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {USER_LEVELS.map((level) => (
        <div
          key={level.level}
          className="flex flex-col items-center p-3 rounded-xl bg-card/50 border border-border/50"
        >
          <span className="text-2xl mb-1">{level.icon}</span>
          <span
            className="font-cinzel font-bold text-sm"
            style={{ color: level.color }}
          >
            {level.level}
          </span>
          <span className="text-xs text-center text-muted-foreground">
            {level.name[language]}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {level.minXP.toLocaleString()}+ XP
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProgressLevel;
