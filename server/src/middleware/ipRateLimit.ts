import { Request, Response, NextFunction } from 'express';

/**
 * In-memory sliding-window rate limiter keyed by client IP.
 *
 * The existing rateLimit middleware keys on req.userId and so cannot protect
 * unauthenticated endpoints such as registration and login.
 *
 * State is per-process and resets on restart, which is acceptable here: this
 * guards a single-instance deployment against casual abuse, not a distributed
 * attack. A shared store would be required if the API is ever scaled out.
 */
interface Options {
  windowMs: number;
  max: number;
}

const clientIp = (req: Request): string => {
  // Every request arrives through the Cloudflare Tunnel, which sets this header;
  // req.ip would otherwise be the loopback address for all callers alike.
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf) return cf;
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff) return xff.split(',')[0].trim();
  return req.ip ?? 'unknown';
};

export const ipRateLimit = ({ windowMs, max }: Options) => {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = clientIp(req);
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests', retryAfter });
    }

    recent.push(now);
    hits.set(key, recent);

    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every((t) => now - t >= windowMs)) hits.delete(k);
      }
    }

    next();
  };
};
