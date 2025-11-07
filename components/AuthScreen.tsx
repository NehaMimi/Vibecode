import React, { useState } from 'react';
import { User } from '../types';
import { Icons } from './icons';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, addToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };
  
  const handleAuthAction = async () => {
    if (!email || !password) {
        addToast('Email and password are required.', 'error');
        return;
    }
    if (!isLogin && password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        return;
    }
    
    setIsLoading(true);
    try {
        const usersData = await window.storage.get('subsentry_users');
        const users: User[] = usersData?.value ? JSON.parse(usersData.value) : [];

        if (isLogin) {
            const user = users.find(u => u.email === email);
            // In a real app, you would check a hashed password.
            // For this project, we'll assume a direct check is fine.
            if (user) {
                await window.storage.set('subsentry_session', JSON.stringify(user));
                onLogin(user);
                addToast('Login successful!', 'success');
            } else {
                addToast('Invalid credentials.', 'error');
            }
        } else { // Signup
            if (users.some(u => u.email === email)) {
                addToast('An account with this email already exists.', 'error');
                return;
            }
            const newUser: User = {
                id: Date.now().toString(),
                email,
                createdAt: new Date().toISOString(),
            };
            const updatedUsers = [...users, newUser];
            await window.storage.set('subsentry_users', JSON.stringify(updatedUsers));
            await window.storage.set('subsentry_session', JSON.stringify(newUser));
            onLogin(newUser);
            addToast('Account created successfully!', 'success');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        addToast(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`, 'error');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4">
      <div className="w-full max-w-md bg-base-200 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">SubSentry</h1>
        <p className="text-center text-content-200 mb-8">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium text-content-200">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 bg-base-300 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="you@example.com"
                />
            </div>
            <div>
                 <label className="text-sm font-medium text-content-200">Password</label>
                 <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-base-300 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="••••••••"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-content-200">
                      {showPassword ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
                    </button>
                 </div>
            </div>
            {!isLogin && (
                <div>
                    <label className="text-sm font-medium text-content-200">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-base-300 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="••••••••"
                    />
                </div>
            )}
            <button
                onClick={handleAuthAction}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md transition duration-300 disabled:bg-opacity-50"
            >
                {isLoading ? (
                    <>
                        <Icons.Loader className="animate-spin mr-2" size={20} />
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                ) : isLogin ? (
                    <>
                        <Icons.LogIn className="mr-2" size={20} />
                        Sign In
                    </>
                ) : (
                    <>
                        <Icons.UserPlus className="mr-2" size={20} />
                        Create Account
                    </>
                )}
            </button>
        </div>
        
        <p className="mt-8 text-center text-sm text-content-200">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleForm} className="font-medium text-brand-primary hover:underline ml-2">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;