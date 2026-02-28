import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { APIResponse } from '@/types';

interface PackageData {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  servings: number;
  type: 'SUBSCRIPTION' | 'ONE_TIME';
  isActive: boolean;
  image?: string;
  items?: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

/**
 * Mutation hook for creating packages
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PackageData) => {
      return apiPost<APIResponse<PackageData>>('/api/admin/packages', data);
    },
    onSuccess: () => {
      // Invalidate package queries
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.stats(),
      });

      toast.success('Package created', {
        description: 'New package has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create package', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating packages
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageId,
      data,
    }: {
      packageId: string;
      data: Partial<PackageData>;
    }) => {
      return apiPatch<APIResponse<PackageData>>(
        `/api/admin/packages/${packageId}`,
        data
      );
    },
    onSuccess: (response, { packageId }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.packages.detail(packageId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.stats(),
      });

      toast.success('Package updated', {
        description: 'Changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update package', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating package status
 * Uses optimistic update for instant feedback
 */
export function useUpdatePackageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageId,
      isActive,
    }: {
      packageId: string;
      isActive: boolean;
    }) => {
      return apiPatch<APIResponse<PackageData>>(
        `/api/admin/packages/${packageId}`,
        { isActive }
      );
    },
    onMutate: async ({ packageId, isActive }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.admin.packages.all(),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(
        queryKeys.admin.packages.all()
      );

      // Optimistically update
      queryClient.setQueryData<{ packages: PackageData[] }>(
        queryKeys.admin.packages.all(),
        old => {
          if (!old?.packages) return old;

          return {
            ...old,
            packages: old.packages.map((pkg: PackageData) =>
              pkg.id === packageId ? { ...pkg, isActive } : pkg
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (response, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.packages.detail(packageId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.stats(),
      });

      toast.success('Package status updated', {
        description: `Package is now ${response.data.isActive ? 'active' : 'inactive'}`,
      });
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.admin.packages.all(),
          context.previousData
        );
      }

      toast.error('Failed to update package status', {
        description: error.message || 'Please try again.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.all(),
      });
    },
  });
}

/**
 * Mutation hook for deleting packages
 */
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageId: string) => {
      return apiDelete<APIResponse<{ success: boolean }>>(
        `/api/admin/packages/${packageId}`
      );
    },
    onSuccess: (response, packageId) => {
      // Remove from cache immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.packages.stats(),
      });

      // Remove specific package query
      queryClient.removeQueries({
        queryKey: queryKeys.packages.detail(packageId),
      });

      toast.success('Package deleted', {
        description: 'Package has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete package', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
