import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const addItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1),
  selectedCustomizations: z.array(z.any()).optional().default([]),
  specialInstructions: z.string().nullable().optional(),
});

// POST /api/cart/items - Add item to cart
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    // Get menu item to validate and get current price
    const menuItem = await db.menuItem.findUnique({
      where: { id: validatedData.menuItemId },
      include: {
        customizations: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!menuItem) {
      return Response.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    if (menuItem.status !== 'ACTIVE') {
      return Response.json(
        { success: false, error: 'Menu item is not available' },
        { status: 400 }
      );
    }

    // Calculate price including customizations
    let unitPrice = menuItem.basePrice;

    if (validatedData.selectedCustomizations.length > 0) {
      for (const customization of validatedData.selectedCustomizations) {
        if (customization.optionIds && customization.optionIds.length > 0) {
          // Find the customization and its options to calculate price modifiers
          const menuCustomization = menuItem.customizations.find(
            c => c.id === customization.customizationId
          );

          if (menuCustomization) {
            for (const optionId of customization.optionIds) {
              const option = menuCustomization.options.find(
                o => o.id === optionId
              );
              if (option) {
                unitPrice += option.priceModifier;
              }
            }
          }
        }
      }
    }

    const totalPrice = unitPrice * validatedData.quantity;

    // Get or create user's cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item with same customizations already exists
    const existingItems = await db.cartItem.findMany({
      where: {
        cartId: cart.id,
        menuItemId: validatedData.menuItemId,
      },
    });

    let existingItem = null;
    if (existingItems.length > 0) {
      // Find item with matching customizations
      existingItem = existingItems.find(item => {
        const itemCustomizations = item.selectedCustomizations
          ? JSON.parse(item.selectedCustomizations)
          : [];

        return (
          JSON.stringify(itemCustomizations) ===
          JSON.stringify(validatedData.selectedCustomizations)
        );
      });
    }

    let cartItem;
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + validatedData.quantity;
      const newTotalPrice = unitPrice * newQuantity;

      cartItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice,
          totalPrice: newTotalPrice,
          specialInstructions: validatedData.specialInstructions,
        },
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: validatedData.menuItemId,
          quantity: validatedData.quantity,
          unitPrice,
          totalPrice,
          selectedCustomizations: JSON.stringify(
            validatedData.selectedCustomizations
          ),
          specialInstructions: validatedData.specialInstructions,
        },
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    // Transform to match frontend interface
    const transformedItem = {
      id: cartItem.id,
      menuItemId: cartItem.menuItemId,
      name: cartItem.menuItem.name,
      image: cartItem.menuItem.image,
      quantity: cartItem.quantity,
      selectedCustomizations: cartItem.selectedCustomizations
        ? JSON.parse(cartItem.selectedCustomizations)
        : [],
      specialInstructions: cartItem.specialInstructions,
      unitPrice: cartItem.unitPrice,
      totalPrice: cartItem.totalPrice,
    };

    return Response.json({
      success: true,
      data: transformedItem,
      message: existingItem ? 'Item quantity updated' : 'Item added to cart',
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);

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
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
});
