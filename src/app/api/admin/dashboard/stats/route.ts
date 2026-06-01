import { requireAdmin } from '@/lib/auth';
import { getCurrentTenantId } from '@/lib/tenant-context';
import { db } from '@/lib/db';

export const GET = requireAdmin(async () => {
  try {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get current date for calculations
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

    // Calculate total revenue
    const totalRevenue = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        tenantId,
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
        tenantId,
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
        tenantId,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // Calculate previous month orders for comparison
    const previousMonthOrders = await db.order.count({
      where: {
        tenantId,
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: previousMonth,
          lte: endOfPreviousMonth,
        },
      },
    });

    // _sum.total is a Prisma Decimal | null — convert to number for arithmetic.
    const totalRevenueNum = Number(totalRevenue._sum.total ?? 0);
    const prevRevenueNum = Number(previousMonthRevenue._sum.total ?? 0);

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenueNum / totalOrders : 0;

    // Calculate previous month average for comparison
    const prevMonthAvg =
      previousMonthOrders > 0 ? prevRevenueNum / previousMonthOrders : 0;

    // Count pending deliveries
    const pendingDeliveries = await db.order.count({
      where: {
        tenantId,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'],
        },
        deliveryType: 'DELIVERY',
      },
    });

    // Calculate percentage changes
    const revenueChange =
      prevRevenueNum > 0
        ? ((totalRevenueNum - prevRevenueNum) / prevRevenueNum) * 100
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
        tenantId,
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
      where: {
        order: {
          tenantId,
        },
      },
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
        tenantId,
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
        const menuItem = menuItems.find(
          (item: { id: string }) => item.id === dish.menuItemId
        );
        return {
          ...menuItem,
          orderCount: dish._count.menuItemId,
          totalQuantity: dish._sum.quantity || 0,
        };
      }
    );

    // Get recent orders (last 10)
    const recentOrders = await db.order.findMany({
      where: {
        tenantId,
      },
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
          value: totalRevenueNum,
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
