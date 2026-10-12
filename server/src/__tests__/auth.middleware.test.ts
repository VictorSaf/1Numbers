import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import pool from '../db';
import { passwordChangedAt } from '../lib/sessions';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const JWT_SECRET = process.env.JWT_SECRET!;

describe('Auth Middleware', () => {
  describe('authenticateToken', () => {
    it('should return 401 if no token provided', () => {
      const req = {
        headers: {},
      } as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' },
      } as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set user info if token is valid', async () => {
      const payload = { userId: '123', email: 'test@test.com', role: 'user' };
      const token = jwt.sign(payload, JWT_SECRET);

      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      // Middleware-ul e asincron de când întreabă dacă sesiunea mai e valabilă.
      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe('123');
      expect(req.userEmail).toBe('test@test.com');
      expect(req.userRole).toBe('user');
    });

    /**
     * Ce promite emailul de resetare: „după ce îl folosești, te deconectăm de
     * pe toate dispozitivele". JWT-ul e semnat pe șapte zile și nu există
     * logout pe server, deci fără verificarea asta cine ți-a furat parola
     * rămâne înăuntru o săptămână DUPĂ ce ți-o schimbi -- adică exact
     * scenariul pentru care omul cere resetarea.
     */
    it('refuză un jeton emis înainte de ultima schimbare de parolă', async () => {
      const acumUnCeas = Math.floor(Date.now() / 1000) - 3600;
      const token = jwt.sign(
        { userId: '123', email: 'test@test.com', role: 'user', iat: acumUnCeas },
        JWT_SECRET,
      );
      vi.mocked(passwordChangedAt).mockResolvedValueOnce(new Date());

      const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('lasă înăuntru jetonul emis DUPĂ schimbare', async () => {
      const acum = Math.floor(Date.now() / 1000);
      const token = jwt.sign(
        { userId: '123', email: 'test@test.com', role: 'user', iat: acum },
        JWT_SECRET,
      );
      // Parola schimbată acum o oră; jetonul e mai nou.
      vi.mocked(passwordChangedAt).mockResolvedValueOnce(new Date(Date.now() - 3600_000));

      const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('refuză jetonul unui cont care nu mai există', async () => {
      const token = jwt.sign({ userId: 'sters', email: 'x@y.ro', role: 'user' }, JWT_SECRET);
      vi.mocked(passwordChangedAt).mockResolvedValueOnce(undefined);

      const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAdmin', () => {
    // The role is read from the database now, not from req.userRole, so these
    // build the answer the lookup gets rather than the claim in the token.
    const respondWithRole = (role?: string) =>
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: role ? [{ role }] : [] } as never);

    beforeEach(() => vi.mocked(pool.query).mockReset());

    it('should return 401 if there is no user id on the request', async () => {
      const req = {} as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if the database says the user is not an admin', async () => {
      respondWithRole('user');
      const req = { userId: 'u1', userRole: 'admin' } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await requireAdmin(req, res, next);

      // userRole says admin -- that is the stale claim from a token signed
      // before the demotion, and it no longer decides anything.
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if the user no longer exists', async () => {
      respondWithRole(undefined);
      const req = { userId: 'gone' } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if the database says the user is an admin', async () => {
      respondWithRole('admin');
      const req = { userId: 'u1', userRole: 'user' } as AuthRequest;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      // The live role wins in both directions: a token that says 'user' does not
      // hold back someone the database has promoted.
      expect(req.userRole).toBe('admin');
    });
  });
});
