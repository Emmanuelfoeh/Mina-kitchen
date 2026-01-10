/**
 * Tests for navigation utilities
 */

import { BreadcrumbGenerator } from '../navigation';
import { generateSlug } from '../utils';
import type { MenuItem, Package, MenuCategory } from '@/types';

// Mock data for testing
const mockMenuItem: MenuItem = {
  id: '1',
  name: 'Jollof Rice',
  slug: 'jollof-rice',
  description: 'Traditional West African rice dish',
  basePrice: 15.99,
  image: '/images/jollof-rice.jpg',
  category: {
    id: 'mains',
    name: 'Main Dishes',
    description: 'Hearty main course dishes',
    displayOrder: 1,
    isActive: true,
  },
  tags: ['spicy', 'rice'],
  status: 'active',
  customizations: [],
  nutritionalInfo: {
    calories: 450,
    protein: 12,
    carbs: 65,
    fat: 15,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPackage: Package = {
  id: '1',
  name: 'Family Feast',
  slug: 'family-feast',
  description: 'Complete meal for 4 people',
  price: 59.99,
  image: '/images/family-feast.jpg',
  type: 'weekly',
  includedItems: [],
  features: ['Serves 4', 'Complete meal'],
  isActive: true,
};

const mockCategory: MenuCategory = {
  id: 'mains',
  name: 'Main Dishes',
  description: 'Hearty main course dishes',
  displayOrder: 1,
  isActive: true,
};

describe('BreadcrumbGenerator', () => {
  describe('forMenuItem', () => {
    it('should generate correct breadcrumbs for menu item', () => {
      const breadcrumbs = BreadcrumbGenerator.forMenuItem(mockMenuItem);

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Menu', href: '/menu' });
      expect(breadcrumbs[2]).toEqual({
        label: 'Main Dishes',
        href: '/menu?category=mains',
      });
      expect(breadcrumbs[3]).toEqual({ label: 'Jollof Rice' });
    });

    it('should handle special characters in category names', () => {
      const itemWithSpecialCategory = {
        ...mockMenuItem,
        category: {
          id: 'appetizers & sides',
          name: 'Appetizers & Sides',
          description: 'Small plates and sides',
          displayOrder: 2,
          isActive: true,
        },
      };

      const breadcrumbs = BreadcrumbGenerator.forMenuItem(
        itemWithSpecialCategory
      );

      expect(breadcrumbs[2].href).toBe(
        '/menu?category=appetizers%20%26%20sides'
      );
    });
  });

  describe('forPackage', () => {
    it('should generate correct breadcrumbs for package', () => {
      const breadcrumbs = BreadcrumbGenerator.forPackage(mockPackage);

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Packages', href: '/packages' });
      expect(breadcrumbs[2]).toEqual({ label: 'Family Feast' });
    });
  });

  describe('forMenuCategory', () => {
    it('should generate correct breadcrumbs for menu category', () => {
      const breadcrumbs = BreadcrumbGenerator.forMenuCategory(mockCategory);

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Menu', href: '/menu' });
      expect(breadcrumbs[2]).toEqual({ label: 'Main Dishes' });
    });
  });

  describe('forSearch', () => {
    it('should generate breadcrumbs for search without category', () => {
      const breadcrumbs = BreadcrumbGenerator.forSearch('chicken');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Menu', href: '/menu' });
      expect(breadcrumbs[2]).toEqual({ label: 'Search: "chicken"' });
    });

    it('should generate breadcrumbs for search with category', () => {
      const breadcrumbs = BreadcrumbGenerator.forSearch(
        'chicken',
        'Main Dishes'
      );

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[2]).toEqual({
        label: 'Main Dishes',
        href: '/menu?category=Main%20Dishes',
      });
      expect(breadcrumbs[3]).toEqual({ label: 'Search: "chicken"' });
    });
  });

  describe('forProfile', () => {
    it('should generate breadcrumbs for profile without section', () => {
      const breadcrumbs = BreadcrumbGenerator.forProfile();

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Profile', href: '/profile' });
    });

    it('should generate breadcrumbs for profile with section', () => {
      const breadcrumbs = BreadcrumbGenerator.forProfile('Addresses');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ label: 'Addresses' });
    });
  });

  describe('fromPath', () => {
    it('should generate breadcrumbs from URL path', () => {
      const breadcrumbs = BreadcrumbGenerator.fromPath(
        '/menu/items/jollof-rice'
      );

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Menu', href: '/menu' });
      expect(breadcrumbs[2]).toEqual({ label: 'Items', href: '/menu/items' });
      expect(breadcrumbs[3]).toEqual({ label: 'Jollof Rice' });
    });

    it('should handle URL decoding', () => {
      const breadcrumbs = BreadcrumbGenerator.fromPath(
        '/menu/items/jollof%20rice'
      );

      expect(breadcrumbs[3]).toEqual({ label: 'Jollof Rice' });
    });

    it('should handle hyphens in slugs', () => {
      const breadcrumbs = BreadcrumbGenerator.fromPath(
        '/packages/family-feast'
      );

      expect(breadcrumbs[2]).toEqual({ label: 'Family Feast' });
    });
  });
});
