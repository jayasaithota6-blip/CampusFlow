import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title: string; message?: string; type?: ToastType; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      title,
      message,
      type = 'info',
      duration = 4000,
    }: {
      title: string;
      message?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: Toast = { id, title, message, type, duration };
      
      // Schedule toast addition to prevent "Cannot update a component while rendering another component"
      setTimeout(() => {
        setToasts((prev) => [...prev, newToast]);
      }, 0);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration + 10);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ title, message, type: 'success' }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ title, message, type: 'error' }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ title, message, type: 'info' }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ title, message, type: 'warning' }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex max-w-md w-full flex-col gap-2 pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-100'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-100'
                : 'bg-white border-neutral-200 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
              {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold">{t.title}</div>
              {t.message && <div className="mt-1 text-xs opacity-90">{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
