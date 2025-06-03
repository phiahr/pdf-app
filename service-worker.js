const CACHE_NAME = 'pdf-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/assets/stammblatt.pdf',
  '/assets/Auftragsbestätigung.pdf',
  // ggf. weitere statische Dateien
];

// Install: Dateien vorab cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Fetch: Dateien zuerst aus Cache, dann aus Netzwerk (Fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// Optional: Cache beim Update bereinigen (Versionierung beachten)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});
