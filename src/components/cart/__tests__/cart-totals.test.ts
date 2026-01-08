import { useCartStore } from '@/stores/cart-store';
import { CartItem } from '@/types';

describe('Cart Totals Update', () => {
  beforeEach(() => {
    // Clear cart before each test
    useCartStore.getState().clearCart();
  });

  it('should update totals correctly when items are removed', () => {
    const { addItem, removeItem, getSubtotal, getTotal, getTotalItems } =
      useCartStore.getState();

    const item1: CartItem = {
      id: 'test-1',
      menuItemId: 'menu-1',
      quantity: 2,
      selectedCustomizations: [],
      unitPrice: 10.0,
      totalPrice: 20.0,
    };

    const item2: CartItem = {
      id: 'test-2',
      menuItemId: 'menu-2',
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: 15.0,
      totalPrice: 15.0,
    };

    // Add items to cart
    addItem(item1);
    addItem(item2);

    // Verify initial totals
    expect(getTotalItems()).toBe(3);
    expect(getSubtotal()).toBe(35.0);

    const initialTotal = getTotal();
    expect(initialTotal).toBeGreaterThan(35.0); // Should include tax and delivery

    // Remove one item
    removeItem('test-1');

    // Verify totals updated correctly
    expect(getTotalItems()).toBe(1);
    expect(getSubtotal()).toBe(15.0);

    const updatedTotal = getTotal();
    expect(updatedTotal).toBeLessThan(initialTotal);
    expect(updatedTotal).toBeGreaterThan(15.0); // Should include tax and delivery
  });

  it('should update totals correctly when quantity is reduced to zero', () => {
    const { addItem, updateQuantity, getSubtotal, getTotalItems } =
      useCartStore.getState();

    const item: CartItem = {
      id: 'test-3',
      menuItemId: 'menu-3',
      quantity: 2,
      selectedCustomizations: [],
      unitPrice: 12.0,
      totalPrice: 24.0,
    };

    addItem(item);
    expect(getTotalItems()).toBe(2);
    expect(getSubtotal()).toBe(24.0);

    // Reduce quantity to 0 (should remove item)
    updateQuantity('test-3', 0);

    expect(getTotalItems()).toBe(0);
    expect(getSubtotal()).toBe(0);
  });
});
