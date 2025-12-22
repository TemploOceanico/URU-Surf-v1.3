const CACHE_NAME = 'surf-v1.3-stable';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map(key => caches.delete(key)));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // No interferir con las peticiones para que siempre carguen datos reales
    return;
});
