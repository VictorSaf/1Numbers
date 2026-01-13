// Remedies Page
// Display numerological remedies based on user's numbers

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RemedyCard } from '@/components/RemedyCard';
import { getRemedyForNumber, getAllRemedies, getDailyRemedy, NumberRemedy } from '@/lib/remedies';
import { calculateLifePathNumber, calculateDestinyNumber } from '@/lib/numerology';
import {
  Sparkles,
  User,
  Calendar,
  Hash,
  Sun,
  Star,
  Gem,
  Palette,
  Quote,
} from 'lucide-react';

const Remedies = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Remedii Numerologice',
      description: 'Descoperă culorile, pietrele și mantrele tale favorabile',
      personalRemedies: 'Remedii Personale',
      todayRemedy: 'Remediul Zilei',
      allRemedies: 'Toate Remediile',
      yourNumbers: 'Numerele Tale',
      lifePath: 'Life Path',
      destiny: 'Destin',
      enterDetails: 'Introdu datele pentru remedii personalizate',
      calculate: 'Calculează Remedii',
      selectNumber: 'Selectează un număr pentru detalii',
      todayIs: 'Astăzi este ziua lui',
      todayRemedyDesc: 'Remediile recomandate pentru ziua de azi',
      clickForDetails: 'Click pentru detalii complete',
      backToList: 'Înapoi la listă',
    },
    en: {
      title: 'Numerological Remedies',
      description: 'Discover your favorable colors, gemstones and mantras',
      personalRemedies: 'Personal Remedies',
      todayRemedy: "Today's Remedy",
      allRemedies: 'All Remedies',
      yourNumbers: 'Your Numbers',
      lifePath: 'Life Path',
      destiny: 'Destiny',
      enterDetails: 'Enter your details for personalized remedies',
      calculate: 'Calculate Remedies',
      selectNumber: 'Select a number for details',
      todayIs: "Today is the day of",
      todayRemedyDesc: 'Recommended remedies for today',
      clickForDetails: 'Click for full details',
      backToList: 'Back to list',
    },
    ru: {
      title: 'Нумерологические Средства',
      description: 'Откройте благоприятные цвета, камни и мантры',
      personalRemedies: 'Личные Средства',
      todayRemedy: 'Средство Дня',
      allRemedies: 'Все Средства',
      yourNumbers: 'Ваши Числа',
      lifePath: 'Путь Жизни',
      destiny: 'Судьба',
      enterDetails: 'Введите данные для персональных средств',
      calculate: 'Рассчитать Средства',
      selectNumber: 'Выберите число для подробностей',
      todayIs: 'Сегодня день',
      todayRemedyDesc: 'Рекомендуемые средства на сегодня',
      clickForDetails: 'Нажмите для подробностей',
      backToList: 'Назад к списку',
    },
  };

  const t = translations[language] || translations.en;

  const userNumbers = useMemo(() => {
    if (!birthDate || !fullName) return null;
    const date = new Date(birthDate);
    return {
      lifePath: calculateLifePathNumber(date),
      destiny: calculateDestinyNumber(fullName),
    };
  }, [birthDate, fullName]);

  const lifePathRemedy = useMemo(() => {
    if (!userNumbers) return null;
    return getRemedyForNumber(userNumbers.lifePath, language);
  }, [userNumbers, language]);

  const destinyRemedy = useMemo(() => {
    if (!userNumbers) return null;
    return getRemedyForNumber(userNumbers.destiny, language);
  }, [userNumbers, language]);

  const todayRemedy = useMemo(() => {
    return getDailyRemedy(new Date(), language);
  }, [language]);

  const allRemedies = useMemo(() => {
    return getAllRemedies(language);
  }, [language]);

  const selectedRemedy = useMemo(() => {
    if (!selectedNumber) return null;
    return getRemedyForNumber(selectedNumber, language);
  }, [selectedNumber, language]);

  if (selectedRemedy) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setSelectedNumber(null)}
          className="mb-4"
        >
          &larr; {t.backToList}
        </Button>
        <RemedyCard remedy={selectedRemedy} showAll />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Gem className="h-12 w-12 text-purple-500" />
            <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t.personalRemedies}
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            {t.todayRemedy}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {t.allRemedies}
          </TabsTrigger>
        </TabsList>

        {/* Personal Remedies Tab */}
        <TabsContent value="personal" className="space-y-6">
          {!userNumbers ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.enterDetails}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.yourNumbers}</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Your Numbers Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t.yourNumbers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: lifePathRemedy?.colors.hex || '#6366f1' }}
                      >
                        {userNumbers.lifePath}
                      </div>
                      <div>
                        <p className="font-medium">{t.lifePath}</p>
                        <p className="text-sm text-muted-foreground">
                          {lifePathRemedy?.planet.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: destinyRemedy?.colors.hex || '#8b5cf6' }}
                      >
                        {userNumbers.destiny}
                      </div>
                      <div>
                        <p className="font-medium">{t.destiny}</p>
                        <p className="text-sm text-muted-foreground">
                          {destinyRemedy?.planet.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Life Path Remedy */}
              {lifePathRemedy && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    {t.lifePath} {userNumbers.lifePath} - {lifePathRemedy.planet.name}
                  </h2>
                  <RemedyCard remedy={lifePathRemedy} showAll />
                </div>
              )}

              {/* Destiny Remedy (if different) */}
              {destinyRemedy && userNumbers.destiny !== userNumbers.lifePath && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    {t.destiny} {userNumbers.destiny} - {destinyRemedy.planet.name}
                  </h2>
                  <RemedyCard remedy={destinyRemedy} showAll />
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Today's Remedy Tab */}
        <TabsContent value="today" className="space-y-6">
          {todayRemedy && (
            <>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Sun className="h-8 w-8 text-amber-500" />
                    <div>
                      <CardTitle>
                        {t.todayIs} {todayRemedy.remedy.planet.symbol} {todayRemedy.remedy.planet.name}
                      </CardTitle>
                      <CardDescription>{t.todayRemedyDesc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Palette className="h-5 w-5" style={{ color: todayRemedy.remedy.colors.hex }} />
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-medium">{todayRemedy.remedy.colors.primary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Gem className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gemstone</p>
                        <p className="font-medium">{todayRemedy.remedy.gemstones.primary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Quote className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mantra</p>
                        <p className="font-medium text-sm">{todayRemedy.remedy.mantras.vedic}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <RemedyCard remedy={todayRemedy.remedy} showAll />
            </>
          )}
        </TabsContent>

        {/* All Remedies Tab */}
        <TabsContent value="all" className="space-y-4">
          <p className="text-muted-foreground text-center mb-4">{t.selectNumber}</p>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
            {allRemedies.map((remedy) => (
              <Card
                key={remedy.number}
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => setSelectedNumber(remedy.number)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold text-white mb-2"
                    style={{ backgroundColor: remedy.colors.hex }}
                  >
                    {remedy.number}
                  </div>
                  <p className="text-sm font-medium">{remedy.planet.symbol}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {remedy.planet.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Reference Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {/* Colors Quick Reference */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allRemedies.map((r) => (
                    <div key={r.number} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ backgroundColor: r.colors.hex }}
                      >
                        {r.number}
                      </div>
                      <span className="text-sm">{r.colors.primary}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gemstones Quick Reference */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gem className="h-5 w-5 text-purple-500" />
                  Gemstones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allRemedies.map((r) => (
                    <div key={r.number} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                        {r.number}
                      </Badge>
                      <span className="text-sm">{r.gemstones.primary}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Days Quick Reference */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allRemedies.map((r) => (
                    <div key={r.number} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                        {r.number}
                      </Badge>
                      <span className="text-sm">{r.days.favorable.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Remedies;
