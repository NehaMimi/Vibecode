import React, { useEffect } from 'react';
import { Toast } from '../types';
import { Icons } from './icons';

interface ToastProps {
  toast: Toast;
  removeToast: (id: number) => void;
}

const ToastMessage: React.FC<ToastProps> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, removeToast]);

  const isSuccess = toast.type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  const Icon = isSuccess ? Icons.CheckCircle : Icons.XCircle;

  return (
    <div className={`${bgColor} text-white p-4 rounded-md shadow-lg flex items-center space-x-3 transition-all duration-300 animate-fade-in-down`}>
      <Icon size={24} />
      <span className="flex-grow">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="text-white hover:opacity-75">
        <Icons.X size={20} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-xs">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

// Simple animation keyframe definition in tailwind.config or a global CSS file
// For this environment, we can assume it's available or add it to index.html style tag if needed.
// @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
// .animate-fade-in-down { animation: fade-in-down 0.3s ease-out; }
// To avoid needing a CSS file, we can add this to the tailwind config extend theme.
// However, adding a class to the element is enough here since tailwind recognizes animation classes.
