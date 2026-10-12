import { useState } from "react";
import { Sparkles, Moon, Sun, Stars } from "lucide-react";
import { NumerologyForm } from "@/components/NumerologyForm";
import { FirstVisitPromise, EXAMPLE_NAME, EXAMPLE_BIRTH_DATE } from "@/components/FirstVisitPromise";
import { NumerologyResults } from "@/components/NumerologyResults";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/use-profiles";
import { parseCalendarDate } from '@/lib/calendarDate';

interface UserData {
  fullName: string;
  birthDate: Date;
}

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { profiles, loading: loadingProfile } = useProfiles();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);

  /**
   * Harta proprie e rândul activ din lista comună de profiluri.
   *
   * Pagina cerea separat `/profiles/me`, iar butonul de salvare de sub hartă
   * cerea `/profiles/all` -- două drumuri spre același rând. `/me` întoarce
   * rândul cu `is_active`, iar indexul unic din migrația 003 ține cel mult unul
   * pe utilizator, deci e exact `find(isActive)`. Nu `activeProfile`: acela cade
   * pe primul profil când niciunul nu e activ, adică pe harta unui copil.
   */
  const profile = profiles.find((p) => p.isActive) ?? null;

  const handleCalculate = (data: UserData) => {
    setUserData(data);
    setShowDashboard(false);
  };

  // Un clic până la o hartă adevărată. Nu o descriere a produsului, ci
  // produsul: aceleași cinci capitole, aceleași calcule, pe o persoană
  // inventată. Trece prin `handleCalculate`, deci nu ocolește nimic.
  const handleTryExample = () => {
    handleCalculate({ fullName: EXAMPLE_NAME, birthDate: EXAMPLE_BIRTH_DATE });
  };

  // „Calculate again” duce la formular, nu înapoi la aceeași hartă. Pentru cine
  // are cont, formularul vine precompletat -- e drumul spre altcineva sau altă
  // dată, nu spre ce tocmai a citit.
  const handleReset = () => {
    setUserData(null);
    setShowDashboard(false);
  };

  /**
   * Cine are cont primește harta direct. Nu formularul, nu un panou: harta.
   *
   * Numele și data lui sunt deja în baza noastră -- de-aia și-a făcut cont.
   * Să i le arătăm într-un formular precompletat, ca să apese un buton care
   * ne spune ce știm deja, e o vamă pusă exact în calea celui care ne-a dat
   * datele. Vizitatorul o trece fiindcă n-avem de unde ști cine e; el nu.
   *
   * Formularul rămâne la un clic distanță, din „Calculate again” de pe hartă,
   * pentru cine vrea altcineva sau altă dată.
   */
  const mine =
    isAuthenticated && profile && showDashboard
      ? { fullName: profile.fullName, birthDate: parseCalendarDate(profile.birthDate) }
      : null;
  const reading =
    userData ?? (mine && mine.birthDate ? { fullName: mine.fullName, birthDate: mine.birthDate } : null);

  const shouldShowResults = reading !== null;
  const shouldShowForm = !shouldShowResults;

  return (
    <PageLayout>
      {/* Antetul de marketing dispare pentru cine e deja înăuntru: „Discover
          the hidden secrets in your personal numbers" e o promisiune făcută
          cuiva care încă n-a intrat, iar deasupra firului concurează cu chiar
          lucrul pe care omul a venit să-l citească. */}
      {!shouldShowResults && <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={{
          icon: (
            <>
              <Moon className="h-4 w-4 animate-pulse-glow" />
              <Stars className="h-5 w-5" />
              <Sun className="h-4 w-4 animate-pulse-glow" />
            </>
          ),
          label: t.title
        }}
      />}

      {/* Main Content */}
      <main className="relative z-10 pb-16">
        {/* Dashboard Loading State */}
        {loadingProfile && isAuthenticated && (
          <div className="page-measure pt-4">
            <DashboardSkeleton />
          </div>
        )}

        {/* Form for new calculations */}
        {shouldShowForm && !loadingProfile && (
          <div className="page-measure pt-4">
            <div className="max-w-md mx-auto">
              <div className="card-mystic py-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sunken border border-line mb-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="font-heading text-2xl text-foreground mb-2">
                    {t.formTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t.formSubtitle}
                  </p>
                </div>

                <FirstVisitPromise onTryExample={handleTryExample} />

                <NumerologyForm
                  onCalculate={handleCalculate}
                  profileData={profile ? {
                    fullName: profile.fullName,
                    birthDate: parseCalendarDate(profile.birthDate)
                  } : null}
                />
              </div>

              {/* Info Section */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: t.lifePathTitle.split(" ").slice(0, 2).join(" "), desc: t.infoLifePath },
                  { title: t.destinyTitle.split(" ").slice(0, 2).join(" "), desc: t.infoDestiny },
                  { title: t.personalYearTitle, desc: t.infoPersonalYear },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="text-center pt-4 border-t border-line"
                  >
                    <h3 className="font-heading text-sm text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results view */}
        {shouldShowResults && (
          // Wider than the rest of the page: the reading carries a sticky
          // chapter column beside it on desktop.
          <div className="page-measure pt-4">
            <NumerologyResults
              fullName={reading.fullName}
              birthDate={reading.birthDate}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

    </PageLayout>
  );
};

export default Index;
