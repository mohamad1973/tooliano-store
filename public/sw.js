/* Service worker خفيف — يفعّل معايير تثبيت PWA دون كاش offline */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
