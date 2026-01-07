import { create } from 'zustand';
import type { OrderStatus } from '@/types';

interface AdminFilters {
  status?: OrderStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

interface AdminStore {
  selectedOrders: string[];
  filters: AdminFilters;
  setFilters: (filters: Partial<AdminFilters>) => void;
  selectOrder: (orderId: string) => void;
  deselectOrder: (orderId: string) => void;
  selectAllOrders: (orderIds: string[]) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: OrderStatus) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  selectedOrders: [],
  filters: {},

  setFilters: (filters: Partial<AdminFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  selectOrder: (orderId: string) => {
    set(state => ({
      selectedOrders: [...state.selectedOrders, orderId],
    }));
  },

  deselectOrder: (orderId: string) => {
    set(state => ({
      selectedOrders: state.selectedOrders.filter(id => id !== orderId),
    }));
  },

  selectAllOrders: (orderIds: string[]) => {
    set({ selectedOrders: orderIds });
  },

  clearSelection: () => {
    set({ selectedOrders: [] });
  },

  bulkUpdateStatus: async (status: OrderStatus) => {
    const selectedOrders = get().selectedOrders;
    if (selectedOrders.length === 0) return;

    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/admin/orders/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status,
        }),
      });

      if (response.ok) {
        set({ selectedOrders: [] });
      } else {
        throw new Error('Bulk update failed');
      }
    } catch (error) {
      throw error;
    }
  },
}));
