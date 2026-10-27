import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { db } from './db';

export interface TRPCContext {
  db?: typeof db;
  sessionId?: string;
}

export const createTRPCContext = async (opts?: {
  req?: Request;
  sessionId?: string;
  db?: typeof db;
}): Promise<TRPCContext & { db: typeof db }> => {
  return {
    db: opts?.db ?? db,
    sessionId: opts?.sessionId,
  };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;
export { TRPCError };
