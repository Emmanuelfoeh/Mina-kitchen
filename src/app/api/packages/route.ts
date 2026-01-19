import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch active packages from database
    const packages = await db.package.findMany({
      where: { isActive: true },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform packages to match frontend expectations
    const transformedPackages = packages.map((pkg: any) => ({
      ...pkg,
      type: pkg.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
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
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedPackages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packages',
      },
      { status: 500 }
    );
  }
}
