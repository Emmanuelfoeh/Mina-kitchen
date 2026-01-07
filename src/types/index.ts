// Core Data Models for Food Ordering Platform

// User and Authentication Models
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  unit?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// Menu and Product Models
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: MenuCategory;
  image: string;
  status: 'active' | 'inactive' | 'sold_out' | 'low_stock';
  customizations: Customization[];
  nutritionalInfo?: NutritionalInfo;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Customization {
  id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'text';
  options: CustomizationOption[];
  required: boolean;
  maxSelections?: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

// Package Models
export interface Package {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  price: number;
  includedItems: PackageItem[];
  image: string;
  isActive: boolean;
  features: string[];
}

export interface PackageItem {
  menuItemId: string;
  quantity: number;
  includedCustomizations: string[];
}

// Cart and Order Models
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
  textValue?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: Address;
  scheduledFor?: Date;
  estimatedDelivery?: Date;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  customizations: SelectedCustomization[];
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

// API Response Types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  path: string;
  requestId: string;
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'PAYMENT_ERROR';

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CheckoutForm {
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: Address;
  scheduledFor?: Date;
  specialInstructions?: string;
  paymentMethod: string;
}
