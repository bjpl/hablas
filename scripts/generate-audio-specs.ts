#!/usr/bin/env ts-node

/**
 * Audio Specification Generator
 *
 * This script parses all resources with pronunciation content (audio type)
 * and generates comprehensive audio recording specifications including:
 * - Text to speak with pronunciation guides
 * - Pace and timing (slow for beginners)
 * - Emphasis points and tone markers
 * - Recording format specifications (MP3, 128kbps)
 * - Metadata (resource ID, language, speaker profile, duration)
 *
 * Output: JSON specification files in audio-specs/ directory
 */

import * as fs from 'fs';
import * as path from 'path';

// ==================== TYPES ====================

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'image' | 'video';
  category: 'all' | 'repartidor' | 'conductor';
  level: 'basico' | 'intermedio' | 'avanzado';
  size: string;
  downloadUrl: string;
  tags: readonly string[] | string[];
  offline: boolean;
  contentPath?: string;
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
    pauseGuidelines: {
      betweenPhrases: string;
      betweenSections: string;
      forRepetition: string;
    };
    backgroundMusic: {
      enabled: boolean;
      volume: string;
      placement: string;
    };
  };
  content: {
    sourceFile: string;
    totalSegments: number;
    segments: AudioSegment[];
  };
  optimization: {
    targetFileSize: string;
    offlineCapable: boolean;
    resumePlayback: boolean;
    speedControl: string[];
    quality: string;
  };
}

interface AudioSegment {
  timestamp: string;
  duration: string;
  speaker: string;
  language: 'spanish' | 'english' | 'bilingual';
  tone: string;
  text: string;
  notes?: string;
  emphasis?: string[];
  pace?: string;
}

// ==================== CONFIGURATION ====================

// ES Module compatibility for __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RESOURCES_FILE = path.join(PROJECT_ROOT, 'data', 'resources.ts');
const AUDIO_SPECS_DIR = path.join(PROJECT_ROOT, 'audio-specs');
const GENERATED_RESOURCES_DIR = path.join(PROJECT_ROOT, 'generated-resources');

const VOICE_PROFILES = {
  spanish: {
    speakerType: 'Spanish Narrator',
    accent: 'Neutral Latin American (Colombian or Mexican preferred)',
    gender: 'Male or Female (warm voice)',
    ageRange: '30-45 years',
    tone: 'Warm, encouraging, energetic, professional',
    characteristics: [
      'Clear articulation',
      'Patient and supportive',
      'Culturally appropriate',
      'Professional but friendly',
      'Motivational delivery'
    ]
  },
  english: {
    speakerType: 'English Native Speaker',
    accent: 'Neutral American (General American)',
    gender: 'Male or Female (clear voice)',
    ageRange: '25-40 years',
    tone: 'Clear, professional, friendly',
    characteristics: [
      'Slow and deliberate (80% speed for beginner content)',
      'Excellent enunciation',
      'Natural American pronunciation',
      'Consistent pacing',
      'Patient delivery'
    ]
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse the TypeScript resources file to extract audio resources
 */
function parseResourcesFile(): Resource[] {
  const content = fs.readFileSync(RESOURCES_FILE, 'utf-8');

  // Extract the resources array using regex
  const resourcesMatch = content.match(/export const resources: Resource\[\] = \[([\s\S]*)\];/);
  if (!resourcesMatch) {
    throw new Error('Could not find resources array in resources.ts');
  }

  // Parse the JSON array (safely eval the JavaScript object literal)
  const resourcesString = '[' + resourcesMatch[1] + ']';
  const resources = eval(resourcesString) as Resource[];

  return resources.filter(r => r.type === 'audio');
}

/**
 * Parse audio script file to extract segments
 */
function parseAudioScript(filePath: string): AudioSegment[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Audio script file not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const segments: AudioSegment[] = [];

  // Parse sections using regex patterns
  const sectionPattern = /###?\s*\[([^\]]+)\]\s*(.*?)\n([\s\S]*?)(?=###?\s*\[|$)/g;
  let match;

  while ((match = sectionPattern.exec(content)) !== null) {
    const timestamp = match[1].trim();
    const sectionTitle = match[2].trim();
    const sectionContent = match[3].trim();

    // Extract speaker information
    const speakerMatch = sectionContent.match(/\*\*\[Speaker:\s*([^\]]+)\]\*\*/);
    const toneMatch = sectionContent.match(/\*\*\[Tone:\s*([^\]]+)\]\*\*/);

    // Extract actual spoken text (content within quotes)
    const textMatches = sectionContent.match(/"([^"]+)"/g);
    const spokenText = textMatches ? textMatches.map(t => t.replace(/"/g, '')).join('\n') : '';

    if (spokenText) {
      segments.push({
        timestamp: timestamp,
        duration: calculateDuration(sectionContent),
        speaker: speakerMatch ? speakerMatch[1].trim() : 'Unknown',
        language: detectLanguage(speakerMatch ? speakerMatch[1] : ''),
        tone: toneMatch ? toneMatch[1].trim() : 'neutral',
        text: spokenText,
        notes: sectionTitle,
        emphasis: extractEmphasis(sectionContent),
        pace: extractPace(sectionContent)
      });
    }
  }

  return segments;
}

/**
 * Calculate estimated duration from section content
 */
function calculateDuration(content: string): string {
  const pauseMatches = content.match(/\*\*\[PAUSE?:\s*(\d+)\s*seconds?\]\*\*/gi);
  let totalSeconds = 0;

  if (pauseMatches) {
    pauseMatches.forEach(p => {
      const seconds = p.match(/(\d+)/);
      if (seconds) totalSeconds += parseInt(seconds[1]);
    });
  }

  // Estimate speaking time based on word count
  const words = content.split(/\s+/).length;
  const speakingSeconds = Math.ceil(words / 2.5); // ~150 words per minute / 60 seconds

  return `~${speakingSeconds + totalSeconds}s`;
}

/**
 * Detect language from speaker description
 */
function detectLanguage(speaker: string): 'spanish' | 'english' | 'bilingual' {
  const lower = speaker.toLowerCase();
  if (lower.includes('spanish')) return 'spanish';
  if (lower.includes('english')) return 'english';
  return 'bilingual';
}

/**
 * Extract emphasis points from content
 */
function extractEmphasis(content: string): string[] {
  const emphasis: string[] = [];

  // Look for bolded text or emphasized words
  const boldMatches = content.match(/\*\*([A-Z][A-Z\s]+)\*\*/g);
  if (boldMatches) {
    boldMatches.forEach(m => {
      emphasis.push(m.replace(/\*\*/g, '').trim());
    });
  }

  return emphasis;
}

/**
 * Extract pace information from content
 */
function extractPace(content: string): string {
  if (content.includes('80% speed')) return 'slow (80%)';
  if (content.includes('100% normal speed')) return 'normal (100%)';
  if (content.includes('slow')) return 'slow';
  return 'normal';
}

/**
 * Extract duration estimate from script
 */
function extractDuration(content: string): string {
  const durationMatch = content.match(/\*\*Total Duration\*\*:\s*([^\n]+)/);
  return durationMatch ? durationMatch[1].trim() : 'Unknown';
}

/**
 * Extract target audience from script
 */
function extractTargetAudience(content: string): string {
  const targetMatch = content.match(/\*\*Target\*\*:\s*([^\n]+)/);
  return targetMatch ? targetMatch[1].trim() : 'General audience';
}

/**
 * Generate audio specification for a resource
 */
function generateAudioSpec(resource: Resource): AudioSpec {
  const scriptPath = resource.contentPath || path.join(PROJECT_ROOT, resource.downloadUrl);
  const scriptContent = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf-8') : '';
  const segments = parseAudioScript(scriptPath);

  const spec: AudioSpec = {
    metadata: {
      resourceId: resource.id,
      title: resource.title,
      category: resource.category,
      level: resource.level,
      language: 'Bilingual (Spanish/English)',
      targetAudience: extractTargetAudience(scriptContent),
      estimatedDuration: extractDuration(scriptContent),
      createdAt: new Date().toISOString()
    },
    recording: {
      format: 'MP3',
      bitrate: '128kbps',
      sampleRate: '44.1kHz',
      channels: 'Stereo',
      codec: 'MPEG-1 Audio Layer 3'
    },
    voiceProfile: {
      speakerType: 'Dual speaker (Spanish narrator + English native)',
      accent: 'Neutral American English, Neutral Latin American Spanish',
      gender: 'Male or Female (clear, warm voice)',
      ageRange: '30-45 years',
      tone: 'Warm, encouraging, professional',
      characteristics: [
        'Clear articulation in both languages',
        'Patient and supportive teaching style',
        'Culturally appropriate delivery',
        'Consistent pacing throughout',
        'Motivational and engaging'
      ]
    },
    production: {
      pace: 'Slow for beginners (80% speed for English phrases)',
      baseSpeed: '150 words per minute for Spanish, 120 WPM for English',
      emphasisStyle: 'Natural stress on key vocabulary, clear enunciation',
      pauseGuidelines: {
        betweenPhrases: '3 seconds (for repetition)',
        betweenSections: '2 seconds (for transition)',
        forRepetition: '1.5 seconds (during rapid practice)'
      },
      backgroundMusic: {
        enabled: true,
        volume: '-30dB (subtle, non-intrusive)',
        placement: 'Intro and outro sections only'
      }
    },
    content: {
      sourceFile: resource.downloadUrl,
      totalSegments: segments.length,
      segments: segments
    },
    optimization: {
      targetFileSize: '~7-10MB (optimized for mobile)',
      offlineCapable: true,
      resumePlayback: true,
      speedControl: ['0.75x', '1x', '1.25x', '1.5x'],
      quality: 'High (optimized for speech clarity)'
    }
  };

  return spec;
}

/**
 * Generate summary report of all audio specifications
 */
function generateSummaryReport(specs: AudioSpec[]): string {
  const totalResources = specs.length;
  const byCategory = specs.reduce((acc, spec) => {
    acc[spec.metadata.category] = (acc[spec.metadata.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byLevel = specs.reduce((acc, spec) => {
    acc[spec.metadata.level] = (acc[spec.metadata.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalDuration = specs.reduce((sum, spec) => {
    const duration = spec.metadata.estimatedDuration;
    const match = duration.match(/(\d+):(\d+)/);
    if (match) {
      return sum + parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return sum;
  }, 0);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return `# Audio Recording Specifications Summary

Generated: ${new Date().toISOString()}

## Overview

- **Total Audio Resources**: ${totalResources}
- **Total Recording Time**: ${hours}h ${minutes}m
- **Average Duration**: ${Math.floor(totalDuration / totalResources / 60)}m ${(totalDuration / totalResources % 60).toFixed(0)}s

## Breakdown by Category

${Object.entries(byCategory).map(([cat, count]) => `- **${cat}**: ${count} resources`).join('\n')}

## Breakdown by Level

${Object.entries(byLevel).map(([level, count]) => `- **${level}**: ${count} resources`).join('\n')}

## Recording Specifications

### Format
- **Audio Format**: MP3 (MPEG-1 Audio Layer 3)
- **Bitrate**: 128kbps
- **Sample Rate**: 44.1kHz
- **Channels**: Stereo
- **Target File Size**: 7-10MB per resource

### Voice Requirements

#### Spanish Narrator
- **Accent**: Neutral Latin American (Colombian or Mexican preferred)
- **Tone**: Warm, encouraging, energetic
- **Age Range**: 30-45 years sound
- **Characteristics**: Clear articulation, patient, motivational

#### English Speaker
- **Accent**: Neutral American (General American)
- **Tone**: Clear, professional, friendly
- **Speed**: 80% for beginner content, 100% for practice sections
- **Characteristics**: Excellent enunciation, natural pronunciation

### Production Guidelines

1. **Pace**: Slow and deliberate for beginners (80% speed)
2. **Pauses**:
   - 3 seconds between phrases (for learner repetition)
   - 2 seconds between sections (for transitions)
   - 1.5 seconds during rapid practice
3. **Background Music**: Soft ambient (-30dB) in intro/outro only
4. **Quality Control**: Each phrase recorded twice at same speed

### Optimization

- **Mobile Optimized**: Files compressed for mobile download
- **Offline Capable**: Full download support
- **Resume Playback**: Bookmarking enabled
- **Speed Control**: 0.75x, 1x, 1.25x, 1.5x playback speeds

## Resources

${specs.map((spec, idx) => `${idx + 1}. **${spec.metadata.title}** (ID: ${spec.metadata.resourceId})
   - Category: ${spec.metadata.category}
   - Level: ${spec.metadata.level}
   - Duration: ${spec.metadata.estimatedDuration}
   - Segments: ${spec.content.totalSegments}
   - Spec File: \`audio-specs/resource-${spec.metadata.resourceId}-spec.json\``).join('\n\n')}

## Next Steps

1. Review individual specification files in \`audio-specs/\`
2. Hire voice talent matching profile requirements
3. Record in professional studio or quiet environment
4. Follow timing and pause guidelines exactly
5. Export as MP3 128kbps 44.1kHz stereo
6. Test on mobile devices before deployment
7. Upload to content delivery system

---

**Generated by**: generate-audio-specs.ts
**Last Updated**: ${new Date().toLocaleDateString()}
`;
}

// ==================== MAIN EXECUTION ====================

function main() {
  console.log('🎤 Audio Specification Generator');
  console.log('================================\n');

  // Create audio-specs directory
  if (!fs.existsSync(AUDIO_SPECS_DIR)) {
    fs.mkdirSync(AUDIO_SPECS_DIR, { recursive: true });
    console.log('✅ Created audio-specs directory');
  }

  // Parse resources file
  console.log('📖 Parsing resources file...');
  const audioResources = parseResourcesFile();
  console.log(`✅ Found ${audioResources.length} audio resources\n`);

  // Generate specifications
  console.log('🎵 Generating audio specifications...\n');
  const specs: AudioSpec[] = [];

  audioResources.forEach((resource, idx) => {
    console.log(`[${idx + 1}/${audioResources.length}] Processing: ${resource.title}`);

    try {
      const spec = generateAudioSpec(resource);
      specs.push(spec);

      // Write individual spec file
      const specFileName = `resource-${resource.id}-spec.json`;
      const specFilePath = path.join(AUDIO_SPECS_DIR, specFileName);
      fs.writeFileSync(specFilePath, JSON.stringify(spec, null, 2));

      console.log(`   ✅ Generated: ${specFileName}`);
      console.log(`   📊 Segments: ${spec.content.totalSegments}`);
      console.log(`   ⏱️  Duration: ${spec.metadata.estimatedDuration}\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  });

  // Generate summary report
  console.log('📋 Generating summary report...');
  const summary = generateSummaryReport(specs);
  const summaryPath = path.join(AUDIO_SPECS_DIR, 'RECORDING-SUMMARY.md');
  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ Summary saved to: ${summaryPath}\n`);

  // Generate recording instructions
  console.log('📝 Generating recording instructions...');
  const instructions = generateRecordingInstructions();
  const instructionsPath = path.join(AUDIO_SPECS_DIR, 'README.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`✅ Instructions saved to: ${instructionsPath}\n`);

  // Final summary
  console.log('✨ Generation Complete!');
  console.log('======================\n');
  console.log(`📁 Output Directory: ${AUDIO_SPECS_DIR}`);
  console.log(`📊 Specifications Generated: ${specs.length}`);
  console.log(`📄 Summary Report: RECORDING-SUMMARY.md`);
  console.log(`📖 Instructions: README.md\n`);
}

function generateRecordingInstructions(): string {
  return `# Audio Recording Instructions

This directory contains detailed specifications for recording audio content for the Hablas language learning app.

## Quick Start

1. **Review Files**:
   - \`RECORDING-SUMMARY.md\` - Overview of all audio resources
   - \`resource-[ID]-spec.json\` - Individual recording specifications

2. **Voice Talent Requirements**:
   - Spanish Narrator: Neutral Latin American accent (Colombian/Mexican)
   - English Speaker: Neutral American accent (General American)
   - Age Range: 30-45 years (mature, professional sound)
   - Tone: Warm, encouraging, patient, professional

3. **Recording Setup**:
   - Professional studio or treated room
   - Pop filter and shock mount required
   - Minimal background noise (<-60dB)
   - Consistent microphone position

## Technical Specifications

### Audio Format
\`\`\`
Format: MP3
Codec: MPEG-1 Audio Layer 3
Bitrate: 128kbps (CBR - Constant Bit Rate)
Sample Rate: 44.1kHz
Channels: Stereo
Target File Size: 7-10MB per resource
\`\`\`

### Recording Quality
- **Microphone**: Large diaphragm condenser or broadcast quality
- **Preamp**: Clean, low noise (<-120dB EIN)
- **Recording Level**: Peak at -6dB to -3dB (leave headroom)
- **Room Treatment**: Minimal reverb/echo
- **Monitoring**: Studio monitors or high-quality headphones

## Production Guidelines

### 1. Pacing

**Spanish Narrator**:
- Base speed: 150 words per minute
- Clear articulation with natural rhythm
- Warm, conversational delivery

**English Speaker**:
- Beginner sections: 120 WPM (80% of normal speed)
- Practice sections: 150 WPM (normal speed)
- Deliberate enunciation
- Natural American pronunciation patterns

### 2. Pauses (CRITICAL)

These pauses are essential for learning retention:

- **Between English phrases**: 3 seconds (learner repetition time)
- **Between sections**: 2 seconds (mental transition)
- **During rapid practice**: 1.5 seconds (quick recall)
- **Before/after emphasis**: 0.5 seconds (attention marker)

### 3. Emphasis and Tone

**Tone Markers**:
- \`[Warm]\` - Friendly, encouraging delivery
- \`[Professional]\` - Clear, business-like tone
- \`[Energetic]\` - Upbeat, motivational
- \`[Calm]\` - Soothing, patient delivery

**Emphasis Points**:
- Key vocabulary words: Slightly louder, clear
- Action phrases: Confident delivery
- Safety information: Serious, clear tone

### 4. Background Music

**Placement**: Intro and outro sections ONLY
**Volume**: -30dB (very subtle, non-intrusive)
**Style**: Soft ambient, minimal instrumentation
**Fade**: 2-second fade in/out
**Purpose**: Enhance professionalism, not distract

## Recording Workflow

### Pre-Production

1. **Script Review**: Read entire script 3 times before recording
2. **Pronunciation Check**: Verify all English phrases with native speaker
3. **Timing Run**: Perform timed read-through
4. **Microphone Check**: Test levels, eliminate plosives

### Recording Session

1. **Warm-up**: 5-10 minutes vocal warm-up exercises
2. **Record in Sections**: Follow JSON segment structure
3. **Multiple Takes**: Record 2-3 takes per segment, select best
4. **Maintain Energy**: Take breaks every 15-20 minutes
5. **Consistency**: Monitor tone and pace throughout

### Post-Production

1. **Edit**: Select best takes, remove mistakes
2. **Timing**: Verify pause durations match specifications
3. **Normalize**: Peak at -1dB to -0.5dB
4. **EQ**: Light high-pass filter (<80Hz), de-ess if needed
5. **Compress**: Gentle compression (3:1 ratio, -15dB threshold)
6. **Background Music**: Add to intro/outro at -30dB
7. **Export**: MP3 128kbps 44.1kHz stereo
8. **Quality Check**: Listen on multiple devices (phone, headphones, car)

## File Naming Convention

\`\`\`
hablas-audio-[resourceID]-[category]-[level].mp3
\`\`\`

**Examples**:
- \`hablas-audio-002-repartidor-basico.mp3\`
- \`hablas-audio-013-conductor-basico.mp3\`
- \`hablas-audio-021-all-basico.mp3\`

## Quality Assurance Checklist

- [ ] All pauses match specification timings
- [ ] English phrases recorded at correct speed (80% or 100%)
- [ ] Spanish narration is clear and warm
- [ ] Background music only in intro/outro
- [ ] No clipping or distortion
- [ ] Consistent volume throughout
- [ ] File format matches specifications (MP3 128kbps)
- [ ] File size within target range (7-10MB)
- [ ] Tested on mobile device
- [ ] Duration matches estimate (±30 seconds acceptable)

## Delivery Format

Submit recordings as:
1. **MP3 File**: Final production-ready audio
2. **Metadata**: Resource ID, duration, file size
3. **Notes**: Any deviations from specifications

## Contact

For questions or clarifications about audio specifications:
- Review individual JSON spec files for detailed segment information
- Check \`RECORDING-SUMMARY.md\` for overview
- Refer to source scripts in \`generated-resources/50-batch/\`

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Generator**: generate-audio-specs.ts
`;
}

// Run the script
// Check if this is the main module being executed
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  try {
    main();
  } catch (error) {
    console.error('❌ Fatal Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

export { generateAudioSpec, parseAudioScript };
export type { AudioSpec, AudioSegment };
