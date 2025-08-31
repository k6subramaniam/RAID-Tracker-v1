// This is the PWABuilder service worker with offline support

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-offline-v1";
const offlineFallbackPage = "index.html";

// Cache important routes
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-1024.png',
  '/offline-handler.js'
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        console.log('Caching app shell and offline page');
        return cache.addAll(urlsToCache);
      })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  } else {
    // Handle non-navigation requests (CSS, JS, images, etc.)
    event.respondWith((async () => {
      try {
        // Try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Then try network
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Return cached version if available
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // For API calls that fail, return error response
        if (event.request.url.includes('/api/')) {
          return new Response(JSON.stringify({
            error: 'Offline - API not available'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    })());
  }
});