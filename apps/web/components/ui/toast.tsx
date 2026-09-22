'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { uid } from '@/lib/utils';

export interface ToastInput {
  message: string;
  tone?: 'default' | 'danger';
}

interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue>({ push: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = uid('toast');
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', inset: 'auto 24px 24px auto', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 50 }}>
        {toasts.map((t) => (
          <div key={t.id} role="status" className="gw-toast" style={t.tone === 'danger' ? { borderColor: 'var(--sat-core)' } : undefined}>
            {t.message}
            <button
              type="button"
              aria-label="close"
              onClick={() => dismiss(t.id)}
              style={{ marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}