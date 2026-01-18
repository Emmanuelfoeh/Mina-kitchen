import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';

// Helper function to get actual customization and option IDs
async function getDefaultCustomizations(
  menuItemId: string,
  defaults: Array<{ customizationName: string; optionName: string }>
): Promise<string[]> {
  const customizations = [];

  for (const { customizationName, optionName } of defaults) {
    // Find the customization by name for this menu item
    const customization = await db.customization.findFirst({
      where: {
        menuItemId: menuItemId,
        name: customizationName,
      },
      include: {
        options: true,
      },
    });

    if (customization) {
      // Find the option by name
      const option = customization.options.find(opt => opt.name === optionName);
      if (option) {
        customizations.push(`${customization.id}:${option.id}`);
      }
    }
  }

  return customizations;
}

async function main() {
  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const customerPasswordHash = await bcrypt.hash('customer123', 12);

  // Create admin user
  const adminUser = await db.user.upsert({
    where: { email: 'admin@minakitchen.ca' },
    update: {},
    create: {
      email: 'admin@minakitchen.ca',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create customer user
  const customerUser = await db.user.upsert({
    where: { email: 'customer@minakitchen.ca' },
    update: {},
    create: {
      email: 'customer@minakitchen.ca',
      name: 'Customer User',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      isVerified: true,
    },
  });

  console.log('Customer user created:', customerUser.email);

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
    where: {
      categoryId_name: {
        categoryId: mainDishes.id,
        name: 'Smokey Jollof Rice',
      },
    },
    update: {},
    create: {
      name: 'Smokey Jollof Rice',
      description:
        'Fire-wood smoked rice served with spicy grilled chicken and fried plantain.',
      basePrice: 18.0,
      categoryId: mainDishes.id,
      image:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      tags: JSON.stringify(['spicy', 'popular', 'chicken']),
      customizations: {
        create: [
          {
            name: 'Pepper Level',
            type: 'RADIO',
            required: true,
            options: {
              create: [
                { name: 'Low', priceModifier: 0 },
                { name: 'Medium', priceModifier: 0 },
                { name: 'Extra', priceModifier: 0 },
                { name: 'African Hot', priceModifier: 0 },
              ],
            },
          },
          {
            name: 'Extra Meat',
            type: 'CHECKBOX',
            required: false,
            options: {
              create: [
                { name: 'Extra Chicken', priceModifier: 5.0 },
                { name: 'Extra Beef', priceModifier: 6.0 },
              ],
            },
          },
          {
            name: 'Special Instructions',
            type: 'TEXT',
            required: false,
            options: {
              create: [],
            },
          },
        ],
      },
    },
  });

  const egusiSoup = await db.menuItem.upsert({
    where: {
      categoryId_name: {
        categoryId: soups.id,
        name: 'Egusi Soup & Yam',
      },
    },
    update: {},
    create: {
      name: 'Egusi Soup & Yam',
      description:
        'Rich melon seed soup with spinach and assorted meat, served with pounded yam.',
      basePrice: 22.0,
      categoryId: soups.id,
      image:
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      tags: JSON.stringify(['traditional', 'soup', 'meat']),
      customizations: {
        create: [
          {
            name: 'Meat Selection',
            type: 'CHECKBOX',
            required: false,
            maxSelections: 3,
            options: {
              create: [
                { name: 'Beef', priceModifier: 0 },
                { name: 'Goat Meat', priceModifier: 3.0 },
                { name: 'Fish', priceModifier: 2.0 },
                { name: 'Chicken', priceModifier: 0 },
              ],
            },
          },
          {
            name: 'Spice Level',
            type: 'RADIO',
            required: true,
            options: {
              create: [
                { name: 'Mild', priceModifier: 0 },
                { name: 'Medium', priceModifier: 0 },
                { name: 'Hot', priceModifier: 0 },
              ],
            },
          },
        ],
      },
    },
  });

  const beefSuya = await db.menuItem.upsert({
    where: {
      categoryId_name: {
        categoryId: starters.id,
        name: 'Beef Suya Platter',
      },
    },
    update: {},
    create: {
      name: 'Beef Suya Platter',
      description:
        'Thinly sliced beef marinated in spicy peanut blend, grilled to perfection with onions.',
      basePrice: 24.0,
      categoryId: starters.id,
      image:
        'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      tags: JSON.stringify(['spicy', 'grilled', 'beef', 'popular']),
      customizations: {
        create: [
          {
            name: 'Spice Level',
            type: 'RADIO',
            required: true,
            options: {
              create: [
                { name: 'Mild', priceModifier: 0 },
                { name: 'Medium', priceModifier: 0 },
                { name: 'Hot', priceModifier: 0 },
                { name: 'Extra Hot', priceModifier: 0 },
              ],
            },
          },
          {
            name: 'Add-ons',
            type: 'CHECKBOX',
            required: false,
            options: {
              create: [
                { name: 'Extra Onions', priceModifier: 1.0 },
                { name: 'Extra Tomatoes', priceModifier: 1.5 },
                { name: 'Yaji Spice', priceModifier: 0.5 },
              ],
            },
          },
        ],
      },
    },
  });

  const friedPlantain = await db.menuItem.upsert({
    where: {
      categoryId_name: {
        categoryId: sides.id,
        name: 'Sweet Fried Plantain',
      },
    },
    update: {},
    create: {
      name: 'Sweet Fried Plantain',
      description:
        'Golden fried ripe plantains, perfectly caramelized and sweet.',
      basePrice: 8.0,
      categoryId: sides.id,
      image:
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      tags: JSON.stringify(['vegetarian', 'sweet', 'side']),
      customizations: {
        create: [
          {
            name: 'Preparation Style',
            type: 'RADIO',
            required: false,
            options: {
              create: [
                { name: 'Regular Cut', priceModifier: 0 },
                { name: 'Thick Cut', priceModifier: 1.0 },
                { name: 'Diced', priceModifier: 0 },
              ],
            },
          },
        ],
      },
    },
  });

  const pepperSoup = await db.menuItem.upsert({
    where: {
      categoryId_name: {
        categoryId: soups.id,
        name: 'Goat Meat Pepper Soup',
      },
    },
    update: {},
    create: {
      name: 'Goat Meat Pepper Soup',
      description:
        'Spicy and aromatic soup with tender goat meat and traditional African spices.',
      basePrice: 19.0,
      categoryId: soups.id,
      image:
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      tags: JSON.stringify(['spicy', 'soup', 'goat', 'traditional']),
      customizations: {
        create: [
          {
            name: 'Heat Level',
            type: 'RADIO',
            required: true,
            options: {
              create: [
                { name: 'Mild', priceModifier: 0 },
                { name: 'Medium', priceModifier: 0 },
                { name: 'Hot', priceModifier: 0 },
                { name: 'African Hot', priceModifier: 0 },
              ],
            },
          },
          {
            name: 'Extra Meat',
            type: 'CHECKBOX',
            required: false,
            options: {
              create: [
                { name: 'Extra Goat Meat', priceModifier: 7.0 },
                { name: 'Add Fish', priceModifier: 4.0 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Menu items created successfully!');

  // Create packages
  const dailyPackage = await db.package.upsert({
    where: { slug: 'daily-meal-package' },
    update: {},
    create: {
      name: 'Daily Meal Package',
      slug: 'daily-meal-package',
      description:
        'Perfect for trying our authentic African cuisine with a complete meal for one day.',
      type: 'DAILY',
      price: 35.0,
      image:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      isActive: true,
      features: JSON.stringify([
        'Complete meal for one person',
        'Authentic West African flavors',
        'Includes main dish, side, and starter',
        'Perfect portion sizes',
        'Ready in 30 minutes',
      ]),
      includedItems: {
        create: [
          {
            menuItemId: jollofRice.id,
            quantity: 1,
            // Get actual customization and option IDs for Jollof Rice
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(jollofRice.id, [
                { customizationName: 'Pepper Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: friedPlantain.id,
            quantity: 1,
            // Get actual customization and option IDs for Fried Plantain
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(friedPlantain.id, [
                {
                  customizationName: 'Preparation Style',
                  optionName: 'Regular Cut',
                },
              ])
            ),
          },
          {
            menuItemId: beefSuya.id,
            quantity: 1,
            // Get actual customization and option IDs for Beef Suya
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(beefSuya.id, [
                { customizationName: 'Spice Level', optionName: 'Medium' },
              ])
            ),
          },
        ],
      },
    },
  });

  const weeklyPackage = await db.package.upsert({
    where: { slug: 'weekly-meal-package' },
    update: {},
    create: {
      name: 'Weekly Meal Package',
      slug: 'weekly-meal-package',
      description:
        "A week's worth of delicious African meals with variety and convenience.",
      type: 'WEEKLY',
      price: 220.0,
      image:
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      isActive: true,
      features: JSON.stringify([
        '7 complete meals for the week',
        'Variety of main dishes and sides',
        'Includes traditional soups',
        'Save 15% compared to individual orders',
        'Meal planning made easy',
        'Fresh ingredients daily',
      ]),
      includedItems: {
        create: [
          {
            menuItemId: jollofRice.id,
            quantity: 2,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(jollofRice.id, [
                { customizationName: 'Pepper Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: egusiSoup.id,
            quantity: 2,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(egusiSoup.id, [
                { customizationName: 'Spice Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: pepperSoup.id,
            quantity: 1,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(pepperSoup.id, [
                { customizationName: 'Heat Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: friedPlantain.id,
            quantity: 3,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(friedPlantain.id, [
                {
                  customizationName: 'Preparation Style',
                  optionName: 'Regular Cut',
                },
              ])
            ),
          },
          {
            menuItemId: beefSuya.id,
            quantity: 1,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(beefSuya.id, [
                { customizationName: 'Spice Level', optionName: 'Medium' },
              ])
            ),
          },
        ],
      },
    },
  });

  const monthlyPackage = await db.package.upsert({
    where: { slug: 'monthly-meal-package' },
    update: {},
    create: {
      name: 'Monthly Meal Package',
      slug: 'monthly-meal-package',
      description:
        'The ultimate African cuisine experience with a full month of diverse, authentic meals.',
      type: 'MONTHLY',
      price: 850.0,
      image:
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      isActive: true,
      features: JSON.stringify([
        '30 complete meals for the month',
        'Maximum variety with all menu categories',
        'Includes soups, mains, sides, and starters',
        'Save 25% compared to individual orders',
        'Priority delivery scheduling',
        'Customizable meal rotation',
        'Dedicated customer support',
        'Free delivery included',
      ]),
      includedItems: {
        create: [
          {
            menuItemId: jollofRice.id,
            quantity: 4,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(jollofRice.id, [
                { customizationName: 'Pepper Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: egusiSoup.id,
            quantity: 4,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(egusiSoup.id, [
                { customizationName: 'Spice Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: pepperSoup.id,
            quantity: 2,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(pepperSoup.id, [
                { customizationName: 'Heat Level', optionName: 'Medium' },
              ])
            ),
          },
          {
            menuItemId: friedPlantain.id,
            quantity: 8,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(friedPlantain.id, [
                {
                  customizationName: 'Preparation Style',
                  optionName: 'Regular Cut',
                },
              ])
            ),
          },
          {
            menuItemId: beefSuya.id,
            quantity: 2,
            includedCustomizations: JSON.stringify(
              await getDefaultCustomizations(beefSuya.id, [
                { customizationName: 'Spice Level', optionName: 'Medium' },
              ])
            ),
          },
        ],
      },
    },
  });

  console.log('Packages created successfully!');
  console.log('Daily Package:', dailyPackage.name);
  console.log('Weekly Package:', weeklyPackage.name);
  console.log('Monthly Package:', monthlyPackage.name);

  // Create customer address
  const customerAddress = await db.address.create({
    data: {
      userId: customerUser.id,
      street: '123 Main Street',
      unit: 'Apt 4B',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 3A8',
      isDefault: true,
    },
  });

  // Create sample orders
  const order1 = await db.order.create({
    data: {
      orderNumber: 'ORD-001',
      customerId: customerUser.id,
      status: 'PENDING',
      deliveryType: 'DELIVERY',
      subtotal: 45.0,
      tax: 5.85,
      deliveryFee: 5.0,
      tip: 7.0,
      total: 62.85,
      paymentStatus: 'COMPLETED',
      specialInstructions: 'Please ring the doorbell twice',
      deliveryAddressId: customerAddress.id,
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      items: {
        create: [
          {
            menuItemId: jollofRice.id,
            quantity: 2,
            unitPrice: 15.0,
            totalPrice: 30.0,
            customizations: JSON.stringify([
              { name: 'Pepper Level', value: 'Medium', price: 0 },
            ]),
            specialInstructions: 'Extra vegetables please',
          },
          {
            menuItemId: friedPlantain.id,
            quantity: 1,
            unitPrice: 8.0,
            totalPrice: 8.0,
            customizations: JSON.stringify([
              { name: 'Preparation Style', value: 'Regular Cut', price: 0 },
            ]),
          },
          {
            menuItemId: beefSuya.id,
            quantity: 1,
            unitPrice: 12.0,
            totalPrice: 12.0,
            customizations: JSON.stringify([
              { name: 'Spice Level', value: 'Hot', price: 1.0 },
            ]),
          },
        ],
      },
    },
  });

  const order2 = await db.order.create({
    data: {
      orderNumber: 'ORD-002',
      customerId: customerUser.id,
      status: 'CONFIRMED',
      deliveryType: 'PICKUP',
      subtotal: 28.0,
      tax: 3.64,
      deliveryFee: 0.0,
      tip: 4.0,
      total: 35.64,
      paymentStatus: 'COMPLETED',
      scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      items: {
        create: [
          {
            menuItemId: egusiSoup.id,
            quantity: 1,
            unitPrice: 18.0,
            totalPrice: 18.0,
            customizations: JSON.stringify([
              { name: 'Spice Level', value: 'Mild', price: 0 },
            ]),
          },
          {
            menuItemId: pepperSoup.id,
            quantity: 1,
            unitPrice: 16.0,
            totalPrice: 16.0,
            customizations: JSON.stringify([
              { name: 'Heat Level', value: 'Medium', price: 0 },
            ]),
          },
        ],
      },
    },
  });

  const order3 = await db.order.create({
    data: {
      orderNumber: 'ORD-003',
      customerId: customerUser.id,
      status: 'PREPARING',
      deliveryType: 'DELIVERY',
      subtotal: 35.0,
      tax: 4.55,
      deliveryFee: 5.0,
      tip: 5.5,
      total: 50.05,
      paymentStatus: 'COMPLETED',
      deliveryAddressId: customerAddress.id,
      scheduledFor: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      items: {
        create: [
          {
            menuItemId: jollofRice.id,
            quantity: 1,
            unitPrice: 15.0,
            totalPrice: 15.0,
            customizations: JSON.stringify([
              { name: 'Pepper Level', value: 'Hot', price: 1.0 },
            ]),
          },
          {
            menuItemId: egusiSoup.id,
            quantity: 1,
            unitPrice: 18.0,
            totalPrice: 18.0,
            customizations: JSON.stringify([
              { name: 'Spice Level', value: 'Medium', price: 0 },
            ]),
          },
          {
            menuItemId: beefSuya.id,
            quantity: 1,
            unitPrice: 12.0,
            totalPrice: 12.0,
            customizations: JSON.stringify([
              { name: 'Spice Level', value: 'Medium', price: 0 },
            ]),
          },
        ],
      },
    },
  });

  console.log('Sample orders created:');
  console.log('Order 1:', order1.orderNumber, '- Status:', order1.status);
  console.log('Order 2:', order2.orderNumber, '- Status:', order2.status);
  console.log('Order 3:', order3.orderNumber, '- Status:', order3.status);

  console.log('Seed data created successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
