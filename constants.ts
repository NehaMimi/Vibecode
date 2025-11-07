
import { Category, BillingCycle, SortOption } from './types';

export const CATEGORIES: Category[] = [
  Category.STREAMING,
  Category.SAAS,
  Category.HEALTH,
  Category.FOOD,
  Category.ECOMMERCE,
  Category.OTHER,
];

export const BILLING_CYCLES: BillingCycle[] = [
  BillingCycle.MONTHLY,
  BillingCycle.QUARTERLY,
  BillingCycle.YEARLY,
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'renewalDate', label: 'Renewal Date' },
  { value: 'cost', label: 'Cost' },
  { value: 'name', label: 'Name (A-Z)' },
];

export const CATEGORY_COLORS: Record<Category, string> = {
    [Category.STREAMING]: 'bg-red-500',
    [Category.SAAS]: 'bg-blue-500',
    [Category.HEALTH]: 'bg-green-500',
    [Category.FOOD]: 'bg-yellow-500',
    [Category.ECOMMERCE]: 'bg-purple-500',
    [Category.OTHER]: 'bg-gray-500',
};
