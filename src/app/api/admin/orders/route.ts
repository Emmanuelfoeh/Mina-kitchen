import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search by order number or customer name/email
    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          customer: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status as OrderStatus;
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
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
                  image: true,
                },
              },
            },
          },
          deliveryAddress: true,
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
});

export const PATCH = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { orderIds, status, bulkAction } = body;

    if (bulkAction && orderIds && Array.isArray(orderIds)) {
      // Get orders before update to check for status changes
      const ordersBeforeUpdate = await db.order.findMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          deliveryAddress: true,
        },
      });

      // Bulk update orders
      const updatedOrders = await db.order.updateMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        data: {
          status: status as OrderStatus,
          updatedAt: new Date(),
        },
      });

      // Send notifications for status changes
      for (const order of ordersBeforeUpdate) {
        if (order.status !== status) {
          try {
            await NotificationService.sendOrderStatusNotification({
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerEmail: order.customer.email,
              customerName: order.customer.name,
              status: status,
              estimatedDelivery: order.estimatedDelivery || undefined,
              deliveryAddress: order.deliveryAddress || undefined,
            });
          } catch (notificationError) {
            console.error(
              `Failed to send notification for order ${order.orderNumber}:`,
              notificationError
            );
            // Continue with other notifications even if one fails
          }
        }
      }

      // TODO: Log admin actions for audit trail

      return NextResponse.json({
        success: true,
        data: {
          updatedCount: updatedOrders.count,
        },
        message: `Successfully updated ${updatedOrders.count} orders`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid bulk action request',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin orders update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update orders',
      },
      { status: 500 }
    );
  }
});
