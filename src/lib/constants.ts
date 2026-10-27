import { DriverProfile } from '../types';

/**
 * Default center coordinates for Dhaka city [lat, lng].
 * Centered on default user location in Mohakhali / Banani.
 */
export const DHAKA_CENTER: [number, number] = [23.78101890910272, 90.39868920657149];
export const DHAKA_DEFAULT_CENTER = DHAKA_CENTER;

/**
 * Default OpenFreeMap style URL for MapLibre GL JS vector maps.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * 5 simulated seed driver profiles clustered near the default user location.
 */
export const SEED_DRIVERS: DriverProfile[] = [
  {
    id: 'driver-1',
    name: 'Rahim Uddin',
    vehicle: 'Honda CB Shine',
    vehicleType: 'BIKE',
    plate: 'DHA-1234',
    rating: 4.9,
    lat: 23.782884294034634,
    lng: 90.39856046054382,
    phone: '+8801711000001',
  },
  {
    id: 'driver-2',
    name: 'Karim Mia',
    vehicle: 'Bajaj RE Auto',
    vehicleType: 'CNG',
    plate: 'MET-5678',
    rating: 4.7,
    lat: 23.780940365992127,
    lng: 90.40143578849505,
    phone: '+8801711000002',
  },
  {
    id: 'driver-3',
    name: 'Sumon Ahmed',
    vehicle: 'Toyota Axio',
    vehicleType: 'CAR',
    plate: 'DHA-9012',
    rating: 4.8,
    lat: 23.779506945856063,
    lng: 90.3979274592268,
    phone: '+8801711000003',
  },
  {
    id: 'driver-4',
    name: 'Farhan Hossain',
    vehicle: 'Hero Splendor',
    vehicleType: 'BIKE',
    plate: 'DHA-3456',
    rating: 4.6,
    lat: 23.780125478386335,
    lng: 90.39674728730652,
    phone: '+8801711000004',
  },
  {
    id: 'driver-5',
    name: 'Nasir Khan',
    vehicle: 'Toyota Axio',
    vehicleType: 'CAR',
    plate: 'CHI-7890',
    rating: 4.9,
    lat: 23.77786732951554,
    lng: 90.39632886271662,
    phone: '+8801711000005',
  },
];
