// White Label Settings Page
// Allows Pro users to customize their branded reports

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Palette,
  Building,
  Mail,
  FileText,
  Eye,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import {
  generateReportData,
  generateReportHTML,
  type WhiteLabelConfig,
} from '@/lib/pdfExport';

const WhiteLabelSettings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  const [config, setConfig] = useState<WhiteLabelConfig>({
    companyName: '',
    logo: '',
    primaryColor: '#6366f1',
    contactInfo: '',
    disclaimer: '',
  });
  const [isActive, setIsActive] = useState(true);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Setări White Label',
      description: 'Personalizează rapoartele pentru clienții tăi',
      proOnly: 'Această funcție este disponibilă doar pentru utilizatorii Pro',
      upgradeToPro: 'Upgrade la Pro',
      companyName: 'Numele Companiei',
      companyNamePlaceholder: 'Numerologia Ta SRL',
      logo: 'URL Logo',
      logoPlaceholder: 'https://example.com/logo.png',
      primaryColor: 'Culoare Principală',
      contactInfo: 'Informații Contact',
      contactInfoPlaceholder: 'email@company.com | +40 123 456 789',
      disclaimer: 'Disclaimer Personalizat',
      disclaimerPlaceholder: 'Acest raport este destinat exclusiv scopurilor de informare...',
      enabled: 'Activat',
      enabledDesc: 'Aplică setările white label la rapoarte',
      preview: 'Previzualizare',
      previewReport: 'Previzualizează Raportul',
      save: 'Salvează',
      saving: 'Se salvează...',
      saved: 'Salvat cu succes!',
      brandingSection: 'Branding',
      contactSection: 'Contact & Legal',
    },
    en: {
      title: 'White Label Settings',
      description: 'Customize reports for your clients',
      proOnly: 'This feature is only available for Pro users',
      upgradeToPro: 'Upgrade to Pro',
      companyName: 'Company Name',
      companyNamePlaceholder: 'Your Numerology Co.',
      logo: 'Logo URL',
      logoPlaceholder: 'https://example.com/logo.png',
      primaryColor: 'Primary Color',
      contactInfo: 'Contact Info',
      contactInfoPlaceholder: 'email@company.com | +1 234 567 890',
      disclaimer: 'Custom Disclaimer',
      disclaimerPlaceholder: 'This report is intended for informational purposes only...',
      enabled: 'Enabled',
      enabledDesc: 'Apply white label settings to reports',
      preview: 'Preview',
      previewReport: 'Preview Report',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved successfully!',
      brandingSection: 'Branding',
      contactSection: 'Contact & Legal',
    },
    ru: {
      title: 'Настройки White Label',
      description: 'Настройте отчёты для ваших клиентов',
      proOnly: 'Эта функция доступна только для пользователей Pro',
      upgradeToPro: 'Обновить до Pro',
      companyName: 'Название Компании',
      companyNamePlaceholder: 'Ваша Нумерология ООО',
      logo: 'URL Логотипа',
      logoPlaceholder: 'https://example.com/logo.png',
      primaryColor: 'Основной Цвет',
      contactInfo: 'Контактная Информация',
      contactInfoPlaceholder: 'email@company.com | +7 123 456 7890',
      disclaimer: 'Пользовательский Отказ',
      disclaimerPlaceholder: 'Этот отчёт предназначен только для информационных целей...',
      enabled: 'Включено',
      enabledDesc: 'Применять настройки white label к отчётам',
      preview: 'Предпросмотр',
      previewReport: 'Предпросмотр Отчёта',
      save: 'Сохранить',
      saving: 'Сохранение...',
      saved: 'Успешно сохранено!',
      brandingSection: 'Брендинг',
      contactSection: 'Контакт и Юридическое',
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check tier
      const tierResponse = await api.getTierInfo();
      if (tierResponse.success && tierResponse.tierId === 'pro') {
        setIsPro(true);

        // Load white label config
        const configResponse = await api.getWhiteLabelConfig();
        if (configResponse.success && configResponse.config) {
          setConfig({
            companyName: configResponse.config.companyName || '',
            logo: configResponse.config.logoUrl || '',
            primaryColor: configResponse.config.primaryColor || '#6366f1',
            contactInfo: configResponse.config.contactInfo || '',
            disclaimer: configResponse.config.disclaimer || '',
          });
          setIsActive(configResponse.config.isActive ?? true);
        }
      }
    } catch (err) {
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      const response = await api.updateWhiteLabelConfig({
        companyName: config.companyName,
        logoUrl: config.logo,
        primaryColor: config.primaryColor,
        contactInfo: config.contactInfo,
        disclaimer: config.disclaimer,
        isActive,
      });

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Generate a sample report with white label settings
    const sampleData = generateReportData({
      fullName: 'John Doe',
      birthDate: new Date(1990, 0, 15),
      language,
      includeRemedies: true,
      includeLoShu: true,
      includePredictions: true,
      whiteLabel: isActive ? config : undefined,
    });

    const html = generateReportHTML(sampleData, language, isActive ? config : undefined);
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isPro) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
              <p className="text-muted-foreground mb-6">{t.proOnly}</p>
              <Button onClick={() => (window.location.href = '/premium')}>
                <Crown className="h-4 w-4 mr-2" />
                {t.upgradeToPro}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Pro
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{t.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="whitelabel-enabled"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="whitelabel-enabled">{t.enabled}</Label>
          </div>
        </div>

        {/* Branding Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t.brandingSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t.companyName}</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  placeholder={t.companyNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">{t.primaryColor}</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">{t.logo}</Label>
              <Input
                id="logo"
                value={config.logo}
                onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                placeholder={t.logoPlaceholder}
              />
              {config.logo && (
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <img
                    src={config.logo}
                    alt="Logo preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Legal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t.contactSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactInfo">{t.contactInfo}</Label>
              <Input
                id="contactInfo"
                value={config.contactInfo}
                onChange={(e) => setConfig({ ...config, contactInfo: e.target.value })}
                placeholder={t.contactInfoPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disclaimer">{t.disclaimer}</Label>
              <Textarea
                id="disclaimer"
                value={config.disclaimer}
                onChange={(e) => setConfig({ ...config, disclaimer: e.target.value })}
                placeholder={t.disclaimerPlaceholder}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {t.previewReport}
          </Button>
          <div className="flex items-center gap-3">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="h-4 w-4" />
                {t.saved}
              </div>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WhiteLabelSettings;
