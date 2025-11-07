

import React, { useState, useEffect } from 'react';
import { Subscription, Category, BillingCycle } from '../types';
import { CATEGORIES, BILLING_CYCLES } from '../constants';
import { Icons } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Partial<Subscription>) => void;
  subscriptionToEdit: Subscription | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSave, subscriptionToEdit }) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState<Category>(Category.STREAMING);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setCost(subscriptionToEdit.cost.toString());
      setBillingCycle(subscriptionToEdit.billingCycle);
      setRenewalDate(subscriptionToEdit.renewalDate.split('T')[0]);
      setCategory(subscriptionToEdit.category);
      setNotes(subscriptionToEdit.notes);
      setStatus(subscriptionToEdit.status);
    } else {
      // Reset form
      setName('');
      setCost('');
      setBillingCycle(BillingCycle.MONTHLY);
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      setRenewalDate(today.toISOString().split('T')[0]);
      setCategory(Category.STREAMING);
      setNotes('');
      setStatus('active');
    }
     setError('');
  }, [subscriptionToEdit, isOpen]);

  const handleSave = () => {
    if (!name || !cost || !renewalDate) {
      setError('Name, Cost, and Renewal Date are required.');
      return;
    }
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setError('Please enter a valid positive cost.');
      return;
    }
    setError('');
    
    const payload: Partial<Subscription> = { name, cost: costValue, billingCycle, renewalDate, category, notes };
    if (subscriptionToEdit) {
        payload.status = status;
    }
    onSave(payload);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-200 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-content-100">{subscriptionToEdit ? 'Edit Subscription' : 'Add Subscription'}</h2>
            <button onClick={onClose} className="text-content-200 hover:text-white">
              <Icons.X size={24} />
            </button>
          </div>
          
          {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4">{error}</div>}

          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-content-200 mb-1">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Netflix Premium" className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-content-200 mb-1">Cost (₹)</label>
                      <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g., 649" className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-content-200 mb-1">Billing Cycle</label>
                      <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)} className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          {BILLING_CYCLES.map(bc => <option key={bc} value={bc}>{bc}</option>)}
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-content-200 mb-1">Next Renewal Date</label>
                      <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-content-200 mb-1">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary">
                           {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                  </div>
              </div>
               {subscriptionToEdit && (
                    <div>
                        <label className="block text-sm font-medium text-content-200 mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                )}
              <div>
                  <label className="block text-sm font-medium text-content-200 mb-1">Notes (Optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Shared with family" rows={3} className="w-full bg-base-300 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"></textarea>
              </div>
          </div>
        </div>
        <div className="bg-base-300 px-6 py-4 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-semibold transition">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition">Save Subscription</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;