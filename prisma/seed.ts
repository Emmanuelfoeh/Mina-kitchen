import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';

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
  const mainDishes = await db.menuCategory.create({
    data: {
      name: 'Main Dishes',
      description: 'Hearty traditional African main courses',
      displayOrder: 1,
    },
  });

  const soups = await db.menuCategory.create({
    data: {
      name: 'Soups',
      description: 'Rich and flavorful African soups',
      displayOrder: 2,
    },
  });

  const sides = await db.menuCategory.create({
    data: {
      name: 'Sides',
      description: 'Perfect accompaniments to your meal',
      displayOrder: 3,
    },
  });

  const starters = await db.menuCategory.create({
    data: {
      name: 'Starters',
      description: 'Light bites to start your meal',
      displayOrder: 4,
    },
  });

  // Create menu items
  const jollofRice = await db.menuItem.create({
    data: {
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

  const egusiSoup = await db.menuItem.create({
    data: {
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

  const beefSuya = await db.menuItem.create({
    data: {
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

  const friedPlantain = await db.menuItem.create({
    data: {
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

  const pepperSoup = await db.menuItem.create({
    data: {
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
