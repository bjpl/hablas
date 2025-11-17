/**
 * React Testing Utilities
 *
 * Custom render functions and utilities for testing React components
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render with user event for interactions
 */
export function renderWithUserEvent(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...renderWithProviders(ui),
  }
}

/**
 * Wait for component to load async data
 */
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    const loadingElements = document.querySelectorAll('[data-testid*="loading"]')
    expect(loadingElements.length).toBe(0)
  }, { timeout: 3000 })
}

/**
 * Query helpers
 */
export const QueryHelpers = {
  /**
   * Get element by test ID with error message
   */
  getByTestId: (container: HTMLElement, testId: string) => {
    const element = container.querySelector(`[data-testid="${testId}"]`)
    if (!element) {
      throw new Error(`Unable to find element with data-testid="${testId}"`)
    }
    return element
  },

  /**
   * Get all elements by test ID prefix
   */
  getAllByTestIdPrefix: (container: HTMLElement, prefix: string) => {
    return Array.from(container.querySelectorAll(`[data-testid^="${prefix}"]`))
  },
}

/**
 * Accessibility testing helpers
 */
export const A11yHelpers = {
  /**
   * Check for accessibility violations using jest-axe
   */
  async checkA11y(container: HTMLElement) {
    const { axe } = await import('jest-axe')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  },

  /**
   * Check for proper ARIA labels
   */
  assertHasAriaLabel(element: Element, label?: string) {
    const ariaLabel = element.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    if (label) {
      expect(ariaLabel).toBe(label)
    }
  },

  /**
   * Check for keyboard navigation support
   */
  assertIsKeyboardAccessible(element: Element) {
    const tabIndex = element.getAttribute('tabindex')
    expect(tabIndex !== '-1').toBe(true)
  },
}

/**
 * Form testing helpers
 */
export const FormHelpers = {
  /**
   * Fill form field by label
   */
  async fillFieldByLabel(label: string, value: string) {
    const { screen } = await import('@testing-library/react')
    const input = screen.getByLabelText(label)
    await userEvent.type(input, value)
  },

  /**
   * Submit form
   */
  async submitForm(container: HTMLElement) {
    const form = container.querySelector('form')
    if (!form) {
      throw new Error('No form found in container')
    }
    const submitButton = form.querySelector('button[type="submit"]')
    if (submitButton) {
      await userEvent.click(submitButton)
    } else {
      // Trigger form submission event
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
  },

  /**
   * Assert form has validation errors
   */
  assertHasValidationError(container: HTMLElement, message?: string) {
    const errors = container.querySelectorAll('[role="alert"], .error, [data-testid*="error"]')
    expect(errors.length).toBeGreaterThan(0)
    if (message) {
      const errorText = Array.from(errors).map(e => e.textContent).join(' ')
      expect(errorText).toContain(message)
    }
  },
}

/**
 * Mock window properties for testing
 */
export class MockWindow {
  private original: Record<string, any> = {}

  mockProperty(property: string, value: any) {
    if (!(property in this.original)) {
      this.original[property] = (window as any)[property]
    }
    Object.defineProperty(window, property, {
      writable: true,
      configurable: true,
      value,
    })
  }

  restore() {
    Object.entries(this.original).forEach(([property, value]) => {
      Object.defineProperty(window, property, {
        writable: true,
        configurable: true,
        value,
      })
    })
    this.original = {}
  }
}

/**
 * Component snapshot testing
 */
export const SnapshotHelpers = {
  /**
   * Create snapshot with cleaned HTML
   */
  cleanSnapshot(container: HTMLElement) {
    // Remove dynamic attributes that change between test runs
    const clone = container.cloneNode(true) as HTMLElement
    clone.querySelectorAll('[data-testid]').forEach(el => {
      el.removeAttribute('data-reactroot')
    })
    return clone.innerHTML
  },
}

/**
 * Performance testing helper
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map()

  start(label: string) {
    this.marks.set(label, performance.now())
  }

  end(label: string): number {
    const start = this.marks.get(label)
    if (!start) {
      throw new Error(`No start mark found for "${label}"`)
    }
    const duration = performance.now() - start
    this.marks.delete(label)
    return duration
  }

  assertUnder(label: string, maxMs: number) {
    const duration = this.end(label)
    expect(duration).toBeLessThan(maxMs)
    return duration
  }
}
