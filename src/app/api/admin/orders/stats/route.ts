import { NextRequest, NextResponse } from 'next/server';
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

    // Get total orders count
    const totalOrders = await db.order.count();

    // Get pending orders count
    const pendingOrders = await db.order.count({
      where: {
        status: 'PENDING',
      },
    });

    // Get completed orders today
    const completedOrders = await db.order.count({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Get orders out for delivery
    const outForDelivery = await db.order.count({
      where: {
        status: 'OUT_FOR_DELIVERY',
      },
    });

    // Get today's orders count
    const todayOrders = await db.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Get today's revenue
    const todayRevenue = await db.order.aggregate({
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
          gte: startOfDay,
        },
      },
    });

    // Calculate average order value
    const avgOrderValue = await db.order.aggregate({
      _avg: {
        total: true,
      },
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // Calculate completion rate (delivered vs total non-cancelled orders today)
    const todayNonCancelledOrders = await db.order.count({
      where: {
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const completionRate =
      todayNonCancelledOrders > 0
        ? (completedOrders / todayNonCancelledOrders) * 100
        : 0;

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      outForDelivery,
      todayOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      avgOrderValue: avgOrderValue._avg.total || 0,
      completionRate,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Order stats fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order statistics',
      },
      { status: 500 }
    );
  }
});
