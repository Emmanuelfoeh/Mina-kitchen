/**
 * Query Hooks Index
 *
 * Central export point for all TanStack Query hooks.
 * Import from here for consistency across the app.
 */

// Menu queries
export {
  useMenuCategories,
  useMenuItems,
  useMenuItem,
  useRelatedMenuItems,
  useMenuItemsSuspense,
} from './use-menu-queries';

// Package queries
export {
  usePackages,
  usePackage,
  usePackagesSuspense,
} from './use-package-queries';

// Order queries
export { useOrders, useOrder } from './use-order-queries';

// Cart queries
export {
  useCart,
  useInvalidateCart,
  useRefetchCart,
  useCartCache,
  useUpdateCartCache,
  useSyncCartWithQuery,
} from './use-cart-queries';

// Admin queries
export {
  useAdminDashboardStats,
  useAdminOrders,
  useAdminOrder,
  useAdminOrderStats,
  useAdminOrderTimeline,
  useAdminMenuItems,
  useAdminMenuStats,
  useAdminMenuCategories,
  useAdminPackages,
  useAdminPackage,
  useAdminPackageStats,
  useAdminUsers,
  useAdminUser,
} from './use-admin-queries';

// Future: Export mutation hooks
