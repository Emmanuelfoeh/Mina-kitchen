import { NextResponse } from 'next/server';

export async function POST() {
  // Skip database operations during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      message: 'Test data creation is not available in production build',
    });
  }

  try {
    // Dynamic import to avoid Prisma client initialization during build
    const { db } = await import('@/lib/db');
    // Create menu categories
    const mainDishes = await db.menuCategory.upsert({
      where: { name: 'Main Dishes' },
      update: {},
      create: {
        name: 'Main Dishes',
        description: 'Hearty traditional African main courses',
        displayOrder: 1,
      },
    });

    const soups = await db.menuCategory.upsert({
      where: { name: 'Soups' },
      update: {},
      create: {
        name: 'Soups',
        description: 'Rich and flavorful African soups',
        displayOrder: 2,
      },
    });

    const sides = await db.menuCategory.upsert({
      where: { name: 'Sides' },
      update: {},
      create: {
        name: 'Sides',
        description: 'Perfect accompaniments to your meal',
        displayOrder: 3,
      },
    });

    const starters = await db.menuCategory.upsert({
      where: { name: 'Starters' },
      update: {},
      create: {
        name: 'Starters',
        description: 'Light bites to start your meal',
        displayOrder: 4,
      },
    });

    // Create menu items
    const jollofRice = await db.menuItem.upsert({
      where: { id: 'jollof-rice-1' },
      update: {},
      create: {
        id: 'jollof-rice-1',
        name: 'Smokey Jollof Rice',
        description:
          'Fire-wood smoked rice served with spicy grilled chicken and fried plantain.',
        basePrice: 18.0,
        categoryId: mainDishes.id,
        image:
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        tags: JSON.stringify(['spicy', 'popular', 'chicken']),
      },
    });

    // Create customizations for Jollof Rice
    const pepperLevelCustomization = await db.customization.upsert({
      where: {
        menuItemId_name: {
          menuItemId: jollofRice.id,
          name: 'Pepper Level',
        },
      },
      update: {},
      create: {
        name: 'Pepper Level',
        type: 'RADIO',
        required: true,
        menuItemId: jollofRice.id,
      },
    });

    // Create customization options
    await db.customizationOption.upsert({
      where: { id: 'pepper-low-1' },
      update: {},
      create: {
        id: 'pepper-low-1',
        name: 'Low',
        priceModifier: 0,
        customizationId: pepperLevelCustomization.id,
      },
    });

    await db.customizationOption.upsert({
      where: { id: 'pepper-medium-1' },
      update: {},
      create: {
        id: 'pepper-medium-1',
        name: 'Medium',
        priceModifier: 0,
        customizationId: pepperLevelCustomization.id,
      },
    });

    await db.customizationOption.upsert({
      where: { id: 'pepper-extra-1' },
      update: {},
      create: {
        id: 'pepper-extra-1',
        name: 'Extra',
        priceModifier: 0,
        customizationId: pepperLevelCustomization.id,
      },
    });

    await db.customizationOption.upsert({
      where: { id: 'pepper-african-hot-1' },
      update: {},
      create: {
        id: 'pepper-african-hot-1',
        name: 'African Hot',
        priceModifier: 0,
        customizationId: pepperLevelCustomization.id,
      },
    });

    const extraMeatCustomization = await db.customization.upsert({
      where: {
        menuItemId_name: {
          menuItemId: jollofRice.id,
          name: 'Extra Meat',
        },
      },
      update: {},
      create: {
        name: 'Extra Meat',
        type: 'CHECKBOX',
        required: false,
        menuItemId: jollofRice.id,
      },
    });

    await db.customizationOption.upsert({
      where: { id: 'extra-chicken-1' },
      update: {},
      create: {
        id: 'extra-chicken-1',
        name: 'Extra Chicken',
        priceModifier: 5.0,
        customizationId: extraMeatCustomization.id,
      },
    });

    await db.customizationOption.upsert({
      where: { id: 'extra-beef-1' },
      update: {},
      create: {
        id: 'extra-beef-1',
        name: 'Extra Beef',
        priceModifier: 6.0,
        customizationId: extraMeatCustomization.id,
      },
    });

    // Create more menu items
    await db.menuItem.upsert({
      where: { id: 'egusi-soup-1' },
      update: {},
      create: {
        id: 'egusi-soup-1',
        name: 'Egusi Soup & Yam',
        description:
          'Rich melon seed soup with spinach and assorted meat, served with pounded yam.',
        basePrice: 22.0,
        categoryId: soups.id,
        image:
          'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        tags: JSON.stringify(['traditional', 'soup', 'meat']),
      },
    });

    await db.menuItem.upsert({
      where: { id: 'beef-suya-1' },
      update: {},
      create: {
        id: 'beef-suya-1',
        name: 'Beef Suya Platter',
        description:
          'Thinly sliced beef marinated in spicy peanut blend, grilled to perfection with onions.',
        basePrice: 24.0,
        categoryId: starters.id,
        image:
          'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        tags: JSON.stringify(['spicy', 'grilled', 'beef', 'popular']),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
