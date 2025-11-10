/**
 * Validation Schemas Test Suite
 *
 * Tests for Zod validation schemas covering all input validation
 */

import {
  analyticsEventSchema,
  contactFormSchema,
  adminLoginSchema,
  searchQuerySchema,
  resourceFilterSchema,
  feedbackSchema,
  colombianPhoneSchema,
  fileUploadSchema,
  safeUrlSchema,
  paginationSchema,
  dateRangeSchema,
  validateData,
  formatZodErrors
} from '@/lib/validation-schemas'

describe('Analytics Event Schema', () => {
  it('should validate correct analytics event', () => {
    const validEvent = {
      event: 'resource_view',
      resourceId: 'test-123',
      category: 'repartidor',
      level: 'basico',
      timestamp: new Date().toISOString(),
      userAgent: 'Mozilla/5.0'
    }

    const result = analyticsEventSchema.safeParse(validEvent)
    expect(result.success).toBe(true)
  })

  it('should accept optional fields', () => {
    const minimalEvent = {
      event: 'search'
    }

    const result = analyticsEventSchema.safeParse(minimalEvent)
    expect(result.success).toBe(true)
  })

  it('should reject invalid event types', () => {
    const invalidEvent = {
      event: 'invalid_event'
    }

    const result = analyticsEventSchema.safeParse(invalidEvent)
    expect(result.success).toBe(false)
  })

  it('should reject invalid categories', () => {
    const invalidEvent = {
      event: 'resource_view',
      category: 'invalid_category'
    }

    const result = analyticsEventSchema.safeParse(invalidEvent)
    expect(result.success).toBe(false)
  })
})

describe('Contact Form Schema', () => {
  it('should validate correct contact form', () => {
    const validForm = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      message: 'This is a test message with enough characters.',
      subject: 'Test Subject'
    }

    const result = contactFormSchema.safeParse(validForm)
    expect(result.success).toBe(true)
  })

  it('should reject short names', () => {
    const invalidForm = {
      name: 'J',
      email: 'juan@example.com',
      message: 'This is a test message.'
    }

    const result = contactFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const invalidForm = {
      name: 'Juan Pérez',
      email: 'not-an-email',
      message: 'This is a test message.'
    }

    const result = contactFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should reject short messages', () => {
    const invalidForm = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      message: 'Short'
    }

    const result = contactFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it('should lowercase email', () => {
    const form = {
      name: 'Juan Pérez',
      email: 'JUAN@EXAMPLE.COM',
      message: 'This is a test message.'
    }

    const result = contactFormSchema.safeParse(form)
    if (result.success) {
      expect(result.data.email).toBe('juan@example.com')
    }
  })
})

describe('Admin Login Schema', () => {
  it('should validate correct login credentials', () => {
    const validLogin = {
      email: 'admin@hablas.com',
      password: 'SecurePass123!'
    }

    const result = adminLoginSchema.safeParse(validLogin)
    expect(result.success).toBe(true)
  })

  it('should reject short passwords', () => {
    const invalidLogin = {
      email: 'admin@hablas.com',
      password: 'short'
    }

    const result = adminLoginSchema.safeParse(invalidLogin)
    expect(result.success).toBe(false)
  })
})

describe('Search Query Schema', () => {
  it('should validate search with all filters', () => {
    const validSearch = {
      query: 'greetings',
      category: 'repartidor',
      level: 'basico',
      type: 'pdf',
      page: 1,
      limit: 20
    }

    const result = searchQuerySchema.safeParse(validSearch)
    expect(result.success).toBe(true)
  })

  it('should trim query whitespace', () => {
    const search = {
      query: '  test query  '
    }

    const result = searchQuerySchema.safeParse(search)
    if (result.success) {
      expect(result.data.query).toBe('test query')
    }
  })

  it('should use default pagination', () => {
    const search = {
      query: 'test'
    }

    const result = searchQuerySchema.safeParse(search)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('should reject empty query', () => {
    const invalidSearch = {
      query: ''
    }

    const result = searchQuerySchema.safeParse(invalidSearch)
    expect(result.success).toBe(false)
  })
})

describe('Feedback Schema', () => {
  it('should validate complete feedback', () => {
    const validFeedback = {
      resourceId: 'resource-123',
      rating: 5,
      comment: 'Excellent resource!',
      helpful: true,
      tags: ['useful', 'clear']
    }

    const result = feedbackSchema.safeParse(validFeedback)
    expect(result.success).toBe(true)
  })

  it('should reject invalid ratings', () => {
    const invalidFeedback = {
      resourceId: 'resource-123',
      rating: 6
    }

    const result = feedbackSchema.safeParse(invalidFeedback)
    expect(result.success).toBe(false)
  })

  it('should accept feedback without comment', () => {
    const minimalFeedback = {
      resourceId: 'resource-123',
      rating: 4
    }

    const result = feedbackSchema.safeParse(minimalFeedback)
    expect(result.success).toBe(true)
  })
})

describe('Colombian Phone Schema', () => {
  it('should validate Colombian phone with country code', () => {
    const validPhone = '+57 3001234567'
    const result = colombianPhoneSchema.safeParse(validPhone)
    expect(result.success).toBe(true)
  })

  it('should validate Colombian phone without country code', () => {
    const validPhone = '3001234567'
    const result = colombianPhoneSchema.safeParse(validPhone)
    expect(result.success).toBe(true)
  })

  it('should remove spaces in transformation', () => {
    const phone = '+57 300 123 4567'
    const result = colombianPhoneSchema.safeParse(phone)
    if (result.success) {
      expect(result.data).not.toContain(' ')
    }
  })

  it('should reject invalid phone format', () => {
    const invalidPhone = '123'
    const result = colombianPhoneSchema.safeParse(invalidPhone)
    expect(result.success).toBe(false)
  })
})

describe('File Upload Schema', () => {
  it('should validate PDF upload', () => {
    const validUpload = {
      filename: 'document.pdf',
      filesize: 1024 * 1024, // 1MB
      mimetype: 'application/pdf'
    }

    const result = fileUploadSchema.safeParse(validUpload)
    expect(result.success).toBe(true)
  })

  it('should reject oversized files', () => {
    const invalidUpload = {
      filename: 'large.pdf',
      filesize: 20 * 1024 * 1024, // 20MB
      mimetype: 'application/pdf'
    }

    const result = fileUploadSchema.safeParse(invalidUpload)
    expect(result.success).toBe(false)
  })

  it('should reject invalid file types', () => {
    const invalidUpload = {
      filename: 'script.exe',
      filesize: 1024,
      mimetype: 'application/x-executable'
    }

    const result = fileUploadSchema.safeParse(invalidUpload)
    expect(result.success).toBe(false)
  })
})

describe('Safe URL Schema', () => {
  it('should validate HTTPS URLs', () => {
    const validUrl = 'https://example.com'
    const result = safeUrlSchema.safeParse(validUrl)
    expect(result.success).toBe(true)
  })

  it('should reject javascript: URLs', () => {
    const dangerousUrl = 'javascript:alert(1)'
    const result = safeUrlSchema.safeParse(dangerousUrl)
    expect(result.success).toBe(false)
  })

  it('should reject data: URLs', () => {
    const dangerousUrl = 'data:text/html,<script>alert(1)</script>'
    const result = safeUrlSchema.safeParse(dangerousUrl)
    expect(result.success).toBe(false)
  })
})

describe('Pagination Schema', () => {
  it('should validate pagination parameters', () => {
    const validPagination = {
      page: 5,
      limit: 50
    }

    const result = paginationSchema.safeParse(validPagination)
    expect(result.success).toBe(true)
  })

  it('should use default values', () => {
    const result = paginationSchema.safeParse({})
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('should reject invalid page numbers', () => {
    const invalidPagination = {
      page: 0
    }

    const result = paginationSchema.safeParse(invalidPagination)
    expect(result.success).toBe(false)
  })
})

describe('Date Range Schema', () => {
  it('should validate valid date range', () => {
    const validRange = {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }

    const result = dateRangeSchema.safeParse(validRange)
    expect(result.success).toBe(true)
  })

  it('should reject end date before start date', () => {
    const invalidRange = {
      startDate: '2024-12-31',
      endDate: '2024-01-01'
    }

    const result = dateRangeSchema.safeParse(invalidRange)
    expect(result.success).toBe(false)
  })
})

describe('Validation Helpers', () => {
  it('should return success for valid data', () => {
    const data = { event: 'search' }
    const result = validateData(analyticsEventSchema, data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.event).toBe('search')
    }
  })

  it('should return errors for invalid data', () => {
    const data = { event: 'invalid' }
    const result = validateData(analyticsEventSchema, data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
    }
  })

  it('should format zod errors correctly', () => {
    const schema = contactFormSchema
    const invalidData = { name: 'X' }
    const parseResult = schema.safeParse(invalidData)

    if (!parseResult.success) {
      const formatted = formatZodErrors(parseResult.error)
      expect(formatted).toHaveProperty('name')
      expect(formatted).toHaveProperty('email')
      expect(formatted).toHaveProperty('message')
    }
  })
})
