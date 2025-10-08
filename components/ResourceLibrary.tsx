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
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Recursos de Aprendizaje</h2>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay recursos disponibles con estos filtros
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">💡 Consejo</h3>
        <p className="text-sm">
          Descarga los recursos cuando tengas WiFi para usarlos sin gastar datos mientras trabajas.
          Los archivos marcados con 📱 funcionan sin conexión.
        </p>
      </div>
    </section>
  )
}