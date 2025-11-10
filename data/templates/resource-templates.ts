/**
 * Comprehensive Resource Templates for Hablas Platform
 * @fileoverview Extensive templates and examples for creating learning resources
 * for Spanish-speaking delivery and rideshare drivers
 *
 * USAGE:
 * 1. Copy template matching your resource type
 * 2. Fill in all required fields
 * 3. Validate using resourceSchema
 * 4. Add to resources array in data/resources.ts
 */

import type { Resource } from '../resources'

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

/**
 * DELIVERY DRIVER TEMPLATES (Repartidor)
 * For: Rappi, Uber Eats, DoorDash drivers
 * Focus: Customer interaction, delivery phrases, navigation
 */

export const DELIVERY_TEMPLATES = {
  // Basic Level - Essential phrases for beginners
  basic_phrases: {
    id: 0, // AUTO: Increment from last resource
    title: 'Frases Esenciales para Entregas',
    description: 'Las 30 frases más importantes para domiciliarios principiantes',
    type: 'pdf' as const,
    category: 'repartidor' as const,
    level: 'basico' as const,
    size: '1.0 MB',
    downloadUrl: '/resources/delivery/basic-phrases.pdf',
    tags: ['Rappi', 'Entregas', 'Básico', 'Frases'],
    offline: true
  },

  basic_audio: {
    id: 0,
    title: 'Pronunciación: Entregas',
    description: 'Audio de frases básicas para domiciliarios con pronunciación clara',
    type: 'audio' as const,
    category: 'repartidor' as const,
    level: 'basico' as const,
    size: '2.5 MB',
    downloadUrl: '/resources/delivery/basic-pronunciation.mp3',
    tags: ['Audio', 'Pronunciación', 'Rappi', 'Básico'],
    offline: true
  },

  basic_visual: {
    id: 0,
    title: 'Guía Visual: Entregas',
    description: 'Imágenes con frases comunes en situaciones de entrega',
    type: 'image' as const,
    category: 'repartidor' as const,
    level: 'basico' as const,
    size: '3.2 MB',
    downloadUrl: '/resources/delivery/visual-guide.pdf',
    tags: ['Visual', 'Entregas', 'Básico', 'Imágenes'],
    offline: true
  },

  // Intermediate Level - More complex interactions
  intermediate_situations: {
    id: 0,
    title: 'Situaciones Complejas en Entregas',
    description: 'Cómo manejar problemas: pedidos incorrectos, direcciones confusas, etc.',
    type: 'pdf' as const,
    category: 'repartidor' as const,
    level: 'intermedio' as const,
    size: '1.8 MB',
    downloadUrl: '/resources/delivery/complex-situations.pdf',
    tags: ['Intermedio', 'Problemas', 'Entregas'],
    offline: true
  },

  intermediate_conversations: {
    id: 0,
    title: 'Conversaciones con Clientes',
    description: 'Diálogos completos para diferentes escenarios de entrega',
    type: 'audio' as const,
    category: 'repartidor' as const,
    level: 'intermedio' as const,
    size: '5.4 MB',
    downloadUrl: '/resources/delivery/conversations.mp3',
    tags: ['Audio', 'Conversación', 'Intermedio'],
    offline: true
  },

  // Advanced Level - Professional communication
  advanced_professional: {
    id: 0,
    title: 'Inglés Profesional para Domiciliarios',
    description: 'Comunicación avanzada, resolución de conflictos y servicio premium',
    type: 'pdf' as const,
    category: 'repartidor' as const,
    level: 'avanzado' as const,
    size: '2.3 MB',
    downloadUrl: '/resources/delivery/professional.pdf',
    tags: ['Avanzado', 'Profesional', 'Servicio'],
    offline: true
  },

  advanced_video: {
    id: 0,
    title: 'Video: Entregas en Inglés',
    description: 'Video tutorial con situaciones reales de entrega en inglés',
    type: 'video' as const,
    category: 'repartidor' as const,
    level: 'avanzado' as const,
    size: '45 MB',
    downloadUrl: '/resources/delivery/tutorial-video.mp4',
    tags: ['Video', 'Tutorial', 'Avanzado'],
    offline: false // Video too large for offline
  }
} as const

/**
 * RIDESHARE DRIVER TEMPLATES (Conductor)
 * For: Uber, Lyft, DiDi drivers
 * Focus: Passenger interaction, navigation, small talk
 */

export const RIDESHARE_TEMPLATES = {
  // Basic Level
  basic_greetings: {
    id: 0,
    title: 'Saludos y Confirmación de Pasajeros',
    description: 'Frases para saludar y confirmar la identidad del pasajero',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'basico' as const,
    size: '900 KB',
    downloadUrl: '/resources/rideshare/greetings.pdf',
    tags: ['Uber', 'DiDi', 'Básico', 'Saludos'],
    offline: true
  },

  basic_directions: {
    id: 0,
    title: 'Direcciones y Navegación GPS',
    description: 'Entender direcciones en inglés y vocabulario de GPS',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'basico' as const,
    size: '1.1 MB',
    downloadUrl: '/resources/rideshare/directions.pdf',
    tags: ['GPS', 'Navegación', 'Básico'],
    offline: true
  },

  basic_audio_navigation: {
    id: 0,
    title: 'Audio: Direcciones en Inglés',
    description: 'Pronunciación de términos de navegación y direcciones comunes',
    type: 'audio' as const,
    category: 'conductor' as const,
    level: 'basico' as const,
    size: '3.8 MB',
    downloadUrl: '/resources/rideshare/directions-audio.mp3',
    tags: ['Audio', 'GPS', 'Básico'],
    offline: true
  },

  // Intermediate Level
  intermediate_smalltalk: {
    id: 0,
    title: 'Small Talk con Pasajeros',
    description: 'Conversación ligera sobre clima, tráfico y la ciudad',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'intermedio' as const,
    size: '1.4 MB',
    downloadUrl: '/resources/rideshare/small-talk.pdf',
    tags: ['Conversación', 'Uber', 'Intermedio'],
    offline: true
  },

  intermediate_audio_conversations: {
    id: 0,
    title: 'Diálogos Reales con Pasajeros',
    description: 'Audio de conversaciones típicas durante viajes',
    type: 'audio' as const,
    category: 'conductor' as const,
    level: 'intermedio' as const,
    size: '6.2 MB',
    downloadUrl: '/resources/rideshare/conversations-audio.mp3',
    tags: ['Audio', 'Conversación', 'Intermedio'],
    offline: true
  },

  intermediate_problems: {
    id: 0,
    title: 'Manejo de Situaciones Difíciles',
    description: 'Cómo manejar cancelaciones, quejas y problemas con pasajeros',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'intermedio' as const,
    size: '1.9 MB',
    downloadUrl: '/resources/rideshare/difficult-situations.pdf',
    tags: ['Problemas', 'Servicio', 'Intermedio'],
    offline: true
  },

  // Advanced Level
  advanced_professional_service: {
    id: 0,
    title: 'Servicio Premium y Profesional',
    description: 'Inglés avanzado para Uber Black, viajes corporativos y aeropuerto',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'avanzado' as const,
    size: '2.7 MB',
    downloadUrl: '/resources/rideshare/premium-service.pdf',
    tags: ['Avanzado', 'Profesional', 'Uber Black'],
    offline: true
  },

  advanced_cultural: {
    id: 0,
    title: 'Diferencias Culturales y Etiqueta',
    description: 'Entender costumbres estadounidenses y comunicación intercultural',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'avanzado' as const,
    size: '2.1 MB',
    downloadUrl: '/resources/rideshare/cultural-guide.pdf',
    tags: ['Avanzado', 'Cultura', 'Etiqueta'],
    offline: true
  },

  advanced_video_training: {
    id: 0,
    title: 'Video: Conversaciones Avanzadas',
    description: 'Roleplay de situaciones complejas con pasajeros en inglés',
    type: 'video' as const,
    category: 'conductor' as const,
    level: 'avanzado' as const,
    size: '38 MB',
    downloadUrl: '/resources/rideshare/advanced-video.mp4',
    tags: ['Video', 'Avanzado', 'Roleplay'],
    offline: false
  }
} as const

/**
 * UNIVERSAL TEMPLATES (All Categories)
 * Resources useful for both delivery drivers and rideshare drivers
 */

export const UNIVERSAL_TEMPLATES = {
  // Basic Level
  basic_greetings_all: {
    id: 0,
    title: 'Saludos Básicos en Inglés',
    description: 'Hola, buenos días, buenas tardes - lo esencial para cualquier trabajo',
    type: 'audio' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '2.1 MB',
    downloadUrl: '/resources/universal/basic-greetings.mp3',
    tags: ['Audio', 'Básico', 'Saludos'],
    offline: true
  },

  basic_numbers: {
    id: 0,
    title: 'Números y Direcciones',
    description: 'Números, direcciones y referencias geográficas en inglés',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '1.3 MB',
    downloadUrl: '/resources/universal/numbers-addresses.pdf',
    tags: ['Básico', 'Números', 'Direcciones'],
    offline: true
  },

  basic_time: {
    id: 0,
    title: 'Tiempo y Horarios',
    description: 'Cómo decir la hora, hablar de tiempo de espera y duraciones',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '800 KB',
    downloadUrl: '/resources/universal/time-schedules.pdf',
    tags: ['Básico', 'Tiempo', 'Horarios'],
    offline: true
  },

  basic_app_vocabulary: {
    id: 0,
    title: 'Vocabulario de Apps (Uber, Rappi, DiDi)',
    description: 'Términos en inglés que aparecen en apps de trabajo con imágenes',
    type: 'image' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '4.5 MB',
    downloadUrl: '/resources/universal/app-vocabulary.pdf',
    tags: ['Visual', 'Apps', 'Básico', 'Uber', 'Rappi', 'DiDi'],
    offline: true
  },

  // Intermediate Level
  intermediate_customer_service: {
    id: 0,
    title: 'Servicio al Cliente en Inglés',
    description: 'Frases profesionales para brindar excelente servicio',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'intermedio' as const,
    size: '1.7 MB',
    downloadUrl: '/resources/universal/customer-service.pdf',
    tags: ['Intermedio', 'Servicio', 'Profesional'],
    offline: true
  },

  intermediate_complaints: {
    id: 0,
    title: 'Manejo de Quejas y Problemas',
    description: 'Cómo resolver conflictos y mantener la calma en situaciones difíciles',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'intermedio' as const,
    size: '2.0 MB',
    downloadUrl: '/resources/universal/complaints-handling.pdf',
    tags: ['Intermedio', 'Quejas', 'Resolución'],
    offline: true
  },

  intermediate_audio_scenarios: {
    id: 0,
    title: 'Escenarios Comunes en Audio',
    description: 'Situaciones reales con audio y transcripción',
    type: 'audio' as const,
    category: 'all' as const,
    level: 'intermedio' as const,
    size: '7.8 MB',
    downloadUrl: '/resources/universal/common-scenarios.mp3',
    tags: ['Audio', 'Intermedio', 'Escenarios'],
    offline: true
  },

  intermediate_weather_traffic: {
    id: 0,
    title: 'Clima y Tráfico',
    description: 'Vocabulario para hablar del clima y condiciones de tráfico',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'intermedio' as const,
    size: '1.2 MB',
    downloadUrl: '/resources/universal/weather-traffic.pdf',
    tags: ['Intermedio', 'Clima', 'Tráfico'],
    offline: true
  },

  // Advanced Level
  advanced_business_english: {
    id: 0,
    title: 'Inglés de Negocios para Gig Economy',
    description: 'Términos profesionales, negociación y comunicación corporativa',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'avanzado' as const,
    size: '2.9 MB',
    downloadUrl: '/resources/universal/business-english.pdf',
    tags: ['Avanzado', 'Negocios', 'Profesional'],
    offline: true
  },

  advanced_idioms_slang: {
    id: 0,
    title: 'Modismos y Slang Estadounidense',
    description: 'Expresiones coloquiales que escucharás de clientes',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'avanzado' as const,
    size: '1.6 MB',
    downloadUrl: '/resources/universal/idioms-slang.pdf',
    tags: ['Avanzado', 'Modismos', 'Cultura'],
    offline: true
  },

  advanced_accent_reduction: {
    id: 0,
    title: 'Mejora tu Pronunciación',
    description: 'Ejercicios avanzados para reducir acento y hablar más claro',
    type: 'audio' as const,
    category: 'all' as const,
    level: 'avanzado' as const,
    size: '12.3 MB',
    downloadUrl: '/resources/universal/accent-reduction.mp3',
    tags: ['Audio', 'Avanzado', 'Pronunciación'],
    offline: true
  },

  advanced_video_comprehensive: {
    id: 0,
    title: 'Curso Completo: Inglés para Gig Workers',
    description: 'Video curso de 45 minutos con todas las situaciones principales',
    type: 'video' as const,
    category: 'all' as const,
    level: 'avanzado' as const,
    size: '120 MB',
    downloadUrl: '/resources/universal/complete-course.mp4',
    tags: ['Video', 'Avanzado', 'Curso Completo'],
    offline: false
  }
} as const

// ============================================================================
// SPECIALIZED TEMPLATES
// ============================================================================

/**
 * EMERGENCY & SAFETY TEMPLATES
 * Critical phrases for emergencies and safety situations
 */

export const EMERGENCY_TEMPLATES = {
  emergency_phrases: {
    id: 0,
    title: 'Frases de Emergencia',
    description: 'Vocabulario crítico para accidentes, emergencias médicas y policía',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '600 KB',
    downloadUrl: '/resources/emergency/emergency-phrases.pdf',
    tags: ['Emergencia', 'Seguridad', 'Básico', 'Crítico'],
    offline: true
  },

  safety_protocols: {
    id: 0,
    title: 'Protocolos de Seguridad',
    description: 'Cómo comunicar problemas de seguridad en inglés',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'intermedio' as const,
    size: '1.4 MB',
    downloadUrl: '/resources/emergency/safety-protocols.pdf',
    tags: ['Seguridad', 'Protocolos', 'Intermedio'],
    offline: true
  }
} as const

/**
 * APP-SPECIFIC TEMPLATES
 * Resources focused on specific gig economy platforms
 */

export const APP_SPECIFIC_TEMPLATES = {
  uber_guide: {
    id: 0,
    title: 'Guía Completa: Uber en Inglés',
    description: 'Todo el vocabulario de la app Uber explicado en español',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'basico' as const,
    size: '2.8 MB',
    downloadUrl: '/resources/apps/uber-complete-guide.pdf',
    tags: ['Uber', 'Guía', 'Básico'],
    offline: true
  },

  rappi_guide: {
    id: 0,
    title: 'Guía Completa: Rappi en Inglés',
    description: 'Vocabulario de Rappi y frases para entregas exitosas',
    type: 'pdf' as const,
    category: 'repartidor' as const,
    level: 'basico' as const,
    size: '2.5 MB',
    downloadUrl: '/resources/apps/rappi-complete-guide.pdf',
    tags: ['Rappi', 'Guía', 'Básico'],
    offline: true
  },

  didi_guide: {
    id: 0,
    title: 'Guía Completa: DiDi en Inglés',
    description: 'Cómo usar DiDi en mercados de habla inglesa',
    type: 'pdf' as const,
    category: 'conductor' as const,
    level: 'basico' as const,
    size: '2.3 MB',
    downloadUrl: '/resources/apps/didi-complete-guide.pdf',
    tags: ['DiDi', 'Guía', 'Básico'],
    offline: true
  },

  doordash_guide: {
    id: 0,
    title: 'Guía Completa: DoorDash en Inglés',
    description: 'Vocabulario específico de DoorDash para domiciliarios',
    type: 'pdf' as const,
    category: 'repartidor' as const,
    level: 'basico' as const,
    size: '2.6 MB',
    downloadUrl: '/resources/apps/doordash-guide.pdf',
    tags: ['DoorDash', 'Guía', 'Básico'],
    offline: true
  }
} as const

// ============================================================================
// TEMPLATE COLLECTIONS - Easy access to all templates
// ============================================================================

export const ALL_TEMPLATES = {
  delivery: DELIVERY_TEMPLATES,
  rideshare: RIDESHARE_TEMPLATES,
  universal: UNIVERSAL_TEMPLATES,
  emergency: EMERGENCY_TEMPLATES,
  appSpecific: APP_SPECIFIC_TEMPLATES
} as const

/**
 * Get all templates as a flat array
 */
export const getAllTemplatesArray = (): Partial<Resource>[] => {
  const templates: Partial<Resource>[] = []

  Object.values(ALL_TEMPLATES).forEach(category => {
    Object.values(category).forEach(template => {
      templates.push(template)
    })
  })

  return templates
}

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: Resource['category']): Partial<Resource>[] => {
  return getAllTemplatesArray().filter(t => t.category === category)
}

/**
 * Get templates by level
 */
export const getTemplatesByLevel = (level: Resource['level']): Partial<Resource>[] => {
  return getAllTemplatesArray().filter(t => t.level === level)
}

/**
 * Get templates by type
 */
export const getTemplatesByType = (type: Resource['type']): Partial<Resource>[] => {
  return getAllTemplatesArray().filter(t => t.type === type)
}

// ============================================================================
// METADATA - Statistics and information about templates
// ============================================================================

export const TEMPLATE_METADATA = {
  totalTemplates: getAllTemplatesArray().length,
  byCategory: {
    delivery: Object.keys(DELIVERY_TEMPLATES).length,
    rideshare: Object.keys(RIDESHARE_TEMPLATES).length,
    universal: Object.keys(UNIVERSAL_TEMPLATES).length,
    emergency: Object.keys(EMERGENCY_TEMPLATES).length,
    appSpecific: Object.keys(APP_SPECIFIC_TEMPLATES).length
  },
  byLevel: {
    basico: getAllTemplatesArray().filter(t => t.level === 'basico').length,
    intermedio: getAllTemplatesArray().filter(t => t.level === 'intermedio').length,
    avanzado: getAllTemplatesArray().filter(t => t.level === 'avanzado').length
  },
  byType: {
    pdf: getAllTemplatesArray().filter(t => t.type === 'pdf').length,
    audio: getAllTemplatesArray().filter(t => t.type === 'audio').length,
    image: getAllTemplatesArray().filter(t => t.type === 'image').length,
    video: getAllTemplatesArray().filter(t => t.type === 'video').length
  }
} as const

export default ALL_TEMPLATES
