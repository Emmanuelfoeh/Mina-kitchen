import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  basePrice: z.number().min(0, 'Price must be positive').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT', 'LOW_STOCK']).optional(),
  image: z
    .string()
    .refine(
      val => {
        if (!val || val === '') return true; // Allow empty string
        // Allow full URLs or relative paths starting with /
        return val.startsWith('http') || val.startsWith('/');
      },
      { message: 'Invalid image URL or path' }
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  chefNotes: z.string().optional(),
  preparationTime: z.number().min(0).optional(),
  allergens: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  customizations: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        type: z.enum(['radio', 'checkbox', 'text']),
        required: z.boolean(),
        maxSelections: z.number().optional(),
        options: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            priceModifier: z.number(),
            isAvailable: z.boolean(),
          })
        ),
      })
    )
    .optional(),
});

// GET /api/admin/menu/items/[id] - Get single menu item
export const GET = requireAdmin(
  async (
    request: NextRequest,
    authUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Menu item ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      const menuItem = await db.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: 'Menu item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      console.error('Get menu item error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch menu item' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/admin/menu/items/[id] - Update menu item
export const PATCH = requireAdmin(
  async (
    request: NextRequest,
    authUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Menu item ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;
      const body = await request.json();
      const validatedData = menuItemSchema.parse(body);

      // Check if menu item exists
      const existingItem = await db.menuItem.findUnique({
        where: { id },
        include: {
          customizations: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!existingItem) {
        return NextResponse.json(
          { error: 'Menu item not found' },
          { status: 404 }
        );
      }

      // Handle customizations update
      if (validatedData.customizations) {
        // Delete existing customizations
        await db.customization.deleteMany({
          where: { menuItemId: id },
        });

        // Create new customizations
        if (validatedData.customizations.length > 0) {
          await db.customization.createMany({
            data: validatedData.customizations.map((custom: any) => ({
              menuItemId: id,
              name: custom.name,
              type: custom.type.toUpperCase() as 'RADIO' | 'CHECKBOX' | 'TEXT',
              required: custom.required,
              maxSelections: custom.maxSelections,
            })),
          });

          // Get created customizations to add options
          const createdCustomizations = await db.customization.findMany({
            where: { menuItemId: id },
          });

          // Create options for each customization
          for (let i = 0; i < validatedData.customizations.length; i++) {
            const customization = validatedData.customizations[i];
            const createdCustomization = createdCustomizations[i];

            if (customization.options.length > 0) {
              await db.customizationOption.createMany({
                data: customization.options.map((option: any) => ({
                  customizationId: createdCustomization.id,
                  name: option.name,
                  priceModifier: option.priceModifier,
                  isAvailable: option.isAvailable,
                })),
              });
            }
          }
        }
      }

      // Update menu item basic fields
      const updatedItem = await db.menuItem.update({
        where: { id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.description && {
            description: validatedData.description,
          }),
          ...(validatedData.basePrice !== undefined && {
            basePrice: validatedData.basePrice,
          }),
          ...(validatedData.categoryId && {
            categoryId: validatedData.categoryId,
          }),
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.image !== undefined && {
            image: validatedData.image,
          }),
          ...(validatedData.tags && {
            tags: JSON.stringify(validatedData.tags),
          }),
          ...(validatedData.chefNotes !== undefined && {
            chefNotes: validatedData.chefNotes,
          }),
          ...(validatedData.preparationTime !== undefined && {
            preparationTime: validatedData.preparationTime,
          }),
          ...(validatedData.allergens && {
            allergens: validatedData.allergens,
          }),
          ...(validatedData.seoTitle !== undefined && {
            seoTitle: validatedData.seoTitle,
          }),
          ...(validatedData.seoDescription !== undefined && {
            seoDescription: validatedData.seoDescription,
          }),
        },
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: 'Menu item updated successfully',
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

      console.error('Update menu item error:', error);
      return NextResponse.json(
        { error: 'Failed to update menu item' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/menu/items/[id] - Delete menu item
export const DELETE = requireAdmin(
  async (
    request: NextRequest,
    authUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Menu item ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      // Check if menu item exists
      const existingItem = await db.menuItem.findUnique({
        where: { id },
      });

      if (!existingItem) {
        return NextResponse.json(
          { error: 'Menu item not found' },
          { status: 404 }
        );
      }

      // Delete menu item (cascades to customizations)
      await db.menuItem.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      return NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
      );
    }
  }
);
