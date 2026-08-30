/**
 * Service worker registration, and the update handshake around it.
 *
 * Registration is deliberately the last piece: the worker's install no longer
 * calls skipWaiting() and its activate keeps the previous generation's cache,
 * so a deploy landing on an open tab can no longer pull that tab's lazy chunks
 * out from under it. Registering before that was in place would have broken
 * every open tab on the first deploy.
 *
 * The only register() in the codebase used to sit in notifications.ts, reached
 * through a hook whose only consumer had no importer -- so the PWA shipped in
 * 5faad89 never actually installed on anyone's device.
 */

type ApplyUpdate = () => void;

/** Called when a newer worker is installed and waiting for permission to take over. */
export type UpdateAvailable = (apply: ApplyUpdate) => void;

export function registerServiceWorker(onUpdateAvailable: UpdateAvailable): void {
  if (!('serviceWorker' in navigator)) return;
  // The dev server has no build id to stamp into the cache name, and a worker
  // caching Vite's unhashed dev modules is worse than no worker at all.
  if (!import.meta.env.PROD) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Fires once the waiting worker has taken over, whether that was our
    // SKIP_WAITING or the browser deciding on its own. Guarded because Chrome
    // can fire it more than once and a reload loop is the worst outcome here.
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // A worker can already be waiting when the page loads -- the update was
        // found during a previous visit and nobody accepted it.
        if (registration.waiting && navigator.serviceWorker.controller) {
          onUpdateAvailable(() => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }));
        }

        registration.addEventListener('updatefound', () => {
          const incoming = registration.installing;
          if (!incoming) return;

          incoming.addEventListener('statechange', () => {
            if (incoming.state !== 'installed') return;
            // No controller means this is the first install on this device.
            // There is nothing to replace, so there is nothing to announce.
            if (!navigator.serviceWorker.controller) return;
            onUpdateAvailable(() => incoming.postMessage({ type: 'SKIP_WAITING' }));
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
