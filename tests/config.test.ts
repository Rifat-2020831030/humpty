import { describe, it, expect } from 'vitest';
import manifest from '../public/manifest.json';
import { VEHICLE_TYPES, RIDE_STATUSES, ROLES } from '../src/types';

describe('Project Configuration & Manifest', () => {
  it('should have valid PWA manifest properties', () => {
    expect(manifest.name).toBe('GariKoi');
    expect(manifest.short_name).toBe('GariKoi');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#000000');
  });

  it('should export all core vehicle types and ride statuses', () => {
    expect(VEHICLE_TYPES).toContain('BIKE');
    expect(VEHICLE_TYPES).toContain('CNG');
    expect(VEHICLE_TYPES).toContain('CAR');
    expect(RIDE_STATUSES).toContain('SEARCHING');
    expect(RIDE_STATUSES).toContain('DRIVER_ASSIGNED');
    expect(RIDE_STATUSES).toContain('COMPLETED');
  });

  it('should export all user roles', () => {
    expect(ROLES).toContain('RIDER');
    expect(ROLES).toContain('DRIVER');
  });
});
