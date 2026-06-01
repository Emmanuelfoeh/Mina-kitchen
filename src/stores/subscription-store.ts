import { create } from 'zustand';

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

  // Actions (server-backed)
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateSubscription: (
    id: string,
    updates: Partial<Subscription>
  ) => Promise<void>;
  pauseSubscription: (id: string) => Promise<void>;
  resumeSubscription: (id: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  updateDeliverySchedule: (
    id: string,
    schedule: Subscription['deliverySchedule']
  ) => Promise<void>;
  updateDeliveryAddress: (
    id: string,
    address: Subscription['deliveryAddress']
  ) => Promise<void>;
  updateCustomizations: (
    id: string,
    customizations: Subscription['customizations']
  ) => Promise<void>;
  getActiveSubscriptions: () => Subscription[];
  getSubscriptionById: (id: string) => Subscription | undefined;
  clearError: () => void;
}

// API returns ISO strings for date fields; the Subscription contract uses Date instances.
type SubscriptionResponse = Omit<
  Subscription,
  'startDate' | 'nextDelivery' | 'createdAt' | 'updatedAt'
> & {
  startDate: string;
  nextDelivery: string;
  createdAt: string;
  updatedAt: string;
};

function reviveDates(sub: SubscriptionResponse): Subscription {
  return {
    ...sub,
    startDate: new Date(sub.startDate),
    nextDelivery: new Date(sub.nextDelivery),
    createdAt: new Date(sub.createdAt),
    updatedAt: new Date(sub.updatedAt),
  };
}

async function readError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error(await readError(res));
      const json = await res.json();
      set({
        subscriptions: (json.data || []).map(reviveDates),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load subscriptions',
      });
    }
  },

  addSubscription: async subscriptionData => {
    set({ error: null });
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    });
    if (!res.ok) {
      const message = await readError(res);
      set({ error: message });
      throw new Error(message);
    }
    const json = await res.json();
    set(state => ({
      subscriptions: [reviveDates(json.data), ...state.subscriptions],
      error: null,
    }));
  },

  updateSubscription: async (id, updates) => {
    set({ error: null });
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const message = await readError(res);
      set({ error: message });
      throw new Error(message);
    }
    const json = await res.json();
    set(state => ({
      subscriptions: state.subscriptions.map(sub =>
        sub.id === id ? reviveDates(json.data) : sub
      ),
      error: null,
    }));
  },

  pauseSubscription: id => get().updateSubscription(id, { status: 'paused' }),
  resumeSubscription: id => get().updateSubscription(id, { status: 'active' }),
  cancelSubscription: id =>
    get().updateSubscription(id, { status: 'cancelled' }),

  updateDeliverySchedule: (id, schedule) =>
    get().updateSubscription(id, { deliverySchedule: schedule }),

  updateDeliveryAddress: (id, address) =>
    get().updateSubscription(id, { deliveryAddress: address }),

  updateCustomizations: (id, customizations) =>
    get().updateSubscription(id, { customizations }),

  getActiveSubscriptions: () => {
    return get().subscriptions.filter(sub => sub.status === 'active');
  },

  getSubscriptionById: id => {
    return get().subscriptions.find(sub => sub.id === id);
  },

  clearError: () => {
    set({ error: null });
  },
}));
