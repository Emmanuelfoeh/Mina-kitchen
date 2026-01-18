import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract order ID from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const orderId = pathSegments[pathSegments.length - 2]; // timeline is last, id is second to last

    // For now, we'll return a basic timeline based on order creation and updates
    // In the future, you can implement a proper audit log table
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Generate basic timeline events
    const timeline = [
      {
        id: '1',
        status: 'PENDING',
        timestamp: order.createdAt.toISOString(),
        description: 'Order placed by customer',
        actor: order.customer.name,
      },
    ];

    // If order has been updated and status is not PENDING, add status update event
    if (order.status !== 'PENDING' && order.updatedAt > order.createdAt) {
      const statusDescriptions: Record<string, string> = {
        CONFIRMED: 'Order confirmed by restaurant',
        PREPARING: 'Kitchen started preparing order',
        READY: 'Order is ready for pickup/delivery',
        OUT_FOR_DELIVERY: 'Order dispatched for delivery',
        DELIVERED: 'Order delivered successfully',
        CANCELLED: 'Order was cancelled',
      };

      timeline.push({
        id: '2',
        status: order.status,
        timestamp: order.updatedAt.toISOString(),
        description: statusDescriptions[order.status] || 'Order status updated',
        actor: 'Admin',
      });
    }

    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('Order timeline fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order timeline',
      },
      { status: 500 }
    );
  }
});
