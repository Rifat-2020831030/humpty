import { calculateDistance, calculateBearing, interpolatePath } from '../../lib/geo';
import { eventBus, DriverLocationPayload } from '../events';
import { db } from '../db';
import { DHAKA_ROUTES, findNearestRoute } from './dhakaRoutes';

const activeSimulations = new Map<string, NodeJS.Timeout>();
const latestDriverLocations = new Map<string, DriverLocationPayload>();

export function getActiveSimulations(): Map<string, NodeJS.Timeout> {
  return activeSimulations;
}

export function getLatestDriverLocation(rideId: string): DriverLocationPayload | null {
  return latestDriverLocations.get(rideId) ?? null;
}

export function stopDriverSimulation(rideId: string): void {
  const timer = activeSimulations.get(rideId);
  if (timer) {
    clearInterval(timer);
    activeSimulations.delete(rideId);
  }
  latestDriverLocations.delete(rideId);
}

/**
 * Builds straight-line waypoints connecting start -> pickup -> dropoff.
 */
function buildSimulationWaypoints(
  startCoord: [number, number],
  pickupCoord: [number, number],
  dropoffCoord: [number, number]
): [number, number][] {
  return [startCoord, pickupCoord, dropoffCoord];
}

/**
 * Starts or replaces driver simulation for a ride along realistic Dhaka road paths.
 * Every 2 seconds advances position, emits coordinates, and auto-detects arrival within 50m of pickup.
 */
export function startDriverSimulation(
  rideId: string,
  startCoord: [number, number],
  pickupCoord: [number, number],
  dropoffCoord: [number, number]
): void {
  // Prevent duplicate intervals for the same rideId
  if (activeSimulations.has(rideId)) {
    stopDriverSimulation(rideId);
  }

  const waypoints = buildSimulationWaypoints(startCoord, pickupCoord, dropoffCoord);
  const path = interpolatePath(waypoints, 5);

  let currentIndex = 0;
  let hasArrivedAtPickup = false;

  const timer = setInterval(() => {
    if (currentIndex >= path.length - 1) {
      stopDriverSimulation(rideId);
      return;
    }

    currentIndex++;
    const current = path[currentIndex];
    const prev = path[currentIndex - 1];

    const bearing = calculateBearing(prev[0], prev[1], current[0], current[1]);
    const distKm = calculateDistance(prev[0], prev[1], current[0], current[1]);
    // Clamped realistic city speed in km/h (~15-45 km/h for Dhaka)
    const rawSpeed = Math.round(distKm / (2 / 3600));
    const speed = Math.max(15, Math.min(50, rawSpeed > 0 ? rawSpeed : 25));

    const payload: DriverLocationPayload = {
      rideId,
      lat: current[0],
      lng: current[1],
      bearing,
      speed,
    };

    latestDriverLocations.set(rideId, payload);

    // Emit driver location event to specific ride channel and global channel
    eventBus.emit(`driverLocation:${rideId}`, payload);
    eventBus.emit('driverLocation', payload);

    // Auto-detect arrival at pickup within 50m
    if (!hasArrivedAtPickup) {
      const distToPickupMeters = calculateDistance(current[0], current[1], pickupCoord[0], pickupCoord[1]) * 1000;
      if (distToPickupMeters <= 50) {
        hasArrivedAtPickup = true;
        const statusPayload = { rideId, status: 'ARRIVED_AT_PICKUP' as const };
        eventBus.emit(`statusChange:${rideId}`, statusPayload);
        eventBus.emit('statusChange', statusPayload);
        eventBus.emit(`ARRIVED_AT_PICKUP:${rideId}`, statusPayload);
        eventBus.emit('ARRIVED_AT_PICKUP', statusPayload);

        db.ride
          ?.findUnique({ where: { id: rideId }, select: { id: true, status: true } })
          .then(ride => {
            if (ride && ride.status === 'DRIVER_EN_ROUTE') {
              return db.ride.update({
                where: { id: rideId },
                data: { status: 'ARRIVED_AT_PICKUP' },
              });
            }
          })
          .catch(() => {
            // DB update is best-effort in simulation / mock tests
          });
      }
    }

    if (currentIndex >= path.length - 1) {
      stopDriverSimulation(rideId);
    }
  }, 2000);

  activeSimulations.set(rideId, timer);
}

/**
 * Allows external GPS coordinate override (from real driver GPS).
 */
export function updateDriverLocation(
  rideId: string,
  lat: number,
  lng: number,
  bearing: number = 0,
  speed: number = 0
): void {
  const payload: DriverLocationPayload = { rideId, lat, lng, bearing, speed };
  latestDriverLocations.set(rideId, payload);
  eventBus.emit(`driverLocation:${rideId}`, payload);
  eventBus.emit('driverLocation', payload);
}
