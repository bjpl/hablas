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
  // Remove box drawing characters and pipe separators
  return text
    .replace(/┌[─]+┐/g, '')  // Remove top borders
    .replace(/└[─]+┘/g, '')  // Remove bottom borders
    .replace(/^│\s*/gm, '')  // Remove left borders
    .replace(/\s*│$/gm, '')  // Remove right borders
    .replace(/^[─]+$/gm, '') // Remove horizontal lines
    .trim()
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

      // Clean box characters at build time so static HTML is clean
      contentText = cleanBoxCharacters(rawContent)
    } catch (error) {
      console.error(`Error loading content for resource ${resourceId}:`, error)
      contentText = ''
    }
  }

  return <ResourceDetail id={id} initialContent={contentText} />
}
