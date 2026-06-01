import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';
import { getCurrentTenantId } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE';

    // Build where clause
    const where: Prisma.MenuItemWhereInput = {
      tenantId,
      status: status as Prisma.MenuItemWhereInput['status'],
    };

    // Filter by category if specified
    if (category && category !== 'all') {
      where.category = {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      };
    }

    // Add search filter if specified
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const menuItems = await db.menuItem.findMany({
      where,
      include: {
        category: true,
        customizations: {
          include: {
            options: true,
          },
        },
      },
      orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
    });

    // Transform the data to match the expected format
    const transformedItems = menuItems.map(item => ({
      ...item,
      basePrice: item.basePrice,
      image: item.image || '/placeholder-food.svg',
      images: item.image ? [item.image] : ['/placeholder-food.svg'],
      tags: item.tags ? JSON.parse(item.tags) : [],
      status: item.status.toLowerCase(),
      slug: generateSlug(item.name),
      customizations: item.customizations.map(customization => ({
        ...customization,
        type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
        options: customization.options.map(option => ({
          ...option,
          isAvailable: true, // Default to available
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu items',
      },
      { status: 500 }
    );
  }
}
