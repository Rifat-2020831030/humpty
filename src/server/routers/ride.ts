import { z } from 'zod';
import { router, publicProcedure, TRPCError } from '../trpc';
import { db as defaultDb } from '../db';
import {
  eventBus,
  StatusChangePayload,
  IncomingRidePayload,
  DriverLocationPayload,
} from '../events';
import { VEHICLE_TYPES, VehicleType, RideStatus } from '../../types';
import { calculateDistance } from '../../lib/geo';
import { calculateFare } from '../../lib/fare';
import { SEED_DRIVERS } from '../../lib/constants';
import {
  startDriverSimulation,
  stopDriverSimulation,
  updateDriverLocation as simulateDriverLocation,
} from '../simulation/locationSimulator';
import { heatmapStore } from '../density/heatmapStore';
import { observable } from '@trpc/server/observable';

const getDb = (ctx: { db?: typeof defaultDb }) => ctx.db ?? defaultDb;

export const rideRouter = router({
  request: publicProcedure
    .input(
      z.object({
        vehicleType: z.enum(VEHICLE_TYPES),
        pickupLat: z.number(),
        pickupLng: z.number(),
        pickupAddress: z.string(),
        dropoffLat: z.number(),
        dropoffLng: z.number(),
        dropoffAddress: z.string(),
        riderSessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const riderSessionId = input.riderSessionId ?? ctx.sessionId ?? 'anonymous-rider';

      const distanceKm =
        Math.round(
          calculateDistance(input.pickupLat, input.pickupLng, input.dropoffLat, input.dropoffLng) *
            10
        ) / 10;
      const fare = calculateFare(input.vehicleType, distanceKm);

      const ride = await database.ride.create({
        data: {
          status: 'SEARCHING',
          vehicleType: input.vehicleType,
          pickupLat: input.pickupLat,
          pickupLng: input.pickupLng,
          pickupAddress: input.pickupAddress,
          dropoffLat: input.dropoffLat,
          dropoffLng: input.dropoffLng,
          dropoffAddress: input.dropoffAddress,
          fareEstimate: fare.totalFare,
          distanceKm,
          riderSessionId,
        },
      });

      heatmapStore.recordRequest(input.pickupLat, input.pickupLng);

      const incomingPayload: IncomingRidePayload = {
        rideId: ride.id,
        vehicleType: ride.vehicleType as VehicleType,
        pickupLat: ride.pickupLat,
        pickupLng: ride.pickupLng,
        pickupAddress: ride.pickupAddress,
        dropoffLat: ride.dropoffLat,
        dropoffLng: ride.dropoffLng,
        dropoffAddress: ride.dropoffAddress,
        fareEstimate: ride.fareEstimate,
        distanceKm: ride.distanceKm,
        driverSessionId: null,
      };
      eventBus.emit('incomingRide', incomingPayload);

      return ride;
    }),

  accept: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        driverSessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'SEARCHING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot accept ride with status ${ride.status}. Must be SEARCHING.`,
        });
      }

      const driverSessionId = input.driverSessionId ?? ctx.sessionId ?? 'driver-1';
      const seedDriver = SEED_DRIVERS.find((d) => d.id === driverSessionId);
      const driverName = seedDriver?.name ?? 'Rahim Uddin';
      const driverVehicle = seedDriver?.vehicle ?? 'Honda CB Shine';
      const driverPlate = seedDriver?.plate ?? 'DHA-1234';
      const driverRating = seedDriver?.rating ?? 4.8;

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: {
          status: 'DRIVER_ASSIGNED',
          driverSessionId,
          driverName,
          driverVehicle,
          driverPlate,
          driverRating,
        },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'DRIVER_ASSIGNED',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  decline: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        driverSessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'SEARCHING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot decline ride with status ${ride.status}. Must be SEARCHING.`,
        });
      }

      const incomingPayload: IncomingRidePayload = {
        rideId: ride.id,
        vehicleType: ride.vehicleType as VehicleType,
        pickupLat: ride.pickupLat,
        pickupLng: ride.pickupLng,
        pickupAddress: ride.pickupAddress,
        dropoffLat: ride.dropoffLat,
        dropoffLng: ride.dropoffLng,
        dropoffAddress: ride.dropoffAddress,
        fareEstimate: ride.fareEstimate,
        distanceKm: ride.distanceKm,
        driverSessionId: null,
      };
      eventBus.emit('incomingRide', incomingPayload);

      return ride;
    }),

  startNavigation: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'DRIVER_ASSIGNED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot start navigation for ride with status ${ride.status}. Must be DRIVER_ASSIGNED.`,
        });
      }

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: { status: 'DRIVER_EN_ROUTE' },
      });

      const seedDriver = SEED_DRIVERS.find((d) => d.id === updated.driverSessionId);
      const startCoord: [number, number] = seedDriver
        ? [seedDriver.lat, seedDriver.lng]
        : [updated.pickupLat + 0.005, updated.pickupLng + 0.005];

      startDriverSimulation(
        updated.id,
        startCoord,
        [updated.pickupLat, updated.pickupLng],
        [updated.dropoffLat, updated.dropoffLng]
      );

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'DRIVER_EN_ROUTE',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  arrivedAtPickup: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'DRIVER_EN_ROUTE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot mark arrived for ride with status ${ride.status}. Must be DRIVER_EN_ROUTE.`,
        });
      }

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: { status: 'ARRIVED_AT_PICKUP' },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'ARRIVED_AT_PICKUP',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  startTrip: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'ARRIVED_AT_PICKUP') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot start trip for ride with status ${ride.status}. Must be ARRIVED_AT_PICKUP.`,
        });
      }

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: { status: 'IN_PROGRESS' },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'IN_PROGRESS',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  completeTrip: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        fareFinal: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'IN_PROGRESS') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot complete trip for ride with status ${ride.status}. Must be IN_PROGRESS.`,
        });
      }

      stopDriverSimulation(ride.id);

      const finalFare = input.fareFinal ?? ride.fareEstimate;
      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: {
          status: 'COMPLETED',
          fareFinal: finalFare,
        },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'COMPLETED',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  cancel: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      const cancellableStatuses: RideStatus[] = [
        'SEARCHING',
        'DRIVER_ASSIGNED',
        'DRIVER_EN_ROUTE',
        'ARRIVED_AT_PICKUP',
      ];
      if (!cancellableStatuses.includes(ride.status as RideStatus)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel ride with status ${ride.status}. Allowed only in SEARCHING, DRIVER_ASSIGNED, DRIVER_EN_ROUTE, or ARRIVED_AT_PICKUP.`,
        });
      }

      stopDriverSimulation(ride.id);

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: { status: 'CANCELLED' },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'CANCELLED',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  submitRating: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        rating: z.number().int().min(1).max(5),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({ where: { id: input.rideId } });
      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      if (ride.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot submit rating for ride with status ${ride.status}. Must be COMPLETED.`,
        });
      }

      const updated = await database.ride.update({
        where: { id: input.rideId },
        data: {
          status: 'RATED',
          driverRatingByRider: input.rating,
        },
      });

      const payload: StatusChangePayload = {
        rideId: updated.id,
        status: 'RATED',
        updatedAt: updated.updatedAt,
      };
      eventBus.emit(`statusChange:${updated.id}`, payload);
      eventBus.emit('statusChange', payload);

      return updated;
    }),

  updateDriverLocation: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
        lat: z.number(),
        lng: z.number(),
        bearing: z.number().optional().default(0),
        speed: z.number().optional().default(0),
      })
    )
    .mutation(({ input }) => {
      simulateDriverLocation(input.rideId, input.lat, input.lng, input.bearing, input.speed);
      return { success: true };
    }),

  getActive: publicProcedure
    .input(
      z
        .object({
          sessionId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const sessionId = input?.sessionId ?? ctx.sessionId;
      if (!sessionId) {
        return null;
      }

      const ride = await database.ride.findFirst({
        where: {
          OR: [{ riderSessionId: sessionId }, { driverSessionId: sessionId }],
          status: {
            notIn: ['COMPLETED', 'CANCELLED', 'RATED'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return ride;
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const database = getDb(ctx);
      const ride = await database.ride.findUnique({
        where: { id: input.id },
        include: { messages: true },
      });

      if (!ride) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ride not found' });
      }

      return ride;
    }),

  onStatusChange: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .subscription(({ input }) => {
      return observable<StatusChangePayload>((emit) => {
        const handler = (data: StatusChangePayload) => {
          if (data.rideId === input.rideId) {
            emit.next(data);
          }
        };
        eventBus.on(`statusChange:${input.rideId}`, handler);
        return () => {
          eventBus.off(`statusChange:${input.rideId}`, handler);
        };
      });
    }),

  onDriverLocation: publicProcedure
    .input(
      z.object({
        rideId: z.string(),
      })
    )
    .subscription(({ input }) => {
      return observable<DriverLocationPayload>((emit) => {
        const handler = (data: DriverLocationPayload) => {
          emit.next(data);
        };
        eventBus.on(`driverLocation:${input.rideId}`, handler);
        return () => {
          eventBus.off(`driverLocation:${input.rideId}`, handler);
        };
      });
    }),

  onIncomingRide: publicProcedure
    .input(
      z
        .object({
          vehicleType: z.enum(VEHICLE_TYPES).optional(),
        })
        .optional()
    )
    .subscription(({ input }) => {
      return observable<IncomingRidePayload>((emit) => {
        const handler = (data: IncomingRidePayload) => {
          if (!input?.vehicleType || data.vehicleType === input.vehicleType) {
            emit.next(data);
          }
        };
        eventBus.on('incomingRide', handler);
        return () => {
          eventBus.off('incomingRide', handler);
        };
      });
    }),
});

export type RideRouter = typeof rideRouter;
