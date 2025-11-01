/**
 * Service Worker for Offline Capability
 * Caches static assets and API responses for offline access
 */

const CACHE_NAME = 'hablas-cache-v2'
const RUNTIME_CACHE = 'hablas-runtime-v2'
const AUDIO_CACHE = 'hablas-audio-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/hablas/',
  '/hablas/index.html',
  '/hablas/_next/static/css/app.css',
  '/hablas/manifest.json',
]

// Audio file patterns
const AUDIO_PATTERNS = [
  /\/audio\/.*\.(mp3|wav|ogg)$/i,
  /\/public\/audio\/.*\.(mp3|wav|ogg)$/i
]

// Check if request is for audio file
function isAudioRequest(url) {
  return AUDIO_PATTERNS.some(pattern => pattern.test(url))
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== AUDIO_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) return

  // Cache-first strategy for audio files (for offline support)
  if (isAudioRequest(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Cache audio files aggressively for offline use
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(AUDIO_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        }).catch((error) => {
          console.error('Failed to fetch audio:', error)
          // Return a fallback or error response
          return new Response('Audio file not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
          })
        })
      })
    )
    return
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response
        }

        const responseClone = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
    })
  )
})

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || []

    event.waitUntil(
      Promise.all(
        urls.map(url => {
          // Use audio cache for audio files
          const cacheName = isAudioRequest(url) ? AUDIO_CACHE : RUNTIME_CACHE

          return caches.open(cacheName).then((cache) => {
            return fetch(url)
              .then(response => {
                if (response && response.status === 200) {
                  return cache.put(url, response)
                }
              })
              .catch(error => {
                console.error('Failed to cache URL:', url, error)
              })
          })
        })
      )
    )
  }

  // Clear audio cache on demand
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    event.waitUntil(
      caches.delete(AUDIO_CACHE).then(() => {
        return caches.open(AUDIO_CACHE)
      })
    )
  }
})
