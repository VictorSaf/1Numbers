import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageLayout } from "@/components/layout/PageLayout";
import { PagePlate } from "@/components/layout/PagePlate";
import { Chapter } from "@/components/numerology/Chapter";
import { SectionHead } from "@/components/layout/SectionHead";
import { Dial } from "@/components/numerology/Dial";
import { buildDial, type DialLang } from "@/lib/dial";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/use-profile";
import { 
  calculateCompatibility,
  CompatibilityResult,
  RelationshipType,
  calculateRomanticCompatibility,
  calculateFriendshipCompatibility,
  calculateProfessionalCompatibility,
  calculateFamilyCompatibility,
  DetailedCompatibilityResult
} from "@/lib/compatibility";
import { RelationshipTypeSelector } from "@/components/RelationshipTypeSelector";
import { RelationshipDynamicsCard } from "@/components/RelationshipDynamicsCard";
import { ShareButtons } from "@/components/ShareButtons";
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BirthDateSelect } from "@/components/BirthDateSelect";
import { RelationshipTimingCard } from "@/components/compatibility/RelationshipTimingCard";
import { calculateRelationshipTiming, type RelationshipTiming } from "@/lib/relationshipTiming";
import { AllMethods } from "@/components/compatibility/AllMethods";
import type { Gender } from "@/lib/models/compatibility";

const CoupleMatrix = lazy(() => import("@/components/numerology/CoupleMatrix"));

interface PersonData {
  fullName: string;
  birthDate: Date | undefined;
  /** Opțional: folosit doar de metoda Kua. */
  gender?: Gender;
}

const locales = { ro, en: enUS, ru };

const Compatibility = () => {
  const { language, t } = useLanguage();
  const lang = (["ro", "en", "ru"].includes(language) ? language : "ro") as DialLang;

  const sections = {
    // Întrebarea fiecărei secțiuni spune ALTCEVA decât subtitlul plăcii.
    // Repetat cuvânt cu cuvânt la două rânduri distanță, textul face pagina să
    // pară scrisă de două ori -- același defect pe care l-am scos de pe /azi.
    // Nu mai stă nicio cifră de sinteză deasupra: fiecare metodă își spune
    // verdictul, iar împărțirea dintre ele e răspunsul.
    ro: { scorQ: "Aceeași pereche, prin fiecare metodă din piață — și unde se despart.", scoruri: "Matricea aplicației, pe componente", dinamica: "Dinamica relației", gender: "Gen (folosit doar pentru Kua)", genderNone: "nespecificat", male: "bărbat", female: "femeie", share: "Perechea noastră, citită prin fiecare metodă" },
    en: { scorQ: "The same couple, through every method on the market — and where they part.", scoruri: "This app's matrix, component by component", dinamica: "How the relationship moves", gender: "Gender (used only for Kua)", genderNone: "not specified", male: "male", female: "female", share: "Our couple, read through every method" },
    ru: { scorQ: "Одна пара через каждый метод — и где они расходятся.", scoruri: "Матрица приложения, по компонентам", dinamica: "Динамика отношений", gender: "Пол (только для Гуа)", genderNone: "не указан", male: "мужской", female: "женский", share: "Наша пара, прочитанная каждым методом" },
  }[lang];
  const { profileData, hasProfile } = useProfile();
  const [person1, setPerson1] = useState<PersonData>({ fullName: "", birthDate: undefined });
  const [person2, setPerson2] = useState<PersonData>({ fullName: "", birthDate: undefined });
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedCompatibilityResult | null>(null);
  const [timing, setTiming] = useState<RelationshipTiming | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("romantic");
  const [isCalendar1Open, setIsCalendar1Open] = useState(false);
  const [isCalendar2Open, setIsCalendar2Open] = useState(false);

  // Load profile data for person1
  useEffect(() => {
    if (hasProfile && profileData && !person1.fullName && !person1.birthDate) {
      setPerson1({
        fullName: profileData.fullName,
        birthDate: profileData.birthDate,
      });
    }
  }, [hasProfile, profileData, person1]);

  // Aceeași pereche pentru toate metodele; memorată ca AllMethods să nu
  // recalculeze la fiecare randare.
  const couple = useMemo(
    () =>
      result && person1.birthDate && person2.birthDate
        ? {
            a: { name: person1.fullName, birthDate: person1.birthDate },
            b: { name: person2.fullName, birthDate: person2.birthDate },
          }
        : null,
    [result, person1.fullName, person1.birthDate, person2.fullName, person2.birthDate],
  );

  const dateLocale = locales[language];
  const currentYear = new Date().getFullYear();

  const canCalculate = person1.fullName.trim() && person1.birthDate && person2.fullName.trim() && person2.birthDate;

  const handleCalculate = () => {
    if (person1.birthDate && person2.birthDate) {
      const baseCompatibility = calculateCompatibility(
        { fullName: person1.fullName, birthDate: person1.birthDate },
        { fullName: person2.fullName, birthDate: person2.birthDate }
      );
      setResult(baseCompatibility);

      // Stratul temporal stă lângă scor, nu în el: aceleași două date de
      // naștere, citite prin anul și lunile personale ale fiecăruia.
      setTiming(calculateRelationshipTiming(person1.birthDate, person2.birthDate));

      // Calculate detailed compatibility based on relationship type
      let detailed: DetailedCompatibilityResult;
      switch (relationshipType) {
        case "romantic":
          detailed = calculateRomanticCompatibility(
            { fullName: person1.fullName, birthDate: person1.birthDate },
            { fullName: person2.fullName, birthDate: person2.birthDate }
          );
          break;
        case "friendship":
          detailed = calculateFriendshipCompatibility(
            { fullName: person1.fullName, birthDate: person1.birthDate },
            { fullName: person2.fullName, birthDate: person2.birthDate }
          );
          break;
        case "professional":
          detailed = calculateProfessionalCompatibility(
            { fullName: person1.fullName, birthDate: person1.birthDate },
            { fullName: person2.fullName, birthDate: person2.birthDate }
          );
          break;
        case "family":
          detailed = calculateFamilyCompatibility(
            { fullName: person1.fullName, birthDate: person1.birthDate },
            { fullName: person2.fullName, birthDate: person2.birthDate }
          );
          break;
        default:
          detailed = calculateRomanticCompatibility(
            { fullName: person1.fullName, birthDate: person1.birthDate },
            { fullName: person2.fullName, birthDate: person2.birthDate }
          );
      }
      setDetailedResult(detailed);
    }
  };

  const handleReset = () => {
    setPerson1({ fullName: "", birthDate: undefined });
    setPerson2({ fullName: "", birthDate: undefined });
    setResult(null);
    setDetailedResult(null);
    setTiming(null);
  };

  // Un scor de compatibilitate e o DISTANȚĂ, nu o eroare. 45% nu e o alarmă
  // roșie, e o pereche care are de lucru. Deci aceleași culori ca punțile
  // hărții -- armonie și tensiune -- nu `--ok`, `--warn`, `--crit`.
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-harmony";
    if (score >= 55) return "text-accent";
    return "text-tension";
  };

  // Genul e opțional și întreabă o singură metodă: Kua. Fără el, Kua lipsește
  // din listă și o spune, restul metodelor nu se schimbă.
  const genderField = (
    person: PersonData,
    setPerson: (p: PersonData) => void,
    id: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">{sections.gender}</Label>
      <select
        id={id}
        value={person.gender ?? ""}
        onChange={(e) => setPerson({ ...person, gender: (e.target.value || undefined) as Gender | undefined })}
        className="h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-sm text-foreground transition-colors focus:border-gilt focus:outline-none"
      >
        <option value="">{sections.genderNone}</option>
        <option value="female">{sections.female}</option>
        <option value="male">{sections.male}</option>
      </select>
    </div>
  );

  return (
    <PageLayout>
      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="page-measure pt-4">
          {/* Placa de deschidere, ca la hartă. Figura ei sunt chiar cele două
              cadrane, când există două hărți de comparat.
              Cât timp nu e rezultat, formularul stă ÎN placă: cele două hărți
              pe care le ceri SUNT începutul paginii, nu un capitol de după el.
              Rezultatul se arată dedesubt, în afara plăcii. */}
          <PagePlate
            eyebrow={t.compatibilityLabel}
            title={t.compatibilityTitle}
            subtitle={t.compatibilitySubtitle}
            figure={
              result && person1.birthDate && person2.birthDate ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-[124px] shrink-0">
                    <Dial figure={buildDial(person1.fullName, person1.birthDate, lang)} size="echo" />
                  </div>
                  <span className="num text-2xl text-plate-tension" aria-hidden="true">
                    ⟷
                  </span>
                  <div className="w-[124px] shrink-0">
                    <Dial figure={buildDial(person2.fullName, person2.birthDate, lang)} size="echo" />
                  </div>
                </div>
              ) : undefined
            }
          >
            {!result && (
              <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                {/* Person 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="num text-2xl leading-none text-accent">1</span>
                    </div>
                    <h3 className="font-heading text-lg">{t.person1}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{t.fullNameLabel}</Label>
                    <Input
                      value={person1.fullName}
                      onChange={(e) => setPerson1({ ...person1, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="input-mystic"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{t.birthDateLabel}</Label>
                    <BirthDateSelect value={person1.birthDate} onChange={(date) => setPerson1({ ...person1, birthDate: date })} />
                  </div>

                  {genderField(person1, setPerson1, "gender-1")}
                </div>

                {/* Person 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="num text-2xl leading-none text-accent">2</span>
                    </div>
                    <h3 className="font-heading text-lg">{t.person2}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{t.fullNameLabel}</Label>
                    <Input
                      value={person2.fullName}
                      onChange={(e) => setPerson2({ ...person2, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="input-mystic"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{t.birthDateLabel}</Label>
                    <BirthDateSelect value={person2.birthDate} onChange={(date) => setPerson2({ ...person2, birthDate: date })} />
                  </div>

                  {genderField(person2, setPerson2, "gender-2")}
                </div>

                <div className="md:col-span-2">
                  <RelationshipTypeSelector
                    selectedType={relationshipType}
                    onTypeChange={setRelationshipType}
                  />
                </div>

                {/* Inima plutea singură între formular și buton, fără text și
                    fără rol -- rămăsese de la aranjarea în două coloane pe care
                    o despărțea. */}
                <div className="md:col-span-2">
                  <Button onClick={handleCalculate} disabled={!canCalculate} className="w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t.calculateCompatibility}
                  </Button>
                </div>
              </div>
            )}
          </PagePlate>

          <div className="page-rhythm mt-14">
          {result && (
            <div className="page-rhythm animate-fade-in">
              <Chapter
                meta={{
                  id: "scor",
                  title: `${person1.fullName} · ${person2.fullName}`,
                  question: sections.scorQ,
                }}
                index={1}
              >

              {/* Nicio cifră de sinteză deasupra. Procentul mare de aici era o
                  medie ponderată peste trei tabele -- exact ce doctrina nu
                  permite să stea peste dezacorduri. Acum pagina se deschide cu
                  fiecare metodă din piață și cu împărțirea dintre ele. */}
              {couple && (
                <AllMethods
                  a={couple.a}
                  b={couple.b}
                  genderA={person1.gender}
                  genderB={person2.gender}
                />
              )}

              {/* A treia tradiție pe aceeași relație: Matricea destinului a
                  cuplului, în ambele reduceri peste 22. */}
              {couple && (
                <Suspense fallback={null}>
                  <CoupleMatrix birthDateA={couple.a.birthDate} birthDateB={couple.b.birthDate} />
                </Suspense>
              )}

              <SectionHead index={2} title={sections.scoruri} />

              {/* Scorurile matricei aplicației, fiecare pe componenta lui. Nu se
                  mai adună într-un procent comun, deci nici ponderile nu mai
                  au ce pondera. */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: t.lifePathTitle, data: result.lifePathCompatibility },
                  { title: t.destinyTitle, data: result.destinyCompatibility },
                  { title: t.soulUrgeTitle, data: result.soulUrgeCompatibility },
                ].map((item, i) => (
                  <div key={i} className="card-mystic py-5 text-center">
                    <span className="text-xs uppercase tracking-[0.15em] text-primary/70">
                      {item.title}
                    </span>
                    <div className="flex items-center justify-center gap-3 my-4">
                      <div className="num text-3xl leading-none text-accent">
                        {item.data.person1}
                      </div>
                      <span className="text-muted-foreground">+</span>
                      <div className="num text-3xl leading-none text-accent">
                        {item.data.person2}
                      </div>
                    </div>
                    <div className={cn("num text-2xl font-bold", getScoreColor(item.data.score))}>
                      {item.data.score}%
                    </div>
                  </div>
                ))}
              </div>

              <SectionHead index={3} title={sections.dinamica} />

              {/* Relationship Dynamics Card */}
              {detailedResult && (
                <RelationshipDynamicsCard compatibility={detailedResult} />
              )}

              {timing && (
                <RelationshipTimingCard
                  timing={timing}
                  name1={person1.fullName}
                  name2={person2.fullName}
                />
              )}

              {/* Share Compatibility */}
              {result && (
                <div className="flex justify-center pt-4">
                  <ShareButtons
                    shareData={{
                      title: `${person1.fullName} & ${person2.fullName} - Compatibility`,
                      text: sections.share,
                      // Fără nume și fără date în link (R6): cine îl deschide își
                      // pune propriii oameni.
                      url: `${window.location.origin}/doi`
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gilt text-gilt hover:bg-gilt-soft"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {t.tryAnotherPair}
                </Button>
              </div>
              </Chapter>
            </div>
          )}
          </div>
        </div>
      </main>
      </PageLayout>
  );
};

export default Compatibility;
