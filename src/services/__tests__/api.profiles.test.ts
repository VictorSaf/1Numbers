import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../api';

/**
 * Serverul acceptă categoria de la Task 1 încoace. Aici se verifică singurul
 * lucru care mai poate rămâne pe dinafară: că clientul chiar o trimite.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, profile: { id: 'p1', category: 'copil' } }),
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const bodyOf = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body as string);

describe('clientul duce categoria', () => {
  it('o trimite la creare', async () => {
    await api.createProfile({
      fullName: 'Ana Pop',
      birthDate: '1990-05-15',
      category: 'copil',
    });

    expect(bodyOf(0)).toMatchObject({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'copil' });
  });

  it('o trimite la actualizare', async () => {
    await api.updateProfile('p1', {
      fullName: 'Ana Pop',
      birthDate: '1990-05-15',
      category: 'apropiat',
    });

    expect(bodyOf(0)).toMatchObject({ category: 'apropiat' });
    expect(fetchMock.mock.calls[0][0]).toContain('/profiles/p1');
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
  });

  it('nu inventează o categorie când nu i se dă una', async () => {
    await api.createProfile({ fullName: 'Ana Pop', birthDate: '1990-05-15' });

    expect(bodyOf(0)).not.toHaveProperty('category');
  });
});
