export interface User {
  id: string;
  email: string;
  password?: string; // For handling auth, won't be stored in session state
}

export enum Category {
  STREAMING = 'Streaming',
  SAAS = 'SaaS',
  HEALTH = 'Health',
  FOOD = 'Food',
  ECOMMERCE = 'E-commerce',
  OTHER = 'Other',
}

export enum BillingCycle {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  renewalDate: string; // ISO string
  category: Category;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string; // ISO string
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