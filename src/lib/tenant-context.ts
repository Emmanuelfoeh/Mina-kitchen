import { headers } from 'next/headers';
import { getTenantFromHostname, isTenantActive } from '@/lib/tenant';
import type { Tenant } from '@/types';

/**
 * Get current tenant from request headers (Server Components & API Routes)
 * This reads the x-tenant-subdomain header set by middleware
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const headersList = await headers();
    const hostname = headersList.get('x-tenant-hostname') || 'localhost';

    // Get tenant from database
    const tenant = await getTenantFromHostname(hostname);

    if (!tenant) {
      console.warn(`Tenant not found for hostname: ${hostname}`);
      return null;
    }

    // Validate tenant is active
    if (!isTenantActive(tenant)) {
      console.warn(
        `Tenant ${tenant.subdomain} is not active (status: ${tenant.status})`
      );
      return null;
    }

    return tenant;
  } catch (error) {
    console.error('Error getting current tenant:', error);
    return null;
  }
}

/**
 * Get current tenant ID (convenience method)
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const tenant = await getCurrentTenant();
  return tenant?.id || null;
}

/**
 * Require tenant - throws error if tenant not found
 * Use this in API routes that must have a valid tenant
 */
export async function requireTenant(): Promise<Tenant> {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    throw new Error('Tenant not found or inactive');
  }

  return tenant;
}

/**
 * Get tenant subdomain from headers (lightweight check without DB query)
 */
export async function getTenantSubdomain(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-tenant-subdomain') || 'default';
}
