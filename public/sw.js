/**
 * Progressive Web App Service Worker for Moonlit Violet Vault.
 * Implements a Network-First caching strategy to ensure users always see the 
 * latest data when online, but can still browse the vault when offline.
 * 
 * @packageDocumentation
 */

/** 
 * Name of the current cache version. Increment this to force cache invalidation. 
 */
const CACHE_NAME = 'vault-cache-v7';

/** 
 * Core assets to precache on installation for offline support. 
 */
const STATIC_ASSETS = [
  '/',
  '/moon-icon.svg',
];

/**
 * Install Event: Pre-caches critical static assets.
 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/**
 * Activate Event: Cleans up old cache versions to free up storage.
 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  e.waitUntil(clients.claim());
});

/**
 * Fetch Event: Network-first strategy with offline fallback.
 */
self.addEventListener('fetch', (e) => {
  // Ignore API requests (e.g., Supabase, TMDB, cron jobs) and cross-origin requests
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-First: Always try the network first to fetch the most up-to-date data.
  // If the network fails (e.g., user is offline), fallback to the cached response.
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200 && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
