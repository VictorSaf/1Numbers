import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { writeDay } from '../lib/dayWriter';

/**
 * Ziua, o dată pe zi.
 *
 * Cache-ul nu e aici pentru bani, ci pentru adevăr: fără el, omul reîncarcă
 * pagina și ziua îi spune altceva. O citire care se schimbă la refresh nu e o
 * citire. Costul plafonat e un efect secundar plăcut -- și, la fel de util,
 * plafonează și cât poate cere un client care ar vrea să ne folosească drept
 * proxy gratuit către model: o generare scurtă per om per zi, orice ar trimite.
 */

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/dayWriter', async (orig) => ({
  ...(await orig<typeof import('../lib/dayWriter')>()),
  writeDay: vi.fn(),
}));

const USER_ID = '00000000-0000-0000-0000-0000000000u1'.replace(/u/g, '9');
const PROFILE_ID = '11111111-1111-1111-1111-111111111111';
const token = jwt.sign({ userId: USER_ID, email: 'a@b.ro' }, process.env.JWT_SECRET!);

const COMPOSED = {
  ziua: 'Ziua asta cere energia rezultatului măsurabil și a autorității asumate.',
  fric: 'Destinul tău e 1: energia începutului. Ziua trage în partea cealaltă.',
  aproape: 'Drumul tău e 7 — energia întrebării. Ziua cere ceva din aceeași familie.',
  intrebare: 'Destinul tău e 1, ziua cere 8. Care dintre ele a câștigat azi?',
};
const WRITTEN = { ...COMPOSED, ziua: 'Astăzi contează rezultatul concret și autoritatea asumată.' };

// Profilul are data nașterii: serverul verifică singur ziua personală.
const profileRow = { rows: [{ id: PROFILE_ID, birth_date: '1990-08-25' }], rowCount: 1 };
const body = (over: Record<string, unknown> = {}) => ({
  date: '2026-09-01', language: 'ro', personalDay: 8, composed: COMPOSED, ...over,
});
const post = (b: object = body()) =>
  request(app).post('/api/today/reading').set('Authorization', `Bearer ${token}`).send(b);

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(writeDay).mockReset().mockResolvedValue({
    body: WRITTEN, source: 'model', model: 'claude-sonnet-5',
  });
});

describe('ecoul: ce a scris omul ultima dată la aceeași cifră', () => {
  const echoRow = (over: Record<string, unknown> = {}) => ({
    rows: [{ content: 'Am plecat din ședință.', date: '2026-08-23', ...over }], rowCount: 1,
  });

  it('caută ultima intrare de la aceeași zi personală și o citează', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)   // cache gol
      .mockResolvedValueOnce(echoRow() as never)                   // ecoul
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const res = await post().expect(200);

    expect(res.body.echo).toContain('Am plecat din ședință.');
    expect(res.body.echo).toContain('8');
  });

  it('nu inventează un ecou când omul n-a scris niciodată la cifra asta', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const res = await post().expect(200);
    expect(res.body.echo).toBeUndefined();
  });

  it('nu lasă modelul să atingă cuvintele omului', async () => {
    // Modelul reformulează interpretarea. Ce a scris omul rămâne cum a scris.
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce(echoRow() as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const res = await post().expect(200);

    const sentToModel = JSON.stringify(vi.mocked(writeDay).mock.calls[0][0].composed);
    expect(sentToModel).not.toContain('Am plecat din ședință.');
    expect(res.body.echo).toContain('Am plecat din ședință.');
  });

  it('taie un răspuns lung, ca ecoul să rămână o frază', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce(echoRow({ content: 'x'.repeat(600) }) as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const res = await post().expect(200);
    expect(res.body.echo!.length).toBeLessThan(300);
    expect(res.body.echo).toContain('…');
  });
});

describe('POST /api/today/reading', () => {
  it('cere autentificare', async () => {
    await request(app).post('/api/today/reading').send(body()).expect(401);
  });

  it('scrie ziua și o ține minte', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)                      // profilul
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)       // cache gol
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)       // ecou: nimic
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);    // insert

    const res = await post().expect(200);

    expect(res.body.source).toBe('model');
    expect(res.body.body).toEqual(WRITTEN);
    expect(writeDay).toHaveBeenCalledTimes(1);
    // A treia interogare e scrierea: fără ea, mâine reîncarcă și plătim iar.
    expect(vi.mocked(pool.query).mock.calls[3][0]).toMatch(/INSERT INTO daily_readings/i);
  });

  it('nu cheamă modelul a doua oară în aceeași zi', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({
        rows: [{ body: WRITTEN, source: 'model', model: 'claude-sonnet-5' }], rowCount: 1,
      } as never);

    const res = await post().expect(200);

    expect(writeDay).not.toHaveBeenCalled();
    expect(res.body.body).toEqual(WRITTEN);
    expect(res.body.cached).toBe(true);
  });

  it('refuză o zi personală care nu se potrivește cu data nașterii', async () => {
    // Singura verificare pe care serverul chiar o poate face singur. Fără ea,
    // clientul ar putea cere o citire despre cifre care nu sunt ale lui.
    vi.mocked(pool.query).mockResolvedValueOnce(profileRow as never);

    await post(body({ personalDay: 3 })).expect(400);
    expect(writeDay).not.toHaveBeenCalled();
  });

  it('refuză un corp fără propozițiile compuse', async () => {
    await post(body({ composed: { ziua: 'doar una' } })).expect(400);
  });

  it('refuză propoziții absurd de lungi', async () => {
    await post(body({ composed: { ...COMPOSED, ziua: 'x'.repeat(3000) } })).expect(400);
  });

  it('spune 404 dacă omul n-are profil', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await post().expect(404);
  });

  it('răspunde chiar dacă scrierea în cache eșuează', async () => {
    // O zi nescrisă în cache costă un apel în plus mâine. O zi nelivrată e un
    // ecran gol azi.
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockRejectedValueOnce(new Error('disc plin') as never);

    const res = await post().expect(200);
    expect(res.body.body).toEqual(WRITTEN);
  });
});
