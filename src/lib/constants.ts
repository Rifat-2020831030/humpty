import { DriverProfile } from '../types';

/**
 * Default center coordinates for Dhaka city [lat, lng].
 */
export const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
export const DHAKA_DEFAULT_CENTER = DHAKA_CENTER;

/**
 * Default OpenFreeMap style URL for MapLibre GL JS vector maps.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * 5 simulated seed driver profiles per spec §19.
 */
export const SEED_DRIVERS: DriverProfile[] = [
  {
    id: 'driver-1',
    name: 'Rahim Uddin',
    vehicle: 'Honda CB Shine',
    vehicleType: 'BIKE',
    plate: 'DHA-1234',
    rating: 4.9,
    lat: 23.7938,
    lng: 90.4143,
    phone: '+8801711000001',
  },
  {
    id: 'driver-2',
    name: 'Karim Mia',
    vehicle: 'Bajaj RE Auto',
    vehicleType: 'CNG',
    plate: 'MET-5678',
    rating: 4.7,
    lat: 23.7831,
    lng: 90.3977,
    phone: '+8801711000002',
  },
  {
    id: 'driver-3',
    name: 'Sumon Ahmed',
    vehicle: 'Toyota Axio',
    vehicleType: 'CAR',
    plate: 'DHA-9012',
    rating: 4.8,
    lat: 23.7461,
    lng: 90.3742,
    phone: '+8801711000003',
  },
  {
    id: 'driver-4',
    name: 'Farhan Hossain',
    vehicle: 'Hero Splendor',
    vehicleType: 'BIKE',
    plate: 'DHA-3456',
    rating: 4.6,
    lat: 23.7558,
    lng: 90.3791,
    phone: '+8801711000004',
  },
  {
    id: 'driver-5',
    name: 'Nasir Khan',
    vehicle: 'Toyota Axio',
    vehicleType: 'CAR',
    plate: 'CHI-7890',
    rating: 4.9,
    lat: 23.8103,
    lng: 90.4125,
    phone: '+8801711000005',
  },
];
