import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First try to find by slug field if it exists
    let packageData = await db.package.findFirst({
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
              },
            },
          },
        },
      },
    });

    // If not found by slug, try to find by generated slug from name
    if (!packageData) {
      const allPackages = await db.package.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      });

      const matchingPackage = allPackages.find(
        pkg => generateSlug(pkg.name) === slug
      );

      if (matchingPackage) {
        packageData = await db.package.findUnique({
          where: { id: matchingPackage.id },
          include: {
            includedItems: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    // Transform package to match frontend expectations
    const transformedPackage = {
      ...packageData,
      type: packageData.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
      features:
        typeof packageData.features === 'string'
          ? JSON.parse(packageData.features)
          : packageData.features,
      slug: packageData.slug || generateSlug(packageData.name),
      includedItems: packageData.includedItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        includedCustomizations:
          typeof item.includedCustomizations === 'string'
            ? JSON.parse(item.includedCustomizations)
            : item.includedCustomizations,
        menuItem: item.menuItem, // Include the full menu item data
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
