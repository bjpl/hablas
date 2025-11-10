'use client'

import Link from 'next/link'
import type { Resource } from '../data/resources'

interface ResourceCardProps {
  resource: Resource
  isDownloaded: boolean
  onDownload: () => void
}

export default function ResourceCard({ resource, isDownloaded, onDownload }: ResourceCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'audio':
        return '🎧'
      case 'image':
        return '🖼️'
      case 'video':
        return '📹'
      default:
        return '📎'
    }
  }

  const getTagColor = (tag: string) => {
    if (tag.includes('Rappi')) return 'tag-rappi'
    if (tag.includes('Uber')) return 'tag-uber'
    if (tag.includes('DiDi')) return 'tag-didi'
    if (tag.includes('Básico')) return 'tag-basico'
    if (tag.includes('Intermedio')) return 'tag-intermedio'
    if (tag.includes('Avanzado')) return 'tag-avanzado'
    return 'bg-gray-100 text-gray-700'
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Mira este recurso de inglés: ${resource.description}`,
        url: window.location.href
      })
    }
  }

  const handleDownloadClick = () => {
    const link = document.createElement('a')
    link.href = resource.downloadUrl
    link.download = resource.title
    link.click()
    onDownload()
  }

  return (
    <article className="card-resource flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl" aria-hidden="true">
          {getTypeIcon(resource.type)}
        </span>
        {resource.offline && (
          <span className="text-xs tag-offline">
            Offline
          </span>
        )}
      </div>

      <Link href={`/recursos/${resource.id}`} aria-label={`Ver detalles de ${resource.title}`}>
        <h3 className="font-bold text-xl mb-3 hover:text-accent-blue transition-colors duration-200 cursor-pointer line-clamp-2 leading-tight">
          {resource.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed">{resource.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag, index) => (
          <span key={index} className={`tag-job ${getTagColor(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-4 font-medium" aria-label={`Tamaño del archivo: ${resource.size}`}>
        {resource.size}
      </div>

      <div className="mt-auto">
        <Link href={`/recursos/${resource.id}`} className="block">
          <button
            className="w-full py-3 px-4 rounded font-semibold bg-accent-blue text-white hover:bg-blue-700 transition-colors"
            aria-label={`Ver detalles del recurso ${resource.title}`}
          >
            Ver recurso
          </button>
        </Link>
      </div>
    </article>
  )
}