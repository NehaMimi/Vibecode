// Fix: Create the Dashboard component to display user data post-login.
import React, { useState } from 'react';
import { Subscription } from '../types';
import SubscriptionModal from './SubscriptionModal';
import { Icons } from './icons';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userEmail,
  onLogout,
  subscriptions,
  onSave,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };
  
  const handleSave = (subscriptionData: Omit<Subscription, 'id'>) => {
    const subscriptionToSave: Subscription = {
      id: editingSubscription?.id || new Date().toISOString(), // Use existing id or generate new one
      ...subscriptionData,
    };
    onSave(subscriptionToSave);
    handleCloseModal();
  };

  const totalMonthlyCost = subscriptions
    .reduce((acc, sub) => {
      if (sub.billingCycle === 'monthly') {
        return acc + sub.price;
      }
      if (sub.billingCycle === 'yearly') {
        return acc + sub.price / 12;
      }
      return acc;
    }, 0)
    .toFixed(2);
    
  return (
    <div className="min-h-screen bg-base-100 text-content-100">
      <header className="bg-base-200 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-brand-primary">SubSentry</h1>
        <div className="flex items-center space-x-4">
          <span>{userEmail}</span>
          <button
            onClick={onLogout}
            className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Your Subscriptions</h2>
            <button
              onClick={handleAddNew}
              className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center space-x-2"
            >
              <Icons.Plus size={20}/>
              <span>Add New</span>
            </button>
          </div>
          
          <div className="bg-base-200 p-4 rounded-lg mb-6 text-center">
            <p className="text-lg">Total Monthly Cost: <span className="font-bold text-2xl text-brand-primary">${totalMonthlyCost}</span></p>
          </div>

          <div className="space-y-4">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-base-200 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{sub.name}</h3>
                    <p className="text-sm text-content-200">{sub.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">${sub.price.toFixed(2)} / {sub.billingCycle === 'one-time' ? 'once' : sub.billingCycle.slice(0, -2)}</p>
                    {sub.nextPaymentDate && <p className="text-sm text-content-200">Next payment: {new Date(sub.nextPaymentDate).toLocaleDateString()}</p>}
                  </div>
                   <div className="flex items-center space-x-2 flex-shrink-0">
                      <button onClick={() => handleEdit(sub)} className="p-2 hover:bg-base-300 rounded-full"><Icons.Edit /></button>
                      <button onClick={() => onDelete(sub.id)} className="p-2 hover:bg-base-300 rounded-full text-red-500"><Icons.X /></button>
                    </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-base-200 rounded-lg">
                <p>No subscriptions yet. Add your first one!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          subscription={editingSubscription}
        />
      )}
    </div>
  );
};

export default Dashboard;
