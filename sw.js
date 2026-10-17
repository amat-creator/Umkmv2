1| const CACHE_NAME = 'amat-pro-v2';
2| const urlsToCache = [
3|   './',
4|   './index.html',
5|   './app.js',
6|   './style.css',
7|   './manifest.json',
8|   './icon-toko.png'
9| ];
10| 
11| self.addEventListener('install', (e) => {
12|   console.log('Service Worker: Ter-install');
13|   self.skipWaiting();
14|   e.waitUntil(
15|     caches.open(CACHE_NAME)
16|       .then((cache) => {
17|         return cache.addAll(urlsToCache.map((u) => new Request(u, { cache: 'reload' })));
18|       })
19|   );
20| });
21| 
22| self.addEventListener('activate', (e) => {
23|   e.waitUntil(
24|     caches.keys()
25|       .then((names) => Promise.all(
26|         names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
27|       ))
28|       .then(() => self.clients.claim())
29|   );
30| });
