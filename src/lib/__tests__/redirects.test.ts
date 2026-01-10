/**
 * Tests for redirect utilities
 */

import {
  getRedirectUrl,
  getSuggestedUrls,
  isValidInternalUrl,
} from '../redirects';

describe('Redirect utilities', () => {
  describe('getRedirectUrl', () => {
    it('should redirect legacy item URLs', () => {
      expect(getRedirectUrl('/item/jollof-rice')).toBe(
        '/menu/items/jollof-rice'
      );
      expect(getRedirectUrl('/product/jollof-rice')).toBe(
        '/menu/items/jollof-rice'
      );
      expect(getRedirectUrl('/meal/jollof-rice')).toBe(
        '/menu/items/jollof-rice'
      );
    });

    it('should redirect legacy package URLs', () => {
      expect(getRedirectUrl('/package/family-feast')).toBe(
        '/packages/family-feast'
      );
      expect(getRedirectUrl('/bundle/family-feast')).toBe(
        '/packages/family-feast'
      );
      expect(getRedirectUrl('/deal/family-feast')).toBe(
        '/packages/family-feast'
      );
    });

    it('should redirect common typos', () => {
      expect(getRedirectUrl('/manu/')).toBe('/menu/');
      expect(getRedirectUrl('/packges/')).toBe('/packages/');
      expect(getRedirectUrl('/pakages/')).toBe('/packages/');
    });

    it('should return null for valid URLs', () => {
      expect(getRedirectUrl('/menu/items/jollof-rice')).toBe(null);
      expect(getRedirectUrl('/packages/family-feast')).toBe(null);
      expect(getRedirectUrl('/menu')).toBe(null);
    });

    it('should handle URLs with query parameters', () => {
      expect(getRedirectUrl('/item/jollof-rice?variant=spicy')).toBe(
        '/menu/items/jollof-rice?variant=spicy'
      );
    });
  });

  describe('getSuggestedUrls', () => {
    it('should always include main pages', () => {
      const suggestions = getSuggestedUrls('/invalid-path');

      expect(suggestions).toEqual(
        expect.arrayContaining([
          { label: 'Home', href: '/' },
          { label: 'Menu', href: '/menu' },
          { label: 'Packages', href: '/packages' },
        ])
      );
    });

    it('should suggest menu items for menu-related paths', () => {
      const suggestions = getSuggestedUrls('/menu/invalid-item');

      expect(suggestions.length).toBeGreaterThan(3);
      expect(suggestions.some(s => s.href.includes('/menu/items/'))).toBe(true);
    });

    it('should suggest packages for package-related paths', () => {
      const suggestions = getSuggestedUrls('/package/invalid-package');

      expect(suggestions.length).toBeGreaterThan(3);
      expect(suggestions.some(s => s.href.includes('/packages/'))).toBe(true);
    });
  });

  describe('isValidInternalUrl', () => {
    it('should validate correct internal URLs', () => {
      expect(isValidInternalUrl('/')).toBe(true);
      expect(isValidInternalUrl('/menu')).toBe(true);
      expect(isValidInternalUrl('/menu/items/jollof-rice')).toBe(true);
      expect(isValidInternalUrl('/packages')).toBe(true);
      expect(isValidInternalUrl('/packages/family-feast')).toBe(true);
      expect(isValidInternalUrl('/auth/login')).toBe(true);
      expect(isValidInternalUrl('/profile')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidInternalUrl('/invalid/path')).toBe(false);
      expect(isValidInternalUrl('/menu/items/')).toBe(false);
      expect(isValidInternalUrl('/packages/')).toBe(false);
      expect(isValidInternalUrl('/auth/invalid')).toBe(false);
    });

    it('should handle malformed URLs gracefully', () => {
      expect(isValidInternalUrl('not-a-url')).toBe(false);
      expect(isValidInternalUrl('')).toBe(false);
    });
  });
});
