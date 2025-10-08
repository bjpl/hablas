/**
 * Prefetch Utilities
 * Smart resource prefetching for improved perceived performance
 */

interface PrefetchOptions {
  priority?: 'high' | 'low' | 'auto'
  as?: 'style' | 'script' | 'image' | 'fetch' | 'document'
  crossOrigin?: 'anonymous' | 'use-credentials'
}

/**
 * Prefetch a resource
 */
export function prefetchResource(url: string, options: PrefetchOptions = {}) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url

  if (options.as) link.as = options.as
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin

  document.head.appendChild(link)
}

/**
 * Preload a critical resource
 */
export function preloadResource(url: string, options: PrefetchOptions = {}) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url

  if (options.as) link.as = options.as
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin

  document.head.appendChild(link)
}

/**
 * Prefetch on hover
 */
export function prefetchOnHover(
  element: HTMLElement,
  url: string,
  options: PrefetchOptions = {}
) {
  let hasPrefetched = false

  const prefetch = () => {
    if (!hasPrefetched) {
      prefetchResource(url, options)
      hasPrefetched = true
    }
  }

  element.addEventListener('mouseenter', prefetch, { once: true })
  element.addEventListener('touchstart', prefetch, { once: true, passive: true })
}

/**
 * Prefetch on viewport intersection
 */
export function prefetchOnVisible(url: string, options: PrefetchOptions = {}) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prefetchResource(url, options)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.01 }
  )

  // Observe the link element if it exists
  const link = document.querySelector(`a[href="${url}"]`)
  if (link) {
    observer.observe(link)
  }
}

/**
 * Batch prefetch multiple resources
 */
export function batchPrefetch(urls: string[], options: PrefetchOptions = {}) {
  if (typeof window === 'undefined') return

  // Use requestIdleCallback for non-blocking prefetch
  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(
      () => {
        urls.forEach((url) => prefetchResource(url, options))
      },
      { timeout: 2000 }
    )
  } else {
    setTimeout(() => {
      urls.forEach((url) => prefetchResource(url, options))
    }, 1000)
  }
}

/**
 * Smart prefetch based on connection speed
 */
export function smartPrefetch(url: string, options: PrefetchOptions = {}) {
  if (typeof window === 'undefined') return

  // Check for slow connection
  const connection = (navigator as any).connection
  if (connection) {
    const { effectiveType, saveData } = connection

    // Don't prefetch on slow connections or data saver mode
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return
    }
  }

  prefetchResource(url, options)
}
