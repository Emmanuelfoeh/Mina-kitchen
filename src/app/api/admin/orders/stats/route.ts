import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get order counts by status
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      outForDelivery,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      db.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      db.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      db.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
    ]);

    // Calculate completion rate
    const totalTodayOrders = todayOrders || 1; // Avoid division by zero
    const completionRate = (completedOrders / totalTodayOrders) * 100;

    // Calculate average order value
    const avgOrderResult = await db.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _avg: { total: true },
    });

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      outForDelivery,
      todayOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      avgOrderValue: avgOrderResult._avg.total || 0,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
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
