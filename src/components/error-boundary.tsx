'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logError, getErrorMessage } from '@/lib/error-utils';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: unknown[];
  level?: 'app' | 'page' | 'section';
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 *
 * Catches React errors and TanStack Query errors in the component tree.
 * Provides a user-friendly error UI with smart retry functionality.
 *
 * Features:
 * - Multiple severity levels (app, page, section)
 * - Smart retry (doesn't reload page unnecessarily)
 * - Custom reset handlers
 * - Reset on prop changes (resetKeys)
 * - Detailed error logging
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store error info for debugging
    this.setState({ errorInfo });

    // Log error with context
    logError(error, {
      component: 'ErrorBoundary',
      metadata: {
        level: this.props.level || 'app',
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
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private readonly handleReset = () => {
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Reset error state
    this.reset();

    // For app-level errors, reload the page
    if (this.props.level === 'app') {
      globalThis.location.reload();
    }
  };

  private getErrorUI() {
    const { level = 'app', showHomeButton = true } = this.props;
    const error = this.state.error;

    // App-level error - full screen
    if (level === 'app') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We encountered an unexpected error. Please try reloading the
                application.
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="rounded-lg bg-gray-100 p-3">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Error details:
                  </p>
                  <pre className="overflow-auto text-xs text-gray-600">
                    {getErrorMessage(error)}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-gray-700">
                        Component Stack
                      </summary>
                      <pre className="mt-1 overflow-auto text-xs text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-[#f2330d] hover:bg-[#d12b0a]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload App
                </Button>
                {showHomeButton && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Page-level error - contained card
    if (level === 'page') {
      return (
        <div className="flex min-h-100 items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle>Unable to load page</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This page encountered an error. You can try again or return
                home.
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="rounded-lg bg-gray-100 p-2">
                  <pre className="overflow-auto text-xs text-gray-600">
                    {getErrorMessage(error)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                {showHomeButton && (
                  <Button
                    asChild
                    className="flex-1 bg-[#f2330d] hover:bg-[#d12b0a]"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Section-level error - inline alert
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              Error loading content
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {process.env.NODE_ENV === 'development' && error
                ? getErrorMessage(error)
                : 'This section failed to load. Please try again.'}
            </p>
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      return this.getErrorUI();
    }

    return this.props.children;
  }
}
