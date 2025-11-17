/**
 * useMediaUpload Hook
 *
 * Custom hook for handling media file uploads
 */

import { useState, useCallback } from 'react';
import type { MediaUploadProgress, MediaUploadResult } from '@/lib/types/media';

interface UseMediaUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: MediaUploadProgress) => void;
  onSuccess?: (result: MediaUploadResult) => void;
  onError?: (error: string) => void;
}

export function useMediaUpload({
  maxSize = 50 * 1024 * 1024, // 50MB default
  allowedTypes = ['audio/*', 'video/*', 'image/*'],
  onProgress,
  onSuccess,
  onError,
}: UseMediaUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<MediaUploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }

      return null;
    },
    [maxSize, allowedTypes]
  );

  const uploadFile = useCallback(
    async (file: File, resourceId: number): Promise<MediaUploadResult | null> => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return null;
      }

      setUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resourceId', resourceId.toString());

        // Upload with progress tracking
        const xhr = new XMLHttpRequest();

        // Progress handler
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressData: MediaUploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            };
            setProgress(progressData);
            onProgress?.(progressData);
          }
        });

        // Create promise for XHR
        const result = await new Promise<MediaUploadResult>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', '/api/media/upload');
          xhr.send(formData);
        });

        setUploading(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        setUploading(false);
        onError?.(errorMessage);
        return null;
      }
    },
    [validateFile, onProgress, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    reset,
  };
}
