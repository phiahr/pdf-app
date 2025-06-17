const CACHE_NAME = 'pdf-app-v2';

// TODO: Automaize the list of assets to cache
const ASSETS_TO_CACHE = [
    '/',

    // HTML, CSS, JS, and manifest files
    '/index.html',
    '/style.css',
    '/main.js',
    '/manifest.json',
    '/libs/pdf-lib.min.js',
    '/libs/signature_pad.min.js',
    '/libs/FileSaver.min.js',

    // icons
    '/icons/icon-192.png',
    '/icons/icon-512.png',

    // general PDF files
    '/assets/AGB.pdf',
    '/assets/Annahme.pdf',
    '/assets/Auftragsbestaetigung.pdf',
    '/assets/Datenschutz.pdf',
    '/assets/Stammblatt.pdf',
    '/assets/Vollmacht.pdf',

    // insurance provider PDF files
    // '/assets/insurance_providers/aok.pdf',
    // '/assets/insurance_providers/barmer.pdf',
    // '/assets/insurance_providers/dak.pdf',
    // '/assets/insurance_providers/ikk.pdf',
    // '/assets/insurance_providers/kkh.pdf',
    // '/assets/insurance_providers/knappschaft.pdf',
    // '/assets/insurance_providers/other.pdf',
    // '/assets/insurance_providers/tk.pdf',
];

// Install: Dateien vorab cachen
self.addEventListener('install', event => {
    self.skipWaiting();
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
