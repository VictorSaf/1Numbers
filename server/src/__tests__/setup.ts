import { beforeAll, afterAll, vi } from 'vitest';

/**
 * Verificarea de sesiune, neutră implicit, în toate testele.
 *
 * `authenticateToken` întreabă de la fiecare cerere autentificată dacă parola
 * a fost schimbată după emiterea jetonului -- fără asta, „te deconectăm de pe
 * toate dispozitivele" din emailul de resetare ar fi o minciună.
 *
 * Dublurile de `pool` din teste amorsează răspunsuri poziționale, deci citirea
 * asta ar fi consumat primul răspuns din fiecare lanț. Aici se răspunde o
 * singură dată, pentru toate: `null` înseamnă „parola n-a fost schimbată”, deci
 * niciun jeton nu e invalidat. Testul care chiar verifică deconectarea își
 * suprascrie valoarea.
 */
vi.mock('../lib/sessions', () => ({
  passwordChangedAt: vi.fn().mockResolvedValue(null),
}));

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});
