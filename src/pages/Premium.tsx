// Premium Page
// Subscription management with tier comparison and one-time purchases

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PricingCards, OneTimePurchases } from '@/components/PricingCards';
import { AIConsultant } from '@/components/AIConsultant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Sparkles,
  FileText,
  Zap,
  MessageSquare,
  ShoppingBag,
  CheckCircle,
  Star,
  Shield,
  Clock,
} from 'lucide-react';
import { api } from '@/services/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTierById, type PremiumTier } from '@/lib/premium';

const Premium = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<PremiumTier>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isPremium: boolean;
    planName: string;
    status: string;
    expiresAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.checkSubscription();
      if (response.success) {
        setSubscriptionStatus({
          isPremium: response.isPremium,
          planName: response.planName,
          status: response.status,
          expiresAt: response.expiresAt,
        });
        // Map planName to tier
        if (response.planName === 'pro') {
          setCurrentTier('pro');
        } else if (response.isPremium) {
          setCurrentTier('premium');
        } else {
          setCurrentTier('free');
        }
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Premium',
      subtitle: 'Deblochează întregul potențial al numerologiei',
      plans: 'Planuri',
      aiConsultant: 'Consultant AI',
      purchases: 'Achiziții',
      currentPlan: 'Planul tău actual',
      active: 'Activ',
      expiresOn: 'Expiră pe',
      managePlan: 'Gestionează Planul',
      whyPremium: 'De Ce Premium?',
      benefit1Title: 'Analize Complete',
      benefit1Desc: 'Acces la toate calculatoarele și interpretările avansate',
      benefit2Title: 'Consultant AI Personal',
      benefit2Desc: 'Întreabă orice despre numerologie și primește răspunsuri personalizate',
      benefit3Title: 'Rapoarte PDF',
      benefit3Desc: 'Exportă și partajează lecturile tale în format profesional',
      benefit4Title: 'Fără Reclame',
      benefit4Desc: 'Experiență curată, fără întreruperi',
      guarantee: 'Garanție 30 de zile',
      guaranteeDesc: 'Nu ești mulțumit? Îți returnăm banii, fără întrebări.',
      securePayment: 'Plată Securizată',
      securePaymentDesc: 'Tranzacții protejate prin SSL',
      support: 'Suport Prioritar',
      supportDesc: 'Răspuns în maxim 24 de ore',
      aiLocked: 'Consultantul AI este disponibil pentru utilizatorii Premium și Pro',
      viewPlans: 'Vezi Planurile',
    },
    en: {
      title: 'Premium',
      subtitle: 'Unlock the full potential of numerology',
      plans: 'Plans',
      aiConsultant: 'AI Consultant',
      purchases: 'Purchases',
      currentPlan: 'Your current plan',
      active: 'Active',
      expiresOn: 'Expires on',
      managePlan: 'Manage Plan',
      whyPremium: 'Why Premium?',
      benefit1Title: 'Complete Analysis',
      benefit1Desc: 'Access all calculators and advanced interpretations',
      benefit2Title: 'Personal AI Consultant',
      benefit2Desc: 'Ask anything about numerology and get personalized answers',
      benefit3Title: 'PDF Reports',
      benefit3Desc: 'Export and share your readings in professional format',
      benefit4Title: 'Ad-Free',
      benefit4Desc: 'Clean experience, no interruptions',
      guarantee: '30-Day Guarantee',
      guaranteeDesc: "Not satisfied? We'll refund you, no questions asked.",
      securePayment: 'Secure Payment',
      securePaymentDesc: 'Transactions protected by SSL',
      support: 'Priority Support',
      supportDesc: 'Response within 24 hours',
      aiLocked: 'AI Consultant is available for Premium and Pro users',
      viewPlans: 'View Plans',
    },
    ru: {
      title: 'Премиум',
      subtitle: 'Раскройте весь потенциал нумерологии',
      plans: 'Планы',
      aiConsultant: 'ИИ Консультант',
      purchases: 'Покупки',
      currentPlan: 'Ваш текущий план',
      active: 'Активен',
      expiresOn: 'Истекает',
      managePlan: 'Управление Планом',
      whyPremium: 'Почему Премиум?',
      benefit1Title: 'Полный Анализ',
      benefit1Desc: 'Доступ ко всем калькуляторам и расширенным интерпретациям',
      benefit2Title: 'Личный ИИ Консультант',
      benefit2Desc: 'Задавайте любые вопросы о нумерологии и получайте персональные ответы',
      benefit3Title: 'PDF Отчёты',
      benefit3Desc: 'Экспортируйте и делитесь чтениями в профессиональном формате',
      benefit4Title: 'Без Рекламы',
      benefit4Desc: 'Чистый опыт, без прерываний',
      guarantee: '30-Дневная Гарантия',
      guaranteeDesc: 'Не довольны? Мы вернём деньги, без вопросов.',
      securePayment: 'Безопасная Оплата',
      securePaymentDesc: 'Транзакции защищены SSL',
      support: 'Приоритетная Поддержка',
      supportDesc: 'Ответ в течение 24 часов',
      aiLocked: 'ИИ Консультант доступен для пользователей Премиум и Про',
      viewPlans: 'Посмотреть Планы',
    },
  };

  const t = translations[language] || translations.en;
  const tierInfo = getTierById(currentTier);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Crown className="h-10 w-10 text-amber-500" />
              <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Current Subscription Status */}
        {!loading && subscriptionStatus && currentTier !== 'free' && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {currentTier === 'pro' ? (
                      <Crown className="h-6 w-6 text-purple-500" />
                    ) : (
                      <Star className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.currentPlan}</p>
                    <p className="text-2xl font-bold capitalize flex items-center gap-2">
                      {tierInfo?.name[language] || subscriptionStatus.planName}
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t.active}
                      </Badge>
                    </p>
                    {subscriptionStatus.expiresAt && (
                      <p className="text-sm text-muted-foreground">
                        {t.expiresOn}: {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline">{t.managePlan}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Why Premium - Benefits */}
        {currentTier === 'free' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {t.whyPremium}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{t.benefit1Title}</h3>
                  <p className="text-sm text-muted-foreground">{t.benefit1Desc}</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <MessageSquare className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold mb-1">{t.benefit2Title}</h3>
                  <p className="text-sm text-muted-foreground">{t.benefit2Desc}</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-amber-500 mb-3" />
                  <h3 className="font-semibold mb-1">{t.benefit3Title}</h3>
                  <p className="text-sm text-muted-foreground">{t.benefit3Desc}</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <Zap className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-1">{t.benefit4Title}</h3>
                  <p className="text-sm text-muted-foreground">{t.benefit4Desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t.plans}
            </TabsTrigger>
            <TabsTrigger value="consultant" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t.aiConsultant}
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t.purchases}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-8 mt-6">
            <PricingCards currentTier={currentTier} />

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold">{t.guarantee}</p>
                  <p className="text-sm text-muted-foreground">{t.guaranteeDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-semibold">{t.securePayment}</p>
                  <p className="text-sm text-muted-foreground">{t.securePaymentDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-semibold">{t.support}</p>
                  <p className="text-sm text-muted-foreground">{t.supportDesc}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consultant" className="mt-6">
            {currentTier !== 'free' ? (
              <AIConsultant />
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.aiConsultant}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t.aiLocked}</p>
                  <Button
                    onClick={() => {
                      const plansTab = document.querySelector('[value="plans"]');
                      if (plansTab) (plansTab as HTMLElement).click();
                    }}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    {t.viewPlans}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <OneTimePurchases />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Premium;
