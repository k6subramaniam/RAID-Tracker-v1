// Enhanced PWABuilder Service Worker with Background Sync

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-offline-v2";
const offlineFallbackPage = "index.html";
const SYNC_TAG = 'raid-sync';
const PERIODIC_SYNC_TAG = 'raid-periodic-sync';

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

// Install event
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        console.log('Caching app shell and offline page');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
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

// Enable navigation preload
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Fetch event handler (existing)
self.addEventListener('fetch', (event) => {
  // Handle offline requests
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
    // Handle API requests that fail offline
    if (event.request.url.includes('/api/') || event.request.method === 'POST') {
      event.respondWith((async () => {
        try {
          const response = await fetch(event.request);
          return response;
        } catch (error) {
          // Queue for background sync if it's a POST request
          if (event.request.method === 'POST') {
            await queueRequest(event.request);
            return new Response(JSON.stringify({
              success: true,
              queued: true,
              message: 'Request queued for sync when online'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // Return error for GET requests
          return new Response(JSON.stringify({
            error: 'Offline - API not available'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })());
    } else {
      // Handle static resources
      event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })());
    }
  }
});

// Background Sync Event
self.addEventListener('sync', async (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncQueuedRequests());
  }
});

// Periodic Background Sync Event (requires permission)
self.addEventListener('periodicsync', async (event) => {
  console.log('Periodic sync event:', event.tag);
  
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(performPeriodicSync());
  }
});

// Helper Functions

// Queue failed requests for later sync
async function queueRequest(request) {
  const cache = await caches.open('sync-queue');
  const timestamp = Date.now();
  const url = new URL(request.url);
  url.searchParams.set('sync_timestamp', timestamp);
  
  // Clone request with timestamp
  const requestToCache = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method === 'POST' ? await request.blob() : null
  });
  
  await cache.put(requestToCache, new Response('queued'));
  
  // Register for background sync
  if ('sync' in self.registration) {
    await self.registration.sync.register(SYNC_TAG);
    console.log('Sync registered for queued request');
  }
}

// Sync queued requests when online
async function syncQueuedRequests() {
  console.log('Syncing queued requests...');
  const cache = await caches.open('sync-queue');
  const requests = await cache.keys();
  
  const promises = requests.map(async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        // Remove from queue if successful
        await cache.delete(request);
        console.log('Synced request:', request.url);
      }
    } catch (error) {
      console.error('Failed to sync request:', request.url, error);
      // Keep in queue for next sync attempt
    }
  });
  
  await Promise.all(promises);
  
  // Notify clients about sync completion
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'sync-complete',
      timestamp: Date.now()
    });
  });
}

// Perform periodic sync tasks
async function performPeriodicSync() {
  console.log('Performing periodic sync...');
  
  // Example periodic tasks:
  // 1. Check for app updates
  // 2. Backup local data
  // 3. Fetch latest risk metrics
  // 4. Clean old cached data
  
  try {
    // Clean old cache entries
    const cache = await caches.open(CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
          console.log('Deleted old cache entry:', request.url);
        }
      }
    }
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'periodic-sync-complete',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Register for periodic sync (if supported and permitted)
async function registerPeriodicSync() {
  const registration = self.registration;
  
  if ('periodicSync' in registration) {
    try {
      await registration.periodicSync.register(PERIODIC_SYNC_TAG, {
        minInterval: 12 * 60 * 60 * 1000 // 12 hours
      });
      console.log('Periodic sync registered');
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
    }
  }
}

// Register periodic sync on activate
self.addEventListener('activate', () => {
  registerPeriodicSync();
});