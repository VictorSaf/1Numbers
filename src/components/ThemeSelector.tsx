import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const themeIcons: Record<ThemeName, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

// Named for what they do, not for a mood. "Twilight", "Dawn", "Midnight" and
// "Celestial" were four words for two palettes, and none of them told a reader
// which one was the dark one -- the admin panel had even mislabelled two of them
// as the opposite of what they were.
const THEME_LABELS: Record<string, Record<ThemeName, string>> = {
  ro: { light: 'Luminos', dark: 'Întunecat', system: 'Ca sistemul' },
  en: { light: 'Light', dark: 'Dark', system: 'System' },
  ru: { light: 'Светлая', dark: 'Тёмная', system: 'Как в системе' },
};

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const labels = THEME_LABELS[language] ?? THEME_LABELS.en;
  const Icon = themeIcons[theme];

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as ThemeName)}>
      {/* Pe 390px, „System” plus iconița plus săgeata ocupau o treime din antet,
          lângă steag și butonul de meniu -- iar „System” e cuvântul nostru pentru
          „urmează setarea telefonului”, nu unul pe care omul îl caută. Rămâne
          iconița, care spune același lucru fără să coste lățime; textul revine de
          la sm: în sus. aria-label ține numele întreg pentru cititoarele de ecran,
          unde lățimea nu costă nimic. */}
      <SelectTrigger
        aria-label={labels[theme]}
        className="min-h-11 w-11 justify-center px-0 sm:w-[150px] sm:justify-between sm:px-3 input-mystic"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <SelectValue className="hidden sm:inline">
            <span className="hidden sm:inline">{labels[theme]}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(themeIcons) as ThemeName[]).map((value) => {
          const ThemeIcon = themeIcons[value];
          return (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <ThemeIcon className="h-4 w-4" />
                <span>{labels[value]}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
