/**
 * Tests for Resource Preview Utilities
 */

import type { Resource } from '@/data/resources';
import {
  getResourcePreviewUrl,
  getResourceDownloadUrl,
  getResourceTypeIcon,
  getResourceTypeLabel,
  getResourceCategoryLabel,
  getResourceLevelLabel,
  getResourceLevelColor,
  hasAudio,
  getAudioUrl,
  formatResourceSize,
  isOfflineAvailable,
  getResourcesByTag,
  getAllTags,
} from '@/lib/utils/resource-preview';

// Mock resources for testing
const mockResource: Resource = {
  id: 1,
  title: 'Test Resource',
  description: 'Test description',
  type: 'pdf',
  category: 'repartidor',
  level: 'basico',
  size: '31.0 KB',
  downloadUrl: '/test.pdf',
  tags: ['test', 'basico'],
  offline: true,
  audioUrl: '/audio/test.mp3',
};

const mockResources: Resource[] = [
  mockResource,
  {
    id: 2,
    title: 'Audio Resource',
    description: 'Audio test',
    type: 'audio',
    category: 'conductor',
    level: 'intermedio',
    size: '7.8 KB',
    downloadUrl: '/test.mp3',
    tags: ['audio', 'intermedio'],
    offline: true,
  },
  {
    id: 3,
    title: 'Video Resource',
    description: 'Video test',
    type: 'video',
    category: 'all',
    level: 'avanzado',
    size: '2.5 MB',
    downloadUrl: '/test.mp4',
    tags: ['video', 'avanzado', 'test'],
    offline: false,
  },
];

describe('getResourcePreviewUrl', () => {
  it('should generate preview URL with resource ID', () => {
    expect(getResourcePreviewUrl(mockResource)).toBe('/resources/1/preview');
  });

  it('should handle different resource IDs', () => {
    const resource2 = { ...mockResource, id: 42 };
    expect(getResourcePreviewUrl(resource2)).toBe('/resources/42/preview');
  });
});

describe('getResourceDownloadUrl', () => {
  it('should return the download URL', () => {
    expect(getResourceDownloadUrl(mockResource)).toBe('/test.pdf');
  });
});

describe('getResourceTypeIcon', () => {
  it('should return correct icon for each type', () => {
    expect(getResourceTypeIcon('pdf')).toBe('file-text');
    expect(getResourceTypeIcon('audio')).toBe('volume-2');
    expect(getResourceTypeIcon('image')).toBe('image');
    expect(getResourceTypeIcon('video')).toBe('video');
  });
});

describe('getResourceTypeLabel', () => {
  it('should return correct label for each type', () => {
    expect(getResourceTypeLabel('pdf')).toBe('PDF');
    expect(getResourceTypeLabel('audio')).toBe('Audio');
    expect(getResourceTypeLabel('image')).toBe('Imagen');
    expect(getResourceTypeLabel('video')).toBe('Video');
  });
});

describe('getResourceCategoryLabel', () => {
  it('should return correct label for each category', () => {
    expect(getResourceCategoryLabel('all')).toBe('Todos');
    expect(getResourceCategoryLabel('repartidor')).toBe('Repartidor');
    expect(getResourceCategoryLabel('conductor')).toBe('Conductor');
  });
});

describe('getResourceLevelLabel', () => {
  it('should return correct label for each level', () => {
    expect(getResourceLevelLabel('basico')).toBe('Básico');
    expect(getResourceLevelLabel('intermedio')).toBe('Intermedio');
    expect(getResourceLevelLabel('avanzado')).toBe('Avanzado');
  });
});

describe('getResourceLevelColor', () => {
  it('should return correct color class for each level', () => {
    const basicoColor = getResourceLevelColor('basico');
    expect(basicoColor).toContain('green');

    const intermedioColor = getResourceLevelColor('intermedio');
    expect(intermedioColor).toContain('yellow');

    const avanzadoColor = getResourceLevelColor('avanzado');
    expect(avanzadoColor).toContain('red');
  });
});

describe('hasAudio', () => {
  it('should return true when resource has audio URL', () => {
    expect(hasAudio(mockResource)).toBe(true);
  });

  it('should return false when resource has no audio URL', () => {
    const noAudio = { ...mockResource, audioUrl: undefined };
    expect(hasAudio(noAudio)).toBe(false);
  });
});

describe('getAudioUrl', () => {
  it('should return audio URL when available', () => {
    expect(getAudioUrl(mockResource)).toBe('/audio/test.mp3');
  });

  it('should return null when no audio URL', () => {
    const noAudio = { ...mockResource, audioUrl: undefined };
    expect(getAudioUrl(noAudio)).toBeNull();
  });
});

describe('formatResourceSize', () => {
  it('should return the size string as-is', () => {
    expect(formatResourceSize('31.0 KB')).toBe('31.0 KB');
    expect(formatResourceSize('2.5 MB')).toBe('2.5 MB');
  });
});

describe('isOfflineAvailable', () => {
  it('should return true when offline is true', () => {
    expect(isOfflineAvailable(mockResource)).toBe(true);
  });

  it('should return false when offline is false', () => {
    const online = { ...mockResource, offline: false };
    expect(isOfflineAvailable(online)).toBe(false);
  });
});

describe('getResourcesByTag', () => {
  it('should return resources matching the tag', () => {
    const testResources = getResourcesByTag(mockResources, 'test');
    expect(testResources).toHaveLength(2);
    expect(testResources[0].id).toBe(1);
    expect(testResources[1].id).toBe(3);
  });

  it('should return empty array when no matches', () => {
    const noMatch = getResourcesByTag(mockResources, 'nonexistent');
    expect(noMatch).toHaveLength(0);
  });
});

describe('getAllTags', () => {
  it('should return all unique tags sorted', () => {
    const tags = getAllTags(mockResources);
    expect(tags).toContain('test');
    expect(tags).toContain('basico');
    expect(tags).toContain('audio');
    expect(tags).toContain('intermedio');
    expect(tags).toContain('video');
    expect(tags).toContain('avanzado');
  });

  it('should not contain duplicates', () => {
    const tags = getAllTags(mockResources);
    const uniqueTags = Array.from(new Set(tags));
    expect(tags).toEqual(uniqueTags);
  });

  it('should be sorted alphabetically', () => {
    const tags = getAllTags(mockResources);
    const sortedTags = [...tags].sort();
    expect(tags).toEqual(sortedTags);
  });
});
