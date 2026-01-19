import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/cart - Get user's cart
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // If no cart exists, return empty cart
    if (!cart) {
      return Response.json({
        success: true,
        data: {
          id: null,
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    // Transform cart items to match frontend CartItem interface
    const transformedItems = cart.items.map(item => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      image: item.menuItem.image,
      quantity: item.quantity,
      selectedCustomizations: item.selectedCustomizations
        ? JSON.parse(item.selectedCustomizations)
        : [],
      specialInstructions: item.specialInstructions,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return Response.json({
      success: true,
      data: {
        id: cart.id,
        items: transformedItems,
        totalItems,
        subtotal,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
});

// DELETE /api/cart - Clear user's cart
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    // Delete all cart items (cart will be deleted if empty)
    await db.cartItem.deleteMany({
      where: {
        cart: {
          userId: user.id,
        },
      },
    });

    // Delete the cart itself
    await db.cart.deleteMany({
      where: { userId: user.id },
    });

    return Response.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return Response.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
});
