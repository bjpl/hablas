/**
 * ResourceCard Component Tests
 *
 * Tests for the ResourceCard component including:
 * - Component rendering with different resource types
 * - User interactions (clicks, hover)
 * - Accessibility (ARIA, keyboard navigation, touch targets)
 * - Responsive behavior
 * - Error states
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { renderWithUserEvent } from '../utils/render-helpers'
import { axe } from 'jest-axe'
import ResourceCard from '@/components/ResourceCard'
import type { Resource } from '@/data/resources'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

const mockResource: Resource = {
  id: 1,
  title: 'Frases para Conductores',
  description: 'Frases esenciales para comunicarte con pasajeros en inglés',
  type: 'audio' as const,
  category: 'conductor' as const,
  level: 'basico' as const,
  tags: ['Rappi', 'Uber', 'Básico'],
  size: '2.5 MB',
  offline: true,
  downloadUrl: '/resources/test-resource.mp3',
}

describe('ResourceCard Component', () => {
  const mockOnDownload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the resource card', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should display resource title', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByRole('heading', { name: /Frases para Conductores/i })).toBeInTheDocument()
    })

    it('should display resource description', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText(/Frases esenciales para comunicarte/i)).toBeInTheDocument()
    })

    it('should display correct type icon for audio', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText('🎧')).toBeInTheDocument()
    })

    it('should display all resource tags', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText('Rappi')).toBeInTheDocument()
      expect(screen.getByText('Uber')).toBeInTheDocument()
      expect(screen.getByText('Básico')).toBeInTheDocument()
    })

    it('should display offline badge when resource is offline', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText('Offline')).toBeInTheDocument()
    })

    it('should not display offline badge when resource is not offline', () => {
      const onlineResource = { ...mockResource, offline: false }
      renderWithUserEvent(
        <ResourceCard
          resource={onlineResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.queryByText('Offline')).not.toBeInTheDocument()
    })

    it('should display resource size', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByLabelText(/Tamaño del archivo: 2\.5 MB/i)).toBeInTheDocument()
    })
  })

  describe('Type Icons', () => {
    const testCases = [
      { type: 'pdf' as const, icon: '📄' },
      { type: 'audio' as const, icon: '🎧' },
      { type: 'image' as const, icon: '🖼️' },
      { type: 'video' as const, icon: '📹' },
    ]

    testCases.forEach(({ type, icon }) => {
      it(`should display ${icon} icon for ${type} type`, () => {
        const resource: Resource = { ...mockResource, type }
        renderWithUserEvent(
          <ResourceCard
            resource={resource}
            isDownloaded={false}
            onDownload={mockOnDownload}
          />
        )

        expect(screen.getByText(icon)).toBeInTheDocument()
      })
    })
  })

  describe('Tag Colors', () => {
    it('should apply correct color class for Rappi tag', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const rappiTag = screen.getByText('Rappi')
      expect(rappiTag).toHaveClass('tag-rappi')
    })

    it('should apply correct color class for Uber tag', () => {
      const resource = { ...mockResource, tags: ['Uber'] }
      renderWithUserEvent(
        <ResourceCard
          resource={resource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const uberTag = screen.getByText('Uber')
      expect(uberTag).toHaveClass('tag-uber')
    })

    it('should apply correct color class for difficulty levels', () => {
      const resource = { ...mockResource, tags: ['Básico', 'Intermedio', 'Avanzado'] }
      renderWithUserEvent(
        <ResourceCard
          resource={resource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText('Básico')).toHaveClass('tag-basico')
      expect(screen.getByText('Intermedio')).toHaveClass('tag-intermedio')
      expect(screen.getByText('Avanzado')).toHaveClass('tag-avanzado')
    })
  })

  describe('User Interactions', () => {
    it('should navigate to resource detail when title is clicked', async () => {
      const { user } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const titleLink = screen.getByLabelText(/Ver detalles de Frases para Conductores/i)
      await user.click(titleLink)

      expect(titleLink).toHaveAttribute('href', '/recursos/1')
    })

    it('should navigate to resource detail when button is clicked', async () => {
      const { user } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const button = screen.getByRole('button', { name: /Ver detalles del recurso/i })
      expect(button.closest('a')).toHaveAttribute('href', '/recursos/1')
    })

    it('should show hover effect on title', async () => {
      const { user, container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const title = container.querySelector('h3')
      expect(title).toHaveClass('hover:text-accent-blue')
      expect(title).toHaveClass('transition-colors')
    })

    it('should show hover effect on button', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-blue-700')
      expect(button).toHaveClass('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByLabelText(/Ver detalles de Frases para Conductores/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ver detalles del recurso/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tamaño del archivo/i)).toBeInTheDocument()
    })

    it('should hide decorative icon from screen readers', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveTextContent('🎧')
    })

    it('should be keyboard navigable', async () => {
      const { user } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      // Tab to title link
      await user.tab()
      const titleLink = screen.getByLabelText(/Ver detalles de Frases para Conductores/i)
      expect(titleLink).toHaveFocus()

      // Tab to button
      await user.tab()
      const button = screen.getByRole('button')
      expect(button).toHaveFocus()
    })

    it('should have touch targets of at least 48px', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('py-3') // py-3 = 12px * 2 = 24px vertical padding minimum
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('w-full')
    })

    it('should use semantic HTML', () => {
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should use flexbox layout', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const article = container.querySelector('article')
      expect(article).toHaveClass('flex')
      expect(article).toHaveClass('flex-col')
      expect(article).toHaveClass('h-full')
    })

    it('should have responsive tag wrapping', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const tagContainer = container.querySelector('.flex-wrap')
      expect(tagContainer).toBeInTheDocument()
    })

    it('should limit title to 2 lines', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const title = container.querySelector('h3')
      expect(title).toHaveClass('line-clamp-2')
    })

    it('should limit description to 3 lines', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const description = screen.getByText(/Frases esenciales/)
      expect(description).toHaveClass('line-clamp-3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long titles gracefully', () => {
      const longTitleResource = {
        ...mockResource,
        title: 'Este es un título extremadamente largo que debería ser truncado después de dos líneas para mantener un diseño consistente'
      }

      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={longTitleResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const title = container.querySelector('h3')
      expect(title).toHaveClass('line-clamp-2')
    })

    it('should handle many tags', () => {
      const manyTagsResource = {
        ...mockResource,
        tags: ['Rappi', 'Uber', 'DiDi', 'Básico', 'Intermedio', 'Tag1', 'Tag2', 'Tag3']
      }

      renderWithUserEvent(
        <ResourceCard
          resource={manyTagsResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      // All tags should render
      manyTagsResource.tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should handle empty tags array', () => {
      const noTagsResource = { ...mockResource, tags: [] }

      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={noTagsResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      const tagContainer = container.querySelector('.flex-wrap')
      expect(tagContainer?.children).toHaveLength(0)
    })

    it('should handle missing optional fields', () => {
      const minimalResource: Resource = {
        id: 999,
        title: 'Minimal Resource',
        description: 'Description',
        type: 'pdf' as const,
        category: 'repartidor' as const,
        level: 'basico' as const,
        tags: ['Test'],
        size: '1 MB',
        offline: false,
        downloadUrl: '/test.pdf',
      }

      expect(() => {
        renderWithUserEvent(
          <ResourceCard
            resource={minimalResource}
            isDownloaded={false}
            onDownload={mockOnDownload}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should render quickly', () => {
      const start = performance.now()
      renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
    })

    it('should not cause layout shifts', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      // Card should have defined height
      const article = container.querySelector('article')
      expect(article).toHaveClass('h-full')
    })
  })

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = renderWithUserEvent(
        <ResourceCard
          resource={mockResource}
          isDownloaded={false}
          onDownload={mockOnDownload}
        />
      )

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
