const CACHE_NAME = 'surf-templo-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Limpia cualquier residuo viejo que tranque la carga
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map(key => caches.delete(key)));
        })
    );
    return self.clients.claim();
});

// Esta función permite que la app funcione siempre conectada a los datos reales
self.addEventListener('fetch', (event) => {
    return; 
});
