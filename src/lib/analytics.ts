// Thin wrapper over Plausible.
//
// Every call is a no-op until the script has loaded, and it never throws: an
// analytics outage, an ad blocker or a missing account must not break a page.
// Plausible is cookie-free, so this needs no consent banner.

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

export type AnalyticsEvent =
  | "calculate_submitted"
  | "result_viewed"
  | "paywall_shown"
  | "subscribe_clicked"
  | "signup_started"
  | "signup_completed"
  | "language_changed";

export const track = (event: AnalyticsEvent, props?: Props): void => {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Analytics must never surface to the user.
  }
};
