import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPatch } from '@/lib/api-client';
import type { APIResponse } from '@/types';

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  defaultAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  defaultAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileData) => {
      return apiPatch<APIResponse<UserProfile>>('/api/profile', data);
    },
    onMutate: async (newData: ProfileData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<UserProfile>([
        'profile',
      ]);

      // Optimistically update profile
      queryClient.setQueryData<UserProfile>(
        ['profile'],
        (old: UserProfile | undefined) => {
          if (!old) return old;
          return { ...old, ...newData };
        }
      );

      return { previousProfile };
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (
      error: Error,
      _variables: ProfileData,
      context: { previousProfile?: UserProfile } | undefined
    ) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }

      toast.error('Failed to update profile', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      return apiPatch<APIResponse<{ success: boolean }>>(
        '/api/profile/password',
        data
      );
    },
    onSuccess: () => {
      toast.success('Password updated', {
        description: 'Your password has been changed successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update password', {
        description: error.message || 'Please check your current password.',
      });
    },
  });
}
