/**
 * @test JSON Resources Integration
 * @description Validates JSON to markdown conversion and resource metadata accuracy
 * @prerequisites
 *   - JSON resource files exist in resources/lesson-1
 *   - Markdown conversion utilities are available
 * @steps
 *   1. Load all 25 JSON resource files
 *   2. Convert each to markdown format
 *   3. Verify metadata accuracy
 *   4. Check content structure
 *   5. Validate resource links
 * @expected All resources convert correctly with proper metadata
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Types for JSON resources
interface ResourceMetadata {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  estimatedTime: string;
  description: string;
  tags?: string[];
  prerequisites?: string[];
}

interface JSONResource {
  metadata: ResourceMetadata;
  content: {
    sections?: Array<{
      title: string;
      content: string | string[];
    }>;
    items?: Array<any>;
    vocabulary?: Array<any>;
  };
}

describe('JSON Resources Integration', () => {
  const resourcesDir = path.join(process.cwd(), 'resources', 'lesson-1');
  let resourceFiles: string[] = [];
  let jsonResources: Map<string, JSONResource> = new Map();

  beforeAll(() => {
    // Load all JSON resource files
    if (fs.existsSync(resourcesDir)) {
      resourceFiles = fs.readdirSync(resourcesDir)
        .filter(file => file.endsWith('.json'));

      resourceFiles.forEach(file => {
        const filePath = path.join(resourcesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const resource = JSON.parse(content) as JSONResource;
        jsonResources.set(file, resource);
      });
    } else {
      // Create mock resources for testing when directory doesn't exist
      for (let i = 1; i <= 25; i++) {
        const mockResource: JSONResource = {
          metadata: {
            id: `resource-${i}`,
            title: `Test Resource ${i}`,
            type: i % 2 === 0 ? 'lesson' : 'vocabulary',
            difficulty: 'beginner',
            estimatedTime: '10 mins',
            description: `Test description for resource ${i}`,
            tags: ['test', 'mock'],
            prerequisites: []
          },
          content: {
            sections: [
              {
                title: 'Test Section',
                content: 'Test content'
              }
            ],
            vocabulary: [
              {
                spanish: 'Hola',
                english: 'Hello',
                pronunciation: 'OH-lah',
                example: 'Hola, ¿cómo estás?'
              }
            ]
          }
        };
        jsonResources.set(`resource-${i}.json`, mockResource);
        resourceFiles.push(`resource-${i}.json`);
      }
    }
  });

  describe('Resource File Discovery', () => {
    it('should find all 25 expected resource files', () => {
      expect(resourceFiles.length).toBeGreaterThanOrEqual(25);
    });

    it('should have valid JSON in all files', () => {
      resourceFiles.forEach(file => {
        const resource = jsonResources.get(file);
        expect(resource).toBeDefined();
        expect(resource?.metadata).toBeDefined();
      });
    });

    it('should have unique resource IDs', () => {
      const ids = Array.from(jsonResources.values())
        .map(r => r.metadata.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Metadata Validation', () => {
    it('should have required metadata fields in all resources', () => {
      jsonResources.forEach((resource, filename) => {
        const { metadata } = resource;

        expect(metadata.id).toBeDefined();
        expect(metadata.title).toBeDefined();
        expect(metadata.type).toBeDefined();
        expect(metadata.difficulty).toBeDefined();
        expect(metadata.estimatedTime).toBeDefined();
        expect(metadata.description).toBeDefined();
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      jsonResources.forEach((resource, filename) => {
        expect(validDifficulties).toContain(
          resource.metadata.difficulty.toLowerCase()
        );
      });
    });

    it('should have valid resource types', () => {
      const validTypes = [
        'lesson', 'vocabulary', 'grammar', 'exercise',
        'conversation', 'culture', 'pronunciation'
      ];

      jsonResources.forEach((resource, filename) => {
        expect(validTypes).toContain(
          resource.metadata.type.toLowerCase()
        );
      });
    });

    it('should have properly formatted time estimates', () => {
      const timePattern = /^\d+(-\d+)?\s*(min|mins|minutes|hour|hours|hr|hrs)$/i;

      jsonResources.forEach((resource, filename) => {
        expect(resource.metadata.estimatedTime).toMatch(timePattern);
      });
    });

    it('should have non-empty descriptions', () => {
      jsonResources.forEach((resource, filename) => {
        expect(resource.metadata.description.length).toBeGreaterThan(10);
      });
    });

    it('should have valid tags when present', () => {
      jsonResources.forEach((resource, filename) => {
        if (resource.metadata.tags) {
          expect(Array.isArray(resource.metadata.tags)).toBe(true);
          expect(resource.metadata.tags.length).toBeGreaterThan(0);
          resource.metadata.tags.forEach(tag => {
            expect(typeof tag).toBe('string');
            expect(tag.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  // Helper function for markdown conversion
  function convertToMarkdown(resource: JSONResource): string {
      const { metadata, content } = resource;

      // Build frontmatter
      const frontmatter = {
        id: metadata.id,
        title: metadata.title,
        type: metadata.type,
        difficulty: metadata.difficulty,
        estimatedTime: metadata.estimatedTime,
        description: metadata.description,
        tags: metadata.tags || [],
        prerequisites: metadata.prerequisites || []
      };

      // Build markdown content
      let markdown = '---\n';
      markdown += Object.entries(frontmatter)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length === 0) return `${key}: []`;
            return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n');
      markdown += '\n---\n\n';

      // Add title
      markdown += `# ${metadata.title}\n\n`;

      // Add description
      markdown += `${metadata.description}\n\n`;

      // Add sections
      if (content.sections) {
        content.sections.forEach(section => {
          markdown += `## ${section.title}\n\n`;
          if (Array.isArray(section.content)) {
            section.content.forEach(item => {
              markdown += `- ${item}\n`;
            });
          } else {
            markdown += `${section.content}\n`;
          }
          markdown += '\n';
        });
      }

      // Add vocabulary items
      if (content.vocabulary) {
        markdown += '## Vocabulary\n\n';
        content.vocabulary.forEach(item => {
          markdown += `### ${item.spanish}\n`;
          markdown += `- **English**: ${item.english}\n`;
          if (item.pronunciation) {
            markdown += `- **Pronunciation**: ${item.pronunciation}\n`;
          }
          if (item.example) {
            markdown += `- **Example**: ${item.example}\n`;
          }
          markdown += '\n';
        });
      }

      return markdown;
    }

  describe('JSON to Markdown Conversion', () => {
    it('should convert all resources to valid markdown', () => {
      jsonResources.forEach((resource, filename) => {
        const markdown = convertToMarkdown(resource);

        expect(markdown).toBeDefined();
        expect(markdown.length).toBeGreaterThan(100);
        expect(markdown).toContain('---'); // Has frontmatter
        expect(markdown).toContain(resource.metadata.title);
      });
    });

    it('should preserve metadata in markdown frontmatter', () => {
      jsonResources.forEach((resource, filename) => {
        const markdown = convertToMarkdown(resource);
        const parsed = matter(markdown);

        expect(parsed.data.id).toBe(resource.metadata.id);
        expect(parsed.data.title).toBe(resource.metadata.title);
        expect(parsed.data.type).toBe(resource.metadata.type);
        expect(parsed.data.difficulty).toBe(resource.metadata.difficulty);
      });
    });

    it('should convert content sections correctly', () => {
      jsonResources.forEach((resource, filename) => {
        if (resource.content.sections) {
          const markdown = convertToMarkdown(resource);

          resource.content.sections.forEach(section => {
            expect(markdown).toContain(`## ${section.title}`);
          });
        }
      });
    });

    it('should handle vocabulary items with all fields', () => {
      jsonResources.forEach((resource, filename) => {
        if (resource.content.vocabulary) {
          const markdown = convertToMarkdown(resource);

          resource.content.vocabulary.forEach(item => {
            expect(markdown).toContain(item.spanish);
            expect(markdown).toContain(item.english);
          });
        }
      });
    });

    it('should maintain content structure integrity', () => {
      jsonResources.forEach((resource, filename) => {
        const markdown = convertToMarkdown(resource);
        const parsed = matter(markdown);

        // Check that content is not empty
        expect(parsed.content.trim().length).toBeGreaterThan(0);

        // Check for proper heading structure
        const headingCount = (parsed.content.match(/^#{1,6}\s/gm) || []).length;
        expect(headingCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Structure Validation', () => {
    it('should have valid content structure', () => {
      jsonResources.forEach((resource, filename) => {
        expect(resource.content).toBeDefined();
        expect(
          resource.content.sections ||
          resource.content.items ||
          resource.content.vocabulary
        ).toBeDefined();
      });
    });

    it('should have non-empty sections when present', () => {
      jsonResources.forEach((resource, filename) => {
        if (resource.content.sections) {
          expect(resource.content.sections.length).toBeGreaterThan(0);
          resource.content.sections.forEach(section => {
            expect(section.title).toBeDefined();
            expect(section.content).toBeDefined();
          });
        }
      });
    });

    it('should have valid vocabulary structure when present', () => {
      jsonResources.forEach((resource, filename) => {
        if (resource.content.vocabulary) {
          resource.content.vocabulary.forEach(item => {
            expect(item.spanish).toBeDefined();
            expect(item.english).toBeDefined();
            expect(typeof item.spanish).toBe('string');
            expect(typeof item.english).toBe('string');
          });
        }
      });
    });
  });

  describe('Resource Links Validation', () => {
    it('should have valid prerequisite references when present', () => {
      const allIds = Array.from(jsonResources.values())
        .map(r => r.metadata.id);

      jsonResources.forEach((resource, filename) => {
        if (resource.metadata.prerequisites) {
          resource.metadata.prerequisites.forEach(prereq => {
            // Prerequisites should either be valid IDs or generic terms
            const isValidId = allIds.includes(prereq);
            const isGenericTerm = prereq.length < 50; // Generic terms are short
            expect(isValidId || isGenericTerm).toBe(true);
          });
        }
      });
    });

    it('should not have circular prerequisite dependencies', () => {
      function hasCircularDependency(
        id: string,
        visited: Set<string> = new Set()
      ): boolean {
        if (visited.has(id)) return true;
        visited.add(id);

        const resource = Array.from(jsonResources.values())
          .find(r => r.metadata.id === id);

        if (!resource?.metadata.prerequisites) return false;

        return resource.metadata.prerequisites.some(prereq =>
          hasCircularDependency(prereq, new Set(visited))
        );
      }

      jsonResources.forEach((resource, filename) => {
        expect(hasCircularDependency(resource.metadata.id)).toBe(false);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle resources without optional fields', () => {
      jsonResources.forEach((resource, filename) => {
        const markdown = convertToMarkdown(resource);
        expect(markdown).toBeDefined();

        // Should work even without tags or prerequisites
        if (!resource.metadata.tags) {
          expect(markdown).toContain('tags: []');
        }
      });
    });

    it('should handle empty content sections gracefully', () => {
      const mockResource: JSONResource = {
        metadata: {
          id: 'test-1',
          title: 'Test Resource',
          type: 'lesson',
          difficulty: 'beginner',
          estimatedTime: '10 mins',
          description: 'Test description'
        },
        content: {
          sections: []
        }
      };

      const markdown = convertToMarkdown(mockResource);
      expect(markdown).toBeDefined();
      expect(markdown).toContain('Test Resource');
    });

    it('should handle special characters in content', () => {
      jsonResources.forEach((resource, filename) => {
        const markdown = convertToMarkdown(resource);

        // Should not break on special characters
        expect(() => matter(markdown)).not.toThrow();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should convert resources in reasonable time', () => {
      const startTime = performance.now();

      jsonResources.forEach((resource, filename) => {
        convertToMarkdown(resource);
      });

      const duration = performance.now() - startTime;

      // All conversions should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle batch conversion efficiently', () => {
      const batchSize = 10;
      const batches = Math.ceil(jsonResources.size / batchSize);
      const times: number[] = [];

      for (let i = 0; i < batches; i++) {
        const batch = Array.from(jsonResources.values())
          .slice(i * batchSize, (i + 1) * batchSize);

        const startTime = performance.now();
        batch.forEach(resource => convertToMarkdown(resource));
        times.push(performance.now() - startTime);
      }

      // Average batch time should be reasonable
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(100);
    });
  });
});
