import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretLetters } from "@/lib/numerology-plus/content/interpret";
import { NumberCard } from "./NumberCard";

/**
 * Cele trei litere de poziție: Piatra de Temelie, Piatra de Vârf, Prima Vocală.
 *
 * Motorul le scrisese în trei limbi și le validase cu testul lui de conținut,
 * dar interpretLetters() nu avea niciun consumator -- textul exista și nu-l
 * vedea nimeni. Sunt servite de o funcție separată de interpretProfile pentru
 * că ies cu două câmpuri în plus, litera și trăsătura ei, iar aici sunt
 * randate: glifa deasupra, interpretarea în același NumberCard ca restul
 * numerelor, ca să nu existe o a doua formă de card care să derive.
 *
 * Nu există listă de chei între motor și ecran, spre deosebire de NewNumbers:
 * ce întoarce interpretLetters se randează. O a patra ramă de litere adăugată
 * în motor apare aici singură.
 */

interface LetterStonesProps {
  fullName: string;
  birthDate: Date;
}

const LetterStones = ({ fullName, birthDate }: LetterStonesProps) => {
  const { language } = useLanguage();

  const stones = useMemo(() => {
    const profile = fullProfile(fullName, {
      day: birthDate.getDate(),
      month: birthDate.getMonth() + 1,
      year: birthDate.getFullYear(),
    });
    // filter(Boolean) nu îngustează tipul, flatMap da.
    return interpretLetters(profile.pythagorean, language).flatMap((s) => (s ? [s] : []));
  }, [fullName, birthDate, language]);

  return (
    <div className="grid gap-3">
      {stones.map((stone) => (
        <div key={stone.key} className="space-y-2">
          <div className="flex items-baseline gap-3">
            {/* Litera poartă .num ca în grila din LetterMap: aceeași glifă
                desenată cu două fonturi pe aceeași pagină ar arăta ca două
                lucruri diferite. */}
            <span className="num text-2xl text-primary">{stone.letter}</span>
            <span className="text-sm text-muted-foreground">{stone.letterTrait}</span>
          </div>
          <NumberCard interpretation={stone} />
        </div>
      ))}
    </div>
  );
};

// Export default, ca React.lazy să-l ia fără wrapper.
export default LetterStones;
