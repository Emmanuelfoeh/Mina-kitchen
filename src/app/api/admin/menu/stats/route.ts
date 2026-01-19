import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/menu/stats - Get menu statistics
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Get total menu items count
    const totalItems = await db.menuItem.count();

    // Get active items count
    const activeItems = await db.menuItem.count({
      where: { status: 'ACTIVE' },
    });

    // Get inactive items count
    const inactiveItems = await db.menuItem.count({
      where: { status: 'INACTIVE' },
    });

    // Get sold out items count
    const soldOutItems = await db.menuItem.count({
      where: { status: 'SOLD_OUT' },
    });

    // Get low stock items count
    const lowStockItems = await db.menuItem.count({
      where: { status: 'LOW_STOCK' },
    });

    // Get total categories count
    const totalCategories = await db.menuCategory.count();

    // Get active categories count
    const activeCategories = await db.menuCategory.count({
      where: { isActive: true },
    });

    // Calculate average price
    const priceAggregate = await db.menuItem.aggregate({
      _avg: {
        basePrice: true,
      },
      where: {
        status: 'ACTIVE',
      },
    });

    // Get price range
    const priceRange = await db.menuItem.aggregate({
      _min: {
        basePrice: true,
      },
      _max: {
        basePrice: true,
      },
      where: {
        status: 'ACTIVE',
      },
    });

    // Get items by category
    const itemsByCategory = await db.menuCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get recent items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentItems = await db.menuItem.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalItems,
          activeItems,
          inactiveItems,
          soldOutItems,
          lowStockItems,
          totalCategories,
          activeCategories,
          recentItems,
        },
        pricing: {
          averagePrice: priceAggregate._avg.basePrice || 0,
          minPrice: priceRange._min.basePrice || 0,
          maxPrice: priceRange._max.basePrice || 0,
        },
        distribution: {
          byCategory: itemsByCategory.map(
            (category: {
              id: string;
              name: string;
              _count: { menuItems: number };
            }) => ({
              categoryId: category.id,
              categoryName: category.name,
              itemCount: category._count.menuItems,
            })
          ),
          byStatus: [
            { status: 'ACTIVE', count: activeItems },
            { status: 'INACTIVE', count: inactiveItems },
            { status: 'SOLD_OUT', count: soldOutItems },
            { status: 'LOW_STOCK', count: lowStockItems },
          ],
        },
      },
    });
  } catch (error) {
    console.error('Get menu stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu statistics' },
      { status: 500 }
    );
  }
});
