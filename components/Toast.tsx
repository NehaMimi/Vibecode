
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
    <div className={`${bgColor} text-white p-4 rounded-md shadow-lg flex items-center space-x-3 animate-fade-in-down`}>
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
