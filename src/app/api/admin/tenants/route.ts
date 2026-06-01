import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAuth, type AuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens'
    ),
  customDomain: z.string().optional(),
  logo: z.string().optional(),
  primaryColor: z.string().default('#FF6B35'),
  secondaryColor: z.string().default('#004E89'),
  accentColor: z.string().default('#F7931E'),
  businessEmail: z.string().email('Invalid email'),
  businessPhone: z.string().min(1, 'Phone is required'),
  description: z.string().optional(),
  plan: z
    .enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    .default('STARTER'),
  status: z
    .enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'])
    .default('TRIAL'),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
  settings: z.record(z.string(), z.any()).default({}),
});

// Require SUPER_ADMIN role
function requireSuperAdmin(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return requireAuth(async (request: NextRequest, user) => {
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }
    return handler(request, user);
  });
}

// GET /api/admin/tenants - List all tenants (Super Admin only)
export const GET = requireSuperAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TenantWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status as Prisma.TenantWhereInput['status'];
    }

    if (plan && plan !== 'all') {
      where.plan = plan as Prisma.TenantWhereInput['plan'];
    }

    const [tenants, totalCount] = await Promise.all([
      db.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              menuItems: true,
              orders: true,
            },
          },
        },
      }),
      db.tenant.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        tenants: tenants.map(tenant => ({
          ...tenant,
          settings: JSON.parse(tenant.settings),
        })),
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
    console.error('Get tenants error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
});

// POST /api/admin/tenants - Create new tenant (Super Admin only)
export const POST = requireSuperAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = tenantSchema.parse(body);

    // Check if subdomain already exists
    const existingTenant = await db.tenant.findUnique({
      where: { subdomain: validatedData.subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      );
    }

    // Check custom domain if provided
    if (validatedData.customDomain) {
      const existingDomain = await db.tenant.findUnique({
        where: { customDomain: validatedData.customDomain },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Custom domain already in use' },
          { status: 400 }
        );
      }
    }

    // Set trial end date if status is TRIAL (30 days)
    const trialEndsAt =
      validatedData.status === 'TRIAL'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined;

    // Create tenant
    const tenant = await db.tenant.create({
      data: {
        ...validatedData,
        customDomain: validatedData.customDomain || null,
        logo: validatedData.logo || null,
        description: validatedData.description || null,
        trialEndsAt,
        settings: JSON.stringify(validatedData.settings),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        settings: JSON.parse(tenant.settings),
      },
      message: 'Tenant created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
});
