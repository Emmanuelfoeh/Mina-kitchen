import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const tenantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  customDomain: z.string().optional(),
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  description: z.string().optional(),
  plan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
  settings: z.record(z.string(), z.any()).optional(),
});

function requireSuperAdmin(
  handler: (
    request: NextRequest,
    user: any,
    context?: { params: Promise<{ id: string }> }
  ) => Promise<NextResponse>
) {
  return requireAuth(async (request: NextRequest, user, context) => {
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }
    return handler(request, user, context);
  });
}

// GET /api/admin/tenants/[id] - Get single tenant
export const GET = requireSuperAdmin(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Tenant ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      const tenant = await db.tenant.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              menuItems: true,
              menuCategories: true,
              packages: true,
              orders: true,
            },
          },
        },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...tenant,
          settings: JSON.parse(tenant.settings),
        },
      });
    } catch (error) {
      console.error('Get tenant error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenant' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/admin/tenants/[id] - Update tenant
export const PATCH = requireSuperAdmin(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Tenant ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;
      const body = await request.json();
      const validatedData = tenantUpdateSchema.parse(body);

      // Check if tenant exists
      const existingTenant = await db.tenant.findUnique({
        where: { id },
      });

      if (!existingTenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      // Check custom domain uniqueness if being updated
      if (
        validatedData.customDomain &&
        validatedData.customDomain !== existingTenant.customDomain
      ) {
        const existingDomain = await db.tenant.findUnique({
          where: { customDomain: validatedData.customDomain },
        });

        if (existingDomain && existingDomain.id !== id) {
          return NextResponse.json(
            { error: 'Custom domain already in use' },
            { status: 400 }
          );
        }
      }

      // Update tenant
      const updatedTenant = await db.tenant.update({
        where: { id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.customDomain !== undefined && {
            customDomain: validatedData.customDomain || null,
          }),
          ...(validatedData.logo !== undefined && {
            logo: validatedData.logo || null,
          }),
          ...(validatedData.primaryColor && {
            primaryColor: validatedData.primaryColor,
          }),
          ...(validatedData.secondaryColor && {
            secondaryColor: validatedData.secondaryColor,
          }),
          ...(validatedData.accentColor && {
            accentColor: validatedData.accentColor,
          }),
          ...(validatedData.businessEmail && {
            businessEmail: validatedData.businessEmail,
          }),
          ...(validatedData.businessPhone && {
            businessPhone: validatedData.businessPhone,
          }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description || null,
          }),
          ...(validatedData.plan && { plan: validatedData.plan }),
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.billingCycle && {
            billingCycle: validatedData.billingCycle,
          }),
          ...(validatedData.settings && {
            settings: JSON.stringify(validatedData.settings),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedTenant,
          settings: JSON.parse(updatedTenant.settings),
        },
        message: 'Tenant updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Update tenant error:', error);
      return NextResponse.json(
        { error: 'Failed to update tenant' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/tenants/[id] - Delete tenant
export const DELETE = requireSuperAdmin(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Tenant ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      // Prevent deleting default tenant
      const tenant = await db.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      if (tenant.subdomain === 'default') {
        return NextResponse.json(
          { error: 'Cannot delete the default tenant' },
          { status: 400 }
        );
      }

      // Delete tenant (cascades to all related entities)
      await db.tenant.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Tenant deleted successfully',
      });
    } catch (error) {
      console.error('Delete tenant error:', error);
      return NextResponse.json(
        { error: 'Failed to delete tenant' },
        { status: 500 }
      );
    }
  }
);
