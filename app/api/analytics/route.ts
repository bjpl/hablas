import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeEventData } from '@/lib/sanitize'
import { analyticsEventSchema, validateData, formatZodErrors } from '@/lib/validation-schemas'

/**
 * Analytics API Endpoint
 *
 * Tracks user interactions and resource downloads.
 * Protected with rate limiting (100 requests/hour per IP) and input sanitization.
 */

interface AnalyticsEvent {
  event: 'resource_view' | 'resource_download' | 'search' | 'filter'
  resourceId?: string
  category?: string
  level?: string
  timestamp: string
  userAgent?: string
}

// In-memory analytics store (for development)
// In production, this would write to a database or analytics service
const analyticsStore: AnalyticsEvent[] = []

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per hour per IP
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = rateLimit(clientIp, 100, 60 * 60 * 1000)

    // Add rate limit headers to all responses
    const headers = getRateLimitHeaders(rateLimitResult)

    // If rate limit exceeded, return 429
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset).toISOString()
        },
        {
          status: 429,
          headers
        }
      )
    }

    // Parse and sanitize request body
    const rawBody = await request.json()
    const sanitizedBody = sanitizeEventData(rawBody)

    // Validate with Zod schema
    const validation = validateData(analyticsEventSchema, sanitizedBody)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatZodErrors(validation.errors)
        },
        { status: 400, headers }
      )
    }

    // Create analytics event with validated and sanitized data
    const event: AnalyticsEvent = {
      ...validation.data,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')?.substring(0, 500) || undefined
    }

    // Store event (in production, write to database/analytics service)
    analyticsStore.push(event)

    // Log for monitoring
    console.log(`[Analytics] ${clientIp} - ${event.event}`, {
      resourceId: event.resourceId,
      category: event.category,
      level: event.level
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Event tracked successfully',
        remaining: rateLimitResult.remaining
      },
      { headers }
    )

  } catch (error) {
    console.error('[Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for retrieving analytics (admin only)
 * This would require authentication in production
 */
export async function GET(request: NextRequest) {
  // Rate limiting for GET requests too
  const clientIp = getClientIp(request.headers)
  const rateLimitResult = rateLimit(clientIp, 100, 60 * 60 * 1000)
  const headers = getRateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    )
  }

  // Return analytics summary
  const summary = {
    totalEvents: analyticsStore.length,
    byType: analyticsStore.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    recentEvents: analyticsStore.slice(-10)
  }

  return NextResponse.json(summary, { headers })
}
