import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { processAgentBooking } from '../ai/agentEngine';

export const agentRouter = router({
  processBooking: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        riderLat: z.number(),
        riderLng: z.number(),
        answeredQuestions: z
          .array(
            z.object({
              id: z.string(),
              field: z.string(),
              question: z.string(),
              answer: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return processAgentBooking(input);
    }),
});
