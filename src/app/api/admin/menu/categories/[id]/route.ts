import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  displayOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/menu/categories/[id] - Get single category
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract ID from URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await db.menuCategory.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/menu/categories/[id] - Update category
export const PATCH = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract ID from URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check if category exists
    const existingCategory = await db.menuCategory.findUnique({
      where: { id: id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await db.menuCategory.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await db.menuCategory.update({
      where: { id: id },
      data: validatedData,
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
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

    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/menu/categories/[id] - Delete category
export const DELETE = requireAdmin(async (request: NextRequest) => {
  try {
    // Extract ID from URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db.menuCategory.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has menu items
    if (existingCategory._count.menuItems > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with menu items',
          message: `This category has ${existingCategory._count.menuItems} menu item(s). Please move or delete them first.`,
        },
        { status: 400 }
      );
    }

    await db.menuCategory.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
});
