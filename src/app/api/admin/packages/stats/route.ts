import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/packages/stats - Get package statistics
export const GET = requireAdmin(async (_request: NextRequest) => {
  try {
    const [totalPackages, activePackages, packagePrices] = await Promise.all([
      db.package.count(),
      db.package.count({ where: { isActive: true } }),
      db.package.findMany({
        select: { price: true },
        where: { isActive: true },
      }),
    ]);

    // Calculate total revenue (this would be from actual orders in a real system)
    const totalRevenue = packagePrices.reduce(
      (sum: number, pkg: (typeof packagePrices)[number]) => sum + pkg.price,
      0
    );

    // Calculate average package price
    const averagePackagePrice =
      packagePrices.length > 0 ? totalRevenue / packagePrices.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalPackages,
        activePackages,
        totalRevenue,
        averagePackagePrice,
      },
    });
  } catch (error) {
    console.error('Get package stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package statistics' },
      { status: 500 }
    );
  }
});
