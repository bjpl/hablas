/**
 * Hero Component Tests
 *
 * Tests for the Hero component including:
 * - Component rendering
 * - Accessibility (ARIA, WCAG 2.1 AA)
 * - Responsive behavior
 * - Statistics display
 */

import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithUserEvent } from '../utils/render-helpers'
import { axe } from 'jest-axe'
import Hero from '@/components/Hero'

describe('Hero Component', () => {
  describe('Rendering', () => {
    it('should render the hero section', () => {
      renderWithUserEvent(<Hero />)

      expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
    })

    it('should display the main heading', () => {
      renderWithUserEvent(<Hero />)

      const heading = screen.getByRole('heading', { level: 1, name: /Aprende Inglés Para Tu Trabajo/i })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveAttribute('id', 'hero-heading')
    })

    it('should display the subtitle', () => {
      renderWithUserEvent(<Hero />)

      expect(screen.getByText(/Recursos gratuitos para conductores y domiciliarios/i)).toBeInTheDocument()
    })

    it('should display all four statistics cards', () => {
      renderWithUserEvent(<Hero />)

      const statsList = screen.getByRole('list', { name: /Estadísticas de la plataforma/i })
      expect(statsList).toBeInTheDocument()

      // Check individual stats
      expect(screen.getByText('500+')).toBeInTheDocument()
      expect(screen.getByText('Frases útiles')).toBeInTheDocument()

      expect(screen.getByText('24/7')).toBeInTheDocument()
      expect(screen.getByText('Grupos WhatsApp')).toBeInTheDocument()

      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('Gratis')).toBeInTheDocument()

      expect(screen.getByText('Offline')).toBeInTheDocument()
      expect(screen.getByText('Sin datos')).toBeInTheDocument()
    })

    it('should display the benefits section', () => {
      renderWithUserEvent(<Hero />)

      const benefitsNote = screen.getByRole('note', { name: /Beneficios del inglés/i })
      expect(benefitsNote).toBeInTheDocument()
      expect(benefitsNote).toHaveTextContent(/¿Por qué inglés?/)
      expect(benefitsNote).toHaveTextContent(/Los clientes extranjeros pagan mejor/)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithUserEvent(<Hero />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic HTML structure', () => {
      renderWithUserEvent(<Hero />)

      // Section should have aria-labelledby
      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    })

    it('should have proper ARIA labels for statistics', () => {
      renderWithUserEvent(<Hero />)

      // Statistics should have descriptive aria-labels
      expect(screen.getByLabelText(/Más de 500 frases útiles/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/24 horas, 7 días a la semana/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/100 por ciento gratis/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Funciona sin conexión/i)).toBeInTheDocument()
    })

    it('should use proper heading hierarchy', () => {
      renderWithUserEvent(<Hero />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()

      // Should only have one h1
      const allH1s = screen.getAllByRole('heading', { level: 1 })
      expect(allH1s).toHaveLength(1)
    })

    it('should have sufficient color contrast', () => {
      const { container } = renderWithUserEvent(<Hero />)

      // Check heading color (should be dark on light background)
      const heading = container.querySelector('h1')
      expect(heading).toHaveClass('text-gray-900')

      // Check that background is white
      const section = container.querySelector('section')
      expect(section).toHaveClass('bg-white')
    })
  })

  describe('Responsive Design', () => {
    it('should use responsive text sizing', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const heading = container.querySelector('h1')
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('sm:text-4xl')

      const subtitle = screen.getByText(/Recursos gratuitos/)
      expect(subtitle).toHaveClass('text-lg')
      expect(subtitle).toHaveClass('sm:text-xl')
    })

    it('should use responsive grid layout for stats', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const statsGrid = container.querySelector('[role="list"]')
      expect(statsGrid).toHaveClass('grid')
      expect(statsGrid).toHaveClass('grid-cols-2')
      expect(statsGrid).toHaveClass('sm:grid-cols-4')
    })

    it('should have proper spacing on mobile and desktop', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const section = container.querySelector('section')
      expect(section).toHaveClass('px-4')
      expect(section).toHaveClass('py-12')
    })
  })

  describe('Visual Design', () => {
    it('should apply color coding to statistics', () => {
      const { container } = renderWithUserEvent(<Hero />)

      // Check each stat has its unique color
      const stats = container.querySelectorAll('[role="listitem"] .text-2xl')

      expect(stats[0]).toHaveClass('text-rappi') // 500+ phrases
      expect(stats[1]).toHaveClass('text-green-600') // 24/7
      expect(stats[2]).toHaveClass('text-blue-600') // 100%
      expect(stats[3]).toHaveClass('text-purple-600') // Offline
    })

    it('should have shadow on stat cards', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const cards = container.querySelectorAll('[role="listitem"]')
      cards.forEach(card => {
        expect(card).toHaveClass('shadow-sm')
      })
    })

    it('should have border accent on benefits section', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const benefitsSection = container.querySelector('[role="note"]')
      expect(benefitsSection).toHaveClass('border-l-4')
      expect(benefitsSection).toHaveClass('border-gray-400')
    })
  })

  describe('Content', () => {
    it('should display correct statistics numbers', () => {
      renderWithUserEvent(<Hero />)

      expect(screen.getByText('500+')).toBeInTheDocument()
      expect(screen.getByText('24/7')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should explain the value proposition in Spanish', () => {
      renderWithUserEvent(<Hero />)

      const benefits = screen.getByRole('note')
      expect(benefits).toHaveTextContent('Los clientes extranjeros pagan mejor')
      expect(benefits).toHaveTextContent('dan mejores propinas')
      expect(benefits).toHaveTextContent('califican mejor')
    })

    it('should target gig economy workers', () => {
      renderWithUserEvent(<Hero />)

      expect(screen.getByText(/conductores y domiciliarios/i)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render quickly', () => {
      const start = performance.now()
      renderWithUserEvent(<Hero />)
      const duration = performance.now() - start

      // Should render in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should have minimal DOM nodes', () => {
      const { container } = renderWithUserEvent(<Hero />)

      const allElements = container.querySelectorAll('*')
      // Should have reasonable number of elements (not excessive)
      expect(allElements.length).toBeLessThan(50)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple renders without errors', () => {
      const { rerender } = renderWithUserEvent(<Hero />)

      expect(() => {
        rerender(<Hero />)
        rerender(<Hero />)
        rerender(<Hero />)
      }).not.toThrow()
    })

    it('should maintain structure when container is small', () => {
      // Simulate small viewport
      global.innerWidth = 320

      renderWithUserEvent(<Hero />)

      // Content should still be accessible
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = renderWithUserEvent(<Hero />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
