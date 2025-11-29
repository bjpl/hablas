/**
 * Performance Monitoring Utilities
 * Provides tools for measuring and reporting web vitals and custom metrics
 */

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

/**
 * Reports Web Vitals metrics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    })
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Could integrate with Google Analytics, Vercel Analytics, etc.
    interface WindowWithGtag extends Window {
      gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
    }

    const win = typeof window !== 'undefined' ? (window as WindowWithGtag) : null
    if (win?.gtag) {
      win.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.rating,
        non_interaction: true,
      })
    }
  }
}

/**
 * Measure Custom Performance Metrics
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  start(label: string) {
    this.marks.set(label, performance.now())
  }

  end(label: string): number | null {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`)
      return null
    }

    const duration = performance.now() - startTime
    this.marks.delete(label)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  measure(label: string, fn: () => void): number {
    this.start(label)
    fn()
    return this.end(label) || 0
  }

  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label)
    await fn()
    return this.end(label) || 0
  }
}

/**
 * Prefetch resources for improved perceived performance
 */
export function prefetchResource(url: string, as: 'style' | 'script' | 'image' | 'fetch' = 'fetch') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = as
  link.href = url
  document.head.appendChild(link)
}

/**
 * Preconnect to external domains
 */
export function preconnect(url: string, crossorigin?: boolean) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  if (crossorigin) {
    link.crossOrigin = 'anonymous'
  }
  document.head.appendChild(link)
}

/**
 * DNS Prefetch for external domains
 */
export function dnsPrefetch(url: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined') return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')

  return {
    // Navigation Timing
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    download: navigation?.responseEnd - navigation?.responseStart,
    domInteractive: navigation?.domInteractive,
    domComplete: navigation?.domComplete,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,

    // Paint Timing
    fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
    lcp: paint.find(p => p.name === 'largest-contentful-paint')?.startTime,

    // Total load time
    totalLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
