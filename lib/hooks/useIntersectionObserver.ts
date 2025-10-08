/**
 * useIntersectionObserver Hook
 * Provides lazy loading capabilities using Intersection Observer API
 * for optimized image and component loading
 */

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>({
  threshold = 0.1,
  root = null,
  rootMargin = '50px',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<T>(null)
  const frozen = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen.current || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setIsVisible(entry.isIntersecting)

        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return { ref: elementRef, entry, isVisible }
}
