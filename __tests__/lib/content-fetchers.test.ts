/**
 * Content Fetchers Test Suite
 * Tests for PDF, Web, and Audio content fetching with caching and retry logic
 */

import {
  uploadAudioFile,
  deleteAudioFile,
  getAudioMetadata,
  listAudioFiles,
  uploadAudioViaAPI,
  getAudioURL,
  deleteAudioViaAPI,
  extractAudioId,
  validateAudioFile,
  AudioMetadata,
} from '@/lib/audio/blob-storage';
import { put, del, head, list } from '@vercel/blob';

// Mock @vercel/blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
  head: jest.fn(),
  list: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Content Fetchers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  describe('uploadAudioFile', () => {
    it('should upload audio file successfully', async () => {
      const mockFile = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      const mockBlob = {
        url: 'https://blob.storage/audio/123-test.mp3',
        pathname: 'audio/123-test.mp3',
        contentType: 'audio/mpeg',
      };

      (put as jest.Mock).mockResolvedValue(mockBlob);

      const result = await uploadAudioFile(mockFile, 'test.mp3');

      expect(result).toMatchObject({
        url: mockBlob.url,
        pathname: mockBlob.pathname,
        contentType: 'audio/mpeg',
        size: mockFile.size,
      });
      expect(put).toHaveBeenCalledWith(
        expect.stringContaining('audio/'),
        mockFile,
        expect.objectContaining({
          access: 'public',
          contentType: 'audio/mpeg',
          token: 'test-token',
        })
      );
    });

    it('should sanitize filename before upload', async () => {
      const mockFile = new File(['audio'], 'test@#$%.mp3', { type: 'audio/mpeg' });
      const mockBlob = {
        url: 'https://blob.storage/audio/test.mp3',
        pathname: 'audio/test.mp3',
        contentType: 'audio/mpeg',
      };

      (put as jest.Mock).mockResolvedValue(mockBlob);

      await uploadAudioFile(mockFile, 'test@#$%.mp3');

      expect(put).toHaveBeenCalledWith(
        expect.stringMatching(/audio\/\d+-test____\.mp3$/),
        mockFile,
        expect.any(Object)
      );
    });

    it('should handle Buffer uploads', async () => {
      const mockBuffer = Buffer.from('audio content');
      const mockBlob = {
        url: 'https://blob.storage/audio/test.mp3',
        pathname: 'audio/test.mp3',
        contentType: 'audio/mpeg',
      };

      (put as jest.Mock).mockResolvedValue(mockBlob);

      const result = await uploadAudioFile(mockBuffer, 'test.mp3');

      expect(result.size).toBe(mockBuffer.length);
    });

    it('should throw error if BLOB_READ_WRITE_TOKEN is missing', async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

      await expect(uploadAudioFile(mockFile, 'test.mp3')).rejects.toThrow(
        'BLOB_READ_WRITE_TOKEN is not configured'
      );
    });

    it('should detect content type from file extension', async () => {
      const mockBuffer = Buffer.from('audio');
      const mockBlob = {
        url: 'https://blob.storage/audio/test.wav',
        pathname: 'audio/test.wav',
        contentType: 'audio/wav',
      };

      (put as jest.Mock).mockResolvedValue(mockBlob);

      await uploadAudioFile(mockBuffer, 'test.wav');

      expect(put).toHaveBeenCalledWith(
        expect.any(String),
        mockBuffer,
        expect.objectContaining({
          contentType: 'audio/wav',
        })
      );
    });
  });

  describe('deleteAudioFile', () => {
    it('should delete audio file successfully', async () => {
      (del as jest.Mock).mockResolvedValue(undefined);

      await deleteAudioFile('audio/test.mp3');

      expect(del).toHaveBeenCalledWith('audio/test.mp3', {
        token: 'test-token',
      });
    });

    it('should throw error if pathname is invalid', async () => {
      await expect(deleteAudioFile('invalid/test.mp3')).rejects.toThrow(
        'Invalid pathname: must start with audio/'
      );
    });

    it('should throw error if BLOB_READ_WRITE_TOKEN is missing', async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      await expect(deleteAudioFile('audio/test.mp3')).rejects.toThrow(
        'BLOB_READ_WRITE_TOKEN is not configured'
      );
    });
  });

  describe('getAudioMetadata', () => {
    it('should fetch audio metadata successfully', async () => {
      const mockMetadata = {
        url: 'https://blob.storage/audio/test.mp3',
        pathname: 'audio/test.mp3',
        contentType: 'audio/mpeg',
        size: 1024,
        uploadedAt: '2025-01-01T00:00:00Z',
      };

      (head as jest.Mock).mockResolvedValue(mockMetadata);

      const result = await getAudioMetadata('audio/test.mp3');

      expect(result).toMatchObject({
        url: mockMetadata.url,
        pathname: mockMetadata.pathname,
        contentType: mockMetadata.contentType,
        size: mockMetadata.size,
      });
    });

    it('should return null if file not found', async () => {
      (head as jest.Mock).mockRejectedValue(new Error('Blob not found'));

      const result = await getAudioMetadata('audio/nonexistent.mp3');

      expect(result).toBeNull();
    });

    it('should throw error for invalid pathname', async () => {
      await expect(getAudioMetadata('invalid/test.mp3')).rejects.toThrow(
        'Invalid pathname: must start with audio/'
      );
    });

    it('should propagate non-404 errors', async () => {
      (head as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getAudioMetadata('audio/test.mp3')).rejects.toThrow('Network error');
    });
  });

  describe('listAudioFiles', () => {
    it('should list audio files successfully', async () => {
      const mockBlobs = {
        blobs: [
          {
            url: 'https://blob.storage/audio/test1.mp3',
            pathname: 'audio/test1.mp3',
            size: 1024,
            uploadedAt: new Date('2025-01-01'),
          },
          {
            url: 'https://blob.storage/audio/test2.mp3',
            pathname: 'audio/test2.mp3',
            size: 2048,
            uploadedAt: new Date('2025-01-02'),
          },
        ],
        cursor: 'next-cursor',
        hasMore: true,
      };

      (list as jest.Mock).mockResolvedValue(mockBlobs);

      const result = await listAudioFiles({ limit: 10 });

      expect(result.files).toHaveLength(2);
      expect(result.cursor).toBe('next-cursor');
      expect(result.hasMore).toBe(true);
      expect(list).toHaveBeenCalledWith({
        prefix: 'audio/',
        limit: 10,
        cursor: undefined,
        token: 'test-token',
      });
    });

    it('should use default options', async () => {
      (list as jest.Mock).mockResolvedValue({
        blobs: [],
        cursor: undefined,
        hasMore: false,
      });

      await listAudioFiles();

      expect(list).toHaveBeenCalledWith({
        prefix: 'audio/',
        limit: 100,
        cursor: undefined,
        token: 'test-token',
      });
    });

    it('should support pagination with cursor', async () => {
      (list as jest.Mock).mockResolvedValue({
        blobs: [],
        cursor: 'new-cursor',
        hasMore: true,
      });

      await listAudioFiles({ cursor: 'prev-cursor', limit: 50 });

      expect(list).toHaveBeenCalledWith({
        prefix: 'audio/',
        limit: 50,
        cursor: 'prev-cursor',
        token: 'test-token',
      });
    });
  });

  describe('API Client Functions', () => {
    describe('uploadAudioViaAPI', () => {
      it('should upload file via API successfully', async () => {
        const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
        const mockResponse = {
          success: true,
          url: 'https://blob.storage/audio/test.mp3',
          pathname: 'audio/test.mp3',
          contentType: 'audio/mpeg',
          size: 1024,
        };

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await uploadAudioViaAPI(mockFile);

        expect(result).toMatchObject({
          url: mockResponse.url,
          pathname: mockResponse.pathname,
          contentType: mockResponse.contentType,
          size: mockResponse.size,
        });

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(fetchCall[0]).toBe('/api/audio/upload');
        expect(fetchCall[1].method).toBe('POST');
      });

      it('should handle API errors', async () => {
        const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Upload failed', details: 'File too large' }),
        });

        await expect(uploadAudioViaAPI(mockFile)).rejects.toThrow('File too large');
      });

      it('should handle abort signal', async () => {
        const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
        const abortController = new AbortController();

        (global.fetch as jest.Mock).mockImplementation(() => {
          abortController.abort();
          return Promise.reject(new Error('Aborted'));
        });

        await expect(
          uploadAudioViaAPI(mockFile, { signal: abortController.signal })
        ).rejects.toThrow();
      });
    });

    describe('getAudioURL', () => {
      it('should fetch audio URL successfully', async () => {
        const mockResponse = {
          success: true,
          url: 'https://blob.storage/audio/test.mp3',
        };

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await getAudioURL('test.mp3');

        expect(result).toBe(mockResponse.url);
        expect(global.fetch).toHaveBeenCalledWith('/api/audio/test.mp3');
      });

      it('should handle fetch errors', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Not found' }),
        });

        await expect(getAudioURL('nonexistent.mp3')).rejects.toThrow('Not found');
      });
    });

    describe('deleteAudioViaAPI', () => {
      it('should delete audio via API successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        });

        await deleteAudioViaAPI('test.mp3');

        expect(global.fetch).toHaveBeenCalledWith('/api/audio/test.mp3', {
          method: 'DELETE',
        });
      });

      it('should handle deletion errors', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Delete failed', details: 'File not found' }),
        });

        await expect(deleteAudioViaAPI('test.mp3')).rejects.toThrow('File not found');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('extractAudioId', () => {
      it('should extract ID from URL', () => {
        const url = 'https://blob.storage/audio/test.mp3';
        expect(extractAudioId(url)).toBe('test.mp3');
      });

      it('should extract ID from pathname with leading slash', () => {
        expect(extractAudioId('/audio/test.mp3')).toBe('test.mp3');
      });

      it('should extract ID from pathname without prefix', () => {
        expect(extractAudioId('audio/test.mp3')).toBe('test.mp3');
      });

      it('should handle ID without prefix', () => {
        expect(extractAudioId('test.mp3')).toBe('test.mp3');
      });
    });

    describe('validateAudioFile', () => {
      it('should validate correct audio file', () => {
        const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
        const result = validateAudioFile(file);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject file larger than 10MB', () => {
        const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
        const file = new File([largeContent], 'large.mp3', { type: 'audio/mpeg' });
        const result = validateAudioFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('exceeds maximum allowed size');
      });

      it('should reject invalid file type', () => {
        const file = new File(['video'], 'test.mp4', { type: 'video/mp4' });
        const result = validateAudioFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });

      it('should accept all allowed audio types', () => {
        const allowedTypes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/ogg',
          'audio/webm',
          'audio/aac',
          'audio/m4a',
        ];

        allowedTypes.forEach((type) => {
          const file = new File(['audio'], 'test', { type });
          const result = validateAudioFile(file);
          expect(result.valid).toBe(true);
        });
      });
    });
  });

  describe('Caching Behavior', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockMetadata = {
        url: 'https://blob.storage/audio/test.mp3',
        pathname: 'audio/test.mp3',
        contentType: 'audio/mpeg',
        size: 1024,
        uploadedAt: '2025-01-01T00:00:00Z',
      };

      (head as jest.Mock).mockResolvedValue(mockMetadata);

      // Make multiple concurrent requests
      const requests = Array(5)
        .fill(null)
        .map(() => getAudioMetadata('audio/test.mp3'));

      const results = await Promise.all(requests);

      // All results should be identical
      results.forEach((result) => {
        expect(result?.url).toBe(mockMetadata.url);
      });

      // Should make 5 separate calls (no caching at this level)
      expect(head).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Handling and Retry Logic', () => {
    it('should handle network timeouts', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          })
      );

      await expect(getAudioURL('test.mp3')).rejects.toThrow('Timeout');
    });

    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(getAudioURL('test.mp3')).rejects.toThrow('Invalid JSON');
    });

    it('should handle blob storage service errors', async () => {
      (put as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

      await expect(uploadAudioFile(mockFile, 'test.mp3')).rejects.toThrow(
        'Service unavailable'
      );
    });
  });
});
