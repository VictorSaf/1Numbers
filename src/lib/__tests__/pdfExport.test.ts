import { describe, it, expect } from 'vitest';
import { generateReportData, generateReportHTML } from '../pdfExport';

// The birth date is a calendar date. Serialising it with toISOString() and
// reading it back with new Date('YYYY-MM-DD') shifts it by a day: east of UTC
// on the way out, west of UTC on the way back. Run under TZ=America/New_York
// and TZ=Europe/Bucharest to see either half.
describe('generateReportHTML birth date', () => {
  it('prints the birth date that was entered, in any timezone', () => {
    const report = generateReportData({
      fullName: 'John Doe',
      birthDate: new Date(1990, 0, 15),
      language: 'en',
    });

    expect(report.person.birthDate).toBe('1990-01-15');
    expect(generateReportHTML(report, 'en')).toContain('January 15, 1990');
  });
});
