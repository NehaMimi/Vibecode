// Fix: Create the SubscriptionModal component for adding/editing subscriptions.
import React, { useState, useEffect } from 'react';
import { Subscription, SubscriptionFormData } from '../types';
import { CATEGORIES } from '../constants';
import { Icons } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: SubscriptionFormData) => void;
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
    price: 0,
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
          price: subscription.price,
          billingCycle: subscription.billingCycle,
          nextPaymentDate: subscription.nextPaymentDate || new Date().toISOString().split('T')[0],
          category: subscription.category,
        });
      } else {
        // Reset form for new entry
        setFormData(getInitialFormData());
      }
    }
  }, [subscription, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        nextPaymentDate: formData.billingCycle === 'one-time' ? null : formData.nextPaymentDate
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{subscription ? 'Edit' : 'Add'} Subscription</h2>
          <button onClick={onClose} className="text-content-200 hover:text-content-100">
            <Icons.X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-content-200">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium mb-1 text-content-200">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
           <div className="mb-4">
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
            <div className="mb-4">
              <label htmlFor="nextPaymentDate" className="block text-sm font-medium mb-1 text-content-200">Next Payment Date</label>
              <input
                type="date"
                id="nextPaymentDate"
                name="nextPaymentDate"
                value={formData.nextPaymentDate || ''}
                onChange={handleChange}
                required
                className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}
           <div className="mb-6">
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
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 hover:bg-opacity-80">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary text-white font-bold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;
