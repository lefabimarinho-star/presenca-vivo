const CACHE_VERSION = 'presenca-vivo-v8-chave-corrigida';

const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(APP_SHELL.map(url => cache.add(new Request(url, {cache:'reload'}))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const url = new URL(req.url);

  // Não intercepta Firebase nem outros serviços externos.
  if (url.origin !== self.location.origin) return;

  // HTML/navegação: rede primeiro e sem cache HTTP.
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, {cache:'no-store'});
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put('./index.html', fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Arquivos locais: rede primeiro, cache apenas como contingência.
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (e) {
      return (await caches.match(req)) || Response.error();
    }
  })());
});
