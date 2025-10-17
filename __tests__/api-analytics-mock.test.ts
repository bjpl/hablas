/**
 * Analytics API Route Test Suite (Mocked)
 *
 * Tests for analytics logic without Next.js dependencies
 */

import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sanitizeEventData } from '@/lib/sanitize'
import { analyticsEventSchema, validateData } from '@/lib/validation-schemas'
import { createMockHeaders, createMockAnalyticsEvent } from './utils/test-helpers'

describe('Analytics Logic Tests', () => {
  describe('Event Validation', () => {
    it('should validate correct analytics event', () => {
      const event = createMockAnalyticsEvent({
        event: 'resource_view',
        resourceId: 'test-123'
      })

      const validation = validateData(analyticsEventSchema, event)
      expect(validation.success).toBe(true)
    })

    it('should reject invalid event types', () => {
      const invalidEvent = {
        event: 'invalid_event_type',
        resourceId: 'test-123'
      }

      const validation = validateData(analyticsEventSchema, invalidEvent)
      expect(validation.success).toBe(false)
    })

    it('should sanitize malicious event data', () => {
      const maliciousEvent = {
        event: 'resource_view',
        resourceId: '<script>alert("XSS")</script>',
        category: 'repartidor'
      }

      const sanitized = sanitizeEventData(maliciousEvent)
      expect(sanitized.resourceId).not.toContain('<script>')
    })
  })

  describe('Rate Limiting Logic', () => {
    it('should allow requests under limit', () => {
      const result = rateLimit('test-ip-1', 100, 60 * 60 * 1000)
      expect(result.success).toBe(true)
      expect(result.remaining).toBeLessThanOrEqual(100)
    })

    it('should return rate limit metadata', () => {
      const result = rateLimit('test-ip-2', 50, 60 * 60 * 1000)
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('limit')
      expect(result).toHaveProperty('remaining')
      expect(result).toHaveProperty('reset')
    })

    it('should track separate limits for different IPs', () => {
      const result1 = rateLimit('ip-1', 10, 60 * 60 * 1000)
      const result2 = rateLimit('ip-2', 10, 60 * 60 * 1000)

      expect(result1.remaining).toBeLessThanOrEqual(10)
      expect(result2.remaining).toBeLessThanOrEqual(10)
    })
  })

  describe('Client IP Detection', () => {
    it('should detect IP from x-forwarded-for header', () => {
      const headers = createMockHeaders({
        'x-forwarded-for': '203.0.113.1, 198.51.100.1'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('203.0.113.1')
    })

    it('should detect IP from x-real-ip header', () => {
      const headers = createMockHeaders({
        'x-real-ip': '203.0.113.2'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('203.0.113.2')
    })

    it('should detect IP from cf-connecting-ip header', () => {
      const headers = createMockHeaders({
        'cf-connecting-ip': '203.0.113.3'
      })

      const ip = getClientIp(headers)
      expect(ip).toBe('203.0.113.3')
    })

    it('should fallback to unknown when no IP headers present', () => {
      const headers = createMockHeaders({})
      const ip = getClientIp(headers)
      expect(ip).toBe('unknown')
    })
  })

  describe('Event Tracking', () => {
    it('should track different event types', () => {
      const eventTypes = ['resource_view', 'resource_download', 'search', 'filter'] as const

      eventTypes.forEach(eventType => {
        const event = createMockAnalyticsEvent({ event: eventType })
        const validation = validateData(analyticsEventSchema, event)
        expect(validation.success).toBe(true)
      })
    })

    it('should accept optional fields', () => {
      const minimalEvent = { event: 'search' }
      const validation = validateData(analyticsEventSchema, minimalEvent)
      expect(validation.success).toBe(true)
    })

    it('should validate event with all fields', () => {
      const completeEvent = {
        event: 'resource_view',
        resourceId: 'resource-123',
        category: 'repartidor',
        level: 'basico',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 Test'
      }

      const validation = validateData(analyticsEventSchema, completeEvent)
      expect(validation.success).toBe(true)
    })
  })
})
