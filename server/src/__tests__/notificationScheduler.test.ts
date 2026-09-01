import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configurePush } from '../lib/push';
import { runDailyDispatch } from '../lib/dailyDispatch';
import { startNotificationScheduler } from '../lib/notificationScheduler';

vi.mock('../lib/push', () => ({ configurePush: vi.fn() }));
vi.mock('../lib/dailyDispatch', () => ({ runDailyDispatch: vi.fn() }));

describe('startNotificationScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(configurePush).mockReset();
    vi.mocked(runDailyDispatch).mockReset().mockResolvedValue({
      claimed: 0, sent: 0, gone: 0, failed: 0,
    });
    delete process.env.NOTIFICATIONS_ENABLED;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nu pornește dacă NOTIFICATIONS_ENABLED nu e exact "true"', () => {
    process.env.NOTIFICATIONS_ENABLED = 'yes';

    expect(startNotificationScheduler()).toBeNull();
    expect(configurePush).not.toHaveBeenCalled();
  });

  it('nu pornește dacă lipsesc cheile VAPID, chiar cu comutatorul pornit', () => {
    process.env.NOTIFICATIONS_ENABLED = 'true';
    vi.mocked(configurePush).mockReturnValue(false);

    expect(startNotificationScheduler()).toBeNull();
  });

  it('pornește și cheamă dispecerul la fiecare minut', () => {
    process.env.NOTIFICATIONS_ENABLED = 'true';
    vi.mocked(configurePush).mockReturnValue(true);

    const timer = startNotificationScheduler();
    expect(timer).not.toBeNull();

    expect(runDailyDispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(runDailyDispatch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(runDailyDispatch).toHaveBeenCalledTimes(2);

    clearInterval(timer!);
  });
});
