import React, { useState, useMemo } from 'react';
import { User, Subscription, Alert, SortOption, Category } from '../types';
import { BillingCycle } from '../types';
import SubscriptionModal from './SubscriptionModal';
import { Icons } from './icons';
import { CATEGORIES, CATEGORY_COLORS, SORT_OPTIONS } from '../constants';

// --- PROPS INTERFACE ---
interface DashboardProps {
  user: User;
  subscriptions: Subscription[];
  onLogout: () => void;
  onAddSubscription: (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt'|'status'>) => void;
  onUpdateSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  isLoading: boolean;
}

// --- HELPER FUNCTIONS ---
const calculateDaysUntilRenewal = (renewalDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(renewalDate);
    renewal.setHours(0, 0, 0, 0);
    if (renewal < today) return -1; // Past due
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
};

// --- SUB-COMPONENTS ---
const Header: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => (
    <header className="bg-base-200 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-brand-primary">SubSentry</h1>
        <div className="flex items-center space-x-4">
            <span className="text-content-200 hidden sm:block">{user.email}</span>
            <button onClick={onLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                <Icons.LogOut size={18} className="mr-2" />
                Logout
            </button>
        </div>
    </header>
);

const SummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-brand-primary p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-content-200 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AlertsSection: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
    if (alerts.length === 0) return null;
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Icons.AlertTriangle className="mr-2 text-yellow-400"/>Renewal Alerts</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.level === 'red' ? 'border-alert-red bg-red-900/20' : 'border-alert-amber bg-yellow-900/20'}`}>
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-bold">{alert.name}</p>
                                <p className="text-sm text-content-200">{formatCurrency(alert.cost)} / {alert.billingCycle}</p>
                           </div>
                           <p className={`font-bold text-lg ${alert.level === 'red' ? 'text-alert-red' : 'text-alert-amber'}`}>
                                {alert.daysUntilRenewal <= 0 ? 'Due Today' : `${alert.daysUntilRenewal} day${alert.daysUntilRenewal > 1 ? 's' : ''}`}
                           </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryBreakdown: React.FC<{ subscriptions: Subscription[] }> = ({ subscriptions }) => {
    const breakdown = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === 'active');
        // Fix: Explicitly type the accumulator for the reduce function to ensure correct type inference for categoryTotals.
        const categoryTotals = activeSubs.reduce<Record<Category, number>>((acc, sub) => {
            const monthlyCost = sub.billingCycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.billingCycle === BillingCycle.QUARTERLY ? sub.cost / 3 : sub.cost;
            acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
            return acc;
        }, {} as Record<Category, number>);
        
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category: category as Category,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [subscriptions]);

    if(subscriptions.length === 0) return null;

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Category Spending (Monthly)</h3>
            <div className="space-y-4">
                {breakdown.length > 0 ? breakdown.map(({ category, amount, percentage }) => (
                    <div key={category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{category}</span>
                            <span>{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div className={`${CATEGORY_COLORS[category]} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                )) : <p className="text-content-200 text-center">No active subscriptions to analyze.</p>}
            </div>
        </div>
    );
};


const SubscriptionCard: React.FC<{ sub: Subscription; onEdit: (sub: Subscription) => void; onDelete: (sub: Subscription) => void }> = ({ sub, onEdit, onDelete }) => (
    <div className="bg-base-200 p-5 rounded-lg shadow-lg flex flex-col justify-between transition-transform hover:scale-105">
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold mb-2">{sub.name}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[sub.category]}`}>{sub.category}</span>
            </div>
            <p className="text-3xl font-bold text-brand-primary my-3">{formatCurrency(sub.cost)} <span className="text-base font-normal text-content-200">/ {sub.billingCycle}</span></p>
            <p className="text-sm text-content-200 flex items-center mb-2"><Icons.Calendar size={14} className="mr-2"/>Next renewal: {new Date(sub.renewalDate).toLocaleDateString()}</p>
            {sub.notes && <p className="text-sm bg-base-300 p-2 rounded mt-2 text-content-200 break-words">{sub.notes}</p>}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
            <button onClick={() => onEdit(sub)} className="p-2 text-blue-400 hover:text-blue-300"><Icons.Edit size={20} /></button>
            <button onClick={() => onDelete(sub)} className="p-2 text-red-500 hover:text-red-400"><Icons.Trash2 size={20} /></button>
        </div>
    </div>
);

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center py-16 px-6 bg-base-200 rounded-lg">
        <Icons.Info size={48} className="mx-auto text-content-200 mb-4" />
        <h3 className="text-xl font-bold">No Subscriptions Yet</h3>
        <p className="text-content-200 mt-2 mb-6">Get started by adding your first subscription.</p>
        <button onClick={onAdd} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <Icons.PlusCircle size={20} className="mr-2" />
            Add Subscription
        </button>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC<DashboardProps> = ({ user, subscriptions, onLogout, onAddSubscription, onUpdateSubscription, onDeleteSubscription, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('renewalDate_asc');
  
  // --- MEMOIZED CALCULATIONS ---
  const { monthlyTotal, annualTotal, alerts, activeSubscriptions } = useMemo(() => {
      const activeSubs = subscriptions.filter(s => s.status === 'active');
      let monthly = 0;
      let annual = 0;
      const renewalAlerts: Alert[] = [];

      activeSubs.forEach(sub => {
          const daysUntil = calculateDaysUntilRenewal(sub.renewalDate);
          if (daysUntil >= 0 && daysUntil <= 30) {
              renewalAlerts.push({ ...sub, daysUntilRenewal: daysUntil, level: daysUntil <= 7 ? 'red' : 'amber' });
          }

          if (sub.billingCycle === BillingCycle.MONTHLY) {
              monthly += sub.cost;
              annual += sub.cost * 12;
          } else if (sub.billingCycle === BillingCycle.QUARTERLY) {
              monthly += sub.cost / 3;
              annual += sub.cost * 4;
          } else if (sub.billingCycle === BillingCycle.YEARLY) {
              monthly += sub.cost / 12;
              annual += sub.cost;
          }
      });
      renewalAlerts.sort((a,b) => a.daysUntilRenewal - b.daysUntilRenewal);
      return { monthlyTotal: monthly, annualTotal: annual, alerts: renewalAlerts, activeSubscriptions: activeSubs };
  }, [subscriptions]);

  const filteredAndSortedSubscriptions = useMemo(() => {
    let subs = [...subscriptions];
    if (categoryFilter !== 'all') {
      subs = subs.filter(sub => sub.category === categoryFilter);
    }

    return subs.sort((a, b) => {
      switch (sortOption) {
        case 'renewalDate_asc':
          return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
        case 'cost_desc':
          return b.cost - a.cost;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'category_asc':
          return a.category.localeCompare(b.category);
        case 'category_desc':
          return b.category.localeCompare(a.category);
        default:
          return 0;
      }
    });
  }, [subscriptions, categoryFilter, sortOption]);

  // --- HANDLERS ---
  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleDelete = (sub: Subscription) => {
      if (window.confirm(`Are you sure you want to delete "${sub.name}"? This action cannot be undone.`)) {
          onDeleteSubscription(sub.id);
      }
  };

  const handleSaveSubscription = (subData: any) => {
    if(editingSubscription){
        onUpdateSubscription({ ...editingSubscription, ...subData });
    } else {
        onAddSubscription(subData);
    }
    setIsModalOpen(false);
  };
  
  // --- RENDER ---
  return (
    <div>
        <Header user={user} onLogout={onLogout} />
        
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Monthly Total" value={formatCurrency(monthlyTotal)} icon={<Icons.Wallet size={24} color="white"/>} />
                <SummaryCard title="Annual Total" value={formatCurrency(annualTotal)} icon={<Icons.Calendar size={24} color="white"/>} />
                <SummaryCard title="Renewal Alerts" value={alerts.length.toString()} icon={<Icons.Bell size={24} color="white"/>} />
            </div>

            <AlertsSection alerts={alerts} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold">Your Subscriptions</h2>
                    <div className="flex items-center gap-4">
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as Category | 'all')} className="bg-base-200 border border-base-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            <option value="all">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="bg-base-200 border border-base-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                         <button onClick={handleAddNew} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold p-2.5 rounded-full inline-flex items-center">
                            <Icons.PlusCircle size={24} />
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Icons.Loader className="w-12 h-12 animate-spin text-brand-primary"/></div>
                ) : filteredAndSortedSubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAndSortedSubscriptions.map(sub => (
                           <SubscriptionCard key={sub.id} sub={sub} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <EmptyState onAdd={handleAddNew} />
                )}
              </div>
              <div className="lg:col-span-1">
                  <CategoryBreakdown subscriptions={activeSubscriptions} />
              </div>
            </div>
        </main>

        <SubscriptionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveSubscription}
            subscriptionToEdit={editingSubscription}
        />
    </div>
  );
};

export default Dashboard;