import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Panoul de admin: aceeași întrebare pusă o dată, liste cu capăt, și cele trei
 * pagini de documente (agenți, skill-uri, cercetare) citite la fel.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const token = `Bearer ${jwt.sign({ userId: 'a1', email: 'a@b.ro', role: 'admin' }, process.env.JWT_SECRET!)}`;

beforeEach(() => vi.mocked(pool.query).mockReset());

const sqls = () => vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));

// requireAdmin citește rolul din bază; restul răspunde după SQL.
const adminThen = (answer: (sql: string) => unknown) =>
  vi.mocked(pool.query).mockImplementation((async (sql: string) =>
    /SELECT role FROM users/.test(sql) ? { rows: [{ role: 'admin' }], rowCount: 1 } : answer(sql)) as never);

describe('GET /api/admin/dashboard', () => {
  it('numără utilizatorii noi o singură dată și păstrează ambele câmpuri', async () => {
    adminThen((sql) => {
      if (/INTERVAL '7 days'/.test(sql)) return { rows: [{ count: '4' }] };
      if (/FROM subscriptions/.test(sql)) return { rows: [{ count: '2' }] };
      return { rows: [{ count: '10' }] };
    });

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', token).expect(200);

    expect(res.body).toEqual({ totalUsers: 10, activeUsers: 4, premiumUsers: 2, newUsersThisWeek: 4 });
    expect(sqls().filter((s) => /INTERVAL '7 days'/.test(s))).toHaveLength(1);
  });

  it('pune numărătorile deodată', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    adminThen(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return { rows: [{ count: '1' }] };
    });

    await request(app).get('/api/admin/dashboard').set('Authorization', token).expect(200);

    expect(maxInFlight).toBe(3);
  });

  it('fără tabela de abonamente, premium rămâne 0 în loc să pice panoul', async () => {
    adminThen((sql) => {
      if (/FROM subscriptions/.test(sql)) throw new Error('relation "subscriptions" does not exist');
      return { rows: [{ count: '1' }] };
    });

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', token).expect(200);

    expect(res.body.premiumUsers).toBe(0);
  });
});

describe('GET /api/admin/users', () => {
  it('are un capăt', async () => {
    adminThen(() => ({ rows: [] }));
    await request(app).get('/api/admin/users').set('Authorization', token).expect(200);
    expect(sqls().some((s) => /FROM users u[\s\S]*LIMIT\s+500/.test(s))).toBe(true);
  });
});

describe('documentele din repo', () => {
  // Citite din fișierele reale ale repo-ului: testul fixează forma răspunsului,
  // nu conținutul, ca refactorizarea buclei comune să nu schimbe nimic vizibil.
  it('GET /agents', async () => {
    adminThen(() => ({ rows: [] }));
    const res = await request(app).get('/api/admin/agents').set('Authorization', token).expect(200);
    expect(res.body.count).toBe(res.body.agents.length);
    const orch = res.body.agents.find((a: { filename: string }) => a.filename === 'orchestrator.md');
    expect(orch.name).toBe('Orchestrator');
    expect(typeof orch.description).toBe('string');
    expect(orch.description).not.toMatch(/^#/);
    expect(orch.content.length).toBeGreaterThan(0);
  });

  it('GET /skills', async () => {
    adminThen(() => ({ rows: [] }));
    const res = await request(app).get('/api/admin/skills').set('Authorization', token).expect(200);
    const s = res.body.skills.find((x: { filename: string }) => x.filename === 'build-check.md');
    expect(s.name).toBe('Build Check');
    expect(s.command).toMatch(/^\//);
    expect(Object.keys(s).sort()).toEqual(['command', 'content', 'description', 'filename', 'name']);
  });

  it('GET /research', async () => {
    adminThen(() => ({ rows: [] }));
    const res = await request(app).get('/api/admin/research').set('Authorization', token).expect(200);
    expect(res.body.count).toBe(res.body.documents.length);
    for (const d of res.body.documents) {
      expect(Object.keys(d).sort()).toEqual(['content', 'filename', 'modifiedAt', 'name', 'summary']);
      expect(d.summary.length).toBeLessThanOrEqual(203);
    }
  });
});
