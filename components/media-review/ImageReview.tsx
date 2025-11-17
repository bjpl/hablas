'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Image as ImageIcon } from 'lucide-react';
import type { MediaResource } from '@/lib/types/media';
import Image from 'next/image';

interface ImageReviewProps {
  resource: MediaResource;
}

export const ImageReview: React.FC<ImageReviewProps> = ({ resource }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const metadata = resource.metadata;
  const dimensions = metadata?.dimensions
    ? `${metadata.dimensions.width} x ${metadata.dimensions.height}px`
    : 'Unknown';

  return (
    <div className="image-review-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Image Review</h2>
            <p className="text-sm text-gray-600">{resource.title}</p>
          </div>
        </div>

        {/* Image Metadata */}
        {metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            <span className="px-2 py-1 bg-white rounded shadow-sm">
              Dimensions: {dimensions}
            </span>
            {metadata.format && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Format: {metadata.format.toUpperCase()}
              </span>
            )}
            {metadata.size && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Size: {(metadata.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {/* Image Viewer */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Image Viewer</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
                aria-label="Rotate"
              >
                <RotateCw className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
              }}
            >
              <Image
                src={resource.downloadUrl}
                alt={resource.title}
                width={800}
                height={600}
                className="max-w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Image Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">File Path</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                {resource.downloadUrl}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {resource.category}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Level</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {resource.level}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{resource.description}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
