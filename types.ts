// Fix: Add type definition for window.storage to prevent TypeScript errors.
declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<{ value: string }>;
      delete: (key: string) => Promise<void>;
    };
  }
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export enum BillingCycle {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
}

export enum Category {
  STREAMING = 'OTT/Streaming',
  SAAS = 'Software/SaaS',
  HEALTH = 'Fitness/Health',
  FOOD = 'Food Delivery',
  ECOMMERCE = 'E-commerce',
  OTHER = 'Other',
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  category: Category;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
}

export interface Alert extends Subscription {
  daysUntilRenewal: number;
  level: 'red' | 'amber';
}

export type SortOption =
  | 'renewalDate_asc'
  | 'cost_desc'
  | 'name_asc'
  | 'category_asc'
  | 'category_desc';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}