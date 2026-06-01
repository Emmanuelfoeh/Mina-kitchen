import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCurrentTenantId } from '@/lib/tenant-context';
import { z } from 'zod';

const frequencyEnum = z.enum(['daily', 'weekly', 'monthly']);

const deliveryAddressSchema = z.object({
  id: z.string(),
  street: z.string(),
  unit: z.string().optional(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
});

const deliveryScheduleSchema = z.object({
  frequency: frequencyEnum,
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  time: z.string(),
});

const createSubscriptionSchema = z.object({
  packageId: z.string().min(1),
  price: z.number().min(0),
  startDate: z.coerce.date(),
  nextDelivery: z.coerce.date(),
  deliveryAddress: deliveryAddressSchema,
  deliverySchedule: deliveryScheduleSchema,
  customizations: z.array(z.any()).default([]),
});

// Map a DB subscription row to the client-facing shape used by the store.
function serialize(sub: any) {
  return {
    id: sub.id,
    packageId: sub.packageId,
    packageName: sub.package?.name ?? '',
    packageType: sub.frequency.toLowerCase(),
    price: sub.price,
    status: sub.status.toLowerCase(),
    startDate: sub.startDate,
    nextDelivery: sub.nextDelivery,
    deliveryAddress: JSON.parse(sub.deliveryAddress),
    deliverySchedule: JSON.parse(sub.deliverySchedule),
    customizations: sub.customizations ? JSON.parse(sub.customizations) : [],
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}

// GET /api/subscriptions - list the authenticated user's subscriptions
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const subscriptions = await db.subscription.findMany({
      where: { tenantId, userId: user.id },
      include: { package: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: subscriptions.map(serialize),
    });
  } catch (error) {
    console.error('List subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
});

// POST /api/subscriptions - create a subscription for the authenticated user
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = createSubscriptionSchema.parse(body);

    // The package must belong to this tenant.
    const pkg = await db.package.findFirst({
      where: { id: data.packageId, tenantId },
      select: { id: true },
    });
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const created = await db.subscription.create({
      data: {
        tenantId,
        userId: user.id,
        packageId: data.packageId,
        price: data.price,
        frequency: data.deliverySchedule.frequency.toUpperCase() as
          | 'DAILY'
          | 'WEEKLY'
          | 'MONTHLY',
        startDate: data.startDate,
        nextDelivery: data.nextDelivery,
        deliverySchedule: JSON.stringify(data.deliverySchedule),
        deliveryAddress: JSON.stringify(data.deliveryAddress),
        customizations: JSON.stringify(data.customizations),
      },
      include: { package: { select: { name: true } } },
    });

    return NextResponse.json(
      { success: true, data: serialize(created) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
});
