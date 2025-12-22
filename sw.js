const CACHE_NAME = 'surf-v1.3-final';

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
    // No interceptamos para asegurar que el contenido dinámico cargue siempre
    return;
});
