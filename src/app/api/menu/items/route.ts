import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE';

    // Build where clause
    const where: any = {
      status: status,
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
    const transformedItems = menuItems.map((item: any) => ({
      ...item,
      basePrice: item.basePrice,
      image: item.image || '/placeholder-food.svg',
      images: item.image ? [item.image] : ['/placeholder-food.svg'],
      tags: item.tags ? JSON.parse(item.tags) : [],
      status: item.status.toLowerCase(),
      slug: generateSlug(item.name),
      customizations: item.customizations.map((customization: any) => ({
        ...customization,
        type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
        options: customization.options.map((option: any) => ({
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
