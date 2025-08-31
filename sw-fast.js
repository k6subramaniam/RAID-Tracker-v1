// RAIDMASTER Service Worker - Fast Registration Version
const CACHE_NAME = 'raidmaster-v1.0.0';

// Install event - minimal caching for fast registration
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    clients.claim()
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Open cache and store the response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

console.log('Service Worker: Registered Successfully');