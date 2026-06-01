/**
 * Mock data for tests and local prototyping.
 *
 * This is NOT used by production code paths — real data comes from the API /
 * database. It exists so test suites have stable, well-typed fixtures.
 */
import type { MenuItem, MenuCategory, Package } from '@/types';

const TENANT_ID = 'tenant_default';
const NOW = new Date('2026-01-01T00:00:00.000Z');

const mainDishes: MenuCategory = {
  id: 'cat_main',
  name: 'Main Dishes',
  description: 'Hearty West African mains',
  displayOrder: 1,
  isActive: true,
  tenantId: TENANT_ID,
};

const soups: MenuCategory = {
  id: 'cat_soups',
  name: 'Soups',
  description: 'Traditional soups',
  displayOrder: 2,
  isActive: true,
  tenantId: TENANT_ID,
};

export const mockMenuItems: MenuItem[] = [
  {
    id: 'item_jollof',
    name: 'Smokey Jollof Rice',
    description: 'Party-style smokey jollof rice with peppers and spices.',
    basePrice: 15.99,
    category: mainDishes,
    image: '/placeholder-food.svg',
    slug: 'smokey-jollof-rice',
    status: 'active',
    customizations: [
      {
        id: 'cust_protein',
        name: 'Protein',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'opt_chicken',
            name: 'Chicken',
            priceModifier: 3,
            isAvailable: true,
          },
          { id: 'opt_beef', name: 'Beef', priceModifier: 4, isAvailable: true },
        ],
      },
    ],
    tags: ['popular', 'spicy'],
    tenantId: TENANT_ID,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'item_egusi',
    name: 'Egusi Soup & Yam',
    description: 'Melon-seed soup served with boiled yam.',
    basePrice: 18.5,
    category: soups,
    image: '/placeholder-food.svg',
    slug: 'egusi-soup-yam',
    status: 'active',
    customizations: [],
    tags: ['traditional'],
    tenantId: TENANT_ID,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'item_suya',
    name: 'Beef Suya Platter',
    description: 'Grilled spiced beef skewers with onions and yaji.',
    basePrice: 14.0,
    category: mainDishes,
    image: '/placeholder-food.svg',
    slug: 'beef-suya-platter',
    status: 'active',
    customizations: [],
    tags: ['grilled', 'spicy'],
    tenantId: TENANT_ID,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const mockPackages: Package[] = [
  {
    id: 'pkg_family',
    name: 'Family Feast',
    description: 'A weekly bundle that feeds a family of four.',
    type: 'weekly',
    price: 89.99,
    includedItems: [
      {
        menuItemId: 'item_jollof',
        quantity: 2,
        includedCustomizations: [],
      },
      {
        menuItemId: 'item_egusi',
        quantity: 1,
        includedCustomizations: [],
      },
    ],
    image: '/placeholder-food.svg',
    slug: 'family-feast',
    isActive: true,
    features: ['Free delivery', 'Serves 4'],
    tenantId: TENANT_ID,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'pkg_solo',
    name: 'Solo Weekday',
    description: 'Five weekday lunches for one.',
    type: 'weekly',
    price: 54.99,
    includedItems: [
      {
        menuItemId: 'item_suya',
        quantity: 5,
        includedCustomizations: [],
      },
    ],
    image: '/placeholder-food.svg',
    slug: 'solo-weekday',
    isActive: true,
    features: ['Weekday lunches'],
    tenantId: TENANT_ID,
    createdAt: NOW,
    updatedAt: NOW,
  },
];
