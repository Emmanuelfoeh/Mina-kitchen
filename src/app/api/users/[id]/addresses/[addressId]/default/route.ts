import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[3]; // /api/users/[id]/addresses/[addressId]/default
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

    // Unset all other default addresses for this user
    await db.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this address as default
    const updatedAddress = await db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    console.error('Set default address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
