import { describe, it, expect } from 'vitest';
import { buildDailyPredictionPayload } from '../lib/dailyNotification';

describe('buildDailyPredictionPayload', () => {
  it('compune ziua 4 în română', () => {
    expect(buildDailyPredictionPayload(4, 'ro')).toEqual({
      title: 'Energia Zilei Tale',
      body: 'O zi excelentă pentru organizare și muncă practică.',
      tag: 'daily-prediction',
      data: { type: 'daily-prediction', personalDay: 4, url: '/azi' },
    });
  });

  it('compune ziua 1 în engleză', () => {
    const payload = buildDailyPredictionPayload(1, 'en');
    expect(payload.title).toBe('Your Daily Energy');
    expect(payload.body).toBe('Today is perfect for new beginnings! Number 1 energy supports you.');
  });

  it('compune ziua 9 în rusă', () => {
    const payload = buildDailyPredictionPayload(9, 'ru');
    expect(payload.title).toBe('Ваша Энергия Дня');
    expect(payload.body).toBe('День для сострадания и завершения циклов.');
  });

  it('are un corp nevid pentru fiecare zi 1-9 în fiecare limbă', () => {
    for (const language of ['ro', 'en', 'ru'] as const) {
      for (let day = 1; day <= 9; day++) {
        expect(buildDailyPredictionPayload(day, language).body.length).toBeGreaterThan(0);
      }
    }
  });

  it('trimite mereu url-ul către /azi, ruta care există', () => {
    // sw.js citește data.url înainte de orice mapare proprie, iar maparea lui
    // pentru 'daily-prediction' arată spre /predictions, care nu e în
    // routes.json. Payload-ul nostru nu ajunge niciodată pe ramura aceea.
    expect(buildDailyPredictionPayload(7, 'ro').data.url).toBe('/azi');
  });
});
