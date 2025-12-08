import { resources, isResourceHidden, visibleResources } from '@/data/resources'
import ResourceDetail from './ResourceDetail'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { transformAudioScriptToUserFormat, isAudioProductionScript } from './transform-audio-script'
import { createLogger } from '@/lib/utils/logger'

const resourcePageLogger = createLogger('ResourceDetailPage')

// Generate static paths only for VISIBLE resources at build time
export async function generateStaticParams() {
  return visibleResources.map((resource) => ({
    id: resource.id.toString(),
  }))
}

// Metadata for SEO (Next.js 15 async params)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  if (!resource) {
    return {
      title: 'Recurso no encontrado | Hablas',
    }
  }

  return {
    title: `${resource.title} | Hablas`,
    description: resource.description,
  }
}

// Helper: Clean box-drawing characters from content at build time
function cleanBoxCharacters(text: string): string {
  // Remove ALL box-drawing characters globally
  return text
    .replace(/[┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬]/g, '')  // Remove all box chars
    .split('\n')
    .map(line => line.trim())  // Trim each line
    .join('\n')  // Preserve line breaks
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
}

// Helper: Clean audio script formatting - remove production metadata
function cleanAudioScript(text: string): string {
  let cleaned = text;

  // Remove all production metadata and instructions
  cleaned = cleaned.replace(/\*\*\[Tone:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\*\*\[Speaker:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\*\*\[PAUSE:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\[Pause:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Sound effect:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Speaker:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Tone:.*?\]/gi, '');

  // Remove timestamp headers but keep section structure
  cleaned = cleaned.replace(/###\s*\[[\d:]+\]\s*/g, '### ');
  cleaned = cleaned.replace(/##\s*\[[\d:]+\s*-\s*[\d:]+\]\s*/g, '## ');

  // Remove production duration/metadata from header
  cleaned = cleaned.replace(/\*\*Total Duration\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/\*\*Target\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/\*\*Language\*\*:.*?\n/gi, '');

  // Convert quoted speech to blockquotes
  cleaned = cleaned.replace(/"([^"]+)"/g, (match, quote) => {
    if (quote.length < 5) return match;
    return `\n> ${quote}\n`;
  });

  // Clean up section dividers
  cleaned = cleaned.replace(/---+\n*/g, '\n\n');

  // Remove excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Clean up whitespace around blockquotes
  cleaned = cleaned.replace(/\n+>/g, '\n\n>');
  cleaned = cleaned.replace(/>\s+\n+/g, '>\n\n');

  return cleaned.trim();
}

// Server component wrapper - load and clean content at build time
export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resourceId = parseInt(id)

  // Redirect hidden resources to home page (pending review)
  if (isResourceHidden(resourceId)) {
    redirect('/')
  }

  const resource = resources.find(r => r.id === resourceId)

  let contentText = ''

  if (resource) {
    try {
      // Read content file at build time from public directory
      const publicPath = path.join(process.cwd(), 'public', resource.downloadUrl)
      const rawContent = fs.readFileSync(publicPath, 'utf-8')

      // Clean content based on resource type
      if (resource.type === 'audio') {
        // Audio scripts: Check if it's a production script and transform it
        if (isAudioProductionScript(rawContent)) {
          contentText = transformAudioScriptToUserFormat(rawContent)
        } else {
          // Fallback to basic cleaning for non-production audio content
          contentText = cleanAudioScript(rawContent)
        }
      } else {
        // Other resources just need box characters removed
        contentText = cleanBoxCharacters(rawContent)
      }
    } catch (error) {
      resourcePageLogger.error(`Error loading content for resource ${resourceId}`, error as Error)
      contentText = ''
    }
  }

  return <ResourceDetail id={id} initialContent={contentText} />
}
