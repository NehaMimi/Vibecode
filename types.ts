// types.ts

// A global declaration to inform TypeScript about the custom window.storage property
// This avoids errors when accessing window.storage
declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string | null } | null>;
      set: (key: string, value: string) => Promise<void>;
      delete: (key: string) => Promise<void>;
    };
  }
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  cost: number;
  currency: Currency;
  costInINR: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  nextPaymentDate: string | null;
  category: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Never store plain text passwords
  createdAt: string;
}
