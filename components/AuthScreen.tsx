import React, { useState } from 'react';
import { Icons } from './icons';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        await onSignup(email, password);
      } else {
        await onLogin(email, password);
      }
    } catch {
      // Error is handled by toast in App.tsx, but we stop loading
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = authMode === 'login';

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto p-8 bg-base-200 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">
          SubSentry
        </h1>
        <p className="text-content-200 text-center mb-8">
          {isLogin ? 'Sign in to manage your subscriptions.' : 'Create your account to start.'}
        </p>
        <div className="space-y-4">
          {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-center">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="password"
              className="block text-sm font-medium text-content-200 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {!isLogin && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-content-200 mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-base-300 rounded-md p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {isLoading ? <Icons.Loader className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </div>
        <p className="text-center text-sm text-content-200 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={handleToggleMode} className="font-semibold text-brand-secondary hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
         <p className="text-center text-xs text-base-300 mt-8">
            Made for India | Kolkata
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
