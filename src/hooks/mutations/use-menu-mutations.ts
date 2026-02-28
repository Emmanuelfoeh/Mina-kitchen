import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { APIResponse } from '@/types';

export interface MenuItemData {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  status?: 'active' | 'inactive' | 'sold_out' | 'low_stock';
  image?: string;
  tags?: string[];
  customizations?: Array<{
    name: string;
    options: string[];
    required?: boolean;
  }>;
}

interface CategoryData {
  id?: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

/**
 * Mutation hook for creating menu items
 */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MenuItemData) => {
      return apiPost<APIResponse<MenuItemData>>('/api/admin/menu/items', data);
    },
    onSuccess: () => {
      // Invalidate menu queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.stats() });

      toast.success('Menu item created', {
        description: 'New menu item has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create menu item', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating menu items
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Partial<MenuItemData>;
    }) => {
      return apiPatch<APIResponse<MenuItemData>>(
        `/api/admin/menu/items/${itemId}`,
        data
      );
    },
    onSuccess: (response, { itemId }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.menu.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.stats() });

      toast.success('Menu item updated', {
        description: 'Changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update menu item', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating menu item status
 * Uses optimistic update for instant feedback
 */
export function useUpdateMenuItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      status,
    }: {
      itemId: string;
      status: MenuItemData['status'];
    }) => {
      return apiPatch<APIResponse<MenuItemData>>(
        `/api/admin/menu/items/${itemId}`,
        { status }
      );
    },
    onMutate: async ({ itemId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.menu.all() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKeys.admin.menu.all());

      // Optimistically update
      queryClient.setQueryData<{ items: MenuItemData[] }>(
        queryKeys.admin.menu.all(),
        old => {
          if (!old?.items) return old;

          return {
            ...old,
            items: old.items.map((item: MenuItemData) =>
              item.id === itemId ? { ...item, status } : item
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (response, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.menu.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.stats() });

      toast.success('Status updated', {
        description: `Menu item is now ${response.data.status}`,
      });
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.admin.menu.all(),
          context.previousData
        );
      }

      toast.error('Failed to update status', {
        description: error.message || 'Please try again.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.all() });
    },
  });
}

/**
 * Mutation hook for deleting menu items
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return apiDelete<APIResponse<{ success: boolean }>>(
        `/api/admin/menu/items/${itemId}`
      );
    },
    onSuccess: (response, itemId) => {
      // Remove from cache immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.stats() });

      // Remove specific item query
      queryClient.removeQueries({
        queryKey: queryKeys.menu.item(itemId),
      });

      toast.success('Menu item deleted', {
        description: 'Menu item has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete menu item', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for duplicating menu items
 */
export function useDuplicateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: MenuItemData) => {
      return apiPost<APIResponse<MenuItemData>>('/api/admin/menu/items', {
        ...item,
        name: `${item.name} (Copy)`,
        status: 'INACTIVE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.menu.stats() });

      toast.success('Menu item duplicated', {
        description: 'New copy has been created as inactive.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to duplicate menu item', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for creating categories
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryData) => {
      return apiPost<APIResponse<CategoryData>>(
        '/api/admin/menu/categories',
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.menu.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.menu.categories(),
      });

      toast.success('Category created', {
        description: 'New category has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create category', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating categories
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: Partial<CategoryData>;
    }) => {
      return apiPatch<APIResponse<CategoryData>>(
        `/api/admin/menu/categories/${categoryId}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.menu.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.menu.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.menu.all(),
      });

      toast.success('Category updated', {
        description: 'Changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update category', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for deleting categories
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      return apiDelete<APIResponse<{ success: boolean }>>(
        `/api/admin/menu/categories/${categoryId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.menu.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.menu.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.menu.all(),
      });

      toast.success('Category deleted', {
        description: 'Category has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete category', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
