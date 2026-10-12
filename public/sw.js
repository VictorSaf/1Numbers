// Service Worker for Numerology Compass
// Handles push notifications and offline caching

// Replaced at build time (scripts/stamp-sw.mjs). A fixed name meant the activate
// handler below never deleted anything, so one cache outlived every deploy.
const CACHE_VERSION = '__BUILD_ID__';
const CACHE_NAME = `numerology-compass-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline use
// The app shell is deliberately absent. Pre-caching '/' and '/index.html' and
// then serving them cache-first froze returning visitors on whichever build was
// current when the worker installed -- no redeploy could ever reach them.
const STATIC_ASSETS = [
  '/manifest.json',
  // offline.html carries no inline script -- the static server sends
  // script-src 'self' -- so its copy lives here and has to be cached with it.
  '/offline.js',
  // The navigation handler below falls back to this when the network is
  // gone and nothing is cached. It has to be precached to be reachable --
  // and until now the file did not exist at all, so that branch resolved to
  // undefined and the browser showed its own error instead.
  OFFLINE_URL,
];

// Records which cache the previous generation used, so activate can keep it one
// more round instead of deleting the chunks an open tab is still importing.
const PREVIOUS_CACHE_KEY = 'previous-cache-name';

// Install event - cache static assets
//
// No skipWaiting here. The app is split with React.lazy, so a tab running build
// N holds a document that names N's chunks by hash. Taking over immediately and
// deleting N's cache -- which is what the two lines that used to be here did
// together -- left that tab importing files that no longer exist in the cache
// and no longer exist on disk either; the lazy import rejects and the only
// ErrorBoundary is at the root, so the whole app goes blank.
//
// The new worker waits. The page is told, and the person decides when to
// reload; that is what the SKIP_WAITING message below is for.
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - retire the generation before last, keep the one just behind
//
// Two caches are alive at any time: this build's, and the one it replaced. A
// tab that has not reloaded yet still reads from the older one. It is deleted
// on the *next* activate, by which point that tab has had a whole deploy cycle
// to reload.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    (async () => {
      const keep = new Set([CACHE_NAME]);

      const meta = await caches.open('sw-meta');
      const stored = await meta.match(PREVIOUS_CACHE_KEY);
      const previous = stored ? await stored.text() : null;
      if (previous && previous !== CACHE_NAME) keep.add(previous);

      for (const name of await caches.keys()) {
        if (name === 'sw-meta' || keep.has(name)) continue;
        console.log('[SW] Deleting old cache:', name);
        await caches.delete(name);
      }

      // Whichever cache was current before this worker took over becomes the one
      // we protect through the next deploy.
      if (previous !== CACHE_NAME) {
        await meta.put(PREVIOUS_CACHE_KEY, new Response(CACHE_NAME));
      }

      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  // Vite emits content-hashed filenames under /assets/, so a hit there can never
  // be stale: a changed file gets a new name.
  const isHashedAsset = url.pathname.startsWith('/assets/');

  if (isNavigation) {
    // Network first, cache only as an offline fallback. The document is the one
    // response that must never be served stale, because it names every asset.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (isHashedAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: try the network, fall back to whatever was stored.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let notificationData = {
    title: 'Numerology Compass',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: notificationData.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = '/';

  // Determine target URL based on notification type
  if (notificationData.url) {
    targetUrl = notificationData.url;
  } else if (notificationData.type) {
    switch (notificationData.type) {
      case 'daily-prediction':
        targetUrl = '/predictions';
        break;
      case 'streak-reminder':
        targetUrl = '/';
        break;
      case 'achievement':
        targetUrl = '/profile';
        break;
      case 'special-date':
        targetUrl = '/predictions';
        break;
      default:
        targetUrl = '/';
    }
  }

  // Handle action buttons
  if (event.action) {
    console.log('[SW] Action clicked:', event.action);
    // Actions can have specific behaviors if needed
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-gamification') {
    event.waitUntil(syncGamificationData());
  }
});

// Helper function to sync gamification data
async function syncGamificationData() {
  try {
    // This would sync any offline gamification actions
    console.log('[SW] Syncing gamification data...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Message event - handle messages from the main app
//
// SKIP_WAITING is the only way a new worker takes over now: the page asks for
// it after the person accepts the reload prompt. It sat here unreachable while
// install() called skipWaiting() unconditionally.
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
