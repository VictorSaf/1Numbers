import { describe, it, expect } from 'vitest';
import { buildDailyPredictionPayload } from '../lib/dailyNotification';

describe('buildDailyPredictionPayload', () => {
  it('compune ziua 4 în română', () => {
    expect(buildDailyPredictionPayload(4, 'ro')).toEqual({
      title: 'Energia Zilei Tale',
      body: 'Zi bună pentru ce se construiește încet. Ai grijă să nu folosești munca drept adăpost.',
      tag: 'daily-prediction',
      data: { type: 'daily-prediction', personalDay: 4, url: '/azi' },
    });
  });

  it('compune ziua 1 în engleză', () => {
    const payload = buildDailyPredictionPayload(1, 'en');
    expect(payload.title).toBe('Your Daily Energy');
    expect(payload.body).toBe('A day for beginnings. Start what you postpone, and ask for help before you need it.');
  });

  it('compune ziua 9 în rusă', () => {
    const payload = buildDailyPredictionPayload(9, 'ru');
    expect(payload.title).toBe('Ваша Энергия Дня');
    expect(payload.body).toBe('Сегодня вы видите картину целиком. Закройте то, что пора закрыть, даже если оно не идеально.');
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
