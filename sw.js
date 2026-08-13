const CACHE_VERSION = 'presenca-vivo-v1';
const APP_SHELL = ['./Presenca_Vivo_PHT_2120_2130_ESCALA_DEZEMBRO.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request)));
});
