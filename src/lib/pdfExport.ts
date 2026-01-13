// PDF Export Service
// Generates professional PDF reports for numerology readings

import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculatePersonalYearNumber,
} from './numerology';
import {
  calculatePersonalMonthNumber,
  calculatePersonalDayNumber,
} from './personalCycles';
import { calculateKarmicDebts, calculateKarmicLessons } from './karmic';
import { calculatePinnacles, calculateChallenges } from './pinnacles';
import { getRemedyForNumber } from './remedies';
import { generateLoShuGrid } from './loShuGrid';

export interface ReportData {
  fullName: string;
  birthDate: Date;
  language: string;
  includeRemedies?: boolean;
  includeLoShu?: boolean;
  includePredictions?: boolean;
  whiteLabel?: WhiteLabelConfig;
}

export interface WhiteLabelConfig {
  companyName: string;
  logo?: string;
  primaryColor?: string;
  contactInfo?: string;
  disclaimer?: string;
}

export interface NumerologyReport {
  generatedAt: Date;
  person: {
    name: string;
    birthDate: string;
  };
  coreNumbers: {
    lifePath: number;
    destiny: number;
    soulUrge: number;
    personality: number;
  };
  karmicAnalysis: {
    debt: number[];
    lessons: number[];
  };
  pinnaclesAndChallenges: {
    pinnacles: { number: number; startAge: number; endAge: number }[];
    challenges: { number: number; startAge: number; endAge: number }[];
  };
  currentCycle?: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
  };
  loShuGrid?: {
    grid: number[][];
    missing: number[];
    repeated: { number: number; count: number }[];
  };
  remedies?: {
    lifePath: ReturnType<typeof getRemedyForNumber>;
    destiny: ReturnType<typeof getRemedyForNumber>;
  };
}

// Generate complete numerology report data
export function generateReportData(data: ReportData): NumerologyReport {
  const { fullName, birthDate, language, includeRemedies, includeLoShu, includePredictions } = data;

  const lifePath = calculateLifePathNumber(birthDate);
  const destiny = calculateDestinyNumber(fullName);
  const soulUrge = calculateSoulUrgeNumber(fullName);
  const personality = calculatePersonalityNumber(fullName);

  const report: NumerologyReport = {
    generatedAt: new Date(),
    person: {
      name: fullName,
      birthDate: birthDate.toISOString().split('T')[0],
    },
    coreNumbers: {
      lifePath,
      destiny,
      soulUrge,
      personality,
    },
    karmicAnalysis: {
      debt: calculateKarmicDebts(birthDate, fullName),
      lessons: calculateKarmicLessons(fullName),
    },
    pinnaclesAndChallenges: {
      pinnacles: calculatePinnacles(birthDate, lifePath),
      challenges: calculateChallenges(birthDate),
    },
  };

  if (includePredictions) {
    const today = new Date();
    report.currentCycle = {
      personalYear: calculatePersonalYearNumber(birthDate, today.getFullYear()),
      personalMonth: calculatePersonalMonthNumber(birthDate, today.getFullYear(), today.getMonth() + 1),
      personalDay: calculatePersonalDayNumber(birthDate, today),
    };
  }

  if (includeLoShu) {
    const loShuResult = generateLoShuGrid(birthDate);
    report.loShuGrid = {
      grid: loShuResult.grid,
      missing: loShuResult.missingNumbers,
      repeated: loShuResult.repeatedNumbers,
    };
  }

  if (includeRemedies) {
    report.remedies = {
      lifePath: getRemedyForNumber(lifePath, language),
      destiny: getRemedyForNumber(destiny, language),
    };
  }

  return report;
}

// Translations for PDF report
const reportTranslations: Record<string, Record<string, string>> = {
  ro: {
    title: 'Raport Numerologic Complet',
    generatedOn: 'Generat pe',
    personalProfile: 'Profil Personal',
    name: 'Nume',
    birthDate: 'Data Nașterii',
    coreNumbers: 'Numere Fundamentale',
    lifePath: 'Numărul Destinului (Life Path)',
    destiny: 'Numărul Expresiei',
    soulUrge: 'Numărul Sufletului',
    personality: 'Numărul Personalității',
    karmicAnalysis: 'Analiză Karmică',
    karmicDebt: 'Datorii Karmice',
    karmicLessons: 'Lecții Karmice',
    noKarmicDebt: 'Nu există datorii karmice',
    noKarmicLessons: 'Nu există lecții karmice',
    pinnacles: 'Vârfuri de Viață',
    challenges: 'Provocări',
    currentCycle: 'Ciclul Actual',
    personalYear: 'An Personal',
    personalMonth: 'Lună Personală',
    personalDay: 'Zi Personală',
    loShuGrid: 'Grila Lo Shu',
    missingNumbers: 'Numere Lipsă',
    repeatedNumbers: 'Numere Repetate',
    remedies: 'Remedii Recomandate',
    colors: 'Culori',
    gemstones: 'Pietre',
    mantras: 'Mantre',
    favorableDays: 'Zile Favorabile',
    disclaimer: 'Acest raport este destinat exclusiv scopurilor de divertisment și auto-cunoaștere.',
    page: 'Pagina',
  },
  en: {
    title: 'Complete Numerology Report',
    generatedOn: 'Generated on',
    personalProfile: 'Personal Profile',
    name: 'Name',
    birthDate: 'Birth Date',
    coreNumbers: 'Core Numbers',
    lifePath: 'Life Path Number',
    destiny: 'Expression Number',
    soulUrge: 'Soul Urge Number',
    personality: 'Personality Number',
    karmicAnalysis: 'Karmic Analysis',
    karmicDebt: 'Karmic Debts',
    karmicLessons: 'Karmic Lessons',
    noKarmicDebt: 'No karmic debts',
    noKarmicLessons: 'No karmic lessons',
    pinnacles: 'Life Pinnacles',
    challenges: 'Challenges',
    currentCycle: 'Current Cycle',
    personalYear: 'Personal Year',
    personalMonth: 'Personal Month',
    personalDay: 'Personal Day',
    loShuGrid: 'Lo Shu Grid',
    missingNumbers: 'Missing Numbers',
    repeatedNumbers: 'Repeated Numbers',
    remedies: 'Recommended Remedies',
    colors: 'Colors',
    gemstones: 'Gemstones',
    mantras: 'Mantras',
    favorableDays: 'Favorable Days',
    disclaimer: 'This report is intended for entertainment and self-discovery purposes only.',
    page: 'Page',
  },
  ru: {
    title: 'Полный Нумерологический Отчёт',
    generatedOn: 'Создано',
    personalProfile: 'Личный Профиль',
    name: 'Имя',
    birthDate: 'Дата Рождения',
    coreNumbers: 'Основные Числа',
    lifePath: 'Число Жизненного Пути',
    destiny: 'Число Выражения',
    soulUrge: 'Число Души',
    personality: 'Число Личности',
    karmicAnalysis: 'Кармический Анализ',
    karmicDebt: 'Кармические Долги',
    karmicLessons: 'Кармические Уроки',
    noKarmicDebt: 'Нет кармических долгов',
    noKarmicLessons: 'Нет кармических уроков',
    pinnacles: 'Жизненные Вершины',
    challenges: 'Испытания',
    currentCycle: 'Текущий Цикл',
    personalYear: 'Личный Год',
    personalMonth: 'Личный Месяц',
    personalDay: 'Личный День',
    loShuGrid: 'Сетка Ло Шу',
    missingNumbers: 'Недостающие Числа',
    repeatedNumbers: 'Повторяющиеся Числа',
    remedies: 'Рекомендуемые Средства',
    colors: 'Цвета',
    gemstones: 'Камни',
    mantras: 'Мантры',
    favorableDays: 'Благоприятные Дни',
    disclaimer: 'Этот отчёт предназначен только для развлечения и самопознания.',
    page: 'Страница',
  },
};

// Generate HTML content for PDF
export function generateReportHTML(
  report: NumerologyReport,
  language: string,
  whiteLabel?: WhiteLabelConfig
): string {
  const t = reportTranslations[language] || reportTranslations.en;
  const primaryColor = whiteLabel?.primaryColor || '#6366f1';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ro' ? 'ro-RO' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - ${report.person.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${primaryColor};
    }

    .header h1 {
      color: ${primaryColor};
      font-size: 28px;
      margin-bottom: 10px;
    }

    .header .subtitle {
      color: #666;
      font-size: 14px;
    }

    .white-label-logo {
      max-width: 200px;
      margin-bottom: 20px;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      color: ${primaryColor};
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${primaryColor}20;
    }

    .profile-info {
      display: flex;
      justify-content: space-between;
      background: #f8f9fa;
      padding: 15px 20px;
      border-radius: 8px;
    }

    .profile-item label {
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }

    .profile-item value {
      display: block;
      font-size: 16px;
      font-weight: 600;
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .number-card {
      background: linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%);
      border: 1px solid ${primaryColor}30;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }

    .number-card .number {
      font-size: 48px;
      font-weight: bold;
      color: ${primaryColor};
      line-height: 1;
    }

    .number-card .label {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }

    .karmic-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .karmic-badge {
      background: #fee2e2;
      color: #dc2626;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
    }

    .karmic-badge.lesson {
      background: #fef3c7;
      color: #d97706;
    }

    .none-text {
      color: #22c55e;
      font-style: italic;
    }

    .pinnacles-table {
      width: 100%;
      border-collapse: collapse;
    }

    .pinnacles-table th,
    .pinnacles-table td {
      padding: 12px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }

    .pinnacles-table th {
      background: ${primaryColor}10;
      color: ${primaryColor};
      font-weight: 600;
    }

    .pinnacles-table .number-cell {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
    }

    .lo-shu-grid {
      display: grid;
      grid-template-columns: repeat(3, 80px);
      gap: 5px;
      justify-content: center;
      margin: 20px 0;
    }

    .lo-shu-cell {
      width: 80px;
      height: 80px;
      border: 2px solid ${primaryColor};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
    }

    .lo-shu-cell.empty {
      background: #f3f4f6;
      color: #9ca3af;
    }

    .lo-shu-cell.repeated {
      background: ${primaryColor};
      color: white;
    }

    .remedy-section {
      background: #f0fdf4;
      border: 1px solid #22c55e30;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
    }

    .remedy-title {
      color: #15803d;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .remedy-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .remedy-item label {
      color: #666;
      font-size: 12px;
      display: block;
    }

    .remedy-item value {
      font-weight: 500;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }

    .disclaimer {
      font-style: italic;
      margin-top: 10px;
    }

    @media print {
      .container {
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      ${whiteLabel?.logo ? `<img src="${whiteLabel.logo}" alt="${whiteLabel.companyName}" class="white-label-logo">` : ''}
      <h1>${whiteLabel?.companyName || t.title}</h1>
      <p class="subtitle">${t.generatedOn}: ${formatDate(report.generatedAt.toISOString())}</p>
    </header>

    <section class="section">
      <h2 class="section-title">${t.personalProfile}</h2>
      <div class="profile-info">
        <div class="profile-item">
          <label>${t.name}</label>
          <value>${report.person.name}</value>
        </div>
        <div class="profile-item">
          <label>${t.birthDate}</label>
          <value>${formatDate(report.person.birthDate)}</value>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">${t.coreNumbers}</h2>
      <div class="numbers-grid">
        <div class="number-card">
          <div class="number">${report.coreNumbers.lifePath}</div>
          <div class="label">${t.lifePath}</div>
        </div>
        <div class="number-card">
          <div class="number">${report.coreNumbers.destiny}</div>
          <div class="label">${t.destiny}</div>
        </div>
        <div class="number-card">
          <div class="number">${report.coreNumbers.soulUrge}</div>
          <div class="label">${t.soulUrge}</div>
        </div>
        <div class="number-card">
          <div class="number">${report.coreNumbers.personality}</div>
          <div class="label">${t.personality}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">${t.karmicAnalysis}</h2>
      <div style="margin-bottom: 15px;">
        <strong>${t.karmicDebt}:</strong>
        <div class="karmic-list" style="margin-top: 8px;">
          ${
            report.karmicAnalysis.debt.length > 0
              ? report.karmicAnalysis.debt.map((d) => `<span class="karmic-badge">${d}</span>`).join('')
              : `<span class="none-text">${t.noKarmicDebt}</span>`
          }
        </div>
      </div>
      <div>
        <strong>${t.karmicLessons}:</strong>
        <div class="karmic-list" style="margin-top: 8px;">
          ${
            report.karmicAnalysis.lessons.length > 0
              ? report.karmicAnalysis.lessons.map((l) => `<span class="karmic-badge lesson">${l}</span>`).join('')
              : `<span class="none-text">${t.noKarmicLessons}</span>`
          }
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">${t.pinnacles} & ${t.challenges}</h2>
      <table class="pinnacles-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${t.pinnacles}</th>
            <th>${t.challenges}</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          ${report.pinnaclesAndChallenges.pinnacles
            .map(
              (p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td class="number-cell">${p.number}</td>
              <td class="number-cell">${report.pinnaclesAndChallenges.challenges[i]?.number || '-'}</td>
              <td>${p.startAge}-${p.endAge === 999 ? '∞' : p.endAge}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </section>

    ${
      report.currentCycle
        ? `
    <section class="section">
      <h2 class="section-title">${t.currentCycle}</h2>
      <div class="numbers-grid">
        <div class="number-card">
          <div class="number">${report.currentCycle.personalYear}</div>
          <div class="label">${t.personalYear}</div>
        </div>
        <div class="number-card">
          <div class="number">${report.currentCycle.personalMonth}</div>
          <div class="label">${t.personalMonth}</div>
        </div>
        <div class="number-card">
          <div class="number">${report.currentCycle.personalDay}</div>
          <div class="label">${t.personalDay}</div>
        </div>
      </div>
    </section>
    `
        : ''
    }

    ${
      report.loShuGrid
        ? `
    <section class="section">
      <h2 class="section-title">${t.loShuGrid}</h2>
      <div class="lo-shu-grid">
        ${report.loShuGrid.grid
          .flat()
          .map((cell, i) => {
            const repeated = report.loShuGrid?.repeated.find((r) => r.number === cell);
            const isEmpty = cell === 0;
            return `<div class="lo-shu-cell ${isEmpty ? 'empty' : ''} ${repeated ? 'repeated' : ''}">${isEmpty ? '-' : cell}</div>`;
          })
          .join('')}
      </div>
      <div style="display: flex; gap: 30px; justify-content: center;">
        <div>
          <strong>${t.missingNumbers}:</strong> ${report.loShuGrid.missing.join(', ') || '-'}
        </div>
        <div>
          <strong>${t.repeatedNumbers}:</strong> ${report.loShuGrid.repeated.map((r) => `${r.number}(×${r.count})`).join(', ') || '-'}
        </div>
      </div>
    </section>
    `
        : ''
    }

    ${
      report.remedies
        ? `
    <section class="section">
      <h2 class="section-title">${t.remedies}</h2>
      <div class="remedy-section">
        <div class="remedy-title">${t.lifePath} ${report.coreNumbers.lifePath}</div>
        <div class="remedy-grid">
          <div class="remedy-item">
            <label>${t.colors}</label>
            <value>${report.remedies.lifePath?.colors.primary || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.gemstones}</label>
            <value>${report.remedies.lifePath?.gemstones.primary || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.favorableDays}</label>
            <value>${report.remedies.lifePath?.days.favorable.join(', ') || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.mantras}</label>
            <value>${report.remedies.lifePath?.mantras.vedic || '-'}</value>
          </div>
        </div>
      </div>
      ${
        report.coreNumbers.lifePath !== report.coreNumbers.destiny
          ? `
      <div class="remedy-section">
        <div class="remedy-title">${t.destiny} ${report.coreNumbers.destiny}</div>
        <div class="remedy-grid">
          <div class="remedy-item">
            <label>${t.colors}</label>
            <value>${report.remedies.destiny?.colors.primary || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.gemstones}</label>
            <value>${report.remedies.destiny?.gemstones.primary || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.favorableDays}</label>
            <value>${report.remedies.destiny?.days.favorable.join(', ') || '-'}</value>
          </div>
          <div class="remedy-item">
            <label>${t.mantras}</label>
            <value>${report.remedies.destiny?.mantras.vedic || '-'}</value>
          </div>
        </div>
      </div>
      `
          : ''
      }
    </section>
    `
        : ''
    }

    <footer class="footer">
      ${whiteLabel?.contactInfo ? `<p>${whiteLabel.contactInfo}</p>` : ''}
      <p class="disclaimer">${whiteLabel?.disclaimer || t.disclaimer}</p>
    </footer>
  </div>
</body>
</html>
`;
}

// Export to PDF using browser print
export function exportToPDF(
  report: NumerologyReport,
  language: string,
  whiteLabel?: WhiteLabelConfig
): void {
  const html = generateReportHTML(report, language, whiteLabel);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Download as HTML file
export function downloadReport(
  report: NumerologyReport,
  language: string,
  whiteLabel?: WhiteLabelConfig
): void {
  const html = generateReportHTML(report, language, whiteLabel);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `numerology-report-${report.person.name.replace(/\s+/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
