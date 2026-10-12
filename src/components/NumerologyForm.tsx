import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { CalendarIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { BirthDateSelect } from "@/components/BirthDateSelect";
import { track } from '@/lib/analytics';
import { isNameSupported } from '@/lib/numerology-plus/core';

interface NumerologyFormProps {
  onCalculate: (data: { fullName: string; birthDate: Date }) => void;
  profileData?: { fullName: string; birthDate: Date } | null;
}

const locales = { ro, en: enUS, ru };

// A name the engine cannot romanise reduces to no letters at all, and every
// position then comes out 0 -- which the results page renders as a perfectly
// confident reading of nothing. Cyrillic is transliterated now; anything else
// gets told, here, before a profile is built.
const UNREADABLE_NAME = {
  ro: 'Numele trebuie scris cu litere latine sau chirilice. Alte alfabete nu pot fi calculate încă.',
  en: 'The name has to be written in Latin or Cyrillic letters. Other scripts cannot be calculated yet.',
  ru: 'Имя должно быть написано латиницей или кириллицей. Другие алфавиты пока не поддерживаются.',
} as const;

export const NumerologyForm = ({ onCalculate, profileData }: NumerologyFormProps) => {
  const { language, t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.fullName);
      setBirthDate(profileData.birthDate);
    }
  }, [profileData]);

  const nameIsReadable = !fullName.trim() || isNameSupported(fullName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && birthDate && nameIsReadable) {
      track('calculate_submitted');
      onCalculate({ fullName: fullName.trim(), birthDate });
    }
  };

  const currentYear = new Date().getFullYear();
  const dateLocale = locales[language];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground/90 font-raleway text-sm tracking-wide">
          {t.fullNameLabel}
        </Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t.fullNamePlaceholder}
          className="input-mystic h-12 text-base"
          required
        />
        <p className={cn('text-xs', nameIsReadable ? 'text-muted-foreground' : 'text-destructive')}>
          {nameIsReadable ? t.fullNameHint : (UNREADABLE_NAME[language] ?? UNREADABLE_NAME.en)}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground/90 font-raleway text-sm tracking-wide">
          {t.birthDateLabel}
        </Label>
        <BirthDateSelect value={birthDate} onChange={setBirthDate} />
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg"
        disabled={!fullName.trim() || !birthDate || !nameIsReadable}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {t.calculateButton}
      </Button>
    </form>
  );
};
