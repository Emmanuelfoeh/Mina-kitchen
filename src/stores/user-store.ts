import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address } from '@/types';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (
    address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateAddress: (
    addressId: string,
    updates: Partial<Address>
  ) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(result.error || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const response = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({ user: result.data, isLoading: false });
          } else {
            throw new Error(result.error || 'Profile update failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addAddress: async (
        address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>
      ) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(address),
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            const updatedUser = {
              ...currentUser,
              addresses: [...currentUser.addresses, result.data],
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error(result.error || 'Address creation failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setDefaultAddress: async (addressId: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses/${addressId}/default`,
            {
              method: 'PATCH',
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            const updatedAddresses = currentUser.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === addressId,
            }));

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error(result.error || 'Default address update failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateAddress: async (addressId: string, updates: Partial<Address>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses/${addressId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            const updatedAddresses = currentUser.addresses.map(addr =>
              addr.id === addressId ? result.data : addr
            );

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error(result.error || 'Address update failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteAddress: async (addressId: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses/${addressId}`,
            {
              method: 'DELETE',
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            const updatedAddresses = currentUser.addresses.filter(
              addr => addr.id !== addressId
            );

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error(result.error || 'Address deletion failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/me');

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              set({ user: result.data, isAuthenticated: true });
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
