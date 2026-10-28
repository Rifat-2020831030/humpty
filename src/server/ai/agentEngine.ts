import { toolRegistry, LocationCoordinate, ClarificationQuestion } from './toolRegistry';
import { VehicleType } from '../../types';

export interface TimelineStep {
  id: 'parse' | 'geo' | 'clarify' | 'pricing' | 'confirm';
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  detail?: string;
}

export interface AnsweredQuestion {
  id: string;
  field: string;
  question: string;
  answer: string;
}

export interface ProcessAgentBookingInput {
  prompt: string;
  riderLat: number;
  riderLng: number;
  answeredQuestions?: AnsweredQuestion[];
}

export interface ExtractedBookingInfo {
  pickup: LocationCoordinate;
  dropoff?: LocationCoordinate;
  vehicleType?: VehicleType;
  estimatedDistanceKm?: number;
  estimatedFare?: number;
}

export interface AgentBookingOutput {
  status: 'NEED_CLARIFICATION' | 'READY_FOR_CONFIRMATION' | 'UNAVAILABLE';
  errorMessage?: string;
  steps: TimelineStep[];
  extracted?: ExtractedBookingInfo;
  questions?: ClarificationQuestion[];
}

/**
 * Extracts vehicle type from free-form text or answers
 */
function extractVehicleType(text: string): VehicleType | null {
  const normalized = text.toLowerCase();
  if (/\b(bike|motorcycle|motorbike|scooter|pathao)\b/.test(normalized)) {
    return 'BIKE';
  }
  if (/\b(cng|auto|autorickshaw|cng auto)\b/.test(normalized)) {
    return 'CNG';
  }
  if (/\b(car|uber|cab|sedan|ac car|micro)\b/.test(normalized)) {
    return 'CAR';
  }
  return null;
}

/**
 * Extracts location queries from natural language prompt
 */
function parsePromptLocations(prompt: string): { pickupQuery?: string; dropoffQuery: string } {
  let clean = prompt.trim();

  // Pattern: "from X to Y" or "from X drop me at Y"
  const fromToMatch = clean.match(/(?:from\s+)(.+?)(?:\s+(?:to|drop\s*(?:me)?\s*(?:at|to))\s+)(.+?)(?:\s+(?:by|in|with|using)\s+(?:bike|car|cng|auto).*|\s*$)/i);
  if (fromToMatch) {
    return {
      pickupQuery: fromToMatch[1].trim(),
      dropoffQuery: fromToMatch[2].trim(),
    };
  }

  // Remove common leading phrases: "take me to", "drop me at", "i want to go to", "go to", "i need a ride to"
  clean = clean.replace(/^(?:please\s+)?(?:take\s+me\s+to|drop\s+me\s+(?:at|to)|i\s+(?:want|need)\s+(?:a\s+ride\s+)?to|i\s+want\s+to\s+go\s+to|let's\s+go\s+to|go\s+to|ride\s+to)\s+/i, '');

  // Strip vehicle suffix if present: e.g. "by car", "in a cng", "with bike"
  clean = clean.replace(/\s+(?:by|in|with|using)\s+(?:car|bike|cng|auto|motorcycle|sedan|cab)\b.*$/i, '');

  return {
    dropoffQuery: clean.trim(),
  };
}

export async function processAgentBooking(input: ProcessAgentBookingInput): Promise<AgentBookingOutput> {
  const { prompt, riderLat, riderLng, answeredQuestions = [] } = input;

  const defaultPickup: LocationCoordinate = {
    name: 'Current Location',
    lat: riderLat,
    lng: riderLng,
  };

  // Base Timeline Steps
  const steps: TimelineStep[] = [
    { id: 'parse', title: 'Parse Intent', status: 'PENDING' },
    { id: 'geo', title: 'Resolve Coordinates', status: 'PENDING' },
    { id: 'clarify', title: 'Clarify Details', status: 'PENDING' },
    { id: 'pricing', title: 'Calculate Fare & Route', status: 'PENDING' },
    { id: 'confirm', title: 'Final Confirmation', status: 'PENDING' },
  ];

  // 1. Parse prompt
  steps[0].status = 'COMPLETED';
  steps[0].detail = 'Prompt analyzed';

  const { pickupQuery, dropoffQuery } = parsePromptLocations(prompt);

  // 2. Resolve Pickup & Dropoff Coordinates
  let pickup = defaultPickup;
  if (pickupQuery) {
    const pickupRes = await toolRegistry.execute('resolve_location', { query: pickupQuery, context: 'pickup' });
    if (pickupRes.success && pickupRes.location) {
      const boundaryCheck = await toolRegistry.execute('check_service_boundary', {
        lat: pickupRes.location.lat,
        lng: pickupRes.location.lng,
      });
      if (boundaryCheck.inBounds) {
        pickup = pickupRes.location;
      }
    }
  }

  // Resolve Dropoff
  const dropoffRes = await toolRegistry.execute('resolve_location', { query: dropoffQuery, context: 'dropoff' });
  if (!dropoffRes.success || !dropoffRes.location) {
    steps[1].status = 'IN_PROGRESS';
    steps[1].detail = 'Could not resolve destination';
    return {
      status: 'UNAVAILABLE',
      errorMessage: `Could not recognize destination "${dropoffQuery}". Please specify a known Dhaka landmark or area.`,
      steps,
    };
  }

  const dropoff = dropoffRes.location;

  // Boundary check on destination
  const boundaryCheck = await toolRegistry.execute('check_service_boundary', {
    lat: dropoff.lat,
    lng: dropoff.lng,
  });

  if (!boundaryCheck.inBounds) {
    steps[1].status = 'IN_PROGRESS';
    steps[1].detail = 'Outside Dhaka operational boundary';
    return {
      status: 'UNAVAILABLE',
      errorMessage: `"${dropoff.name}" is outside our Dhaka service area. GariKoi agentic booking is currently only available within Dhaka metropolitan bounds.`,
      steps,
    };
  }

  steps[1].status = 'COMPLETED';
  steps[1].detail = dropoff.name;

  // 3. Extract or resolve vehicleType
  let vehicleType: VehicleType | null = extractVehicleType(prompt);

  // If not in prompt, check answered questions
  if (!vehicleType && answeredQuestions.length > 0) {
    const answeredVehicle = answeredQuestions.find(
      (a) => a.field === 'vehicleType' || a.id === 'vehicleType'
    );
    if (answeredVehicle) {
      vehicleType = extractVehicleType(answeredVehicle.answer);
      if (!vehicleType) {
        const upper = answeredVehicle.answer.trim().toUpperCase();
        if (upper === 'BIKE' || upper === 'CNG' || upper === 'CAR') {
          vehicleType = upper as VehicleType;
        }
      }
    }
  }

  // 4. If vehicleType is still not known, ask for clarification
  if (!vehicleType) {
    const vehicleQuestion: ClarificationQuestion = {
      id: 'vehicleType',
      field: 'vehicleType',
      question: 'What kind of ride would you prefer?',
      options: [
        { label: 'Bike', value: 'BIKE', badge: 'Fastest' },
        { label: 'CNG Auto', value: 'CNG', badge: 'Popular' },
        { label: 'Car', value: 'CAR', badge: 'Comfort' },
      ],
      placeholder: 'Select a ride option above...',
    };

    const clarificationRes = await toolRegistry.execute('request_clarification', {
      questions: [vehicleQuestion],
    });

    steps[2].status = 'IN_PROGRESS';
    steps[2].detail = 'Awaiting vehicle selection';

    return {
      status: 'NEED_CLARIFICATION',
      steps,
      questions: clarificationRes.questions,
      extracted: {
        pickup,
        dropoff,
      },
    };
  }

  // Clarification completed
  steps[2].status = 'COMPLETED';
  steps[2].detail = `Vehicle: ${vehicleType}`;

  // 5. Calculate Route & Pricing
  steps[3].status = 'IN_PROGRESS';
  const fareResult = await toolRegistry.execute('calculate_route_fare', {
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    dropoffLat: dropoff.lat,
    dropoffLng: dropoff.lng,
    vehicleType,
  });

  steps[3].status = 'COMPLETED';
  steps[3].detail = `${fareResult.distanceKm} km · ৳${fareResult.totalFare}`;

  // 6. Final Booking Summary Preparation
  const summaryResult = await toolRegistry.execute('prepare_booking_summary', {
    pickup,
    dropoff,
    vehicleType,
    distanceKm: fareResult.distanceKm,
    fare: fareResult.totalFare,
  });

  steps[4].status = 'COMPLETED';
  steps[4].detail = 'Ready for confirmation';

  return {
    status: 'READY_FOR_CONFIRMATION',
    steps,
    questions: [],
    extracted: {
      pickup: summaryResult.summary.pickup,
      dropoff: summaryResult.summary.dropoff,
      vehicleType: summaryResult.summary.vehicleType,
      estimatedDistanceKm: summaryResult.summary.distanceKm,
      estimatedFare: summaryResult.summary.fare,
    },
  };
}
