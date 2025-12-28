'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import type { ExtendedSession } from '@/lib/auth';

/**
 * Syncs the NextAuth session token with the API client
 * Must be placed inside SessionProvider
 */
export function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    const extendedSession = session as ExtendedSession | null;
    api.setToken(extendedSession?.accessToken || null);
  }, [session]);

  return <>{children}</>;
}

