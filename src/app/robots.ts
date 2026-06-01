import type { MetadataRoute } from 'next';
import { getRequestBaseUrl } from '@/lib/tenant-metadata';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Per-tenant: the sitemap reference must point at the requesting tenant's
  // own host, not a single hardcoded domain.
  const baseUrl = await getRequestBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
