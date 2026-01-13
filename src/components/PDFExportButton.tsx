// PDF Export Button Component
// Allows users to export their numerology readings as PDF

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Download, Printer, Loader2 } from 'lucide-react';
import {
  generateReportData,
  exportToPDF,
  downloadReport,
  type WhiteLabelConfig,
} from '@/lib/pdfExport';

interface PDFExportButtonProps {
  fullName: string;
  birthDate: Date;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showWhiteLabel?: boolean;
}

export const PDFExportButton = ({
  fullName,
  birthDate,
  variant = 'outline',
  size = 'default',
  showWhiteLabel = false,
}: PDFExportButtonProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Report options
  const [includeRemedies, setIncludeRemedies] = useState(true);
  const [includeLoShu, setIncludeLoShu] = useState(true);
  const [includePredictions, setIncludePredictions] = useState(true);

  // White label options (for Pro users)
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>({
    companyName: '',
    contactInfo: '',
    disclaimer: '',
  });
  const [useWhiteLabel, setUseWhiteLabel] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      exportPDF: 'Export PDF',
      title: 'Generează Raport PDF',
      description: 'Selectează ce să incluzi în raportul tău',
      includeRemedies: 'Include remedii (culori, pietre, mantre)',
      includeLoShu: 'Include grila Lo Shu',
      includePredictions: 'Include ciclul actual',
      whiteLabel: 'White Label (Pro)',
      companyName: 'Numele Companiei',
      contactInfo: 'Informații Contact',
      disclaimer: 'Disclaimer personalizat',
      print: 'Printează',
      download: 'Descarcă HTML',
      generating: 'Se generează...',
      cancel: 'Anulează',
    },
    en: {
      exportPDF: 'Export PDF',
      title: 'Generate PDF Report',
      description: 'Select what to include in your report',
      includeRemedies: 'Include remedies (colors, stones, mantras)',
      includeLoShu: 'Include Lo Shu grid',
      includePredictions: 'Include current cycle',
      whiteLabel: 'White Label (Pro)',
      companyName: 'Company Name',
      contactInfo: 'Contact Info',
      disclaimer: 'Custom Disclaimer',
      print: 'Print',
      download: 'Download HTML',
      generating: 'Generating...',
      cancel: 'Cancel',
    },
    ru: {
      exportPDF: 'Экспорт PDF',
      title: 'Создать PDF Отчёт',
      description: 'Выберите, что включить в отчёт',
      includeRemedies: 'Включить средства (цвета, камни, мантры)',
      includeLoShu: 'Включить сетку Ло Шу',
      includePredictions: 'Включить текущий цикл',
      whiteLabel: 'White Label (Про)',
      companyName: 'Название Компании',
      contactInfo: 'Контактная Информация',
      disclaimer: 'Пользовательский Отказ',
      print: 'Печать',
      download: 'Скачать HTML',
      generating: 'Генерация...',
      cancel: 'Отмена',
    },
  };

  const t = translations[language] || translations.en;

  const handleExport = async (type: 'print' | 'download') => {
    setIsGenerating(true);

    try {
      const reportData = generateReportData({
        fullName,
        birthDate,
        language,
        includeRemedies,
        includeLoShu,
        includePredictions,
        whiteLabel: useWhiteLabel ? whiteLabel : undefined,
      });

      if (type === 'print') {
        exportToPDF(reportData, language, useWhiteLabel ? whiteLabel : undefined);
      } else {
        downloadReport(reportData, language, useWhiteLabel ? whiteLabel : undefined);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <FileText className="h-4 w-4 mr-2" />
          {t.exportPDF}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRemedies"
                checked={includeRemedies}
                onCheckedChange={(checked) => setIncludeRemedies(checked === true)}
              />
              <Label htmlFor="includeRemedies" className="text-sm">
                {t.includeRemedies}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeLoShu"
                checked={includeLoShu}
                onCheckedChange={(checked) => setIncludeLoShu(checked === true)}
              />
              <Label htmlFor="includeLoShu" className="text-sm">
                {t.includeLoShu}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePredictions"
                checked={includePredictions}
                onCheckedChange={(checked) => setIncludePredictions(checked === true)}
              />
              <Label htmlFor="includePredictions" className="text-sm">
                {t.includePredictions}
              </Label>
            </div>
          </div>

          {/* White Label Options (Pro only) */}
          {showWhiteLabel && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useWhiteLabel"
                  checked={useWhiteLabel}
                  onCheckedChange={(checked) => setUseWhiteLabel(checked === true)}
                />
                <Label htmlFor="useWhiteLabel" className="text-sm font-medium">
                  {t.whiteLabel}
                </Label>
              </div>

              {useWhiteLabel && (
                <div className="space-y-3 pl-6">
                  <div className="space-y-1">
                    <Label htmlFor="companyName" className="text-xs">
                      {t.companyName}
                    </Label>
                    <Input
                      id="companyName"
                      value={whiteLabel.companyName}
                      onChange={(e) =>
                        setWhiteLabel({ ...whiteLabel, companyName: e.target.value })
                      }
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contactInfo" className="text-xs">
                      {t.contactInfo}
                    </Label>
                    <Input
                      id="contactInfo"
                      value={whiteLabel.contactInfo}
                      onChange={(e) =>
                        setWhiteLabel({ ...whiteLabel, contactInfo: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="disclaimer" className="text-xs">
                      {t.disclaimer}
                    </Label>
                    <Input
                      id="disclaimer"
                      value={whiteLabel.disclaimer}
                      onChange={(e) =>
                        setWhiteLabel({ ...whiteLabel, disclaimer: e.target.value })
                      }
                      placeholder="Custom disclaimer text..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
            {t.cancel}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('download')}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t.download}
          </Button>
          <Button onClick={() => handleExport('print')} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {t.print}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExportButton;
