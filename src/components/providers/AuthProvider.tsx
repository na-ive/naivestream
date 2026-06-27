'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SyncService } from '@/lib/services/sync';

function SyncInitializer() {
  const { status } = useSession();
  
  useEffect(() => {
    if (status === 'authenticated') {
      SyncService.sync(true);
    }
  }, [status]);
  
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SyncInitializer />
      {children}
    </SessionProvider>
  );
}
