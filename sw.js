const CACHE_NAME = 'surf-uy-v1';

// Solo cacheamos la estructura básica
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Para las APIs de datos (Open-Meteo), siempre ir a la red primero
  if (event.request.url.includes('api.open-meteo.com') || event.request.url.includes('marine-api')) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
