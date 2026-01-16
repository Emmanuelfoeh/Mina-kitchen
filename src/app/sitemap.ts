import { MetadataRoute } from 'next';
import { mockMenuItems, mockPackages } from '@/lib/mock-data';
import { generateSlug } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://minakitchen.ca';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Dynamic menu item pages
  const menuItemPages = mockMenuItems.map(item => ({
    url: `${baseUrl}/menu/items/${item.slug || generateSlug(item.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic package pages
  const packagePages = mockPackages.map(pkg => ({
    url: `${baseUrl}/packages/${pkg.slug || generateSlug(pkg.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...menuItemPages, ...packagePages];
}
