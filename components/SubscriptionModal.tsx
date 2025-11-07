import React, { useState, useEffect } from 'react';
import { Subscription, Currency } from '../types';
import { CATEGORIES, CURRENCIES } from '../constants';
import { Icons } from './icons';

type SubscriptionFormData = Omit<Subscription, 'id' | 'userId' | 'costInINR'>;

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: SubscriptionFormData & { id?: string }) => void;
  subscription: Subscription | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscription,
}) => {
  const getInitialFormData = (): SubscriptionFormData => ({
    name: '',
    cost: 0,
    currency: 'INR',
    billingCycle: 'monthly',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    category: CATEGORIES[0],
  });

  const [formData, setFormData] = useState<SubscriptionFormData>(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      if (subscription) {
        setFormData({
          name: subscription.name,
          cost: subscription.cost,
          currency: subscription.currency,
          billingCycle: subscription.billingCycle,
          nextPaymentDate: subscription.nextPaymentDate || new Date().toISOString().split('T')[0],
          category: subscription.category,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [subscription, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    const dataToSave = {
      ...formData,
      id: subscription?.id,
      nextPaymentDate: formData.billingCycle === 'one-time' ? null : formData.nextPaymentDate
    };
    onSave(dataToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
      <div className="bg-base-200 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{subscription ? 'Edit' : 'Add'} Subscription</h2>
          <button onClick={onClose} className="text-content-200 hover:text-content-100">
            <Icons.X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-content-200">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Netflix, Hotstar"
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-grow">
              <label htmlFor="cost" className="block text-sm font-medium mb-1 text-content-200">Cost</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="w-1/3">
              <label htmlFor="currency" className="block text-sm font-medium mb-1 text-content-200">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary h-[46px]"
              >
                {Object.keys(CURRENCIES).map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
          </div>
           <div>
            <label htmlFor="billingCycle" className="block text-sm font-medium mb-1 text-content-200">Billing Cycle</label>
            <select
              id="billingCycle"
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
          {formData.billingCycle !== 'one-time' && (
            <div>
              <label htmlFor="nextPaymentDate" className="block text-sm font-medium mb-1 text-content-200">Next Payment Date</label>
              <input
                type="date"
                id="nextPaymentDate"
                name="nextPaymentDate"
                value={formData.nextPaymentDate || ''}
                onChange={handleChange}
                className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}
           <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1 text-content-200">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 hover:bg-opacity-80">Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary text-white font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
