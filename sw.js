const CACHE_NAME = 'balabar-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './manifest.json',
  './balabar-logo.svg'
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
