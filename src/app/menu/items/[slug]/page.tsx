import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';
import { BreadcrumbGenerator } from '@/lib/navigation';
import {
  DetailPageLayout,
  DetailPageGrid,
  DetailPageSection,
} from '@/components/ui/detail-page-layout';
import { ProductGallery } from '@/components/ui/product-gallery';
import { ProductInformation } from '@/components/ui/product-information';
import { CustomizationInterface } from '@/components/ui/customization-interface';
import { RelatedItems } from '@/components/ui/related-items';
import { MenuItemAnalyticsWrapper } from '@/components/analytics/menu-item-analytics-wrapper';
import type { MenuItem } from '@/types';

interface MenuItemPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Get menu item by slug from database
async function getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
  try {
    // Convert slug back to name for database lookup
    const nameFromSlug = slug.replace(/-/g, ' ');

    const menuItem = await db.menuItem.findFirst({
      where: {
        name: { equals: nameFromSlug, mode: 'insensitive' },
      },
      include: {
        category: true,
        customizations: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!menuItem) {
      return null;
    }

    // Transform the data to match the expected format
    return {
      ...menuItem,
      basePrice: menuItem.basePrice,
      image: menuItem.image || '/placeholder-food.svg',
      images: menuItem.image ? [menuItem.image] : ['/placeholder-food.svg'],
      tags: menuItem.tags ? JSON.parse(menuItem.tags) : [],
      status: menuItem.status.toLowerCase() as
        | 'active'
        | 'inactive'
        | 'sold_out'
        | 'low_stock',
      slug: generateSlug(menuItem.name),
      customizations: menuItem.customizations.map(customization => ({
        ...customization,
        type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
        options: customization.options.map(option => ({
          ...option,
          isAvailable: true, // Default to available
        })),
      })),
    } as MenuItem;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return null;
  }
}

// Get related items from database
async function getRelatedItems(
  currentItemId: string,
  categoryId: string
): Promise<MenuItem[]> {
  try {
    // Find related items from the same category, excluding the current item
    const relatedItems = await db.menuItem.findMany({
      where: {
        AND: [
          { categoryId: categoryId },
          { id: { not: currentItemId } },
          { status: 'ACTIVE' },
        ],
      },
      include: {
        category: true,
        customizations: {
          include: {
            options: true,
          },
        },
      },
      take: 6, // Limit to 6 related items
      orderBy: {
        name: 'asc',
      },
    });

    // If we don't have enough items from the same category, get popular items from other categories
    if (relatedItems.length < 4) {
      const additionalItems = await db.menuItem.findMany({
        where: {
          AND: [
            { categoryId: { not: categoryId } },
            { id: { not: currentItemId } },
            { status: 'ACTIVE' },
          ],
        },
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
        },
        take: 4 - relatedItems.length,
        orderBy: {
          name: 'asc',
        },
      });

      relatedItems.push(...additionalItems);
    }

    // Transform the data to match the expected format
    return relatedItems.map(item => ({
      ...item,
      basePrice: item.basePrice,
      image: item.image || '/placeholder-food.svg',
      images: item.image ? [item.image] : ['/placeholder-food.svg'],
      tags: item.tags ? JSON.parse(item.tags) : [],
      status: item.status.toLowerCase() as
        | 'active'
        | 'inactive'
        | 'sold_out'
        | 'low_stock',
      slug: generateSlug(item.name),
      customizations: item.customizations.map(customization => ({
        ...customization,
        type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
        options: customization.options.map(option => ({
          ...option,
          isAvailable: true, // Default to available
        })),
      })),
    })) as MenuItem[];
  } catch (error) {
    console.error('Error fetching related items:', error);
    return [];
  }
}

// Generate static params for all menu items
export async function generateStaticParams() {
  try {
    const menuItems = await db.menuItem.findMany({
      select: {
        name: true,
      },
    });

    return menuItems.map(item => ({
      slug: generateSlug(item.name),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: MenuItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);

  if (!item) {
    return {
      title: 'Menu Item Not Found - Mina Kitchen',
      description: 'The requested menu item could not be found.',
    };
  }

  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://minakitchen.ca'}/menu/items/${slug}`;

  return {
    title:
      item.seoTitle ||
      `${item.name} - Authentic African Cuisine | Mina Kitchen`,
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

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedItems(item.id, item.category.id);

  // Generate breadcrumbs
  const breadcrumbs = BreadcrumbGenerator.forMenuItem(item);

  return (
    <MenuItemAnalyticsWrapper item={item}>
      <DetailPageLayout breadcrumbItems={breadcrumbs}>
        <DetailPageGrid
          gallery={
            <ProductGallery
              images={item.images || [item.image]}
              alt={item.name}
            />
          }
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
                  <h3 className="mb-2 text-sm font-medium text-gray-900">
                    Preparation Time
                  </h3>
                  <p className="text-sm text-gray-600">
                    Approximately {item.preparationTime} minutes
                  </p>
                </div>
              )}

              {/* Allergen Information */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="rounded-lg bg-yellow-50 p-4" role="alert">
                  <h3 className="mb-2 text-sm font-medium text-yellow-800">
                    Allergen Information
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Contains: {item.allergens.join(', ')}
                  </p>
                </div>
              )}

              <CustomizationInterface item={item} />
            </div>
          }
        />

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <DetailPageSection className="mt-12">
            <RelatedItems items={relatedItems} title="You Might Also Like" />
          </DetailPageSection>
        )}
      </DetailPageLayout>
    </MenuItemAnalyticsWrapper>
  );
}
