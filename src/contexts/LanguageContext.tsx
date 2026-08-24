import { createContext, useContext, useState, ReactNode } from "react";
import { Language, getTranslation } from "@/lib/translations";
import { track } from '@/lib/analytics';

type TranslationType = ReturnType<typeof getTranslation>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("ro");
  const setLanguage = (lang: Language) => {
    track('language_changed', { language: lang });
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
