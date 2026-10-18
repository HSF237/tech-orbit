/* Tech Orbit service worker — offline-first shell */
const C = "to-v1";
const A = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./og.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k != C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method != "GET") return;
  const u = new URL(e.request.url);
  /* navigations: network-first, offline -> cached app shell */
  if (e.request.mode == "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(C).then(c => c.put("./index.html", cp)); return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  /* same-origin + Google Fonts: cache-first with background fill */
  if (u.origin == location.origin || /fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => {
      const cp = n.clone(); caches.open(C).then(c => c.put(e.request, cp)); return n;
    })));
  }
});