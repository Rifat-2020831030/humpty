import { router, publicProcedure } from '../trpc';
import { heatmapStore } from '../density/heatmapStore';
import { eventBus, DensityUpdatePayload } from '../events';
import { HeatmapCell } from '../../types';
import { observable } from '@trpc/server/observable';

export const driverRouter = router({
  getDensity: publicProcedure.query(() => {
    return heatmapStore.getCells();
  }),

  onDensityUpdate: publicProcedure.subscription(() => {
    return observable<{ cells: HeatmapCell[] }>((emit) => {
      const handler = (data: DensityUpdatePayload) => {
        emit.next(data);
      };
      eventBus.on('densityUpdate', handler);
      return () => {
        eventBus.off('densityUpdate', handler);
      };
    });
  }),
});

export type DriverRouter = typeof driverRouter;
