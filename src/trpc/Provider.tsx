'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { trpc, createTRPCClient } from './client';

export interface TRPCProviderProps {
  children: React.ReactNode;
}

function InnerTRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  let hasParent = false;
  try {
    const existing = useQueryClient();
    if (existing) {
      hasParent = true;
    }
  } catch {
    hasParent = false;
  }

  if (hasParent) {
    return <>{children}</>;
  }

  return <InnerTRPCProvider>{children}</InnerTRPCProvider>;
}

export default TRPCProvider;
