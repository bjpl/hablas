/**
 * usePerformanceMonitor Hook
 * Provides React hooks for performance monitoring
 */

import { useEffect, useRef, useCallback } from 'react'
import { createLogger } from '@/lib/utils/logger'

const perfMonitorLogger = createLogger('hooks:usePerformanceMonitor')

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    mountTime.current = performance.now()
    renderCount.current += 1

    if (process.env.NODE_ENV === 'development') {
      perfMonitorLogger.debug(`${componentName} mount time`, { time: mountTime.current })
    }

    return () => {
      const unmountTime = performance.now()
      const lifetime = unmountTime - mountTime.current

      if (process.env.NODE_ENV === 'development') {
        perfMonitorLogger.debug(`${componentName} component lifetime`, { lifetime: `${lifetime}ms`, totalRenders: renderCount.current })
      }
    }
  }, [componentName])

  const measureRender = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      perfMonitorLogger.debug(`${componentName} render`, { renderNumber: renderCount.current })
    }
  }, [componentName])

  return { renderCount: renderCount.current, measureRender }
}

export function useRenderCount(componentName: string) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    if (process.env.NODE_ENV === 'development') {
      perfMonitorLogger.debug(`${componentName} render count`, { count: renderCount.current })
    }
  })

  return renderCount.current
}
