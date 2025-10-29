/**
 * Input Sanitization Utilities
 *
 * Provides XSS protection and input validation for user-generated content.
 * Uses DOMPurify for HTML sanitization and custom functions for other types.
 */

import DOMPurify from 'dompurify'

// Type for sanitize configuration
type SanitizeConfig = {
  ALLOWED_TAGS?: string[]
  ALLOWED_ATTR?: string[]
  ALLOWED_URI_REGEXP?: RegExp
  [key: string]: any
}

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param dirty - Untrusted HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  options?: SanitizeConfig
): string {
  // Default config: strip scripts, iframes, and dangerous attributes
  const defaultConfig: SanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ...options
  }

  return DOMPurify.sanitize(dirty, defaultConfig)
}

/**
 * Sanitize plain text by removing HTML tags and encoding special characters
 *
 * @param dirty - Untrusted text string
 * @returns Clean text with tags removed and special characters encoded
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  // First, remove actual HTML tags (must start with letter or / for closing tags)
  let clean = dirty.replace(/<\/?[a-zA-Z][^>]*>/g, '')

  // Then encode any remaining special characters
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return clean.trim()
}

/**
 * Sanitize email address
 *
 * @param email - Email address to validate and sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Remove whitespace and convert to lowercase
  const clean = email.trim().toLowerCase()

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(clean) ? clean : ''
}

/**
 * Sanitize URL to prevent javascript: and data: URI attacks
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const clean = url.trim()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = clean.toLowerCase()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''
    }
  }

  // Only allow http, https, mailto, tel
  const allowedProtocolRegex = /^(https?|mailto|tel):/i
  if (clean.includes(':') && !allowedProtocolRegex.test(clean)) {
    return ''
  }

  return clean
}

/**
 * Sanitize phone number (Colombian format)
 *
 * @param phone - Phone number to sanitize
 * @returns Clean phone number with only digits and + sign
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Keep only digits, +, spaces, and hyphens
  let clean = phone.replace(/[^\d+\s-]/g, '')

  // Remove leading/trailing whitespace
  clean = clean.trim()

  // Colombian phone format validation (optional)
  // Format: +57 ### ### #### or 10 digits
  const phoneRegex = /^(\+57\s?)?[0-9]{10}$|^[0-9]{10}$/
  const digitsOnly = clean.replace(/[\s-]/g, '')

  if (phoneRegex.test(digitsOnly)) {
    return clean
  }

  return ''
}

/**
 * Sanitize filename to prevent directory traversal attacks
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename without path traversal characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  // Remove directory traversal patterns
  let clean = filename.replace(/\.\./g, '')
  clean = clean.replace(/[\/\\]/g, '')

  // Remove non-printable and special characters except dot, dash, underscore
  clean = clean.replace(/[^\w\s.-]/g, '')

  // Remove leading/trailing dots and spaces
  clean = clean.replace(/^[.\s]+|[.\s]+$/g, '')

  return clean.trim()
}

/**
 * Sanitize search query
 *
 * @param query - Search query to sanitize
 * @returns Clean search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }

  // Remove SQL injection attempts (quotes and semicolons)
  let clean = query.replace(/['";]/g, '')

  // Remove SQL keywords (common injection patterns)
  const sqlKeywords = /\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ALTER|CREATE|TABLE|DATABASE)\b/gi
  clean = clean.replace(sqlKeywords, '')

  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '')

  // Limit length to prevent DoS
  const maxLength = 200
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean.trim()
}

/**
 * Sanitize analytics event data
 *
 * @param data - Event data object
 * @returns Sanitized event data
 */
export function sanitizeEventData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    // Sanitize key
    const cleanKey = sanitizeText(key)

    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeText(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[cleanKey] = value
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      )
    } else if (value && typeof value === 'object') {
      sanitized[cleanKey] = sanitizeEventData(value)
    }
  }

  return sanitized
}

/**
 * Strip dangerous characters from user input
 *
 * @param input - User input string
 * @returns Input with dangerous characters removed
 */
export function stripDangerousChars(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove null bytes
  let clean = input.replace(/\0/g, '')

  // Remove control characters (except newline, carriage return, tab)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return clean
}

/**
 * Validate and sanitize object against allowed keys
 *
 * @param obj - Object to sanitize
 * @param allowedKeys - Array of allowed key names
 * @returns Object with only allowed keys
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[]
): Partial<T> {
  const sanitized: Partial<T> = {}

  for (const key of allowedKeys) {
    if (key in obj) {
      sanitized[key as keyof T] = obj[key]
    }
  }

  return sanitized
}
