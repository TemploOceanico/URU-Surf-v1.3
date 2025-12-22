const CACHE_NAME = 'surf-v3-final';

// Solo guardamos en memoria lo visual (HTML y Manifest)
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // CLAVE: Si la URL es de una API (Open-Meteo), NO pasar por el caché.
  if (e.request.url.includes('api')) {
    return; // El navegador maneja la petición normalmente por red
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});

