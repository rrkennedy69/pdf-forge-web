// PDF Forge service worker: precache the app shell, then serve it offline.
// PRECACHE is filled in by build.sh after `trunk build`.
const VERSION = '59f74908d667';
const PRECACHE = ['LICENSE-APACHE','LICENSE-DejaVu.txt','LICENSE-MIT','NOTICE','icons/apple-touch-icon.png','icons/favicon-32.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','index.html','manifest.webmanifest','pdfcraft-web-d8a633298ac0569e.js','pdfcraft-web-e068a05107fac390_bg.wasm','snippets/eframe-d31a8450ea12dfc1/inline0.js'];
const CACHE = 'pdfforge-' + VERSION;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...PRECACHE])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('pdfforge-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Network first for the page so updates arrive; cached shell when offline.
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); return r; })
      .catch(() => caches.match('./', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return r;
  })));
});
