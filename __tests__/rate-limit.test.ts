/**
 * Rate Limiting Tests
 * Tests for rate limiting functionality
 */

import { rateLimit, getClientIp, getRateLimitHeaders } from '../lib/rate-limit'

describe('Rate Limiting', () => {
  describe('rateLimit', () => {
    it('should allow requests under the limit', () => {
      const result = rateLimit('test-ip-1', 5, 60000)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should track multiple requests', () => {
      const identifier = 'test-ip-2'

      const result1 = rateLimit(identifier, 3, 60000)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = rateLimit(identifier, 3, 60000)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = rateLimit(identifier, 3, 60000)
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests over the limit', () => {
      const identifier = 'test-ip-3'

      // Make 3 requests (at limit)
      rateLimit(identifier, 3, 60000)
      rateLimit(identifier, 3, 60000)
      rateLimit(identifier, 3, 60000)

      // 4th request should be blocked
      const result = rateLimit(identifier, 3, 60000)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after time window', () => {
      const identifier = 'test-ip-4'
      const shortWindow = 100 // 100ms

      const result1 = rateLimit(identifier, 2, shortWindow)
      expect(result1.success).toBe(true)

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result2 = rateLimit(identifier, 2, shortWindow)
          expect(result2.success).toBe(true)
          expect(result2.remaining).toBe(1) // Reset
          resolve()
        }, 150)
      })
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '1.2.3.4, 5.6.7.8'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('1.2.3.4')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '9.10.11.12'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('9.10.11.12')
    })

    it('should extract IP from cf-connecting-ip header', () => {
      const headers = new Headers({
        'cf-connecting-ip': '13.14.15.16'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('13.14.15.16')
    })

    it('should return "unknown" if no IP headers present', () => {
      const headers = new Headers()

      const ip = getClientIp(headers)
      expect(ip).toBe('unknown')
    })
  })

  describe('getRateLimitHeaders', () => {
    it('should format rate limit headers correctly', () => {
      const result = {
        success: true,
        limit: 100,
        remaining: 95,
        reset: Date.now() + 3600000
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['X-RateLimit-Limit']).toBe('100')
      expect(headers['X-RateLimit-Remaining']).toBe('95')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
    })
  })
})
