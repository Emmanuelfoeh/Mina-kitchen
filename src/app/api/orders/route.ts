import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationService } from '@/lib/notifications';
import { orderSchema, orderItemSchema } from '@/lib/validations';
import {
  SecurityMiddleware,
  SecurityHeaders,
  InputSanitizer,
} from '@/lib/security';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types';

const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z
    .array(
      orderItemSchema.extend({
        menuItemId: z.string().min(1, 'Menu item ID is required'),
        unitPrice: z.number().positive('Unit price must be positive').max(1000),
        totalPrice: z
          .number()
          .positive('Total price must be positive')
          .max(50000),
      })
    )
    .min(1, 'At least one item is required')
    .max(50, 'Too many items in order'),
  deliveryType: z
    .enum(['DELIVERY', 'PICKUP'])
    .or(z.enum(['delivery', 'pickup']))
    .transform(val => {
      // Handle both uppercase and lowercase values
      return val.toUpperCase() as 'DELIVERY' | 'PICKUP';
    }),
  deliveryAddressId: z.string().min(1).optional(),
  scheduledFor: z.string().datetime().optional(),
  specialInstructions: z
    .string()
    .max(500, 'Special instructions too long')
    .transform(InputSanitizer.sanitizeString)
    .optional(),
  subtotal: z.number().positive('Subtotal must be positive').max(50000),
  tax: z.number().min(0, 'Tax cannot be negative').max(10000),
  deliveryFee: z.number().min(0, 'Delivery fee cannot be negative').max(100),
  total: z.number().positive('Total must be positive').max(50000),
});

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Validate request with rate limiting and security checks
    const validation = await SecurityMiddleware.validateRequest(request, {
      rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 orders per 15 minutes
      requireAuth: true,
    });

    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Rate limit exceeded' ? 429 : 401 }
      );

      if (validation.headers) {
        Object.entries(validation.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return SecurityHeaders.applyHeaders(response);
    }

    const body = await request.json();
    console.log('Order creation request body:', JSON.stringify(body, null, 2));

    // Validate and sanitize input
    const validatedData = createOrderSchema.parse(body);

    // Verify customer exists and matches authenticated user
    const customer = await db.user.findUnique({
      where: { id: validatedData.customerId },
      include: { addresses: true },
    });

    if (!customer) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        )
      );
    }

    // Verify delivery address if provided
    let deliveryAddress = null;
    if (validatedData.deliveryAddressId) {
      deliveryAddress = customer.addresses.find(
        (addr: any) => addr.id === validatedData.deliveryAddressId
      );

      if (!deliveryAddress) {
        return SecurityHeaders.applyHeaders(
          NextResponse.json(
            { success: false, error: 'Delivery address not found' },
            { status: 404 }
          )
        );
      }
    }

    // Validate delivery address requirement
    if (
      validatedData.deliveryType === 'DELIVERY' &&
      !validatedData.deliveryAddressId
    ) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            success: false,
            error: 'Delivery address is required for delivery orders',
          },
          { status: 400 }
        )
      );
    }

    // Verify menu items exist and calculate prices
    const menuItemIds = validatedData.items.map(item => item.menuItemId);
    console.log('Looking for menu items with IDs:', menuItemIds);

    const menuItems = await db.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        status: 'ACTIVE',
      },
    });

    console.log(
      'Found menu items:',
      menuItems.map(item => ({
        id: item.id,
        name: item.name,
        status: item.status,
      }))
    );

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = menuItems.map(item => item.id);
      const missingIds = menuItemIds.filter(id => !foundIds.includes(id));
      console.log('Missing menu item IDs:', missingIds);

      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            success: false,
            error: `Menu items not found: ${missingIds.join(', ')}`,
          },
          { status: 400 }
        )
      );
    }

    // Validate pricing (prevent price manipulation)
    let calculatedSubtotal = 0;
    for (const item of validatedData.items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) continue;

      const expectedTotal = item.quantity * item.unitPrice;
      if (Math.abs(item.totalPrice - expectedTotal) > 0.01) {
        return SecurityHeaders.applyHeaders(
          NextResponse.json(
            { success: false, error: 'Invalid item pricing detected' },
            { status: 400 }
          )
        );
      }
      calculatedSubtotal += item.totalPrice;
    }

    // Validate order totals
    if (Math.abs(validatedData.subtotal - calculatedSubtotal) > 0.01) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { success: false, error: 'Invalid order subtotal' },
          { status: 400 }
        )
      );
    }

    const expectedTotal =
      validatedData.subtotal + validatedData.tax + validatedData.deliveryFee;
    if (Math.abs(validatedData.total - expectedTotal) > 0.01) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { success: false, error: 'Invalid order total' },
          { status: 400 }
        )
      );
    }

    // Create order with items
    const orderNumber = generateOrderNumber();
    const scheduledFor = validatedData.scheduledFor
      ? new Date(validatedData.scheduledFor)
      : null;

    // Validate scheduled time is in the future
    if (scheduledFor && scheduledFor <= new Date()) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { success: false, error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      );
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: validatedData.customerId,
        subtotal: validatedData.subtotal,
        tax: validatedData.tax,
        deliveryFee: validatedData.deliveryFee,
        tip: 0, // TODO: Add tip functionality
        total: validatedData.total,
        status: 'PENDING',
        deliveryType: validatedData.deliveryType as any,
        deliveryAddressId: validatedData.deliveryAddressId || null,
        scheduledFor,
        estimatedDelivery: scheduledFor
          ? new Date(scheduledFor.getTime() + 45 * 60000)
          : null, // 45 min after scheduled time
        paymentStatus: 'PENDING',
        specialInstructions: validatedData.specialInstructions,
        items: {
          create: validatedData.items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customizations: JSON.stringify(item.customizations || []),
            specialInstructions: item.specialInstructions,
            totalPrice: item.totalPrice,
            menuItem: {
              connect: { id: item.menuItemId },
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        deliveryAddress: true,
      },
    });

    // Log order creation for security monitoring
    console.log('Order created:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      total: order.total,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Send order confirmation notification
    try {
      await NotificationService.sendOrderConfirmationNotification(order.id);
    } catch (notificationError) {
      console.error('Failed to send order confirmation:', notificationError);
      // Don't fail the order creation if notification fails
    }

    return SecurityHeaders.applyHeaders(
      NextResponse.json({
        success: true,
        data: order,
        message: 'Order created successfully',
      })
    );
  } catch (error) {
    console.error('Order creation error:', error);

    if (error instanceof z.ZodError) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid input data',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
          { status: 400 }
        )
      );
    }

    return SecurityHeaders.applyHeaders(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to create order. Please try again.',
        },
        { status: 500 }
      )
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate request with rate limiting
    const validation = await SecurityMiddleware.validateRequest(request, {
      rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
    });

    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Rate limit exceeded' ? 429 : 400 }
      );

      if (validation.headers) {
        Object.entries(validation.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return SecurityHeaders.applyHeaders(response);
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    // Validate input parameters
    if (orderId) {
      // Validate orderId format
      if (!/^[a-zA-Z0-9_-]+$/.test(orderId)) {
        return SecurityHeaders.applyHeaders(
          NextResponse.json(
            { success: false, error: 'Invalid order ID format' },
            { status: 400 }
          )
        );
      }

      // Get specific order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          deliveryAddress: true,
        },
      });

      if (!order) {
        return SecurityHeaders.applyHeaders(
          NextResponse.json(
            { success: false, error: 'Order not found' },
            { status: 404 }
          )
        );
      }

      return SecurityHeaders.applyHeaders(
        NextResponse.json({
          success: true,
          data: order,
        })
      );
    }

    if (customerId) {
      // Validate customerId format
      if (!/^[a-zA-Z0-9_-]+$/.test(customerId)) {
        return SecurityHeaders.applyHeaders(
          NextResponse.json(
            { success: false, error: 'Invalid customer ID format' },
            { status: 400 }
          )
        );
      }

      // Get customer orders with pagination
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(searchParams.get('limit') || '10'))
      );
      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        db.order.findMany({
          where: { customerId },
          include: {
            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            deliveryAddress: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.order.count({
          where: { customerId },
        }),
      ]);

      return SecurityHeaders.applyHeaders(
        NextResponse.json({
          success: true,
          data: {
            orders,
            pagination: {
              page,
              limit,
              total: totalCount,
              pages: Math.ceil(totalCount / limit),
            },
          },
        })
      );
    }

    return SecurityHeaders.applyHeaders(
      NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    );
  } catch (error) {
    console.error('Order fetch error:', error);

    return SecurityHeaders.applyHeaders(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch orders',
        },
        { status: 500 }
      )
    );
  }
}
