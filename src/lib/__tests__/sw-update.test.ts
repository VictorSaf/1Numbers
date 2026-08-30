import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The service worker's update strategy, run rather than read.
 *
 * The worker used to call skipWaiting() at install and delete every cache whose
 * name was not the new one at activate. Together those meant a deploy landing on
 * an open tab took over immediately and removed the chunks that tab was still
 * lazily importing -- the import rejects, and the only ErrorBoundary was at the
 * root, so the app went blank.
 *
 * This loads public/sw.js with a fake CacheStorage and drives three
 * generations through it, which is the shortest sequence that shows both
 * halves: build B must not delete A, and build C must.
 */

const SW_SOURCE = readFileSync(resolve(__dirname, '../../../public/sw.js'), 'utf8');

class FakeCache {
  entries = new Map<string, string>();
  async put(key: RequestInfo, value: Response) { this.entries.set(String(key), await value.text()); }
  async match(key: RequestInfo) {
    const hit = this.entries.get(String(key));
    return hit === undefined ? undefined : new Response(hit);
  }
  async addAll(_urls: string[]) { for (const u of _urls) this.entries.set(u, ''); }
}

class FakeCacheStorage {
  store = new Map<string, FakeCache>();
  async open(name: string) {
    if (!this.store.has(name)) this.store.set(name, new FakeCache());
    return this.store.get(name)!;
  }
  async keys() { return [...this.store.keys()]; }
  async delete(name: string) { return this.store.delete(name); }
}

type Handlers = Record<string, (event: { waitUntil: (p: unknown) => void }) => void>;

/** Loads the worker source as one generation and returns its event handlers. */
function loadWorker(buildId: string, caches: FakeCacheStorage) {
  const handlers: Handlers = {};
  const self = {
    addEventListener: (type: string, fn: Handlers[string]) => { handlers[type] = fn; },
    skipWaiting: () => { throw new Error('install must not call skipWaiting'); },
    clients: { claim: async () => undefined },
    registration: { showNotification: async () => undefined },
  };

  const source = SW_SOURCE.replace('__BUILD_ID__', buildId);
  new Function('self', 'caches', 'console', 'fetch', 'clients', source)(
    self, caches, { log() {}, error() {} }, async () => new Response(''), self.clients,
  );

  return handlers;
}

/** Runs a generation's install and activate to completion. */
async function deploy(buildId: string, caches: FakeCacheStorage) {
  const handlers = loadWorker(buildId, caches);
  const pending: unknown[] = [];
  const event = { waitUntil: (p: unknown) => pending.push(p) };

  handlers.install(event);
  await Promise.all(pending);
  pending.length = 0;

  handlers.activate(event);
  await Promise.all(pending);
}

const appCaches = (caches: FakeCacheStorage) =>
  [...caches.store.keys()].filter((n) => n !== 'sw-meta').sort();

describe('the worker does not pull the rug from an open tab', () => {
  it('never calls skipWaiting during install', async () => {
    // loadWorker throws from the stub if it does, so reaching the end is the
    // assertion. The only skipWaiting left is the SKIP_WAITING message handler.
    const caches = new FakeCacheStorage();
    await deploy('build-a', caches);
    expect(appCaches(caches)).toEqual(['numerology-compass-build-a']);
  });

  it('keeps the previous generation alive through one deploy', async () => {
    const caches = new FakeCacheStorage();
    await deploy('build-a', caches);
    await deploy('build-b', caches);

    // A tab still on build A can keep reading its chunks.
    expect(appCaches(caches)).toEqual([
      'numerology-compass-build-a',
      'numerology-compass-build-b',
    ]);
  });

  it('retires it on the deploy after that', async () => {
    const caches = new FakeCacheStorage();
    await deploy('build-a', caches);
    await deploy('build-b', caches);
    await deploy('build-c', caches);

    expect(appCaches(caches)).toEqual([
      'numerology-compass-build-b',
      'numerology-compass-build-c',
    ]);
  });

  it('takes over only when the page asks, via SKIP_WAITING', async () => {
    const caches = new FakeCacheStorage();
    let skipped = false;
    const handlers: Handlers = {};
    const self = {
      addEventListener: (type: string, fn: Handlers[string]) => { handlers[type] = fn; },
      skipWaiting: () => { skipped = true; },
      clients: { claim: async () => undefined },
      registration: { showNotification: async () => undefined },
    };
    new Function('self', 'caches', 'console', 'fetch', 'clients', SW_SOURCE.replace('__BUILD_ID__', 'x'))(
      self, caches, { log() {}, error() {} }, async () => new Response(''), self.clients,
    );

    handlers.install({ waitUntil: () => undefined });
    expect(skipped, 'install must wait').toBe(false);

    (handlers.message as unknown as (e: { data: unknown }) => void)({ data: { type: 'SKIP_WAITING' } });
    expect(skipped, 'the page asked').toBe(true);
  });
});
