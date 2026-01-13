import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

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
    it('should return 403 if user is not admin', () => {
      const req = {
        userRole: 'user',
      } as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      const req = {
        userRole: 'admin',
      } as AuthRequest;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
