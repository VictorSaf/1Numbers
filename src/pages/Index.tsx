import { useState, useEffect } from "react";
import { Sparkles, Moon, Sun, Stars } from "lucide-react";
import { NumerologyForm } from "@/components/NumerologyForm";
import { NumerologyResults } from "@/components/NumerologyResults";
import { BentoDashboard } from "@/components/dashboard/BentoDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

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
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadStreak();
    } else {
      setProfile(null);
      setStreak(0);
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

  const loadStreak = async () => {
    try {
      const response = await api.getStreak();
      if (response.success && response.streak !== undefined) {
        setStreak(response.streak);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleCalculate = (data: UserData) => {
    setUserData(data);
    setShowDashboard(false);
  };

  const handleReset = () => {
    setUserData(null);
    if (profile) {
      setShowDashboard(true);
    }
  };

  const handleNewCalculation = () => {
    setShowDashboard(false);
    setUserData(null);
  };

  // Determine what to show
  const shouldShowDashboard = isAuthenticated && profile && showDashboard && !userData;
  const shouldShowResults = userData !== null;
  const shouldShowForm = !shouldShowDashboard && !shouldShowResults;

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
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
      />

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-16">
        {/* Dashboard Loading State */}
        {loadingProfile && isAuthenticated && (
          <div className="max-w-7xl mx-auto pt-4">
            <DashboardSkeleton />
          </div>
        )}

        {/* Bento Dashboard for authenticated users with profile */}
        {shouldShowDashboard && !loadingProfile && (
          <BentoDashboard
            fullName={profile.fullName}
            birthDate={new Date(profile.birthDate)}
            userName={user?.email?.split('@')[0] || profile.fullName}
            streak={streak}
          />
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
                  <h2 className="font-cinzel text-2xl text-foreground mb-2">
                    {t.formTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t.formSubtitle}
                  </p>
                </div>

                <NumerologyForm
                  onCalculate={handleCalculate}
                  profileData={profile ? {
                    fullName: profile.fullName,
                    birthDate: new Date(profile.birthDate)
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
                    <h3 className="font-cinzel text-sm text-primary mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results view */}
        {shouldShowResults && (
          <div className="max-w-4xl mx-auto pt-4">
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
