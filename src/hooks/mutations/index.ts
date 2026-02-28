// Order mutations
export {
  useCreateOrder,
  useCancelOrder,
  useUpdateOrderStatus,
  useBulkUpdateOrderStatus,
} from './use-order-mutations';

// Menu mutations
export {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUpdateMenuItemStatus,
  useDeleteMenuItem,
  useDuplicateMenuItem,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './use-menu-mutations';

// Package mutations
export {
  useCreatePackage,
  useUpdatePackage,
  useUpdatePackageStatus,
  useDeletePackage,
} from './use-package-mutations';

// Profile mutations
export { useUpdateProfile, useUpdatePassword } from './use-profile-mutations';

// Cart mutations (optional - Zustand store handles most cart operations)
export {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useSyncLocalCart,
} from './use-cart-mutations';
