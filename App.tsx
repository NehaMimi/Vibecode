import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import { ToastContainer } from './components/Toast';
import { User, Subscription, Toast, Category, BillingCycle } from './types';
import { Icons } from './components/icons';

// Mock data for initial state
const MOCK_SUBSCRIPTIONS: Omit<Subscription, 'id' | 'userId' | 'createdAt'>[] = [
    { name: 'Netflix', cost: 649, billingCycle: BillingCycle.MONTHLY, renewalDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), category: Category.STREAMING, notes: 'Family plan', status: 'active' },
    { name: 'Spotify', cost: 119, billingCycle: BillingCycle.MONTHLY, renewalDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(), category: Category.STREAMING, notes: '', status: 'active' },
    { name: 'Figma', cost: 900, billingCycle: BillingCycle.MONTHLY, renewalDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(), category: Category.SAAS, notes: 'Pro plan for design work', status: 'active' },
    { name: 'Gym Membership', cost: 2500, billingCycle: BillingCycle.QUARTERLY, renewalDate: new Date(new Date().setDate(new Date().getDate() + 40)).toISOString(), category: Category.HEALTH, notes: '', status: 'active' },
    { name: 'Amazon Prime', cost: 1499, billingCycle: BillingCycle.YEARLY, renewalDate: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString(), category: Category.ECOMMERCE, notes: 'Includes Prime Video', status: 'inactive' },
];


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Check for logged-in user in localStorage
    const storedUser = localStorage.getItem('subsentry_session');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        loadSubscriptions(parsedUser.id);
    } else {
        setIsLoading(false);
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'error') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const loadSubscriptions = (userId: string) => {
      setIsLoading(true);
      setTimeout(() => { // Simulate API call
          const storedSubs = localStorage.getItem(`subsentry_subs_${userId}`);
          if (storedSubs) {
              setSubscriptions(JSON.parse(storedSubs));
          } else {
              // First time login for this user, seed with mock data
              const initialSubs = MOCK_SUBSCRIPTIONS.map((sub, index) => ({
                  ...sub,
                  id: `sub_${Date.now()}_${index}`,
                  userId,
                  createdAt: new Date().toISOString(),
              }));
              setSubscriptions(initialSubs);
              localStorage.setItem(`subsentry_subs_${userId}`, JSON.stringify(initialSubs));
          }
          setIsLoading(false);
      }, 500);
  };

  const performLogin = (loggedInUser: User) => {
      const sessionUser = { id: loggedInUser.id, email: loggedInUser.email };
      setUser(sessionUser);
      localStorage.setItem('subsentry_session', JSON.stringify(sessionUser));
      loadSubscriptions(loggedInUser.id);
  };
  
  const handleSignup = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setIsAuthLoading(true);
        setTimeout(() => { // Simulate API call
            const usersDb = JSON.parse(localStorage.getItem('subsentry_users_db') || '[]');
            const existingUser = usersDb.find((u: User) => u.email === email);
            if(existingUser) {
                addToast('An account with this email already exists.', 'error');
                setIsAuthLoading(false);
                reject();
                return;
            }
            const newUser: User = { id: `user_${Date.now()}`, email, password };
            usersDb.push(newUser);
            localStorage.setItem('subsentry_users_db', JSON.stringify(usersDb));

            performLogin(newUser);
            addToast('Account created successfully!', 'success');
            setIsAuthLoading(false);
            resolve();
        }, 500);
    });
  };

  const handleLogin = (email: string, password: string): Promise<void> => {
     return new Promise((resolve, reject) => {
        setIsAuthLoading(true);
        setTimeout(() => { // Simulate API call
            const usersDb = JSON.parse(localStorage.getItem('subsentry_users_db') || '[]');
            const existingUser = usersDb.find((u: User) => u.email === email);
            
            if (!existingUser || existingUser.password !== password) {
                addToast('Invalid email or password.', 'error');
                setIsAuthLoading(false);
                reject();
                return;
            }
            
            performLogin(existingUser);
            addToast('Login successful!', 'success');
            setIsAuthLoading(false);
            resolve();
        }, 500);
     });
  };

  const handleLogout = () => {
    setUser(null);
    setSubscriptions([]);
    localStorage.removeItem('subsentry_session');
    addToast('You have been logged out.', 'success');
  };

  const updateSubscriptionsInStateAndStorage = useCallback((newSubs: Subscription[]) => {
      if(user) {
        setSubscriptions(newSubs);
        localStorage.setItem(`subsentry_subs_${user.id}`, JSON.stringify(newSubs));
      }
  }, [user]);

  const handleAddSubscription = (subData: Omit<Subscription, 'id' | 'userId' | 'createdAt'|'status'>) => {
    if (!user) return;
    const newSubscription: Subscription = {
      ...subData,
      id: `sub_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    const updatedSubs = [...subscriptions, newSubscription];
    updateSubscriptionsInStateAndStorage(updatedSubs);
    addToast('Subscription added successfully!', 'success');
  };

  const handleUpdateSubscription = (updatedSub: Subscription) => {
    const updatedSubs = subscriptions.map(s => s.id === updatedSub.id ? updatedSub : s);
    updateSubscriptionsInStateAndStorage(updatedSubs);
    addToast('Subscription updated!', 'success');
  };

  const handleDeleteSubscription = (id: string) => {
    const updatedSubs = subscriptions.filter(s => s.id !== id);
    updateSubscriptionsInStateAndStorage(updatedSubs);
    addToast('Subscription deleted.', 'success');
  };

  if (isLoading && !user) {
      return <div className="min-h-screen bg-base-100 flex items-center justify-center"><Icons.Loader className="w-12 h-12 animate-spin text-brand-primary"/></div>;
  }
  
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {user ? (
        <Dashboard
          user={user}
          subscriptions={subscriptions}
          onLogout={handleLogout}
          onAddSubscription={handleAddSubscription}
          onUpdateSubscription={handleUpdateSubscription}
          onDeleteSubscription={handleDeleteSubscription}
          isLoading={isLoading}
        />
      ) : (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} isLoading={isAuthLoading} />
      )}
    </>
  );
};

export default App;