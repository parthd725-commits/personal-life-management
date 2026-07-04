const CACHE_NAME = "wlb-cache-v1"; // 🔴 naya version deploy karte waqt v1 -> v2 karo taaki purana cache clear ho
const ASSETS_TO_CACHE = [
  const ASSETS_TO_CACHE = [
  "/personal-life-management/",
  "/personal-life-management/index.html",
  "/personal-life-management/manifest.json",
  "/personal-life-management/icon-192.png",
  "/personal-life-management/icon-512.png"
];
];

// Install: cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: purane caches delete karo
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for HTML (fresh content), cache-first for other assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  if (req.mode === "navigate" || req.destination === "document") {
    // Network-first: latest version milega jab online ho, offline par cached fallback
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match("/personal-life-management/index.html")))
    );
    return;
  }

  // Cache-first for other static assets (icons, manifest, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
      );
    })
  );
});
