# Cart & Auth Integration Guide

## Overview

Phase 5 integrates TanStack Query with the existing Zustand cart store, providing seamless cart synchronization between guest and authenticated states while maintaining the robust guest→auth transition logic.

## Architecture

### Hybrid Approach

We use a **hybrid architecture** that leverages the strengths of both systems:

- **Zustand Store**: Handles cart mutations and complex guest→auth transitions
- **TanStack Query**: Manages cart data fetching, caching, and server synchronization

### Why This Approach?

1. **Existing Logic Preservation**: The Zustand cart store already handles complex scenarios (guest carts, auth transitions, localStorage persistence)
2. **Progressive Enhancement**: TanStack Query adds query caching and invalidation on top
3. **Flexibility**: Components can use either system or both depending on needs

## Available Hooks

### Read-Only Queries

```typescript
import { useCart } from '@/hooks';

// For authenticated users only - fetches from server
const { data: cart, isLoading } = useCart();
```

### Cart Mutations (Optional)

```typescript
import {
  useAddToCart,
  useRemoveFromCart,
  useUpdateCartItem,
  useClearCart,
  useSyncLocalCart,
} from '@/hooks';

// For direct server operations (bypassing Zustand)
const addToCart = useAddToCart();
addToCart.mutate({
  menuItemId: 'item-123',
  quantity: 2,
  selectedCustomizations: [],
});
```

### Integrated Cart Hook (Recommended)

```typescript
import { useIntegratedCart } from '@/hooks';

const {
  items, // Cart items (Zustand or server)
  totalItems, // Total item count
  subtotal, // Subtotal amount
  isLoading, // Loading state
  isSyncing, // Sync indicator
  addItem, // Add item (auto-syncs)
  removeItem, // Remove item (auto-syncs)
  updateQuantity, // Update quantity (auto-syncs)
  clearCart, // Clear cart (auto-syncs)
} = useIntegratedCart();
```

### Utility Hooks

```typescript
import {
  useInvalidateCart, // Invalidate cart queries
  useRefetchCart, // Force refetch cart
  useCartCache, // Get cached cart data
  useUpdateCartCache, // Update cache directly
  useSyncCartWithQuery, // Sync Zustand→Query
  useCartAuthSync, // Handle auth state changes
} from '@/hooks';
```

## Usage Patterns

### Pattern 1: Guest Cart (Zustand Only)

For guest users, use Zustand store directly:

```typescript
import { useCartStore } from '@/stores';

function GuestCartComponent() {
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);

  return (
    <div>
      {items.map(item => (
        <CartItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

### Pattern 2: Authenticated Cart (Hybrid)

For authenticated users, use the integrated hook:

```typescript
import { useIntegratedCart } from '@/hooks';

function AuthenticatedCartComponent() {
  const {
    items,
    isLoading,
    addItem,
    removeItem
  } = useIntegratedCart();

  if (isLoading) return <Loading />;

  return (
    <div>
      {items.map(item => (
        <CartItem
          key={item.id}
          {...item}
          onRemove={() => removeItem(item.id)}
        />
      ))}
    </div>
  );
}
```

### Pattern 3: Server-Only Operations

For direct server operations (admin, reports, etc.):

```typescript
import { useCart, useUpdateCartItem } from '@/hooks';

function AdminCartView() {
  const { data: cart } = useCart();
  const updateItem = useUpdateCartItem();

  return (
    <div>
      {cart?.items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <button
            onClick={() => updateItem.mutate({
              itemId: item.id,
              quantity: item.quantity + 1
            })}
          >
            +1
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Auth State Synchronization

Add cart auth sync to your root layout or auth provider:

```typescript
// app/layout.tsx
import { useCartAuthSync } from '@/hooks';

export default function RootLayout({ children }) {
  useCartAuthSync(); // Syncs auth state changes with cart

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Migration Guide

### From Direct Fetch to TanStack Query

**Before:**

```typescript
useEffect(() => {
  fetch('/api/cart')
    .then(res => res.json())
    .then(data => setCart(data));
}, []);
```

**After:**

```typescript
const { data: cart, isLoading } = useCart();
```

### From Zustand to Integrated Hook

**Before:**

```typescript
const items = useCartStore(state => state.items);
const addItem = useCartStore(state => state.addItem);
const isLoading = useCartStore(state => state.isSyncing);
```

**After:**

```typescript
const { items, addItem, isLoading } = useIntegratedCart();
```

## Cache Invalidation

Cart queries are automatically invalidated after mutations. Manual invalidation:

```typescript
import { useInvalidateCart } from '@/hooks';

function Component() {
  const invalidateCart = useInvalidateCart();

  const handleServerUpdate = async () => {
    await updateCartOnServer();
    invalidateCart(); // Refresh cart data
  };
}
```

## Performance Optimizations

### Stale Time Configuration

Cart queries use a 30-second stale time:

- Reduces unnecessary refetches
- Balances freshness with performance
- Configurable per-query if needed

### Cache Time

Cart data persists for 10 minutes after unmounting:

- Faster navigation between pages
- Reduced server load
- Automatic cleanup

### Optimistic Updates

Zustand handles optimistic updates locally:

- Instant UI feedback
- Automatic rollback on errors
- Server sync in background

## Testing

### Testing Components with Cart

```typescript
import { renderWithProviders } from '@/test-utils';
import { useCart } from '@/hooks';

it('displays cart items', async () => {
  const { findByText } = renderWithProviders(<CartComponent />);

  await findByText('Pizza - $12.99');
});
```

### Mocking Cart Data

```typescript
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

const queryClient = new QueryClient();
queryClient.setQueryData(queryKeys.cart.current(), {
  id: 'cart-1',
  items: [mockItem],
  totalItems: 1,
  subtotal: 12.99,
});
```

## Troubleshooting

### Cart Not Syncing After Login

Ensure `useCartAuthSync()` is called in a parent component:

```typescript
// Make sure this is in layout or provider
useCartAuthSync();
```

### Stale Cart Data

Force a refetch:

```typescript
const refetchCart = useRefetchCart();
await refetchCart();
```

### Guest Cart Lost After Login

The Zustand store handles this automatically via `syncLocalCartToServer()`. If issues persist, check browser console for sync errors.

## Best Practices

1. **Use `useIntegratedCart` by default** - Handles both guest and auth scenarios
2. **Use Zustand directly for guest-only features** - Faster, no server dependency
3. **Use TanStack Query mutations for admin operations** - Better error handling and loading states
4. **Call `useCartAuthSync()` once in layout** - Don't call in multiple places
5. **Invalidate cart after external updates** - Keep cache synchronized

## Future Enhancements

- [ ] Real-time cart updates via WebSocket
- [ ] Cart abandonment tracking
- [ ] Multi-device cart synchronization
- [ ] Offline cart operations with sync queue
- [ ] Cart analytics integration
