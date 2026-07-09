const CACHE_NAME = 'fitlog-v3';

// Arquivos que serão cacheados para a tela ponte carregar instantaneamente
const URLS_TO_CACHE = [
  '/FITLOG/',
  '/FITLOG/index.html',
  '/FITLOG/manifest.json',
  'https://flysantos.com/wp-content/uploads/2026/03/LOGO_FITLOG-2.png'
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
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Ignora requisições para o Google Script, deixando ir direto para a internet
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // Tenta responder com o cache primeiro (para a tela inicial), senão busca na rede
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // Retorna do cache
      }
      return fetch(event.request).catch(function() {
        // Fallback caso a internet esteja off e não esteja no cache
        if (event.request.mode === 'navigate') {
          return caches.match('/FITLOG/index.html');
        }
      });
    })
  );
});
