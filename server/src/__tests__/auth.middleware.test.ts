import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import pool from '../db';

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

    it('should call next and set user info if token is valid', () => {
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

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe('123');
      expect(req.userEmail).toBe('test@test.com');
      expect(req.userRole).toBe('user');
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
