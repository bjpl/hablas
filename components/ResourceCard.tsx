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
        <span className="text-3xl transition-transform hover:scale-110 duration-200" aria-hidden="true">
          {getTypeIcon(resource.type)}
        </span>
        {resource.offline && (
          <span className="text-xs tag-offline">
            <span aria-hidden="true">📱</span> Offline
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
        📦 {resource.size}
      </div>

      <div className="flex gap-2 mt-auto">
        <Link href={`/recursos/${resource.id}`} className="flex-1">
          <button
            className="w-full py-3 px-4 rounded-lg font-semibold bg-accent-blue text-white hover:bg-opacity-90 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            aria-label={`Ver detalles del recurso ${resource.title}`}
          >
            Ver recurso
          </button>
        </Link>
        <button
          onClick={handleDownloadClick}
          className={`p-3 rounded-lg font-medium transition-all duration-200 min-w-touch min-h-touch transform hover:-translate-y-0.5 ${
            isDownloaded
              ? 'bg-accent-green bg-opacity-20 text-accent-green hover:bg-opacity-30'
              : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
          }`}
          aria-label={isDownloaded ? `${resource.title} ya descargado` : `Descargar ${resource.title}`}
          title={isDownloaded ? 'Ya descargado' : 'Descargar'}
        >
          <span aria-hidden="true" className="text-xl">{isDownloaded ? '✓' : '📥'}</span>
        </button>
        <button
          onClick={handleShare}
          className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 hover:shadow-md transition-all duration-200 min-w-touch min-h-touch transform hover:-translate-y-0.5"
          aria-label={`Compartir ${resource.title}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
            <title>Compartir</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-4.732 2.684m4.732-2.684a3 3 0 00-4.732-2.684M6.316 10.658a3 3 0 10-4.732-2.684"/>
          </svg>
        </button>
      </div>
    </article>
  )
}