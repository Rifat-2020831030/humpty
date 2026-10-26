import { EventEmitter } from 'node:events';
import { RideStatus, HeatmapCell, ChatMessageItem, VehicleType } from '../types';

export interface DriverLocationPayload {
  rideId?: string;
  lat: number;
  lng: number;
  bearing: number;
  speed?: number;
}

export interface StatusChangePayload {
  rideId: string;
  status: RideStatus;
  updatedAt?: string | Date;
}

export interface IncomingRidePayload {
  rideId: string;
  vehicleType: VehicleType;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  fareEstimate: number;
  distanceKm: number;
  driverSessionId?: string | null;
}

export interface ChatMessagePayload {
  rideId: string;
  message: ChatMessageItem;
}

export interface DensityUpdatePayload {
  cells: HeatmapCell[];
}

export interface EventBusMap {
  statusChange: [StatusChangePayload];
  driverLocation: [DriverLocationPayload];
  incomingRide: [IncomingRidePayload];
  chatMessage: [ChatMessagePayload];
  densityUpdate: [DensityUpdatePayload];
  [key: string]: any[];
}

/**
 * Global Node.js EventEmitter singleton for typed server events and WebSocket subscriptions.
 */
class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow higher limit for concurrent WebSocket subscriptions in demo
    this.setMaxListeners(100);
  }
}

export const eventBus = new AppEventBus();
export default eventBus;
