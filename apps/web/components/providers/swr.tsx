'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60_000,
        errorRetryCount: 1,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}