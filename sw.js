const CACHE_NAME = 'fitlog-v3';
const URLS_TO_CACHE = [
  '/FITLOG/',
  '/FITLOG/index.html',
  '/FITLOG/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Deixa requisições do Google Apps Script passarem direto pela internet
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Tenta buscar na rede, se falhar ou estiver offline, pega do cache
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
