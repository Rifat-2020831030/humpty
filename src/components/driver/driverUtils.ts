import { ActiveRide, RideStatus, VehicleType } from '../../types';

export type DriverFlowState =
  | 'OFFLINE'
  | 'ONLINE_STANDBY'
  | 'INCOMING_DISPATCH'
  | 'EN_ROUTE_PICKUP'
  | 'ARRIVED_PICKUP'
  | 'TRIP_IN_PROGRESS'
  | 'TRIP_COMPLETED';

const METER_RATES: Record<VehicleType, { base: number; perKm: number; min: number }> = {
  BIKE: { base: 30, perKm: 12, min: 40 },
  CNG: { base: 50, perKm: 18, min: 60 },
  CAR: { base: 100, perKm: 25, min: 120 },
};

/**
 * Formats numeric values to Bangladeshi Taka currency format (e.g. ৳250).
 */
export function formatBDT(amount: number): string {
  if (amount == null || isNaN(amount) || amount < 0) {
    return '৳0';
  }
  const rounded = Math.round(amount);
  return `৳${rounded.toLocaleString('en-US')}`;
}

/**
 * Calculates countdown ring progress and stroke dashoffset for countdown timers.
 */
export function calculateCountdownProgress(
  timeLeft: number,
  totalTime: number,
  circumference: number
): { percentage: number; dashoffset: number } {
  if (totalTime <= 0) return { percentage: 0, dashoffset: circumference };
  const clampedTime = Math.max(0, Math.min(timeLeft, totalTime));
  const percentage = (clampedTime / totalTime) * 100;
  const dashoffset = circumference * (1 - clampedTime / totalTime);
  return {
    percentage: Math.round(percentage * 100) / 100,
    dashoffset,
  };
}

/**
 * Calculates real-time fare meter estimate based on vehicle type and traveled distance.
 */
export function calculateMeterFare(type: VehicleType, distanceKm: number): number {
  const rate = METER_RATES[type] || METER_RATES.BIKE;
  const dist = Math.max(0, distanceKm);
  const calculated = Math.round(rate.base + dist * rate.perKm);
  return Math.max(rate.min, calculated);
}

/**
 * Determines current high-level flow state for the driver UI.
 */
export function getDriverFlowState(options: {
  isOnline: boolean;
  hasIncomingAlert: boolean;
  activeRide: ActiveRide | null;
}): DriverFlowState {
  const { isOnline, hasIncomingAlert, activeRide } = options;

  if (activeRide) {
    if (activeRide.status === 'COMPLETED' || activeRide.status === 'RATED') {
      return 'TRIP_COMPLETED';
    }
    if (activeRide.status === 'IN_PROGRESS') {
      return 'TRIP_IN_PROGRESS';
    }
    if (activeRide.status === 'ARRIVED_AT_PICKUP') {
      return 'ARRIVED_PICKUP';
    }
    if (activeRide.status === 'DRIVER_ASSIGNED' || activeRide.status === 'DRIVER_EN_ROUTE') {
      return 'EN_ROUTE_PICKUP';
    }
  }

  if (!isOnline) {
    return 'OFFLINE';
  }

  if (hasIncomingAlert) {
    return 'INCOMING_DISPATCH';
  }

  return 'ONLINE_STANDBY';
}

export function canMarkArrived(status: RideStatus): boolean {
  return status === 'DRIVER_EN_ROUTE';
}

export function canStartTrip(status: RideStatus): boolean {
  return status === 'ARRIVED_AT_PICKUP';
}

export function canCompleteTrip(status: RideStatus): boolean {
  return status === 'IN_PROGRESS';
}

/**
 * Aggregates driver's session earnings and completed trip counts.
 */
export function calculateSessionEarnings(
  trips: Array<{ fareFinal?: number | null; fareEstimate: number; status: RideStatus | string }>
): { totalBDT: number; completedCount: number } {
  let totalBDT = 0;
  let completedCount = 0;

  for (const trip of trips) {
    if (trip.status === 'COMPLETED' || trip.status === 'RATED') {
      completedCount++;
      const fare = trip.fareFinal ?? trip.fareEstimate ?? 0;
      totalBDT += fare;
    }
  }

  return { totalBDT, completedCount };
}
