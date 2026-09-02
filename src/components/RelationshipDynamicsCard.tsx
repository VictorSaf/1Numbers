import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { DetailedCompatibilityResult } from "@/lib/compatibility";
import { Shield, AlertTriangle, Lightbulb, MessageSquare, Heart, Briefcase } from "lucide-react";

interface RelationshipDynamicsCardProps {
  compatibility: DetailedCompatibilityResult;
}

export const RelationshipDynamicsCard = ({ compatibility }: RelationshipDynamicsCardProps) => {
  const { language, t } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-ok";
    if (score >= 70) return "text-primary";
    if (score >= 55) return "text-warn";
    return "text-crit";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    if (score >= 55) return "outline";
    return "destructive";
  };

  const relationshipTypeLabels = {
    romantic: { ro: "Romantică", en: "Romantic", ru: "Романтическая" },
    friendship: { ro: "Prietenie", en: "Friendship", ru: "Дружба" },
    professional: { ro: "Profesională", en: "Professional", ru: "Профессиональная" },
    family: { ro: "Familie", en: "Family", ru: "Семейная" },
  };

  return (
    <Card className="card-mystic">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-foreground">
              {t.compatibility?.relationshipDynamics || "Dinamica Relației"}
            </CardTitle>
            <CardDescription>
              {relationshipTypeLabels[compatibility.relationshipType][language]}
            </CardDescription>
          </div>
          <Badge variant={getScoreBadgeVariant(compatibility.overallScore)} className="text-lg px-3 py-1">
            {compatibility.overallScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strengths */}
        {compatibility.strengths[language].length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-ok">
              <Shield className="h-5 w-5" />
              <h3 className="font-heading text-lg text-foreground">
                {t.compatibility?.strengths || "Puncte Forte"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {compatibility.strengths[language].map((strength, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-ok border-ok"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Challenges */}
        {compatibility.challenges[language].length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-warn">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-heading text-lg text-foreground">
                {t.compatibility?.challenges || "Provocări"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {compatibility.challenges[language].map((challenge, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-warn border-warn"
                >
                  {challenge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Dynamics */}
        <div className="space-y-4">
          <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.compatibility?.dynamics || "Dinamica"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="pt-3 border-t border-line">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-info" />
                <span className="text-sm font-medium text-foreground">
                  {t.compatibility?.communication || "Comunicare"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {compatibility.dynamics.communication[language]}
              </p>
            </div>
            <div className="pt-3 border-t border-line">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-crit" />
                <span className="text-sm font-medium text-foreground">
                  {t.compatibility?.emotional || "Emoțional"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {compatibility.dynamics.emotional[language]}
              </p>
            </div>
            <div className="pt-3 border-t border-line">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-medium text-foreground">
                  {t.compatibility?.practical || "Practic"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {compatibility.dynamics.practical[language]}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recommendations */}
        {compatibility.recommendations[language].length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-heading text-lg text-foreground">
                {t.compatibility?.recommendations || "Recomandări"}
              </h3>
            </div>
            <ul className="space-y-2">
              {compatibility.recommendations[language].map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

