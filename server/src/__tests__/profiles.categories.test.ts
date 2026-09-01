import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const auth = `Bearer ${jwt.sign(
  { userId: 'u1', email: 'u1@test.local', role: 'user' },
  process.env.JWT_SECRET!,
)}`;

/**
 * Crearea de profiluri a devenit o operație de admin: utilizatorul nu-și mai
 * poate face profil, fiindcă altfel identitatea fixă de pe harta proprie ar
 * fi o sugestie -- și-ar face altul și l-ar activa.
 *
 * Testele de aici sunt despre CATEGORII, nu despre cine are voie. Deci pun
 * rolul care le lasă să ajungă la ce verifică; cine are voie e testat separat,
 * în profiles.identity.test.ts.
 */
const asAdmin = () => {
  vi.mocked(pool.query).mockImplementation((sql: unknown) => {
    if (/SELECT role FROM users/i.test(String(sql))) {
      return Promise.resolve({ rows: [{ role: 'admin' }], rowCount: 1 } as never);
    }
    // Nicio hartă proprie încă: lasă verificarea de unicitate să treacă.
    return Promise.resolve({ rows: [], rowCount: 0 } as never);
  });
};

const row = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  user_id: 'u1',
  full_name: 'Ana Pop',
  birth_date: '1990-05-15',
  birth_time: null,
  birth_place: null,
  category: 'copil',
  is_active: false,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
  ...over,
});

const client = { query: vi.fn(), release: vi.fn() };

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(pool.connect).mockReset();
  client.query.mockReset();
  client.release.mockReset();
  vi.mocked(pool.connect).mockResolvedValue(client as never);
});

describe('categoria iese din API', () => {
  it('o duce pe fiecare hartă din listă', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [row()] } as never);
    const response = await request(app).get('/api/profiles/all').set('Authorization', auth);
    expect(response.status).toBe(200);
    expect(response.body.profiles[0].category).toBe('copil');
  });

  it('o duce și pe harta activă', async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [row({ category: 'eu', is_active: true })],
    } as never);
    const response = await request(app).get('/api/profiles/me').set('Authorization', auth);
    expect(response.status).toBe(200);
    expect(response.body.profile.category).toBe('eu');
  });
});

describe('categoria intră în API', () => {
  it('o scrie la creare', async () => {
    asAdmin();
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '3' }] });
      if (/INSERT INTO user_profiles/.test(sql)) return Promise.resolve({ rows: [row()] });
      return Promise.resolve({ rows: [] });
    });
    const response = await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'copil' });
    expect(response.status).toBe(201);
    const insert = client.query.mock.calls.find((call: unknown[]) =>
      /INSERT INTO user_profiles/.test(call[0] as string),
    );
    expect(insert![1]).toContain('copil');
  });

  it('cade pe o categorie care nu există', async () => {
    asAdmin();
    const response = await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'pisica' });
    expect(response.status).toBe(400);
  });

  it('pune eu când nu se cere nimic', async () => {
    asAdmin();
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '3' }] });
      if (/INSERT INTO user_profiles/.test(sql)) return Promise.resolve({ rows: [row({ category: 'eu' })] });
      return Promise.resolve({ rows: [] });
    });
    await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15' });
    const insert = client.query.mock.calls.find((call: unknown[]) =>
      /INSERT INTO user_profiles/.test(call[0] as string),
    );
    expect(insert![1]).toContain('eu');
  });
});

describe('numai o hartă a mea poate fi cea activă', () => {
  it('refuză activarea hărții unui copil', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT id, category FROM user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [{ id: 'p1', category: 'copil' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', auth);

    expect(response.status).toBe(400);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('lasă activarea unei hărți proprii', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT id, category FROM user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [{ id: 'p1', category: 'eu' }] });
      }
      if (/SET is_active = true/.test(sql)) {
        return Promise.resolve({ rows: [row({ category: 'eu', is_active: true })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', auth);

    expect(response.status).toBe(200);
    expect(response.body.profile.isActive).toBe(true);
  });

  it('nu activează o firmă nici când i se cere explicit', async () => {
    asAdmin();
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '0' }] });
      if (/INSERT INTO user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [row({ category: 'afacere', is_active: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({
        fullName: 'Lumina SRL',
        birthDate: '2019-03-02',
        category: 'afacere',
        setAsActive: true,
      });

    const insert = client.query.mock.calls.find((call: unknown[]) =>
      /INSERT INTO user_profiles/.test(call[0] as string),
    );
    expect(insert![1][6]).toBe(false);
  });
});
