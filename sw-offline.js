// RAIDMASTER Service Worker - Full Offline Support
const CACHE_NAME = 'raidmaster-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-1024.png',
  // Add all icon sizes
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-144.png',
  '/icon-168.png',
  '/icon-384.png'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached for offline use');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - offline first for app shell, network first for API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests differently (AI features)
  if (url.pathname.includes('/api/') || url.hostname.includes('api') || url.hostname.includes('openai') || url.hostname.includes('anthropic')) {
    // Network first for API calls, no cache
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          // Return error response for API failures
          return new Response(JSON.stringify({
            error: 'No internet connection. AI features require internet access.'
          }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          });
        })
    );
    return;
  }

  // Handle CDN resources (cache them after first load)
  if (url.hostname.includes('cdn') || url.hostname.includes('cloudflare') || url.hostname.includes('jsdelivr') || url.hostname.includes('unpkg')) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(response => {
            // Cache CDN resources
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          }).catch(() => {
            // If CDN fails and not cached, return error
            console.log('CDN resource not available offline:', url.href);
          });
        })
    );
    return;
  }

  // For everything else, use cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          // Found in cache
          return response;
        }

        // Not in cache, try network
        return fetch(request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Offline and not in cache
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for when coming back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // This will sync any pending data when back online
  console.log('Syncing data after coming back online');
}