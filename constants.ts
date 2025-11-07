// constants.ts

// FIX: Import the Currency type to resolve the TypeScript error.
import type { Currency } from './types';

export const CATEGORIES = [
  'OTT/Streaming',
  'Software/SaaS',
  'Fitness/Health',
  'Food Delivery',
  'E-commerce',
  'Music',
  'Gaming',
  'Utilities',
  'Education',
  'News & Magazines',
  'Other',
];

export const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
};

// Hardcoded conversion rates for MVP. In a real app, this would come from an API.
export const CONVERSION_RATES: { [key in Exclude<Currency, 'INR'>]: number } = {
  USD: 83.50,
  EUR: 90.50,
  GBP: 106.00,
};