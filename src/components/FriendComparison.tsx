// FriendComparison Component
// Displays numerological comparison between user and a friend

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateLifePathNumber, calculateDestinyNumber, calculateSoulUrgeNumber, calculatePersonalityNumber } from '@/lib/numerology';
import { calculateCompatibility } from '@/lib/compatibility';
import { Heart, Users, Sparkles, ArrowRight, Star } from 'lucide-react';

interface PersonData {
  birthDate: string;
  fullName: string;
}

interface FriendComparisonProps {
  user: PersonData;
  friend: PersonData & { email?: string };
  friendName?: string;
}

export const FriendComparison = ({ user, friend, friendName }: FriendComparisonProps) => {
  const { language } = useLanguage();

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Comparație Numerologică',
      description: 'Descoperă compatibilitatea ta cu',
      overallCompatibility: 'Compatibilitate Generală',
      lifePathMatch: 'Potrivire Life Path',
      destinyMatch: 'Potrivire Destin',
      soulMatch: 'Potrivire Suflet',
      personalityMatch: 'Potrivire Personalitate',
      yourNumbers: 'Numerele Tale',
      friendNumbers: 'Numerele Prietenului',
      lifePath: 'Life Path',
      destiny: 'Destin',
      soulUrge: 'Suflet',
      personality: 'Personalitate',
      excellent: 'Excelent',
      veryGood: 'Foarte Bun',
      good: 'Bun',
      moderate: 'Moderat',
      challenging: 'Provocator',
      analysis: 'Analiza Relației',
      strengths: 'Puncte Forte',
      challenges: 'Provocări',
    },
    en: {
      title: 'Numerology Comparison',
      description: 'Discover your compatibility with',
      overallCompatibility: 'Overall Compatibility',
      lifePathMatch: 'Life Path Match',
      destinyMatch: 'Destiny Match',
      soulMatch: 'Soul Match',
      personalityMatch: 'Personality Match',
      yourNumbers: 'Your Numbers',
      friendNumbers: "Friend's Numbers",
      lifePath: 'Life Path',
      destiny: 'Destiny',
      soulUrge: 'Soul Urge',
      personality: 'Personality',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      moderate: 'Moderate',
      challenging: 'Challenging',
      analysis: 'Relationship Analysis',
      strengths: 'Strengths',
      challenges: 'Challenges',
    },
    ru: {
      title: 'Нумерологическое Сравнение',
      description: 'Узнайте вашу совместимость с',
      overallCompatibility: 'Общая Совместимость',
      lifePathMatch: 'Совпадение Пути Жизни',
      destinyMatch: 'Совпадение Судьбы',
      soulMatch: 'Совпадение Души',
      personalityMatch: 'Совпадение Личности',
      yourNumbers: 'Ваши Числа',
      friendNumbers: 'Числа Друга',
      lifePath: 'Путь Жизни',
      destiny: 'Судьба',
      soulUrge: 'Душа',
      personality: 'Личность',
      excellent: 'Отлично',
      veryGood: 'Очень Хорошо',
      good: 'Хорошо',
      moderate: 'Умеренно',
      challenging: 'Сложно',
      analysis: 'Анализ Отношений',
      strengths: 'Сильные Стороны',
      challenges: 'Вызовы',
    },
  };

  const t = translations[language] || translations.en;

  const userNumbers = useMemo(() => {
    const birthDate = new Date(user.birthDate);
    return {
      lifePath: calculateLifePathNumber(birthDate),
      destiny: calculateDestinyNumber(user.fullName),
      soulUrge: calculateSoulUrgeNumber(user.fullName),
      personality: calculatePersonalityNumber(user.fullName),
    };
  }, [user.birthDate, user.fullName]);

  const friendNumbers = useMemo(() => {
    const birthDate = new Date(friend.birthDate);
    return {
      lifePath: calculateLifePathNumber(birthDate),
      destiny: calculateDestinyNumber(friend.fullName),
      soulUrge: calculateSoulUrgeNumber(friend.fullName),
      personality: calculatePersonalityNumber(friend.fullName),
    };
  }, [friend.birthDate, friend.fullName]);

  const compatibility = useMemo(() => {
    const userDate = new Date(user.birthDate);
    const friendDate = new Date(friend.birthDate);
    return calculateCompatibility(
      userDate,
      user.fullName,
      friendDate,
      friend.fullName
    );
  }, [user, friend]);

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t.excellent;
    if (score >= 75) return t.veryGood;
    if (score >= 60) return t.good;
    if (score >= 45) return t.moderate;
    return t.challenging;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 45) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 45) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const displayName = friendName || friend.fullName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Overall Compatibility Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          </div>
          <CardTitle className="text-2xl">{t.overallCompatibility}</CardTitle>
          <CardDescription>
            {t.description} {displayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="relative pt-4">
            <div className={`text-6xl font-bold ${getScoreColor(compatibility.overallScore)}`}>
              {compatibility.overallScore}%
            </div>
            <Badge
              variant="outline"
              className={`mt-2 ${getScoreColor(compatibility.overallScore)}`}
            >
              {getScoreLabel(compatibility.overallScore)}
            </Badge>
          </div>
          <div className="mt-6">
            <Progress
              value={compatibility.overallScore}
              className={`h-3 ${getProgressColor(compatibility.overallScore)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Numbers Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Your Numbers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t.yourNumbers}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.lifePath}</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {userNumbers.lifePath}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.destiny}</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {userNumbers.destiny}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.soulUrge}</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {userNumbers.soulUrge}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.personality}</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {userNumbers.personality}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friend's Numbers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">{t.friendNumbers}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.lifePath}</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {friendNumbers.lifePath}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.destiny}</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {friendNumbers.destiny}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.soulUrge}</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {friendNumbers.soulUrge}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.personality}</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {friendNumbers.personality}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Match Scores */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>{t.analysis}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Life Path Match */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{t.lifePathMatch}</span>
                <span className="text-muted-foreground text-sm">
                  ({userNumbers.lifePath} <ArrowRight className="inline h-3 w-3" /> {friendNumbers.lifePath})
                </span>
              </div>
              <span className={`font-bold ${getScoreColor(compatibility.lifePathScore)}`}>
                {compatibility.lifePathScore}%
              </span>
            </div>
            <Progress
              value={compatibility.lifePathScore}
              className="h-2"
            />
          </div>

          {/* Destiny Match */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{t.destinyMatch}</span>
                <span className="text-muted-foreground text-sm">
                  ({userNumbers.destiny} <ArrowRight className="inline h-3 w-3" /> {friendNumbers.destiny})
                </span>
              </div>
              <span className={`font-bold ${getScoreColor(compatibility.destinyScore)}`}>
                {compatibility.destinyScore}%
              </span>
            </div>
            <Progress
              value={compatibility.destinyScore}
              className="h-2"
            />
          </div>

          {/* Soul Urge Match */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{t.soulMatch}</span>
                <span className="text-muted-foreground text-sm">
                  ({userNumbers.soulUrge} <ArrowRight className="inline h-3 w-3" /> {friendNumbers.soulUrge})
                </span>
              </div>
              <span className={`font-bold ${getScoreColor(compatibility.soulUrgeScore)}`}>
                {compatibility.soulUrgeScore}%
              </span>
            </div>
            <Progress
              value={compatibility.soulUrgeScore}
              className="h-2"
            />
          </div>

          {/* Personality Match */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{t.personalityMatch}</span>
                <span className="text-muted-foreground text-sm">
                  ({userNumbers.personality} <ArrowRight className="inline h-3 w-3" /> {friendNumbers.personality})
                </span>
              </div>
              <span className={`font-bold ${getScoreColor(compatibility.personalityScore || 50)}`}>
                {compatibility.personalityScore || 50}%
              </span>
            </div>
            <Progress
              value={compatibility.personalityScore || 50}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Challenges */}
      {compatibility.analysis && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <Card className="border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-500">{t.strengths}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {compatibility.analysis.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">+</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-500">{t.challenges}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {compatibility.analysis.challenges?.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500">!</span>
                    <span className="text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FriendComparison;
