/**
 * Query Error Boundary
 *
 * Specialized error boundary for wrapping TanStack Query-heavy sections.
 * Provides query cache reset and better error recovery.
 */
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logError, getErrorMessage } from '@/lib/error-utils';

interface Props {
  children: ReactNode;
  queryKey?: unknown[];
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Query Error Boundary Class Component
 */
class QueryErrorBoundaryClass extends Component<
  Props & {
    queryClient?: {
      invalidateQueries: (options: { queryKey: unknown[] }) => Promise<void>;
    };
  },
  State
> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      component: 'QueryErrorBoundary',
      metadata: {
        queryKey: this.props.queryKey
          ? JSON.stringify(this.props.queryKey)
          : undefined,
        componentStack: errorInfo.componentStack,
      },
    });
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys !== this.props.resetKeys
    ) {
      this.reset();
    }
  }

  private readonly reset = () => {
    this.setState({ hasError: false, error: null });
  };

  private readonly handleReset = async () => {
    const { queryClient, queryKey, onReset } = this.props;

    // Invalidate specific query if queryKey provided
    if (queryClient && queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    }

    // Call custom reset handler
    if (onReset) {
      onReset();
    }

    // Reset error state
    this.reset();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                Failed to load data
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {process.env.NODE_ENV === 'development' && this.state.error
                  ? getErrorMessage(this.state.error)
                  : 'There was a problem loading this content. Please try again.'}
              </p>
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="mt-3 border-yellow-300 bg-yellow-100 text-yellow-900 hover:bg-yellow-200"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Query Error Boundary Wrapper Component
 *
 * Wraps the class component with useQueryClient hook
 */
export function QueryErrorBoundary(props: Readonly<Props>) {
  const queryClient = useQueryClient();

  return <QueryErrorBoundaryClass {...props} queryClient={queryClient} />;
}
