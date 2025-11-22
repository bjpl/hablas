/**
 * Topic Grouping Utility
 *
 * Defines logical groupings of resources by topic/theme
 */

import type { TopicGroup } from '@/lib/types/topics';
import { isResourceHidden } from '@/data/resources';

export const topicGroups: TopicGroup[] = [
  // Repartidor Topics
  {
    slug: 'entregas-basicas',
    name: 'Entregas Básicas',
    description: 'Frases esenciales y pronunciación básica para entregas',
    category: 'repartidor',
    resourceIds: [1, 2, 4, 6, 7, 9],
  },
  {
    slug: 'situaciones-complejas-entregas',
    name: 'Situaciones Complejas en Entregas',
    description: 'Manejo de situaciones difíciles y conversaciones con clientes',
    category: 'repartidor',
    resourceIds: [5, 10, 31, 32],
  },

  // Conductor Topics
  {
    slug: 'saludos-confirmacion',
    name: 'Saludos y Confirmación',
    description: 'Saludos profesionales y confirmación de pasajeros',
    category: 'conductor',
    resourceIds: [11, 14, 17],
  },
  {
    slug: 'direcciones-navegacion',
    name: 'Direcciones y Navegación',
    description: 'Direcciones, navegación GPS y audio de pronunciación',
    category: 'conductor',
    resourceIds: [12, 13, 15, 18, 19],
  },
  {
    slug: 'conversacion-pasajeros',
    name: 'Conversación con Pasajeros',
    description: 'Small talk y diálogos profesionales con pasajeros',
    category: 'conductor',
    resourceIds: [16, 33, 34],
  },
  {
    slug: 'situaciones-dificiles-conductor',
    name: 'Situaciones Difíciles',
    description: 'Manejo de problemas y situaciones complejas en el vehículo',
    category: 'conductor',
    resourceIds: [20],
  },

  // All/General Topics
  {
    slug: 'fundamentos-basicos',
    name: 'Fundamentos Básicos',
    description: 'Saludos, números, tiempo y horarios para todos',
    category: 'all',
    resourceIds: [21, 22, 23, 28, 29],
  },
  {
    slug: 'servicio-cliente',
    name: 'Servicio al Cliente',
    description: 'Atención al cliente, quejas y problemas',
    category: 'all',
    resourceIds: [25, 26],
  },
  {
    slug: 'seguridad-emergencias',
    name: 'Seguridad y Emergencias',
    description: 'Frases de emergencia y protocolos de seguridad',
    category: 'all',
    resourceIds: [27, 30],
  },

  // Advanced Topics
  {
    slug: 'comunicacion-profesional',
    name: 'Comunicación Profesional Avanzada',
    description: 'Terminología de negocios y comunicación profesional',
    category: 'all',
    resourceIds: [35, 43],
  },
  {
    slug: 'manejo-conflictos',
    name: 'Manejo Avanzado de Conflictos',
    description: 'Resolución de conflictos, quejas y negociación',
    category: 'all',
    resourceIds: [36, 37, 41],
  },
  {
    slug: 'excelencia-servicio',
    name: 'Excelencia en Servicio',
    description: 'Comunicación intercultural y optimización de ganancias',
    category: 'all',
    resourceIds: [38, 39, 40],
  },
  {
    slug: 'limites-profesionales',
    name: 'Límites Profesionales',
    description: 'Límites profesionales y gestión del tiempo',
    category: 'all',
    resourceIds: [42, 44],
  },

  // Emergency Topics
  {
    slug: 'emergencias-vehiculo',
    name: 'Emergencias de Vehículo',
    description: 'Accidentes y averías de vehículo',
    category: 'all',
    resourceIds: [45, 51],
  },
  {
    slug: 'emergencias-medicas-seguridad',
    name: 'Emergencias Médicas y Seguridad',
    description: 'Emergencias médicas y amenazas a la seguridad personal',
    category: 'all',
    resourceIds: [48, 50],
  },
  {
    slug: 'conflictos-disputas',
    name: 'Conflictos y Disputas',
    description: 'Conflictos con clientes, disputas de pago y artículos perdidos',
    category: 'all',
    resourceIds: [46, 47, 49],
  },
  {
    slug: 'condiciones-peligrosas',
    name: 'Condiciones Peligrosas',
    description: 'Clima severo y condiciones peligrosas',
    category: 'all',
    resourceIds: [52],
  },

  // Platform-Specific Topics
  {
    slug: 'plataformas-especificas',
    name: 'Plataformas Específicas',
    description: 'Uber, Lyft, DoorDash y aeropuertos',
    category: 'conductor',
    resourceIds: [53, 54, 55, 59],
  },
  {
    slug: 'estrategias-avanzadas',
    name: 'Estrategias Avanzadas',
    description: 'Multi-app, calificaciones e impuestos',
    category: 'all',
    resourceIds: [56, 57, 58],
  },
];

/**
 * Get all topics, optionally filtered by category
 * Filters out hidden resources from resource counts
 */
export function getTopics(category?: 'all' | 'repartidor' | 'conductor'): TopicGroup[] {
  const filterHiddenResources = (topic: TopicGroup) => {
    const visibleIds = topic.resourceIds.filter(id => !isResourceHidden(id));
    return {
      ...topic,
      resourceIds: visibleIds,
      resourceCount: visibleIds.length,
    };
  };

  if (!category) {
    return topicGroups
      .map(filterHiddenResources)
      .filter(topic => topic.resourceCount > 0); // Exclude empty topics
  }

  return topicGroups
    .filter(topic => topic.category === category)
    .map(filterHiddenResources)
    .filter(topic => topic.resourceCount > 0); // Exclude empty topics
}

/**
 * Get a specific topic by slug
 * Filters out hidden resources
 */
export function getTopicBySlug(slug: string): TopicGroup | null {
  const topic = topicGroups.find(t => t.slug === slug);
  if (!topic) return null;

  const visibleIds = topic.resourceIds.filter(id => !isResourceHidden(id));

  // Return null if all resources in this topic are hidden
  if (visibleIds.length === 0) return null;

  return {
    ...topic,
    resourceIds: visibleIds,
    resourceCount: visibleIds.length,
  };
}

/**
 * Get all resource IDs for a topic (only visible resources)
 */
export function getTopicResourceIds(slug: string): number[] {
  const topic = getTopicBySlug(slug);
  return topic?.resourceIds || [];
}

/**
 * Get all topics including hidden resources (for admin use)
 */
export function getAllTopicsWithHidden(category?: 'all' | 'repartidor' | 'conductor'): TopicGroup[] {
  if (!category) {
    return topicGroups.map(topic => ({
      ...topic,
      resourceCount: topic.resourceIds.length,
    }));
  }

  return topicGroups
    .filter(topic => topic.category === category)
    .map(topic => ({
      ...topic,
      resourceCount: topic.resourceIds.length,
    }));
}
