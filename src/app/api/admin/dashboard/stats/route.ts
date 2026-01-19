import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Get current date for calculations
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate total revenue
    const totalRevenue = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: [
            'CONFIRMED',
            'PREPARING',
            'READY',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
          ],
        },
      },
    });

    // Calculate previous month revenue for comparison
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const previousMonthRevenue = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: [
            'CONFIRMED',
            'PREPARING',
            'READY',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
          ],
        },
        createdAt: {
          gte: previousMonth,
          lte: endOfPreviousMonth,
        },
      },
    });

    // Calculate total orders
    const totalOrders = await db.order.count({
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // Calculate previous month orders for comparison
    const previousMonthOrders = await db.order.count({
      where: {
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: previousMonth,
          lte: endOfPreviousMonth,
        },
      },
    });

    // Calculate average order value
    const avgOrderValue =
      totalRevenue._sum.total && totalOrders > 0
        ? totalRevenue._sum.total / totalOrders
        : 0;

    // Calculate previous month average for comparison
    const prevMonthAvg =
      previousMonthRevenue._sum.total && previousMonthOrders > 0
        ? previousMonthRevenue._sum.total / previousMonthOrders
        : 0;

    // Count pending deliveries
    const pendingDeliveries = await db.order.count({
      where: {
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'],
        },
        deliveryType: 'DELIVERY',
      },
    });

    // Calculate percentage changes
    const revenueChange = previousMonthRevenue._sum.total
      ? (((totalRevenue._sum.total || 0) -
          (previousMonthRevenue._sum.total || 0)) /
          (previousMonthRevenue._sum.total || 1)) *
        100
      : 0;

    const ordersChange =
      previousMonthOrders > 0
        ? ((totalOrders - previousMonthOrders) / previousMonthOrders) * 100
        : 0;

    const avgOrderChange =
      prevMonthAvg > 0
        ? ((avgOrderValue - prevMonthAvg) / prevMonthAvg) * 100
        : 0;

    // Get daily revenue for the chart (last 7 days)
    const dailyRevenue = await db.order.groupBy({
      by: ['createdAt'],
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: [
            'CONFIRMED',
            'PREPARING',
            'READY',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
          ],
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get popular dishes (top 5 by order count)
    const popularDishes = await db.orderItem.groupBy({
      by: ['menuItemId'],
      _count: {
        menuItemId: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _count: {
          menuItemId: 'desc',
        },
      },
      take: 5,
    });

    // Get menu item details for popular dishes
    const menuItemIds = popularDishes.map(
      (dish: { menuItemId: string }) => dish.menuItemId
    );
    const menuItems = await db.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
      include: {
        category: true,
      },
    });

    // Combine popular dishes with menu item details
    const popularDishesWithDetails = popularDishes.map(
      (dish: {
        menuItemId: string;
        _count: { menuItemId: number };
        _sum: { quantity: number | null };
      }) => {
        const menuItem = menuItems.find(item => item.id === dish.menuItemId);
        return {
          ...menuItem,
          orderCount: dish._count.menuItemId,
          totalQuantity: dish._sum.quantity || 0,
        };
      }
    );

    // Get recent orders (last 10)
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return Response.json({
      metrics: {
        totalRevenue: {
          value: totalRevenue._sum.total || 0,
          change: Math.round(revenueChange * 100) / 100,
        },
        totalOrders: {
          value: totalOrders,
          change: Math.round(ordersChange * 100) / 100,
        },
        avgOrderValue: {
          value: Math.round(avgOrderValue * 100) / 100,
          change: Math.round(avgOrderChange * 100) / 100,
        },
        pendingDeliveries: {
          value: pendingDeliveries,
        },
      },
      dailyRevenue,
      popularDishes: popularDishesWithDetails,
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
});
