// Export all custom hooks from a central location
export { useLocalStorage } from './use-local-storage';
export { useDebounce } from './use-debounce';
export { useMediaQuery } from './use-media-query';
export { useCartSync } from './use-cart-sync';
export { useTouchGestures } from './use-touch-gestures';
export {
  useMobileViewport,
  useTouchDevice,
  useMobileFeatures,
} from './use-mobile-viewport';

// Cart integration
export { useIntegratedCart, useCartAuthSync } from './use-integrated-cart';

// Error recovery hooks
export {
  useQueryErrorReset,
  useRetryWithBackoff,
  useMutationErrorHandler,
  useErrorState,
  useOnlineErrorRecovery,
  useErrorHandler,
} from './use-error-recovery';

// Export query hooks
export * from './queries';

// Export mutation hooks
export * from './mutations';
