import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateSlug } from '@/lib/utils';
import { BreadcrumbGenerator } from '@/lib/navigation';
import {
  initializeScreenReaderSupport,
  announceNavigation,
} from '@/lib/screen-reader';
import {
  getRelatedItemsForPackage,
  getRelatedPackages,
} from '@/lib/recommendations';
import {
  DetailPageLayout,
  DetailPageGrid,
  DetailPageSection,
  ResponsiveCardGrid,
} from '@/components/ui/detail-page-layout';
import { ProductGallery } from '@/components/ui/product-gallery';
import { ProductInformation } from '@/components/ui/product-information';
import { PackageCustomizationInterface } from '@/components/ui/package-customization-interface';
import { RelatedItems, RelatedPackages } from '@/components/ui/related-items';
import { PackagePageSkeleton } from '@/components/ui/detail-page-skeleton';
import { PackageAnalyticsWrapper } from '@/components/analytics/package-analytics-wrapper';
import type { Package, MenuItem } from '@/types';

interface PackagePageProps {
  params: {
    slug: string;
  };
}

// Fetch package data from API
async function getPackageBySlug(slug: string): Promise<Package | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/packages/slug/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching package:', error);
    return null;
  }
}

// Fetch all packages for static generation and related packages
async function getAllPackages(): Promise<Package[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/packages`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

// Fetch all menu items
async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu/items`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

// Generate static params for all packages
export async function generateStaticParams() {
  const packages = await getAllPackages();
  return packages.map(pkg => ({
    slug: pkg.slug || generateSlug(pkg.name),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    return {
      title: 'Package Not Found - Mina Kitchen',
      description: 'The requested meal package could not be found.',
    };
  }

  const individualPrice = calculateIndividualPrice(pkg);
  const savings = individualPrice - pkg.price;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://minakitchen.com'}/packages/${slug}`;

  return {
    title:
      pkg.seoTitle ||
      `${pkg.name} - Authentic African Meal Package | Mina Kitchen`,
    description:
      pkg.seoDescription ||
      `${pkg.description} Save ${savings.toFixed(2)} with this curated meal package. Order online for delivery or pickup.`,
    keywords: [
      'African food package',
      'meal deal',
      'authentic cuisine',
      pkg.name,
      pkg.type,
    ],
    openGraph: {
      title: pkg.name,
      description: pkg.description,
      images: pkg.image
        ? [
            {
              url: pkg.image,
              width: 1200,
              height: 630,
              alt: pkg.name,
            },
          ]
        : [],
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: pkg.name,
      description: pkg.description,
      images: pkg.image ? [pkg.image] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

function getMenuItemById(menuItems: MenuItem[], id: string): MenuItem | null {
  return menuItems.find(item => item.id === id) || null;
}

function calculateIndividualPrice(pkg: Package): number {
  return pkg.includedItems.reduce((total, packageItem) => {
    // If the package item includes the menu item data, use it directly
    if ('menuItem' in packageItem && packageItem.menuItem) {
      return (
        total + (packageItem.menuItem as any).basePrice * packageItem.quantity
      );
    }
    return total;
  }, 0);
}

// Loading component for the page
function PackagePageLoadingSkeleton() {
  return <PackagePageSkeleton />;
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  // Fetch related data
  const [allPackages, allMenuItems] = await Promise.all([
    getAllPackages(),
    getAllMenuItems(),
  ]);

  // Initialize screen reader support
  if (typeof window !== 'undefined') {
    initializeScreenReaderSupport();

    // Announce navigation
    const breadcrumbItems = BreadcrumbGenerator.forPackage(pkg);
    const breadcrumbPath = breadcrumbItems.map(item => item.label);
    announceNavigation(pkg.name, breadcrumbPath);
  }

  const individualPrice = calculateIndividualPrice(pkg);
  const savings = individualPrice - pkg.price;

  const breadcrumbItems = BreadcrumbGenerator.forPackage(pkg);

  const images = pkg.image ? [pkg.image] : [];

  // Get related items and packages for recommendations
  const relatedItems = getRelatedItemsForPackage(pkg, allMenuItems, 6);
  const relatedPackages = getRelatedPackages(pkg, allPackages, 3);

  return (
    <Suspense fallback={<PackagePageLoadingSkeleton />}>
      <PackageAnalyticsWrapper package={pkg}>
        <DetailPageLayout
          breadcrumbItems={breadcrumbItems}
          backButtonFallback="/packages"
        >
          <DetailPageGrid
            gallery={<ProductGallery images={images} alt={pkg.name} />}
            information={
              <div className="space-y-6">
                <ProductInformation
                  name={pkg.name}
                  price={pkg.price}
                  originalPrice={individualPrice}
                  savings={savings}
                  description={pkg.description}
                />

                {/* Package Type Badge */}
                <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)} Package
                </div>

                {/* Savings Highlight */}
                {savings > 0 && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-green-800">
                      Great Value!
                    </h3>
                    <p className="text-green-700">
                      Save ${savings.toFixed(2)} compared to ordering items
                      individually
                    </p>
                    <p className="text-sm text-green-600">
                      That's a {Math.round((savings / individualPrice) * 100)}%
                      discount!
                    </p>
                  </div>
                )}

                {/* Package Features */}
                {pkg.features.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">
                      Package Features
                    </h3>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-green-600">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Package Customization Interface */}
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Customize Your Package
                  </h3>
                  <PackageCustomizationInterface
                    package={pkg}
                    menuItems={allMenuItems}
                  />
                </div>
              </div>
            }
          />

          {/* Package Contents */}
          <DetailPageSection title="What's Included">
            <div className="mb-4 rounded-lg bg-gray-50 p-3 sm:mb-6 sm:p-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {pkg.includedItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    Total Items
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {
                      new Set(
                        pkg.includedItems
                          .map(item => {
                            if ('menuItem' in item && item.menuItem) {
                              return (item.menuItem as any).category?.name;
                            }
                            return null;
                          })
                          .filter(Boolean)
                      ).size
                    }
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600 sm:text-xl">
                    ${savings.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">You Save</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600 sm:text-xl">
                    {Math.round((savings / individualPrice) * 100)}%
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">Discount</p>
                </div>
              </div>
            </div>

            <ResponsiveCardGrid variant="default">
              {pkg.includedItems.map((packageItem, index) => {
                // Get menu item from the included data
                const menuItem =
                  'menuItem' in packageItem
                    ? (packageItem.menuItem as any)
                    : null;
                if (!menuItem) return null;

                return (
                  <div
                    key={index}
                    className="rounded-lg border p-3 transition-shadow hover:shadow-md sm:p-4"
                  >
                    <div className="mb-3 aspect-video overflow-hidden rounded-md bg-gray-100">
                      {menuItem.image ? (
                        <img
                          src={menuItem.image}
                          alt={menuItem.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                        {menuItem.name}
                      </h3>
                      {packageItem.quantity > 1 && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          x{packageItem.quantity}
                        </span>
                      )}
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                      {menuItem.description}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">
                        {menuItem.category?.name}
                      </span>
                      <span className="font-medium text-green-600">
                        ${menuItem.basePrice?.toFixed(2)} each
                      </span>
                    </div>
                    {packageItem.includedCustomizations &&
                      packageItem.includedCustomizations.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Includes:{' '}
                          {packageItem.includedCustomizations.join(', ')}
                        </div>
                      )}
                  </div>
                );
              })}
            </ResponsiveCardGrid>
          </DetailPageSection>

          {/* Related Items Section */}
          {relatedItems.length > 0 && (
            <DetailPageSection title="">
              <RelatedItems
                items={relatedItems}
                title="Add Individual Items"
                className="mt-8"
              />
            </DetailPageSection>
          )}

          {/* Related Packages Section */}
          {relatedPackages.length > 0 && (
            <DetailPageSection title="">
              <RelatedPackages
                packages={relatedPackages}
                title="Other Packages You Might Like"
                className="mt-8"
              />
            </DetailPageSection>
          )}
        </DetailPageLayout>
      </PackageAnalyticsWrapper>
    </Suspense>
  );
}
