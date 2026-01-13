// PricingCards Component
// Displays tier-based pricing with feature comparison

import { useState } from 'react';
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

interface PricingCardsProps {
  onSubscribe?: (tierId: PremiumTier, billingPeriod: 'monthly' | 'yearly') => void;
  currentTier?: PremiumTier;
}

export const PricingCards = ({ onSubscribe, currentTier = 'free' }: PricingCardsProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingTier, setLoadingTier] = useState<PremiumTier | null>(null);

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
    if (tier.id === 'free' || tier.id === currentTier) return;

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
          window.location.href = '/premium?success=true';
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierIcon = (tierId: PremiumTier) => {
    switch (tierId) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6 text-amber-500" />;
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />;
    }
  };

  const getButtonText = (tier: TierDefinition) => {
    if (tier.id === currentTier) return t.currentPlan;
    if (tier.id === 'free') return t.getStarted;
    if (currentTier !== 'free' && tier.id !== 'free') return t.upgrade;
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
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
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
          const price = tier.pricing
            ? billingPeriod === 'monthly'
              ? tier.pricing.monthly
              : tier.pricing.yearly / 12
            : 0;
          const totalPrice = tier.pricing
            ? billingPeriod === 'monthly'
              ? tier.pricing.monthly
              : tier.pricing.yearly
            : 0;
          const savings = tier.pricing ? calculateYearlySavings(tier) : 0;

          return (
            <Card
              key={tier.id}
              className={`relative flex flex-col transition-all duration-200 ${
                isHighlighted
                  ? 'border-primary border-2 shadow-lg scale-105 z-10'
                  : 'hover:border-primary/50'
              } ${isCurrentTier ? 'ring-2 ring-primary/20' : ''}`}
            >
              {/* Badge */}
              {isHighlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t.mostPopular}
                </Badge>
              )}
              {tier.id === 'pro' && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
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
                        <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
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
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
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
