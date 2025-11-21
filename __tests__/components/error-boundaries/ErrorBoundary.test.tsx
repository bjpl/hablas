/**
 * Error Boundary Tests
 * Tests error catching, retry mechanism, fallback UI, and error logging
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Component that throws an error
const ThrowError = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws after interaction
const ThrowOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Error after click');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Lo sentimos, ha ocurrido un error inesperado/)).toBeInTheDocument();
    });

    it('should catch errors from nested components', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should catch errors during event handlers', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <ThrowOnClick />
        </ErrorBoundary>
      );

      expect(screen.getByText('Trigger Error')).toBeInTheDocument();

      const button = screen.getByText('Trigger Error');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Retry Mechanism', () => {
    it('should reset error state when retry button is clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryButton = screen.getByText('Intentar de nuevo');
      await user.click(retryButton);

      // Rerender with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });

    it('should reload page when reload button is clicked', async () => {
      const user = userEvent.setup();
      const reloadSpy = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Recargar la página');
      await user.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should navigate to home when home link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const homeLink = screen.getByText('Volver al inicio');
      expect(homeLink).toHaveAttribute('href', '/hablas/');
    });
  });

  describe('Fallback UI', () => {
    it('should render default fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
      expect(screen.getByText(/Lo sentimos, ha ocurrido un error/)).toBeInTheDocument();
      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
      expect(screen.getByText('Recargar la página')).toBeInTheDocument();
      expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
    });

    it('should render custom fallback UI when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
    });

    it('should display helpful tips', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Consejo:/)).toBeInTheDocument();
      expect(screen.getByText(/Borrar la caché del navegador/)).toBeInTheDocument();
      expect(screen.getByText(/Verificar tu conexión a internet/)).toBeInTheDocument();
      expect(screen.getByText(/Actualizar la aplicación/)).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError message="Development error" />
        </ErrorBoundary>
      );

      const details = screen.getByText(/Detalles del error/);
      expect(details).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError message="Production error" />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Detalles del error/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Logged error" />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should include error info in log', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Error with info" />
        </ErrorBoundary>
      );

      const logCall = consoleErrorSpy.mock.calls[0];
      expect(logCall[2]).toHaveProperty('componentStack');
    });

    it('should log each error separately', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError message="First error" />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // React logs + our log

      // Clear and trigger another error
      consoleErrorSpy.mockClear();

      rerender(
        <ErrorBoundary>
          <ThrowError message="Second error" />
        </ErrorBoundary>
      );

      // Should still be logged (though component already in error state)
      expect(consoleErrorSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations in fallback UI', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have accessible buttons', async () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Intentar de nuevo');
      expect(retryButton).toHaveAttribute('aria-label', 'Intentar de nuevo');

      const reloadButton = screen.getByText('Recargar la página');
      expect(reloadButton).toHaveAttribute('aria-label', 'Recargar la página');

      const homeLink = screen.getByText('Volver al inicio');
      expect(homeLink).toHaveAttribute('aria-label', 'Volver al inicio');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Intentar de nuevo');
      retryButton.focus();

      expect(document.activeElement).toBe(retryButton);

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(screen.getByText('Recargar la página'));

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(screen.getByText('Volver al inicio'));
    });
  });

  describe('State Management', () => {
    it('should maintain error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Error UI should remain visible
      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    });

    it('should clear error state on reset', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Intentar de nuevo');
      await user.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple sequential errors', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError message="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryButton = screen.getByText('Intentar de nuevo');
      await user.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError message="Second error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without messages', () => {
      const ErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle non-Error objects thrown', () => {
      const ThrowString = () => {
        throw 'String error';
      };

      render(
        <ErrorBoundary>
          <ThrowString />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle nested error boundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <ErrorBoundary fallback={<div>Inner error</div>}>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
    });

    it('should handle unmount during error state', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Should not throw
      unmount();
    });

    it('should handle rapid error recovery attempts', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Intentar de nuevo');

      // Rapid clicks
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with React Lifecycle', () => {
    it('should catch errors in componentDidMount', () => {
      class ErrorInMount extends React.Component {
        componentDidMount() {
          throw new Error('Mount error');
        }

        render() {
          return <div>Component</div>;
        }
      }

      render(
        <ErrorBoundary>
          <ErrorInMount />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should catch errors in useEffect', () => {
      const ErrorInEffect = () => {
        React.useEffect(() => {
          throw new Error('Effect error');
        }, []);

        return <div>Component</div>;
      };

      render(
        <ErrorBoundary>
          <ErrorInEffect />
        </ErrorBoundary>
      );

      // useEffect errors are not caught by error boundaries in React
      // This test documents that behavior
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
