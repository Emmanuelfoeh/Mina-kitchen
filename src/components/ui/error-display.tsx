/**
 * Inline Error Display Components
 *
 * Reusable components for displaying errors in various contexts.
 */
'use client';

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Shield, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getErrorMessage,
  getErrorDescription,
  getErrorCategory,
  ErrorCategory,
  formatErrorWithValidation,
} from '@/lib/error-utils';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'destructive';
  showDetails?: boolean;
}

/**
 * ErrorAlert - Alert component for displaying errors
 */
export function ErrorAlert({
  error,
  onRetry,
  className,
  variant = 'destructive',
  showDetails = false,
}: Readonly<ErrorAlertProps>) {
  const category = getErrorCategory(error);
  const message = getErrorMessage(error);
  const description = getErrorDescription(error);

  const getIcon = () => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <WifiOff className="h-4 w-4" />;
      case ErrorCategory.AUTH:
        return <Shield className="h-4 w-4" />;
      case ErrorCategory.NOT_FOUND:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={variant} className={className}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <AlertTitle className="mb-1">{message}</AlertTitle>
          <AlertDescription>
            {description !== message && <p className="mb-2">{description}</p>}
            {showDetails && process.env.NODE_ENV === 'development' && (
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(error, null, 2)}
              </pre>
            )}
          </AlertDescription>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

interface InlineErrorProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * InlineError - Compact inline error display
 */
export function InlineError({
  error,
  onRetry,
  className,
  compact = false,
}: Readonly<InlineErrorProps>) {
  const message = getErrorMessage(error);
  const category = getErrorCategory(error);

  const bgColor = {
    [ErrorCategory.NETWORK]: 'bg-blue-50 border-blue-200',
    [ErrorCategory.AUTH]: 'bg-yellow-50 border-yellow-200',
    [ErrorCategory.VALIDATION]: 'bg-orange-50 border-orange-200',
    [ErrorCategory.NOT_FOUND]: 'bg-gray-50 border-gray-200',
    [ErrorCategory.SERVER]: 'bg-red-50 border-red-200',
    [ErrorCategory.UNKNOWN]: 'bg-gray-50 border-gray-200',
  }[category];

  const textColor = {
    [ErrorCategory.NETWORK]: 'text-blue-700',
    [ErrorCategory.AUTH]: 'text-yellow-700',
    [ErrorCategory.VALIDATION]: 'text-orange-700',
    [ErrorCategory.NOT_FOUND]: 'text-gray-700',
    [ErrorCategory.SERVER]: 'text-red-700',
    [ErrorCategory.UNKNOWN]: 'text-gray-700',
  }[category];

  const iconColor = {
    [ErrorCategory.NETWORK]: 'text-blue-600',
    [ErrorCategory.AUTH]: 'text-yellow-600',
    [ErrorCategory.VALIDATION]: 'text-orange-600',
    [ErrorCategory.NOT_FOUND]: 'text-gray-600',
    [ErrorCategory.SERVER]: 'text-red-600',
    [ErrorCategory.UNKNOWN]: 'text-gray-600',
  }[category];

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3',
        bgColor,
        className
      )}
    >
      <AlertCircle className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', textColor, compact && 'leading-tight')}>
          {message}
        </p>
        {onRetry && !compact && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="mt-2 h-auto px-2 py-1 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
}

/**
 * QueryError - Error display optimized for query failures
 */
export function QueryError({
  error,
  onRetry,
  emptyMessage,
}: Readonly<QueryErrorProps>) {
  const category = getErrorCategory(error);
  const { title, description } = formatErrorWithValidation(error);

  // Handle 404 differently
  if (category === ErrorCategory.NOT_FOUND) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-gray-500">{emptyMessage || 'No data found'}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mb-4 max-w-md text-sm text-gray-600">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="bg-[#f2330d] hover:bg-[#d12b0a]">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface ValidationErrorsProps {
  errors: Record<string, string[]>;
  className?: string;
}

/**
 * ValidationErrors - Display validation error messages
 */
export function ValidationErrors({
  errors,
  className,
}: Readonly<ValidationErrorsProps>) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-orange-200 bg-orange-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
        <div className="flex-1">
          <p className="mb-2 text-sm font-semibold text-orange-900">
            Please fix the following errors:
          </p>
          <ul className="space-y-1">
            {errorEntries.map(([field, messages]) => (
              <li key={field} className="text-sm text-orange-700">
                <span className="font-medium capitalize">
                  {field.replaceAll('_', ' ')}:
                </span>{' '}
                {messages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState - Display when no data is available (not an error)
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: Readonly<EmptyStateProps>) {
  return (
    <div className={cn('py-12 text-center', className)}>
      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-4">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mx-auto mb-4 max-w-md text-sm text-gray-600">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
