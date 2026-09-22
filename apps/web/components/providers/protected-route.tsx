'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Spinner } from '@/components/ui/feedback';

/** Rutas protegidas: sin sesión → /login. Mientras SwR valida, skeleton. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="gw-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner label="loading session" />
      </div>
    );
  }
  return <>{children}</>;
}