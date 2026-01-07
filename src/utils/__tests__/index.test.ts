import {
  formatCurrency,
  formatDate,
  formatTime,
  generateId,
  calculateTax,
  calculateDeliveryFee,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  sanitizeString,
  calculateEstimatedDelivery,
} from '../index';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency in CAD', () => {
      expect(formatCurrency(10.99)).toBe('$10.99');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('calculateTax', () => {
    it('should calculate 13% HST', () => {
      expect(calculateTax(100)).toBe(13);
      expect(calculateTax(0)).toBe(0);
      expect(calculateTax(50)).toBe(6.5);
    });
  });

  describe('calculateDeliveryFee', () => {
    it('should return correct delivery fees based on distance', () => {
      expect(calculateDeliveryFee()).toBe(5.99); // Default
      expect(calculateDeliveryFee(3)).toBe(3.99); // <= 5km
      expect(calculateDeliveryFee(8)).toBe(5.99); // <= 10km
      expect(calculateDeliveryFee(15)).toBe(7.99); // > 10km
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Canadian phone numbers', () => {
      expect(isValidPhone('416-555-1234')).toBe(true);
      expect(isValidPhone('(416) 555-1234')).toBe(true);
      expect(isValidPhone('4165551234')).toBe(true);
      expect(isValidPhone('+1 416 555 1234')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('isValidPostalCode', () => {
    it('should validate Canadian postal codes', () => {
      expect(isValidPostalCode('M5V 3A8')).toBe(true);
      expect(isValidPostalCode('M5V3A8')).toBe(true);
      expect(isValidPostalCode('K1A 0A6')).toBe(true);
      expect(isValidPostalCode('12345')).toBe(false);
      expect(isValidPostalCode('invalid')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('  normal text  ')).toBe('normal text');
    });
  });

  describe('calculateEstimatedDelivery', () => {
    it('should calculate estimated delivery time', () => {
      const orderTime = new Date('2024-01-15T12:00:00');
      const estimated = calculateEstimatedDelivery(orderTime, 30, 20);
      const expectedTime = new Date('2024-01-15T12:50:00');
      expect(estimated.getTime()).toBe(expectedTime.getTime());
    });
  });
});
