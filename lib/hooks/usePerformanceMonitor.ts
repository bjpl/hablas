/**
 * usePerformanceMonitor Hook
 * Provides React hooks for performance monitoring
 */

import { useEffect, useRef, useCallback } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    mountTime.current = performance.now()
    renderCount.current += 1

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Mount time:`, mountTime.current)
    }

    return () => {
      const unmountTime = performance.now()
      const lifetime = unmountTime - mountTime.current

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Component lifetime:`, lifetime, 'ms')
        console.log(`[${componentName}] Total renders:`, renderCount.current)
      }
    }
  }, [componentName])

  const measureRender = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current}`)
    }
  }, [componentName])

  return { renderCount: renderCount.current, measureRender }
}

export function useRenderCount(componentName: string) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render count:`, renderCount.current)
    }
  })

  return renderCount.current
}
