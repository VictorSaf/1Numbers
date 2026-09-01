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
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as never;
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
