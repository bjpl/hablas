/**
 * Zod Validation Schemas
 *
 * Type-safe validation schemas for forms and API requests.
 */

import { z } from 'zod'

/**
 * Analytics Event Schema
 */
export const analyticsEventSchema = z.object({
  event: z.enum(['resource_view', 'resource_download', 'search', 'filter']),
  resourceId: z.string().min(1).max(100).optional(),
  category: z.enum(['repartidor', 'conductor', 'all']).optional(),
  level: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  timestamp: z.string().datetime().optional(),
  userAgent: z.string().max(500).optional()
})

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name can only contain letters and spaces'),

  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),

  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .optional()
})

export type ContactForm = z.infer<typeof contactFormSchema>

/**
 * Admin Login Schema
 */
export const adminLoginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
})

export type AdminLogin = z.infer<typeof adminLoginSchema>

/**
 * Search Query Schema
 */
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query must not be empty')
    .max(200, 'Query must be less than 200 characters')
    .transform(val => val.trim()),

  category: z.enum(['repartidor', 'conductor', 'all']).optional(),

  level: z.enum(['basico', 'intermedio', 'avanzado']).optional(),

  type: z.enum(['pdf', 'audio', 'image', 'video']).optional(),

  page: z.number()
    .int()
    .min(1)
    .max(100)
    .default(1)
    .optional(),

  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .optional()
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

/**
 * Resource Filter Schema
 */
export const resourceFilterSchema = z.object({
  category: z.enum(['repartidor', 'conductor', 'all']).optional(),
  level: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  type: z.enum(['pdf', 'audio', 'image', 'video']).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  sortBy: z.enum(['title', 'date', 'downloads', 'rating']).default('title').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional()
})

export type ResourceFilter = z.infer<typeof resourceFilterSchema>

/**
 * Feedback Schema
 */
export const feedbackSchema = z.object({
  resourceId: z.string()
    .min(1)
    .max(100),

  rating: z.number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),

  comment: z.string()
    .max(500, 'Comment must be less than 500 characters')
    .optional(),

  helpful: z.boolean().optional(),

  tags: z.array(z.string().max(50)).max(5).optional()
})

export type Feedback = z.infer<typeof feedbackSchema>

/**
 * Colombian Phone Number Schema
 */
export const colombianPhoneSchema = z.string()
  .regex(
    /^(\+57\s?)?[0-9]{10}$/,
    'Phone number must be a valid Colombian number (10 digits)'
  )
  .transform(val => val.replace(/\s/g, ''))

/**
 * File Upload Schema
 */
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters'),

  filesize: z.number()
    .int()
    .min(1, 'File size must be greater than 0')
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'),

  mimetype: z.enum([
    'application/pdf',
    'audio/mpeg',
    'audio/mp3',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ], {
    message: 'Invalid file type'
  })
})

export type FileUpload = z.infer<typeof fileUploadSchema>

/**
 * URL Schema (safe URLs only)
 */
export const safeUrlSchema = z.string()
  .url('Invalid URL')
  .refine(
    (url) => {
      const lowerUrl = url.toLowerCase()
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
      return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))
    },
    'URL contains dangerous protocol'
  )

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.number()
    .int()
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page must be less than 1000')
    .default(1),

  limit: z.number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20)
})

export type Pagination = z.infer<typeof paginationSchema>

/**
 * Date Range Schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')),

  endDate: z.string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'))
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  'End date must be after start date'
)

export type DateRange = z.infer<typeof dateRangeSchema>

/**
 * Validation helper function
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }

  return formatted
}
