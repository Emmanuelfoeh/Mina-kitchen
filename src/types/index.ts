// Core Data Models for Food Ordering Platform

// User and Authentication Models
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
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
  createdAt: Date;
  updatedAt: Date;
}

// Menu and Product Models
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: MenuCategory;
  image: string;
  images?: string[]; // Multiple product images for gallery
  slug?: string; // SEO-friendly URL slug
  seoTitle?: string; // Custom page title
  seoDescription?: string; // Meta description
  chefNotes?: string; // Chef's recommendations
  preparationTime?: number; // Estimated prep time in minutes
  allergens?: string[]; // Allergen information
  status: 'active' | 'inactive' | 'sold_out' | 'low_stock';
  customizations: Customization[];
  tags: string[];
  relatedItemIds?: string[]; // Related product IDs
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

// Package Models
export interface Package {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  price: number;
  includedItems: PackageItem[];
  image: string;
  images?: string[]; // Multiple product images for gallery
  slug?: string; // SEO-friendly URL slug
  seoTitle?: string; // Custom page title
  seoDescription?: string; // Meta description
  savingsAmount?: number; // Calculated savings
  originalPrice?: number; // Sum of individual items
  isActive: boolean;
  features: string[];
  relatedPackageIds?: string[]; // Related package IDs
  createdAt?: Date;
  updatedAt?: Date;
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

// State Management Interfaces
export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomizations: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

export interface AdminFilters {
  status?: OrderStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  category?: string;
}

export interface AdminStore {
  selectedOrders: string[];
  filters: AdminFilters;
  setFilters: (filters: Partial<AdminFilters>) => void;
  selectOrder: (orderId: string) => void;
  deselectOrder: (orderId: string) => void;
  selectAllOrders: (orderIds: string[]) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: OrderStatus) => Promise<void>;
}

// Utility Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchParams {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Action Result Types
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
