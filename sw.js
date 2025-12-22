const CACHE_NAME = 'surf-v5-final-fast';

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
    // Dejar pasar todas las peticiones para máxima velocidad de datos
    return;
});


