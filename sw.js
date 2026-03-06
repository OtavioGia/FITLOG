// Service Worker — FITLOG
// Necessário para o Chrome reconhecer como PWA instalável
var CACHE = 'fitlog-v1';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(['/', '/index.html', '/manifest.json']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Só trata requests da própria origem do GitHub Pages
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(r) {
        return r || caches.match('/index.html');
      });
    })
  );
});
