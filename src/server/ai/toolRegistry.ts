import { calculateDistance } from '../../lib/geo';
import { calculateFare } from '../../lib/fare';
import { VehicleType } from '../../types';
import { matchDhakaLandmark, getDhakaLandmarksAutocomplete, DHAKA_LANDMARKS } from './gemini';

export interface LocationCoordinate {
  name: string;
  lat: number;
  lng: number;
}

export interface ClarificationOption {
  label: string;
  value: string;
  badge?: string;
}

export interface ClarificationQuestion {
  id: string;
  field: 'vehicleType' | 'dropoff' | 'pickup';
  question: string;
  options: ClarificationOption[];
  placeholder?: string;
}

export interface ToolDefinition<TArgs = any, TResult = any> {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: TArgs) => Promise<TResult> | TResult;
}

// Bounding box for Metropolitan Dhaka
export const DHAKA_BOUNDS = {
  minLat: 23.4,
  maxLat: 24.2,
  minLng: 90.1,
  maxLng: 90.7,
};

// Known prominent non-Dhaka locations to recognize out-of-bounds queries
const OUT_OF_BOUNDS_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  chittagong: { lat: 22.3569, lng: 91.7832, name: 'Chittagong GEC Circle' },
  chattogram: { lat: 22.3569, lng: 91.7832, name: 'Chattogram City' },
  sylhet: { lat: 24.8949, lng: 91.8687, name: 'Sylhet City' },
  cox: { lat: 21.4272, lng: 92.0058, name: "Cox's Bazar" },
  rajshahi: { lat: 24.3745, lng: 88.6042, name: 'Rajshahi City' },
  khulna: { lat: 22.8456, lng: 89.5403, name: 'Khulna City' },
  barisal: { lat: 22.701, lng: 90.3535, name: 'Barisal City' },
  barishal: { lat: 22.701, lng: 90.3535, name: 'Barishal City' },
  rangpur: { lat: 25.7439, lng: 89.2752, name: 'Rangpur City' },
  mymensingh: { lat: 24.7471, lng: 90.4203, name: 'Mymensingh City' },
  comilla: { lat: 23.4607, lng: 91.1809, name: 'Comilla City' },
  cumilla: { lat: 23.4607, lng: 91.1809, name: 'Cumilla City' },
};

const resolveLocationTool: ToolDefinition<
  { query: string; context?: 'pickup' | 'dropoff' },
  { success: boolean; location?: LocationCoordinate; error?: string }
> = {
  name: 'resolve_location',
  description: 'Resolves Dhaka landmarks and place queries to latitude and longitude coordinates.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The landmark or area name to resolve' },
      context: { type: 'string', enum: ['pickup', 'dropoff'], description: 'Context of the location' },
    },
    required: ['query'],
  },
  execute: async ({ query }) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return { success: false, error: 'Empty query provided' };
    }

    // Check for explicit out-of-bounds locations
    for (const [key, loc] of Object.entries(OUT_OF_BOUNDS_LOCATIONS)) {
      if (normalized.includes(key)) {
        return {
          success: true,
          location: {
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
          },
        };
      }
    }

    // Attempt Dhaka landmark exact / alias match
    const matched = matchDhakaLandmark(normalized);
    if (matched) {
      return {
        success: true,
        location: {
          name: matched.displayName,
          lat: matched.lat,
          lng: matched.lng,
        },
      };
    }

    // Attempt autocomplete / partial search
    const suggestions = getDhakaLandmarksAutocomplete(normalized);
    if (suggestions.length > 0) {
      return {
        success: true,
        location: {
          name: suggestions[0].displayName,
          lat: suggestions[0].lat,
          lng: suggestions[0].lng,
        },
      };
    }

    // Unknown or gibberish location
    return {
      success: false,
      error: `Could not resolve location for query "${query}" in Dhaka`,
    };
  },
};

const checkServiceBoundaryTool: ToolDefinition<
  { lat: number; lng: number },
  { inBounds: boolean; message?: string }
> = {
  name: 'check_service_boundary',
  description: 'Validates whether given coordinates fall within the Dhaka operational service area.',
  parameters: {
    type: 'object',
    properties: {
      lat: { type: 'number', description: 'Latitude' },
      lng: { type: 'number', description: 'Longitude' },
    },
    required: ['lat', 'lng'],
  },
  execute: ({ lat, lng }) => {
    const inBounds =
      lat >= DHAKA_BOUNDS.minLat &&
      lat <= DHAKA_BOUNDS.maxLat &&
      lng >= DHAKA_BOUNDS.minLng &&
      lng <= DHAKA_BOUNDS.maxLng;

    return {
      inBounds,
      message: inBounds
        ? 'Location is within Dhaka service area'
        : 'Location is outside the operational Dhaka service area',
    };
  },
};

const requestClarificationTool: ToolDefinition<
  { questions: ClarificationQuestion[] },
  { questions: ClarificationQuestion[] }
> = {
  name: 'request_clarification',
  description: 'Requests clarification questions for missing booking parameters like vehicle type or landmark specifics.',
  parameters: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            field: { type: 'string', enum: ['vehicleType', 'dropoff', 'pickup'] },
            question: { type: 'string' },
            options: { type: 'array' },
            placeholder: { type: 'string' },
          },
          required: ['id', 'field', 'question', 'options'],
        },
      },
    },
    required: ['questions'],
  },
  execute: ({ questions }) => {
    return { questions };
  },
};

const calculateRouteFareTool: ToolDefinition<
  {
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    vehicleType: VehicleType;
  },
  {
    distanceKm: number;
    baseFare: number;
    distanceFare: number;
    totalFare: number;
  }
> = {
  name: 'calculate_route_fare',
  description: 'Calculates the distance in kilometers and tiered fare breakdown based on vehicle type.',
  parameters: {
    type: 'object',
    properties: {
      pickupLat: { type: 'number' },
      pickupLng: { type: 'number' },
      dropoffLat: { type: 'number' },
      dropoffLng: { type: 'number' },
      vehicleType: { type: 'string', enum: ['BIKE', 'CNG', 'CAR'] },
    },
    required: ['pickupLat', 'pickupLng', 'dropoffLat', 'dropoffLng', 'vehicleType'],
  },
  execute: ({ pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType }) => {
    const rawDistance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const distanceKm = Math.round(rawDistance * 10) / 10;
    const fare = calculateFare(vehicleType, distanceKm);

    return {
      distanceKm,
      baseFare: fare.baseFare,
      distanceFare: fare.distanceFare,
      totalFare: fare.totalFare,
    };
  },
};

const prepareBookingSummaryTool: ToolDefinition<
  {
    pickup: LocationCoordinate;
    dropoff: LocationCoordinate;
    vehicleType: VehicleType;
    distanceKm: number;
    fare: number;
  },
  {
    ready: boolean;
    summary: {
      pickup: LocationCoordinate;
      dropoff: LocationCoordinate;
      vehicleType: VehicleType;
      distanceKm: number;
      fare: number;
    };
  }
> = {
  name: 'prepare_booking_summary',
  description: 'Packages trip summary for user review and final confirmation.',
  parameters: {
    type: 'object',
    properties: {
      pickup: { type: 'object' },
      dropoff: { type: 'object' },
      vehicleType: { type: 'string' },
      distanceKm: { type: 'number' },
      fare: { type: 'number' },
    },
    required: ['pickup', 'dropoff', 'vehicleType', 'distanceKm', 'fare'],
  },
  execute: ({ pickup, dropoff, vehicleType, distanceKm, fare }) => {
    return {
      ready: true,
      summary: {
        pickup,
        dropoff,
        vehicleType,
        distanceKm,
        fare,
      },
    };
  },
};

const registeredTools: Record<string, ToolDefinition> = {
  resolve_location: resolveLocationTool,
  check_service_boundary: checkServiceBoundaryTool,
  request_clarification: requestClarificationTool,
  calculate_route_fare: calculateRouteFareTool,
  prepare_booking_summary: prepareBookingSummaryTool,
};

export const toolRegistry = {
  tools: registeredTools,
  getTool(name: string): ToolDefinition | undefined {
    return registeredTools[name];
  },
  async execute<T = any>(name: string, args: any): Promise<T> {
    const tool = registeredTools[name];
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered in Agent Tool Registry`);
    }
    return tool.execute(args);
  },
  getGeminiFunctionDeclarations() {
    return Object.values(registeredTools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  },
};
