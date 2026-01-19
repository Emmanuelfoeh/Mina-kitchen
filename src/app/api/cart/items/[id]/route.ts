import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  selectedCustomizations: z.array(z.any()).optional(),
  specialInstructions: z.string().nullable().optional(),
});

// PATCH /api/cart/items/[id] - Update cart item
export const PATCH = requireAuth(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return Response.json(
          { success: false, error: 'Missing parameters' },
          { status: 400 }
        );
      }

      const { id } = await context.params;
      const body = await request.json();
      const validatedData = updateItemSchema.parse(body);

      // Find cart item and verify ownership
      const cartItem = await db.cartItem.findFirst({
        where: {
          id,
          cart: {
            userId: user.id,
          },
        },
        include: {
          menuItem: {
            include: {
              category: true,
              customizations: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!cartItem) {
        return Response.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        );
      }

      // Calculate new price if customizations changed
      let unitPrice = cartItem.unitPrice;

      if (validatedData.selectedCustomizations !== undefined) {
        // Recalculate price based on new customizations
        unitPrice = cartItem.menuItem.basePrice;

        if (validatedData.selectedCustomizations.length > 0) {
          for (const customization of validatedData.selectedCustomizations) {
            if (customization.optionIds && customization.optionIds.length > 0) {
              const menuCustomization = cartItem.menuItem.customizations.find(
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
      }

      const quantity = validatedData.quantity ?? cartItem.quantity;
      const totalPrice = unitPrice * quantity;

      // Update cart item
      const updatedCartItem = await db.cartItem.update({
        where: { id },
        data: {
          ...(validatedData.quantity !== undefined && { quantity }),
          ...(validatedData.selectedCustomizations !== undefined && {
            selectedCustomizations: JSON.stringify(
              validatedData.selectedCustomizations
            ),
          }),
          ...(validatedData.specialInstructions !== undefined && {
            specialInstructions: validatedData.specialInstructions,
          }),
          unitPrice,
          totalPrice,
        },
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
      });

      // Transform to match frontend interface
      const transformedItem = {
        id: updatedCartItem.id,
        menuItemId: updatedCartItem.menuItemId,
        name: updatedCartItem.menuItem.name,
        image: updatedCartItem.menuItem.image,
        quantity: updatedCartItem.quantity,
        selectedCustomizations: updatedCartItem.selectedCustomizations
          ? JSON.parse(updatedCartItem.selectedCustomizations)
          : [],
        specialInstructions: updatedCartItem.specialInstructions,
        unitPrice: updatedCartItem.unitPrice,
        totalPrice: updatedCartItem.totalPrice,
      };

      return Response.json({
        success: true,
        data: transformedItem,
      });
    } catch (error) {
      console.error('Error updating cart item:', error);

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
        { success: false, error: 'Failed to update cart item' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/cart/items/[id] - Remove cart item
export const DELETE = requireAuth(
  async (
    request: NextRequest,
    user,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return Response.json(
          { success: false, error: 'Missing parameters' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      // Verify ownership and delete
      const deletedItem = await db.cartItem.deleteMany({
        where: {
          id,
          cart: {
            userId: user.id,
          },
        },
      });

      if (deletedItem.count === 0) {
        return Response.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Error removing cart item:', error);
      return Response.json(
        { success: false, error: 'Failed to remove cart item' },
        { status: 500 }
      );
    }
  }
);
