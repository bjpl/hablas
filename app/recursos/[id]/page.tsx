import { resources } from '@/data/resources'
import ResourceDetail from './ResourceDetail'
import fs from 'fs'
import path from 'path'

// Generate static paths for all resources at build time (server component)
export async function generateStaticParams() {
  return resources.map((resource) => ({
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

// Helper: Clean audio script formatting (keep structure, remove only noise)
function cleanAudioScript(text: string): string {
  // Don't filter anything - let the BilingualDialogueFormatter handle display
  // Just do basic cleanup
  return text
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
}

// Server component wrapper - load and clean content at build time
export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  let contentText = ''

  if (resource) {
    try {
      // Read content file at build time from public directory
      const publicPath = path.join(process.cwd(), 'public', resource.downloadUrl)
      const rawContent = fs.readFileSync(publicPath, 'utf-8')

      // Clean content based on resource type
      if (resource.type === 'audio') {
        // Audio scripts need special cleaning to remove production directions
        contentText = cleanAudioScript(rawContent)
      } else {
        // Other resources just need box characters removed
        contentText = cleanBoxCharacters(rawContent)
      }
    } catch (error) {
      console.error(`Error loading content for resource ${resourceId}:`, error)
      contentText = ''
    }
  }

  return <ResourceDetail id={id} initialContent={contentText} />
}
