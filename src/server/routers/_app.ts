import { router, createCallerFactory } from '../trpc';
import { rideRouter } from './ride';
import { chatRouter } from './chat';
import { driverRouter } from './driver';
import { locationRouter } from './location';

export const appRouter = router({
  ride: rideRouter,
  chat: chatRouter,
  driver: driverRouter,
  location: locationRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
