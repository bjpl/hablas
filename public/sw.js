/**
 * Service Worker for Hablas PWA
 * Provides offline functionality and resource caching
 */

const CACHE_NAME = 'hablas-v1'
const RUNTIME_CACHE = 'hablas-runtime-v1'

// Resources to cache on install
const PRECACHE_URLS = [
  '/hablas/',
  '/hablas/index.html',
  '/hablas/manifest.json',
  '/hablas/_next/static/css/',
  '/hablas/_next/static/chunks/',
]

// Install event - precache core resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching core resources')
      // Don't fail if some resources can't be cached
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache failed for some resources:', err)
      })
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Skip cross-origin requests (except for same-origin resources)
  if (url.origin !== location.origin && !request.url.includes('/hablas/')) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url)
        return cachedResponse
      }

      console.log('[SW] Fetching from network:', request.url)

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Cache generated resources and static assets
        if (
          request.url.includes('/generated-resources/') ||
          request.url.includes('/_next/static/') ||
          request.url.includes('/recursos/')
        ) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }

        return response
      }).catch((err) => {
        console.error('[SW] Fetch failed:', err)

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/hablas/index.html')
        }

        // Return a basic offline response for other requests
        return new Response('Offline - contenido no disponible', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        })
      })
    })
  )
})

// Message event - allow clients to control the service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || []
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(urls)
      })
    )
  }
})

console.log('[SW] Service worker loaded successfully')
