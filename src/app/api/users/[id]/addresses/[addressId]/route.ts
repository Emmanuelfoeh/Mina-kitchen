import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';
import { z } from 'zod';

const updateAddressSchema = addressSchema.partial();

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[3]; // /api/users/[id]/addresses/[addressId]
    const addressId = pathParts[5];

    if (!userId || !addressId) {
      return NextResponse.json(
        { error: 'User ID and Address ID are required' },
        { status: 400 }
      );
    }

    // Users can only update their own addresses
    if (authUser.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this address' },
        { status: 403 }
      );
    }

    // Verify the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateAddressSchema.parse(body);

    // If setting as default, unset other default addresses
    if (validatedData.isDefault === true) {
      await db.address.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await db.address.update({
      where: { id: addressId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedAddress,
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

    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[3]; // /api/users/[id]/addresses/[addressId]
    const addressId = pathParts[5];

    if (!userId || !addressId) {
      return NextResponse.json(
        { error: 'User ID and Address ID are required' },
        { status: 400 }
      );
    }

    // Users can only delete their own addresses
    if (authUser.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this address' },
        { status: 403 }
      );
    }

    // Verify the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await db.address.delete({
      where: { id: addressId },
    });

    // If this was the default address, make another address default
    if (existingAddress.isDefault) {
      const nextAddress = await db.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextAddress) {
        await db.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
