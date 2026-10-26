import { calculateDistance, calculateBearing, interpolatePath } from '../../lib/geo';
import { eventBus, DriverLocationPayload } from '../events';
import { db } from '../db';
import { DHAKA_ROUTES, findNearestRoute } from './dhakaRoutes';

const activeSimulations = new Map<string, NodeJS.Timeout>();

export function getActiveSimulations(): Map<string, NodeJS.Timeout> {
  return activeSimulations;
}

export function stopDriverSimulation(rideId: string): void {
  const timer = activeSimulations.get(rideId);
  if (timer) {
    clearInterval(timer);
    activeSimulations.delete(rideId);
  }
}

/**
 * Builds waypoints connecting start -> pickup -> dropoff, incorporating intermediate
 * Dhaka seed road points when they are along the travel path.
 */
function buildSimulationWaypoints(
  startCoord: [number, number],
  pickupCoord: [number, number],
  dropoffCoord: [number, number]
): [number, number][] {
  const getIntermediateWaypoints = (
    from: [number, number],
    to: [number, number]
  ): [number, number][] => {
    const directDist = calculateDistance(from[0], from[1], to[0], to[1]);
    if (directDist < 0.2) {
      return [];
    }

    const nearestRoute = findNearestRoute(from);
    // Find waypoints on the route that do not add a massive detour
    const candidateWaypoints = nearestRoute.waypoints.filter(w => {
      const d = calculateDistance(from[0], from[1], w[0], w[1]) + calculateDistance(w[0], w[1], to[0], to[1]);
      return d <= 1.35 * directDist;
    });

    // Sort waypoints by distance from starting point
    candidateWaypoints.sort((a, b) => {
      const distA = calculateDistance(from[0], from[1], a[0], a[1]);
      const distB = calculateDistance(from[0], from[1], b[0], b[1]);
      return distA - distB;
    });

    return candidateWaypoints;
  };

  const waypointsToPickup = getIntermediateWaypoints(startCoord, pickupCoord);
  const waypointsToDropoff = getIntermediateWaypoints(pickupCoord, dropoffCoord);

  const rawWaypoints: [number, number][] = [
    startCoord,
    ...waypointsToPickup,
    pickupCoord,
    ...waypointsToDropoff,
    dropoffCoord,
  ];

  // Deduplicate consecutive points within 5m of each other
  const deduplicated: [number, number][] = [];
  for (const pt of rawWaypoints) {
    if (deduplicated.length === 0) {
      deduplicated.push(pt);
    } else {
      const last = deduplicated[deduplicated.length - 1];
      const distM = calculateDistance(last[0], last[1], pt[0], pt[1]) * 1000;
      if (distM > 5) {
        deduplicated.push(pt);
      }
    }
  }

  if (deduplicated.length < 2) {
    return [startCoord, pickupCoord, dropoffCoord];
  }

  return deduplicated;
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
          ?.findUnique({ where: { id: rideId }, select: { id: true } })
          .then(ride => {
            if (ride) {
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
  eventBus.emit(`driverLocation:${rideId}`, payload);
  eventBus.emit('driverLocation', payload);
}
