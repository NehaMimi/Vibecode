// Dashboard.tsx
import React, { useState, useMemo } from 'react';
import { Subscription } from '../types';
import SubscriptionModal from './SubscriptionModal';
import { Icons } from './icons';
import { CURRENCIES } from '../constants';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  subscriptions: Subscription[];
  onSave: (subscriptionData: Omit<Subscription, 'id' | 'userId' | 'costInINR'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const getDaysUntil = (dateString: string | null): number => {
    if (!dateString) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewalDate = new Date(dateString);
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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

  const totalMonthlyCost = useMemo(() => subscriptions
    .reduce((acc, sub) => {
      if (sub.billingCycle === 'monthly') {
        return acc + sub.costInINR;
      }
      if (sub.billingCycle === 'yearly') {
        return acc + sub.costInINR / 12;
      }
      return acc;
    }, 0)
    .toFixed(2), [subscriptions]);
    
  const renewalAlerts = useMemo(() => {
    return subscriptions
        .map(sub => ({ ...sub, daysUntil: getDaysUntil(sub.nextPaymentDate) }))
        .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-base-100 text-content-100">
      <header className="bg-base-200 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-brand-primary">SubSentry</h1>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">{userEmail}</span>
          <button
            onClick={onLogout}
            title="Logout"
            className="bg-base-300 hover:bg-brand-primary text-white font-bold p-2 rounded-md transition duration-300"
          >
            <Icons.LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold">Your Subscriptions</h2>
            <button
              onClick={handleAddNew}
              className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2"
            >
              <Icons.Plus size={20}/>
              <span>Add Subscription</span>
            </button>
          </div>
          
          <div className="bg-base-200 p-4 rounded-lg mb-6 text-center">
            <p className="text-lg text-content-200">Total Monthly Cost</p>
            <span className="font-bold text-3xl text-brand-primary">₹{totalMonthlyCost}</span>
          </div>

          {renewalAlerts.length > 0 && (
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Icons.AlertTriangle className="text-alert-amber" />
                    Upcoming Renewals
                </h3>
                <div className="bg-base-200 p-4 rounded-lg space-y-2">
                    {renewalAlerts.map(alert => (
                        <div key={alert.id} className={`p-2 rounded flex justify-between items-center ${alert.daysUntil <= 7 ? 'bg-alert-red/20' : 'bg-alert-amber/20'}`}>
                           <div>
                             <span className="font-bold">{alert.name}</span>
                             <span className="text-sm text-content-200 ml-2">({alert.category})</span>
                           </div>
                           <span className={`font-semibold ${alert.daysUntil <= 7 ? 'text-alert-red' : 'text-alert-amber'}`}>
                                In {alert.daysUntil} day{alert.daysUntil !== 1 && 's'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          )}


          <div className="space-y-4">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-base-200 p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{sub.name}</h3>
                    <p className="text-sm text-content-200">{sub.category}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-bold text-lg">{CURRENCIES[sub.currency].symbol}{sub.cost.toFixed(2)}
                      {sub.currency !== 'INR' && <span className="text-sm font-normal text-content-200"> (≈ ₹{sub.costInINR.toFixed(2)})</span>}
                      <span className="text-base font-normal"> / {sub.billingCycle === 'one-time' ? 'once' : sub.billingCycle.slice(0, -2)}</span>
                    </p>
                    {sub.nextPaymentDate && <p className="text-sm text-content-200">Next payment: {new Date(sub.nextPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>}
                  </div>
                   <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                      <button onClick={() => handleEdit(sub)} title="Edit" className="p-2 hover:bg-base-300 rounded-full"><Icons.Edit size={18} /></button>
                      <button onClick={() => onDelete(sub.id)} title="Delete" className="p-2 hover:bg-base-300 rounded-full text-red-500"><Icons.X size={18}/></button>
                    </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-base-200 rounded-lg">
                <p className="text-lg text-content-200">No subscriptions yet.</p>
                <p>Click "Add Subscription" to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={onSave}
          subscription={editingSubscription}
        />
      )}
    </div>
  );
};

export default Dashboard;
