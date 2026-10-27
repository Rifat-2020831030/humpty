declare namespace GeoJSON {
  interface Geometry {
    type: string;
    coordinates: unknown;
  }
  interface Point extends Geometry {
    type: 'Point';
    coordinates: [number, number];
  }
  interface LineString extends Geometry {
    type: 'LineString';
    coordinates: [number, number][];
  }
  interface Feature<G extends Geometry = Geometry, P = Record<string, unknown>> {
    type: 'Feature';
    geometry: G;
    properties: P;
  }
  interface FeatureCollection<G extends Geometry = Geometry, P = Record<string, unknown>> {
    type: 'FeatureCollection';
    features: Feature<G, P>[];
  }
}
