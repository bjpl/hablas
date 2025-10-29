'use client'

import { useState } from 'react'
import ResourceCard from './ResourceCard'
import { resources, type Resource } from '../data/resources'

interface ResourceLibraryProps {
  category: 'all' | 'repartidor' | 'conductor'
  level: 'all' | 'basico' | 'intermedio'
  searchQuery?: string
}


export default function ResourceLibrary({ category, level, searchQuery = '' }: ResourceLibraryProps) {
  const [downloadedResources, setDownloadedResources] = useState<number[]>([])

  const filteredResources = resources.filter(resource => {
    const categoryMatch = category === 'all' || resource.category === category || resource.category === 'all'
    const levelMatch = level === 'all' || resource.level === level

    // Search query matching
    let searchMatch = true
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const searchableText = [
        resource.title,
        resource.description,
        ...resource.tags,
        resource.category,
        resource.level,
        resource.type
      ].join(' ').toLowerCase()

      searchMatch = searchableText.includes(query)
    }

    return categoryMatch && levelMatch && searchMatch
  })

  const handleDownload = (resourceId: number) => {
    setDownloadedResources(prev => [...prev, resourceId])
  }

  return (
    <section className="mb-8" aria-labelledby="resources-heading">
      <h2 id="resources-heading" className="text-2xl font-bold mb-6">Recursos de Aprendizaje</h2>

      {/* Screen reader announcement for filtered results */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {filteredResources.length === 0
          ? 'No hay recursos disponibles con estos filtros'
          : `${filteredResources.length} ${filteredResources.length === 1 ? 'recurso encontrado' : 'recursos encontrados'}`}
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-8 text-gray-600" role="alert">
          No hay recursos disponibles con estos filtros. Intenta ajustar los filtros o la búsqueda.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Lista de recursos de aprendizaje">
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isDownloaded={downloadedResources.includes(resource.id)}
              onDownload={() => handleDownload(resource.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200" role="complementary" aria-label="Consejo sobre descarga de recursos">
        <h3 className="font-bold mb-2 text-gray-900">Consejo</h3>
        <p className="text-sm text-gray-700">
          Descarga los recursos cuando tengas WiFi para usarlos sin gastar datos mientras trabajas.
          Los archivos marcados con <strong>Offline</strong> funcionan sin conexión.
        </p>
      </div>
    </section>
  )
}