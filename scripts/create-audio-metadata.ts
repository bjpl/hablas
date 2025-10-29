#!/usr/bin/env node
/**
 * Audio Metadata Generator
 *
 * Generates metadata.json files for audio resources matching the sinonimos_de_ver format.
 * Reads from audio-specs/*.json files and creates structured metadata with voice mappings.
 *
 * Output: public/audio/metadata.json
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Voice mapping configuration for Azure Neural voices
const VOICE_REGIONS = {
  CO: 'Colombia',
  MX: 'Mexico',
  ES: 'Spain',
  AR: 'Argentina',
  US: 'United States'
} as const;

const VOICE_PROFILES = {
  // Colombian voices (neutral accent)
  co_female_1: {
    name: 'es-CO-SalomeNeural',
    region: 'CO',
    gender: 'female',
    description: 'Warm, clear Colombian female voice'
  },
  co_female_2: {
    name: 'es-CO-GonzaloNeural',
    region: 'CO',
    gender: 'male',
    description: 'Professional Colombian male voice'
  },

  // Mexican voices
  mx_female_1: {
    name: 'es-MX-DaliaNeural',
    region: 'MX',
    gender: 'female',
    description: 'Friendly Mexican female voice'
  },
  mx_male_1: {
    name: 'es-MX-JorgeNeural',
    region: 'MX',
    gender: 'male',
    description: 'Clear Mexican male voice'
  },

  // US English voices (for bilingual content)
  us_female_1: {
    name: 'en-US-JennyNeural',
    region: 'US',
    gender: 'female',
    description: 'Neutral American English female voice'
  },
  us_male_1: {
    name: 'en-US-GuyNeural',
    region: 'US',
    gender: 'male',
    description: 'Clear American English male voice'
  },

  // Spanish (Spain) voices (alternative accent)
  es_female_1: {
    name: 'es-ES-ElviraNeural',
    region: 'ES',
    gender: 'female',
    description: 'Clear Spanish female voice'
  },
  es_male_1: {
    name: 'es-ES-AlvaroNeural',
    region: 'ES',
    gender: 'male',
    description: 'Professional Spanish male voice'
  }
} as const;

// Assign voices based on resource characteristics
function assignVoice(spec: AudioSpec): keyof typeof VOICE_PROFILES {
  const { metadata, voiceProfile } = spec;

  // For beginner level, prefer Colombian accent (most neutral)
  if (metadata.level === 'basico') {
    return voiceProfile.gender.toLowerCase().includes('female')
      ? 'co_female_1'
      : 'co_female_2';
  }

  // For intermediate, use Mexican voices
  if (metadata.level === 'intermedio') {
    return voiceProfile.gender.toLowerCase().includes('female')
      ? 'mx_female_1'
      : 'mx_male_1';
  }

  // For advanced, use Spanish voices
  return voiceProfile.gender.toLowerCase().includes('female')
    ? 'es_female_1'
    : 'es_male_1';
}

interface AudioSpec {
  metadata: {
    resourceId: number;
    title: string;
    category: string;
    level: string;
    language: string;
    targetAudience: string;
    estimatedDuration: string;
    createdAt: string;
  };
  recording: {
    format: string;
    bitrate: string;
    sampleRate: string;
    channels: string;
    codec: string;
  };
  voiceProfile: {
    speakerType: string;
    accent: string;
    gender: string;
    ageRange: string;
    tone: string;
    characteristics: string[];
  };
  production: {
    pace: string;
    baseSpeed: string;
    emphasisStyle: string;
    pauseGuidelines: Record<string, string>;
    backgroundMusic?: {
      enabled: boolean;
      volume: string;
      placement: string;
    };
  };
  content: {
    sourceFile: string;
    totalSegments: number;
    segments: Array<{
      timestamp: string;
      duration: string;
      speaker: string;
      language: string;
      tone: string;
      text: string;
      notes: string;
      emphasis: string[];
      pace: string;
    }>;
  };
  optimization: {
    targetFileSize: string;
    offlineCapable: boolean;
    resumePlayback: boolean;
    speedControl: string[];
    quality: string;
  };
}

interface AudioMetadata {
  resources: Record<string, {
    file: string;
    voice: string;
    text: string;
    duration?: string;
    level?: string;
    category?: string;
  }>;
  voices: Record<string, {
    name: string;
    region: string;
    gender: string;
    description?: string;
  }>;
  statistics?: {
    totalResources: number;
    voiceDistribution: Record<string, number>;
    levelDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    generatedAt: string;
  };
}

function generateMetadata(): AudioMetadata {
  const audioSpecsDir = join(process.cwd(), 'audio-specs');
  const metadata: AudioMetadata = {
    resources: {},
    voices: {}
  };

  // Voice usage statistics
  const voiceUsage: Record<string, number> = {};
  const levelDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};

  try {
    // Read all audio spec files
    const specFiles = readdirSync(audioSpecsDir)
      .filter(file => file.endsWith('-spec.json') && !file.includes('README'));

    console.log(`Found ${specFiles.length} audio specification files`);

    for (const specFile of specFiles) {
      try {
        const specPath = join(audioSpecsDir, specFile);
        const spec: AudioSpec = JSON.parse(readFileSync(specPath, 'utf-8'));

        const resourceId = spec.metadata.resourceId.toString();
        const voice = assignVoice(spec);

        // Add resource metadata
        metadata.resources[resourceId] = {
          file: `/audio/resource-${resourceId}.mp3`,
          voice,
          text: spec.metadata.title,
          duration: spec.metadata.estimatedDuration,
          level: spec.metadata.level,
          category: spec.metadata.category
        };

        // Track voice usage
        voiceUsage[voice] = (voiceUsage[voice] || 0) + 1;

        // Track level distribution
        levelDistribution[spec.metadata.level] = (levelDistribution[spec.metadata.level] || 0) + 1;

        // Track category distribution
        categoryDistribution[spec.metadata.category] = (categoryDistribution[spec.metadata.category] || 0) + 1;

        console.log(`✓ Processed resource ${resourceId}: ${spec.metadata.title}`);
      } catch (error) {
        console.error(`✗ Error processing ${specFile}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Add all voice profiles (even unused ones for future use)
    metadata.voices = Object.entries(VOICE_PROFILES).reduce((acc, [key, profile]) => {
      acc[key] = profile;
      return acc;
    }, {} as typeof metadata.voices);

    // Add statistics
    metadata.statistics = {
      totalResources: Object.keys(metadata.resources).length,
      voiceDistribution: voiceUsage,
      levelDistribution,
      categoryDistribution,
      generatedAt: new Date().toISOString()
    };

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    throw error;
  }
}

function saveMetadata(metadata: AudioMetadata): void {
  const outputDir = join(process.cwd(), 'public', 'audio');
  const outputPath = join(outputDir, 'metadata.json');

  try {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }

    // Write metadata file
    writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`\n✓ Metadata saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving metadata:', error);
    throw error;
  }
}

function printStatistics(metadata: AudioMetadata): void {
  if (!metadata.statistics) return;

  console.log('\n' + '='.repeat(60));
  console.log('AUDIO METADATA GENERATION SUMMARY');
  console.log('='.repeat(60));

  console.log(`\nTotal Resources: ${metadata.statistics.totalResources}`);

  console.log('\nVoice Distribution:');
  Object.entries(metadata.statistics.voiceDistribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([voice, count]) => {
      const profile = metadata.voices[voice];
      console.log(`  ${voice.padEnd(15)} ${count.toString().padStart(3)} resources - ${profile.name} (${VOICE_REGIONS[profile.region as keyof typeof VOICE_REGIONS]})`);
    });

  console.log('\nLevel Distribution:');
  Object.entries(metadata.statistics.levelDistribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([level, count]) => {
      console.log(`  ${level.padEnd(15)} ${count.toString().padStart(3)} resources`);
    });

  console.log('\nCategory Distribution:');
  Object.entries(metadata.statistics.categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category.padEnd(15)} ${count.toString().padStart(3)} resources`);
    });

  console.log('\nAvailable Voices:');
  Object.entries(metadata.voices).forEach(([key, profile]) => {
    const used = metadata.statistics?.voiceDistribution[key] || 0;
    const status = used > 0 ? `(${used} resources)` : '(unused)';
    console.log(`  ${key.padEnd(15)} ${profile.name.padEnd(25)} ${status}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Generated at: ${metadata.statistics.generatedAt}`);
  console.log('='.repeat(60) + '\n');
}

// Main execution
function main(): void {
  try {
    console.log('Starting audio metadata generation...\n');

    const metadata = generateMetadata();
    saveMetadata(metadata);
    printStatistics(metadata);

    console.log('✓ Audio metadata generation completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Audio metadata generation failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateMetadata, saveMetadata, VOICE_PROFILES, VOICE_REGIONS };
