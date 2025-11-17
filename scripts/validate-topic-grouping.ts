/**
 * Validation Script for Topic Grouping
 *
 * Tests topic grouping logic against actual resources.ts data
 * Run with: npx tsx scripts/validate-topic-grouping.ts
 */

import { resources } from '@/data/resources';
import {
  groupResourcesByTopic,
  getTopicBySlug,
  getAllTopicSlugs,
} from '@/lib/utils/topic-grouping';

console.log('=== Topic Grouping Validation ===\n');

// Group all resources by topic
const result = groupResourcesByTopic(resources);

console.log(`Total Resources: ${resources.length}`);
console.log(`Total Topics: ${result.totalTopics}`);
console.log(`Total Variations: ${result.totalVariations}`);
console.log(`Ungrouped Resources: ${result.ungrouped.length}\n`);

// Display each topic
console.log('=== Topics by Category ===\n');

for (const topic of result.topics) {
  console.log(`Topic: ${topic.name}`);
  console.log(`  Slug: ${topic.slug}`);
  console.log(`  Category: ${topic.category}`);
  console.log(`  Level: ${topic.level}`);
  console.log(`  Variations: ${topic.variations}`);
  console.log(`  Total Size: ${topic.totalSize}`);
  console.log(`  Tags: ${topic.tags.join(', ')}`);
  console.log('  Resources:');
  for (const resource of topic.resources) {
    console.log(`    - [${resource.id}] ${resource.title} (${resource.size})`);
  }
  console.log('');
}

// Display ungrouped resources
if (result.ungrouped.length > 0) {
  console.log('=== Ungrouped Resources ===\n');
  for (const resource of result.ungrouped) {
    console.log(`  - [${resource.id}] ${resource.title}`);
  }
  console.log('');
}

// Test filtering by category
console.log('=== Filtering Tests ===\n');

const repartidorTopics = groupResourcesByTopic(resources, {
  category: 'repartidor',
});
console.log(
  `Repartidor topics: ${repartidorTopics.totalTopics} topics, ${repartidorTopics.totalVariations} variations`
);

const conductorTopics = groupResourcesByTopic(resources, {
  category: 'conductor',
});
console.log(
  `Conductor topics: ${conductorTopics.totalTopics} topics, ${conductorTopics.totalVariations} variations`
);

const basicoTopics = groupResourcesByTopic(resources, { level: 'basico' });
console.log(
  `Basico level: ${basicoTopics.totalTopics} topics, ${basicoTopics.totalVariations} variations`
);

const intermedioTopics = groupResourcesByTopic(resources, {
  level: 'intermedio',
});
console.log(
  `Intermedio level: ${intermedioTopics.totalTopics} topics, ${intermedioTopics.totalVariations} variations`
);

const avanzadoTopics = groupResourcesByTopic(resources, {
  level: 'avanzado',
});
console.log(
  `Avanzado level: ${avanzadoTopics.totalTopics} topics, ${avanzadoTopics.totalVariations} variations\n`
);

// Test topic lookup
console.log('=== Topic Lookup Test ===\n');

const slugs = getAllTopicSlugs(resources);
console.log(`All topic slugs: ${slugs.join(', ')}\n`);

if (slugs.length > 0) {
  const firstSlug = slugs[0];
  const topic = getTopicBySlug(firstSlug, resources);
  if (topic) {
    console.log(`Lookup test for slug "${firstSlug}":`);
    console.log(`  Found: ${topic.name}`);
    console.log(`  Variations: ${topic.variations}`);
    console.log('  ✓ Topic lookup working correctly\n');
  }
}

console.log('=== Validation Complete ===');
