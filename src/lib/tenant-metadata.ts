import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTenantFromHostname } from '@/lib/tenant';

/**
 * Generate tenant-specific metadata for SEO
 */
export async function generateTenantMetadata(
  customTitle?: string,
  customDescription?: string
): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  const tenant = await getTenantFromHostname(hostname);

  const title = customTitle || tenant?.name || 'Mina Kitchen';
  const description =
    customDescription ||
    `Order delicious food from ${tenant?.name || 'Mina Kitchen'}. Fresh ingredients, authentic flavors, delivered to your door.`;

  return {
    title,
    description,
    keywords: [
      'food delivery',
      'restaurant',
      'online ordering',
      tenant?.name || 'Mina Kitchen',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      images: tenant?.logo
        ? [{ url: tenant.logo, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tenant?.logo ? [tenant.logo] : [],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

/**
 * Get tenant-specific theme colors
 */
export async function getTenantThemeColor(): Promise<string> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  const tenant = await getTenantFromHostname(hostname);
  return tenant?.primaryColor || '#ef4444';
}
