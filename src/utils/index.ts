// Utility functions for the food ordering platform

/**
 * Format currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Calculate tax amount (13% HST for Ontario)
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * 0.13;
};

/**
 * Calculate delivery fee based on distance/location
 */
export const calculateDeliveryFee = (distance?: number): number => {
  if (!distance) return 5.99; // Default delivery fee
  if (distance <= 5) return 3.99;
  if (distance <= 10) return 5.99;
  return 7.99;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Canadian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex =
    /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * Validate postal code (Canadian format)
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Calculate estimated delivery time
 */
export const calculateEstimatedDelivery = (
  orderTime: Date,
  prepTime: number = 30,
  deliveryTime: number = 20
): Date => {
  const totalMinutes = prepTime + deliveryTime;
  return new Date(orderTime.getTime() + totalMinutes * 60000);
};
