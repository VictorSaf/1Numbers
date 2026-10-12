import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getTranslation } from "@/lib/translations";
import { track } from '@/lib/analytics';

const LANGUAGES: Language[] = ['ro', 'en', 'ru'];
const STORAGE_KEY = 'language';

/**
 * Which language to open in.
 *
 * The provider used to be `useState("ro")` with nothing else: every reload put
 * a Russian reader back into Romanian, and index.html declared lang="en" over
 * the top of it. Read in the initialiser rather than an effect, so the first
 * paint is already correct -- the same mistake ThemeContext was making, which
 * showed up as a theme flash on every load.
 *
 * public/offline.js reads the same key. If it moves, move it there too.
 */
function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && LANGUAGES.includes(saved)) return saved;
  } catch {
    // localStorage is unavailable in some privacy modes; fall through.
  }

  const preferred = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const tag of preferred) {
    const base = tag?.slice(0, 2).toLowerCase() as Language;
    if (LANGUAGES.includes(base)) return base;
  }

  // Romanian is the default the app was built around, not a guess.
  return 'ro';
}

type TranslationType = ReturnType<typeof getTranslation>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // index.html ships lang="en" because the file is static; the real language is
  // only known here. Keeping the attribute in step matters for screen readers
  // and for how the browser hyphenates.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    track('language_changed', { language: lang });
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // A choice that cannot be stored still applies to this session.
    }
    setLanguageState(lang);
  };
  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
