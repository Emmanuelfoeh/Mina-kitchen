import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { userSchema } from '@/lib/validations';
import { z } from 'zod';

const updateUserSchema = userSchema.partial().omit({ role: true });

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Users can only update their own profile (unless admin)
    if (authUser.id !== userId && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to update this profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email.toLowerCase(),
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        email: validatedData.email?.toLowerCase(),
      },
      include: {
        addresses: true,
      },
    });

    // Remove sensitive data
    const { passwordHash, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
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

export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Users can only view their own profile (unless admin)
    if (authUser.id !== userId && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to view this profile' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
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
