import { Request, Response, NextFunction } from 'express';

/**
 * Fereastră glisantă în memorie, cu două chei posibile: adresa clientului sau
 * utilizatorul autentificat.
 *
 * Limita pe IP nu poate proteja un cont folosit de pe mai multe rețele, iar
 * limita pe utilizator nu poate proteja rutele neautentificate (înregistrare,
 * autentificare). Sunt două chei peste același algoritm, nu doi algoritmi.
 *
 * Pentru rutele care cheltuie bani la un furnizor extern se pun amândouă.
 *
 * Starea e per-proces și dispare la repornire, ceea ce e acceptabil aici:
 * apără un deployment cu o singură instanță de abuz ocazional, nu de un atac
 * distribuit. Un depozit comun ar fi necesar dacă API-ul e vreodată scalat.
 *
 * Nu există fail-open: o limită care cheamă next() la eroare ar lăsa să treacă
 * exact cererile care plătesc tokeni. Aici nu e nimic care să poată eșua.
 */
interface Options {
  windowMs: number;
  max: number;
}

/** Cererile autentificate poartă userId, pus de authenticateToken. */
type MaybeAuthed = Request & { userId?: string };

const clientIp = (req: Request): string => {
  // Every request arrives through the Cloudflare Tunnel, which sets this header;
  // req.ip would otherwise be the loopback address for all callers alike.
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf) return cf;
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff) return xff.split(',')[0].trim();
  return req.ip ?? 'unknown';
};

const slidingWindow = (
  { windowMs, max }: Options,
  keyOf: (req: MaybeAuthed) => string | undefined,
) => {
  const hits = new Map<string, number[]>();

  return (req: MaybeAuthed, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyOf(req);

    // Fără cheie nu se numără. Pentru varianta pe utilizator asta înseamnă o
    // cerere neautentificată, pe care authenticateToken a oprit-o deja.
    if (!key) return next();

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

export const ipRateLimit = (options: Options) => slidingWindow(options, clientIp);

export const userRateLimit = (options: Options) => slidingWindow(options, (req) => req.userId);
