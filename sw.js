const CACHE_NAME = 'surf-uy-v2'; // Cambiamos a v2 para forzar la actualización

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Si la petición es para las APIs de Open-Meteo, NO usar caché, ir directo a internet
  if (event.request.url.includes('api.open-meteo.com') || event.request.url.includes('marine-api')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
