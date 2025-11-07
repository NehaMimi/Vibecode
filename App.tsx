// Fix: Create the main App component to manage state and render UI.
import React, { useState, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';
import { Subscription, Toast } from './types';

// Mock user type
type User = {
  id: string;
  email: string;
};

function App() {
  // A real app would use a proper auth context/library
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Mock subscriptions data
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'Netflix', price: 15.49, billingCycle: 'monthly', nextPaymentDate: '2024-08-15', category: 'Streaming' },
    { id: '2', name: 'Spotify', price: 9.99, billingCycle: 'monthly', nextPaymentDate: '2024-08-20', category: 'Music' },
    { id: '3', name: 'Adobe Creative Cloud', price: 52.99, billingCycle: 'monthly', nextPaymentDate: '2024-08-01', category: 'Software' },
    { id: '4', name: 'Amazon Prime', price: 139, billingCycle: 'yearly', nextPaymentDate: '2025-01-10', category: 'Shopping' },
  ]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Mock Auth functions
  const handleLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // In a real app, you'd validate credentials here
      if (email && password) {
        setUser({ id: '123', email });
        addToast('Successfully logged in!', 'success');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      addToast('Login failed. Please check your credentials.', 'error');
      throw error; // re-throw to be caught by AuthScreen
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // In a real app, you'd create a new user here
       if (email && password) {
        setUser({ id: '123', email });
        addToast('Account created successfully!', 'success');
      } else {
        throw new Error('Invalid input');
      }
    } catch (error) {
      addToast('Signup failed. Please try again.', 'error');
      throw error; // re-throw to be caught by AuthScreen
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    addToast('You have been logged out.', 'success');
  };

  const handleSaveSubscription = (subscription: Subscription) => {
    setSubscriptions(prev => {
        const index = prev.findIndex(s => s.id === subscription.id);
        if (index > -1) {
            const newSubs = [...prev];
            newSubs[index] = subscription;
            return newSubs;
        }
        return [...prev, subscription];
    });
    addToast(`Subscription "${subscription.name}" saved.`, 'success');
  };

  const handleDeleteSubscription = (id: string) => {
    const subName = subscriptions.find(s => s.id === id)?.name;
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    if (subName) {
      addToast(`Subscription "${subName}" deleted.`, 'success');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {user ? (
        <Dashboard
          userEmail={user.email}
          onLogout={handleLogout}
          subscriptions={subscriptions}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
        />
      ) : (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} isLoading={isLoading} />
      )}
    </>
  );
}

export default App;
