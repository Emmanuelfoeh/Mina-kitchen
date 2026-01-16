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
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

// GET /api/admin/menu/items/[id] - Get single menu item
export const GET = requireAdmin(
  async (
    request: NextRequest,
    authUser,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
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
          nutritionalInfo: true,
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
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validatedData = menuItemSchema.parse(body);

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

      // Update menu item
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
        },
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
          nutritionalInfo: true,
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
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
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

      // Delete menu item (cascades to customizations and nutritional info)
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
