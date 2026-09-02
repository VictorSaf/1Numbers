import { Music, Palette, Lightbulb, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyPrediction } from '@/lib/predictions';
import { dayAdvice, dayColor, dayMusic, type GuidanceLang } from '@/lib/dayGuidance';

interface DailyPredictionCardProps {
  prediction: DailyPrediction;
  birthDate: Date;
  date: Date;
}

export const DailyPredictionCard = ({ prediction, birthDate, date }: DailyPredictionCardProps) => {
  const { language, t } = useLanguage();
  
  const recommendations = dayAdvice(prediction.number, (['ro','en','ru'].includes(language) ? language : 'en') as GuidanceLang);
  /**
   * Recomandările, culoarea și genurile veneau din predictions.ts, unde erau
   * scrise doar în engleză. Etichetele din jur erau traduse, deci pagina în
   * română arăta titluri românești peste conținut englezesc -- mai rău decât
   * o pagină întreagă într-o limbă, fiindcă pare o traducere abandonată.
   */
  const guidanceLang = (["ro", "en", "ru"].includes(language) ? language : "en") as GuidanceLang;
  const color = dayColor(prediction.number, guidanceLang);
  const music = dayMusic(prediction.number, guidanceLang);
  
  const labels = {
    ro: {
      recommendations: "Recomandări",
      color: "Culoarea zilei",
      music: "Muzică recomandată",
      luckyHours: "Ore norocoase"
    },
    en: {
      recommendations: "Recommendations",
      color: "Day Color",
      music: "Recommended Music",
      luckyHours: "Lucky Hours"
    },
    ru: {
      recommendations: "Рекомендации",
      color: "Цвет дня",
      music: "Рекомендуемая музыка",
      luckyHours: "Счастливые часы"
    }
  }[language];
  
  // Get predictionsExtended translations safely
  const predExt = (t as Record<string, unknown>).predictionsExtended as Record<string, string> | undefined || {
    daily: labels.recommendations === "Recomandări" ? "Previziune Zilnică" : 
           labels.recommendations === "Recommendations" ? "Daily Prediction" : "Ежедневный Прогноз"
  };
  
  return (
    <Card className="card-mystic">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl">
            {predExt.daily}
          </CardTitle>
          <div 
            className="w-8 h-8 rounded-full border-2 border-primary/30"
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5" />
            <h3 className="font-heading text-lg text-foreground">{labels.recommendations}</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Color */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-5 w-5" />
            <h3 className="font-heading text-sm text-foreground">{labels.color}</h3>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {color.name}
          </Badge>
        </div>
        
        {/* Music */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-5 w-5" />
            <h3 className="font-heading text-sm text-foreground">{labels.music}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {music.map((genre, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Lucky Hours */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-heading text-sm text-foreground">{labels.luckyHours}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.luckyHours.map((hour, index) => (
              <Badge key={index} className="bg-warn/20 text-warn border-warn/30">
                {hour}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

