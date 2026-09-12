const CACHE = 'volver-a-mi-v6';
const ARCHIVOS = ['./', './index.html', './data.js', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './fondo-claro.jpg', './fondo-oscuro.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k =>
    Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
