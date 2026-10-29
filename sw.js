/* Offline app shell. build-pwa.mjs replaces the list with all generated assets. */
const PRECACHE = ["./","./index.html","./?privacy","./manifest.webmanifest","./favicon.svg","./apple-touch-icon.png","./app-icon-192.png","./app-icon-512.png","./assets/index-BudfC6Kz.js","./assets/index-RsCTp_3j.css"]; // GENERATED_PRECACHE
const scopeUrl = new URL(self.registration.scope);
const PREFIX = `recruit-ready-pwa-${encodeURIComponent(scopeUrl.pathname)}-`;
const CACHE_NAME = `${PREFIX}9cab5be78f02`; // GENERATED_VERSION
const urlFor = (path) => new URL(path, scopeUrl).href;
const cacheable = new Set(PRECACHE.map(urlFor));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE.map(urlFor))));
  // Existing installations wait for a deliberate reload, so a workout is not interrupted.
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME && (
      name.startsWith(PREFIX) || (scopeUrl.pathname === "/" && (name.startsWith("run-ready-web-") || name.startsWith("recruit-ready-web-")))
    )).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== scopeUrl.origin || !url.pathname.startsWith(scopeUrl.pathname)) return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
        if (response.status < 500) return response;
      } catch { /* Open the cached app shell when offline. */ }
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(urlFor("./index.html")) || await cache.match(urlFor("./")) || Response.error();
    })());
    return;
  }
  if (!cacheable.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(event.request) || fetch(event.request);
  })());
});
