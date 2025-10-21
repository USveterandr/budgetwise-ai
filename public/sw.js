// BudgetWise AI Service Worker

const CACHE_NAME = 'budgetwise-ai-v1.0';
const urlsToCache = [
  '/',
  '/dashboard/',
  '/budget/',
  '/transactions/',
  '/investments/',
  '/subscription/',
  '/consultation/'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add error handling for cache.addAll
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              throw new Error(`Failed to fetch ${url}`);
            })
            .catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              // Continue caching other URLs even if one fails
              return Promise.resolve();
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .catch(error => {
            console.error('Fetch failed:', error);
            // Return a fallback response if needed
            return new Response('Network error occurred', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});