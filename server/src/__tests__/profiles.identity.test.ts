import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Numele și data nașterii de pe harta ta nu se mai schimbă odată puse.
 *
 * Toată aplicația e construită pe ele: ziua personală din /azi, ecoul din
 * jurnal legat de cifra zilei, citirea întreagă indexată pe amprenta hărții.
 * Schimbate, cele scrise ieri rămân în bază adevărate despre altă hartă decât
 * cea pe care o vede omul azi -- iar jurnalul lui devine dovada altcuiva.
 *
 * Regula se aplică DOAR hărții proprii (`category = 'eu'`). Profilurile de
 * copil, apropiat sau afacere rămân editabile: acolo o dată greșită e o
 * greșeală de tastare despre altcineva, nu temelia propriilor lui date.
 */

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const USER_ID = '00000000-0000-0000-0000-000000000091';
const PROFILE_ID = '11111111-1111-1111-1111-111111111111';
const token = jwt.sign({ userId: USER_ID, email: 'a@b.ro' }, process.env.JWT_SECRET!);

const owns = (category: string, over: Record<string, unknown> = {}) =>
  vi.mocked(pool.query).mockResolvedValueOnce({
    rows: [{ id: PROFILE_ID, category, full_name: 'Florin Victor Safta', birth_date: '1977-07-29', ...over }],
    rowCount: 1,
  } as never);

const put = (b: object) =>
  request(app).put(`/api/profiles/${PROFILE_ID}`).set('Authorization', `Bearer ${token}`).send(b);

const SAME = { fullName: 'Florin Victor Safta', birthDate: '1977-07-29' };

beforeEach(() => vi.mocked(pool.query).mockReset());

describe('harta proprie: identitatea e fixă', () => {
  it('refuză altă dată de naștere', async () => {
    owns('eu');
    const res = await put({ ...SAME, birthDate: '1980-01-01' }).expect(409);
    expect(res.body.error).toBe('identity_is_fixed');
  });

  it('refuză alt nume', async () => {
    owns('eu');
    await put({ ...SAME, fullName: 'Altcineva Cu Totul' }).expect(409);
  });

  it('lasă să treacă restul, dacă identitatea nu se atinge', async () => {
    owns('eu');
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ id: PROFILE_ID, full_name: SAME.fullName }], rowCount: 1,
    } as never);

    await put({ ...SAME, birthPlace: 'Cluj', birthTime: '06:30' }).expect(200);
  });

  it('acceptă aceleași valori retrimise, ca formularul să nu pice degeaba', async () => {
    // Un formular care retrimite tot ce a citit nu încearcă să schimbe nimic.
    owns('eu');
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: PROFILE_ID }], rowCount: 1 } as never);

    await put(SAME).expect(200);
  });

  it('nu se lasă păcălită de spații sau majuscule', async () => {
    owns('eu');
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: PROFILE_ID }], rowCount: 1 } as never);

    await put({ ...SAME, fullName: '  Florin Victor Safta  ' }).expect(200);
  });
});

describe('celelalte profiluri rămân editabile', () => {
  it.each(['copil', 'apropiat', 'afacere'])('se poate corecta un profil de tip %s', async (cat) => {
    owns(cat);
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: PROFILE_ID }], rowCount: 1 } as never);

    await put({ fullName: 'Nume Corectat', birthDate: '2015-03-04' }).expect(200);
  });
});

describe('profilurile le creează adminul, nu utilizatorul', () => {
  const create = (t: string, b: object) =>
    request(app).post('/api/profiles/me').set('Authorization', `Bearer ${t}`).send(b);
  const adminToken = jwt.sign(
    { userId: '00000000-0000-0000-0000-0000000000ad', email: 'x@y.ro', role: 'admin' },
    process.env.JWT_SECRET!,
  );
  const NEW = { fullName: 'Om Nou', birthDate: '1990-01-01', category: 'eu' };

  it('refuză unui utilizator obișnuit crearea unui profil', async () => {
    // Rolul se citește din bază, nu din token: un token vechi al cuiva retrogradat
    // nu mai deschide nimic.
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'user' }], rowCount: 1 } as never);

    const res = await create(token, NEW).expect(403);
    expect(res.body.error).toBe('admin_only');
  });

  it('nu se lasă păcălită de un rol scris în token', async () => {
    const faked = jwt.sign({ userId: USER_ID, email: 'a@b.ro', role: 'admin' }, process.env.JWT_SECRET!);
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'user' }], rowCount: 1 } as never);

    await create(faked, NEW).expect(403);
  });

  it('lasă adminul să creeze', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never); // n-are încă hartă proprie
    const client = { query: vi.fn(), release: vi.fn() };
    client.query
      .mockResolvedValueOnce({} as never)                                    // BEGIN
      .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ id: PROFILE_ID }], rowCount: 1 } as never)
      .mockResolvedValueOnce({} as never);                                   // COMMIT
    (pool as unknown as { connect: unknown }).connect = vi.fn().mockResolvedValue(client);

    await create(adminToken, NEW).expect(201);
  });

  it('refuză un al doilea profil „eu”, chiar și adminului', async () => {
    // Fără asta, identitatea fixă ar fi o sugestie: se face altă hartă proprie
    // cu alte date și se activează.
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ id: 'deja' }], rowCount: 1 } as never);

    const res = await create(adminToken, NEW).expect(409);
    expect(res.body.error).toBe('own_map_exists');
  });
});
