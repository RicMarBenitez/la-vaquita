// Guarda la app en el celular para que abra rápido y funcione sin internet.
const CACHE = "la-vaquita-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Primero intenta internet (para tener siempre la última versión); si no hay, usa lo guardado.
// Solo guarda archivos de la app y de la librería de Firebase, nunca los datos.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const cacheable = e.request.method === "GET" && (url.origin === location.origin || url.hostname === "www.gstatic.com");
  if (!cacheable) return;
  e.respondWith(
    // Los archivos de la app siempre preguntan al servidor si hay versión nueva.
    // La librería de Firebase tiene la versión en la dirección, así que no cambia.
    (url.origin === location.origin ? fetch(e.request.url, { cache: "no-cache" }) : fetch(e.request)).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
