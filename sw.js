const CACHE_NAME = "layali-sakina-v5";
const CORE = [
  "./", "./index.html", "./style.css", "./app.js", "./data.json",
  "./icon-192.png", "./icon-512.png", "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith("layali-sakina-") && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const network = await fetch(request);
      if (network.ok) {
        const copy = network.clone();
        await caches.open(CACHE_NAME)
          .then(cache => cache.put(request, copy))
          .catch(() => undefined);
      }
      return network;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const shell = await caches.match("./index.html");
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
