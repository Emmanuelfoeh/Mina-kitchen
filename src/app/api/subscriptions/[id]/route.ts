import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCurrentTenantId } from '@/lib/tenant-context';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  status: z.enum(['active', 'paused', 'cancelled']).optional(),
  nextDelivery: z.coerce.date().optional(),
  deliverySchedule: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      dayOfWeek: z.number().int().min(0).max(6).optional(),
      dayOfMonth: z.number().int().min(1).max(31).optional(),
      time: z.string(),
    })
    .optional(),
  deliveryAddress: z
    .object({
      id: z.string(),
      street: z.string(),
      unit: z.string().optional(),
      city: z.string(),
      province: z.string(),
      postalCode: z.string(),
    })
    .optional(),
  customizations: z.array(z.any()).optional(),
});

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

// PATCH /api/subscriptions/[id] - update the authenticated user's subscription
export const PATCH = requireAuth(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      const tenantId = await getCurrentTenantId();
      if (!tenantId) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }
      if (!context?.params) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
      const { id } = await context.params;
      const updates = updateSubscriptionSchema.parse(await request.json());

      // Verify ownership within tenant before updating.
      const existing = await db.subscription.findFirst({
        where: { id, tenantId, userId: user.id },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const data: Record<string, unknown> = {};
      if (updates.status) data.status = updates.status.toUpperCase();
      if (updates.nextDelivery) data.nextDelivery = updates.nextDelivery;
      if (updates.deliverySchedule) {
        data.deliverySchedule = JSON.stringify(updates.deliverySchedule);
        data.frequency = updates.deliverySchedule.frequency.toUpperCase();
      }
      if (updates.deliveryAddress) {
        data.deliveryAddress = JSON.stringify(updates.deliveryAddress);
      }
      if (updates.customizations) {
        data.customizations = JSON.stringify(updates.customizations);
      }

      const updated = await db.subscription.update({
        where: { id },
        data,
        include: { package: { select: { name: true } } },
      });

      return NextResponse.json({ success: true, data: serialize(updated) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.issues },
          { status: 400 }
        );
      }
      console.error('Update subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/subscriptions/[id] - permanently remove a subscription
export const DELETE = requireAuth(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      const tenantId = await getCurrentTenantId();
      if (!tenantId) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }
      if (!context?.params) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
      const { id } = await context.params;

      const result = await db.subscription.deleteMany({
        where: { id, tenantId, userId: user.id },
      });
      if (result.count === 0) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Delete subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      );
    }
  }
);
