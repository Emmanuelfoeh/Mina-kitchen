import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types';

interface CreateOrderRequest {
  customerId: string;
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    customizations: any[];
    specialInstructions?: string;
    totalPrice: number;
  }[];
  deliveryType: 'delivery' | 'pickup';
  deliveryAddressId?: string;
  scheduledFor?: string;
  specialInstructions?: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

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
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: customerId and items are required',
        },
        { status: 400 }
      );
    }

    // Validate delivery address for delivery orders
    if (body.deliveryType === 'delivery' && !body.deliveryAddressId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery address is required for delivery orders',
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await db.user.findUnique({
      where: { id: body.customerId },
      include: { addresses: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify delivery address if provided
    let deliveryAddress = null;
    if (body.deliveryAddressId) {
      deliveryAddress = customer.addresses.find(
        (addr: any) => addr.id === body.deliveryAddressId
      );

      if (!deliveryAddress) {
        return NextResponse.json(
          { success: false, error: 'Delivery address not found' },
          { status: 404 }
        );
      }
    }

    // Create order with items
    const orderNumber = generateOrderNumber();
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        subtotal: body.subtotal,
        tax: body.tax,
        deliveryFee: body.deliveryFee,
        tip: 0, // TODO: Add tip functionality
        total: body.total,
        status: 'PENDING',
        deliveryType: body.deliveryType.toUpperCase() as any,
        deliveryAddressId: body.deliveryAddressId || null,
        scheduledFor,
        estimatedDelivery: scheduledFor
          ? new Date(scheduledFor.getTime() + 45 * 60000)
          : null, // 45 min after scheduled time
        paymentStatus: 'PENDING',
        specialInstructions: body.specialInstructions,
        items: {
          create: body.items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customizations: JSON.stringify(item.customizations),
            specialInstructions: item.specialInstructions,
            totalPrice: item.totalPrice,
            menuItem: {
              connect: { id: item.menuItemId },
            },
          })),
        },
      },
      include: {
        items: true,
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

    // TODO: Send order confirmation email
    // TODO: Notify restaurant of new order
    // TODO: Set up order status tracking

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Get specific order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
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
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: order,
      });
    }

    if (customerId) {
      // Get customer orders
      const orders = await db.order.findMany({
        where: { customerId },
        include: {
          items: true,
          deliveryAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Order fetch error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
