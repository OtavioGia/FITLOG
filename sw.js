const CACHE_NAME = 'fitlog-v3';
const APP_SHELL = [
  '/FITLOG/',
  '/FITLOG/index.html',
  '/FITLOG/manifest.json'
];

// Instalação
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Cache aberto');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { 
            console.log('Cache antigo removido:', name);
            return caches.delete(name); 
          })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Deixa requisições externas (Google Apps Script, imagens externas) passarem normalmente
  if (url.hostname !== self.location.hostname) {
    // Só responde do cache se for uma requisição de navegação ou recurso estático
    if (event.request.mode === 'navigate' || event.request.destination === 'image') {
      event.respondWith(
        fetch(event.request).catch(function() {
          return caches.match(event.request);
        })
      );
    }
    return;
  }

  // Para recursos do próprio domínio
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      // Retorna do cache se existir, senão busca da rede
      return cachedResponse || fetch(event.request).then(function(response) {
        // Não coloca em cache respostas da API
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    }).catch(function() {
      // Se estiver offline e for navegação, retorna página inicial
      if (event.request.mode === 'navigate') {
        return caches.match('/FITLOG/');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

// Evento de mensagem (para comunicação com a página)
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
