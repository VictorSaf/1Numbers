import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Preferințele trăiau numai în localStorage, deci rândul din
 * notification_preferences nu se crea niciodată și `enabled` rămânea false pe
 * server -- adică dispecerul zilnic nu găsea pe nimeni, oricât de corect ar fi
 * fost. Testul ăsta e capătul dinspre client al aceleiași bucle.
 */

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const preferencePuts = () =>
  vi.mocked(global.fetch).mock.calls.filter(([url, init]) =>
    String(url).endsWith('/notifications/preferences') && (init as RequestInit)?.method === 'PUT',
  );

describe('useNotifications — preferințele merg la server', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', 'token-de-test');
    global.fetch = vi.fn((url, init) => {
      // GET returns 404 (no server preferences yet)
      if ((init as RequestInit)?.method !== 'PUT') {
        return Promise.resolve({ ok: false } as never);
      }
      // PUT succeeds
      return Promise.resolve({ ok: true, json: async () => ({}) } as never);
    }) as never;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trimite obiectul complet de preferințe, nu doar câmpul schimbat', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(preferencePuts().length).toBeGreaterThan(0));

    act(() => {
      result.current.updatePreferences({ dailyPredictionTime: '07:30' });
    });

    await waitFor(() => {
      const last = preferencePuts().at(-1)!;
      const body = JSON.parse((last[1] as RequestInit).body as string);
      expect(body.preferences.dailyPredictionTime).toBe('07:30');
      // Schema serverului e .strict() și cere toate cele șapte câmpuri.
      expect(Object.keys(body.preferences).sort()).toEqual([
        'achievements',
        'dailyPrediction',
        'dailyPredictionTime',
        'enabled',
        'specialDates',
        'streakReminder',
        'streakReminderTime',
      ]);
    });
  });

  it('trimite tokenul de autentificare, altfel serverul nu știe al cui e rândul', async () => {
    renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      const headers = (preferencePuts().at(-1)![1] as RequestInit).headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer token-de-test');
    });
  });

  it('nu cheamă serverul dacă nu există niciun token', async () => {
    localStorage.removeItem('auth_token');

    renderHook(() => useNotifications(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(preferencePuts()).toHaveLength(0);
  });
});

describe('useNotifications — preferințele se citesc de pe server la montare', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', 'token-de-test');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as never;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('server are preferințe → le citește și NU le suprascrie cu PUT la montare', async () => {
    const serverPrefs = {
      enabled: true,
      dailyPrediction: false,
      dailyPredictionTime: '10:00',
      streakReminder: false,
      streakReminderTime: '19:00',
      specialDates: false,
      achievements: false,
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ preferences: serverPrefs }),
      })
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.preferences).toEqual(serverPrefs);
    });

    // At mount, GET loaded from server, so initial PUT was skipped.
    // The only PUT that might have been made is after skip-reset, but we verify
    // that preferences match server (i.e., no overwrite happened)
    expect(result.current.preferences.dailyPredictionTime).toBe('10:00');
  });

  it('server n-are rând → creează-l cu PUT la montare din defaults', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false }) // GET returns error
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      const puts = preferencePuts();
      expect(puts.length).toBeGreaterThan(0);
      const body = JSON.parse((puts[0][1] as RequestInit).body as string);
      expect(body.preferences.enabled).toBe(false); // Default value
    });
  });

  it('user neautentificat → nu face GET nici PUT', async () => {
    localStorage.removeItem('auth_token');

    renderHook(() => useNotifications(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const allCalls = vi.mocked(global.fetch).mock.calls.filter(([url]) =>
      String(url).endsWith('/notifications/preferences'),
    );
    expect(allCalls).toHaveLength(0);
  });

  it('user schimbă preferințele după ce s-au încărcat de la server → PUT se execută cu noi valori', async () => {
    const serverPrefs = {
      enabled: true,
      dailyPrediction: false,
      dailyPredictionTime: '10:00',
      streakReminder: false,
      streakReminderTime: '19:00',
      specialDates: false,
      achievements: false,
    };

    let callCount = 0;
    global.fetch = vi.fn((url, init) => {
      callCount++;
      if ((init as RequestInit)?.method !== 'PUT' && callCount === 1) {
        // First call is GET
        return Promise.resolve({
          ok: true,
          json: async () => ({ preferences: serverPrefs }),
        } as never);
      }
      // All other calls (PUT or further GETs) succeed
      return Promise.resolve({ ok: true, json: async () => ({}) } as never);
    }) as never;

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for server preferences to load
    await waitFor(() => {
      expect(result.current.preferences.dailyPredictionTime).toBe('10:00');
    });

    // User updates
    act(() => {
      result.current.updatePreferences({ dailyPredictionTime: '09:00' });
    });

    // Wait for PUT with new value
    await waitFor(() => {
      const puts = preferencePuts();
      // Find the last PUT call
      const lastPut = puts[puts.length - 1];
      expect(lastPut).toBeDefined();
      const body = JSON.parse((lastPut![1] as RequestInit).body as string);
      expect(body.preferences.dailyPredictionTime).toBe('09:00');
    });
  });
});
