import { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Stars } from "lucide-react";
import { NumerologyForm } from "@/components/NumerologyForm";
import { FirstVisitPromise, EXAMPLE_NAME, EXAMPLE_BIRTH_DATE } from "@/components/FirstVisitPromise";
import { NumerologyResults } from "@/components/NumerologyResults";
import { Thread } from "@/components/Thread";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { parseCalendarDate } from '@/lib/calendarDate';

interface UserData {
  fullName: string;
  birthDate: Date;
}

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
}

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await api.getProfile();
      if (response.success && response.profile) {
        const profileData = response.profile as UserProfile;
        setProfile(profileData);
        setShowDashboard(true);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const handleReset = () => {
    setUserData(null);
    if (profile) {
      setShowDashboard(true);
    }
  };

  // Determine what to show
  const shouldShowDashboard = isAuthenticated && profile && showDashboard && !userData;
  const shouldShowResults = userData !== null;
  const shouldShowForm = !shouldShowDashboard && !shouldShowResults;

  return (
    <PageLayout>
      {/* Antetul de marketing dispare pentru cine e deja înăuntru: „Discover
          the hidden secrets in your personal numbers" e o promisiune făcută
          cuiva care încă n-a intrat, iar deasupra firului concurează cu chiar
          lucrul pe care omul a venit să-l citească. */}
      {!shouldShowDashboard && <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={{
          icon: (
            <>
              <Moon className="h-4 w-4 text-primary animate-pulse-glow" />
              <Stars className="h-5 w-5 text-primary" />
              <Sun className="h-4 w-4 text-primary animate-pulse-glow" />
            </>
          ),
          label: t.title
        }}
      />}

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-16">
        {/* Dashboard Loading State */}
        {loadingProfile && isAuthenticated && (
          <div className="max-w-7xl mx-auto pt-4">
            <DashboardSkeleton />
          </div>
        )}

        {/* Harta, spusă pe rând.
            Aici era un panou de unsprezece blocuri, fiecare o cifră mare fără
            propoziție, toate cu aceeași greutate: Drumul Vieții cântărea exact
            cât „Streak: 0 days". Cine intra prima dată vedea șapte numere și
            nicio frază care să le lege.
            Firul spune un lucru, apoi următorul, în ordinea în care fiecare
            fapt distinge harta asta de oricare alta. Ce a plecat de aici --
            grila Lo Shu, calendarul lunar, compatibilitatea -- are deja o
            adresă proprie în navigație. */}
        {shouldShowDashboard && !loadingProfile && (
          <div className="pt-2">
            <Thread
              fullName={profile.fullName}
              birthDate={parseCalendarDate(profile.birthDate)}
            />
          </div>
        )}

        {/* Form for new calculations */}
        {shouldShowForm && !loadingProfile && (
          <div className="max-w-4xl mx-auto pt-4">
            <div className="max-w-md mx-auto">
              <div className="card-mystic rounded-2xl p-8 glow-gold-subtle">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
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
                    className="text-center p-4 rounded-xl bg-card/30 border border-border/30"
                  >
                    <h3 className="font-heading text-sm text-primary mb-1">{item.title}</h3>
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
          <div className="max-w-6xl mx-auto pt-4">
            <NumerologyResults
              fullName={userData.fullName}
              birthDate={userData.birthDate}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-foreground/70 font-raleway">
            {t.footer}
          </p>
        </div>
      </footer>
    </PageLayout>
  );
};

export default Index;
