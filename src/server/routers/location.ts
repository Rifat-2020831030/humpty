import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  resolveNaturalLanguageLocation,
  getDhakaLandmarksAutocomplete,
  getDhakaLandmarksOptions,
} from '../ai/gemini';

export const locationRouter = router({
  aiSearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        contextLat: z.number().optional(),
        contextLng: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contextLatLng: [number, number] | undefined =
        typeof input.contextLat === 'number' && typeof input.contextLng === 'number'
          ? [input.contextLat, input.contextLng]
          : undefined;

      return resolveNaturalLanguageLocation(input.query, contextLatLng);
    }),

  aiSearchOptions: publicProcedure
    .input(
      z.object({
        query: z.string(),
        contextLat: z.number().optional(),
        contextLng: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const contextLatLng: [number, number] | undefined =
        typeof input.contextLat === 'number' && typeof input.contextLng === 'number'
          ? [input.contextLat, input.contextLng]
          : undefined;

      return getDhakaLandmarksOptions(input.query, contextLatLng);
    }),

  autocomplete: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(({ input }) => {
      return getDhakaLandmarksAutocomplete(input.query);
    }),
});

export type LocationRouter = typeof locationRouter;
