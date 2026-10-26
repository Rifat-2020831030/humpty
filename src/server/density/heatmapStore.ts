import { HeatmapCell } from '../../types';
import { eventBus } from '../events';

interface GridCellData {
  lat: number;
  lng: number;
  timestamps: number[];
}

export class HeatmapStore {
  private cells = new Map<string, GridCellData>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  /**
   * Generates a grid key rounding lat/lng to 2 decimal places (~0.01 deg, ~1.1km).
   */
  private getKey(lat: number, lng: number): { key: string; cellLat: number; cellLng: number } {
    const cellLat = Math.round(lat * 100) / 100;
    const cellLng = Math.round(lng * 100) / 100;
    return {
      key: `${cellLat.toFixed(2)}:${cellLng.toFixed(2)}`,
      cellLat,
      cellLng,
    };
  }

  /**
   * Records a ride request at coordinate, incrementing cell intensity.
   */
  recordRequest(lat: number, lng: number): void {
    const { key, cellLat, cellLng } = this.getKey(lat, lng);
    const now = Date.now();

    let cell = this.cells.get(key);
    if (!cell) {
      cell = { lat: cellLat, lng: cellLng, timestamps: [] };
      this.cells.set(key, cell);
    }

    cell.timestamps.push(now);

    // Broadcast density update event
    eventBus.emit('densityUpdate', { cells: this.getCells() });
  }

  /**
   * Returns active heatmap cells, pruning requests that have exceeded TTL.
   */
  getCells(): HeatmapCell[] {
    const now = Date.now();
    const cutoff = now - this.ttlMs;
    const activeCells: HeatmapCell[] = [];

    for (const [key, cell] of this.cells.entries()) {
      cell.timestamps = cell.timestamps.filter(ts => ts > cutoff);

      if (cell.timestamps.length === 0) {
        this.cells.delete(key);
      } else {
        activeCells.push({
          lat: cell.lat,
          lng: cell.lng,
          intensity: cell.timestamps.length,
        });
      }
    }

    return activeCells;
  }

  /**
   * Clears all recorded cells (useful for test resets).
   */
  clear(): void {
    this.cells.clear();
  }
}

export const heatmapStore = new HeatmapStore();
export default heatmapStore;
