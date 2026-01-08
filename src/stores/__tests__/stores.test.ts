import { useCartStore, useUserStore, useAdminStore } from '../index';
import type { CartItem, User, OrderStatus } from '@/types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test by setting initial state
    useCartStore.setState({ items: [], isOpen: false });
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    useAdminStore.setState({ selectedOrders: [], filters: {} });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Cart Store', () => {
    it('should add items to cart', () => {
      const cartItem: CartItem = {
        id: 'test-item-1',
        menuItemId: 'menu-1',
        quantity: 2,
        selectedCustomizations: [],
        unitPrice: 15.99,
        totalPrice: 31.98,
      };

      useCartStore.getState().addItem(cartItem);

      const { items, getTotalItems, getSubtotal } = useCartStore.getState();

      expect(items).toHaveLength(1);
      expect(getTotalItems()).toBe(2);
      expect(getSubtotal()).toBe(31.98);
    });

    it('should remove items from cart', () => {
      const cartItem: CartItem = {
        id: 'test-item-1',
        menuItemId: 'menu-1',
        quantity: 1,
        selectedCustomizations: [],
        unitPrice: 15.99,
        totalPrice: 15.99,
      };

      const store = useCartStore.getState();

      store.addItem(cartItem);
      expect(useCartStore.getState().items).toHaveLength(1);

      store.removeItem('test-item-1');
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should update item quantities', () => {
      const cartItem: CartItem = {
        id: 'test-item-1',
        menuItemId: 'menu-1',
        quantity: 1,
        selectedCustomizations: [],
        unitPrice: 15.99,
        totalPrice: 15.99,
      };

      const store = useCartStore.getState();

      store.addItem(cartItem);
      store.updateQuantity('test-item-1', 3);

      const { items, getTotalItems } = useCartStore.getState();

      expect(items[0].quantity).toBe(3);
      expect(getTotalItems()).toBe(3);
      expect(items[0].totalPrice).toBe(47.97); // 15.99 * 3
    });

    it('should calculate total with tax and delivery fee', () => {
      const cartItem: CartItem = {
        id: 'test-item-1',
        menuItemId: 'menu-1',
        quantity: 1,
        selectedCustomizations: [],
        unitPrice: 100,
        totalPrice: 100,
      };

      useCartStore.getState().addItem(cartItem);

      const { getSubtotal, getTax, getDeliveryFee, getTotal } =
        useCartStore.getState();

      expect(getSubtotal()).toBe(100);
      expect(getTax()).toBe(13); // 13% HST
      expect(getDeliveryFee()).toBe(5.99); // Default delivery fee
      expect(getTotal()).toBe(118.99); // 100 + 13 + 5.99
    });
  });

  describe('User Store', () => {
    it('should handle user authentication state', () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useUserStore.getState().setUser(mockUser);

      const { user, isAuthenticated } = useUserStore.getState();

      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });

    it('should handle logout', async () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock successful logout
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      useUserStore.getState().setUser(mockUser);
      expect(useUserStore.getState().isAuthenticated).toBe(true);

      await useUserStore.getState().logout();

      const { user, isAuthenticated } = useUserStore.getState();

      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Admin Store', () => {
    it('should manage order selection', () => {
      const store = useAdminStore.getState();

      expect(store.selectedOrders).toHaveLength(0);

      store.selectOrder('order-1');
      store.selectOrder('order-2');

      expect(useAdminStore.getState().selectedOrders).toEqual([
        'order-1',
        'order-2',
      ]);

      useAdminStore.getState().deselectOrder('order-1');

      expect(useAdminStore.getState().selectedOrders).toEqual(['order-2']);
    });

    it('should manage filters', () => {
      useAdminStore.getState().setFilters({
        status: 'pending' as OrderStatus,
        searchQuery: 'test query',
      });

      const { filters } = useAdminStore.getState();

      expect(filters.status).toBe('pending');
      expect(filters.searchQuery).toBe('test query');
    });

    it('should select all orders', () => {
      const orderIds = ['order-1', 'order-2', 'order-3'];
      useAdminStore.getState().selectAllOrders(orderIds);

      expect(useAdminStore.getState().selectedOrders).toEqual(orderIds);
    });

    it('should clear selection', () => {
      const store = useAdminStore.getState();

      store.selectOrder('order-1');
      store.selectOrder('order-2');
      expect(useAdminStore.getState().selectedOrders).toHaveLength(2);

      store.clearSelection();
      expect(useAdminStore.getState().selectedOrders).toHaveLength(0);
    });
  });
});
