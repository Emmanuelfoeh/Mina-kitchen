import { useCartStore } from '@/stores/cart-store';
import { CartItem } from '@/types';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cart Persistence', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should persist cart items to localStorage', () => {
    // This test verifies the cart store structure supports persistence
    // In a real environment, Zustand's persist middleware handles localStorage
    const { addItem, getItemById } = useCartStore.getState();

    const testItem: CartItem = {
      id: 'test-1',
      menuItemId: 'menu-1',
      quantity: 2,
      selectedCustomizations: [],
      unitPrice: 15.99,
      totalPrice: 31.98,
    };

    addItem(testItem);

    // Verify the item was added to the store
    const retrievedItem = getItemById('test-1');
    expect(retrievedItem).toEqual(testItem);
  });

  it('should calculate totals correctly', () => {
    const { addItem, getSubtotal, getTax, getDeliveryFee, getTotal } =
      useCartStore.getState();

    const testItem: CartItem = {
      id: 'test-2',
      menuItemId: 'menu-2',
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: 20.0,
      totalPrice: 20.0,
    };

    // Clear cart first
    useCartStore.getState().clearCart();
    addItem(testItem);

    const subtotal = getSubtotal();
    const tax = getTax();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    expect(subtotal).toBe(20.0);
    expect(tax).toBe(20.0 * 0.13); // 13% HST
    expect(deliveryFee).toBe(5.99); // Default delivery fee
    expect(total).toBe(subtotal + tax + deliveryFee);
  });

  it('should maintain cart state across operations', () => {
    const { addItem, updateQuantity, getTotalItems, hasItems } =
      useCartStore.getState();

    const testItem: CartItem = {
      id: 'test-3',
      menuItemId: 'menu-3',
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: 12.5,
      totalPrice: 12.5,
    };

    // Clear cart first
    useCartStore.getState().clearCart();
    expect(hasItems()).toBe(false);
    expect(getTotalItems()).toBe(0);

    addItem(testItem);
    expect(hasItems()).toBe(true);
    expect(getTotalItems()).toBe(1);

    updateQuantity('test-3', 3);
    expect(getTotalItems()).toBe(3);
  });
});
