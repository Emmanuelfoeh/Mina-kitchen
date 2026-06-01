import { db } from './db';
import type { Tenant } from '@/types';

/**
 * Extract tenant subdomain from hostname
 * Examples:
 * - jollofhub.minakitchen.com -> jollofhub
 * - default.localhost:3000 -> default
 * - minakitchen.com -> default
 */
export function extractSubdomain(hostname: string): string {
  // Remove port if present
  const host = hostname.split(':')[0];

  // For localhost, treat as default tenant
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'default';
  }

  // Split by dots
  const parts = host.split('.');

  // If only domain (e.g., minakitchen.com), use default
  if (parts.length <= 2) {
    return 'default';
  }

  // Return first part as subdomain (e.g., jollofhub from jollofhub.minakitchen.com)
  return parts[0];
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(
  subdomain: string
): Promise<Tenant | null> {
  try {
    const tenant = await db.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return null;
    }

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain || undefined,
      logo: tenant.logo || undefined,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      accentColor: tenant.accentColor,
      businessEmail: tenant.businessEmail,
      businessPhone: tenant.businessPhone,
      description: tenant.description || undefined,
      plan: tenant.plan as Tenant['plan'],
      status: tenant.status as Tenant['status'],
      trialEndsAt: tenant.trialEndsAt || undefined,
      billingCycle: tenant.billingCycle as Tenant['billingCycle'],
      settings: JSON.parse(tenant.settings),
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

/**
 * Get tenant by custom domain
 */
export async function getTenantByDomain(
  domain: string
): Promise<Tenant | null> {
  try {
    const tenant = await db.tenant.findUnique({
      where: { customDomain: domain },
    });

    if (!tenant) {
      return null;
    }

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain || undefined,
      logo: tenant.logo || undefined,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      accentColor: tenant.accentColor,
      businessEmail: tenant.businessEmail,
      businessPhone: tenant.businessPhone,
      description: tenant.description || undefined,
      plan: tenant.plan as Tenant['plan'],
      status: tenant.status as Tenant['status'],
      trialEndsAt: tenant.trialEndsAt || undefined,
      billingCycle: tenant.billingCycle as Tenant['billingCycle'],
      settings: JSON.parse(tenant.settings),
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching tenant by domain:', error);
    return null;
  }
}

/**
 * Get tenant from request hostname
 * Tries custom domain first, then subdomain
 */
export async function getTenantFromHostname(
  hostname: string
): Promise<Tenant | null> {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Try custom domain first
  const tenantByDomain = await getTenantByDomain(host);
  if (tenantByDomain) {
    return tenantByDomain;
  }

  // Fall back to subdomain
  const subdomain = extractSubdomain(hostname);
  return getTenantBySubdomain(subdomain);
}

/**
 * Validate tenant is active and not suspended
 */
export function isTenantActive(tenant: Tenant): boolean {
  if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
    return false;
  }

  // Check if trial has expired
  if (
    tenant.status === 'TRIAL' &&
    tenant.trialEndsAt &&
    tenant.trialEndsAt < new Date()
  ) {
    return false;
  }

  return true;
}

/**
 * Get default tenant (for backward compatibility)
 */
export async function getDefaultTenant(): Promise<Tenant | null> {
  return getTenantBySubdomain('default');
}
