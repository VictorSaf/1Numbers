// ChaldeanAnalysis Page
// Display Chaldean numerology analysis with compound numbers

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  calculateChaldeanAnalysis,
  getCompoundMeaning,
  getSingleDigitMeaning,
  getPlanetaryAssociation,
  getFavorableDays,
  getCompatibleNumbers,
  calculateBusinessNameNumber,
  ChaldeanAnalysis as ChaldeanAnalysisType,
} from '@/lib/chaldean';
import {
  Star,
  Calendar,
  User,
  Briefcase,
  Hash,
  Sparkles,
  Sun,
  Moon,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const ChaldeanAnalysis = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [businessName, setBusinessName] = useState('');
  const [showResults, setShowResults] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Numerologie Caldeană',
      description: 'Sistemul antic babilonian bazat pe vibrații numerice',
      personalTab: 'Analiză Personală',
      businessTab: 'Analiză Business',
      fullName: 'Nume Complet',
      birthDate: 'Data Nașterii',
      businessName: 'Nume Business',
      analyze: 'Analizează',
      nameNumber: 'Numărul Numelui',
      birthNumber: 'Numărul Nașterii',
      destinyNumber: 'Numărul Destinului',
      compoundNumber: 'Număr Compus',
      singleDigit: 'Cifră Simplă',
      letterBreakdown: 'Defalcare Litere',
      meaning: 'Semnificație',
      keywords: 'Cuvinte Cheie',
      planet: 'Planetă',
      favorableDays: 'Zile Favorabile',
      compatibleNumbers: 'Numere Compatibile',
      positive: 'Pozitiv',
      negative: 'Negativ',
      neutral: 'Neutru',
      businessAnalysis: 'Analiză Nume Business',
      isLucky: 'Este Norocos',
      notLucky: 'Nu Este Norocos',
      luckyNumbers: 'Numere Norocoase pentru Business',
      avoidNumbers: 'Numere de Evitat',
      enterName: 'Introdu un nume pentru analiză',
      howItWorks: 'Cum Funcționează',
      howItWorksDesc: 'Sistemul Caldean atribuie valori 1-8 literelor (9 este sacru). Se concentrează pe vibrațiile numelui și numerele compuse.',
    },
    en: {
      title: 'Chaldean Numerology',
      description: 'Ancient Babylonian system based on numeric vibrations',
      personalTab: 'Personal Analysis',
      businessTab: 'Business Analysis',
      fullName: 'Full Name',
      birthDate: 'Birth Date',
      businessName: 'Business Name',
      analyze: 'Analyze',
      nameNumber: 'Name Number',
      birthNumber: 'Birth Number',
      destinyNumber: 'Destiny Number',
      compoundNumber: 'Compound Number',
      singleDigit: 'Single Digit',
      letterBreakdown: 'Letter Breakdown',
      meaning: 'Meaning',
      keywords: 'Keywords',
      planet: 'Planet',
      favorableDays: 'Favorable Days',
      compatibleNumbers: 'Compatible Numbers',
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
      businessAnalysis: 'Business Name Analysis',
      isLucky: 'Is Lucky',
      notLucky: 'Not Lucky',
      luckyNumbers: 'Lucky Numbers for Business',
      avoidNumbers: 'Numbers to Avoid',
      enterName: 'Enter a name to analyze',
      howItWorks: 'How It Works',
      howItWorksDesc: 'The Chaldean system assigns values 1-8 to letters (9 is sacred). It focuses on name vibrations and compound numbers.',
    },
    ru: {
      title: 'Халдейская Нумерология',
      description: 'Древняя вавилонская система на основе числовых вибраций',
      personalTab: 'Личный Анализ',
      businessTab: 'Бизнес Анализ',
      fullName: 'Полное Имя',
      birthDate: 'Дата Рождения',
      businessName: 'Название Бизнеса',
      analyze: 'Анализировать',
      nameNumber: 'Число Имени',
      birthNumber: 'Число Рождения',
      destinyNumber: 'Число Судьбы',
      compoundNumber: 'Составное Число',
      singleDigit: 'Однозначное',
      letterBreakdown: 'Разбор Букв',
      meaning: 'Значение',
      keywords: 'Ключевые Слова',
      planet: 'Планета',
      favorableDays: 'Благоприятные Дни',
      compatibleNumbers: 'Совместимые Числа',
      positive: 'Положительный',
      negative: 'Отрицательный',
      neutral: 'Нейтральный',
      businessAnalysis: 'Анализ Названия Бизнеса',
      isLucky: 'Удачное',
      notLucky: 'Неудачное',
      luckyNumbers: 'Удачные Числа для Бизнеса',
      avoidNumbers: 'Числа для Избегания',
      enterName: 'Введите имя для анализа',
      howItWorks: 'Как Это Работает',
      howItWorksDesc: 'Халдейская система присваивает значения 1-8 буквам (9 священно). Фокусируется на вибрациях имени и составных числах.',
    },
  };

  const t = translations[language] || translations.en;

  const analysis = useMemo<ChaldeanAnalysisType | null>(() => {
    if (!fullName || !birthDate || !showResults) return null;
    return calculateChaldeanAnalysis(fullName, new Date(birthDate));
  }, [fullName, birthDate, showResults]);

  const businessAnalysis = useMemo(() => {
    if (!businessName) return null;
    return calculateBusinessNameNumber(businessName);
  }, [businessName]);

  const handleAnalyze = () => {
    if (fullName && birthDate) {
      setShowResults(true);
    }
  };

  const getNatureColor = (nature: 'positive' | 'negative' | 'neutral') => {
    switch (nature) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getNatureBadge = (nature: 'positive' | 'negative' | 'neutral') => {
    switch (nature) {
      case 'positive':
        return <Badge className="bg-green-500">{t.positive}</Badge>;
      case 'negative':
        return <Badge variant="destructive">{t.negative}</Badge>;
      default:
        return <Badge variant="secondary">{t.neutral}</Badge>;
    }
  };

  const renderNumberCard = (
    title: string,
    compound: number,
    single: number,
    icon: React.ReactNode
  ) => {
    const compoundMeaning = getCompoundMeaning(compound, language);
    const singleMeaning = getSingleDigitMeaning(single, language);
    const planet = getPlanetaryAssociation(single, language);

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{compound}</div>
              <div className="text-sm text-muted-foreground">{t.compoundNumber}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-amber-500">{single}</div>
              <div className="text-sm text-muted-foreground">{t.singleDigit}</div>
            </div>
          </div>

          {compoundMeaning && (
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{compoundMeaning.title}</span>
                {getNatureBadge(compoundMeaning.nature)}
              </div>
              <p className="text-sm text-muted-foreground">{compoundMeaning.meaning}</p>
            </div>
          )}

          {singleMeaning && (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {singleMeaning.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{singleMeaning.description}</p>
            </div>
          )}

          {planet && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl">{planet.symbol}</span>
              <span className="text-muted-foreground">
                {t.planet}: <strong>{planet.planet}</strong>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Star className="h-12 w-12 text-amber-500" />
            <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {/* How It Works */}
      <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="h-5 w-5 text-amber-500" />
            {t.howItWorks}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.howItWorksDesc}</p>
          <div className="mt-4 flex gap-1 flex-wrap">
            {['A=1', 'B=2', 'C=3', 'D=4', 'E=5', 'F=8', 'G=3', 'H=5', 'I=1', 'J=1', 'K=2', 'L=3', 'M=4', 'N=5', 'O=7', 'P=8', 'Q=1', 'R=2', 'S=3', 'T=4', 'U=6', 'V=6', 'W=6', 'X=5', 'Y=1', 'Z=7'].map((pair) => (
              <Badge key={pair} variant="outline" className="font-mono text-xs">
                {pair}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t.personalTab}
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {t.businessTab}
          </TabsTrigger>
        </TabsList>

        {/* Personal Analysis Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.personalTab}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.fullName}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setShowResults(false);
                    }}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">{t.birthDate}</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setShowResults(false);
                    }}
                  />
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={!fullName || !birthDate}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t.analyze}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <>
              {/* Letter Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.letterBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.letterBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center p-2 bg-muted rounded-lg min-w-[40px]"
                      >
                        <span className="font-bold">{item.letter}</span>
                        <span className="text-sm text-amber-500">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center p-2 bg-primary/20 rounded-lg min-w-[40px]">
                      <span className="font-bold">=</span>
                      <span className="text-sm text-primary">
                        {analysis.nameNumber.compound}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Number Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {renderNumberCard(
                  t.nameNumber,
                  analysis.nameNumber.compound,
                  analysis.nameNumber.single,
                  <User className="h-5 w-5 text-primary" />
                )}
                {renderNumberCard(
                  t.birthNumber,
                  analysis.birthNumber.compound,
                  analysis.birthNumber.single,
                  <Calendar className="h-5 w-5 text-blue-500" />
                )}
                {renderNumberCard(
                  t.destinyNumber,
                  analysis.destinyNumber.compound,
                  analysis.destinyNumber.single,
                  <Star className="h-5 w-5 text-amber-500" />
                )}
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sun className="h-5 w-5 text-amber-500" />
                      {t.favorableDays}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getFavorableDays(analysis.nameNumber.single).map((day) => (
                        <Badge key={day} variant="secondary">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Moon className="h-5 w-5 text-purple-500" />
                      {t.compatibleNumbers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getCompatibleNumbers(analysis.nameNumber.single).map((num) => (
                        <Badge key={num} variant="outline" className="text-lg">
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Business Analysis Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.businessAnalysis}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">{t.businessName}</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>
            </CardContent>
          </Card>

          {businessName && businessAnalysis && (
            <>
              <Card className={businessAnalysis.isLucky ? 'border-green-500/50' : 'border-red-500/50'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary">
                          {businessAnalysis.compound}
                        </div>
                        <div className="text-sm text-muted-foreground">{t.compoundNumber}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-500">
                          {businessAnalysis.single}
                        </div>
                        <div className="text-sm text-muted-foreground">{t.singleDigit}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {businessAnalysis.isLucky ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <span className="font-bold text-green-500">{t.isLucky}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-red-500" />
                          <span className="font-bold text-red-500">{t.notLucky}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Compound meaning */}
                  {getCompoundMeaning(businessAnalysis.compound, language) && (
                    <div className="p-3 border rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          {getCompoundMeaning(businessAnalysis.compound, language)?.title}
                        </span>
                        {getNatureBadge(
                          getCompoundMeaning(businessAnalysis.compound, language)?.nature || 'neutral'
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getCompoundMeaning(businessAnalysis.compound, language)?.meaning}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      {t.luckyNumbers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {businessAnalysis.luckyNumbers.map((num) => (
                        <Badge
                          key={num}
                          variant={
                            num === businessAnalysis.compound || num === businessAnalysis.single
                              ? 'default'
                              : 'outline'
                          }
                          className={
                            num === businessAnalysis.compound || num === businessAnalysis.single
                              ? 'bg-green-500'
                              : ''
                          }
                        >
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                      {t.avoidNumbers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {businessAnalysis.avoidNumbers.map((num) => (
                        <Badge
                          key={num}
                          variant={
                            num === businessAnalysis.compound || num === businessAnalysis.single
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChaldeanAnalysis;
