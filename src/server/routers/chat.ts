import { z } from 'zod';
import { router, publicProcedure, TRPCError } from '../trpc';
import { db as defaultDb } from '../db';
import { eventBus } from '../events';
import { ROLES, Role, ChatMessageItem } from '../../types';
import { observable } from '@trpc/server/observable';

const getDb = (ctx: { db?: typeof defaultDb }) => ctx.db ?? defaultDb;

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        text: z.string().min(1),
        senderRole: z.enum(ROLES).default('RIDER'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      const message = await database.chatMessage.create({
        data: {
          rideId: input.rideId,
          text: input.text,
          senderRole: input.senderRole,
        },
      });

      const payload: ChatMessageItem = {
        id: message.id,
        rideId: message.rideId,
        senderRole: message.senderRole as Role,
        text: message.text,
        createdAt: message.createdAt,
      };

      eventBus.emit(`chatMessage:${input.rideId}`, payload);
      eventBus.emit('chatMessage', { rideId: input.rideId, message: payload });

      return message;
    }),

  getMessages: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const database = getDb(ctx);
      return database.chatMessage.findMany({
        where: { rideId: input.rideId },
        orderBy: { createdAt: 'asc' },
      });
    }),

  onMessage: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .subscription(({ input }) => {
      return observable<ChatMessageItem>((emit) => {
        const handler = (data: ChatMessageItem) => {
          emit.next(data);
        };
        eventBus.on(`chatMessage:${input.rideId}`, handler);
        return () => {
          eventBus.off(`chatMessage:${input.rideId}`, handler);
        };
      });
    }),
});

export type ChatRouter = typeof chatRouter;
