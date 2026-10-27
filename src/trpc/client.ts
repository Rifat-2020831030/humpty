import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
export type { AppRouter } from '@/server/routers/_app';

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

export function getWsUrl(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  return `ws://localhost:${process.env.PORT || 3000}`;
}

export function getWSClient() {
  return null;
}

export function getClientConfig() {
  return {
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  };
}

export function createTRPCClient(opts?: Parameters<typeof trpc.createClient>[0]) {
  return trpc.createClient(opts ?? getClientConfig());
}

