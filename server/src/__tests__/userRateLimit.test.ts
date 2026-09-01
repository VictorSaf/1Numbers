import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { userRateLimit, ipRateLimit } from '../middleware/ipRateLimit';

/**
 * Limita pe utilizator există fiindcă cea pe IP nu acoperă un cont folosit de
 * pe patru rețele. Se testează pe un app minimal: nu are rost să treacă prin
 * autentificare pentru a verifica o fereastră glisantă.
 */
const appWith = (limit: express.RequestHandler) => {
  const app = express();
  app.use(express.json());
  app.post(
    '/t',
    (req: express.Request & { userId?: string }, _res, next) => {
      req.userId = req.header('x-test-user') ?? undefined;
      next();
    },
    limit,
    (_req, res) => res.json({ ok: true }),
  );
  return app;
};

describe('limita pe utilizator', () => {
  it('lasă să treacă până la plafon și refuză după', async () => {
    const app = appWith(userRateLimit({ windowMs: 60_000, max: 3 }));

    for (let i = 0; i < 3; i++) {
      const allowed = await request(app).post('/t').set('x-test-user', 'u1').send({});
      expect(allowed.status).toBe(200);
    }

    const blocked = await request(app).post('/t').set('x-test-user', 'u1').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe('Too many requests');
  });

  it('spune peste cât timp se poate reîncerca', async () => {
    const app = appWith(userRateLimit({ windowMs: 60_000, max: 1 }));

    await request(app).post('/t').set('x-test-user', 'u2').send({});
    const blocked = await request(app).post('/t').set('x-test-user', 'u2').send({});

    expect(blocked.headers['retry-after']).toBeDefined();
    expect(blocked.body.retryAfter).toBeGreaterThan(0);
  });

  it('numără separat pentru fiecare utilizator', async () => {
    const app = appWith(userRateLimit({ windowMs: 60_000, max: 1 }));

    await request(app).post('/t').set('x-test-user', 'u3').send({});
    const other = await request(app).post('/t').set('x-test-user', 'u4').send({});

    expect(other.status).toBe(200);
  });

  it('nu numără o cerere fără identitate -- autentificarea a oprit-o deja', async () => {
    const app = appWith(userRateLimit({ windowMs: 60_000, max: 1 }));

    const first = await request(app).post('/t').send({});
    const second = await request(app).post('/t').send({});

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});

describe('limita pe IP nu s-a schimbat', () => {
  it('refuză a doua cerere de la același IP când plafonul e unu', async () => {
    const app = appWith(ipRateLimit({ windowMs: 60_000, max: 1 }));

    const first = await request(app).post('/t').send({});
    const second = await request(app).post('/t').send({});

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error).toBe('Too many requests');
  });

  it('citește tot antetul Cloudflare, ca înainte', async () => {
    const app = appWith(ipRateLimit({ windowMs: 60_000, max: 1 }));

    await request(app).post('/t').set('cf-connecting-ip', '203.0.113.9').send({});
    const sameIp = await request(app).post('/t').set('cf-connecting-ip', '203.0.113.9').send({});
    const otherIp = await request(app).post('/t').set('cf-connecting-ip', '203.0.113.10').send({});

    expect(sameIp.status).toBe(429);
    expect(otherIp.status).toBe(200);
  });
});
