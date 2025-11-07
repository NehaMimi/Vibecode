// App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ToastContainer } from './components/Toast';
import { Subscription, Toast, User, Currency } from './types';
import { CONVERSION_RATES } from './constants';
import { Icons } from './components/icons';

// --- START FIX ---
// Polyfill for window.storage if it doesn't exist.
// This is crucial for running the app in a standard browser environment
// where `window.storage` is not natively available. It mocks the expected
// async API using the synchronous localStorage.
if (!window.storage) {
  console.warn('`window.storage` is not available. Mocking with localStorage for development.');
  window.storage = {
    get: async (key: string) => {
      const value = localStorage.getItem(key);
      // The API is expected to return an object with a `value` property, or null if the key doesn't exist.
      return Promise.resolve(value !== null ? { value } : null);
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
      return Promise.resolve();
    },
    delete: async (key: string) => {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
  };
}
// --- END FIX ---


// A simple (and insecure) way to "hash" a password for the demo.
// A real app should use a robust library like bcrypt.
const fakeHash = (s: string) => `hashed_${s}_hashed`;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check session
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Check for active session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResult = await window.storage.get('subsentry_session');
        if (sessionResult && sessionResult.value) {
          const email = sessionResult.value;
          const usersResult = await window.storage.get('subsentry_users');
          const users: User[] = usersResult?.value ? JSON.parse(usersResult.value) : [];
          const currentUser = users.find(u => u.email === email);
          
          if (currentUser) {
            setUser(currentUser);
            // Load user's subscriptions
            const subsResult = await window.storage.get(`subsentry_subs_${currentUser.id}`);
            const userSubs: Subscription[] = subsResult?.value ? JSON.parse(subsResult.value) : [];
            setSubscriptions(userSubs);
          }
        }
      } catch (e) {
        console.error("Failed to check session:", e);
        addToast("Could not verify session.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [addToast]);
  
  const handleLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const usersResult = await window.storage.get('subsentry_users');
      const users: User[] = usersResult?.value ? JSON.parse(usersResult.value) : [];
      const foundUser = users.find(u => u.email === email);

      if (foundUser && foundUser.passwordHash === fakeHash(password)) {
        setUser(foundUser);
        await window.storage.set('subsentry_session', foundUser.email);
        
        // Load subscriptions for the logged-in user
        const subsResult = await window.storage.get(`subsentry_subs_${foundUser.id}`);
        setSubscriptions(subsResult?.value ? JSON.parse(subsResult.value) : []);
        
        addToast('Successfully logged in!', 'success');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      addToast('Login failed. Please check your credentials.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const usersResult = await window.storage.get('subsentry_users');
      let users: User[] = usersResult?.value ? JSON.parse(usersResult.value) : [];
      
      if (users.some(u => u.email === email)) {
        throw new Error('An account with this email already exists.');
      }
      
      const newUser: User = {
        id: new Date().toISOString(),
        email,
        passwordHash: fakeHash(password),
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      await window.storage.set('subsentry_users', JSON.stringify(users));
      
      setUser(newUser);
      setSubscriptions([]); // New user starts with no subscriptions
      await window.storage.set('subsentry_session', newUser.email);
      addToast('Account created successfully!', 'success');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      addToast(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await window.storage.delete('subsentry_session');
        setUser(null);
        setSubscriptions([]);
        addToast('You have been logged out.', 'success');
      } catch (e) {
        addToast('Logout failed.', 'error');
      }
    }
  };

  const handleSaveSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'userId' | 'costInINR'> & { id?: string }) => {
    if (!user) return;

    const costInINR = subscriptionData.currency === 'INR' 
      ? subscriptionData.cost 
      : subscriptionData.cost * (CONVERSION_RATES[subscriptionData.currency as Exclude<Currency, 'INR'>] || 1);

    const subscriptionToSave: Subscription = {
      id: subscriptionData.id || new Date().toISOString(),
      userId: user.id,
      ...subscriptionData,
      costInINR: parseFloat(costInINR.toFixed(2)),
    };
    
    const newSubscriptions = [...subscriptions];
    const index = newSubscriptions.findIndex(s => s.id === subscriptionToSave.id);

    if (index > -1) {
      newSubscriptions[index] = subscriptionToSave;
    } else {
      newSubscriptions.push(subscriptionToSave);
    }

    try {
      await window.storage.set(`subsentry_subs_${user.id}`, JSON.stringify(newSubscriptions));
      setSubscriptions(newSubscriptions);
      addToast(`Subscription "${subscriptionToSave.name}" saved.`, 'success');
    } catch(e) {
      addToast(`Failed to save subscription.`, 'error');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
     if (!user) return;
    const subToDelete = subscriptions.find(s => s.id === id);
    if (!subToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${subToDelete.name}"?`)) {
      const newSubscriptions = subscriptions.filter(s => s.id !== id);
      try {
        await window.storage.set(`subsentry_subs_${user.id}`, JSON.stringify(newSubscriptions));
        setSubscriptions(newSubscriptions);
        addToast(`Subscription "${subToDelete.name}" deleted.`, 'success');
      } catch(e) {
        addToast(`Failed to delete subscription.`, 'error');
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <Icons.Loader className="w-12 h-12 text-brand-primary" />
      </div>
    );
  }

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
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
      )}
    </>
  );
}

export default App;