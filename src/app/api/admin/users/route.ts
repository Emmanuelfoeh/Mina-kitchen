import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { userSchema } from '@/lib/validations';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const bulkUpdateSchema = z.object({
  userIds: z.array(z.string()),
  isVerified: z.boolean().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  bulkAction: z.boolean(),
});

// GET /api/admin/users - List all users with pagination and filtering
export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role !== 'all') {
      where.role = role;
    }

    // Status filter
    if (status !== 'all') {
      where.isVerified = status === 'active';
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              addresses: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/admin/users - Create new user
export const POST = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const newUser = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        role: validatedData.role,
        isVerified: validatedData.isVerified ?? true,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/users - Bulk update users
export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = bulkUpdateSchema.parse(body);

    if (!validatedData.bulkAction) {
      return NextResponse.json(
        { error: 'Invalid bulk action request' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.isVerified !== undefined) {
      updateData.isVerified = validatedData.isVerified;
    }
    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }

    // Prevent admin from deactivating themselves
    if (
      validatedData.isVerified === false &&
      validatedData.userIds.includes(authUser.id)
    ) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Update users
    const updatedUsers = await db.user.updateMany({
      where: {
        id: { in: validatedData.userIds },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedUsers.count,
      },
      message: `Successfully updated ${updatedUsers.count} user(s)`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Bulk update users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
