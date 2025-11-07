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
  { value: 'renewalDate_asc', label: 'Renewal Date (Soonest)' },
  { value: 'cost_desc', label: 'Cost (High to Low)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'category_asc', label: 'Category (A-Z)' },
  { value: 'category_desc', label: 'Category (Z-A)' },
];

export const CATEGORY_COLORS: Record<Category, string> = {
    [Category.STREAMING]: 'bg-red-500',
    [Category.SAAS]: 'bg-blue-500',
    [Category.HEALTH]: 'bg-green-500',
    [Category.FOOD]: 'bg-yellow-500',
    [Category.ECOMMERCE]: 'bg-purple-500',
    [Category.OTHER]: 'bg-gray-500',
};