import { calculateDistance } from '../../lib/geo';

export interface DhakaRoute {
  id: string;
  name: string;
  description: string;
  waypoints: [number, number][];
}

/**
 * Default Route: Mohakhali - Banani Real Road Path
 * Traced using real road path coordinates provided for GariKoi.
 */
export const ROUTE_MOHAKHALI_BANANI: DhakaRoute = {
  id: 'route-mohakali-banani',
  name: 'Mohakhali - Banani Road Link',
  description: 'Mohakhali to Banani real road path',
  waypoints: [
    [23.782884294034634, 90.39856046054382],
    [23.780940365992127, 90.40143578849505],
    [23.78101890910272, 90.39868920657149],
    [23.779506945856063, 90.3979274592268],
    [23.780125478386335, 90.39674728730652],
    [23.77786732951554, 90.39632886271662],
  ],
};

/**
 * Route A: Gulshan 2 -> Banani -> Mohakhali
 */
export const ROUTE_A: DhakaRoute = {
  id: 'route-a',
  name: 'Gulshan 2 - Mohakhali',
  description: 'Gulshan 2 -> Banani -> Mohakhali',
  waypoints: [
    [23.7938, 90.4143],
    [23.7925, 90.4089],
    [23.7901, 90.4062],
    [23.7876, 90.4021],
    [23.7854, 90.3998],
    [23.7831, 90.3977],
  ],
};

/**
 * Route B: Dhanmondi 27 -> Mirpur Road -> Farmgate
 */
export const ROUTE_B: DhakaRoute = {
  id: 'route-b',
  name: 'Dhanmondi 27 - Farmgate',
  description: 'Dhanmondi 27 -> Mirpur Road -> Farmgate',
  waypoints: [
    [23.7461, 90.3742],
    [23.7512, 90.3768],
    [23.7558, 90.3791],
    [23.7601, 90.3812],
    [23.7649, 90.3834],
    [23.7697, 90.3871],
  ],
};

/**
 * Route C: Motijheel -> Paltan -> Press Club -> Shahbagh
 */
export const ROUTE_C: DhakaRoute = {
  id: 'route-c',
  name: 'Motijheel - Shahbagh',
  description: 'Motijheel -> Paltan -> Press Club -> Shahbagh',
  waypoints: [
    [23.7233, 90.4185],
    [23.7268, 90.4152],
    [23.7291, 90.4118],
    [23.7318, 90.4089],
    [23.7342, 90.4061],
    [23.7371, 90.4032],
  ],
};

/**
 * Route D: Uttara -> Airport Road -> Banani
 */
export const ROUTE_D: DhakaRoute = {
  id: 'route-d',
  name: 'Uttara - Banani',
  description: 'Uttara -> Airport Road -> Banani',
  waypoints: [
    [23.8729, 90.3984],
    [23.8621, 90.4012],
    [23.8512, 90.4034],
    [23.8398, 90.4058],
    [23.8289, 90.4079],
    [23.8103, 90.4125],
  ],
};

export const DHAKA_ROUTES: DhakaRoute[] = [
  ROUTE_MOHAKHALI_BANANI,
  ROUTE_A,
  ROUTE_B,
  ROUTE_C,
  ROUTE_D,
];

/**
 * Finds the nearest Dhaka route to a given coordinate point.
 */
export function findNearestRoute(point: [number, number]): DhakaRoute {
  let nearestRoute = DHAKA_ROUTES[0];
  let minDistance = Infinity;

  for (const route of DHAKA_ROUTES) {
    for (const waypoint of route.waypoints) {
      const distance = calculateDistance(point[0], point[1], waypoint[0], waypoint[1]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestRoute = route;
      }
    }
  }

  return nearestRoute;
}
