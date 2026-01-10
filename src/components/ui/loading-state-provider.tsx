'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingStateContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

const LoadingStateContext = createContext<LoadingStateContextType | undefined>(
  undefined
);

interface LoadingStateProviderProps {
  children: ReactNode;
}

export function LoadingStateProvider({ children }: LoadingStateProviderProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const value = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
  };

  return (
    <LoadingStateContext.Provider value={value}>
      {children}
    </LoadingStateContext.Provider>
  );
}

export function useLoadingState() {
  const context = useContext(LoadingStateContext);
  if (context === undefined) {
    throw new Error(
      'useLoadingState must be used within a LoadingStateProvider'
    );
  }
  return context;
}

// Hook for managing component-specific loading states
export function useComponentLoading(componentKey: string) {
  const { setLoading, isLoading } = useLoadingState();

  const setComponentLoading = useCallback(
    (loading: boolean) => {
      setLoading(componentKey, loading);
    },
    [componentKey, setLoading]
  );

  const isComponentLoading = useCallback(() => {
    return isLoading(componentKey);
  }, [componentKey, isLoading]);

  return {
    setLoading: setComponentLoading,
    isLoading: isComponentLoading,
  };
}

// Loading indicator component
interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingIndicator({
  size = 'md',
  className = '',
  text,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-gray-300 border-t-gray-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );
}

// Global loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  text = 'Loading...',
  className = '',
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <LoadingIndicator size="lg" text={text} />
      </div>
    </div>
  );
}

// Page loading wrapper
interface PageLoadingWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageLoadingWrapper({
  isLoading,
  skeleton,
  children,
  className = '',
}: PageLoadingWrapperProps) {
  return <div className={className}>{isLoading ? skeleton : children}</div>;
}
