'use client';

import type { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { SWRProvider } from '@/components/providers/swr';
import { ToastProvider } from '@/components/ui/toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SWRProvider>
        <ToastProvider>{children}</ToastProvider>
      </SWRProvider>
    </LocaleProvider>
  );
}