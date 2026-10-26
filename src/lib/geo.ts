/**
 * Calculates great-circle distance between two coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculates initial bearing from point 1 to point 2.
 * @returns Compass bearing in degrees (0 - 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = (toDeg(θ) + 360) % 360;

  return bearing;
}

/**
 * Interpolates intermediate coordinates along waypoints linearly.
 * For each segment between consecutive waypoints, generates stepsPerSegment steps,
 * ending with the final waypoint.
 */
export function interpolatePath(
  points: [number, number][],
  stepsPerSegment: number = 5
): [number, number][] {
  if (points.length <= 1 || stepsPerSegment <= 0) {
    return points.map(([lat, lng]) => [lat, lng]);
  }

  const result: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    for (let step = 0; step < stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      result.push([lat, lng]);
    }
  }

  result.push([points[points.length - 1][0], points[points.length - 1][1]]);
  return result;
}
