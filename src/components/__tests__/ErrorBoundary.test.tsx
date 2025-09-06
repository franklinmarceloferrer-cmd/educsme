import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { errorService } from '@/services/errorService';

// Mock the error service
vi.mock('@/services/errorService', () => ({
  errorService: {
    critical: vi.fn(),
  },
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText, getByRole } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /refresh page/i })).toBeInTheDocument();

    // Verify error service was called
    expect(errorService.critical).toHaveBeenCalledWith(
      'React Error Boundary caught error',
      expect.objectContaining({
        component: 'ErrorBoundary',
        metadata: expect.objectContaining({
          errorBoundary: true,
        }),
      }),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const customFallback = <div>Custom error message</div>;

    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Custom error message')).toBeInTheDocument();
    expect(queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});