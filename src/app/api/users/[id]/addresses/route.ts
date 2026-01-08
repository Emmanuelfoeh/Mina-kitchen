import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';
import { z } from 'zod';

const createAddressSchema = addressSchema.omit({ isDefault: true });

export const POST = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/')[3]; // /api/users/[id]/addresses

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Users can only add addresses to their own profile
    if (authUser.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to add address to this profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createAddressSchema.parse(body);

    // If this is the first address, make it default
    const existingAddressCount = await db.address.count({
      where: { userId },
    });

    const isDefault = existingAddressCount === 0 || body.isDefault === true;

    // If setting as default, unset other default addresses
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await db.address.create({
      data: {
        ...validatedData,
        userId,
        isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      data: newAddress,
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

    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/')[3]; // /api/users/[id]/addresses

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Users can only view their own addresses
    if (authUser.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to view addresses for this profile' },
        { status: 403 }
      );
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
