# Cart & Checkout Quick Reference

## Zustand Patterns

### ✅ Correct: Reactive State

```typescript
// Component re-renders when items change
const items = useCartStore(state => state.items);
const total = items.reduce((sum, item) => sum + item.quantity, 0);
```

### ❌ Wrong: Non-Reactive

```typescript
// Component doesn't re-render
const getTotalItems = useCartStore(state => state.getTotalItems);
const total = getTotalItems();
```

---

## Common Operations

### Add Item to Cart

```typescript
const addItem = useCartStore(state => state.addItem);

addItem({
  id: generateId(),
  menuItemId: 'item-123',
  quantity: 2,
  unitPrice: 15.99,
  totalPrice: 31.98,
  selectedCustomizations: [],
});
```

### Update Quantity

```typescript
const updateQuantity = useCartStore(state => state.updateQuantity);
updateQuantity('item-id', 3);
```

### Remove Item

```typescript
const removeItem = useCartStore(state => state.removeItem);
removeItem('item-id');
```

### Clear Cart

```typescript
const clearCart = useCartStore(state => state.clearCart);
clearCart();
```

---

## Price Calculations

```typescript
const items = useCartStore(state => state.items);

// Subtotal
const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

// Tax (13% HST)
const tax = subtotal * 0.13;

// Delivery Fee
const deliveryFee = 5.99;

// Total
const total = subtotal + tax + deliveryFee;
```

---

## Checkout Flow

```
1. Delivery Method → 2. Address → 3. Schedule → 4. Review & Pay
```

### Submit Order

```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: user.id,
    items: items.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    deliveryType: 'DELIVERY',
    subtotal,
    tax,
    deliveryFee,
    total,
  }),
});
```

---

## Troubleshooting

| Issue                      | Solution                            |
| -------------------------- | ----------------------------------- |
| Cart not updating          | Use selectors, compute in component |
| Hydration mismatch         | Add hydration guard with `useState` |
| Cart cleared on refresh    | Check localStorage persistence      |
| Cross-tab sync not working | Verify storage event listener       |

---

## File Locations

```
src/stores/cart-store.ts              # Store definition
src/components/cart/cart-provider.tsx # React wrapper
src/components/cart/cart-sidebar.tsx  # Cart UI
src/components/checkout/              # Checkout flow
src/app/api/orders/route.ts           # Order API
```

---

## Key Imports

```typescript
import { useCartStore } from '@/stores/cart-store';
import { useCartSafe } from '@/components/cart/cart-provider';
import { formatCurrency, calculateTax, calculateDeliveryFee } from '@/utils';
```
