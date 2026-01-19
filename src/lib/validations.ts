import { z } from 'zod';
import { InputSanitizer } from './security';

// Install zod for validation
// pnpm add zod

// User validation schemas with enhanced security
export const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(InputSanitizer.sanitizeEmail),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform(InputSanitizer.sanitizeString),
  phone: z
    .string()
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizePhone(val) : undefined)),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
  isVerified: z.boolean().default(true),
});

export const addressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address too long')
    .transform(InputSanitizer.sanitizeString),
  unit: z
    .string()
    .max(20, 'Unit too long')
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizeString(val) : undefined)),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City too long')
    .transform(InputSanitizer.sanitizeString),
  province: z
    .string()
    .min(2, 'Province must be at least 2 characters')
    .max(50, 'Province too long')
    .transform(InputSanitizer.sanitizeString),
  postalCode: z
    .string()
    .regex(
      /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'Invalid Canadian postal code'
    )
    .transform(val => val.toUpperCase().replace(/\s/g, '')),
  isDefault: z.boolean().default(false),
});

// Menu item validation schemas with enhanced security
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(2, 'Menu item name must be at least 2 characters')
    .max(100, 'Menu item name too long')
    .transform(InputSanitizer.sanitizeString),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long')
    .transform(InputSanitizer.sanitizeString),
  basePrice: z
    .number()
    .positive('Price must be positive')
    .max(10000, 'Price too high')
    .refine(val => Number.isFinite(val), 'Invalid price'),
  image: z.string().url('Invalid image URL').max(500, 'Image URL too long'),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT', 'LOW_STOCK'])
    .default('ACTIVE'),
  tags: z
    .array(z.string().max(50).transform(InputSanitizer.sanitizeString))
    .max(10, 'Too many tags')
    .default([]),
  categoryId: z.string().cuid('Invalid category ID'),
});

export const customizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Customization name must be at least 2 characters')
    .max(100, 'Customization name too long')
    .transform(InputSanitizer.sanitizeString),
  type: z.enum(['RADIO', 'CHECKBOX', 'TEXT']),
  required: z.boolean().default(false),
  maxSelections: z
    .number()
    .int()
    .positive()
    .max(20, 'Too many selections allowed')
    .optional(),
});

export const customizationOptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Option name is required')
    .max(100, 'Option name too long')
    .transform(InputSanitizer.sanitizeString),
  priceModifier: z
    .number()
    .min(-1000, 'Price modifier too low')
    .max(1000, 'Price modifier too high')
    .default(0),
  isAvailable: z.boolean().default(true),
});

// Order validation schemas with enhanced security
export const orderSchema = z.object({
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  scheduledFor: z
    .date()
    .refine(date => date > new Date(), 'Scheduled time must be in the future')
    .optional(),
  specialInstructions: z
    .string()
    .nullable()
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizeString(val) : val))
    .refine(
      val => !val || val.length <= 500,
      'Special instructions must be less than 500 characters'
    ),
  deliveryAddressId: z.string().cuid().optional(),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be a positive integer')
    .max(50, 'Quantity too high'),
  customizations: z
    .array(
      z.object({
        customizationId: z.string().min(1, 'Customization ID is required'),
        customizationName: z.string().optional(), // Optional display name
        optionIds: z
          .array(z.string().min(1, 'Option ID is required'))
          .max(10, 'Too many options'),
        optionNames: z.array(z.string()).optional(), // Optional display names
        textValue: z
          .string()
          .max(200, 'Text value too long')
          .transform(InputSanitizer.sanitizeString)
          .optional(),
      })
    )
    .max(20, 'Too many customizations')
    .default([]),
  specialInstructions: z
    .string()
    .nullable()
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizeString(val) : val))
    .refine(
      val => !val || val.length <= 200,
      'Special instructions must be less than 200 characters'
    ),
});

// Package validation schemas with enhanced security
export const packageSchema = z.object({
  name: z
    .string()
    .min(2, 'Package name must be at least 2 characters')
    .max(100, 'Package name too long')
    .transform(InputSanitizer.sanitizeString),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long')
    .transform(InputSanitizer.sanitizeString),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  price: z
    .number()
    .positive('Price must be positive')
    .max(10000, 'Price too high')
    .refine(val => Number.isFinite(val), 'Invalid price'),
  image: z.string().url('Invalid image URL').max(500, 'Image URL too long'),
  isActive: z.boolean().default(true),
  features: z
    .array(z.string().max(200).transform(InputSanitizer.sanitizeString))
    .max(20, 'Too many features')
    .default([]),
});

// Enhanced input sanitization functions
export function sanitizeString(input: string): string {
  return InputSanitizer.sanitizeString(input);
}

export function sanitizeEmail(email: string): string {
  return InputSanitizer.sanitizeEmail(email);
}

// Enhanced password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

// Contact form validation with enhanced security
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform(InputSanitizer.sanitizeString),
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(InputSanitizer.sanitizeEmail),
  phone: z
    .string()
    .max(20, 'Phone number too long')
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizePhone(val) : undefined)),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject too long')
    .transform(InputSanitizer.sanitizeString),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long')
    .transform(InputSanitizer.sanitizeString),
});

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
