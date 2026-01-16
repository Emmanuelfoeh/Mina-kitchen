import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  isVerified: z.boolean().optional(),
});

// GET /api/admin/users/[id] - Get user details
export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { passwordHash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/users/[id] - Update user
export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (validatedData.isVerified === false && userId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Prevent admin from removing their own admin role
    if (validatedData.role === 'CUSTOMER' && userId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin privileges' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await db.user.findFirst({
        where: {
          email: validatedData.email.toLowerCase(),
          NOT: { id: userId },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        email: validatedData.email?.toLowerCase(),
      },
      include: {
        addresses: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    // Remove sensitive data
    const { passwordHash, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully',
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

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/users/[id] - Delete user (soft delete by deactivating)
export const DELETE = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete by deactivating the user
    await db.user.update({
      where: { id: userId },
      data: {
        isVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
