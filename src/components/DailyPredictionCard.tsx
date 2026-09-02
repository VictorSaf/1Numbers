import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  /* Registrul plăcii: fiecare bloc se deschide cu un filet de alamă și o
     etichetă mică, iar listele sunt cuvinte separate, nu pastile conturate.
     Iconițele lucide de deasupra titlurilor spuneau ce spune deja titlul. */
  const Head = ({ children }: { children: string }) => (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
      <h3 className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">{children}</h3>
    </div>
  );

  return (
    <Card className="border-t-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{predExt.daily}</CardTitle>
          {/* Culoarea zilei e chiar o culoare: aici eșantionul e conținut, nu
              decor, deci rămâne singurul disc din pagină. */}
          <div
            className="h-6 w-6 shrink-0 rounded-full"
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Head>{labels.recommendations}</Head>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground/90">
                <span className="num shrink-0 text-muted-foreground">{index + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Head>{labels.color}</Head>
          <p className="num text-[0.68rem] uppercase tracking-[0.14em] text-accent">{color.name}</p>
        </div>

        <div>
          <Head>{labels.music}</Head>
          <p className="num text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {music.join(" · ")}
          </p>
        </div>

        <div>
          <Head>{labels.luckyHours}</Head>
          {/* O oră norocoasă nu e o avertizare: `--warn` nu are ce căuta aici. */}
          <p className="num text-[0.68rem] tracking-[0.14em] text-accent">
            {prediction.luckyHours.join(" · ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

