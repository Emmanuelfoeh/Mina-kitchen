# Cart and Checkout System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Zustand State Management](#zustand-state-management)
4. [Cart System](#cart-system)
5. [Checkout Flow](#checkout-flow)
6. [API Integration](#api-integration)
7. [Best Practices](#best-practices)

---

## Overview

The cart and checkout system is a production-ready e-commerce solution built with:

- **Next.js 14** (App Router)
- **Zustand** for state management
- **TypeScript** for type safety
- **LocalStorage** for persistence
- **Prisma** for database operations

### Key Features

- ✅ Real-time cart updates
- ✅ Cross-tab synchronization
- ✅ SSR-safe hydration
- ✅ Persistent storage
- ✅ Price calculation with tax
- ✅ Multi-step checkout
- ✅ Order confirmation
- ✅ Accessibility compliant

---

## Architecture

### High-Level Flow

```
User Action → Zustand Store → LocalStorage → UI Update
     ↓
  Checkout → API Validation → Database → Confirmation
```

### Directory Structure

```
src/
├── stores/
│   └── cart-store.ts          # Zustand store definition
├── components/
│   ├── cart/
│   │   ├── cart-provider.tsx  # React context wrapper
│   │   ├── cart-sidebar.tsx   # Cart UI
│   │   ├── cart-button.tsx    # Cart trigger
│   │   └── price-breakdown.tsx # Price display
│   └── checkout/
│       ├── checkout-flow.tsx   # Main checkout
│       ├── delivery-selection.tsx
│       ├── address-form.tsx
│       ├── order-scheduling.tsx
│       └── order-summary.tsx
├── app/
│   ├── checkout/page.tsx
│   └── order-confirmation/page.tsx
└── app/api/
    └── orders/route.ts         # Order API
```

---

## Zustand State Management

### What is Zustand?

Zustand is a lightweight state management library that provides:

- **Simple API**: No boilerplate, just functions
- **React Integration**: Hooks-based
- **Performance**: Only re-renders components that use changed state
- **Middleware Support**: Persistence, devtools, etc.

### Why Zustand Over Redux/Context?

| Feature        | Zustand   | Redux  | Context API       |
| -------------- | --------- | ------ | ----------------- |
| Boilerplate    | Minimal   | Heavy  | Medium            |
| Performance    | Excellent | Good   | Poor (re-renders) |
| DevTools       | Yes       | Yes    | No                |
| Persistence    | Built-in  | Manual | Manual            |
| Learning Curve | Easy      | Steep  | Easy              |
| Bundle Size    | 1.2KB     | 3KB+   | 0KB (built-in)    |

### Core Concepts

#### 1. Store Creation

```typescript
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  count: 0,

  // Actions
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),

  // Computed values (getters)
  getDouble: () => get().count * 2,
}));
```

#### 2. Using the Store

```typescript
function Component() {
  // Subscribe to specific state (reactive)
  const count = useStore(state => state.count);

  // Get actions (not reactive)
  const increment = useStore(state => state.increment);

  return <button onClick={increment}>{count}</button>;
}
```

#### 3. Middleware

```typescript
import { persist, subscribeWithSelector } from 'zustand/middleware';

const useStore = create(
  persist(
    subscribeWithSelector(set => ({
      // store definition
    })),
    { name: 'storage-key' }
  )
);
```

---

## Cart System

### Cart Store (`cart-store.ts`)

#### State Structure

```typescript
interface CartStore {
  // State
  items: CartItem[]; // Array of cart items
  isOpen: boolean; // Sidebar visibility
  lastSyncTimestamp: number; // Last sync time
  isHydrated: boolean; // Hydration status

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomizations: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => void;
  clearCart: () => void;

  // UI Actions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed Values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  hasItems: () => boolean;
  getItemById: (itemId: string) => CartItem | undefined;

  // Sync
  syncCart: () => Promise<void>;
  validateCartItems: () => void;
  setHydrated: (hydrated: boolean) => void;
}
```

#### CartItem Structure

```typescript
interface CartItem {
  id: string; // Unique cart item ID
  menuItemId: string; // Reference to menu item
  quantity: number; // Item quantity
  unitPrice: number; // Price per unit
  totalPrice: number; // quantity * unitPrice
  selectedCustomizations: SelectedCustomization[];
  specialInstructions?: string;
}
```

#### Key Implementation Details

##### 1. Adding Items

```typescript
addItem: (item: CartItem) => {
  set(state => {
    // Check if item with same customizations exists
    const existingItemIndex = state.items.findIndex(
      existingItem =>
        existingItem.menuItemId === item.menuItemId &&
        JSON.stringify(existingItem.selectedCustomizations) ===
          JSON.stringify(item.selectedCustomizations)
    );

    let updatedItems;
    if (existingItemIndex >= 0) {
      // Merge quantities
      updatedItems = [...state.items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].unitPrice *
        updatedItems[existingItemIndex].quantity;
    } else {
      // Add new item
      updatedItems = [...state.items, item];
    }

    return {
      items: updatedItems,
      lastSyncTimestamp: Date.now(),
    };
  });
};
```

##### 2. Updating Quantity

```typescript
updateQuantity: (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    get().removeItem(itemId); // Remove if quantity is 0
    return;
  }

  set(state => ({
    items: state.items.map(item =>
      item.id === itemId
        ? {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          }
        : item
    ),
    lastSyncTimestamp: Date.now(),
  }));
};
```

##### 3. Persistence Configuration

```typescript
persist(
  (set, get) => ({
    /* store */
  }),
  {
    name: 'cart-storage', // LocalStorage key
    version: 2, // Schema version

    // Only persist specific fields
    partialize: state => ({
      items: state.items,
      lastSyncTimestamp: state.lastSyncTimestamp,
      // Don't persist isOpen - should always start closed
    }),

    // Handle version migrations
    migrate: (persistedState: any, version: number) => {
      if (version === 0 || version === 1) {
        return {
          ...persistedState,
          lastSyncTimestamp: Date.now(),
          isHydrated: false,
        };
      }
      return persistedState;
    },

    // Custom storage with error handling
    storage: {
      getItem: (name: string) => {
        if (typeof window === 'undefined') return null;
        try {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.error('Failed to load cart:', error);
          return null;
        }
      },
      setItem: (name: string, value: any) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.setItem(name, JSON.stringify(value));
        } catch (error) {
          console.error('Failed to save cart:', error);
          // Handle quota exceeded
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            localStorage.removeItem('temp-data');
            localStorage.setItem(name, JSON.stringify(value));
          }
        }
      },
      removeItem: (name: string) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.removeItem(name);
        } catch (error) {
          console.error('Failed to remove cart:', error);
        }
      },
    },

    // Called after hydration
    onRehydrateStorage: () => state => {
      if (state) {
        state.setHydrated(true);
        state.validateCartItems();
        state.syncCart();
      }
    },
  }
);
```

### Cart Provider (`cart-provider.tsx`)

#### Purpose

Wraps the Zustand store with React-friendly hooks and SSR safety.

#### SSR-Safe Hook Pattern

```typescript
export function useCartSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Subscribe to individual state slices (REACTIVE)
  const items = useCartStore(state => state.items);
  const isOpen = useCartStore(state => state.isOpen);

  // Get methods (NOT REACTIVE - but don't need to be)
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return safe defaults during SSR
  if (!isHydrated) {
    return {
      items: [],
      isOpen: false,
      addItem: () => {},
      removeItem: () => {},
      // ... other safe defaults
    };
  }

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    // ... other values
  };
}
```

#### Why This Pattern?

**❌ WRONG - Not Reactive:**

```typescript
const cartStore = useCartStore(); // Gets entire store once
const totalItems = cartStore.getTotalItems(); // Not reactive!
```

**✅ CORRECT - Reactive:**

```typescript
const items = useCartStore(state => state.items); // Subscribes to items
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0); // Recomputes on change
```

**Key Principle:**

- Use **selectors** for state that needs to trigger re-renders
- Compute derived values **in the component** from reactive state
- Methods don't need selectors (they're stable references)

### Cart Synchronization (`use-cart-sync.ts`)

#### Features

1. **Cross-Tab Sync**: Changes in one tab reflect in others
2. **Periodic Sync**: Syncs with server every 30 seconds
3. **Visibility Sync**: Syncs when tab becomes active
4. **Online Sync**: Syncs when connection restored

#### Implementation

```typescript
export function useCartSync({
  syncInterval = 30000,
  enableCrossTabSync = true,
  enablePeriodicSync = true,
}: UseCartSyncOptions = {}) {
  const { syncCart, isHydrated, lastSyncTimestamp } = useCartStore();

  // Cross-tab sync via storage events
  useEffect(() => {
    if (!enableCrossTabSync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart-storage' && event.newValue) {
        const newCartData = JSON.parse(event.newValue);
        if (newCartData.state?.lastSyncTimestamp > lastSyncRef.current) {
          window.location.reload(); // Force re-hydration
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [enableCrossTabSync]);

  // Periodic sync
  useEffect(() => {
    if (!enablePeriodicSync || !isHydrated) return;

    const interval = setInterval(async () => {
      await syncCart();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [isHydrated, enablePeriodicSync, syncInterval, syncCart]);

  // Visibility change sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isHydrated) {
        syncCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isHydrated, syncCart]);

  return { manualSync: syncCart };
}
```

### Cart UI Components

#### CartSidebar (`cart-sidebar.tsx`)

**Key Features:**

- Slide-out panel from right
- Scrollable item list
- Fixed price summary at bottom
- Keyboard navigation (Escape to close)
- Focus trapping for accessibility
- Screen reader announcements

**Reactive Pattern:**

```typescript
export function CartSidebar() {
  const { items, isOpen, removeItem, updateQuantity } = useCartSafe();

  // ✅ Compute from reactive state
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const hasCartItems = items.length > 0;

  // ❌ DON'T use store methods for computed values
  // const totalItems = getTotalItems();  // Not reactive!

  return (
    <div>
      <Badge>{totalItems}</Badge>
      {items.map(item => (
        <CartItemCard
          key={item.id}
          item={item}
          onUpdateQuantity={qty => updateQuantity(item.id, qty)}
        />
      ))}
    </div>
  );
}
```

#### PriceBreakdown (`price-breakdown.tsx`)

**Reactive Calculations:**

```typescript
export function PriceBreakdown() {
  const { items } = useCartSafe();

  // All computed from reactive items state
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
  const tax = calculateTax(subtotal);
  const deliveryFee = calculateDeliveryFee();
  const total = subtotal + tax + deliveryFee;

  if (totalItems === 0) return null;

  return (
    <div>
      <div>Subtotal: {formatCurrency(subtotal)}</div>
      <div>Tax (13%): {formatCurrency(tax)}</div>
      <div>Delivery: {formatCurrency(deliveryFee)}</div>
      <div>Total: {formatCurrency(total)}</div>
    </div>
  );
}
```

**Why This Works:**

1. `items` is reactive (subscribed via selector)
2. When `updateQuantity` changes items, component re-renders
3. All computed values recalculate with new data
4. UI updates immediately

---

## Checkout Flow

### Overview

4-step checkout process with validation at each stage.

```
Step 1: Delivery Method → Step 2: Address → Step 3: Schedule → Step 4: Review & Pay
```

### CheckoutFlow Component (`checkout-flow.tsx`)

#### State Management

```typescript
type CheckoutStep = 'delivery' | 'address' | 'scheduling' | 'summary';

interface CheckoutData {
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: Address;
  scheduledFor?: Date;
  specialInstructions?: string;
}

export function CheckoutFlow() {
  const { items, hasItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryType: 'delivery',
  });

  // Redirect guards
  if (!hasItems()) {
    router.push('/menu');
    return null;
  }

  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/checkout');
    return null;
  }

  // Step navigation
  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as CheckoutStep);
    }
  };

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  };

  return (
    <div>
      <ProgressSteps currentStep={currentStep} />
      {renderStepContent()}
      <OrderSummarySidebar items={items} />
    </div>
  );
}
```

### Step 1: Delivery Selection

**Options:**

- Delivery ($3.99, 30-45 min)
- Pickup (Free, 15-20 min)

**Implementation:**

```typescript
export function DeliverySelection({ selectedType, onSelect, onNext }) {
  return (
    <div>
      {deliveryOptions.map(option => (
        <Card
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={selectedType === option.id ? 'selected' : ''}
        >
          <Icon />
          <h3>{option.title}</h3>
          <p>{option.description}</p>
          <span>{option.estimatedTime}</span>
          <span>{option.fee}</span>
        </Card>
      ))}
      <Button onClick={onNext}>Continue</Button>
    </div>
  );
}
```

### Step 2: Address Form

**Features:**

- Select from saved addresses
- Add new address with validation
- Canadian postal code format (A1A 1A1)
- Province dropdown
- Skip for pickup orders

**Validation:**

```typescript
const validateForm = (): boolean => {
  const newErrors: Partial<NewAddressForm> = {};

  if (!newAddress.street.trim()) {
    newErrors.street = 'Street address is required';
  }
  if (!newAddress.city.trim()) {
    newErrors.city = 'City is required';
  }
  if (!newAddress.province) {
    newErrors.province = 'Province is required';
  }
  if (!/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(newAddress.postalCode)) {
    newErrors.postalCode = 'Please enter a valid Canadian postal code';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Step 3: Order Scheduling

**Features:**

- Date picker (today + next 7 days)
- Time slots (11 AM - 10 PM, 30-min intervals)
- Filters past times for today
- 45-minute preparation buffer
- Business hours display

**Time Slot Generation:**

```typescript
const getAvailableTimeSlots = (dateStr: string) => {
  const selectedDateObj = new Date(dateStr);
  const now = new Date();
  const isToday = selectedDateObj.toDateString() === now.toDateString();

  const slots = [];
  const startHour = 11; // 11 AM
  const endHour = 22; // 10 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeSlot = new Date(selectedDateObj);
      timeSlot.setHours(hour, minute, 0, 0);

      // Skip past times for today
      if (isToday && timeSlot <= now) continue;

      // Add 45-minute buffer
      const bufferTime = new Date(now.getTime() + 45 * 60000);
      if (isToday && timeSlot < bufferTime) continue;

      slots.push({
        value: timeSlot.toTimeString().slice(0, 5),
        label: timeSlot.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      });
    }
  }

  return slots;
};
```

### Step 4: Order Summary

**Features:**

- Review all order items
- Delivery/pickup information
- Schedule confirmation
- Special instructions textarea
- Payment summary
- Place order button

**Order Submission:**

```typescript
const handlePlaceOrder = async () => {
  setIsProcessing(true);

  try {
    const orderData = {
      customerId: user.id,
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customizations: item.selectedCustomizations,
        specialInstructions: item.specialInstructions,
        totalPrice: item.totalPrice,
      })),
      deliveryType: checkoutData.deliveryType,
      deliveryAddressId: checkoutData.deliveryAddress?.id,
      scheduledFor: checkoutData.scheduledFor?.toISOString(),
      specialInstructions: checkoutData.specialInstructions,
      subtotal: getSubtotal(),
      tax: getTax(),
      deliveryFee: getDeliveryFee(),
      total: getTotal(),
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      clearCart(); // Clear cart after successful order
      router.push(`/order-confirmation?orderId=${result.data.id}`);
    } else {
      throw new Error(result.error || 'Failed to place order');
    }
  } catch (error) {
    console.error('Order submission failed:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};
```

---

## API Integration

### Order Creation Endpoint

**Route:** `POST /api/orders`

#### Request Validation

```typescript
const createOrderSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Too many items in order'),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  deliveryAddressId: z.string().cuid().optional(),
  scheduledFor: z.string().datetime().optional(),
  specialInstructions: z
    .string()
    .max(500, 'Special instructions too long')
    .transform(InputSanitizer.sanitizeString)
    .optional(),
  subtotal: z.number().positive().max(50000),
  tax: z.number().min(0).max(10000),
  deliveryFee: z.number().min(0).max(100),
  total: z.number().positive().max(50000),
});
```

#### Security Measures

1. **Rate Limiting**

```typescript
const validation = await SecurityMiddleware.validateRequest(request, {
  rateLimit: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000, // 20 orders per 15 minutes
  },
  requireAuth: true,
});
```

2. **Price Validation** (Prevent Manipulation)

```typescript
// Verify menu items exist and prices match
const menuItems = await db.menuItem.findMany({
  where: { id: { in: menuItemIds }, status: 'ACTIVE' },
});

// Validate pricing
let calculatedSubtotal = 0;
for (const item of validatedData.items) {
  const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
  const expectedTotal = item.quantity * item.unitPrice;

  if (Math.abs(item.totalPrice - expectedTotal) > 0.01) {
    return NextResponse.json(
      { success: false, error: 'Invalid item pricing detected' },
      { status: 400 }
    );
  }
  calculatedSubtotal += item.totalPrice;
}

// Validate order totals
if (Math.abs(validatedData.subtotal - calculatedSubtotal) > 0.01) {
  return NextResponse.json(
    { success: false, error: 'Invalid order subtotal' },
    { status: 400 }
  );
}
```

3. **Order Number Generation**

```typescript
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${timestamp}${random}`;
}
```

#### Database Transaction

```typescript
const order = await db.order.create({
  data: {
    orderNumber,
    customerId: validatedData.customerId,
    subtotal: validatedData.subtotal,
    tax: validatedData.tax,
    deliveryFee: validatedData.deliveryFee,
    tip: 0,
    total: validatedData.total,
    status: 'PENDING',
    deliveryType: validatedData.deliveryType,
    deliveryAddressId: validatedData.deliveryAddressId || null,
    scheduledFor,
    estimatedDelivery: scheduledFor
      ? new Date(scheduledFor.getTime() + 45 * 60000)
      : null,
    paymentStatus: 'PENDING',
    specialInstructions: validatedData.specialInstructions,
    items: {
      create: validatedData.items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customizations: JSON.stringify(item.customizations || []),
        specialInstructions: item.specialInstructions,
        totalPrice: item.totalPrice,
        menuItem: {
          connect: { id: item.menuItemId },
        },
      })),
    },
  },
  include: {
    items: true,
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    deliveryAddress: true,
  },
});
```

#### Response

```typescript
return SecurityHeaders.applyHeaders(
  NextResponse.json({
    success: true,
    data: order,
    message: 'Order created successfully',
  })
);
```

### Order Retrieval Endpoint

**Route:** `GET /api/orders`

**Query Parameters:**

- `orderId`: Get specific order
- `customerId`: Get customer's orders (paginated)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Example:**

```typescript
// Get specific order
GET /api/orders?orderId=clx123abc

// Get customer orders
GET /api/orders?customerId=clx456def&page=1&limit=10
```

---

## Best Practices

### 1. Zustand State Management

#### ✅ DO: Use Selectors for Reactive State

```typescript
// Component re-renders when items change
const items = useCartStore(state => state.items);
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
```

#### ❌ DON'T: Use Getter Functions

```typescript
// Component doesn't re-render when items change
const getTotalItems = useCartStore(state => state.getTotalItems);
const totalItems = getTotalItems(); // Not reactive!
```

#### ✅ DO: Compute Derived Values in Components

```typescript
function PriceBreakdown() {
  const items = useCartStore(state => state.items);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return <div>Total: {total}</div>;
}
```

#### ❌ DON'T: Store Computed Values in State

```typescript
// Bad: Computed values in state can get out of sync
interface CartStore {
  items: CartItem[];
  subtotal: number; // ❌ Derived from items
  total: number; // ❌ Derived from items
}
```

### 2. SSR Safety

#### ✅ DO: Check for Window/Document

```typescript
if (typeof window === 'undefined') return null;
localStorage.getItem('cart-storage');
```

#### ✅ DO: Use Hydration Guards

```typescript
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

if (!isHydrated) {
  return <div>Loading...</div>;
}
```

### 3. Performance

#### ✅ DO: Memoize Expensive Computations

```typescript
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

#### ✅ DO: Use Shallow Equality for Objects

```typescript
import { shallow } from 'zustand/shallow';

const { items, isOpen } = useCartStore(
  state => ({ items: state.items, isOpen: state.isOpen }),
  shallow
);
```

### 4. Error Handling

#### ✅ DO: Handle Storage Errors

```typescript
try {
  localStorage.setItem(name, JSON.stringify(value));
} catch (error) {
  if (error instanceof Error && error.name === 'QuotaExceededError') {
    // Clear old data and retry
    localStorage.removeItem('temp-data');
    localStorage.setItem(name, JSON.stringify(value));
  }
}
```

#### ✅ DO: Validate Cart Items

```typescript
validateCartItems: () => {
  set(state => {
    const validItems = state.items.filter(item => {
      return (
        item.id &&
        item.menuItemId &&
        item.quantity > 0 &&
        item.unitPrice >= 0 &&
        item.totalPrice >= 0
      );
    });

    return validItems.length !== state.items.length
      ? { items: validItems, lastSyncTimestamp: Date.now() }
      : state;
  });
};
```

### 5. Accessibility

#### ✅ DO: Announce Changes to Screen Readers

```typescript
const handleRemoveItem = (itemId: string, itemName: string) => {
  removeItem(itemId);
  announceToScreenReader(`${itemName} removed from cart`);
};
```

#### ✅ DO: Trap Focus in Modals

```typescript
useEffect(() => {
  if (isOpen && sidebarRef.current) {
    const cleanup = trapFocus(sidebarRef.current);
    return cleanup;
  }
}, [isOpen]);
```

#### ✅ DO: Handle Keyboard Navigation

```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      handleClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [isOpen]);
```

### 6. Testing

#### Unit Tests for Store

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/cart-store';

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        menuItemId: 'item-1',
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
        selectedCustomizations: [],
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should merge items with same customizations', () => {
    const { result } = renderHook(() => useCartStore());

    const item = {
      id: '1',
      menuItemId: 'item-1',
      quantity: 1,
      unitPrice: 10,
      totalPrice: 10,
      selectedCustomizations: [],
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem({ ...item, id: '2' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should calculate totals correctly', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        menuItemId: 'item-1',
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
        selectedCustomizations: [],
      });
    });

    const subtotal = result.current.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    expect(subtotal).toBe(20);
  });
});
```

---

## Common Issues and Solutions

### Issue 1: Cart Not Updating in UI

**Problem:** Clicking +/- buttons doesn't update the cart total.

**Cause:** Using getter functions instead of reactive state.

**Solution:**

```typescript
// ❌ Wrong
const getTotalItems = useCartStore(state => state.getTotalItems);
const total = getTotalItems(); // Not reactive

// ✅ Correct
const items = useCartStore(state => state.items);
const total = items.reduce((sum, item) => sum + item.quantity, 0);
```

### Issue 2: Hydration Mismatch

**Problem:** "Text content does not match server-rendered HTML" error.

**Cause:** Rendering cart data during SSR that doesn't match client.

**Solution:**

```typescript
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

if (!isHydrated) {
  return <div>0 items</div>;  // Safe default
}

return <div>{items.length} items</div>;
```

### Issue 3: Cart Cleared on Page Refresh

**Problem:** Cart items disappear after refresh.

**Cause:** Persistence not configured or storage quota exceeded.

**Solution:**

```typescript
// Check if persistence is working
const testPersistence = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    console.error('LocalStorage not available:', e);
    return false;
  }
};

// Handle quota exceeded
storage: {
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Clear old data
        localStorage.clear();
        localStorage.setItem(name, JSON.stringify(value));
      }
    }
  };
}
```

### Issue 4: Cross-Tab Sync Not Working

**Problem:** Changes in one tab don't reflect in another.

**Cause:** Storage event not firing or not handled correctly.

**Solution:**

```typescript
useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    // Only handle cart storage changes
    if (event.key === 'cart-storage' && event.newValue) {
      try {
        const newCartData = JSON.parse(event.newValue);

        // Check if change is newer
        if (newCartData.state?.lastSyncTimestamp > lastSyncRef.current) {
          // Force re-hydration
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to parse cart storage change:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Note:** Storage events only fire in OTHER tabs, not the one making the change.

---

## Performance Optimization

### 1. Lazy Load Checkout Components

```typescript
const CheckoutFlow = dynamic(() => import('@/components/checkout/checkout-flow'), {
  loading: () => <CheckoutSkeleton />,
  ssr: false,
});
```

### 2. Debounce Quantity Updates

```typescript
const debouncedUpdateQuantity = useMemo(
  () =>
    debounce((itemId: string, quantity: number) => {
      updateQuantity(itemId, quantity);
    }, 300),
  [updateQuantity]
);
```

### 3. Virtualize Long Item Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
});
```

### 4. Optimize Re-renders

```typescript
// Use React.memo for item cards
const CartItemCard = React.memo(
  ({ item, onRemove, onUpdateQuantity }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.quantity === nextProps.item.quantity
    );
  }
);
```

---

## Security Considerations

### 1. Price Validation

Always validate prices on the server. Never trust client-side calculations.

```typescript
// Server-side validation
const menuItem = await db.menuItem.findUnique({
  where: { id: item.menuItemId },
});

if (item.unitPrice !== menuItem.basePrice) {
  throw new Error('Price mismatch detected');
}
```

### 2. Rate Limiting

Prevent abuse with rate limiting.

```typescript
const validation = await SecurityMiddleware.validateRequest(request, {
  rateLimit: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000,
  },
});
```

### 3. Input Sanitization

Sanitize all user inputs.

```typescript
specialInstructions: z.string()
  .max(500)
  .transform(InputSanitizer.sanitizeString)
  .optional();
```

### 4. Authentication

Require authentication for checkout.

```typescript
if (!isAuthenticated) {
  router.push('/auth/login?redirect=/checkout');
  return null;
}
```

### 5. CSRF Protection

Use security headers.

```typescript
return SecurityHeaders.applyHeaders(
  NextResponse.json({ success: true, data: order })
);
```

---

## Monitoring and Analytics

### Track Cart Events

```typescript
// Add to cart
analytics.track('cart_item_added', {
  item_id: item.menuItemId,
  quantity: item.quantity,
  price: item.unitPrice,
});

// Remove from cart
analytics.track('cart_item_removed', {
  item_id: itemId,
});

// Checkout started
analytics.track('checkout_started', {
  cart_total: getTotal(),
  item_count: getTotalItems(),
});

// Order completed
analytics.track('order_completed', {
  order_id: order.id,
  order_number: order.orderNumber,
  total: order.total,
});
```

---

## Future Enhancements

### 1. Optimistic Updates

Update UI immediately, rollback on error.

```typescript
const updateQuantity = async (itemId: string, quantity: number) => {
  // Optimistic update
  const previousItems = get().items;
  set(state => ({
    items: state.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ),
  }));

  try {
    // Sync with server
    await fetch('/api/cart/update', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity }),
    });
  } catch (error) {
    // Rollback on error
    set({ items: previousItems });
    toast.error('Failed to update cart');
  }
};
```

### 2. Cart Abandonment Recovery

Track abandoned carts and send reminders.

```typescript
// Track cart abandonment
useEffect(() => {
  if (items.length > 0) {
    const timeout = setTimeout(
      () => {
        analytics.track('cart_abandoned', {
          cart_total: getTotal(),
          items: items.map(i => i.menuItemId),
        });
      },
      30 * 60 * 1000
    ); // 30 minutes

    return () => clearTimeout(timeout);
  }
}, [items]);
```

### 3. Promo Codes

Add discount code support.

```typescript
interface CartStore {
  promoCode?: string;
  discount: number;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
}

const applyPromoCode = async (code: string) => {
  const response = await fetch('/api/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  const { valid, discount } = await response.json();

  if (valid) {
    set({ promoCode: code, discount });
  } else {
    throw new Error('Invalid promo code');
  }
};
```

### 4. Save for Later

Allow users to save items for later.

```typescript
interface CartStore {
  savedItems: CartItem[];
  saveForLater: (itemId: string) => void;
  moveToCart: (itemId: string) => void;
}
```

### 5. Guest Checkout

Allow checkout without account.

```typescript
const handleGuestCheckout = () => {
  // Store cart in session
  sessionStorage.setItem('guest-cart', JSON.stringify(items));

  // Collect email for order updates
  router.push('/checkout/guest');
};
```

---

## Conclusion

This cart and checkout system provides a robust, scalable foundation for e-commerce applications. Key takeaways:

1. **Zustand** provides simple, performant state management
2. **Selectors** are crucial for reactive updates
3. **Persistence** ensures cart survives page refreshes
4. **Validation** on both client and server prevents errors
5. **Accessibility** makes the app usable for everyone
6. **Security** protects against common vulnerabilities

For questions or issues, refer to the troubleshooting section or check the component source code.
