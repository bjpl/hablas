/**
 * Resource data definitions for the Hablas English learning platform
 * @fileoverview Contains typed resource data for offline English learning materials
 * targeted at Spanish-speaking delivery and rideshare drivers.
 */

/**
 * Represents a learning resource available in the platform
 */
export interface Resource {
  /** Unique identifier for the resource */
  id: number
  /** Display title of the resource */
  title: string
  /** Brief description of what the resource contains */
  description: string
  /** File type of the resource */
  type: 'pdf' | 'audio' | 'image' | 'video'
  /** Target job category for the resource */
  category: 'all' | 'repartidor' | 'conductor'
  /** English proficiency level required */
  level: 'basico' | 'intermedio' | 'avanzado'
  /** File size as a human-readable string */
  size: string
  /** URL path to download the resource */
  downloadUrl: string
  /** Array of tags for categorization and filtering */
  tags: readonly string[] | string[]
  /** Whether the resource can be used offline */
  offline: boolean
}

/**
 * Learning resources for Spanish-speaking gig workers
 *
 * This collection includes resources specifically designed for:
 * - Delivery drivers (repartidores) working with apps like Rappi
 * - Rideshare drivers (conductores) working with apps like Uber and DiDi
 * - General phrases and vocabulary useful for both categories
 *
 * Resources are categorized by:
 * - Job type: 'all', 'repartidor', 'conductor'
 * - English level: 'basico', 'intermedio', 'avanzado'
 * - Content type: PDF guides, audio pronunciation, images, videos
 * - Offline capability for use without internet connection
 */
export const resources: Resource[] = [
  {
    id: 1,
    title: 'Frases para Entregas',
    description: 'Las 50 frases más importantes para domiciliarios',
    type: 'pdf',
    category: 'repartidor',
    level: 'basico',
    size: '1.2 MB',
    downloadUrl: '/resources/delivery-phrases.pdf',
    tags: ['Rappi', 'Entregas', 'Básico'],
    offline: true
  },
  {
    id: 2,
    title: 'Saludos y Despedidas',
    description: 'Cómo saludar a clientes en inglés con audio',
    type: 'audio',
    category: 'all',
    level: 'basico',
    size: '3.5 MB',
    downloadUrl: '/resources/greetings.mp3',
    tags: ['Audio', 'Pronunciación'],
    offline: true
  },
  {
    id: 3,
    title: 'Direcciones en Inglés',
    description: 'Entender direcciones y navegación GPS',
    type: 'pdf',
    category: 'conductor',
    level: 'basico',
    size: '800 KB',
    downloadUrl: '/resources/directions.pdf',
    tags: ['Uber', 'DiDi', 'GPS'],
    offline: true
  },
  {
    id: 4,
    title: 'Manejo de Quejas',
    description: 'Frases para resolver problemas con clientes',
    type: 'pdf',
    category: 'all',
    level: 'intermedio',
    size: '1.5 MB',
    downloadUrl: '/resources/complaints.pdf',
    tags: ['Servicio', 'Intermedio'],
    offline: true
  },
  {
    id: 5,
    title: 'Vocabulario Apps',
    description: 'Palabras de Uber, Rappi, DiDi con imágenes',
    type: 'image',
    category: 'all',
    level: 'basico',
    size: '2.1 MB',
    downloadUrl: '/resources/app-vocabulary.pdf',
    tags: ['Visual', 'Apps'],
    offline: true
  },
  {
    id: 6,
    title: 'Conversación con Pasajeros',
    description: 'Small talk básico para conductores',
    type: 'audio',
    category: 'conductor',
    level: 'intermedio',
    size: '4.2 MB',
    downloadUrl: '/resources/small-talk.mp3',
    tags: ['Uber', 'Conversación'],
    offline: false
  }
]