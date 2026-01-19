import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const syncCartSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().min(1),
      selectedCustomizations: z.array(z.any()).default([]),
      specialInstructions: z.string().nullable().optional(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
});

// POST /api/cart/sync - Sync local cart with server (for guest -> user conversion)
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const validatedData = syncCartSchema.parse(body);

    // Get or create user's cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: true,
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: {
          items: true,
        },
      });
    }

    // If user already has items in cart, we need to merge
    const existingItems = cart.items;
    const itemsToAdd = [];
    const itemsToUpdate = [];

    for (const localItem of validatedData.items) {
      // Validate menu item exists and is active
      const menuItem = await db.menuItem.findUnique({
        where: { id: localItem.menuItemId },
      });

      if (!menuItem || menuItem.status !== 'ACTIVE') {
        continue; // Skip invalid items
      }

      // Check if item with same customizations exists
      const existingItem = existingItems.find(item => {
        const itemCustomizations = item.selectedCustomizations
          ? JSON.parse(item.selectedCustomizations)
          : [];

        return (
          item.menuItemId === localItem.menuItemId &&
          JSON.stringify(itemCustomizations) ===
            JSON.stringify(localItem.selectedCustomizations)
        );
      });

      if (existingItem) {
        // Merge quantities
        itemsToUpdate.push({
          id: existingItem.id,
          quantity: existingItem.quantity + localItem.quantity,
          unitPrice: localItem.unitPrice,
          totalPrice:
            (existingItem.quantity + localItem.quantity) * localItem.unitPrice,
          specialInstructions:
            localItem.specialInstructions || existingItem.specialInstructions,
        });
      } else {
        // Add new item
        itemsToAdd.push({
          cartId: cart.id,
          menuItemId: localItem.menuItemId,
          quantity: localItem.quantity,
          unitPrice: localItem.unitPrice,
          totalPrice: localItem.totalPrice,
          selectedCustomizations: JSON.stringify(
            localItem.selectedCustomizations
          ),
          specialInstructions: localItem.specialInstructions,
        });
      }
    }

    // Perform database operations
    const operations = [];

    // Update existing items
    for (const update of itemsToUpdate) {
      operations.push(
        db.cartItem.update({
          where: { id: update.id },
          data: {
            quantity: update.quantity,
            unitPrice: update.unitPrice,
            totalPrice: update.totalPrice,
            specialInstructions: update.specialInstructions,
          },
        })
      );
    }

    // Add new items
    if (itemsToAdd.length > 0) {
      operations.push(
        db.cartItem.createMany({
          data: itemsToAdd,
        })
      );
    }

    // Execute all operations
    await Promise.all(operations);

    // Fetch updated cart
    const updatedCart = await db.cart.findUnique({
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

    if (!updatedCart) {
      throw new Error('Failed to fetch updated cart');
    }

    // Transform cart items
    const transformedItems = updatedCart.items.map(item => ({
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

    const totalItems = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    return Response.json({
      success: true,
      data: {
        id: updatedCart.id,
        items: transformedItems,
        totalItems,
        subtotal,
      },
      message: 'Cart synced successfully',
    });
  } catch (error) {
    console.error('Error syncing cart:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: 'Failed to sync cart' },
      { status: 500 }
    );
  }
});
