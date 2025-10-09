const CACHE_NAME = 'mynextread-v1';
const STATIC_CACHE = 'mynextread-static-v1';
const DYNAMIC_CACHE = 'mynextread-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/mynextread-app.png',
  // Add critical CSS and JS files that Vite generates
  // These will be updated during build process
];

// Assets that should be cached when requested
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:css|js)$/,
    /\/assets\//
  ],
  // Network first for API calls
  NETWORK_FIRST: [
    /\/api\//,
    /graphql/,
    /anilist\.co/
  ],
  // Stale while revalidate for navigation
  STALE_WHILE_REVALIDATE: [
    /\/explore/,
    /\/recommendations/,
    /\/saved/,
    /\/profile/
  ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName.startsWith('mynextread-');
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Determine caching strategy based on URL
    if (shouldUseCacheFirst(request)) {
      return await cacheFirst(request);
    } else if (shouldUseNetworkFirst(request)) {
      return await networkFirst(request);
    } else if (shouldUseStaleWhileRevalidate(request)) {
      return await staleWhileRevalidate(request);
    } else {
      // Default to network first for unknown resources
      return await networkFirst(request);
    }
  } catch (error) {
    console.error('Service Worker: Fetch failed', error);
    
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

function shouldUseCacheFirst(request) {
  return CACHE_STRATEGIES.CACHE_FIRST.some(pattern => 
    pattern.test(request.url)
  );
}

function shouldUseNetworkFirst(request) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => 
    pattern.test(request.url)
  );
}

function shouldUseStaleWhileRevalidate(request) {
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => 
    pattern.test(request.url)
  );
}

// Cache first strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch and cache
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network first strategy - for API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale while revalidate strategy - for navigation
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Fetch in background and update cache
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  // Return cached version immediately if available
  return cachedResponse || networkResponsePromise;
}

// Offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return cached index.html
  if (request.mode === 'navigate') {
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }
  
  // For images, return a placeholder if available
  if (request.destination === 'image') {
    const placeholder = await caches.match('/mynextread-app.png');
    if (placeholder) {
      return placeholder;
    }
  }
  
  // Return a basic offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'You are currently offline. Please check your internet connection.' 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Background sync for failed requests (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}

async function doBackgroundSync() {
  // Handle any failed requests that were queued while offline
  console.log('Service Worker: Performing background sync');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/mynextread-app.png',
    badge: '/mynextread-app.png',
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const clickAction = event.action || 'default';
  const notificationData = event.notification.data || {};
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        const targetUrl = notificationData.url || '/';
        return clients.openWindow(targetUrl);
      }
    })
  );
});