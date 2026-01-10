import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Subscription {
  id: string;
  packageId: string;
  packageName: string;
  packageType: 'daily' | 'weekly' | 'monthly';
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: Date;
  nextDelivery: Date;
  deliveryAddress: {
    id: string;
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  deliverySchedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6, Sunday = 0
    dayOfMonth?: number; // 1-31
    time: string; // HH:MM format
  };
  customizations: {
    menuItemId: string;
    selectedCustomizations: Array<{
      customizationId: string;
      optionIds: string[];
      textValue?: string;
    }>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionStore {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addSubscription: (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  updateDeliverySchedule: (
    id: string,
    schedule: Subscription['deliverySchedule']
  ) => void;
  updateDeliveryAddress: (
    id: string,
    address: Subscription['deliveryAddress']
  ) => void;
  updateCustomizations: (
    id: string,
    customizations: Subscription['customizations']
  ) => void;
  getActiveSubscriptions: () => Subscription[];
  getSubscriptionById: (id: string) => Subscription | undefined;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      isLoading: false,
      error: null,

      addSubscription: subscriptionData => {
        const newSubscription: Subscription = {
          ...subscriptionData,
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          subscriptions: [...state.subscriptions, newSubscription],
          error: null,
        }));
      },

      updateSubscription: (id, updates) => {
        set(state => ({
          subscriptions: state.subscriptions.map(sub =>
            sub.id === id ? { ...sub, ...updates, updatedAt: new Date() } : sub
          ),
          error: null,
        }));
      },

      pauseSubscription: id => {
        get().updateSubscription(id, { status: 'paused' });
      },

      resumeSubscription: id => {
        get().updateSubscription(id, { status: 'active' });
      },

      cancelSubscription: id => {
        get().updateSubscription(id, { status: 'cancelled' });
      },

      updateDeliverySchedule: (id, schedule) => {
        get().updateSubscription(id, { deliverySchedule: schedule });
      },

      updateDeliveryAddress: (id, address) => {
        get().updateSubscription(id, { deliveryAddress: address });
      },

      updateCustomizations: (id, customizations) => {
        get().updateSubscription(id, { customizations });
      },

      getActiveSubscriptions: () => {
        return get().subscriptions.filter(sub => sub.status === 'active');
      },

      getSubscriptionById: id => {
        return get().subscriptions.find(sub => sub.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'subscription-store',
      partialize: state => ({
        subscriptions: state.subscriptions,
      }),
    }
  )
);
