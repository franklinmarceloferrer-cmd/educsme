import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorService } from '@/services/errorService';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorService.critical('React Error Boundary caught error', {
      component: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    }, error);

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          
          <p className="text-center text-muted-foreground max-w-md">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 p-4 bg-muted rounded-md text-sm max-w-2xl overflow-auto">
              <summary className="cursor-pointer font-medium mb-2">Error Details (Development)</summary>
              <pre className="whitespace-pre-wrap text-xs">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}

          <div className="flex space-x-2">
            <Button onClick={this.handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: Partial<Parameters<typeof errorService.error>[1]>) => {
    errorService.error('Unhandled error', {
      component: 'useErrorHandler',
      ...context,
    }, error);
  };

  return { handleError };
};