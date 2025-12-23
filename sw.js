// Service Worker para Surf Report Uruguay
// Proporciona funcionalidad offline y mejora la experiencia de usuario

const CACHE_NAME = 'surf-uruguay-v1';
const STATIC_CACHE = 'surf-static-v1';
const DYNAMIC_CACHE = 'surf-dynamic-v1';

// Archivos estáticos a cachear inmediatamente
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// URLs de APIs que no deben cachearse (siempre solicitar fresh data)
const API_URLS = [
    'api.open-meteo.com',
    'marine-api.open-meteo.com'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Cacheando archivos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Archivos estáticos cacheados exitosamente');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error cacheando archivos estáticos:', error);
            })
    );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE &&
                                   cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Verificar si es una solicitud de API
    const isApiRequest = API_URLS.some(apiUrl => url.hostname.includes(apiUrl));

    if (isApiRequest) {
        // Para APIs: Network first, fallback to cache
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clonar la respuesta para cachearla
                    const responseClone = response.clone();
                    
                    // Solo cachear respuestas exitosas
                    if (response.status === 200) {
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    
                    return response;
                })
                .catch(() => {
                    // Si falla la red, intentar obtener del cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            
                            // Si no hay cache ni red, retornar error offline
                            return new Response(
                                JSON.stringify({ error: 'Offline', message: 'Sin conexión a internet' }),
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
    } else {
        // Para recursos estáticos: Cache first, fallback to network
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Devolver desde cache y actualizar en background
                        fetch(request)
                            .then((response) => {
                                if (response.status === 200) {
                                    caches.open(DYNAMIC_CACHE)
                                        .then((cache) => {
                                            cache.put(request, response);
                                        });
                                }
                            })
                            .catch(() => {});
                        
                        return cachedResponse;
                    }
                    
                    // Si no está en cache, obtener de la red
                    return fetch(request)
                        .then((response) => {
                            // Solo cachear respuestas exitosas
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(DYNAMIC_CACHE)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.error('[SW] Error en fetch:', error);
                            
                            // Si es una navegación y no hay cache, mostrar página offline
                            if (request.mode === 'navigate') {
                                return caches.match('/index.html');
                            }
                            
                            return new Response('Offline');
                        });
                })
        );
    }
});

// Message Event - Allow clients to communicate with SW
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
        );
    }
});

// Sync Event - Background sync cuando vuelve la conexión
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Sincronizando datos en background...');
    }
});

// Push Event - Manejar notificaciones push (si se implementan en el futuro)
self.addEventListener('push', (event) => {
    console.log('[SW] Push recibido:', event);
    
    if (event.data) {
        const data = event.data.json();
        console.log('[SW] Datos del push:', data);
    }
});
