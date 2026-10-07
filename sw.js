// Service Worker pour FOX GESCOM (PWA)
const CACHE_NAME = 'fox-gescom-v1.3.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './index.css',
  './app.js',
  './mockData.js',
  './supabaseSync.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './favicon.svg'
];

// Installation : mise en cache des ressources essentielles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau (Stratégie Network First avec secours Cache)
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET ou externes (Supabase API, CDN externes)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Pour les appels Supabase ou API distantes, laisser passer directement
  if (url.origin.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si réponse valide locale, on met à jour le cache
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne réseau / hors-ligne, chercher dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si navigation HTML hors-ligne, renvoyer la page principale
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
