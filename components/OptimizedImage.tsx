'use client'

/**
 * OptimizedImage Component
 * Lazy loads images using Intersection Observer for improved performance
 */

import { useState } from 'react'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  })

  const shouldLoad = priority || isVisible

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: '100%', height: 'auto' }}
        />
      )}
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
