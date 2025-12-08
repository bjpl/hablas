/**
 * Content Fetching Utility Library
 *
 * Comprehensive content fetching system with modern patterns including:
 * - PDF content fetching and parsing
 * - Web content fetching with sanitization
 * - Audio transcript fetching with timestamps
 * - IndexedDB caching layer with versioning
 * - Error handling with retry and exponential backoff
 * - AbortController for cancellation
 * - Progress callbacks for large files
 * - Network status detection
 *
 * @requires pdfjs-dist - Install with: npm install pdfjs-dist
 * @requires idb - Install with: npm install idb
 */

import { z } from 'zod';
import { sanitizeHtml, sanitizeText } from './sanitize';
import { createLogger } from './utils/logger';

const fetchLogger = createLogger('ContentFetcher');

// =============================================================================
// TYPE DEFINITIONS & VALIDATION SCHEMAS
// =============================================================================

/**
 * PDF Content structure
 */
export const PDFContentSchema = z.object({
  text: z.string(),
  markdown: z.string(),
  numPages: z.number(),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    subject: z.string().optional(),
    keywords: z.string().optional(),
    creator: z.string().optional(),
    producer: z.string().optional(),
    creationDate: z.string().optional(),
  }).optional(),
  pages: z.array(z.object({
    pageNumber: z.number(),
    text: z.string(),
    lines: z.number(),
  })),
});

export type PDFContent = z.infer<typeof PDFContentSchema>;

/**
 * Web Content structure
 */
export const WebContentSchema = z.object({
  html: z.string(),
  sanitizedHtml: z.string(),
  text: z.string(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type WebContent = z.infer<typeof WebContentSchema>;

/**
 * Audio Transcript structure
 */
export const TranscriptSegmentSchema = z.object({
  timestamp: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  text: z.string(),
  speaker: z.string().optional(),
});

export const TranscriptSchema = z.object({
  segments: z.array(TranscriptSegmentSchema),
  fullText: z.string(),
  duration: z.number().optional(),
  language: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;
export type Transcript = z.infer<typeof TranscriptSchema>;

/**
 * All Content structure
 */
export const AllContentSchema = z.object({
  pdf: PDFContentSchema.optional(),
  web: WebContentSchema.optional(),
  transcript: TranscriptSchema.optional(),
  audio: z.object({
    url: z.string(),
    duration: z.number().optional(),
    format: z.string().optional(),
  }).optional(),
});

export type AllContent = z.infer<typeof AllContentSchema>;

/**
 * Resource structure
 */
export interface Resource {
  id: string;
  title: string;
  pdfUrl?: string;
  audioUrl?: string;
  transcriptUrl?: string;
  contentUrl?: string;
  type?: 'vocabulary' | 'cultural' | 'scenarios' | 'phrases';
}

/**
 * Fetch options
 */
export interface FetchOptions {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
}

/**
 * Typed error responses
 */
export class ContentFetchError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ContentFetchError';
  }
}

// =============================================================================
// NETWORK STATUS DETECTION
// =============================================================================

/**
 * Check network connectivity
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Wait for network to come online
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      reject(new ContentFetchError(
        'Network timeout: Unable to connect',
        'NETWORK_TIMEOUT'
      ));
    }, timeout);

    const handleOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
}

// =============================================================================
// RETRY WITH EXPONENTIAL BACKOFF
// =============================================================================

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    signal,
  } = options;

  let lastError: Error = new Error('Unknown error');
  let delay = initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Check if cancelled
      if (signal?.aborted) {
        throw new ContentFetchError(
          'Request cancelled',
          'CANCELLED'
        );
      }

      // Check network status
      if (!isOnline()) {
        await waitForOnline();
      }

      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof ContentFetchError) {
        if (['CANCELLED', 'INVALID_DATA', 'NOT_FOUND'].includes(error.code)) {
          throw error;
        }
      }

      // Last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  throw new ContentFetchError(
    `Failed after ${retries + 1} attempts: ${lastError.message}`,
    'MAX_RETRIES_EXCEEDED',
    undefined,
    lastError
  );
}

// =============================================================================
// INDEXEDDB CACHING LAYER
// =============================================================================

/**
 * Content Cache using IndexedDB
 */
export class ContentCache {
  private dbName = 'content-cache';
  private storeName = 'cached-content';
  private version = 2;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete old stores if they exist
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Create new store with indexes
        const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('version', 'version', { unique: false });
      };
    });
  }

  /**
   * Get item from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;

          if (!result) {
            resolve(null);
            return;
          }

          // Check expiration
          if (result.expires && result.expires < Date.now()) {
            this.delete(key); // Clean up expired entry
            resolve(null);
            return;
          }

          resolve(result.data as T);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache get error', error as Error);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T = any>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<boolean> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      const entry = {
        key,
        data,
        timestamp: Date.now(),
        version: this.version,
        expires: ttl ? Date.now() + ttl : null,
      };

      return new Promise((resolve, reject) => {
        const request = store.put(entry);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache set error', error as Error);
      return false;
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache delete error', error as Error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache clear error', error as Error);
      return false;
    }
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache size error', error as Error);
      return 0;
    }
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<number> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const now = Date.now();
      let cleaned = 0;

      return new Promise((resolve, reject) => {
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;

          if (cursor) {
            const entry = cursor.value;
            if (entry.expires && entry.expires < now) {
              cursor.delete();
              cleaned++;
            }
            cursor.continue();
          } else {
            resolve(cleaned);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      fetchLogger.error('Cache clean error', error as Error);
      return 0;
    }
  }
}

// Singleton cache instance
export const contentCache = new ContentCache();

// =============================================================================
// PDF CONTENT FETCHER
// =============================================================================

/**
 * PDF Content Fetcher
 *
 * Fetches and parses PDF documents from blob storage URLs
 * Converts content to markdown-formatted text
 *
 * @requires pdfjs-dist
 */
export class PDFContentFetcher {
  private pdfjs: any = null;

  constructor() {
    // Lazy load PDF.js when needed
    this.initPDFJS();
  }

  /**
   * Initialize PDF.js library
   */
  private async initPDFJS(): Promise<void> {
    if (this.pdfjs) return;

    try {
      // Dynamic import for PDF.js
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker path for web workers
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      this.pdfjs = pdfjsLib;
    } catch (error) {
      fetchLogger.warn('PDF.js not available. Install with: npm install pdfjs-dist');
      throw new ContentFetchError(
        'PDF.js library not available',
        'PDFJS_NOT_AVAILABLE',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Fetch PDF content from URL
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<PDFContent> {
    const {
      signal,
      onProgress,
      cache = true,
      cacheKey = `pdf:${url}`,
      cacheTTL = 3600000, // 1 hour
    } = options;

    // Check cache first
    if (cache) {
      const cached = await contentCache.get<PDFContent>(cacheKey);
      if (cached) {
        onProgress?.(100);
        return cached;
      }
    }

    // Fetch with retry
    const content = await retryWithBackoff(
      () => this.fetchPDFContent(url, signal, onProgress),
      { signal, retries: options.retries }
    );

    // Validate response
    const validated = PDFContentSchema.parse(content);

    // Cache result
    if (cache) {
      await contentCache.set(cacheKey, validated, cacheTTL);
    }

    return validated;
  }

  /**
   * Fetch and parse PDF content
   */
  private async fetchPDFContent(
    url: string,
    signal?: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<PDFContent> {
    await this.initPDFJS();

    try {
      // Fetch PDF file
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new ContentFetchError(
          `Failed to fetch PDF: ${response.statusText}`,
          'FETCH_ERROR',
          response.status
        );
      }

      // Get array buffer with progress
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const reader = response.body?.getReader();

      if (!reader) {
        throw new ContentFetchError(
          'Response body not readable',
          'BODY_NOT_READABLE'
        );
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength > 0) {
          onProgress?.(Math.round((receivedLength / contentLength) * 50));
        }
      }

      // Concatenate chunks
      const arrayBuffer = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        arrayBuffer.set(chunk, position);
        position += chunk.length;
      }

      // Load PDF document
      const loadingTask = this.pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      onProgress?.(60);

      // Extract metadata
      const metadata = await pdf.getMetadata();
      const numPages = pdf.numPages;

      // Extract text from all pages
      const pages: PDFContent['pages'] = [];
      let fullText = '';
      let markdown = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        const lines = textContent.items.length;

        pages.push({
          pageNumber: i,
          text: pageText,
          lines,
        });

        fullText += pageText + '\n\n';
        markdown += `## Page ${i}\n\n${pageText}\n\n`;

        onProgress?.(60 + Math.round((i / numPages) * 40));
      }

      return {
        text: fullText.trim(),
        markdown: markdown.trim(),
        numPages,
        metadata: {
          title: metadata.info?.Title,
          author: metadata.info?.Author,
          subject: metadata.info?.Subject,
          keywords: metadata.info?.Keywords,
          creator: metadata.info?.Creator,
          producer: metadata.info?.Producer,
          creationDate: metadata.info?.CreationDate,
        },
        pages,
      };
    } catch (error) {
      if (error instanceof ContentFetchError) {
        throw error;
      }

      throw new ContentFetchError(
        `PDF parsing error: ${(error as Error).message}`,
        'PDF_PARSE_ERROR',
        undefined,
        error as Error
      );
    }
  }
}

// =============================================================================
// WEB CONTENT FETCHER
// =============================================================================

/**
 * Web Content Fetcher
 *
 * Fetches web content from resource database
 * Transforms to display format with sanitization
 */
export class WebContentFetcher {
  /**
   * Fetch web content by resource ID
   */
  async fetch(resourceId: string, options: FetchOptions = {}): Promise<WebContent> {
    const {
      signal,
      cache = true,
      cacheKey = `web:${resourceId}`,
      cacheTTL = 1800000, // 30 minutes
    } = options;

    // Check cache first
    if (cache) {
      const cached = await contentCache.get<WebContent>(cacheKey);
      if (cached) {
        options.onProgress?.(100);
        return cached;
      }
    }

    // Fetch with retry
    const content = await retryWithBackoff(
      () => this.fetchWebContent(resourceId, signal),
      { signal, retries: options.retries }
    );

    // Validate response
    const validated = WebContentSchema.parse(content);

    // Cache result
    if (cache) {
      await contentCache.set(cacheKey, validated, cacheTTL);
    }

    return validated;
  }

  /**
   * Fetch web content from API
   */
  private async fetchWebContent(
    resourceId: string,
    signal?: AbortSignal
  ): Promise<WebContent> {
    try {
      const response = await fetch(`/api/content/${resourceId}`, { signal });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ContentFetchError(
            `Resource not found: ${resourceId}`,
            'NOT_FOUND',
            404
          );
        }

        throw new ContentFetchError(
          `Failed to fetch content: ${response.statusText}`,
          'FETCH_ERROR',
          response.status
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new ContentFetchError(
          data.error || 'Failed to fetch content',
          'API_ERROR'
        );
      }

      const html = data.content?.html || data.content || '';
      const sanitizedHtml = sanitizeHtml(html);
      const text = sanitizeText(html);

      return {
        html,
        sanitizedHtml,
        text,
        title: data.content?.title || data.title,
        excerpt: data.content?.excerpt || data.excerpt,
        metadata: data.metadata,
      };
    } catch (error) {
      if (error instanceof ContentFetchError) {
        throw error;
      }

      throw new ContentFetchError(
        `Web content fetch error: ${(error as Error).message}`,
        'WEB_FETCH_ERROR',
        undefined,
        error as Error
      );
    }
  }
}

// =============================================================================
// AUDIO TRANSCRIPT FETCHER
// =============================================================================

/**
 * Audio Transcript Fetcher
 *
 * Fetches audio transcript files
 * Parses and formats timestamps
 * Returns structured transcript data
 */
export class AudioTranscriptFetcher {
  /**
   * Fetch audio transcript
   */
  async fetch(audioUrl: string, options: FetchOptions = {}): Promise<Transcript> {
    const {
      signal,
      cache = true,
      cacheKey = `transcript:${audioUrl}`,
      cacheTTL = 3600000, // 1 hour
    } = options;

    // Check cache first
    if (cache) {
      const cached = await contentCache.get<Transcript>(cacheKey);
      if (cached) {
        options.onProgress?.(100);
        return cached;
      }
    }

    // Fetch with retry
    const content = await retryWithBackoff(
      () => this.fetchTranscriptContent(audioUrl, signal, options.onProgress),
      { signal, retries: options.retries }
    );

    // Validate response
    const validated = TranscriptSchema.parse(content);

    // Cache result
    if (cache) {
      await contentCache.set(cacheKey, validated, cacheTTL);
    }

    return validated;
  }

  /**
   * Fetch transcript content
   */
  private async fetchTranscriptContent(
    audioUrl: string,
    signal?: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<Transcript> {
    try {
      // Extract audio ID from URL
      const audioId = this.extractAudioId(audioUrl);
      const transcriptUrl = `/api/audio/${audioId}/transcript`;

      onProgress?.(25);

      const response = await fetch(transcriptUrl, { signal });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ContentFetchError(
            `Transcript not found for audio: ${audioId}`,
            'NOT_FOUND',
            404
          );
        }

        throw new ContentFetchError(
          `Failed to fetch transcript: ${response.statusText}`,
          'FETCH_ERROR',
          response.status
        );
      }

      onProgress?.(50);

      const data = await response.json();

      if (!data.success) {
        throw new ContentFetchError(
          data.error || 'Failed to fetch transcript',
          'API_ERROR'
        );
      }

      onProgress?.(75);

      // Parse transcript data
      const segments = this.parseTranscriptSegments(
        data.transcript || data.segments || []
      );

      const fullText = segments
        .map(s => s.text)
        .join('\n');

      onProgress?.(100);

      return {
        segments,
        fullText,
        duration: data.duration,
        language: data.language || 'en',
        metadata: data.metadata,
      };
    } catch (error) {
      if (error instanceof ContentFetchError) {
        throw error;
      }

      throw new ContentFetchError(
        `Transcript fetch error: ${(error as Error).message}`,
        'TRANSCRIPT_FETCH_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Parse transcript segments
   */
  private parseTranscriptSegments(data: any[]): TranscriptSegment[] {
    return data.map((item, index) => {
      // Handle different transcript formats
      const timestamp = item.timestamp || item.time || `${index}`;
      const startTime = item.startTime || item.start || index * 1000;
      const endTime = item.endTime || item.end || startTime + 1000;
      const text = sanitizeText(item.text || item.content || '');
      const speaker = item.speaker || item.name;

      return {
        timestamp: this.formatTimestamp(startTime),
        startTime,
        endTime,
        text,
        speaker,
      };
    });
  }

  /**
   * Format timestamp in HH:MM:SS format
   */
  private formatTimestamp(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const ss = String(seconds % 60).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  }

  /**
   * Extract audio ID from URL or path
   */
  private extractAudioId(pathOrUrl: string): string {
    // If it's a URL, extract pathname
    if (pathOrUrl.startsWith('http')) {
      const url = new URL(pathOrUrl);
      pathOrUrl = url.pathname;
    }

    // Remove leading slash
    pathOrUrl = pathOrUrl.replace(/^\//, '');

    // Remove 'audio/' prefix
    if (pathOrUrl.startsWith('audio/')) {
      pathOrUrl = pathOrUrl.substring(6);
    }

    // Remove file extension
    pathOrUrl = pathOrUrl.replace(/\.[^.]+$/, '');

    return pathOrUrl;
  }
}

// =============================================================================
// MAIN CONTENT FETCHER
// =============================================================================

/**
 * Main Content Fetcher
 *
 * Unified interface for fetching all types of content
 * Orchestrates PDF, Web, and Audio transcript fetching
 */
export class ContentFetcher {
  private pdfFetcher: PDFContentFetcher;
  private webFetcher: WebContentFetcher;
  private audioFetcher: AudioTranscriptFetcher;

  constructor() {
    this.pdfFetcher = new PDFContentFetcher();
    this.webFetcher = new WebContentFetcher();
    this.audioFetcher = new AudioTranscriptFetcher();
  }

  /**
   * Fetch PDF content
   */
  async fetchPDFContent(url: string, options?: FetchOptions): Promise<PDFContent> {
    return this.pdfFetcher.fetch(url, options);
  }

  /**
   * Fetch web content
   */
  async fetchWebContent(resourceId: string, options?: FetchOptions): Promise<WebContent> {
    return this.webFetcher.fetch(resourceId, options);
  }

  /**
   * Fetch audio transcript
   */
  async fetchAudioTranscript(audioUrl: string, options?: FetchOptions): Promise<Transcript> {
    return this.audioFetcher.fetch(audioUrl, options);
  }

  /**
   * Fetch all available content for a resource
   */
  async fetchAll(resource: Resource, options: FetchOptions = {}): Promise<AllContent> {
    const results: AllContent = {};
    const signal = options.signal;

    // Create progress tracker
    const progressSteps = [
      resource.pdfUrl ? 1 : 0,
      resource.contentUrl ? 1 : 0,
      resource.audioUrl ? 1 : 0,
    ].filter(Boolean).length;

    let completedSteps = 0;
    const updateProgress = () => {
      completedSteps++;
      options.onProgress?.(Math.round((completedSteps / progressSteps) * 100));
    };

    // Fetch all content in parallel
    const promises: Promise<void>[] = [];

    // Fetch PDF
    if (resource.pdfUrl) {
      promises.push(
        this.fetchPDFContent(resource.pdfUrl, { ...options, signal })
          .then(pdf => {
            results.pdf = pdf;
            updateProgress();
          })
          .catch(error => {
            fetchLogger.error('PDF fetch failed', error as Error);
          })
      );
    }

    // Fetch web content
    if (resource.contentUrl) {
      promises.push(
        this.fetchWebContent(resource.id, { ...options, signal })
          .then(web => {
            results.web = web;
            updateProgress();
          })
          .catch(error => {
            fetchLogger.error('Web content fetch failed', error as Error);
          })
      );
    }

    // Fetch audio transcript
    if (resource.audioUrl) {
      promises.push(
        this.fetchAudioTranscript(resource.audioUrl, { ...options, signal })
          .then(transcript => {
            results.transcript = transcript;
            results.audio = {
              url: resource.audioUrl!,
              duration: transcript.duration,
              format: 'audio/mpeg',
            };
            updateProgress();
          })
          .catch(error => {
            fetchLogger.error('Audio transcript fetch failed', error as Error);
          })
      );
    }

    // Wait for all fetches
    await Promise.allSettled(promises);

    // Validate result
    return AllContentSchema.parse(results);
  }

  /**
   * Prefetch content for faster loading
   */
  async prefetch(resources: Resource[], options: FetchOptions = {}): Promise<void> {
    const promises = resources.map(resource =>
      this.fetchAll(resource, { ...options, cache: true })
        .catch(error => {
          fetchLogger.error('Prefetch failed', error as Error, { resourceId: resource.id });
        })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Clear all cached content
   */
  async clearCache(): Promise<void> {
    await contentCache.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ size: number }> {
    const size = await contentCache.size();
    return { size };
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<number> {
    return contentCache.cleanExpired();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export singleton instance
export const contentFetcher = new ContentFetcher();

// Export individual fetchers for advanced usage
export const pdfContentFetcher = new PDFContentFetcher();
export const webContentFetcher = new WebContentFetcher();
export const audioTranscriptFetcher = new AudioTranscriptFetcher();

