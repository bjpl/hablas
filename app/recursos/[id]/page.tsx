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

// Server component wrapper - load content at build time
export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  let contentText = ''

  if (resource) {
    try {
      // Read content file at build time from public directory
      const publicPath = path.join(process.cwd(), 'public', resource.downloadUrl)
      contentText = fs.readFileSync(publicPath, 'utf-8')
    } catch (error) {
      console.error(`Error loading content for resource ${resourceId}:`, error)
      contentText = ''
    }
  }

  return <ResourceDetail id={id} initialContent={contentText} />
}
