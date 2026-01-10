import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { mockMenuItems } from '@/lib/mock-data';
import { generateSlug } from '@/lib/utils';
import { BreadcrumbGenerator } from '@/lib/navigation';
import { getRecommendationsWithFallback } from '@/lib/recommendations';
import {
  initializeScreenReaderSupport,
  announceNavigation,
} from '@/lib/screen-reader';
import {
  DetailPageLayout,
  DetailPageGrid,
  DetailPageSection,
} from '@/components/ui/detail-page-layout';
import { ProductGallery } from '@/components/ui/product-gallery';
import { ProductInformation } from '@/components/ui/product-information';
import { CustomizationInterface } from '@/components/ui/customization-interface';
import { RelatedItems } from '@/components/ui/related-items';
import { MenuItemPageSkeleton } from '@/components/ui/detail-page-skeleton';
import { MenuItemAnalyticsWrapper } from '@/components/analytics/menu-item-analytics-wrapper';
import type { MenuItem } from '@/types';

interface MenuItemPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all menu items
export async function generateStaticParams() {
  return mockMenuItems.map(item => ({
    slug: item.slug || generateSlug(item.name),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: MenuItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getMenuItemBySlug(slug);

  if (!item) {
    return {
      title: 'Menu Item Not Found - AfroEats',
      description: 'The requested menu item could not be found.',
    };
  }

  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://afroeats.com'}/menu/items/${slug}`;

  return {
    title:
      item.seoTitle || `${item.name} - Authentic African Cuisine | AfroEats`,
    description:
      item.seoDescription ||
      `${item.description} Order online for delivery or pickup.`,
    keywords: ['African food', 'authentic cuisine', item.name, ...item.tags],
    openGraph: {
      title: item.name,
      description: item.description,
      images: [
        {
          url: item.image,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.name,
      description: item.description,
      images: [item.image],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

function getMenuItemBySlug(slug: string): MenuItem | null {
  return (
    mockMenuItems.find(
      item => (item.slug || generateSlug(item.name)) === slug
    ) || null
  );
}

// Loading component for the page
function MenuItemPageLoadingSkeleton() {
  return <MenuItemPageSkeleton />;
}

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug } = await params;
  const item = getMenuItemBySlug(slug);

  if (!item) {
    notFound();
  }

  // Initialize screen reader support
  if (typeof window !== 'undefined') {
    initializeScreenReaderSupport();

    // Announce navigation
    const breadcrumbItems = BreadcrumbGenerator.forMenuItem(item);
    const breadcrumbPath = breadcrumbItems.map(item => item.label);
    announceNavigation(item.name, breadcrumbPath);
  }

  const breadcrumbItems = BreadcrumbGenerator.forMenuItem(item);

  // Use images array if available, otherwise use single image
  const images =
    item.images && item.images.length > 0 ? item.images : [item.image];

  console.log('Menu item images:', images);
  // Get related items for recommendations
  const relatedItems = getRecommendationsWithFallback(item, mockMenuItems, 6);

  return (
    <Suspense fallback={<MenuItemPageLoadingSkeleton />}>
      <MenuItemAnalyticsWrapper item={item}>
        <DetailPageLayout
          breadcrumbItems={breadcrumbItems}
          backButtonFallback="/menu"
        >
          <DetailPageGrid
            gallery={<ProductGallery images={images} alt={item.name} />}
            information={
              <div className="space-y-6">
                <ProductInformation
                  name={item.name}
                  price={item.basePrice}
                  description={item.description}
                  tags={item.tags}
                  nutritionalInfo={item.nutritionalInfo}
                  chefNotes={item.chefNotes}
                />

                {/* Preparation Time */}
                {item.preparationTime && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3
                      className="mb-2 text-sm font-medium text-gray-900"
                      id="prep-time-heading"
                    >
                      Preparation Time
                    </h3>
                    <p
                      className="text-sm text-gray-600"
                      aria-labelledby="prep-time-heading"
                      aria-label={`Preparation time: approximately ${item.preparationTime} minutes`}
                    >
                      Approximately {item.preparationTime} minutes
                    </p>
                  </div>
                )}

                {/* Allergen Information */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="rounded-lg bg-yellow-50 p-4" role="alert">
                    <h3
                      className="mb-2 text-sm font-medium text-yellow-800"
                      id="allergen-heading"
                    >
                      Allergen Information
                    </h3>
                    <p
                      className="text-sm text-yellow-700"
                      aria-labelledby="allergen-heading"
                      aria-label={`Contains allergens: ${item.allergens.join(', ')}`}
                    >
                      Contains: {item.allergens.join(', ')}
                    </p>
                  </div>
                )}

                {/* Customization Interface */}
                <div className="border-t pt-6">
                  <h3
                    className="mb-4 text-lg font-semibold"
                    id="customization-heading"
                  >
                    Customize Your Order
                  </h3>
                  <div aria-labelledby="customization-heading">
                    <CustomizationInterface item={item} />
                  </div>
                </div>
              </div>
            }
          />

          {/* Related Items Section */}
          {relatedItems.length > 0 && (
            <DetailPageSection title="">
              <RelatedItems
                items={relatedItems}
                title="You Might Also Like"
                className="mt-8"
              />
            </DetailPageSection>
          )}
        </DetailPageLayout>
      </MenuItemAnalyticsWrapper>
    </Suspense>
  );
}
