import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address } from '@/types';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
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
          // TODO: Implement actual authentication API call
          // This is a placeholder implementation
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const user = await response.json();
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // TODO: Call logout API endpoint
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          const response = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (response.ok) {
            const updatedUser = await response.json();
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error('Profile update failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addAddress: async (address: Omit<Address, 'id'>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(address),
            }
          );

          if (response.ok) {
            const newAddress = await response.json();
            const updatedUser = {
              ...currentUser,
              addresses: [...currentUser.addresses, newAddress],
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error('Address creation failed');
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
          // TODO: Implement actual API call
          const response = await fetch(
            `/api/users/${currentUser.id}/addresses/${addressId}/default`,
            {
              method: 'PATCH',
            }
          );

          if (response.ok) {
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
            throw new Error('Default address update failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
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
