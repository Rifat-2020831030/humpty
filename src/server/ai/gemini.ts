import { DHAKA_CENTER } from '../../lib/constants';

export interface DhakaLandmark {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

export interface AiLocationResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence: number;
  warning?: string;
  isFallback?: boolean;
}

export const DHAKA_LANDMARKS: DhakaLandmark[] = [
  {
    name: 'Gulshan 2',
    displayName: 'Gulshan 2, Dhaka',
    lat: 23.7938,
    lng: 90.4143,
    aliases: ['gulshan 2', 'gulshan-2', 'gulshan circle 2', 'gulshan 2 circle', 'pink city'],
  },
  {
    name: 'Gulshan 1',
    displayName: 'Gulshan 1, Dhaka',
    lat: 23.7788,
    lng: 90.4172,
    aliases: ['gulshan 1', 'gulshan-1', 'gulshan circle 1', 'gulshan 1 circle', 'gulshan'],
  },
  {
    name: 'Banani',
    displayName: 'Banani, Dhaka',
    lat: 23.7901,
    lng: 90.4062,
    aliases: ['banani', 'banani 11', 'road 11 banani', 'kemal ataturk', 'banani bazar'],
  },
  {
    name: 'Dhanmondi 27',
    displayName: 'Dhanmondi 27, Dhaka',
    lat: 23.7461,
    lng: 90.3742,
    aliases: ['dhanmondi 27', 'dhanmondi-27', 'shankar', 'robingodown', 'dhanmondi 27 school'],
  },
  {
    name: 'Dhanmondi 32',
    displayName: 'Dhanmondi 32, Dhaka',
    lat: 23.7512,
    lng: 90.3768,
    aliases: ['dhanmondi 32', 'dhanmondi-32', 'dhanmondi lake', 'dhanmondi'],
  },
  {
    name: 'Farmgate',
    displayName: 'Farmgate, Dhaka',
    lat: 23.7697,
    lng: 90.3871,
    aliases: ['farmgate', 'farm gate', 'ananda cinema', 'khamarbari', 'farmgate bus stand'],
  },
  {
    name: 'Mohakhali',
    displayName: 'Mohakhali, Dhaka',
    lat: 23.7831,
    lng: 90.3977,
    aliases: ['mohakhali', 'mahakhali', 'mohakhali dohs', 'mohakhali flyover', 'wireless gate'],
  },
  {
    name: 'Motijheel',
    displayName: 'Motijheel, Dhaka',
    lat: 23.7233,
    lng: 90.4185,
    aliases: ['motijheel', 'motijheel c/a', 'shapla chottor', 'dilkusha', 'motijheel office'],
  },
  {
    name: 'Uttara',
    displayName: 'Uttara, Dhaka',
    lat: 23.8729,
    lng: 90.3984,
    aliases: ['uttara', 'uttara sector 3', 'house building', 'jasimuddin', 'azampur'],
  },
  {
    name: 'Mirpur 10',
    displayName: 'Mirpur 10, Dhaka',
    lat: 23.8069,
    lng: 90.3687,
    aliases: ['mirpur 10', 'mirpur-10', 'mirpur 10 golchottor', 'mirpur circle 10'],
  },
  {
    name: 'Mirpur 1',
    displayName: 'Mirpur 1, Dhaka',
    lat: 23.7956,
    lng: 90.3537,
    aliases: ['mirpur 1', 'mirpur-1', 'mirpur'],
  },
  {
    name: 'Shahbagh',
    displayName: 'Shahbagh, Dhaka',
    lat: 23.7371,
    lng: 90.4032,
    aliases: ['shahbagh', 'shahbag', 'bsmmu', 'dhaka club', 'tsc', 'curzon hall'],
  },
  {
    name: 'Kawran Bazar',
    displayName: 'Kawran Bazar, Dhaka',
    lat: 23.7516,
    lng: 90.3938,
    aliases: ['kawran bazar', 'karwan bazar', 'pan pacific sonargaon', 'petrobangla'],
  },
  {
    name: 'Bashundhara R/A',
    displayName: 'Bashundhara R/A, Dhaka',
    lat: 23.8151,
    lng: 90.4255,
    aliases: ['bashundhara', 'bashundhara r/a', 'jamuna future park', 'nsu', 'iub'],
  },
  {
    name: 'Airport',
    displayName: 'Hazrat Shahjalal International Airport, Dhaka',
    lat: 23.8433,
    lng: 90.4029,
    aliases: ['airport', 'dhaka airport', 'hazrat shahjalal international airport'],
  },
];

/**
 * Matches a free-form query against known Dhaka landmarks.
 * Prioritizes longer/more specific alias matches first.
 */
export function matchDhakaLandmark(query: string): DhakaLandmark | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  const candidates: { landmark: DhakaLandmark; term: string }[] = [];
  for (const landmark of DHAKA_LANDMARKS) {
    candidates.push({ landmark, term: landmark.name.toLowerCase() });
    if (landmark.aliases) {
      for (const alias of landmark.aliases) {
        candidates.push({ landmark, term: alias.toLowerCase() });
      }
    }
  }

  candidates.sort((a, b) => b.term.length - a.term.length);

  for (const { landmark, term } of candidates) {
    if (normalized.includes(term)) {
      return landmark;
    }
  }

  return null;
}

/**
 * Returns autocomplete suggestions for Dhaka landmarks based on partial query.
 */
export function getDhakaLandmarksAutocomplete(query: string): { displayName: string; lat: number; lng: number }[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return DHAKA_LANDMARKS.slice(0, 8).map(l => ({
      displayName: l.displayName,
      lat: l.lat,
      lng: l.lng,
    }));
  }

  const results: DhakaLandmark[] = [];
  for (const landmark of DHAKA_LANDMARKS) {
    const matchesName = landmark.displayName.toLowerCase().includes(normalized);
    const matchesAliases = landmark.aliases?.some(a => a.toLowerCase().includes(normalized));
    if (matchesName || matchesAliases) {
      results.push(landmark);
    }
  }

  return results.map(l => ({
    displayName: l.displayName,
    lat: l.lat,
    lng: l.lng,
  }));
}

/**
 * Creates safe fallback result if Gemini is unavailable, unconfigured, or fails.
 */
function getFallbackLocation(
  prompt: string,
  contextLatLng?: [number, number],
  reason: string = 'AI resolution unavailable'
): AiLocationResult {
  const matchedLandmark = matchDhakaLandmark(prompt);
  if (matchedLandmark) {
    return {
      lat: matchedLandmark.lat,
      lng: matchedLandmark.lng,
      displayName: `[Estimated] ${matchedLandmark.name} Area`,
      confidence: 0.4,
      warning: `Estimated location based on landmark keyword match (${reason})`,
      isFallback: true,
    };
  }

  if (contextLatLng && Array.isArray(contextLatLng) && contextLatLng.length === 2) {
    return {
      lat: contextLatLng[0],
      lng: contextLatLng[1],
      displayName: '[Estimated] Near Pickup Location',
      confidence: 0.3,
      warning: `Estimated location based on context coordinates (${reason})`,
      isFallback: true,
    };
  }

  return {
    lat: DHAKA_CENTER[0],
    lng: DHAKA_CENTER[1],
    displayName: '[Estimated] Dhaka City Center',
    confidence: 0.2,
    warning: `Estimated fallback to Dhaka city center (${reason})`,
    isFallback: true,
  };
}

/**
 * Resolves a natural language location prompt in Dhaka using the Google Gemini API,
 * with resilient offline/landmark fallback matching.
 */
export async function resolveNaturalLanguageLocation(
  prompt: string,
  contextLatLng?: [number, number]
): Promise<AiLocationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return getFallbackLocation(prompt, contextLatLng, 'Gemini API key is unset');
  }

  const systemInstructionText =
    'You are a Dhaka, Bangladesh location resolver. Given a natural language description of a place in Dhaka, return the best matching coordinates. Respond ONLY with JSON: { "lat": number, "lng": number, "displayName": string, "confidence": number }.';

  const userPromptText = contextLatLng
    ? `User Prompt: ${prompt}\nContext Coordinates (lat, lng): [${contextLatLng[0]}, ${contextLatLng[1]}]`
    : `User Prompt: ${prompt}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
      apiKey.trim()
    )}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstructionText }],
        },
        contents: [
          {
            parts: [{ text: userPromptText }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return getFallbackLocation(prompt, contextLatLng, `Gemini API HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent || typeof rawContent !== 'string') {
      return getFallbackLocation(prompt, contextLatLng, 'Empty or invalid response from Gemini API');
    }

    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return getFallbackLocation(prompt, contextLatLng, 'Unable to parse JSON from AI response');
    }

    if (
      typeof parsed?.lat !== 'number' ||
      typeof parsed?.lng !== 'number' ||
      typeof parsed?.displayName !== 'string' ||
      typeof parsed?.confidence !== 'number'
    ) {
      return getFallbackLocation(prompt, contextLatLng, 'AI response missing required coordinate fields');
    }

    // Dhaka metro bounding box sanity check: lat ~ [23.4, 24.2], lng ~ [90.1, 90.7]
    const lat = parsed.lat;
    const lng = parsed.lng;
    if (lat < 23.4 || lat > 24.2 || lng < 90.1 || lng > 90.7) {
      return getFallbackLocation(prompt, contextLatLng, 'AI returned coordinates outside Dhaka metropolitan area');
    }

    const confidence = Math.max(0, Math.min(1, parsed.confidence));

    if (confidence < 0.5) {
      return {
        lat,
        lng,
        displayName: parsed.displayName,
        confidence,
        warning: 'Low confidence AI match - please verify pin location on map',
      };
    }

    return {
      lat,
      lng,
      displayName: parsed.displayName,
      confidence,
    };
  } catch (err: any) {
    return getFallbackLocation(
      prompt,
      contextLatLng,
      err instanceof Error ? err.message : 'Error resolving location with AI'
    );
  }
}
