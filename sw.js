self.addEventListener('install', (e) => {
  console.log('Service Worker: Ter-install');
});

self.addEventListener('fetch', (e) => {
  // Biarkan kosong gasan syarat dasar install PWA
});

