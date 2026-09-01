import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Adminul putea vedea utilizatorii și le putea schimba rolul. Atât.
 *
 * Nu putea crea un cont -- singura cale era înregistrarea publică, iar ea e
 * închisă din `ALLOW_REGISTRATION`. Și nu putea da nimănui un plan: tabelul
 * `subscriptions` există din migrația 005 și avea zero rânduri, fiindcă nimic
 * din aplicație nu scria vreodată în el.
 *
 * Rolul și planul sunt lucruri diferite și rămân separate: rolul spune cine
 * poate administra, planul spune ce a cumpărat. Un admin pe plan free e o
 * combinație perfect validă, și chiar cea obișnuită la noi.
 */

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const ADMIN_ID = '00000000-0000-0000-0000-0000000000ad';
const OTHER_ID = '11111111-1111-1111-1111-111111111111';
const token = jwt.sign({ userId: ADMIN_ID, email: 'a@b.ro', role: 'admin' }, process.env.JWT_SECRET!);

// requireAdmin citește rolul din bază, nu din token: prima interogare e mereu asta.
const asAdmin = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as never);
const asUser = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'user' }], rowCount: 1 } as never);

const create = (b: object) =>
  request(app).post('/api/admin/users').set('Authorization', `Bearer ${token}`).send(b);
const patch = (id: string, b: object) =>
  request(app).patch(`/api/admin/users/${id}`).set('Authorization', `Bearer ${token}`).send(b);

const NEW_USER = { email: 'nou@exemplu.ro', name: 'Om Nou', password: 'parola-lunga-1', plan: 'premium' };

beforeEach(() => vi.mocked(pool.query).mockReset());

describe('POST /api/admin/users', () => {
  it('nu lasă un utilizator obișnuit să creeze conturi', async () => {
    asUser();
    await create(NEW_USER).expect(403);
  });

  it('creează contul și îi pune planul cerut', async () => {
    asAdmin();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)                       // email liber
      .mockResolvedValueOnce({ rows: [{ id: 'p2' }], rowCount: 1 } as never)           // planul există
      .mockResolvedValueOnce({ rows: [{ id: OTHER_ID, email: NEW_USER.email, name: NEW_USER.name, role: 'user' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);                    // abonamentul

    const res = await create(NEW_USER).expect(201);

    expect(res.body.user.email).toBe(NEW_USER.email);
    expect(res.body.user.plan).toBe('premium');
    // Căutat printre apeluri, nu pe indice: requireAdmin face prima interogare,
    // iar un test care numără apeluri se rupe la prima verificare adăugată.
    const sqls = vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));
    expect(sqls.some((q) => /INSERT INTO subscriptions/i.test(q))).toBe(true);
  });

  it('nu scrie niciodată parola în clar', async () => {
    asAdmin();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ id: OTHER_ID, email: NEW_USER.email, name: 'x', role: 'user' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    await create(NEW_USER).expect(201);

    const all = JSON.stringify(vi.mocked(pool.query).mock.calls);
    expect(all).not.toContain(NEW_USER.password);
    expect(all).toMatch(/\$2[aby]\$/); // amprenta unui hash bcrypt
  });

  it('refuză o parolă prea scurtă, ca și înregistrarea publică', async () => {
    asAdmin();
    await create({ ...NEW_USER, password: '123' }).expect(400);
  });

  it('refuză un email deja folosit', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: OTHER_ID }], rowCount: 1 } as never);
    await create(NEW_USER).expect(409);
  });

  it('refuză un plan care nu există', async () => {
    asAdmin();
    await create({ ...NEW_USER, plan: 'aur' }).expect(400);
  });

  it('pune free când nu se cere niciun plan', async () => {
    asAdmin();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ id: OTHER_ID, email: 'x@y.ro', name: 'x', role: 'user' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const { email, name, password } = NEW_USER;
    const res = await create({ email, name, password }).expect(201);
    expect(res.body.user.plan).toBe('free');
  });
});

describe('PATCH /api/admin/users/:id — planul', () => {
  it('schimbă planul fără să atingă rolul', async () => {
    asAdmin();
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ id: 3 }], rowCount: 1 } as never)   // planul există
      .mockResolvedValueOnce({ rows: [{ id: OTHER_ID }], rowCount: 1 } as never) // omul există
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);         // upsert abonament

    const res = await patch(OTHER_ID, { plan: 'pro' }).expect(200);

    expect(res.body.user.plan).toBe('pro');
    const all = JSON.stringify(vi.mocked(pool.query).mock.calls);
    expect(all).not.toMatch(/UPDATE users SET role/i);
  });

  it('schimbă rolul fără să atingă planul, ca înainte', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ id: OTHER_ID, email: 'x@y.ro', name: 'x', role: 'admin' }], rowCount: 1,
    } as never);

    const res = await patch(OTHER_ID, { role: 'admin' }).expect(200);

    expect(res.body.user.role).toBe('admin');
    const all = JSON.stringify(vi.mocked(pool.query).mock.calls);
    expect(all).not.toMatch(/INSERT INTO subscriptions/i);
  });

  it('refuză o cerere care nu cere nimic', async () => {
    asAdmin();
    await patch(OTHER_ID, {}).expect(400);
  });

  it('nu-l lasă pe admin să-și ia singur rolul', async () => {
    asAdmin();
    await patch(ADMIN_ID, { role: 'user' }).expect(400);
  });
});

describe('GET /api/admin/users', () => {
  it('spune ce plan are fiecare, nu doar rolul', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ id: OTHER_ID, email: 'x@y.ro', name: 'x', role: 'user', createdAt: '2026-01-01', plan: 'premium' }],
      rowCount: 1,
    } as never);

    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body.users[0].plan).toBe('premium');
    const sqls = vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));
    expect(sqls.some((q) => /subscription_plans/i.test(q))).toBe(true);
  });
});
