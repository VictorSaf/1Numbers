// RemedyCard Component
// Displays numerological remedies for a specific number

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NumberRemedy } from '@/lib/remedies';
import {
  Palette,
  Gem,
  Calendar,
  Compass,
  Quote,
  Sparkles,
  Heart,
  Briefcase,
  CheckCircle,
  XCircle,
  Apple,
} from 'lucide-react';

interface RemedyCardProps {
  remedy: NumberRemedy;
  showAll?: boolean;
}

export const RemedyCard = ({ remedy, showAll = false }: RemedyCardProps) => {
  const { language } = useLanguage();

  const translations: Record<string, Record<string, string>> = {
    ro: {
      colors: 'Culori',
      wear: 'De purtat',
      avoid: 'De evitat',
      gemstones: 'Pietre Prețioase',
      primary: 'Principală',
      alternatives: 'Alternative',
      metal: 'Metal',
      days: 'Zile',
      favorable: 'Favorabile',
      unfavorable: 'Nefavorabile',
      directions: 'Direcții',
      mantras: 'Mantre',
      vedic: 'Vedic',
      affirmation: 'Afirmație',
      planet: 'Planetă',
      element: 'Element',
      foods: 'Alimente',
      recommended: 'Recomandate',
      careers: 'Cariere',
      bodyParts: 'Zone Corporale',
      remedialActions: 'Acțiuni Remediu',
    },
    en: {
      colors: 'Colors',
      wear: 'Wear',
      avoid: 'Avoid',
      gemstones: 'Gemstones',
      primary: 'Primary',
      alternatives: 'Alternatives',
      metal: 'Metal',
      days: 'Days',
      favorable: 'Favorable',
      unfavorable: 'Unfavorable',
      directions: 'Directions',
      mantras: 'Mantras',
      vedic: 'Vedic',
      affirmation: 'Affirmation',
      planet: 'Planet',
      element: 'Element',
      foods: 'Foods',
      recommended: 'Recommended',
      careers: 'Careers',
      bodyParts: 'Body Parts',
      remedialActions: 'Remedial Actions',
    },
    ru: {
      colors: 'Цвета',
      wear: 'Носить',
      avoid: 'Избегать',
      gemstones: 'Драгоценные Камни',
      primary: 'Основной',
      alternatives: 'Альтернативы',
      metal: 'Металл',
      days: 'Дни',
      favorable: 'Благоприятные',
      unfavorable: 'Неблагоприятные',
      directions: 'Направления',
      mantras: 'Мантры',
      vedic: 'Ведическая',
      affirmation: 'Аффирмация',
      planet: 'Планета',
      element: 'Элемент',
      foods: 'Продукты',
      recommended: 'Рекомендуемые',
      careers: 'Карьеры',
      bodyParts: 'Части Тела',
      remedialActions: 'Коррективные Действия',
    },
  };

  const t = translations[language] || translations.en;

  return (
    <Card className="overflow-hidden">
      {/* Header with Number and Planet */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: remedy.colors.hex }}
            >
              {remedy.number}
            </div>
            <div>
              <CardTitle className="text-xl">
                {remedy.planet.symbol} {remedy.planet.name}
              </CardTitle>
              <CardDescription>{remedy.planet.deity}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg">
            {remedy.elements.element}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Colors Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t.colors}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.wear}</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className="text-white"
                  style={{ backgroundColor: remedy.colors.hex }}
                >
                  {remedy.colors.primary}
                </Badge>
                {remedy.colors.secondary.map((color) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.avoid}</p>
              <div className="flex flex-wrap gap-2">
                {remedy.colors.avoid.map((color) => (
                  <Badge key={color} variant="outline" className="text-red-500 border-red-500">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Gemstones Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gem className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">{t.gemstones}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">{remedy.gemstones.primary}</Badge>
              <span className="text-sm text-muted-foreground">({t.primary})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {remedy.gemstones.alternatives.map((stone) => (
                <Badge key={stone} variant="outline">
                  {stone}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {t.metal}: <strong>{remedy.gemstones.metal}</strong>
            </p>
          </div>
        </div>

        <Separator />

        {/* Days Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{t.favorable}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {remedy.days.favorable.map((day) => (
                <Badge key={day} variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {day}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{t.unfavorable}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {remedy.days.avoid.map((day) => (
                <Badge key={day} variant="secondary" className="bg-red-100 text-red-700">
                  <XCircle className="h-3 w-3 mr-1" />
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Directions Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">{t.directions}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">{t.favorable}: </span>
              {remedy.directions.favorable.join(', ')}
            </div>
            <div>
              <span className="text-sm text-muted-foreground">{t.avoid}: </span>
              {remedy.directions.avoid.join(', ')}
            </div>
          </div>
        </div>

        <Separator />

        {/* Mantras Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Quote className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">{t.mantras}</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{t.vedic}</p>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {remedy.mantras.vedic}
              </p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{t.affirmation}</p>
              <p className="italic">{remedy.mantras.affirmation}</p>
            </div>
          </div>
        </div>

        {showAll && (
          <>
            <Separator />

            {/* Foods Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Apple className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">{t.foods}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t.recommended}</p>
                  <div className="flex flex-wrap gap-1">
                    {remedy.elements.foods.map((food) => (
                      <Badge key={food} variant="outline" className="text-green-600">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t.avoid}</p>
                  <div className="flex flex-wrap gap-1">
                    {remedy.elements.avoidFoods.map((food) => (
                      <Badge key={food} variant="outline" className="text-red-500">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Careers Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">{t.careers}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {remedy.careers.map((career) => (
                  <Badge key={career} variant="secondary">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Body Parts Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">{t.bodyParts}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {remedy.bodyParts.map((part) => (
                  <Badge key={part} variant="outline">
                    {part}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Remedial Actions Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">{t.remedialActions}</h3>
              </div>
              <ul className="space-y-2">
                {remedy.remedialActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RemedyCard;
