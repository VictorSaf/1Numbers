// PricingCards Component
// Displays tier-based pricing with feature comparison

import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/apiBase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, Crown, Star, Zap, Sparkles } from 'lucide-react';
import {
  TIERS,
  ONE_TIME_PURCHASES,
  formatPrice,
  calculateYearlySavings,
  type PremiumTier,
  type TierDefinition,
} from '@/lib/premium';
import { api } from '@/services/api';
import { track } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PricingCardsProps {
  onSubscribe?: (tierId: PremiumTier, billingPeriod: 'monthly' | 'yearly') => void;
  currentTier?: PremiumTier;
}

export const PricingCards = ({ onSubscribe, currentTier = 'free' }: PricingCardsProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingTier, setLoadingTier] = useState<PremiumTier | null>(null);

  // Amounts come from the server, never from the bundle: the two used to disagree
  // by up to 2.5x. While this is null no price is rendered at all -- showing a
  // stale or guessed figure on a checkout page is worse than showing none.
  const [serverPricing, setServerPricing] = useState<Record<string, { monthly: number; yearly: number }> | null>(null);

  useEffect(() => { track('paywall_shown'); }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/subscriptions/plans`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        const byName: Record<string, { monthly: number; yearly: number }> = {};
        for (const plan of data.plans ?? []) {
          byName[plan.name] = { monthly: Number(plan.priceMonthly), yearly: Number(plan.priceYearly) };
        }
        setServerPricing(byName);
      })
      .catch(() => {
        if (!cancelled) setServerPricing(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      monthly: 'Lunar',
      yearly: 'Anual',
      save: 'Economisește',
      perMonth: '/lună',
      perYear: '/an',
      currentPlan: 'Planul Actual',
      upgrade: 'Upgrade',
      subscribe: 'Abonează-te',
      getStarted: 'Începe Gratuit',
      mostPopular: 'Cel Mai Popular',
      loginRequired: 'Cont necesar',
      loginRequiredDesc: 'Conectează-te sau creează un cont pentru a te abona.',
      errorTitle: 'Abonarea nu a reușit',
      errorGeneric: 'A apărut o eroare. Încearcă din nou.',
      billingClosed: 'Plățile nu sunt disponibile',
      billingClosedDesc: 'Abonamentele nu se pot cumpăra încă. Nu ți s-a luat niciun ban.',
      bestValue: 'Cea Mai Bună Valoare',
      billedYearly: 'Facturat anual',
      billedMonthly: 'Facturat lunar',
      yearlyBilling: 'Facturare Anuală',
      savePercent: 'Economisești',
      free: 'Gratuit',
      included: 'Inclus',
      notIncluded: 'Nu este inclus',
    },
    en: {
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save',
      perMonth: '/month',
      perYear: '/year',
      currentPlan: 'Current Plan',
      upgrade: 'Upgrade',
      subscribe: 'Subscribe',
      getStarted: 'Get Started Free',
      mostPopular: 'Most Popular',
      loginRequired: 'Account required',
      loginRequiredDesc: 'Sign in or create an account to subscribe.',
      errorTitle: 'Subscription failed',
      errorGeneric: 'Something went wrong. Please try again.',
      billingClosed: 'Payments are unavailable',
      billingClosedDesc: 'Subscriptions cannot be bought yet. You have not been charged.',
      bestValue: 'Best Value',
      billedYearly: 'Billed yearly',
      billedMonthly: 'Billed monthly',
      yearlyBilling: 'Yearly Billing',
      savePercent: 'Save',
      free: 'Free',
      included: 'Included',
      notIncluded: 'Not included',
    },
    ru: {
      monthly: 'Ежемесячно',
      yearly: 'Ежегодно',
      save: 'Сэкономить',
      perMonth: '/месяц',
      perYear: '/год',
      currentPlan: 'Текущий План',
      upgrade: 'Обновить',
      subscribe: 'Подписаться',
      getStarted: 'Начать Бесплатно',
      mostPopular: 'Самый Популярный',
      loginRequired: 'Требуется аккаунт',
      loginRequiredDesc: 'Войдите или создайте аккаунт, чтобы оформить подписку.',
      errorTitle: 'Не удалось оформить подписку',
      errorGeneric: 'Произошла ошибка. Попробуйте ещё раз.',
      billingClosed: 'Оплата недоступна',
      billingClosedDesc: 'Подписку пока нельзя купить. Деньги не списаны.',
      bestValue: 'Лучшая Цена',
      billedYearly: 'Оплата за год',
      billedMonthly: 'Оплата за месяц',
      yearlyBilling: 'Годовая Оплата',
      savePercent: 'Экономия',
      free: 'Бесплатно',
      included: 'Включено',
      notIncluded: 'Не включено',
    },
  };

  const t = translations[language] || translations.en;

  const handleSubscribe = async (tier: TierDefinition) => {
    track('subscribe_clicked', { plan: tier.id, period: billingPeriod });
    if (tier.id === 'free' || tier.id === currentTier) return;

    // Subscribing needs an account; without this the request 401'd in silence.
    // The chosen plan travels along so the visitor returns to where they were.
    if (!isAuthenticated) {
      toast({ title: t.loginRequired, description: t.loginRequiredDesc });
      navigate(`/auth?redirect=${encodeURIComponent(`/raport?plan=${tier.id}&period=${billingPeriod}`)}`);
      return;
    }

    setLoadingTier(tier.id);
    try {
      if (onSubscribe) {
        await onSubscribe(tier.id, billingPeriod);
      } else {
        // Default behavior - call API
        const response = await api.createSubscription({
          planId: tier.id === 'premium' ? 2 : 3, // Map to existing plan IDs
          billingPeriod,
        });
        if (response.success) {
          window.location.href = '/raport?success=true';
        }
      }
    } catch (error) {
      // Previously this only reached the console: the button stopped spinning and
      // the visitor was told nothing at all.
      console.error('Subscription error:', error);
      // 403 is the billing gate on the API, not a failure the visitor caused, so
      // it gets its own copy in their language rather than the server's English.
      const status = (error as { status?: number } | null)?.status;
      toast({
        title: status === 403 ? t.billingClosed : t.errorTitle,
        description:
          status === 403
            ? t.billingClosedDesc
            : error instanceof Error
              ? error.message
              : t.errorGeneric,
        variant: 'destructive',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierIcon = (tierId: PremiumTier) => {
    switch (tierId) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6 text-warn" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
    }
  };

  const getButtonText = (tier: TierDefinition) => {
    if (tier.id === currentTier) return t.currentPlan;
    if (tier.id === 'free') return t.getStarted;
    if (currentTier !== 'free') return t.upgrade;
    return t.subscribe;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label
          htmlFor="billing-toggle"
          className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}
        >
          {t.monthly}
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
        />
        <Label
          htmlFor="billing-toggle"
          className={billingPeriod === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}
        >
          {t.yearly}
          <Badge variant="secondary" className="ml-2 bg-ok-soft text-ok">
            {t.savePercent} 33%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const isHighlighted = tier.highlighted;
          const isFree = tier.id === 'free';
          const amounts = serverPricing?.[tier.id] ?? null;
          const price = amounts ? (billingPeriod === 'monthly' ? amounts.monthly : amounts.yearly / 12) : 0;
          const totalPrice = amounts ? (billingPeriod === 'monthly' ? amounts.monthly : amounts.yearly) : 0;
          const savings = amounts ? calculateYearlySavings(amounts.monthly, amounts.yearly) : 0;

          return (
            <Card
              key={tier.id}
              className={`relative flex flex-col transition-all duration-200 ${ isHighlighted ? 'border-primary border-2 shadow-lg scale-105 z-10' : 'hover:border-line' } ${isCurrentTier ? 'ring-2 ring-primary/20' : ''}`}
            >
              {/* Badge */}
              {isHighlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t.mostPopular}
                </Badge>
              )}
              {tier.id === 'pro' && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Crown className="h-3 w-3 mr-1" />
                  {t.bestValue}
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">{getTierIcon(tier.id)}</div>
                <CardTitle className="text-2xl">
                  {tier.badge} {tier.name[language] || tier.name.en}
                </CardTitle>
                <CardDescription>
                  {tier.description[language] || tier.description.en}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                {/* Price */}
                <div className="text-center mb-6">
                  {isFree ? (
                    <div className="text-4xl font-bold">{t.free}</div>
                  ) : !amounts ? (
                    <div className="h-16 flex items-center justify-center">
                      <div className="h-8 w-28 rounded bg-muted animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">
                          {formatPrice(price, tier.pricing!.currency)}
                        </span>
                        <span className="text-muted-foreground">{t.perMonth}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {billingPeriod === 'yearly'
                          ? `${formatPrice(totalPrice, tier.pricing!.currency)} ${t.billedYearly}`
                          : t.billedMonthly}
                      </p>
                      {billingPeriod === 'yearly' && savings > 0 && (
                        <Badge variant="outline" className="mt-2 text-ok border-ok">
                          {t.save} {formatPrice(savings, tier.pricing!.currency)}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-ok shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      <div className={!feature.included ? 'text-muted-foreground/50' : ''}>
                        <span className="text-sm font-medium">
                          {feature.name[language] || feature.name.en}
                        </span>
                        {feature.limit && feature.limit !== 'unlimited' && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {feature.limit}
                          </Badge>
                        )}
                        {feature.limit === 'unlimited' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            ∞
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  className="w-full"
                  variant={isHighlighted ? 'default' : tier.id === 'pro' ? 'default' : 'outline'}
                  size="lg"
                  disabled={isCurrentTier || loadingTier === tier.id}
                  onClick={() => handleSubscribe(tier)}
                >
                  {loadingTier === tier.id ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    getButtonText(tier)
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// One-time purchases component
export const OneTimePurchases = () => {
  const { language } = useLanguage();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Achiziții Individuale',
      description: 'Cumpără rapoarte și analize fără abonament',
      buy: 'Cumpără',
      reports: 'Rapoarte',
      analysis: 'Analize',
      consultations: 'Consultații',
    },
    en: {
      title: 'One-Time Purchases',
      description: 'Buy reports and analyses without subscription',
      buy: 'Buy',
      reports: 'Reports',
      analysis: 'Analysis',
      consultations: 'Consultations',
    },
    ru: {
      title: 'Разовые Покупки',
      description: 'Купите отчёты и анализы без подписки',
      buy: 'Купить',
      reports: 'Отчёты',
      analysis: 'Анализы',
      consultations: 'Консультации',
    },
  };

  const t = translations[language] || translations.en;

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId);
    try {
      // Implement purchase logic
      console.log('Purchasing:', productId);
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      setPurchasing(null);
    }
  };

  const groupedProducts = {
    report: ONE_TIME_PURCHASES.filter((p) => p.type === 'report'),
    analysis: ONE_TIME_PURCHASES.filter((p) => p.type === 'analysis'),
    consultation: ONE_TIME_PURCHASES.filter((p) => p.type === 'consultation'),
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(groupedProducts).map(([type, products]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-lg">
                {type === 'report' && t.reports}
                {type === 'analysis' && t.analysis}
                {type === 'consultation' && t.consultations}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {product.name[language] || product.name.en}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.description[language] || product.description.en}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={purchasing === product.id}
                    onClick={() => handlePurchase(product.id)}
                  >
                    {purchasing === product.id
                      ? '...'
                      : formatPrice(product.price, product.currency)}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingCards;
