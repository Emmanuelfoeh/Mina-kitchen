import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First, try to find package by slug
    let pkg = await db.package.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        includedItems: {
          include: {
            menuItem: {
              include: {
                category: true,
                customizations: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // If not found by slug, try to find by generated slug from name
    if (!pkg) {
      const packages = await db.package.findMany({
        where: { isActive: true },
        include: {
          includedItems: {
            include: {
              menuItem: {
                include: {
                  category: true,
                  customizations: {
                    include: {
                      options: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      pkg = packages.find((p: any) => generateSlug(p.name) === slug) || null;
    }

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedPackage = {
      ...pkg,
      type: pkg.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
      slug: pkg.slug || generateSlug(pkg.name),
      features:
        typeof pkg.features === 'string'
          ? JSON.parse(pkg.features)
          : pkg.features,
      includedItems: pkg.includedItems.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        includedCustomizations:
          typeof item.includedCustomizations === 'string'
            ? JSON.parse(item.includedCustomizations)
            : item.includedCustomizations,
        menuItem: {
          ...item.menuItem,
          basePrice: item.menuItem.basePrice,
          tags: item.menuItem.tags ? JSON.parse(item.menuItem.tags) : [],
          status: item.menuItem.status.toLowerCase(),
          slug: generateSlug(item.menuItem.name),
          customizations: item.menuItem.customizations.map((customization: any) => ({
            ...customization,
            type: customization.type.toLowerCase() as
              | 'radio'
              | 'checkbox'
              | 'text',
            options: customization.options.map((option: any) => ({
              ...option,
              isAvailable: true,
            })),
          })),
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedPackage,
    });
  } catch (error) {
    console.error('Error fetching package by slug:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch package',
      },
      { status: 500 }
    );
  }
}
