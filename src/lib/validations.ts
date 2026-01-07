import { z } from 'zod';

// Install zod for validation
// pnpm add zod

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
});

export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  unit: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  province: z.string().min(2, 'Province must be at least 2 characters'),
  postalCode: z
    .string()
    .regex(
      /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'Invalid Canadian postal code'
    ),
  isDefault: z.boolean().default(false),
});

// Menu item validation schemas
export const menuItemSchema = z.object({
  name: z.string().min(2, 'Menu item name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT', 'LOW_STOCK'])
    .default('ACTIVE'),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().cuid('Invalid category ID'),
});

export const customizationSchema = z.object({
  name: z.string().min(2, 'Customization name must be at least 2 characters'),
  type: z.enum(['RADIO', 'CHECKBOX', 'TEXT']),
  required: z.boolean().default(false),
  maxSelections: z.number().positive().optional(),
});

export const customizationOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  priceModifier: z.number().default(0),
  isAvailable: z.boolean().default(true),
});

// Order validation schemas
export const orderSchema = z.object({
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  scheduledFor: z.date().optional(),
  specialInstructions: z
    .string()
    .max(500, 'Special instructions must be less than 500 characters')
    .optional(),
  deliveryAddressId: z.string().cuid().optional(),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().cuid('Invalid menu item ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  customizations: z
    .array(
      z.object({
        customizationId: z.string().cuid(),
        optionIds: z.array(z.string().cuid()),
        textValue: z.string().optional(),
      })
    )
    .default([]),
  specialInstructions: z
    .string()
    .max(200, 'Special instructions must be less than 200 characters')
    .optional(),
});

// Package validation schemas
export const packageSchema = z.object({
  name: z.string().min(2, 'Package name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).default([]),
});

// Input sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Price calculation utilities with validation
export function calculateItemTotal(
  basePrice: number,
  customizations: Array<{ priceModifier: number }>
): number {
  if (basePrice < 0) throw new Error('Base price cannot be negative');

  const customizationTotal = customizations.reduce((sum, custom) => {
    if (typeof custom.priceModifier !== 'number')
      throw new Error('Invalid price modifier');
    return sum + custom.priceModifier;
  }, 0);

  return Math.round((basePrice + customizationTotal) * 100) / 100; // Round to 2 decimal places
}

export function calculateOrderTotal(
  subtotal: number,
  taxRate: number = 0.13, // 13% HST for Ontario
  deliveryFee: number = 0,
  tip: number = 0
): number {
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  if (taxRate < 0 || taxRate > 1)
    throw new Error('Tax rate must be between 0 and 1');
  if (deliveryFee < 0) throw new Error('Delivery fee cannot be negative');
  if (tip < 0) throw new Error('Tip cannot be negative');

  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee + tip) * 100) / 100;

  return total;
}

// Database constraint validation
export function validateOrderNumber(orderNumber: string): boolean {
  // Order number format: ORD-YYYYMMDD-XXXX (e.g., ORD-20240107-0001)
  const orderNumberRegex = /^ORD-\d{8}-\d{4}$/;
  return orderNumberRegex.test(orderNumber);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `ORD-${dateStr}-${randomNum}`;
}
