/**
 * Audio Upload Component
 * Admin interface for uploading audio files to Vercel Blob Storage
 */

'use client';

import { useState } from 'react';
import { uploadAudioViaAPI, validateAudioFile } from '@/lib/audio/blob-storage';

interface AudioUploaderProps {
  onUploadComplete?: (url: string, pathname: string) => void;
  onUploadError?: (error: string) => void;
}

export default function AudioUploader({ onUploadComplete, onUploadError }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    // Validate file
    const validation = validateAudioFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadedUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (actual progress tracking requires more complex setup)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const metadata = await uploadAudioViaAPI(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedUrl(metadata.url);

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(metadata.url, metadata.pathname);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 2000);
    } catch (err) {
      setUploadProgress(0);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);

      // Call error callback
      if (onUploadError) {
        onUploadError(errorMessage);
      }

      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setError(null);
    setUploadedUrl(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Audio File</h2>

      {/* File Input */}
      <div className="mb-4">
        <label
          htmlFor="audio-file"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Audio File
        </label>
        <input
          id="audio-file"
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/aac,audio/m4a"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          MP3, WAV, OGG, WebM, AAC, M4A (Max 10MB)
        </p>
      </div>

      {/* File Info */}
      {file && !uploading && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">File:</span> {file.name}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Type:</span> {file.type}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadedUrl && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 mb-2 font-medium">Upload successful!</p>
          <p className="text-xs text-green-600 break-all">{uploadedUrl}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={handleCancel}
          disabled={uploading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Note:</span> Only admin users can upload audio files.
          Uploaded files will be stored in Vercel Blob Storage and publicly accessible via CDN.
        </p>
      </div>
    </div>
  );
}
