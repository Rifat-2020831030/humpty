export const VEHICLE_TYPES = ['BIKE', 'CNG', 'CAR'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const RIDE_STATUSES = [
  'SEARCHING',
  'DRIVER_ASSIGNED',
  'DRIVER_EN_ROUTE',
  'ARRIVED_AT_PICKUP',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RATED',
] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export const ROLES = ['RIDER', 'DRIVER'] as const;
export type Role = (typeof ROLES)[number];

export interface LocationResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence?: number;
  address?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  rating: number;
  lat: number;
  lng: number;
  vehicleType: VehicleType;
  phone?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  totalFare: number;
}

export interface HeatmapCell {
  lat: number;
  lng: number;
  intensity: number;
}

export interface ChatMessageItem {
  id: string;
  rideId: string;
  senderRole: Role;
  text: string;
  createdAt: string | Date;
}

export interface ActiveRide {
  id: string;
  status: RideStatus;
  vehicleType: VehicleType;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  fareEstimate: number;
  fareFinal?: number | null;
  distanceKm: number;
  riderSessionId: string;
  driverSessionId?: string | null;
  driverName?: string | null;
  driverVehicle?: string | null;
  driverPlate?: string | null;
  driverRating?: number | null;
  driverRatingByRider?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
