import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Extract slug from URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 1];

    if (!slug) {
      return NextResponse.json(
        { error: 'Menu item slug is required' },
        { status: 400 }
      );
    }

    // Convert slug back to name for database lookup
    const nameFromSlug = slug.replace(/-/g, ' ');

    const menuItem = await db.menuItem.findFirst({
      where: {
        name: { equals: nameFromSlug, mode: 'insensitive' },
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

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedItem = {
      ...menuItem,
      basePrice: menuItem.basePrice,
      image: menuItem.image || '/placeholder-food.svg',
      images: menuItem.image ? [menuItem.image] : ['/placeholder-food.svg'],
      tags: menuItem.tags ? JSON.parse(menuItem.tags) : [],
      status: menuItem.status.toLowerCase(),
      slug: generateSlug(menuItem.name),
      customizations: menuItem.customizations.map((customization: any) => ({
        ...customization,
        type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
        options: customization.options.map((option: any) => ({
          ...option,
          isAvailable: true, // Default to available
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedItem,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}
