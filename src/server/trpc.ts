import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { db } from './db';

export interface TRPCContext {
  db?: typeof db;
  sessionId?: string;
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;
