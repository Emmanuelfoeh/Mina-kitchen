'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import type { Tenant } from '@/types';

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  branding: {
    name: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    businessEmail: string;
    businessPhone: string;
  } | null;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
  branding: null,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: tenant, isLoading } = useTenant();

  const branding = tenant
    ? {
        name: tenant.name,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        accentColor: tenant.accentColor,
        businessEmail: tenant.businessEmail,
        businessPhone: tenant.businessPhone,
      }
    : null;

  // Inject CSS variables for tenant colors
  if (typeof window !== 'undefined' && branding) {
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', branding.primaryColor);
    root.style.setProperty('--tenant-secondary', branding.secondaryColor);
    root.style.setProperty('--tenant-accent', branding.accentColor);
  }

  return (
    <TenantContext.Provider
      value={{ tenant: tenant || null, isLoading, branding }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}

/**
 * Hook to check if a feature is available for current tenant's plan
 */
export function useTenantFeature() {
  const { tenant } = useTenantContext();

  const hasFeature = (feature: string): boolean => {
    if (!tenant) return false;

    const planFeatures: Record<string, string[]> = {
      TRIAL: ['basic_menu', 'basic_orders'],
      STARTER: ['basic_menu', 'basic_orders', 'analytics'],
      PROFESSIONAL: [
        'basic_menu',
        'basic_orders',
        'analytics',
        'marketing',
        'custom_domain',
        'advanced_reports',
      ],
      ENTERPRISE: [
        'basic_menu',
        'basic_orders',
        'analytics',
        'marketing',
        'custom_domain',
        'advanced_reports',
        'api_access',
        'white_label',
        'priority_support',
      ],
    };

    return planFeatures[tenant.plan]?.includes(feature) || false;
  };

  const canUseFeature = (feature: string): boolean => {
    if (!tenant) return false;

    // Check if tenant is active
    if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
      return false;
    }

    // Check if trial expired
    if (
      tenant.status === 'TRIAL' &&
      tenant.trialEndsAt &&
      new Date(tenant.trialEndsAt) < new Date()
    ) {
      return false;
    }

    return hasFeature(feature);
  };

  return {
    hasFeature,
    canUseFeature,
    plan: tenant?.plan || 'TRIAL',
    status: tenant?.status || 'TRIAL',
  };
}
