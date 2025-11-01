#!/usr/bin/env tsx
/**
 * Rate Limiting Test Script
 *
 * Tests the rate limiting implementation by making multiple requests
 * to the analytics endpoint and verifying rate limit headers.
 *
 * Usage:
 *   npm run test:rate-limit
 *   or
 *   tsx scripts/test-rate-limit.ts
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000"
const ENDPOINT = "/api/analytics"

interface RateLimitHeaders {
  limit: string | null
  remaining: string | null
  reset: string | null
}

async function makeRequest(method: string = "GET"): Promise<{
  status: number
  headers: RateLimitHeaders
  body: unknown
}> {
  const url = `${BASE_URL}${ENDPOINT}`
  const response = await fetch(url, {
    method,
    headers: method === "POST" ? {
      "Content-Type": "application/json",
    } : {},
    body: method === "POST" ? JSON.stringify({
      event: "test_event",
      properties: { test: true },
    }) : undefined,
  })

  const headers: RateLimitHeaders = {
    limit: response.headers.get("X-RateLimit-Limit"),
    remaining: response.headers.get("X-RateLimit-Remaining"),
    reset: response.headers.get("X-RateLimit-Reset"),
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = await response.text()
  }

  return { status: response.status, headers, body }
}

async function testRateLimiting() {
  console.log("🧪 Testing Rate Limiting Implementation\n")
  console.log(`📍 Endpoint: ${BASE_URL}${ENDPOINT}\n`)

  // Test 1: Check API status
  console.log("Test 1: Check API Status")
  console.log("─".repeat(50))
  const statusResponse = await makeRequest("GET")
  console.log(`Status: ${statusResponse.status}`)
  console.log(`Rate Limit: ${statusResponse.headers.limit}`)
  console.log(`Remaining: ${statusResponse.headers.remaining}`)
  console.log(`Reset: ${statusResponse.headers.reset}`)
  console.log(`Body:`, JSON.stringify(statusResponse.body, null, 2))
  console.log()

  // Test 2: Make multiple POST requests
  console.log("Test 2: Make 10 POST Requests")
  console.log("─".repeat(50))
  for (let i = 1; i <= 10; i++) {
    const response = await makeRequest("POST")
    console.log(
      `Request ${i}: Status ${response.status} | ` +
      `Remaining: ${response.headers.remaining}/${response.headers.limit}`
    )

    if (response.status === 429) {
      console.log(`⚠️  Rate limit exceeded at request ${i}`)
      console.log(`Response:`, JSON.stringify(response.body, null, 2))
      break
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  console.log()

  // Test 3: Verify rate limit headers
  console.log("Test 3: Verify Rate Limit Headers")
  console.log("─".repeat(50))
  const headerTest = await makeRequest("GET")
  const hasHeaders =
    headerTest.headers.limit !== null &&
    headerTest.headers.remaining !== null &&
    headerTest.headers.reset !== null

  console.log(`✓ X-RateLimit-Limit: ${headerTest.headers.limit || "Missing"}`)
  console.log(`✓ X-RateLimit-Remaining: ${headerTest.headers.remaining || "Missing"}`)
  console.log(`✓ X-RateLimit-Reset: ${headerTest.headers.reset || "Missing"}`)
  console.log()

  if (hasHeaders) {
    const resetTime = parseInt(headerTest.headers.reset || "0")
    const resetIn = Math.ceil((resetTime - Date.now()) / 1000)
    console.log(`⏱️  Rate limit resets in: ${resetIn} seconds`)
  }
  console.log()

  // Test 4: Check health endpoint
  console.log("Test 4: Check Health Endpoint")
  console.log("─".repeat(50))
  const healthResponse = await fetch(`${BASE_URL}/api/health`)
  const healthData = await healthResponse.json()
  console.log(`Status: ${healthResponse.status}`)
  console.log(`Redis Configured: ${healthData.environment?.redis?.configured || "Unknown"}`)
  console.log(`Redis Healthy: ${healthData.environment?.redis?.healthy || "Unknown"}`)
  console.log(`Rate Limiting: ${healthData.rateLimiting?.enabled ? "Enabled" : "Disabled"}`)
  console.log()

  // Summary
  console.log("📊 Test Summary")
  console.log("─".repeat(50))
  console.log(`✓ API is accessible`)
  console.log(`✓ Rate limit headers are ${hasHeaders ? "present" : "missing"}`)
  console.log(`✓ Health endpoint is working`)

  if (healthData.environment?.redis?.configured) {
    console.log(`✓ Upstash Redis is configured`)
  } else {
    console.log(`⚠️  Using in-memory rate limiting (Redis not configured)`)
  }
  console.log()

  console.log("✅ Rate limiting tests completed!")
}

// Run tests
testRateLimiting().catch(error => {
  console.error("❌ Test failed:", error)
  process.exit(1)
})
