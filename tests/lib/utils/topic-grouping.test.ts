/**
 * Tests for Topic Grouping Utilities
 */

import type { Resource } from '@/data/resources';
import {
  getTopicName,
  getTopicSlug,
  getVariationNumber,
  groupResourcesByTopic,
  getTopicBySlug,
  getAllTopicSlugs,
  isTitleInTopic,
} from '@/lib/utils/topic-grouping';

// Mock resources for testing
const mockResources: Resource[] = [
  {
    id: 1,
    title: 'Frases Esenciales para Entregas - Var 1',
    description: 'Test description',
    type: 'pdf',
    category: 'repartidor',
    level: 'basico',
    size: '31.0 KB',
    downloadUrl: '/test1.pdf',
    tags: ['entregas', 'basico'],
    offline: true,
  },
  {
    id: 2,
    title: 'Frases Esenciales para Entregas - Var 2',
    description: 'Test description',
    type: 'pdf',
    category: 'repartidor',
    level: 'basico',
    size: '32.0 KB',
    downloadUrl: '/test2.pdf',
    tags: ['entregas', 'basico', 'advanced'],
    offline: true,
  },
  {
    id: 3,
    title: 'Pronunciación: Entregas - Var 1',
    description: 'Test description',
    type: 'audio',
    category: 'repartidor',
    level: 'basico',
    size: '7.8 KB',
    downloadUrl: '/test3.mp3',
    tags: ['pronunciación', 'basico'],
    offline: true,
  },
  {
    id: 4,
    title: 'Standalone Resource',
    description: 'Resource without variation',
    type: 'pdf',
    category: 'conductor',
    level: 'intermedio',
    size: '20.0 KB',
    downloadUrl: '/test4.pdf',
    tags: ['standalone'],
    offline: true,
  },
];

describe('getTopicName', () => {
  it('should remove variation suffix from title', () => {
    expect(getTopicName('Frases Esenciales para Entregas - Var 1')).toBe(
      'Frases Esenciales para Entregas'
    );
  });

  it('should handle different variation patterns', () => {
    expect(getTopicName('Test Title - Var 2')).toBe('Test Title');
    expect(getTopicName('Test Title (Var 3)')).toBe('Test Title');
    expect(getTopicName('Test Title - Variación 1')).toBe('Test Title');
  });

  it('should return original title if no variation suffix', () => {
    expect(getTopicName('Standalone Resource')).toBe('Standalone Resource');
  });
});

describe('getTopicSlug', () => {
  it('should create URL-safe slug from title', () => {
    expect(getTopicSlug('Frases Esenciales para Entregas - Var 1')).toBe(
      'frases-esenciales-para-entregas'
    );
  });

  it('should handle accented characters', () => {
    expect(getTopicSlug('Pronunciación: Entregas')).toBe(
      'pronunciacion-entregas'
    );
  });

  it('should remove special characters', () => {
    expect(getTopicSlug('Test! Title@ #123')).toBe('test-title-123');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(getTopicSlug('Multiple   Spaces---Here')).toBe(
      'multiple-spaces-here'
    );
  });
});

describe('getVariationNumber', () => {
  it('should extract variation number from title', () => {
    expect(getVariationNumber('Test - Var 1')).toBe(1);
    expect(getVariationNumber('Test - Var 2')).toBe(2);
    expect(getVariationNumber('Test - Variación 3')).toBe(3);
  });

  it('should return 0 for titles without variation', () => {
    expect(getVariationNumber('Standalone Resource')).toBe(0);
  });
});

describe('groupResourcesByTopic', () => {
  it('should group resources by base topic name', () => {
    const result = groupResourcesByTopic(mockResources);

    expect(result.totalTopics).toBe(2);
    expect(result.topics).toHaveLength(2);

    const phrasesGroup = result.topics.find(
      (t) => t.slug === 'frases-esenciales-para-entregas'
    );
    expect(phrasesGroup?.variations).toBe(2);
    expect(phrasesGroup?.resources).toHaveLength(2);
  });

  it('should exclude standalone resources by default', () => {
    const result = groupResourcesByTopic(mockResources);

    expect(result.ungrouped).toHaveLength(1);
    expect(result.ungrouped[0].title).toBe('Standalone Resource');
  });

  it('should include standalone resources when option is set', () => {
    const result = groupResourcesByTopic(mockResources, {
      includeStandalone: true,
    });

    expect(result.ungrouped).toHaveLength(0);
    expect(result.totalTopics).toBe(3);
  });

  it('should filter by category', () => {
    const result = groupResourcesByTopic(mockResources, {
      category: 'repartidor',
    });

    const allRepartidor = result.topics.every(
      (topic) => topic.category === 'repartidor'
    );
    expect(allRepartidor).toBe(true);
  });

  it('should filter by level', () => {
    const result = groupResourcesByTopic(mockResources, {
      level: 'basico',
    });

    const allBasico = result.topics.every((topic) => topic.level === 'basico');
    expect(allBasico).toBe(true);
  });

  it('should calculate total size correctly', () => {
    const result = groupResourcesByTopic(mockResources);

    const phrasesGroup = result.topics.find(
      (t) => t.slug === 'frases-esenciales-para-entregas'
    );
    // 31.0 KB + 32.0 KB = 63.0 KB
    expect(phrasesGroup?.totalSize).toBe('63.0 KB');
  });

  it('should merge tags from all variations', () => {
    const result = groupResourcesByTopic(mockResources);

    const phrasesGroup = result.topics.find(
      (t) => t.slug === 'frases-esenciales-para-entregas'
    );
    expect(phrasesGroup?.tags).toContain('entregas');
    expect(phrasesGroup?.tags).toContain('basico');
    expect(phrasesGroup?.tags).toContain('advanced');
  });

  it('should sort variations in ascending order by default', () => {
    const result = groupResourcesByTopic(mockResources);

    const phrasesGroup = result.topics.find(
      (t) => t.slug === 'frases-esenciales-para-entregas'
    );
    expect(phrasesGroup?.resources[0].id).toBe(1); // Var 1
    expect(phrasesGroup?.resources[1].id).toBe(2); // Var 2
  });

  it('should sort variations in descending order when specified', () => {
    const result = groupResourcesByTopic(mockResources, {
      sortVariations: 'desc',
    });

    const phrasesGroup = result.topics.find(
      (t) => t.slug === 'frases-esenciales-para-entregas'
    );
    expect(phrasesGroup?.resources[0].id).toBe(2); // Var 2
    expect(phrasesGroup?.resources[1].id).toBe(1); // Var 1
  });
});

describe('getTopicBySlug', () => {
  it('should find topic by slug', () => {
    const topic = getTopicBySlug(
      'frases-esenciales-para-entregas',
      mockResources
    );

    expect(topic).not.toBeNull();
    expect(topic?.name).toBe('Frases Esenciales para Entregas');
    expect(topic?.variations).toBe(2);
  });

  it('should return null for non-existent slug', () => {
    const topic = getTopicBySlug('non-existent-topic', mockResources);
    expect(topic).toBeNull();
  });
});

describe('getAllTopicSlugs', () => {
  it('should return all topic slugs', () => {
    const slugs = getAllTopicSlugs(mockResources);

    expect(slugs).toContain('frases-esenciales-para-entregas');
    expect(slugs).toContain('pronunciacion-entregas');
    expect(slugs).toHaveLength(2);
  });
});

describe('isTitleInTopic', () => {
  it('should return true for titles in the topic', () => {
    const result = isTitleInTopic(
      'Frases Esenciales para Entregas - Var 1',
      'frases-esenciales-para-entregas'
    );
    expect(result).toBe(true);
  });

  it('should return false for titles not in the topic', () => {
    const result = isTitleInTopic(
      'Pronunciación: Entregas - Var 1',
      'frases-esenciales-para-entregas'
    );
    expect(result).toBe(false);
  });
});
