import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT', 'LOW_STOCK']),
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
  tags: z.array(z.string()).default([]),
  chefNotes: z.string().optional(),
  preparationTime: z.number().min(0).optional(),
  allergens: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  customizations: z
    .array(
      z.object({
        id: z.string().optional(), // For existing customizations
        name: z.string(),
        type: z.enum(['radio', 'checkbox', 'text']),
        required: z.boolean(),
        maxSelections: z.number().optional(),
        options: z.array(
          z.object({
            id: z.string().optional(), // For existing options
            name: z.string(),
            priceModifier: z.number(),
            isAvailable: z.boolean(),
          })
        ),
      })
    )
    .default([]),
});

// GET /api/admin/menu/items - List all menu items
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [items, totalCount] = await Promise.all([
      db.menuItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.menuItem.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
});

// POST /api/admin/menu/items - Create new menu item
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = menuItemSchema.parse(body);

    // Create menu item with related data
    const menuItem = await db.menuItem.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        basePrice: validatedData.basePrice,
        categoryId: validatedData.categoryId,
        status: validatedData.status,
        image: validatedData.image || '/placeholder-food.svg',
        tags: JSON.stringify(validatedData.tags),
        chefNotes: validatedData.chefNotes,
        preparationTime: validatedData.preparationTime,
        allergens: validatedData.allergens,
        seoTitle: validatedData.seoTitle,
        seoDescription: validatedData.seoDescription,
        // Create customizations if provided
        ...(validatedData.customizations.length > 0 && {
          customizations: {
            create: validatedData.customizations.map(custom => ({
              name: custom.name,
              type: custom.type.toUpperCase() as 'RADIO' | 'CHECKBOX' | 'TEXT',
              required: custom.required,
              maxSelections: custom.maxSelections,
              options: {
                create: custom.options,
              },
            })),
          },
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
      data: menuItem,
      message: 'Menu item created successfully',
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

    console.error('Create menu item error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
});
