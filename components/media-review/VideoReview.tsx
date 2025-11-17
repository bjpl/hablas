'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Video as VideoIcon } from 'lucide-react';
import type { MediaResource } from '@/lib/types/media';

interface VideoReviewProps {
  resource: MediaResource;
}

export const VideoReview: React.FC<VideoReviewProps> = ({ resource }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const metadata = resource.metadata;

  return (
    <div className="video-review-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <VideoIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Video Review</h2>
            <p className="text-sm text-gray-600">{resource.title}</p>
          </div>
        </div>

        {/* Video Metadata */}
        {metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            {metadata.duration && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Duration: {formatTime(metadata.duration)}
              </span>
            )}
            {metadata.dimensions && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Resolution: {metadata.dimensions.width}x{metadata.dimensions.height}
              </span>
            )}
            {metadata.format && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Format: {metadata.format.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {/* Video Player */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Player</h3>

          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={resource.downloadUrl}
              className="w-full h-auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          </div>

          {/* Custom Controls */}
          <div className="mt-4 space-y-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" fill="white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-gray-700" />
                  )}
                </button>

                <span className="text-sm text-gray-600">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Information</h3>
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
