// Fix: Define and export interfaces for Toast and Subscription.
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  nextPaymentDate: string | null; // using string for simplicity, can be Date object
  category: string;
}

// For the modal form
export type SubscriptionFormData = Omit<Subscription, 'id'>;
