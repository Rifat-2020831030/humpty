import { createTRPCReact } from '@trpc/react-query';
import {
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from '@trpc/client';
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

let wsClientInstance: ReturnType<typeof createWSClient> | null = null;

export function getWSClient(): ReturnType<typeof createWSClient> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!wsClientInstance) {
    wsClientInstance = createWSClient({
      url: getWsUrl(),
    });
  }
  return wsClientInstance;
}

export function getClientConfig() {
  const ws = getWSClient();
  return {
    links: [
      splitLink({
        condition(op) {
          return op.type === 'subscription';
        },
        true: ws
          ? wsLink({
              client: ws,
              transformer: superjson,
            })
          : httpBatchLink({
              url: `${getBaseUrl()}/api/trpc`,
              transformer: superjson,
            }),
        false: httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      }),
    ],
  };
}

export function createTRPCClient(opts?: Parameters<typeof trpc.createClient>[0]) {
  return trpc.createClient(opts ?? getClientConfig());
}
