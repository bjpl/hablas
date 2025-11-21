/**
 * Zod Validation Schemas for Modernized Components
 *
 * Provides runtime type validation for props and data structures
 * to ensure type safety and data integrity.
 *
 * @module ComponentSchemas
 */

import { z } from 'zod';

/**
 * Content type enum schema
 */
export const ContentTypeSchema = z.enum(['downloadable', 'web', 'audio']);

/**
 * Content status enum schema
 */
export const ContentStatusSchema = z.enum(['synced', 'modified', 'conflict', 'unchanged']);

/**
 * Sync operation schema
 */
export const SyncOperationSchema = z.enum([
  'downloadable-to-web',
  'web-to-downloadable',
  'downloadable-to-audio',
  'audio-to-downloadable',
  'web-to-audio',
  'audio-to-web',
  'sync-all-to-downloadable',
  'sync-all-to-web',
  'sync-all-to-audio',
]);

/**
 * Content data schema
 */
export const ContentDataSchema = z.object({
  text: z.string(),
  status: ContentStatusSchema,
  lastModified: z.date(),
  audioUrl: z.string().url().optional(),
});

/**
 * Version content schema
 */
export const VersionContentSchema = z.object({
  current: z.string(),
  original: z.string(),
  isDirty: z.boolean(),
});

/**
 * Triple comparison view props schema
 */
export const TripleComparisonViewPropsSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  downloadableUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  onSave: z.function().args(z.array(z.object({
    type: ContentTypeSchema,
    content: z.string(),
  }))).returns(z.promise(z.void())),
  onCancel: z.function().returns(z.void()).optional(),
});

/**
 * Content item schema for ContentReviewTool
 */
export const ContentItemSchema = z.object({
  id: z.string().min(1, 'Content ID is required'),
  original: z.string(),
  edited: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    lastModified: z.string().datetime().optional(),
  }).optional(),
});

/**
 * Content review tool props schema
 */
export const ContentReviewToolPropsSchema = z.object({
  initialContent: ContentItemSchema.optional(),
  onSave: z.function().args(ContentItemSchema).returns(z.promise(z.void())).optional(),
  autoSaveDelay: z.number().min(100).max(10000).default(2000),
  className: z.string().default(''),
});

/**
 * Bilingual phrase schema
 */
export const BilingualPhraseSchema = z.object({
  english: z.string(),
  spanish: z.string(),
  lineNumber: z.number().int().nonnegative(),
});

/**
 * Bilingual comparison view props schema
 */
export const BilingualComparisonViewPropsSchema = z.object({
  content: z.string(),
  onEdit: z.function()
    .args(z.enum(['en', 'es']), z.number().int().nonnegative(), z.string())
    .returns(z.void()),
  onSave: z.function().returns(z.void()).optional(),
  className: z.string().default(''),
});

/**
 * Transcript phrase schema
 */
export const TranscriptPhraseSchema = z.object({
  english: z.string(),
  spanish: z.string(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  speaker: z.enum(['narrator', 'example']).optional(),
  pronunciation: z.string().optional(),
});

/**
 * Audio text alignment tool props schema
 */
export const AudioTextAlignmentToolPropsSchema = z.object({
  audioUrl: z.string().url('Valid audio URL is required'),
  transcript: z.array(TranscriptPhraseSchema),
  onTimestampUpdate: z.function()
    .args(
      z.number().int().nonnegative(),
      z.number().nonnegative(),
      z.number().nonnegative()
    )
    .returns(z.void())
    .optional(),
  className: z.string().default(''),
});

/**
 * Theme type schema
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

/**
 * Validation helper functions
 */

/**
 * Validates and parses data with a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validates data and returns result with error handling
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success status and either data or error
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Type guards for runtime type checking
 */

export function isContentType(value: unknown): value is z.infer<typeof ContentTypeSchema> {
  return ContentTypeSchema.safeParse(value).success;
}

export function isContentItem(value: unknown): value is z.infer<typeof ContentItemSchema> {
  return ContentItemSchema.safeParse(value).success;
}

export function isTranscriptPhrase(value: unknown): value is z.infer<typeof TranscriptPhraseSchema> {
  return TranscriptPhraseSchema.safeParse(value).success;
}

/**
 * Example usage:
 *
 * ```typescript
 * import { ContentItemSchema, validateData } from '@/lib/validation/component-schemas';
 *
 * const contentItem = validateData(ContentItemSchema, {
 *   id: '123',
 *   original: 'Hello world',
 *   edited: 'Hello world!',
 * });
 * ```
 */
