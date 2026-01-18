import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  try {
    // Fetch dynamic menu items and packages from API
    const [menuItemsResponse, packagesResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || baseUrl}/api/menu/items`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || baseUrl}/api/packages`),
    ]);

    let menuItemPages: any[] = [];
    let packagePages: any[] = [];

    // Add menu item pages if API is available
    if (menuItemsResponse.ok) {
      const menuItemsData = await menuItemsResponse.json();
      if (menuItemsData.success && menuItemsData.data) {
        menuItemPages = menuItemsData.data.map((item: any) => ({
          url: `${baseUrl}/menu/items/${item.slug}`,
          lastModified: new Date(item.updatedAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }

    // Add package pages if API is available
    if (packagesResponse.ok) {
      const packagesData = await packagesResponse.json();
      if (packagesData.success && packagesData.data) {
        packagePages = packagesData.data.map((pkg: any) => ({
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
