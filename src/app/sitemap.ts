import { MetadataRoute } from 'next';
import { getRequestBaseUrl } from '@/lib/tenant-metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Per-tenant: derive the base URL from the request host so each tenant's
  // sitemap references its own domain.
  const baseUrl = await getRequestBaseUrl();

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

  try {
    // Fetch dynamic menu items and packages from API
    const [menuItemsResponse, packagesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/menu/items`),
      fetch(`${baseUrl}/api/packages`),
    ]);

    let menuItemPages: MetadataRoute.Sitemap = [];
    let packagePages: MetadataRoute.Sitemap = [];

    // Add menu item pages if API is available
    if (menuItemsResponse.ok) {
      const menuItemsData: {
        success?: boolean;
        data?: Array<{ slug: string; updatedAt?: string }>;
      } = await menuItemsResponse.json();
      if (menuItemsData.success && menuItemsData.data) {
        menuItemPages = menuItemsData.data.map(item => ({
          url: `${baseUrl}/menu/items/${item.slug}`,
          lastModified: new Date(item.updatedAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }

    // Add package pages if API is available
    if (packagesResponse.ok) {
      const packagesData: {
        success?: boolean;
        data?: Array<{ slug: string; updatedAt?: string }>;
      } = await packagesResponse.json();
      if (packagesData.success && packagesData.data) {
        packagePages = packagesData.data.map(pkg => ({
          url: `${baseUrl}/packages/${pkg.slug}`,
          lastModified: new Date(pkg.updatedAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }

    return [...staticPages, ...menuItemPages, ...packagePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if API fails
    return staticPages;
  }
}
