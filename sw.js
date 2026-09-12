const CACHE = 'volver-a-mi-v7';
const ARCHIVOS = ['./', './index.html', './data.js', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './fondo-claro.jpg', './fondo-oscuro.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

/* red primero para páginas y código: los cambios se ven de inmediato;
   caché primero solo para imágenes y fuentes */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const esImagen = /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname);
  if (e.request.mode === 'navigate' || !esImagen){
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
