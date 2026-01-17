import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  displayOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/menu/categories - List all categories
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { isActive: true };

    const categories = await db.menuCategory.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
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
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
});

// POST /api/admin/menu/categories - Create new category
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Check if category name already exists
    const existingCategory = await db.menuCategory.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    // Get the next display order if not provided
    let displayOrder = validatedData.displayOrder;
    if (displayOrder === undefined) {
      const lastCategory = await db.menuCategory.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      displayOrder = (lastCategory?.displayOrder || 0) + 1;
    }

    const category = await db.menuCategory.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        displayOrder,
        isActive: validatedData.isActive ?? true,
      },
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
      data: category,
      message: 'Category created successfully',
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

    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
});
