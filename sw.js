const CACHE_NAME = 'amat-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-toko.png'
];

self.addEventListener('install', (e) => {
  console.log('Service Worker: Ter-install');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Jika ada di cache (offline), tampilkan. Jika tidak, ambil dari internet.
      return response || fetch(e.request);
    })
  );
});
