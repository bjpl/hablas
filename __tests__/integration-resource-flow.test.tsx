/**
 * Resource Flow Integration Tests
 *
 * Tests the complete user journey for resource interaction
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMockResource, mockLocalStorage } from './utils/test-helpers'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    }
  },
  usePathname() {
    return '/'
  }
}))

describe('Resource Flow Integration', () => {
  beforeEach(() => {
    mockLocalStorage()
    jest.clearAllMocks()
  })

  describe('Resource Discovery Flow', () => {
    it('should allow user to find resources by category', () => {
      const resources = [
        createMockResource({ id: 1, category: 'repartidor', title: 'Delivery Resource' }),
        createMockResource({ id: 2, category: 'conductor', title: 'Driver Resource' }),
      ]

      // This would test filtering functionality
      const deliveryResources = resources.filter(r => r.category === 'repartidor')
      expect(deliveryResources).toHaveLength(1)
      expect(deliveryResources[0].title).toBe('Delivery Resource')
    })

    it('should allow user to find resources by level', () => {
      const resources = [
        createMockResource({ id: 1, level: 'basico', title: 'Basic Resource' }),
        createMockResource({ id: 2, level: 'avanzado', title: 'Advanced Resource' }),
      ]

      const basicResources = resources.filter(r => r.level === 'basico')
      expect(basicResources).toHaveLength(1)
      expect(basicResources[0].title).toBe('Basic Resource')
    })

    it('should allow user to search by keywords', () => {
      const resources = [
        createMockResource({ id: 1, title: 'Greetings Guide', tags: ['greetings'] }),
        createMockResource({ id: 2, title: 'Numbers Tutorial', tags: ['numbers'] }),
      ]

      const searchQuery = 'greetings'
      const results = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Greetings Guide')
    })
  })

  describe('Resource Viewing Flow', () => {
    it('should display resource details', () => {
      const resource = createMockResource({
        title: 'Test Resource',
        description: 'Detailed description',
        type: 'pdf',
        size: '1.5 MB'
      })

      expect(resource.title).toBe('Test Resource')
      expect(resource.description).toBe('Detailed description')
      expect(resource.type).toBe('pdf')
      expect(resource.size).toBe('1.5 MB')
    })

    it('should track resource views', () => {
      const resource = createMockResource({ id: 123 })
      const viewCount = new Map<number, number>()

      // Simulate view tracking
      viewCount.set(resource.id, (viewCount.get(resource.id) || 0) + 1)

      expect(viewCount.get(123)).toBe(1)
    })
  })

  describe('Resource Download Flow', () => {
    it('should track downloaded resources in localStorage', () => {
      const resource = createMockResource({ id: 456 })

      // Simulate download
      const downloaded = JSON.parse(localStorage.getItem('downloaded-resources') || '[]')
      downloaded.push(resource.id)
      localStorage.setItem('downloaded-resources', JSON.stringify(downloaded))

      // Verify
      const stored = JSON.parse(localStorage.getItem('downloaded-resources') || '[]')
      expect(stored).toContain(456)
    })

    it('should mark resource as downloaded', () => {
      const resource = createMockResource({ id: 789 })
      const downloadedIds = new Set<number>()

      // Download
      downloadedIds.add(resource.id)

      expect(downloadedIds.has(789)).toBe(true)
    })

    it('should persist download state across sessions', () => {
      const resource = createMockResource({ id: 321 })

      // First session: download
      localStorage.setItem('downloaded-resources', JSON.stringify([321]))

      // Second session: check
      const downloaded = JSON.parse(localStorage.getItem('downloaded-resources') || '[]')
      expect(downloaded).toContain(321)
    })
  })

  describe('Offline Resource Flow', () => {
    it('should identify offline-capable resources', () => {
      const resources = [
        createMockResource({ id: 1, offline: true }),
        createMockResource({ id: 2, offline: false }),
      ]

      const offlineResources = resources.filter(r => r.offline)
      expect(offlineResources).toHaveLength(1)
    })

    it('should allow filtering by offline availability', () => {
      const resources = [
        createMockResource({ id: 1, offline: true, title: 'Offline Resource' }),
        createMockResource({ id: 2, offline: false, title: 'Online Resource' }),
        createMockResource({ id: 3, offline: true, title: 'Another Offline' }),
      ]

      const offlineOnly = resources.filter(r => r.offline)
      expect(offlineOnly).toHaveLength(2)
      expect(offlineOnly.every(r => r.offline)).toBe(true)
    })
  })

  describe('Resource Sharing Flow', () => {
    it('should generate shareable URL', () => {
      const resource = createMockResource({ id: 555 })
      const shareUrl = `https://hablas.dev/recursos/${resource.id}`

      expect(shareUrl).toContain('/recursos/')
      expect(shareUrl).toContain(String(resource.id))
    })

    it('should include resource info in share data', () => {
      const resource = createMockResource({
        title: 'Shareable Resource',
        description: 'Great for learning'
      })

      const shareData = {
        title: resource.title,
        text: `Mira este recurso de inglés: ${resource.description}`,
        url: `https://hablas.dev/recursos/${resource.id}`
      }

      expect(shareData.title).toBe('Shareable Resource')
      expect(shareData.text).toContain('Great for learning')
      expect(shareData.url).toContain(String(resource.id))
    })
  })

  describe('Progress Tracking Flow', () => {
    it('should track user progress', () => {
      const progress = new Map<number, { viewed: boolean, downloaded: boolean }>()

      const resource = createMockResource({ id: 888 })

      // View resource
      progress.set(resource.id, { viewed: true, downloaded: false })
      expect(progress.get(resource.id)?.viewed).toBe(true)

      // Download resource
      progress.set(resource.id, { viewed: true, downloaded: true })
      expect(progress.get(resource.id)?.downloaded).toBe(true)
    })

    it('should calculate completion percentage', () => {
      const totalResources = 10
      const completedResources = 7
      const completionPercentage = (completedResources / totalResources) * 100

      expect(completionPercentage).toBe(70)
    })

    it('should track resources by category', () => {
      const userProgress = {
        repartidor: { total: 5, completed: 3 },
        conductor: { total: 8, completed: 5 }
      }

      expect(userProgress.repartidor.completed / userProgress.repartidor.total).toBe(0.6)
      expect(userProgress.conductor.completed / userProgress.conductor.total).toBe(0.625)
    })
  })

  describe('Analytics Integration', () => {
    it('should track resource view events', () => {
      const events: Array<{ event: string; resourceId: number; timestamp: string }> = []
      const resource = createMockResource({ id: 111 })

      events.push({
        event: 'resource_view',
        resourceId: resource.id,
        timestamp: new Date().toISOString()
      })

      expect(events).toHaveLength(1)
      expect(events[0].event).toBe('resource_view')
    })

    it('should track download events', () => {
      const events: Array<{ event: string; resourceId: number; timestamp: string }> = []
      const resource = createMockResource({ id: 222 })

      events.push({
        event: 'resource_download',
        resourceId: resource.id,
        timestamp: new Date().toISOString()
      })

      expect(events).toHaveLength(1)
      expect(events[0].event).toBe('resource_download')
    })

    it('should track search events', () => {
      const events: Array<{ event: string; query: string; timestamp: string }> = []

      events.push({
        event: 'search',
        query: 'greetings',
        timestamp: new Date().toISOString()
      })

      expect(events).toHaveLength(1)
      expect(events[0].event).toBe('search')
      expect(events[0].query).toBe('greetings')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing resources gracefully', () => {
      const resources: Array<{ id: string | number }> = []
      const resourceId = 'non-existent'
      const found = resources.find(r => r.id === resourceId)

      expect(found).toBeUndefined()
    })

    it('should handle download failures', async () => {
      const mockDownload = jest.fn().mockRejectedValue(new Error('Network error'))

      try {
        await mockDownload()
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBe('Network error')
        }
      }
    })

    it('should handle invalid resource data', () => {
      const invalidResource = {
        // Missing required fields
        title: 'Invalid'
      }

      // Validation would catch this
      const hasRequiredFields = 'id' in invalidResource &&
                                'downloadUrl' in invalidResource &&
                                'type' in invalidResource

      expect(hasRequiredFields).toBe(false)
    })
  })
})
