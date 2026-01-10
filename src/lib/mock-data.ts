// Mock data for testing the meal customization modal
import type { MenuItem, MenuCategory, Customization, Package } from '@/types';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils';

export const mockCategories: MenuCategory[] = [
  {
    id: '1',
    name: 'Main Dishes',
    description: 'Hearty traditional African main courses',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    name: 'Soups',
    description: 'Rich and flavorful African soups',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: '3',
    name: 'Sides',
    description: 'Perfect accompaniments to your meal',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: '4',
    name: 'Starters',
    description: 'Light bites to start your meal',
    displayOrder: 4,
    isActive: true,
  },
];

export const mockCustomizations: Customization[] = [
  {
    id: 'pepper-level',
    name: 'Pepper Level',
    type: 'radio',
    required: true,
    options: [
      { id: 'low', name: 'Low', priceModifier: 0, isAvailable: true },
      { id: 'medium', name: 'Medium', priceModifier: 0, isAvailable: true },
      { id: 'extra', name: 'Extra', priceModifier: 0, isAvailable: true },
      {
        id: 'african-hot',
        name: 'African Hot',
        priceModifier: 0,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'extra-meat',
    name: 'Extra Meat',
    type: 'checkbox',
    required: false,
    options: [
      {
        id: 'extra-chicken',
        name: 'Extra Chicken',
        priceModifier: 5.0,
        isAvailable: true,
      },
      {
        id: 'extra-beef',
        name: 'Extra Beef',
        priceModifier: 6.0,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'special-instructions',
    name: 'Special Instructions',
    type: 'text',
    required: false,
    options: [],
  },
];

export const mockMenuItems: MenuItem[] = [
  // Main Dishes
  {
    id: '1',
    name: 'Smokey Jollof Rice',
    description:
      'Fire-wood smoked rice served with spicy grilled chicken and fried plantain.',
    basePrice: 18.0,
    category: mockCategories[0],
    image:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ],
    status: 'active',
    customizations: mockCustomizations,
    nutritionalInfo: {
      calories: 650,
      protein: 35,
      carbs: 75,
      fat: 18,
      fiber: 4,
      sodium: 890,
    },
    tags: ['spicy', 'popular', 'chicken'],
    relatedItemIds: ['12', '3', '13', '17'], // Fried Plantain, Beef Suya, Coconut Rice, Chicken Wings
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Grilled Tilapia & Rice',
    description:
      'Fresh tilapia grilled with African spices, served with coconut rice and steamed vegetables.',
    basePrice: 26.0,
    category: mockCategories[0],
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'fish-preparation',
        name: 'Fish Preparation',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'grilled',
            name: 'Grilled',
            priceModifier: 0,
            isAvailable: true,
          },
          { id: 'fried', name: 'Fried', priceModifier: 2.0, isAvailable: true },
          {
            id: 'steamed',
            name: 'Steamed',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 580,
      protein: 45,
      carbs: 52,
      fat: 22,
      fiber: 3,
      sodium: 720,
    },
    tags: ['fish', 'healthy', 'grilled'],
    relatedItemIds: ['13', '16', '12', '15'], // Coconut Rice, Steamed Vegetables, Fried Plantain, Moi Moi
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Pepper Chicken & Plantain',
    description:
      'Tender chicken pieces in spicy pepper sauce with sweet fried plantain and rice.',
    basePrice: 20.0,
    category: mockCategories[0],
    image:
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: mockCustomizations,
    nutritionalInfo: {
      calories: 695,
      protein: 38,
      carbs: 68,
      fat: 28,
      fiber: 5,
      sodium: 950,
    },
    tags: ['spicy', 'chicken', 'traditional'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Goat Meat Stew & Yam',
    description:
      'Slow-cooked goat meat in rich tomato stew, served with boiled yam and vegetables.',
    basePrice: 28.0,
    category: mockCategories[0],
    image:
      'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      mockCustomizations[0], // pepper level
      {
        id: 'yam-preparation',
        name: 'Yam Preparation',
        type: 'radio',
        required: true,
        options: [
          { id: 'boiled', name: 'Boiled', priceModifier: 0, isAvailable: true },
          { id: 'fried', name: 'Fried', priceModifier: 1.5, isAvailable: true },
          {
            id: 'pounded',
            name: 'Pounded',
            priceModifier: 2.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 780,
      protein: 48,
      carbs: 62,
      fat: 32,
      fiber: 6,
      sodium: 1100,
    },
    tags: ['traditional', 'goat', 'stew'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Beef & Okra Stew',
    description:
      'Tender beef chunks with fresh okra in palm oil sauce, served with fufu or rice.',
    basePrice: 24.0,
    category: mockCategories[0],
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      mockCustomizations[0], // pepper level
      {
        id: 'starch-choice',
        name: 'Starch Choice',
        type: 'radio',
        required: true,
        options: [
          { id: 'rice', name: 'Rice', priceModifier: 0, isAvailable: true },
          { id: 'fufu', name: 'Fufu', priceModifier: 1.0, isAvailable: true },
          { id: 'eba', name: 'Eba', priceModifier: 1.0, isAvailable: true },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 720,
      protein: 42,
      carbs: 58,
      fat: 30,
      fiber: 8,
      sodium: 980,
    },
    tags: ['beef', 'traditional', 'okra'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Soups
  {
    id: '2',
    name: 'Egusi Soup & Yam',
    description:
      'Rich melon seed soup with spinach and assorted meat, served with pounded yam.',
    basePrice: 22.0,
    category: mockCategories[1],
    image:
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'meat-selection',
        name: 'Meat Selection',
        type: 'checkbox',
        required: false,
        maxSelections: 3,
        options: [
          { id: 'beef', name: 'Beef', priceModifier: 0, isAvailable: true },
          {
            id: 'goat-meat',
            name: 'Goat Meat',
            priceModifier: 3.0,
            isAvailable: true,
          },
          { id: 'fish', name: 'Fish', priceModifier: 2.0, isAvailable: true },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'spice-level',
        name: 'Spice Level',
        type: 'radio',
        required: true,
        options: [
          { id: 'mild', name: 'Mild', priceModifier: 0, isAvailable: true },
          { id: 'medium', name: 'Medium', priceModifier: 0, isAvailable: true },
          { id: 'hot', name: 'Hot', priceModifier: 0, isAvailable: true },
        ],
      },
    ],
    nutritionalInfo: {
      calories: 720,
      protein: 42,
      carbs: 65,
      fat: 25,
      fiber: 8,
      sodium: 1200,
    },
    tags: ['traditional', 'soup', 'meat'],
    relatedItemIds: ['14', '15', '6', '7'], // Yam Porridge, Moi Moi, Goat Meat Stew, Beef & Okra Stew
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Bitter Leaf Soup',
    description:
      'Traditional bitter leaf soup with assorted meat and fish, served with fufu.',
    basePrice: 24.0,
    category: mockCategories[1],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'protein-mix',
        name: 'Protein Mix',
        type: 'checkbox',
        required: false,
        options: [
          {
            id: 'stockfish',
            name: 'Stockfish',
            priceModifier: 3.0,
            isAvailable: true,
          },
          {
            id: 'dried-fish',
            name: 'Dried Fish',
            priceModifier: 2.0,
            isAvailable: true,
          },
          { id: 'beef', name: 'Beef', priceModifier: 0, isAvailable: true },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 680,
      protein: 45,
      carbs: 48,
      fat: 28,
      fiber: 12,
      sodium: 1150,
    },
    tags: ['traditional', 'soup', 'bitter-leaf'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    name: 'Pepper Soup',
    description:
      'Spicy clear soup with goat meat or fish, perfect for cold days.',
    basePrice: 18.0,
    category: mockCategories[1],
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'protein-choice',
        name: 'Protein Choice',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'goat-meat',
            name: 'Goat Meat',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'catfish',
            name: 'Catfish',
            priceModifier: 2.0,
            isAvailable: true,
          },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: -1.0,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'heat-level',
        name: 'Heat Level',
        type: 'radio',
        required: true,
        options: [
          { id: 'mild', name: 'Mild', priceModifier: 0, isAvailable: true },
          { id: 'medium', name: 'Medium', priceModifier: 0, isAvailable: true },
          { id: 'hot', name: 'Hot', priceModifier: 0, isAvailable: true },
          {
            id: 'extra-hot',
            name: 'Extra Hot',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 420,
      protein: 35,
      carbs: 8,
      fat: 28,
      fiber: 2,
      sodium: 980,
    },
    tags: ['spicy', 'soup', 'traditional'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    name: 'Oha Soup',
    description:
      'Delicious oha leaf soup with cocoyam paste and assorted meat.',
    basePrice: 26.0,
    category: mockCategories[1],
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'meat-selection-oha',
        name: 'Meat Selection',
        type: 'checkbox',
        required: false,
        options: [
          { id: 'beef', name: 'Beef', priceModifier: 0, isAvailable: true },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'stockfish',
            name: 'Stockfish',
            priceModifier: 3.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 750,
      protein: 40,
      carbs: 55,
      fat: 32,
      fiber: 10,
      sodium: 1080,
    },
    tags: ['traditional', 'soup', 'oha'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    name: 'Ogbono Soup',
    description:
      'Thick ogbono seed soup with vegetables and your choice of protein.',
    basePrice: 20.0,
    category: mockCategories[1],
    image:
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'protein-ogbono',
        name: 'Protein Choice',
        type: 'checkbox',
        required: false,
        options: [
          { id: 'beef', name: 'Beef', priceModifier: 0, isAvailable: true },
          { id: 'fish', name: 'Fish', priceModifier: 2.0, isAvailable: true },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 650,
      protein: 38,
      carbs: 45,
      fat: 30,
      fiber: 8,
      sodium: 950,
    },
    tags: ['traditional', 'soup', 'ogbono'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Sides
  {
    id: '12',
    name: 'Fried Plantain',
    description: 'Sweet ripe plantains fried to golden perfection.',
    basePrice: 8.0,
    category: mockCategories[2],
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'plantain-style',
        name: 'Preparation Style',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'regular',
            name: 'Regular Slices',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'chunky',
            name: 'Chunky Pieces',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'chips',
            name: 'Plantain Chips',
            priceModifier: 1.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 280,
      protein: 2,
      carbs: 58,
      fat: 8,
      fiber: 4,
      sodium: 120,
    },
    tags: ['sweet', 'plantain', 'side'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    name: 'Coconut Rice',
    description: 'Fragrant rice cooked in coconut milk with spices.',
    basePrice: 10.0,
    category: mockCategories[2],
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'rice-portion',
        name: 'Portion Size',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'regular',
            name: 'Regular',
            priceModifier: 0,
            isAvailable: true,
          },
          { id: 'large', name: 'Large', priceModifier: 3.0, isAvailable: true },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 320,
      protein: 6,
      carbs: 65,
      fat: 5,
      fiber: 2,
      sodium: 480,
    },
    tags: ['coconut', 'rice', 'side'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '14',
    name: 'Yam Porridge',
    description: 'Soft yam cooked with vegetables and palm oil.',
    basePrice: 12.0,
    category: mockCategories[2],
    image:
      'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'vegetable-mix',
        name: 'Vegetable Mix',
        type: 'checkbox',
        required: false,
        options: [
          {
            id: 'spinach',
            name: 'Spinach',
            priceModifier: 1.0,
            isAvailable: true,
          },
          {
            id: 'ugwu',
            name: 'Ugwu Leaves',
            priceModifier: 1.0,
            isAvailable: true,
          },
          {
            id: 'scent-leaf',
            name: 'Scent Leaf',
            priceModifier: 0.5,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 380,
      protein: 8,
      carbs: 72,
      fat: 8,
      fiber: 6,
      sodium: 650,
    },
    tags: ['yam', 'vegetables', 'side'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '15',
    name: 'Moi Moi',
    description: 'Steamed bean pudding with eggs and fish.',
    basePrice: 9.0,
    category: mockCategories[2],
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'moi-moi-extras',
        name: 'Add-ins',
        type: 'checkbox',
        required: false,
        options: [
          {
            id: 'boiled-egg',
            name: 'Boiled Egg',
            priceModifier: 1.5,
            isAvailable: true,
          },
          { id: 'fish', name: 'Fish', priceModifier: 2.0, isAvailable: true },
          {
            id: 'corned-beef',
            name: 'Corned Beef',
            priceModifier: 2.5,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 250,
      protein: 15,
      carbs: 35,
      fat: 6,
      fiber: 8,
      sodium: 580,
    },
    tags: ['beans', 'protein', 'side'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '16',
    name: 'Steamed Vegetables',
    description: 'Fresh mixed vegetables lightly steamed with African spices.',
    basePrice: 7.0,
    category: mockCategories[2],
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'vegetable-selection',
        name: 'Vegetable Selection',
        type: 'checkbox',
        required: false,
        options: [
          {
            id: 'carrots',
            name: 'Carrots',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'green-beans',
            name: 'Green Beans',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'cabbage',
            name: 'Cabbage',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'broccoli',
            name: 'Broccoli',
            priceModifier: 1.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 120,
      protein: 4,
      carbs: 25,
      fat: 2,
      fiber: 8,
      sodium: 320,
    },
    tags: ['healthy', 'vegetables', 'side'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Starters
  {
    id: '3',
    name: 'Beef Suya Platter',
    description:
      'Thinly sliced beef marinated in spicy peanut blend, grilled to perfection with onions.',
    basePrice: 24.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ],
    status: 'active',
    customizations: [
      {
        id: 'spice-level-suya',
        name: 'Spice Level',
        type: 'radio',
        required: true,
        options: [
          { id: 'mild', name: 'Mild', priceModifier: 0, isAvailable: true },
          { id: 'medium', name: 'Medium', priceModifier: 0, isAvailable: true },
          { id: 'hot', name: 'Hot', priceModifier: 0, isAvailable: true },
          {
            id: 'extra-hot',
            name: 'Extra Hot',
            priceModifier: 0,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'add-ons',
        name: 'Add-ons',
        type: 'checkbox',
        required: false,
        options: [
          {
            id: 'extra-onions',
            name: 'Extra Onions',
            priceModifier: 1.0,
            isAvailable: true,
          },
          {
            id: 'extra-tomatoes',
            name: 'Extra Tomatoes',
            priceModifier: 1.5,
            isAvailable: true,
          },
          {
            id: 'yaji-spice',
            name: 'Yaji Spice',
            priceModifier: 0.5,
            isAvailable: true,
          },
        ],
      },
    ],
    nutritionalInfo: {
      calories: 480,
      protein: 38,
      carbs: 12,
      fat: 32,
      fiber: 2,
      sodium: 650,
    },
    tags: ['spicy', 'grilled', 'beef', 'popular'],
    relatedItemIds: ['1', '17', '20', '21'], // Smokey Jollof Rice, Chicken Wings, Puff Puff, Chin Chin
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '17',
    name: 'Chicken Wings',
    description: 'Spicy grilled chicken wings with African pepper sauce.',
    basePrice: 16.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'wing-quantity',
        name: 'Quantity',
        type: 'radio',
        required: true,
        options: [
          {
            id: '6-pieces',
            name: '6 Pieces',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: '10-pieces',
            name: '10 Pieces',
            priceModifier: 6.0,
            isAvailable: true,
          },
          {
            id: '15-pieces',
            name: '15 Pieces',
            priceModifier: 12.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[0], // pepper level
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 420,
      protein: 32,
      carbs: 8,
      fat: 28,
      fiber: 1,
      sodium: 780,
    },
    tags: ['chicken', 'spicy', 'grilled'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '18',
    name: 'Fish Rolls',
    description:
      'Crispy pastry rolls filled with seasoned fish and vegetables.',
    basePrice: 12.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'roll-quantity',
        name: 'Quantity',
        type: 'radio',
        required: true,
        options: [
          {
            id: '4-pieces',
            name: '4 Pieces',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: '6-pieces',
            name: '6 Pieces',
            priceModifier: 4.0,
            isAvailable: true,
          },
          {
            id: '8-pieces',
            name: '8 Pieces',
            priceModifier: 8.0,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'dipping-sauce',
        name: 'Dipping Sauce',
        type: 'radio',
        required: false,
        options: [
          {
            id: 'pepper-sauce',
            name: 'Pepper Sauce',
            priceModifier: 0.5,
            isAvailable: true,
          },
          {
            id: 'tomato-sauce',
            name: 'Tomato Sauce',
            priceModifier: 0.5,
            isAvailable: true,
          },
          { id: 'none', name: 'No Sauce', priceModifier: 0, isAvailable: true },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 320,
      protein: 18,
      carbs: 28,
      fat: 16,
      fiber: 2,
      sodium: 520,
    },
    tags: ['fish', 'crispy', 'pastry'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '19',
    name: 'Meat Pie',
    description:
      'Flaky pastry filled with seasoned minced meat and vegetables.',
    basePrice: 8.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'pie-size',
        name: 'Size',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'regular',
            name: 'Regular',
            priceModifier: 0,
            isAvailable: true,
          },
          { id: 'large', name: 'Large', priceModifier: 3.0, isAvailable: true },
        ],
      },
      {
        id: 'meat-type',
        name: 'Meat Type',
        type: 'radio',
        required: true,
        options: [
          { id: 'beef', name: 'Beef', priceModifier: 0, isAvailable: true },
          {
            id: 'chicken',
            name: 'Chicken',
            priceModifier: 0,
            isAvailable: true,
          },
          { id: 'mixed', name: 'Mixed', priceModifier: 1.0, isAvailable: true },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 380,
      protein: 16,
      carbs: 32,
      fat: 22,
      fiber: 3,
      sodium: 680,
    },
    tags: ['pastry', 'meat', 'traditional'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '20',
    name: 'Puff Puff',
    description: 'Sweet fried dough balls, perfect as a snack or dessert.',
    basePrice: 6.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'puff-quantity',
        name: 'Quantity',
        type: 'radio',
        required: true,
        options: [
          {
            id: '6-pieces',
            name: '6 Pieces',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: '10-pieces',
            name: '10 Pieces',
            priceModifier: 3.0,
            isAvailable: true,
          },
          {
            id: '15-pieces',
            name: '15 Pieces',
            priceModifier: 6.0,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'sweetness-level',
        name: 'Sweetness Level',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'regular',
            name: 'Regular',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'extra-sweet',
            name: 'Extra Sweet',
            priceModifier: 0.5,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 240,
      protein: 4,
      carbs: 38,
      fat: 8,
      fiber: 1,
      sodium: 180,
    },
    tags: ['sweet', 'fried', 'snack'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '21',
    name: 'Chin Chin',
    description:
      'Crunchy fried pastry cubes, lightly sweetened and perfect for sharing.',
    basePrice: 5.0,
    category: mockCategories[3],
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'active',
    customizations: [
      {
        id: 'chin-chin-size',
        name: 'Portion Size',
        type: 'radio',
        required: true,
        options: [
          {
            id: 'small',
            name: 'Small Bowl',
            priceModifier: 0,
            isAvailable: true,
          },
          {
            id: 'medium',
            name: 'Medium Bowl',
            priceModifier: 2.0,
            isAvailable: true,
          },
          {
            id: 'large',
            name: 'Large Bowl',
            priceModifier: 4.0,
            isAvailable: true,
          },
        ],
      },
      mockCustomizations[2], // special instructions
    ],
    nutritionalInfo: {
      calories: 180,
      protein: 3,
      carbs: 28,
      fat: 6,
      fiber: 1,
      sodium: 120,
    },
    tags: ['sweet', 'crunchy', 'snack'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Packages
export const mockPackages: Package[] = [
  {
    id: 'daily-package',
    name: 'Daily Meal Package',
    description:
      'Perfect for trying our authentic African cuisine with a complete meal for one day.',
    type: 'daily',
    price: 35.0,
    includedItems: [
      {
        menuItemId: '1', // Smokey Jollof Rice
        quantity: 1,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '12', // Fried Plantain
        quantity: 1,
        includedCustomizations: ['plantain-style:regular'],
      },
      {
        menuItemId: '3', // Beef Suya Platter
        quantity: 1,
        includedCustomizations: ['spice-level-suya:medium'],
      },
    ],
    image:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    isActive: true,
    features: [
      'Complete meal for one person',
      'Authentic West African flavors',
      'Includes main dish, side, and starter',
      'Perfect portion sizes',
      'Ready in 30 minutes',
    ],
    relatedPackageIds: ['weekly-package'], // Suggest weekly package as upgrade
  },
  {
    id: 'weekly-package',
    name: 'Weekly Meal Package',
    description:
      "A week's worth of delicious African meals with variety and convenience.",
    type: 'weekly',
    price: 220.0,
    includedItems: [
      {
        menuItemId: '1', // Smokey Jollof Rice
        quantity: 2,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '4', // Grilled Tilapia & Rice
        quantity: 2,
        includedCustomizations: [
          'fish-preparation:grilled',
          'pepper-level:medium',
        ],
      },
      {
        menuItemId: '5', // Pepper Chicken & Plantain
        quantity: 2,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '2', // Egusi Soup & Yam
        quantity: 1,
        includedCustomizations: ['spice-level:medium'],
      },
      {
        menuItemId: '12', // Fried Plantain
        quantity: 3,
        includedCustomizations: ['plantain-style:regular'],
      },
      {
        menuItemId: '13', // Coconut Rice
        quantity: 2,
        includedCustomizations: ['rice-portion:regular'],
      },
      {
        menuItemId: '3', // Beef Suya Platter
        quantity: 1,
        includedCustomizations: ['spice-level-suya:medium'],
      },
    ],
    image:
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    features: [
      '7 complete meals for the week',
      'Variety of main dishes and sides',
      'Includes traditional soups',
      'Save 15% compared to individual orders',
      'Meal planning made easy',
      'Fresh ingredients daily',
    ],
    relatedPackageIds: ['daily-package', 'monthly-package'], // Suggest downgrade and upgrade
  },
  {
    id: 'monthly-package',
    name: 'Monthly Meal Package',
    description:
      'The ultimate African cuisine experience with a full month of diverse, authentic meals.',
    type: 'monthly',
    price: 850.0,
    includedItems: [
      {
        menuItemId: '1', // Smokey Jollof Rice
        quantity: 4,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '4', // Grilled Tilapia & Rice
        quantity: 4,
        includedCustomizations: [
          'fish-preparation:grilled',
          'pepper-level:medium',
        ],
      },
      {
        menuItemId: '5', // Pepper Chicken & Plantain
        quantity: 4,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '6', // Goat Meat Stew & Yam
        quantity: 3,
        includedCustomizations: [
          'pepper-level:medium',
          'yam-preparation:boiled',
        ],
      },
      {
        menuItemId: '7', // Beef & Okra Stew
        quantity: 3,
        includedCustomizations: ['pepper-level:medium', 'starch-choice:rice'],
      },
      {
        menuItemId: '2', // Egusi Soup & Yam
        quantity: 4,
        includedCustomizations: ['spice-level:medium'],
      },
      {
        menuItemId: '8', // Bitter Leaf Soup
        quantity: 2,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '9', // Pepper Soup
        quantity: 2,
        includedCustomizations: [
          'protein-choice:goat-meat',
          'heat-level:medium',
        ],
      },
      {
        menuItemId: '12', // Fried Plantain
        quantity: 8,
        includedCustomizations: ['plantain-style:regular'],
      },
      {
        menuItemId: '13', // Coconut Rice
        quantity: 6,
        includedCustomizations: ['rice-portion:regular'],
      },
      {
        menuItemId: '14', // Yam Porridge
        quantity: 4,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '15', // Moi Moi
        quantity: 4,
        includedCustomizations: ['pepper-level:medium'],
      },
      {
        menuItemId: '3', // Beef Suya Platter
        quantity: 2,
        includedCustomizations: ['spice-level-suya:medium'],
      },
      {
        menuItemId: '17', // Chicken Wings
        quantity: 2,
        includedCustomizations: [
          'wing-quantity:6-pieces',
          'pepper-level:medium',
        ],
      },
    ],
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    features: [
      '30 complete meals for the month',
      'Maximum variety with all menu categories',
      'Includes soups, mains, sides, and starters',
      'Save 25% compared to individual orders',
      'Priority delivery scheduling',
      'Customizable meal rotation',
      'Dedicated customer support',
      'Free delivery included',
    ],
    relatedPackageIds: ['weekly-package'], // Suggest weekly as downgrade option
  },
];

// Generate slugs for menu items and packages
function generateSlugsForMockData() {
  const existingSlugs: string[] = [];

  // Generate slugs for menu items
  mockMenuItems.forEach(item => {
    const baseSlug = generateSlug(item.name);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
    item.slug = uniqueSlug;
    existingSlugs.push(uniqueSlug);
  });

  // Generate slugs for packages
  mockPackages.forEach(pkg => {
    const baseSlug = generateSlug(pkg.name);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
    pkg.slug = uniqueSlug;
    existingSlugs.push(uniqueSlug);
  });
}

// Initialize slugs
generateSlugsForMockData();
