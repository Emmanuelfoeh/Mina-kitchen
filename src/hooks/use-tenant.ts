import { useQuery } from '@tanstack/react-query';
import type { Tenant } from '@/types';

/**
 * Hook to get current tenant information from server
 * This is primarily for displaying tenant branding in the UI
 */
export function useTenant() {
  return useQuery<Tenant | null>({
    queryKey: ['tenant', 'current'],
    queryFn: async () => {
      const response = await fetch('/api/tenant/current');
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch tenant');
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

/**
 * Hook to get tenant branding (colors, logo, etc.)
 */
export function useTenantBranding() {
  const { data: tenant, isLoading } = useTenant();

  return {
    isLoading,
    branding: tenant
      ? {
          name: tenant.name,
          logo: tenant.logo,
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          accentColor: tenant.accentColor,
          businessEmail: tenant.businessEmail,
          businessPhone: tenant.businessPhone,
        }
      : null,
  };
}

/**
 * Hook for super admins to manage all tenants
 */
export function useTenants() {
  return useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await fetch('/api/admin/tenants');
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }
      const data = await response.json();
      return data.data.tenants;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}
