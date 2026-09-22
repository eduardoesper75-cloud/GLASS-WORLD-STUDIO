'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { api } from '@/lib/api';
import type { LoginInput, PublicUser, RegisterInput } from '@/lib/types';

interface SessionBody {
  user: PublicUser | null;
}

async function sessionFetcher(): Promise<PublicUser | null> {
  const body = await api.get<SessionBody>('/api/auth/session', { viaGateway: false });
  return body.user;
}

export function useAuth() {
  const { data: user, isLoading, error, mutate } = useSWR<PublicUser | null>('session', sessionFetcher, {
    revalidateOnFocus: false,
  });

  const register = useCallback(
    async (input: RegisterInput): Promise<PublicUser> => {
      const body = await api.post<{ user: PublicUser }>('/api/auth/register', input, { viaGateway: false });
      await mutate(body.user, false);
      await globalMutate('session', body.user, false);
      return body.user;
    },
    [mutate],
  );

  const login = useCallback(
    async (input: LoginInput): Promise<PublicUser> => {
      const body = await api.post<{ user: PublicUser }>('/api/auth/login', input, { viaGateway: false });
      await mutate(body.user, false);
      await globalMutate('session', body.user, false);
      return body.user;
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout', undefined, { viaGateway: false });
    await globalMutate('session', null, false);
    await mutate(null, false);
  }, [mutate]);

  return { user, loading: isLoading, error, register, login, logout };
}