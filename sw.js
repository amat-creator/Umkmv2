const CACHE_NAME = 'amat-pro-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon-toko.png'
];


self.addEventListener('install', (e) => {
  console.log('Service Worker: Ter-install');
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache.map((u) => new Request(u, { cache: 'reload' })));
      })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});
