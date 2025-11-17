/**
 * Example Component Test
 *
 * Demonstrates best practices for testing React components
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithUserEvent } from '../utils/render-helpers'
import { axe } from 'jest-axe'

// Example component for testing
const ExampleButton: React.FC<{
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}> = ({ onClick, children, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Example button"
      data-testid="example-button"
    >
      {children}
    </button>
  )
}

describe('ExampleButton Component', () => {
  it('should render button with text', () => {
    // Arrange & Act
    const { container } = renderWithUserEvent(
      <ExampleButton onClick={() => {}}>Click me</ExampleButton>
    )

    // Assert
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    // Arrange
    const handleClick = jest.fn()
    const { user } = renderWithUserEvent(
      <ExampleButton onClick={handleClick}>Click me</ExampleButton>
    )

    // Act
    const button = screen.getByRole('button')
    await user.click(button)

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    // Arrange
    const handleClick = jest.fn()
    const { user } = renderWithUserEvent(
      <ExampleButton onClick={handleClick} disabled>
        Click me
      </ExampleButton>
    )

    // Act
    const button = screen.getByRole('button')
    await user.click(button)

    // Assert
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('should be keyboard accessible', async () => {
    // Arrange
    const handleClick = jest.fn()
    const { user } = renderWithUserEvent(
      <ExampleButton onClick={handleClick}>Click me</ExampleButton>
    )

    // Act
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should have no accessibility violations', async () => {
    // Arrange & Act
    const { container } = renderWithUserEvent(
      <ExampleButton onClick={() => {}}>Click me</ExampleButton>
    )

    // Assert
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA attributes', () => {
    // Arrange & Act
    renderWithUserEvent(
      <ExampleButton onClick={() => {}}>Click me</ExampleButton>
    )

    // Assert
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Example button')
  })
})

// Example of testing a component with async data
const AsyncDataComponent: React.FC = () => {
  const [data, setData] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      setData('Loaded data')
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }

  return <div data-testid="data">{data}</div>
}

describe('AsyncDataComponent', () => {
  it('should show loading state initially', () => {
    // Arrange & Act
    renderWithUserEvent(<AsyncDataComponent />)

    // Assert
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display data after loading', async () => {
    // Arrange & Act
    renderWithUserEvent(<AsyncDataComponent />)

    // Assert - wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument()
    })
    expect(screen.getByText('Loaded data')).toBeInTheDocument()
  })

  it('should not show loading indicator after data loads', async () => {
    // Arrange & Act
    renderWithUserEvent(<AsyncDataComponent />)

    // Assert
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  })
})
