import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract order ID from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                basePrice: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        deliveryAddress: true,
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

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Admin order fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order details',
      },
      { status: 500 }
    );
  }
});

export const PATCH = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract order ID from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { status, estimatedDelivery, specialInstructions } = body;

    // Validate status if provided
    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order status',
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Update order
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (specialInstructions !== undefined) {
      updateData.specialInstructions = specialInstructions;
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        deliveryAddress: true,
      },
    });

    // Send notification to customer about status change
    if (status && status !== existingOrder.status) {
      try {
        await NotificationService.sendOrderStatusNotification({
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          customerEmail: updatedOrder.customer.email,
          customerName: updatedOrder.customer.name,
          status: updatedOrder.status,
          estimatedDelivery: updatedOrder.estimatedDelivery || undefined,
          deliveryAddress: updatedOrder.deliveryAddress,
        });
      } catch (notificationError) {
        console.error('Failed to send status notification:', notificationError);
        // Don't fail the order update if notification fails
      }
    }

    // TODO: Log admin action for audit trail

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
      },
      { status: 500 }
    );
  }
});
