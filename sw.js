// Optimized Service Worker for I Locksmith Website
// Version 1.0 - Handles caching, font optimization, and offline functionality

const CACHE_NAME = 'i-locksmith-v1.0';
const OFFLINE_URL = '/offline.html';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/services.html',
  '/contact.html',
  '/optimized-fonts.css',
  '/script.js',
  '/validation.js',
  '/images/i-locksmith-logo.webp',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Font resources to cache with special handling
const FONT_RESOURCES = [
  'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.woff2',
  'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.woff2',
  'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCs16Hw-.woff2',
  'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching critical resources...');
        return cache.addAll(CRITICAL_RESOURCES).catch(error => {
          console.warn('⚠️ Failed to cache some critical resources:', error);
          // Continue installation even if some resources fail to cache
          return Promise.resolve();
        });
      }),

      // Cache fonts separately with error handling
      caches.open(CACHE_NAME + '-fonts').then(cache => {
        console.log('🔤 Caching font resources...');
        return Promise.allSettled(
          FONT_RESOURCES.map(url =>
            cache.add(url).catch(error => {
              console.warn('⚠️ Failed to cache font:', url, error);
              return Promise.resolve();
            })
          )
        );
      })
    ])
  );

  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== CACHE_NAME + '-fonts') {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external analytics/tracking requests
  if (url.hostname.includes('google-analytics.com') ||
      url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('doubleclick.net') ||
      url.hostname.includes('clarity.ms')) {
    return;
  }

  event.respondWith(
    handleFetchRequest(request, url)
  );
});

// Smart fetch handling with caching strategies
async function handleFetchRequest(request, url) {
  try {
    // Strategy 1: Fonts - Cache First with long TTL
    if (url.hostname === 'fonts.gstatic.com' || url.pathname.includes('.woff')) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME + '-fonts');
        cache.put(request, response.clone());
      }
      return response;
    }

    // Strategy 2: Static assets - Cache First
    if (request.url.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$/)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    }

    // Strategy 3: HTML pages - Network First with cache fallback
    if (request.headers.get('accept')?.includes('text/html')) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline page if available
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
          return offlineResponse;
        }
      }
    }

    // Strategy 4: Everything else - Network First
    const response = await fetch(request);
    return response;

  } catch (error) {
    console.warn('🔄 Fetch failed for:', request.url, error);

    // Try to serve from cache as last resort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return generic offline response for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(
        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    throw error;
  }
}

// Background sync for analytics when online
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  console.log('📊 Syncing analytics data...');
  // Implementation would go here for offline analytics
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
  console.log('🔔 Push notification received');
  // Implementation for push notifications would go here
});

console.log('🚀 I Locksmith Service Worker loaded successfully!');