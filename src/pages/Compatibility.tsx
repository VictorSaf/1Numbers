import { useState, useEffect } from "react";
import { Heart, Users, Sparkles } from "lucide-react";
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
  getCompatibilityLevel, 
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
import { generateCompatibilityLink } from "@/lib/sharing";
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BirthDateSelect } from "@/components/BirthDateSelect";
import { RelationshipTimingCard } from "@/components/compatibility/RelationshipTimingCard";
import { calculateRelationshipTiming, type RelationshipTiming } from "@/lib/relationshipTiming";
import { TwoJudgements } from "@/components/numerology/TwoJudgements";

interface PersonData {
  fullName: string;
  birthDate: Date | undefined;
}

const locales = { ro, en: enUS, ru };

const Compatibility = () => {
  const { language, t } = useLanguage();
  const lang = (["ro", "en", "ru"].includes(language) ? language : "ro") as DialLang;

  const sections = {
    // Întrebarea fiecărei secțiuni spune ALTCEVA decât subtitlul plăcii.
    // Repetat cuvânt cu cuvânt la două rânduri distanță, textul face pagina să
    // pară scrisă de două ori -- același defect pe care l-am scos de pe /azi.
    ro: { pereche: "Cele două hărți", perecheQ: "Numele întreg și data nașterii, pentru fiecare. Din ele ies toate cifrele.",
          scoruri: "Scorurile pe rând", procent: "Ce ascunde procentul", dinamica: "Dinamica relației" },
    en: { pereche: "The two maps", perecheQ: "Full name and birth date, for each. Every number comes out of those.",
          scoruri: "The scores, one by one", procent: "What the percentage hides", dinamica: "How the relationship moves" },
    ru: { pereche: "Две карты", perecheQ: "Полное имя и дата рождения — для каждого. Из них выходят все числа.",
          scoruri: "Оценки по отдельности", procent: "Что скрывает процент", dinamica: "Динамика отношений" },
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-ok";
    if (score >= 70) return "text-primary";
    if (score >= 55) return "text-warn";
    return "text-crit";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "from-ok/20 to-ok-ink/10 border-ok";
    if (score >= 70) return "from-primary/20 to-accent-ink/10 border-line";
    if (score >= 55) return "from-warn/20 to-warn-ink/10 border-warn";
    return "from-crit/20 to-crit-ink/10 border-crit";
  };

  return (
    <PageLayout>
      {/* Main Content */}
      <main className="relative z-10 pb-16">
        <div className="page-measure pt-4">
          {/* Placa de deschidere, ca la hartă. Figura ei sunt chiar cele două
              cadrane, când există două hărți de comparat. */}
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
          />

          <div className="page-rhythm mt-14">
          {!result ? (
            <>
              {/* Starea de formular e o secțiune ca oricare alta: cifră, titlu,
                  întrebare. Cardul stătea pe `max-w-2xl` -- 672px într-o pagină
                  de 1024, o treaptă de 352px față de placa de deasupra lui. */}
              <SectionHead index={1} title={sections.pereche} question={sections.perecheQ} />

              <div className="card-mystic py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Person 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="num text-2xl leading-none text-accent">1</span>
                    </div>
                    <h3 className="font-heading text-lg text-foreground">{t.person1}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90 text-sm">{t.fullNameLabel}</Label>
                    <Input
                      value={person1.fullName}
                      onChange={(e) => setPerson1({ ...person1, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="input-mystic"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90 text-sm">{t.birthDateLabel}</Label>
                    <BirthDateSelect value={person1.birthDate} onChange={(date) => setPerson1({ ...person1, birthDate: date })} />
                  </div>
                </div>

                {/* Person 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="num text-2xl leading-none text-accent">2</span>
                    </div>
                    <h3 className="font-heading text-lg text-foreground">{t.person2}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90 text-sm">{t.fullNameLabel}</Label>
                    <Input
                      value={person2.fullName}
                      onChange={(e) => setPerson2({ ...person2, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="input-mystic"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90 text-sm">{t.birthDateLabel}</Label>
                    <BirthDateSelect value={person2.birthDate} onChange={(date) => setPerson2({ ...person2, birthDate: date })} />
                  </div>
                </div>
              </div>

              {/* Relationship Type Selector */}
              <div className="my-6">
                <RelationshipTypeSelector
                  selectedType={relationshipType}
                  onTypeChange={setRelationshipType}
                />
              </div>

              {/* Heart divider */}
              <div className="flex items-center justify-center my-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <Heart className="mx-4 h-6 w-6 text-primary animate-pulse-glow" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="w-full sm:w-auto"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t.calculateCompatibility}
              </Button>
              </div>
            </>
          ) : (
            <div className="page-rhythm animate-fade-in">
              <Chapter
                meta={{
                  id: "scor",
                  title: `${person1.fullName} · ${person2.fullName}`,
                  question: t.compatibilitySubtitle,
                }}
                index={1}
              >

              {/* Overall Score */}
              <div className={cn(
                "card-mystic py-8 text-center",
                "bg-gradient-to-br border",
                getScoreBg(result.overallScore)
              )}>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t.overallCompatibility}
                </span>
                <div className={cn(
                  "num text-7xl md:text-8xl font-bold my-4",
                  getScoreColor(result.overallScore)
                )}>
                  {result.overallScore}%
                </div>
                <span className="font-heading text-xl text-foreground">
                  {t.compatibilityLevels[getCompatibilityLevel(result.overallScore)]}
                </span>
                <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                  {t.compatibilityDescriptions[getCompatibilityLevel(result.overallScore)]}
                </p>
              </div>

              <SectionHead index={2} title={sections.scoruri} />

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    title: t.lifePathTitle, 
                    data: result.lifePathCompatibility,
                    weight: "50%"
                  },
                  { 
                    title: t.destinyTitle, 
                    data: result.destinyCompatibility,
                    weight: "30%"
                  },
                  { 
                    title: t.soulUrgeTitle, 
                    data: result.soulUrgeCompatibility,
                    weight: "20%"
                  },
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
                    <span className="text-xs text-muted-foreground">
                      {t.weight}: {item.weight}
                    </span>
                  </div>
                ))}
              </div>

              <SectionHead index={3} title={sections.procent} />

              {/* Ce ascunde procentul, și ce spune a doua tradiție.
                  Procentul de deasupra e o medie ponderată: două perechi cu
                  același 74% pot fi una echilibrată pe toate liniile și alta
                  ruptă în două. Iar tradiția vedică judecă aceeași pereche
                  prin alt criteriu -- prietenie sau dușmănie între planetele
                  zilelor de naștere -- și poate să nu fie de acord.
                  Stă imediat sub scor, fiindcă despre scorul ăla vorbește. */}
              {person1.birthDate && person2.birthDate && (
                <TwoJudgements
                  a={{ name: person1.fullName, birthDate: person1.birthDate }}
                  b={{ name: person2.fullName, birthDate: person2.birthDate }}
                />
              )}

              <SectionHead index={4} title={sections.dinamica} />

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
                      text: `Our compatibility score is ${result.overallScore}%!`,
                      url: generateCompatibilityLink({
                        person1Name: person1.fullName,
                        person2Name: person2.fullName,
                        compatibilityScore: result.overallScore
                      })
                    }}
                    compatibilityData={{
                      person1Name: person1.fullName,
                      person2Name: person2.fullName,
                      compatibilityScore: result.overallScore
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
