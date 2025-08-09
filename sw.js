const CACHE_NAME = 'shawn-gold-standard-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/main.js',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/how-it-works.html',
  '/pages/quote.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') {
    return;
  }

  // Bypass caching for external image CDNs (always fetch fresh)
  if (
    url.hostname.endsWith('res.cloudinary.com') ||
    url.hostname.endsWith('images.unsplash.com') ||
    url.hostname.endsWith('images.pexels.com')
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // HTML pages: Network-first to always get latest content
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Same-origin CSS/JS: Stale-while-revalidate
  if (url.origin === self.location.origin && (req.destination === 'script' || req.destination === 'style')) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          return networkRes;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim())
  );
});
