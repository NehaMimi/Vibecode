

import React, { useState, useEffect, useCallback } from 'react';
import { User, Subscription, Toast } from './types';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';
import { Icons } from './components/icons';

// Mock window.storage for environments where it's not available
if (typeof window.storage === 'undefined') {
  console.warn("window.storage is not available. Using localStorage mock.");
  window.storage = {
    get: async (key: string) => {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
      return { value };
    },
    delete: async (key: string) => {
      localStorage.removeItem(key);
    },
  };
}


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    setToasts((prevToasts) => [...prevToasts, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionData = await window.storage.get('subsentry_session');
      if (sessionData && sessionData.value) {
        const user = JSON.parse(sessionData.value);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      addToast('Failed to load session.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);
  
  const fetchSubscriptions = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const subsData = await window.storage.get(`subs_${userId}`);
      if (subsData && subsData.value) {
        setSubscriptions(JSON.parse(subsData.value));
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      addToast('Failed to load subscriptions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);


  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptions(currentUser.id);
    } else {
      setSubscriptions([]);
    }
  }, [currentUser, fetchSubscriptions]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await window.storage.delete('subsentry_session');
        setCurrentUser(null);
        setSubscriptions([]);
        addToast('Logged out successfully.', 'success');
      } catch (error) {
        console.error('Logout failed:', error);
        addToast('Logout failed. Please try again.', 'error');
      }
    }
  };
  
  const saveSubscriptions = async (userId: string, newSubscriptions: Subscription[]) => {
      try {
          await window.storage.set(`subs_${userId}`, JSON.stringify(newSubscriptions));
          setSubscriptions(newSubscriptions);
      } catch (error) {
          console.error('Failed to save subscriptions:', error);
          addToast('Could not save your changes.', 'error');
          // Optionally revert state
          fetchSubscriptions(userId);
      }
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now().toString(),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    const updatedSubscriptions = [...subscriptions, newSubscription];
    await saveSubscriptions(currentUser.id, updatedSubscriptions);
    addToast('Subscription added successfully!', 'success');
  };

  const handleUpdateSubscription = async (updatedSubscription: Subscription) => {
    if (!currentUser) return;
    const updatedSubscriptions = subscriptions.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub);
    await saveSubscriptions(currentUser.id, updatedSubscriptions);
    addToast('Subscription updated successfully!', 'success');
  };
  
  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!currentUser) return;
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
    await saveSubscriptions(currentUser.id, updatedSubscriptions);
    addToast('Subscription deleted.', 'success');
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <Icons.Loader className="w-12 h-12 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-base-100">
        {currentUser ? (
          <Dashboard 
            user={currentUser}
            subscriptions={subscriptions}
            onLogout={handleLogout}
            onAddSubscription={handleAddSubscription}
            onUpdateSubscription={handleUpdateSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            isLoading={isLoading}
          />
        ) : (
          <AuthScreen onLogin={setCurrentUser} addToast={addToast} />
        )}
        <footer className="text-center py-4 text-sm text-gray-500">
          Made for India | Kolkata
        </footer>
      </div>
    </>
  );
};

export default App;