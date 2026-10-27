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

export interface AiSearchOption {
  displayName: string;
  lat: number;
  lng: number;
  category?: string;
  confidence?: number;
}

export async function getDhakaLandmarksOptions(
  query: string,
  contextLatLng?: [number, number]
): Promise<AiSearchOption[]> {
  const normalized = query.toLowerCase().trim();

  // If query is empty, return popular Dhaka hubs
  if (!normalized) {
    return [
      { displayName: 'Gulshan 2 Circle, Dhaka', lat: 23.7938, lng: 90.4143, category: 'Commercial' },
      { displayName: 'Banani Road 11, Dhaka', lat: 23.7901, lng: 90.4062, category: 'Food & Shopping' },
      { displayName: 'Dhanmondi 27 (Road 27), Dhaka', lat: 23.7461, lng: 90.3742, category: 'Residential' },
      { displayName: 'Jamuna Future Park, Kuril, Dhaka', lat: 23.8135, lng: 90.4242, category: 'Shopping Mall' },
      { displayName: 'Hazrat Shahjalal International Airport', lat: 23.8433, lng: 90.4029, category: 'Transit' },
      { displayName: 'Motijheel Commercial Area, Dhaka', lat: 23.7233, lng: 90.4185, category: 'Financial District' },
    ];
  }

  // Attempt Gemini API call if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const systemInstructionText =
        'You are a Dhaka, Bangladesh location assistant. Given a query or place description, return up to 5 matching place options in Dhaka. Respond ONLY with a valid JSON array: [{ "displayName": string, "lat": number, "lng": number, "category": string }]. Coordinates must be in Dhaka metro area (lat 23.6-23.9, lng 90.3-90.5).';

      const userPromptText = contextLatLng
        ? `Location Search: "${query}"\nUser pickup context: [${contextLatLng[0]}, ${contextLatLng[1]}]`
        : `Location Search: "${query}"`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
        apiKey.trim()
      )}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: [{ parts: [{ text: userPromptText }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent && typeof rawContent === 'string') {
          let cleaned = rawContent.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
          else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
          if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
          cleaned = cleaned.trim();

          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(
              (p) =>
                typeof p?.displayName === 'string' &&
                typeof p?.lat === 'number' &&
                typeof p?.lng === 'number' &&
                p.lat >= 23.4 &&
                p.lat <= 24.2 &&
                p.lng >= 90.1 &&
                p.lng <= 90.7
            );
            if (valid.length > 0) {
              return valid.slice(0, 5).map((p) => ({
                displayName: p.displayName,
                lat: p.lat,
                lng: p.lng,
                category: p.category || 'AI Suggestion',
              }));
            }
          }
        }
      }
    } catch {
      // Fall through to resilient semantic match
    }
  }

  // Resilient Offline Dhaka Semantic & Keyword Matching
  if (normalized.includes('biryani') || normalized.includes('old dhaka') || normalized.includes('puran dhaka') || normalized.includes('food')) {
    return [
      { displayName: 'Haji Biryani, Nazira Bazar, Old Dhaka', lat: 23.7145, lng: 90.4042, category: 'Famous Biryani' },
      { displayName: 'Nanna Biryani, Becharam Dewri, Old Dhaka', lat: 23.7170, lng: 90.3955, category: 'Morog Polao / Biryani' },
      { displayName: 'Bismillah Kabab Ghar, Nazira Bazar, Old Dhaka', lat: 23.7152, lng: 90.4038, category: 'Old Dhaka Food' },
      { displayName: "Sultan's Dine, Gulshan 2, Dhaka", lat: 23.7925, lng: 90.4150, category: 'Kacchi Biryani' },
      { displayName: 'Ahsan Manzil (Pink Palace), Old Dhaka', lat: 23.7086, lng: 90.4060, category: 'Historical Landmark' },
    ];
  }

  if (normalized.includes('shopping') || normalized.includes('mall') || normalized.includes('market') || normalized.includes('buy')) {
    return [
      { displayName: 'Jamuna Future Park, Kuril, Dhaka', lat: 23.8135, lng: 90.4242, category: 'Largest Mall' },
      { displayName: 'Bashundhara City Shopping Complex, Panthapath', lat: 23.7508, lng: 90.3912, category: 'Shopping Mall' },
      { displayName: 'Pink City Shopping Mall, Gulshan 2', lat: 23.7942, lng: 90.4138, category: 'Fashion & Retail' },
      { displayName: 'Shimanto Square, Dhanmondi Road 2', lat: 23.7388, lng: 90.3802, category: 'Shopping Center' },
      { displayName: 'New Market, Azimpur / Nilkhet, Dhaka', lat: 23.7335, lng: 90.3842, category: 'Traditional Market' },
    ];
  }

  if (normalized.includes('hospital') || normalized.includes('doctor') || normalized.includes('clinic')) {
    return [
      { displayName: 'Square Hospital, Panthapath, Dhaka', lat: 23.7533, lng: 90.3828, category: 'Tertiary Hospital' },
      { displayName: 'Evercare Hospital, Bashundhara R/A', lat: 23.8103, lng: 90.4312, category: 'Specialized Hospital' },
      { displayName: 'United Hospital, Gulshan 2, Dhaka', lat: 23.7995, lng: 90.4180, category: 'Super-Specialty' },
      { displayName: 'Dhaka Medical College Hospital, Bakshibazar', lat: 23.7258, lng: 90.3980, category: 'Public Hospital' },
    ];
  }

  if (normalized.includes('university') || normalized.includes('college') || normalized.includes('varsity') || normalized.includes('campus')) {
    return [
      { displayName: 'Dhaka University (TSC / Curzon Hall)', lat: 23.7330, lng: 90.3962, category: 'University Campus' },
      { displayName: 'BUET, Palashi, Dhaka', lat: 23.7262, lng: 90.3925, category: 'Engineering University' },
      { displayName: 'North South University (NSU), Bashundhara', lat: 23.8151, lng: 90.4255, category: 'Private University' },
      { displayName: 'BRAC University, Merul Badda, Dhaka', lat: 23.7712, lng: 90.4250, category: 'University Campus' },
    ];
  }

  if (normalized.includes('park') || normalized.includes('lake') || normalized.includes('garden')) {
    return [
      { displayName: 'Dhanmondi Lake Park, Dhanmondi 32', lat: 23.7512, lng: 90.3768, category: 'Public Park & Lake' },
      { displayName: 'Hatirjheel Waterfront Amphitheatre', lat: 23.7680, lng: 90.4075, category: 'Waterfront Promenade' },
      { displayName: 'Ramna Park, Shahbagh, Dhaka', lat: 23.7380, lng: 90.4010, category: 'Historic Park' },
      { displayName: 'Gulshan Lake Park, Road 63, Gulshan 2', lat: 23.7960, lng: 90.4190, category: 'Urban Park' },
    ];
  }

  const matched = DHAKA_LANDMARKS.filter((l) => {
    if (l.name.toLowerCase().includes(normalized)) return true;
    if (l.displayName.toLowerCase().includes(normalized)) return true;
    if (l.aliases?.some((a) => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase()))) {
      return true;
    }
    return false;
  });

  if (matched.length > 0) {
    return matched.slice(0, 5).map((l) => ({
      displayName: l.displayName,
      lat: l.lat,
      lng: l.lng,
      category: 'Matched Landmark',
    }));
  }

  const single = matchDhakaLandmark(query);
  if (single) {
    return [
      { displayName: single.displayName, lat: single.lat, lng: single.lng, category: 'Top Match' },
      ...DHAKA_LANDMARKS.filter((l) => l.name !== single.name)
        .slice(0, 4)
        .map((l) => ({
          displayName: l.displayName,
          lat: l.lat,
          lng: l.lng,
          category: 'Suggested Alternative',
        })),
    ];
  }

  // Fallback: return top Dhaka landmarks
  return DHAKA_LANDMARKS.slice(0, 5).map((l) => ({
    displayName: l.displayName,
    lat: l.lat,
    lng: l.lng,
    category: 'Dhaka Area',
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
