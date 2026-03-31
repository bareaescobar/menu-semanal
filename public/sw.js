const CACHE = 'menu-semanal-v3';
const BASE = self.location.pathname.replace('/sw.js', '');
const ASSETS = [BASE + '/', BASE + '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Solo cachear peticiones al mismo origen (no Supabase, no analytics, etc.)
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
      if (cached) {
        // Background revalidation — suppress unhandled rejection when offline
        networkFetch.catch(() => {});
        return cached;
      }
      return networkFetch;
    })
  );
});
