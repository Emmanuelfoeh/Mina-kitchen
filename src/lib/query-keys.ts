/**
 * Query Key Factory
 *
 * Centralized management of query keys for TanStack Query.
 * This ensures consistency and makes cache invalidation easier.
 *
 * Pattern: Hierarchical keys from general to specific
 * Example: ['menu'] -> ['menu', 'items'] -> ['menu', 'items', { filters }]
 */

export const queryKeys = {
  // Menu related queries
  menu: {
    all: ['menu'] as const,
    categories: () => [...queryKeys.menu.all, 'categories'] as const,
    items: (filters?: {
      category?: string;
      search?: string;
      status?: string;
      limit?: number;
    }) => [...queryKeys.menu.all, 'items', filters] as const,
    item: (slug: string) => [...queryKeys.menu.all, 'item', slug] as const,
    itemRelated: (slug: string) =>
      [...queryKeys.menu.all, 'item', slug, 'related'] as const,
  },

  // Package related queries
  packages: {
    all: ['packages'] as const,
    list: (filters?: { status?: string }) =>
      [...queryKeys.packages.all, 'list', filters] as const,
    detail: (slug: string) =>
      [...queryKeys.packages.all, 'detail', slug] as const,
  },

  // Order related queries
  orders: {
    all: ['orders'] as const,
    list: (customerId?: string) =>
      [...queryKeys.orders.all, 'list', customerId] as const,
    detail: (orderId: string) =>
      [...queryKeys.orders.all, 'detail', orderId] as const,
  },

  // Cart related queries
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
  },

  // Admin queries
  admin: {
    all: ['admin'] as const,
    dashboard: {
      stats: () => [...queryKeys.admin.all, 'dashboard', 'stats'] as const,
    },
    orders: {
      all: () => [...queryKeys.admin.all, 'orders'] as const,
      list: (filters?: {
        page?: number;
        search?: string;
        status?: string;
        sortBy?: string;
      }) => [...queryKeys.admin.all, 'orders', 'list', filters] as const,
      detail: (orderId: string) =>
        [...queryKeys.admin.all, 'orders', 'detail', orderId] as const,
      stats: () => [...queryKeys.admin.all, 'orders', 'stats'] as const,
      timeline: (orderId: string) =>
        [...queryKeys.admin.all, 'orders', 'timeline', orderId] as const,
    },
    menu: {
      all: () => [...queryKeys.admin.all, 'menu'] as const,
      items: (filters?: {
        page?: number;
        search?: string;
        category?: string;
        status?: string;
      }) => [...queryKeys.admin.all, 'menu', 'items', filters] as const,
      stats: () => [...queryKeys.admin.all, 'menu', 'stats'] as const,
      categories: () => [...queryKeys.admin.all, 'menu', 'categories'] as const,
    },
    packages: {
      all: () => [...queryKeys.admin.all, 'packages'] as const,
      list: (filters?: { page?: number; search?: string; status?: string }) =>
        [...queryKeys.admin.all, 'packages', 'list', filters] as const,
      detail: (packageId: string) =>
        [...queryKeys.admin.all, 'packages', 'detail', packageId] as const,
      stats: () => [...queryKeys.admin.all, 'packages', 'stats'] as const,
    },
    users: {
      all: () => [...queryKeys.admin.all, 'users'] as const,
      list: (filters?: { page?: number; search?: string; role?: string }) =>
        [...queryKeys.admin.all, 'users', 'list', filters] as const,
      detail: (userId: string) =>
        [...queryKeys.admin.all, 'users', 'detail', userId] as const,
    },
  },
} as const;
