import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const packageData = await db.package.findUnique({
      where: { id },
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

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    if (!packageData.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package is not available',
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
      includedItems: packageData.includedItems.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        includedCustomizations:
          typeof item.includedCustomizations === 'string'
            ? JSON.parse(item.includedCustomizations)
            : item.includedCustomizations,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedPackage,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch package',
      },
      { status: 500 }
    );
  }
}
