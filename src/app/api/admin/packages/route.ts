import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const packageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  includedItems: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().min(1),
        includedCustomizations: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

// Helper function to generate unique slug
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (true) {
    const existingPackage = await db.package.findUnique({
      where: { slug },
    });

    if (!existingPackage) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// GET /api/admin/packages - List all packages for admin
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    const [packages, totalCount] = await Promise.all([
      db.package.findMany({
        where,
        skip,
        take: limit,
        include: {
          includedItems: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.package.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Transform packages to match frontend expectations
    const transformedPackages = packages.map(pkg => ({
      ...pkg,
      type: pkg.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
      features:
        typeof pkg.features === 'string'
          ? JSON.parse(pkg.features)
          : pkg.features,
      includedItems: pkg.includedItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        includedCustomizations:
          typeof item.includedCustomizations === 'string'
            ? JSON.parse(item.includedCustomizations)
            : item.includedCustomizations,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        packages: transformedPackages,
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
    console.error('Get packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
});

// POST /api/admin/packages - Create new package
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = packageSchema.parse(body);

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name);

    // Create package with related data
    const packageData = await db.package.create({
      data: {
        name: validatedData.name,
        slug: slug,
        description: validatedData.description,
        type: validatedData.type,
        price: validatedData.price,
        ...(validatedData.image && { image: validatedData.image }),
        isActive: validatedData.isActive,
        features: JSON.stringify(validatedData.features),
        ...(validatedData.seoTitle && { seoTitle: validatedData.seoTitle }),
        ...(validatedData.seoDescription && {
          seoDescription: validatedData.seoDescription,
        }),
        // Create package items if provided
        ...(validatedData.includedItems.length > 0 && {
          includedItems: {
            create: validatedData.includedItems.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              includedCustomizations: JSON.stringify(
                item.includedCustomizations
              ),
            })),
          },
        }),
      },
      include: {
        includedItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Transform response to match frontend expectations
    const transformedPackage = {
      ...packageData,
      type: packageData.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
      features: JSON.parse(packageData.features as string),
      includedItems: packageData.includedItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        includedCustomizations: JSON.parse(
          item.includedCustomizations as string
        ),
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedPackage,
      message: 'Package created successfully',
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

    console.error('Create package error:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
});
