import { VehicleType, FareBreakdown } from '../types';

export interface VehicleRateInfo {
  type: VehicleType;
  name: string;
  icon: string;
  baseFare: number;
  ratePerKm: number;
  minFare: number;
  seats: number;
  speedKmh: number;
}

export const VEHICLE_RATES: Record<VehicleType, VehicleRateInfo> = {
  BIKE: {
    type: 'BIKE',
    name: 'Bike',
    icon: '🏍',
    baseFare: 30,
    ratePerKm: 12,
    minFare: 50,
    seats: 1,
    speedKmh: 25,
  },
  CNG: {
    type: 'CNG',
    name: 'CNG Auto',
    icon: '🛺',
    baseFare: 40,
    ratePerKm: 15,
    minFare: 70,
    seats: 3,
    speedKmh: 18,
  },
  CAR: {
    type: 'CAR',
    name: 'Car',
    icon: '🚗',
    baseFare: 80,
    ratePerKm: 22,
    minFare: 120,
    seats: 4,
    speedKmh: 14,
  },
};

/**
 * Calculates fare breakdown based on vehicle type and road distance.
 * Formula: Fare = max(minFare, baseFare + distanceKm * 1.3 * ratePerKm)
 */
export function calculateFare(type: VehicleType, distanceKm: number): FareBreakdown {
  const rateInfo = VEHICLE_RATES[type];
  if (!rateInfo) {
    throw new Error(`Unknown vehicle type: ${type}`);
  }

  const baseFare = rateInfo.baseFare;
  const rawDistanceFare = distanceKm * 1.3 * rateInfo.ratePerKm;
  const distanceFare = Math.round(rawDistanceFare);
  const calculatedTotal = Math.round(baseFare + rawDistanceFare);
  const totalFare = Math.max(rateInfo.minFare, calculatedTotal);

  return {
    baseFare,
    distanceFare,
    totalFare,
  };
}

/**
 * Calculates estimated time of arrival (ETA) in minutes based on distance and vehicle speed.
 */
export function getVehicleEta(type: VehicleType, distanceKm: number): number {
  const rateInfo = VEHICLE_RATES[type];
  const speed = rateInfo?.speedKmh || 20;
  return Math.max(1, Math.round((distanceKm / speed) * 60));
}
