self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Dummy fetch handler to satisfy Chrome's PWA installability requirements
  // It does not cache anything, it just lets the browser do its normal fetch
});
