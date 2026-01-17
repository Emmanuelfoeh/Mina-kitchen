import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Extract slug from URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 2]; // Get slug before 'related'

    if (!slug) {
      return NextResponse.json(
        { error: 'Menu item slug is required' },
        { status: 400 }
      );
    }

    // Convert slug back to name for database lookup
    const nameFromSlug = slug.replace(/-/g, ' ');

    // First, find the current menu item
    const currentItem = await db.menuItem.findFirst({
      where: {
        name: { equals: nameFromSlug, mode: 'insensitive' },
      },
      include: {
        category: true,
      },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Find related items from the same category, excluding the current item
    const relatedItems = await db.menuItem.findMany({
      where: {
        AND: [
          { categoryId: currentItem.categoryId },
          { id: { not: currentItem.id } },
          { status: 'ACTIVE' },
        ],
      },
      include: {
        category: true,
        customizations: {
          include: {
            options: true,
          },
        },
      },
      take: 6, // Limit to 6 related items
      orderBy: {
        name: 'asc',
      },
    });

    // If we don't have enough items from the same category, get popular items from other categories
    if (relatedItems.length < 4) {
      const additionalItems = await db.menuItem.findMany({
        where: {
          AND: [
            { categoryId: { not: currentItem.categoryId } },
            { id: { not: currentItem.id } },
            { status: 'ACTIVE' },
          ],
        },
        include: {
          category: true,
          customizations: {
            include: {
              options: true,
            },
          },
        },
        take: 4 - relatedItems.length,
        orderBy: {
          name: 'asc',
        },
      });

      relatedItems.push(...additionalItems);
    }

    // Transform the data to match the expected format
    const transformedItems = relatedItems.map(item => ({
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
    console.error('Error fetching related items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related items' },
      { status: 500 }
    );
  }
}
