import type { APIResponse } from '@/types';

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with standardized error handling
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Parse response
    const data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.code || 'API_ERROR',
        data.error || data.message || 'An error occurred',
        data.details
      );
    }

    // Handle API-level errors (when response is ok but success is false)
    if (!data.success) {
      throw new ApiError(
        response.status,
        data.code || 'API_ERROR',
        data.error || data.message || 'An error occurred',
        data.details
      );
    }

    return data;
  } catch (error) {
    // Network errors or JSON parsing errors
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle abort errors (when query is cancelled)
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    // Generic network error
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

/**
 * GET request
 */
export async function apiGet<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch<T>(url, {
    ...options,
    method: 'GET',
  });
  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * PUT request
 */
export async function apiPut<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
  return response.data;
}

/**
 * Helper to handle authentication errors globally
 * Call this in your query retry function or error boundary
 */
export function handleAuthError(error: unknown): void {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    // Trigger logout or redirect to login
    // This can be enhanced to work with your auth store
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}
