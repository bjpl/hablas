/**
 * Resource Preview Utilities
 *
 * Functions for generating preview URLs and handling resource display.
 */

import type { Resource } from '@/data/resources';

/**
 * Get the preview URL for a resource based on its type
 * Routes to the appropriate viewer for PDFs, audio, images, videos
 *
 * @param resource - The resource to preview
 * @returns URL for previewing the resource
 *
 * @example
 * getResourcePreviewUrl({ id: 1, type: 'pdf', ... })
 * // Returns: "/resources/1/preview"
 */
export function getResourcePreviewUrl(resource: Resource): string {
  // Base preview route
  return `/resources/${resource.id}/preview`;
}

/**
 * Get the download URL for a resource
 *
 * @param resource - The resource to download
 * @returns URL for downloading the resource
 */
export function getResourceDownloadUrl(resource: Resource): string {
  return resource.downloadUrl;
}

/**
 * Get the appropriate icon name for a resource type
 *
 * @param type - Resource type
 * @returns Icon name for UI display
 */
export function getResourceTypeIcon(
  type: Resource['type']
): string {
  const iconMap: Record<Resource['type'], string> = {
    pdf: 'file-text',
    audio: 'volume-2',
    image: 'image',
    video: 'video',
  };

  return iconMap[type] || 'file';
}

/**
 * Get display label for resource type
 *
 * @param type - Resource type
 * @returns Human-readable type label
 */
export function getResourceTypeLabel(type: Resource['type']): string {
  const labelMap: Record<Resource['type'], string> = {
    pdf: 'PDF',
    audio: 'Audio',
    image: 'Imagen',
    video: 'Video',
  };

  return labelMap[type] || type.toUpperCase();
}

/**
 * Get display label for resource category
 *
 * @param category - Resource category
 * @returns Human-readable category label
 */
export function getResourceCategoryLabel(
  category: Resource['category']
): string {
  const labelMap: Record<Resource['category'], string> = {
    all: 'Todos',
    repartidor: 'Repartidor',
    conductor: 'Conductor',
  };

  return labelMap[category] || category;
}

/**
 * Get display label for resource level
 *
 * @param level - Resource level
 * @returns Human-readable level label
 */
export function getResourceLevelLabel(level: Resource['level']): string {
  const labelMap: Record<Resource['level'], string> = {
    basico: 'Básico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
  };

  return labelMap[level] || level;
}

/**
 * Get badge color for resource level
 *
 * @param level - Resource level
 * @returns Tailwind CSS color class
 */
export function getResourceLevelColor(level: Resource['level']): string {
  const colorMap: Record<Resource['level'], string> = {
    basico: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermedio:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    avanzado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return colorMap[level] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if a resource has audio
 *
 * @param resource - The resource to check
 * @returns True if the resource has audio
 */
export function hasAudio(resource: Resource): boolean {
  return Boolean(resource.audioUrl);
}

/**
 * Get audio URL for a resource
 *
 * @param resource - The resource
 * @returns Audio URL or null if not available
 */
export function getAudioUrl(resource: Resource): string | null {
  return resource.audioUrl || null;
}

/**
 * Format resource size for display
 *
 * @param size - Size string like "31.0 KB"
 * @returns Formatted size
 */
export function formatResourceSize(size: string): string {
  return size;
}

/**
 * Check if a resource is available offline
 *
 * @param resource - The resource to check
 * @returns True if available offline
 */
export function isOfflineAvailable(resource: Resource): boolean {
  return resource.offline === true;
}

/**
 * Get all resources that match a specific tag
 *
 * @param resources - Array of resources to search
 * @param tag - Tag to match
 * @returns Filtered resources
 */
export function getResourcesByTag(
  resources: Resource[],
  tag: string
): Resource[] {
  return resources.filter((resource) =>
    resource.tags.includes(tag)
  );
}

/**
 * Get all unique tags from resources
 *
 * @param resources - Array of resources
 * @returns Unique tags
 */
export function getAllTags(resources: Resource[]): string[] {
  const tagSet = new Set<string>();

  for (const resource of resources) {
    for (const tag of resource.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}
